/**
 * EmpireCapabilityLayer. Per-layer deep-dive page at
 * /empireworksreconstruction/layer/:layerSlug
 *
 * S205 iteration 3 (2026-05-13): replaces the modal pattern from iteration
 * 2. The modal had scroll-containment issues inside the live webpage and
 * the "Take me to install" CTA at the bottom of the modal was unreachable.
 * A real route fixes that structurally: native browser scroll, real URL,
 * real back button, deep-linkable.
 *
 * Layer slugs: voice / memory / routing / sources / validation / stack.
 * Maps to CAPABILITIES from content/capabilities.ts.
 *
 * Hard Rule #11: zero em dashes.
 *
 * Context7: react-router-dom@7.15 useParams + Link, motion@12.38 motion.div
 * + scroll fade-in, lucide-react@1.14 icon imports. All standard usage.
 */

import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Brain,
  Check,
  Compass,
  Layers,
  Search,
  Shield,
} from 'lucide-react'
import { findCapabilityBySlug, type Capability } from './content/capabilities'

const ICON_MAP: Record<Capability['iconName'], typeof Shield> = {
  Shield,
  Brain,
  Compass,
  Search,
  BadgeCheck,
  Layers,
}

export function EmpireCapabilityLayer() {
  const params = useParams<{ layerSlug: string }>()
  const navigate = useNavigate()
  const slug = params.layerSlug ?? 'voice'
  const cap = findCapabilityBySlug(slug)

  if (!cap) {
    return <NotFound slug={slug} />
  }

  const Icon = ICON_MAP[cap.iconName]

  function goToInstall() {
    navigate('/empireworksreconstruction')
    // Defer the scroll to the next tick so the route lands before we scroll.
    // Target the install panel directly (id="install-panel"). S205 iteration 4
    // fix: prior version targeted #how-it-works (the cards section) which is
    // wrong, the user wants the Bridge download.
    window.setTimeout(() => {
      const target = document.getElementById('install-panel')
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 120)
  }

  return (
    <div
      className="px-[6vw] pt-12 sm:pt-16 pb-32"
      style={{ background: '#f5f4ed', color: '#141413' }}
    >
      {/* Back link */}
      <Link
        to="/empireworksreconstruction"
        aria-label="Back to the overview"
        className="inline-flex items-center gap-2 text-sm font-mono tracking-[0.02em] mb-8 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          color: 'rgb(var(--color-fg-subtle))',
          padding: '10px 6px',
          minHeight: 44,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'rgb(var(--color-accent))'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'rgb(var(--color-fg-subtle))'
        }}
      >
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
        Back to the overview
      </Link>

      <div className="max-w-3xl mx-auto">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="flex flex-wrap items-center gap-2 mb-5"
        >
          <span
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] rounded-full px-3 py-1.5"
            style={{
              color: 'rgb(var(--color-accent))',
              background: 'rgb(var(--color-accent) / 0.1)',
              border: '1px solid rgb(var(--color-accent) / 0.22)',
            }}
          >
            Operating layer: {cap.layer}
          </span>
        </motion.div>

        {/* Hero: icon + title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.05 }}
          className="flex items-start gap-4 sm:gap-5 mb-6"
        >
          <span
            aria-hidden="true"
            className="inline-flex items-center justify-center rounded-2xl shrink-0"
            style={{
              width: 64,
              height: 64,
              background:
                'linear-gradient(135deg, rgb(var(--color-accent) / 0.18), rgb(var(--color-accent) / 0.06))',
              color: 'rgb(var(--color-accent))',
              border: '1px solid rgb(var(--color-accent) / 0.28)',
              boxShadow: '0 12px 24px rgb(var(--color-accent) / 0.2)',
            }}
          >
            <Icon className="w-8 h-8" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[clamp(2rem,5vw,3.6rem)] leading-[1.05] m-0">
              {cap.title}
            </h1>
            <p
              className="text-base sm:text-lg leading-relaxed mt-3 m-0"
              style={{ color: 'rgb(var(--color-fg-muted))' }}
            >
              {cap.body}
            </p>
          </div>
        </motion.div>

        {/* Monday morning vision */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl p-6 sm:p-8 mb-5 mt-8"
          style={{
            background:
              'linear-gradient(135deg, rgb(var(--color-accent) / 0.07), rgb(var(--color-accent) / 0.02))',
            border: '1px solid rgb(var(--color-accent) / 0.22)',
          }}
        >
          <h2
            className="font-mono text-[10px] tracking-[0.22em] mb-3"
            style={{ color: 'rgb(var(--color-accent))', margin: 0, marginBottom: 12, fontWeight: 400 }}
          >
            Monday morning, after install
          </h2>
          <p
            className="text-base sm:text-lg leading-relaxed m-0"
            style={{ color: '#141413' }}
          >
            {cap.mondayMorning}
          </p>
        </motion.div>

        {/* Compounding angle */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl p-6 sm:p-8 mb-8"
          style={{
            background: 'rgba(20,20,19,0.04)',
            border: '1px solid rgba(20,20,19,0.08)',
          }}
        >
          <h2
            className="font-mono text-[10px] tracking-[0.02em] mb-3"
            style={{ color: 'rgb(var(--color-accent))', margin: 0, marginBottom: 12, fontWeight: 400 }}
          >
            Why this compounds
          </h2>
          <p
            className="text-base sm:text-lg leading-relaxed m-0"
            style={{ color: '#3a3a36' }}
          >
            {cap.compounding}
          </p>
        </motion.div>

        {/* Pack mapping */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h2
            className="font-mono text-[10px] tracking-[0.22em] mb-3"
            style={{ color: 'rgb(var(--color-accent))', margin: 0, marginBottom: 12, fontWeight: 400 }}
          >
            The packs your Claude runs on
          </h2>
          <p
            className="text-sm leading-relaxed mb-4 m-0"
            style={{ color: 'rgb(var(--color-fg-muted))' }}
          >
            Not marketing copy. The Bridge writes these files to{' '}
            <span
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '0.95em',
              }}
            >
              ~/Documents/Claude Architecture/
            </span>{' '}
            on setup, and Claude reads them every time you open a chat.
          </p>
          <ul className="space-y-2 list-none m-0 pl-0">
            {cap.packs.map((p) => (
              <li
                key={p.badge}
                className="flex items-center gap-3 rounded-xl p-4 transition-colors"
                style={{
                  background: '#fbfaf3',
                  border: '1px solid rgba(20,20,19,0.08)',
                }}
              >
                <span
                  className="inline-flex items-center justify-center rounded-md font-mono text-[10px] uppercase tracking-[0.18em] shrink-0"
                  style={{
                    minWidth: 64,
                    padding: '5px 10px',
                    background: 'rgb(var(--color-accent) / 0.12)',
                    color: 'rgb(var(--color-accent))',
                    fontWeight: 700,
                    border: '1px solid rgb(var(--color-accent) / 0.22)',
                  }}
                >
                  {p.badge}
                </span>
                <span className="text-sm sm:text-base leading-snug" style={{ color: '#141413' }}>
                  {p.name}
                </span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* Proof footer */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="flex items-start gap-3 rounded-xl p-5 mb-10"
          style={{
            background: 'rgb(18, 128, 82, 0.06)',
            border: '1px solid rgb(18, 128, 82, 0.25)',
          }}
        >
          <Check
            className="w-5 h-5 mt-0.5 shrink-0"
            style={{ color: 'rgb(18,128,82)' }}
            aria-hidden="true"
          />
          <p
            className="text-sm sm:text-base leading-snug m-0 italic"
            style={{ color: '#1a5d3f' }}
          >
            {cap.proof}
          </p>
        </motion.div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={goToInstall}
            aria-label={`Jump to install for the ${cap.layer} layer`}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-semibold transition flex-1 min-h-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              background:
                'linear-gradient(135deg, rgb(var(--color-accent)), rgb(204, 110, 46))',
              color: '#fbfaf3',
              boxShadow: '0 14px 30px rgb(var(--color-accent) / 0.32)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow =
                '0 18px 40px rgb(var(--color-accent) / 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow =
                '0 14px 30px rgb(var(--color-accent) / 0.32)'
            }}
          >
            Jump to install
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
          <Link
            to="/empireworksreconstruction"
            aria-label="Back to the full layer index"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-semibold transition min-h-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              background: 'transparent',
              color: '#141413',
              border: '1px solid rgba(20,20,19,0.18)',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to the layers
          </Link>
        </div>

        {/* Next layer suggestion */}
        <NextLayer current={cap} />
      </div>
    </div>
  )
}

function NextLayer({ current }: { current: Capability }) {
  // Find next layer in the canonical order for browse-through.
  const order: Capability['layer'][] = [
    'Voice',
    'Memory',
    'Routing',
    'Sources',
    'Validation',
    'Stack',
  ]
  const idx = order.indexOf(current.layer)
  if (idx === -1 || idx === order.length - 1) return null

  // The next layer's data file
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-16 pt-8 border-t"
      style={{ borderColor: 'rgba(20,20,19,0.08)' }}
    >
      <NextLayerLink currentIdx={idx} order={order} />
    </motion.div>
  )
}

function NextLayerLink({
  currentIdx,
  order,
}: {
  currentIdx: number
  order: Capability['layer'][]
}) {
  const nextLayer = order[currentIdx + 1]
  // Inline lookup to avoid passing the full module through props
  const nextSlug = nextLayer.toLowerCase()
  return (
    <Link
      to={`/empireworksreconstruction/layer/${nextSlug}`}
      className="flex items-center justify-between rounded-2xl p-5 transition group"
      style={{
        background: '#fbfaf3',
        border: '1px solid rgba(20,20,19,0.08)',
        textDecoration: 'none',
        color: '#141413',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgb(var(--color-accent) / 0.4)'
        e.currentTarget.style.boxShadow =
          '0 18px 40px -10px rgb(var(--color-accent) / 0.25)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(20,20,19,0.08)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div className="min-w-0">
        <div
          className="font-mono text-[10px] uppercase tracking-[0.22em] mb-1"
          style={{ color: 'rgb(var(--color-fg-subtle))' }}
        >
          Next layer
        </div>
        <div className="font-display text-xl leading-tight">{nextLayer}</div>
      </div>
      <ArrowRight
        className="w-5 h-5 transition-transform group-hover:translate-x-1"
        style={{ color: 'rgb(var(--color-accent))' }}
        aria-hidden="true"
      />
    </Link>
  )
}

function NotFound({ slug }: { slug: string }) {
  return (
    <div
      className="px-[6vw] pt-24 pb-32"
      style={{ background: '#f5f4ed', color: '#141413' }}
    >
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="font-display text-3xl mb-3">Layer not found</h1>
        <p
          className="text-base leading-relaxed mb-6"
          style={{ color: 'rgb(var(--color-fg-muted))' }}
        >
          No operating layer matches the slug{' '}
          <span
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              padding: '2px 6px',
              background: 'rgba(20,20,19,0.06)',
              borderRadius: 4,
            }}
          >
            {slug}
          </span>
          . The 6 layers are: voice, memory, routing, sources, validation, stack.
        </p>
        <Link
          to="/empireworksreconstruction"
          className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
          style={{
            background: 'rgb(var(--color-accent))',
            color: '#fbfaf3',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to overview
        </Link>
      </div>
    </div>
  )
}

export default EmpireCapabilityLayer
