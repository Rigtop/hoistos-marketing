/**
 * Telemetry. Round 8 (2026-05-18) Phase E client-side helper.
 *
 * sendEvent(event) attempts a best-effort POST to /api/track. Falls back
 * to a localStorage queue if the network is offline or the endpoint is
 * not yet configured (Notion env vars missing in the Vercel project).
 *
 * Each event carries an anonymous sessionId stored in localStorage on
 * first visit. No PII. Each event includes the surface (browser /
 * desktop / code) so downstream segmentation works.
 *
 * Five canonical events: intake_started, intake_completed, pack_view,
 * pack_copy, pack_confirmed.
 *
 * Hard Rule #11: no em dashes.
 * Context7 (HR #31): no external libs.
 */

const SESSION_KEY = 'scrolophyte.telemetry.sessionId'
const QUEUE_KEY = 'scrolophyte.telemetry.queue'
const MAX_QUEUE = 50
const ENDPOINT = '/api/track'

export type TelemetryEventName =
  | 'intake_started'
  | 'intake_completed'
  | 'pack_view'
  | 'pack_copy'
  | 'pack_confirmed'

export interface TelemetryEvent {
  event: TelemetryEventName
  ts: string
  sessionId: string
  packId?: string
  surface?: 'browser' | 'desktop' | 'code'
  meta?: Record<string, string | number | boolean>
}

function readSessionId(): string {
  if (typeof window === 'undefined') return 'ssr'
  try {
    const existing = window.localStorage.getItem(SESSION_KEY)
    if (existing) return existing
    const id = `s_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
    window.localStorage.setItem(SESSION_KEY, id)
    return id
  } catch {
    return 'no-storage'
  }
}

function readQueue(): TelemetryEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeQueue(events: TelemetryEvent[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(events.slice(-MAX_QUEUE)))
  } catch {
    // private mode / quota
  }
}

export async function sendEvent(
  name: TelemetryEventName,
  payload: Omit<TelemetryEvent, 'event' | 'ts' | 'sessionId'> = {},
): Promise<void> {
  const event: TelemetryEvent = {
    event: name,
    ts: new Date().toISOString(),
    sessionId: readSessionId(),
    ...payload,
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true,
    })
    if (!res.ok) throw new Error(`status ${res.status}`)
    // success, flush any queued events
    const queue = readQueue()
    if (queue.length > 0) {
      writeQueue([])
      for (const queued of queue) {
        // fire and forget; do not await to keep the path fast
        void fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(queued),
          keepalive: true,
        }).catch(() => {})
      }
    }
  } catch {
    // offline / endpoint not configured: queue locally for later flush
    const queue = readQueue()
    queue.push(event)
    writeQueue(queue)
  }
}

/** Read all queued events for inspection (debug helper). */
export function inspectQueue(): TelemetryEvent[] {
  return readQueue()
}
