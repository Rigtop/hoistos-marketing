import { motion, useInView, useMotionValue, useTransform, animate } from 'motion/react'
import { useEffect, useRef } from 'react'

type Stat = { num: number; suffix?: string; label: string }

const STATS: Stat[] = [
  { num: 7, label: 'Tier-1 deps' },
  { num: 200, suffix: '+', label: 'Aceternity components' },
  { num: 39, suffix: 'M', label: 'Motion weekly d/l' },
  { num: 26.7, suffix: 'KB', label: 'GSAP gzip size' },
]

function CountUp({ value, suffix }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (n) => (Number.isInteger(value) ? Math.floor(n).toString() : n.toFixed(1)))

  useEffect(() => {
    if (inView) {
      const controls = animate(count, value, { duration: 1.6, ease: 'easeOut' })
      return controls.stop
    }
  }, [inView, value])

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix && <span className="text-[0.5em] ml-1" style={{ color: 'rgb(var(--color-fg-subtle))' }}>{suffix}</span>}
    </span>
  )
}

export function StatGrid() {
  return (
    <section className="px-[8vw] py-24">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px border" style={{ borderColor: 'rgb(var(--color-border) / 0.3)', background: 'rgb(var(--color-border) / 0.3)' }}>
        {STATS.map((s) => (
          <div
            key={s.label}
            className="p-8 transition-colors"
            style={{ background: 'rgb(var(--color-bg))' }}
          >
            <div className="font-brand font-bold text-5xl md:text-6xl leading-none tracking-tighter mb-3 text-fg">
              <CountUp value={s.num} suffix={s.suffix} />
            </div>
            <div className="font-mono text-xs uppercase tracking-widest" style={{ color: 'rgb(var(--color-fg-subtle))' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
