/**
 * EmpireAuthGate. Protected-route wrapper for /empire/* private surfaces.
 *
 * Owner: Empire Wireframe S197 (B1 Tab, Phase 2)
 * Routing reference: src/empire/AppRouter.tsx wraps /empire, /empire/timeline,
 * /empire/pack/:packId in this gate. /empire/auth and /empire/auth/request stay
 * public so a VP without a session can still consume their magic link.
 *
 * Tonight: stateless dev-token shell. Day 11: signed-JWT Resend flow per
 * MASTER_PLAN.md "Out of scope tonight" section.
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEmpireSession } from './auth/useEmpireSession'

export function EmpireAuthGate() {
  const location = useLocation()
  const { isAuthenticated } = useEmpireSession()

  if (isAuthenticated) {
    return <Outlet />
  }

  // Preserve the deep-link target so the consume page can return the VP here.
  const next = encodeURIComponent(location.pathname + location.search)
  return <Navigate to={`/empire/auth/request?next=${next}`} replace />
}

export default EmpireAuthGate
