/**
 * SegmentedTrackerBar. Full-width fixed-top progress strip rendered on every
 * /empire route. Replaces the prior JourneyTrackerBar.
 *
 * Mockup reference: mockup-A-v3.html lines 34-90 (CSS), 235-272 (markup).
 *
 * Structure:
 *   Row 1: "Your Claude N/43" eyebrow + tier-toggle chip row + level display.
 *   Row 2: 5-segment progress bar, one segment per layer (voice, memory,
 *          sources, routing, validation), fill driven by listActivated()
 *          intersected with FOUNDATION_CARDS grouped by layer.
 *   Row 3: 5 layer labels with "N/M" counts.
 *   Click on any segment opens a detail panel inline below the bar listing
 *   installed packs in that layer plus the next-recommended pack.
 *
 * Hard Rule #11: no em dashes.
 * R047 voice: no banned openers, plain English.
 * R087 plain English: sentence-case prose, no ALL-CAPS body labels.
 * R067 mobile-first: tier-strip and segment labels collapse legibly at
 *   320 / 375 / 768 widths.
 * Context7 (HR #31): react@19.2.5 useState/useEffect/useMemo verified live
 *   2026-05-18 via context7 query. motion@12.38 motion.div + AnimatePresence
 *   + useReducedMotion from motion/react verified live 2026-05-18.
 *   lucide-react@1.14 named exports with size/color/strokeWidth props +
 *   aria-hidden auto-applied verified live 2026-05-18.
 */

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronRight, X } from 'lucide-react'
import { LAYERS_BY_ORDER, type LayerConfig, type LayerId } from './content/layers'
import { TIERS } from './content/tiers'
import { computeLevel, computeNextLevel, packsToNextLevel } from './content/levels'
import { FOUNDATION_CARDS, type FoundationCard } from './content/foundation-cards'
import { listActivated, onActivatedChange } from '../lib/activate'
import { rankNextPacks } from '../lib/compounding-ranker'
import { useIsMobile } from '../lib/useIsMobile'
import { readIntake } from '../lib/intake-state'

const TOTAL_PACKS = LAYERS_BY_ORDER.reduce((sum, l) => sum + l.totalPacks, 0)

function normalizeLayer(cardLayer: FoundationCard['layer']): LayerId {
  return cardLayer.toLowerCase() as LayerId
}

function useInstalledCount(): {
  ids: string[]
  total: number
  perLayer: Record<LayerId, number>
} {
  const [ids, setIds] = useState<string[]>(() => listActivated())
  useEffect(() => onActivatedChange(() => setIds(listActivated())), [])
  return useMemo(() => {
    const set = new Set(ids)
    const perLayer: Record<LayerId, number> = {
      voice: 0,
      memory: 0,
      sources: 0,
      routing: 0,
      validation: 0,
    }
    for (const card of FOUNDATION_CARDS) {
      if (set.has(card.packId)) {
        perLayer[normalizeLayer(card.layer)] += 1
      }
    }
    return { ids, total: ids.length, perLayer }
  }, [ids])
}

function useIntakeOutcomeTags(): string[] {
  const intake = readIntake()
  const q2 = (intake as unknown as { q2Pains?: string[] }).q2Pains ?? []
  const mapping: Record<string, string> = {
    emails: 'faster emails',
    proposals: 'faster proposals',
    team: 'team enablement',
    contracts: 'contract risk',
    billing: 'faster emails',
    decisions: 'decision tracking',
    meetings: 'meeting capture',
    voice: 'faster emails',
  }
  const tags = q2.map((p) => mapping[p]).filter((t): t is string => typeof t === 'string')
  if (tags.length === 0 && intake.outcomes) {
    const oMap: Record<string, string> = {
      'faster-emails': 'faster emails',
      'faster-proposals': 'faster proposals',
      'team-enablement': 'team enablement',
      'contract-risk-review': 'contract risk',
      'meeting-capture': 'meeting capture',
      'decision-tracking': 'decision tracking',
      'knowledge-search': 'knowledge search',
      'rag-retrieval': 'rag retrieval',
    }
    for (const [key, val] of Object.entries(intake.outcomes)) {
      if ((val ?? 0) > 0 && oMap[key]) tags.push(oMap[key])
    }
  }
  return tags
}

export function SegmentedTrackerBar() {
  const isMobile = useIsMobile()
  const reduce = useReducedMotion()
  const { ids: installed, total, perLayer } = useInstalledCount()
  const level = computeLevel(total)
  const nextLevel = computeNextLevel(total)
  const toNext = packsToNextLevel(total)
  const intakeTags = useIntakeOutcomeTags()

  const [openLayer, setOpenLayer] = useState<LayerId | null>(null)
  const [activeTier, setActiveTier] = useState<string>('all')

  const nextPicks = useMemo(
    () => rankNextPacks(installed, intakeTags, FOUNDATION_CARDS),
    [installed, intakeTags],
  )

  function toggleLayer(id: LayerId) {
    setOpenLayer((prev) => (prev === id ? null : id))
  }

  const visibleTiers = useMemo(() => TIERS.filter((t) => t.visible), [])

  return (
    <div
      data-component="segmented-tracker-bar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(251, 250, 243, 0.96)',
        backdropFilter: 'saturate(180%) blur(14px)',
        WebkitBackdropFilter: 'saturate(180%) blur(14px)',
        borderBottom: '1px solid rgba(20, 20, 10, 0.08)',
        padding: isMobile ? '10px 16px 10px' : '14px 28px 12px',
        fontFamily: "'Newsreader', Georgia, serif",
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: isMobile ? 8 : 20,
          marginBottom: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span
            style={{
              fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#8A8A78',
            }}
          >
            Your Claude
          </span>
          <span
            style={{
              fontFamily: "'Newsreader', Georgia, serif",
              fontSize: isMobile ? 22 : 28,
              fontWeight: 700,
              color: '#14140A',
              lineHeight: 1,
            }}
          >
            {total}
          </span>
          <span
            style={{
              fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
              fontSize: 11,
              color: '#8A8A78',
            }}
          >
            / {TOTAL_PACKS}
          </span>
        </div>

        {!isMobile ? (
          <div
            role="tablist"
            aria-label="Pack tier filter"
            style={{
              display: 'flex',
              gap: 4,
              padding: 4,
              background: 'rgba(20, 20, 10, 0.04)',
              borderRadius: 12,
            }}
          >
            <TierChip
              label="All"
              count={TOTAL_PACKS}
              active={activeTier === 'all'}
              onClick={() => setActiveTier('all')}
            />
            {visibleTiers.map((t) => (
              <TierChip
                key={t.id}
                label={t.label}
                glyph={t.glyph}
                color={t.color}
                count={tierCount(t.id)}
                active={activeTier === t.id}
                onClick={() => setActiveTier(t.id)}
              />
            ))}
          </div>
        ) : null}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'Newsreader', Georgia, serif",
              fontSize: isMobile ? 28 : 36,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #E2541C, #FF7A3C)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: '#E2541C',
              lineHeight: 1,
            }}
          >
            {level.num}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span
              style={{
                fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#8A8A78',
              }}
            >
              {level.name}
            </span>
            <span
              style={{
                fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
                fontSize: 9,
                color: '#8A8A78',
              }}
            >
              {nextLevel
                ? `${toNext} pack${toNext === 1 ? '' : 's'} to Level ${nextLevel.num}`
                : 'Top level'}
            </span>
          </div>
        </div>
      </div>

      <div
        role="group"
        aria-label="Layer progress"
        style={{
          display: 'flex',
          gap: 4,
          height: 14,
          borderRadius: 9,
          background: 'rgba(20,20,10,0.04)',
          padding: 3,
        }}
      >
        {LAYERS_BY_ORDER.map((layer) => {
          const installedInLayer = perLayer[layer.id]
          const pct = layer.totalPacks > 0 ? (installedInLayer / layer.totalPacks) * 100 : 0
          const isOpen = openLayer === layer.id
          return (
            <button
              key={layer.id}
              type="button"
              role="tab"
              aria-selected={isOpen}
              aria-label={`${layer.label}: ${installedInLayer} of ${layer.totalPacks} installed. Open detail.`}
              onClick={() => toggleLayer(layer.id)}
              style={{
                flex: 1,
                borderRadius: 6,
                background: 'rgba(20,20,10,0.05)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                minHeight: 8,
              }}
            >
              <motion.div
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={
                  reduce ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
                }
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  background: layer.color,
                  borderRadius: 6,
                }}
              />
            </button>
          )
        })}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 4,
          marginTop: 6,
          padding: '0 3px',
        }}
      >
        {LAYERS_BY_ORDER.map((layer) => (
          <div
            key={layer.id}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
              fontSize: 9,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#8A8A78',
            }}
          >
            <span>{layer.label}</span>
            <span style={{ color: '#14140A', fontWeight: 700 }}>
              {perLayer[layer.id]}/{layer.totalPacks}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {openLayer ? (
          <motion.div
            key={openLayer}
            initial={reduce ? false : { opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, height: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              overflow: 'hidden',
              marginTop: 12,
              borderTop: '1px solid rgba(20,20,10,0.08)',
              paddingTop: 12,
            }}
          >
            <LayerDetail
              layer={LAYERS_BY_ORDER.find((l) => l.id === openLayer)!}
              installedInLayer={FOUNDATION_CARDS.filter(
                (c) =>
                  normalizeLayer(c.layer) === openLayer && installed.includes(c.packId),
              )}
              nextRecommended={nextPicks
                .map((p) => p.pack)
                .find((p) => normalizeLayer(p.layer) === openLayer)}
              onClose={() => setOpenLayer(null)}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

interface TierChipProps {
  label: string
  count: number
  active: boolean
  onClick: () => void
  glyph?: string
  color?: string
}

function TierChip({ label, count, active, onClick, glyph, color }: TierChipProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 8,
        border: 'none',
        background: active ? 'white' : 'transparent',
        color: active ? '#14140A' : '#8A8A78',
        cursor: 'pointer',
        fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
        fontSize: 10,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        boxShadow: active ? '0 2px 6px rgba(20,20,10,0.08)' : 'none',
        minHeight: 32,
      }}
    >
      {glyph ? (
        <span
          aria-hidden="true"
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: color ?? '#14140A',
            color: 'white',
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          {glyph}
        </span>
      ) : (
        <span style={{ fontWeight: 700 }}>{label[0]}</span>
      )}
      <span>{label}</span>
      <span
        style={{
          fontFamily: "'Newsreader', Georgia, serif",
          fontSize: 11,
          fontWeight: 700,
          color: active ? '#14140A' : '#4A4A3A',
        }}
      >
        {count}
      </span>
    </button>
  )
}

interface LayerDetailProps {
  layer: LayerConfig
  installedInLayer: FoundationCard[]
  nextRecommended: FoundationCard | undefined
  onClose: () => void
}

function LayerDetail({ layer, installedInLayer, nextRecommended, onClose }: LayerDetailProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: layer.color,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: layer.color,
            }}
          />
          {layer.label} layer
          <span style={{ color: '#14140A', marginLeft: 4 }}>
            {installedInLayer.length} of {layer.totalPacks} installed
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close layer detail"
          style={{
            width: 32,
            height: 32,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            color: '#4A4A3A',
            border: 'none',
            cursor: 'pointer',
            borderRadius: 6,
          }}
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>

      {installedInLayer.length === 0 ? (
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: '#4A4A3A',
            fontFamily: "'Newsreader', Georgia, serif",
          }}
        >
          Nothing installed in this layer yet.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {installedInLayer.map((card) => (
            <li
              key={card.packId}
              style={{
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 999,
                background: 'rgba(20,20,10,0.06)',
                color: '#14140A',
                fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
                letterSpacing: '0.04em',
              }}
            >
              {card.badge} {card.title}
            </li>
          ))}
        </ul>
      )}

      {nextRecommended ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: '#14140A',
            fontFamily: "'Newsreader', Georgia, serif",
          }}
        >
          <ChevronRight size={14} aria-hidden="true" />
          <span>
            Next up in this layer: <strong>{nextRecommended.title}</strong>. {nextRecommended.purpose}
          </span>
        </div>
      ) : null}
    </div>
  )
}

function tierCount(tierId: string): number {
  if (tierId === 'foundation') return FOUNDATION_CARDS.length
  if (tierId === 'advanced') return 7
  return TOTAL_PACKS
}

export default SegmentedTrackerBar
