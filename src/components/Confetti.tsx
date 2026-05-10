import { useEffect, useRef } from 'react'

type Props = {
  /** Trigger value: when this changes, fire a burst. Pass Date.now() to fire. */
  trigger?: number
  /** Particle count per burst. Default 120. */
  count?: number
  /** Origin point. Default center of viewport. */
  origin?: { x: number; y: number }
  /** Initial speed. Default 14. */
  speed?: number
  /** Custom palette. Default theme accent + accent-2 + paper. */
  colors?: string[]
}

type P = {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vrot: number
  size: number
  color: string
  shape: 'square' | 'circle' | 'strip'
  life: number
}

/**
 * Confetti: physics-based particle burst on trigger change.
 *
 * Pure canvas. Gravity + drag + rotation per particle. Three shapes mixed:
 * squares, circles, strips. Theme-aware palette by default.
 *
 * Use for celebrations, on-submit, on-purchase, on-anything-worth-marking.
 *
 * Usage:
 *   const [trigger, setTrigger] = useState(0)
 *   <Confetti trigger={trigger} />
 *   <button onClick={() => setTrigger(Date.now())}>Celebrate</button>
 */
export function Confetti({ trigger, count = 120, origin, speed = 14, colors }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<P[]>([])
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      const dpr = window.devicePixelRatio || 1
      canvas!.width = window.innerWidth * dpr
      canvas!.height = window.innerHeight * dpr
      canvas!.style.width = `${window.innerWidth}px`
      canvas!.style.height = `${window.innerHeight}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    function tick() {
      const w = window.innerWidth
      const h = window.innerHeight
      ctx!.clearRect(0, 0, w, h)

      const particles = particlesRef.current
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.vy += 0.32 // gravity
        p.vx *= 0.99 // drag
        p.vy *= 0.99
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vrot
        p.life -= 0.008

        if (p.life <= 0 || p.y > h + 50) {
          particles.splice(i, 1)
          continue
        }

        ctx!.save()
        ctx!.translate(p.x, p.y)
        ctx!.rotate(p.rot)
        ctx!.globalAlpha = Math.max(0, p.life)
        ctx!.fillStyle = p.color
        if (p.shape === 'circle') {
          ctx!.beginPath()
          ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx!.fill()
        } else if (p.shape === 'strip') {
          ctx!.fillRect(-p.size, -p.size / 4, p.size * 2, p.size / 2)
        } else {
          ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        }
        ctx!.restore()
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  // Fire burst on trigger change
  useEffect(() => {
    if (!trigger) return

    const styles = getComputedStyle(document.documentElement)
    const accent = styles.getPropertyValue('--color-accent').trim() || '242 90 0'
    const accent2 = styles.getPropertyValue('--color-accent-2').trim() || '255 138 61'
    const fg = styles.getPropertyValue('--color-fg').trim() || '255 255 255'

    const palette = colors ?? [`rgb(${accent})`, `rgb(${accent2})`, `rgb(${fg})`]
    const cx = origin?.x ?? window.innerWidth / 2
    const cy = origin?.y ?? window.innerHeight / 2.6

    const shapes: P['shape'][] = ['square', 'circle', 'strip']

    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9
      const v = speed * (0.6 + Math.random() * 0.7)
      particlesRef.current.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.4,
        size: 6 + Math.random() * 10,
        color: palette[Math.floor(Math.random() * palette.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        life: 1,
      })
    }
  }, [trigger, count, origin?.x, origin?.y, speed, colors])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9998]"
      aria-hidden
    />
  )
}
