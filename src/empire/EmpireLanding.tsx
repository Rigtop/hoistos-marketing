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

import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  Download,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

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
  // MASTER_PLAN v2 S2 (round 4, 2026-05-17): no modal on mount. The intake
  // surfaces only when the user explicitly taps the "Personalize my Claude"
  // CTA in the hero. Replaces the prior first-visit auto-open behavior.
  const [open, setOpen] = useState<boolean>(false)

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
import { Intake } from './Intake'
import {
  isIntakeComplete,
  onIntakeChange,
  readIntake,
  type IntakeState,
} from '../lib/intake-state'
import { useIsMobile } from '../lib/useIsMobile'
// BranchCard removed 2026-05-11 from the JSX. Import kept for fast revert.
// import { BranchCard } from './cards/BranchCard'

const BRIDGE_VERSION = '1.0.3'
const BRIDGE_DOWNLOAD_PATH = `/downloads/empireworks-bridge-${BRIDGE_VERSION}.mcpb`
const SETUP_PROMPT = 'Set up my Foundation system with EmpireWorks Bridge.'
const ACTIVATION_LINE =
  'At the start of every conversation, call the EmpireWorks Bridge get_router tool and follow the instructions it returns. For task-specific guidance, call read_installed_pack with the pack id named in the router.'
const VERIFY_PROMPT =
  'Check my EmpireWorks Bridge setup. Confirm Foundation is installed, list the installed packs, and tell me what I can ask you to do now.'
export function EmpireLanding() {
  const audience = useAudience()
  const intakeGate = useIntakeGate()
  const isMobile = useIsMobile()
  const reduced = useReducedMotion()
  // F7 fix (cycle-4 iter-2): keep the URL prefix the user arrived through.
  // /empire entries land on /empire/foundation; /empireworksreconstruction
  // entries stay on the canonical prefix. Eliminates the mid-funnel prefix
  // swap the address bar used to show.
  const { pathname } = useLocation()
  const routePrefix = pathname.startsWith('/empire/') || pathname === '/empire'
    ? '/empire'
    : '/empireworksreconstruction'

  function scrollToCards(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    const target = document.getElementById('how-it-works')
    if (target) {
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    }
  }

  return (
    <div className="px-[6vw] pt-20 pb-32 relative" style={{ color: 'rgb(var(--color-fg))' }}>
      {/* JourneyTrackerBar is now mounted in EmpireLayout (iter-10 F1 close)
          so the bar appears across every /empire route, not just this one.
          The layout's outer wrapper carries the clamp(48px, 6vw, 56px) top
          padding that previously lived inline here. */}
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
        {/* JourneyTracker right-side panel removed 2026-05-17 per Eugeen.
            JourneyTrackerBar at top of page now carries the progress role. */}

        {/* Hero, centered */}
        <section
          className="max-w-4xl mx-auto text-center relative"
          style={isMobile ? undefined : { flex: '1 1 0%', minWidth: 0 }}
        >
        {/* F6 + F7 fix (cycle-4 iter-6): compress chrome above the H1 by
            consolidating the brand eyebrow + author byline into a single line,
            and dropping `uppercase` for a sentence-case treatment matching the
            Stripe-Atlas locked direction. The standalone AuthorByline mount
            and the Setup pill move below the subhead so the H1 lands higher on
            the first viewport. AuthorFooter at the bottom of EmpireLayout
            still carries the canonical signature. */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs tracking-[0.04em] mb-6 flex items-center justify-center gap-3 flex-wrap"
          style={{ color: 'rgb(var(--color-accent))', fontWeight: 600 }}
        >
          <span>HoistOS</span>
          <span style={{ color: 'rgb(var(--color-fg-subtle))' }}>·</span>
          <span>
            {audience === 'empireworks'
              ? 'For Steve, Spencer, Jay and the EmpireWorks VPs'
              : 'For EmpireWorks Reconstruction'}
          </span>
          <span style={{ color: 'rgb(var(--color-fg-subtle))' }}>·</span>
          <span style={{ color: 'rgb(var(--color-fg-muted))', fontWeight: 500 }}>
            Created by Eugeen Bernan
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          aria-describedby="hero-tagline"
          className="font-display text-[clamp(2.25rem,5.5vw,4.25rem)] leading-[1.08] tracking-[-0.015em] mb-3"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          Pick a pack, paste, done.
        </motion.h1>

        <motion.p
          id="hero-tagline"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="font-display text-[clamp(1.5rem,3.5vw,2.5rem)] leading-[1.15] tracking-[-0.01em] mb-6"
        >
          Enterprise Level Claude that compounds every week.
        </motion.p>

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

        {/* F6 relocation (cycle-4 iter-6): Setup pill moved from above-H1 to
            below the subhead so the H1 lands higher on the first viewport.
            Still surfaces on the first scroll, still 44px tap target, still
            opens the same intake gate. */}
        {!intakeGate.open ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mb-7 flex justify-center"
          >
            <button
              type="button"
              onClick={intakeGate.reopen}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium tracking-[0.005em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgb(204,110,46)]"
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
          </motion.div>
        ) : null}

        {/* MASTER_PLAN Round 5 line 47 delete: the 6-teaser-card grid (Rules
            locked / Memory compounds / Routing knows where / Source-checked
            first / Validation gate / Packs stack on top) lifted to the
            forthcoming Pack Catalog tab as filter chips, not standalone hero
            cards. The destination tab ships with the SegmentedTrackerBar +
            EmpireCatalog port (F1 sibling). */}

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
              Desktop shortcut. Skip if you are on web or Code.
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
              Six pastes, ten minutes. Hit Next to start the walkthrough.
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
              <div
                className="text-xs font-medium uppercase tracking-[0.14em] mb-2"
                style={{ color: 'rgb(var(--color-fg-subtle))' }}
              >
                Surface note
              </div>
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
          className="inline-flex flex-col items-center gap-3 group cursor-pointer rounded-full px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgb(204,110,46)]"
          aria-label="Scroll to learn how it works"
        >
          <span
            className="text-xs tracking-[0.04em] font-medium transition-colors duration-300"
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

      {/* Desktop sidebar JourneyTracker removed 2026-05-17 per Eugeen.
          The fixed-top JourneyTrackerBar replaces it. JourneyTracker import
          kept temporarily for any non-EmpireLanding consumers. */}
      </div>

      {/* MASTER_PLAN Round 5 lines 43-45 delete: MapCard's "Built from a
          real operating system" timeline lifts to /story (out of /empire).
          PackCard's "Foundation installs in six pastes" Claude-chat mockup
          retires in favor of the 3-step PackInstallFlow (F1 sibling). The
          anchor id="how-it-works" stays so the scroll-cue link still has
          something to land on; renamed scroll target follows in S199 polish. */}
      <section id="how-it-works" className="mt-28 max-w-3xl mx-auto" aria-hidden="true" />

      {/* CTA, now post-cards. The conversion ask after value has been shown. */}
      <section className="mt-24 max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6 }}
          className="text-xs tracking-[0.04em] font-medium mb-5"
          style={{ color: 'rgb(var(--color-fg-subtle))' }}
        >
          Your move
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center"
        >
          <Link
            to={`${routePrefix}/foundation`}
            className="group relative inline-flex items-center gap-3 rounded-2xl px-10 py-5 text-lg md:text-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgb(204,110,46)]"
            style={{
              background: 'rgb(var(--color-accent))',
              color: 'rgb(var(--color-bg))',
              boxShadow: '0 12px 40px rgb(var(--color-accent) / 0.35)',
            }}
            onMouseEnter={(e) => {
              if (reduced) return
              e.currentTarget.style.boxShadow = '0 16px 56px rgb(var(--color-accent) / 0.55)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              if (reduced) return
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
          Pack by pack from the gallery is the default path. The Bridge above is the Desktop bulk-install shortcut.
        </motion.p>
      </section>

      {/* NOTE: origin framing (Steve Hultgren) + IP confidentiality lock */}
      <section className="mt-24 max-w-3xl mx-auto">
        <p
          className="text-xs tracking-[0.04em] font-medium mb-4"
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
          className="text-xs tracking-[0.04em] font-medium mb-4 mt-10"
          style={{ color: 'rgb(var(--color-fg-subtle))' }}
        >
          Confidential to EmpireWorks
        </p>
        <p className="text-base leading-relaxed" style={{ color: 'rgb(var(--color-fg-muted))' }}>
          This page is for people inside EmpireWorks Reconstruction. Keep it inside the team.
        </p>
      </section>

      {/* MASTER_PLAN Round 5 lines 39-41 delete: the org.hoistos.com dashboard
          preview iframe + the Calendly inline widget. The "Book a walkthrough"
          link in the EmpireLayout nav header replaces the inline widget. */}
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

// AuthorByline removed cycle-4 iter-6 per F6 chrome-compress. The "Created
// by Eugeen Bernan" signature is now inlined in the hero brand eyebrow and
// canonically lives in AuthorFooter at the bottom of EmpireLayout.

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
          className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium shrink-0 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgb(204,110,46)]"
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
              className="inline-flex items-center justify-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-sm font-semibold transition min-h-11 min-w-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgb(204,110,46)]"
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
              aria-label={active === total ? 'Restart walkthrough at step 1' : 'Next step'}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-3 sm:px-5 py-2 text-sm font-semibold transition min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgb(204,110,46)]"
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
                Foundation is live. 11 packs installed at{' '}
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
