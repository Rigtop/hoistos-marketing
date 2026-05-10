import { useEffect, useRef, useState } from 'react'

type Props = {
  children: React.ReactNode
  className?: string
  /** Variable axis to interpolate. Default 'wght'. */
  axis?: 'wght' | 'wdth' | 'slnt' | 'opsz'
  /** Min and max axis values. Default [100, 900] for weight. */
  range?: [number, number]
  /** Variable font family. Default 'Inter Variable' (load via @font-face if not present). */
  fontFamily?: string
}

/**
 * VariableScrollText: text whose font-variation axis interpolates with scroll.
 *
 * Tracks element position in viewport and maps scroll progress to the
 * specified font axis range. Uses a variable font (Inter Variable by default).
 *
 * The 2026 typography move. Awwwards SOTYs use this for typographic-accordion
 * narrative effect.
 */
export function VariableScrollText({
  children,
  className = '',
  axis = 'wght',
  range = [100, 900],
  fontFamily = 'Inter Variable, Inter, sans-serif',
}: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(range[0])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    function update() {
      const rect = el!.getBoundingClientRect()
      const vh = window.innerHeight
      const progress = Math.max(0, Math.min(1, 1 - (rect.top + rect.height / 2) / vh + 0.3))
      const v = range[0] + (range[1] - range[0]) * progress
      setValue(v)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [range[0], range[1]])

  return (
    <span
      ref={ref}
      className={className}
      style={{
        fontFamily,
        fontVariationSettings: `"${axis}" ${value}`,
        transition: 'font-variation-settings 0.05s linear',
      }}
    >
      {children}
    </span>
  )
}
