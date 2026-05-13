/**
 * EmpireTimelinePage. Renders the /foundation route.
 *
 * S199 Empire Wireframe v6 close: rebuilt EmpireTimeline-d in C-v2 design
 * language (parchment + Newsreader serif + click-to-expand with foundation
 * packs first).
 *
 * S205 2026-05-13 fix sprint: /foundation route swapped from chronological
 * EmpireTimelineD reader to the per-pack "Your installed system" grid
 * (EmpireFoundationGrid). The chronological story survives at /timeline
 * via EmpireStoryPage below, unchanged. This solves the VP-demo complaint
 * that after install the user could not tell what they got, whether it
 * worked, or how to use it.
 *
 * Hard Rule #11: no em dashes anywhere in this module.
 * Hard Rule #31: react-hot-toast@2.6.0 Toaster named export. Verified via
 * context7 query 2026-05-08; still current.
 *
 * Context7: react-hot-toast@2.6.0 Toaster (named export, position prop +
 * toastOptions.style + toastOptions.success.iconTheme). No API change.
 */

import { Toaster } from 'react-hot-toast'
import { EmpireTimelineD } from '../components/EmpireTimeline-d'
import { TIMELINE_D_REAL } from './content/timeline-d-real'
import { EmpireFoundationGrid } from './EmpireFoundationGrid'

export function EmpireTimelinePage() {
  return (
    <div style={{ background: '#f5f4ed', color: '#141413' }}>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(20,20,19,0.95)',
            color: '#f5f4ed',
            borderRadius: '12px',
            fontSize: '14px',
            border: '1px solid rgba(204,110,46,0.4)',
            padding: '14px 18px',
            boxShadow: '0 18px 40px rgba(204,110,46,0.18)',
            fontFamily: "'Newsreader', serif",
          },
          success: {
            iconTheme: { primary: '#cc6e2e', secondary: '#f5f4ed' },
          },
        }}
      />
      <EmpireFoundationGrid />
    </div>
  )
}

export default EmpireTimelinePage

// ---------------------------------------------------------------------------
// EmpireStoryPage: chronological narrative ONLY (the /timeline route after
// the 4-tab IA split 2026-05-11). Foundation cards moved to /foundation
// route via EmpireTimelinePage with mode='foundation'.
// ---------------------------------------------------------------------------
export function EmpireStoryPage() {
  return (
    <div style={{ background: '#f5f4ed', color: '#141413' }}>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(20,20,19,0.95)',
            color: '#f5f4ed',
            borderRadius: '12px',
            fontSize: '14px',
            border: '1px solid rgba(204,110,46,0.4)',
            padding: '14px 18px',
            boxShadow: '0 18px 40px rgba(204,110,46,0.18)',
            fontFamily: "'Newsreader', serif",
          },
          success: {
            iconTheme: { primary: '#cc6e2e', secondary: '#f5f4ed' },
          },
        }}
      />
      <EmpireTimelineD moments={TIMELINE_D_REAL} mode="story" />
    </div>
  )
}
