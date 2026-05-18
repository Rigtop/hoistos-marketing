/**
 * SerialPackStage. Default Your Journey view. ONE pack at a time.
 *
 * Mockup reference: mockup-A-v3.html lines 258-280 (pack-1 screen + card),
 * plus personalizePack() lines 596-607.
 *
 * Behavior:
 *   - rankNextPacks() top-1 (filtered by installed state) becomes the active
 *     pack. If ranking returns empty, fall back to packForTopPain(intake.q2[0])
 *     so a fresh intake still surfaces F-01 Constitution by default.
 *   - Headline personalized: "<name>'s Claude" + ", built for <role>" if role.
 *   - Pitch from pain-to-pack.ts keyed by user q2 first answer.
 *   - MCP badge: prefer user's first q3 surface, but show pack's mcpRequirement
 *     as a fallback when the surfaces don't include the pack's requirement.
 *   - Install CTA mounts PackInstallFlow inline (replaces the card on click).
 *   - After install completes, PackInstallFlow fires onComplete which re-picks
 *     the next pack via rankNextPacks re-eval.
 *
 * Hard Rule #11: no em dashes.
 * R047 voice: no banned openers, plain English copy.
 * R067 mobile-first: card width caps + tap targets verified.
 * Context7 (HR #31): react@19.2.5 useState/useEffect/useMemo verified live
 *   2026-05-18. motion@12.38 motion.div + useReducedMotion verified.
 */

import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { FOUNDATION_CARDS, type FoundationCard } from './content/foundation-cards'
import { packForTopPain } from './content/pain-to-pack'
import { rankNextPacks } from '../lib/compounding-ranker'
import { listActivated, onActivatedChange } from '../lib/activate'
import { readIntake } from '../lib/intake-state'
import { useIsMobile } from '../lib/useIsMobile'
import { PackInstallFlow } from './PackInstallFlow'
import { sendEvent } from '../lib/telemetry'

const PAIN_TO_OUTCOME_TAG: Record<string, string> = {
  emails: 'faster emails',
  proposals: 'faster proposals',
  team: 'team enablement',
  contracts: 'contract risk',
  billing: 'faster emails',
  decisions: 'decision tracking',
  meetings: 'meeting capture',
  voice: 'faster emails',
}

const LAYER_COLOR: Record<FoundationCard['layer'], string> = {
  Voice: '#E2541C',
  Memory: '#4A89DC',
  Sources: '#C89A3C',
  Routing: '#8E5BC2',
  Validation: '#4FA37A',
}

function readQ2(): string[] {
  try {
    const raw = window.localStorage.getItem('hoistos.intake.v1')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed.q2Pains) ? parsed.q2Pains : []
  } catch {
    return []
  }
}

function readQ3(): string[] {
  try {
    const raw = window.localStorage.getItem('hoistos.intake.v1')
    if (!raw) return ['browser']
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed.q3Surfaces) && parsed.q3Surfaces.length > 0
      ? parsed.q3Surfaces
      : Array.isArray(parsed.surfaces) && parsed.surfaces.length > 0
        ? parsed.surfaces
        : ['browser']
  } catch {
    return ['browser']
  }
}

function pickActivePack(installed: string[], q2: string[]): {
  card: FoundationCard
  pitch: string
  after: string
  mcp: 'browser' | 'desktop' | 'code'
} {
  const tags = q2.map((p) => PAIN_TO_OUTCOME_TAG[p]).filter((t): t is string => !!t)
  const ranked = rankNextPacks(installed, tags, FOUNDATION_CARDS)
  const topRanked = ranked[0]?.pack

  const topPain = q2[0]
  const painMapping = packForTopPain(topPain)

  if (topRanked) {
    const pitch =
      topPain && topRanked.title.toLowerCase().includes(painMapping.name.toLowerCase())
        ? painMapping.pitch
        : `${topRanked.title}. ${topRanked.purpose}`
    const after =
      topPain && topRanked.title.toLowerCase().includes(painMapping.name.toLowerCase())
        ? painMapping.after
        : topRanked.claudeDoes
    return {
      card: topRanked,
      pitch,
      after,
      mcp: painMapping.mcp,
    }
  }

  const fallbackCard =
    FOUNDATION_CARDS.find((c) => c.title === painMapping.name) ?? FOUNDATION_CARDS[0]
  return {
    card: fallbackCard,
    pitch: painMapping.pitch,
    after: painMapping.after,
    mcp: painMapping.mcp,
  }
}

export function SerialPackStage() {
  const isMobile = useIsMobile()
  const reduce = useReducedMotion()
  const [installed, setInstalled] = useState<string[]>(() => listActivated())
  const [installing, setInstalling] = useState(false)

  useEffect(() => onActivatedChange(() => setInstalled(listActivated())), [])

  const intake = readIntake()
  const q2 = useMemo(() => readQ2(), [installed])
  const q3 = useMemo(() => readQ3(), [installed])

  const active = useMemo(() => pickActivePack(installed, q2), [installed, q2])
  const allInstalled = installed.length >= FOUNDATION_CARDS.length

  useEffect(() => {
    if (active?.card?.packId) {
      void sendEvent('pack_view', {
        packId: active.card.packId,
        surface: (q3[0] ?? 'browser') as 'browser' | 'desktop' | 'code',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.card?.packId])

  const greeting = useMemo(() => {
    if (intake.name) {
      return intake.division
        ? `${intake.name}'s Claude, built for ${intake.division}`
        : `${intake.name}'s Claude`
    }
    return 'Built for you'
  }, [intake.name, intake.division])

  const queuePosition = installed.length + 1

  const mcpBadge = (() => {
    if (q3.includes(active.mcp)) return labelForSurface(active.mcp)
    if (q3[0]) return `${labelForSurface(q3[0])} path`
    return 'Browser ready'
  })()

  if (allInstalled) {
    return (
      <div
        data-component="serial-pack-stage"
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: isMobile ? '48px 16px 64px' : '64px 24px 80px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: "'Newsreader', Georgia, serif",
            fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
            fontWeight: 500,
            color: '#14140A',
            margin: 0,
            marginBottom: 16,
            letterSpacing: '-0.015em',
          }}
        >
          Foundation complete.
        </h2>
        <p style={{ fontSize: 18, color: '#4A4A3A', maxWidth: 540, margin: '0 auto' }}>
          All eleven foundation packs are installed. Open your Command Center to see what your
          stack can do now.
        </p>
      </div>
    )
  }

  if (installing) {
    return (
      <PackInstallFlow
        pack={active.card}
        pitch={active.pitch}
        surface={q3[0] as 'browser' | 'desktop' | 'code'}
        queuePosition={queuePosition}
        queueTotal={FOUNDATION_CARDS.length}
        onComplete={() => {
          setInstalling(false)
        }}
        onCancel={() => setInstalling(false)}
      />
    )
  }

  return (
    <div
      data-component="serial-pack-stage"
      style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: isMobile ? '24px 16px 64px' : '40px 24px 80px',
      }}
    >
      <div
        style={{
          fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#E2541C',
          marginBottom: 12,
          textAlign: 'center',
        }}
      >
        Pack {queuePosition} of your starter trio, ranked for you
      </div>
      <h2
        style={{
          fontFamily: "'Newsreader', Georgia, serif",
          fontSize: isMobile ? '1.6rem' : '2rem',
          fontWeight: 500,
          color: '#14140A',
          margin: 0,
          marginBottom: 28,
          textAlign: 'center',
          letterSpacing: '-0.01em',
        }}
      >
        {greeting}
      </h2>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: 'white',
          border: '1px solid rgba(20,20,10,0.08)',
          borderRadius: 22,
          padding: isMobile ? '28px 22px' : '40px 44px',
          boxShadow: '0 12px 48px rgba(20,20,10,0.06)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              padding: '4px 12px',
              borderRadius: 999,
              background: `${LAYER_COLOR[active.card.layer]}14`,
              color: LAYER_COLOR[active.card.layer],
            }}
          >
            {active.card.layer} · {active.card.badge} · Foundation
          </span>
          <McpBadge label={mcpBadge} surface={active.mcp} />
        </div>
        <h3
          style={{
            fontFamily: "'Newsreader', Georgia, serif",
            fontSize: isMobile ? '2.4rem' : '3rem',
            fontWeight: 500,
            color: '#14140A',
            margin: 0,
            marginBottom: 18,
            letterSpacing: '-0.015em',
            lineHeight: 1.05,
          }}
        >
          {active.card.title}
        </h3>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.55,
            color: '#4A4A3A',
            marginTop: 0,
            marginBottom: 24,
            fontFamily: "'Newsreader', Georgia, serif",
          }}
        >
          {active.pitch}
        </p>
        <div
          style={{
            borderRadius: 12,
            border: '1px solid rgba(20,20,10,0.08)',
            background: 'rgba(226,84,28,0.03)',
            padding: '18px 20px',
            marginBottom: 28,
          }}
        >
          <div
            style={{
              fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#E2541C',
              marginBottom: 8,
            }}
          >
            Claude can do this after install
          </div>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.55,
              color: '#14140A',
              margin: 0,
              fontFamily: "'Newsreader', Georgia, serif",
            }}
          >
            {active.after}
          </p>
        </div>
        <MagneticInstallButton onClick={() => setInstalling(true)} reduce={reduce ?? false} />
      </motion.div>
    </div>
  )
}

function MagneticInstallButton({ onClick, reduce }: { onClick: () => void; reduce: boolean }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  function handleMove(e: React.MouseEvent<HTMLButtonElement>) {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const dx = (e.clientX - cx) / (r.width / 2)
    const dy = (e.clientY - cy) / (r.height / 2)
    setOffset({ x: dx * 4, y: dy * 4 })
  }
  function handleLeave() {
    setOffset({ x: 0, y: 0 })
  }
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        width: '100%',
        background: 'linear-gradient(135deg, #E2541C, #FF7A3C)',
        color: '#FBFAF3',
        padding: '16px 24px',
        borderRadius: 12,
        border: 'none',
        cursor: 'pointer',
        fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontWeight: 600,
        fontSize: 13,
        minHeight: 52,
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: 'transform 200ms ease-out, box-shadow 200ms ease-out',
        boxShadow:
          offset.x !== 0 || offset.y !== 0
            ? '0 14px 36px rgba(226,84,28,0.42)'
            : '0 8px 24px rgba(226,84,28,0.28)',
      }}
    >
      Install this pack
    </button>
  )
}

function labelForSurface(s: string): string {
  if (s === 'desktop') return 'Desktop recommended'
  if (s === 'code') return 'Code CLI'
  return 'Browser ready'
}

function McpBadge({ label, surface }: { label: string; surface: 'browser' | 'desktop' | 'code' }) {
  const styles: Record<string, { bg: string; color: string }> = {
    browser: { bg: 'rgba(79,163,122,0.1)', color: '#4FA37A' },
    desktop: { bg: 'rgba(200,154,60,0.1)', color: '#C89A3C' },
    code: { bg: 'rgba(74,137,220,0.1)', color: '#4A89DC' },
  }
  const s = styles[surface] ?? styles.browser
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 12px',
        borderRadius: 999,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.color}55`,
        fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
        fontSize: 10,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </span>
  )
}

export default SerialPackStage
