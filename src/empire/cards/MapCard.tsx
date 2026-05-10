/**
 * MapCard. Premium card visualizing the chronological AI-native journey.
 *
 * Design intent (R054 Visual Pro Max Fidelity):
 *   - Animated mini-timeline rail with 7 milestone dots, last 3 marked as
 *     "installable" (signal-orange, pulsing). The visual encodes the value
 *     prop: most moments are stories, the glowing ones are upgrades you can
 *     install in your own Claude.
 *   - Mouse-proximity 3D tilt. Subtle. No scroll-jacking.
 *   - Smooth mount fade via Motion. Honors prefers-reduced-motion via the
 *     root LenisProvider gate already established in main.tsx.
 *
 * Hard Rule #11: zero em dashes anywhere.
 */

import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useRef } from 'react'

const MILESTONES = [
  { kind: 'story' },
  { kind: 'story' },
  { kind: 'story' },
  { kind: 'story' },
  { kind: 'install' },
  { kind: 'install' },
  { kind: 'install' },
] as const

export function MapCard() {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotX = useSpring(useTransform(my, [-1, 1], [6, -6]), { stiffness: 220, damping: 22 })
  const rotY = useSpring(useTransform(mx, [-1, 1], [-6, 6]), { stiffness: 220, damping: 22 })

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2)
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2)
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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-3xl p-8 md:p-10 border overflow-hidden group"
      data-card="map"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            'radial-gradient(600px circle at var(--mx,50%) var(--my,50%), rgb(var(--color-accent) / 0.18), transparent 40%)',
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgb(var(--color-fg)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--color-fg)) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative">
        <div className="mb-8">
          <svg viewBox="0 0 320 64" className="w-full h-16" aria-hidden="true">
            <defs>
              <linearGradient id="rail-grad" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="rgb(var(--color-fg-subtle))" stopOpacity="0.3" />
                <stop offset="60%" stopColor="rgb(var(--color-accent))" stopOpacity="0.9" />
                <stop offset="100%" stopColor="rgb(var(--color-accent))" stopOpacity="1" />
              </linearGradient>
            </defs>

            <line x1="20" y1="32" x2="300" y2="32" stroke="url(#rail-grad)" strokeWidth="2" strokeLinecap="round" />

            {MILESTONES.map((m, i) => {
              const cx = 20 + (i * 280) / (MILESTONES.length - 1)
              const installable = m.kind === 'install'
              return (
                <g key={i}>
                  {installable ? (
                    <motion.circle
                      cx={cx}
                      cy={32}
                      r={9}
                      fill="rgb(var(--color-accent) / 0.25)"
                      animate={{ r: [9, 13, 9], opacity: [0.25, 0.05, 0.25] }}
                      transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
                    />
                  ) : null}
                  <circle
                    cx={cx}
                    cy={32}
                    r={installable ? 5 : 4}
                    fill={installable ? 'rgb(var(--color-accent))' : 'rgb(var(--color-fg) / 0.5)'}
                  />
                </g>
              )
            })}

            <text x="20" y="56" fontSize="9" fill="rgb(var(--color-fg-subtle))" fontFamily="monospace">
              MONTH 1
            </text>
            <text x="280" y="56" fontSize="9" fill="rgb(var(--color-fg-subtle))" fontFamily="monospace" textAnchor="end">
              TODAY
            </text>
          </svg>

          <div
            className="mt-3 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: 'rgb(var(--color-fg-subtle))' }}
          >
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'rgb(var(--color-fg) / 0.5)' }} />
              Story
            </span>
            <span className="flex items-center gap-2">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: 'rgb(var(--color-accent))', boxShadow: '0 0 8px rgb(var(--color-accent) / 0.6)' }}
              />
              Installable upgrade
            </span>
          </div>
        </div>

        <div
          className="font-mono text-[10px] uppercase tracking-[0.22em] mb-3"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          The map
        </div>
        <h3 className="font-display text-[1.75rem] leading-tight mb-4" style={{ color: 'rgb(var(--color-fg))' }}>
          Perennial Empire's AI-native journey
        </h3>
        <p className="text-base leading-relaxed" style={{ color: 'rgb(var(--color-fg-muted))' }}>
          Every moment that turned a construction company into an AI-native operation, in order. Some are just the
          story. The ones with a glowing dot are upgrades you can drop into your own Claude in five minutes. Scroll
          the timeline. Click anything that glows.
        </p>
      </div>
    </motion.div>
  )
}

export default MapCard
