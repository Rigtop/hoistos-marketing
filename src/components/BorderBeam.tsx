import { cn } from '../lib/utils'

type Props = {
  className?: string
  /** Beam segment length as percent of perimeter. Default 30. */
  size?: number
  /** Animation duration in seconds. Default 6. */
  duration?: number
  /** Beam color. Default var(--color-accent). */
  colorFrom?: string
  colorTo?: string
}

/**
 * BorderBeam — a rotating gradient border that travels around the parent's edge.
 * Drop inside any positioned container (relative/absolute). Pairs with .card.
 */
export function BorderBeam({
  className,
  size = 30,
  duration = 6,
  colorFrom = 'rgb(var(--color-accent))',
  colorTo = 'rgb(var(--color-accent-2))',
}: Props) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden [border:1px_solid_transparent]',
        className,
      )}
      style={
        {
          '--size': size,
          '--duration': duration,
          '--color-from': colorFrom,
          '--color-to': colorTo,
          maskImage: 'linear-gradient(transparent, transparent), linear-gradient(black, black)',
          maskClip: 'padding-box, border-box',
          maskComposite: 'intersect',
          background:
            `conic-gradient(from calc(var(--beam-angle, 0deg)), transparent 0%, var(--color-from) calc(var(--size) * 0.5%), var(--color-to) var(--size, 30%), transparent calc(var(--size, 30%) + 1%)) border-box`,
          animation: `border-beam-rotate var(--duration)s linear infinite`,
        } as React.CSSProperties
      }
    >
      <style>{`
        @property --beam-angle {
          syntax: '<angle>';
          inherits: false;
          initial-value: 0deg;
        }
        @keyframes border-beam-rotate {
          to { --beam-angle: 360deg; }
        }
      `}</style>
    </div>
  )
}
