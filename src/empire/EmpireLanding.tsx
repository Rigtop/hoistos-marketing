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
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { CAPABILITIES, type Capability } from './content/capabilities'

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

/**
 * Intake gate. Reads intake state once on mount, subscribes to changes so
 * the page re-renders when the user submits or reopens the modal. Exposes
 * complete (true once the user finished intake), open (true when the modal
 * should be visible), and helpers to open/close it explicitly. Mirrors the
 * useAudience pattern at the top of this file.
 */
interface IntakeGate {
  intake: IntakeState
  complete: boolean
  open: boolean
  setOpen: (value: boolean) => void
  reopen: () => void
}

const INTAKE_DEFERRED_KEY = 'scrolophyte.intake-deferred'

function readIntakeDeferred(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false
    return window.localStorage.getItem(INTAKE_DEFERRED_KEY) === '1'
  } catch {
    return false
  }
}

function writeIntakeDeferred(value: boolean): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return
    if (value) {
      window.localStorage.setItem(INTAKE_DEFERRED_KEY, '1')
    } else {
      window.localStorage.removeItem(INTAKE_DEFERRED_KEY)
    }
  } catch {
    /* ignore quota / private mode */
  }
}

function useIntakeGate(): IntakeGate {
  const [intake, setIntake] = useState<IntakeState>(() => readIntake())
  // Only auto-open on first visit. If the user has either completed intake or
  // explicitly dismissed it before, the modal stays closed until they tap
  // "Edit your setup." Prevents the hostile auto-open trap reported in F8.
  const [open, setOpen] = useState<boolean>(
    () => !isIntakeComplete(readIntake()) && !readIntakeDeferred(),
  )

  useEffect(() => {
    const unsubscribe = onIntakeChange(() => {
      const next = readIntake()
      setIntake(next)
      // Auto-close once the user completes intake. If the modal is open
      // because the user clicked "Edit your setup," they will explicitly
      // dismiss it from inside the modal.
      if (isIntakeComplete(next)) {
        setOpen(false)
      }
    })
    return unsubscribe
  }, [])

  const reopen = () => {
    // Clearing the deferred flag means "the user came back to finish intake."
    writeIntakeDeferred(false)
    setOpen(true)
  }

  return {
    intake,
    complete: isIntakeComplete(intake),
    open,
    setOpen,
    reopen,
  }
}
import { MapCard } from './cards/MapCard'
import { PackCard } from './cards/PackCard'
import { Intake } from './Intake'
import { JourneyTracker } from './JourneyTracker'
import {
  isIntakeComplete,
  onIntakeChange,
  readIntake,
  type IntakeState,
} from '../lib/intake-state'
import { useIsMobile } from '../lib/useIsMobile'
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
 * S205 iteration 3 (2026-05-13): CAPABILITIES + Capability type moved to
 * src/empire/content/capabilities.ts so both EmpireLanding (cards) and
 * EmpireCapabilityLayer (route at /layer/:slug) read from the same source.
 * Modal pattern from iteration 2 deleted; cards now Link to the dedicated
 * layer page so scroll, deep-linking, and back navigation all work.
 */
// Map iconName string to the actual lucide-react component
const ICON_MAP: Record<Capability['iconName'], typeof Shield> = {
  Shield,
  Brain,
  Compass,
  Search,
  BadgeCheck,
  Layers,
}

export function EmpireLanding() {
  const audience = useAudience()
  const intakeGate = useIntakeGate()
  const isMobile = useIsMobile()
  const reduced = useReducedMotion()

  function scrollToCards(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    const target = document.getElementById('how-it-works')
    if (target) {
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    }
  }

  return (
    <div className="px-[6vw] pt-20 pb-32 relative" style={{ color: 'rgb(var(--color-fg))' }}>
      {/* Subtle aurora backdrop. Three blurred radial gradients drift
          on slow CSS animations behind the hero text + video. Tuned for the
          HoistOS-LIGHT theme: multiply blend so the signal-orange tints the
          parchment rather than washing out. GPU-cheap, no WebGL. */}
      <AuroraBackdropLight />

      {/* Intake gate. Renders the 4-question modal when intake is incomplete
          or when the user explicitly clicks "Edit your setup." Once complete,
          the rest of the page renders normally. The modal carries its own
          backdrop and close handling. */}
      {intakeGate.open ? (
        <Intake
          variant="modal"
          forceOpen={intakeGate.complete}
          onComplete={() => intakeGate.setOpen(false)}
          onDismiss={() => {
            // X / Esc dismisses unconditionally. If the user has not yet
            // completed intake, remember the deferral so the modal does not
            // re-trap them on the next visit. They can resume any time via
            // "Edit your setup."
            if (!intakeGate.complete) writeIntakeDeferred(true)
            intakeGate.setOpen(false)
          }}
        />
      ) : null}

      {/* Hero + tracker layout. On lg+, hero (max-w-4xl, centered) sits
          alongside the JourneyTracker as a right-side sidebar. On mobile
          (<lg), the tracker stacks above the hero. JourneyTracker carries
          its own internal mobile-vs-desktop branch (top panel on mobile,
          right column on desktop), so we mirror that here with a flex
          container that flips column on mobile. */}
      <div
        className="relative max-w-6xl mx-auto"
        style={
          isMobile
            ? { display: 'flex', flexDirection: 'column', gap: 24 }
            : { display: 'flex', flexDirection: 'row', gap: 32, alignItems: 'flex-start' }
        }
      >
        {/* Mobile: tracker first so it stacks on top. Desktop: tracker
            second so flex-row puts it on the right. The order swap is
            handled inline via the conditional below. */}
        {isMobile ? (
          <aside aria-label="Journey tracker">
            <JourneyTracker />
          </aside>
        ) : null}

        {/* Hero, centered */}
        <section
          className="max-w-4xl mx-auto text-center relative"
          style={isMobile ? undefined : { flex: '1 1 0%', minWidth: 0 }}
        >
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

        {/* Setup pill. Surfaces when intake is complete OR when the user
            deferred the intake on first visit, so there is always a path
            back to the modal. Tap target is 44px tall for mobile per
            Hard Rule #35 / R067. */}
        {intakeGate.complete || (!intakeGate.open && readIntakeDeferred()) ? (
          <div className="mb-4">
            <button
              type="button"
              onClick={intakeGate.reopen}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors duration-200"
              style={{
                minHeight: 44,
                border: '1px solid rgb(var(--color-fg) / 0.18)',
                background: 'rgb(var(--color-fg) / 0.02)',
                color: 'rgb(var(--color-fg-muted))',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgb(var(--color-fg) / 0.06)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgb(var(--color-fg) / 0.02)'
              }}
              aria-label={intakeGate.complete ? 'Edit your setup' : 'Personalize my Claude'}
            >
              {intakeGate.complete ? 'Edit your setup' : 'Personalize my Claude'}
            </button>
          </div>
        ) : null}

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="font-display text-[clamp(2.25rem,5.5vw,4.25rem)] leading-[1.08] tracking-[-0.015em] mb-6"
        >
          Enterprise Level Claude.
          <br />
          Compounding intelligence.
          <br />
          <span style={{ color: 'rgb(var(--color-accent))' }}>Pick a pack, paste, done.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-7"
          style={{ color: 'rgb(var(--color-fg-muted))' }}
        >
          Pack by pack. Voice, memory, sources, routing, validation. A Claude that knows
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
            <CapabilityCard key={cap.layer} capability={cap} index={i} />
          ))}
        </motion.div>

        {/* Bridge install panel. Reframed 2026-05-15 from primary install
            path to optional Desktop convenience. The canonical install path
            is the intake-driven customware journey via PackGallery and
            EmpireFoundationGrid (clipboard paste to Project Knowledge). The
            Bridge is a one-click bulk-install shortcut for users who already
            have Claude Desktop installed and want all 11 Foundations in one
            pass. Pack-by-pack remains the primary path. */}
        <motion.div
          id="install-panel"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto mb-12 scroll-mt-24"
        >
          <div
            className="relative rounded-2xl p-6 sm:p-8 text-left"
            style={{
              border: '1px solid rgb(var(--color-fg) / 0.12)',
              boxShadow:
                '0 12px 30px -16px rgb(var(--color-fg) / 0.12), 0 4px 10px rgb(var(--color-fg) / 0.04)',
              background:
                'linear-gradient(135deg, rgb(var(--color-fg) / 0.025), rgb(var(--color-fg) / 0.01))',
            }}
          >
            <div
              className="text-xs font-medium mb-3 text-center"
              style={{ color: 'rgb(var(--color-fg-subtle))' }}
            >
              Skip if you do not have Claude Desktop yet
            </div>
            <h2
              className="font-display text-[clamp(1.5rem,3.5vw,2.4rem)] leading-tight mb-3 text-center"
              style={{ color: 'rgb(var(--color-fg))' }}
            >
              Already running Claude Desktop? Wire all 11 Foundations in six pastes.
            </h2>
            <p
              className="text-base sm:text-lg max-w-2xl mx-auto text-center leading-relaxed mb-7"
              style={{ color: 'rgb(var(--color-fg-muted))' }}
            >
              Six pastes. Ten minutes. Use the prev/next buttons or click any dot to jump
              around.
            </p>

            <InstallFlow />

            <div
              className="mt-5 rounded-xl p-4 text-sm leading-relaxed"
              style={{
                background: 'rgb(var(--color-fg) / 0.04)',
                border: '1px solid rgb(var(--color-fg) / 0.08)',
                color: 'rgb(var(--color-fg-muted))',
              }}
            >
              <strong style={{ color: 'rgb(var(--color-fg))' }}>Surface note:</strong>{' '}
              The Bridge runs inside Claude Desktop only. The pack-by-pack path from the
              Foundation gallery copies the pack body to your clipboard and works on any
              Claude surface (browser, Desktop, or Code). Local file reads, file writes,
              hooks, daemons, and Claude Code workflows still require the right local
              tool approval or connector regardless of which install path you use.
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
              className="text-xs font-medium mb-2"
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
              and Claude gets the Foundation system in six pastes. The pack pages below
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
            animate={reduced ? undefined : { y: [0, 6, 0] }}
            transition={reduced ? { duration: 0 } : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
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

      {/* Desktop: sidebar on the right with JourneyTracker. Mobile renders
          the tracker above the hero (see top of this layout). */}
      {!isMobile ? (
        <aside
          aria-label="Journey tracker"
          style={{ flex: '0 0 320px', width: 320, position: 'sticky', top: 96 }}
        >
          <JourneyTracker />
        </aside>
      ) : null}
      </div>

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
          Start the install
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
            <span>Install Foundation packs</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 text-sm"
          style={{ color: 'rgb(var(--color-fg-subtle))' }}
        >
          Click to install pack by pack. The Bridge above is optional for Desktop users who want bulk install.
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
          Confidential to EmpireWorks
        </p>
        <p className="text-base leading-relaxed" style={{ color: 'rgb(var(--color-fg-muted))' }}>
          This page is for people inside EmpireWorks Reconstruction. Keep it inside the team.
        </p>
      </section>

      {/* HoistOS Module 1 teaser. The upgrade packs above are Module 2
          (behavior layer). This section frames the dashboard module as
          the next leg of HoistOS, fitted to whoever installs it. */}
      <ModuleOneTeaser audience={audience} />
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
          className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded"
          style={{
            color: 'rgb(var(--color-accent))',
            background: 'rgb(var(--color-accent) / 0.08)',
          }}
        >
          Snapshot
        </span>
      </div>

      {/* Org-hub CSP rejects framing from non-allowlisted hosts, so the
          dashboard renders as a CSS-art snapshot of the live surface and
          the figcaption below links to the live URL in a new tab. Drops
          two console errors per /empire load and the silent blank-box
          failure mode. */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 11',
          padding: 12,
        }}
      >
        <DashboardCssMock />
      </div>

      <figcaption
        className="px-4 py-3 text-center border-t"
        style={{
          borderTopColor: 'rgba(20,20,19,0.08)',
          background: 'rgba(20,20,19,0.02)',
        }}
      >
        <a
          href="https://org.hoistos.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium rounded-lg transition-colors"
          style={{
            color: 'rgb(var(--color-accent))',
            padding: '12px 14px',
            minHeight: 44,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgb(var(--color-accent) / 0.08)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          Open the live dashboard in a new tab
          <span aria-hidden="true">↗</span>
        </a>
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
// CSS-art snapshot of the org.hoistos.com dashboard. Renders inline in
// DashboardLiveDemo because org-hub's CSP frame-ancestors allowlist
// rejects framing from this app's host.
function DashboardCssMock() {
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
              Phase {index} of 6
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
// InstallSlideshow. Auto-cycling carousel that walks the VP through the full
// install sequence as 5 visual frames (extension dialog, open Project, paste
// setup prompt, save activation line, verify response). Iteration 3 of S205:
// replaces 4 inline mocks scattered across individual steps with one visual
// pass-through. Eugeen feedback: "make the instructions steps smoother with
// better buttons and more visually appealing" + "the photos you used arent
// what the actual setup is, it might confuse a user if they're looking for
// a one-to-one replica."
//
// The slideshow tries a real screenshot path first (public/screenshots/
// empireworks-bridge/step-N-*.png). If the image 404s or fails to load, the
// component falls back to the existing inline Claude Desktop mock. When
// Eugeen drops real screenshots in the folder, the next deploy automatically
// picks them up.
//
// Behavior: auto-advance every 5.5s, pause on hover or focus, manual
// prev/next via arrows + dot indicators, keyboard arrows when focused.
// ---------------------------------------------------------------------------

type SlideFrame = {
  id: string
  stepLabel: string
  title: string
  caption: string
  realImagePath: string
  alt: string
  fallbackMock: React.ReactNode
}

// ---------------------------------------------------------------------------
// InstallFlow.
//
// REUSABLE TEMPLATE (S205 iteration 4-5, marked for future reuse):
// This component is the canonical "guided multi-step onboarding" pattern for
// HoistOS marketing pages. Drop it into any flow where a user has to do
// N sequential things (download, install, paste, configure, verify) and you
// want SaaS-grade UX without writing custom step-by-step machinery each time.
//
// To reuse for a new flow:
//   1. Define your steps in a separate constant array shaped like InstallStep
//      (or extend the type if your flow needs new fields like videos, embeds,
//      etc.). The current useInstallSteps() returns the EmpireWorks Bridge
//      install steps; swap it for whatever your flow needs.
//   2. Each step can hold: a title, description, paste payloads with Copy
//      buttons, a primary visual (download-cta / image / video / mock-only),
//      and optional extras (e.g. InstallFacts).
//   3. The visual rendering chain prefers video first, then screenshot, then
//      a React mock fallback. Drop a .mov or .mp4 path on visualVideo and the
//      component handles autoplay/loop/muted/playsInline + graceful fallback
//      to .png + graceful fallback to the inline mock.
//   4. The progress bar, Play/Pause toggle, prev/next, "Up next" hint, and
//      AnimatePresence transitions are all built in. No additional wiring
//      required.
//
// Iteration 4 origin: replaces the InstallSlideshow + 6 separate StepRow rows
// (which were two sets of instructions side by side per Eugeen's "now there's
// 2 sets of instructions" feedback) with a single source-of-truth stepper.
//
// Pattern: top progress bar with 6 clickable steps + Play/Pause toggle, body
// shows the active step (visual + copy + paste blocks + facts), prev/next at
// the bottom. Auto-advances every 7s when Play is on; manual nav otherwise.
//
// Auto-advance defaults to OFF so the user is in control. Click Play to
// watch the full sequence as a guided tour.
// ---------------------------------------------------------------------------

type InstallStep = {
  n: number
  label: string
  title: string
  description: string
  /** What kind of visual to render in the body. */
  visualType: 'download-cta' | 'image' | 'mock-only'
  /** Preferred video asset (used for steps with .mov captures). InstallStepVisual
   *  tries this first, falls back to visualScreenshot, then visualFallback. */
  visualVideo: string | null
  visualScreenshot: string | null
  visualFallback: React.ReactNode
  /** Optional paste payloads with their own Copy buttons. */
  copyBlocks: { label: string; text: string }[]
  /** Optional extra block (e.g. InstallFacts) shown below the visual. */
  extras: React.ReactNode | null
}

function useInstallSteps(): InstallStep[] {
  return [
    {
      n: 1,
      label: 'Download',
      title: 'Download the Bridge for Claude Desktop',
      description:
        'The Bridge ships every Foundation pack into Claude Desktop. The pack preview pages below are reference reading, not separate installs.',
      visualType: 'download-cta',
      visualVideo: null,
      visualScreenshot: null,
      visualFallback: null,
      copyBlocks: [],
      extras: null,
    },
    {
      n: 2,
      label: 'Install',
      title: 'Approve the EmpireWorks Bridge extension',
      description:
        'Claude Desktop shows a security callout. That is expected. Click Install (or Update) and keep the extension enabled.',
      visualType: 'image',
      visualVideo: null,
      visualScreenshot: '/screenshots/empireworks-bridge/step-2-extension-page-364d979009.png',
      visualFallback: <ClaudeInstallDialogMock />,
      copyBlocks: [],
      extras: <InstallFacts />,
    },
    {
      n: 3,
      label: 'Open',
      title: 'Open Claude Desktop and your Project',
      description:
        'Open Claude Desktop. Pick or create the Project where the system will live. The setup prompt runs inside that Project, not in a loose chat.',
      visualType: 'image',
      visualVideo: '/screenshots/empireworks-bridge/step-3-cowork-project.mov',
      visualScreenshot: '/screenshots/empireworks-bridge/step-3-cowork-project.png',
      visualFallback: <ClaudeProjectMock />,
      copyBlocks: [],
      extras: null,
    },
    {
      n: 4,
      label: 'Paste setup',
      title: 'Paste the setup prompt',
      description:
        'Paste this one sentence into your Project chat. Claude asks to call setup_foundation. Click Allow. The Bridge writes the 11 Foundation packs locally and returns the activation line.',
      visualType: 'image',
      visualVideo: null,
      visualScreenshot: '/screenshots/empireworks-bridge/step-4-paste-prompt.png',
      visualFallback: <CoworkSetupPromptMock />,
      copyBlocks: [{ label: 'Copy setup prompt', text: SETUP_PROMPT }],
      extras: null,
    },
    {
      n: 5,
      label: 'Activate',
      title: 'Save the activation line in Project Instructions',
      description:
        'Open Project Instructions, paste the activation line, save. Every new chat in this Project loads the router automatically from this point on.',
      visualType: 'image',
      visualVideo: '/screenshots/empireworks-bridge/step-5-instructions-saved.mov',
      visualScreenshot: '/screenshots/empireworks-bridge/step-5-instructions-saved.png',
      visualFallback: <ClaudeProjectInstructionsMock />,
      copyBlocks: [{ label: 'Copy activation line', text: ACTIVATION_LINE }],
      extras: null,
    },
    {
      n: 6,
      label: 'Verify',
      title: 'Verify the install',
      description:
        'Paste this into the same Project chat. Claude calls verify_setup and reports back: Foundation is live, 11 packs installed, here is what you can ask me next.',
      visualType: 'image',
      visualVideo: null,
      visualScreenshot: '/screenshots/empireworks-bridge/step-6-verify-response-4bc45bf643.png',
      visualFallback: <ClaudeVerifyResponseMock />,
      copyBlocks: [{ label: 'Copy verify prompt', text: VERIFY_PROMPT }],
      extras: null,
    },
  ]
}

function InstallFlow() {
  const STEPS = useInstallSteps()
  const total = STEPS.length
  const [active, setActive] = useState(1)
  const [playing, setPlaying] = useState(false)

  // Auto-advance only when playing. Reset on user nav.
  useEffect(() => {
    if (!playing) return
    const t = window.setTimeout(() => {
      setActive((a) => (a >= total ? 1 : a + 1))
    }, 7000)
    return () => window.clearTimeout(t)
  }, [active, playing, total])

  const step = STEPS[active - 1]

  function go(n: number) {
    setActive(((n - 1 + total) % total) + 1)
  }
  function prev() {
    go(active - 1)
  }
  function next() {
    go(active + 1)
  }

  return (
    <div className="mt-2">
      {/* Stepper bar. F2 iter-10: the inline-flex pill row only has enough
          horizontal real estate to render six labeled pills at lg+ (>= 1024).
          Below that, the row stays as a 3-col grid (two rows of three) so each
          pill keeps usable width and the labels do not truncate to single
          characters at tablet portrait. The outer container also stays
          flex-col below lg so the Play / Pause toggle drops cleanly below the
          pill rows instead of being squeezed beside them. */}
      <div
        className="flex flex-col lg:flex-row lg:items-center gap-3 mb-6"
        role="tablist"
        aria-label="Install phases"
      >
        <div className="grid grid-cols-3 lg:flex lg:flex-row lg:items-center gap-1.5 lg:gap-2 w-full lg:flex-1 lg:min-w-0">
          {STEPS.map((s) => {
            const isActive = s.n === active
            const isDone = s.n < active
            return (
              <button
                key={s.n}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Phase ${s.n}: ${s.label}`}
                onClick={() => {
                  setPlaying(false)
                  go(s.n)
                }}
                className="group relative w-full sm:flex-1 sm:min-w-0 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-full"
                style={{ minHeight: 44 }}
              >
                <span
                  className="block h-1.5 rounded-full transition-all"
                  style={{
                    background: isActive
                      ? 'rgb(var(--color-accent))'
                      : isDone
                        ? 'rgb(var(--color-accent) / 0.5)'
                        : 'rgb(var(--color-fg) / 0.12)',
                    boxShadow: isActive
                      ? '0 4px 12px rgb(var(--color-accent) / 0.32)'
                      : 'none',
                  }}
                />
                <span
                  className="block mt-2 text-center truncate transition-colors"
                  style={{
                    fontSize: 11,
                    color: isActive
                      ? 'rgb(var(--color-accent))'
                      : isDone
                        ? 'rgb(var(--color-fg-muted))'
                        : 'rgb(var(--color-fg-subtle))',
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {s.n}. {s.label}
                </span>
              </button>
            )
          })}
        </div>
        {/* Play / Pause toggle */}
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-pressed={playing}
          aria-label={playing ? 'Pause auto-advance' : 'Play guided walkthrough'}
          className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium shrink-0 transition"
          style={{
            background: playing
              ? 'rgb(var(--color-accent) / 0.12)'
              : 'rgba(20,20,19,0.05)',
            color: playing ? 'rgb(var(--color-accent))' : '#141413',
            border: playing
              ? '1px solid rgb(var(--color-accent) / 0.32)'
              : '1px solid rgba(20,20,19,0.1)',
            minHeight: 44,
            minWidth: 44,
          }}
        >
          {playing ? (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" fill="currentColor" />
                <rect x="14" y="4" width="4" height="16" fill="currentColor" />
              </svg>
              Pause
            </>
          ) : (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 3l16 9-16 9V3z" fill="currentColor" />
              </svg>
              Play tour
            </>
          )}
        </button>
      </div>

      {/* Step body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgb(var(--color-bg) / 0.7)',
            border: '1px solid rgb(var(--color-fg) / 0.08)',
            boxShadow: '0 18px 40px -16px rgb(var(--color-fg) / 0.12)',
          }}
        >
          <div className="p-5 sm:p-6">
            <div className="flex items-baseline gap-3 mb-3 flex-wrap">
              <span
                className="inline-flex items-center justify-center rounded-full text-xs"
                style={{
                  background:
                    'linear-gradient(135deg, rgb(var(--color-accent)), rgb(204, 110, 46))',
                  color: '#fbfaf3',
                  padding: '4px 12px',
                  boxShadow: '0 6px 14px rgb(var(--color-accent) / 0.28)',
                  fontWeight: 700,
                }}
              >
                Phase {active} of {total}
              </span>
              <h3 className="font-display text-lg sm:text-2xl leading-tight m-0">
                {step.title}
              </h3>
            </div>
            <p
              className="text-sm sm:text-base leading-relaxed m-0 mb-5"
              style={{ color: 'rgb(var(--color-fg-muted))' }}
            >
              {step.description}
            </p>

            {/* Paste blocks above the visual so the user sees the action first */}
            {step.copyBlocks.map((block) => (
              <div key={block.label} className="mb-4">
                <div className="flex items-center justify-end mb-2">
                  <CopyButton text={block.text} label={block.label} />
                </div>
                <PromptBlock>{block.text}</PromptBlock>
              </div>
            ))}

            {/* Visual */}
            <InstallStepVisual step={step} />

            {/* Extras (e.g. InstallFacts on Step 2) */}
            {step.extras ? <div className="mt-5">{step.extras}</div> : null}
          </div>

          {/* Prev / Next nav */}
          <div
            className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t"
            style={{ borderColor: 'rgb(var(--color-fg) / 0.08)' }}
          >
            <button
              type="button"
              onClick={() => {
                setPlaying(false)
                prev()
              }}
              disabled={active === 1}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-sm font-semibold transition min-h-11 min-w-11"
              style={{
                background: active === 1 ? 'rgba(20,20,19,0.04)' : 'rgba(20,20,19,0.06)',
                color: active === 1 ? 'rgb(var(--color-fg-subtle))' : '#141413',
                border: '1px solid rgba(20,20,19,0.1)',
                cursor: active === 1 ? 'not-allowed' : 'pointer',
                opacity: active === 1 ? 0.5 : 1,
              }}
              aria-label={active === 1 ? 'Previous step (disabled)' : 'Previous step'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <span className="hidden sm:inline">Previous</span>
            </button>
            <span
              className="text-xs font-medium"
              style={{ color: 'rgb(var(--color-fg-subtle))' }}
            >
              {active < total ? `Up next: ${STEPS[active]?.label}` : 'Last step'}
            </span>
            <button
              type="button"
              onClick={() => {
                setPlaying(false)
                next()
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-3 sm:px-5 py-2 text-sm font-semibold transition min-h-11"
              style={{
                background:
                  active === total
                    ? 'rgba(20,20,19,0.06)'
                    : 'linear-gradient(135deg, rgb(var(--color-accent)), rgb(204, 110, 46))',
                color: active === total ? '#141413' : '#fbfaf3',
                border:
                  active === total
                    ? '1px solid rgba(20,20,19,0.1)'
                    : '1px solid transparent',
                boxShadow:
                  active === total
                    ? 'none'
                    : '0 10px 24px rgb(var(--color-accent) / 0.28)',
              }}
            >
              <span className="hidden sm:inline">
                {active === total ? 'Back to step 1' : 'Next step'}
              </span>
              <span className="sm:hidden">{active === total ? 'Restart' : 'Next'}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function InstallStepVisual({ step }: { step: InstallStep }) {
  const [videoErr, setVideoErr] = useState(false)
  const [imgErr, setImgErr] = useState(false)

  if (step.visualType === 'download-cta') {
    return (
      <div className="flex justify-center py-4">
        <DownloadBridgeCTA />
      </div>
    )
  }

  // Preference order: video -> image -> inline mock fallback. When a step has
  // both a .mov and a .png, the video plays first; if it 404s, the screenshot
  // shows; if THAT 404s, the inline Claude Desktop mock takes over. Lets us
  // ship videos for some steps and still have everything else work cleanly.
  if (step.visualType === 'image' && step.visualVideo && !videoErr) {
    return (
      <div
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid rgb(var(--color-fg) / 0.08)',
          boxShadow: '0 14px 34px rgb(var(--color-fg) / 0.08)',
          background: '#ffffff',
        }}
      >
        <video
          src={step.visualVideo}
          aria-label={step.title}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setVideoErr(true)}
          style={{
            display: 'block',
            width: '100%',
            maxWidth: '100%',
            height: 'auto',
          }}
        />
      </div>
    )
  }

  if (step.visualType === 'image' && step.visualScreenshot && !imgErr) {
    return (
      <img
        src={step.visualScreenshot}
        alt={step.title}
        loading="lazy"
        decoding="async"
        onError={() => setImgErr(true)}
        style={{
          display: 'block',
          width: '100%',
          maxWidth: '100%',
          height: 'auto',
          borderRadius: 12,
          border: '1px solid rgb(var(--color-fg) / 0.08)',
          boxShadow: '0 14px 34px rgb(var(--color-fg) / 0.08)',
        }}
      />
    )
  }

  return <div>{step.visualFallback}</div>
}

// Keep InstallSlideshow as a reserved component (used by no one now). Kept so
// the iteration 4 stepper diff is a clean replace, not a churn. void-marked
// at the bottom of this block so TS does not warn about unused declaration.
function _InstallSlideshowRemoved() {
  const FRAMES: SlideFrame[] = [
    {
      id: 'extension',
      stepLabel: 'Step 2 of 6',
      title: 'Approve the EmpireWorks Bridge extension',
      caption:
        'Claude Desktop shows a security callout. That is expected. Click Install (or Update) and keep the extension enabled.',
      realImagePath: '/screenshots/empireworks-bridge/step-2-extension-page-364d979009.png',
      alt: 'EmpireWorks Bridge extension install dialog in Claude Desktop',
      fallbackMock: <ClaudeInstallDialogMock />,
    },
    {
      id: 'cowork-project',
      stepLabel: 'Step 3 of 6',
      title: 'Open or create your Project',
      caption:
        'Open Claude Desktop. Pick or create the Project where the system will live. The setup prompt runs inside that Project.',
      realImagePath: '/screenshots/empireworks-bridge/step-3-cowork-project.png',
      alt: 'Claude Desktop Cowork home with project picker',
      fallbackMock: <ClaudeProjectMock />,
    },
    {
      id: 'paste-prompt',
      stepLabel: 'Step 4 of 6',
      title: 'Paste the setup prompt',
      caption:
        'One sentence does the whole install: Set up my Foundation system with EmpireWorks Bridge. Claude calls setup_foundation. You click Allow.',
      realImagePath: '/screenshots/empireworks-bridge/step-4-paste-prompt.png',
      alt: 'Claude Desktop with the EmpireWorks setup prompt typed in',
      fallbackMock: <CoworkSetupPromptMock />,
    },
    {
      id: 'instructions',
      stepLabel: 'Step 5 of 6',
      title: 'Save the activation line in Project Instructions',
      caption:
        'Paste the activation line into Project Instructions and save. Every new chat in this Project loads the router automatically from that moment on.',
      realImagePath: '/screenshots/empireworks-bridge/step-5-instructions-saved.png',
      alt: 'Claude Desktop Project Instructions panel with the activation line saved',
      fallbackMock: <ClaudeProjectInstructionsMock />,
    },
    {
      id: 'verify',
      stepLabel: 'Step 6 of 6',
      title: 'Verify the install',
      caption:
        'Run the check prompt. Claude reports back: Foundation is live, 11 packs installed, here is what you can ask me to do now.',
      realImagePath: '/screenshots/empireworks-bridge/step-6-verify-response-4bc45bf643.png',
      alt: 'Claude responding with a verify_setup tool call and confirmation',
      fallbackMock: <ClaudeVerifyResponseMock />,
    },
  ]

  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = FRAMES.length

  useEffect(() => {
    if (paused) return
    const t = window.setTimeout(() => setIdx((i) => (i + 1) % total), 5500)
    return () => window.clearTimeout(t)
  }, [idx, paused, total])

  function prev() {
    setIdx((i) => (i - 1 + total) % total)
  }
  function next() {
    setIdx((i) => (i + 1) % total)
  }
  function onKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowLeft') prev()
    else if (e.key === 'ArrowRight') next()
  }

  const frame = FRAMES[idx]

  return (
    <div
      className="relative mt-8 rounded-2xl overflow-hidden"
      role="region"
      aria-roledescription="carousel"
      aria-label="Install walkthrough"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKey}
      style={{
        background:
          'linear-gradient(135deg, rgba(20,20,19,0.04), rgba(20,20,19,0.01))',
        border: '1px solid rgb(var(--color-fg) / 0.08)',
        boxShadow: '0 18px 40px -16px rgb(var(--color-fg) / 0.12)',
      }}
    >
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between border-b"
        style={{ borderColor: 'rgb(var(--color-fg) / 0.08)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] rounded-full px-2.5 py-1 shrink-0"
            style={{
              color: 'rgb(var(--color-accent))',
              background: 'rgb(var(--color-accent) / 0.1)',
              border: '1px solid rgb(var(--color-accent) / 0.22)',
            }}
          >
            Install walkthrough
          </span>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.22em] hidden sm:inline"
            style={{ color: 'rgb(var(--color-fg-subtle))' }}
          >
            {paused ? 'Paused' : 'Auto-advancing'}, frame {idx + 1} of {total}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous frame"
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
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(20,20,19,0.06)'
              e.currentTarget.style.borderColor = 'rgba(20,20,19,0.1)'
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M14 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next frame"
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
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(20,20,19,0.06)'
              e.currentTarget.style.borderColor = 'rgba(20,20,19,0.1)'
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M10 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </button>
        </div>
      </div>

      {/* Frame body */}
      <div className="px-4 sm:px-6 py-5 min-h-[280px]">
        <div className="flex items-baseline gap-3 mb-3 flex-wrap">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.22em]"
            style={{ color: 'rgb(var(--color-accent))' }}
          >
            {frame.stepLabel}
          </span>
          <h3 className="font-display text-lg sm:text-xl leading-tight m-0">
            {frame.title}
          </h3>
        </div>
        <div className="relative">
          <SlideFrameBody
            key={frame.id}
            src={frame.realImagePath}
            alt={frame.alt}
            mock={frame.fallbackMock}
          />
        </div>
        <p
          className="mt-4 text-sm leading-relaxed m-0"
          style={{ color: 'rgb(var(--color-fg-muted))' }}
        >
          {frame.caption}
        </p>
      </div>

      {/* Dot indicators + autoplay progress */}
      <div className="px-4 sm:px-6 py-4 flex items-center justify-center gap-2 border-t"
        style={{ borderColor: 'rgb(var(--color-fg) / 0.08)' }}
      >
        {FRAMES.map((f, i) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setIdx(i)}
            aria-label={`Jump to ${f.stepLabel}: ${f.title}`}
            className="inline-flex items-center justify-center rounded-full transition-all"
            style={{
              width: i === idx ? 28 : 8,
              height: 8,
              background:
                i === idx ? 'rgb(var(--color-accent))' : 'rgba(20,20,19,0.22)',
              border: 'none',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function SlideFrameBody({
  src,
  alt,
  mock,
}: {
  src: string
  alt: string
  mock: React.ReactNode
}) {
  const [err, setErr] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative"
    >
      {!err ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setErr(true)}
          style={{
            display: 'block',
            width: '100%',
            maxWidth: '100%',
            height: 'auto',
            borderRadius: 12,
            border: '1px solid rgb(var(--color-fg) / 0.08)',
            boxShadow: '0 14px 34px rgb(var(--color-fg) / 0.08)',
          }}
        />
      ) : (
        <div>{mock}</div>
      )}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// CoworkSetupPromptMock. Mock for the Step 4 slideshow frame showing the
// Claude Desktop Cowork home with the setup prompt typed in but not yet
// submitted. Approximates the real UI from Eugeen's 2026-05-13 screenshots.
// Used only as fallback when /screenshots/.../step-4-paste-prompt.png is
// missing.
// ---------------------------------------------------------------------------

function CoworkSetupPromptMock() {
  return (
    <ClaudeDesktopChrome title="Claude Desktop, Cowork">
      <div className="p-5 sm:p-6">
        <div className="font-display text-xl sm:text-2xl leading-tight mb-4">
          Let's knock something off your list
        </div>
        <div
          className="rounded-2xl p-4"
          style={{
            background: '#ffffff',
            border: '1px solid rgb(var(--color-fg) / 0.12)',
            boxShadow: '0 6px 16px rgb(var(--color-fg) / 0.04)',
          }}
        >
          <div
            className="text-sm leading-relaxed mb-3"
            style={{
              color: '#141413',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            Set up my Foundation system with EmpireWorks Bridge.
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md w-7 h-7"
              style={{
                background: 'transparent',
                border: '1px solid rgba(20,20,19,0.12)',
                color: '#141413',
              }}
              aria-hidden="true"
            >
              +
            </button>
            <span
              className="inline-flex items-center justify-center rounded-md w-9 h-9"
              style={{
                background: 'rgb(var(--color-accent))',
                color: '#fbfaf3',
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M12 5v14M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgb(var(--color-fg-subtle))' }}>
          <span>Work in a project</span>
          <span>Ask</span>
          <span className="ml-auto">Opus 4.7</span>
        </div>
      </div>
    </ClaudeDesktopChrome>
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
}: {
  capability: Capability
  index: number
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotX = useSpring(useTransform(my, [-1, 1], [3, -3]), { stiffness: 220, damping: 22 })
  const rotY = useSpring(useTransform(mx, [-1, 1], [-3, 3]), { stiffness: 220, damping: 22 })

  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
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

  const Icon = ICON_MAP[capability.iconName]
  const MotionLink = motion.create(Link)

  return (
    <MotionLink
      ref={ref}
      to={`/empireworksreconstruction/layer/${capability.slug}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 1200 }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: 0.06 * (index % 6), ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-2xl overflow-hidden p-6 sm:p-7 text-left w-full block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      data-card="capability"
      aria-label={`${capability.title}. Open the deep-dive page for this layer.`}
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
    </MotionLink>
  )
}

// ---------------------------------------------------------------------------
// S205 iteration 3: CapabilityModalRender + ModalBody DELETED.
// Replaced by EmpireCapabilityLayer.tsx route page at /layer/:slug. The
// modal pattern was scroll-broken inside the live webpage and the
// "Take me to install" CTA at the bottom was unreachable. Real routes
// solve that structurally.
// ---------------------------------------------------------------------------


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
void _InstallSlideshowRemoved
void StepRow

export default EmpireLanding
