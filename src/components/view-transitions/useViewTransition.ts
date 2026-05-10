/**
 * useViewTransition: thin wrapper around document.startViewTransition.
 *
 * The native browser View Transitions API lets you morph DOM state changes
 * smoothly. Chrome + Safari support landed in 2025. Falls back to plain
 * synchronous update when unsupported.
 *
 * Usage:
 *   const transition = useViewTransition()
 *   transition(() => setRoute('about'))
 *
 * Pair with [view-transition-name: <id>] CSS on shared elements to morph.
 */
export function useViewTransition() {
  return function startTransition(update: () => void): void {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }
    if (typeof doc.startViewTransition === 'function') {
      doc.startViewTransition(update)
    } else {
      update()
    }
  }
}
