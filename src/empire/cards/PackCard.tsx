/**
 * PackCard. Premium card visualizing the activation-pack mechanic.
 *
 * Design intent (R054):
 *   - Faux Claude conversation window. Bootstrap prompt visibly types in,
 *     Claude asks a question, a "Skill installed" badge slides in. Loops
 *     gently every ~12s on a self-managed timer. No scroll trigger.
 *   - Mouse-proximity 3D tilt matching MapCard for cohesion.
 *   - Smooth mount fade with delay so cards stagger naturally on first paint.
 *
 * Hard Rule #11: zero em dashes anywhere.
 */

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

const SEQUENCE = [
  { actor: 'you', text: 'Set up my Foundation system.' },
  { actor: 'claude', text: 'Calling setup_foundation.' },
  { actor: 'you', text: 'Allowed.' },
  { actor: 'claude', text: 'Foundation installed. Router ready.' },
] as const

export function PackCard() {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotX = useSpring(useTransform(my, [-1, 1], [6, -6]), { stiffness: 220, damping: 22 })
  const rotY = useSpring(useTransform(mx, [-1, 1], [-6, 6]), { stiffness: 220, damping: 22 })

  const [step, setStep] = useState(0)
  const [showInstalled, setShowInstalled] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1700)
    const t2 = setTimeout(() => setStep(2), 3100)
    const t3 = setTimeout(() => setStep(3), 4300)
    const t4 = setTimeout(() => setShowInstalled(true), 6200)
    const reset = setTimeout(() => {
      setStep(0)
      setShowInstalled(false)
    }, 11500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(reset)
    }
  }, [showInstalled])

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
      transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-3xl p-5 sm:p-8 md:p-10 border overflow-hidden group"
      data-card="pack"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            'radial-gradient(600px circle at var(--mx,50%) var(--my,50%), rgb(var(--color-accent) / 0.18), transparent 40%)',
        }}
      />

      <div className="relative">
        <div
          className="rounded-xl border mb-8 overflow-hidden font-mono text-[12px] leading-relaxed"
          style={{
            background: 'rgb(var(--color-bg))',
            borderColor: 'rgb(var(--color-border))',
            minHeight: 168,
          }}
        >
          <div
            className="px-3 py-2 flex items-center gap-1.5 border-b"
            style={{ borderColor: 'rgb(var(--color-border))' }}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F56' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#27C93F' }} />
            <span
              className="ml-3 text-[10px] uppercase tracking-[0.18em]"
              style={{ color: 'rgb(var(--color-fg-subtle))' }}
            >
              claude.ai
            </span>
          </div>

          <div className="p-4 space-y-2.5 min-h-[120px]">
            {SEQUENCE.slice(0, step + 1).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: line.actor === 'you' ? -8 : 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="flex gap-2"
              >
                <span
                  className="text-[10px] uppercase tracking-[0.18em] mt-[3px] shrink-0 w-12"
                  style={{
                    color:
                      line.actor === 'you'
                        ? 'rgb(var(--color-accent))'
                        : 'rgb(var(--color-fg-subtle))',
                  }}
                >
                  {line.actor}
                </span>
                <span style={{ color: 'rgb(var(--color-fg))' }}>{line.text}</span>
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {showInstalled ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="px-4 py-2.5 flex items-center gap-2 border-t"
                style={{
                  borderColor: 'rgb(var(--color-border))',
                  background: 'rgb(var(--color-accent) / 0.08)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12l5 5L20 7"
                    stroke="rgb(var(--color-accent))"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  className="text-[11px] uppercase tracking-[0.18em] font-medium"
                  style={{ color: 'rgb(var(--color-accent))' }}
                >
                  Custom skill installed. Ready to use.
                </span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div
          className="text-xs font-medium mb-3"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          The pack
        </div>
        <h3 className="font-display text-[1.75rem] leading-tight mb-4" style={{ color: 'rgb(var(--color-fg))' }}>
          Foundation installs in one setup
        </h3>
        <p className="text-base leading-relaxed" style={{ color: 'rgb(var(--color-fg-muted))' }}>
          The first install is not 11 separate downloads. Claude calls the Bridge,
          installs Foundation, writes the router, and returns the activation line.
          The pack pages stay useful as previews and fallback reference, but the
          product path is Bridge first. By the end you have a Claude that knows your
          work, not mine.
        </p>
      </div>
    </motion.div>
  )
}

export default PackCard
