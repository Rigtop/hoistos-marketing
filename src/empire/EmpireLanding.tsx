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
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { motion } from 'motion/react'

/**
 * Audience flag detection. Default audience is "construction VPs" (the broad
 * shape the page is built for). When the URL carries `?steve=1` or `?ew=1`
 * (the demo link Eugeen sends Steve and the EmpireWorks Reconstruction VPs),
 * the eyebrow + welcome card swap to address them by name. Persists for the
 * session so a Steve-arrived-from-LinkedIn flow stays personalized through
 * the install journey, not just on the landing.
 */
type Audience = 'default' | 'empireworks'

function useAudience(): Audience {
  const [audience, setAudience] = useState<Audience>('default')
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const params = new URLSearchParams(window.location.search)
      const steve = params.get('steve')
      const ew = params.get('ew')
      const stored = window.sessionStorage.getItem('hoistos.empire.audience')
      if (steve === '1' || ew === '1' || stored === 'empireworks') {
        setAudience('empireworks')
        try {
          window.sessionStorage.setItem('hoistos.empire.audience', 'empireworks')
        } catch {
          // sessionStorage may be blocked. Audience flag holds for this render.
        }
      }
    } catch {
      // URLSearchParams should never throw in modern browsers but defensive.
    }
  }, [])
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

export function EmpireLanding() {
  const audience = useAudience()

  function scrollToCards(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    const target = document.getElementById('how-it-works')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

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
          Twenty-one upgrades.
          <br />
          One day to install.
          <br />
          <span style={{ color: 'rgb(var(--color-accent))' }}>Compounding intelligence</span> forever.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
          style={{ color: 'rgb(var(--color-fg-muted))' }}
        >
          Each upgrade teaches Claude something about how you work. Your voice. Your memory.
          Your sources. They stack. Your Claude grows with your division and gets sharper
          every week, forever.
        </motion.p>

        {/* Step-1-2-3 strip with arrow connectors. Single horizontal row.
            flex: 1 children share evenly. Arrows between read as a sequence
            (Fortune-500 onboarding shape). Stacks on mobile via flex-col. */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-1.5 max-w-4xl mx-auto mb-12 text-left"
        >
          {[
            {
              n: 1,
              title: 'Pick a foundation pack',
              sub: '10 below, install order does not matter',
            },
            {
              n: 2,
              title: 'Click Install in Claude desktop',
              sub: 'Or use the browser button. Pack copies to your clipboard, Claude opens fresh.',
            },
            {
              n: 3,
              title: 'Press Cmd+V and Return',
              sub: '5 to 10 min later, your Claude is sharper',
            },
          ].map((step, i, arr) => (
            <span key={step.n} className="contents">
              <div
                className="rounded-xl p-4 flex items-start gap-3 flex-1 min-w-0"
                style={{
                  background: 'rgb(var(--color-fg) / 0.03)',
                  border: '1px solid rgb(var(--color-fg) / 0.08)',
                }}
              >
                <div
                  aria-hidden="true"
                  className="flex items-center justify-center rounded-full font-display shrink-0"
                  style={{
                    width: 26,
                    height: 26,
                    background: 'rgb(var(--color-accent))',
                    color: 'rgb(var(--color-bg))',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {step.n}
                </div>
                <div className="min-w-0">
                  <div
                    className="text-[13px] font-semibold leading-tight mb-1"
                    style={{ color: 'rgb(var(--color-fg))' }}
                  >
                    {step.title}
                  </div>
                  <div
                    className="text-[11px] leading-snug"
                    style={{ color: 'rgb(var(--color-fg-muted))' }}
                  >
                    {step.sub}
                  </div>
                </div>
              </div>
              {i < arr.length - 1 ? (
                <div
                  aria-hidden="true"
                  className="hidden sm:flex items-center justify-center shrink-0"
                  style={{
                    color: 'rgb(var(--color-accent))',
                    fontSize: 22,
                    fontWeight: 300,
                    width: 16,
                    opacity: 0.7,
                  }}
                >
                  →
                </div>
              ) : null}
            </span>
          ))}
        </motion.div>

        {/* Install demo loop. Twelve-second screencap of the actual install
            flow (button click into Claude Cowork composer prefill). Autoplay
            muted + loop + playsInline so it plays on iOS and Safari without
            user gesture. mp4 is the primary; webm is the cross-browser
            fallback. Poster jpg covers the load-in window so visitors never
            see a blank rectangle. This is the holy-shit moment landing
            inside viewport one. */}
        <motion.figure
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto mb-10"
        >
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              border: '1px solid rgb(var(--color-fg) / 0.1)',
              boxShadow:
                '0 30px 80px -16px rgb(var(--color-fg) / 0.18), 0 6px 18px rgb(var(--color-fg) / 0.06)',
              background: 'rgb(var(--color-bg-elevated, var(--color-bg)))',
              aspectRatio: '3024 / 1964',
            }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster="/looms/install-demo-poster.jpg"
              aria-label="Twelve-second loop showing one click into Claude Cowork with the install prompt pre-filled."
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            >
              <source src="/looms/install-demo.webm" type="video/webm" />
              <source src="/looms/install-demo.mp4" type="video/mp4" />
              {/* Fallback for browsers that cannot play either codec. */}
              <p style={{ padding: 24 }}>
                Your browser does not support the install demo video. View the live install at{' '}
                <a href="/empireworksreconstruction/timeline">the timeline page</a>.
              </p>
            </video>
            {/* Watermark overlay. Lands the "12 seconds" anchor without
                blocking the demo content. */}
            <div
              className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{
                background: 'rgb(20,20,19,0.78)',
                color: '#fbfaf3',
                backdropFilter: 'blur(6px)',
                letterSpacing: '0.16em',
              }}
            >
              One click. Twelve seconds. Live.
            </div>
          </div>
          <figcaption
            className="mt-3 text-center font-mono text-[11px] uppercase tracking-[0.18em]"
            style={{ color: 'rgb(var(--color-fg-subtle))' }}
          >
            What an install looks like, end to end.
          </figcaption>
        </motion.figure>

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
              Steve, Spencer, Jay: this is the exact AI setup running at Perennial Empire.
              Ten foundation packs, eleven construction-fitted blueprints. Spend a day
              installing them and your Claude grows with your division, every week, on its
              own. Click anything that interests you. Tell me what feels useful, what feels
              missing, and we will custom-fit the next batch for your workflow.
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
            <span>Upgrade my Claude</span>
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
          One pack at a time. Five to ten minutes each. No engineering required.
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
          This is what that looks like: a shared AI setup that takes a Claude account from zero to working in under
          an hour. It's an early build on purpose, not exhaustive, shipped now so we can see if it actually helps
          before I spend more time on it. Use it. Then tell me whether it moved the needle.
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
    </div>
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

export default EmpireLanding
