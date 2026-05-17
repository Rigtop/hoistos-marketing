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
 * via EmpireStoryPage below, unchanged.
 *
 * Hard Rule #11: no em dashes anywhere in this module.
 */

import { EmpireTimelineD } from '../components/EmpireTimeline-d'
import { TIMELINE_D_REAL } from './content/timeline-d-real'
import { EmpireFoundationGrid } from './EmpireFoundationGrid'

export function EmpireTimelinePage() {
  return (
    <div style={{ background: '#f5f4ed', color: '#141413' }}>
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
      <EmpireTimelineD moments={TIMELINE_D_REAL} mode="story" />
    </div>
  )
}
