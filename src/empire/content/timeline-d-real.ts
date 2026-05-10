/**
 * Treatment D REAL data: 30 chronological aha-moment items.
 *
 * Source: A4 + A5 + A6 mining JSONs merged by E-merge (S198 Scrolophyte).
 * Replaces timeline-d-mock.ts.
 *
 * Composition:
 *   - 6 BIG moments (chapter breaks) matching Eugeen's spine:
 *     1. chat to Cowork (A4-003, item 2)
 *     2. Cowork takes control of computer (A4-006, item 3)
 *     3. skills compounding (A4-008, item 4)
 *     4. memory was the bottleneck (L01, item 22)
 *     5. move to Code (L03, item 24)
 *     6. autonomous loops shipped (L05, item 26)
 *   - 16 with hasPack=true mapped to B3-{beg,mid,adv,pow} outputs
 *   - 14 narrative-only
 *
 * Distribution: A4 9 items, A5 10 items, synthetic 1, A6 10 items.
 *
 * Hard Rule #11: zero em dashes, zero en dashes.
 * Hard Rule #30: foundation cited per moment.
 */

import type { AhaMoment } from './types'

// ---------------------------------------------------------------------------
// Chapter scaffolding. 6 chapters break the 30-item scroll into thematic arcs.
// ---------------------------------------------------------------------------

export const TREATMENT_D_CHAPTERS = [
  {
    id: 'ch-1-foundation',
    title: 'Chapter 1. Before persistence',
    subtitle: 'ChatGPT was the fast lane. Claude was the curiosity.',
    startsAtItemNumber: 1,
  },
  {
    id: 'ch-2-projects',
    title: 'Chapter 2. The first thread that survived',
    subtitle: 'Cowork, Projects, pinned context.',
    startsAtItemNumber: 2,
  },
  {
    id: 'ch-3-cowork-acts',
    title: 'Chapter 3. The day Cowork could touch the computer',
    subtitle: 'Files, browsers, forms.',
    startsAtItemNumber: 3,
  },
  {
    id: 'ch-4-skills',
    title: 'Chapter 4. Skills, scheduled tasks, and the compounding loop',
    subtitle: 'Build it twice, codify it.',
    startsAtItemNumber: 4,
  },
  {
    id: 'ch-5-bottleneck',
    title: 'Chapter 5. Memory was the bottleneck',
    subtitle: 'Cold-start, one brain, the gates.',
    startsAtItemNumber: 22,
  },
  {
    id: 'ch-6-code-and-autonomy',
    title: 'Chapter 6. Move to Code, run while sleeping',
    subtitle: 'Bernie, parallel sprints, the empire surface.',
    startsAtItemNumber: 24,
  },
] as const

export interface MilestoneDepth {
  /** 4 to 6 sentence narrative: trigger, what was tried before, the click moment, the catalyst. */
  howWeGotThere: string
  /** 2 to 3 sentence forward-link: which subsequent milestones built on this one. */
  howThisCompounds: string
  /** 3 to 5 concrete steps a VP would actually follow to install + activate. */
  howToImplement: string[]
  /** 2 to 3 sentence strategic frame: why a VP should care, what business outcome this enables. */
  whyThisMatters: string
  /** Item numbers a VP should grok first. */
  prerequisites: number[]
  /** Item numbers that cross-link with this one on the timeline. */
  relatedMilestones: number[]
}

export interface TimelineDMoment extends AhaMoment {
  itemNumber: number
  isBigMoment: boolean
  hasPack: boolean
  /** G4 Phase 1 (S198 morning, 2026-05-08): expand-on-click depth payload. */
  depth?: MilestoneDepth
}

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
  return { ...item, hasPack: true, packSlug, packTier, estimatedActivationMinutes }
}

function asBigMoment(item: TimelineDMoment): TimelineDMoment {
  return { ...item, isBigMoment: true }
}

function withChapter(item: TimelineDMoment, chapterTitle: string): TimelineDMoment {
  return { ...item, chapterBreakBeforeThis: true, chapterTitle }
}

// ---------------------------------------------------------------------------
// 30-item chronological data, sourced from A4 + A5 + A6 mining outputs.
// ---------------------------------------------------------------------------

const _TIMELINE_D_BASE: TimelineDMoment[] = [
  // ITEM 1, A4-001, narrative
  withChapter(
    regular(
      {
        id: 'chatgpt-was-the-fast-lane',
        title: 'ChatGPT was the fast lane and it was enough until it was not',
        sessionShipped: 'pre-Claude',
        dateShipped: '2026-01-15',
        category: 'vibes',
        score: 4,
        hook: 'Running Perennial Empire from a phone and a laptop with a newborn at home, AI was just a search engine with personality.',
        before: 'ChatGPT was the daily fast lane. Custom instructions covered identity. Each session forgot what the last one knew. Anything strategic, Eugeen rebuilt context every time.',
        aha: 'Speed without persistence is not building anything. The ceiling shows up the moment a real Perennial deliverable needs depth.',
        after: 'Eugeen kept ChatGPT for quick lookups but started feeling the wall on long-form work.',
        efficiency: 'Pre-Claude baseline: every long task burned 15 to 20 minutes of context paste before any output landed.',
        foundation: 'The pain that made the Claude switch obvious one month later.',
      },
      1,
    ),
    'Chapter 1. Before persistence',
  ),

  // ITEM 2, A4-003, BIG, hasPack beg-01
  withChapter(
    asBigMoment(
      withPack(
        regular(
          {
            id: 'cowork-projects-pinned-context',
            title: 'Cowork, Projects, and pinned context for the first time',
            sessionShipped: 'S62',
            dateShipped: '2026-02-28',
            category: 'architecture',
            score: 9,
            hook: 'Someone showed Eugeen that claude.ai had this thing called Projects: pinned files, custom instructions per project.',
            before: 'Every session was a cold start, paste the same context every time. Six different worlds (Personal, Perennial, AI Authority, AI Systems, OS Build, Health) all collided in one chat.',
            aha: 'Persistent context per project is the cheapest version of memory you can ship. The first time Claude opened with the world already loaded, it stopped being a search engine.',
            after: 'Six Cowork Projects, each with pinned Master Context, Decision Log, and per-project instructions. Claude knew the Director, knew the largest active project, knew the family context.',
            efficiency: 'Re-explanation per session: every prompt to never. Identity, family, project context all preloaded.',
            foundation: 'Made every later layer worth investing in. If the model forgot Eugeen every session, none of this gets built.',
            enables: ['four-layer-context', 'desktop-three-sweep-audit'],
          },
          2,
        ),
        'beg-01-chat-to-projects',
        'beginner',
        12,
      ),
    ),
    'Chapter 2. The first thread that survived',
  ),

  // ITEM 3, A4-006, BIG, hasPack beg-02
  withChapter(
    asBigMoment(
      withPack(
        regular(
          {
            id: 'desktop-three-sweep-audit',
            title: 'Cowork could organize the desktop, the three-sweep audit',
            sessionShipped: 'S65',
            dateShipped: '2026-03-09',
            category: 'automation',
            score: 9,
            hook: 'AI Architecture had grown to 128 files. Duplicates everywhere. Six versions of the OCM SOP with no clear authority.',
            before: 'Claude wrote things for Eugeen. Files lived in folders Claude could not touch. Cleanup was a manual evening every other week.',
            aha: 'Claude was not just a writing partner. It could operate on the filesystem at scale and produce a measurable rating that improves over time.',
            after: 'Three consecutive sweeps in one extended session. 128 files at 8.5 score went to 111 files at 9.2. Routing tables synced, six SOP versions consolidated to two.',
            efficiency: 'Filesystem audit: from a manual two-hour evening to a graded session that ends with a number.',
            foundation: 'The pattern that became Memory Architect skill, then the Architecture Benchmark skill, then every Notion DB audit.',
            enables: ['memory-architect-first-skill'],
            enabledBy: ['cowork-projects-pinned-context'],
          },
          3,
        ),
        'beg-02-desktop-organizer',
        'beginner',
        15,
      ),
    ),
    'Chapter 3. The day Cowork could touch the computer',
  ),

  // ITEM 4, A4-008, BIG, hasPack beg-04
  withChapter(
    asBigMoment(
      withPack(
        regular(
          {
            id: 'memory-architect-first-skill',
            title: 'First skill ever: Memory Architect',
            sessionShipped: 'S68',
            dateShipped: '2026-03-10',
            category: 'skill',
            score: 10,
            hook: 'After three manual audits, Eugeen asked the question that changed everything: how do I make this run while I sleep?',
            before: 'Every audit was a manual session. Implicit knowledge stayed implicit. The same instructions had to be retyped each time.',
            aha: 'A skill is just a versioned, triggered, evaluatable prompt with structured I/O. Codifying the audit taught more about what mattered than running the audit had.',
            after: 'memory-architect.skill installed in Cowork. Two modes (deep + quick), six safety rails (backup before delete, version before edit, log everything, never modify outside workspace, max 50 percent compression, preserve voice). Self-rates on 10 dimensions until 9.5+ or three sweeps complete.',
            efficiency: 'Manual audit (3 hours) became scheduled skill (zero touch).',
            foundation: 'First proof that skills, not files, are the unit of progress. Direct ancestor of every skill that came after.',
            enables: ['three-skills-pattern', 'cold-start-one-brain-gate'],
            enabledBy: ['desktop-three-sweep-audit'],
          },
          4,
        ),
        'beg-04-first-skill-bootstrap',
        'beginner',
        20,
      ),
    ),
    'Chapter 4. Skills, scheduled tasks, and the compounding loop',
  ),

  // ITEM 5, A4-009, narrative
  regular(
    {
      id: 'first-scheduled-task-2am',
      title: 'First scheduled task: monthly memory audit at 2 AM',
      sessionShipped: 'S68',
      dateShipped: '2026-03-10',
      category: 'automation',
      score: 7,
      hook: 'Right after Memory Architect shipped, Eugeen wrote a scheduled trigger: 2 AM, the 5th of every month.',
      before: 'The system needed Eugeen to be alive to maintain itself.',
      aha: 'The first time Eugeen ever wrote infrastructure that ran without him. Not a chatbot, not a document generator, an autonomous maintenance system.',
      after: 'Cowork scheduled task fires at 02:00 ET on the 5th. First run April 5, 2026.',
      efficiency: 'Eugeen sleeps. The architecture audits itself.',
      foundation: 'The bridge from "I use AI well" to "I have built AI systems that maintain themselves." Predecessor to Bernie launchd daemons.',
      enabledBy: ['memory-architect-first-skill'],
    },
    5,
  ),

  // ITEM 6, A4-010, narrative
  regular(
    {
      id: 'cowork-browser-linkedin-day',
      title: 'Cowork could browse the internet and fill forms, LinkedIn Day',
      sessionShipped: 'S68',
      dateShipped: '2026-03-10',
      category: 'automation',
      score: 8,
      hook: 'Eugeen had to optimize his LinkedIn profile end to end: headline, About, Post 1, all five experience descriptions.',
      before: 'AI wrote the words. Eugeen clicked the buttons. Old workflow was 20 copy-pastes into the LinkedIn editor.',
      aha: 'AI wrote the words AND clicked the buttons. The ceiling on what AI could do moved to "anything a human can click."',
      after: 'Cowork opened Chrome, navigated to edit forms, called form_input on textareas, fired JavaScript click on Save. Five experience entries shipped to live LinkedIn with no manual paste.',
      efficiency: 'LinkedIn re-optimization: 90 minutes of paste-and-click to 12 minutes of supervision.',
      foundation: 'First proof that browser automation was production-ready in Cowork. The pattern (URL navigate, form_input, JS click, repeat) became the 4-step workaround for every chrome extension conflict.',
      enabledBy: ['cowork-projects-pinned-context'],
    },
    6,
  ),

  // ITEM 7, A4-012, hasPack mid-04
  withPack(
    regular(
      {
        id: 'tfidf-search-zero-deps',
        title: 'TF-IDF search engine from scratch with zero dependencies',
        sessionShipped: 'S70',
        dateShipped: '2026-03-11',
        category: 'automation',
        score: 8,
        hook: 'Knowledge retrieval scored 5.5 out of 10. Claude was guessing which file to read.',
        before: 'No Supabase, no embeddings API, no infrastructure people say is required for RAG. Hit rate under 30 percent.',
        aha: 'Do not wait for perfect infrastructure. Ship the 80 percent solution now. The zero-dollar version solves the problem for nine months while you decide if you ever need the paid one.',
        after: 'Pure-Python TF-IDF: inverted index, cosine similarity, smart boosts (filename 1.3x, header 1.2x, recency 1.1x). 85 files indexed in seconds. 2.8 megabytes total, zero monthly cost.',
        efficiency: 'Knowledge-search hit rate: 30 percent to ~75 percent on real queries. Bridge to full RAG nine months ahead of when it actually shipped.',
        foundation: 'Direct ancestor of the Knowledge Search skill, then pgvector + Cohere Rerank, then the eugeen-rag MCP.',
        enabledBy: ['memory-architect-first-skill'],
      },
      7,
    ),
    'mid-04-knowledge-search',
    'intermediate',
    25,
  ),

  // ITEM 8, A4-013, hasPack adv-04
  withPack(
    regular(
      {
        id: 'three-skills-pattern',
        title: 'Three skills shipped same session, the build-twice-codify pattern locks in',
        sessionShipped: 'S70',
        dateShipped: '2026-03-11',
        category: 'skill',
        score: 9,
        hook: 'Eugeen had codified the Memory Architect, the Architecture Benchmark methodology, and the TF-IDF search in a single session.',
        before: 'One skill in the system. Same problem solved three different ways across three sessions.',
        aha: 'Anything built once and used twice becomes a skill. Manual to codified to scheduled. That is the maturity ladder. Once you see it, you cannot stop making them.',
        after: 'Three skills in the system: Memory Architect, Architecture Benchmark, Knowledge Search. The pattern was now explicit and repeatable.',
        efficiency: 'Skill count: 1 to 3 in one session. Trajectory locked at "every recurring task gets a skill."',
        foundation: 'The skill-creator-meta substrate that grew to 45+ skills, and the foundation for the /skill-creator skill that bootstraps new skills from a 3-question interview.',
        enables: ['email-playbook-tier-aware', 'expense-automation-end-to-end'],
        enabledBy: ['memory-architect-first-skill'],
      },
      8,
    ),
    'adv-04-skill-creator-meta',
    'advanced',
    35,
  ),

  // ITEM 9, A4-015, narrative
  regular(
    {
      id: 'sent-emails-voice-fingerprint',
      title: 'Six months of sent emails, the voice fingerprint',
      sessionShipped: 'S72',
      dateShipped: '2026-03-12',
      category: 'vibes',
      score: 7,
      hook: 'Every Claude draft sounded like Claude wearing Eugeen\'s name tag, not Eugeen.',
      before: 'Eugeen hand-edited every email draft. Tone, register, signature, opener, closer. 200+ emails of friction.',
      aha: 'Voice is data. If you have 200 sent emails, you have a fingerprint, and Claude can match it. Most people are still hand-crafting prompts that say "be professional" instead.',
      after: 'Six months of sent emails (Sep 2025 to March 2026, ~200 messages) dumped into Cowork. Claude extracted signature rules, tier-aware register, banned openers, banned closers. Compiled to Email Playbook v1.',
      efficiency: 'Hand-edit per draft: every email to ~zero. Voice match accuracy: subjective but Eugeen stopped catching mismatches by the third week.',
      foundation: 'Email Playbook v1 became the source of truth for every email Claude drafts. Hardened later as Hard Rule #34 with PreToolUse hook blocking violations at draft time.',
      enables: ['email-playbook-tier-aware'],
    },
    9,
  ),

  // ITEM 10, A5-mid-06, hasPack mid-03
  withPack(
    regular(
      {
        id: 'daily-briefing-consolidation',
        title: 'Four daily scheduled tasks consolidate to one morning brief',
        sessionShipped: 'S57',
        dateShipped: '2026-03-29',
        category: 'automation',
        score: 7,
        hook: 'Daily Briefings folder kept growing: foundation health check, context staleness check, daily Email Intelligence, separate morning briefing. Four scheduled tasks, four file outputs, no human-readable summary.',
        before: 'Each daily check fired independently. Output landed in folders no one read. Weekly synthesis was the only thing Eugeen actually opened.',
        aha: 'The scheduler is not the deliverable. Consolidate four daily tasks into one morning brief that triages and surfaces only what needs Eugeen. Archive the rest.',
        after: 'Daily Briefings folder archived. Morning briefing task triages email + calendar + tasks + health checks into a single triaged surface. One scheduled task replaces four.',
        efficiency: 'Daily file writes: 4 to 0. Morning attention: 12 minutes of file-skim to 3 minutes of triage.',
        foundation: 'First example of "collapse the scheduler before you collapse the brain." Pattern reused in Bernie Morning Brief Fix Wave (S165) and the predictions accuracy_audit pre-first-fire suppression.',
      },
      10,
    ),
    'mid-03-daily-briefing',
    'intermediate',
    30,
  ),

  // ITEM 11, A5-mid-04, hasPack mid-01
  withPack(
    regular(
      {
        id: 'email-playbook-tier-aware',
        title: 'Email Playbook tier-aware: HTML for structured, plain for replies',
        sessionShipped: 'S67',
        dateShipped: '2026-03-30',
        category: 'rule',
        score: 8,
        hook: 'A structured email to a peer COO at a JV partner had its formatting fight the message. Plain text was suppressing signal on high-stakes outbound.',
        before: 'email-drafter produced one shape: plain-text. Brand styling, dividers, tables only existed in static deliverables, not in email.',
        aha: 'Tier the email format on audience and message shape. Short replies stay plain. Anything with sections, data, or executive recipients gets HTML with Perennial brand styling.',
        after: 'HTML email standard ratified. Email Playbook Section 7 added. email-drafter selects format by audience tier. Hardened later into Hard Rule #34 with PreToolUse hook.',
        efficiency: 'GC and admin emails went from looking like one-liners to looking like the company they came from. No human re-format step.',
        foundation: 'First time a skill made a format decision based on a tier, not a flag. Pattern reused in audit dispatcher (mode flag), notion-write-gate (read-after-write tier), multi-model jury (high-stakes-only).',
        enabledBy: ['sent-emails-voice-fingerprint'],
      },
      11,
    ),
    'mid-01-email-playbook-tier-aware',
    'intermediate',
    25,
  ),

  // ITEM 12, A5-mid-02, hasPack adv-01
  withPack(
    regular(
      {
        id: 'light-proposal-fork',
        title: 'Two-tier proposal system: light forks from heavy',
        sessionShipped: 'S75',
        dateShipped: '2026-04-01',
        category: 'skill',
        score: 8,
        hook: 'Heavy proposal-builder was overkill for change orders. Existing-client COs were getting the same 12-section treatment as $20M new-client bids.',
        before: 'Single proposal-builder skill, one shape. CO #10 took the same multi-option process as a stranger pursuit.',
        aha: 'Fork the skill on use case, not on size. New clients use heavy. Existing clients use light. Both share Fortune 500 Clean design tokens so the brand stays one brand.',
        after: 'light-proposal skill shipped. Triggers on change order, CO, "price this change", "extra work". Heavy and light are siblings, not versions.',
        efficiency: 'CO turnaround: hours to minutes. BD team can issue a CO without Eugeen.',
        foundation: 'Proves one skill can spawn a sibling without forking the brand. Same pattern later applied to email-drafter (replies vs cold outreach) and the audit dispatcher (smoke vs deep vs notion vs filesystem).',
        enabledBy: ['three-skills-pattern'],
      },
      12,
    ),
    'adv-01-proposal-builder',
    'advanced',
    40,
  ),

  // ITEM 13, A5-mid-01, narrative
  regular(
    {
      id: 'gp-tracker-from-bailey-ave',
      title: 'GP Tracker skill: a unit-based job becomes the engine',
      sessionShipped: 'S79',
      dateShipped: '2026-04-02',
      category: 'skill',
      score: 7,
      hook: 'A VP Construction adopted the per-apartment GP tracker the same day Eugeen handed it over.',
      before: 'Every project tracker was a custom Excel build. Cross-project reuse was zero.',
      aha: 'Generalize the shape, not the file. Pull rates into Config, parameterize per-unit pricing, ship a config-driven skill that scales from a small CO to a multi-million-dollar job without rewriting formulas.',
      after: 'GP Tracker skill installed. Triggers on "GP tracker", "unit tracker", "apartment tracker". One unit-based job was the seed; the skill is the multiplier.',
      efficiency: 'Tracker spin-up: from rebuild every quarter to invoke once per project.',
      foundation: 'Established the pattern Eugeen uses for the next twelve skills: ship the generic engine the first time you have to repeat yourself.',
      enabledBy: ['three-skills-pattern'],
    },
    13,
  ),

  // ITEM 14, A5-mid-07, hasPack adv-02
  withPack(
    regular(
      {
        id: 'meeting-intelligence-db',
        title: 'Meeting Intelligence: flat folder to Notion DB to processor skill',
        sessionShipped: 'S83',
        dateShipped: '2026-04-02',
        category: 'architecture',
        score: 8,
        hook: 'Zoom Notes was a flat folder of transcripts. Decisions, attendees, action items, and project links lived as text inside files. Cross-meeting search was grep.',
        before: 'Flat folder, no structured attendees, no project link, no action item extraction. Meetings disappeared and reappeared only when Eugeen remembered the date.',
        aha: 'Treat meetings as an entity type. Notion DB with 11 properties, 5 views, meeting-processor skill for tagging, scheduled poll every 30 minutes. Three-tier extraction protocol governs all future processing.',
        after: 'Meeting Intelligence DB shipped. meeting-processor skill triggers on recording arrival, populates Linked Attendees + Linked Project. Direct ancestor of Tier 0 multi-signal scorer (S138) and task-reconciler.',
        efficiency: '"Meetings with Steve Hultgren" became a Notion view, not a grep across 200 transcripts.',
        foundation: 'Established the "flat folder to entity DB to processor skill" pattern. Reused for People, Projects, Companies, Operations Library, Skills Registry, Closure Candidates.',
      },
      14,
    ),
    'adv-02-meeting-to-tasks',
    'advanced',
    45,
  ),

  // ITEM 15, A4-016, narrative
  regular(
    {
      id: 'april-5-first-autonomous-run',
      title: 'April 5 at 2 AM: the first scheduled task fired while Eugeen slept',
      sessionShipped: 'S94',
      dateShipped: '2026-04-05',
      category: 'automation',
      score: 7,
      hook: 'The monthly-memory-audit task written on March 10 had its first scheduled run.',
      before: 'The system worked when Eugeen worked.',
      aha: 'Holding the line at 2 AM, every month, forever, no human in the loop. AI assistant became AI infrastructure.',
      after: 'Three sweeps across 127 active files and 12 core context files. Sweep 1 moved S84 checkpoint to Audits, synced 3 duplicate skill folders, copied Notion migration artifacts to Archive. Sweep 2 audited all 12 context files. Sweep 3 self-rated 8.28 weighted (down from 9.32, honestly accumulated temp clutter).',
      efficiency: 'First proof of compounding: Eugeen woke up to a self-generated audit report.',
      foundation: 'Proved the autonomous-loop pattern at zero human attention. Direct precondition for the wider parallel-overnight pattern (L05) one month later.',
      enabledBy: ['first-scheduled-task-2am'],
    },
    15,
  ),

  // ITEM 16, A5-mid-12, narrative
  regular(
    {
      id: 'cross-platform-protocol',
      title: 'Cross-Platform Protocol: Bernie + Cowork share the correction bus',
      sessionShipped: 'S102',
      dateShipped: '2026-04-06',
      category: 'rule',
      score: 7,
      hook: 'Bernie (OpenClaw stack at the time) and Cowork were drifting. Different routing rules. Different MEMORY.md states. Same name, two brains.',
      before: 'Each platform had its own context files, own auto-memory, own task IDs. Corrections learned on Cowork did not propagate to Bernie.',
      aha: 'Three shared Global files (Skill Intelligence, Platform Capability Map, Cross-Platform Protocol). Decision Log becomes the cross-platform correction bus. Bernie is now a co-worker, not a clone.',
      after: '20 Bernie files audited and consistent. Memory sync protocol live. Direct precondition for the Bernie Migration to Claude Code CLI on 2026-04-22.',
      efficiency: 'Cross-platform corrections: from "told one, the other forgets" to "told one, both reflect within the cycle."',
      foundation: 'First time "two brains share state" had a protocol. Set the model for iCloud-shared Bernie Auto Memory and the One-Brain Gate System.',
    },
    16,
  ),

  // ITEM 17, A5-mid-05, hasPack mid-02
  withPack(
    regular(
      {
        id: 'expense-automation-end-to-end',
        title: 'Expense automation: AMEX statement to 4Empire to GL codes, end-to-end',
        sessionShipped: 'S111',
        dateShipped: '2026-04-07',
        category: 'automation',
        score: 9,
        hook: 'Six expense-coding rules were locked from S46. 4Empire form selectors were known. The rules existed; the labor did not.',
        before: 'Monthly cycle of 2 to 3 hours: find Jonel\'s statement email, extract PDF, parse line items, scan two Gmail accounts for receipts, assign GL codes, build reconciliation Excel, manually enter codes into 4Empire web form for thirty-plus expenses, bundle receipts.',
        aha: 'All seven steps are mechanizable. The skill is the supervisor, not the data entry clerk. Five MCP servers (Gmail, Drive, Chrome, file system, Notion) string into one trigger.',
        after: 'expense-reconciliation skill installed. Triggers: expenses, AMEX, 4E, Jonel, expense receipts, GL codes. End-to-end automation with browser-driven 4Empire entry.',
        efficiency: 'Hours per month to minutes of supervision per month. Eugeen cited this as one of his big aha moments.',
        foundation: 'First skill that strung together five MCP servers in one trigger. Proof that the unit of work is the trigger, not the tool. Set the pattern for task-reconciler (S138) and the audit dispatcher.',
        enabledBy: ['three-skills-pattern'],
      },
      17,
    ),
    'mid-02-expense-automation',
    'intermediate',
    45,
  ),

  // ITEM 18, synthetic, hasPack beg-03
  withPack(
    regular(
      {
        id: 'voice-to-telegram-task',
        title: 'Voice notes via Telegram became Notion tasks',
        sessionShipped: 'S116',
        dateShipped: '2026-04-09',
        category: 'automation',
        score: 6,
        hook: 'Eugeen needed to capture tasks while driving without unlocking the phone or stopping the call.',
        before: 'Voice memos sat in iOS Notes. They never made it into Task Commander. Half the field captures evaporated by Friday.',
        aha: 'Telegram voice + Whisper transcript + Notion MCP turns a 30-second voice note into a structured task in under 10 seconds. Bernie becomes Eugeen\'s hands while he is off-machine.',
        after: 'Bernie Telegram voice ingest live. Trigger phrase plus voice note becomes a Notion Task Commander row with project relation, owner, and Acceptance Criteria stub.',
        efficiency: 'Task capture latency: from "next time at desk" to "before the call ends."',
        foundation: 'First time Bernie was Eugeen\'s second pair of hands while driving. Bridges to the full Bernie Migration two weeks later.',
      },
      18,
    ),
    'beg-03-voice-to-task',
    'beginner',
    18,
  ),

  // ITEM 19, A5-mid-08, hasPack adv-03
  withPack(
    regular(
      {
        id: 'three-skill-drift-cluster',
        title: 'Three-skill drift cluster: output-validator + memory-propagator + notion-query',
        sessionShipped: 'S127',
        dateShipped: '2026-04-15',
        category: 'rule',
        score: 9,
        hook: 'The hallucinated-name incident: a fabricated person name landed in a deliverable. Identity drift was no longer a future risk, it was a shipped artifact.',
        before: 'Cold-start was advisory. Person names were honor-system. Mid-session memory writes had no protocol. Pre-delivery validation was "Eugeen catches it."',
        aha: 'Three skills, one cluster, one purpose: stop drift at the surface where it appears. output-validator runs a 7-check pre-delivery gate. memory-propagator captures correction triggers. notion-query collapses 9 lookup recipes into one trigger.',
        after: 'All three skills shipped. Constitution v2.4 ratified Hard Rule #17 (People DB grounding) + Session Hygiene + Mid-Session Memory Triggers in the same session. The hallucinated-name class became structurally impossible.',
        efficiency: 'Identity drift at the surface: dropped to near-zero. Mid-session memory writes: deterministic. Notion lookups: one trigger.',
        foundation: 'The first cluster moment. After this, skills came in clusters that cover one drift surface, not in singletons. Direct ancestor of the One-Brain Gate System (S140) and notion-write-gate (S140).',
        enables: ['cold-start-one-brain-gate'],
      },
      19,
    ),
    'adv-03-contract-review',
    'advanced',
    35,
  ),

  // ITEM 20, A5-mid-11, hasPack pow-02
  withPack(
    regular(
      {
        id: 'rag-pgvector-substrate',
        title: 'RAG prep + Procedure Library refactor, the memory substrate',
        sessionShipped: 'S131',
        dateShipped: '2026-04-16',
        category: 'architecture',
        score: 10,
        hook: 'Decision Log was 1700+ lines of markdown. Cross-session continuity was "grep and pray." Cold-start could only carry ~5 files.',
        before: 'Auto-memory existed. Decision Log existed. Wikis existed. None of them were queryable as a corpus.',
        aha: 'The bottleneck is not memory volume, it is memory addressability. Build a vector substrate over the workspace: Voyage 3 large embeddings, Cohere Rerank 3, Supabase pgvector, custom FastMCP server on a Mac mini.',
        after: 'RAG prep work landed S131. Procedure Library refactored into structured chunks ready for embedding. eugeen-rag-mcp shipped. UserPromptSubmit hook fires source-sweep on factual queries.',
        efficiency: 'Decision Log queryable in 200 ms. Wikis raw + compiled corpus auto-ingested nightly. Cold-start Phase 16 surfaces top-3 wiki articles by query embedding.',
        foundation: 'Named the substrate every later layer reaches into: cold-start-verify, output-validator, multi-model jury, predictions engine, sleep consolidator.',
        enables: ['cold-start-one-brain-gate', 'sleep-consolidator-multi-model-jury'],
      },
      20,
    ),
    'pow-02-rag-knowledge-search',
    'power',
    60,
  ),

  // ITEM 21, A5-mid-15, narrative
  regular(
    {
      id: 'task-reconciler-tier-zero',
      title: 'Task Reconciler: Tier 0 multi-signal scorer closes meetings into tasks',
      sessionShipped: 'S138',
      dateShipped: '2026-04-18',
      category: 'skill',
      score: 8,
      hook: 'Bernie Resolution Capture had been killed earlier. Closures from meeting transcripts were not landing in Task Commander.',
      before: 'Closures were honor-system. Meeting transcripts were processed but did not flip task Status. Resolution stayed empty on completed tasks.',
      aha: 'Tier 0 multi-signal scorer: verb 0.25 + semantic 0.30 + entity 0.20 + speaker 0.15 + temporal 0.10. Threshold 0.75 push, 0.50 silent queue. Closure Candidates DB as the staging queue. Eugeen approval gates every flip.',
      after: 'task-reconciler skill with Meeting Closure + Narrative Backfill + Orphan Closure modes. End-to-end test: 3 real closures from the AI meeting flipped to Done with utterance as Resolution.',
      efficiency: 'Meeting transcripts became a closure source, not a write-only archive. Closures came with their narrative attached.',
      foundation: 'First skill that combined multi-signal scoring, staging DB, human approval gate, and write-gate verifier in one trigger. Pattern reused in notion-write-gate, predictions verifier, audit dispatcher.',
      enabledBy: ['meeting-intelligence-db'],
    },
    21,
  ),

  // ITEM 22, L01, BIG, hasPack pow-01
  withChapter(
    asBigMoment(
      withPack(
        regular(
          {
            id: 'cold-start-one-brain-gate',
            title: 'Cold-start protocol formalized + One-Brain Gate System (Hard Rule #25)',
            sessionShipped: 'S140',
            dateShipped: '2026-04-21',
            category: 'rule',
            score: 11,
            hook: 'Cowork, Code, and Bernie kept drifting apart unless something forced them to share state every session.',
            before: 'Cold-start was advisory. Hard Rule violations only caught after the fact. "Done" meant "API returned 200," which lied. Asymmetric enforcement: Code had 5-layer Routing Gate + Notion Write Gate, Cowork had little.',
            aha: 'Make the gate emit a visible verification stamp on its own line. If the stamp is missing, block the response. PreToolUse hooks block bad writes. PostToolUse hooks fetch-back-and-diff. The user sees compliance, not promises.',
            after: 'Constitution v3.1 to v3.2 ratified Hard Rule #25 with 8 principles. cold-start-verify, output-validator, notion-write-gate skills wired into PreToolUse + PostToolUse hooks. Phase 1 7-deliverable build shipped.',
            efficiency: 'Eliminated the entire class of "I fixed it" false positives. Propagation-ledger turns rule-drift from "weeks to detect" to "next session at most."',
            foundation: 'Master scaffold. Every later gate (HR #30 Tool-Use, HR #31 Context7, HR #34 Email Playbook) plugs into the One-Brain frame.',
            enabledBy: ['rag-pgvector-substrate', 'three-skill-drift-cluster'],
          },
          22,
        ),
        'pow-01-cold-start-protocol',
        'power',
        90,
      ),
    ),
    'Chapter 5. Memory was the bottleneck',
  ),

  // ITEM 23, L02, narrative
  regular(
    {
      id: 'routing-gate-hr-24',
      title: 'Routing Gate ratified as Hard Rule #24 (5-layer enforcement)',
      sessionShipped: 'S143',
      dateShipped: '2026-04-21',
      category: 'rule',
      score: 8,
      hook: 'Claude kept dropping deliverables in the wrong folder. CLAUDE.md said "use routing-rules.md" but nothing checked.',
      before: 'Engine and warehouse mixed. Generated outputs landed inside Claude Workspace. Shadow folders kept appearing in Outputs/Perennial/Financial.',
      aha: 'A 5-layer structural + behavioral gate is the only thing that holds. Layer 1 PreToolUse hook hard-blocks. Layer 2 behavioral disclosure. Layer 3 PostToolUse renames any miss. Layer 4 routing-rules authority. Layer 5 settings.local.json wiring.',
      after: 'Hard Rule #24 enforced via pre_tool_use_routing.sh and post_tool_use_routing.sh. Single allowlist with 26 patterns. Mirrored to Bernie via R030 invariant.',
      efficiency: 'Routing violations: weekly to zero. routing-hygiene-scan.sh weekly top-violators report now possible.',
      foundation: 'Lets every other rule trust the filesystem layout. 5-layer gate template later reused by HR #20 Notion Write, HR #25 One-Brain, HR #30 Tool-Use, HR #31 Context7, HR #34 Email Playbook.',
    },
    23,
  ),

  // ITEM 24, L03, BIG, narrative
  withChapter(
    asBigMoment(
      regular(
        {
          id: 'bernie-migration-code-cli',
          title: 'Bernie Migration: kill $300-500/mo recurring + canonical Stack Architecture v1.0',
          sessionShipped: 'S145',
          dateShipped: '2026-04-22',
          category: 'architecture',
          score: 11,
          hook: 'Two Bernies (OpenClaw stack + direct Anthropic API). Two paid runtimes. Drift between them every week.',
          before: 'Bernie ran Anthropic API direct, $300 to $500 per month recurring, custom code that drifted from M4 Max Claude Code skill set. Cross-machine memory was honor-system.',
          aha: 'Collapse Bernie to Claude Code CLI on the Mac mini. Same skills, same hooks, same RAG corpus. iCloud-shared auto-memory for cross-platform recall. Pair with a 643-line single-file canonical reference covering 3 platforms, 4 lanes, 7 memory surfaces, 25 Hard Rules, 35+ skills, 8 hooks, 7 gates, 14+ DBs.',
          after: 'Bernie reachable via Moshi/Mosh from iPhone. Push notifications on Stop and Notification. Phase 18 cold-start picks up Codex CLI handoff artifacts. Stack doc 5875 words, 16 sections, "For LLMs entering cold" 7-step checklist.',
          efficiency: '$300 to $500 per month eliminated. Drift class cut 70 to 80 percent. Cold-start onboarding for new LLM drops from "hours of file-reading" to "paste this single file."',
          foundation: 'Multi-machine compounding. Bernie runs daemons. M4 Max runs interactive. Both share state. iPhone is a thin client over the same brain.',
          enabledBy: ['cold-start-one-brain-gate'],
        },
        24,
      ),
    ),
    'Chapter 6. Move to Code, run while sleeping',
  ),

  // ITEM 25, L04, narrative
  regular(
    {
      id: 'notion-toolkit-and-wikis',
      title: 'Notion-toolkit + Self-Learning Layer + wikis Karpathy + Full Stack Audit',
      sessionShipped: 'S160',
      dateShipped: '2026-04-26',
      category: 'architecture',
      score: 9,
      hook: 'Notion API calls scattered across 6 daemon files. Wikis sat as static markdown nothing read. No single audit doc covering filesystem, Notion, skills, memory, predictions.',
      before: 'whoop-to-notion-sync, reconciler-service, meeting-extension all rolled their own notion_req with different retry. Schema drift only surfaced when writes failed in production. AI ecosystem topic queries fell back to training data.',
      aha: 'Layers ship at once when components are interdependent, not piece-by-piece. One Notion client. One Pydantic model per active DB, code-generated. Wikis only matter if consumed: daemon + ingest path + query gate. Five-lane parallel audit through 12 lenses.',
      after: 'Subsystems/notion-toolkit/ canonical with 6 Pydantic v2 models auto-generated. wikis Sprint 1: schema + karpathy_compile.sh + launchd. UserPromptSubmit hook wiki-query-mandate fires on AI-ecosystem keywords. Full Stack Audit at Outputs/AI Systems/Audits/ with 10 Code Projects rows pushed Done via HR #20 gate.',
      efficiency: '80 percent pain-fix verdict from Notion deep sweep. AI-ecosystem topics now answer from current wiki + RAG, not stale training. 10 ships in single session vs queued across weeks.',
      foundation: 'Lets every higher-level skill trust Notion as a typed-record store, not JSON soup. Cohesive-layer ship cadence: ship the layer, not the components.',
    },
    25,
  ),

  // ITEM 26, L05, BIG, narrative-only (pow-03 held private per F-redact 2026-05-08; pack not shipped)
  asBigMoment(
    regular(
      {
        id: 'parallel-autonomous-overnight',
        title: 'First parallel autonomous overnight Code DB sweep (R028 Lens 0)',
        sessionShipped: 'S191',
        dateShipped: '2026-04-30',
        category: 'automation',
        score: 11,
        hook: 'Single-session linear work hits a context ceiling at hour 4. The empire never compounds at single-session pace. Sleep was hours of zero throughput.',
        before: 'Eugeen worked one task per session. Code DB rows advanced 3 to 5 per session. Overnight was wasted.',
        aha: 'Open N parallel Code sessions, give each a phase plan, run with full permissions on full auto, wake up to a merged result. R028 Autonomous Loop becomes Lens 0 of R013, autonomy is the FIRST question before the 8 supporting lenses fire.',
        after: 'S191: 14 rows advanced, 9 to Done. Session 1 owned rows 1-37, Session 2 owned rows 38-75. S192 doubled down: 15 Code Projects rows shipped Done with notion-write-gate post-verify PASS each, 5 new wealth-engine daemons, 4 workers, 2 MCPs.',
        efficiency: 'Throughput multiplier: 15 ships overnight vs 1 to 2 per day attended. Sleep becomes net-positive output.',
        foundation: 'Coordination-file-based parallel-session pattern reused S192 + Empire Wireframe S197 + this Scrolophyte S198. Every design now passes the Autonomous Loop gate first.',
        enabledBy: ['cold-start-one-brain-gate', 'bernie-migration-code-cli'],
      },
      26,
    ),
  ),

  // ITEM 27, L06, narrative
  regular(
    {
      id: 'hoistos-visual-stack-code-db-gate',
      title: 'HoistOS Phase 1 + Visual Stack v1.0 + Code Projects required-property gate',
      sessionShipped: 'S178',
      dateShipped: '2026-05-01',
      category: 'architecture',
      score: 8,
      hook: 'HoistOS lived as a vision but had no architectural plan. Every Claude-generated visual deliverable looked AI-generic. Code Projects DB had recommended-but-not-required properties; 43.5 percent gate pass rate.',
      before: 'HoistOS as separate brand had no infrastructure-foundation memo. One-off HTML files for visuals. Inconsistent themes. 170 Code DB rows scanned, 8 FAIL_REQUIRED + 95 FAIL_CONDITIONAL.',
      aha: 'HoistOS as a 7-layer stack plus 24-week build sequence plus R031 inward-tool reuse audit. Visual Stack as a template repo. Code DB schema YAML promotion from recommended to required + retroactive backfill + drift-check enforcement.',
      after: 'HoistOS memo at Outputs/AI Authority/HoistOS/Strategy/, 60 percent reuse of existing personal-stack infra. Subsystems/visual-stack/ shipped, /visualize-pro skill scaffolds new packs. R053 Visual Triage rule scans 4 directories. Code DB Phase A YAML v1.8b to v1.9, Phase D drift-check #82.',
      efficiency: '6+ months of greenfield avoided via reuse. 43.5 to 100 percent Code DB compliance in one session.',
      foundation: 'R031 inward-tool reuse audit established as standard pre-build step. Every external-facing deliverable (HoistOS marketing, AI Authority posts, this /empire route) fast-paths to studio-grade visual quality.',
    },
    27,
  ),

  // ITEM 28, L07, hasPack pow-04
  withPack(
    regular(
      {
        id: 'sleep-consolidator-multi-model-jury',
        title: 'Sleep Consolidator + Multi-Model Jury: 7 of 9 One-Brain v2 pillars overnight',
        sessionShipped: 'S189',
        dateShipped: '2026-05-04',
        category: 'automation',
        score: 11,
        hook: 'What if Claude could consolidate insights overnight, the way humans dream?',
        before: 'Episodic events scattered across Telegram, Whoop, email, Decision Log. No cross-event synthesis. Claude rebuilt context from scratch every cold-start. Claude-dominant stack at 100 percent primary, adversarial sanity check absent.',
        aha: 'Sleep-time consolidator daemon promotes high-importance episodic rows to facts-registry candidates via batch approval. The system gets smarter while you sleep. Multi-Model Jury joins as critic-only, never primary, cost-bounded by $20/mo OpenAI cap.',
        after: 'P1 Bitemporal facts. P2 Episodic+Procedural Supabase 551 rows. P3 Wiki nightly daemon. P4 Sleep consolidator launchd 04:00 ET nightly, first run extracted 29 candidate facts in 108 seconds. P5 Procedural index + skill suggester. P6 Cold-start Phases 16+17. P7 Multi-Model Jury routes 4 high-value surfaces. On MAJOR_DISAGREE, challenge round fires.',
        efficiency: 'Skill suggester surfaces relevant skills via cosine without manual /<command>. False-positive Insight rate drops on borderline scores. High-stakes outputs get adversarial check.',
        foundation: 'Sleep consolidator is the substrate that makes the brain compounding. Multi-model architecture pattern (dominant-primary + bounded-critic) reusable for any future model integration.',
        enabledBy: ['rag-pgvector-substrate', 'cold-start-one-brain-gate'],
      },
      28,
    ),
    'pow-04-multi-model-jury',
    'power',
    90,
  ),

  // ITEM 29, L08, narrative
  regular(
    {
      id: 's195-audit-backlog-drain',
      title: 'S195 systemwide audit to S196 audit-backlog drain in single batch',
      sessionShipped: 'S195',
      dateShipped: '2026-05-05',
      category: 'rule',
      score: 9,
      hook: 'S195 audit produced 22-row backlog. Standard pattern would queue across multiple sessions. Plus: memory-only Email Playbook rule was being skipped. Plus: single-CLI dependence creates outage risk.',
      before: 'Multi-week drift between identifying issues and shipping fixes. Constitution version drift, output-validator triple-firing, sprint_pick.py spec-but-not-coded. No backup CLI runtime if Claude Code went down.',
      aha: 'A backlog of small structural fixes can be drained in one session if each ships through the same gate without context switch. PreToolUse hook on Gmail draft creation is the same pattern as routing gate. Codex CLI can run a parallel pointer-based memory architecture mirroring ~/.claude/.',
      after: 'Constitution v3.9 to v3.10. Decision Log monthly rotation. output-validator 3-layer to 1-layer dedup. settings.local.json pruned 34 to 13. Email Playbook Pre-Send Gate (HR #34): PreToolUse exit 2 on missing disclosure, PostToolUse desktop-mirror auto-cps Outputs PDF/docx to Desktop. Codex CLI: 18 memory files at ~/.codex/memories/, AGENTS.md mirrors CLAUDE.md, eugeen-rag MCP wired.',
      efficiency: '~25,000 tokens freed per session from SKILL trims. Skill count 63 to 46. Email-rule violations eliminated at draft time, not send-time.',
      foundation: 'Establishes "audit-backlog-drain" as a session archetype. Tool-gated PreToolUse pattern reusable for any tool-specific compliance gate. Cross-CLI handoff via Phase 18.',
    },
    29,
  ),

  // ITEM 30, L11, narrative
  regular(
    {
      id: 'scrolophyte-deep-sprint-now',
      title: 'Scrolophyte deep sprint: the timeline IS the product',
      sessionShipped: 'S198',
      dateShipped: '2026-05-08',
      category: 'vibes',
      score: 10,
      hook: 'The V1 wireframe was a story. The V2 pivot is an artifact: the deliverable IS the novel distribution method.',
      before: 'Empire Wireframe S197 night shipped a 3-treatment timeline + activation pack v1. The pack format was canonical but only proposal-builder existed as a pack. Distribution was vibes-based: post a link, hope the VP clicks.',
      aha: 'Build the activation pack engine as a multi-tier product (4 + 4 + 4 + 4 = 16 packs), build site treatments in parallel, bundle the GitHub repo as the canonical artifact, run an auto-merge gate that polls all tabs to DONE before merge. Read it, install it, use it, in one continuous scroll.',
      after: '12+ tabs in parallel with explicit phase chaining. A4+A5+A6 mining yields 30 chronological items. B3-{beg,mid,adv,pow} ship 16 packs. C-site-d + C-fx ship the long-scroll site + 26-component chapter break. D-github bundles the private repo. E-merge wires everything.',
      efficiency: 'Activation pack production cost: from "one pack per overnight" to "16 packs per morning." Distribution converts from vibes to structural.',
      foundation: 'R056 Scrolophyte Pattern: when the deliverable IS the distribution method, the timeline becomes the product, not the marketing. The system productizing itself.',
      enabledBy: ['parallel-autonomous-overnight', 'hoistos-visual-stack-code-db-gate', 'sleep-consolidator-multi-model-jury'],
    },
    30,
  ),
]

// ---------------------------------------------------------------------------
// G4 Phase 1 (S198 morning, 2026-05-08): per-milestone depth payloads.
//
// Maps each of the 30 items by id to a 6-field MilestoneDepth object that
// EmpireTimeline-d.tsx renders inside an expand-on-click tabbed sub-section
// (Story / Compounds / How-to / Why It Matters). Voice: Eugeen plain English
// per R039. HR #11 enforced: zero em dashes, zero en dashes anywhere here.
//
// Field contract (see MilestoneDepth interface above):
//   howWeGotThere   - 4 to 6 sentence narrative.
//   howThisCompounds - 2 to 3 sentence forward-link to later items.
//   howToImplement  - 3 to 5 concrete steps a VP would follow.
//   whyThisMatters  - 2 to 3 sentence strategic frame for VP audience.
//   prerequisites   - item numbers a VP should grok first.
//   relatedMilestones - cross-link item numbers on the timeline.
// ---------------------------------------------------------------------------

export const MILESTONE_DEPTHS: Record<string, MilestoneDepth> = {
  'chatgpt-was-the-fast-lane': {
    howWeGotThere:
      'ChatGPT was the daily fast lane for two months. Custom Instructions covered identity, but the 1500-character cap could not hold six domains at once. Every session opened with the same 800 words of paste: who Eugeen is, that he runs Perennial Empire with 90+ employees, the family context, the largest active project. He tried separate Custom Instructions sets, then separate accounts, then a workspace with multiple GPTs. None of it survived a real Perennial deliverable that needed depth past one chat. The pain compounded until somebody mentioned claude.ai had a feature called Projects.',
    howThisCompounds:
      'Item 2 (Cowork Projects + pinned context) is the direct answer to the pain documented here. Every later memory layer in items 4 through 22 extends the principle established by feeling this ceiling. Without this baseline pain, no VP funds 30 hours of substrate work in items 4 through 28.',
    howToImplement: [
      'Audit your current AI tool. Count the minutes per week you spend pasting context at session start.',
      'If that number is over 60 min per week, your tool is the bottleneck. Move on.',
      'Pick one strategic deliverable that has died on you twice already (board memo, SOP, financial model).',
      'Move it to a tool with persistent context (Claude Projects, Cowork). Pin the supporting files.',
      'Measure session-spinup time before and after. Below 80% reduction means the substrate is wrong, not the user.',
    ],
    whyThisMatters:
      'Pre-Claude is the baseline against which all AI investment ROI gets measured. A VP who cannot articulate the ceiling of the current tool cannot justify upgrading the substrate. Skip this audit and you ship AI strategy that is already obsolete.',
    prerequisites: [],
    relatedMilestones: [2, 22],
  },

  'cowork-projects-pinned-context': {
    howWeGotThere:
      'Six different worlds collided in one ChatGPT thread: Personal, Perennial Empire operations, AI Authority content, AI Systems strategy, OS Build, and Health protocols. Each session opened with the same 800-word paste. Eugeen tried Custom Instructions (1500-char cap killed it), tried 6 separate accounts (sociopathic), tried a workspace with multiple GPTs (still no per-project context). A community member mentioned Claude.ai had a feature called Projects with pinned files plus per-project instructions. Within an hour he had six Projects, each loaded with Master Context, Decision Log, and routing rules. The first time Claude opened with the world already loaded, he stopped pasting and started working.',
    howThisCompounds:
      'Items 3, 4, and 22 all assume persistent context exists. The desktop three-sweep audit (item 3) needed Claude to remember the audit pattern across sessions. Memory Architect (item 4) needed pinned routing rules. The cold-start protocol (item 22) hardened the same idea into a Hard Rule.',
    howToImplement: [
      'Download the beg-01-chat-to-projects pack (12 min activate).',
      'List your 4 to 6 distinct domains: personal, primary work, side project, learning, content, finance.',
      'Create one Claude Project per domain. Pin the 3 most important context files in each.',
      'Write per-project Custom Instructions: identity, banned phrases, output destinations.',
      'Run for one week. If you stop pasting context at session start, the migration paid for itself.',
    ],
    whyThisMatters:
      'Persistent context per project is the cheapest memory layer you can ship: $20/mo and 90 minutes of setup. It eliminates the single biggest tax on AI productivity, which is session-spinup. VPs who skip this step keep paying that tax forever and wonder why their AI investment never compounds.',
    prerequisites: [1],
    relatedMilestones: [3, 4, 22],
  },

  'desktop-three-sweep-audit': {
    howWeGotThere:
      'AI Architecture had grown to 128 files in 60 days of building. Six versions of the OCM SOP. Three different routing rules. Cleanup was a manual evening every other week, and the every-other-week cadence kept slipping. Eugeen tried writing a manual checklist; he ignored it. He tried hiring a VA to rename files; the VA could not see the dependency graph. The unlock was a single prompt: audit my AI Architecture folder, score it 0 to 10 on organization, propose a fix list, then execute the fixes you have permission to make. Claude rated the folder 8.5, proposed 47 fixes, executed the safe ones, and asked permission for the rest. Three sweeps in one session got the score to 9.2.',
    howThisCompounds:
      'Every later filesystem-touching skill descends from this pattern: Memory Architect (item 4), wikis daemon (item 25), audit dispatcher (item 29). The score, propose, execute, re-score loop became the master template.',
    howToImplement: [
      'Download the beg-02-desktop-organizer pack (15 min activate).',
      'Pick one folder where you know clutter exists. Start small (one folder, max 200 files).',
      'Run the sweep prompt: score, propose fix list, execute safe fixes, ask permission for unsafe ones.',
      'Re-score after sweep 1. Run sweep 2 if score is below 9.0.',
      'Codify the prompt as a recurring monthly task once the score holds above 9.0.',
    ],
    whyThisMatters:
      'A measurable rating that improves over time is the difference between maintenance theater and actual progress. Without a number, audits become time-of-day rituals nobody respects. With a number, the audit shows up in a dashboard and the VP defends the investment.',
    prerequisites: [2],
    relatedMilestones: [4, 25, 29],
  },

  'memory-architect-first-skill': {
    howWeGotThere:
      'After three manual audits, Eugeen asked the question that changed everything: how do I make this run while I sleep? The first attempt was a recurring calendar reminder. He ignored it. The second was a Notion task. He completed it three times then drifted. The unlock was reading the Anthropic docs on Claude Skills: a versioned, triggered, evaluatable prompt with structured I/O. Within one session he wrote the SKILL.md, defined trigger phrases, codified the six safety rails (backup before delete, version before edit, log everything, never modify outside workspace, max 50% compression, preserve voice), and built a 10-dimension self-rating rubric. The skill graded itself 9.5 on its first run.',
    howThisCompounds:
      'This is the first ancestor of every skill in the system. Items 5 (scheduled task), 7 (TF-IDF search), 8 (three-skills pattern), 17 (expense automation), 19 (drift cluster), 28 (sleep consolidator) all carry the DNA: codified prompt + trigger + safety rails + self-rating loop.',
    howToImplement: [
      'Download the beg-04-first-skill-bootstrap pack (20 min activate).',
      'Pick one task you do at least monthly that has a clear input and output (audit, weekly review, monthly close).',
      'Write the SKILL.md: name, description, when-to-trigger phrases, structured I/O contract.',
      'Add 3 to 6 safety rails: backup, version, log, scope limit, compression cap, voice preservation.',
      'Add a 5 to 10 dimension self-rating rubric. Aim for 9.0+ before declaring the skill stable.',
      'Schedule it. Manual to codified to scheduled is the maturity ladder.',
    ],
    whyThisMatters:
      'Skills, not files, are the unit of progress in an AI-native operating system. A VP who keeps building one-off prompts is hand-crafting the same wheel forever. Codified skills compound, hand-crafted prompts do not.',
    prerequisites: [3],
    relatedMilestones: [5, 7, 8, 17, 19, 28],
  },

  'first-scheduled-task-2am': {
    howWeGotThere:
      'Memory Architect was running on demand. Eugeen kept forgetting to invoke it. Three weeks of "I should run that audit" with zero runs. The unlock was the Cowork scheduled-task feature shipping in early March. Eugeen wrote the trigger 90 seconds after reading the release note: 02:00 ET on the 5th of every month. He tested it once with a 5-minute fire window, watched the log fill, then turned the test off and waited for April 5. April 5 the run happened. Eugeen woke up to a 9.2-rated audit report on a folder he had not touched.',
    howThisCompounds:
      'Every Bernie launchd daemon descends from this run. Items 15 (April 5 first fire), 24 (Bernie migration), 26 (parallel autonomous overnight), 28 (sleep consolidator) all assume the system can hold a clock and act on it.',
    howToImplement: [
      'Pick one skill you have built that runs cleanly on demand.',
      'Find the lowest-frequency cadence that still adds value (monthly is a good starting point).',
      'Set the trigger time to a moment when you are guaranteed asleep (2 AM works).',
      'Run it once manually with a 5-min test window to validate logging.',
      'Turn off the test, wait for the real fire. Do not babysit the first run.',
    ],
    whyThisMatters:
      'The first time infrastructure runs without you is the moment AI assistant becomes AI infrastructure. Until that line is crossed, you are still the runtime. After it, the system runs and you become the architect.',
    prerequisites: [4],
    relatedMilestones: [15, 24, 26, 28],
  },

  'cowork-browser-linkedin-day': {
    howWeGotThere:
      'Eugeen had to optimize his LinkedIn profile end to end: headline, About section, the first 5 experience descriptions, one Featured post. The old workflow was AI writes the words, Eugeen pastes 20 times into the LinkedIn editor. 90 minutes of paste-and-click. Eugeen tried Tampermonkey scripts (failed silently), tried Zapier (no LinkedIn write API), tried BetterProfile-style tools (broke on rate limits). The unlock was Cowork browser automation: Chrome opens, navigate to edit URL, form_input on textareas, fire JavaScript click on Save. 12 minutes of supervision replaced 90 minutes of paste-and-click.',
    howThisCompounds:
      'This is the first proof that AI could click as well as type. Every later browser-driven skill (item 17 expense entry into 4Empire, item 18 voice to Notion task, item 27 HoistOS visual stack) inherits the 4-step pattern: navigate, form_input, JS click, repeat.',
    howToImplement: [
      'Pick one form-heavy task you do monthly or weekly (LinkedIn updates, expense entry, profile updates, content uploads).',
      'Open Cowork with browser tools enabled.',
      'Prompt: open Chrome, navigate to <URL>, fill these fields, click Save, repeat for each item.',
      'Watch the first 2 to 3 runs. Catch and codify the failure modes (chrome extension conflicts, slow page loads, captcha).',
      'Once stable, codify as a skill with the URL pattern hardcoded.',
    ],
    whyThisMatters:
      'The ceiling on AI productivity moves from anything you can prompt to anything a human can click. For a VP, this is the moment AI stops being a writing assistant and starts being a labor pool.',
    prerequisites: [2],
    relatedMilestones: [17, 18, 27],
  },

  'tfidf-search-zero-deps': {
    howWeGotThere:
      'Knowledge retrieval was scoring 5.5 out of 10 in the architecture audit. Claude was guessing which file to read. Cold-start could only carry 5 files into context. Eugeen knew RAG was the answer but Supabase + pgvector + Cohere Rerank felt like a 3-week build for a problem that needed a fix this week. He tried a basic file-name search; hit rate stayed under 30%. Tried a grep wrapper; still under 40%. The unlock was reading a Karpathy thread on TF-IDF: inverted index, cosine similarity, smart boosts, all in 200 lines of pure Python with zero external deps. Shipped in one session. Hit rate jumped to 75%.',
    howThisCompounds:
      'This is the bridge to the full RAG substrate (item 20 pgvector). For 9 months, TF-IDF carried the corpus. When pgvector finally shipped, the migration was clean because the query interface was already defined.',
    howToImplement: [
      'Download the mid-04-knowledge-search pack (25 min activate).',
      'Index your top 3 most-queried folders (Decision Log, Skills, Outputs).',
      'Add smart boosts: filename 1.3x, header 1.2x, recency 1.1x.',
      'Wire the query interface as a slash command or skill trigger.',
      'Measure hit rate on 20 real queries. If under 70%, expand the index. Over 70% means ship and revisit when you actually need vectors.',
    ],
    whyThisMatters:
      'Do not wait for perfect infrastructure. The 80% solution shipped in week 1 beats the 95% solution shipped in month 3 every time. VPs who hold for the perfect substrate end up shipping nothing.',
    prerequisites: [4],
    relatedMilestones: [20],
  },

  'three-skills-pattern': {
    howWeGotThere:
      'Memory Architect, Architecture Benchmark methodology, and TF-IDF search all shipped in S70, the same session. Eugeen had been thinking about the maturity ladder for two weeks: manual to codified to scheduled. Reading back his own session log, he noticed the same problem (folder organization) had been solved three different ways across three sessions. The unlock was the explicit naming: anything built once and used twice becomes a skill. Once he saw it, he could not stop making them. By the end of the session, three new SKILL.md files were live.',
    howThisCompounds:
      'This is the moment skill-creation became reflex. Items 11 (email playbook), 12 (proposal fork), 13 (GP tracker), 17 (expense automation), 19 (drift cluster) all came after this naming. The skill count went from 3 to 45+ over the next 60 days.',
    howToImplement: [
      'Download the adv-04-skill-creator-meta pack (35 min activate).',
      'Audit your last 30 days of AI sessions. List every task you did more than once.',
      'For each repeat task, ask: did I solve it the same way each time? If not, that is a skill candidate.',
      'Pick the top 3 candidates. Codify them in one session each.',
      'Track skill count weekly. If the curve flattens, you are running out of manual work, which is the goal.',
    ],
    whyThisMatters:
      'The skill count is the cleanest leading indicator of AI maturity in an organization. VPs who ship 1 skill per month are stuck. VPs who ship 3 to 5 per week are compounding.',
    prerequisites: [4],
    relatedMilestones: [11, 12, 13, 17, 19],
  },

  'sent-emails-voice-fingerprint': {
    howWeGotThere:
      "Every Claude draft sounded like Claude wearing Eugeen's name tag. The tone was right; the rhythm was wrong. Eugeen tried prompt engineering (be professional, use plain English); drafts stayed generic. He tried pasting a few example emails; voice match held for 3 messages then drifted. The unlock was scale: 6 months of sent emails dumped into Cowork in one batch (Sept 2025 to March 2026, ~200 messages). Claude extracted signature rules, opener patterns, banned phrases, register-by-recipient. Compiled to Email Playbook v1. By the third week Eugeen stopped catching mismatches.",
    howThisCompounds:
      'Item 11 (tier-aware email playbook) extends this with HTML format selection. Hard Rule #34 (item 29) hardens it into a PreToolUse hook that blocks violations at draft creation.',
    howToImplement: [
      'Export 6 months of sent emails to a single text file (Gmail Takeout works).',
      'Open Cowork. Paste the file. Prompt: extract my voice fingerprint: signature, opener patterns, banned phrases, tone-by-recipient-tier.',
      'Review the output. Edit anything that does not sound like you.',
      'Save as Email Playbook.md. Pin it to your work Project.',
      'Reference it in every email draft prompt for the first 4 weeks. After that, it sticks.',
    ],
    whyThisMatters:
      'Voice is data. Most operators are still hand-crafting prompts that say be professional instead of compiling 200 examples into a fingerprint. A VP who skips the fingerprint ships AI emails that sound like AI emails.',
    prerequisites: [2],
    relatedMilestones: [11, 29],
  },

  'daily-briefing-consolidation': {
    howWeGotThere:
      'Daily Briefings folder kept growing. Foundation health check fired at 06:00. Context staleness check fired at 06:15. Daily Email Intelligence fired at 06:30. Morning briefing fired at 07:00. Four scheduled tasks, four file outputs, no human-readable summary. Eugeen tried opening all four reports each morning; got through two before coffee finished. Tried a meta-summary script; that was a fifth file in the folder nobody read. The unlock was the inversion: the scheduler is not the deliverable. Collapse all four into one morning brief that triages email, calendar, tasks, and health checks into a single surface.',
    howThisCompounds:
      'Pattern reused in Bernie Morning Brief Fix Wave (S165), predictions accuracy_audit pre-first-fire suppression, audit dispatcher (item 29). The principle: collapse the scheduler before collapsing the brain.',
    howToImplement: [
      'Download the mid-03-daily-briefing pack (30 min activate).',
      'List every scheduled task that fires before noon. If more than 2, you have over-scheduled.',
      'Pick one consolidator task time (07:00 ET works). Move all data fetches into one prompt.',
      'Output one triaged brief: top 3 emails needing reply, calendar conflicts, overdue tasks, anomalies.',
      'Archive the source folder after 30 days of clean runs. Resist the urge to keep raw outputs around.',
    ],
    whyThisMatters:
      'The scheduler is not the deliverable. Operators who measure productivity by file output rather than triaged action ship busywork. A VP who consolidates four streams into one triaged surface saves 30 minutes per morning across the leadership team.',
    prerequisites: [5],
    relatedMilestones: [29],
  },

  'email-playbook-tier-aware': {
    howWeGotThere:
      'A structured email to a peer COO at a JV partner about a multi-million-dollar opportunity went out as plain text. The formatting fought the message: 5 numbered items collapsed into one paragraph, the ROI table looked like a list. The recipient replied "can you resend with the data in a table?" Eugeen knew immediately. He tried adding HTML to email-drafter; the skill produced HTML for every draft, including 3-line replies, which felt absurd. The unlock was tiering: short replies stay plain, anything with sections or executive recipients gets HTML with Perennial brand styling. email-drafter selects format by audience tier automatically.',
    howThisCompounds:
      'First time a skill made a format decision based on tier instead of a flag. Pattern reused in audit dispatcher (mode flag at item 29), notion-write-gate (read-after-write tier), multi-model jury (high-stakes-only at item 28).',
    howToImplement: [
      'Download the mid-01-email-playbook-tier-aware pack (25 min activate).',
      'Define your audience tiers. T1 = top clients + GCs + family office. T2 = peers + partners. T3 = internal team.',
      'Map format-by-tier: T1 + structured = HTML branded. T1 + reply = plain. T2/T3 + reply = plain. T2/T3 + structured = soft HTML.',
      'Update your email-drafter SKILL.md to read recipient tier and select format.',
      'Test on 10 outbound emails across tiers. Adjust thresholds.',
    ],
    whyThisMatters:
      'GC and admin emails went from looking like one-liners to looking like the company they came from. No human re-format step. For a VP, that is the gap between AI-generated content and on-brand content.',
    prerequisites: [9],
    relatedMilestones: [28, 29],
  },

  'light-proposal-fork': {
    howWeGotThere:
      'Heavy proposal-builder was overkill for change orders. CO #10 to an existing client (a $4K paint touch-up) took the same multi-option process as a $20M new-client pursuit: 12 sections, comparison tables, cover page, two material options. Eugeen tried adding a lite mode flag to the heavy skill; the skill kept defaulting to verbose. Tried trimming the SKILL.md; broke the heavy use case. The unlock was the fork: ship a sibling skill with the same brand tokens but a different shape. Heavy and light became siblings, not versions. Trigger phrases differentiated cleanly: change order to light, new client proposal to heavy.',
    howThisCompounds:
      'Same fork pattern applied to email-drafter (replies vs cold outreach), audit dispatcher (smoke vs deep vs notion vs filesystem at item 29). Forking on use case scales; flag-on-skill does not.',
    howToImplement: [
      'Download the adv-01-proposal-builder pack (40 min activate).',
      'Identify a heavy skill where 30% of invocations want a lighter version.',
      'Fork into two skills with shared tokens (brand, voice, output format).',
      'Set distinct trigger phrases. The fork must be unambiguous from the trigger alone.',
      'Run for 30 days. If trigger collisions hit more than 5%, refactor the trigger words.',
    ],
    whyThisMatters:
      'One brand, two shapes. CO turnaround drops from hours to minutes. The BD team can issue a CO without Eugeen, which removes the bottleneck entirely. For a VP, this is the difference between AI-as-bottleneck and AI-as-multiplier.',
    prerequisites: [8],
    relatedMilestones: [11, 29],
  },

  'gp-tracker-from-bailey-ave': {
    howWeGotThere:
      'A unit-based public-housing job needed a per-apartment GP tracker: 11 apartments, prevailing wage, change orders, AIA billing. Eugeen built it as a custom Excel: hardcoded rates, hardcoded unit count, hardcoded G703. The VP Construction adopted it the same day Eugeen handed it over. Then a different project needed the same tracker. Eugeen rebuilt it from scratch. Then a third, larger job needed it. He was about to rebuild again when the obvious move surfaced: parameterize the rates, parameterize the unit count, parameterize the prevailing-wage flag. Ship a config-driven skill, not another file.',
    howThisCompounds:
      'Every later config-driven skill (proposal-builder, light-proposal, GP tracker, expense automation, audit dispatcher) inherits the pattern: ship the generic engine the first time you have to repeat yourself.',
    howToImplement: [
      'List your top 3 most-rebuilt Excel files (project trackers, financial summaries, P&L sheets).',
      'Pick the one with the cleanest parameter surface (rates + unit count + project name).',
      'Build a config-driven skill: SKILL.md interviews the user, generates the file from a template, fills in formulas.',
      'Test against your last 3 historical builds. If outputs match within 95%, the skill is stable.',
      'Hand off to a junior. If they ship without your involvement, the skill paid for itself.',
    ],
    whyThisMatters:
      'Generalize the shape, not the file. A VP who keeps custom-building project trackers is hand-crafting wheels. A VP with a config-driven engine spins up tracking for a multi-million-dollar job in 30 minutes.',
    prerequisites: [8],
    relatedMilestones: [12, 17],
  },

  'meeting-intelligence-db': {
    howWeGotThere:
      'Zoom Notes was a flat folder of 200+ transcripts. Decisions, attendees, action items, project links all lived as text inside files. Cross-meeting search was grep. Eugeen tried tagging filenames; tags drifted. Tried an Airtable manual log; nobody updated it. The unlock was treating meetings as an entity type. Notion DB with 11 properties (date, attendees relation, project relation, decisions, action items, recording link, tier, processor status, follow-up flag, raw transcript URL, scorecard). Five views by status. meeting-processor skill triggers on recording arrival. Scheduled poll every 30 minutes.',
    howThisCompounds:
      'First flat folder to entity DB to processor skill pattern. Reused for People DB (item 19), Companies DB, Operations Library, Skills Registry, Closure Candidates DB (item 21).',
    howToImplement: [
      'Download the adv-02-meeting-to-tasks pack (45 min activate).',
      'Pick a flat folder that has grown past 100 files (meetings, contracts, RFIs, photos).',
      'Define 8 to 12 properties on the entity. At least 2 must be relation properties (link to People, Project).',
      'Build the processor skill: triggers on file arrival, extracts properties, writes the DB row.',
      'Schedule a 30-min poll on the source folder. Validate first 50 rows manually before going hands-off.',
    ],
    whyThisMatters:
      'Meetings disappeared and reappeared only when Eugeen remembered the date. Now meetings with Steve Hultgren is a Notion view, not a grep. For a VP, this is the gap between institutional memory and institutional Alzheimer.',
    prerequisites: [8],
    relatedMilestones: [21, 19],
  },

  'april-5-first-autonomous-run': {
    howWeGotThere:
      'The monthly memory audit task was scheduled on March 10 to fire on April 5 at 02:00. Eugeen forgot about it for three weeks. The morning of April 5 he opened his laptop expecting an empty inbox; instead the audit log was sitting in the Audits folder, timestamped 02:14. Three sweeps had run across 127 active files. Sweep 1 moved S84 checkpoint to Audits. Sweep 2 audited all 12 context files. Sweep 3 self-rated 8.28. Eugeen had not touched a key. The system ran.',
    howThisCompounds:
      'Direct precondition for the wider parallel-overnight pattern (item 26) and Bernie launchd daemons (item 24). Once one autonomous run worked, the question shifted from can it run to how many can run in parallel.',
    howToImplement: [
      'Verify your scheduled task fired on time. Check the log timestamp.',
      'Read the output as a deliverable, not a status report. If it is unreadable, the prompt is wrong.',
      'If the output is acceptable, leave it. Do not babysit the next run.',
      'Add a second scheduled task at a different cadence (weekly, biweekly).',
      'After 4 successful unattended runs, increase scope: more files, more sweeps, longer runtime.',
    ],
    whyThisMatters:
      'The first time the architecture audits itself while you sleep is the moment I use AI well becomes I have built AI systems that maintain themselves. Until that line, you are still the runtime.',
    prerequisites: [5],
    relatedMilestones: [24, 26],
  },

  'cross-platform-protocol': {
    howWeGotThere:
      'Bernie (running on the OpenClaw stack at the time) and Cowork were drifting. Different routing rules. Different MEMORY.md states. Same name, two brains. A correction Eugeen taught Bernie about email opener phrasing did not propagate to Cowork; the same mistake shipped two days later from Cowork. Eugeen tried weekly manual sync; broke within a session. Tried a shared Notion doc; both surfaces ignored it. The unlock was three shared Global files (Skill Intelligence, Platform Capability Map, Cross-Platform Protocol) plus Decision Log as the cross-platform correction bus. Both surfaces read it on cold-start.',
    howThisCompounds:
      'First time two brains share state had a protocol. Set the model for iCloud-shared Bernie Auto Memory and the One-Brain Gate System (item 22). Item 24 (Bernie migration to Code CLI) made the sync near-real-time.',
    howToImplement: [
      'List every AI surface you use (Cowork, Code, Bernie, mobile app).',
      'Define what each surface owns versus what they share. Identity + rules + routing must be shared.',
      'Pick a canonical filesystem location (iCloud works) for shared files.',
      "Configure each surface's cold-start to read the shared files first.",
      'Add a Decision Log append every time you correct one surface. Within one session, both surfaces reflect the correction.',
    ],
    whyThisMatters:
      'One brain across multiple surfaces is the difference between an AI assistant and an AI organization. VPs who let surfaces drift end up with three different AI tools that disagree on basic facts.',
    prerequisites: [4],
    relatedMilestones: [22, 24],
  },

  'expense-automation-end-to-end': {
    howWeGotThere:
      "The monthly AMEX cycle was 2 to 3 hours of pain: find Jonel's statement email, extract the PDF, parse 30+ line items, scan two Gmail accounts for receipts, assign GL codes by memory, build the reconciliation Excel, manually enter codes into 4Empire web form, bundle receipts. Eugeen tried Expensify ($X/mo, did not handle GL codes the way 4Empire wanted). Tried a VA (cost more than the time it saved). The unlock was a single skill that strung 5 MCP servers together: Gmail (find statement + receipts), Drive (extract PDFs), Chrome (drive 4Empire form), file system (build Excel), Notion (log status). One trigger, end to end.",
    howThisCompounds:
      'First skill that strung 5 MCPs into one trigger. Set the pattern for task-reconciler (item 21) and the audit dispatcher (item 29). Every later cross-tool skill descends from this orchestration shape.',
    howToImplement: [
      'Download the mid-02-expense-automation pack (45 min activate).',
      'List a recurring monthly task that touches 3+ tools (expenses, payroll, financial close, billing).',
      'Map each tool to its MCP server (Gmail, Drive, Chrome, Notion, etc.).',
      'Write the SKILL.md as a sequence of MCP calls with intermediate validation gates.',
      'Test on a low-stakes month first. If it ships clean, schedule it for the next cycle.',
    ],
    whyThisMatters:
      '2 to 3 hours per month becomes minutes of supervision. The unit of work shifts from the tool to the trigger. For a VP, this is the gap between AI saves me time on tasks and AI runs the workflow end to end.',
    prerequisites: [8],
    relatedMilestones: [21, 29],
  },

  'voice-to-telegram-task': {
    howWeGotThere:
      'Eugeen captured tasks while driving by mumbling into iOS Voice Memos. The memos sat in Notes; half evaporated by Friday. He tried Otter.ai (transcripts went to a folder he never read). Tried Apple Reminders (no project relation, no Acceptance Criteria). The unlock was a Telegram bot wired to Whisper + Notion MCP. Eugeen sends a voice note to Bernie Telegram. Whisper transcribes. Bernie parses out task title, project relation, owner, Acceptance Criteria stub. Notion row appears in Task Commander 8 to 12 seconds later.',
    howThisCompounds:
      'Bridges to the full Bernie Migration (item 24) where Bernie becomes the always-on hands. Item 28 (sleep consolidator) extends the same pattern to overnight ingest.',
    howToImplement: [
      'Download the beg-03-voice-to-task pack (18 min activate).',
      'Set up a Telegram bot via BotFather. Wire it to a Whisper transcription endpoint.',
      'Configure Notion MCP to write to your task DB. Map fields: title, project, owner, acceptance.',
      'Test with 10 voice notes. Validate field extraction. Tune the parser prompt.',
      'Bind a quick-call shortcut on your phone home screen. Reduce capture friction to 2 taps.',
    ],
    whyThisMatters:
      'Task capture latency drops from next time at desk to before the call ends. For a VP who lives in the truck or on Zoom calls all day, half of the field captures used to evaporate by Friday. Now they all land.',
    prerequisites: [4],
    relatedMilestones: [24, 28],
  },

  'three-skill-drift-cluster': {
    howWeGotThere:
      'The hallucinated-name incident: a fabricated person name landed in a deliverable that almost shipped to a real client. Eugeen caught it on review. The drift class was no longer theoretical, it was an artifact. He tried adding "verify names against People DB" to every prompt; drifted within a week. Tried a manual pre-send checklist; he skipped it on draft 12. The unlock was three skills shipped together as a cluster: output-validator runs a 7-check pre-delivery gate. memory-propagator captures correction triggers (from now on, rule:). notion-query collapses 9 lookup recipes into one trigger. Constitution v2.4 ratified Hard Rule #17 in the same session.',
    howThisCompounds:
      'The first cluster moment. After this, skills came in clusters that cover one drift surface, not in singletons. Direct ancestor of the One-Brain Gate System (item 22) and notion-write-gate (item 22).',
    howToImplement: [
      'Download the adv-03-contract-review pack (35 min activate).',
      'Identify a drift surface where corrections keep happening (identity, routing, voice, names).',
      'Decompose the surface into 3 distinct skills: detect, capture, propagate.',
      'Ship all 3 in one session. Do not spread the cluster across weeks.',
      'Ratify the binding rule in your Constitution document the same session.',
    ],
    whyThisMatters:
      'Skills come in clusters that cover one drift surface, not in singletons. A VP who ships singletons leaves drift gaps that swallow the gains. A VP who ships clusters closes the surface.',
    prerequisites: [8],
    relatedMilestones: [22, 21],
  },

  'rag-pgvector-substrate': {
    howWeGotThere:
      'Decision Log was 1700+ lines of markdown. Cross-session continuity was grep and pray. Cold-start could only carry 5 files. TF-IDF had carried the corpus for 9 months but hit its ceiling on semantic queries. Eugeen tried more aggressive TF-IDF boosts; gains plateaued at 75% hit rate. Tried OpenAI embeddings; rate limits hurt cost. Tried Pinecone; vendor lock-in scared him. The unlock was the M4 Max + Mac mini setup: Voyage 3 large embeddings (best at the time), Cohere Rerank 3 (cheap final-pass scorer), Supabase pgvector (open source, swap-able), custom FastMCP server on the Mac mini. Decision Log queryable in 200ms.',
    howThisCompounds:
      'Named the substrate every later layer reaches into. Items 22 (cold-start gate), 25 (wikis daemon), 28 (sleep consolidator), 29 (predictions engine) all sit on this corpus.',
    howToImplement: [
      'Download the pow-02-rag-knowledge-search pack (60 min activate). This is the heaviest install in the bundle.',
      'Set up Supabase + pgvector. Pick an embedding provider (Voyage, OpenAI, Cohere all work).',
      'Index your top 3 corpora: Decision Log, Skills, Outputs.',
      'Build a FastMCP server that wraps query + rerank into a single MCP call.',
      'Wire UserPromptSubmit hook to fire source-sweep on factual queries. Hit rate target: 85%+.',
    ],
    whyThisMatters:
      'The bottleneck is not memory volume, it is memory addressability. Most VPs scale memory by adding files. The right move is making the existing corpus queryable. After RAG ships, every higher layer (predictions, jury, sleep) becomes possible.',
    prerequisites: [4, 7],
    relatedMilestones: [22, 25, 28],
  },

  'task-reconciler-tier-zero': {
    howWeGotThere:
      'Bernie Resolution Capture had been killed earlier (too many false closures). Closures from meeting transcripts were not landing in Task Commander. Eugeen tried manual review of meetings against the open task list; took 30 min per meeting. Tried a keyword match (verb-based) closer; precision was 60%, false closures landed. The unlock was the multi-signal scorer: verb 0.25 + semantic 0.30 + entity 0.20 + speaker 0.15 + temporal 0.10. Threshold 0.75 to push, 0.50 to silent queue. Closure Candidates DB as the staging queue. Eugeen approval gates every flip.',
    howThisCompounds:
      'First skill that combined multi-signal scoring + staging DB + human approval gate + write-gate verifier in one trigger. Pattern reused in notion-write-gate (item 22), predictions verifier (item 28), audit dispatcher (item 29).',
    howToImplement: [
      'List a closure surface where corrections keep happening (task closures, decision tracking, change requests).',
      'Define 4 to 6 weak signals (verb match, semantic similarity, entity match, speaker authority, recency).',
      'Score each candidate with weighted signals. Set a push threshold (0.75) and a queue threshold (0.50).',
      'Build a staging DB (Notion works). Push high-confidence to flip; queue medium-confidence for human review.',
      'Track precision over 30 days. Adjust weights monthly until precision holds above 90%.',
    ],
    whyThisMatters:
      'Meetings became a closure source, not a write-only archive. Closures came with their narrative attached. For a VP, this is the gap between we discussed it and it is closed in the system with the decision logged.',
    prerequisites: [14],
    relatedMilestones: [22, 28, 29],
  },

  'cold-start-one-brain-gate': {
    howWeGotThere:
      "Cowork, Code, and Bernie kept drifting apart unless something forced them to share state every session. Eugeen had tried written advisory rules (read the Constitution at session start); compliance was 40%. Tried Custom Instructions reminders; surfaces ignored them after the first turn. Hard Rule violations only got caught after the fact, sometimes after the artifact shipped. Done meant API returned 200, which lied. Asymmetric enforcement made it worse: Code had a 5-layer Routing Gate, Cowork had little. The unlock was making the gate emit a visible verification stamp on its own line. If the stamp is missing, block the response. PreToolUse hooks block bad writes. PostToolUse hooks fetch back and diff. The user sees compliance, not promises.",
    howThisCompounds:
      'Master scaffold. Every later gate (HR #30 Tool-Use, HR #31 Context7, HR #34 Email Playbook at item 29) plugs into the One-Brain frame. Item 24 (Bernie migration), 26 (parallel autonomous), 28 (sleep consolidator) all assume the gate is enforced.',
    howToImplement: [
      'Download the pow-01-cold-start-protocol pack (90 min activate). This is the foundation pack.',
      'Write your Operating Constitution: identity, hard rules, routing rules, voice rules.',
      'Define a cold-start sequence: 4 to 6 files read in order, ending in a verification stamp.',
      'Wire a PreToolUse hook that blocks responses if the stamp is missing.',
      'Wire a PostToolUse hook that fetches back the resulting state and diffs against expected. Auto-remediate or escalate.',
      'Run for 30 days. Drift incidents should drop to near-zero by week 4.',
    ],
    whyThisMatters:
      'This eliminates the entire class of I fixed it false positives. Propagation-ledger turns rule-drift from weeks to detect to next session at most. For a VP, this is the gap between AI compliance theater and AI compliance reality.',
    prerequisites: [16, 19, 20],
    relatedMilestones: [23, 24, 28, 29],
  },

  'routing-gate-hr-24': {
    howWeGotThere:
      'Claude kept dropping deliverables in the wrong folder. CLAUDE.md said use routing-rules.md but nothing checked. Eugeen tried written reminders; ignored. Tried marking violation patterns red in the routing rules file; ignored. Tried a manual nightly cleanup script; it caught 60% of misses. The unlock was the 5-layer gate: Layer 1 PreToolUse hook hard-blocks. Layer 2 behavioral disclosure. Layer 3 PostToolUse renames any miss with a leading X mark. Layer 4 routing-rules authority. Layer 5 settings.local.json wiring. Same allowlist mirrored to Bernie via the R030 invariant.',
    howThisCompounds:
      'Lets every other rule trust the filesystem layout. 5-layer gate template later reused by HR #20 Notion Write, HR #25 One-Brain (item 22), HR #30 Tool-Use, HR #31 Context7, HR #34 Email Playbook (item 29).',
    howToImplement: [
      'Define your routing rules: which classification of output goes to which folder.',
      'Write a PreToolUse hook that blocks Write/Edit/cp/mv/touch when the destination is not in the allowlist.',
      'Write a PostToolUse hook that renames any misroute with a marker prefix so misses are visible.',
      'Mirror the hooks to every AI surface (Code, Bernie, Cowork via Custom Instructions where hooks are not available).',
      'Run weekly hygiene scan. Top-violators report drives the next iteration.',
    ],
    whyThisMatters:
      'Engine and warehouse must be separated. Generated outputs must not land inside the engine folder. A VP who lets routing drift ships an AI workspace that becomes a junk drawer in 60 days.',
    prerequisites: [22],
    relatedMilestones: [22, 29],
  },

  'bernie-migration-code-cli': {
    howWeGotThere:
      'Two Bernies were running: the OpenClaw stack on the Mac mini ($300 to $500/mo recurring on Anthropic API direct) plus M4 Max Claude Code as the interactive surface. They drifted weekly. Different skills, different routing rules, different hook configs. Eugeen tried syncing weekly; broke within 3 days. Tried versioning the OpenClaw config in git; only Eugeen pushed, drift returned. The unlock was collapsing Bernie to the same Claude Code CLI substrate on the Mac mini. Same skills, same hooks, same RAG corpus. iCloud-shared auto-memory for cross-platform recall. Plus a 643-line single-file canonical Stack Architecture v1.0 covering 3 platforms, 4 lanes, 7 memory surfaces, 25 Hard Rules, 35+ skills, 8 hooks, 7 gates, 14+ DBs.',
    howThisCompounds:
      'Multi-machine compounding. Bernie runs daemons. M4 Max runs interactive. Both share state through filesystem + Notion. iPhone is a thin client over the same brain. Item 26 (parallel autonomous overnight) became possible because tabs share state, not in-memory.',
    howToImplement: [
      'Audit your AI infrastructure cost. List every recurring AI subscription. If over $500/mo and growing, you have over-bought.',
      'Pick one canonical CLI substrate that runs on every machine you use (Claude Code works).',
      'Move all skills, hooks, and configs into the canonical substrate. Delete the legacy stack.',
      'Use iCloud (or Google Drive, OneDrive) as the shared memory layer.',
      'Write a single-file Stack Architecture doc that a fresh LLM can read in one pass and execute against.',
    ],
    whyThisMatters:
      '$300 to $500/mo eliminated. Drift class cut 70 to 80%. Cold-start onboarding for new LLMs drops from hours of file-reading to one paste. For a VP, this is the gap between AI infrastructure that compounds and AI infrastructure that bills you twice.',
    prerequisites: [22],
    relatedMilestones: [26, 28],
  },

  'notion-toolkit-and-wikis': {
    howWeGotThere:
      'Notion API calls were scattered across 6 daemon files. whoop-to-notion-sync, reconciler-service, meeting-extension all rolled their own notion_req with different retry logic. Schema drift only surfaced when writes failed in production. Wikis sat as static markdown nothing read. AI ecosystem topic queries fell back to training data, which was 9 months stale. Eugeen tried fixing each daemon individually; took a session each, drift returned. The unlock was layered shipping: one Notion client + one Pydantic model per active DB (code-generated) + wikis daemon + ingest path + query gate, all in one session. Plus a five-lane parallel Full Stack Audit through 12 lenses.',
    howThisCompounds:
      'Lets every higher-level skill trust Notion as a typed-record store, not JSON soup. Cohesive-layer ship cadence: ship the layer, not the components. Pattern reused by item 27 (HoistOS visual stack), item 29 (audit dispatcher), item 30 (Scrolophyte sprint).',
    howToImplement: [
      'Identify a layer where multiple components reroll the same logic (Notion calls, file routing, voice rules).',
      'Build one canonical client. Generate Pydantic models from live schemas.',
      'Migrate every component to use the canonical client in one session. Do not spread the migration.',
      'Add a query gate (UserPromptSubmit hook) that fires on relevant keywords and routes to fresh wiki or RAG.',
      'Run a stack audit through 5 to 12 lenses to validate the layer.',
    ],
    whyThisMatters:
      'Notion as a typed-record store, not JSON soup. AI-ecosystem topics answer from current wiki + RAG, not stale training. For a VP, this is the gap between AI that hallucinates 9-month-old facts and AI that knows what shipped yesterday.',
    prerequisites: [22],
    relatedMilestones: [27, 29, 30],
  },

  'parallel-autonomous-overnight': {
    howWeGotThere:
      'Single-session linear work hit a context ceiling at hour 4. The empire never compounded at single-session pace. Sleep was hours of zero throughput. Eugeen had been thinking about parallel sessions for 3 weeks: the math was obvious (10x throughput) but the coordination problem felt ugly. He tried opening 2 Claude Code tabs manually; they wrote to the same files and clobbered each other. The unlock was a coordination file: each tab owns a row range in the Code DB, writes its progress to a shared coordination.md, polls for all DONE before the merge gate fires. R028 Autonomous Loop became Lens 0 of R013, the first question every design has to answer.',
    howThisCompounds:
      'Coordination-file-based parallel-session pattern reused S192, Empire Wireframe S197, this Scrolophyte S198 (item 30). Every design now passes the Autonomous Loop gate first.',
    howToImplement: [
      'Pick a backlog of independent rows (Code DB, project list, audit findings).',
      'Partition the rows into N tabs, one tab per row range.',
      'Write a coordination.md file that each tab appends to on phase completion.',
      'Set a polling watcher that triggers the merge gate when all tabs report DONE.',
      'Run with bypassPermissions on full auto. Wake up to a merged result. Validate before shipping.',
    ],
    whyThisMatters:
      'Throughput multiplier: 15 ships overnight versus 1 to 2 per day attended. Sleep becomes net-positive output. For a VP, this is the gap between AI as a tool and AI as a 24-hour shift.',
    prerequisites: [22, 24],
    relatedMilestones: [28, 30],
  },

  'hoistos-visual-stack-code-db-gate': {
    howWeGotThere:
      'HoistOS lived as a vision but had no architectural plan. Every Claude-generated visual deliverable looked AI-generic: same shadcn primitives, same gradient backgrounds, same Tailwind opinions. Code Projects DB had recommended-but-not-required properties; 43.5% of rows passed the gate. Eugeen tried hardening property requirements one-by-one; broke historical rows. The unlock was three things shipped together: HoistOS as a 7-layer stack with 24-week build sequence, Visual Stack as a template repo, Code DB schema YAML promotion from recommended to required + retroactive backfill + drift-check enforcement. Plus an R031 inward-tool reuse audit standard.',
    howThisCompounds:
      'Every external-facing deliverable (HoistOS marketing, AI Authority posts, Empire timeline) fast-paths to studio-grade visual quality. Item 30 (Scrolophyte sprint) produced this very page, which would not exist without the visual stack template.',
    howToImplement: [
      'Audit your visual deliverables. If 50%+ look AI-generic, you have a substrate problem.',
      'Build a template repo with your brand tokens, your component library, your motion presets.',
      'Wire a /visualize-pro skill that scaffolds new packs from the template in 30 seconds.',
      'Define a Visual Triage rule: scan existing packs first, extend if 60%+ match, scaffold fresh otherwise.',
      'Promote DB properties from recommended to required only after retroactive backfill is complete.',
    ],
    whyThisMatters:
      '6+ months of greenfield avoided via reuse. 43.5 to 100% Code DB compliance in one session. For a VP, this is the gap between AI deliverables that look like AI and AI deliverables that look like the company.',
    prerequisites: [25],
    relatedMilestones: [30],
  },

  'sleep-consolidator-multi-model-jury': {
    howWeGotThere:
      'Episodic events scattered across Telegram, Whoop, email, Decision Log. No cross-event synthesis. Claude rebuilt context from scratch every cold-start. Claude-dominant stack at 100% primary, adversarial sanity check absent. Eugeen tried promoting episodic events to facts manually; took 20 min per session, missed half. Tried scheduled summarization; output was vague. The unlock was the sleep-time consolidator: launchd 04:00 ET nightly, scans last-N-days episodic rows for high-importance candidates, batches them for human approval. Plus a Multi-Model Jury (OpenAI as critic-only, never primary, $20/mo cost cap). On MAJOR_DISAGREE, challenge round fires.',
    howThisCompounds:
      'Sleep consolidator is the substrate that makes the brain compounding. Multi-model architecture pattern (dominant-primary + bounded-critic) reusable for any future model integration. Item 29 (audit dispatcher) extends the same pattern with mode-flag dispatch.',
    howToImplement: [
      'Download the pow-04-multi-model-jury pack (90 min activate).',
      'Set up an episodic events table (Supabase works). Capture from Telegram, calendar, email, Decision Log.',
      'Write a launchd daemon that runs at 04:00 ET nightly. Scan last 24 to 72 hours of events.',
      'Score events for facts-registry candidacy. High-confidence rows get pushed for human approval.',
      'Wire an OpenAI critic for high-stakes outputs only. Cost cap at $20/mo. On MAJOR_DISAGREE, hold the output for review.',
    ],
    whyThisMatters:
      'The system gets smarter while you sleep. Skill suggester surfaces relevant skills via cosine without manual slash command. False-positive Insight rate drops on borderline scores. For a VP, this is the gap between AI that runs and AI that learns.',
    prerequisites: [20, 22],
    relatedMilestones: [26, 29],
  },

  's195-audit-backlog-drain': {
    howWeGotThere:
      'S195 audit produced a 22-row backlog. Standard pattern would queue across multiple sessions. Plus the memory-only Email Playbook rule was being skipped at draft time (caught only on review). Plus single-CLI dependence (Claude Code only) created outage risk. Eugeen tried processing the backlog 3 rows per session; took 7 sessions and drift returned. Tried adding the email rule to memory; ignored. The unlock was the same-gate batch drain pattern: 22 rows shipped through one notion-write-gate session. Plus a PreToolUse hook on Gmail draft creation that exits 2 if the disclosure stamp is missing. Plus Codex CLI as a parallel pointer-based memory architecture mirroring ~/.claude/.',
    howThisCompounds:
      'Establishes audit-backlog-drain as a session archetype. Tool-gated PreToolUse pattern reusable for any tool-specific compliance gate. Cross-CLI handoff via Phase 18 cold-start.',
    howToImplement: [
      'Aggregate audit findings into a single backlog file. Stop processing them piecemeal across sessions.',
      'Process the entire backlog through one same-gate session. Use bypassPermissions where safe.',
      'For memory-only rules that get skipped, wire a PreToolUse hook that blocks the tool call.',
      'Set up a parallel CLI runtime (Codex, OpenAI Codex CLI, Cursor) as backup. Mirror memory files via symlink or pointer.',
      'Establish the archetype as a calendar invite. Quarterly backlog drain prevents drift compounding.',
    ],
    whyThisMatters:
      '~25,000 tokens freed per session from SKILL trims. Skill count 63 to 46. Email-rule violations eliminated at draft time, not send-time. For a VP, this is the gap between AI hygiene as a chore and AI hygiene as a session archetype.',
    prerequisites: [22],
    relatedMilestones: [10, 12, 23],
  },

  'scrolophyte-deep-sprint-now': {
    howWeGotThere:
      'V1 Empire Wireframe S197 night shipped a 3-treatment timeline + activation pack v1. The pack format was canonical but only proposal-builder existed as a pack. Distribution was vibes-based: post a link, hope the VP clicks. Eugeen tried promoting V1 manually; got 30 views and 2 forwards. The unlock was the V2 pivot: build the activation pack engine as a multi-tier product (4 + 4 + 4 + 4 = 16 packs), build site treatments in parallel, bundle the GitHub repo as the canonical artifact, run an auto-merge gate that polls all tabs to DONE before merge. Read it, install it, use it, in one continuous scroll. The deliverable IS the distribution method.',
    howThisCompounds:
      'R056 Scrolophyte Pattern: when the deliverable IS the distribution method, the timeline becomes the product. The system productizing itself. Direct ancestor for any future Empire-style longform: HoistOS marketing, AI Authority cornerstone post, Anthropic case study.',
    howToImplement: [
      'Identify a topic where you have 30+ chronological moments and 16+ codified outputs.',
      'Map each moment to a tier (beginner, intermediate, advanced, power) based on activation complexity.',
      'Build the site as a long-scroll with chapter breaks at the structural pivots.',
      'Bundle the actual installable artifacts (skills, scripts, configs) in a public repo.',
      'Run a parallel sprint with N tabs, coordination file, auto-merge gate. Ship the entire system in one weekend.',
    ],
    whyThisMatters:
      'Activation pack production cost: from one pack per overnight to 16 packs per morning. Distribution converts from vibes to structural. For a VP, this is the gap between AI content marketing and AI distribution-as-product.',
    prerequisites: [26, 27, 28],
    relatedMilestones: [],
  },
}

/**
 * Final export: 30 base items each enriched with their MilestoneDepth payload.
 * EmpireTimeline-d.tsx consumes TIMELINE_D_REAL and renders depth in the
 * expand-on-click tabbed sub-section per item.
 */
export const TIMELINE_D_REAL: TimelineDMoment[] = _TIMELINE_D_BASE.map(
  (item) => ({
    ...item,
    depth: MILESTONE_DEPTHS[item.id],
  }),
)

/**
 * Backwards-compat export: alias TIMELINE_D_REAL as the default loader.
 * EmpireTimeline-d.tsx imports this name.
 */
export const TIMELINE_D_MOCK = TIMELINE_D_REAL

// ---------------------------------------------------------------------------
// G5 Phase 1 (S198 morning, 2026-05-08): per-big-moment customization payloads.
//
// Maps each of the 6 isBigMoment items to a Loom slot, a custom 3D scene key,
// a custom shader key, and the position-context strip parameters. The render
// layer (EmpireTimeline-d.tsx BigMomentSection) reads this map by moment.id
// and forwards the payload to <BigMomentChapterBreak ... />.
//
// customSceneKey + customShaderKey are STRING TOKENS only here. Tab G5 Phase 2
// resolves each key into a real ReactNode in the BigMomentSceneRegistry (a
// thin lookup defined alongside the timeline renderer). Phase 1 ships the
// scaffolding only; Phase 2+ wires the actual scenes (see big-moment-polish.md).
// ---------------------------------------------------------------------------

export type BigMomentCustomSceneKey =
  | 'morphing-cursor-to-mark'
  | 'container-mock-screens'
  | 'animated-beam-five-skills'
  | 'memory-chunks-falling-fix'
  | 'terminal-typing-reveal'
  | 'parallel-tabs-progress'

export type BigMomentCustomShaderKey =
  | 'paper-tinted-noise'
  | 'compute-grid-noise'
  | 'lattice-network-noise'
  | 'memory-static-noise'
  | 'terminal-scanline-noise'
  | 'parallel-pulse-noise'

export interface BigMomentCustomization {
  /** Moment id (matches TimelineDMoment.id). */
  momentId: string
  /** 1-based index among big moments only (1 to 6). */
  bigMomentIndex: number
  /** Slug for the Loom poster + recording filenames at /public/looms/. */
  loomSlug: string
  /** Override Loom embed URL once recorded. Empty string while pending. */
  loomEmbedUrl: string
  /** Loom duration in seconds (90 standard for chapter recap). */
  loomDuration: number
  /** Title of the prior big moment (for the position context strip). */
  priorMomentTitle?: string
  /** Title of the next big moment. */
  nextMomentTitle?: string
  /** Custom 3D scene key, resolved at render. */
  customSceneKey: BigMomentCustomSceneKey
  /** Custom shader key, resolved at render. */
  customShaderKey: BigMomentCustomShaderKey
  /** Variant override (passed through to BigMomentChapterBreak). */
  variant: 'default' | 'memory' | 'code' | 'automation'
  /** Override the auto position label, e.g. when a big moment caps a chapter. */
  positionLabelOverride?: string
}

export const BIG_MOMENT_CUSTOMIZATIONS: BigMomentCustomization[] = [
  {
    momentId: 'cowork-projects-pinned-context',
    bigMomentIndex: 1,
    loomSlug: 'chat-to-cowork',
    loomEmbedUrl: '',
    loomDuration: 90,
    priorMomentTitle: undefined,
    nextMomentTitle: 'Cowork could organize the desktop',
    customSceneKey: 'morphing-cursor-to-mark',
    customShaderKey: 'paper-tinted-noise',
    variant: 'default',
  },
  {
    momentId: 'desktop-three-sweep-audit',
    bigMomentIndex: 2,
    loomSlug: 'cowork-takes-control',
    loomEmbedUrl: '',
    loomDuration: 90,
    priorMomentTitle: 'Cowork, Projects, and pinned context',
    nextMomentTitle: 'First skill ever: Memory Architect',
    customSceneKey: 'container-mock-screens',
    customShaderKey: 'compute-grid-noise',
    variant: 'automation',
  },
  {
    momentId: 'memory-architect-first-skill',
    bigMomentIndex: 3,
    loomSlug: 'skills-compounding',
    loomEmbedUrl: '',
    loomDuration: 90,
    priorMomentTitle: 'Cowork could organize the desktop',
    nextMomentTitle: 'Cold-start protocol + One-Brain Gate',
    customSceneKey: 'animated-beam-five-skills',
    customShaderKey: 'lattice-network-noise',
    variant: 'default',
  },
  {
    momentId: 'cold-start-one-brain-gate',
    bigMomentIndex: 4,
    loomSlug: 'memory-was-the-bottleneck',
    loomEmbedUrl: '',
    loomDuration: 90,
    priorMomentTitle: 'First skill ever: Memory Architect',
    nextMomentTitle: 'Bernie Migration: kill recurring + Stack Architecture',
    customSceneKey: 'memory-chunks-falling-fix',
    customShaderKey: 'memory-static-noise',
    variant: 'memory',
  },
  {
    momentId: 'bernie-migration-code-cli',
    bigMomentIndex: 5,
    loomSlug: 'move-to-code',
    loomEmbedUrl: '',
    loomDuration: 90,
    priorMomentTitle: 'Cold-start protocol + One-Brain Gate',
    nextMomentTitle: 'First parallel autonomous overnight',
    customSceneKey: 'terminal-typing-reveal',
    customShaderKey: 'terminal-scanline-noise',
    variant: 'code',
  },
  {
    momentId: 'parallel-autonomous-overnight',
    bigMomentIndex: 6,
    loomSlug: 'autonomous-loops-shipped',
    loomEmbedUrl: '',
    loomDuration: 90,
    priorMomentTitle: 'Bernie Migration: kill recurring + Stack Architecture',
    nextMomentTitle: undefined,
    customSceneKey: 'parallel-tabs-progress',
    customShaderKey: 'parallel-pulse-noise',
    variant: 'automation',
    positionLabelOverride: 'Moment 26 of 30 . 87% through your journey',
  },
]

/**
 * Lookup helper: returns the customization payload for a given moment id, or
 * undefined when the moment is not a big moment. Render layer should fall
 * back to safe defaults when undefined.
 */
export function getBigMomentCustomization(
  momentId: string,
): BigMomentCustomization | undefined {
  return BIG_MOMENT_CUSTOMIZATIONS.find((c) => c.momentId === momentId)
}

/**
 * Convenience: total count of big moments. EmpireTimeline-d.tsx uses this
 * for the position-context strip's `totalBigMoments` prop.
 */
export const TOTAL_BIG_MOMENTS = BIG_MOMENT_CUSTOMIZATIONS.length

/**
 * Convenience: total moments in the long-scroll. Used by the position
 * context strip to compute the percentage-through-your-journey readout.
 */
export const TOTAL_MOMENTS = TIMELINE_D_REAL.length
