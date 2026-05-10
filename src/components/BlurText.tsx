import { motion, useInView } from 'motion/react'
import { useRef } from 'react'

type Props = {
  text: string
  className?: string
  /** Per-character stagger in seconds. Default 0.04. */
  stagger?: number
  /** Initial blur radius in px. Default 8. */
  blur?: number
  /** Initial vertical offset in px. Default 16. */
  yOffset?: number
}

/**
 * BlurText — character-by-character blur+lift reveal on viewport entry.
 * The Codrops / react-bits scroll-reveal text pattern.
 * Use for hero subheads, big section titles. Sparingly.
 */
export function BlurText({ text, className = '', stagger = 0.04, blur = 8, yOffset = 16 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const chars = Array.from(text)

  return (
    <span ref={ref} className={className} aria-label={text}>
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          initial={{ opacity: 0, filter: `blur(${blur}px)`, y: yOffset }}
          animate={inView ? { opacity: 1, filter: 'blur(0px)', y: 0 } : {}}
          transition={{ duration: 0.6, delay: i * stagger, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'inline-block', whiteSpace: ch === ' ' ? 'pre' : 'normal' }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  )
}
