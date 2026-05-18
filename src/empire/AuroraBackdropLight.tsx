/**
 * AuroraBackdropLight. Round 8 (2026-05-18) port of the editorial-theme
 * aurora backdrop from the pre-round-7 EmpireLanding.tsx.bak.
 *
 * Three soft blurred radial gradients drifting behind the content layer.
 * Paper-cream tinted (multiply blend) so the signal-orange tints the
 * parchment instead of washing out (the dark-theme AuroraOrbs uses screen
 * blend; this is the light counterpart).
 *
 * GPU-cheap, no WebGL. Absolute-positioned, pointer-events: none, low
 * opacity. Honors prefers-reduced-motion by freezing the drift animation
 * but keeping the static color wash.
 *
 * Mounted in src/empire/layouts/EmpireLayout.tsx behind the main content.
 *
 * Hard Rule #11: no em dashes.
 * Context7 (HR #31): react@19.2.5 only. No external imports.
 */

import { useEffect, useState } from 'react'

export function AuroraBackdropLight() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduce(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduce(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return (
    <div
      data-component="aurora-orbs-light"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        mixBlendMode: 'multiply',
      }}
    >
      <style>{`
        @keyframes aurora-drift-a {
          0%, 100% { transform: translate3d(-12%, -8%, 0) scale(1); }
          50%      { transform: translate3d(8%, 6%, 0) scale(1.08); }
        }
        @keyframes aurora-drift-b {
          0%, 100% { transform: translate3d(12%, 10%, 0) scale(1.04); }
          50%      { transform: translate3d(-6%, -10%, 0) scale(0.96); }
        }
        @keyframes aurora-drift-c {
          0%, 100% { transform: translate3d(0, 18%, 0) scale(1); }
          50%      { transform: translate3d(0, -10%, 0) scale(1.1); }
        }
      `}</style>
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '60vw',
          height: '60vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(226, 84, 28, 0.16), transparent 65%)',
          filter: 'blur(80px)',
          animation: reduce ? 'none' : 'aurora-drift-a 22s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '10%',
          right: '-15%',
          width: '55vw',
          height: '55vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200, 154, 60, 0.14), transparent 65%)',
          filter: 'blur(90px)',
          animation: reduce ? 'none' : 'aurora-drift-b 28s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '20%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(78, 138, 220, 0.10), transparent 65%)',
          filter: 'blur(100px)',
          animation: reduce ? 'none' : 'aurora-drift-c 32s ease-in-out infinite',
        }}
      />
    </div>
  )
}

export default AuroraBackdropLight
