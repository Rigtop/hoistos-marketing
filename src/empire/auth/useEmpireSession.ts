/**
 * useEmpireSession. React hook for the Empire VP session.
 *
 * Owner: Empire Wireframe S197 (B1 Tab, Phase 3)
 * Companion: verifyMagicLink.ts (writes the EmpireUser shape this hook stores).
 *
 * Tonight: localStorage-backed, listens for the cross-tab 'storage' event so a
 * sign-in in one tab propagates to the others. Day 11: same hook signature,
 * but storage shifts to httpOnly session cookie + GET /api/empire/me round-trip
 * on mount (the public `{ user, isAuthenticated, signOut }` shape stays).
 *
 * Hard Rule #11: no em dashes.
 */

import { useCallback, useEffect, useState } from 'react'
import type { EmpireUser } from './verifyMagicLink'

const STORAGE_KEY = 'empire.session.v1'

export interface StoredSession {
  user: EmpireUser
}

export interface UseEmpireSession {
  user: EmpireUser | null
  isAuthenticated: boolean
  signOut: () => void
  setSession: (user: EmpireUser) => void
  hydrate: () => void
}

/** Read-once helper. Does not subscribe. */
export function getStoredSession(): StoredSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredSession
    if (!parsed?.user?.email) return null
    if (parsed.user.exp && parsed.user.exp * 1000 < Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

/** Write-only helper. Used by EmpireAuthConsume after a successful verify. */
export function setStoredSession(user: EmpireUser): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user } satisfies StoredSession))
}

export function clearStoredSession(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

export function useEmpireSession(): UseEmpireSession {
  const [user, setUser] = useState<EmpireUser | null>(
    () => getStoredSession()?.user ?? null,
  )

  const hydrate = useCallback(() => {
    setUser(getStoredSession()?.user ?? null)
  }, [])

  const setSession = useCallback((next: EmpireUser) => {
    setStoredSession(next)
    setUser(next)
  }, [])

  const signOut = useCallback(() => {
    clearStoredSession()
    setUser(null)
  }, [])

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) hydrate()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [hydrate])

  // Auto-evict on mount + every 60s if the token's exp claim has passed.
  useEffect(() => {
    if (!user) return
    const tick = () => {
      if (user.exp && user.exp * 1000 < Date.now()) {
        clearStoredSession()
        setUser(null)
      }
    }
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [user])

  return {
    user,
    isAuthenticated: user !== null,
    signOut,
    setSession,
    hydrate,
  }
}
