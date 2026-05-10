type Props = {
  className?: string
  /** Opacity 0-1. Default 0.04. */
  opacity?: number
  /** Base frequency for SVG turbulence. Default 0.85 (fine grain). */
  frequency?: number
}

/**
 * NoiseTexture — SVG turbulence overlay for tactile, "filmic" surface texture.
 * Lifts flat dark backgrounds without adding visible artifacts. Used by
 * studios like Active Theory + Studio Freight as a polish layer.
 *
 * Drop as last child of a positioned container (fixed inset-0 + pointer-events-none).
 */
export function NoiseTexture({ className = '', opacity = 0.04, frequency = 0.85 }: Props) {
  const id = `noise-${Math.random().toString(36).slice(2, 9)}`
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 mix-blend-overlay ${className}`}
      style={{ opacity }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency={frequency} numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
    </div>
  )
}
