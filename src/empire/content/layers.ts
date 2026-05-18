/**
 * Layer config registry. Modularity floor: SegmentedTrackerBar reads
 * from this array to render N segments via flex-1. Adding a 6th layer
 * later means pushing one object here. Every consumer (the tracker bar,
 * the capability map, the CommandCenter byLayer counters, the rankNextPacks
 * grouping) iterates the same array, never a hardcoded list.
 *
 * Round 6 v3 spec: 5 layers. Color hexes match mockup-A-v3.html CSS vars.
 * totalPacks is the denominator shown next to each segment ("0/8"); when
 * foundation-cards.ts grows past 43 packs, update these counts to match.
 */

export type LayerId = 'voice' | 'memory' | 'sources' | 'routing' | 'validation'

export interface LayerConfig {
  /** Stable kebab-case id, used everywhere as the join key. */
  id: LayerId
  /** Display label rendered above each segment. */
  label: string
  /** URL slug for per-layer routes. */
  slug: string
  /** Hex color for the segment fill + label accent. */
  color: string
  /** Render order from left to right on the segmented bar. */
  order: number
  /** Total packs in this layer across all tiers. Denominator for the
   * "N/M" count next to each segment label. */
  totalPacks: number
}

export const LAYERS: LayerConfig[] = [
  {
    id: 'voice',
    label: 'Voice',
    slug: 'voice',
    color: '#E2541C',
    order: 1,
    totalPacks: 8,
  },
  {
    id: 'memory',
    label: 'Memory',
    slug: 'memory',
    color: '#4A89DC',
    order: 2,
    totalPacks: 9,
  },
  {
    id: 'sources',
    label: 'Sources',
    slug: 'sources',
    color: '#C89A3C',
    order: 3,
    totalPacks: 9,
  },
  {
    id: 'routing',
    label: 'Routing',
    slug: 'routing',
    color: '#8E5BC2',
    order: 4,
    totalPacks: 9,
  },
  {
    id: 'validation',
    label: 'Validation',
    slug: 'validation',
    color: '#4FA37A',
    order: 5,
    totalPacks: 8,
  },
]

export const LAYERS_BY_ORDER: LayerConfig[] = [...LAYERS].sort(
  (a, b) => a.order - b.order,
)

export function findLayer(id: LayerId): LayerConfig | undefined {
  return LAYERS.find((l) => l.id === id)
}

/** Convenience map used by SegmentedTrackerBar count display. */
export const LAYER_TOTALS: Record<LayerId, number> = LAYERS.reduce(
  (acc, l) => {
    acc[l.id] = l.totalPacks
    return acc
  },
  {} as Record<LayerId, number>,
)
