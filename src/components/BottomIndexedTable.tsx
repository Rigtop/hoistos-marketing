/**
 * BottomIndexedTable: terminal section of EmpireTimeline-d.
 *
 * Renders all 30 chronological items as a filterable indexed table.
 * Sticky-header table with category filter pills, hover-row highlight,
 * download buttons for the 16 active packs, and a "narrative-only"
 * badge for the 14 non-pack items.
 *
 * Data source: TimelineDMoment[] passed in via props.
 *
 * Hard Rule #11: zero em dashes.
 */

import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { FileText, Filter, ArrowUpDown, Wand2 } from 'lucide-react'

import { CATEGORY_ACCENT, type AhaCategory } from '../empire/content/types'
import type { TimelineDMoment } from '../empire/content/timeline-d-mock'
import { activateSkill } from '../lib/activate'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BottomIndexedTableProps {
  /** All 30 items in chronological order. */
  items: TimelineDMoment[]
  /** Base path for pack download URLs. Defaults to /packs. */
  packBasePath?: string
  /** Optional className override on the section wrapper. */
  className?: string
  /** Optional id for anchor linking from the rest of the scroll. */
  sectionId?: string
}

type CategoryFilter = AhaCategory | 'all'
type TierFilter =
  | 'all'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'power'
  | 'narrative-only'
type SortKey = 'itemNumber' | 'score' | 'estimatedActivationMinutes'

// ---------------------------------------------------------------------------
// Tier visual config
// ---------------------------------------------------------------------------

const TIER_LABEL: Record<NonNullable<TimelineDMoment['packTier']>, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  power: 'Power',
}

const TIER_DOT_COLOR: Record<NonNullable<TimelineDMoment['packTier']>, string> = {
  beginner: '#10B981', // emerald
  intermediate: '#0EA5E9', // sky
  advanced: '#6366F1', // indigo
  power: 'rgb(var(--color-accent))', // signal orange
}

const CATEGORY_LABEL: Record<AhaCategory, string> = {
  architecture: 'Architecture',
  skill: 'Skill',
  automation: 'Automation',
  rule: 'Rule',
  vibes: 'Vibes',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BottomIndexedTable({
  items,
  packBasePath = '/packs',
  className = '',
  sectionId = 'index',
}: BottomIndexedTableProps) {
  const reduce = useReducedMotion()
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [tierFilter, setTierFilter] = useState<TierFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('itemNumber')
  const [sortAsc, setSortAsc] = useState(true)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  // Counts for filter pills, computed once per items change.
  const counts = useMemo(() => {
    const total = items.length
    const byCategory: Record<AhaCategory, number> = {
      architecture: 0,
      skill: 0,
      automation: 0,
      rule: 0,
      vibes: 0,
    }
    let packs = 0
    let narrative = 0
    for (const it of items) {
      byCategory[it.category]++
      if (it.hasPack) packs++
      else narrative++
    }
    return { total, byCategory, packs, narrative }
  }, [items])

  // Filter + sort pipeline.
  const visible = useMemo(() => {
    const filtered = items.filter((it) => {
      if (categoryFilter !== 'all' && it.category !== categoryFilter) return false
      if (tierFilter === 'all') return true
      if (tierFilter === 'narrative-only') return !it.hasPack
      return it.hasPack && it.packTier === tierFilter
    })

    const sorted = [...filtered].sort((a, b) => {
      let av: number
      let bv: number
      switch (sortKey) {
        case 'score':
          av = a.score
          bv = b.score
          break
        case 'estimatedActivationMinutes':
          av = a.estimatedActivationMinutes ?? -1
          bv = b.estimatedActivationMinutes ?? -1
          break
        case 'itemNumber':
        default:
          av = a.itemNumber
          bv = b.itemNumber
      }
      const diff = av - bv
      return sortAsc ? diff : -diff
    })

    return sorted
  }, [items, categoryFilter, tierFilter, sortKey, sortAsc])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc)
    else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  return (
    <section
      id={sectionId}
      className={`relative w-full bg-paper py-24 md:py-32 ${className}`}
      aria-labelledby={`${sectionId}-heading`}
    >
      {/* Section header */}
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink/40">
            The complete index
          </p>
          <h2
            id={`${sectionId}-heading`}
            className="mt-3 font-serif text-4xl text-ink md:text-6xl"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            All 30 moments. 16 you can install.
          </h2>
          <p className="mt-4 max-w-2xl text-base text-ink/70 md:text-lg">
            Filter by category or tier. The packs link to a downloadable
            installer that drops the substrate into a clean Mac in under
            three hours of attended setup.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 border-y border-ink/10 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-ink/50">
              <Filter className="h-3.5 w-3.5" aria-hidden />
              Category
            </span>
            <FilterPill
              label={`All (${counts.total})`}
              active={categoryFilter === 'all'}
              onClick={() => setCategoryFilter('all')}
            />
            {(Object.keys(CATEGORY_LABEL) as AhaCategory[]).map((c) => (
              <FilterPill
                key={c}
                label={`${CATEGORY_LABEL[c]} (${counts.byCategory[c]})`}
                active={categoryFilter === c}
                onClick={() => setCategoryFilter(c)}
                accent={CATEGORY_ACCENT[c]}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-xs font-medium uppercase tracking-wider text-ink/50">
              Tier
            </span>
            <FilterPill
              label={`All (${counts.total})`}
              active={tierFilter === 'all'}
              onClick={() => setTierFilter('all')}
            />
            <FilterPill
              label={`Packs (${counts.packs})`}
              active={tierFilter === 'beginner' || tierFilter === 'intermediate' || tierFilter === 'advanced' || tierFilter === 'power'}
              onClick={() => setTierFilter('beginner')}
            />
            <FilterPill
              label={`Narrative (${counts.narrative})`}
              active={tierFilter === 'narrative-only'}
              onClick={() => setTierFilter('narrative-only')}
            />
          </div>
        </div>

        {/* Tier sub-pills, only when "Packs" is active */}
        {tierFilter !== 'all' && tierFilter !== 'narrative-only' && (
          <div className="-mt-4 mb-6 flex flex-wrap items-center gap-2">
            {(['beginner', 'intermediate', 'advanced', 'power'] as const).map((t) => (
              <FilterPill
                key={t}
                label={TIER_LABEL[t]}
                active={tierFilter === t}
                onClick={() => setTierFilter(t)}
                accent={TIER_DOT_COLOR[t]}
              />
            ))}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-ink/10 bg-white/60 shadow-sm backdrop-blur-sm">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-paper/95 backdrop-blur">
              <tr className="border-b border-ink/10 text-xs font-semibold uppercase tracking-wider text-ink/60">
                <th className="px-4 py-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 hover:text-ink"
                    onClick={() => toggleSort('itemNumber')}
                  >
                    #
                    <ArrowUpDown className="h-3 w-3 opacity-50" aria-hidden />
                  </button>
                </th>
                <th className="px-4 py-3">Title</th>
                <th className="hidden px-4 py-3 md:table-cell">Session</th>
                <th className="hidden px-4 py-3 md:table-cell">Category</th>
                <th className="hidden px-4 py-3 lg:table-cell">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 hover:text-ink"
                    onClick={() => toggleSort('score')}
                  >
                    Score
                    <ArrowUpDown className="h-3 w-3 opacity-50" aria-hidden />
                  </button>
                </th>
                <th className="hidden px-4 py-3 lg:table-cell">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 hover:text-ink"
                    onClick={() => toggleSort('estimatedActivationMinutes')}
                  >
                    Activation
                    <ArrowUpDown className="h-3 w-3 opacity-50" aria-hidden />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">Pack</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((it) => {
                const accent = CATEGORY_ACCENT[it.category]
                const isHovered = hoveredRow === it.id
                return (
                  <tr
                    key={it.id}
                    onMouseEnter={() => setHoveredRow(it.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    className="group border-b border-ink/5 transition-colors last:border-b-0"
                    style={{
                      backgroundColor: isHovered ? `${accent}0C` : undefined,
                    }}
                  >
                    <td className="px-4 py-4 align-top">
                      <span
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-mono font-semibold"
                        style={{
                          background: `${accent}14`,
                          color: accent,
                        }}
                      >
                        {String(it.itemNumber).padStart(2, '0')}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <a
                        href={`#item-${it.itemNumber}`}
                        className="block font-medium text-ink hover:underline"
                      >
                        {it.title}
                      </a>
                      <p className="mt-1 line-clamp-2 max-w-xl text-xs text-ink/55">
                        {it.aha}
                      </p>
                    </td>
                    <td className="hidden px-4 py-4 align-top font-mono text-xs text-ink/60 md:table-cell">
                      {it.sessionShipped}
                      <div className="text-ink/40">{it.dateShipped}</div>
                    </td>
                    <td className="hidden px-4 py-4 align-top md:table-cell">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          background: `${accent}14`,
                          color: accent,
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: accent }}
                          aria-hidden
                        />
                        {CATEGORY_LABEL[it.category]}
                      </span>
                    </td>
                    <td className="hidden px-4 py-4 align-top text-xs lg:table-cell">
                      <span className="font-mono font-semibold text-ink/80">
                        {it.score}
                      </span>
                      <span className="text-ink/40">/12</span>
                    </td>
                    <td className="hidden px-4 py-4 align-top text-xs text-ink/70 lg:table-cell">
                      {it.estimatedActivationMinutes
                        ? `${it.estimatedActivationMinutes} min`
                        : 'n/a'}
                    </td>
                    <td className="px-4 py-4 text-right align-top">
                      {it.hasPack && it.packSlug && it.packTier ? (
                        <button
                          type="button"
                          onClick={() =>
                            activateSkill({
                              slug: it.packSlug!,
                              packUrl: `${packBasePath}/${it.packSlug}.md`,
                              tier: it.packTier,
                            })
                          }
                          className="group/btn relative inline-flex items-center gap-2 rounded-md border border-ink/15 bg-white px-3 py-1.5 text-xs font-medium text-ink transition-all hover:-translate-y-0.5 hover:border-ink/40 hover:shadow"
                          aria-label={`Activate ${it.packSlug} in Claude`}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: TIER_DOT_COLOR[it.packTier] }}
                            aria-hidden
                          />
                          {TIER_LABEL[it.packTier]}
                          <Wand2
                            className="h-3.5 w-3.5 opacity-60 transition-opacity group-hover/btn:opacity-100"
                            aria-hidden
                          />
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-ink/15 bg-transparent px-3 py-1.5 text-xs text-ink/45">
                          <FileText className="h-3.5 w-3.5" aria-hidden />
                          Narrative only
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {visible.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-ink/50"
                  >
                    No items match the active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        <div className="mt-6 flex flex-col items-start justify-between gap-2 text-xs text-ink/55 md:flex-row md:items-center">
          <p>
            Showing <strong className="font-mono text-ink">{visible.length}</strong>
            {' '}
            of {items.length} items.
            {' '}
            {visible.filter((v) => v.hasPack).length} active pack
            {visible.filter((v) => v.hasPack).length === 1 ? '' : 's'} in this view.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink/35">
            S198 Scrolophyte release. v1.0.0
          </p>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Internal: filter pill button
// ---------------------------------------------------------------------------

function FilterPill({
  label,
  active,
  onClick,
  accent,
}: {
  label: string
  active: boolean
  onClick: () => void
  accent?: string
}) {
  const ring = accent ?? 'rgb(var(--color-accent))'
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-3 py-1 text-xs font-medium transition-all"
      style={
        active
          ? {
              background: `${ring}1A`,
              borderColor: `${ring}66`,
              color: ring,
            }
          : {
              background: 'transparent',
              borderColor: 'rgb(0 0 0 / 0.1)',
              color: 'rgb(0 0 0 / 0.6)',
            }
      }
    >
      {label}
    </button>
  )
}

export default BottomIndexedTable
