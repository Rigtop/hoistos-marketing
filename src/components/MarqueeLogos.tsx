import { cn } from '../lib/utils'

type Props = {
  items: { label: string; icon?: React.ReactNode }[]
  className?: string
  /** Animation duration in seconds (full loop). Default 40. */
  duration?: number
  /** Direction of scroll. */
  direction?: 'left' | 'right'
  /** Pause on hover. Default true. */
  pauseOnHover?: boolean
}

/**
 * MarqueeLogos — bidirectional logo cloud / quote strip.
 * Pure CSS animation, GPU-accelerated, theme-aware.
 * Use as a "trusted by" / brand-name strip / quote rotation.
 */
export function MarqueeLogos({
  items,
  className = '',
  duration = 40,
  direction = 'left',
  pauseOnHover = true,
}: Props) {
  const animationName = direction === 'left' ? 'marquee-scroll-left' : 'marquee-scroll-right'

  return (
    <div className={cn('relative overflow-hidden py-4', className)}>
      <style>{`
        @keyframes marquee-scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .marquee-fade-mask {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
      <div className="marquee-fade-mask">
        <div
          className={cn('flex gap-12 whitespace-nowrap items-center', pauseOnHover && 'hover:[animation-play-state:paused]')}
          style={{
            animation: `${animationName} ${duration}s linear infinite`,
            width: 'max-content',
          }}
        >
          {[...items, ...items].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 text-base font-medium opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: 'rgb(var(--color-fg-muted))' }}
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
