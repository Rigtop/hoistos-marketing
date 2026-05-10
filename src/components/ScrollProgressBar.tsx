import { useScroll, useSpring, motion } from 'motion/react'

type Props = {
  className?: string
  /** Position. Default 'top'. */
  position?: 'top' | 'bottom'
  /** Bar height in px. Default 2. */
  height?: number
}

/**
 * ScrollProgressBar: thin progress bar pinned to viewport edge that fills
 * with scroll position. Theme-aware accent gradient.
 *
 * Useful on long-form deliverables (essays, case studies, scrollytelling).
 * Spring-smoothed so it never jumps.
 */
export function ScrollProgressBar({ className = '', position = 'top', height = 2 }: Props) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      style={{
        scaleX,
        transformOrigin: '0%',
        height: `${height}px`,
        background: 'linear-gradient(to right, rgb(var(--color-accent)), rgb(var(--color-accent-2)))',
        boxShadow: '0 0 12px rgb(var(--color-accent) / 0.4)',
      }}
      className={`fixed left-0 right-0 z-[9999] ${position === 'top' ? 'top-0' : 'bottom-0'} ${className}`}
    />
  )
}
