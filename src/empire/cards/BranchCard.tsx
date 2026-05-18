/**
 * BranchCard. Premium card for the "Customware" personalization mechanic.
 *
 * Design intent (R054):
 *   - Faux SKILL.md window mirroring PackCard's faux Claude window pattern
 *     so the two output mechanics read as a system. Bracketed template
 *     placeholders fill in with personalized values one by one, then a
 *     "Customware ready" badge slides in below. Loops gently every ~14s.
 *   - Mouse-proximity 3D tilt + halo glow matching MapCard + PackCard.
 *
 * S199 batch 3 changes:
 *   - Replaced fork-graph SVG with SKILL.md template assembly visual.
 *   - Eyebrow renamed "Custom wear" to "Customware" (one word, software portmanteau).
 *   - Body copy reframed for software metaphor.
 *
 * Hard Rule #11: zero em dashes anywhere.
 */

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

const TEMPLATE_LINES = [
  { key: 'name', placeholder: '{{DIVISION}}-{{SKILL}}', value: 'ewr-proposals' },
  { key: 'description', placeholder: 'Custom skill for {{VP_NAME}}', value: 'Custom skill for Lester' },
  { key: 'trigger', placeholder: 'phrase "{{TRIGGER_PHRASE}}"', value: 'phrase "build me a proposal"' },
  { key: 'version', placeholder: '1.0.0', value: '1.0.0' },
] as const

export function BranchCard() {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotX = useSpring(useTransform(my, [-1, 1], [6, -6]), { stiffness: 220, damping: 22 })
  const rotY = useSpring(useTransform(mx, [-1, 1], [-6, 6]), { stiffness: 220, damping: 22 })

  const [step, setStep] = useState(0)
  const [showReady, setShowReady] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1500)
    const t2 = setTimeout(() => setStep(2), 2700)
    const t3 = setTimeout(() => setStep(3), 3900)
    const t4 = setTimeout(() => setStep(4), 5100)
    const t5 = setTimeout(() => setShowReady(true), 6500)
    const reset = setTimeout(() => {
      setStep(0)
      setShowReady(false)
    }, 13500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
      clearTimeout(reset)
    }
  }, [showReady])

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
      transition={{ duration: 0.7, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-3xl p-8 md:p-10 border overflow-hidden group"
      data-card="branch"
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
            minHeight: 200,
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
              SKILL.md
            </span>
          </div>

          <div className="p-4 min-h-[148px]">
            <div className="mb-2" style={{ color: 'rgb(var(--color-fg-subtle))' }}>
              ---
            </div>

            {TEMPLATE_LINES.map((line, i) => {
              const filled = i < step
              return (
                <div key={line.key} className="flex gap-2 items-baseline mb-1">
                  <span style={{ color: 'rgb(var(--color-fg-subtle))', minWidth: 92 }}>{line.key}:</span>
                  <AnimatePresence mode="wait" initial={false}>
                    {filled ? (
                      <motion.span
                        key="filled"
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.32 }}
                        style={{ color: 'rgb(var(--color-accent))', fontWeight: 500 }}
                      >
                        {line.value}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ color: 'rgb(var(--color-fg) / 0.4)' }}
                      >
                        {line.placeholder}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}

            <div className="mt-2" style={{ color: 'rgb(var(--color-fg-subtle))' }}>
              ---
            </div>
          </div>

          <AnimatePresence>
            {showReady ? (
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
                  className="text-[11px] tracking-[0.04em] font-medium"
                  style={{ color: 'rgb(var(--color-accent))' }}
                >
                  Customware ready. Yours, not Eugeen's.
                </span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div
          className="font-mono text-[10px] uppercase tracking-[0.22em] mb-3"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          Customware
        </div>
        <h3 className="font-display text-[1.75rem] leading-tight mb-4" style={{ color: 'rgb(var(--color-fg))' }}>
          Cut for your division
        </h3>
        <p className="text-base leading-relaxed" style={{ color: 'rgb(var(--color-fg-muted))' }}>
          The packs started as templates I built for myself. Each one walks you through tailoring it to your
          division, your trade, your team, your projects. By the end you have something nobody else has: a Claude
          that knows your work, not mine.
        </p>
      </div>
    </motion.div>
  )
}

export default BranchCard
