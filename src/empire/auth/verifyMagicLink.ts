/**
 * verifyMagicLink. Token verifier for the magic-link consume route.
 *
 * Owner: Empire Wireframe S197 (B1 Tab, Phase 3)
 * Companion: sendMagicLink.ts (issuer), useEmpireSession.ts (writer/reader).
 *
 * Tonight: re-signs the token with the shell secret + compares signature
 * (constant-time), then decodes the payload claims and returns an EmpireUser
 * profile. Day 11: client calls /api/empire/consume-magic-link instead and
 * receives the profile back from a server that owns the secret.
 *
 * Hard Rule #11: no em dashes.
 */

import type { MagicLinkClaims } from './sendMagicLink'

export interface EmpireUser {
  email: string
  /** VP role token, e.g. 'VP-Construction'. May be undefined for legacy tokens. */
  role?: string
  /** Division token, e.g. 'perennial'. May be undefined. */
  division?: string
  /** Verifier wall-clock at verify time, seconds since epoch. */
  verifiedAt: number
  /** Token's exp claim, seconds since epoch. Used by useEmpireSession to auto-evict. */
  exp: number
}

export type VerifyResult =
  | { ok: true; user: EmpireUser }
  | { ok: false; reason: VerifyFailReason }

export type VerifyFailReason =
  | 'missing token'
  | 'malformed token'
  | 'malformed payload'
  | 'signature mismatch'
  | 'token expired'
  | 'invalid email claim'

const env = (typeof import.meta !== 'undefined'
  ? ((import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {})
  : {}) as Record<string, string | undefined>

const SECRET = env.VITE_EMPIRE_AUTH_SECRET ?? 'dev-shell-secret-tonight-rotate-day-11'

export async function verifyMagicLink(
  token: string | null | undefined,
): Promise<VerifyResult> {
  if (!token) return { ok: false, reason: 'missing token' }

  const parts = token.split('.')
  if (parts.length !== 3) return { ok: false, reason: 'malformed token' }

  const [headerB64, payloadB64, sigB64] = parts
  const data = `${headerB64}.${payloadB64}`

  const expectedSig = await hmacSha256(data, SECRET)
  if (!constantTimeEquals(sigB64, expectedSig)) {
    return { ok: false, reason: 'signature mismatch' }
  }

  let claims: MagicLinkClaims
  try {
    claims = JSON.parse(base64UrlDecode(payloadB64)) as MagicLinkClaims
  } catch {
    return { ok: false, reason: 'malformed payload' }
  }

  const now = Math.floor(Date.now() / 1000)
  if (typeof claims.exp !== 'number' || claims.exp < now) {
    return { ok: false, reason: 'token expired' }
  }
  if (!claims.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(claims.email)) {
    return { ok: false, reason: 'invalid email claim' }
  }

  return {
    ok: true,
    user: {
      email: claims.email,
      role: claims.role,
      division: claims.division,
      verifiedAt: now,
      exp: claims.exp,
    },
  }
}

async function hmacSha256(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const buf = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return base64UrlEncodeBytes(new Uint8Array(buf))
}

function base64UrlDecode(s: string): string {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)
  if (typeof atob !== 'undefined') return atob(padded)
  const buf = (globalThis as { Buffer?: { from(s: string, e: string): { toString(e: string): string } } })
    .Buffer?.from(padded, 'base64')
  return buf ? buf.toString('binary') : ''
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i])
  const b64 =
    typeof btoa !== 'undefined'
      ? btoa(bin)
      : (globalThis as { Buffer?: { from(s: string, e: string): { toString(e: string): string } } })
          .Buffer?.from(bin, 'binary')
          .toString('base64') ?? ''
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}
