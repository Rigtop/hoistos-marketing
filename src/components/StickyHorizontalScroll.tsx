import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'

type Props = {
  children: React.ReactNode[]
  /** Total scroll height as viewport multiples. Default 4. */
  scrollLength?: number
  className?: string
}

/**
 * StickyHorizontalScroll: Apple-style sideways scroll-driven gallery.
 *
 * Pins a viewport-tall container, translates child track horizontally as the
 * page scrolls vertically. The Apple AirPods + Vercel landing page pattern.
 *
 * Drop children in any order. Total scroll length scales with child count.
 */
export function StickyHorizontalScroll({ children, scrollLength = 4, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  // Translate from 0% to negative (count - 1) * 100% / count
  const translatePct = -100 + 100 / Math.max(1, children.length)
  const x = useTransform(scrollYProgress, [0, 1], ['0%', `${translatePct}%`])

  return (
    <section
      ref={ref}
      className={`relative ${className}`}
      style={{ height: `${scrollLength * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        <motion.div
          style={{ x, width: `${children.length * 100}vw` }}
          className="flex h-full"
        >
          {children.map((child, i) => (
            <div key={i} className="flex-shrink-0 w-screen h-full flex items-center justify-center px-[8vw]">
              {child}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
