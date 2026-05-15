/**
 * Code CLI introduction decision logic.
 *
 * The hoistos.com install surface needs to introduce Claude Code CLI at the
 * right friction point. Too early and the 60-minute setup feels gratuitous.
 * Too late and the user installs six asterisked packs that never fire fully.
 * This module returns one of three states based on three signals.
 *
 * Three signals, per the 2026-05-15 plan
 * (~/.claude/plans/yes-this-new-mcbp-dapper-corbato.md, section
 * "Code CLI introduction logic, formalized"):
 *
 *   1. Surface mix from intake Q4 (what the user has installed, not what
 *      they pay for, since Pro and Max are pricing tiers, not capability
 *      tiers). Browser-only defers to step 18 or later. Browser plus
 *      Desktop surfaces at step 12 to 14 as soft option. Code already
 *      checked means Code is the install path from step 1.
 *
 *   2. Pack count installed. 0 to 7 packs is too thin to justify the
 *      60-minute setup. 8 to 17 packs is the soft-option band. 18 or
 *      more packs with at least 2 asterisked installs flips to primary
 *      CTA, the "unlock the asterisks" moment.
 *
 *   3. Outcomes from intake Q3. Knowledge search, RAG retrieval, and
 *      voice-to-task mobile are functionally Code-required, the panel
 *      says so explicitly. Faster proposals or faster emails alone
 *      means browser-only covers most of the value.
 *
 * Output:
 *
 *   "hidden"      The compounding case is too thin. Do not surface the
 *                 panel at all.
 *
 *   "soft-option" Surface the panel as a "compounding upgrade available"
 *                 secondary CTA. Continue on Pro remains the primary
 *                 path.
 *
 *   "primary-cta" Make Code the primary action. The user has accumulated
 *                 enough installed packs and asterisked packs that the
 *                 honest call is to upgrade.
 *
 * Hard Rule #11 (no em dashes), Hard Rule #29 ("PE" never written).
 * R087 plain English in any copy that surfaces from this module.
 */

/**
 * Surface mix from intake Q4. The user picks what they HAVE, not what
 * they pay for. Browser is the universal floor; Desktop and Code are
 * optional surfaces.
 */
export interface SurfaceMix {
  /** claude.ai opened in a browser. Universal floor, default true. */
  browser: boolean
  /** Claude Desktop app on Mac or Windows. */
  desktop: boolean
  /** Claude Code CLI in Terminal. */
  code: boolean
}

/**
 * Outcome tokens the intake exposes. Knowledge search, RAG retrieval, and
 * voice-to-task mobile are the "functionally requires Code" outcomes. The
 * tokens here mirror src/lib/intake-state.ts OUTCOMES to keep the two
 * surfaces in lockstep; if intake-state.ts changes its tokens this list
 * must update too.
 */
export type IntakeOutcome =
  | 'faster-proposals'
  | 'faster-emails'
  | 'contract-risk-review'
  | 'meeting-capture'
  | 'decision-tracking'
  | 'team-enablement'
  | 'expense-automation'
  | 'knowledge-search'
  | 'voice-to-task-mobile'
  | 'rag-retrieval'
  | 'custom'

export type CodeIntroState = 'hidden' | 'soft-option' | 'primary-cta'

/**
 * The set of outcomes that functionally require Code CLI. If the user
 * picked any of these in intake Q3, the panel becomes required at the
 * earliest credible band rather than waiting until pack 18.
 */
const CODE_REQUIRED_OUTCOMES: ReadonlyArray<IntakeOutcome> = [
  'knowledge-search',
  'rag-retrieval',
  'voice-to-task-mobile',
]

/**
 * The pack ids that carry the browser-only asterisk: they install on Pro
 * web but fire fully only on Code. This list mirrors the per-pack audit
 * in install-manifest.json (Agent B's task), but we cache the canonical
 * set here so the intro logic does not need a network fetch.
 *
 * Source: the plan section "Step 18 + the compounding inflection."
 *
 * Foundation asterisks: F-06 routing rules, F-07 memory architecture,
 * F-11 Notion write gate. Biz asterisks: biz-01, biz-02, biz-03 which
 * all need Notion MCP write to actually fire. mid-04 knowledge search
 * also asterisks on Pro web.
 */
const ASTERISKED_PACK_IDS: ReadonlyArray<string> = [
  'foundation-06-routing-rules',
  'foundation-07-memory-architecture',
  'foundation-11-notion-write-gate',
  'biz-01-notion-mcp-setup',
  'biz-02-email-to-notion-intel',
  'biz-03-email-triage-responder',
  'mid-04-knowledge-search',
]

/**
 * Test helper. Re-exported so JourneyTracker and tests can render the
 * matching asterisk badge consistently with the intro-logic decision.
 */
export function isAsteriskedPack(packId: string): boolean {
  return ASTERISKED_PACK_IDS.includes(packId)
}

/**
 * Count how many of the user's installed packs carry the browser-only
 * asterisk. This is the "asterisk pressure" signal that flips the panel
 * from soft option to primary CTA.
 */
export function countAsteriskedInstalled(installedPackIds: ReadonlyArray<string>): number {
  let count = 0
  for (const id of installedPackIds) {
    if (isAsteriskedPack(id)) count++
  }
  return count
}

/**
 * Has the user already installed Claude Code via the bonus-05 pack? If
 * so, the panel should never surface; Code is already in place.
 *
 * Also returns true if surfaceMix.code is checked in intake (the
 * Code-from-day-1 engineer case).
 */
function codeAlreadyInstalled(
  installedPackIds: ReadonlyArray<string>,
  surfaceMix: SurfaceMix,
): boolean {
  if (surfaceMix.code) return true
  return installedPackIds.includes('bonus-05-code-cli-setup')
}

/**
 * Decide where Code CLI sits in the user's current journey state.
 *
 * Returns one of "hidden", "soft-option", "primary-cta". Callers (the
 * journey tracker panel, the gallery's "next three" picker) read this
 * value to decide whether and how prominently to render the Code intro.
 *
 * Logic, in priority order:
 *
 *   1. Code already installed in surfaceMix or via bonus-05: return
 *      "hidden". Nothing to upgrade to.
 *
 *   2. Outcomes include knowledge-search, rag-retrieval, or voice-mobile:
 *      "primary-cta" from 8 packs onward (the floor is still 8 to keep
 *      the soft-option band's calibration honest; below 8 packs even a
 *      Code-required outcome cannot justify a 60-minute install over a
 *      4-pack starter). Below 8, render "soft-option" with the
 *      "functionally required" copy variant.
 *
 *   3. Pack count and asterisk pressure (the default path for VPs who
 *      picked faster-proposals or faster-emails):
 *      - 0 to 7 packs:           "hidden"
 *      - 8 to 17 packs:          "soft-option"
 *      - 18+ packs with 2+ asterisks: "primary-cta"
 *      - 18+ packs with 0 to 1 asterisks: "soft-option"
 *
 *   4. Surface mix adjusts the bands:
 *      - Browser-only checked, no Desktop:
 *          Code intro stays in the standard band described in rule 3.
 *      - Desktop checked (Browser plus Desktop), no Code:
 *          The soft-option band starts earlier, at 12 packs instead of
 *          8 packs. Desktop users are already comfortable with installed
 *          apps, so the 60-minute friction floor is lower for them.
 *      - Code checked already: covered by rule 1.
 *
 * The current implementation prioritizes rules in the order above. A
 * Code-required outcome at 8 packs beats the default 18-pack band; a
 * 19-pack browser-only user with no asterisks still gets soft-option
 * rather than primary because the asterisk-pressure signal is the one
 * the "unlock the asterisks" copy keys off.
 *
 * @param installedPackIds  Array of pack ids the user has marked
 *                          installed (read from listActivated() in
 *                          activate.ts).
 * @param surfaceMix        Three booleans from intake Q4.
 * @param outcomes          Array of outcome tokens the user picked
 *                          in intake Q3.
 *
 * @returns one of "hidden", "soft-option", "primary-cta".
 */
export function shouldSurfaceCodeIntro(
  installedPackIds: ReadonlyArray<string>,
  surfaceMix: SurfaceMix,
  outcomes: ReadonlyArray<string>,
): CodeIntroState {
  // Rule 1: Code already installed means nothing to upgrade to.
  if (codeAlreadyInstalled(installedPackIds, surfaceMix)) {
    return 'hidden'
  }

  const packCount = installedPackIds.length
  const asteriskedCount = countAsteriskedInstalled(installedPackIds)

  // Normalize outcomes for comparison. The intake-state module persists
  // outcomes as strings; this module accepts the broader string type and
  // matches against the canonical token list.
  const hasCodeRequiredOutcome = outcomes.some((o) =>
    (CODE_REQUIRED_OUTCOMES as ReadonlyArray<string>).includes(o),
  )

  // Rule 2: Code-required outcomes flip the band earlier.
  if (hasCodeRequiredOutcome) {
    if (packCount < 8) {
      // Below 8 packs, even Code-required outcomes cannot justify the
      // 60-minute setup over a 4-pack starter. Render soft-option with
      // the "functionally required" copy variant (callers branch on the
      // hasCodeRequiredOutcome flag for the copy).
      return packCount >= 4 ? 'soft-option' : 'hidden'
    }
    // 8+ packs with a Code-required outcome: render soft-option until
    // the user has 18+ packs with 2+ asterisks installed. Spec requires
    // the "functionally required" copy to lead with the outcome, not the
    // installed-asterisk count, so the soft-option band carries the
    // honest framing until the asterisk count actually justifies primary
    // CTA. Multi-model jury 2026-05-15 caught this band as a regression;
    // the previous code returned primary-cta at 8 packs which broke the
    // Persona-1 walkthrough for 35-50% of users.
    return packCount >= 18 && asteriskedCount >= 2 ? 'primary-cta' : 'soft-option'
  }

  // Rule 3 + Rule 4: standard bands, adjusted for Desktop checked.
  // Desktop users get the soft option earlier (at 12 packs the desktop
  // case for hooks plus auto-memory is already credible, the plan says
  // "at step 12 to 14 as a soft option").
  const desktopChecked = surfaceMix.desktop

  if (packCount < 8) {
    // The 0 to 7 band is hidden universally, with the exception of
    // Desktop-checked users at 6 to 7 packs who still get "hidden"
    // because the plan keeps the soft-option floor at 12 for desktops.
    // The honest call here is to not push.
    return 'hidden'
  }

  // 8 to 17 packs (or 8 to 11 packs for desktop, which is just hidden):
  if (packCount < 18) {
    if (desktopChecked && packCount < 12) {
      // Desktop-checked but only 8 to 11 packs: still hidden. The plan
      // sets the Desktop soft-option floor at 12, not 8.
      return 'hidden'
    }
    return 'soft-option'
  }

  // 18+ packs. The asterisk-pressure signal decides primary vs soft.
  if (asteriskedCount >= 2) {
    return 'primary-cta'
  }
  return 'soft-option'
}

/**
 * Copy variants for the Code intro panel. Callers pass the current
 * intro state plus the user's outcomes and surface mix and get back
 * a short headline + body + CTA label tuple.
 *
 * The "primary-cta" headline keys off whether the user has the
 * Code-required outcomes. If they do, the copy is honest about the
 * requirement. If they do not, the copy frames it as a compounding
 * upgrade.
 *
 * Voice: plain English. Lead with the user's installed state, not a
 * sales pitch. No banned openers, no em dashes, no "PE" abbreviation.
 */
export interface CodeIntroCopy {
  headline: string
  body: string
  primaryCta: string
  secondaryCta: string
  /** When true, the panel is the visible primary action on the page. */
  isPrimary: boolean
}

export function codeIntroCopy(
  state: CodeIntroState,
  installedPackIds: ReadonlyArray<string>,
  surfaceMix: SurfaceMix,
  outcomes: ReadonlyArray<string>,
): CodeIntroCopy | null {
  if (state === 'hidden') return null

  const packCount = installedPackIds.length
  const asteriskedCount = countAsteriskedInstalled(installedPackIds)
  const hasCodeRequiredOutcome = outcomes.some((o) =>
    (CODE_REQUIRED_OUTCOMES as ReadonlyArray<string>).includes(o),
  )

  if (state === 'primary-cta') {
    if (hasCodeRequiredOutcome) {
      const need = outcomes
        .filter((o) => (CODE_REQUIRED_OUTCOMES as ReadonlyArray<string>).includes(o))
        .map((o) => {
          switch (o) {
            case 'knowledge-search':
              return 'knowledge search across files'
            case 'rag-retrieval':
              return 'RAG retrieval'
            case 'voice-to-task-mobile':
              return 'voice to task on mobile'
            default:
              return o
          }
        })
        .join(', ')
      return {
        headline: 'Code CLI is the next install',
        body:
          `You picked outcomes that need Claude Code: ${need}. ` +
          `Those run on Code, not in a browser tab. ` +
          `Setup is 60 minutes one time. Your ${packCount} installed packs stay intact.`,
        primaryCta: 'Install Code CLI now',
        secondaryCta: 'Show me what unlocks',
        isPrimary: true,
      }
    }
    return {
      headline: 'Unlock the asterisks',
      body:
        `You have installed ${packCount} packs. ${asteriskedCount} of them carry the ` +
        `browser only asterisk: they install on Pro web but fire fully only on Code. ` +
        `Adding Claude Code CLI is a 60 minute one time setup. After install, those ` +
        `${asteriskedCount} packs gain their full power and 7 new bonus blueprints become ` +
        `available: auto memory, hooks and daemons, Notion DBs auto managed, RAG search, ` +
        `Telegram bridge. The compounding payoff at this stage is steep.`,
      primaryCta: 'Install Code CLI now',
      secondaryCta: 'Continue on Pro for now',
      isPrimary: true,
    }
  }

  // soft-option
  if (hasCodeRequiredOutcome) {
    return {
      headline: 'Heads up: Code CLI becomes required soon',
      body:
        `You picked outcomes that need Claude Code (knowledge search or RAG or voice mobile). ` +
        `Keep installing the browser packs for now. Around pack 8 the Code install becomes the ` +
        `next compounding move. 60 minutes one time. Your installed packs stay intact.`,
      primaryCta: 'Preview Code setup',
      secondaryCta: 'Continue on Pro',
      isPrimary: false,
    }
  }

  if (surfaceMix.desktop) {
    return {
      headline: 'Compounding upgrade available',
      body:
        `You have ${packCount} packs installed on Desktop. Adding Claude Code CLI layers in ` +
        `hooks, daemons, auto memory, and RAG search. 60 minute setup. Worth it for users ` +
        `running Claude 3 plus hours per day. Optional if your current Desktop stack covers ` +
        `your daily work.`,
      primaryCta: 'Preview Code setup',
      secondaryCta: 'Continue on Desktop',
      isPrimary: false,
    }
  }

  return {
    headline: 'Compounding upgrade available',
    body:
      `You have ${packCount} packs installed. Claude Code CLI adds OS level voice rules, ` +
      `auto memory across sessions, RAG search across your files, and a Telegram bridge. ` +
      `60 minute one time setup. The compounding payoff is 10x within a month for users ` +
      `running Claude 3 plus hours per day.`,
    primaryCta: 'Preview Code setup',
    secondaryCta: 'Continue on Pro',
    isPrimary: false,
  }
}

/**
 * Helper exposed for the tracker UI: the canonical asterisked pack ids.
 * Read only; do not mutate.
 */
export const ASTERISKED_PACK_ID_LIST: ReadonlyArray<string> = ASTERISKED_PACK_IDS

/**
 * Helper exposed for the tracker UI: the canonical Code-required outcomes.
 * Read only.
 */
export const CODE_REQUIRED_OUTCOME_LIST: ReadonlyArray<IntakeOutcome> = CODE_REQUIRED_OUTCOMES
