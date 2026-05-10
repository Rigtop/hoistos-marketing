import { motion, useMotionValue, useSpring } from 'motion/react'
import { useRef } from 'react'
import { cn } from '../lib/utils'

type Props = {
  children: React.ReactNode
  className?: string
  /** Magnetic strength (0-1). Default 0.4. */
  strength?: number
  variant?: 'primary' | 'ghost'
  onClick?: () => void
}

/**
 * MagneticButton — button that subtly follows the cursor when hovered.
 * Springs back to center on leave.
 */
export function MagneticButton({ children, className, strength = 0.4, variant = 'primary', onClick }: Props) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 18 })
  const sy = useSpring(y, { stiffness: 200, damping: 18 })

  function onMove(e: React.MouseEvent<HTMLButtonElement>) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }

  function onLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{ x: sx, y: sy }}
      className={cn(variant === 'primary' ? 'btn btn-primary' : 'btn btn-ghost', className)}
    >
      {children}
    </motion.button>
  )
}
