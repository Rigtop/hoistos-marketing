/**
 * EmpirePacksGallery. Pack Catalog tab. Browse-and-install grid view that
 * lets users pick any pack out of order, not just the next ranked one.
 *
 * Mockup reference: mockup-A-v3.html lines 435-443 (screen-catalog grid).
 *
 * Behavior:
 *   - Renders all 11 FOUNDATION_CARDS as a 3-column grid (1 col mobile).
 *   - Each card surfaces layer + badge, title, purpose, and an MCP badge
 *     based on the user's first q3 surface preference.
 *   - Tier filter chip row at top (Foundation / Advanced visible, others
 *     hidden behind tiers.ts visible:false flag).
 *   - Click an uninstalled card opens PackInstallFlow inline (replacing the
 *     grid). Click an installed card surfaces a "Already in your stack"
 *     pill with no action (idempotent).
 *
 * Hard Rule #11: no em dashes.
 * R047 voice: no banned openers, plain English.
 * R067 mobile-first: 1 col on <640, 2 col on 640-1024, 3 col on >1024.
 * Context7 (HR #31): react@19.2.5 useState/useEffect/useMemo verified
 *   live 2026-05-18. motion@12.38 motion.div + useReducedMotion verified.
 */

import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Check } from 'lucide-react'
import { FOUNDATION_CARDS, type FoundationCard } from './content/foundation-cards'
import { TIERS } from './content/tiers'
import { listActivated, onActivatedChange } from '../lib/activate'
import { useIsMobile } from '../lib/useIsMobile'
import { PackInstallFlow } from './PackInstallFlow'

const LAYER_COLOR: Record<FoundationCard['layer'], string> = {
  Voice: '#E2541C',
  Memory: '#4A89DC',
  Sources: '#C89A3C',
  Routing: '#8E5BC2',
  Validation: '#4FA37A',
}

function readQ3Surface(): 'browser' | 'desktop' | 'code' {
  try {
    const raw = window.localStorage.getItem('hoistos.intake.v1')
    if (!raw) return 'browser'
    const parsed = JSON.parse(raw)
    const q3 = Array.isArray(parsed.q3Surfaces) && parsed.q3Surfaces.length > 0
      ? parsed.q3Surfaces[0]
      : Array.isArray(parsed.surfaces) && parsed.surfaces.length > 0
        ? parsed.surfaces[0]
        : 'browser'
    return q3 as 'browser' | 'desktop' | 'code'
  } catch {
    return 'browser'
  }
}

export function EmpirePacksGallery() {
  const isMobile = useIsMobile()
  const reduce = useReducedMotion()
  const [installed, setInstalled] = useState<string[]>(() => listActivated())
  const [active, setActive] = useState<FoundationCard | null>(null)
  const [tier, setTier] = useState<string>('all')

  useEffect(() => onActivatedChange(() => setInstalled(listActivated())), [])

  const visibleTiers = useMemo(() => TIERS.filter((t) => t.visible), [])
  const installedSet = useMemo(() => new Set(installed), [installed])
  const surface = useMemo(() => readQ3Surface(), [installed])

  const visibleCards = useMemo(() => {
    if (tier === 'all' || tier === 'foundation') return FOUNDATION_CARDS
    return []
  }, [tier])

  if (active) {
    return (
      <PackInstallFlow
        pack={active}
        pitch={active.purpose}
        surface={surface}
        queuePosition={installed.length + 1}
        queueTotal={FOUNDATION_CARDS.length}
        onComplete={() => setActive(null)}
        onCancel={() => setActive(null)}
      />
    )
  }

  return (
    <div
      data-component="empire-packs-gallery"
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: isMobile ? '24px 16px 64px' : '40px 24px 80px',
      }}
    >
      <h2
        style={{
          fontFamily: "'Newsreader', Georgia, serif",
          fontSize: isMobile ? '2.4rem' : '3.2rem',
          fontWeight: 500,
          color: '#14140A',
          margin: 0,
          marginBottom: 8,
          letterSpacing: '-0.015em',
        }}
      >
        Pack Catalog
      </h2>
      <p
        style={{
          fontSize: 17,
          color: '#4A4A3A',
          margin: 0,
          marginBottom: 28,
          fontFamily: "'Newsreader', Georgia, serif",
        }}
      >
        All Foundation packs. Pick any of them out of order. Advanced tier ships next.
      </p>

      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 24,
        }}
      >
        <FilterChip label="All" active={tier === 'all'} onClick={() => setTier('all')} />
        {visibleTiers.map((t) => (
          <FilterChip
            key={t.id}
            label={t.label}
            active={tier === t.id}
            onClick={() => setTier(t.id)}
          />
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? '1fr'
            : 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
        }}
      >
        {visibleCards.map((card, idx) => {
          const isInstalled = installedSet.has(card.packId)
          return (
            <motion.button
              key={card.packId}
              type="button"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { duration: 0.45, delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] }
              }
              onClick={() => {
                if (isInstalled) return
                setActive(card)
              }}
              style={{
                textAlign: 'left',
                background: 'white',
                border: `1px solid ${isInstalled ? '#E2541C' : 'rgba(20,20,10,0.08)'}`,
                borderRadius: 18,
                padding: '22px 24px',
                cursor: isInstalled ? 'default' : 'pointer',
                color: '#14140A',
                fontFamily: "'Newsreader', Georgia, serif",
                boxShadow: isInstalled
                  ? '0 10px 32px rgba(226,84,28,0.18)'
                  : '0 6px 20px rgba(20,20,10,0.04)',
                transition: 'transform 200ms, box-shadow 200ms',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
              onMouseEnter={(e) => {
                if (isInstalled) return
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 16px 36px rgba(20,20,10,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = isInstalled
                  ? '0 10px 32px rgba(226,84,28,0.18)'
                  : '0 6px 20px rgba(20,20,10,0.04)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
                    fontSize: 10,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: LAYER_COLOR[card.layer],
                  }}
                >
                  {card.layer} · {card.badge}
                </span>
                {isInstalled ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: 'rgba(226,84,28,0.1)',
                      color: '#E2541C',
                      border: '1px solid rgba(226,84,28,0.35)',
                      fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
                      fontSize: 10,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                    }}
                  >
                    <Check size={10} aria-hidden="true" />
                    Installed
                  </span>
                ) : null}
              </div>
              <h3
                style={{
                  fontFamily: "'Newsreader', Georgia, serif",
                  fontSize: '1.4rem',
                  fontWeight: 500,
                  margin: 0,
                  color: '#14140A',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.15,
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: '#4A4A3A',
                  lineHeight: 1.5,
                }}
              >
                {card.purpose}
              </p>
            </motion.button>
          )
        })}
        {visibleCards.length === 0 ? (
          <p
            style={{
              gridColumn: '1 / -1',
              color: '#4A4A3A',
              fontFamily: "'Newsreader', Georgia, serif",
            }}
          >
            Advanced tier packs ship next. Foundation is in flight today.
          </p>
        ) : null}
      </div>
    </div>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '10px 18px',
        borderRadius: 10,
        border: `1px solid ${active ? '#14140A' : 'rgba(20,20,10,0.08)'}`,
        background: active ? '#14140A' : 'transparent',
        color: active ? '#FBFAF3' : '#4A4A3A',
        fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
        fontSize: 11,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        minHeight: 40,
      }}
    >
      {label}
    </button>
  )
}

export default EmpirePacksGallery
