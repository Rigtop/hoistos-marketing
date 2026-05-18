/**
 * EmpireLanding. Round 8 (2026-05-18) further simplified shell.
 *
 * The 3-pill tab nav moved into SegmentedTrackerBar as its 4th row in
 * round 8. This file now only handles the InlineIntake gate + tab content
 * switch. The bar owns the tab nav AND drives the tab change via URL
 * search params, so we just read ?tab= here and render the matching
 * surface.
 *
 * AnimatePresence wraps the tab content so switching surfaces fades the
 * outgoing tree out and fades the incoming tree in. Key off the URL tab
 * param so React Router stays the source of truth.
 *
 * Hard Rule #11: no em dashes.
 * R047 voice, R087 plain English.
 * Context7 (HR #31): react-router-dom@7.15 + motion@12.38 verified.
 */

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { InlineIntake } from './InlineIntake'
import { SerialPackStage } from './SerialPackStage'
import { EmpirePacksGallery } from './EmpirePacksGallery'
import { CommandCenter } from './CommandCenter'
import { isIntakeComplete, onIntakeChange, readIntake } from '../lib/intake-state'

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
  const [params, setParams] = useSearchParams()
  const reduce = useReducedMotion()
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
    <div style={{ position: 'relative', zIndex: 1 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={reduce ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -20 }}
          transition={reduce ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {tab === 'journey' ? <SerialPackStage /> : null}
          {tab === 'catalog' ? <EmpirePacksGallery /> : null}
          {tab === 'stack' ? <CommandCenter /> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default EmpireLanding
