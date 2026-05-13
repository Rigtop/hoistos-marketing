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
  },
  {
    packId: 'foundation-03-cold-start',
    badge: 'F-03',
    title: 'Cold Start Protocol',
    purpose: 'Every chat opens warm, with your role, top projects, and last session loaded.',
    layer: 'Memory',
    trigger: 'Open a fresh chat and ask a status question.',
    question: 'Status.',
    claudeDoes:
      'Returns a five-line briefing. Top three projects from the Registry, voice locked from the Constitution, last session\'s open items pulled from the Briefing field. You never re-explain your role to chat 47.',
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
