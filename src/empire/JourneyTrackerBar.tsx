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

import { listActivated, onActivatedChange } from '../lib/activate'

const TOTAL_PACK_COUNT = 43

const LAYER_LABELS = ['Voice', 'Memory', 'Sources', 'Routing', 'Validation'] as const

function packLayer(packId: string): number {
  if (packId.startsWith('foundation-01') || packId.includes('voice') || packId.includes('intake')) return 0
  if (packId.includes('facts') || packId.includes('memory') || packId.includes('decision') || packId.includes('knowledge')) return 1
  if (packId.includes('source') || packId.includes('search') || packId.includes('rag')) return 2
  if (packId.includes('routing') || packId.includes('write-gate') || packId.includes('email')) return 3
  if (packId.includes('validator') || packId.includes('output-validator') || packId.includes('verify')) return 4
  return 0
}

function computeLevel(count: number): { num: number; label: string } {
  if (count >= 36) return { num: 7, label: 'Operator' }
  if (count >= 24) return { num: 6, label: 'Builder' }
  if (count >= 16) return { num: 5, label: 'Compounding' }
  if (count >= 9) return { num: 4, label: 'Threshold' }
  if (count >= 5) return { num: 3, label: 'Foundation laid' }
  if (count >= 3) return { num: 2, label: 'Lit the match' }
  if (count >= 1) return { num: 1, label: 'First spark' }
  return { num: 0, label: 'Not started' }
}

export const TRACKER_BAR_HEIGHT = 56

export function JourneyTrackerBar() {
  const [installed, setInstalled] = useState<string[]>(() => listActivated())

  useEffect(() => {
    return onActivatedChange(() => setInstalled(listActivated()))
  }, [])

  const counts = useMemo(() => {
    const c = [0, 0, 0, 0, 0]
    for (const id of installed) c[packLayer(id)] += 1
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
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 6,
              whiteSpace: 'nowrap',
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: 'rgb(var(--color-fg))',
                lineHeight: 1,
              }}
            >
              {installed.length}
            </span>
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
                <span
                  aria-hidden="true"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: lit
                      ? 'rgb(var(--color-accent))'
                      : 'rgb(var(--color-fg) / 0.18)',
                    flexShrink: 0,
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
          <span
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgb(var(--color-fg-subtle))',
            }}
          >
            L{level.num}
          </span>
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
