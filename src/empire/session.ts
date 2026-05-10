/**
 * Compat shim. Phase-2 scaffold parked session helpers here. Phase 3 (S197)
 * moved the real implementation to src/empire/auth/useEmpireSession.ts and
 * split issuance/verification into auth/sendMagicLink.ts and
 * auth/verifyMagicLink.ts.
 *
 * Old API (hasSession, getSession, setSession, clearSession, verifyToken,
 * requestMagicLink) is preserved as thin wrappers so any orphan importer
 * keeps building. New code: import from './auth/useEmpireSession',
 * './auth/sendMagicLink', './auth/verifyMagicLink'.
 *
 * Hard Rule #11: no em dashes.
 */

import {
  getStoredSession,
  setStoredSession,
  clearStoredSession,
} from './auth/useEmpireSession'
import { sendMagicLink } from './auth/sendMagicLink'
import { verifyMagicLink, type EmpireUser } from './auth/verifyMagicLink'

export interface EmpireSession {
  email: string
  verifiedAt: number
  expiresAt: number
}

function asLegacy(user: EmpireUser): EmpireSession {
  return {
    email: user.email,
    verifiedAt: user.verifiedAt * 1000,
    expiresAt: user.exp * 1000,
  }
}

export function getSession(): EmpireSession | null {
  const stored = getStoredSession()
  return stored ? asLegacy(stored.user) : null
}

export function hasSession(): boolean {
  return getStoredSession() !== null
}

export function setSession(email: string): EmpireSession {
  const now = Math.floor(Date.now() / 1000)
  const user: EmpireUser = {
    email,
    verifiedAt: now,
    exp: now + 60 * 60 * 24 * 30,
  }
  setStoredSession(user)
  return asLegacy(user)
}

export function clearSession(): void {
  clearStoredSession()
}

/** Legacy verify wrapper. New code: import verifyMagicLink directly. */
export async function verifyToken(
  token: string | null,
  _email: string | null,
): Promise<EmpireSession | null> {
  const result = await verifyMagicLink(token)
  if (!result.ok) return null
  setStoredSession(result.user)
  return asLegacy(result.user)
}

/** Legacy issue wrapper. New code: import sendMagicLink directly. */
export async function requestMagicLink(
  email: string,
): Promise<{ ok: boolean; devUrl?: string }> {
  const result = await sendMagicLink({ email })
  if (!result.ok) return { ok: false }
  return { ok: true, devUrl: result.magicLinkUrl }
}
