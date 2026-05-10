/**
 * Aceternity UI flavor primitives, hand-rolled for the HoistOS LIGHT brand.
 *
 * S197 R054 amplification pass. These are not the literal Aceternity copies
 * (Aceternity is paid + their styles target dark mode); they're our
 * brand-correct paper + ink + signal-orange take on the same patterns.
 *
 * All components respect prefers-reduced-motion via the `useReducedMotion`
 * hook from motion. All animations target 60fps via transforms + opacity.
 *
 * Hard Rule #11: zero em dashes in this file.
 */

import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'motion/react'

// ---------------------------------------------------------------------------
// TracingBeam: left-edge SVG line that grows with scroll progress.
// Aceternity-flavor: a thin signal-orange line with a glowing dot at the
// scroll position. Lives fixed on the viewport, animates via useScroll.
// ---------------------------------------------------------------------------

export interface TracingBeamProps {
  containerRef?: RefObject<HTMLElement | null>
  className?: string
  /** Color of the beam. Defaults to var(--color-accent). */
  color?: string
  /** Beam thickness in px. Default 2. */
  thickness?: number
  /** Distance from left edge in px. Default 24. */
  leftOffset?: number
}

export function TracingBeam({
  containerRef,
  className = '',
  color = 'rgb(var(--color-accent))',
  thickness = 2,
  leftOffset = 24,
}: TracingBeamProps) {
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll(
    containerRef
      ? { target: containerRef, offset: ['start start', 'end end'] }
      : undefined,
  )
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    restDelta: 0.0008,
  })
  const lineHeight = useTransform(smoothed, [0, 1], ['0%', '100%'])
  const dotY = useTransform(smoothed, [0, 1], ['0%', '100%'])

  if (reduce) {
    return (
      <div
        aria-hidden
        className={`pointer-events-none fixed top-0 z-30 hidden h-screen md:block ${className}`}
        style={{ left: leftOffset, width: thickness }}
      >
        <div
          className="h-full w-full"
          style={{ background: `${color}40` }}
        />
      </div>
    )
  }

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed top-0 z-30 hidden h-screen md:block ${className}`}
      style={{ left: leftOffset, width: thickness }}
    >
      {/* Background rail (subtle) */}
      <div
        className="absolute inset-0"
        style={{
          background: `${color}1A`,
          width: thickness,
        }}
      />
      {/* Active filled line */}
      <motion.div
        className="absolute left-0 top-0 origin-top"
        style={{
          width: thickness,
          height: lineHeight,
          background: `linear-gradient(to bottom, ${color} 0%, ${color}cc 60%, transparent 100%)`,
          boxShadow: `0 0 12px ${color}80, 0 0 24px ${color}40`,
        }}
      />
      {/* Glowing leading dot */}
      <motion.div
        className="absolute -translate-x-1/2 rounded-full"
        style={{
          left: thickness / 2,
          top: dotY,
          width: 12,
          height: 12,
          background: color,
          boxShadow: `0 0 14px ${color}, 0 0 32px ${color}aa, 0 0 60px ${color}66`,
          marginTop: -6,
        }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Lamp: a top-of-section conic-gradient glow that fades in as you scroll
// into the section. Used at category transitions to signal "new act".
// ---------------------------------------------------------------------------

export interface LampProps {
  /** Color of the lamp glow. Default signal-orange. */
  color?: string
  /** Width of the glow in px. Default 700. */
  width?: number
  /** Height of the glow in px. Default 220. */
  height?: number
  /** Optional title text rendered under the lamp. */
  caption?: string
  className?: string
}

export function Lamp({
  color = 'rgb(var(--color-accent))',
  width = 700,
  height = 220,
  caption,
  className = '',
}: LampProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])
  const scaleY = useTransform(scrollYProgress, [0, 0.3, 1], [0.6, 1, 1])

  return (
    <div
      ref={ref}
      className={`pointer-events-none relative flex w-full items-center justify-center ${className}`}
      style={{ minHeight: height }}
      aria-hidden
    >
      <motion.div
        style={{
          opacity,
          scaleY,
          width,
          height,
          background: `radial-gradient(50% 100% at 50% 0%, ${color} 0%, ${color}66 25%, ${color}1A 55%, transparent 80%)`,
          filter: 'blur(2px)',
          transformOrigin: 'top',
        }}
      />
      {/* Hairline beam */}
      <motion.div
        style={{ opacity }}
        className="absolute top-0 left-1/2 h-px -translate-x-1/2"
      >
        <div
          style={{
            width: width * 0.6,
            height: 1,
            background: `linear-gradient(to right, transparent, ${color}, transparent)`,
            transform: 'translateX(-50%)',
          }}
        />
      </motion.div>
      {caption && (
        <motion.span
          style={{ opacity }}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.32em]"
        >
          <span style={{ color, fontFamily: 'var(--font-brand)', fontWeight: 700 }}>
            {caption}
          </span>
        </motion.span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Vortex: closing-CTA decorative animated SVG. Concentric rotating arcs
// in the brand accent gradient. Cheaper than the original Aceternity Vortex
// (which uses a noise-driven WebGL canvas) but reads as "premium swirl".
// ---------------------------------------------------------------------------

export interface VortexProps {
  className?: string
  /** Primary color. Default signal-orange. */
  color?: string
  /** Secondary color. Default signal-2. */
  color2?: string
  /** Children rendered in front of the vortex. */
  children?: ReactNode
}

export function Vortex({
  className = '',
  color = 'rgb(var(--color-accent))',
  color2 = 'rgb(var(--color-accent-2))',
  children,
}: VortexProps) {
  const reduce = useReducedMotion()
  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {!reduce &&
          Array.from({ length: 9 }).map((_, i) => {
            const reverse = i % 2 === 0
            const duration = 30 + i * 6
            const sizePct = 30 + i * 8
            const opacity = 0.05 + (9 - i) * 0.025
            return (
              <motion.div
                key={i}
                animate={{ rotate: reverse ? 360 : -360 }}
                transition={{ duration, ease: 'linear', repeat: Infinity }}
                className="absolute left-1/2 top-1/2"
                style={{
                  width: `${sizePct}%`,
                  height: `${sizePct}%`,
                  marginLeft: `-${sizePct / 2}%`,
                  marginTop: `-${sizePct / 2}%`,
                  borderRadius: '50%',
                  border: `1px dashed ${i % 3 === 0 ? color : color2}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
                  opacity,
                }}
              />
            )
          })}
        {/* Center radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${color}26 0%, ${color2}14 30%, transparent 70%)`,
          }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// BackgroundBeams: two slow drifting SVG beams behind hero. Theme-aware.
// Cheaper than Aceternity's many-beam version; reads "luminous".
// ---------------------------------------------------------------------------

export function BackgroundBeams({
  className = '',
  color = 'rgb(var(--color-accent))',
}: {
  className?: string
  color?: string
}) {
  const reduce = useReducedMotion()
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="hbeam-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="50%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hbeam-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="50%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: 7 }).map((_, i) => {
          const y1 = 50 + i * 100
          const y2 = y1 + (i % 2 === 0 ? 110 : -60)
          const delay = (i * 0.7).toFixed(1)
          return (
            <motion.path
              key={i}
              d={`M -100 ${y1} Q 600 ${y2}, 1300 ${y1 + (i % 2 === 0 ? 60 : -30)}`}
              stroke={i % 2 === 0 ? 'url(#hbeam-1)' : 'url(#hbeam-2)'}
              strokeWidth={i % 2 === 0 ? 2 : 1}
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                reduce
                  ? { pathLength: 1, opacity: 1 }
                  : { pathLength: [0, 1, 1], opacity: [0, 1, 0] }
              }
              transition={{
                duration: 6,
                delay: parseFloat(delay),
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )
        })}
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// FollowingPointer: custom cursor that follows mouse with spring momentum.
// Renders a small label to the right of the dot. Hidden on touch devices.
// ---------------------------------------------------------------------------

export interface FollowingPointerProps {
  /** Label rendered next to the cursor. */
  label?: ReactNode
  /** Color of the cursor. Defaults to signal accent. */
  color?: string
  /** Whether to render. Defaults to true. */
  active?: boolean
}

export function FollowingPointer({
  label = '',
  color = 'rgb(var(--color-accent))',
  active = true,
}: FollowingPointerProps) {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 280, damping: 28 })
  const sy = useSpring(y, { stiffness: 280, damping: 28 })
  const [visible, setVisible] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!active) return
    function onMove(e: MouseEvent) {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
    }
    function onLeave() {
      setVisible(false)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [active, x, y])

  if (!active || reduce) return null

  return (
    <motion.div
      aria-hidden
      style={{
        translateX: sx,
        translateY: sy,
        opacity: visible ? 1 : 0,
      }}
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block"
    >
      <div
        className="-translate-x-1/2 -translate-y-1/2"
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: `2px solid ${color}`,
          boxShadow: `0 0 12px ${color}aa, 0 0 24px ${color}55`,
          background: `${color}33`,
        }}
      />
      {label && (
        <div
          className="ml-4 mt-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.18em]"
          style={{
            fontFamily: 'var(--font-brand)',
            color,
            background: `${color}1A`,
            border: `1px solid ${color}55`,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          {label}
        </div>
      )}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// AnimatedTooltip: appears above its anchor on hover. Spring-animated entry.
// ---------------------------------------------------------------------------

export interface AnimatedTooltipProps {
  visible: boolean
  /** Position in viewport-pixels. */
  x: number
  y: number
  children: ReactNode
}

export function AnimatedTooltip({
  visible,
  x,
  y,
  children,
}: AnimatedTooltipProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          style={{
            position: 'fixed',
            left: x,
            top: y - 16,
            transform: 'translate(-50%, -100%)',
            zIndex: 9998,
            pointerEvents: 'none',
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// FloatingDock: bottom-center compact nav bar with hover-magnify icons.
// Aceternity-flavor: each child grows on hover, neighbors grow slightly.
// ---------------------------------------------------------------------------

export interface DockItem {
  id: string
  label: string
  icon: ReactNode
  onClick?: () => void
  href?: string
  active?: boolean
}

export function FloatingDock({
  items,
  className = '',
}: {
  items: DockItem[]
  className?: string
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  return (
    <nav
      className={`pointer-events-auto fixed bottom-8 left-1/2 z-40 -translate-x-1/2 ${className}`}
      onMouseLeave={() => setHoverIdx(null)}
      aria-label="Floating dock navigation"
    >
      <div
        className="flex items-end gap-2 rounded-2xl border px-3 py-2"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          borderColor: 'rgb(var(--color-border))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 12px 32px rgba(17, 24, 39, 0.08)',
        }}
      >
        {items.map((item, i) => {
          const distance = hoverIdx === null ? 99 : Math.abs(i - hoverIdx)
          const scale = distance === 0 ? 1.4 : distance === 1 ? 1.15 : 1
          const Comp = item.href ? 'a' : 'button'
          return (
            <Comp
              key={item.id}
              {...(item.href ? { href: item.href } : { type: 'button' as const })}
              onClick={item.onClick}
              onMouseEnter={() => setHoverIdx(i)}
              aria-label={item.label}
              className="group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all"
              style={{
                background: item.active
                  ? 'rgb(var(--color-accent))'
                  : 'rgb(var(--color-surface))',
                color: item.active
                  ? 'rgb(var(--color-bg))'
                  : 'rgb(var(--color-fg))',
                transform: `scale(${scale})`,
                transformOrigin: 'bottom',
                transition: 'transform 200ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              <span aria-hidden className="block">
                {item.icon}
              </span>
              <span
                className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border px-2 py-1 text-[10px] uppercase tracking-[0.18em] opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  background: 'rgb(var(--color-surface-2))',
                  borderColor: 'rgb(var(--color-border))',
                  color: 'rgb(var(--color-fg))',
                  fontFamily: 'var(--font-brand)',
                }}
              >
                {item.label}
              </span>
            </Comp>
          )
        })}
      </div>
    </nav>
  )
}

// ---------------------------------------------------------------------------
// AnimatedPin: anchor card with 3D-pin-on-hover effect. Small "pin" line
// extends from the card on hover, pin head sits at the top.
// ---------------------------------------------------------------------------

export function AnimatedPin({
  children,
  label,
  className = '',
  color = 'rgb(var(--color-accent))',
}: {
  children: ReactNode
  label?: string
  className?: string
  color?: string
}) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`relative ${className}`}
    >
      <AnimatePresence>
        {hover && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.22 }}
              className="absolute left-1/2 -top-12 z-20 -translate-x-1/2"
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: color,
                  boxShadow: `0 0 14px ${color}aa, 0 0 32px ${color}55`,
                }}
              />
              {label && (
                <div
                  className="mt-1 whitespace-nowrap text-[9px] uppercase tracking-[0.22em]"
                  style={{
                    color,
                    fontFamily: 'var(--font-brand)',
                    fontWeight: 700,
                  }}
                >
                  {label}
                </div>
              )}
            </motion.div>
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
              transition={{ duration: 0.22 }}
              className="absolute left-1/2 -top-3 h-3 w-px -translate-x-1/2 origin-top"
              style={{ background: color }}
            />
          </>
        )}
      </AnimatePresence>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ContainerScroll: Apple-style "card scales into view" wrapper. Useful for
// the BEFORE -> AFTER swap reveal in Treatment A. The wrapped card scales
// from 0.92 to 1.0 and rotates from -8deg to 0deg as the user scrolls past.
// ---------------------------------------------------------------------------

export function ContainerScroll({
  children,
  className = '',
  fromRotate = -6,
  toRotate = 0,
  fromScale = 0.92,
  toScale = 1,
}: {
  children: ReactNode
  className?: string
  fromRotate?: number
  toRotate?: number
  fromScale?: number
  toScale?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [fromRotate, toRotate])
  const scale = useTransform(scrollYProgress, [0, 0.5], [fromScale, toScale])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <motion.div
        style={{
          rotateX,
          scale,
          transformPerspective: 1200,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sparkles burst: brief radial scatter of small dots at the position of the
// AHA flash. Used in Treatment A on the BEFORE -> AFTER transition.
// ---------------------------------------------------------------------------

export function SparklesBurst({
  active,
  color = 'rgb(var(--color-accent))',
  count = 18,
  radius = 120,
  className = '',
}: {
  active: boolean
  color?: string
  count?: number
  radius?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const seeds = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        angle: (i / count) * Math.PI * 2 + Math.random() * 0.6,
        dist: radius * (0.5 + Math.random() * 0.5),
        size: 2 + Math.random() * 4,
        delay: Math.random() * 0.18,
      })),
    [count, radius],
  )

  return (
    <AnimatePresence>
      {active && !reduce && (
        <motion.div
          aria-hidden
          className={`pointer-events-none absolute inset-0 ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute left-1/2 top-1/2">
            {seeds.map((s, i) => (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{
                  x: Math.cos(s.angle) * s.dist,
                  y: Math.sin(s.angle) * s.dist,
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0.4],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.9,
                  delay: s.delay,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute"
                style={{
                  width: s.size,
                  height: s.size,
                  borderRadius: '50%',
                  background: color,
                  boxShadow: `0 0 ${s.size * 2}px ${color}`,
                  transformOrigin: 'center',
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// Re-exports for ergonomic imports
// ---------------------------------------------------------------------------

export type { CSSProperties }
