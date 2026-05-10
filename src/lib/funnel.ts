/**
 * Empire Wireframe V4 / H4 + H6 funnel tracking
 *
 * Vercel Analytics event spec for the scrolophyte download-launch funnel.
 * Wraps `track()` from `@vercel/analytics` so callers do not depend on the
 * library directly and so we get a typed event surface.
 *
 * Spec source: v4/artifacts/H4/download-launch-ux.md Section 4.
 *
 * Hard Rule #11: no em dashes. Hard Rule #31: @vercel/analytics is already
 * a dependency, no new external import introduced by this file.
 */

import { track } from '@vercel/analytics'

export type FunnelEvent =
  | 'milestone_view'
  | 'pack_card_hover'
  | 'activate_clicked'
  | 'clipboard_copied'
  | 'clipboard_failed'
  | 'claude_tab_opened'
  | 'desktop_deeplink_fired'
  | 'desktop_deeplink_success'
  | 'desktop_deeplink_failed'
  | 'toast_shown'
  | 'pack_md_fetched'
  | 'session_resumed'
  | 'sponsor_block_view'
  | 'progress_meter_view'

/**
 * Pack tier matches the TimelineDMoment.packTier shape in
 * src/empire/content/timeline-d-mock.ts: full English names
 * (beginner / intermediate / advanced / power), not short slugs.
 */
export type PackTier = 'beginner' | 'intermediate' | 'advanced' | 'power'

export interface FunnelProps {
  slug?: string
  tier?: PackTier
  vp_segment?: string
  ms_since_milestone_view?: number
  ms_since_activate?: number
  prompt_size_bytes?: number
  path_taken?: 'desktop_deeplink' | 'web_clipboard' | 'mobile_deeplink' | 'fallback_download'
  [key: string]: string | number | boolean | undefined | null
}

/**
 * Fire a funnel event. Best-effort; never throws.
 * Returns true if the event was dispatched, false if the analytics library
 * was unavailable (SSR boot, ad blockers, etc).
 */
export function trackFunnel(event: FunnelEvent, props: FunnelProps = {}): boolean {
  try {
    const payload: Record<string, string | number | boolean | null> = {}
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined) continue
      payload[k] = v ?? null
    }
    payload.ts = Date.now()
    track(event, payload)
    return true
  } catch {
    return false
  }
}
