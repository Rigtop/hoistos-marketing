/**
 * Magic UI flavor primitives, hand-rolled for the HoistOS LIGHT brand.
 *
 * S197 R054 amplification pass. Brand-correct paper + ink + signal-orange
 * versions of Magic UI patterns. All deps are already in the marketing site
 * package (motion, react, lucide-react). No new external imports.
 *
 * Hard Rule #11: zero em dashes.
 */

import {
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  AnimatePresence,
} from 'motion/react'

// ---------------------------------------------------------------------------
// NumberTicker: animated count-up that fires when the element enters view.
// Spring-smoothed; respects prefers-reduced-motion.
// ---------------------------------------------------------------------------

export function NumberTicker({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1.6,
  className = '',
  style,
}: {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, {
    stiffness: 60,
    damping: 22,
    duration: duration * 1000,
  })
  const [display, setDisplay] = useState('0')
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setDisplay(formatNumber(value, decimals))
      return
    }
    motionVal.set(value)
    const unsub = spring.on('change', (latest) => {
      setDisplay(formatNumber(latest, decimals))
    })
    return () => unsub()
  }, [inView, value, decimals, motionVal, spring, reduce])

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}

function formatNumber(n: number, decimals: number): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

// ---------------------------------------------------------------------------
// Marquee: infinite horizontal scroll. Children get cloned so the seam
// is invisible. Pause on hover. Respects reduced motion.
// ---------------------------------------------------------------------------

export interface MarqueeProps {
  children: ReactNode
  /** Duration in seconds for one full lap. Default 28. */
  duration?: number
  /** Reverse direction. */
  reverse?: boolean
  /** Pause on hover. Default true. */
  pauseOnHover?: boolean
  className?: string
}

export function Marquee({
  children,
  duration = 28,
  reverse = false,
  pauseOnHover = true,
  className = '',
}: MarqueeProps) {
  const reduce = useReducedMotion()
  const animDir = reverse ? '-50%' : '0%'
  const animFrom = reverse ? '0%' : '-50%'
  const animClass = pauseOnHover ? 'hover:[animation-play-state:paused]' : ''

  return (
    <div className={`relative flex w-full overflow-hidden ${className}`}>
      <div
        className={`flex shrink-0 items-center gap-8 whitespace-nowrap will-change-transform ${animClass}`}
        style={{
          animation: reduce
            ? 'none'
            : `empire-marquee ${duration}s linear infinite`,
        }}
      >
        <div className="flex shrink-0 items-center gap-8">{children}</div>
        <div aria-hidden className="flex shrink-0 items-center gap-8">
          {children}
        </div>
      </div>
      <style>{`
        @keyframes empire-marquee {
          from { transform: translateX(${animFrom}); }
          to { transform: translateX(${animDir === '0%' ? '-50%' : '0%'}); }
        }
      `}</style>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ShineBorder: animated gradient border on cards. The border travels around
// the perimeter as a conic gradient. Brand colors by default.
// ---------------------------------------------------------------------------

export function ShineBorder({
  children,
  borderRadius = 16,
  borderWidth = 1.5,
  duration = 7,
  color = 'rgb(var(--color-accent))',
  color2 = 'rgb(var(--color-accent-2))',
  className = '',
  style,
}: {
  children: ReactNode
  borderRadius?: number
  borderWidth?: number
  duration?: number
  color?: string
  color2?: string
  className?: string
  style?: React.CSSProperties
}) {
  const reduce = useReducedMotion()
  return (
    <div
      className={`relative ${className}`}
      style={{ borderRadius, ...style }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius,
          padding: borderWidth,
          background: `conic-gradient(from 0deg, transparent 0deg, ${color} 60deg, ${color2} 120deg, transparent 180deg, transparent 360deg)`,
          WebkitMask:
            'linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          animation: reduce
            ? 'none'
            : `empire-shine-rotate ${duration}s linear infinite`,
        }}
      />
      <style>{`
        @keyframes empire-shine-rotate {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className="relative" style={{ borderRadius }}>
        {children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// FlickeringGrid: a canvas-based grid of dots that randomly flicker on and
// off. Premium texture for empty backgrounds.
// ---------------------------------------------------------------------------

export function FlickeringGrid({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.18,
  color = 'rgb(var(--color-accent))',
  maxOpacity = 0.32,
  className = '',
}: {
  squareSize?: number
  gridGap?: number
  flickerChance?: number
  color?: string
  maxOpacity?: number
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let last = performance.now()
    let cols = 0
    let rows = 0
    let opacities: number[] = []

    function resize() {
      if (!canvas) return
      const dpr = window.devicePixelRatio ?? 1
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(w / (squareSize + gridGap))
      rows = Math.ceil(h / (squareSize + gridGap))
      opacities = new Array(cols * rows).fill(0).map(() => Math.random() * maxOpacity)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    function paint(now: number) {
      if (!canvas) return
      const dt = (now - last) / 1000
      last = now
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx!.clearRect(0, 0, w, h)
      for (let i = 0; i < opacities.length; i++) {
        if (!reduce && Math.random() < flickerChance * dt) {
          opacities[i] = Math.random() * maxOpacity
        }
        const c = i % cols
        const r = Math.floor(i / cols)
        const x = c * (squareSize + gridGap)
        const y = r * (squareSize + gridGap)
        ctx!.globalAlpha = opacities[i]
        ctx!.fillStyle = color
        ctx!.fillRect(x, y, squareSize, squareSize)
      }
      raf = requestAnimationFrame(paint)
    }
    raf = requestAnimationFrame(paint)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [squareSize, gridGap, flickerChance, color, maxOpacity, reduce])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`absolute inset-0 h-full w-full ${className}`}
    />
  )
}

// ---------------------------------------------------------------------------
// AuroraText: gradient text with traveling aurora effect. Used on the AHA
// quote line. The aurora moves across the text as a CSS background animation.
// ---------------------------------------------------------------------------

export function AuroraText({
  children,
  duration = 8,
  className = '',
  colors = [
    'rgb(var(--color-accent))',
    'rgb(var(--color-accent-2))',
    'rgb(var(--color-fg))',
    'rgb(var(--color-accent))',
  ],
}: {
  children: ReactNode
  duration?: number
  className?: string
  colors?: string[]
}) {
  const reduce = useReducedMotion()
  const grad = colors.join(', ')
  return (
    <span
      className={`inline-block bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(110deg, ${grad})`,
        backgroundSize: '300% 100%',
        WebkitBackgroundClip: 'text',
        animation: reduce ? 'none' : `empire-aurora-pan ${duration}s ease-in-out infinite`,
      }}
    >
      {children}
      <style>{`
        @keyframes empire-aurora-pan {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </span>
  )
}

// ---------------------------------------------------------------------------
// AnimatedShinyText: subtle traveling shimmer across plain text.
// ---------------------------------------------------------------------------

export function AnimatedShinyText({
  children,
  shimmerWidth = 100,
  className = '',
  duration = 4,
  baseColor = 'rgb(var(--color-fg-muted))',
  shineColor = 'rgb(var(--color-fg))',
}: {
  children: ReactNode
  shimmerWidth?: number
  className?: string
  duration?: number
  baseColor?: string
  shineColor?: string
}) {
  const reduce = useReducedMotion()
  return (
    <span
      className={`inline-block bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(110deg, ${baseColor} 0%, ${baseColor} 45%, ${shineColor} 50%, ${baseColor} 55%, ${baseColor} 100%)`,
        backgroundSize: `${shimmerWidth * 3}% 100%`,
        WebkitBackgroundClip: 'text',
        animation: reduce ? 'none' : `empire-shiny-pan ${duration}s ease-in-out infinite`,
      }}
    >
      {children}
      <style>{`
        @keyframes empire-shiny-pan {
          0%, 100% { background-position: 200% 50%; }
          50% { background-position: 0% 50%; }
        }
      `}</style>
    </span>
  )
}

// ---------------------------------------------------------------------------
// Lens: mouse-following magnifier. Renders a circle that scales the
// underlying content. We use CSS transforms on a duplicate of the children.
// Cheap fallback: just a circle highlight without true magnification.
// ---------------------------------------------------------------------------

export function Lens({
  active = true,
  size = 140,
  color = 'rgb(var(--color-accent))',
  containerRef,
}: {
  active?: boolean
  size?: number
  /** Reserved for future true-magnification mode. */
  zoom?: number
  color?: string
  containerRef?: RefObject<HTMLElement | null>
}) {
  const [pos, setPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: -9999,
    y: -9999,
    visible: false,
  })
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!active) return
    const target = containerRef?.current ?? window
    function onMove(e: MouseEvent) {
      if (containerRef?.current) {
        const r = containerRef.current.getBoundingClientRect()
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top, visible: true })
      } else {
        setPos({ x: e.clientX, y: e.clientY, visible: true })
      }
    }
    function onLeave() {
      setPos((p) => ({ ...p, visible: false }))
    }
    target.addEventListener('mousemove', onMove as EventListener)
    target.addEventListener('mouseleave', onLeave as EventListener)
    return () => {
      target.removeEventListener('mousemove', onMove as EventListener)
      target.removeEventListener('mouseleave', onLeave as EventListener)
    }
  }, [active, containerRef])

  if (!active || reduce) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-30"
      style={{
        left: pos.x - size / 2,
        top: pos.y - size / 2,
        width: size,
        height: size,
        borderRadius: '50%',
        opacity: pos.visible ? 1 : 0,
        transition: 'opacity 200ms',
        backdropFilter: `blur(0px) saturate(1.4) contrast(1.05)`,
        WebkitBackdropFilter: `blur(0px) saturate(1.4) contrast(1.05)`,
        border: `2px solid ${color}`,
        boxShadow: `0 0 24px ${color}66, inset 0 0 24px ${color}33`,
        // Use a CSS scale on a transparent inner; the magnification is
        // accomplished by the surrounding "background-attachment: fixed"
        // trick when content underneath uses fixed bg, otherwise this is
        // a stylized highlight only. Acceptable for SVG charts.
        transform: `scale(1)`,
      }}
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}1A 0%, transparent 60%)`,
        }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// OrbitingCircles: decorative rings of orbiting elements.
// ---------------------------------------------------------------------------

export function OrbitingCircles({
  children,
  radius = 120,
  duration = 18,
  reverse = false,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  radius?: number
  duration?: number
  reverse?: boolean
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${className}`}
      style={{ width: radius * 2, height: radius * 2 }}
    >
      <div
        className="absolute inset-0 rounded-full border"
        style={{
          borderColor: 'rgb(var(--color-border))',
          borderStyle: 'dashed',
          opacity: 0.3,
        }}
      />
      <motion.div
        className="absolute inset-0"
        animate={reduce ? {} : { rotate: reverse ? -360 : 360 }}
        transition={{ duration, ease: 'linear', repeat: Infinity, delay }}
      >
        <div
          className="absolute"
          style={{ top: 0, left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          {children}
        </div>
      </motion.div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// BoxReveal: sliding bar that wipes off the children on viewport entry.
// ---------------------------------------------------------------------------

export function BoxReveal({
  children,
  color = 'rgb(var(--color-accent))',
  duration = 0.65,
  className = '',
}: {
  children: ReactNode
  color?: string
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  return (
    <div ref={ref} className={`relative inline-block overflow-hidden ${className}`}>
      <motion.span
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: duration * 0.6, delay: duration * 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="inline-block"
      >
        {children}
      </motion.span>
      <motion.span
        aria-hidden
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: [0, 1, 1, 0] } : {}}
        transition={{
          duration,
          times: [0, 0.5, 0.55, 1],
          ease: [0.16, 1, 0.3, 1],
        }}
        className="absolute inset-0 origin-left"
        style={{ background: color }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// MorphingText: cycles through a list of strings with a soft crossfade.
// Used for the hero subtitle to add motion.
// ---------------------------------------------------------------------------

export function MorphingText({
  texts,
  interval = 2800,
  className = '',
  style,
}: {
  texts: string[]
  interval?: number
  className?: string
  style?: React.CSSProperties
}) {
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()
  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => setI((p) => (p + 1) % texts.length), interval)
    return () => clearInterval(id)
  }, [interval, texts.length, reduce])
  return (
    <span className={`relative inline-block ${className}`} style={style}>
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 6, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, filter: 'blur(6px)' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {texts[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

// ---------------------------------------------------------------------------
// AnimatedGradientText: soft animated gradient on text. For micro-CTAs.
// ---------------------------------------------------------------------------

export function AnimatedGradientText({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-block bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(110deg, rgb(var(--color-fg)) 0%, rgb(var(--color-accent)) 50%, rgb(var(--color-fg)) 100%)',
        backgroundSize: '200% auto',
        animation: 'empire-grad-pan 5s ease-in-out infinite',
        WebkitBackgroundClip: 'text',
      }}
    >
      {children}
      <style>{`
        @keyframes empire-grad-pan {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 200% center; }
        }
      `}</style>
    </span>
  )
}

// ---------------------------------------------------------------------------
// DotPattern / GridPattern: subtle SVG backgrounds.
// ---------------------------------------------------------------------------

export function DotPattern({
  className = '',
  dotSize = 1,
  spacing = 22,
  color = 'rgb(var(--color-fg-muted))',
  opacity = 0.18,
}: {
  className?: string
  dotSize?: number
  spacing?: number
  color?: string
  opacity?: number
}) {
  const id = useRef(`dotpat-${Math.random().toString(36).slice(2, 9)}`).current
  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ opacity }}
    >
      <defs>
        <pattern id={id} width={spacing} height={spacing} patternUnits="userSpaceOnUse">
          <circle cx={spacing / 2} cy={spacing / 2} r={dotSize} fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

export function GridPattern({
  className = '',
  cell = 64,
  color = 'rgb(var(--color-fg-muted))',
  opacity = 0.06,
}: {
  className?: string
  cell?: number
  color?: string
  opacity?: number
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        opacity,
        backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
        backgroundSize: `${cell}px ${cell}px`,
      }}
    />
  )
}

// ---------------------------------------------------------------------------
// AnimatedBeamSvg: simpler SVG path beam between two points (for radial
// dependency edges in Treatment C). The dash flows along the path.
// ---------------------------------------------------------------------------

export function AnimatedBeamSvg({
  d,
  color = 'rgb(var(--color-accent))',
  duration = 2.4,
  width = 1.5,
  opacity = 1,
  delay = 0,
  reverse = false,
}: {
  d: string
  color?: string
  duration?: number
  width?: number
  opacity?: number
  delay?: number
  reverse?: boolean
}) {
  const reduce = useReducedMotion()
  if (reduce) {
    return (
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeOpacity={opacity}
      />
    )
  }
  return (
    <>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeOpacity={opacity * 0.35}
      />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width * 1.2}
        strokeOpacity={opacity}
        strokeLinecap="round"
        strokeDasharray="8 14"
        style={{
          animation: `empire-dash-flow ${duration}s linear ${delay}s infinite ${reverse ? 'reverse' : 'normal'}`,
        }}
      />
      <style>{`
        @keyframes empire-dash-flow {
          to { stroke-dashoffset: -22; }
        }
      `}</style>
    </>
  )
}

// ---------------------------------------------------------------------------
// Particles: lightweight canvas particles. Drift up, fade out.
// ---------------------------------------------------------------------------

export function Particles({
  count = 60,
  color = 'rgb(var(--color-accent))',
  speed = 0.5,
  className = '',
}: {
  count?: number
  color?: string
  speed?: number
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let parts: { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number }[] = []

    function resize() {
      if (!canvas) return
      const dpr = window.devicePixelRatio ?? 1
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    function spawn() {
      if (!canvas) return
      parts.push({
        x: Math.random() * canvas.clientWidth,
        y: canvas.clientHeight + 8,
        vx: (Math.random() - 0.5) * 0.3 * speed,
        vy: -(0.3 + Math.random() * 0.7) * speed,
        r: 0.6 + Math.random() * 1.4,
        life: 0,
        max: 220 + Math.random() * 380,
      })
    }
    for (let i = 0; i < count / 3; i++) spawn()

    function tick() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
      if (!reduce && parts.length < count) spawn()
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]
        p.life += 1
        p.x += p.vx
        p.y += p.vy
        const fade = Math.min(1, p.life / 30) * Math.max(0, 1 - p.life / p.max)
        ctx.globalAlpha = fade * 0.9
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
        if (p.life > p.max || p.y < -10) parts.splice(i, 1)
      }
      raf = requestAnimationFrame(tick)
    }
    if (!reduce) raf = requestAnimationFrame(tick)
    else tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [count, color, speed, reduce])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`absolute inset-0 h-full w-full ${className}`}
    />
  )
}

// ---------------------------------------------------------------------------
// BlurFade: lightweight viewport-entry fade + lift + blur lift. Wrapper.
// ---------------------------------------------------------------------------

export function BlurFade({
  children,
  delay = 0,
  duration = 0.7,
  yOffset = 16,
  blur = 8,
  className = '',
  inViewMargin = '0px 0px -10% 0px',
}: {
  children: ReactNode
  delay?: number
  duration?: number
  yOffset?: number
  blur?: number
  className?: string
  inViewMargin?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: inViewMargin as any })
  const reduce = useReducedMotion()
  return (
    <motion.div
      ref={ref}
      initial={
        reduce
          ? { opacity: 1 }
          : { opacity: 0, y: yOffset, filter: `blur(${blur}px)` }
      }
      animate={
        inView
          ? { opacity: 1, y: 0, filter: 'blur(0px)' }
          : reduce
            ? { opacity: 1 }
            : { opacity: 0, y: yOffset, filter: `blur(${blur}px)` }
      }
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// PaperGlobe: a paper-tinted concentric arc system, evokes a globe slowly
// rotating. Lighter than `cobe` (which we deliberately avoid pulling in).
// ---------------------------------------------------------------------------

export function PaperGlobe({
  size = 520,
  color = 'rgb(var(--color-accent))',
  className = '',
}: {
  size?: number
  color?: string
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <div
      aria-hidden
      className={`pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    >
      <motion.div
        animate={reduce ? {} : { rotate: 360 }}
        transition={{ duration: 60, ease: 'linear', repeat: Infinity }}
        className="relative h-full w-full rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 30%, ${color}26 0%, ${color}14 30%, transparent 65%)`,
          border: `1px solid ${color}33`,
          boxShadow: `0 0 60px ${color}1A`,
        }}
      >
        {/* Latitude lines */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`lat-${i}`}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{
              width: '94%',
              height: `${20 + i * 18}%`,
              borderColor: `${color}1A`,
              borderStyle: 'dashed',
            }}
          />
        ))}
        {/* Longitude lines */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`lng-${i}`}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{
              width: `${20 + i * 18}%`,
              height: '94%',
              borderColor: `${color}14`,
            }}
          />
        ))}
        {/* Highlight */}
        <div
          className="absolute left-1/4 top-1/4 h-1/3 w-1/3 rounded-full"
          style={{
            background: `radial-gradient(circle, ${color}22 0%, transparent 60%)`,
            filter: 'blur(20px)',
          }}
        />
      </motion.div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Decision-Log quote roster: fixed inline data so Marquee can render
// rotating Eugeen quotes at the bottom of treatments. Real wiring to the
// Decision Log can replace this in B3.
// ---------------------------------------------------------------------------

export const EUGEEN_QUOTE_ROSTER: { id: string; quote: string; tag: string }[] = [
  { id: 'q1', quote: 'Identity, rules, and routing belong in a single read-first contract.', tag: 'Operating Constitution' },
  { id: 'q2', quote: 'A skill is just a versioned, triggered, evaluatable prompt with structured I/O.', tag: 'Skill substrate' },
  { id: 'q3', quote: 'One brain across three surfaces.', tag: 'Code + Bernie + Cowork' },
  { id: 'q4', quote: 'The corpus needs a search surface the model treats as a tool, not context.', tag: 'RAG + pgvector' },
  { id: 'q5', quote: 'A studio-grade template is the right floor for any visual.', tag: 'Visual stack' },
  { id: 'q6', quote: 'A session has a beginning and an end, or it is a leak.', tag: 'Session close' },
  { id: 'q7', quote: 'Rules need an authority hierarchy and a propagation ledger.', tag: 'Hard Rules' },
  { id: 'q8', quote: 'Drift is the default. Hooks make the floor.', tag: 'Pre/PostToolUse hooks' },
  { id: 'q9', quote: 'Done equals post-verify PASS, never API 200.', tag: 'Notion write gate' },
]
