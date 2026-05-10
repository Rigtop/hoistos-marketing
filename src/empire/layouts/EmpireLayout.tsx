/**
 * EmpireLayout. Shared chrome for every /empire route.
 *
 * Owner: Empire Wireframe S197 (B1 Tab, Phase 2)
 * Routing reference: src/empire/AppRouter.tsx mounts this as the outer layout
 * for all /empire descendants. The data-theme="hoistos-light" wrapper scopes
 * the brand-spec light tokens (paper, ink, signal) per MASTER_PLAN brand block.
 *
 * Header: HoistOS mark + Empire wordmark + a thin signal underline.
 * Footer: copyright + brand stack credit + session affordance.
 *
 * Hard Rule #11: no em dashes anywhere in this file.
 */

import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { clearSession, hasSession } from '../session'

export function EmpireLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  // The /empire surface always renders against the LIGHT brand palette.
  // We set data-theme on documentElement so body bg + cascade match.
  // Returning to / restores hoistos-dark via main.tsx route effect.
  useEffect(() => {
    const prev = document.documentElement.getAttribute('data-theme')
    document.documentElement.setAttribute('data-theme', 'hoistos-light')
    return () => {
      if (prev) document.documentElement.setAttribute('data-theme', prev)
    }
  }, [])

  function handleSignOut() {
    clearSession()
    navigate('/empire/auth/request', { replace: true })
  }

  const onAuthSurface = location.pathname.startsWith('/empire/auth')

  return (
    <div
      data-theme="hoistos-light"
      className="min-h-screen flex flex-col"
      style={{ background: 'rgb(var(--color-bg))', color: 'rgb(var(--color-fg))' }}
    >
      <header
        className="px-[6vw] py-6 flex items-center justify-between border-b"
        style={{ borderColor: 'rgb(var(--color-border))', background: '#f5f4ed' }}
      >
        <Link
          to="/empire"
          className="flex items-center gap-5 group"
          style={{ paddingLeft: 8, paddingTop: 4, paddingBottom: 4, overflow: 'visible' }}
        >
          <img
            src="/brand/empireworks-lockup.png"
            alt="EmpireWorks Reconstruction"
            style={{
              height: 72,
              width: 'auto',
              display: 'block',
              objectFit: 'contain',
              objectPosition: 'left center',
              imageRendering: 'auto',
              padding: '2px 0',
              flexShrink: 0,
            }}
          />
          <span
            aria-hidden="true"
            className="h-7 w-px"
            style={{ background: 'rgba(20,20,19,0.18)' }}
          />
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: "'Newsreader', serif",
              fontSize: 18,
              color: '#3a3a36',
              letterSpacing: '-0.005em',
            }}
          >
            <span style={{ fontStyle: 'italic', color: '#5e5d59' }}>on</span>
            <img
              src="/brand/HoistOS-Lockup-Horizontal.svg"
              alt="HoistOS"
              style={{ height: 22, width: 'auto', display: 'block' }}
            />
          </span>
        </Link>
        <nav
          className="flex items-center gap-8 text-sm"
          style={{ color: '#5e5d59', fontFamily: "'Newsreader', serif" }}
        >
          <Link
            to="/empire"
            style={{ color: '#5e5d59', fontWeight: 500, fontSize: 14 }}
          >
            Overview
          </Link>
          <Link
            to="/empire/timeline"
            style={{ color: '#5e5d59', fontWeight: 500, fontSize: 14 }}
          >
            Timeline
          </Link>
          <Link
            to="/empire/bonus-extras"
            style={{ color: '#5e5d59', fontWeight: 500, fontSize: 14 }}
          >
            Bonus Extras
          </Link>
          <Link
            to="/empire/pack/proposal-builder"
            style={{ color: '#5e5d59', fontWeight: 500, fontSize: 14 }}
          >
            The upgrades
          </Link>
          {!onAuthSurface && hasSession() ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm hover:text-fg transition-colors"
              style={{ color: 'rgb(var(--color-fg-subtle))' }}
            >
              Sign out
            </button>
          ) : null}
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer
        className="px-[6vw] py-10 border-t flex justify-between items-end flex-wrap gap-6"
        style={{
          borderColor: 'rgba(20,20,19,0.1)',
          background: '#efeee5',
          fontFamily: "'Newsreader', serif",
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: '#141413',
            fontStyle: 'italic',
            maxWidth: 720,
            lineHeight: 1.5,
          }}
        >
          The Perennial Empire division{' '}
          <em style={{ color: '#cc6e2e', fontWeight: 500, fontStyle: 'italic' }}>
            AI adoption
          </em>{' '}
          timeline. Built for the VPs of EmpireWorks Reconstruction.
        </div>
        <div
          style={{
            fontSize: 12,
            color: '#9c9b97',
            textAlign: 'right',
            fontVariant: 'small-caps',
            letterSpacing: '0.1em',
          }}
        >
          Created by Eugeen Bernan
        </div>
      </footer>
    </div>
  )
}

export default EmpireLayout
