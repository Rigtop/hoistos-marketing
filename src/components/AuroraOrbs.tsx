/**
 * AuroraOrbs — three blurred radial gradients drifting on slow CSS animations.
 * GPU-cheap depth without WebGL. Theme-aware (uses var(--color-accent)).
 */
export function AuroraOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
      <div
        className="absolute -top-[10%] -right-[8%] h-[600px] w-[600px] rounded-full opacity-50 mix-blend-screen animate-drift"
        style={{
          background:
            'radial-gradient(circle, rgb(var(--color-accent) / 0.95), transparent 70%)',
          filter: 'blur(120px)',
        }}
      />
      <div
        className="absolute -bottom-[15%] -left-[10%] h-[500px] w-[500px] rounded-full opacity-50 mix-blend-screen animate-drift"
        style={{
          background:
            'radial-gradient(circle, rgb(var(--color-accent-2) / 0.55), transparent 70%)',
          filter: 'blur(120px)',
          animationDuration: '22s',
          animationDelay: '-3s',
        }}
      />
      <div
        className="absolute top-[30%] left-[20%] h-[400px] w-[400px] rounded-full opacity-40 mix-blend-screen animate-drift"
        style={{
          background:
            'radial-gradient(circle, rgb(var(--color-accent) / 0.35), transparent 70%)',
          filter: 'blur(120px)',
          animationDuration: '26s',
          animationDelay: '-6s',
        }}
      />
    </div>
  )
}
