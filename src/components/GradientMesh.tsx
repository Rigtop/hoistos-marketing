type Props = {
  className?: string
  /** Animation cycle in seconds. Default 24. */
  duration?: number
}

/**
 * GradientMesh — animated multicolor gradient mesh background.
 * Five overlapping radial gradients drifting on slow CSS animations.
 * Theme-aware: uses var(--color-accent), --color-accent-2, --color-fg-subtle.
 *
 * Heavier than AuroraOrbs (5 vs 3 blobs, more saturation). Use as a
 * standalone hero or product-shot backdrop, not over content.
 */
export function GradientMesh({ className = '', duration = 24 }: Props) {
  const id = Math.random().toString(36).slice(2, 9)
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <style>{`
        @keyframes mesh-${id}-1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-80px, 60px) scale(1.15); } }
        @keyframes mesh-${id}-2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(100px, -40px) scale(1.2); } }
        @keyframes mesh-${id}-3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px, 80px) scale(0.9); } }
        @keyframes mesh-${id}-4 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-50px, -70px) scale(1.1); } }
        @keyframes mesh-${id}-5 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(70px, 40px) scale(1.05); } }
      `}</style>
      <div
        className="absolute -top-1/4 -left-1/4 w-[140%] h-[140%]"
        style={{
          background: `
            radial-gradient(ellipse 50% 40% at 20% 30%, rgb(var(--color-accent) / 0.5), transparent 60%),
            radial-gradient(ellipse 40% 50% at 80% 20%, rgb(var(--color-accent-2) / 0.4), transparent 60%),
            radial-gradient(ellipse 60% 50% at 50% 80%, rgb(var(--color-fg-subtle) / 0.25), transparent 60%),
            radial-gradient(ellipse 30% 40% at 90% 70%, rgb(var(--color-accent) / 0.35), transparent 60%),
            radial-gradient(ellipse 40% 30% at 10% 90%, rgb(var(--color-accent-2) / 0.3), transparent 60%)
          `,
          filter: 'blur(60px)',
          animation: `mesh-${id}-1 ${duration}s ease-in-out infinite`,
        }}
      />
    </div>
  )
}
