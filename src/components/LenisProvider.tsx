import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

/**
 * LenisProvider — wires Studio Freight / darkroom.engineering's Lenis smooth scroll
 * at the document root. The 2026 Awwwards-tier baseline.
 *
 * Why: native scroll on macOS is choppy on dark backgrounds. Lenis adds inertial
 * easing without breaking sticky positioning or IntersectionObserver. 3KB.
 *
 * Drop once at the App root. Affects whole document. Disable via prop for
 * sections that need native scroll (modals, virtualized lists).
 */
export function LenisProvider({ children, enabled = true }: { children: React.ReactNode; enabled?: boolean }) {
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    })

    function raf(time: number) {
      lenis.raf(time)
      rafRef.current = requestAnimationFrame(raf)
    }
    rafRef.current = requestAnimationFrame(raf)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lenis.destroy()
    }
  }, [enabled])

  return <>{children}</>
}
