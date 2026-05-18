/**
 * EmpirePacksGallery. Round 8 (2026-05-18) rewrite.
 *
 * Round 8 changes:
 *   - A1: tier filter is now driven by the ?tier= URL param so the
 *     SegmentedTrackerBar tier chips actually filter the catalog.
 *   - A2: catalog renders ALL 43 packs (11 real Foundation + 32 locked
 *     placeholders from src/empire/content/locked-packs.ts). Locked cards
 *     have grayscale palette, lock glyph, "Ships <quarter>" badge, and
 *     do not open the install flow.
 *   - B7: installed Foundation cards render with a BorderBeam rotating
 *     gradient border to signal the active state.
 *   - B10: subtle dotted-grid background pattern (Mockup C vocabulary) on
 *     the gallery wrapper for visual texture.
 *
 * Hard Rule #11: no em dashes.
 * R047 voice, R087 plain English.
 * R067 mobile-first: 1 col under 640, then auto-fill.
 * Context7 (HR #31): react@19.2.5, motion@12.38, lucide-react@1.14, react-
 *   router-dom@7.15 useSearchParams. Verified live 2026-05-18.
 */

import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Check, Lock } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { FOUNDATION_CARDS, type FoundationCard } from './content/foundation-cards'
import { LOCKED_PACKS, type LockedPack } from './content/locked-packs'
import { TIERS } from './content/tiers'
import { listActivated, onActivatedChange } from '../lib/activate'
import { useIsMobile } from '../lib/useIsMobile'
import { PackInstallFlow } from './PackInstallFlow'
import { BorderBeam } from '../components/BorderBeam'

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

type GalleryCard =
  | { kind: 'foundation'; card: FoundationCard }
  | { kind: 'locked'; pack: LockedPack }

export function EmpirePacksGallery() {
  const isMobile = useIsMobile()
  const reduce = useReducedMotion()
  const [installed, setInstalled] = useState<string[]>(() => listActivated())
  const [active, setActive] = useState<FoundationCard | null>(null)
  const [params] = useSearchParams()
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const tier = params.get('tier') ?? 'all'

  useEffect(() => onActivatedChange(() => setInstalled(listActivated())), [])

  const installedSet = useMemo(() => new Set(installed), [installed])
  const surface = useMemo(() => readQ3Surface(), [installed])

  const visibleCards = useMemo<GalleryCard[]>(() => {
    if (tier === 'all') {
      return [
        ...FOUNDATION_CARDS.map((card) => ({ kind: 'foundation' as const, card })),
        ...LOCKED_PACKS.map((pack) => ({ kind: 'locked' as const, pack })),
      ]
    }
    if (tier === 'foundation') {
      return FOUNDATION_CARDS.map((card) => ({ kind: 'foundation' as const, card }))
    }
    return LOCKED_PACKS.filter((p) => p.tier === tier).map((pack) => ({
      kind: 'locked' as const,
      pack,
    }))
  }, [tier])

  function fireLockedToast(p: LockedPack) {
    setToastMsg(`${p.title} ships ${p.shipsBadge.replace('Ships ', '')}. Email Eugeen to join the waitlist.`)
    window.setTimeout(() => setToastMsg(null), 4000)
  }

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

  const visibleTiers = useMemo(() => TIERS.filter((t) => t.visible), [])

  return (
    <div
      data-component="empire-packs-gallery"
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: isMobile ? '24px 16px 64px' : '40px 24px 80px',
        position: 'relative',
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(20,20,10,0.06) 1px, transparent 0)',
        backgroundSize: '22px 22px',
        backgroundPosition: '-1px -1px',
        borderRadius: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 8,
        }}
      >
        <h2
          style={{
            fontFamily: "'Newsreader', Georgia, serif",
            fontSize: isMobile ? '2.4rem' : '3.2rem',
            fontWeight: 500,
            color: '#14140A',
            margin: 0,
            letterSpacing: '-0.015em',
          }}
        >
          Pack Catalog
        </h2>
        <span
          style={{
            fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#8A8A78',
          }}
        >
          {currentFilterLabel(tier, visibleTiers)} · {visibleCards.length} packs
        </span>
      </div>
      <p
        style={{
          fontSize: 16,
          color: '#4A4A3A',
          margin: 0,
          marginBottom: 28,
          fontFamily: "'Newsreader', Georgia, serif",
        }}
      >
        Pick any of the 11 Foundation packs out of order. Locked cards ship later, in the quarter on each badge.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? '1fr'
            : 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 14,
        }}
      >
        {visibleCards.map((entry, idx) => {
          if (entry.kind === 'foundation') {
            const card = entry.card
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
                    : { duration: 0.4, delay: Math.min(idx * 0.025, 0.4), ease: [0.22, 1, 0.36, 1] }
                }
                onClick={() => {
                  if (isInstalled) return
                  setActive(card)
                }}
                style={{
                  position: 'relative',
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
                  overflow: 'hidden',
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
                {isInstalled ? (
                  <BorderBeam size={36} duration={8} colorFrom="#E2541C" colorTo="#C89A3C" />
                ) : null}
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
          }

          const pack = entry.pack
          return (
            <motion.button
              key={pack.packId}
              type="button"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { duration: 0.4, delay: Math.min(idx * 0.02, 0.4), ease: [0.22, 1, 0.36, 1] }
              }
              onClick={() => fireLockedToast(pack)}
              style={{
                position: 'relative',
                textAlign: 'left',
                background: 'rgba(255,255,255,0.4)',
                border: '1px dashed rgba(20,20,10,0.16)',
                borderRadius: 18,
                padding: '22px 24px',
                cursor: 'pointer',
                color: '#8A8A78',
                fontFamily: "'Newsreader', Georgia, serif",
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                filter: 'grayscale(0.7)',
                transition: 'filter 200ms, transform 200ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'grayscale(0.3)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'grayscale(0.7)'
                e.currentTarget.style.transform = 'translateY(0)'
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
                    color: '#8A8A78',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Lock size={10} aria-hidden="true" />
                  {pack.tier.charAt(0).toUpperCase() + pack.tier.slice(1)} · {pack.badge}
                </span>
                <span
                  style={{
                    fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
                    fontSize: 9,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: '#A8A89A',
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: 'rgba(20,20,10,0.05)',
                  }}
                >
                  {pack.shipsBadge}
                </span>
              </div>
              <h3
                style={{
                  fontFamily: "'Newsreader', Georgia, serif",
                  fontSize: '1.4rem',
                  fontWeight: 500,
                  margin: 0,
                  color: '#5A5A4A',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.15,
                }}
              >
                {pack.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: '#8A8A78',
                  lineHeight: 1.5,
                }}
              >
                {pack.purpose}
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
            Nothing in this tier yet.
          </p>
        ) : null}
      </div>

      {toastMsg ? (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          style={{
            position: 'fixed',
            bottom: 28,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#14140A',
            color: '#FBFAF3',
            padding: '14px 22px',
            borderRadius: 999,
            fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
            fontSize: 12,
            letterSpacing: '0.04em',
            boxShadow: '0 20px 50px rgba(0,0,0,0.32)',
            zIndex: 90,
            maxWidth: '90vw',
          }}
        >
          {toastMsg}
        </motion.div>
      ) : null}
    </div>
  )
}

function currentFilterLabel(
  tier: string,
  visibleTiers: typeof TIERS,
): string {
  if (tier === 'all') return 'All tiers'
  const match = visibleTiers.find((t) => t.id === tier)
  if (match) return `${match.label} only`
  return tier.charAt(0).toUpperCase() + tier.slice(1)
}

export default EmpirePacksGallery
