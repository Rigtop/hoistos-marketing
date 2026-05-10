/**
 * Empire Timeline shared data model.
 *
 * Three visual treatments (B2-a vertical scrollytelling, B2-b horizontal
 * keynote tunnel, B2-c radial dependency graph) all consume `AhaMoment[]`
 * from `loadAhaMoments()`. The loader stub returns hardcoded mock entries
 * tonight so the three treatments can be visually verified before B3
 * populates the real MDX shortlist on Day 2.
 *
 * Hard Rule #11: no em dashes in any string in this file.
 * Hard Rule #30: real entries must cite evidence in `foundation` / `enables`
 * once B3 wires the shortlist; mock entries flag this in `aha` copy.
 */

export type AhaBucket = 'hard-hitter' | 'moved-needle' | 'minor'

export type AhaCategory =
  | 'architecture'
  | 'skill'
  | 'automation'
  | 'rule'
  | 'vibes'

export type AhaIconKind = 'lightbulb' | 'spark' | 'graph' | 'skill'

export interface AhaVisualHint {
  /** Path (relative to /public or absolute URL) to the greyscale before-state screenshot. */
  beforeImage?: string
  /** Path to the color after-state screenshot. */
  afterImage?: string
  /** Symbolic icon when no screenshot exists. Treatments map this to lucide or SVG. */
  iconKind?: AhaIconKind
  /** Override for the category default accent (e.g., custom orange variant). */
  accentColor?: string
}

export interface AhaMoment {
  /** Stable kebab-case id, used for routing, anchor links, and edge references. */
  id: string
  /** Display title, max ~60 chars. */
  title: string
  /** Session in which it shipped, e.g. "S175". Used for chronological sort. */
  sessionShipped: string
  /** ISO 8601 date string (YYYY-MM-DD). Authoritative time axis. */
  dateShipped: string
  /** Rubric score, 0 to 12 inclusive. See MASTER_PLAN scoring rubric. */
  score: number
  /** Bucket derived from score: >=6 hard-hitter, 3-5 moved-needle, <3 minor. */
  bucket: AhaBucket
  /** Category drives accent color and filter pills in treatment C. */
  category: AhaCategory
  /** One sentence trigger ("what made you notice the pain"). */
  hook: string
  /** One to two sentences on the failure / pain / blocker. */
  before: string
  /** One quote-style sentence, displayed in serif display at large size. */
  aha: string
  /** One to two sentences on what changed after. */
  after: string
  /** Measurable gain (preferred) or strong vibes story. */
  efficiency: string
  /** What this aha moment let you build on top of. One sentence. */
  foundation: string
  /** Ids of aha moments unlocked by this one. Drives DependencyEdge. */
  enables: string[]
  /** Ids of aha moments that had to ship before this one. */
  enabledBy: string[]
  /** Optional visual hints for treatments (screenshots, icons, accent overrides). */
  visualHint?: AhaVisualHint

  // -------------------------------------------------------------------------
  // Treatment D extension (S198 Scrolophyte sprint, C-site-d tab).
  // All optional so existing MOCK_AHA_MOMENTS entries keep validating.
  // Treatment D is a long-scroll variant that renders 30 chronological
  // items with chapter breaks for big moments and a bottom indexed table.
  // -------------------------------------------------------------------------

  /** Chronological position 1 to 30 in the long-scroll treatment. */
  itemNumber?: number
  /** True when this item gets a full-bleed chapter-break treatment. */
  isBigMoment?: boolean
  /** True when this item has a downloadable installable pack (16 of 30). */
  hasPack?: boolean
  /** Pack slug, e.g. "beg-01-chat-to-projects". Required when hasPack. */
  packSlug?: string
  /** Pack tier. Required when hasPack. */
  packTier?: 'beginner' | 'intermediate' | 'advanced' | 'power'
  /** When true, a chapter break renders before this item. */
  chapterBreakBeforeThis?: boolean
  /** Chapter title displayed when chapterBreakBeforeThis is true. */
  chapterTitle?: string
  /** Estimated minutes to install and activate the pack on a fresh machine. */
  estimatedActivationMinutes?: number
}

/**
 * Category accent palette. Treatments default to these unless an entry
 * overrides via `visualHint.accentColor`. Tokens reference `index.css`
 * brand vars so light/dark theme switches stay coherent.
 */
export const CATEGORY_ACCENT: Record<AhaCategory, string> = {
  architecture: 'rgb(var(--color-accent))', // signal orange, foundational
  skill: '#6366F1', // indigo, named entity
  automation: '#0EA5E9', // sky, mechanical
  rule: '#111827', // ink, governance
  vibes: '#F59E0B', // amber, qualitative
}

/**
 * Mock loader. Returns 7 entries spanning the score range so all three
 * treatments can be visually verified tonight. B3 (Day 2) replaces this
 * with an MDX-backed loader that reads `./aha/*.mdx` and merges the
 * D1 shortlist scoring.
 *
 * Real loader signature stays the same so treatments are unaffected.
 */
export async function loadAhaMoments(): Promise<AhaMoment[]> {
  return MOCK_AHA_MOMENTS
}

/**
 * Hardcoded mock data. Drawn from Eugeen's known aha moments (S175 to S190
 * range plus earlier foundational moments). Scores assigned by rubric in
 * MASTER_PLAN.md. `enables` / `enabledBy` form a small DAG so B2-c (radial
 * dependency graph) has real edges to render.
 *
 * NOTE: these are mocks. B3 supersedes with the D1 final shortlist.
 */
export const MOCK_AHA_MOMENTS: AhaMoment[] = [
  {
    id: 'operating-constitution',
    title: 'Operating Constitution + cold-start protocol',
    sessionShipped: 'S180',
    dateShipped: '2026-03-14',
    score: 11,
    bucket: 'hard-hitter',
    category: 'architecture',
    hook: 'Every new session was relearning who Eugeen was, what the rules were, and where to write files.',
    before: 'Cold context burned 30 minutes per session on identity drift, em dash slips, and "PE" abbreviation regressions. Bernie, Cowork, and Code each held a different mental model.',
    aha: 'Identity, rules, and routing belong in a single read-first contract every surface boots from.',
    after: 'Cold-start gate now reads Operating Constitution + facts-registry + User Preferences + SESSION_BRIEFING in order, emits a verification stamp, and blocks non-trivial responses until loaded. Drift incidents per week dropped from 6 to under 1.',
    efficiency: 'Identity drift incidents: 6 per week to less than 1. Cold-start time: 30 min to ~90 sec.',
    foundation: 'Made every later Hard Rule enforceable because the rules now load before action.',
    enables: ['hard-rule-architecture', 'session-briefing-close', 'rag-pgvector'],
    enabledBy: [],
    visualHint: { iconKind: 'lightbulb' },
  },
  {
    id: 'skill-creator-substrate',
    title: '/skill-creator + skill substrate',
    sessionShipped: 'S150',
    dateShipped: '2026-01-22',
    score: 11,
    bucket: 'hard-hitter',
    category: 'skill',
    hook: 'Eugeen kept rebuilding the same prompt scaffolds: proposals, RFIs, financial summaries, three different ways each.',
    before: 'Every recurring task was a fresh prompt. No surface for trigger phrases, no parameterization, no eval loop. Skills lived in head only.',
    aha: 'A skill is just a versioned, triggered, evaluatable prompt with structured I/O. Build the meta-skill that builds skills.',
    after: '/skill-creator generates SKILL.md + helper scripts + eval harness from a 3-question interview. Skill count grew from 4 to 45 with consistent metadata.',
    efficiency: '45 skills, 9 of them autonomous-trigger; ~4 hours saved per recurring task once codified.',
    foundation: 'Every domain skill (proposal-builder, rfi-walkthrough, financial-ops, etc.) is a fork off this substrate.',
    enables: ['hard-rule-architecture', 'visual-stack', 'rag-pgvector'],
    enabledBy: [],
    visualHint: { iconKind: 'skill' },
  },
  {
    id: 'code-bernie-cli-interop',
    title: 'Code + Bernie transition + CLI interop',
    sessionShipped: 'S185',
    dateShipped: '2026-04-08',
    score: 11,
    bucket: 'hard-hitter',
    category: 'architecture',
    hook: 'Cowork (claude.ai) could not run scripts, Bernie (Mac mini) could not see latest files, Code (M4 Max) was the only place with both.',
    before: 'Three surfaces, three brains, no shared memory. Bernie launched a daemon, Code did not know. Cowork promised an artifact, Code could not find it.',
    aha: 'One brain across three surfaces requires a canonical filesystem (iCloud), a canonical task DB (Notion), and explicit CLI handoff artifacts.',
    after: 'Bernie writes auto-memory, launchd mirrors it to iCloud, Code reads it on cold-start. Codex CLI handoff artifacts in ~/.codex/sessions/handoffs/ get picked up at session start.',
    efficiency: 'Cross-surface context loss: ~2 events per day to under 1 per week.',
    foundation: 'Made overnight parallel builds (this 9-tab session) possible because tabs share state through filesystem + Notion, not in-memory.',
    enables: ['session-briefing-close', 'rag-pgvector'],
    enabledBy: ['operating-constitution'],
    visualHint: { iconKind: 'graph' },
  },
  {
    id: 'rag-pgvector',
    title: 'RAG + Supabase pgvector + reconcile watcher',
    sessionShipped: 'S178',
    dateShipped: '2026-03-02',
    score: 10,
    bucket: 'hard-hitter',
    category: 'automation',
    hook: 'Asking Claude "what did I decide about X" returned hallucinations because the answer lived in 400 markdown files it never read.',
    before: 'Knowledge retrieval was full-file scan or grep. Hit rate under 30%. Stale answers shipped because the corpus was invisible to the model.',
    aha: 'The corpus needs an embedding-indexed search surface the model treats as a tool, not a context to load.',
    after: 'Supabase pgvector + mcp eugeen-rag server + reconcile watcher daemon keeps embeddings fresh on every Outputs write. Source-Before-Answer Gate forces RAG hits on AI-ecosystem topics.',
    efficiency: 'Answer accuracy on "what did I decide" questions: ~30% to ~85%. Daemon reconcile lag: under 60 sec on file write.',
    foundation: 'Wiki compile, predictions engine, decision log scanning all sit on top of the embedding index.',
    enables: [],
    enabledBy: ['operating-constitution', 'code-bernie-cli-interop', 'skill-creator-substrate'],
    visualHint: { iconKind: 'graph' },
  },
  {
    id: 'visual-stack',
    title: 'visual-stack template build',
    sessionShipped: 'S175',
    dateShipped: '2026-02-18',
    score: 10,
    bucket: 'hard-hitter',
    category: 'vibes',
    hook: 'Single-file HTML deliverables hit a ceiling: no Motion, no R3F, no shaders, no Tailwind shadcn primitives.',
    before: 'Every "build me a landing page" started from blank index.html, ended in ~70% of where Eugeen wanted it. No reuse between deliverables.',
    aha: 'A studio-grade Vite + React + Tailwind + Motion + GSAP + R3F + Lenis template, branded for HoistOS and Anthropic Claude Design dual-mode, is the right floor for any visual.',
    after: '/visualize-pro scaffolds in 30 seconds. Investor decks, AI Authority posts, HoistOS marketing pages all reuse the same primitive library (45 components, Ladle stories).',
    efficiency: 'Visual deliverable scaffold time: 2 hours to 30 sec. Component reuse: 0 to 45 shared primitives.',
    foundation: 'Made this Empire timeline build possible: 3 visual treatments in one night because the substrate exists.',
    enables: [],
    enabledBy: ['skill-creator-substrate'],
    visualHint: { iconKind: 'spark' },
  },
  {
    id: 'session-briefing-close',
    title: 'SESSION_BRIEFING + session-close protocol',
    sessionShipped: 'S190',
    dateShipped: '2026-04-22',
    score: 9,
    bucket: 'hard-hitter',
    category: 'rule',
    hook: 'Sessions ended in mid-thought. Next session reopened to "wait, where was I" and 20 minutes of re-orientation.',
    before: 'No session boundaries. SESSION_BRIEFING.md drifted, sometimes did not exist. Decisions made in one session were invisible in the next.',
    aha: 'A session has a beginning (cold-start gate) and an end (session-close skill) or it is not a session, it is a leak.',
    after: '/session-close runs 5 steps in under 15 min: updates SESSION_BRIEFING, syncs auto-memory, pushes Notion task changes, logs Decision Log, runs drift-check. Cold-start picks it up next session.',
    efficiency: 'Session re-orientation time: 20 min to under 2 min. SESSION_BRIEFING freshness: never older than last session.',
    foundation: 'Made multi-session coding work tractable. The reconciler scorer upgrade (60-90 min, multi-session) became viable.',
    enables: [],
    enabledBy: ['operating-constitution', 'code-bernie-cli-interop'],
    visualHint: { iconKind: 'lightbulb' },
  },
  {
    id: 'hard-rule-architecture',
    title: 'Hard Rule architecture + propagation ledger',
    sessionShipped: 'S165',
    dateShipped: '2026-02-04',
    score: 9,
    bucket: 'hard-hitter',
    category: 'rule',
    hook: 'Same correction kept happening: em dashes, "PE" abbreviation, identity drift, file routing slips.',
    before: 'Corrections lived in ad-hoc memory files. Each surface enforced different rules. Same mistake shipped on Cowork after Code already learned it.',
    aha: 'Rules need an authority hierarchy (Constitution > User Preferences > memory) and a propagation ledger so a fix on one surface lands on all surfaces.',
    after: '34 Hard Rules numbered, versioned, hook-enforced where automatable. Propagation ledger tracks which surfaces have absorbed each rule. PreToolUse hooks block violations at the tool layer.',
    efficiency: 'Repeat-offense rate on the top 5 rules: ~weekly to near-zero (em dashes, PE, identity, routing, email-send).',
    foundation: 'The hook ecosystem (routing gate, Notion write gate, email playbook gate, Context7 gate) all sit on this rule architecture.',
    enables: ['session-briefing-close'],
    enabledBy: ['operating-constitution', 'skill-creator-substrate'],
    visualHint: { iconKind: 'lightbulb' },
  },
]
