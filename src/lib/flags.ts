/**
 * Feature flag scaffold. Round 8 (2026-05-18).
 *
 * Light scaffolding that lets components branch on a typed boolean flag.
 * URL `?flag=name1,name2` overrides for dev. localStorage for sticky state.
 * Hard-coded defaults in DEFAULTS for production. No remote config yet.
 *
 * Per round 8 plan Phase F: A/B test math layer is deferred to round 10
 * (or whenever Phase E telemetry shows >50 unique sessions/week). This
 * file is the foundation; the analyzer waits for signal.
 *
 * Hard Rule #11: no em dashes.
 * Context7 (HR #31): react@19.2.5 useEffect/useState verified live 2026-05-18.
 */

import { useEffect, useState } from 'react'

export type FlagName =
  | 'magicMomentParticles'
  | 'compactPackInstall'
  | 'darkModeBackdrop'

const DEFAULTS: Record<FlagName, boolean> = {
  magicMomentParticles: true,
  compactPackInstall: true,
  darkModeBackdrop: false,
}

const STORAGE_KEY = 'scrolophyte.flags'

function readUrlOverrides(): Partial<Record<FlagName, boolean>> {
  if (typeof window === 'undefined') return {}
  try {
    const p = new URLSearchParams(window.location.search)
    const raw = p.get('flag')
    if (!raw) return {}
    const out: Partial<Record<FlagName, boolean>> = {}
    for (const token of raw.split(',')) {
      const t = token.trim()
      if (!t) continue
      const off = t.startsWith('!')
      const name = (off ? t.slice(1) : t) as FlagName
      if (name in DEFAULTS) out[name] = !off
    }
    return out
  } catch {
    return {}
  }
}

function readSticky(): Partial<Record<FlagName, boolean>> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as Partial<Record<FlagName, boolean>>
  } catch {
    return {}
  }
}

function persistSticky(map: Partial<Record<FlagName, boolean>>) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // private mode / quota
  }
}

export function resolveFlag(name: FlagName): boolean {
  const url = readUrlOverrides()
  if (url[name] != null) {
    const sticky = readSticky()
    sticky[name] = url[name]!
    persistSticky(sticky)
    return url[name]!
  }
  const sticky = readSticky()
  if (sticky[name] != null) return sticky[name]!
  return DEFAULTS[name]
}

export function useFlag(name: FlagName): boolean {
  const [v, setV] = useState<boolean>(() => resolveFlag(name))
  useEffect(() => {
    const handler = () => setV(resolveFlag(name))
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [name])
  return v
}

export function FLAGS_FOR_DEBUG(): Record<FlagName, boolean> {
  const out = { ...DEFAULTS }
  const sticky = readSticky()
  for (const k of Object.keys(sticky) as FlagName[]) {
    if (sticky[k] != null) out[k] = sticky[k]!
  }
  const url = readUrlOverrides()
  for (const k of Object.keys(url) as FlagName[]) {
    if (url[k] != null) out[k] = url[k]!
  }
  return out
}
