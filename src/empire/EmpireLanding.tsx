/**
 * EmpireLanding. Round 7 shell. Hand-port from mockup-A-v3.html.
 *
 * Replaced the 2232-line iteration-polished landing surface with a 3-pill
 * tab router gated by InlineIntake completion. The old "Enterprise Level
 * Claude that compounds every week" hero, Bridge module, ModuleOneTeaser,
 * timeline section, 6-teaser-card grid, and 5-tab nav were all stripped
 * per the round-7 handoff brief (~/Desktop/round-7-handoff-mockup-A-v3-port.md).
 *
 * Render contract:
 *   1. If intake is not complete -> render InlineIntake. On completion the
 *      component routes back here via ?tab=journey.
 *   2. Otherwise render the 3-pill nav (Your Journey / Pack Catalog /
 *      Command Center) plus the tab content matching the ?tab= URL param.
 *
 * SegmentedTrackerBar lives in EmpireLayout so it persists across every
 * /empire descendant route, not just the index. LevelUpOverlay also lives
 * in the layout (unchanged from round 6).
 *
 * The audience flag (?steve=1, ?ew=1) is preserved as a sessionStorage
 * lock so a Steve-arrived demo link still personalizes downstream copy
 * even after this round's strip. The hook is exported so future copy can
 * read it without re-implementing.
 *
 * Hard Rule #11: no em dashes.
 * R047: counter-led voice, no banned openers.
 * R087 plain English.
 * Context7 (HR #31): react-router-dom@7.15 useNavigate + useSearchParams +
 *   useLocation verified live 2026-05-18 (same pattern as AppRouter.tsx).
 */

import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { InlineIntake } from './InlineIntake'
import { SerialPackStage } from './SerialPackStage'
import { EmpirePacksGallery } from './EmpirePacksGallery'
import { CommandCenter } from './CommandCenter'
import { isIntakeComplete, onIntakeChange, readIntake } from '../lib/intake-state'
import { useIsMobile } from '../lib/useIsMobile'

type Audience = 'default' | 'empireworks'
type TabId = 'journey' | 'catalog' | 'stack'

function readInitialAudience(): Audience {
  if (typeof window === 'undefined') return 'default'
  try {
    const params = new URLSearchParams(window.location.search)
    const steve = params.get('steve')
    const ew = params.get('ew')
    const stored = window.sessionStorage.getItem('hoistos.empire.audience')
    return steve === '1' || ew === '1' || stored === 'empireworks' ? 'empireworks' : 'default'
  } catch {
    return 'default'
  }
}

export function useAudience(): Audience {
  const [audience] = useState<Audience>(readInitialAudience)
  useEffect(() => {
    if (typeof window === 'undefined' || audience !== 'empireworks') return
    try {
      window.sessionStorage.setItem('hoistos.empire.audience', 'empireworks')
    } catch {
      // sessionStorage may be blocked. Flag still holds for this render.
    }
  }, [audience])
  return audience
}

function parseTab(value: string | null): TabId {
  if (value === 'catalog') return 'catalog'
  if (value === 'stack') return 'stack'
  return 'journey'
}

export function EmpireLanding() {
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const isMobile = useIsMobile()
  useAudience()

  const [complete, setComplete] = useState<boolean>(() => isIntakeComplete(readIntake()))
  const tab = useMemo(() => parseTab(params.get('tab')), [params])

  useEffect(() => {
    return onIntakeChange(() => {
      const next = isIntakeComplete(readIntake())
      setComplete(next)
      if (next && !params.get('tab')) {
        const nextParams = new URLSearchParams(params)
        nextParams.set('tab', 'journey')
        setParams(nextParams, { replace: true })
      }
    })
  }, [params, setParams])

  function go(tabId: TabId) {
    const nextParams = new URLSearchParams(params)
    nextParams.set('tab', tabId)
    setParams(nextParams)
    navigate(`${location.pathname}?${nextParams.toString()}`, { replace: false })
  }

  if (!complete) {
    return (
      <div>
        <InlineIntake
          onComplete={() => {
            setComplete(true)
            const nextParams = new URLSearchParams(params)
            nextParams.set('tab', 'journey')
            setParams(nextParams, { replace: true })
          }}
        />
      </div>
    )
  }

  return (
    <div>
      <TabPills active={tab} onChange={go} isMobile={isMobile} />
      <div style={{ paddingTop: 8 }}>
        {tab === 'journey' ? <SerialPackStage /> : null}
        {tab === 'catalog' ? <EmpirePacksGallery /> : null}
        {tab === 'stack' ? <CommandCenter /> : null}
      </div>
    </div>
  )
}

interface TabPillsProps {
  active: TabId
  onChange: (tab: TabId) => void
  isMobile: boolean
}

function TabPills({ active, onChange, isMobile }: TabPillsProps) {
  const tabs: { id: TabId; label: string }[] = [
    { id: 'journey', label: 'Your Journey' },
    { id: 'catalog', label: 'Pack Catalog' },
    { id: 'stack', label: 'Command Center' },
  ]
  return (
    <nav
      aria-label="Empire surfaces"
      style={{
        position: 'sticky',
        top: 'clamp(116px, 15vw, 140px)',
        zIndex: 40,
        display: 'flex',
        justifyContent: 'center',
        gap: 4,
        padding: '10px 0',
        background: 'rgba(251,250,243,0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(20,20,10,0.08)',
        flexWrap: 'wrap',
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
              padding: isMobile ? '8px 14px' : '10px 22px',
              borderRadius: 10,
              border: 'none',
              background: isActive ? '#14140A' : 'transparent',
              color: isActive ? '#FBFAF3' : '#8A8A78',
              cursor: 'pointer',
              fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
              fontSize: isMobile ? 10 : 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              boxShadow: isActive ? '0 4px 12px rgba(20,20,10,0.18)' : 'none',
              minHeight: 40,
            }}
          >
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}

export default EmpireLanding
