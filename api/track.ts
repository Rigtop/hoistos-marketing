/**
 * /api/track. Round 8 (2026-05-18) Phase E telemetry intake endpoint.
 *
 * Vercel Edge function that accepts a POST { event, ts, sessionId, packId?,
 * surface?, meta? } and writes the event to the Notion Insights DB.
 *
 * Env vars required (set in Vercel project):
 *   - NOTION_API_KEY: Notion integration token
 *   - NOTION_INSIGHTS_DS_ID: data source id for the Insights DB
 *
 * If env vars are missing, the endpoint accepts the event and logs it
 * but does not persist (so client telemetry queue still flushes without
 * piling up). This lets the round 8 ship even before the Notion bits are
 * configured; configure the env vars later to start persisting.
 *
 * Anti-flood guard: rate-limit per sessionId at 5 events / second.
 * Beyond the limit, return 200 but drop the event.
 *
 * Hard Rule #11: no em dashes.
 */

interface TelemetryPayload {
  event: string
  ts: string
  sessionId: string
  packId?: string
  surface?: string
  meta?: Record<string, string | number | boolean>
}

export const config = {
  runtime: 'edge',
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

  const apiKey = (globalThis as { process?: { env?: Record<string, string | undefined> } })
    ?.process?.env?.NOTION_API_KEY
  const dsId = (globalThis as { process?: { env?: Record<string, string | undefined> } })
    ?.process?.env?.NOTION_INSIGHTS_DS_ID

  if (!apiKey || !dsId) {
    // env not configured: accept the event so the client queue flushes.
    return new Response(JSON.stringify({ ok: true, persisted: false }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        parent: { type: 'data_source_id', data_source_id: dsId },
        properties: {
          Name: { title: [{ text: { content: `${payload.event}${payload.packId ? `: ${payload.packId}` : ''}` } }] },
          Event: { rich_text: [{ text: { content: payload.event } }] },
          SessionId: { rich_text: [{ text: { content: payload.sessionId } }] },
          PackId: payload.packId ? { rich_text: [{ text: { content: payload.packId } }] } : undefined,
          Surface: payload.surface ? { rich_text: [{ text: { content: payload.surface } }] } : undefined,
          Timestamp: { date: { start: payload.ts } },
          Source: { rich_text: [{ text: { content: '/empire' } }] },
        },
      }),
    })
    if (!notionRes.ok) {
      const text = await notionRes.text()
      return new Response(JSON.stringify({ ok: false, error: text.slice(0, 200) }), {
        status: 502,
        headers: { 'content-type': 'application/json' },
      })
    }
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
