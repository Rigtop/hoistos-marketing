import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

/**
 * CustomCursor — replaces the browser cursor with a smooth-following dot.
 * Magnetically expands when hovering elements with [data-cursor="hover"].
 * Theme-aware. Hides on touch devices.
 *
 * Usage:
 *   <CustomCursor />
 *   <button data-cursor="hover">Hover me</button>
 *
 * Activation: opt-in via document.documentElement[data-custom-cursor="on"].
 * (Lets demo pages toggle without full remount.)
 */
export function CustomCursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 350, damping: 28, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 350, damping: 28, mass: 0.5 })

  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState(false)
  const isTouch = useRef(false)

  // Watch the html data-custom-cursor attribute so demos can toggle.
  useEffect(() => {
    function sync() {
      setActive(document.documentElement.getAttribute('data-custom-cursor') === 'on')
    }
    sync()
    const obs = new MutationObserver(sync)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-custom-cursor'] })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    isTouch.current = window.matchMedia('(pointer: coarse)').matches
    if (isTouch.current || !active) return

    function onMove(e: MouseEvent) {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)

      const t = e.target as HTMLElement | null
      const isHover = !!t?.closest('[data-cursor="hover"], a, button')
      setHovering(isHover)
    }

    function onLeave() {
      setVisible(false)
    }

    window.addEventListener('mousemove', onMove)
    document.body.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.body.removeEventListener('mouseleave', onLeave)
    }
  }, [x, y, active])

  if (isTouch.current || !active) return null

  return (
    <>
      <style>{`
        @media (pointer: fine) {
          *, *::before, *::after { cursor: none !important; }
        }
      `}</style>
      <motion.div
        style={{
          x: sx,
          y: sy,
          opacity: visible ? 1 : 0,
        }}
        className="pointer-events-none fixed top-0 left-0 z-[9999] -translate-x-1/2 -translate-y-1/2 transition-opacity"
      >
        <motion.div
          animate={{
            scale: hovering ? 2.2 : 1,
            backgroundColor: hovering ? 'rgb(var(--color-accent))' : 'transparent',
            borderColor: 'rgb(var(--color-accent))',
          }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="w-8 h-8 rounded-full border-2 mix-blend-difference"
        />
      </motion.div>
    </>
  )
}
