/**
 * Tier config registry. Modularity floor: every tier-aware UI surface
 * (SegmentedTrackerBar tier chip row, EmpirePacksGallery filter chip row,
 * PackCard tier badge, CommandCenter Your Stack tab) reads from this
 * array. To launch Premium or Business or Power later, flip visible:true
 * here and every consumer surfaces the chip automatically with NO
 * component code change.
 *
 * Round 6 v3 spec: only Foundation and Advanced render visible chips in
 * the UI right now. Business + Power + Premium ship in the data model as
 * future-flags. See plan: are-we-ready-for-merry-snowflake.md, "What is
 * locked" section.
 */

export type TierId = 'foundation' | 'advanced' | 'business' | 'power' | 'premium'

export interface TierConfig {
  /** Stable kebab-case id, used as filter param + CSS data-tier hook. */
  id: TierId
  /** Display label rendered on the chip. Capitalized. */
  label: string
  /** Single-letter glyph rendered inside the colored circle on the chip. */
  glyph: string
  /** Hex color for the tier dot + chip border. */
  color: string
  /** When true, the chip renders in the UI. When false, the tier exists
   * in the data model but is hidden from every visible surface. */
  visible: boolean
  /** Render order from left to right on chip rows. */
  order: number
}

export const TIERS: TierConfig[] = [
  {
    id: 'foundation',
    label: 'Foundation',
    glyph: 'F',
    color: '#E2541C',
    visible: true,
    order: 1,
  },
  {
    id: 'advanced',
    label: 'Advanced',
    glyph: 'A',
    color: '#C89A3C',
    visible: true,
    order: 2,
  },
  {
    id: 'business',
    label: 'Business',
    glyph: 'B',
    color: '#4A89DC',
    visible: false,
    order: 3,
  },
  {
    id: 'power',
    label: 'Power',
    glyph: 'P',
    color: '#8E5BC2',
    visible: false,
    order: 4,
  },
  {
    id: 'premium',
    label: 'Premium',
    glyph: 'P+',
    color: '#C89A3C',
    visible: false,
    order: 5,
  },
]

export const VISIBLE_TIERS: TierConfig[] = TIERS.filter((t) => t.visible).sort(
  (a, b) => a.order - b.order,
)

export function findTier(id: TierId): TierConfig | undefined {
  return TIERS.find((t) => t.id === id)
}
