import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'

type Props = {
  /** Total frames in the sequence. The component renders frame N of total. */
  frameCount?: number
  /** Optional URL pattern. If provided, renders <img>; else renders procedural canvas. */
  framePattern?: (i: number) => string
  /** Height in viewport units (e.g., "200vh"). The taller, the slower. Default "200vh". */
  height?: string
  className?: string
  /** Tagline shown over the sequence. */
  label?: string
}

/**
 * ScrollFlipbook — Apple-style scroll-driven frame sequence.
 *
 * As you scroll through the sticky container, the displayed frame cycles
 * through the sequence. Without real frames (no framePattern), draws
 * procedurally on canvas (numbered + colored, theme-aware).
 *
 * Pattern: pin the canvas (sticky), drive frame index from scroll progress.
 * The container's height controls the scroll length.
 */
export function ScrollFlipbook({
  frameCount = 60,
  framePattern,
  height = '200vh',
  className = '',
  label = 'Scroll',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [frame, setFrame] = useState(0)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })
  const frameMV = useTransform(scrollYProgress, [0, 1], [0, frameCount - 1])

  useEffect(() => {
    return frameMV.on('change', (v) => setFrame(Math.round(v)))
  }, [frameMV])

  // Draw the procedural frame if no framePattern
  useEffect(() => {
    if (framePattern) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const W = canvas.clientWidth
    const H = canvas.clientHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    const styles = getComputedStyle(document.documentElement)
    const accent = styles.getPropertyValue('--color-accent').trim() || '242 90 0'
    const accent2 = styles.getPropertyValue('--color-accent-2').trim() || '255 138 61'
    const fg = styles.getPropertyValue('--color-fg').trim() || '255 255 255'

    ctx.clearRect(0, 0, W, H)

    const t = frame / Math.max(frameCount - 1, 1)
    const angle = t * Math.PI * 2

    // Rotating gradient ring
    const cx = W / 2
    const cy = H / 2
    const radius = Math.min(W, H) * 0.35

    ctx.lineWidth = 14
    ctx.strokeStyle = `rgb(${accent} / 0.18)`
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.stroke()

    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, `rgb(${accent})`)
    grad.addColorStop(1, `rgb(${accent2})`)
    ctx.lineWidth = 14
    ctx.strokeStyle = grad
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + angle)
    ctx.stroke()

    // Frame number
    ctx.fillStyle = `rgb(${fg})`
    ctx.font = `700 ${Math.round(radius * 0.7)}px "Space Grotesk", Inter, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(frame).padStart(2, '0'), cx, cy)

    // Frame counter caption
    ctx.fillStyle = `rgb(${fg} / 0.5)`
    ctx.font = `500 12px "JetBrains Mono", monospace`
    ctx.textAlign = 'center'
    ctx.fillText(`FRAME ${frame + 1} / ${frameCount}`, cx, cy + radius + 30)
  }, [frame, frameCount, framePattern])

  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ height }}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full max-w-7xl mx-auto">
          {framePattern ? (
            <img
              src={framePattern(frame)}
              alt={`Frame ${frame + 1}`}
              className="w-full h-full object-contain"
            />
          ) : (
            <canvas ref={canvasRef} className="w-full h-full" aria-hidden />
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 font-mono text-xs uppercase tracking-[0.3em]"
            style={{ color: 'rgb(var(--color-fg-subtle))' }}
          >
            {label} ↓
          </motion.div>
        </div>
      </div>
    </div>
  )
}
