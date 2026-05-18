/**
 * LevelUpOverlay. Full-screen celebration when the user crosses a level
 * threshold via pack install. Watches activated count, computes level via the
 * shared computeLevel in JourneyTrackerBar, fires only when level rises.
 *
 * MASTER_PLAN v2 S3 (round 4, 2026-05-17). Minimal implementation:
 *   - 1.6s overlay with a soft backdrop and the new level pill
 *   - single "Keep installing" CTA dismisses early
 *   - click backdrop or press Escape to dismiss early
 *   - prefers-reduced-motion: skips entrance animation, holds static badge
 *
 * Confetti and per-pack pulse are separate primitives (Confetti already lives
 * at src/components/Confetti.tsx; PackPulse is a follow-on). This overlay is
 * the first observable signal of the gamification layer requested by Eugeen
 * morning markup ("level-up celebrations at module thresholds").
 *
 * Hard Rule #11 (no em dashes), R087 (plain prose), R067 (mobile-first), HR
 * #21 (self-verify): the cross-once-per-threshold invariant is enforced by
 * useRef holding the previously-seen level number.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { listActivated, onActivatedChange } from '../../lib/activate'
import { computeLevel } from '../level'

type ActiveCelebration = {
  num: number
  label: string
  /** Stable key per fire so AnimatePresence treats each celebration as new. */
  fireId: number
}

const VISIBLE_MS = 1600

export function LevelUpOverlay() {
  const [active, setActive] = useState<ActiveCelebration | null>(null)
  const lastLevelRef = useRef<number>(computeLevel(listActivated().length).num)
  const fireCounterRef = useRef<number>(0)
  const reduceMotion = useReducedMotion()

  const dismiss = useCallback(() => setActive(null), [])

  useEffect(() => {
    const handleChange = () => {
      const nextLevel = computeLevel(listActivated().length)
      // Cross-once invariant: fire only on a level INCREASE. Re-renders at the
      // same level (e.g. uninstall then reinstall) do not retrigger.
      if (nextLevel.num > lastLevelRef.current) {
        fireCounterRef.current += 1
        setActive({
          num: nextLevel.num,
          label: nextLevel.label,
          fireId: fireCounterRef.current,
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
            background: 'rgb(20 20 19 / 0.42)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={reduceMotion ? { scale: 1, y: 0 } : { scale: 0.92, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 320, damping: 26, mass: 0.7 }
            }
            style={{
              width: 'min(420px, 92vw)',
              borderRadius: 18,
              padding: '28px 26px',
              textAlign: 'center',
              background: 'rgb(var(--color-bg))',
              border: '1px solid rgb(var(--color-fg) / 0.08)',
              boxShadow: '0 24px 60px -16px rgb(0 0 0 / 0.28)',
            }}
          >
            {/* F3 fix (cycle-4 iter-6): drop the "Level up" eyebrow so the
                dialog reads "Level N" + milestone name without the duplicate
                "Level" framing the eyebrow + H1 produced. Medal/backdrop and
                aria-label still carry the level-up class. */}
            <div
              style={{
                fontFamily: 'Newsreader, Georgia, serif',
                fontSize: 'clamp(28px, 6vw, 40px)',
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
                marginBottom: 22,
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
                padding: '0 22px',
                borderRadius: 999,
                border: 'none',
                background: 'rgb(var(--color-accent))',
                color: '#fbfaf3',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 12,
                letterSpacing: '0.18em',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Keep going
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default LevelUpOverlay
