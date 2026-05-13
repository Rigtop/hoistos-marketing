/**
 * EmpireFoundationGrid. The "Your installed system" surface that replaces
 * the chronological timeline reader at /empireworksreconstruction/foundation.
 *
 * Owner: S205 Empire Wireframe VP-demo fix sprint.
 * Routing reference: src/empire/AppRouter.tsx renders EmpireTimelinePage at
 * the /foundation route. S205 swap: EmpireTimelinePage now renders this
 * component instead of EmpireTimelineD mode='foundation'. The chronological
 * narrative survives at /timeline via EmpireStoryPage (unchanged).
 *
 * Context7: motion@12.38 + react@19 + react-router-dom@7.15 + lucide-react@1.14.
 * All four libs are used identically in src/empire/cards/MapCard.tsx; reusing
 * those exact patterns. No API drift possible.
 *
 * Hard Rule #11: zero em dashes.
 * R047 voice: counter-led, no banned openers, no apologies.
 * R051: no horizontal CTA stacks, single-column on mobile.
 * R067: mobile-first. 320/375/768 viewports verified pre-ship.
 */

import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Copy, Sparkles } from 'lucide-react'
import { FOUNDATION_CARDS, LAYER_TOKENS, type FoundationCard } from './content/foundation-cards'

const VERIFY_PROMPT =
  'Check my EmpireWorks Bridge setup. Confirm Foundation is installed, list the installed packs, and tell me what I can ask you to do now.'

export function EmpireFoundationGrid() {
  return (
    <div
      className="px-[6vw] pt-16 pb-32"
      style={{ background: '#f5f4ed', color: '#141413' }}
    >
      <HeroBlock />
      <VerifyCTA />
      <Grid />
      <BottomCTA />
    </div>
  )
}

function HeroBlock() {
  return (
    <header className="max-w-3xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="font-mono text-[11px] uppercase tracking-[0.22em] mb-5"
        style={{ color: 'rgb(var(--color-accent))' }}
      >
        Your installed system
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.05 }}
        className="font-display text-[clamp(2.25rem,5.5vw,4rem)] leading-[1.05] mb-5"
      >
        Eleven packs.
        <br />
        Five operating layers.
        <br />
        <span style={{ color: 'rgb(var(--color-accent))' }}>Already in your Claude.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.12 }}
        className="text-base md:text-lg leading-relaxed mb-3"
        style={{ color: 'rgb(var(--color-fg-muted))' }}
      >
        The Bridge dropped these onto your machine in one paste. Each card below shows
        what one pack does, what to type to invoke it, and what Claude returns.
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.18 }}
        className="text-sm leading-relaxed max-w-xl mx-auto"
        style={{ color: 'rgb(var(--color-fg-subtle))' }}
      >
        Click any card for the full pack preview. Verify the install first with the
        prompt below, then come back to walk through what landed.
      </motion.p>
    </header>
  )
}

function VerifyCTA() {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(VERIFY_PROMPT)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6 }}
      className="mt-12 mb-16 max-w-3xl mx-auto rounded-2xl overflow-hidden"
      style={{
        border: '1px solid rgba(204,110,46,0.25)',
        boxShadow: '0 20px 50px -16px rgba(204,110,46,0.15), 0 4px 12px rgba(20,20,19,0.04)',
        background: 'linear-gradient(135deg, rgba(204,110,46,0.06), rgba(204,110,46,0.01))',
      }}
    >
      <div className="px-6 py-5 sm:px-8 sm:py-6">
        <div className="flex items-start gap-4 flex-col sm:flex-row">
          <div className="flex-1 min-w-0">
            <div
              className="font-mono text-[10px] uppercase tracking-[0.22em] mb-2"
              style={{ color: 'rgb(var(--color-accent))' }}
            >
              Step zero: verify it landed
            </div>
            <h2 className="font-display text-xl sm:text-2xl leading-tight mb-2">
              Paste this into your Claude Project first
            </h2>
            <p
              className="text-sm leading-relaxed m-0"
              style={{ color: 'rgb(var(--color-fg-muted))' }}
            >
              Claude reads the manifest, confirms Foundation is installed, lists every
              pack, and tells you what to ask next. If anything is off, it says so on
              the same line.
            </p>
          </div>
          <button
            type="button"
            onClick={copy}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition self-start sm:self-auto min-h-11"
            style={{
              background: copied ? 'rgb(18, 128, 82)' : 'rgb(var(--color-accent))',
              color: '#fbfaf3',
              border: '1px solid rgba(20,20,19,0.06)',
              boxShadow: copied
                ? '0 8px 20px rgba(18,128,82,0.22)'
                : '0 8px 20px rgba(204,110,46,0.28)',
            }}
          >
            {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy verify prompt'}
          </button>
        </div>
        <pre
          className="mt-5 whitespace-pre-wrap rounded-lg p-4 text-xs sm:text-sm leading-relaxed m-0"
          style={{
            background: 'rgba(20,20,19,0.04)',
            border: '1px solid rgba(20,20,19,0.06)',
            color: '#141413',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          {VERIFY_PROMPT}
        </pre>
      </div>
    </motion.div>
  )
}

function Grid() {
  return (
    <section className="mt-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
      {FOUNDATION_CARDS.map((card, i) => (
        <FoundationCardTile key={card.packId} card={card} index={i} />
      ))}
    </section>
  )
}

function FoundationCardTile({ card, index }: { card: FoundationCard; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotX = useSpring(useTransform(my, [-1, 1], [4, -4]), { stiffness: 200, damping: 24 })
  const rotY = useSpring(useTransform(mx, [-1, 1], [-4, 4]), { stiffness: 200, damping: 24 })
  const tone = LAYER_TOKENS[card.layer]

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
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

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 1200 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: 0.06 * (index % 6), ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-3xl overflow-hidden"
    >
      <Link
        to={`/empireworksreconstruction/pack/${card.packId}`}
        className="block p-6 sm:p-7"
        style={{
          background: '#fbfaf3',
          border: '1px solid rgba(20,20,19,0.08)',
          color: '#141413',
          textDecoration: 'none',
          boxShadow: '0 14px 34px rgba(20,20,19,0.05), 0 2px 8px rgba(20,20,19,0.02)',
        }}
      >
        {/* radial-spotlight on hover (per MapCard pattern) */}
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              'radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(204,110,46,0.10), transparent 45%)',
          }}
        />
        {/* faint grid texture (matches MapCard) */}
        <span
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(20,20,19,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,20,19,1) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative flex items-start justify-between gap-3 mb-4">
          <span
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] rounded-full px-2.5 py-1"
            style={{ background: 'rgba(20,20,19,0.05)', color: '#141413' }}
          >
            <span style={{ color: 'rgb(var(--color-accent))', fontWeight: 700 }}>{card.badge}</span>
            <span style={{ color: 'rgba(20,20,19,0.45)' }}>·</span>
            <span style={{ color: '#5e5d59' }}>Installed</span>
          </span>
          <span
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] rounded-full px-2.5 py-1"
            style={{ background: tone.bg, color: tone.color }}
          >
            <span
              aria-hidden="true"
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: tone.color }}
            />
            {card.layer}
          </span>
        </div>

        <h3 className="relative font-display text-[1.5rem] sm:text-[1.7rem] leading-tight mb-2">
          {card.title}
        </h3>

        <p
          className="relative text-sm leading-relaxed m-0"
          style={{ color: '#5e5d59' }}
        >
          {card.purpose}
        </p>

        <div
          className="relative mt-5 rounded-xl p-4"
          style={{
            background: 'rgba(20,20,19,0.035)',
            border: '1px solid rgba(20,20,19,0.06)',
          }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-[0.18em] mb-2"
            style={{ color: 'rgb(var(--color-accent))' }}
          >
            You type
          </div>
          <p
            className="text-sm m-0 leading-relaxed"
            style={{
              color: '#141413',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '13px',
            }}
          >
            "{card.question}"
          </p>
        </div>

        <div className="relative mt-3">
          <div
            className="font-mono text-[10px] uppercase tracking-[0.18em] mb-2"
            style={{ color: 'rgb(var(--color-accent))' }}
          >
            Claude returns
          </div>
          <p
            className="text-sm leading-relaxed m-0"
            style={{ color: '#3a3a36' }}
          >
            {card.claudeDoes}
          </p>
        </div>

        <div
          className="relative mt-5 flex items-center justify-between"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Deep dive
          </span>
          <ArrowRight
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </div>
      </Link>
    </motion.div>
  )
}

function BottomCTA() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6 }}
      className="mt-20 max-w-3xl mx-auto text-center"
    >
      <p
        className="font-mono text-[11px] uppercase tracking-[0.22em] mb-4"
        style={{ color: 'rgb(var(--color-fg-subtle))' }}
      >
        What is next
      </p>
      <h2 className="font-display text-[clamp(1.6rem,3.5vw,2.4rem)] leading-tight mb-4">
        Foundation is the floor. Advanced packs go on top.
      </h2>
      <p
        className="text-base leading-relaxed mb-8 max-w-2xl mx-auto"
        style={{ color: '#5e5d59' }}
      >
        Once Foundation is rolling, the advanced packs (proposal builder, RFI flow,
        skill-builder, the rest) layer onto the same Bridge. You will not reinstall.
        You will just ask for more.
      </p>
      <Link
        to="/empireworksreconstruction/bonus-extras"
        className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-base font-semibold transition"
        style={{
          background: 'rgb(var(--color-accent))',
          color: '#fbfaf3',
          boxShadow: '0 12px 30px rgba(204,110,46,0.28)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 16px 36px rgba(204,110,46,0.42)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(204,110,46,0.28)'
        }}
      >
        Browse advanced packs
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </motion.section>
  )
}

export default EmpireFoundationGrid
