/**
 * Application entry.
 *
 * Owner: Empire Wireframe S197 (B1 Tab, Phase 2)
 * Routing reference: src/empire/AppRouter.tsx defines the route table.
 *
 * Top-level wiring (in order):
 *   1. <BrowserRouter>          : React Router DOM v7 history mode for SPA.
 *   2. <RootLenisProvider>      : Lenis smooth scroll, applies to whole app.
 *   3. <Toaster>                : react-hot-toast root toaster.
 *   4. <Analytics>              : Vercel Analytics page-view tracker.
 *   5. <AppRouter>              : Routes config (showcase + /empire surfaces).
 *
 * The data-theme attribute on documentElement is managed by
 * AppRouter > ThemeRouteSync, which sets "hoistos-light" on /empire and
 * "hoistos-dark" on /. Initial bootstrap below picks the right value before
 * the router mounts to avoid a one-frame paint flash.
 */

import { StrictMode, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'
import Lenis from 'lenis'
import './index.css'
import { AppRouter } from './empire/AppRouter'

// Pre-router theme bootstrap. Avoids initial-paint flash when landing on /empire.
const initialPath = window.location.pathname
document.documentElement.setAttribute(
  'data-theme',
  initialPath.startsWith('/empire') ? 'hoistos-light' : 'hoistos-dark',
)

/**
 * RootLenisProvider. Wires Lenis at the very top of the React tree so smooth
 * scroll applies to both / and /empire. The existing showcase had its own
 * LenisProvider inside App.tsx; that component is still imported by App but
 * becomes a no-op-on-second-mount (Lenis instance + raf loop runs once at the
 * root). Phase 2 leaves App.tsx unchanged per "do not break existing landing"
 * to keep the diff reviewable; the inner Lenis is harmless overhead until
 * App.tsx is touched in a follow-up.
 */
function RootLenisProvider({ children }: { children: React.ReactNode }) {
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    // Honor prefers-reduced-motion: skip Lenis entirely so user gets native scroll.
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      return // skip the smooth-scroll layer
    }

    // lerp-based config feels noticeably more responsive than duration-based.
    // 0.08 = responsive but smooth; 0.1 (default) = slightly draggy at 60fps;
    // 0.06 = aggressive, can feel twitchy. 0.085 sits in the sweet spot.
    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      syncTouch: true,
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
  }, [])

  return <>{children}</>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <RootLenisProvider>
        <Toaster
          position="top-right"
          gutter={10}
          toastOptions={{
            duration: 4500,
            style: {
              background: 'rgb(var(--color-surface-2))',
              color: 'rgb(var(--color-fg))',
              border: '1px solid rgb(var(--color-border))',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: 'rgb(var(--color-accent))',
                secondary: 'rgb(var(--color-bg))',
              },
            },
            error: {
              iconTheme: {
                primary: 'rgb(var(--color-accent))',
                secondary: 'rgb(var(--color-bg))',
              },
            },
          }}
        />
        <Analytics />
        <AppRouter />
      </RootLenisProvider>
    </BrowserRouter>
  </StrictMode>,
)
