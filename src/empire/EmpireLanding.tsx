/**
 * EmpireLanding. The first thing a VP sees inside /empireworksreconstruction.
 *
 * Owner: Empire Wireframe S199 (polish-pass on the canonical landing).
 * Routing reference: src/empire/AppRouter.tsx maps "/empireworksreconstruction"
 * (canonical) and "/empire" (legacy alias) to this component inside
 * EmpireLayout.
 *
 * S199 batch 2 changes vs batch 1:
 *   - CTA moved from above-cards to below-cards (lets VPs see value before
 *     conversion ask, per V5 I4 UX deep-audit recommendation).
 *   - Animated scroll-cue (chevron + "How it works") in CTA's old spot.
 *     Click anchors to #how-it-works (smooth-scrolled by root Lenis).
 *
 * S199 batch 1 changes vs S197 baseline:
 *   - Single centered CTA "Upgrade my Claude" (R051: no horizontal CTA stack).
 *   - Cards moved to single-column vertical stack (R051: no horizontal blocks).
 *   - Cards upgraded to MapCard / PackCard / BranchCard (R054: max-fidelity).
 *   - Eyebrow + subhead + NOTE rewritten per S199 batch 1 spec.
 *   - All copy passes Hard Rule #11 (no em dashes).
 */

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  Check,
  ChevronDown,
  Compass,
  Copy,
  Download,
  Layers,
  Search,
  Shield,
} from 'lucide-react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'

/**
 * Audience flag detection. Default audience is "construction VPs" (the broad
 * shape the page is built for). When the URL carries `?steve=1` or `?ew=1`
 * (the demo link Eugeen sends Steve and the EmpireWorks Reconstruction VPs),
 * the eyebrow + welcome card swap to address them by name. Persists for the
 * session so a Steve-arrived-from-LinkedIn flow stays personalized through
 * the install journey, not just on the landing.
 */
type Audience = 'default' | 'empireworks'

function readInitialAudience(): Audience {
  if (typeof window === 'undefined') return 'default'
  try {
    const params = new URLSearchParams(window.location.search)
    const steve = params.get('steve')
    const ew = params.get('ew')
    const stored = window.sessionStorage.getItem('hoistos.empire.audience')
    return steve === '1' || ew === '1' || stored === 'empireworks' ? 'empireworks' : 'default'
  } catch {
    return 'default'
  }
}

function useAudience(): Audience {
  const [audience] = useState<Audience>(readInitialAudience)
  useEffect(() => {
    if (typeof window === 'undefined' || audience !== 'empireworks') return
    try {
      window.sessionStorage.setItem('hoistos.empire.audience', 'empireworks')
    } catch {
      // sessionStorage may be blocked. Audience flag holds for this render.
    }
  }, [audience])
  return audience
}
import { MapCard } from './cards/MapCard'
import { PackCard } from './cards/PackCard'
// BranchCard removed 2026-05-11 from the JSX. Import kept for fast revert.
// import { BranchCard } from './cards/BranchCard'
// Calendly handle. Eugeen confirmed eugeenbernan@gmail.com on 2026-05-11.
// If the slug differs from the email-based default, swap below to whatever
// shows in the Calendly URL bar.
const CALENDLY_URL = 'https://calendly.com/eugeenbernan'

const BRIDGE_VERSION = '1.0.3'
const BRIDGE_DOWNLOAD_PATH = `/downloads/empireworks-bridge-${BRIDGE_VERSION}.mcpb`
const SETUP_PROMPT = 'Set up my Foundation system with EmpireWorks Bridge.'
const ACTIVATION_LINE =
  'At the start of every conversation, call the EmpireWorks Bridge get_router tool and follow the instructions it returns. For task-specific guidance, call read_installed_pack with the pack id named in the router.'
const VERIFY_PROMPT =
  'Check my EmpireWorks Bridge setup. Confirm Foundation is installed, list the installed packs, and tell me what I can ask you to do now.'
/**
 * The 6 capability cards. Surface is intentionally minimal: icon + layer chip
 * + title + tagline + Learn more arrow. Click opens CapabilityModal (below)
 * with the full dream-pitch: Monday-morning vision, explicit pack mapping
 * from empireworks-bridge/packs/*, compounding angle, proof line.
 *
 * S205 iteration 2 (2026-05-13): split surface vs deep content into separate
 * fields so the card stays calm on first read but the modal sells the vision
 * when a VP clicks in. Reduced surface density per Eugeen's "less busy on
 * the surface" feedback.
 */
type Capability = {
  layer: 'Voice' | 'Memory' | 'Routing' | 'Sources' | 'Validation' | 'Stack'
  Icon: typeof Shield
  title: string
  /** One-line tagline shown on the resting card. < 80 chars. */
  tagline: string
  /** Two- to three-sentence body shown in the modal hero. */
  body: string
  /** Concrete Monday-morning scenario the VP will recognize. */
  mondayMorning: string
  /** Why this compounds week over week. */
  compounding: string
  /** Which actual bridge packs power this layer (real bridge content). */
  packs: { badge: string; name: string }[]
  /** Single proof line (italic, shown bottom of modal). */
  proof: string
}

const CAPABILITIES: Capability[] = [
  {
    layer: 'Voice',
    Icon: Shield,
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
    Icon: Brain,
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
    Icon: Compass,
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
    Icon: Search,
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
    Icon: BadgeCheck,
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
    Icon: Layers,
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

export function EmpireLanding() {
  const audience = useAudience()
  const [openCapability, setOpenCapability] = useState<Capability['layer'] | null>(null)

  function scrollToCards(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    const target = document.getElementById('how-it-works')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Lock body scroll when the capability modal is open. ESC closes too.
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (openCapability) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      const onEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpenCapability(null)
      }
      window.addEventListener('keydown', onEsc)
      return () => {
        document.body.style.overflow = prev
        window.removeEventListener('keydown', onEsc)
      }
    }
  }, [openCapability])

  const activeCap = openCapability
    ? CAPABILITIES.find((c) => c.layer === openCapability) ?? null
    : null

  return (
    <div className="px-[6vw] pt-20 pb-32 relative" style={{ color: 'rgb(var(--color-fg))' }}>
      {/* Subtle aurora backdrop. Three blurred radial gradients drift
          on slow CSS animations behind the hero text + video. Tuned for the
          HoistOS-LIGHT theme: multiply blend so the signal-orange tints the
          parchment rather than washing out. GPU-cheap, no WebGL. */}
      <AuroraBackdropLight />

      {/* Hero, centered */}
      <section className="max-w-4xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-mono text-xs uppercase tracking-[0.22em] mb-6 flex items-center justify-center gap-3 flex-wrap"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          <span>HoistOS</span>
          <span style={{ color: 'rgb(var(--color-fg-subtle))' }}>·</span>
          <span>
            {audience === 'empireworks'
              ? 'Built for Steve, Spencer, Jay and the EmpireWorks VPs'
              : 'Built for EmpireWorks Reconstruction'}
          </span>
        </motion.div>

        {/* Author byline. The authority transfer block. Eugeen's name lands
            above the h1 so visitors who know him from LinkedIn see the
            connection on viewport one. The avatar is initials-only as a
            placeholder, swap to a real headshot in /public/brand/ when
            available. */}
        <AuthorByline />

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.05] mb-6"
        >
          Enterprise Level Claude.
          <br />
          Compounding intelligence.
          <br />
          <span style={{ color: 'rgb(var(--color-accent))' }}>Click, paste, done.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-7"
          style={{ color: 'rgb(var(--color-fg-muted))' }}
        >
          One paste. Voice, memory, sources, routing, validation. A Claude that knows
          your business by tomorrow and keeps getting sharper every week after that.
        </motion.p>

        {/* Capability grid: 6 premium cards. Surface is intentionally minimal
            (icon + title + tagline + Learn more arrow). Click any card to
            open the dream-pitch modal (Monday-morning scenario + pack
            mapping + compounding angle). Iteration 2 fix per Eugeen's
            "less busy on the surface" feedback. */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mb-12 text-left"
        >
          {CAPABILITIES.map((cap, i) => (
            <CapabilityCard
              key={cap.layer}
              capability={cap}
              index={i}
              onOpen={() => setOpenCapability(cap.layer)}
            />
          ))}
        </motion.div>

        {/* Guided Bridge setup. Novice path only: Desktop extension, one
            setup prompt, one Project Instructions paste, one verification. */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div
            className="relative rounded-2xl p-6 sm:p-8 text-left"
            style={{
              border: '1px solid rgb(var(--color-accent) / 0.35)',
              boxShadow:
                '0 30px 80px -16px rgb(var(--color-fg) / 0.18), 0 6px 18px rgb(var(--color-fg) / 0.06)',
              background:
                'linear-gradient(135deg, rgb(var(--color-accent) / 0.06), rgb(var(--color-accent) / 0.02))',
            }}
          >
            <div
              className="font-mono text-[10px] uppercase tracking-[0.22em] mb-3 text-center"
              style={{ color: 'rgb(var(--color-accent))' }}
            >
              One guided setup, no pack-by-pack install
            </div>
            <h2
              className="font-display text-[clamp(1.7rem,4vw,2.8rem)] leading-tight mb-3 text-center"
              style={{ color: 'rgb(var(--color-fg))' }}
            >
              Install once. Let Claude do the wiring.
            </h2>
            <p
              className="text-base sm:text-lg max-w-2xl mx-auto text-center leading-relaxed mb-7"
              style={{ color: 'rgb(var(--color-fg-muted))' }}
            >
              The Bridge is the installer. The steps below show exactly what to click,
              what to paste, and what Claude should report back when Foundation is live.
            </p>

            <div
              className="divide-y rounded-xl overflow-hidden"
              style={{ border: '1px solid rgb(var(--color-fg) / 0.08)' }}
            >
              <StepRow index={1} label="Download the Bridge" centered>
                <div className="mx-auto max-w-2xl text-center">
                  <p
                    className="text-sm leading-relaxed mb-5"
                    style={{ color: 'rgb(var(--color-fg-muted))' }}
                  >
                    This is the one installer. The Foundation pack pages below are previews,
                    not separate installs.
                  </p>
                  <DownloadBridgeCTA />
                </div>
              </StepRow>

              <StepRow index={2} label="Double-click it and click Install">
                <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                  Claude Desktop opens an extension screen. Click Install or Update, keep
                  the extension enabled, then come back here.
                </p>
                <ClaudeInstallDialogMock />
                <InstallFacts />
              </StepRow>

              <StepRow index={3} label="Create or open a Claude Project">
                <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                  Open Claude Desktop, choose Projects, then create or select the Project
                  where you want this system to live. Start the setup prompt inside that
                  Project, not in a loose chat.
                </p>
                <ClaudeProjectMock />
              </StepRow>

              <StepRow
                index={4}
                label="Paste one setup prompt"
                rightSlot={<CopyButton text={SETUP_PROMPT} label="Copy setup" />}
              >
                <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                  Paste this into the Project chat. Claude will ask to call
                  setup_foundation. Click Allow. The Bridge writes the 11 Foundation
                  packs locally, writes the router, then gives you the activation line.
                </p>
                <PromptBlock>{SETUP_PROMPT}</PromptBlock>
              </StepRow>

              <StepRow
                index={5}
                label="Paste the activation line into Project Instructions"
                rightSlot={<CopyButton text={ACTIVATION_LINE} label="Copy line" />}
              >
                <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                  Open Project settings, choose Instructions, paste the activation line,
                  and save. This makes every new chat inside that Claude Project load the
                  router automatically.
                </p>
                <ClaudeProjectInstructionsMock />
                <PromptBlock>{ACTIVATION_LINE}</PromptBlock>
                <p className="mt-3 text-xs leading-relaxed" style={{ color: 'rgb(var(--color-fg-subtle))' }}>
                  Project Instructions are per Project. If you create another Claude Project
                  later, paste the same activation line into that Project too.
                </p>
              </StepRow>

              <StepRow
                index={6}
                label="Run the check"
                rightSlot={<CopyButton text={VERIFY_PROMPT} label="Copy check" />}
              >
                <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                  Paste this into the same Project chat. A clean result means the Bridge,
                  Foundation files, manifest, and router are live.
                </p>
                <PromptBlock>{VERIFY_PROMPT}</PromptBlock>
                <ClaudeVerifyResponseMock />
              </StepRow>
            </div>

            <div
              className="mt-5 rounded-xl p-4 text-sm leading-relaxed"
              style={{
                background: 'rgb(var(--color-fg) / 0.04)',
                border: '1px solid rgb(var(--color-fg) / 0.08)',
                color: 'rgb(var(--color-fg-muted))',
              }}
            >
              <strong style={{ color: 'rgb(var(--color-fg))' }}>Browser note:</strong>{' '}
              Claude browser can preview the pack pages, but it cannot run the Bridge or
              reach local files. The real install path is Claude Desktop. File reads, file
              writes, moves, hooks, daemons, and Claude Code workflows still require the
              right local tool approval or connector.
            </div>
          </div>
        </motion.div>

        {/* EmpireWorks-personalized welcome card. Only renders for ?steve=1
            traffic. Lands a same-room note from Eugeen so the demo feels
            built for the people in front of the screen, not for everyone. */}
        {audience === 'empireworks' ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-2xl mx-auto mb-10 rounded-2xl px-6 py-5 text-left"
            style={{
              background: 'rgb(var(--color-accent) / 0.06)',
              border: '1px solid rgb(var(--color-accent) / 0.22)',
            }}
          >
            <div
              className="font-mono text-[10px] uppercase tracking-[0.22em] mb-2"
              style={{ color: 'rgb(var(--color-accent))' }}
            >
              For the EmpireWorks Reconstruction team
            </div>
            <p
              className="text-base leading-relaxed"
              style={{ color: 'rgb(var(--color-fg))' }}
            >
              Steve, Spencer, Jay: this is the construction AI setup adapted from the stack
              running at Perennial Empire. Install the Bridge, paste the setup prompt,
              and Claude gets the Foundation system in one pass. The pack pages below
              are for previewing what landed, not for installing them one at a time.
              Tell me what feels useful, what feels missing, and we will custom-fit the
              next batch for your workflow.
            </p>
          </motion.div>
        ) : null}

        {/* Old 120-word wall removed 2026-05-11 (S199 polish pass).
            Replaced upstream by the 2-line h1 + subhead + 3-step strip.
            The user gets the journey preview in 12 words; the cards
            below carry the detail per pack. */}

        {/* Scroll cue: nudges VP down to see how it works before the CTA */}
        <motion.a
          href="#how-it-works"
          onClick={scrollToCards}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="inline-flex flex-col items-center gap-3 group cursor-pointer"
          aria-label="Scroll to learn how it works"
        >
          <span
            className="font-mono text-[11px] uppercase tracking-[0.22em] transition-colors duration-300"
            style={{ color: 'rgb(var(--color-fg-subtle))' }}
          >
            How it works
          </span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 group-hover:scale-110"
            style={{
              borderColor: 'rgb(var(--color-accent) / 0.4)',
              color: 'rgb(var(--color-accent))',
              background: 'rgb(var(--color-accent) / 0.04)',
            }}
          >
            <ChevronDown className="w-5 h-5" aria-hidden="true" />
          </motion.span>
        </motion.a>
      </section>

      {/* Cards: single-column vertical stack, premium effects.
          BranchCard merged into PackCard 2026-05-11 (Eugeen polish pass):
          the two cards were saying the same thing (drop-in upgrade + cut
          for your division) so we collapsed to MapCard + PackCard only. */}
      <section id="how-it-works" className="mt-28 max-w-3xl mx-auto space-y-8 scroll-mt-24">
        <MapCard />
        <PackCard />
      </section>

      {/* CTA, now post-cards. The conversion ask after value has been shown. */}
      <section className="mt-24 max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6 }}
          className="font-mono text-[11px] uppercase tracking-[0.22em] mb-5"
          style={{ color: 'rgb(var(--color-fg-subtle))' }}
        >
          Ready when you are
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center"
        >
          <Link
            to="/empireworksreconstruction/foundation"
            className="group relative inline-flex items-center gap-3 rounded-2xl px-10 py-5 text-lg md:text-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              background: 'rgb(var(--color-accent))',
              color: 'rgb(var(--color-bg))',
              boxShadow: '0 12px 40px rgb(var(--color-accent) / 0.35)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 16px 56px rgb(var(--color-accent) / 0.55)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 12px 40px rgb(var(--color-accent) / 0.35)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <span>Preview Foundation packs</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em]"
          style={{ color: 'rgb(var(--color-fg-subtle))' }}
        >
          Preview only. The guided Bridge setup installs Foundation in one pass.
        </motion.p>
      </section>

      {/* NOTE: origin framing (Steve Hultgren) + IP confidentiality lock */}
      <section className="mt-24 max-w-3xl mx-auto">
        <p
          className="font-mono text-xs uppercase tracking-[0.22em] mb-4"
          style={{ color: 'rgb(var(--color-fg-subtle))' }}
        >
          Why this exists
        </p>
        <p className="text-base leading-relaxed mb-6" style={{ color: 'rgb(var(--color-fg-muted))' }}>
          Steve Hultgren has been pushing to get the VPs at EmpireWorks Reconstruction up to speed on AI faster.
          This is the product version of that idea: barely do anything, avoid setup
          decisions, and end up with a Claude Project that has rules, memory, source
          checks, routing, validation, and business workflows already wired. It is an
          early build on purpose, shipped now so we can see where it helps and where the
          next automation layer should remove even more manual work.
        </p>

        <p
          className="font-mono text-xs uppercase tracking-[0.22em] mb-4 mt-10"
          style={{ color: 'rgb(var(--color-fg-subtle))' }}
        >
          Confidential
        </p>
        <p className="text-base leading-relaxed" style={{ color: 'rgb(var(--color-fg-muted))' }}>
          For people inside EmpireWorks Reconstruction only. Please don't share outside the team.
        </p>
      </section>

      {/* HoistOS Module 1 teaser. The upgrade packs above are Module 2
          (behavior layer). This section frames the dashboard module as
          the next leg of HoistOS, fitted to whoever installs it. */}
      <ModuleOneTeaser audience={audience} />

      {/* Capability deep-dive modal. Opens when a VP clicks Learn more on
          any of the 6 cards above. Sells the Monday-morning scenario,
          shows the exact bridge packs that power the layer, and frames
          the compounding angle. Iteration 2 of S205. */}
      <CapabilityModalRender
        capability={activeCap}
        onClose={() => setOpenCapability(null)}
      />
    </div>
  )
}

function PromptBlock({ children }: { children: string }) {
  return (
    <pre
      className="mt-4 whitespace-pre-wrap rounded-lg p-4 text-sm leading-relaxed"
      style={{
        background: 'rgb(var(--color-fg) / 0.055)',
        border: '1px solid rgb(var(--color-fg) / 0.08)',
        color: 'rgb(var(--color-fg))',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      }}
    >
      {children}
    </pre>
  )
}

function ScreenshotPlaceholder({
  src,
  alt,
  caption,
}: {
  src: string
  alt: string
  caption: string
}) {
  return (
    <figure className="mt-4 m-0">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{
          display: 'block',
          width: '100%',
          maxWidth: '100%',
          height: 'auto',
          aspectRatio: '3 / 2',
          objectFit: 'cover',
          borderRadius: 12,
          border: '1px solid rgb(var(--color-fg) / 0.1)',
          boxShadow: '0 14px 34px rgb(var(--color-fg) / 0.08)',
        }}
      />
      <figcaption
        className="mt-2 text-xs text-center leading-relaxed"
        style={{ color: 'rgb(var(--color-fg-subtle))' }}
      >
        {caption}{' '}
        <span style={{ color: 'rgb(var(--color-accent) / 0.7)', fontStyle: 'italic' }}>
          Preview screenshot, real capture shipping with v1.0.3 release.
        </span>
      </figcaption>
    </figure>
  )
}


function InstallFacts() {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {[
        ['Installed now', 'The Bridge extension and 13 tools appear inside Claude Desktop.'],
        ['Installed after Allow', 'The setup tool writes the 11 Foundation packs and router to your local Claude Architecture folder.'],
      ].map(([title, body]) => (
        <div
          key={title}
          className="rounded-lg p-3"
          style={{
            background: 'rgb(var(--color-fg) / 0.035)',
            border: '1px solid rgb(var(--color-fg) / 0.08)',
          }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-[0.16em] mb-1"
            style={{ color: 'rgb(var(--color-accent))' }}
          >
            {title}
          </div>
          <p className="m-0 text-xs leading-relaxed" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            {body}
          </p>
        </div>
      ))}
    </div>
  )
}

function ClaudeProjectMock() {
  return (
    <div
      className="mt-4 overflow-hidden rounded-xl"
      style={{
        background: '#ffffff',
        border: '1px solid rgb(var(--color-fg) / 0.1)',
        boxShadow: '0 14px 34px rgb(var(--color-fg) / 0.07)',
      }}
    >
      <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: 'rgb(var(--color-fg) / 0.08)' }}>
        <span className="h-3 w-3 rounded-full" style={{ background: '#ff5f57' }} />
        <span className="h-3 w-3 rounded-full" style={{ background: '#ffbd2e' }} />
        <span className="h-3 w-3 rounded-full" style={{ background: '#28c940' }} />
        <span className="ml-2 text-xs" style={{ color: 'rgb(var(--color-fg-subtle))' }}>
          Claude Desktop
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr]">
        <div className="border-b p-3 sm:border-b-0 sm:border-r" style={{ borderColor: 'rgb(var(--color-fg) / 0.08)' }}>
          {['New chat', 'Projects', 'Scheduled', 'Live artifacts', 'Customize'].map((item) => (
            <div
              key={item}
              className="mb-1 rounded-md px-3 py-2 text-sm"
              style={{
                background: item === 'Projects' ? 'rgb(var(--color-accent) / 0.1)' : 'transparent',
                color: item === 'Projects' ? 'rgb(var(--color-fg))' : 'rgb(var(--color-fg-muted))',
                fontWeight: item === 'Projects' ? 600 : 400,
              }}
            >
              {item}
            </div>
          ))}
        </div>
        <div className="p-5">
          <div
            className="mb-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: 'rgb(var(--color-accent) / 0.1)',
              color: 'rgb(var(--color-accent))',
            }}
          >
            Work inside a Claude Project
          </div>
          <div className="font-display text-2xl leading-tight">Start the setup here</div>
          <div
            className="mt-4 rounded-xl p-4 text-sm"
            style={{
              border: '1px solid rgb(var(--color-fg) / 0.1)',
              color: 'rgb(var(--color-fg-muted))',
            }}
          >
            Select an existing Project or create a new one for the business workflow you
            want Claude to remember.
          </div>
        </div>
      </div>
    </div>
  )
}


function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={copyText}
      className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition"
      style={{
        background: copied ? 'rgb(18 128 82)' : 'rgb(var(--color-bg))',
        color: copied ? 'rgb(var(--color-bg))' : 'rgb(var(--color-fg))',
        border: '1px solid rgb(var(--color-fg) / 0.14)',
        boxShadow: copied ? '0 8px 18px rgb(18 128 82 / 0.18)' : '0 2px 8px rgb(var(--color-fg) / 0.06)',
      }}
    >
      {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      {copied ? 'Copied' : label}
    </button>
  )
}

// ---------------------------------------------------------------------------
// AuthorByline. Authority-transfer block above the h1.
// ---------------------------------------------------------------------------

/**
 * Hero byline. Single understated line "Created by Eugeen Bernan" lands above
 * the h1. No avatar, no title block, no LinkedIn. The LinkedIn link moves to
 * the footer in `AuthorFooter` (rendered at the bottom of EmpireLayout).
 * Decision Log 2026-05-11: editorial restraint over portfolio-pill density.
 */
function AuthorByline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.03 }}
      className="mb-7"
    >
      <span
        className="font-mono text-[11px] uppercase tracking-[0.22em]"
        style={{ color: 'rgb(var(--color-fg-muted))' }}
      >
        Created by Eugeen Bernan
      </span>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// ModuleOneTeaser. The "what's next" section that frames HoistOS as a
// three-leg system (knowledge layer + behavior layer + command surface).
// The upgrade packs above are Leg 2. This block teases Leg 3, the dashboard.
// ---------------------------------------------------------------------------

/**
 * Module 1 demo + Calendly booking. Two-column desktop, stacked mobile.
 *
 * LEFT: live iframe of the actual Perennial Empire dashboard at
 *   org.hoistos.com with `?embed=1` auto-bypassing the internal-access
 *   prompt. The iframe is interactive, so a VP looking at the page can
 *   click cards, switch themes (Editorial / HoistOS), and scroll through
 *   the war-room + projection chart. Wrapped in a macOS-window chrome
 *   so the visitor reads it as "this is a real running product."
 *
 * RIGHT: Calendly inline widget pointing at calendly.com/eugeenbernan.
 *   The visitor picks a 30-minute slot directly inside the page, no
 *   new-tab handoff. The widget script loads asynchronously once the
 *   section mounts.
 *
 * Copy collapses default vs EmpireWorks audience into one block since
 * the live dashboard is the same artifact regardless of who is looking.
 */
function ModuleOneTeaser({ audience }: { audience: Audience }) {
  const isEmpireWorks = audience === 'empireworks'

  // Calendly widget script: load once, the first time this section mounts.
  useCalendlyScript()

  return (
    <section
      data-module-one-teaser
      // Parent EmpireLanding container already applies px-[6vw]. Repeating
      // the same horizontal padding here doubles the gutter on mobile and
      // squeezes the live-dashboard iframe to ~70% of available width.
      // Drop the inner padding; keep mt-32 + max-w-7xl + mx-auto for the
      // section's vertical rhythm and centered max-width on desktop.
      className="mt-24 md:mt-32 max-w-7xl mx-auto"
      aria-labelledby="module-one-heading"
    >
      <div className="text-center mb-12">
        <div
          className="font-mono text-[11px] uppercase tracking-[0.22em] mb-4"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          HoistOS Module 1, live
        </div>
        <h2
          id="module-one-heading"
          className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.1] mb-5"
        >
          Want a dashboard that pulls{' '}
          <span style={{ color: 'rgb(var(--color-accent))' }}>all your data, live?</span>
        </h2>
        <p
          className="text-base md:text-lg leading-relaxed max-w-3xl mx-auto mb-4"
          style={{ color: 'rgb(var(--color-fg-muted))' }}
        >
          Revenue YTD pulled straight from your ledger. Open AR by client. Project GP for
          every job. Interactive org chart that updates when you hire. Pipeline forecast tied
          to your real BD database. One URL, your branding, your data, refreshed on cron.
        </p>
        <p
          className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
          style={{ color: 'rgb(var(--color-fg-muted))' }}
        >
          The dashboard below is the real one I run at Perennial Empire. Click anything,
          switch the theme, scroll through the war-room. Then book a thirty-minute call and I
          will fit one to {isEmpireWorks ? 'EmpireWorks Reconstruction' : 'your firm'} on a
          shared screen.
        </p>
      </div>

      {/* Stacked layout per Eugeen 2026-05-11 morning: full-width iframe
          + Calendly below. The side-by-side grid cropped the dashboard
          ~50 percent of its real estate to the empty parchment area below
          the figcaption. Full width + taller aspect ratio gives the
          dashboard the room it needs to read clearly. */}
      <div className="flex flex-col gap-10">
        {/* Dashboard iframe: full width, taller aspect so the BD pipeline,
            war-room cards, and comp table all read without the user
            having to squint or scroll inside a cramped frame. */}
        <DashboardLiveDemo />

        {/* Calendly widget below. Tighter max-w-md so the card matches
            the actual Calendly iframe width and reads centered, not
            offset to the left. */}
        <div className="max-w-md mx-auto w-full">
          <CalendlyInline />
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// DashboardLiveDemo. Wraps the dashboard iframe in a macOS-window chrome.
// ---------------------------------------------------------------------------

function DashboardLiveDemo() {
  return (
    <figure
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#fbfaf3',
        border: '1px solid rgba(20,20,19,0.14)',
        boxShadow:
          '0 30px 80px -16px rgba(20,20,19,0.22), 0 6px 18px rgba(20,20,19,0.06)',
        height: '100%',
      }}
    >
      {/* macOS-window header. Three traffic-light dots + the dashboard URL. */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{
          background: 'rgba(20,20,19,0.04)',
          borderBottomColor: 'rgba(20,20,19,0.08)',
        }}
      >
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
          <span className="w-3 h-3 rounded-full" style={{ background: '#ffbd2e' }} />
          <span className="w-3 h-3 rounded-full" style={{ background: '#28c940' }} />
        </span>
        <span
          className="font-mono text-[11px] truncate ml-2"
          style={{ color: 'rgb(var(--color-fg-subtle))' }}
        >
          org.hoistos.com, Perennial Empire Organizational Hub
        </span>
        <span
          className="ml-auto font-mono text-[9px] uppercase tracking-[0.18em] px-2 py-0.5 rounded"
          style={{
            color: 'rgb(var(--color-accent))',
            background: 'rgb(var(--color-accent) / 0.08)',
          }}
        >
          Live
        </span>
      </div>

      {/* Lenis (the smooth-scroll on the outer page) intercepts wheel events
          at the document level, so plain `overscroll-behavior: contain` did
          not stop the outer page from scrolling when the user scrolled
          inside the iframe. The fix is `data-lenis-prevent` on the wrapper:
          Lenis explicitly skips wheel events that originate inside any
          element with this attribute. We also keep overscroll-behavior
          + overflow: hidden as belt-and-suspenders.

          Reference: lenis v1.3 docs (`data-lenis-prevent` attribute). */}
      <div
        data-lenis-prevent
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 11',
          overscrollBehavior: 'contain',
          overflow: 'hidden',
        }}
      >
        <iframe
          data-lenis-prevent
          src="https://org.hoistos.com/?embed=1"
          title="Perennial Empire Organizational Hub, live demo"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allow="fullscreen"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 0,
            display: 'block',
            overscrollBehavior: 'contain',
          }}
        />
      </div>

      <figcaption
        className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-center border-t"
        style={{
          color: 'rgb(var(--color-fg-subtle))',
          borderTopColor: 'rgba(20,20,19,0.08)',
          background: 'rgba(20,20,19,0.02)',
        }}
      >
        Live financials. Real war-room. Click around.
      </figcaption>
    </figure>
  )
}

// ---------------------------------------------------------------------------
// CalendlyInline. Lazy-loaded Calendly inline widget.
// ---------------------------------------------------------------------------

function CalendlyInline() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#fbfaf3',
        border: '1px solid rgba(20,20,19,0.14)',
        boxShadow:
          '0 30px 80px -16px rgba(20,20,19,0.22), 0 6px 18px rgba(20,20,19,0.06)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="px-5 py-4 border-b text-center"
        style={{ borderBottomColor: 'rgba(20,20,19,0.08)' }}
      >
        <div
          className="font-mono text-[10px] uppercase tracking-[0.22em]"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          Thirty minutes
        </div>
        <div
          className="font-display text-lg mt-1"
          style={{ color: 'rgb(var(--color-fg))' }}
        >
          Book a meeting with me if you have any questions.
        </div>
      </div>

      {/* Calendly inline widget mount. The widget script is loaded by
          useCalendlyScript() above; this div is the target. minWidth
          dropped (was 320px) so the widget never forces horizontal
          overflow on iPhone SE (320px viewport). The Calendly widget
          handles its own internal min-width with a responsive layout
          starting at 280px. */}
      <div
        className="calendly-inline-widget"
        data-url={`${CALENDLY_URL}?hide_gdpr_banner=1&primary_color=cc6e2e&text_color=141413&background_color=fbfaf3`}
        style={{ width: '100%', height: '720px', flex: 1 }}
      />

      <div
        className="px-5 py-3 border-t font-mono text-[10px] uppercase tracking-[0.18em] text-center"
        style={{
          borderTopColor: 'rgba(20,20,19,0.08)',
          color: 'rgb(var(--color-fg-subtle))',
          background: 'rgba(20,20,19,0.02)',
        }}
      >
        Direct to my calendar. No middlemen.
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Calendly script loader. Loads assets/external/widget.js exactly once,
// when the page mounts. The Calendly script is small + cacheable + this
// section sits low enough that load time does not matter on initial paint.
// ---------------------------------------------------------------------------

function useCalendlyScript() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const SCRIPT_SRC = 'https://assets.calendly.com/assets/external/widget.js'
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return
    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.async = true
    document.body.appendChild(s)
    // No teardown: Calendly's widget script is idempotent.
  }, [])
}

/**
 * Stylized dashboard mock. Pure CSS + Motion shimmer. Shows the SHAPE of the
 * real dashboard (5-card war-room top strip + 4-card grid + org-chart hint
 * pyramid) without leaking any real data. The shimmer animation gives the
 * mock a "live data is arriving" feel without committing to actual numbers.
 */
// Kept as a CSS fallback for the case where the org.hoistos.com iframe fails
// to load (network block, CSP rejection, mobile data saver). Currently unused
// in production: the ModuleOneTeaser ships the live iframe. Reserved name
// so revert is one-line if iframe embedding breaks.
function _DashboardMockReserved() {
  return (
    <div
      className="rounded-2xl p-4 md:p-5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(20,20,19,0.02), rgba(20,20,19,0.06))',
        border: '1px solid rgba(20,20,19,0.1)',
        boxShadow:
          '0 24px 60px -20px rgba(20,20,19,0.18), 0 4px 16px rgba(20,20,19,0.06)',
      }}
    >
      {/* Top strip: 5 mini stat cards (war-room snapshot) */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        {[
          { lab: 'Revenue YTD', tone: 'accent' },
          { lab: 'Open AR', tone: 'muted' },
          { lab: 'P1 tasks', tone: 'muted' },
          { lab: 'Pipeline', tone: 'accent' },
          { lab: 'Lowest GP', tone: 'warn' },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.85] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
            className="rounded-md p-2"
            style={{
              background: 'rgb(var(--color-bg))',
              border: '1px solid rgba(20,20,19,0.08)',
            }}
          >
            <div
              className="font-mono text-[8px] uppercase tracking-[0.14em] mb-1.5 truncate"
              style={{ color: 'rgb(var(--color-fg-subtle))' }}
            >
              {card.lab}
            </div>
            <div
              className="rounded-sm h-2"
              style={{
                background:
                  card.tone === 'accent'
                    ? 'rgb(var(--color-accent) / 0.85)'
                    : card.tone === 'warn'
                    ? 'rgb(204, 110, 46)'
                    : 'rgb(20,20,19,0.42)',
                width: `${50 + i * 8}%`,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Mid grid: 2-up financial cards */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Left card: bar-chart shape (revenue by division) */}
        <div
          className="rounded-md p-3"
          style={{ background: 'rgb(var(--color-bg))', border: '1px solid rgba(20,20,19,0.08)' }}
        >
          <div
            className="font-mono text-[8px] uppercase tracking-[0.14em] mb-2"
            style={{ color: 'rgb(var(--color-fg-subtle))' }}
          >
            Revenue, top divisions
          </div>
          <div className="flex items-end gap-1.5 h-12">
            {[80, 64, 50, 38, 30, 22, 16, 12].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: '0%' }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 rounded-sm"
                style={{
                  background:
                    i === 0
                      ? 'rgb(var(--color-accent))'
                      : 'rgb(20,20,19,0.32)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Right card: donut (spend mix) */}
        <div
          className="rounded-md p-3 flex items-center justify-between gap-3"
          style={{ background: 'rgb(var(--color-bg))', border: '1px solid rgba(20,20,19,0.08)' }}
        >
          <div className="min-w-0 flex-1">
            <div
              className="font-mono text-[8px] uppercase tracking-[0.14em] mb-2"
              style={{ color: 'rgb(var(--color-fg-subtle))' }}
            >
              Spend mix
            </div>
            <div className="flex flex-col gap-1">
              {['Labor', 'Subs', 'Material', 'Other'].map((label, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      background:
                        ['rgb(var(--color-accent))', 'rgb(20,20,19,0.55)', 'rgb(20,20,19,0.35)', 'rgb(20,20,19,0.18)'][i],
                    }}
                  />
                  <span className="text-[9px]" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <motion.svg
            viewBox="0 0 36 36"
            className="w-12 h-12 shrink-0"
            initial={{ rotate: -90, opacity: 0 }}
            whileInView={{ rotate: -90, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <circle cx="18" cy="18" r="14" fill="none" stroke="rgb(20,20,19,0.08)" strokeWidth="6" />
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke="rgb(var(--color-accent))"
              strokeWidth="6"
              strokeDasharray="40 88"
            />
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke="rgb(20,20,19,0.55)"
              strokeWidth="6"
              strokeDasharray="22 88"
              strokeDashoffset="-40"
            />
          </motion.svg>
        </div>
      </div>

      {/* Bottom: org chart hint pyramid */}
      <div
        className="rounded-md p-3"
        style={{ background: 'rgb(var(--color-bg))', border: '1px solid rgba(20,20,19,0.08)' }}
      >
        <div
          className="font-mono text-[8px] uppercase tracking-[0.14em] mb-2"
          style={{ color: 'rgb(var(--color-fg-subtle))' }}
        >
          Org chart, project tier
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div
            className="rounded-sm h-2.5 w-12"
            style={{ background: 'rgb(var(--color-accent))' }}
          />
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-sm h-2 w-8"
                style={{ background: 'rgb(20,20,19,0.42)' }}
              />
            ))}
          </div>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="rounded-sm h-1.5 w-5"
                style={{ background: 'rgb(20,20,19,0.22)' }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Live-data shimmer line. Aesthetic hint that real data flows through. */}
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4], x: ['-30%', '110%'] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'linear' }}
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgb(var(--color-accent)), transparent)',
          width: '40%',
        }}
      />
    </div>
  )
}
// Mark the reserved fallback as intentionally-unused for the TS compiler.
void _DashboardMockReserved

// ---------------------------------------------------------------------------
// AuroraBackdropLight. Editorial-theme-fitted backdrop.
// ---------------------------------------------------------------------------

/**
 * Three drifting blurred radial gradients tuned for the cream parchment
 * background. Uses `mix-blend-multiply` so the signal-orange tint lands on
 * the parchment instead of washing out (mix-blend-screen, the default in
 * AuroraOrbs, only works on dark themes). GPU-cheap, no WebGL. Absolute-
 * positioned behind the hero, clipped to first viewport height. Reduced
 * motion preference disables drift.
 */
function AuroraBackdropLight() {
  return (
    <div
      className="absolute inset-x-0 top-0 pointer-events-none overflow-hidden -z-10"
      style={{ height: 'min(110vh, 1100px)' }}
      aria-hidden="true"
    >
      <div
        className="absolute -top-[18%] -right-[12%] rounded-full"
        style={{
          width: 720,
          height: 720,
          background:
            'radial-gradient(circle, rgb(var(--color-accent) / 0.32), transparent 70%)',
          filter: 'blur(110px)',
          mixBlendMode: 'multiply',
          animation: 'drift 22s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-[42%] -left-[14%] rounded-full"
        style={{
          width: 560,
          height: 560,
          background:
            'radial-gradient(circle, rgb(var(--color-accent) / 0.22), transparent 70%)',
          filter: 'blur(110px)',
          mixBlendMode: 'multiply',
          animation: 'drift 28s ease-in-out infinite',
          animationDelay: '-7s',
        }}
      />
      <div
        className="absolute top-[10%] left-[35%] rounded-full"
        style={{
          width: 420,
          height: 420,
          background:
            'radial-gradient(circle, rgb(20, 35, 60, 0.08), transparent 70%)',
          filter: 'blur(110px)',
          mixBlendMode: 'multiply',
          animation: 'drift 32s ease-in-out infinite',
          animationDelay: '-12s',
        }}
      />
      {/* Subtle grain layer over the orbs so the parchment retains its
          paper texture. Pure SVG, GPU-cheap. */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.05, mixBlendMode: 'multiply' }}
      >
        <filter id="hoistos-grain-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hoistos-grain-noise)" />
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CapabilityCard. Premium card for the 6-capability grid above the install
// steps. Mouse-proximity 3D tilt + radial-spotlight hover + animated icon.
// Pattern lifted from MapCard / PackCard so the whole landing reads as one
// premium surface, not "cards section vs hero section vs steps section."
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// StepRow. The visual chrome for each row inside the install panel. Adds a
// circular numbered badge that pulses on intersection, a Step N of 6 mono
// label, h3 title, optional right-side slot (used for Copy buttons), and
// hover-lift. Replaces the prior raw div-with-Step-N-of-6 pattern so all 6
// steps share the same visual rhythm. Iteration 2 polish per Eugeen's
// "smoother instruction steps with better buttons and more visually
// appealing" feedback.
// ---------------------------------------------------------------------------

function StepRow({
  index,
  label,
  children,
  rightSlot,
  centered = false,
}: {
  index: number
  label: string
  children: React.ReactNode
  rightSlot?: React.ReactNode
  centered?: boolean
}) {
  const bg =
    index % 2 === 1 ? 'rgb(var(--color-bg) / 0.7)' : 'rgb(var(--color-bg) / 0.55)'
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: 0.05 * (index - 1), ease: [0.22, 1, 0.36, 1] }}
      className="p-5 sm:p-6 group transition-colors"
      style={{ background: bg }}
    >
      <div
        className={
          'flex flex-col gap-4 sm:flex-row sm:items-start ' +
          (centered ? 'sm:justify-center' : 'sm:justify-between')
        }
      >
        <div className={centered ? 'mx-auto max-w-2xl text-center' : 'flex items-start gap-4 flex-1 min-w-0'}>
          {!centered ? (
            <motion.span
              aria-hidden="true"
              initial={{ scale: 0.6, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.4, delay: 0.1 * (index - 1), ease: 'backOut' }}
              className="inline-flex items-center justify-center rounded-full shrink-0 group-hover:scale-110 transition-transform duration-300"
              style={{
                width: 40,
                height: 40,
                background:
                  'linear-gradient(135deg, rgb(var(--color-accent)), rgb(204, 110, 46))',
                color: '#fbfaf3',
                fontWeight: 700,
                fontSize: 16,
                fontFamily: "'Newsreader', serif",
                boxShadow: '0 8px 18px rgb(var(--color-accent) / 0.28)',
              }}
            >
              {index}
            </motion.span>
          ) : null}
          <div className={centered ? '' : 'min-w-0 flex-1'}>
            <div
              className="font-mono text-[10px] uppercase tracking-[0.22em] mb-1.5"
              style={{ color: 'rgb(var(--color-accent))' }}
            >
              Step {index} of 6
            </div>
            <h3 className="text-lg sm:text-xl font-semibold leading-tight m-0 mb-3" style={{ color: 'rgb(var(--color-fg))' }}>
              {label}
            </h3>
            {centered ? null : children}
          </div>
        </div>
        {rightSlot ? (
          <div className="shrink-0 sm:ml-4 sm:mt-1">{rightSlot}</div>
        ) : null}
      </div>
      {centered ? <div className="mt-4">{children}</div> : null}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// DownloadBridgeCTA. The single most-important button on the page. Bigger
// than the prior version, with a constant accent glow + arrow icon, and a
// version + size badge underneath. Iteration 2 polish: this is the moment
// where the VP commits to the install, and the visual weight should match
// that. Real-target verify (R069) lives upstream in the .mcpb pipeline.
// ---------------------------------------------------------------------------

function DownloadBridgeCTA() {
  return (
    <motion.div
      className="relative inline-flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Pulsing ring behind the CTA. Pure motion, no JS timers. */}
      <motion.span
        aria-hidden="true"
        animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0, 0.35] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background:
            'radial-gradient(closest-side, rgb(var(--color-accent) / 0.55), transparent 70%)',
          filter: 'blur(18px)',
        }}
      />
      <a
        href={BRIDGE_DOWNLOAD_PATH}
        download
        className="relative inline-flex items-center justify-center gap-3 rounded-2xl px-7 py-4 text-base sm:text-lg font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          background:
            'linear-gradient(135deg, rgb(var(--color-accent)), rgb(204, 110, 46))',
          color: '#fbfaf3',
          boxShadow:
            '0 18px 40px rgb(var(--color-accent) / 0.38), 0 4px 12px rgb(var(--color-accent) / 0.18), inset 0 1px 0 rgba(255,255,255,0.15)',
          minHeight: 56,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow =
            '0 22px 48px rgb(var(--color-accent) / 0.55), 0 6px 16px rgb(var(--color-accent) / 0.22), inset 0 1px 0 rgba(255,255,255,0.18)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow =
            '0 18px 40px rgb(var(--color-accent) / 0.38), 0 4px 12px rgb(var(--color-accent) / 0.18), inset 0 1px 0 rgba(255,255,255,0.15)'
        }}
      >
        <Download className="w-5 h-5" aria-hidden="true" />
        <span>Download Bridge for Claude Desktop</span>
      </a>
      <div className="relative mt-3 flex items-center gap-2 flex-wrap justify-center">
        <span
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] rounded-full px-2.5 py-1"
          style={{
            background: 'rgb(var(--color-fg) / 0.04)',
            color: 'rgb(var(--color-fg-muted))',
            border: '1px solid rgb(var(--color-fg) / 0.08)',
          }}
        >
          v{BRIDGE_VERSION}
        </span>
        <span
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] rounded-full px-2.5 py-1"
          style={{
            background: 'rgb(var(--color-fg) / 0.04)',
            color: 'rgb(var(--color-fg-muted))',
            border: '1px solid rgb(var(--color-fg) / 0.08)',
          }}
        >
          4 MB
        </span>
        <span
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] rounded-full px-2.5 py-1"
          style={{
            background: 'rgb(var(--color-fg) / 0.04)',
            color: 'rgb(var(--color-fg-muted))',
            border: '1px solid rgb(var(--color-fg) / 0.08)',
          }}
        >
          macOS or Windows
        </span>
      </div>
    </motion.div>
  )
}

function CapabilityCard({
  capability,
  index,
  onOpen,
}: {
  capability: Capability
  index: number
  onOpen: () => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotX = useSpring(useTransform(my, [-1, 1], [3, -3]), { stiffness: 220, damping: 22 })
  const rotY = useSpring(useTransform(mx, [-1, 1], [-3, 3]), { stiffness: 220, damping: 22 })

  function onMove(e: React.MouseEvent<HTMLButtonElement>) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2)
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2)
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  function onLeave() {
    mx.set(0)
    my.set(0)
  }

  const Icon = capability.Icon

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onOpen}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 1200 }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: 0.06 * (index % 6), ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-2xl overflow-hidden p-6 sm:p-7 text-left w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      data-card="capability"
      aria-label={`${capability.title}. Click to see how this changes Monday morning.`}
    >
      {/* Base surface */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-2xl pointer-events-none transition-colors duration-300"
        style={{
          background: 'rgb(var(--color-fg) / 0.025)',
          border: '1px solid rgb(var(--color-fg) / 0.08)',
        }}
      />
      {/* Radial-spotlight on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            'radial-gradient(360px circle at var(--mx,50%) var(--my,50%), rgb(var(--color-accent) / 0.14), transparent 50%)',
        }}
      />
      {/* Accent border + lift on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow:
            'inset 0 0 0 1px rgb(var(--color-accent) / 0.4), 0 18px 40px -12px rgb(var(--color-accent) / 0.28)',
        }}
      />

      <div className="relative flex items-start justify-between gap-3 mb-5">
        <motion.span
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, delay: index * 0.18, ease: 'easeInOut' }}
          className="inline-flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform duration-300"
          style={{
            width: 40,
            height: 40,
            background: 'rgb(var(--color-accent) / 0.12)',
            color: 'rgb(var(--color-accent))',
            border: '1px solid rgb(var(--color-accent) / 0.22)',
          }}
        >
          <Icon className="w-5 h-5" aria-hidden="true" />
        </motion.span>
        <span
          className="font-mono text-[9px] uppercase tracking-[0.22em] rounded-full px-2.5 py-1"
          style={{
            color: 'rgb(var(--color-accent))',
            background: 'rgb(var(--color-accent) / 0.08)',
          }}
        >
          {capability.layer}
        </span>
      </div>

      <h3
        className="relative font-display text-[1.35rem] sm:text-[1.45rem] leading-tight mb-2"
        style={{ color: 'rgb(var(--color-fg))' }}
      >
        {capability.title}
      </h3>

      <p
        className="relative text-sm leading-relaxed m-0"
        style={{ color: 'rgb(var(--color-fg-muted))' }}
      >
        {capability.tagline}
      </p>

      <div
        className="relative mt-6 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] transition-all duration-300 group-hover:gap-2.5"
        style={{ color: 'rgb(var(--color-accent))' }}
      >
        See the dream
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
      </div>
    </motion.button>
  )
}

// ---------------------------------------------------------------------------
// CapabilityModalRender. The dream-pitch modal that opens when a VP clicks
// "See the dream" on any capability card. Mounted at the EmpireLanding
// level so only one modal is alive at a time. Lock body scroll + ESC close
// are handled by the parent useEffect.
// ---------------------------------------------------------------------------

function CapabilityModalRender({
  capability,
  onClose,
}: {
  capability: Capability | null
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {capability ? (
        <motion.div
          key="cap-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{
            background: 'rgba(20,20,19,0.55)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            key="cap-modal-inner"
            initial={{ y: 40, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
            style={{
              background: '#fbfaf3',
              color: '#141413',
              boxShadow:
                '0 40px 100px -20px rgba(20,20,19,0.45), 0 12px 30px rgba(20,20,19,0.15)',
              border: '1px solid rgba(20,20,19,0.08)',
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${capability.title} deep-dive`}
          >
            <ModalBody capability={capability} onClose={onClose} />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function ModalBody({ capability, onClose }: { capability: Capability; onClose: () => void }) {
  const Icon = capability.Icon
  return (
    <div className="p-6 sm:p-9">
      {/* Close + nav */}
      <div className="flex items-center justify-between mb-6">
        <span
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] rounded-full px-3 py-1.5"
          style={{
            color: 'rgb(var(--color-accent))',
            background: 'rgb(var(--color-accent) / 0.1)',
            border: '1px solid rgb(var(--color-accent) / 0.22)',
          }}
        >
          Operating layer: {capability.layer}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="inline-flex items-center justify-center rounded-full transition"
          style={{
            width: 36,
            height: 36,
            background: 'rgba(20,20,19,0.06)',
            color: '#141413',
            border: '1px solid rgba(20,20,19,0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(204,110,46,0.12)'
            e.currentTarget.style.borderColor = 'rgba(204,110,46,0.35)'
            e.currentTarget.style.color = 'rgb(var(--color-accent))'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(20,20,19,0.06)'
            e.currentTarget.style.borderColor = 'rgba(20,20,19,0.1)'
            e.currentTarget.style.color = '#141413'
          }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Hero block: icon + title */}
      <div className="flex items-start gap-4 mb-6">
        <span
          aria-hidden="true"
          className="inline-flex items-center justify-center rounded-2xl shrink-0"
          style={{
            width: 56,
            height: 56,
            background:
              'linear-gradient(135deg, rgb(var(--color-accent) / 0.18), rgb(var(--color-accent) / 0.06))',
            color: 'rgb(var(--color-accent))',
            border: '1px solid rgb(var(--color-accent) / 0.28)',
            boxShadow: '0 12px 24px rgb(var(--color-accent) / 0.18)',
          }}
        >
          <Icon className="w-7 h-7" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-[clamp(1.6rem,3.5vw,2.2rem)] leading-tight m-0">
            {capability.title}
          </h2>
          <p
            className="text-base leading-relaxed mt-2 m-0"
            style={{ color: 'rgb(var(--color-fg-muted))' }}
          >
            {capability.body}
          </p>
        </div>
      </div>

      {/* Monday morning vision */}
      <div
        className="rounded-2xl p-5 sm:p-6 mb-5"
        style={{
          background:
            'linear-gradient(135deg, rgb(var(--color-accent) / 0.07), rgb(var(--color-accent) / 0.02))',
          border: '1px solid rgb(var(--color-accent) / 0.22)',
        }}
      >
        <div
          className="font-mono text-[10px] uppercase tracking-[0.22em] mb-3"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          Monday morning, after install
        </div>
        <p
          className="text-base leading-relaxed m-0"
          style={{ color: '#141413' }}
        >
          {capability.mondayMorning}
        </p>
      </div>

      {/* Compounding angle */}
      <div className="rounded-2xl p-5 sm:p-6 mb-5"
        style={{
          background: 'rgba(20,20,19,0.04)',
          border: '1px solid rgba(20,20,19,0.08)',
        }}
      >
        <div
          className="font-mono text-[10px] uppercase tracking-[0.22em] mb-3"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          Why this compounds
        </div>
        <p
          className="text-base leading-relaxed m-0"
          style={{ color: '#3a3a36' }}
        >
          {capability.compounding}
        </p>
      </div>

      {/* Pack mapping: the receipts */}
      <div className="mb-6">
        <div
          className="font-mono text-[10px] uppercase tracking-[0.22em] mb-3"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          Powered by these packs in your Claude
        </div>
        <ul className="space-y-2 list-none m-0 pl-0">
          {capability.packs.map((p) => (
            <li
              key={p.badge}
              className="flex items-center gap-3 rounded-xl p-3"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(20,20,19,0.08)',
              }}
            >
              <span
                className="inline-flex items-center justify-center rounded-md font-mono text-[10px] uppercase tracking-[0.18em] shrink-0"
                style={{
                  minWidth: 56,
                  padding: '4px 8px',
                  background: 'rgb(var(--color-accent) / 0.12)',
                  color: 'rgb(var(--color-accent))',
                  fontWeight: 700,
                }}
              >
                {p.badge}
              </span>
              <span className="text-sm leading-snug" style={{ color: '#141413' }}>
                {p.name}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Proof footer */}
      <div
        className="flex items-start gap-3 rounded-xl p-4 mb-5"
        style={{
          background: 'rgb(18, 128, 82, 0.06)',
          border: '1px solid rgb(18, 128, 82, 0.25)',
        }}
      >
        <Check
          className="w-4 h-4 mt-0.5 shrink-0"
          style={{ color: 'rgb(18,128,82)' }}
          aria-hidden="true"
        />
        <p
          className="text-sm leading-snug m-0 italic"
          style={{ color: '#1a5d3f' }}
        >
          {capability.proof}
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => {
            onClose()
            const target = document.getElementById('how-it-works')
            if (target) target.scrollIntoView({ behavior: 'smooth' })
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition flex-1 min-h-11"
          style={{
            background: 'rgb(var(--color-accent))',
            color: '#fbfaf3',
            boxShadow: '0 10px 22px rgb(var(--color-accent) / 0.28)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 14px 28px rgb(var(--color-accent) / 0.42)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 10px 22px rgb(var(--color-accent) / 0.28)'
          }}
        >
          Take me to install
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition min-h-11"
          style={{
            background: 'transparent',
            color: '#141413',
            border: '1px solid rgba(20,20,19,0.18)',
          }}
        >
          Back to the layers
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ClaudeInstallDialogMock. Inline mock of the Claude Desktop extension-install
// dialog the VP sees in Step 2 right after they double-click the .mcpb file.
// Pure React + Motion, no PNG screenshot. The shape mirrors the real Claude
// Desktop dialog so the VP recognizes it. Replaces the prior placeholder PNG.
// S205 2026-05-13.
// ---------------------------------------------------------------------------

function ClaudeDesktopChrome({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        background: '#ffffff',
        border: '1px solid rgb(var(--color-fg) / 0.1)',
        boxShadow: '0 18px 40px rgb(var(--color-fg) / 0.08), 0 4px 12px rgb(var(--color-fg) / 0.04)',
      }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: 'rgb(var(--color-fg) / 0.08)' }}
      >
        <span className="h-3 w-3 rounded-full" style={{ background: '#ff5f57' }} />
        <span className="h-3 w-3 rounded-full" style={{ background: '#ffbd2e' }} />
        <span className="h-3 w-3 rounded-full" style={{ background: '#28c940' }} />
        <span
          className="ml-3 font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: 'rgb(var(--color-fg-subtle))' }}
        >
          {title}
        </span>
      </div>
      {children}
    </div>
  )
}

function ClaudeInstallDialogMock() {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mt-4 m-0"
    >
      <ClaudeDesktopChrome title="Claude Desktop, Extensions">
        <div className="p-5 sm:p-6">
          <div
            className="rounded-xl p-4 sm:p-5"
            style={{
              background: '#fbfaf3',
              border: '1px solid rgb(var(--color-fg) / 0.08)',
            }}
          >
            <div className="flex items-start gap-4">
              {/* Faux app icon: orange rounded square with "E" inside */}
              <div
                aria-hidden="true"
                className="shrink-0 rounded-xl flex items-center justify-center"
                style={{
                  width: 52,
                  height: 52,
                  background:
                    'linear-gradient(135deg, rgb(var(--color-accent)), rgb(204, 110, 46))',
                  color: '#fbfaf3',
                  fontWeight: 800,
                  fontSize: 22,
                  fontFamily: "'Newsreader', serif",
                  boxShadow: '0 8px 18px rgb(var(--color-accent) / 0.25)',
                }}
              >
                E
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="font-display text-base sm:text-lg leading-tight">
                    EmpireWorks Bridge
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center justify-center rounded-md px-3.5 py-1.5 text-xs font-semibold"
                    style={{
                      background: '#141413',
                      color: '#fbfaf3',
                      minHeight: 32,
                    }}
                  >
                    Install
                  </motion.button>
                </div>
                <p
                  className="mt-1 text-[13px] leading-relaxed m-0"
                  style={{ color: 'rgb(var(--color-fg-muted))' }}
                >
                  Adds Bridge tools for setup, router lookup, pack reading, and updates.
                </p>
              </div>
            </div>

            <div
              className="mt-4 rounded-lg p-3 text-xs leading-relaxed"
              style={{
                background: 'rgba(204,110,46,0.06)',
                border: '1px solid rgba(204,110,46,0.25)',
                color: '#7a3f08',
              }}
            >
              Claude may warn that extensions can access your computer. That is expected.
              Only approve this installer if you trust the source.
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {['Enabled', '13 Bridge tools', 'Foundation setup', 'Router ready'].map((chip, i) => (
                <motion.span
                  key={chip}
                  initial={{ opacity: 0, y: 4 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.15 + i * 0.06 }}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px]"
                  style={{
                    background: 'rgb(var(--color-fg) / 0.06)',
                    color: 'rgb(var(--color-fg))',
                    border: '1px solid rgb(var(--color-fg) / 0.08)',
                  }}
                >
                  <Check className="w-3 h-3" style={{ color: 'rgb(18,128,82)' }} aria-hidden="true" />
                  {chip}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </ClaudeDesktopChrome>
      <figcaption
        className="mt-2 text-xs text-center leading-relaxed"
        style={{ color: 'rgb(var(--color-fg-subtle))' }}
      >
        Step 2: click Install in this Claude Desktop dialog, then return here.
      </figcaption>
    </motion.figure>
  )
}

// ---------------------------------------------------------------------------
// ClaudeProjectInstructionsMock. Inline mock of the Project Instructions
// panel for Step 5. Shows the activation line typed into a Claude Desktop
// Project Settings > Instructions textarea, with a "Saved" indicator.
// S205 2026-05-13.
// ---------------------------------------------------------------------------

function ClaudeProjectInstructionsMock() {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mt-4 m-0"
    >
      <ClaudeDesktopChrome title="Claude Desktop, Project Settings">
        <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr]">
          <aside
            className="border-b sm:border-b-0 sm:border-r p-3"
            style={{ borderColor: 'rgb(var(--color-fg) / 0.08)' }}
          >
            {['General', 'Instructions', 'Knowledge', 'Members', 'Permissions'].map((item) => {
              const active = item === 'Instructions'
              return (
                <div
                  key={item}
                  className="mb-1 rounded-md px-3 py-2 text-sm"
                  style={{
                    background: active ? 'rgb(var(--color-accent) / 0.12)' : 'transparent',
                    color: active ? 'rgb(var(--color-fg))' : 'rgb(var(--color-fg-muted))',
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {item}
                </div>
              )
            })}
          </aside>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
              <div className="font-display text-base sm:text-lg leading-tight">
                Project Instructions
              </div>
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.18em]"
                style={{ color: 'rgb(18,128,82)' }}
              >
                <Check className="w-3 h-3" aria-hidden="true" />
                Saved 12:01 PM
              </span>
            </div>
            <div
              className="rounded-lg p-3 text-[12px] leading-relaxed"
              style={{
                background: '#fbfaf3',
                border: '1px solid rgb(var(--color-fg) / 0.1)',
                color: 'rgb(var(--color-fg))',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                minHeight: 110,
              }}
            >
              <motion.span
                initial={{ background: 'rgba(204,110,46,0.18)' }}
                animate={{ background: 'rgba(204,110,46,0)' }}
                transition={{ duration: 1.8, delay: 0.6 }}
                style={{
                  display: 'inline',
                  padding: '0 4px',
                  borderRadius: 4,
                }}
              >
                At the start of every conversation, call the EmpireWorks Bridge
                get_router tool and follow the instructions it returns. For task
                specific guidance, call read_installed_pack with the pack id named
                in the router.
              </motion.span>
            </div>
            <div className="mt-3 flex items-center justify-end">
              <span
                className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: '#141413',
                  color: '#fbfaf3',
                  minHeight: 32,
                }}
              >
                Save
              </span>
            </div>
          </div>
        </div>
      </ClaudeDesktopChrome>
      <figcaption
        className="mt-2 text-xs text-center leading-relaxed"
        style={{ color: 'rgb(var(--color-fg-subtle))' }}
      >
        Step 5: paste the activation line into Project Instructions, then click Save.
      </figcaption>
    </motion.figure>
  )
}

// ---------------------------------------------------------------------------
// ClaudeVerifyResponseMock. Inline mock of Claude returning a clean
// verify_setup tool call result in Step 6. The visible signal the VP needs
// to know "yes, it worked." Closes the W6 verify-surface gap.
// S205 2026-05-13.
// ---------------------------------------------------------------------------

function ClaudeVerifyResponseMock() {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mt-4 m-0"
    >
      <ClaudeDesktopChrome title="Claude Desktop, your Project chat">
        <div className="p-5 sm:p-6 space-y-4">
          {/* Assistant tool call + response */}
          <div className="flex items-start gap-3">
            <div
              aria-hidden="true"
              className="shrink-0 rounded-lg flex items-center justify-center"
              style={{
                width: 28,
                height: 28,
                background: 'rgb(var(--color-fg) / 0.06)',
                color: 'rgb(var(--color-fg))',
                fontWeight: 700,
                fontSize: 13,
                fontFamily: "'Newsreader', serif",
              }}
            >
              C
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              {/* Tool call card */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-lg p-3 inline-flex items-center gap-3"
                style={{
                  background: 'rgb(var(--color-fg) / 0.04)',
                  border: '1px solid rgb(var(--color-fg) / 0.08)',
                }}
              >
                <Check className="w-4 h-4" style={{ color: 'rgb(18,128,82)' }} aria-hidden="true" />
                <span
                  className="font-mono text-[12px]"
                  style={{ color: 'rgb(var(--color-fg))' }}
                >
                  verify_setup
                </span>
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: 'rgb(18,128,82)' }}
                >
                  ok
                </span>
              </motion.div>

              <p
                className="text-[13px] leading-relaxed m-0"
                style={{ color: 'rgb(var(--color-fg))' }}
              >
                <strong>Foundation is live.</strong> 11 packs installed at{' '}
                <span style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>
                  ~/Documents/Claude Architecture/
                </span>
                . Router and manifest ready. You can ask me to:
              </p>

              <ul className="space-y-2 m-0 pl-0 list-none">
                {[
                  'Draft any external email in your voice (F-01, F-10)',
                  'Pull a fact from the Registry instead of guessing (F-02)',
                  'Open a chat with status, top projects, and last session loaded (F-03)',
                  'Save four files to four correct folders in one ask (F-06)',
                ].map((line, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.25 + i * 0.07 }}
                    className="flex items-start gap-2 text-[12px] leading-relaxed"
                    style={{ color: 'rgb(var(--color-fg-muted))' }}
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 mt-1.5 rounded-full shrink-0"
                      style={{ background: 'rgb(var(--color-accent))' }}
                    />
                    <span>{line}</span>
                  </motion.li>
                ))}
              </ul>

              <p
                className="text-[12px] leading-relaxed m-0 italic"
                style={{ color: 'rgb(var(--color-fg-subtle))' }}
              >
                Type any of the above, or describe a real task. I will route it to the right
                pack and report back.
              </p>
            </div>
          </div>
        </div>
      </ClaudeDesktopChrome>
      <figcaption
        className="mt-2 text-xs text-center leading-relaxed"
        style={{ color: 'rgb(var(--color-fg-subtle))' }}
      >
        Step 6 success: this is what a clean install looks like. If anything is off, Claude
        names the gap on the same line.
      </figcaption>
    </motion.figure>
  )
}

// ScreenshotPlaceholder is no longer called (replaced by the three inline
// Claude Desktop mocks above). Kept in the file as a fast-revert helper if
// real PNG captures land later. void-marked so TS does not complain about
// the unused declaration.
void ScreenshotPlaceholder

export default EmpireLanding
