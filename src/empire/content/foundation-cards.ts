/**
 * Foundation pack content for the "Your installed system" page.
 *
 * S205 2026-05-13. Drives EmpireFoundationGrid (the new /foundation route
 * after the rebuild from chronological-timeline to per-pack installed-system
 * cards). Each entry mirrors a foundation pack in empireworks-bridge/packs/
 * foundation/F-NN <displayName>.md and surfaces:
 *
 *   - the pack id (used in the URL: /pack/:packId)
 *   - the visible name + 1-line purpose
 *   - a trigger phrase the VP types to invoke the behavior
 *   - a sample question the VP would ask
 *   - what Claude actually does in response (the holy-shit moment)
 *   - the 5-layer category this pack belongs to (matches the hero subhead)
 *
 * Source: empireworks-bridge/packs/foundation/*.md holyShitMomentDescription
 * fields, trimmed for VP readability. The same source is shipped to disk by
 * the Bridge `setup_foundation` tool, so this surface IS the documentation
 * for what the user actually has after the install.
 *
 * Hard Rule #11: zero em dashes.
 */

export interface FoundationCard {
  /** Stable id used in URL routes like /pack/:packId. */
  packId: string
  /** Two-letter shorthand for the badge (F-01, F-02, etc.). */
  badge: string
  /** Visible card title. */
  title: string
  /** One-line purpose, < 90 chars. */
  purpose: string
  /** Which of the five operating layers this pack belongs to. */
  layer: 'Voice' | 'Memory' | 'Sources' | 'Routing' | 'Validation'
  /** A trigger phrase the VP types to invoke the behavior. */
  trigger: string
  /** A sample VP question (the operator's input). */
  question: string
  /** What Claude does in response (one paragraph, no quotes). */
  claudeDoes: string
  /**
   * Customware placeholder tokens that appear in the pack body as
   * `{{TOKEN}}`. Sourced by grepping the corresponding pack markdown at
   * `public/packs-v2/foundation-NN-*.md`. Used by `src/lib/customware.ts` to
   * route per-pack mini-form questions plus intake defaults plus
   * `customware-defaults.json` fallbacks before clipboard write.
   *
   * Token names listed WITHOUT the surrounding braces, e.g. `VP_NAME` not
   * `{{VP_NAME}}`.
   */
  customwarePlaceholders: string[]
  /**
   * One-line "what Claude knows after this pack installs." Drives the
   * JourneyTracker side-panel state delta visualization. Plain English,
   * present tense, no em dashes. Derived from the pack body
   * `holyShitMomentDescription` frontmatter field, compressed to one line.
   */
  claudeStateDelta: string
  /**
   * Next-best pack ids that compound on top of this one. Used by
   * `src/lib/compounding-ranker.ts` to pick the "Your next three" panel
   * after each install. Ordering matters: index 0 is the strongest fit.
   * Matches the journey order in the 2026-05-15 reversal plan.
   */
  compoundingPartnerIds: string[]
  /**
   * Outcomes this pack serves, matching the intake Q3 outcomes ranking
   * list. Used by `src/lib/compounding-ranker.ts` to rank packs against
   * the user's top intake outcomes. Vocabulary mirrors the intake form:
   * "faster proposals", "faster emails", "contract risk", "meeting
   * capture", "decision tracking", "team enablement", "expense
   * automation", "knowledge search", "voice to task", "rag retrieval",
   * "custom".
   */
  outcomeTags: string[]
}

export const FOUNDATION_CARDS: FoundationCard[] = [
  {
    packId: 'foundation-01-constitution',
    badge: 'F-01',
    title: 'Operating Constitution',
    purpose: 'Your voice, identity, and non-negotiables locked into every Claude reply.',
    layer: 'Voice',
    trigger: 'Draft a follow-up to a GC on a stalled RFI.',
    question: 'Draft a follow-up to my GC on the abatement schedule slip.',
    claudeDoes:
      'Drafts the email in your voice. No em dashes. No canned openers. Company name in full. Signs with your first name, not "Best." The Constitution polices the line before you do.',
    customwarePlaceholders: [
      'VP_NAME',
      'VP_ROLE',
      'VP_TITLE',
      'COMPANY_NAME',
      'DIVISION',
      'TOP_RULES',
      'ROLE_SPECIFIC_HARD_RULE',
      'DEFAULT_AUDIENCE',
      'COMMS_STYLE_OR_DEFAULT',
      'EMAIL_SIGN',
      'EXTRA_CONTEXT',
    ],
    claudeStateDelta:
      'Voice rules and identity locks fire on every reply. No em dashes, no canned openers, company name in full, signs with your first name.',
    compoundingPartnerIds: [
      'foundation-02-facts-registry',
      'foundation-09-output-validator',
      'foundation-10-email-playbook',
    ],
    outcomeTags: ['faster emails', 'faster proposals', 'team enablement'],
  },
  {
    packId: 'foundation-02-facts-registry',
    badge: 'F-02',
    title: 'Facts Registry',
    purpose: 'Canonical names, roles, and entities Claude pulls from instead of guessing.',
    layer: 'Memory',
    trigger: 'Reference a person or vendor by role.',
    question: 'Who is my CFO?',
    claudeDoes:
      'Answers from the Registry, not from training. Pulls your CEO, your bookkeeper, your CPA, and flags missing roles instead of inventing one. You stop retyping names. Claude stops hallucinating them.',
    customwarePlaceholders: [
      'VP_NAME',
      'VP_FULL_NAME',
      'VP_TITLE',
      'VP_PHONE',
      'COMPANY_NAME',
      'DIVISION',
      'HQ_LOCATION',
      'OFFICE_ADDRESS',
      'EMPLOYEE_COUNT_PUBLIC',
      'FISCAL_YEAR_START',
      'CEO_NAME_PHONE',
      'KEY_TEAM',
      'BOOKKEEPER_OR_CPA',
      'TOP_3_TEAMMATES',
      'TOP_3_CONTACTS',
      'TOP_3_EXTERNAL',
      'TOP_3_GCS',
      'TOP_3_PROJECTS',
      'TOP_3_PRIORITIES',
      'TOP_3_COMPLIANCE_CONTACTS',
      'TOP_3_COMPLIANCE_PROJECTS',
      'TOP_3_FIELD_REPORTS',
      'ACTIVE_GCS',
      'ACTIVE_PROJECTS',
      'BID_PIPELINE_DIVISIONS',
      'TOP_CBAS_PLAS',
      'APPRENTICE_RATIO',
      'CREW_SIZE_RANGE',
      'SCHEDULE_RANGE',
      'TARGET_DEAL_SIZE',
      'WEEKLY_METRIC',
      'INTEGRATIONS',
      'VOLATILE_CONTEXT',
      'ROLE_CONDITIONAL_BLOCK',
      'EXTRA_CONTEXT',
      'N',
    ],
    claudeStateDelta:
      'Canonical names lock for people, companies, GCs, and projects. Claude answers from the Registry instead of training. Missing roles get flagged, not invented.',
    compoundingPartnerIds: [
      'foundation-03-cold-start-protocol',
      'foundation-04-decision-log',
      'foundation-08-source-sweep',
    ],
    outcomeTags: [
      'faster proposals',
      'faster emails',
      'meeting capture',
      'decision tracking',
      'knowledge search',
    ],
  },
  {
    packId: 'foundation-03-cold-start-protocol',
    badge: 'F-03',
    title: 'Cold Start Protocol',
    purpose: 'Every chat opens warm, with your role, top projects, and last session loaded.',
    layer: 'Memory',
    trigger: 'Open a fresh chat and ask a status question.',
    question: 'Status.',
    claudeDoes:
      'Returns a five-line briefing. Top three projects from the Registry, voice locked from the Constitution, last session\'s open items pulled from the Briefing field. You never re-explain your role to chat 47.',
    customwarePlaceholders: [
      'VP_FULL_NAME',
      'VP_TITLE',
      'COMPANY_NAME',
      'DIVISION',
      'TOP_FOCUS',
      'TOP_OPEN_ITEM',
      'PROJECT_ON_WATCH',
      'PENDING_DECISION',
      'OWED_FOLLOWUP',
      'RECENT_DECISION',
      'RECENT_WIN_LOSS',
      'OPEN_RFI_SUBMITTAL',
      'CHANGE_ORDER',
      'CERTIFIED_PAYROLL',
      'COMPLIANCE_QUESTION',
      'CLASSIFICATION_ISSUE',
      'UPCOMING_AUDIT',
      'BLOCKED_DEAL',
      'BD_WEEKLY_METRIC',
      'ROLE_BRANCH_FIELD_1',
      'ROLE_BRANCH_FIELD_2',
      'ROLE_BRANCH_FIELD_3',
      'ROLE_BRANCH_FIELD_4',
      'WEEKLY_SNAPSHOT_TEMPLATE',
      'REFRESH_DAY',
      'SUPPRESS_TOPIC',
      'EXTRA_CONTEXT',
      'N',
      'N_FACTS',
    ],
    claudeStateDelta:
      'Session boot ritual fires on every fresh chat. Role, top projects, last open items load before the first reply. Identity reanchor cadence keeps drift down.',
    compoundingPartnerIds: [
      'foundation-09-output-validator',
      'foundation-04-decision-log',
      'foundation-08-source-sweep',
    ],
    outcomeTags: ['decision tracking', 'meeting capture', 'team enablement', 'knowledge search'],
  },
  {
    packId: 'foundation-04-decision-log',
    badge: 'F-04',
    title: 'Decision Log',
    purpose: 'Every decision recorded with context. Recallable months later, word for word.',
    layer: 'Memory',
    trigger: 'Ask Claude to remember why you decided something.',
    question: 'What did I decide about pricing on the prevailing-wage in-unit work last month?',
    claudeDoes:
      'Pulls the log entry word for word. When you decided. Why. What alternatives you rejected. You forward it to the GC. The GC stops re-asking.',
    customwarePlaceholders: [
      'VP_NAME',
      'VP_NAME_FIRST',
      'VP_ROLE',
      'VP_DIVISION',
      'VP_FY_END',
      'VP_TOP_PROJECTS',
      'VP_REASON_CODES',
      'VP_RECALL_FORMAT',
      'LOG_SCOPE',
      'QUARTER_LABEL',
      'FISCAL_YEAR',
      'REPLAY_CADENCE',
      'VISIBILITY',
      'SEED_DECISION',
      'EXTRA_CONTEXT',
    ],
    claudeStateDelta:
      'Decision log with tags fires on every ruling. When, why, and the alternatives rejected get captured. Recallable months later, word for word.',
    compoundingPartnerIds: [
      'foundation-07-memory-architecture',
      'foundation-08-source-sweep',
      'foundation-11-notion-write-gate',
    ],
    outcomeTags: ['decision tracking', 'meeting capture', 'contract risk', 'team enablement'],
  },
  {
    packId: 'foundation-05-skill-builder',
    badge: 'F-05',
    title: 'Skill Builder',
    purpose: 'Build custom skills in your business in minutes, not engineering sprints.',
    layer: 'Routing',
    trigger: 'Ask Claude to package a workflow as a reusable skill.',
    question: 'I keep writing change orders the same way. Can you make a skill for that?',
    claudeDoes:
      'Walks you through the eight-minute skill build. The next change order takes four minutes. By Friday you have shipped seven and stopped asking HoistOS for new packs.',
    customwarePlaceholders: [
      'VP_NAME',
      'VP_NAME_FIRST',
      'VP_ROLE',
      'VP_DIVISION',
      'VP_DIVISION_SLUG',
      'VP_NAMING_CONVENTION',
      'VP_VALIDATE_DEFAULT',
      'VP_AUTO_LOG_BUILDS',
      'TOP_WORKFLOW',
      'SKILL_DISPLAY_NAME',
      'SKILL_NAME_SLUG',
      'SKILL_VERB',
      'SKILL_NOUN',
      'ONE_SENTENCE_DESCRIPTION',
      'ACTION_DESCRIPTION_EXPANDED',
      'TRIGGER_PHRASE',
      'KEYWORD_LIST',
      'TASK_INTENT',
      'SUCCESS_CRITERIA',
      'OUTPUT_FORMAT',
      'HARD_CONSTRAINT',
      'TODAYS_DATE',
      'EXTRA_CONTEXT',
    ],
    claudeStateDelta:
      'Meta-skill goes live. You can package any recurring workflow as a reusable skill. Compounding multiplier: the library grows because you build your own bricks.',
    compoundingPartnerIds: [
      'foundation-06-routing-rules',
      'foundation-09-output-validator',
      'foundation-10-email-playbook',
    ],
    outcomeTags: ['team enablement', 'faster proposals', 'faster emails', 'custom'],
  },
  {
    packId: 'foundation-06-routing-rules',
    badge: 'F-06',
    title: 'Routing Rules',
    purpose: 'Claude knows where every file belongs before it writes.',
    layer: 'Routing',
    trigger: 'Tell Claude to save multiple deliverables in one breath.',
    question:
      'Save the change order, the GC follow-up, the safety SOP, and tomorrow\'s daily report.',
    claudeDoes:
      'Drops four files into four different folders. Each one landed correctly. You never type a folder path again.',
    customwarePlaceholders: [
      'VP_NAME',
      'VP_ROLE',
      'DIVISION',
      'ROLE_FOCUS',
      'WORK_TYPES',
      'ACTIVE_PROJECTS',
      'TOP_CATEGORIES',
      'CATEGORY_DESTINATIONS',
      'NAMING_CONVENTION',
      'CONFIDENCE_THRESHOLDS',
      'MISROUTE_ACTION',
      'HARD_BLOCK_RULE',
      'NEVER_TOUCH',
      'PERSONAL_SCOPE',
      'ISOLATION_LANE',
      'EXTRA_CONTEXT',
    ],
    claudeStateDelta:
      'Routing rules fire on every save. Files land in the right folder before you ask. On Code CLI the rules fire at the OS level; on browser they fire at the chat level.',
    compoundingPartnerIds: [
      'foundation-07-memory-architecture',
      'foundation-11-notion-write-gate',
      'foundation-09-output-validator',
    ],
    outcomeTags: ['team enablement', 'decision tracking', 'custom'],
  },
  {
    packId: 'foundation-07-memory-architecture',
    badge: 'F-07',
    title: 'Memory Architecture',
    purpose: 'Corrections compound. Tell Claude once, it carries forward forever.',
    layer: 'Memory',
    trigger: 'Correct Claude on a fact.',
    question: 'The owner-builder is the architect on Southbridge Towers, not the GC.',
    claudeDoes:
      'Captures the correction to a topic file. Fresh chat tomorrow morning, you ask about Southbridge submittals, Claude writes "owner-builder (architect)" on first reference. No prompt. No reminder. The mistake is dead.',
    customwarePlaceholders: [
      'USER_NAME',
      'USER_TITLE',
      'COMPANY_NAME',
      'MEMORY_SCOPE',
      'EPHEMERAL_SCOPE',
      'AUDIT_CADENCE',
      'SEED_RULE',
      'ISO_DATE',
      'Q4_HARD_CORRECTION_SUMMARY',
      'Q5_DECISION_STYLE',
      'Q6_AUDIT_CADENCE',
      'Q8_FILE_PREFIXES',
      'Q10_STALE_DAYS',
      'Q11_CONTRADICTION_HANDLING',
      'Q12_MAX_FILE_KB',
      'Q14_SEED_ENTRY_SUMMARY',
      'EXTRA_CONTEXT',
    ],
    claudeStateDelta:
      'Persistent memory layer goes live. Corrections compound across chats. Tell Claude on Tuesday, the lesson holds Wednesday in a fresh session. Full power on Code CLI.',
    compoundingPartnerIds: [
      'foundation-04-decision-log',
      'foundation-11-notion-write-gate',
      'foundation-08-source-sweep',
    ],
    outcomeTags: ['decision tracking', 'meeting capture', 'knowledge search', 'team enablement'],
  },
  {
    packId: 'foundation-08-source-sweep',
    badge: 'F-08',
    title: 'Pre-Answer Source Sweep',
    purpose: 'Factual claims hit your trusted sources first, not Claude\'s training.',
    layer: 'Sources',
    trigger: 'Ask a factual or who-said-what question.',
    question:
      'Who is our compliance contact at the GC, and what did we agree on the abatement schedule slip last Thursday?',
    claudeDoes:
      'Does not guess. Does not invent. Returns a Source Sweep stamp showing Notion hits, Gmail hits, RAG hits, canonical hits, and the primary source. Quotes the exact email line. Citation, not hallucination.',
    customwarePlaceholders: [
      'USER_NAME',
      'SOURCE_LANES',
      'CANONICAL_FILES',
      'CANONICAL_COMPLIANCE',
      'NOTION_DB',
      'LIVE_PROJECT',
      'LIVE_PROJECTS',
      'TOP_GCS',
      'EXEC_LOGS',
      'SURFACES_RESOLVED',
      'TIE_BREAKER_SOURCE',
      'CONFIDENCE_FLOOR',
      'UNCERTAINTY_FORMAT',
      'REFERENCE_QUESTION',
      'EXTRA_CONTEXT',
    ],
    claudeStateDelta:
      'Pre-answer source sweep fires on every factual claim. Notion, Gmail, RAG, canonical files get scanned and stamped before the reply. No guesses, no hallucinations.',
    compoundingPartnerIds: [
      'foundation-09-output-validator',
      'foundation-04-decision-log',
      'foundation-11-notion-write-gate',
    ],
    outcomeTags: [
      'contract risk',
      'knowledge search',
      'rag retrieval',
      'decision tracking',
      'meeting capture',
    ],
  },
  {
    packId: 'foundation-09-output-validator',
    badge: 'F-09',
    title: 'Output Validator',
    purpose: 'Drafts get checked before they reach a client or team thread.',
    layer: 'Validation',
    trigger: 'Ask Claude to draft any external-facing deliverable.',
    question: 'Draft a follow-up to my GC on the abatement schedule slip, mention I am out Friday.',
    claudeDoes:
      'Drafts it. Catches an em dash in paragraph two. Catches a misspelled person name. Rewrites both. Runs the gate again. Ships the validated version. The version that would have embarrassed you never reaches your eyes.',
    customwarePlaceholders: [
      'VP_NAME',
      'VP_ROLE',
      'VP_DIVISION',
      'VALIDATE_FIRES_ON',
      'VALIDATED_CATEGORIES',
      'MANDATORY_CHECKS',
      'MIN_SELF_RATING',
      'RATING_THRESHOLD',
      'CUSTOM_BANNED_PHRASES',
      'PEOPLE_LIST',
      'ROUTING_STRICTNESS',
      'ROUTING_BLOCKED_OR_WARNED',
      'EMAIL_GATE_MODE',
      'AUDIT_LOG_LOCATION',
      'EXTRA_CONTEXT',
    ],
    claudeStateDelta:
      'Pre-delivery voice and identity gate fires before any draft lands. Em dashes caught, names verified, banned patterns swept. The version that would have embarrassed you never reaches your eyes.',
    compoundingPartnerIds: [
      'foundation-10-email-playbook',
      'foundation-11-notion-write-gate',
      'foundation-08-source-sweep',
    ],
    outcomeTags: ['faster proposals', 'faster emails', 'contract risk', 'team enablement'],
  },
  {
    packId: 'foundation-10-email-playbook',
    badge: 'F-10',
    title: 'Email Playbook',
    purpose: 'Audience-aware email drafting. GC voice, sub voice, compliance voice.',
    layer: 'Voice',
    trigger: 'Ask Claude to draft an email by trade type.',
    question: 'ETC RFI.',
    claudeDoes:
      'Ships back a complete RFI cover email on your letterhead format, addressed to the right person at ETC, in your voice for that audience tier, signed correctly, ready to send. Eight seconds. You do it five more times before lunch.',
    customwarePlaceholders: [
      'VP_NAME',
      'VP_TITLE',
      'VP_PHONE',
      'VP_WEBSITE',
      'COMPANY',
      'ROLE_FOCUS',
      'AUDIENCE_TIERS',
      'BANNED_PHRASES',
      'DEFAULT_CC',
      'DEFAULT_SIGNOFF',
      'VARIANT_SIGNOFFS',
      'SIGNATURE_BLOCK',
      'SHORTCUT_PHRASES',
      'VARIABLES',
    ],
    claudeStateDelta:
      'Tier-aware email register fires on every draft. Audience ladder (GC, sub, owner, compliance) gets matched. Signature, CC defaults, and banned phrases lock per audience.',
    compoundingPartnerIds: [
      'foundation-09-output-validator',
      'foundation-08-source-sweep',
      'foundation-05-skill-builder',
    ],
    outcomeTags: ['faster emails', 'faster proposals', 'team enablement'],
  },
  {
    packId: 'foundation-11-notion-write-gate',
    badge: 'F-11',
    title: 'Notion Write Gate',
    purpose: 'Notion updates verified post-write. Done means the field actually flipped.',
    layer: 'Validation',
    trigger: 'Ask Claude to update a Notion property.',
    question: 'Close out the abatement-schedule RFI in Notion.',
    claudeDoes:
      'Executes the property update. Reads the row back. Catches that Status is still Open because of a hidden formula dependency. Sets the Resolution Date. Reads back again. Confirms Status flipped to Closed. Reports done. You never chase the gap again.',
    customwarePlaceholders: [
      'TOP_DBS',
      'HIGH_STAKES_DB',
      'FAILURE_NOTIFICATION',
      'EXTRA_CONTEXT',
    ],
    claudeStateDelta:
      'Post-write verify fires on every Notion update. Claude reads the row back, catches hidden formula dependencies, sets dependent fields, confirms the flip. Done means done.',
    compoundingPartnerIds: [
      'foundation-09-output-validator',
      'foundation-04-decision-log',
      'foundation-08-source-sweep',
    ],
    outcomeTags: ['decision tracking', 'meeting capture', 'team enablement', 'knowledge search'],
  },
]

/** Layer color tokens (signal-orange variants). Used by the grid card border / accent. */
export const LAYER_TOKENS: Record<FoundationCard['layer'], { color: string; bg: string }> = {
  Voice: { color: '#cc6e2e', bg: 'rgba(204,110,46,0.10)' },
  Memory: { color: '#a5550a', bg: 'rgba(165,85,10,0.10)' },
  Sources: { color: '#7a3f08', bg: 'rgba(122,63,8,0.10)' },
  Routing: { color: '#e07c34', bg: 'rgba(224,124,52,0.10)' },
  Validation: { color: '#b35d18', bg: 'rgba(179,93,24,0.10)' },
}
