/**
 * HoistOSHome. Polished HoistOS-branded splash served at hoistos.com root.
 *
 * Layered visuals:
 *   - <KnowledgeGraph />: animated SVG of ~18 nodes + ~24 edges, slow pulse
 *     and edge-fade. Atmospheric only, low opacity, doesn't fight foreground.
 *   - <AuroraOrbs />: three drifting blurred gradient blobs (signal palette).
 *   - HoistOS lockup, gradient headline, CTA cards, footer.
 *
 * The Perennial Empire Dashboard CTA opens a client-side password modal
 * (UX gate, not real security; password "Perennial 2026" lives in bundle).
 *
 * Owner: Empire Wireframe S198 V6 reset.
 * Brand: HoistOS LIGHT (paper bg + ink text + signal accent + signal-2 gradient).
 * Hard Rule #11: no em dashes anywhere in this module.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'

const FOOTER_YEAR = new Date().getFullYear()
const DASHBOARD_PASSWORD = 'Perennial 2026'
const DASHBOARD_SESSION_KEY = 'eugeen-vp-pass'
const PUBLIC_LAUNCH_TIMESTAMP = new Date('2026-05-15T17:00:00-04:00').getTime()


function pad(n: number, width = 2): string {
  return String(n).padStart(width, '0')
}

function useCountdown(targetMs: number) {
  const [now, setNow] = useState<number>(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const diffMs = Math.max(0, targetMs - now)
  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds, isPast: diffMs <= 0 }
}

// V7 background treatment: editorial premium 2026 landing-page stack.
// Eugeen S198 verdict on V6: "looks like absolute trash, just research how
// to make a sick landing page and do that." The V6 80-node dot-mesh +
// 2-blob aurora was competing with the foreground and reading as a stock
// template. V7 layers four very subtle treatments:
//
//   1. BlueprintGrid    : faint architectural drafting grid, radial-fade to
//                         center (on-brand for construction; Cursor-style
//                         perspective grid restraint without being kitschy)
//   2. WarmGradientMesh : 3 soft radial gradients (signal orange + cream),
//                         slow 60-70s drift loops (Linear/Stripe staple)
//   3. FloatingAccents  : ~10 signal-orange focal points with glow, slow
//                         pulse (replaces 80-node mesh; fewer but premium)
//   4. PaperGrain       : SVG turbulence overlay at 4% opacity (filmic
//                         polish layer, the Active Theory / Studio Freight
//                         move)
//
// All four are layered low-opacity so the headline + CTA cards drive the
// page. None individually are "the visual"; together they create premium
// ambient texture that lifts the paper background without competing.

// V8 background: animated backgrounds on light editorial pages are a trap
// (Anthropic Claude, Apple, NY Times all use zero background motion). After
// three rounds of "tune the wave," abandoning the loop. Stack is:
//   1. StaticOrb -- single radial-gradient signal-orange halo, top-right
//                   corner, NO animation, NO canvas, pure CSS
//   2. PaperGrain -- feTurbulence noise polish at 4% opacity, kept
// That is everything. The headline + CTA cards drive the page now.
function PaperGrain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 1, mixBlendMode: 'multiply', opacity: 0.04 }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <filter id="paper-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-noise)" />
      </svg>
    </div>
  )
}

function StaticOrb() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-30vw',
          right: '-25vw',
          width: '95vw',
          height: '95vw',
          background:
            'radial-gradient(circle at center, rgba(242, 90, 0, 0.22) 0%, rgba(242, 90, 0, 0.10) 32%, rgba(242, 90, 0, 0.03) 55%, rgba(242, 90, 0, 0) 70%)',
          filter: 'blur(8px)',
        }}
      />
    </div>
  )
}

function PageBackground() {
  return (
    <>
      <StaticOrb />
      <PaperGrain />
    </>
  )
}
function CountdownBadge() {
  // V8.1: chip displays D/H/M only (seconds dropped to avoid layout twitch
  // on every tick). useCountdown still returns seconds for any future use.
  const { days, hours, minutes, isPast } = useCountdown(PUBLIC_LAUNCH_TIMESTAMP)

  if (isPast) {
    return (
      <div
        className="inline-flex items-center gap-2.5 rounded-full px-3.5 py-2 text-[11px] font-mono uppercase tracking-[0.16em]"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(11, 15, 20, 0.08)',
          color: '#0B0F14',
          fontWeight: 500,
        }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{
            background: '#F25A00',
            boxShadow: '0 0 0 4px rgba(242, 90, 0, 0.18)',
          }}
        />
        Live now
      </div>
    )
  }

  // V8.1 Premium SaaS chip: pulse dot with halo, glass backdrop, fixed-width
  // monospace digits so the layout doesn't jitter every second.
  return (
    <div
      className="inline-flex items-center gap-2.5 rounded-full px-3.5 py-2 text-[11px] font-mono uppercase tracking-[0.16em]"
      style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(11, 15, 20, 0.08)',
        color: '#6B7785',
        fontWeight: 500,
      }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{
          background: '#F25A00',
          boxShadow: '0 0 0 4px rgba(242, 90, 0, 0.18)',
        }}
      />
      <span style={{ color: '#0B0F14' }}>Pre-launch</span>
      <span style={{ color: 'rgba(11, 15, 20, 0.18)' }}>·</span>
      <span
        style={{
          color: '#0B0F14',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {pad(days)}D {pad(hours)}H {pad(minutes)}M
      </span>
    </div>
  )
}

function PasswordModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (open) {
      setValue('')
      setError('')
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (value === DASHBOARD_PASSWORD) {
      try {
        sessionStorage.setItem(DASHBOARD_SESSION_KEY, '1')
      } catch {
        // sessionStorage may be blocked, that's fine
      }
      onSuccess()
    } else {
      setError('Wrong password.')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(11, 15, 20, 0.55)', backdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full max-w-[440px] rounded-2xl p-9"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 24px 64px rgba(11, 15, 20, 0.18), 0 0 0 1px rgba(229, 231, 235, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="text-[11px] font-mono uppercase tracking-[0.22em] mb-3"
              style={{ color: '#F25A00' }}
            >
              Internal access
            </div>
            <h2
              className="text-[28px] leading-tight mb-2"
              style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontWeight: 400,
                color: '#111827',
              }}
            >
              Perennial Empire Dashboard
            </h2>
            <p className="text-[14px] leading-relaxed mb-6" style={{ color: '#6B8090' }}>
              Enter the access password to view the dashboard.
            </p>

            <form onSubmit={submit}>
              {error && (
                <div
                  className="rounded-lg px-3 py-2 mb-3 text-[13px]"
                  style={{
                    background: '#FEF2F2',
                    color: '#DC2626',
                    border: '1px solid #FCA5A5',
                  }}
                >
                  {error}
                </div>
              )}
              <input
                ref={inputRef}
                type="password"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  if (error) setError('')
                }}
                placeholder="Password"
                autoComplete="current-password"
                className="w-full rounded-lg px-4 py-3 mb-3 text-[15px] outline-none transition-all"
                style={{
                  border: '1px solid #E5E7EB',
                  background: '#F2F4F7',
                  color: '#111827',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#F25A00'
                  e.currentTarget.style.background = '#FFFFFF'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(242, 90, 0, 0.12)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB'
                  e.currentTarget.style.background = '#F2F4F7'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-lg px-4 py-3 text-[15px] font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #F25A00 0%, #FF8A3D 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(242, 90, 0, 0.28)',
                  }}
                >
                  Unlock dashboard
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-3 text-[14px] transition-colors"
                  style={{
                    background: 'transparent',
                    color: '#6B8090',
                    border: '1px solid #E5E7EB',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function HoistOSHome() {
  const navigate = useNavigate()
  // Password modal removed S198 V6: dashboard CTA now navigates directly.
  void useState // keep import live in case reintroduced
  const modalOpen = false
  const setModalOpen = (_v: boolean) => {}
  const [hoveredCard, setHoveredCard] = useState<'empire' | 'dashboard' | 'login' | null>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'hoistos-light')
    document.title = 'HoistOS'
  }, [])

  const sessionUnlocked = useMemo(() => {
    try {
      return sessionStorage.getItem(DASHBOARD_SESSION_KEY) === '1'
    } catch {
      return false
    }
  }, [])

  // onDashboardClick removed S198 V6: dashboard card uses direct <Link>.
  void sessionUnlocked
  void navigate
  void setModalOpen

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #FFFFFF 0%, #F8F8F4 60%, #F2F4F7 100%)',
        color: '#111827',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <PageBackground />

      {/* Skip-to-content link. Hidden until focused so keyboard users can
          jump past the header. WCAG 2.4.1. */}
      <a
        href="#hoistos-main"
        className="sr-only focus:not-sr-only"
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 100,
          padding: '10px 14px',
          background: '#F25A00',
          color: '#FFFFFF',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Skip to content
      </a>

      {/* V8.1 Premium SaaS layout: top bar (lockup + countdown chip) sits
          full-width above a centered hero (Inter 800, gradient accent on "OS"),
          followed by stacked premium CTA cards. Wording preserved verbatim
          from the prior layout per Eugeen S199 directive. */}
      <header
        className="relative flex items-center justify-between gap-4 px-6 sm:px-12 py-6 max-w-[1280px] mx-auto"
        style={{ zIndex: 3 }}
      >
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <img
            src="/brand/HoistOS-Lockup-Horizontal.svg"
            alt="HoistOS"
            className="h-8 w-auto"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }}
        >
          <CountdownBadge />
        </motion.div>
      </header>

      <main
        id="hoistos-main"
        className="relative flex flex-col items-center px-6 pt-12 pb-16"
        style={{ zIndex: 2 }}
      >
        <div className="w-full max-w-[760px] flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="mb-14"
          >
            <h1
              className="leading-[1.0] mb-6"
              style={{
                fontFamily:
                  'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(3.5rem, 9.5vw, 6.5rem)',
                letterSpacing: '-0.04em',
                color: '#0B0F14',
              }}
            >
              Hoist
              <span
                style={{
                  background:
                    'linear-gradient(135deg, #F25A00 0%, #FF8A3D 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                OS
              </span>
            </h1>
            <p
              className="leading-[1.55] mx-auto"
              style={{
                fontSize: 'clamp(1.05rem, 1.7vw, 1.25rem)',
                color: '#2D3845',
                maxWidth: '52ch',
                fontWeight: 400,
              }}
            >
              An AI-native operating system for construction. Built by
              operators, for operators.
            </p>
          </motion.div>

          <div className="w-full space-y-5 mb-16 text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
              onMouseEnter={() => setHoveredCard('login')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <a
                href="https://app.hoistos.com"
                className="group relative block overflow-hidden transition-all cursor-pointer"
                style={{
                  borderRadius: '18px',
                  padding: '32px 36px 30px',
                  textDecoration: 'none',
                  color: '#0B0F14',
                  background: '#FFFFFF',
                  border: '1px solid',
                  borderColor:
                    hoveredCard === 'login'
                      ? 'rgba(242, 90, 0, 0.28)'
                      : 'rgba(11, 15, 20, 0.08)',
                  boxShadow:
                    hoveredCard === 'login'
                      ? '0 14px 36px rgba(11, 15, 20, 0.08), 0 0 0 1px rgba(242, 90, 0, 0.22)'
                      : '0 1px 3px rgba(11, 15, 20, 0.04)',
                  transform:
                    hoveredCard === 'login'
                      ? 'translateY(-2px)'
                      : 'translateY(0)',
                }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 transition-opacity"
                  style={{
                    background:
                      'linear-gradient(135deg, transparent 0%, rgba(242, 90, 0, 0.04) 100%)',
                    opacity: hoveredCard === 'login' ? 1 : 0,
                  }}
                />
                <div className="relative flex items-start justify-between gap-8">
                  <div className="flex-1">
                    <div
                      className="text-[11px] font-mono uppercase mb-3"
                      style={{
                        color: '#F25A00',
                        letterSpacing: '0.18em',
                        fontWeight: 500,
                      }}
                    >
                      Operators
                    </div>
                    <div
                      className="text-[26px] mb-2.5 leading-[1.15]"
                      style={{
                        fontFamily:
                          'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      HoistOS Login
                    </div>
                    <div
                      className="text-[15px] leading-[1.55]"
                      style={{ color: '#2D3845', maxWidth: '54ch' }}
                    >
                      The HoistOS platform. Field tools, office, AI agents.
                    </div>
                  </div>
                  <div
                    className="font-mono mt-1 transition-transform"
                    style={{
                      color: '#F25A00',
                      fontSize: '26px',
                      transform:
                        hoveredCard === 'login'
                          ? 'translateX(6px)'
                          : 'translateX(0)',
                      flexShrink: 0,
                    }}
                  >
                    &rarr;
                  </div>
                </div>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
              onMouseEnter={() => setHoveredCard('empire')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Link
                to="/empireworksreconstruction"
                className="group relative block overflow-hidden transition-all"
                style={{
                  borderRadius: '18px',
                  padding: '32px 36px 30px',
                  textDecoration: 'none',
                  color: '#0B0F14',
                  background: '#FFFFFF',
                  border: '1px solid',
                  borderColor:
                    hoveredCard === 'empire'
                      ? 'rgba(242, 90, 0, 0.28)'
                      : 'rgba(11, 15, 20, 0.08)',
                  boxShadow:
                    hoveredCard === 'empire'
                      ? '0 14px 36px rgba(11, 15, 20, 0.08), 0 0 0 1px rgba(242, 90, 0, 0.22)'
                      : '0 1px 3px rgba(11, 15, 20, 0.04)',
                  transform:
                    hoveredCard === 'empire' ? 'translateY(-2px)' : 'translateY(0)',
                }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 transition-opacity"
                  style={{
                    background:
                      'linear-gradient(135deg, transparent 0%, rgba(242, 90, 0, 0.04) 100%)',
                    opacity: hoveredCard === 'empire' ? 1 : 0,
                  }}
                />
                <div className="relative flex items-start justify-between gap-8">
                  <div className="flex-1">
                    <div
                      className="text-[11px] font-mono uppercase mb-3"
                      style={{
                        color: '#F25A00',
                        letterSpacing: '0.18em',
                        fontWeight: 500,
                      }}
                    >
                      Customware install
                    </div>
                    <div
                      className="text-[26px] mb-2.5 leading-[1.15]"
                      style={{
                        fontFamily:
                          'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      EmpireWorks Reconstruction
                    </div>
                    <div
                      className="text-[15px] leading-[1.55]"
                      style={{ color: '#2D3845', maxWidth: '54ch' }}
                    >
                      Don't rebuild what's already built. Click, install,
                      upgrade your Claude.
                    </div>
                  </div>
                  <div
                    className="font-mono mt-1 transition-transform"
                    style={{
                      color: '#F25A00',
                      fontSize: '26px',
                      transform:
                        hoveredCard === 'empire'
                          ? 'translateX(6px)'
                          : 'translateX(0)',
                      flexShrink: 0,
                    }}
                  >
                    &rarr;
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }}
              onMouseEnter={() => setHoveredCard('dashboard')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <a
                href="/perennialempiredashboard"
                className="group relative block overflow-hidden transition-all cursor-pointer"
                style={{
                  borderRadius: '18px',
                  padding: '32px 36px 30px',
                  textDecoration: 'none',
                  color: '#0B0F14',
                  background: '#FFFFFF',
                  border: '1px solid',
                  borderColor:
                    hoveredCard === 'dashboard'
                      ? 'rgba(242, 90, 0, 0.28)'
                      : 'rgba(11, 15, 20, 0.08)',
                  boxShadow:
                    hoveredCard === 'dashboard'
                      ? '0 14px 36px rgba(11, 15, 20, 0.08), 0 0 0 1px rgba(242, 90, 0, 0.22)'
                      : '0 1px 3px rgba(11, 15, 20, 0.04)',
                  transform:
                    hoveredCard === 'dashboard'
                      ? 'translateY(-2px)'
                      : 'translateY(0)',
                }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 transition-opacity"
                  style={{
                    background:
                      'linear-gradient(135deg, transparent 0%, rgba(242, 90, 0, 0.04) 100%)',
                    opacity: hoveredCard === 'dashboard' ? 1 : 0,
                  }}
                />
                <div className="relative flex items-start justify-between gap-8">
                  <div className="flex-1">
                    <div
                      className="text-[11px] font-mono uppercase mb-3"
                      style={{
                        color: '#F25A00',
                        letterSpacing: '0.18em',
                        fontWeight: 500,
                      }}
                    >
                      Team workspace
                    </div>
                    <div
                      className="text-[26px] mb-2.5 leading-[1.15]"
                      style={{
                        fontFamily:
                          'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      Perennial Empire Dashboard
                    </div>
                    <div
                      className="text-[15px] leading-[1.55]"
                      style={{ color: '#2D3845', maxWidth: '54ch' }}
                    >
                      Org structure, project economics, financial trajectory.
                      Live data, division view.
                    </div>
                  </div>
                  <div
                    className="font-mono mt-1 transition-transform"
                    style={{
                      color: '#F25A00',
                      fontSize: '26px',
                      transform:
                        hoveredCard === 'dashboard'
                          ? 'translateX(6px)'
                          : 'translateX(0)',
                      flexShrink: 0,
                    }}
                  >
                    &rarr;
                  </div>
                </div>
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="w-full pt-8 text-[11px] font-mono text-center"
            style={{
              color: '#6B7785',
              borderTop: '1px solid rgba(11, 15, 20, 0.06)',
              letterSpacing: '0.16em',
              fontWeight: 500,
            }}
          >
            {FOOTER_YEAR} · Eugeen Bernan, COO Perennial Empire
          </motion.div>
        </div>
      </main>

      <PasswordModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false)
          navigate('/perennialempiredashboard')
        }}
      />
    </div>
  )
}

export default HoistOSHome
