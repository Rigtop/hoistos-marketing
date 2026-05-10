import { cn } from '../lib/utils'

type Props = {
  children: React.ReactNode
  className?: string
  /** Animation duration in seconds. Default 6. */
  duration?: number
  /** Override colors. Default uses theme accent + accent-2. */
  from?: string
  via?: string
  to?: string
}

/**
 * GradientText — animated gradient text via background-clip.
 * Theme-aware default colors; cycles indefinitely.
 */
export function GradientText({ children, className, duration = 6, from, via, to }: Props) {
  const c1 = from ?? 'rgb(var(--color-accent))'
  const c2 = via ?? 'rgb(var(--color-accent-2))'
  const c3 = to ?? 'rgb(var(--color-accent))'

  return (
    <span
      className={cn('inline-block bg-clip-text text-transparent', className)}
      style={{
        backgroundImage: `linear-gradient(90deg, ${c1}, ${c2}, ${c3})`,
        backgroundSize: '200% 100%',
        animation: `gradient-text-shift ${duration}s linear infinite`,
        WebkitBackgroundClip: 'text',
      }}
    >
      <style>{`
        @keyframes gradient-text-shift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
      {children}
    </span>
  )
}
