import { motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

type Props = {
  text: string
  className?: string
  /** ms per character. Default 35. */
  speed?: number
  /** Show blinking cursor. Default true. */
  cursor?: boolean
  /** Delay before starting (ms). Default 0. */
  delay?: number
}

/**
 * TypewriterText — letter-by-letter typewriter effect, fires on viewport entry.
 * Includes blinking cursor.
 */
export function TypewriterText({ text, className = '', speed = 35, cursor = true, delay = 0 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    const start = setTimeout(() => {
      const tick = setInterval(() => {
        setCount((c) => {
          if (c >= text.length) {
            clearInterval(tick)
            return c
          }
          return c + 1
        })
      }, speed)
      return () => clearInterval(tick)
    }, delay)
    return () => clearTimeout(start)
  }, [inView, text.length, speed, delay])

  return (
    <span ref={ref} className={className}>
      {text.slice(0, count)}
      {cursor && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="inline-block w-[0.6ch]"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          ▍
        </motion.span>
      )}
    </span>
  )
}
