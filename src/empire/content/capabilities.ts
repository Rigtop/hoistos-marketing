/**
 * Capabilities content registry.
 *
 * S205 iteration 3 (2026-05-13): extracted from EmpireLanding.tsx into a
 * shared content module so EmpireCapabilityLayer.tsx (the new per-layer
 * route at /empireworksreconstruction/layer/:layerSlug) can render the
 * same data as a real page with native scroll. The modal approach in
 * iteration 2 had scroll containment issues inside webpages; routes solve
 * that structurally.
 *
 * Each capability maps to one of the 6 operating layers shown on the
 * landing page card grid. The packs[] array shows the actual bridge packs
 * that power the layer (sourced from empireworks-bridge/packs/foundation
 * plus the advanced / business / power tiers for the Stack card).
 *
 * Icon refs are lucide-react named exports. Consumers import them at the
 * call site (CapabilityCard, EmpireCapabilityLayer) rather than embedding
 * components in the data file, keeping this module pure data.
 *
 * Hard Rule #11: zero em dashes in this file.
 */

export type CapabilityLayer =
  | 'Voice'
  | 'Memory'
  | 'Routing'
  | 'Sources'
  | 'Validation'
  | 'Stack'

export interface Capability {
  layer: CapabilityLayer
  /** URL slug for the layer route. lowercase, no spaces. */
  slug: string
  /** Lucide icon NAME. Consumers map name -> component. */
  iconName: 'Shield' | 'Brain' | 'Compass' | 'Search' | 'BadgeCheck' | 'Layers'
  title: string
  /** Surface tagline shown on the resting card. < 80 chars. */
  tagline: string
  /** Two- to three-sentence body shown in the layer page hero. */
  body: string
  /** Concrete Monday-morning scenario the VP will recognize. */
  mondayMorning: string
  /** Why this compounds week over week. */
  compounding: string
  /** Which actual bridge packs power this layer. */
  packs: { badge: string; name: string }[]
  /** Single proof line. */
  proof: string
}

export const CAPABILITIES: Capability[] = [
  {
    layer: 'Voice',
    slug: 'voice',
    iconName: 'Shield',
    title: 'Rules locked',
    tagline: 'Your voice on every reply.',
    body: 'Your voice, your title, your company name, your banned phrases, and your signing conventions get enforced on every Claude reply. No more reading drafts to police em dashes or "Best,". Claude polices itself.',
    mondayMorning:
      'Monday morning, you ask Claude to draft a follow-up to your largest GC on a stalled RFI. The reply lands clean. No em dashes. No "I hope this email finds you well." Company name in full. Signs with your first name. You forward it without reading twice.',
    compounding:
      'Every voice correction you make to Claude becomes a permanent rule. The Constitution updates. Next month the drafts get sharper because the rules tightened. Year one you stop policing the line entirely.',
    packs: [
      { badge: 'F-01', name: 'Operating Constitution' },
      { badge: 'F-10', name: 'Email Playbook (audience-aware)' },
    ],
    proof: 'No em dashes. No canned openers. Signs as you, not "Best,".',
  },
  {
    layer: 'Memory',
    slug: 'memory',
    iconName: 'Brain',
    title: 'Memory compounds',
    tagline: 'Tell it once. Forever.',
    body: 'Corrections, decisions, people, projects, vendors, and roles stay loaded across every Claude chat. The thing you taught Claude on Tuesday is still true in chat 47 on Friday. The thing you decided last month is one question away.',
    mondayMorning:
      'You open a fresh chat at 7:42 AM, type one word: "status." Claude returns a 5-line briefing: top 3 projects pulled from your Registry, voice locked, last session\'s open items pulled from the Briefing field. You have not re-explained your role to Claude since chat 12. You hit reply on three threads before coffee.',
    compounding:
      'Every correction compounds. Every fact lands in the Registry. Every decision lands in the Log. Week 1: a tool. Week 12: a system that remembers your business better than half your team. Year 1: an institutional memory layer your senior people can lean on.',
    packs: [
      { badge: 'F-02', name: 'Facts Registry (canonical names + roles)' },
      { badge: 'F-03', name: 'Cold Start Protocol (warm open every chat)' },
      { badge: 'F-04', name: 'Decision Log (recallable months later)' },
      { badge: 'F-07', name: 'Memory Architecture (corrections compound)' },
    ],
    proof: 'Tell Claude once. It carries forward forever, with citation.',
  },
  {
    layer: 'Routing',
    slug: 'routing',
    iconName: 'Compass',
    title: 'Routing knows where',
    tagline: 'Right folder, every time.',
    body: 'Claude knows the right folder before you ask. Change orders go to /change-orders. GC follow-ups go to /correspondence. RFIs go to /rfi. SOPs go to /sop. You stop typing paths. Claude stops asking.',
    mondayMorning:
      'You type "save the change order, the GC follow-up, the safety SOP, and tomorrow\'s daily report." Claude saves four files to four different folders. Each landed correctly. You did not name a path. You did not approve four save prompts. Three minutes later you are onto the next thing.',
    compounding:
      'Skills get built on top of the routing layer. By month three, you have a /change-order skill, a /proposal skill, a /daily-report skill. Same Bridge. Same routing. Your division operates on rails. Onboarding gets cut in half.',
    packs: [
      { badge: 'F-06', name: 'Routing Rules (folder routing engine)' },
      { badge: 'F-05', name: 'Skill Builder (build skills in 8 minutes)' },
    ],
    proof: 'Saves change order, GC follow-up, SOP, and daily report to four correct paths.',
  },
  {
    layer: 'Sources',
    slug: 'sources',
    iconName: 'Search',
    title: 'Source-checked first',
    tagline: 'Citation, not hallucination.',
    body: 'Factual questions hit your trusted sources before Claude\'s training. Notion. Gmail. Your file system. Your RAG corpus. Your canonical contracts. Claude returns a stamped Source Sweep showing the hit count per surface and the primary source quoted in full.',
    mondayMorning:
      'You ask "who is our compliance contact at the GC on the renovation project, and what did we agree on the schedule slip last Thursday?" Claude returns "Source Sweep: Notion 2 hits, Gmail 1 hit, RAG 4 hits, primary source: Gmail thread with the GC PM 2026-05-08" and quotes the exact line you agreed to. You forward the quote. The GC stops re-asking.',
    compounding:
      'Every email, every Notion update, every meeting transcript that lands in your stack becomes citable. The Source Sweep gets richer every week. Your "I think we said..." problem dies. Your audit trail gets free.',
    packs: [{ badge: 'F-08', name: 'Pre-Answer Source Sweep (citation gate)' }],
    proof: 'Returns a Source Sweep stamp with hit counts and the primary source quoted in full.',
  },
  {
    layer: 'Validation',
    slug: 'validation',
    iconName: 'BadgeCheck',
    title: 'Validation gate',
    tagline: 'The pre-send safety net.',
    body: 'Every external-facing draft hits a validation gate before you see it. Em dashes, misspelled names, banned phrases, missing disclosures, wrong audience tier, broken citations: all caught by the gate. Claude rewrites, re-runs, and ships clean.',
    mondayMorning:
      'You ask Claude to draft a follow-up to your top GC contact on the abatement slip, mention you are out Friday. Claude drafts it. Catches an em dash in paragraph two. Catches "Spenser" should be "Spencer". Rewrites both. Re-runs the gate. The version you see is the version that would not have embarrassed you.',
    compounding:
      'Every validator catch becomes a rule. The gate gets smarter every week. Year one, the validation gate runs on every email, every proposal, every Notion update, every external deliverable. The "oh no I sent that" problem dies.',
    packs: [
      { badge: 'F-09', name: 'Output Validator (pre-send gate)' },
      { badge: 'F-11', name: 'Notion Write Gate (post-write verify)' },
    ],
    proof: 'Catches the mistake that would have embarrassed you. Rewrites. Re-runs. Ships clean.',
  },
  {
    layer: 'Stack',
    slug: 'stack',
    iconName: 'Layers',
    title: 'Packs stack on top',
    tagline: 'Foundation now. Everything else, later.',
    body: 'Foundation lands first. 11 packs across 5 operating layers. Once that is rolling, advanced packs (proposal builder, RFI flow, change orders, meeting capture, document prep, contract risk, multi-model jury, RAG search) layer onto the same Bridge with no reinstall. You just ask for more.',
    mondayMorning:
      'Three weeks after Foundation lands, you type "I want Claude to write proposals in our voice on our letterhead". The Bridge installs A-01 Proposal Builder in 60 seconds. Five minutes after that you have shipped your first AI-drafted proposal to a real client. No new setup. No new account. No new install.',
    compounding:
      '33 packs available today. New packs ship every month. Your division\'s competitive moat is the stack you build, not the model you pay for. Year one you have a custom AI operating layer no GC competitor can match.',
    packs: [
      { badge: 'A-01', name: 'Proposal Builder (branded, your division)' },
      { badge: 'A-02', name: 'Meeting Transcript to Action Items' },
      { badge: 'A-03', name: 'Contract Risks in Plain English' },
      { badge: 'BIZ-01', name: 'Notion + MCP Setup' },
      { badge: 'BIZ-02', name: 'Email to Notion Pipeline' },
      { badge: 'P-02', name: 'RAG Knowledge Search' },
      { badge: 'P-04', name: 'Multi-Model Jury (GPT-5 adversarial review)' },
    ],
    proof: 'Same Bridge. Same install. You just ask for more.',
  },
]

export function findCapabilityBySlug(slug: string): Capability | undefined {
  return CAPABILITIES.find((c) => c.slug === slug.toLowerCase())
}
