import { useRef, useState, useEffect } from 'react'

type Props = {
  children: React.ReactNode
  className?: string
  /** Spotlight radius in px. Defaults to 350. */
  size?: number
  /** Color override. Defaults to var(--color-accent). */
  color?: string
}

/**
 * Spotlight — a cursor-following radial gradient overlay.
 * Wraps children, mounts a tracking layer behind them.
 * Theme-aware via var(--color-accent) by default.
 */
export function Spotlight({ children, className = '', size = 350, color }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: -9999, y: -9999, opacity: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    function onMove(e: MouseEvent) {
      const r = el!.getBoundingClientRect()
      setPos({ x: e.clientX - r.left, y: e.clientY - r.top, opacity: 1 })
    }
    function onLeave() {
      setPos((p) => ({ ...p, opacity: 0 }))
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  const accent = color ?? 'rgb(var(--color-accent) / 0.18)'

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: pos.opacity,
          background: `radial-gradient(${size}px circle at ${pos.x}px ${pos.y}px, ${accent}, transparent 60%)`,
        }}
      />
      {children}
    </div>
  )
}
