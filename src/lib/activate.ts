/**
 * Empire Wireframe V4 / H6 Activate-in-Claude flow.
 *
 * Tier B (the most common path) fetches the pack markdown, copies the full
 * SKILL.md to clipboard, opens claude.ai/new in a new tab, then shows a toast
 * telling the VP to paste with Cmd-V. This eliminates the file-system
 * round-trip that the legacy `.zip` (broken) and `.md` (download-only) paths
 * forced on the VP.
 *
 * Hard Rule #11: no em dashes. Hard Rule #31: react-hot-toast is already a
 * dependency in package.json (no new external import).
 */

import { toast } from 'react-hot-toast'
import { trackFunnel, type PackTier } from './funnel'
import { applyCustomware, type CustomwareAnswers } from './customware'
import { readIntake } from './intake-state'

export type ActivationTier = 'desktop_deeplink' | 'web_clipboard' | 'mobile_deeplink' | 'fallback_download'

export interface ActivateOptions {
  /** pack slug, e.g. 'beg-01-chat-to-projects' */
  slug: string
  /** absolute or relative URL where the .md is served */
  packUrl: string
  /** beg | mid | adv | pow */
  tier?: PackTier
  /** legacy option, no longer used by the blank-launch flow */
  publicOrigin?: string
  /**
   * Per-pack mini-form answers. Token substitution looks here first before
   * falling through to the global intake answers and `customware-defaults.json`.
   * When omitted, the engine still applies the intake layer plus defaults.
   */
  customwareAnswers?: CustomwareAnswers
}

/**
 * Read the global intake answers from `intake-state.ts`. The canonical
 * storage key is `hoistos.intake.v1` and the shape is `IntakeState`. The
 * customware engine treats the shape as `CustomwareAnswers` (an open
 * key-value map), so the `IntakeState` object slots in directly.
 */
function readIntakeAnswers(): CustomwareAnswers {
  try {
    const state = readIntake()
    return state as unknown as CustomwareAnswers
  } catch {
    return {}
  }
}

/**
 * Detect mobile via UA sniffing. Reasonable enough for the iOS/Android split
 * the H4 spec requires. Not used for security gates.
 */
export function isMobile(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

/**
 * Return whether this browser prefers opening the Claude desktop app after
 * the pack body is copied to the clipboard.
 */
export function preferDesktopDeepLink(): boolean {
  try {
    return localStorage.getItem('claude.preferDesktop') === '1'
  } catch {
    return false
  }
}

/**
 * Mark this device as preferring Claude desktop launch from this point forward.
 * Surfaced via a small toggle in the toast follow-up flow (defer to V5 UI).
 */
export function setPreferDesktopDeepLink(value: boolean): void {
  try {
    localStorage.setItem('claude.preferDesktop', value ? '1' : '0')
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * Mark a slug as activated, persisted in localStorage, drives the progress
 * meter ("X of 15 packs activated").
 */
export function markActivated(slug: string): void {
  try {
    const raw = localStorage.getItem('scrolophyte.activated') ?? '[]'
    const arr: string[] = JSON.parse(raw)
    if (!arr.includes(slug)) {
      arr.push(slug)
      localStorage.setItem('scrolophyte.activated', JSON.stringify(arr))
    }
  } catch {
    /* ignore quota / private mode */
  }
}

export function listActivated(): string[] {
  try {
    const raw = localStorage.getItem('scrolophyte.activated') ?? '[]'
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

/**
 * Remove a slug from the activated list. Used by the per-pack "Remove" CTA
 * on Foundation cards. Fires the same scrolophyte:activated event so any
 * trackers re-read the new state.
 */
export function removeActivated(slug: string): void {
  try {
    const raw = localStorage.getItem('scrolophyte.activated') ?? '[]'
    const arr: string[] = JSON.parse(raw)
    const next = arr.filter((s) => s !== slug)
    if (next.length !== arr.length) {
      localStorage.setItem('scrolophyte.activated', JSON.stringify(next))
      window.dispatchEvent(new Event('scrolophyte:activated'))
    }
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * Subscribe to activation changes (storage event + custom event).
 * Returns an unsubscribe function.
 */
export function onActivatedChange(cb: () => void): () => void {
  const handler = () => cb()
  window.addEventListener('storage', handler)
  window.addEventListener('scrolophyte:activated', handler)
  return () => {
    window.removeEventListener('storage', handler)
    window.removeEventListener('scrolophyte:activated', handler)
  }
}

/**
 * Fetch the pack markdown body. Used to seed the clipboard with the actual
 * SKILL.md content so the VP can paste it directly into claude.ai / a new
 * Project Knowledge file.
 */
async function fetchPackBody(packUrl: string): Promise<string> {
  const res = await fetch(packUrl, { method: 'GET' })
  if (!res.ok) {
    throw new Error(`pack fetch failed ${res.status}`)
  }
  return await res.text()
}

/**
 * Copy text to clipboard with fallback to a hidden textarea. The
 * navigator.clipboard API requires HTTPS + a user gesture (both satisfied
 * when this runs from an onClick handler on a button).
 */
async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to textarea fallback */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

/**
 * The main entry point. Wired to the Activate button in EmpireTimeline-d.tsx
 * and BottomIndexedTable.tsx.
 */
export async function activateSkill(opts: ActivateOptions): Promise<ActivationTier> {
  const { slug, packUrl, tier, customwareAnswers } = opts
  trackFunnel('activate_clicked', { slug, tier, path_taken: 'web_clipboard' })

  const mobile = isMobile()

  // Try to fetch the pack body so the clipboard carries the full SKILL.md.
  let body: string
  try {
    body = await fetchPackBody(packUrl)
  } catch {
    // If the fetch fails, fall back to a public-URL-fetch seed prompt.
    body = `Fetch the file at ${packUrl} and install it as a skill in this project. Then walk me through activation.`
  }

  // Customware: substitute `{{TOKEN}}` placeholders and strip tier-aware
  // install rows that do not match the user's surface. Intake answers come
  // from `intake-state.ts` (canonical key `hoistos.intake.v1`). Per-pack
  // answers come from the optional `customwareAnswers` opt.
  const intakeAnswers = readIntakeAnswers()
  body = applyCustomware(body, intakeAnswers, customwareAnswers ?? {})

  // Tier A: Desktop launch, only if the user has explicitly opted in.
  // The full body is already on the clipboard. The app opens to a blank chat.
  if (preferDesktopDeepLink() && !mobile) {
    try {
      const desktopUrl = 'claude://claude.ai/new'
      trackFunnel('desktop_deeplink_fired', { slug, tier })
      window.location.href = desktopUrl
      await writeClipboard(body)
      markActivated(slug)
      window.dispatchEvent(new Event('scrolophyte:activated'))
      return 'desktop_deeplink'
    } catch {
      /* fall through to clipboard */
    }
  }

  // Tier B (default): clipboard + new tab + toast.
  const copied = await writeClipboard(body)
  if (copied) {
    trackFunnel('clipboard_copied', {
      slug,
      tier,
      prompt_size_bytes: body.length,
    })
  } else {
    trackFunnel('clipboard_failed', { slug, tier })
  }

  let opened: Window | null = null
  try {
    opened = window.open('https://claude.ai/new', '_blank', 'noopener')
    if (opened) {
      trackFunnel('claude_tab_opened', { slug, tier })
    }
  } catch {
    /* popup blocked: still show the toast so the user can act */
  }

  if (copied) {
    toast.success(
      mobile
        ? 'Installed. Pack copied to clipboard. Paste in Claude, or open on desktop for the full experience.'
        : 'Installed. Pack copied to clipboard. Paste with Cmd-V (or Ctrl-V) in the Claude tab that just opened.',
      { duration: 7000 },
    )
  } else if (opened) {
    toast(
      'Claude opened in a new tab. Copy the pack from the page below and paste it in.',
      { duration: 7000 },
    )
  } else {
    toast.error(
      'Activation blocked. Allow popups and clipboard access, then try again.',
      { duration: 7000 },
    )
  }
  trackFunnel('toast_shown', { slug, tier, path_taken: 'web_clipboard' })

  markActivated(slug)
  window.dispatchEvent(new Event('scrolophyte:activated'))

  return copied ? 'web_clipboard' : 'fallback_download'
}
