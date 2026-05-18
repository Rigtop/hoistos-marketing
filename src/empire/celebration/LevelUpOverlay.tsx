/**
 * LevelUpOverlay. Round 8 (2026-05-18) visual upgrade.
 *
 * Round 7 cross-once invariant intact. Round 8 adds:
 *   - Hex-clip-path medal (Mockup B vocabulary) with gradient + glow,
 *     scale-in via cubic-bezier(0.34, 1.56, 0.64, 1) spring.
 *   - Confetti burst on every overlay mount (signal-orange + signal-glow
 *     + gold palette, 120 particles).
 *
 * The Confetti primitive at src/components/Confetti.tsx fires when its
 * `trigger` prop changes value. We pass Date.now() at the moment the
 * overlay opens.
 *
 * Hard Rule #11: no em dashes.
 * R067: honors prefers-reduced-motion.
 * Context7 (HR #31): react@19.2.5, motion@12.38 (motion.div + AnimatePresence
 * + useReducedMotion). Verified live 2026-05-18.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { listActivated, onActivatedChange } from '../../lib/activate'
import { computeLevel } from '../level'
import { Confetti } from '../../components/Confetti'

type ActiveCelebration = {
  num: number
  label: string
  fireId: number
  burstAt: number
}

const VISIBLE_MS = 2200

const HEX_CLIP = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'

const CONFETTI_PALETTE = ['#E2541C', '#FF7A3C', '#C89A3C', '#E8B85C', '#FBFAF3']

export function LevelUpOverlay() {
  const [active, setActive] = useState<ActiveCelebration | null>(null)
  const lastLevelRef = useRef<number>(computeLevel(listActivated().length).num)
  const fireCounterRef = useRef<number>(0)
  const reduceMotion = useReducedMotion()

  const dismiss = useCallback(() => setActive(null), [])

  useEffect(() => {
    const handleChange = () => {
      const nextLevel = computeLevel(listActivated().length)
      if (nextLevel.num > lastLevelRef.current) {
        fireCounterRef.current += 1
        setActive({
          num: nextLevel.num,
          label: nextLevel.label,
          fireId: fireCounterRef.current,
          burstAt: Date.now(),
        })
      }
      lastLevelRef.current = nextLevel.num
    }
    return onActivatedChange(handleChange)
  }, [])

  useEffect(() => {
    if (!active) return
    const t = window.setTimeout(dismiss, VISIBLE_MS)
    return () => window.clearTimeout(t)
  }, [active, dismiss])

  useEffect(() => {
    if (!active) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [active, dismiss])

  return (
    <>
      {active ? (
        <Confetti
          trigger={active.burstAt}
          count={120}
          colors={CONFETTI_PALETTE}
          speed={16}
        />
      ) : null}
      <AnimatePresence>
        {active ? (
          <motion.div
            key={active.fireId}
            role="dialog"
            aria-modal="true"
            aria-label={`Level ${active.num}: ${active.label}`}
            data-celebration="level-up"
            onClick={dismiss}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              background:
                'radial-gradient(circle at center, rgba(226,84,28,0.20), rgba(20,20,19,0.52))',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={reduceMotion ? { scale: 1, y: 0 } : { scale: 0.6, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 360, damping: 22, mass: 0.7 }
              }
              style={{
                width: 'min(440px, 92vw)',
                borderRadius: 22,
                padding: '36px 32px',
                textAlign: 'center',
                background: 'rgb(var(--color-bg))',
                border: '1px solid rgb(var(--color-fg) / 0.08)',
                boxShadow: '0 32px 80px -16px rgb(0 0 0 / 0.34)',
              }}
            >
              {/* Hex medal */}
              <motion.div
                initial={reduceMotion ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 340, damping: 18, mass: 0.7, delay: 0.08 }
                }
                aria-hidden="true"
                style={{
                  width: 132,
                  height: 132,
                  margin: '0 auto 22px',
                  clipPath: HEX_CLIP,
                  background:
                    'linear-gradient(135deg, #E2541C 0%, #FF7A3C 50%, #C89A3C 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Newsreader', Georgia, serif",
                  fontSize: 60,
                  fontWeight: 800,
                  color: '#FBFAF3',
                  boxShadow:
                    '0 22px 60px rgba(226,84,28,0.55), 0 0 36px rgba(226,84,28,0.28) inset',
                }}
              >
                {active.num}
              </motion.div>
              <div
                style={{
                  fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
                  fontSize: 11,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: '#E2541C',
                  marginBottom: 8,
                }}
              >
                Level Up
              </div>
              <div
                style={{
                  fontFamily: 'Newsreader, Georgia, serif',
                  fontSize: 'clamp(28px, 6vw, 42px)',
                  fontWeight: 500,
                  lineHeight: 1.05,
                  letterSpacing: '-0.01em',
                  color: 'rgb(var(--color-fg))',
                  marginBottom: 10,
                }}
              >
                Level {active.num}
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'rgb(var(--color-fg))',
                  marginBottom: 24,
                }}
              >
                {active.label}
              </div>
              <button
                type="button"
                onClick={dismiss}
                autoFocus
                aria-label="Dismiss this celebration"
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgb(204,110,46)]"
                style={{
                  minHeight: 44,
                  padding: '0 26px',
                  borderRadius: 999,
                  border: 'none',
                  background: 'linear-gradient(135deg, #E2541C, #FF7A3C)',
                  color: '#FBFAF3',
                  fontSize: 14,
                  letterSpacing: '0.06em',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(226,84,28,0.32)',
                  textTransform: 'uppercase',
                }}
              >
                Keep going
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}

export default LevelUpOverlay
