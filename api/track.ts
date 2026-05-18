/**
 * /api/track. Round 11 Phase 6 (2026-05-18) PostHog telemetry intake.
 *
 * Vercel Edge function that accepts a POST { event, ts, sessionId, packId?,
 * surface?, meta? } and forwards the event to PostHog Cloud via posthog-node.
 *
 * Round 8 originally wrote to a Notion Insights DB. Switched to PostHog
 * because Notion's 3 req/sec API limit and lack of native funnel / cohort
 * surfaces are the wrong shape for high-volume product analytics. PostHog
 * is purpose-built for this and a Vercel marketplace integration auto-wires
 * the env vars below.
 *
 * Env vars (set in Vercel project via PostHog marketplace integration):
 *   - POSTHOG_API_KEY: PostHog project API key
 *   - POSTHOG_HOST: PostHog host (defaults to https://app.posthog.com)
 *
 * If env vars are missing, the endpoint accepts the event and returns
 * { ok: true, persisted: false } so the client queue still flushes. This
 * lets the endpoint ship before the marketplace install is finished;
 * persistence flips to true on the next request after env vars land.
 *
 * Anti-flood guard: rate-limit per sessionId at 5 events / second.
 * Beyond the limit, return 200 but drop the event.
 *
 * Hard Rule #11: no em dashes.
 */

import { PostHog } from 'posthog-node'

export const config = {
  runtime: 'edge',
}

interface TelemetryPayload {
  event: string
  ts: string
  sessionId: string
  packId?: string
  surface?: string
  meta?: Record<string, string | number | boolean>
}

const rateBuckets = new Map<string, { count: number; reset: number }>()

function rateLimit(sessionId: string): boolean {
  const now = Date.now()
  const bucket = rateBuckets.get(sessionId)
  if (!bucket || bucket.reset < now) {
    rateBuckets.set(sessionId, { count: 1, reset: now + 1000 })
    return true
  }
  bucket.count += 1
  if (bucket.count > 5) return false
  return true
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('method not allowed', { status: 405 })
  }

  let payload: TelemetryPayload
  try {
    payload = (await req.json()) as TelemetryPayload
  } catch {
    return new Response('invalid json', { status: 400 })
  }

  if (!payload?.event || !payload?.sessionId) {
    return new Response('missing event or sessionId', { status: 400 })
  }

  if (!rateLimit(payload.sessionId)) {
    return new Response(JSON.stringify({ ok: true, dropped: 'rate-limit' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }

  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } })?.process
    ?.env
  const apiKey = env?.POSTHOG_API_KEY
  const host = env?.POSTHOG_HOST ?? 'https://app.posthog.com'

  if (!apiKey) {
    return new Response(JSON.stringify({ ok: true, persisted: false }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }

  const ph = new PostHog(apiKey, { host, flushAt: 1, flushInterval: 0 })
  const source =
    typeof payload.meta?.route === 'string' && payload.meta.route.length > 0
      ? payload.meta.route
      : '/empire'
  try {
    ph.capture({
      distinctId: payload.sessionId,
      event: payload.event,
      properties: {
        packId: payload.packId,
        surface: payload.surface,
        source,
        ts: payload.ts,
        ...payload.meta,
      },
    })
    await ph.shutdown()
    return new Response(JSON.stringify({ ok: true, persisted: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err).slice(0, 200) }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    })
  }
}
