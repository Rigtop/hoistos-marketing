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
          {/* EmpireWorks lockup as inline SVG. PNG path was creating
              perception-clipping issues (transparent padding invisible
              against cream page bg) and CDN cache headaches. Inline SVG
              gives 100% pixel control, no cache, no PNG dependency. */}
          <EmpireWorksLockupSVG />
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
            to="/empire/foundation"
            style={{ color: '#5e5d59', fontWeight: 500, fontSize: 14 }}
          >
            Foundation
          </Link>
          <Link
            to="/empire/bonus-extras"
            style={{ color: '#5e5d59', fontWeight: 500, fontSize: 14 }}
          >
            Advanced
          </Link>
          <Link
            to="/empire/timeline"
            style={{ color: '#5e5d59', fontWeight: 500, fontSize: 14 }}
          >
            Timeline
          </Link>
          <a
            href="https://calendly.com/eugeenbernan"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#fbfaf3',
              fontWeight: 600,
              fontSize: 14,
              background: '#cc6e2e',
              padding: '6px 14px',
              borderRadius: 999,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(204,110,46,0.28)',
            }}
          >
            Book a walkthrough
          </a>
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
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 12,
            color: '#9c9b97',
            fontVariant: 'small-caps',
            letterSpacing: '0.1em',
          }}
        >
          <span>Created by Eugeen Bernan</span>
          <a
            href="https://www.linkedin.com/in/eugeenbernan/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Eugeen Bernan on LinkedIn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '1px solid rgba(20,20,19,0.18)',
              color: '#5e5d59',
              textDecoration: 'none',
              transition: 'color 200ms, background 200ms, border-color 200ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#cc6e2e'
              e.currentTarget.style.background = 'rgba(204,110,46,0.08)'
              e.currentTarget.style.borderColor = 'rgba(204,110,46,0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#5e5d59'
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(20,20,19,0.18)'
            }}
          >
            {/* Inline LinkedIn glyph. lucide-react v1.14 does not ship a
                LinkedIn icon, so the SVG path is hand-rolled. Stable. */}
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ width: 14, height: 14 }}
              aria-hidden="true"
            >
              <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 11.01-4.13 2.07 2.07 0 010 4.13zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.22.79 24 1.77 24h20.45C23.2 24 24 23.22 24 22.27V1.72C24 .77 23.2 0 22.22 0z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// EmpireWorksLockupSVG. Inline SVG version of the EmpireWorks Reconstruction
// lockup. Authored from scratch so we have 100% pixel control: no PNG cache,
// no transparent-padding-perception issues, no CDN edge-cache gotchas.
//
// Composition (matches the canonical PNG at empireworks.com):
//   - Three-color flag mark (yellow + red + blue triangles) above the text
//   - "EmpireWorks" wordmark in bold sans-serif (uses Inter Black via font-family)
//   - Yellow horizontal rule between EmpireWorks and RECONSTRUCTION
//   - "RECONSTRUCTION" subtype in bold uppercase with letter-spacing
//
// viewBox sized so artwork has 12% padding on every side, guaranteeing
// visible breathing room without any CSS wrapper.
// ---------------------------------------------------------------------------

function EmpireWorksLockupSVG() {
  return (
    <svg
      viewBox="0 0 480 240"
      role="img"
      aria-label="EmpireWorks Reconstruction"
      style={{ height: 56, width: 'auto', display: 'block', flexShrink: 0 }}
    >
      {/* Three-color flag mark, centered horizontally above the wordmark.
          Coordinates establish the same proportions as the canonical lockup. */}
      <g transform="translate(190, 18)">
        {/* Yellow left flag */}
        <path d="M 0 0 L 20 0 L 20 50 L 0 32 Z" fill="#F2C94C" />
        {/* Red middle flag */}
        <path d="M 22 0 L 42 0 L 42 50 L 22 32 Z" fill="#E74C3C" />
        {/* Blue right flag */}
        <path d="M 44 0 L 66 0 L 66 32 L 44 50 Z" fill="#5DAEDB" />
      </g>

      {/* EmpireWorks wordmark. Set in tightly-tracked bold sans-serif. */}
      <text
        x="240"
        y="138"
        textAnchor="middle"
        fontFamily="'Helvetica Neue', 'Inter', system-ui, sans-serif"
        fontSize="72"
        fontWeight="900"
        fill="#141413"
        letterSpacing="-1.5"
      >
        EmpireWorks
      </text>

      {/* Yellow horizontal rule */}
      <rect x="64" y="152" width="352" height="4" fill="#F2C94C" />

      {/* RECONSTRUCTION subtype. Spaced caps. */}
      <text
        x="240"
        y="192"
        textAnchor="middle"
        fontFamily="'Helvetica Neue', 'Inter', system-ui, sans-serif"
        fontSize="28"
        fontWeight="800"
        fill="#141413"
        letterSpacing="6"
      >
        RECONSTRUCTION
      </text>
    </svg>
  )
}

export default EmpireLayout
