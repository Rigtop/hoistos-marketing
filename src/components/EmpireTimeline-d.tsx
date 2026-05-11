/**
 * EmpireTimeline-d (C-v2 rebuild, S199, 2026-05-09).
 *
 * Replaces the prior 1629-line Scrolophyte component. Renders the C-v2
 * design language exclusively. Source of truth for the design contract:
 * `~/Desktop/HoistOS-Mockup-Preview/index.html`.
 *
 * Sections (top to bottom):
 *   1. Hero (eyebrow, h1, lede).
 *   2. Foundation Packs (10, "Start Here"). Single-column, click-to-expand
 *      with Framer Motion layout transition. Activation zone copies the
 *      bootstrap markdown to clipboard, opens claude.ai, fires a toast.
 *   3. Divider into "Or read the journey from start to today".
 *   4. Chronological 30-row compact table. Each row click-to-expand.
 *
 * Design rules enforced (locked):
 *   - Newsreader serif, no other typeface.
 *   - Parchment #f5f4ed bg, #141413 ink, #cc6e2e signal.
 *   - ZERO em dashes anywhere.
 *   - Always "Perennial Empire" in full. Two-letter form BANNED.
 *   - Vertical single-column stacks, no scroll-jacking, no IntersectionObserver.
 *
 * Hard Rule #11: zero em dashes.
 * Hard Rule #31 disclosures (this file):
 *   Context7: motion@12.38.0 (existing dep). motion/react exports motion.<el>,
 *   AnimatePresence, Variants. layout/initial/animate/exit/variants/whileHover
 *   props per current v12 docs (verified via context7 query 2026-05-08).
 *   Context7: react@19.2.5 (existing dep). useEffect/useMemo/useState stable.
 *   Context7: react-hot-toast@2.6.0 (existing dep). Default export with
 *   .success(msg) and .error(msg). Already wired in EmpireTimelinePage.tsx.
 */

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'motion/react'
import toast from 'react-hot-toast'
import type { TimelineDMoment } from '../empire/content/timeline-d-real'
import { EmpirePreflight } from '../empire/EmpirePreflight'
import {
  buildCodeCliInstallCommand,
  buildDeepLinkForPack,
  readTier,
  writeTier,
  type ClaudeTier,
} from '../empire/lib/claude-deep-link'

// ---------------------------------------------------------------------------
// Brand tokens.
// ---------------------------------------------------------------------------

const BRAND = {
  paper: '#f5f4ed',
  paper2: '#efeee5',
  ink: '#141413',
  ink2: '#3a3a36',
  ink3: '#5e5d59',
  ink4: '#9c9b97',
  rule: 'rgba(20,20,19,0.1)',
  rule2: 'rgba(20,20,19,0.18)',
  signal: '#cc6e2e',
  signal2: '#b85e22',
  signalSoft: 'rgba(204,110,46,0.08)',
  signalGlow: 'rgba(204,110,46,0.35)',
  font: "'Newsreader', serif",
}

// ---------------------------------------------------------------------------
// Foundation pack manifest.
// ---------------------------------------------------------------------------

interface FoundationPack {
  id: string
  title: string
  explanation: string
  why: string
  helps: string
  activate: string
  companions: [string, string, string]
  estimatedMinutes: number
}

const FOUNDATION_PACKS: FoundationPack[] = [
  {
    id: 'foundation-01-constitution',
    title: 'Operating Constitution. The rules every reply respects.',
    explanation:
      'A single document Claude reads at the start of every chat that locks your voice, your identity, and the hard rules you do not want to repeat. Em dashes stay out. Banned openers stay out. Your title and company stay correct. Five minutes to install. Every reply respects the rules from there forward, automatically.',
    why:
      'Most VPs assume rules are restrictive. Wrong. Rules are the cost-cutter. Without them, every reply needs a 30-second review for what slipped. With them, you read once and send.',
    helps:
      'Your voice locks. Your title locks. Your company name is always written in full. Banned openers stay banned. Email signatures land your way every time.',
    activate:
      'A bootstrap prompt copied to your clipboard. Paste into Claude. Three short questions. Five minutes later your Project Knowledge has the Constitution installed and three companion skills.',
    companions: ['constitution-loader', 'voice-guard', 'banned-pattern-sweep'],
    estimatedMinutes: 5,
  },
  {
    id: 'foundation-02-facts-registry',
    title: 'Facts Registry. The canonical you. Claude never guesses again.',
    explanation:
      'A small pinned file that holds the canonical version of who you are. Your title, your division, the three priorities driving your week, the people you work with most. Claude reads it at the start of every chat so you never have to retype any of it. It is also the anchor every other pack points back to when it needs a fact about you.',
    why:
      'Identity drift is the most expensive bug in personal AI. Hallucinated names, wrong titles, wrong company shape. The registry is the canonical anchor every other surface points to.',
    helps:
      'Claude opens every chat already knowing your role, your division, your two or three live priorities, and the people you work with. Replies start at the right altitude, not at zero.',
    activate:
      'A registry template plus a 6-question interview. Paste into Claude, answer the questions, the registry writes itself. Pinned to your Project Knowledge.',
    companions: ['cold-start-loader', 'identity-anchor', 'registry-sync'],
    estimatedMinutes: 7,
  },
  {
    id: 'foundation-03-cold-start-protocol',
    title: 'Cold Start Protocol. The 30-second sweep every chat runs at open.',
    explanation:
      'Every new chat starts with the same 30-second sweep. Claude reads your Constitution, pulls your Facts Registry, and surfaces what was open from your last session. By the time you type your first real prompt, the assistant already knows who you are, what rules apply, and what was unresolved last time. No more cold opens that feel like talking to a stranger.',
    why:
      'Without a cold-start ritual, every session is a fresh paste of context. With one, every chat lands warm. The protocol is the difference between an assistant and a co-worker.',
    helps:
      'Open a new chat, type one word, get a 5-line briefing pulled from your registry, your Constitution, and your last session\'s open items. Replies pick up where you left off, every time.',
    activate:
      'A cold-start skill plus a session-briefing template. 5 minutes to install. Fires automatically on every new chat.',
    companions: ['cold-start-verify', 'session-briefing', 'session-resume'],
    estimatedMinutes: 5,
  },
  {
    id: 'foundation-04-decision-log',
    title: 'Decision Log. Every correction sticks across every chat.',
    explanation:
      'An append-only log of every correction, calibration, and lesson you have given Claude. The skill captures them automatically when you say "remember this" or "from now on" or "correction." Every later cold start replays the log so the lesson holds in chat 47 the same way it held in chat 1. This is the file that turns a chat assistant into something that actually learns from you.',
    why:
      'Correcting Claude in chat 14 does not fix chat 15. The Decision Log makes corrections structural. Tell it once, every later session reads the lesson.',
    helps:
      'Wins, losses, calibration moments, voice corrections, factual corrections all flow into one append-only log. Your AI gets sharper week over week without you remembering to teach it.',
    activate:
      'A decision-log skill plus a memory-propagator skill. Triggers on "remember this", "correction:", "from now on". Writes structured rows your Project Knowledge surfaces every cold start.',
    companions: ['decision-log-writer', 'memory-propagator', 'cold-start-replay'],
    estimatedMinutes: 6,
  },
  {
    id: 'foundation-05-skill-builder',
    title: 'Skill Builder. The recipe that turns prompts into permanent tools.',
    explanation:
      'A meta-skill that turns any prompt you type more than twice into a permanent saved tool. Six questions about the task and you have a named skill in your Claude that you can call by trigger phrase, forever. This pack makes every later upgrade easier because you stop re-typing context and start composing skills the way a developer composes functions.',
    why:
      'Prompts are tuition. Skills are equity. Every time you teach Claude the same trick from scratch, you are paying tuition again. The Skill Builder turns lessons into infrastructure.',
    helps:
      'You will have a starter skill of your own (proposal writing, daily brief, expense triage, whatever you do most often) plus the meta-skill that clones it for the next ten.',
    activate:
      'A Skill Builder bootstrap. Six questions. Out comes a saved skill in your Claude that you can call by name forever.',
    companions: ['skill-creator', 'skill-registry', 'skill-tester'],
    estimatedMinutes: 8,
  },
  {
    id: 'foundation-06-routing-rules',
    title: 'Routing Rules. Every file lands where it belongs.',
    explanation:
      'A matrix Claude reads on every save plus hooks on the OS layer for users on Claude Code. You define where each kind of deliverable belongs once. From then on, the matrix routes every file to the right folder, and on Code, the hooks block any miss before it lands. This is the difference between asking Claude nicely to file things correctly and structurally preventing it from filing things incorrectly.',
    why:
      'For weeks you keep finding deliverables in the wrong folder. The instructions are right there and Claude still misses. The fix is structural, not advisory.',
    helps:
      'Outputs land where you expect, not where the LLM guessed. Your filesystem stops drifting. On Code, hooks block any miss before it lands. On Pro and Max, the matrix routes every save behaviorally.',
    activate:
      'A routing-rules.md template plus three hook scripts plus an allowlist. Five minutes to install, zero tolerance for misses after that.',
    companions: ['routing-gate', 'routing-hygiene-scan', 'allowlist-loader'],
    estimatedMinutes: 9,
  },
  {
    id: 'foundation-07-memory-architecture',
    title: 'Memory Architecture. Claude learns over time.',
    explanation:
      'A folder layout, an index file, and an auto-loader on Code. Every correction you give Claude lands as a topic file in your memory folder. The index keeps a one-line pointer to each. Every session reads the index and pulls the relevant files into context. Tell Claude something on Tuesday. Wednesday morning, the lesson is already loaded. Multiply that by 200 corrections and your Claude is sharper than any teammate who has been on the job that long.',
    why:
      'Corrections that do not get captured evaporate. The memory architecture turns every correction into a structural lesson Claude reads on the next cold start.',
    helps:
      'Tell Claude something once. Wednesday morning, fresh chat, the lesson holds. Every correction compounds. By correction 200, your Claude is sharper than your second-most-senior teammate.',
    activate:
      'A topic-file index plus an auto-memory skill plus a cold-start replay. 8 minutes to install. Compounds forever.',
    companions: ['memory-architect', 'topic-writer', 'memory-replay'],
    estimatedMinutes: 8,
  },
  {
    id: 'foundation-08-source-sweep',
    title: 'Pre-Answer Source Sweep. Claude stops guessing.',
    explanation:
      'A gate that fires before Claude answers any factual question. It sweeps your Notion, your Gmail history, your Outputs folder, your RAG index, and your canonical files in parallel. The answer comes back with file citations and a confidence stamp on every claim. If the sources do not support an answer, Claude says so out loud instead of fabricating. This is the pack that makes "I do not know" structurally cheaper than guessing.',
    why:
      'The cost of a confident wrong answer is hours of cleanup. The Source Sweep makes "I do not know" structurally cheaper than fabrication. Confidence stamps land on every claim.',
    helps:
      'Ask Claude something factual, it checks your sources first and cites them in the answer. If it can\'t find anything, it tells you instead of making something up.',
    activate:
      'A source-sweep skill plus a hook that fires on every prompt you send. Catches factual queries and runs the sweep before Claude answers. Seven minutes to install.',
    companions: ['source-sweep', 'confidence-stamper', 'rag-loader'],
    estimatedMinutes: 7,
  },
  {
    id: 'foundation-09-output-validator',
    title: 'Output Validator. The pre-delivery quality gate.',
    explanation:
      'A 9-point pre-delivery check that fires on every output Claude is about to surface. Em dashes, banned openers, your identity, every person name verified against your roster, tone-tier match, formatting. If anything fails the check, Claude holds the deliverable and tells you what missed. The validator is the safety net that catches the one-in-twenty cases where everything else slipped, before the deliverable lands in your inbox or your client thread.',
    why:
      'The "I caught it before sending" workflow is fragile. The validator runs the same checks every time, automatically, before the deliverable surfaces.',
    helps:
      'Em dashes never ship. Canned openers never ship. Names get checked against your roster. Tone matches the audience. If something still slips, the validator holds the deliverable until it\'s clean.',
    activate:
      'The validator skill, a checklist, and a hook that runs the check before any deliverable lands. Wired in six minutes, runs every time after that.',
    companions: ['output-validator', 'voice-guard', 'name-verifier'],
    estimatedMinutes: 6,
  },
  {
    id: 'foundation-10-email-playbook',
    title: 'Email Playbook. Tier-aware drafts in your voice.',
    explanation:
      'A playbook that sorts every recipient into one of eight audience tiers and locks the tone, structure, and sign-off per tier. Internal team emails come HTML branded. Compliance threads come plain text and structured. Cold prospects get a different cadence than warm ones. Your signature is the same on every send. Drafts that miss the rules get blocked by a gate before they ever reach your draft folder, so the cosmetic mistakes that read as wrong intent never go out.',
    why:
      'Voice mismatch on outbound is the most expensive cosmetic bug. Recipients read the wrong tone as the wrong intent. The playbook locks tone per audience tier so you never have to.',
    helps:
      'Replies stay short and plain. Compliance threads stay structured. Internal HTML emails carry your brand. The format chooses itself based on who is on the To line.',
    activate:
      'The Email Playbook skill plus a gate that blocks drafts that miss the rules before they ever land. Seven minutes to install. Zero violations after that.',
    companions: ['email-drafter', 'email-playbook-gate', 'voice-tier-resolver'],
    estimatedMinutes: 7,
  },
]

// ---------------------------------------------------------------------------
// Narrative-only milestone overrides.
// ---------------------------------------------------------------------------

interface NarrativeOverride {
  v2Title: string
  v2Explanation: string
  v2Story: string
}

const NARRATIVE_V2: Record<string, NarrativeOverride> = {
  'chatgpt-was-the-fast-lane': {
    v2Title: "ChatGPT was great until it wasn't.",
    v2Explanation:
      'Every chat started from zero. Fine for quick lookups. Useless the moment a real Perennial Empire deliverable needed depth.',
    v2Story:
      'I was running Perennial Empire from my phone and a laptop with a newborn at home. ChatGPT felt fast because I never paused long enough to notice I was rebuilding context every single session. Twenty minutes of paste before any output. That is the ceiling.',
  },
  'first-scheduled-task-2am': {
    v2Title: 'Set the audit to fire at 2 AM on the 5th.',
    v2Explanation:
      'Wrote the scheduled trigger ninety seconds after Cowork released the feature. First job I ever built that ran without me alive.',
    v2Story:
      'Memory Architect was running on demand and I kept forgetting to fire it. Three weeks, zero runs. I set 02:00 ET on the 5th, ran one test, then waited. April 5 came and the report was waiting for me at breakfast.',
  },
  'cowork-browser-linkedin-day': {
    v2Title: 'Claude could click buttons, not just write words.',
    v2Explanation:
      'It optimized my whole LinkedIn profile, headline through five experience entries. 90 minutes of paste-and-click became 12 minutes of supervision.',
    v2Story:
      'For years AI wrote the words and I clicked the buttons. The day Cowork opened Chrome, filled the LinkedIn editor, and hit Save itself, the ceiling moved. The new ceiling is anything a human can click.',
  },
  'sent-emails-voice-fingerprint': {
    v2Title: 'Fed it 200 sent emails so it sounded like me.',
    v2Explanation:
      'Every draft used to sound like Claude wearing my name tag. Six months of my Sent folder fixed that in one session.',
    v2Story:
      'I was hand-editing every email, every time. Tone, signature, opener, closer. I dumped 200 sent messages from September through March into Cowork and let it extract the rules itself. By the third week I stopped catching mismatches.',
  },
  'gp-tracker-from-bailey-ave': {
    v2Title: 'A VP grabbed my GP tracker and used it the same day.',
    v2Explanation:
      'Bailey Ave was a per-apartment job. I built one tracker, parameterized the rates, and the next project just plugged in.',
    v2Story:
      'Every project tracker used to be a fresh Excel build. Zero reuse across jobs. I generalized the shape on Bailey Ave, pulled rates into a Config tab, and the skill scaled from a small change order to a multi-million dollar interior renovation without rewriting a formula.',
  },
  'april-5-first-autonomous-run': {
    v2Title: "Woke up to an audit I didn't run.",
    v2Explanation:
      'April 5, 2 AM. The trigger I wrote on March 10 fired across 127 files and rated itself 8.28. First proof the system worked while I slept.',
    v2Story:
      'I had built the monthly audit in March and waited 26 days for the first real run. It swept 127 active files, audited 12 core context docs, and self-rated honestly down from 9.32 because the temp clutter had piled up. AI assistant became AI infrastructure that night.',
  },
  'cross-platform-protocol': {
    v2Title: 'Two Claudes were drifting. I made them share notes.',
    v2Explanation:
      "Bernie on the Mac mini and Cowork on the laptop kept forgetting each other's corrections. One Decision Log became the bus they both read.",
    v2Story:
      "Same name, two brains, different routing rules. I'd correct one and the other would repeat the same mistake on Tuesday. Three shared Global files plus one Decision Log fixed it. Tell one, both reflect by the next cycle.",
  },
  'task-reconciler-tier-zero': {
    v2Title: 'Meetings started closing my own tasks.',
    v2Explanation:
      'Built a five-signal scorer that watches transcripts and stages closures for my approval. Three real tasks flipped Done on the first end-to-end run.',
    v2Story:
      'I had killed the auto-closer because it was sloppy. But meetings were producing closures every week and nothing was catching them. The fix was a scorer that weighs verb plus semantic plus entity plus speaker plus timing, stages the candidate, and waits for me to say go. Closures come with the actual quote attached.',
  },
  'routing-gate-hr-24': {
    v2Title: 'Stopped Claude from dumping files in the wrong folder.',
    v2Explanation:
      'A rule that says "follow the routing rules" enforces nothing. Five layers of pre-hooks, post-hooks, and hard-blocks took routing violations from weekly to zero.',
    v2Story:
      'For weeks I kept finding deliverables in the engine folder, not the warehouse. The instructions were right there in CLAUDE.md and Claude would still miss. The fix was structural: a hook hard-blocks bad writes before they happen, another hook renames any miss with a red X, and the allowlist is the only authority. Every later gate is built on that template.',
  },
  'bernie-migration-code-cli': {
    v2Title: 'Killed $400 a month and made the Mac mini a real co-worker.',
    v2Explanation:
      'Bernie was running on direct API and a custom stack that drifted every week. I collapsed it onto Claude Code CLI. Same skills, same hooks, same brain.',
    v2Story:
      'I had two paid runtimes for one assistant. The Mac mini and the laptop were diverging every week and I was paying twice for the privilege. Now Bernie runs the daemons, the laptop runs interactive, and they share state through iCloud. From my iPhone over Mosh I get the same Claude either way.',
  },
  'notion-toolkit-and-wikis': {
    v2Title: 'Shipped the whole Notion layer in one batch.',
    v2Explanation:
      'Six daemons all rolled their own Notion client with different retries. I replaced them with one toolkit, one Pydantic model per database, and the whole audit shipped together.',
    v2Story:
      'Schema drift only showed up when writes failed in production, which is the worst time to find out. I had been planning to fix one daemon at a time. The actual unlock was shipping the layer all at once: one client, six typed models, the wiki daemon that reads them, and the audit that proves it works. Ten Code projects flipped Done in one session.',
  },
  'parallel-autonomous-overnight': {
    v2Title: 'Opened twelve Claude tabs and went to bed.',
    v2Explanation:
      'One session hits a wall at hour four. Twelve sessions running in parallel while I slept shipped 15 projects in a night. Sleep stopped being zero throughput.',
    v2Story:
      'I had been working one task per session like a normal person. Code DB was advancing 3 to 5 rows a session, overnight was wasted. The unlock was opening N Code sessions, giving each a phase plan, and turning on full auto. S191 closed 9 projects overnight. S192 closed 15. Now every design starts with one question: can this run while I sleep?',
  },
  'hoistos-visual-stack-code-db-gate': {
    v2Title: 'Stopped my visuals from looking AI-generic.',
    v2Explanation:
      'HoistOS had a vision and zero architecture. One memo, one visual stack template, one schema gate took Code Projects compliance from 43.5 percent to 100 percent.',
    v2Story:
      'Every landing page I shipped looked like a Claude default. The Code Projects DB was missing required fields on 95 rows and nobody enforced anything. I wrote the HoistOS memo, scaffolded the visual stack as a template repo, and locked the schema gate so nothing ships without the required properties filled. Six months of greenfield avoided.',
  },
  's195-audit-backlog-drain': {
    v2Title: 'Drained a 22-row audit backlog in one sitting.',
    v2Explanation:
      'Normal pattern queues fixes across weeks. I drained all 22 in one batch, hardened the Email Playbook into a hook, and wired Codex CLI as a backup runtime.',
    v2Story:
      'The audit produced 22 small structural fixes and the standard move would have been to spread them across three sessions. Instead I ran the whole backlog through one gate without context-switching. Pruned 25,000 tokens of skill bloat. Hardened the email rule into a PreToolUse hook so violations get blocked at draft time. And stood up Codex CLI as a parallel pointer-based memory in case Claude Code goes down.',
  },
  'scrolophyte-deep-sprint-now': {
    v2Title: 'Made the timeline itself the product.',
    v2Explanation:
      'V1 was a story you read. V2 is an artifact you install. Sixteen activation packs, a long-scroll site, a GitHub repo, all merged by a gate that polls every tab to Done.',
    v2Story:
      'Empire Wireframe was a wireframe. Distribution was vibes: post a link, hope a VP clicks. The pivot was treating the timeline as the actual thing. Twelve parallel tabs mining moments, four tiers of installable packs, a long-scroll site, a private repo, and a merge gate that waits for everything to land. Read it, install it, use it, in one continuous scroll.',
  },
}

interface InstallableOverride {
  v2Title: string
  v2Explanation: string
}

const INSTALLABLE_V2: Record<string, InstallableOverride> = {
  'cowork-projects-pinned-context': {
    v2Title: 'Claude opened my project already knowing me.',
    v2Explanation:
      'Role, team, what was shipping that week. No more retyping setup. Every reply got sharper.',
  },
  'desktop-three-sweep-audit': {
    v2Title: 'I told Claude to clean my desktop.',
    v2Explanation:
      'It scored it 8.5, listed forty-seven fixes, did the safe ones itself.',
  },
  'memory-architect-first-skill': {
    v2Title: 'Built my first skill, like writing a recipe.',
    v2Explanation:
      'Once it was on the shelf I could pull it down anytime. Started writing recipes for everything.',
  },
  'tfidf-search-zero-deps': {
    v2Title: 'Knowledge search across everything I have ever written.',
    v2Explanation:
      'Built a search engine in one afternoon. No Supabase, no embeddings API, no monthly bill.',
  },
  'three-skills-pattern': {
    v2Title: 'Skills that built other skills.',
    v2Explanation:
      'Once the meta-skill clicked, I shipped three new ones in a single session. The compounding loop locked in.',
  },
  'daily-briefing-consolidation': {
    v2Title: 'Daily brief landed at 6:30 AM, not 9.',
    v2Explanation:
      'Four scheduled tasks collapsed into one morning brief. 12 minutes of file-skim became 3 minutes of triage.',
  },
  'email-playbook-tier-aware': {
    v2Title: 'My emails picked their own format.',
    v2Explanation:
      'Short replies stayed plain. Anything structured got HTML with my brand styling. The format chose itself.',
  },
  'light-proposal-fork': {
    v2Title: 'Wrote my first proposal in twenty minutes flat.',
    v2Explanation:
      'Heavy proposal-builder for new clients, light for change orders. Same brand, two shapes, no hand-edits.',
  },
  'meeting-intelligence-db': {
    v2Title: 'Meetings started ending in clean action lists.',
    v2Explanation:
      'Flat folder of transcripts became a Notion database with attendees, decisions, and action items linked.',
  },
  'expense-automation-end-to-end': {
    v2Title: 'Expense reports stopped being a Sunday job.',
    v2Explanation:
      'AMEX statement to GL codes to 4Empire entry. End-to-end. 2 to 3 hours became 15 minutes of supervision.',
  },
  'voice-to-telegram-task': {
    v2Title: 'Voice memos turned into structured tasks.',
    v2Explanation:
      'Telegram voice note plus Whisper plus Notion MCP. 30-second voice becomes a tracked task in under 10 seconds.',
  },
  'three-skill-drift-cluster': {
    v2Title: 'Contracts auto-summarized in plain English.',
    v2Explanation:
      'Plus a 7-check pre-delivery validator. The hallucinated-name class became structurally impossible.',
  },
  'rag-pgvector-substrate': {
    v2Title: 'Knowledge search across everything I have ever written.',
    v2Explanation:
      'Voyage 3 embeddings plus Cohere Rerank plus Supabase pgvector. 1700-line Decision Log became queryable in 200 ms.',
  },
  'cold-start-one-brain-gate': {
    v2Title: "Eugeen's Claude is yours, custom-fitted.",
    v2Explanation:
      'The full cold-start protocol plus the One-Brain Gate System. Every chat lands warm. Every gate enforces.',
  },
  'sleep-consolidator-multi-model-jury': {
    v2Title: 'Predictions engine that calls its own accuracy.',
    v2Explanation:
      'Sleep consolidator promotes insights overnight. Multi-model jury sanity-checks high-stakes outputs. The system gets smarter while you sleep.',
  },
}

const CAT_COLOR: Record<string, string> = {
  architecture: BRAND.signal,
  skill: '#7a5a8e',
  automation: '#5b829a',
  rule: '#3a3a36',
  vibes: '#d4a854',
}

function fmtMonth(iso: string): string {
  const d = new Date(iso + 'T12:00:00Z')
  const m = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  const y = d.getUTCFullYear()
  return m + ' ' + y
}

function catLabel(cat: string): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

const PACK_CACHE = new Map<string, string>()

async function fetchPack(packId: string): Promise<string> {
  if (PACK_CACHE.has(packId)) return PACK_CACHE.get(packId)!
  try {
    const res = await fetch('/packs-v2/' + packId + '.md', { cache: 'default' })
    if (!res.ok) throw new Error('pack ' + packId + ' returned ' + res.status)
    const text = await res.text()
    PACK_CACHE.set(packId, text)
    return text
  } catch {
    return '# Pack ' + packId + '\n\nUnable to load this pack right now. Visit hoistos.com later or contact eugeen@perennialempire.com.'
  }
}

async function copyPackToClipboard(packId: string, label: string): Promise<void> {
  const text = await fetchPack(packId)
  if (!text) {
    toast.error('Could not load pack. Try again in a moment.')
    return
  }
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Pasted to clipboard. Open Claude.ai and press Cmd+V.')
    window.open('https://claude.ai/new', '_blank', 'noopener,noreferrer')
  } catch {
    toast.error('Clipboard blocked. Allow clipboard access and try again.')
  }
  void label
}

// Fires the desktop-app deep link. The browser hands the URL off to the OS,
// the OS routes claude:// to the registered app handler. Falls back to a
// toast if the URL exceeds the safe cap (should not happen with bootstrap-
// only packs but the diagnostic protects future packs).
function openClaudeDesktop(
  packId: string,
  packTitle: string,
  estimatedMinutes: number,
  tier: ClaudeTier,
): void {
  const result = buildDeepLinkForPack({
    packId,
    packTitle,
    estimatedMinutes,
    tier,
  })
  if (!result.withinCap) {
    toast.error(
      'This pack is too large for one-click install. Use the copy and paste path instead.',
    )
    return
  }
  // window.location.href triggers the OS handoff. Fires a friendly toast
  // first so the user understands what is happening even if the OS prompt
  // takes a moment to surface.
  toast.success('Opening in Claude desktop. If nothing happens, the app is not installed.')
  window.location.href = result.url
}

// Copies the one-line install command for Code-tier users.
async function copyCodeCliInstall(packId: string): Promise<void> {
  const cmd = buildCodeCliInstallCommand(packId)
  try {
    await navigator.clipboard.writeText(cmd)
    toast.success('Install command copied. Paste into your terminal and press Enter.')
  } catch {
    toast.error('Clipboard blocked. Allow clipboard access and try again.')
  }
}

const expandVariants: Variants = {
  closed: { opacity: 0, height: 0 },
  open: {
    opacity: 1,
    height: 'auto',
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

// ---------------------------------------------------------------------------
// Subcomponents.
// ---------------------------------------------------------------------------

// V7.5 restored: DetailBlock, CompanionChips, ActivationZone were unused
// stubs in the original strip but call sites at FoundationCard + ChronoRow
// reference them. Brand-consistent minimal treatments; refine when the
// timeline page itself comes back into focus.
function DetailBlock({ heading, body }: { heading: string; body: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: BRAND.signal,
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          marginBottom: 8,
        }}
      >
        {heading}
      </div>
      <div style={{ fontSize: 17, color: BRAND.ink2, lineHeight: 1.6, fontWeight: 400 }}>
        {body}
      </div>
    </div>
  )
}

function CompanionChips({ items }: { items: [string, string, string] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: -8 }}>
      {items.map((c, i) => (
        <span
          key={i}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: BRAND.ink2,
            padding: '4px 12px',
            border: `1px solid ${BRAND.rule2}`,
            borderRadius: 999,
            background: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {c}
        </span>
      ))}
    </div>
  )
}

function Dot() {
  return (
    <span
      aria-hidden
      style={{
        width: 4,
        height: 4,
        borderRadius: '50%',
        background: BRAND.signal,
        display: 'inline-block',
      }}
    />
  )
}

function ActivationZone({
  packId,
  label,
  estimatedMinutes,
  tier,
}: {
  packId: string
  label: string
  estimatedMinutes: number
  tier: ClaudeTier
}) {
  // Diagnostic preview of the deep-link footprint. Surfaces "X chars
  // delivered" inline so the user sees we are not handing them a 50KB
  // mystery URL. Cheap to compute on every render; no async required.
  const deepLink = useMemo(
    () =>
      buildDeepLinkForPack({
        packId,
        packTitle: label,
        estimatedMinutes,
        tier,
      }),
    [packId, label, estimatedMinutes, tier],
  )

  // Two-path install model after the May 2026 audit: every paid Claude tier
  // (Pro, Max, Team, Enterprise) ships with Cowork via the desktop app, so
  // the desktop button shows for Desktop + Code + Unknown. Web copy-paste
  // is always offered as a fallback for Linux + locked-down work machines.
  // Code-CLI button stays Code-only so we do not confuse Desktop users with
  // terminal commands they have no use for.
  const showDesktop = tier === 'desktop' || tier === 'code' || tier === 'unknown'
  const showWeb = true
  const showCode = tier === 'code'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        {showDesktop ? (
          <button
            type="button"
            onClick={() => openClaudeDesktop(packId, label, estimatedMinutes, tier)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 22px',
              borderRadius: 12,
              background: BRAND.signal,
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 15,
              boxShadow: `0 6px 20px ${BRAND.signalGlow}`,
              transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = `0 10px 28px ${BRAND.signalGlow}`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = `0 6px 20px ${BRAND.signalGlow}`
            }}
            data-install-path="desktop"
            title={`Opens claude:// deep link, ${deepLink.length} chars`}
          >
            <span>Open in Claude desktop</span>
            <span style={{ opacity: 0.78, fontSize: 13, fontWeight: 500 }}>
              one click, ~{estimatedMinutes} min
            </span>
          </button>
        ) : null}

        {showWeb ? (
          <button
            type="button"
            onClick={() => void copyPackToClipboard(packId, label)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 22px',
              borderRadius: 12,
              background: showDesktop ? '#FFFFFF' : BRAND.signal,
              color: showDesktop ? BRAND.ink : '#FFFFFF',
              border: showDesktop ? `1px solid ${BRAND.rule2}` : 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 15,
              boxShadow: showDesktop
                ? '0 1px 3px rgba(20,20,19,0.06)'
                : `0 6px 20px ${BRAND.signalGlow}`,
              transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            data-install-path="web"
            title="Copies the full pack to your clipboard and opens claude.ai in a new tab"
          >
            <span>{showDesktop ? 'Copy and open Claude.ai' : `Activate ${label}`}</span>
            <span style={{ opacity: 0.78, fontSize: 13, fontWeight: 500 }}>
              full pack, ~{estimatedMinutes} min
            </span>
          </button>
        ) : null}

        {showCode ? (
          <button
            type="button"
            onClick={() => void copyCodeCliInstall(packId)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 22px',
              borderRadius: 12,
              background: '#FFFFFF',
              color: BRAND.ink,
              border: `1px solid ${BRAND.rule2}`,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 15,
              boxShadow: '0 1px 3px rgba(20,20,19,0.06)',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            data-install-path="code-cli"
            title="Copies a one-line shell install for Claude Code CLI"
          >
            <span>Code CLI install</span>
            <span style={{ opacity: 0.65, fontSize: 13, fontWeight: 500 }}>
              one-line shell
            </span>
          </button>
        ) : null}
      </div>

      <span
        style={{
          fontSize: 12,
          color: BRAND.ink4,
          fontStyle: 'italic',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Dot />
        {showDesktop
          ? 'Opens directly in your Claude desktop app. Falls back to the copy and paste path if the app is not installed.'
          : 'Copies the full pack to your clipboard, then opens claude.ai so you can paste it into a new chat.'}
      </span>
    </div>
  )
}

// Tier picker pill. Sticks to the top of the page once the user has scrolled
// past the hero. One-time pick stored in localStorage so the timeline
// remembers the selection across visits. Tap any chip to switch.
function TierPicker({
  tier,
  onPick,
}: {
  tier: ClaudeTier
  onPick: (next: ClaudeTier) => void
}) {
  // Two-button picker after May 2026 elegance pass: Pro and Max collapse
  // into Desktop because Cowork is included on every paid plan and the
  // install behavior is identical. Splitting them surfaced no real choice.
  const options: Array<{ id: ClaudeTier; label: string; sub: string }> = [
    { id: 'desktop', label: 'Desktop', sub: 'Pro, Max, or Team' },
    { id: 'code', label: 'Code', sub: 'one-line CLI' },
  ]
  return (
    <div
      data-tier-picker
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.7)',
        border: `1px solid ${BRAND.rule2}`,
        backdropFilter: 'blur(6px)',
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: BRAND.ink3,
          padding: '0 6px',
        }}
      >
        Your tier
      </span>
      {options.map((o) => {
        const active = tier === o.id
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onPick(o.id)}
            data-tier-option={o.id}
            data-tier-active={active ? 'true' : 'false'}
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 0,
              padding: '6px 12px',
              borderRadius: 999,
              background: active ? BRAND.signal : 'transparent',
              color: active ? '#FFFFFF' : BRAND.ink,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background 180ms',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600 }}>{o.label}</span>
            <span
              style={{
                fontSize: 10,
                opacity: 0.78,
                fontWeight: 400,
                letterSpacing: '0.02em',
              }}
            >
              {o.sub}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Foundation card.
// ---------------------------------------------------------------------------

function FoundationCard({
  pack,
  index,
  open,
  onToggle,
  tier,
}: {
  pack: FoundationPack
  index: number
  open: boolean
  onToggle: () => void
  tier: ClaudeTier
}) {
  const num = String(index + 1).padStart(2, '0')

  return (
    <motion.article
      data-foundation-card
      layout
      onClick={onToggle}
      style={{
        position: 'relative',
        borderRadius: 18,
        background: open ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)',
        border: '1px solid ' + (open ? 'rgba(204,110,46,0.35)' : BRAND.rule),
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: open
          ? '0 30px 80px -16px rgba(204,110,46,0.32), 0 0 0 1px rgba(204,110,46,0.2)'
          : '0 0 0 0 transparent',
        transition: 'background 350ms, border-color 350ms, box-shadow 350ms',
      }}
      whileHover={{ y: open ? 0 : -2 }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '64px 1fr 200px',
          gap: 24,
          alignItems: 'center',
          padding: '26px 28px',
        }}
      >
        <span
          style={{
            fontSize: 30,
            fontWeight: 500,
            color: open ? BRAND.signal : BRAND.ink4,
            fontStyle: 'italic',
            textAlign: 'center',
            fontVariantNumeric: 'oldstyle-nums',
          }}
        >
          {num}
        </span>
        <div style={{ minWidth: 0 }}>
          <span
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: BRAND.ink,
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
              display: 'block',
              marginBottom: 8,
            }}
          >
            {pack.title}
          </span>
          <span style={{ fontSize: 16, color: BRAND.ink2, lineHeight: 1.55 }}>
            {pack.explanation}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 6,
            justifySelf: 'end',
          }}
        >
          <span
            style={{
              padding: '13px 22px',
              borderRadius: 10,
              background: BRAND.signal,
              color: BRAND.paper,
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: '-0.005em',
              boxShadow: '0 12px 28px ' + BRAND.signalGlow + ', inset 0 1px 0 rgba(255,255,255,0.2)',
              whiteSpace: 'nowrap',
            }}
          >
            {pack.estimatedMinutes} min{open ? ' to install' : ''}
          </span>
          <span
            style={{
              fontSize: 11,
              color: BRAND.ink4,
              fontStyle: 'italic',
              letterSpacing: '0.04em',
            }}
          >
            {open ? 'tap to close' : 'foundation pack'}
          </span>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="detail"
            initial="closed"
            animate="open"
            exit="closed"
            variants={expandVariants}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                height: 1,
                background:
                  'linear-gradient(90deg, transparent, rgba(20,20,19,0.18), transparent)',
                marginLeft: 28,
                marginRight: 28,
                marginBottom: 24,
              }}
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '64px 1fr',
                gap: 24,
                padding: '0 28px 32px',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: BRAND.signal,
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  textAlign: 'center',
                  paddingTop: 6,
                  fontWeight: 600,
                }}
              >
                {num}
              </span>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 24,
                  paddingRight: 24,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <DetailBlock heading="Why this matters" body={pack.why} />
                <DetailBlock heading="How it helps you specifically" body={pack.helps} />
                <DetailBlock
                  heading="What you'll get when you click activate"
                  body={pack.activate}
                />
                <CompanionChips items={pack.companions} />
                <ActivationZone
                  packId={pack.id}
                  label={pack.title}
                  estimatedMinutes={pack.estimatedMinutes}
                  tier={tier}
                />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  )
}

// ---------------------------------------------------------------------------
// Chronological row.
// ---------------------------------------------------------------------------

function ChronoRow({
  moment,
  open,
  onToggle,
  tier,
}: {
  moment: TimelineDMoment
  open: boolean
  onToggle: () => void
  tier: ClaudeTier
}) {
  const num = String(moment.itemNumber).padStart(2, '0')
  const cat = moment.category as string
  const dot = CAT_COLOR[cat] ?? BRAND.ink3
  const installable = moment.hasPack && moment.packSlug
  const v2Narrative = NARRATIVE_V2[moment.id]
  const v2Install = INSTALLABLE_V2[moment.id]
  const displayTitle = installable
    ? v2Install?.v2Title ?? moment.title
    : v2Narrative?.v2Title ?? moment.title
  const displayExplanation = installable
    ? v2Install?.v2Explanation ?? moment.hook
    : v2Narrative?.v2Explanation ?? moment.hook

  return (
    <motion.div
      data-chronological-row
      layout
      style={{
        borderBottom: '1px solid ' + BRAND.rule,
        background: open ? 'rgba(204,110,46,0.04)' : 'transparent',
        cursor: 'pointer',
        transition: 'background 220ms',
      }}
      onClick={onToggle}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '54px 1fr 110px 130px 110px',
          gap: 24,
          alignItems: 'center',
          padding: '18px 12px',
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: 500,
            color: BRAND.ink4,
            fontStyle: 'italic',
            textAlign: 'center',
            fontVariantNumeric: 'oldstyle-nums',
          }}
        >
          {num}
        </span>
        <div style={{ minWidth: 0 }}>
          <span
            style={{
              fontSize: 17,
              fontWeight: 500,
              color: BRAND.ink,
              lineHeight: 1.4,
              display: 'block',
            }}
          >
            {displayTitle}
          </span>
          {!open ? (
            <span
              style={{
                fontSize: 14,
                color: BRAND.ink3,
                lineHeight: 1.5,
                marginTop: 4,
                display: 'block',
              }}
            >
              {displayExplanation}
            </span>
          ) : null}
        </div>
        <span style={{ fontSize: 13, color: BRAND.ink3, fontStyle: 'italic' }}>
          {fmtMonth(moment.dateShipped)}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 14,
            fontWeight: 500,
            color: BRAND.ink2,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: dot,
              display: 'inline-block',
            }}
          />
          {catLabel(cat)}
        </span>
        <span
          style={{
            justifySelf: 'end',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: installable ? BRAND.signal : BRAND.ink3,
            padding: '7px 14px',
            borderRadius: 999,
            background: installable ? BRAND.signalSoft : 'transparent',
            border: '1px solid ' + (installable ? 'rgba(204,110,46,0.25)' : BRAND.rule2),
          }}
        >
          {installable
            ? (moment.estimatedActivationMinutes ?? 5) + ' min ↓'
            : open
            ? 'Close ↑'
            : 'Read →'}
        </span>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="rd"
            initial="closed"
            animate="open"
            exit="closed"
            variants={expandVariants}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '12px 12px 32px 78px',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                maxWidth: 920,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <DetailBlock
                heading={installable ? 'Why this matters' : 'The story'}
                body={
                  installable
                    ? moment.foundation || moment.aha
                    : v2Narrative?.v2Story ?? moment.aha
                }
              />
              {installable ? (
                <>
                  <DetailBlock
                    heading="What changed for me"
                    body={moment.efficiency}
                  />
                  <DetailBlock
                    heading="What you'll get when you click activate"
                    body={
                      'A ' +
                      (moment.packTier ?? 'beginner') +
                      '-tier pack copied to your clipboard. Paste into Claude. Five to ten minutes from cold to working.'
                    }
                  />
                  <ActivationZone
                    packId={moment.packSlug as string}
                    label={displayTitle}
                    estimatedMinutes={moment.estimatedActivationMinutes ?? 5}
                    tier={tier}
                  />
                </>
              ) : (
                <DetailBlock
                  heading="Why this mattered"
                  body={moment.foundation || moment.aha}
                />
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main component.
// ---------------------------------------------------------------------------

export interface EmpireTimelineDProps {
  moments: TimelineDMoment[]
  /**
   * Section visibility for the four-tab IA introduced 2026-05-11.
   *
   *   'foundation' = render only the 10 Foundation packs + step strip + preflight,
   *                  followed by the "next, eleven more" Advanced banner.
   *                  Chronological table is hidden.
   *   'story'      = render only the chronological story table + intro.
   *                  Foundation cards + step strip + tier picker are hidden.
   *   'both'       = legacy single-page view, both sections rendered with the
   *                  divider line between them. Kept for back-compat.
   *
   * Default 'both' so any existing callers do not change behavior.
   */
  mode?: 'foundation' | 'story' | 'both'
}

export function EmpireTimelineD({ moments, mode = 'both' }: EmpireTimelineDProps) {
  const showFoundation = mode === 'foundation' || mode === 'both'
  const showStory = mode === 'story' || mode === 'both'
  const [openFoundation, setOpenFoundation] = useState<string | null>(null)
  const [openChrono, setOpenChrono] = useState<string | null>(null)
  // Tier defaults to whatever localStorage + URL ?tier= returns. Initial
  // render reads it once. The picker writes through to localStorage so the
  // next visit preserves the choice.
  const [tier, setTier] = useState<ClaudeTier>(() => readTier())
  const handleTierPick = (next: ClaudeTier) => {
    setTier(next)
    writeTier(next)
  }
  // Both retained behind the dev URL flag, void to dodge TS6133 after picker removal.
  void TierPicker
  void handleTierPick

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevBg = body.style.background
    const prevColor = body.style.color
    const prevFont = body.style.fontFamily
    body.style.background = BRAND.paper
    body.style.color = BRAND.ink
    body.style.fontFamily = BRAND.font
    html.style.background = BRAND.paper
    return () => {
      body.style.background = prevBg
      body.style.color = prevColor
      body.style.fontFamily = prevFont
      html.style.background = ''
    }
  }, [])

  const sortedMoments = useMemo(
    () =>
      [...moments].sort((a, b) => (a.itemNumber ?? 0) - (b.itemNumber ?? 0)),
    [moments],
  )

  return (
    <div
      data-c-v2="true"
      style={{
        background: BRAND.paper,
        color: BRAND.ink,
        fontFamily: BRAND.font,
        fontFeatureSettings: "'kern','liga'",
        WebkitFontSmoothing: 'antialiased',
        position: 'relative',
        minHeight: '100vh',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.04,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>\")",
        }}
      />

      {showFoundation ? (
      <>
      <section
        style={{
          padding: '88px 6vw 56px',
          maxWidth: 1280,
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: BRAND.signal,
            marginBottom: 18,
            letterSpacing: '0.02em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span
            aria-hidden
            style={{ width: 24, height: 1, background: BRAND.signal }}
          />
          Built for the VPs of EmpireWorks Reconstruction
        </div>
        <h1
          style={{
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 500,
            lineHeight: 1.04,
            letterSpacing: '-0.025em',
            color: BRAND.ink,
            maxWidth: 920,
            margin: 0,
          }}
        >
          Three months figuring out how to make Claude actually useful,{' '}
          <em style={{ fontStyle: 'italic', color: BRAND.signal, fontWeight: 500 }}>
            condensed for you
          </em>
          .
        </h1>
        <p
          style={{
            marginTop: 24,
            fontSize: 20,
            color: BRAND.ink2,
            lineHeight: 1.55,
            maxWidth: 740,
            fontWeight: 400,
          }}
        >
          Every row is a thing I figured out the hard way running Perennial Empire. Click any
          card to open it. The Activate buttons hand you the upgrade ready to drop into your
          own Claude. Five to ten minutes each. Stays in your Claude forever.
        </p>
        {/* Tier picker removed 2026-05-11 per Steve live install feedback.
            Choice paralysis killed dropoff. Install path always defaults to
            Desktop (Cowork prefill works on Pro, Max, Team, Enterprise; only
            developers passing ?tier=code see the CLI flow). The picker
            component is retained behind the dev URL param for future revert. */}
        <p style={{ marginTop: 28, fontSize: 14, color: BRAND.ink3, fontStyle: 'italic' }}>
          One click opens Claude with the install prompt pre-filled. Works on any paid Claude plan.
        </p>
      </section>

      <div
        style={{
          padding: '0 6vw',
          maxWidth: 1280,
          margin: '24px auto 16px',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 18,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <h2
          style={{
            fontSize: 32,
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: BRAND.ink,
            margin: 0,
          }}
        >
          Start <em style={{ color: BRAND.signal, fontStyle: 'italic' }}>here</em>.
        </h2>
        <span style={{ fontSize: 13, color: BRAND.ink4, fontStyle: 'italic' }}>
          Ten foundation packs. Install in any order. Each takes 5 to 10 minutes.
        </span>
      </div>

      <section
        data-foundation-explainer
        style={{
          padding: '0 6vw',
          maxWidth: 880,
          margin: '0 auto 36px',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 26,
        }}
      >
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.6,
            color: BRAND.ink2,
            margin: 0,
            fontFamily: 'Newsreader, Georgia, serif',
            textAlign: 'center',
          }}
        >
          Ten foundation packs. Install them in a day. From then on, every correction sticks,
          every source check holds, every voice rule compounds. Your Claude becomes a learning
          intelligence that grows with your division, forever.
        </p>

        {/* Step-1-2-3 strip on Foundation page. Single horizontal row with
            arrow connectors between steps to read as a sequence. Each step
            uses flex: 1 so all three share the row evenly. Prior version
            used a grid auto-fit which wrapped to a second row at narrower
            widths and broke the sequence feel. */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
            gap: 6,
            marginTop: 4,
            flexWrap: 'nowrap',
          }}
        >
          {[
            {
              n: 1,
              title: 'Pick any pack',
              sub: 'Install order does not matter',
            },
            {
              n: 2,
              title: 'Click Open in Cowork',
              sub: '5 to 10 min per pack',
            },
            {
              n: 3,
              title: 'Stays forever',
              sub: 'Every later chat carries the upgrade',
            },
          ].map((step, i, arr) => (
            <span key={step.n} style={{ display: 'contents' }}>
              <div
                style={{
                  flex: '1 1 0',
                  minWidth: 0,
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  padding: 14,
                  borderRadius: 12,
                  background: 'rgba(20,20,19,0.03)',
                  border: '1px solid rgba(20,20,19,0.08)',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: BRAND.signal,
                    color: BRAND.paper,
                    fontSize: 13,
                    fontWeight: 600,
                    flexShrink: 0,
                    fontFamily: 'Newsreader, Georgia, serif',
                  }}
                >
                  {step.n}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: BRAND.ink,
                      marginBottom: 2,
                      lineHeight: 1.25,
                    }}
                  >
                    {step.title}
                  </div>
                  <div style={{ fontSize: 11, color: BRAND.ink4, lineHeight: 1.4 }}>
                    {step.sub}
                  </div>
                </div>
              </div>
              {i < arr.length - 1 ? (
                <div
                  aria-hidden="true"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: BRAND.signal,
                    fontSize: 22,
                    fontWeight: 300,
                    flexShrink: 0,
                    width: 18,
                    opacity: 0.7,
                  }}
                >
                  →
                </div>
              ) : null}
            </span>
          ))}
        </div>
      </section>

      {/* Preflight checklist (5 steps: paid plan, download Claude desktop,
          sign in, pick tier, click install). Moved here from Advanced page
          2026-05-11 per Eugeen: Foundation is where new operators land
          first, so the precondition checks belong on this page. */}
      <div
        style={{
          padding: '0 6vw',
          maxWidth: 1280,
          margin: '0 auto 32px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <EmpirePreflight
          tier={tier}
          onScrollToPicker={() => {
            const picker = document.querySelector('[data-tier-picker]') as HTMLElement | null
            if (picker) picker.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }}
        />
      </div>

      <section
        id="foundation-cards"
        data-foundation-cards
        style={{
          padding: '0 6vw 80px',
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {FOUNDATION_PACKS.map((p, i) => (
          <FoundationCard
            key={p.id}
            pack={p}
            index={i}
            open={openFoundation === p.id}
            onToggle={() =>
              setOpenFoundation((cur) => (cur === p.id ? null : p.id))
            }
            tier={tier}
          />
        ))}
      </section>

      {/* Next-step banner: Foundation done? Continue to Bonus Extras.
          Standard SaaS onboarding pattern. The user lands here from
          Overview, scrolls through the 10 foundation cards, then sees
          a clear "what's next" prompt instead of running into an
          unrelated chronological table or dead end. */}
      <div
        style={{
          padding: '24px 6vw 8px',
          maxWidth: 1100,
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <a
          href="/empireworksreconstruction/bonus-extras"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            padding: '20px 28px',
            borderRadius: 18,
            background: 'rgba(204,110,46,0.06)',
            border: '1px solid rgba(204,110,46,0.22)',
            textDecoration: 'none',
            color: BRAND.ink,
            transition: 'transform 200ms, box-shadow 200ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 14px 36px rgba(204,110,46,0.18)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: BRAND.signal,
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                fontWeight: 600,
                marginBottom: 4,
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              }}
            >
              Next, eight more
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: BRAND.ink,
                fontFamily: 'Newsreader, Georgia, serif',
                lineHeight: 1.25,
              }}
            >
              Advanced: construction-fitted plumbing on top of the Foundation.
            </div>
            <div
              style={{
                fontSize: 13,
                color: BRAND.ink3,
                marginTop: 6,
              }}
            >
              Notion wired up, search across your knowledge, Telegram bot, Code CLI, memory,
              hooks. Each one is a self-contained system. Install when ready.
            </div>
          </div>
          <span
            aria-hidden="true"
            style={{
              fontSize: 24,
              color: BRAND.signal,
              flexShrink: 0,
            }}
          >
            →
          </span>
        </a>
      </div>
      </>
      ) : null}

      {/* Story-mode hero, only shown when mode='story' (Timeline tab). Sets
          a narrative-led intro before the chronological table since the
          Foundation hero is hidden in this view. */}
      {showStory && !showFoundation ? (
        <section
          style={{
            padding: '88px 6vw 36px',
            maxWidth: 1100,
            margin: '0 auto',
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: BRAND.signal,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              marginBottom: 18,
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            }}
          >
            The journey, start to today
          </div>
          <h1
            style={{
              fontFamily: 'Newsreader, Georgia, serif',
              fontSize: 'clamp(40px, 6vw, 72px)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
              margin: 0,
              color: BRAND.ink,
            }}
          >
            How Perennial went{' '}
            <em style={{ color: BRAND.signal, fontStyle: 'italic' }}>AI-native</em>.
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.6,
              color: BRAND.ink2,
              maxWidth: 720,
              margin: '20px auto 0',
              fontFamily: 'Newsreader, Georgia, serif',
            }}
          >
            Every moment that turned a construction company into an AI-native operation, in
            order. Some are story. The ones with a signal-orange dot are upgrades you can drop
            into your own Claude in five minutes.
          </p>
        </section>
      ) : null}

      {showStory ? (
        <>
          {showFoundation ? (
            <div
              style={{
                padding: '32px 6vw 32px',
                maxWidth: 1280,
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                position: 'relative',
                zIndex: 2,
              }}
            >
              <span style={{ flex: 1, height: 1, background: BRAND.rule2 }} />
              <span
                style={{
                  fontSize: 14,
                  color: BRAND.ink3,
                  fontStyle: 'italic',
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                }}
              >
                Or read the journey from start to today.
              </span>
              <span style={{ flex: 1, height: 1, background: BRAND.rule2 }} />
            </div>
          ) : null}

          <div
            data-chronological-table
            style={{
              padding: '0 6vw 96px',
              maxWidth: 1280,
              margin: '0 auto',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: BRAND.ink4,
                fontVariant: 'small-caps',
                letterSpacing: '0.16em',
                borderBottom: '1px solid ' + BRAND.rule2,
                padding: '14px 12px',
                display: 'grid',
                gridTemplateColumns: '54px 1fr 110px 130px 110px',
                gap: 24,
                alignItems: 'center',
              }}
            >
              <span style={{ textAlign: 'center' }}>No.</span>
              <span>Moment</span>
              <span>When</span>
              <span>Category</span>
              <span style={{ textAlign: 'right' }}>Get it</span>
            </div>

            {sortedMoments.map((m) => (
              <ChronoRow
                key={m.id}
                moment={m}
                open={openChrono === m.id}
                onToggle={() => setOpenChrono((cur) => (cur === m.id ? null : m.id))}
                tier={tier}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

export default EmpireTimelineD
