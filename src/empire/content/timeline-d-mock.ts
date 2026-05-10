/**
 * Treatment D mock data: 30 chronological aha-moment items spanning
 * S140 (early Cowork) through S198 (this sprint).
 *
 * Composition:
 *   - 5 BIG moments (chapter breaks)
 *   - 25 regular moments
 *   - 16 with hasPack=true (installable today, mapped to B3 outputs)
 *   - 14 with hasPack=false (narrative-only)
 *
 * Pack slug convention follows the B3 tab outputs:
 *   beg-01..beg-04, mid-01..mid-04, adv-01..adv-04, pow-01..pow-04
 *
 * E-merge replaces this file with real data once B3 finalizes the
 * shortlist. The shape (TimelineDMoment) is stable and matches
 * AhaMoment + the Treatment D fields added to types.ts.
 *
 * Hard Rule #11: zero em dashes.
 * Hard Rule #30: every entry tracks foundation + enables for narrative
 * continuity even when not used by Treatment D layout.
 */

import type { AhaMoment } from './types'

/**
 * Chapter scaffolding. Five chapters break the 30-item scroll into
 * thematic arcs. The first item of each chapter carries the break.
 */
export const TREATMENT_D_CHAPTERS = [
  {
    id: 'ch-1-foundation',
    title: 'Chapter 1. The foundation',
    subtitle: 'Cold-start, identity, the first hard rules.',
    startsAtItemNumber: 1,
  },
  {
    id: 'ch-2-substrate',
    title: 'Chapter 2. The substrate',
    subtitle: 'Skills, hooks, the rule architecture.',
    startsAtItemNumber: 7,
  },
  {
    id: 'ch-3-many-brains',
    title: 'Chapter 3. Many brains, one operator',
    subtitle: 'Cowork, Code, Bernie, RAG.',
    startsAtItemNumber: 14,
  },
  {
    id: 'ch-4-autonomy',
    title: 'Chapter 4. Autonomy and overnight work',
    subtitle: 'Reconciler, predictions, sprint architecture.',
    startsAtItemNumber: 21,
  },
  {
    id: 'ch-5-empire',
    title: 'Chapter 5. The empire surface',
    subtitle: 'Voice, visual stack, this scroll.',
    startsAtItemNumber: 27,
  },
] as const

/**
 * Treatment D moment shape. Equivalent to AhaMoment with Treatment D
 * fields required (not optional) so the renderer never has to fall
 * back to defaults.
 */
export interface TimelineDMoment extends AhaMoment {
  itemNumber: number
  isBigMoment: boolean
  hasPack: boolean
}

// ---------------------------------------------------------------------------
// Helper: build a regular (non-pack, non-big) item with sensible defaults.
// Trims boilerplate in the data block below.
// ---------------------------------------------------------------------------

function regular(
  base: Pick<
    AhaMoment,
    'id' | 'title' | 'sessionShipped' | 'dateShipped' | 'category' | 'hook' | 'before' | 'aha' | 'after' | 'efficiency' | 'foundation'
  > &
    Partial<Pick<AhaMoment, 'enables' | 'enabledBy' | 'visualHint' | 'score' | 'bucket'>>,
  itemNumber: number,
): TimelineDMoment {
  const score = base.score ?? 6
  return {
    score,
    bucket: base.bucket ?? (score >= 6 ? 'hard-hitter' : score >= 3 ? 'moved-needle' : 'minor'),
    enables: base.enables ?? [],
    enabledBy: base.enabledBy ?? [],
    visualHint: base.visualHint ?? { iconKind: 'lightbulb' },
    ...base,
    itemNumber,
    isBigMoment: false,
    hasPack: false,
  }
}

function withPack(
  item: TimelineDMoment,
  packSlug: string,
  packTier: NonNullable<AhaMoment['packTier']>,
  estimatedActivationMinutes: number,
): TimelineDMoment {
  return {
    ...item,
    hasPack: true,
    packSlug,
    packTier,
    estimatedActivationMinutes,
  }
}

function asBigMoment(item: TimelineDMoment): TimelineDMoment {
  return { ...item, isBigMoment: true }
}

function withChapter(item: TimelineDMoment, chapterTitle: string): TimelineDMoment {
  return { ...item, chapterBreakBeforeThis: true, chapterTitle }
}

// ---------------------------------------------------------------------------
// 30-item chronological data. Hand-authored.
// ---------------------------------------------------------------------------

export const TIMELINE_D_MOCK: TimelineDMoment[] = [
  // ===========================================================================
  // CHAPTER 1: THE FOUNDATION (items 1 to 6)
  // ===========================================================================

  withChapter(
    asBigMoment(
      withPack(
        regular(
          {
            id: 'cowork-first-thread',
            title: 'First Cowork thread that survived a session',
            sessionShipped: 'S140',
            dateShipped: '2026-01-04',
            category: 'vibes',
            score: 7,
            hook: 'Eugeen pasted a long ramble into Cowork and watched it disappear when the tab refreshed.',
            before: 'No persistence between sessions. Every conversation reset to zero. The "AI advisor" was a goldfish.',
            aha: 'A conversation that survives the page refresh is the cheapest version of memory you can ship.',
            after: 'Custom Instructions + a single Project on claude.ai held context across sessions. The first persistent thread became the seed for everything that followed.',
            efficiency: 'Re-orientation per session: 15 min to under 3 min.',
            foundation: 'Made it worth investing in any of the harder pieces. If the model forgot you every session, none of this gets built.',
            enables: ['operating-constitution'],
          },
          1,
        ),
        'beg-01-chat-to-projects',
        'beginner',
        12,
      ),
    ),
    TREATMENT_D_CHAPTERS[0].title,
  ),

  withPack(
    regular(
      {
        id: 'custom-instructions-v0',
        title: 'Custom Instructions v0',
        sessionShipped: 'S142',
        dateShipped: '2026-01-09',
        category: 'rule',
        score: 6,
        hook: 'The same identity drift bugs kept resurfacing: "PE" abbreviation, em dashes, calling Eugeen "CEO".',
        before: 'No fixed identity contract. Every session relearned who Eugeen was from scratch.',
        aha: 'Identity belongs in the system prompt, not the conversation.',
        after: 'A 200-line Custom Instructions doc that Cowork reloads every turn. Identity drift dropped 80% within a week.',
        efficiency: 'Identity correction events: ~5 per day to ~1 per day.',
        foundation: 'Was the prototype that grew into the Operating Constitution.',
        enables: ['operating-constitution'],
      },
      2,
    ),
    'beg-02-custom-instructions',
    'beginner',
    8,
  ),

  regular(
    {
      id: 'first-em-dash-correction',
      title: 'The em dash correction (the one that started everything)',
      sessionShipped: 'S145',
      dateShipped: '2026-01-15',
      category: 'rule',
      score: 5,
      hook: 'Eugeen sent a draft to a GC that had three em dashes. The GC asked if it was AI-written.',
      before: 'Em dashes everywhere. Subtle giveaway that the writing was generated.',
      aha: 'A single banned glyph saves the brand. Make it a Hard Rule, enforce at hook layer.',
      after: 'Em dashes added to ban list. Eventually became Hard Rule #11, hook-enforced via PreToolUse.',
      efficiency: 'AI-detection-pattern false positives in client comms: down to zero.',
      foundation: 'First proof that a single banned token can move the needle on perceived authorship.',
    },
    3,
  ),

  withPack(
    regular(
      {
        id: 'cold-start-protocol-v0',
        title: 'Cold-start protocol v0',
        sessionShipped: 'S148',
        dateShipped: '2026-01-19',
        category: 'rule',
        score: 7,
        hook: 'Cowork sessions opened with 20 minutes of "wait, where were we" before any work happened.',
        before: 'No fixed boot sequence. Each session improvised its own re-orientation.',
        aha: 'Read four files in a fixed order before responding. That is the boot sequence.',
        after: 'First version of the cold-start gate. Three files: identity, rules, briefing. Loads in under 90 seconds.',
        efficiency: 'Session warm-up: 20 min to ~90 sec.',
        foundation: 'Hardened later into the cold-start-verify skill with 18 phases.',
      },
      4,
    ),
    'beg-03-cold-start-gate',
    'beginner',
    15,
  ),

  regular(
    {
      id: 'first-correction-log',
      title: 'First Decision Log entry',
      sessionShipped: 'S149',
      dateShipped: '2026-01-21',
      category: 'rule',
      score: 4,
      hook: 'Eugeen corrected the same thing twice in two days. Different sessions, same mistake.',
      before: 'Corrections evaporated when sessions closed. No durable record of "we already learned this".',
      aha: 'Every correction needs to land in a single append-only log that cold-start reads.',
      after: 'Decision Log markdown file. Each entry has date + tag + correction. Cold-start reads it.',
      efficiency: 'Repeat corrections within the same week: from 3 to under 1.',
      foundation: 'Predecessor to the propagation ledger.',
    },
    5,
  ),

  // ITEM 6: pack
  withPack(
    regular(
      {
        id: 'skill-creator-substrate',
        title: '/skill-creator and the skill substrate',
        sessionShipped: 'S150',
        dateShipped: '2026-01-22',
        score: 11,
        category: 'skill',
        hook: 'Eugeen kept rebuilding the same prompt scaffolds: proposals, RFIs, financial summaries, three different ways each.',
        before: 'Every recurring task was a fresh prompt. No surface for trigger phrases, no parameterization, no eval loop.',
        aha: 'A skill is just a versioned, triggered, evaluatable prompt with structured I/O. Build the meta-skill that builds skills.',
        after: '/skill-creator generates SKILL.md plus helper scripts plus eval harness from a 3-question interview. Skill count grew from 4 to 45.',
        efficiency: '45 skills, 9 of them autonomous-trigger, ~4 hours saved per recurring task once codified.',
        foundation: 'Every domain skill (proposal-builder, rfi-walkthrough, financial-ops) is a fork off this substrate.',
        enables: ['hard-rule-architecture', 'visual-stack', 'rag-pgvector'],
      },
      6,
    ),
    'beg-04-skill-creator',
    'beginner',
    20,
  ),

  // ===========================================================================
  // CHAPTER 2: THE SUBSTRATE (items 7 to 13)
  // ===========================================================================

  withChapter(
    asBigMoment(
      regular(
        {
          id: 'first-skill-build',
          title: 'First custom skill (proposal-builder)',
          sessionShipped: 'S152',
          dateShipped: '2026-01-26',
          score: 8,
          category: 'skill',
          hook: 'Eugeen wrote his fifth different proposal scaffold in a month. They were all 70% the same.',
          before: 'Each proposal was a fresh build. Same lookups, same boilerplate, same brand application.',
          aha: 'The 70% that is shared belongs in a skill body. The 30% that is unique belongs in the call.',
          after: '/proposal-builder fires on 12 trigger phrases, walks the field interview, ships a branded .docx in under 4 minutes.',
          efficiency: 'Proposal build time: ~90 min to ~4 min for a standard package.',
          foundation: 'Proved the skill substrate worked for a real-money business workflow.',
          enabledBy: ['skill-creator-substrate'],
        },
        7,
      ),
    ),
    TREATMENT_D_CHAPTERS[1].title,
  ),

  withPack(
    regular(
      {
        id: 'first-pretooluse-hook',
        title: 'First PreToolUse hook (em dash blocker)',
        sessionShipped: 'S155',
        dateShipped: '2026-01-29',
        score: 8,
        category: 'rule',
        hook: 'Eugeen kept catching em dashes in already-saved files. The rule lived in his head, not the system.',
        before: 'Hard rules were aspirational. Behavior matched them ~80% of the time.',
        aha: 'A rule that is not enforced at the tool layer is a suggestion. Hooks turn rules into laws.',
        after: 'PreToolUse hook scans every Write/Edit body for em dashes and exits non-zero with the line numbers. Compliance: 100%.',
        efficiency: 'Em dashes shipped to client emails: from ~weekly to zero.',
        foundation: 'Template for every later compliance hook (PE blocker, identity blocker, routing gate, Notion write gate).',
      },
      8,
    ),
    'mid-01-pretooluse-hook',
    'intermediate',
    25,
  ),

  regular(
    {
      id: 'memory-files-discovery',
      title: 'Auto-memory file discovery',
      sessionShipped: 'S158',
      dateShipped: '2026-02-01',
      category: 'architecture',
      score: 6,
      hook: 'Claude Code wrote files Eugeen never asked it to. He found them by accident.',
      before: 'Memory was a black box. Cowork remembered, Code did not, Bernie did not exist yet.',
      aha: 'Code already writes auto-memory. The question is whether you read it on cold-start. Answer: yes.',
      after: 'Cold-start gate now reads auto-memory directory. New facts surface in the next session, not lost.',
      efficiency: 'Cross-session fact retention on Code: from ~30% to ~95%.',
      foundation: 'Was the moment "Code has its own memory" went from "neat" to "design constraint".',
    },
    9,
  ),

  withPack(
    regular(
      {
        id: 'routing-rules-v0',
        title: 'routing-rules.md and the Outputs taxonomy',
        sessionShipped: 'S160',
        dateShipped: '2026-02-04',
        score: 7,
        category: 'architecture',
        hook: 'Files landed in the wrong folders. Outputs/ was a junkyard with three flavors of "Compliance" subdirs.',
        before: 'No write taxonomy. Every save was a fresh decision. Half ended up in Outputs/ root.',
        aha: 'A 30-row Save Decision Matrix beats vibes for "where does this go".',
        after: 'routing-rules.md is the authority. Cold-start loads it. Layer 2 disclosure required before any save.',
        efficiency: 'Mis-routed saves: ~5 per week to under 1 per month.',
        foundation: 'Hardened into Hard Rule #24 with PreToolUse + PostToolUse hooks (Layer 1 + Layer 3).',
      },
      10,
    ),
    'mid-02-routing-rules',
    'intermediate',
    30,
  ),

  regular(
    {
      id: 'hard-rule-architecture',
      title: 'Hard Rule architecture and propagation ledger',
      sessionShipped: 'S165',
      dateShipped: '2026-02-04',
      score: 9,
      category: 'rule',
      hook: 'Same correction kept happening across surfaces: Cowork relearned what Code already knew.',
      before: 'Corrections lived in ad-hoc memory files. Each surface enforced different rules.',
      aha: 'Rules need an authority hierarchy (Constitution > User Preferences > memory) and a propagation ledger.',
      after: '34 Hard Rules numbered, versioned, hook-enforced where automatable. Propagation ledger tracks absorption.',
      efficiency: 'Repeat-offense rate on top 5 rules: weekly to near zero.',
      foundation: 'The hook ecosystem (routing, write gate, email playbook, Context7) sits on this.',
      enables: ['session-briefing-close'],
      enabledBy: ['operating-constitution', 'skill-creator-substrate'],
    },
    11,
  ),

  withPack(
    regular(
      {
        id: 'output-validator',
        title: '/output-validator pre-delivery gate',
        sessionShipped: 'S168',
        dateShipped: '2026-02-08',
        score: 7,
        category: 'skill',
        hook: 'A proposal shipped to a GC with the wrong abbreviation in the footer. Eugeen had to apologize.',
        before: 'No pre-delivery check. Final pass was vibes-based. One slip and the brand took the hit.',
        aha: 'Every deliverable runs through one validator skill before Eugeen sees it. No exceptions.',
        after: '/output-validator checks 12 things: em dashes, identity, names verified against People DB, routing path, color palette, self-rating threshold.',
        efficiency: 'Deliverable rework rate: ~30% to under 5%.',
        foundation: 'The pre-delivery gate. Every other skill ships through this one.',
      },
      12,
    ),
    'mid-03-output-validator',
    'intermediate',
    18,
  ),

  regular(
    {
      id: 'context7-discovery',
      title: 'Context7 MCP and the import disclosure rule',
      sessionShipped: 'S172',
      dateShipped: '2026-02-15',
      category: 'automation',
      score: 5,
      hook: 'Code introduced an external library Eugeen had never installed. Build broke at 11pm.',
      before: 'External imports landed silently. Version drift caused build failures only at deploy.',
      aha: 'Force a Context7 disclosure on every external import. Make the model declare what it is reaching for.',
      after: 'Hard Rule #31 plus PreToolUse hook. Every new external import names version + API. Stdlib auto-skips.',
      efficiency: 'Late-discovered version drift incidents: ~2 per month to zero.',
      foundation: 'Made unattended overnight builds safer. The model cannot smuggle in a dep.',
    },
    13,
  ),

  // ===========================================================================
  // CHAPTER 3: MANY BRAINS, ONE OPERATOR (items 14 to 20)
  // ===========================================================================

  withChapter(
    asBigMoment(
      withPack(
        regular(
          {
            id: 'visual-stack',
            title: 'visual-stack template build',
            sessionShipped: 'S175',
            dateShipped: '2026-02-18',
            score: 10,
            category: 'vibes',
            hook: 'Single-file HTML deliverables hit a ceiling: no Motion, no R3F, no shaders.',
            before: 'Every "build me a landing page" started from blank index.html, ended ~70% of where Eugeen wanted.',
            aha: 'A studio-grade Vite + React + Tailwind + Motion + GSAP + R3F template, dual-branded, is the right floor.',
            after: '/visualize-pro scaffolds in 30 seconds. 45 shared primitives. This scroll runs on it.',
            efficiency: 'Visual scaffold time: 2 hours to 30 sec.',
            foundation: 'Made this Empire timeline build possible. 4 visual treatments in one night because the substrate exists.',
            enables: [],
            enabledBy: ['skill-creator-substrate'],
            visualHint: { iconKind: 'spark' },
          },
          14,
        ),
        'mid-04-visual-stack',
        'intermediate',
        45,
      ),
    ),
    TREATMENT_D_CHAPTERS[2].title,
  ),

  regular(
    {
      id: 'rag-pgvector',
      title: 'RAG plus Supabase pgvector plus reconcile watcher',
      sessionShipped: 'S178',
      dateShipped: '2026-03-02',
      score: 10,
      category: 'automation',
      hook: 'Asking Claude "what did I decide about X" returned hallucinations because the answer lived in 400 markdown files.',
      before: 'Knowledge retrieval was full-file scan or grep. Hit rate under 30%. Stale answers shipped.',
      aha: 'The corpus needs an embedding-indexed search surface the model treats as a tool.',
      after: 'Supabase pgvector plus mcp eugeen-rag plus reconcile watcher. Source-Before-Answer Gate forces RAG hits.',
      efficiency: 'Answer accuracy on "what did I decide" questions: ~30% to ~85%.',
      foundation: 'Wiki compile, predictions engine, Decision Log scanning all sit on the embedding index.',
      enables: [],
      enabledBy: ['operating-constitution', 'code-bernie-cli-interop', 'skill-creator-substrate'],
      visualHint: { iconKind: 'graph' },
    },
    15,
  ),

  withPack(
    regular(
      {
        id: 'operating-constitution',
        title: 'Operating Constitution + cold-start protocol',
        sessionShipped: 'S180',
        dateShipped: '2026-03-14',
        score: 11,
        category: 'architecture',
        hook: 'Every new session was relearning who Eugeen was, what the rules were, and where to write files.',
        before: 'Cold context burned 30 min on identity drift, em dash slips, and abbreviation regressions.',
        aha: 'Identity, rules, and routing belong in a single read-first contract every surface boots from.',
        after: 'Cold-start gate reads Constitution + facts-registry + User Preferences + SESSION_BRIEFING in order.',
        efficiency: 'Identity drift incidents: 6 per week to less than 1. Cold-start time: 30 min to ~90 sec.',
        foundation: 'Made every later Hard Rule enforceable because rules now load before action.',
        enables: ['hard-rule-architecture', 'session-briefing-close', 'rag-pgvector'],
        visualHint: { iconKind: 'lightbulb' },
      },
      16,
    ),
    'adv-01-operating-constitution',
    'advanced',
    60,
  ),

  regular(
    {
      id: 'notion-as-task-authority',
      title: 'Notion Task Commander as single source of truth',
      sessionShipped: 'S181',
      dateShipped: '2026-03-17',
      score: 7,
      category: 'architecture',
      hook: 'Tasks lived in three places: Cowork chat, local todo files, Eugeen\'s head. Drift was constant.',
      before: 'No canonical task list. Cowork promised, Code forgot, Bernie was blind.',
      aha: 'One Notion DB, one ID, every surface writes there or it does not exist.',
      after: 'Task Commander DB is canonical. All tasks routed via MCP.',
      efficiency: 'Lost tasks per week: ~3 to zero.',
      foundation: 'Single source of truth made cross-surface continuity tractable.',
    },
    17,
  ),

  withPack(
    regular(
      {
        id: 'notion-write-gate',
        title: 'notion-write-gate (post-write verify)',
        sessionShipped: 'S183',
        dateShipped: '2026-03-22',
        score: 8,
        category: 'rule',
        hook: 'Claude declared "page created" and then the page was wrong. "Done" did not mean done.',
        before: 'API 200 = success. But the schema was wrong, the icon was missing, the layout drifted.',
        aha: 'Write, then read back, then diff against expected schema. Auto-remediate or escalate.',
        after: 'Hard Rule #20 plus PostToolUse hook. Up to 3 remediation attempts before escalation.',
        efficiency: 'False-positive "done" claims on Notion: ~weekly to zero.',
        foundation: 'Ported pattern to other write gates (filesystem routing, email playbook).',
      },
      18,
    ),
    'adv-02-notion-write-gate',
    'advanced',
    50,
  ),

  regular(
    {
      id: 'people-db-identity-anchor',
      title: 'Notion People DB as identity anchor',
      sessionShipped: 'S184',
      dateShipped: '2026-04-02',
      category: 'rule',
      score: 6,
      hook: 'A draft email referenced "Mike Smith" who did not exist. Auto-generated from a half-remembered name.',
      before: 'Names invented when uncertain. Risk of writing about people who do not work for Perennial Empire.',
      aha: 'Every name resolves against the People DB before it lands in a deliverable. No match = block.',
      after: 'Hard Rule plus output-validator check. Unverified names emit "UNVERIFIED NAME: X" and refuse to write.',
      efficiency: 'Phantom-name slips in client comms: from ~monthly to zero.',
      foundation: 'Identity anchoring across all skills (proposal-builder, email-drafter, RFI builder).',
    },
    19,
  ),

  withPack(
    regular(
      {
        id: 'code-bernie-cli-interop',
        title: 'Code + Bernie + Cowork CLI interop',
        sessionShipped: 'S185',
        dateShipped: '2026-04-08',
        score: 11,
        category: 'architecture',
        hook: 'Cowork could not run scripts, Bernie could not see latest files, Code was the only place with both.',
        before: 'Three surfaces, three brains, no shared memory.',
        aha: 'One brain across three surfaces requires a canonical filesystem (iCloud), a canonical task DB (Notion), and explicit CLI handoff artifacts.',
        after: 'Bernie writes auto-memory, launchd mirrors to iCloud, Code reads on cold-start. Codex CLI handoffs picked up at session start.',
        efficiency: 'Cross-surface context loss: ~2 per day to under 1 per week.',
        foundation: 'Made overnight parallel builds (this 9-tab session) possible.',
        enables: ['session-briefing-close', 'rag-pgvector'],
        enabledBy: ['operating-constitution'],
        visualHint: { iconKind: 'graph' },
      },
      20,
    ),
    'adv-03-cli-interop',
    'advanced',
    75,
  ),

  // ===========================================================================
  // CHAPTER 4: AUTONOMY AND OVERNIGHT WORK (items 21 to 26)
  // ===========================================================================

  withChapter(
    asBigMoment(
      withPack(
        regular(
          {
            id: 'session-briefing-close',
            title: 'SESSION_BRIEFING + session-close protocol',
            sessionShipped: 'S190',
            dateShipped: '2026-04-22',
            score: 9,
            category: 'rule',
            hook: 'Sessions ended in mid-thought. Next session reopened to "wait, where was I" and 20 minutes of re-orientation.',
            before: 'No session boundaries. SESSION_BRIEFING.md drifted, sometimes did not exist.',
            aha: 'A session has a beginning (cold-start gate) and an end (session-close skill) or it is a leak.',
            after: '/session-close runs 5 steps in under 15 min: SESSION_BRIEFING, auto-memory, Notion sync, Decision Log, drift check.',
            efficiency: 'Session re-orientation time: 20 min to under 2 min.',
            foundation: 'Made multi-session coding tractable.',
            enables: [],
            enabledBy: ['operating-constitution', 'code-bernie-cli-interop'],
            visualHint: { iconKind: 'lightbulb' },
          },
          21,
        ),
        'adv-04-session-protocol',
        'advanced',
        40,
      ),
    ),
    TREATMENT_D_CHAPTERS[3].title,
  ),

  regular(
    {
      id: 'predictions-engine',
      title: 'Claude Predictions Engine (pattern accuracy as metric)',
      sessionShipped: 'S192',
      dateShipped: '2026-04-26',
      category: 'automation',
      score: 7,
      hook: 'Claude made vibes-based pattern claims. Eugeen could not measure whether they were right.',
      before: 'Pattern claims were unfalsifiable. "Based on past sessions, you tend to..." with no audit trail.',
      aha: 'Compress operator profile to ~5KB. Run a synthesizer + verifier daemon nightly. Self-disable below 60% accuracy.',
      after: 'Predictions DB plus three launchd daemons (synthesizer 02:23, verifier 02:33, monthly audit). Pattern accuracy is now a number.',
      efficiency: 'Vibes-based pattern claims: from ungovernable to measurable.',
      foundation: 'Made future agents bootable from a 5KB profile instead of 100KB cold-start.',
    },
    22,
  ),

  withPack(
    regular(
      {
        id: 'reconciler-engine',
        title: 'Task reconciler (close from meeting transcripts)',
        sessionShipped: 'S194',
        dateShipped: '2026-04-30',
        score: 7,
        category: 'automation',
        hook: 'Tasks marked open for weeks while they were already closed in meeting notes.',
        before: 'Manual reconciliation. Task list drifted from reality. "Open" lost meaning.',
        aha: 'Scan meeting transcripts and session logs against open tasks. Stage closure proposals. Eugeen approves via Telegram.',
        after: '/task-reconciler skill plus Closure Candidates DB. Never auto-closes. Always Eugeen approval.',
        efficiency: 'Task list freshness: ~2 weeks lag to under 24h.',
        foundation: 'Pattern for any future "scan signals plus stage proposals plus human approval" workflow.',
      },
      23,
    ),
    'pow-01-task-reconciler',
    'power',
    90,
  ),

  regular(
    {
      id: 'multi-model-jury',
      title: 'Multi-model jury (GPT-5 critic on high-stakes outputs)',
      sessionShipped: 'S195',
      dateShipped: '2026-05-02',
      category: 'automation',
      score: 6,
      hook: 'High-stakes outputs (predictions, contracts) had no second opinion. Single-model risk.',
      before: 'Predictions engine and output-validator were both Claude. Echo chamber risk on novel claims.',
      aha: 'Route high-stakes outputs through GPT-5 as a critic. AGREE or HOLD on MAJOR_DISAGREE.',
      after: 'OpenAI MCP plus $20/mo cap. Diff surfaces to Telegram on disagreement. Logged to Insights DB.',
      efficiency: 'False-positive predictions caught before user delivery: ~2 per week.',
      foundation: 'Defense in depth on the highest-stakes surface.',
    },
    24,
  ),

  withPack(
    regular(
      {
        id: 'sprint-architecture-r055',
        title: 'R055 sprint architecture (this build)',
        sessionShipped: 'S197',
        dateShipped: '2026-05-07',
        score: 9,
        category: 'architecture',
        hook: 'Single-tab builds maxed out. 4-hour deliverables left context exhausted, output mediocre.',
        before: 'Linear sequential builds. One Claude doing everything. Context rotted by hour 3.',
        aha: 'Spawn N parallel tabs via tmux. Each gets fresh context, a budget cap, a phase prompt, an output spec.',
        after: 'MASTER_PLAN.md plus runner scripts plus chained phase prompts plus QC phases plus auto-merge gate. 9-tab overnight builds.',
        efficiency: 'Wall-clock for studio-grade visual deliverable: ~12h sequential to ~3h parallel.',
        foundation: 'This Empire wireframe was built on it. So was the Scrolophyte sprint.',
      },
      25,
    ),
    'pow-02-sprint-architecture',
    'power',
    120,
  ),

  regular(
    {
      id: 'context7-pre-code',
      title: 'Context7 PreToolUse + import-disclosure enforcement',
      sessionShipped: 'S196',
      dateShipped: '2026-05-04',
      category: 'rule',
      score: 5,
      hook: 'A late-night build introduced a dep that broke prod next morning.',
      before: 'External imports landed silently in overnight builds. Version drift not caught until deploy.',
      aha: 'PreToolUse hook on every code Write/Edit blocks imports without a Context7 disclosure line.',
      after: 'Hook at ~/.claude/hooks/context7-pre-code.sh. Stdlib + relative + already-in-project carve-outs. Exit 2 blocks.',
      efficiency: 'Surprise dep adds in overnight builds: from ~monthly to zero.',
      foundation: 'Hardened R055 sprints against the model smuggling in a library.',
    },
    26,
  ),

  // ===========================================================================
  // CHAPTER 5: THE EMPIRE SURFACE (items 27 to 30)
  // ===========================================================================

  withChapter(
    asBigMoment(
      regular(
        {
          id: 'voice-r047',
          title: 'World-class expert voice (R047, Hard Rule #33)',
          sessionShipped: 'S196',
          dateShipped: '2026-05-04',
          score: 8,
          category: 'rule',
          hook: 'Claude opened with "Great question!" on a contract review. Eugeen winced.',
          before: 'Default voice was sycophant. Pre-answer praise, no counterargument, no confidence stamps.',
          aha: 'Lead with the strongest counter to the user position. Stamp confidence on every claim. Generate own numbers before anchoring.',
          after: 'Hard Rule #33 plus banned-opener list plus banned-closer list plus confidence-stamp requirement. Voice is the master contract.',
          efficiency: 'Capitulation incidents on push-back without new evidence: from ~weekly to zero.',
          foundation: 'Made the system ship adversarial reviews instead of validation theatre.',
          enables: [],
          enabledBy: ['hard-rule-architecture'],
        },
        27,
      ),
    ),
    TREATMENT_D_CHAPTERS[4].title,
  ),

  withPack(
    regular(
      {
        id: 'r053-visual-triage',
        title: 'R053 Visual Triage (extend before scaffold)',
        sessionShipped: 'S197',
        dateShipped: '2026-05-06',
        category: 'rule',
        score: 6,
        hook: 'Claude scaffolded a fresh visual when an existing pack covered 80% of the brief.',
        before: 'Default behavior was to scaffold new. Component reuse was accidental.',
        aha: 'Before scaffolding any visual deliverable, scan existing packs. 60% match = extend. Miss = scaffold.',
        after: 'R053 with mandatory triage stamp emitted before first scaffold tool call.',
        efficiency: 'Duplicate visual scaffolds: ~2 per week to under 1 per month.',
        foundation: 'Made the visual stack a real library instead of a graveyard of one-offs.',
      },
      28,
    ),
    'pow-03-visual-triage',
    'power',
    35,
  ),

  withPack(
    regular(
      {
        id: 'scrolophyte-empire-wireframe',
        title: 'Empire Wireframe Scrolophyte (this scroll)',
        sessionShipped: 'S198',
        dateShipped: '2026-05-08',
        score: 8,
        category: 'vibes',
        hook: 'Eugeen wanted to share what he built without writing 30 LinkedIn posts.',
        before: 'No surface to publish "what I learned" in a way that was browseable, downloadable, and credible.',
        aha: 'Long-scroll narrative plus 16 installable packs plus public GitHub equals proof.',
        after: 'Four treatment variants, 30-item chronology, 16 packs, GitHub release. This page is the proof.',
        efficiency: 'Story-to-proof distance: from "trust me" to "git clone".',
        foundation: 'The empire surface. Every later AI Authority artifact links here.',
      },
      29,
    ),
    'pow-04-scrolophyte',
    'power',
    180,
  ),

  regular(
    {
      id: 'next-empire-loop',
      title: 'Next loop (HoistOS users boot from a 5KB profile)',
      sessionShipped: 'S198',
      dateShipped: '2026-05-08',
      category: 'vibes',
      score: 5,
      hook: 'If 30 aha moments compress to a 5KB profile, the next operator skips the 6 months of cold-start.',
      before: 'Every new operator (HoistOS user, Ana MVP, future hire) reboots from zero.',
      aha: 'The Predictions Engine 5KB profile is the boot disk for the next brain. The loop closes here.',
      after: 'Open question for S199. The empire surface (this scroll) is the input. The 5KB profile is the output.',
      efficiency: 'Predicted: new operator cold-start from ~6 months to ~1 hour.',
      foundation: 'The next chapter that has not been written yet.',
    },
    30,
  ),
]

// ---------------------------------------------------------------------------
// Sanity assertions (run only in dev). These catch mock-data drift early.
// Treatment D depends on EXACTLY 30 items, EXACTLY 5 big moments,
// EXACTLY 16 with hasPack=true.
// ---------------------------------------------------------------------------

if (import.meta.env?.DEV) {
  const total = TIMELINE_D_MOCK.length
  const bigCount = TIMELINE_D_MOCK.filter((m) => m.isBigMoment).length
  const packCount = TIMELINE_D_MOCK.filter((m) => m.hasPack).length
  const chapterCount = TIMELINE_D_MOCK.filter((m) => m.chapterBreakBeforeThis).length

  if (total !== 30) {
    // eslint-disable-next-line no-console
    console.warn(`[timeline-d-mock] expected 30 items, got ${total}`)
  }
  if (bigCount !== 5) {
    // eslint-disable-next-line no-console
    console.warn(`[timeline-d-mock] expected 5 big moments, got ${bigCount}`)
  }
  if (packCount !== 16) {
    // eslint-disable-next-line no-console
    console.warn(`[timeline-d-mock] expected 16 packs, got ${packCount}`)
  }
  if (chapterCount !== 5) {
    // eslint-disable-next-line no-console
    console.warn(`[timeline-d-mock] expected 5 chapter breaks, got ${chapterCount}`)
  }
}
