/**
 * EmpireRouteStub. Lightweight placeholder for the three vision-spec routes
 * that the merged worktree has not yet implemented end-to-end (Tabs B, C, H
 * in MASTER_PLAN.md): /empire/dashboard, /empire/bridge, /empire/packs.
 *
 * Why this exists (S217 iter-2 F1 close, severity 9.7):
 *   Before this change, those three routes had no Route entry and rendered
 *   a literal blank document body. Anyone clicking a shared link, or copy
 *   that gestured at "the dashboard," saw what looked like a hard failure.
 *   The placeholder keeps the EmpireLayout chrome and tells the visitor
 *   exactly where the surface lives in the build order, with a quick path
 *   back to the live surfaces (/empire and /empire/foundation).
 *
 * This file is a temporary scaffold. When tabs B, C, and H ship the real
 * surfaces, swap their route entries in AppRouter.tsx to the real
 * components and delete this file.
 *
 * Hard Rule #11: no em dashes.
 * R047 voice: counter-led, no banned openers.
 * R087: plain English, no markdown bold in user-visible prose, no ALL CAPS
 *   labels in body text.
 */

import { Link } from 'react-router-dom'

export type EmpireStubKind = 'dashboard' | 'bridge' | 'packs' | 'not-found'

interface EmpireRouteStubProps {
  kind: EmpireStubKind
}

const COPY: Record<
  EmpireStubKind,
  { eyebrow: string; title: string; body: string; primaryLabel: string; primaryTo: string }
> = {
  dashboard: {
    eyebrow: 'Coming next',
    title: 'The dashboard is on the next build',
    body:
      'We are wiring the five-layer dashboard in the next pass. The install gallery is live now. That is where the work happens today.',
    primaryLabel: 'Open the install gallery',
    primaryTo: '/empireworksreconstruction/foundation',
  },
  bridge: {
    eyebrow: 'Coming next',
    title: 'The Bridge is on the next build',
    body:
      'The Bridge installer ships in the next pass. The pack-by-pack path is live now: each Foundation pack lands on your clipboard with a walkthrough for the paste.',
    primaryLabel: 'Install pack by pack',
    primaryTo: '/empireworksreconstruction/foundation',
  },
  packs: {
    eyebrow: 'Coming next',
    title: 'The full packs gallery is on the next build',
    body:
      'Foundation, Advanced, Power, Beginner, and Bonus all roll into the next gallery pass. The Foundation eleven are already live and anchor every install.',
    primaryLabel: 'Open the Foundation gallery',
    primaryTo: '/empireworksreconstruction/foundation',
  },
  'not-found': {
    eyebrow: 'Dead link',
    title: 'Nothing lives at this address',
    body:
      'The link is stale or the route moved. Two surfaces are live: the landing page and the Foundation gallery.',
    primaryLabel: 'Back to landing',
    primaryTo: '/empireworksreconstruction',
  },
}

export function EmpireRouteStub({ kind }: EmpireRouteStubProps) {
  const copy = COPY[kind]
  return (
    <section
      style={{
        padding: '64px 6vw 96px',
        minHeight: '60vh',
        background: '#f5f4ed',
        color: '#141413',
      }}
    >
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#cc6e2e',
            marginBottom: 16,
          }}
        >
          {copy.eyebrow}
        </div>
        <h1
          style={{
            fontFamily: "'Newsreader', serif",
            fontSize: 'clamp(1.85rem, 4.5vw, 3rem)',
            lineHeight: 1.1,
            marginBottom: 16,
            color: '#141413',
          }}
        >
          {copy.title}
        </h1>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            color: '#3a3a36',
            marginBottom: 28,
          }}
        >
          {copy.body}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to={copy.primaryTo}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgb(204,110,46)]"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 44,
              padding: '10px 22px',
              borderRadius: 999,
              background: '#cc6e2e',
              color: '#fbfaf3',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 8px 20px rgba(204,110,46,0.28)',
            }}
          >
            {copy.primaryLabel}
          </Link>
          <Link
            to="/empireworksreconstruction"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgb(204,110,46)]"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 44,
              padding: '10px 18px',
              borderRadius: 999,
              border: '1px solid rgba(20,20,19,0.18)',
              color: '#141413',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              background: 'transparent',
            }}
          >
            Back to landing
          </Link>
        </div>
      </div>
    </section>
  )
}

export default EmpireRouteStub
