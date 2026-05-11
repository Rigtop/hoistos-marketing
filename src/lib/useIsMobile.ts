/**
 * useIsMobile. SSR-safe matchMedia hook for inline-style components that
 * cannot lean on Tailwind responsive utilities.
 *
 * The Empire surface (EmpireLayout, EmpireTimeline-d) renders most of its
 * chrome through `style={{ ... }}` attributes with fixed-pixel grid columns
 * and explicit padding values. Those values are not responsive to viewport
 * width on their own; this hook gives those components a boolean they can
 * branch on to swap to mobile-fitted geometry below the chosen breakpoint.
 *
 * Breakpoint is 767px to align with Tailwind's `md:` boundary used across
 * the rest of the codebase. Above 768px, components render their desktop
 * layout. At or below 767px, they swap to mobile geometry.
 *
 * subscribe + getSnapshot are hoisted to module scope so their function
 * identity stays stable across renders. The react.dev docs warn that
 * unstable subscribe identity will cause React to resubscribe on every
 * render; stable identity avoids that.
 *
 * Hard Rule #11: no em dashes anywhere in this file.
 * Context7: react@19.2.5 `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)`
 *   stable concurrent-safe external-store primitive per react.dev docs
 *   (verified May 2026 via context7 query). Server snapshot must be a
 *   stable value when SSR is present; this site is client-only so it
 *   only fires once on first paint. matchMedia uses `addEventListener
 *   ('change', cb)` on all Safari 14+ and evergreen browsers, with
 *   `addListener` retained as a fallback for Safari 13.
 */

import { useSyncExternalStore } from 'react'

const QUERY = '(max-width: 767px)'

function subscribe(callback: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const mql = window.matchMedia(QUERY)
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', callback)
    return () => mql.removeEventListener('change', callback)
  }
  // Safari 13 fallback. `addListener` is deprecated but still functional.
  mql.addListener(callback)
  return () => mql.removeListener(callback)
}

function getSnapshot(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(QUERY).matches
}

function getServerSnapshot(): boolean {
  // No SSR on this site; this only fires for the very first paint frame
  // before the client snapshot replaces it. Desktop-first default keeps
  // the initial paint identical to pre-hook behavior.
  return false
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export default useIsMobile
