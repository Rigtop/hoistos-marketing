/**
 * compounding-ranker. The "what should I install next" engine.
 *
 * Plan reference: ~/.claude/plans/yes-this-new-mcbp-dapper-corbato.md
 * Sections "User journey simulation" and "Reality-based scope".
 *
 * The hoistos.com install surface used to be a 43-card catalog dump. Decision
 * fatigue killed the flow on the first non-internal user (Windows VP, the
 * .mcpb wall, 2026-05-12). The reversal pattern: after every install, surface
 * the top 3 next-best picks ordered by how strongly they compound on what is
 * already installed and how directly they map to the user's stated outcomes
 * from intake.
 *
 * This module is the ranker. Pure function. No DOM, no fetch, no React.
 *
 * Contract:
 *   rankNextPacks(installedPackIds, intakeOutcomes, allCards) returns the
 *   top-3 candidate cards from `allCards` ordered by:
 *     (a) outcome match against intake outcomes
 *     (b) compoundingPartnerIds match against installedPackIds
 *     (c) prerequisite-completion: any card whose prerequisitePackIds are
 *         not all installed is skipped entirely (no recommending bonus-03
 *         before bonus-05).
 *
 * Cards already in installedPackIds are excluded from the output. Cards with
 * an empty prerequisite list and no compounding-partner match still surface
 * if they have an outcome match; this keeps the starter trio reachable on a
 * fresh intake.
 *
 * Intake-state and customware modules are owned by Agents A and C. This
 * module accepts the minimal interface contracts both will honor (RankablePack
 * + intakeOutcomes string array). Concrete pack arrays come from
 * src/empire/content/foundation-cards.ts (extended by Agent B) and
 * src/empire/EmpireBonusExtras.tsx (BonusBlueprint extended by Agent B).
 *
 * Hard Rule #11: zero em dashes.
 * R047: counter-led, no apologies.
 * Context7: no external imports. Pure TypeScript@5 / react@19 compatible.
 */

/**
 * Minimal contract every rankable pack must honor. Foundation cards, business
 * cards, bonus blueprints all extend this. Agent B adds these fields to the
 * existing FoundationCard interface and BonusBlueprint interface.
 */
export interface RankablePack {
  /** Stable pack id, e.g. 'foundation-01-constitution' or 'bonus-05-code-cli'. */
  packId: string
  /**
   * Intake outcome slugs this pack delivers value for. From the intake Q3
   * picks: 'faster-proposals' | 'faster-emails' | 'contract-risk' |
   * 'meeting-capture' | 'decision-tracking' | 'team-enablement' |
   * 'expense-automation' | 'knowledge-search' | 'voice-to-task' |
   * 'rag-retrieval' | 'custom'.
   */
  outcomeTags?: string[]
  /**
   * Pack ids that compound when installed alongside this one. F-09 lists
   * F-01 + F-02 as partners; biz-07 lists F-09 + F-10 as partners; etc.
   */
  compoundingPartnerIds?: string[]
  /**
   * Pack ids that must be installed before this pack can fire. Empty for
   * foundations. bonus-03 requires bonus-05. mid-04 requires F-08. etc.
   */
  prerequisitePackIds?: string[]
}

/**
 * The ranker output. Carries the original pack plus the score breakdown so
 * the UI can display rationale ("recommended because it pairs with F-01").
 */
export interface RankedPick<T extends RankablePack = RankablePack> {
  pack: T
  /** Total composite score. Higher is better. */
  score: number
  /** Count of matching outcome tags. */
  outcomeMatchCount: number
  /** Count of compounding-partner pack ids already installed. */
  compoundingMatchCount: number
  /**
   * Human-readable rationale for why this pack surfaced as a pick. Used by
   * the gallery card to render the "Next because..." subline.
   */
  rationale: string
}

/**
 * Score weights. Outcome match dominates because intake is the strongest
 * signal of user intent. Compounding match is the second axis. Both add
 * (not multiply) so a pack with strong compounding fit can surface even
 * with a partial outcome match.
 */
const OUTCOME_WEIGHT = 10
const COMPOUNDING_WEIGHT = 4

/**
 * Rank the top 3 next-best packs for this user.
 *
 * @param installedPackIds Stable ids of packs already installed (from
 *   listActivated() in src/lib/activate.ts).
 * @param intakeOutcomes Outcome slugs the user picked in intake Q3, ordered
 *   by priority (the first slug is the highest-ranked outcome). Empty array
 *   is allowed; the ranker degrades to compounding-only scoring in that case.
 * @param allCards All rankable packs available across foundation, business,
 *   mid, power, beginner, advanced, bonus tiers.
 * @returns The top 3 next-best picks. Fewer than 3 if not enough packs
 *   satisfy the prerequisite gate.
 */
export function rankNextPacks<T extends RankablePack>(
  installedPackIds: string[],
  intakeOutcomes: string[],
  allCards: T[],
): RankedPick<T>[] {
  // Defensive: dedupe and Set-ify for O(1) lookups.
  const installedSet = new Set(installedPackIds ?? [])
  const outcomeSet = new Set(intakeOutcomes ?? [])

  const scored: RankedPick<T>[] = []

  for (const card of allCards ?? []) {
    if (!card || typeof card.packId !== 'string') continue

    // Gate 1: skip already-installed packs. The user does not want to see
    // a pack they finished as their next-best pick.
    if (installedSet.has(card.packId)) continue

    // Gate 2: skip packs whose prerequisites are not all installed. A pack
    // with empty prereqs always passes this gate.
    const prereqs = card.prerequisitePackIds ?? []
    if (prereqs.length > 0) {
      let missing = false
      for (const p of prereqs) {
        if (!installedSet.has(p)) {
          missing = true
          break
        }
      }
      if (missing) continue
    }

    // Scoring axis 1: outcome match. Count how many of the user's outcomes
    // this pack tags. Score weighted heavily because intake is the strongest
    // signal of user intent.
    let outcomeMatchCount = 0
    const tags = card.outcomeTags ?? []
    for (const tag of tags) {
      if (outcomeSet.has(tag)) outcomeMatchCount += 1
    }

    // Scoring axis 2: compounding match. Count partner ids already installed.
    // A pack with strong compounding pairing surfaces even if the user has not
    // tagged its outcomes.
    let compoundingMatchCount = 0
    const partners = card.compoundingPartnerIds ?? []
    for (const partnerId of partners) {
      if (installedSet.has(partnerId)) compoundingMatchCount += 1
    }

    const score =
      outcomeMatchCount * OUTCOME_WEIGHT +
      compoundingMatchCount * COMPOUNDING_WEIGHT

    // Filter: do not surface packs that score zero on both axes. A pack with
    // no outcome match and no compounding partner installed is not a credible
    // "next" pick; better to show fewer than three than a noise pick.
    if (score <= 0) continue

    const rationale = buildRationale(outcomeMatchCount, compoundingMatchCount)

    scored.push({
      pack: card,
      score,
      outcomeMatchCount,
      compoundingMatchCount,
      rationale,
    })
  }

  // Sort by score desc, then by outcome match (tiebreaker biases toward
  // intake intent), then by compounding match. Stable across runs because
  // ties further fall back to insertion order from allCards.
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (b.outcomeMatchCount !== a.outcomeMatchCount) {
      return b.outcomeMatchCount - a.outcomeMatchCount
    }
    return b.compoundingMatchCount - a.compoundingMatchCount
  })

  return scored.slice(0, 3)
}

/**
 * Build a one-line rationale for why this pack surfaced as a pick.
 * Used by the gallery card subline. Plain English, no markdown.
 */
function buildRationale(outcomeMatchCount: number, compoundingMatchCount: number): string {
  if (outcomeMatchCount > 0 && compoundingMatchCount > 0) {
    const outcomePart =
      outcomeMatchCount === 1
        ? 'matches one of your priorities'
        : `matches ${outcomeMatchCount} of your priorities`
    const compoundPart =
      compoundingMatchCount === 1
        ? 'and pairs with a pack you already installed'
        : `and pairs with ${compoundingMatchCount} packs you already installed`
    return `Next because it ${outcomePart} ${compoundPart}.`
  }
  if (outcomeMatchCount > 0) {
    return outcomeMatchCount === 1
      ? 'Next because it matches one of your priorities from intake.'
      : `Next because it matches ${outcomeMatchCount} of your priorities from intake.`
  }
  if (compoundingMatchCount > 0) {
    return compoundingMatchCount === 1
      ? 'Next because it pairs with a pack you already installed.'
      : `Next because it pairs with ${compoundingMatchCount} packs you already installed.`
  }
  // Should not surface (the zero-score filter excludes these), kept for type safety.
  return 'Next pick.'
}

export default rankNextPacks
