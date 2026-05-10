/**
 * Ladle stories for EmpireTimeline-c (Treatment C: Histography +
 * Karpathy-graphify radial dependency graph). Renders the full graph with
 * mock data plus a few targeted stories so node hover, side panel, filter
 * pills, and pan/zoom can all be eyeballed in isolation via `npm run docs`.
 *
 * B2 Phase 4, S197 night, 2026-05-07.
 *
 * Hard Rule #11: zero em dashes.
 */

import type { Story } from '@ladle/react'
import EmpireTimelineC from './EmpireTimeline-c'
import { MOCK_AHA_MOMENTS } from '../empire/content/types'

export default {
  title: 'B2 · Empire Timeline · Treatment C',
}

/**
 * Full graph render against mock data. Wraps in a 100vh container so the
 * SVG canvas fills the viewport identically to the production /empire route.
 */
export const FullGraph: Story = () => (
  <div data-theme="hoistos-light" className="h-screen w-full">
    <EmpireTimelineC moments={MOCK_AHA_MOMENTS} />
  </div>
)

/**
 * Subset of three foundational moments. Useful for iterating on hover label
 * typography and side-panel layout without the full DAG of edges.
 */
export const ThreeMoments: Story = () => {
  const subset = MOCK_AHA_MOMENTS.filter((m) =>
    [
      'operating-constitution',
      'skill-creator-substrate',
      'rag-pgvector',
    ].includes(m.id),
  )
  return (
    <div data-theme="hoistos-light" className="h-screen w-full">
      <EmpireTimelineC moments={subset} headline="Three Foundational Aha" />
    </div>
  )
}

/**
 * Architecture-only filter slice. Verifies that the dim path on
 * non-matching nodes is visually distinct from the active set and that the
 * legend swatches still read correctly when the graph is sparse.
 */
export const ArchitectureSlice: Story = () => {
  const subset = MOCK_AHA_MOMENTS.filter(
    (m) => m.category === 'architecture',
  )
  return (
    <div data-theme="hoistos-light" className="h-screen w-full">
      <EmpireTimelineC
        moments={subset}
        headline="Architecture Aha Slice"
      />
    </div>
  )
}

/**
 * Two-node minimal sanity render. Confirms the force simulation does not
 * collapse to NaN when there is exactly one edge and one source / target
 * pair, and that the side panel still opens correctly.
 */
export const TwoNodeMinimal: Story = () => {
  const subset = MOCK_AHA_MOMENTS.filter((m) =>
    ['operating-constitution', 'session-briefing-close'].includes(m.id),
  )
  return (
    <div data-theme="hoistos-light" className="h-screen w-full">
      <EmpireTimelineC
        moments={subset}
        headline="Two Node Sanity"
        brandMark="HoistOS / B2c"
      />
    </div>
  )
}
