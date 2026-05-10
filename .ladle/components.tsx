import { useEffect } from 'react'
import type { GlobalProvider } from '@ladle/react'
import '../src/index.css'
import { ToastProvider } from '../src/components/Toast'

/**
 * Ladle global provider. Wraps every story.
 *
 * Reads Ladle's global theme state (light or dark via toolbar toggle) and
 * maps it to our two brand presets:
 *   light  -> claude (warm parchment)
 *   dark   -> hoistos (obsidian + signal orange)
 *
 * ToastProvider is always present so stories can demo useToast() if needed.
 * Lenis is intentionally OFF in stories (would smooth-scroll inside iframe).
 */
export const Provider: GlobalProvider = ({ children, globalState }) => {
  const themeName = globalState.theme === 'light' ? 'claude' : 'hoistos'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeName)
  }, [themeName])

  return (
    <ToastProvider>
      <div className="min-h-screen p-8" style={{ background: 'rgb(var(--color-bg))', color: 'rgb(var(--color-fg))' }}>
        {children}
      </div>
    </ToastProvider>
  )
}
