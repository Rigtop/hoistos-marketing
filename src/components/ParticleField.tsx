import { useEffect, useRef } from 'react'

type Props = {
  /** Particle count. Default 80. Scales down on mobile. */
  count?: number
  /** Max linking distance in px. Default 140. */
  linkDistance?: number
  /** Particle size px. Default 1.5. */
  size?: number
  /** Speed multiplier. Default 0.4. */
  speed?: number
  className?: string
}

/**
 * ParticleField — pure-canvas particle network.
 * Theme-aware (reads var(--color-accent) on mount).
 * Particles drift, repel cursor, link to neighbors. ~120 lines, zero deps.
 * Drop into a positioned container (relative).
 */
export function ParticleField({
  count = 80,
  linkDistance = 140,
  size = 1.5,
  speed = 0.4,
  className = '',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const isMobile = window.innerWidth < 640
    const N = isMobile ? Math.floor(count * 0.5) : count

    let width = 0
    let height = 0
    let raf = 0

    const styles = getComputedStyle(document.documentElement)
    function readAccent() {
      return styles.getPropertyValue('--color-accent').trim() || '242 90 0'
    }

    type P = { x: number; y: number; vx: number; vy: number }
    const particles: P[] = []

    function resize() {
      const parent = canvas!.parentElement
      if (!parent) return
      const r = parent.getBoundingClientRect()
      width = r.width
      height = r.height
      canvas!.width = width * dpr
      canvas!.height = height * dpr
      canvas!.style.width = `${width}px`
      canvas!.style.height = `${height}px`
      ctx!.scale(dpr, dpr)
    }

    function init() {
      particles.length = 0
      for (let i = 0; i < N; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
        })
      }
    }

    const mouse = { x: -9999, y: -9999 }
    function onMove(e: MouseEvent) {
      const r = canvas!.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    function onLeave() {
      mouse.x = -9999
      mouse.y = -9999
    }

    function tick() {
      ctx!.clearRect(0, 0, width, height)
      const accent = readAccent()

      for (const p of particles) {
        // gentle cursor repulsion
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const d2 = dx * dx + dy * dy
        if (d2 < 10000) {
          const f = (10000 - d2) / 10000 * 0.15
          p.vx += (dx / Math.sqrt(d2 + 0.001)) * f
          p.vy += (dy / Math.sqrt(d2 + 0.001)) * f
        }

        p.x += p.vx
        p.y += p.vy
        // damping toward base speed
        p.vx *= 0.98
        p.vy *= 0.98

        // wrap edges
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        ctx!.fillStyle = `rgb(${accent} / 0.7)`
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, size, 0, Math.PI * 2)
        ctx!.fill()
      }

      // links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < linkDistance) {
            const alpha = (1 - d / linkDistance) * 0.4
            ctx!.strokeStyle = `rgb(${accent} / ${alpha})`
            ctx!.lineWidth = 1
            ctx!.beginPath()
            ctx!.moveTo(a.x, a.y)
            ctx!.lineTo(b.x, b.y)
            ctx!.stroke()
          }
        }
      }

      raf = requestAnimationFrame(tick)
    }

    resize()
    init()
    window.addEventListener('resize', () => {
      resize()
      init()
    })
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [count, linkDistance, size, speed])

  return <canvas ref={canvasRef} className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden />
}
