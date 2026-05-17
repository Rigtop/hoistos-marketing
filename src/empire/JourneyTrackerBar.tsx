/**
 * JourneyTrackerBar. The slim horizontal fixed-top progress strip.
 *
 * Replaces the right-side asymmetric JourneyTracker panel with a full-width
 * 56px bar pinned to the top of the viewport. Always visible while the page
 * scrolls. Shows pack-count, level, and a 5-axis progress dot row.
 *
 * Eugeen directive 2026-05-17: "needs to be a full horizontal slim bar
 * thats frozen and always shows up with the scroll."
 *
 * Hard Rule #11 (no em dashes), R087 (plain prose), R067 (mobile-first).
 * Context7: react@19.2.0 useState/useEffect/useMemo stable.
 */

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { listActivated, onActivatedChange } from '../lib/activate'
import { FOUNDATION_CARDS, type FoundationCard } from './content/foundation-cards'
import { computeLevel } from './level'

const TOTAL_PACK_COUNT = 43

const LAYER_LABELS = ['Voice', 'Memory', 'Sources', 'Routing', 'Validation'] as const

// Canonical pack-id to layer-index map, sourced from FOUNDATION_CARDS so the
// bar matches the same layer assignment the rest of /empire renders. Replaces
// the iter-15 substring-cascade that mis-binned cold-start-protocol and
// skill-builder into Voice by default. Packs absent from this map (e.g.
// bonus-extras blueprints) still increment the total pack count but no longer
// pollute a single layer's tally.
const LAYER_INDEX: Record<FoundationCard['layer'], number> = {
  Voice: 0,
  Memory: 1,
  Sources: 2,
  Routing: 3,
  Validation: 4,
}

const PACK_LAYER_MAP: Map<string, number> = new Map(
  FOUNDATION_CARDS.map((card) => [card.packId, LAYER_INDEX[card.layer]]),
)

function packLayer(packId: string): number | null {
  const layer = PACK_LAYER_MAP.get(packId)
  return layer === undefined ? null : layer
}

export const TRACKER_BAR_HEIGHT = 56

export function JourneyTrackerBar() {
  const [installed, setInstalled] = useState<string[]>(() => listActivated())
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    return onActivatedChange(() => setInstalled(listActivated()))
  }, [])

  const counts = useMemo(() => {
    const c = [0, 0, 0, 0, 0]
    for (const id of installed) {
      const layer = packLayer(id)
      if (layer !== null) c[layer] += 1
    }
    return c
  }, [installed])

  const level = useMemo(() => computeLevel(installed.length), [installed.length])

  return (
    <div
      role="region"
      aria-label="Your Claude journey progress"
      data-testid="journey-tracker-bar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        width: '100%',
        background: 'rgb(var(--color-bg) / 0.92)',
        backdropFilter: 'saturate(180%) blur(8px)',
        WebkitBackdropFilter: 'saturate(180%) blur(8px)',
        borderBottom: '1px solid rgb(var(--color-fg) / 0.08)',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          height: 'clamp(48px, 6vw, 56px)',
          padding: '0 clamp(12px, 3vw, 24px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <span
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 10,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgb(var(--color-fg-subtle))',
              whiteSpace: 'nowrap',
            }}
          >
            Your Claude
          </span>
          <div
            aria-live="polite"
            aria-label={`${installed.length} of ${TOTAL_PACK_COUNT} packs installed`}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 6,
              whiteSpace: 'nowrap',
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={installed.length}
                initial={reduceMotion ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={reduceMotion ? { opacity: 1 } : { scale: 1.18, opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' }}
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'rgb(var(--color-fg))',
                  lineHeight: 1,
                  display: 'inline-block',
                }}
              >
                {installed.length}
              </motion.span>
            </AnimatePresence>
            <span
              style={{
                fontSize: 12,
                color: 'rgb(var(--color-fg-muted))',
              }}
            >
              / {TOTAL_PACK_COUNT}
            </span>
          </div>
        </div>

        <div
          aria-label="Layer progress"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(6px, 1.4vw, 14px)',
            flex: '0 1 auto',
            overflow: 'hidden',
          }}
        >
          {LAYER_LABELS.map((label, idx) => {
            const lit = counts[idx] > 0
            return (
              <div
                key={label}
                title={`${label}: ${counts[idx]} installed`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <motion.span
                  aria-hidden="true"
                  animate={
                    reduceMotion
                      ? { scale: 1 }
                      : lit
                        ? { scale: [1, 1.45, 1] }
                        : { scale: 1 }
                  }
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.6, ease: 'easeOut', times: [0, 0.35, 1] }
                  }
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: lit
                      ? 'rgb(var(--color-accent))'
                      : 'rgb(var(--color-fg) / 0.18)',
                    flexShrink: 0,
                    display: 'inline-block',
                  }}
                />
                <span
                  className="hidden sm:inline"
                  style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    fontSize: 9,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: lit
                      ? 'rgb(var(--color-fg))'
                      : 'rgb(var(--color-fg-subtle))',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            whiteSpace: 'nowrap',
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={level.num}
              initial={reduceMotion ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reduceMotion ? { opacity: 1 } : { scale: 1.3, opacity: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 360, damping: 22, mass: 0.5 }
              }
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgb(var(--color-fg-subtle))',
                display: 'inline-block',
              }}
            >
              L{level.num}
            </motion.span>
          </AnimatePresence>
          <span
            className="hidden md:inline"
            style={{
              fontSize: 12,
              color: 'rgb(var(--color-fg-muted))',
            }}
          >
            {level.label}
          </span>
        </div>
      </div>
    </div>
  )
}

export default JourneyTrackerBar
