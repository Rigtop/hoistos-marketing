/**
 * ProgressMeter: persisted activation counter for the scrolophyte timeline.
 *
 * Driven by H1 finding #6 (visible progress meter, sub-1-day implementation).
 * Reads localStorage `scrolophyte.activated` (set by `lib/activate.ts`) and
 * surfaces "X of N packs activated" with a thin progress bar.
 *
 * Sticky on top of the timeline once the user scrolls past the hero, so the
 * meter is always visible during pack browsing without occluding the hero.
 *
 * Hard Rule #11: no em dashes.
 */

import { useEffect, useState } from 'react'
import { listActivated, onActivatedChange } from '../lib/activate'
import { trackFunnel } from '../lib/funnel'

export function ProgressMeter({ totalPacks }: { totalPacks: number }) {
  const [count, setCount] = useState<number>(0)
  const [viewed, setViewed] = useState<boolean>(false)

  useEffect(() => {
    setCount(listActivated().length)
    const off = onActivatedChange(() => {
      setCount(listActivated().length)
    })
    return off
  }, [])

  useEffect(() => {
    if (viewed) return
    setViewed(true)
    trackFunnel('progress_meter_view', { activated_count: count, total_packs: totalPacks })
  }, [viewed, count, totalPacks])

  const pct = Math.min(100, totalPacks > 0 ? (count / totalPacks) * 100 : 0)

  return (
    <div
      className="sticky top-0 z-40 border-b border-ink/10 backdrop-blur"
      style={{ background: 'rgba(255, 255, 255, 0.82)' }}
      role="region"
      aria-label="Activation progress"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-[6vw] py-2.5 sm:gap-5">
        <div
          className="flex shrink-0 items-baseline gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/65"
          aria-live="polite"
        >
          <span
            className="font-semibold"
            style={{ color: 'rgb(var(--color-accent))' }}
          >
            {count}
          </span>
          <span className="text-ink/40">of</span>
          <span className="text-ink/70">{totalPacks}</span>
          <span className="hidden sm:inline text-ink/40">packs activated</span>
          <span className="sm:hidden text-ink/40">packs</span>
        </div>
        <div
          className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-ink/8"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={totalPacks}
          aria-valuenow={count}
          aria-valuetext={`${count} of ${totalPacks} packs activated`}
        >
          <div
            className="h-full origin-left rounded-full transition-transform duration-700 ease-out"
            style={{
              transform: `scaleX(${pct / 100})`,
              width: '100%',
              background:
                'linear-gradient(90deg, rgb(var(--color-accent)) 0%, rgb(var(--color-accent) / 0.55) 100%)',
            }}
          />
        </div>
        <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45 md:inline">
          {count === 0
            ? 'activate one to start'
            : count === totalPacks
              ? 'full activation'
              : `${totalPacks - count} to go`}
        </span>
      </div>
    </div>
  )
}

export default ProgressMeter
