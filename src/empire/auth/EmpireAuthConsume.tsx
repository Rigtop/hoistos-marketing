/**
 * EmpireAuthConsume. Token consumer + session writer + redirect.
 *
 * Owner: Empire Wireframe S197 (B1 Tab, Phase 3)
 * Routing: src/empire/AppRouter.tsx maps "/empire/auth" here.
 * Public surface (NOT inside EmpireAuthGate) so a fresh VP can land here with
 * a token in the URL and get past the gate.
 *
 * Reads ?token + ?next from URL params, awaits verifyMagicLink, writes the
 * session via useEmpireSession.setSession (localStorage tonight), redirects
 * to ?next || '/empire'. Day 11 swaps the verify call for a server round-trip
 * but the public component shape and the consume URL stay the same.
 *
 * Hard Rule #11: no em dashes.
 */

import { useEffect, useRef, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { verifyMagicLink, type VerifyFailReason } from './verifyMagicLink'
import { useEmpireSession } from './useEmpireSession'

type ConsumeState =
  | { phase: 'verifying' }
  | { phase: 'success'; redirectTo: string }
  | { phase: 'error'; reason: VerifyFailReason }

export function EmpireAuthConsume() {
  const [searchParams] = useSearchParams()
  const { setSession } = useEmpireSession()
  const [state, setState] = useState<ConsumeState>({ phase: 'verifying' })
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    const token = searchParams.get('token')
    const next = searchParams.get('next') || '/empire'

    void verifyMagicLink(token).then((result) => {
      if (!result.ok) {
        setState({ phase: 'error', reason: result.reason })
        toast.error(`Magic link verification failed (${result.reason}).`)
        return
      }
      setSession(result.user)
      toast.success(`Signed in as ${result.user.email}.`)
      setState({ phase: 'success', redirectTo: next })
    })
  }, [searchParams, setSession])

  if (state.phase === 'success') {
    return <Navigate to={state.redirectTo} replace />
  }

  return (
    <div className="px-[6vw] py-32 max-w-xl" style={{ color: 'rgb(var(--color-fg))' }}>
      <div
        className="font-mono text-xs uppercase tracking-[0.2em] mb-4"
        style={{ color: 'rgb(var(--color-accent))' }}
      >
        Magic link
      </div>

      {state.phase === 'verifying' ? (
        <>
          <h1 className="font-display text-3xl mb-3">Verifying your link.</h1>
          <p className="text-sm" style={{ color: 'rgb(var(--color-fg-muted))' }} aria-live="polite">
            Hold on a second. Signing you in.
          </p>
        </>
      ) : (
        <div role="alert">
          <h1 className="font-display text-3xl mb-3">That link did not check out.</h1>
          <p className="text-sm mb-2" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            The magic link could not be verified. Most often it expired, or it was already used.
          </p>
          <p
            className="font-mono text-xs uppercase tracking-[0.18em] mb-6"
            style={{ color: 'rgb(var(--color-fg-subtle))' }}
          >
            Reason: {state.reason}
          </p>
          <a
            href="/empire/auth/request"
            aria-label="Request a fresh magic link"
            className="btn btn-primary px-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            Send me a fresh link
          </a>
        </div>
      )}
    </div>
  )
}

export default EmpireAuthConsume
