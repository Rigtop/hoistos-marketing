/**
 * SegmentedTrackerBar. Round 8 (2026-05-18) rewrite.
 *
 * Single unified chrome strip for every /empire route. Eats what used to be
 * three separate elements (the bar + the EmpireWorks band + the 3-pill tab
 * nav) so there is no cream gap, no dead zone, no visual stitch lines.
 *
 * Rows:
 *   1. EmpireWorks lockup left + "Your Claude N/43" eyebrow + tier-chip
 *      strip center + level display right.
 *   2. 5-segment progress bar with click-to-detail panel.
 *   3. 5 layer labels with N/M counts.
 *   4. 3-pill tab nav (Your Journey / Pack Catalog / Command Center) with
 *      orange active-state and motion.layoutId smooth slide.
 *
 * Tier chips (A1 gamification):
 *   - Hex-clip-path glyph badge per tier (Mockup B HUD vocabulary)
 *   - Active chip glows signal-orange with a motion.div layoutId slide
 *   - Locked tiers (Advanced this round) carry a small lock glyph + label
 *   - Click sets ?tier= URL param so EmpirePacksGallery reads same source
 *
 * Hard Rule #11: no em dashes.
 * R047 voice: no banned openers.
 * R087 plain English in copy.
 * R067 mobile-first: tier-strip collapses to glyph-only at <768, EW lockup
 *   collapses to flag glyph at <640.
 * Context7 (HR #31): react@19.2.5, motion@12.38, lucide-react@1.14, react-
 *   router-dom@7.15 useSearchParams + useNavigate + useLocation + Link all
 *   verified live 2026-05-18.
 */

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronRight, Lock, X } from 'lucide-react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { LAYERS_BY_ORDER, type LayerConfig, type LayerId } from './content/layers'
import { TIERS } from './content/tiers'
import { computeLevel, computeNextLevel, packsToNextLevel } from './content/levels'
import { FOUNDATION_CARDS, type FoundationCard } from './content/foundation-cards'
import { LOCKED_COUNT_BY_TIER } from './content/locked-packs'
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

type TabId = 'journey' | 'catalog' | 'stack'

const HEX_CLIP = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'

export function SegmentedTrackerBar() {
  const isMobile = useIsMobile()
  const reduce = useReducedMotion()
  const { ids: installed, total, perLayer } = useInstalledCount()
  const level = computeLevel(total)
  const nextLevel = computeNextLevel(total)
  const toNext = packsToNextLevel(total)
  const intakeTags = useIntakeOutcomeTags()

  const [openLayer, setOpenLayer] = useState<LayerId | null>(null)
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()

  const activeTier = params.get('tier') ?? 'all'
  const activeTab: TabId = parseTab(params.get('tab'))

  const nextPicks = useMemo(
    () => rankNextPacks(installed, intakeTags, FOUNDATION_CARDS),
    [installed, intakeTags],
  )

  function toggleLayer(id: LayerId) {
    setOpenLayer((prev) => (prev === id ? null : id))
  }

  function setTier(tierId: string) {
    const next = new URLSearchParams(params)
    if (tierId === 'all') next.delete('tier')
    else next.set('tier', tierId)
    setParams(next, { replace: true })
  }

  function goTab(tabId: TabId) {
    const next = new URLSearchParams(params)
    next.set('tab', tabId)
    setParams(next, { replace: false })
    const onEmpireRoute =
      location.pathname === '/empire' || location.pathname === '/empireworksreconstruction'
    if (!onEmpireRoute) {
      navigate(`/empire?${next.toString()}`, { replace: false })
    }
  }

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
        padding: isMobile ? '10px 14px 6px' : '12px 28px 8px',
        fontFamily: "'Newsreader', Georgia, serif",
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: isMobile ? 8 : 18,
          marginBottom: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <Link
            to="/empire"
            aria-label="EmpireWorks Reconstruction home"
            style={{ display: 'inline-flex', alignItems: 'center' }}
          >
            <img
              src="/brand/empireworks-lockup-v3.png"
              alt="EmpireWorks Reconstruction"
              style={{
                height: isMobile ? 24 : 32,
                width: 'auto',
                display: 'block',
                objectFit: 'contain',
              }}
            />
          </Link>
          <div
            aria-hidden="true"
            style={{
              width: 1,
              height: 22,
              background: 'rgba(20,20,10,0.12)',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                fontSize: isMobile ? 20 : 26,
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
        </div>

        {!isMobile ? (
          <TierChipStrip activeTier={activeTier} onSelect={setTier} reduce={reduce ?? false} />
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
              fontSize: isMobile ? 26 : 32,
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

      {isMobile ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 8,
            overflowX: 'auto',
          }}
        >
          <TierChipStrip activeTier={activeTier} onSelect={setTier} reduce={reduce ?? false} compact />
        </div>
      ) : null}

      <div
        role="group"
        aria-label="Layer progress"
        style={{
          display: 'flex',
          gap: 4,
          height: 12,
          borderRadius: 8,
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
                minHeight: 6,
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
                  boxShadow: `0 0 8px ${layer.color}66`,
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
          marginTop: 5,
          marginBottom: 8,
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

      <TabPillRow active={activeTab} onChange={goTab} isMobile={isMobile} />

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
              marginTop: 8,
              borderTop: '1px solid rgba(20,20,10,0.08)',
              paddingTop: 10,
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

function parseTab(v: string | null): TabId {
  if (v === 'catalog') return 'catalog'
  if (v === 'stack') return 'stack'
  return 'journey'
}

interface TierChipStripProps {
  activeTier: string
  onSelect: (tier: string) => void
  reduce: boolean
  compact?: boolean
}

function TierChipStrip({ activeTier, onSelect, reduce, compact }: TierChipStripProps) {
  const tiers = useMemo(() => TIERS.filter((t) => t.visible), [])
  return (
    <div
      role="tablist"
      aria-label="Pack tier filter"
      style={{
        display: 'flex',
        gap: 4,
        padding: 4,
        background: 'rgba(20, 20, 10, 0.04)',
        borderRadius: 12,
        position: 'relative',
      }}
    >
      <TierChip
        active={activeTier === 'all'}
        label="All"
        glyph="★"
        color="#14140A"
        count={43}
        onClick={() => onSelect('all')}
        reduce={reduce}
        compact={compact}
        layoutId="active-tier-pill"
      />
      {tiers.map((t) => {
        const count = tierCount(t.id)
        const locked = LOCKED_COUNT_BY_TIER[t.id] != null && t.id !== 'foundation'
        return (
          <TierChip
            key={t.id}
            active={activeTier === t.id}
            label={t.label}
            glyph={t.glyph}
            color={t.color}
            count={count}
            locked={locked}
            onClick={() => onSelect(t.id)}
            reduce={reduce}
            compact={compact}
            layoutId="active-tier-pill"
          />
        )
      })}
    </div>
  )
}

interface TierChipProps {
  active: boolean
  label: string
  glyph: string
  color: string
  count: number
  onClick: () => void
  reduce: boolean
  compact?: boolean
  locked?: boolean
  layoutId: string
}

function TierChip({
  active,
  label,
  glyph,
  color,
  count,
  onClick,
  reduce,
  compact,
  locked,
  layoutId,
}: TierChipProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-label={`${label} tier, ${count} packs${locked ? ', locked until ship' : ''}`}
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: compact ? '5px 10px' : '6px 12px',
        borderRadius: 8,
        border: 'none',
        background: 'transparent',
        color: active ? '#FBFAF3' : locked ? '#A8A89A' : '#4A4A3A',
        cursor: 'pointer',
        fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
        fontSize: compact ? 9 : 10,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        minHeight: 30,
        zIndex: 1,
        transition: 'color 200ms ease-out',
      }}
    >
      {active ? (
        <motion.span
          layoutId={layoutId}
          transition={
            reduce
              ? { duration: 0 }
              : { type: 'spring', stiffness: 360, damping: 28, mass: 0.7 }
          }
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #E2541C, #FF7A3C)',
            boxShadow: '0 4px 14px rgba(226, 84, 28, 0.32)',
            zIndex: -1,
          }}
        />
      ) : null}
      <span
        aria-hidden="true"
        style={{
          width: 18,
          height: 18,
          clipPath: HEX_CLIP,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: active ? 'rgba(255,255,255,0.18)' : locked ? '#A8A89A' : color,
          color: '#FBFAF3',
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: 0,
        }}
      >
        {locked ? <Lock size={9} aria-hidden="true" /> : glyph}
      </span>
      {!compact ? <span>{label}</span> : null}
      <span
        style={{
          fontFamily: "'Newsreader', Georgia, serif",
          fontSize: 11,
          fontWeight: 700,
          color: active ? '#FBFAF3' : locked ? '#A8A89A' : '#14140A',
        }}
      >
        {count}
      </span>
    </button>
  )
}

interface TabPillRowProps {
  active: TabId
  onChange: (tab: TabId) => void
  isMobile: boolean
}

function TabPillRow({ active, onChange, isMobile }: TabPillRowProps) {
  const tabs: { id: TabId; label: string }[] = [
    { id: 'journey', label: 'Your Journey' },
    { id: 'catalog', label: 'Pack Catalog' },
    { id: 'stack', label: 'Command Center' },
  ]
  return (
    <nav
      aria-label="Empire surfaces"
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 4,
        padding: '6px 0 0',
        flexWrap: 'wrap',
        position: 'relative',
      }}
    >
      {tabs.map((t) => {
        const isActive = active === t.id
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.id)}
            style={{
              position: 'relative',
              padding: isMobile ? '8px 14px' : '10px 22px',
              borderRadius: 10,
              border: 'none',
              background: 'transparent',
              color: isActive ? '#FBFAF3' : '#4A4A3A',
              cursor: 'pointer',
              fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
              fontSize: isMobile ? 10 : 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              minHeight: 40,
              zIndex: 1,
              transition: 'color 200ms ease-out',
            }}
          >
            {isActive ? (
              <motion.span
                layoutId="active-tab-pill"
                transition={{ type: 'spring', stiffness: 360, damping: 28, mass: 0.7 }}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #E2541C, #FF7A3C)',
                  boxShadow: '0 6px 18px rgba(226, 84, 28, 0.32)',
                  zIndex: -1,
                }}
              />
            ) : null}
            {t.label}
          </button>
        )
      })}
    </nav>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
          }}
        >
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
  if (tierId === 'advanced') return LOCKED_COUNT_BY_TIER.advanced ?? 7
  return TOTAL_PACKS
}

export default SegmentedTrackerBar
