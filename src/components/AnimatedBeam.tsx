import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { motion } from 'motion/react'

type Props = {
  /** Container the beam draws inside (positions are relative to this). */
  containerRef: RefObject<HTMLElement | null>
  fromRef: RefObject<HTMLElement | null>
  toRef: RefObject<HTMLElement | null>
  /** Curve sag (negative = arch up, positive = arch down). Default -50. */
  curvature?: number
  /** Stroke width in px. Default 2. */
  width?: number
  /** Beam color. Defaults to var(--color-accent). */
  color?: string
  /** Animation duration in seconds. Default 3. */
  duration?: number
  /** Reverse the animation direction. */
  reverse?: boolean
}

/**
 * AnimatedBeam — a curved SVG path connecting two elements with a traveling gradient.
 * Tracks element positions on resize. Useful for architecture diagrams, flow graphs.
 */
export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = -50,
  width = 2,
  color,
  duration = 3,
  reverse = false,
}: Props) {
  const id = useRef(`beam-${Math.random().toString(36).slice(2, 9)}`).current
  const [path, setPath] = useState('')
  const [box, setBox] = useState({ w: 0, h: 0 })

  useEffect(() => {
    function update() {
      const c = containerRef.current
      const a = fromRef.current
      const b = toRef.current
      if (!c || !a || !b) return

      const cb = c.getBoundingClientRect()
      const ab = a.getBoundingClientRect()
      const bb = b.getBoundingClientRect()

      const x1 = ab.left + ab.width / 2 - cb.left
      const y1 = ab.top + ab.height / 2 - cb.top
      const x2 = bb.left + bb.width / 2 - cb.left
      const y2 = bb.top + bb.height / 2 - cb.top

      const cpX = (x1 + x2) / 2
      const cpY = (y1 + y2) / 2 + curvature

      setPath(`M ${x1},${y1} Q ${cpX},${cpY} ${x2},${y2}`)
      setBox({ w: cb.width, h: cb.height })
    }
    update()
    const ro = new ResizeObserver(update)
    if (containerRef.current) ro.observe(containerRef.current)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [containerRef, fromRef, toRef, curvature])

  const stroke = color ?? 'rgb(var(--color-accent))'

  return (
    <svg
      width={box.w}
      height={box.h}
      className="pointer-events-none absolute left-0 top-0"
      aria-hidden
    >
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={stroke} stopOpacity="0" />
          <stop offset="50%" stopColor={stroke} stopOpacity="1" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          <motion.animate
            attributeName="x1"
            from={reverse ? '100%' : '0%'}
            to={reverse ? '0%' : '100%'}
            dur={`${duration}s`}
            repeatCount="indefinite"
          />
          <motion.animate
            attributeName="x2"
            from={reverse ? '120%' : '-20%'}
            to={reverse ? '-20%' : '120%'}
            dur={`${duration}s`}
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>
      <path d={path} stroke={stroke} strokeWidth={width} strokeOpacity="0.18" fill="none" />
      <path d={path} stroke={`url(#${id})`} strokeWidth={width} strokeLinecap="round" fill="none" />
    </svg>
  )
}
