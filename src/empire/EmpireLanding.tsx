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
import { ArrowRight, ChevronDown, Linkedin } from 'lucide-react'
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
import { BranchCard } from './cards/BranchCard'

export function EmpireLanding() {
  function scrollToCards(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    const target = document.getElementById('how-it-works')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="px-[6vw] pt-20 pb-32" style={{ color: 'rgb(var(--color-fg))' }}>
      {/* Hero, centered */}
      <section className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-mono text-xs uppercase tracking-[0.22em] mb-6 flex items-center justify-center gap-3 flex-wrap"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          <span>HoistOS</span>
          <span style={{ color: 'rgb(var(--color-fg-subtle))' }}>·</span>
          <span>EmpireWorks Reconstruction</span>
          <span style={{ color: 'rgb(var(--color-fg-subtle))' }}>·</span>
          <span>VP AI Upgrade Platform</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.05] mb-8"
        >
          Perennial Empire&rsquo;s
          <br />
          <span style={{ color: 'rgb(var(--color-accent))' }}>AI-Native</span> Journey.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8"
          style={{ color: 'rgb(var(--color-fg-muted))' }}
        >
          Every moment that turned a construction company into an AI-native operation, in order. Some are just the
          story. The ones with a glowing dot are upgrades you can drop into your own Claude in five minutes. Scroll
          the timeline. Click anything that glows.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base max-w-2xl mx-auto leading-relaxed mb-14"
          style={{ color: 'rgb(var(--color-fg-subtle))', fontStyle: 'italic' }}
        >
          The ten foundation upgrades come first: voice and identity locks, cold-start, decision log, skill builder,
          routing rules, memory, source sweep, output validator, email playbook, Notion write check. Eleven more
          behind those. Pick the one that fits the work on your desk this week.
        </motion.p>

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

      {/* Cards: single-column vertical stack, premium effects */}
      <section id="how-it-works" className="mt-28 max-w-3xl mx-auto space-y-8 scroll-mt-24">
        <MapCard />
        <PackCard />
        <BranchCard />
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
            to="/empireworksreconstruction/timeline?treatment=a"
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
          Five minutes. No setup. No engineering.
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
    </div>
  )
}

export default EmpireLanding
