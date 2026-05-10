/**
 * sendMagicLink. Empire VP magic-link issuance.
 *
 * Owner: Empire Wireframe S197 (B1 Tab, Phase 3)
 * Companion: verifyMagicLink.ts (consume side), useEmpireSession.ts (storage).
 *
 * Tonight (S197 night, 2026-05-07): generates an HS256-signed token bound to
 * the VP's email + role + division, builds the consume URL, and logs it to
 * the browser console for smoke testing. No real email is sent.
 *
 * Day 11 cutover (one-liner swap):
 *   The DEV_MODE branch is replaced by a fetch('/api/empire/send-magic-link',
 *   { method: 'POST', body: JSON.stringify({ payload, magicLinkUrl }) }) call
 *   where the server route owns the actual Resend SDK call. The MagicLinkEmailPayload
 *   shape below already matches Resend's emails.send() contract:
 *
 *     resend.emails.send({
 *       from: 'Empire <empire@hoistos.com>',
 *       to: [vpEmail],
 *       subject: 'Your Empire activation link',
 *       html: renderMagicLinkHtml(...),
 *       replyTo: 'eugeen@perennialempire.com',
 *       tags: [{ name: 'surface', value: 'empire-vp-magic-link' }],
 *     })
 *
 *   Day 11 only needs:
 *     1) flip env VITE_EMPIRE_DEV_AUTH=false
 *     2) implement /api/empire/send-magic-link server route that imports
 *        resend@^6 and forwards the same payload to resend.emails.send.
 *
 * Token format (HS256 JWT):
 *     header  = base64url({"alg":"HS256","typ":"JWT"})
 *     payload = base64url({email, role, division, iat, exp})
 *     sig     = base64url(HMAC_SHA256(`${header}.${payload}`, EMPIRE_AUTH_SECRET))
 *     token   = `${header}.${payload}.${sig}`
 *
 * Env vars (Day 11):
 *     VITE_EMPIRE_DEV_AUTH       'true' (tonight) | 'false' (Day 11)
 *     VITE_EMPIRE_AUTH_SECRET    HS256 secret (rotate)
 *     VITE_EMPIRE_FROM_EMAIL     default 'Empire <empire@hoistos.com>'
 *     VITE_EMPIRE_REPLY_TO       default 'eugeen@perennialempire.com'
 *     RESEND_API_KEY             SERVER ONLY, never exposed to client
 *
 * Hard Rule #11: no em dashes in this module.
 */

export interface MagicLinkClaims {
  /** Lower-cased VP email. */
  email: string
  /** VP role token, e.g. 'VP-Construction', 'VP-AI', 'VP-Operations'. */
  role?: string
  /** Division token, e.g. 'perennial', 'hoistos', 'fund'. */
  division?: string
  /** Issued-at, seconds since epoch. */
  iat: number
  /** Expires-at, seconds since epoch. */
  exp: number
}

export interface SendMagicLinkInput {
  email: string
  /** Path the consume route returns the VP to after success. Default '/empire'. */
  redirectUrl?: string
  role?: string
  division?: string
  /** TTL in seconds. Default 1800 (30 min). */
  ttlSeconds?: number
}

export interface SendMagicLinkResult {
  ok: boolean
  /** Full https URL the VP would click. Surfaced to the form so the dev hint can render it. */
  magicLinkUrl?: string
  /** First 24 chars of the token, for log/diagnostics only. Do not surface to the VP. */
  devTokenPreview?: string
  error?: string
}

/**
 * Resend emails.send() payload contract (subset Empire uses).
 * Mirrors `Parameters<Resend['emails']['send']>[0]` from resend@6 SDK.
 * Day 11 server route forwards this object 1:1 into resend.emails.send.
 */
export interface MagicLinkEmailPayload {
  from: string
  to: string[]
  subject: string
  html: string
  replyTo?: string
  tags?: Array<{ name: string; value: string }>
}

const env = (typeof import.meta !== 'undefined'
  ? ((import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {})
  : {}) as Record<string, string | undefined>

const SECRET = env.VITE_EMPIRE_AUTH_SECRET ?? 'dev-shell-secret-tonight-rotate-day-11'
const DEV_MODE = env.VITE_EMPIRE_DEV_AUTH !== 'false'
const FROM_EMAIL = env.VITE_EMPIRE_FROM_EMAIL ?? 'Empire <empire@hoistos.com>'
const REPLY_TO = env.VITE_EMPIRE_REPLY_TO ?? 'eugeen@perennialempire.com'

export async function sendMagicLink(input: SendMagicLinkInput): Promise<SendMagicLinkResult> {
  const { email, redirectUrl = '/empire', role, division, ttlSeconds = 60 * 30 } = input

  if (!isLikelyEmail(email)) {
    return { ok: false, error: 'invalid email' }
  }

  const now = Math.floor(Date.now() / 1000)
  const claims: MagicLinkClaims = {
    email: email.toLowerCase(),
    role,
    division,
    iat: now,
    exp: now + ttlSeconds,
  }

  const token = await signToken(claims, SECRET)
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'http://localhost:5173'
  const magicLinkUrl = `${origin}/empire/auth?token=${encodeURIComponent(
    token,
  )}&next=${encodeURIComponent(redirectUrl)}`

  const payload: MagicLinkEmailPayload = {
    from: FROM_EMAIL,
    to: [email],
    subject: 'Your Empire activation link',
    html: renderMagicLinkHtml({ email, magicLinkUrl, role, division }),
    replyTo: REPLY_TO,
    tags: [
      { name: 'surface', value: 'empire-vp-magic-link' },
      { name: 'role', value: role ?? 'unknown' },
      { name: 'division', value: division ?? 'unknown' },
    ],
  }

  if (DEV_MODE) {
    // eslint-disable-next-line no-console
    console.groupCollapsed(
      '%c[Empire dev magic-link]',
      'background:#F25A00;color:#fff;padding:2px 6px;border-radius:3px;font-weight:600;',
      'click to expand',
    )
    // eslint-disable-next-line no-console
    console.log('Magic link URL:', magicLinkUrl)
    // eslint-disable-next-line no-console
    console.log('Email payload (Resend contract):', payload)
    // eslint-disable-next-line no-console
    console.log('Claims:', claims)
    // eslint-disable-next-line no-console
    console.groupEnd()
    return {
      ok: true,
      magicLinkUrl,
      devTokenPreview: token.slice(0, 24) + '...',
    }
  }

  // Day 11 path. Server route owns the Resend call.
  try {
    const res = await fetch('/api/empire/send-magic-link', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ payload, magicLinkUrl }),
    })
    if (!res.ok) return { ok: false, error: `send failed: ${res.status}` }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

function isLikelyEmail(s: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)
}

function renderMagicLinkHtml(args: {
  email: string
  magicLinkUrl: string
  role?: string
  division?: string
}): string {
  const greeting = args.role ? `Empire ${args.role}` : 'Empire VP'
  const divisionLine = args.division
    ? `<p style="font-size:12px;color:#9DB0BF;margin:0 0 24px;">Division: ${args.division}</p>`
    : ''
  return `<!doctype html>
<html><body style="font-family:Inter,Arial,sans-serif;background:#FFFFFF;color:#111827;padding:48px 24px;">
  <div style="max-width:520px;margin:0 auto;">
    <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#F25A00;margin-bottom:12px;">
      Empire activation
    </div>
    <h1 style="font-family:'DM Serif Display',serif;font-size:28px;line-height:1.2;margin:0 0 16px;">
      Welcome in, ${greeting}.
    </h1>
    ${divisionLine}
    <p style="font-size:15px;color:#6B8090;margin:0 0 28px;">
      Click the link below to sign in to Empire. This link expires in 30 minutes.
    </p>
    <a href="${args.magicLinkUrl}" style="display:inline-block;background:#F25A00;color:#FFFFFF;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
      Open Empire
    </a>
    <p style="font-size:11px;color:#9DB0BF;margin-top:32px;">
      Sent to ${args.email}. If you did not request this, ignore the message.
    </p>
  </div>
</body></html>`
}

// HS256 token signing using Web Crypto (browser + Node 19+ safe, no external lib).
async function signToken(claims: MagicLinkClaims, secret: string): Promise<string> {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64UrlEncode(JSON.stringify(claims))
  const data = `${header}.${payload}`
  const sig = await hmacSha256(data, secret)
  return `${data}.${sig}`
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

function base64UrlEncode(s: string): string {
  return base64UrlEncodeBytes(new TextEncoder().encode(s))
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

/** Internal export, only consumed by the auth shell + tests. */
export const __INTERNAL_FOR_TESTS = { signToken, hmacSha256, base64UrlEncode }
