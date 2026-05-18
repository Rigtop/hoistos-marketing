/**
 * CommandCenter. Your Stack tab. The post-install dashboard.
 *
 * Mockup reference: mockup-A-v3.html lines 372-470 (dash-hero + dash-grid +
 * capability map + multiplier + activity + prompt-of-day + change-setup).
 *
 * Surfaces:
 *   Hero card: 128px level number, name + role lockup, packs/layers/hours
 *     stats. Stats source: listActivated() count + LAYERS_BY_ORDER layer
 *     occupancy + HOURS_PER_PACK sum.
 *   Capability map: 25-cell grid from CAPABILITY_CELLS. Lit when at least
 *     one of cell.packIds is in the installed set. Click opens a detail
 *     panel with cell.examplePrompt + a "copy and open Claude" CTA.
 *   Compounding multiplier: formula = 1.0 + (installed - 1) * 0.4 +
 *     layersLit * 0.15, capped at 4.8x. Zero packs = 0x.
 *   Activity feed: reads localStorage `scrolophyte.activity` (a stack of
 *     {ts, message} entries written by PackInstallFlow on confirm).
 *   Prompt of the day: static daily-rotating list, picks based on the
 *     current ISO day-of-year so two visits in one day show the same prompt.
 *   Change my setup: inline surface re-picker. Writes q3Surfaces +
 *     surfaces to localStorage on save.
 *
 * Hard Rule #11: no em dashes.
 * R047 voice: no banned openers, plain English.
 * R067 mobile-first: capability map collapses to 3 columns at <768.
 * Context7 (HR #31): react@19.2.5 useState/useEffect/useMemo verified
 *   live 2026-05-18. motion@12.38 motion.div + AnimatePresence verified.
 *   lucide-react@1.14 Check + Copy + ExternalLink + Sparkles verified.
 */

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform, animate as motionAnimate } from 'motion/react'
import { Check, Copy, ExternalLink, Sparkles, X } from 'lucide-react'
import { CAPABILITY_CELLS, type CapabilityCell } from './content/capabilities'
import { FOUNDATION_CARDS, type FoundationCard } from './content/foundation-cards'
import { LAYERS_BY_ORDER, type LayerId } from './content/layers'
import { computeLevel, packsToNextLevel } from './content/levels'
import { HOURS_PER_PACK, DEFAULT_HOURS } from './content/hours-saved'
import { listActivated, onActivatedChange } from '../lib/activate'
import { readIntake, writeIntake } from '../lib/intake-state'
import { useIsMobile } from '../lib/useIsMobile'

interface ActivityEntry {
  ts: string
  message: string
}

const PROMPTS_OF_THE_DAY: string[] = [
  'Draft a follow-up to my GC on the schedule slip we discussed Thursday.',
  'My morning briefing: top 3 projects status, top 3 emails to reply, top decision I need to make today.',
  'Pull every reference to subcontractor default-cure language from my Outputs corpus, summarize the patterns.',
  'Process the voice memo from the site walk: extract decisions, action items, and route to the right project folder.',
  'Source Sweep: what did the GC PM commit on the schedule slip in the Thursday email thread, quoted in full.',
  'Draft the AR follow-up batch for everyone past net-45, by GC, in my voice, with attached invoice references.',
  'Pre-send gate: check this proposal for em dashes, misspelled GC names, banned phrases, before I send.',
]

function readActivity(): ActivityEntry[] {
  try {
    const raw = window.localStorage.getItem('scrolophyte.activity')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function readQ3Surfaces(): Array<'browser' | 'desktop' | 'code'> {
  try {
    const raw = window.localStorage.getItem('hoistos.intake.v1')
    if (!raw) return ['browser']
    const parsed = JSON.parse(raw)
    const q3 = Array.isArray(parsed.q3Surfaces) ? parsed.q3Surfaces : null
    const s = Array.isArray(parsed.surfaces) ? parsed.surfaces : null
    return (q3 ?? s ?? ['browser']) as Array<'browser' | 'desktop' | 'code'>
  } catch {
    return ['browser']
  }
}

function normalizeLayer(cardLayer: FoundationCard['layer']): LayerId {
  return cardLayer.toLowerCase() as LayerId
}

function totalHoursFor(installed: string[]): number {
  let total = 0
  for (const id of installed) {
    const card = FOUNDATION_CARDS.find((c) => c.packId === id)
    const badge = card?.badge ?? id
    total += HOURS_PER_PACK[badge] ?? DEFAULT_HOURS
  }
  return total
}

function layersLitCount(installed: string[]): number {
  const lit = new Set<LayerId>()
  for (const id of installed) {
    const card = FOUNDATION_CARDS.find((c) => c.packId === id)
    if (card) lit.add(normalizeLayer(card.layer))
  }
  return lit.size
}

function computeMultiplier(installed: number, layersLit: number): number {
  if (installed === 0) return 0
  const raw = 1.0 + (installed - 1) * 0.4 + layersLit * 0.15
  return Math.min(4.8, Math.round(raw * 10) / 10)
}

interface CountUpProps {
  value: number
  decimals?: number
  duration?: number
}

function CountUp({ value, decimals = 0, duration = 0.8 }: CountUpProps) {
  const reduce = useReducedMotion()
  const mv = useMotionValue(0)
  const display = useTransform(mv, (v) => v.toFixed(decimals))
  useEffect(() => {
    if (reduce) {
      mv.set(value)
      return
    }
    const controls = motionAnimate(mv, value, {
      duration,
      ease: [0.34, 1.56, 0.64, 1],
    })
    return controls.stop
  }, [value, mv, duration, reduce])
  return <motion.span>{display}</motion.span>
}

function timeAgo(ts: string): string {
  try {
    const then = new Date(ts).getTime()
    const diff = Date.now() - then
    if (diff < 60_000) return 'Just now'
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} hr ago`
    return `${Math.floor(diff / 86_400_000)} day ago`
  } catch {
    return ''
  }
}

function promptOfTheDay(): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / 86_400_000)
  return PROMPTS_OF_THE_DAY[dayOfYear % PROMPTS_OF_THE_DAY.length]
}

export function CommandCenter() {
  const isMobile = useIsMobile()
  const reduce = useReducedMotion()
  const [installed, setInstalled] = useState<string[]>(() => listActivated())
  const [activity, setActivity] = useState<ActivityEntry[]>(() => readActivity())
  const [q3Surfaces, setQ3Surfaces] = useState<Array<'browser' | 'desktop' | 'code'>>(
    () => readQ3Surfaces(),
  )
  const [openCell, setOpenCell] = useState<CapabilityCell | null>(null)
  const [setupOpen, setSetupOpen] = useState(false)
  const [copyFlash, setCopyFlash] = useState(false)

  useEffect(() => {
    return onActivatedChange(() => {
      setInstalled(listActivated())
      setActivity(readActivity())
    })
  }, [])

  const intake = readIntake()
  const level = computeLevel(installed.length)
  const toNext = packsToNextLevel(installed.length)
  const installedSet = useMemo(() => new Set(installed), [installed])
  const layersLit = useMemo(() => layersLitCount(installed), [installed])
  const hours = useMemo(() => totalHoursFor(installed), [installed])
  const multiplier = useMemo(
    () => computeMultiplier(installed.length, layersLit),
    [installed.length, layersLit],
  )
  const todaysPrompt = useMemo(() => promptOfTheDay(), [])

  const litCellIds = useMemo(() => {
    const out = new Set<string>()
    for (const cell of CAPABILITY_CELLS) {
      for (const id of cell.packIds) {
        const card = FOUNDATION_CARDS.find((c) => c.badge === id)
        if (card && installedSet.has(card.packId)) {
          out.add(cell.id)
          break
        }
        if (installedSet.has(id)) {
          out.add(cell.id)
          break
        }
      }
    }
    return out
  }, [installedSet])

  async function copyAndOpen(text: string) {
    try {
      await navigator.clipboard?.writeText(text)
    } catch {
      // ignore
    }
    setCopyFlash(true)
    window.setTimeout(() => setCopyFlash(false), 600)
    window.open('https://claude.ai/new', '_blank', 'noopener')
  }

  function saveSurfaces(next: Array<'browser' | 'desktop' | 'code'>) {
    setQ3Surfaces(next)
    try {
      const key = 'hoistos.intake.v1'
      const raw = window.localStorage.getItem(key)
      const parsed = raw ? JSON.parse(raw) : {}
      parsed.q3Surfaces = next
      window.localStorage.setItem(key, JSON.stringify(parsed))
    } catch {
      // private mode / quota
    }
    writeIntake({ surfaces: next })
    setSetupOpen(false)
  }

  return (
    <div
      data-component="command-center"
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: isMobile ? '24px 16px 64px' : '40px 24px 96px',
      }}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background:
            'linear-gradient(135deg, #FBFAF3 0%, white 50%, #F5F3E8 100%)',
          border: '1px solid rgba(20,20,10,0.08)',
          borderRadius: 24,
          padding: isMobile ? '28px 22px' : '40px 44px',
          boxShadow: '0 12px 48px rgba(20,20,10,0.06)',
          marginBottom: 24,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: isMobile ? 24 : 36,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
              fontSize: 10,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#8A8A78',
              marginBottom: 8,
            }}
          >
            {intake.name ? `${intake.name}'s Operator Profile` : 'Your Operator Profile'}
          </div>
          <div
            style={{
              fontFamily: "'Newsreader', Georgia, serif",
              fontSize: isMobile ? '1.6rem' : '2rem',
              fontWeight: 500,
              color: '#14140A',
              marginBottom: 6,
              letterSpacing: '-0.01em',
            }}
          >
            {intake.division || 'Operator'}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 24,
              marginTop: 18,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontSize: isMobile ? 88 : 128,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #E2541C, #FF7A3C)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: '#E2541C',
                lineHeight: 0.9,
              }}
            >
              <CountUp value={level.num} />
            </span>
            <div style={{ paddingBottom: 12 }}>
              <div
                style={{
                  fontFamily: "'Newsreader', Georgia, serif",
                  fontSize: isMobile ? '1.4rem' : '1.8rem',
                  fontWeight: 500,
                  color: '#14140A',
                }}
              >
                {level.name}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
                  fontSize: 11,
                  color: '#8A8A78',
                }}
              >
                {toNext > 0
                  ? `${toNext} pack${toNext === 1 ? '' : 's'} to Level ${level.num + 1}`
                  : 'Top level'}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            minWidth: 200,
          }}
        >
          <StatTile label="Packs installed" valueNode={<CountUp value={installed.length} />} />
          <StatTile
            label="Layers lit"
            valueNode={
              <>
                <CountUp value={layersLit} /> / {LAYERS_BY_ORDER.length}
              </>
            }
          />
          <StatTile
            label="Saved per week"
            accent
            valueNode={
              <>
                ~<CountUp value={hours} decimals={1} /> hr
              </>
            }
          />
        </div>
      </motion.div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr',
          gap: 20,
        }}
      >
        <Card>
          <CardEyebrow>Capability Map</CardEyebrow>
          <p
            style={{
              fontSize: 14,
              color: '#4A4A3A',
              margin: 0,
              marginBottom: 18,
              fontFamily: "'Newsreader', Georgia, serif",
              lineHeight: 1.5,
            }}
          >
            Each cell is a moment-of-use. Click a lit cell to see which pack powers it and grab a
            starter prompt.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)',
              gap: 8,
            }}
          >
            {CAPABILITY_CELLS.map((cell, idx) => {
              const lit = litCellIds.has(cell.id)
              return (
                <motion.button
                  key={cell.id}
                  type="button"
                  onClick={() => setOpenCell(cell)}
                  aria-label={`${cell.label}${lit ? ', powered' : ', not yet installed'}`}
                  initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                  animate={
                    reduce
                      ? { opacity: 1, scale: 1 }
                      : lit
                        ? { opacity: [1, 0.78, 1], scale: 1 }
                        : { opacity: 1, scale: 1 }
                  }
                  transition={
                    reduce
                      ? { duration: 0 }
                      : lit
                        ? { delay: Math.min(idx * 0.03, 0.6), duration: 4, repeat: Infinity, ease: 'easeInOut' }
                        : { delay: Math.min(idx * 0.03, 0.6), duration: 0.35, ease: [0.22, 1, 0.36, 1] }
                  }
                  whileHover={reduce ? undefined : { scale: 1.06, rotate: 0.5 }}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 10,
                    background: lit
                      ? 'linear-gradient(135deg, rgba(226,84,28,0.18), rgba(200,154,60,0.08))'
                      : 'rgba(20,20,10,0.04)',
                    color: lit ? '#14140A' : '#8A8A78',
                    border: `1px solid ${lit ? '#E2541C' : 'transparent'}`,
                    padding: 6,
                    fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
                    fontSize: 10,
                    fontWeight: lit ? 600 : 400,
                    textAlign: 'center',
                    cursor: 'pointer',
                    minHeight: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: lit ? '0 6px 18px rgba(226,84,28,0.18)' : 'none',
                  }}
                >
                  {cell.label}
                </motion.button>
              )
            })}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card>
            <CardEyebrow>Compounding Multiplier</CardEyebrow>
            <motion.div
              key={`mult-${installed.length}-${layersLit}`}
              initial={reduce ? false : { scale: 1 }}
              animate={reduce ? { scale: 1 } : { scale: [1, 1.18, 1] }}
              transition={reduce ? { duration: 0 } : { duration: 0.45, times: [0, 0.4, 1], ease: [0.34, 1.56, 0.64, 1] }}
              style={{
                position: 'relative',
                fontFamily: "'Newsreader', Georgia, serif",
                fontSize: 72,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #E2541C, #C89A3C)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: '#E2541C',
                lineHeight: 1,
                marginBottom: 12,
                display: 'inline-block',
              }}
            >
              {installed.length === 0 ? '0x' : `${multiplier.toFixed(1)}x`}
            </motion.div>
            <p
              style={{
                fontSize: 14,
                color: '#4A4A3A',
                margin: 0,
                marginBottom: 14,
                fontFamily: "'Newsreader', Georgia, serif",
                lineHeight: 1.5,
              }}
            >
              Your packs amplify each other. Each new layer lit moves the multiplier up.
            </p>
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                background: 'rgba(20,20,10,0.04)',
                fontSize: 12,
                color: '#4A4A3A',
                fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
              }}
            >
              <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8A8A78', marginBottom: 6 }}>
                Growth path
              </div>
              <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: 13 }}>
                + Memory = +0.55x / + Sources = +0.55x / Full foundation = 4.8x
              </div>
            </div>
          </Card>

          <Card>
            <CardEyebrow>Prompt of the day</CardEyebrow>
            <p
              style={{
                fontSize: 14,
                color: '#4A4A3A',
                margin: 0,
                marginBottom: 14,
                fontFamily: "'Newsreader', Georgia, serif",
                lineHeight: 1.5,
              }}
            >
              Paste into your Claude to feel what your stack can do today.
            </p>
            <div
              style={{
                padding: 14,
                borderRadius: 10,
                background: 'rgba(20,20,10,0.04)',
                border: '1px solid rgba(20,20,10,0.08)',
                fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
                fontSize: 12,
                color: '#14140A',
                marginBottom: 12,
                lineHeight: 1.5,
              }}
            >
              {todaysPrompt}
            </div>
            <button
              type="button"
              onClick={() => copyAndOpen(todaysPrompt)}
              style={primaryButtonStyle}
            >
              {copyFlash ? (
                <>
                  <Check size={14} aria-hidden="true" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={14} aria-hidden="true" />
                  Copy and open Claude
                </>
              )}
            </button>
          </Card>
        </div>
      </div>

      <div
        style={{
          marginTop: 20,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr',
          gap: 20,
        }}
      >
        <Card>
          <CardEyebrow>Activity</CardEyebrow>
          {activity.length === 0 ? (
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: '#4A4A3A',
                fontFamily: "'Newsreader', Georgia, serif",
              }}
            >
              Nothing yet. Confirm your first pack and the timeline starts here.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {activity.slice(0, 8).map((entry, idx) => (
                <li
                  key={`${entry.ts}-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '12px 0',
                    borderBottom: idx === activity.length - 1 ? 'none' : '1px solid rgba(20,20,10,0.08)',
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: '#E2541C',
                      marginTop: 6,
                      flexShrink: 0,
                      boxShadow: '0 0 8px rgba(226,84,28,0.4)',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Newsreader', Georgia, serif", fontSize: 14, color: '#14140A' }}>
                      {entry.message}
                    </div>
                    <div
                      style={{
                        fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
                        fontSize: 10,
                        color: '#8A8A78',
                        marginTop: 2,
                      }}
                    >
                      {timeAgo(entry.ts)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardEyebrow>Setup</CardEyebrow>
          {!setupOpen ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'Newsreader', Georgia, serif",
                    fontSize: 20,
                    color: '#14140A',
                    fontWeight: 500,
                  }}
                >
                  {labelFor(q3Surfaces[0])} path
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    color: '#4A4A3A',
                    fontFamily: "'Newsreader', Georgia, serif",
                  }}
                >
                  Install instructions show the {labelFor(q3Surfaces[0]).toLowerCase()} flow.
                </div>
              </div>
              <button type="button" onClick={() => setSetupOpen(true)} style={ghostButtonStyle}>
                Change setup
              </button>
            </div>
          ) : (
            <SetupPicker
              current={q3Surfaces}
              onSave={saveSurfaces}
              onCancel={() => setSetupOpen(false)}
            />
          )}
        </Card>
      </div>

      <AnimatePresence>
        {openCell ? (
          <motion.div
            key={openCell.id}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Capability: ${openCell.label}`}
            onClick={() => setOpenCell(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 90,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(20,20,10,0.4)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              padding: 24,
            }}
          >
            <motion.div
              initial={reduce ? false : { scale: 0.92, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 320, damping: 26, mass: 0.7 }
              }
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 'min(480px, 100%)',
                background: 'white',
                borderRadius: 20,
                padding: 32,
              }}
            >
              <div
                style={{
                  fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
                  fontSize: 10,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#E2541C',
                  marginBottom: 8,
                }}
              >
                <Sparkles size={12} aria-hidden="true" style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Capability
              </div>
              <h3
                style={{
                  fontFamily: "'Newsreader', Georgia, serif",
                  fontSize: '1.6rem',
                  fontWeight: 500,
                  margin: 0,
                  marginBottom: 12,
                  color: '#14140A',
                  letterSpacing: '-0.01em',
                }}
              >
                {openCell.label}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: '#4A4A3A',
                  fontFamily: "'Newsreader', Georgia, serif",
                  lineHeight: 1.55,
                  margin: 0,
                  marginBottom: 16,
                }}
              >
                Powered by {packsForCell(openCell).join(', ') || 'a pack you have not installed yet'}. Try a starter prompt below.
              </p>
              <div
                style={{
                  padding: 14,
                  borderRadius: 10,
                  background: 'rgba(20,20,10,0.04)',
                  border: '1px solid rgba(20,20,10,0.08)',
                  fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
                  fontSize: 12,
                  color: '#14140A',
                  marginBottom: 16,
                  lineHeight: 1.55,
                }}
              >
                {openCell.examplePrompt}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    copyAndOpen(openCell.examplePrompt)
                    setOpenCell(null)
                  }}
                  style={{ ...primaryButtonStyle, flex: 1, minWidth: 200 }}
                >
                  <ExternalLink size={14} aria-hidden="true" />
                  Copy and open Claude
                </button>
                <button
                  type="button"
                  onClick={() => setOpenCell(null)}
                  style={{ ...ghostButtonStyle, minWidth: 100, justifyContent: 'center' }}
                  aria-label="Close detail"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function packsForCell(cell: CapabilityCell): string[] {
  const names: string[] = []
  for (const id of cell.packIds) {
    const card = FOUNDATION_CARDS.find((c) => c.badge === id) ?? FOUNDATION_CARDS.find((c) => c.packId === id)
    if (card) names.push(card.title)
    else names.push(id)
  }
  return names
}

function labelFor(s: string | undefined): string {
  if (s === 'desktop') return 'Desktop'
  if (s === 'code') return 'Code CLI'
  return 'Browser'
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid rgba(20,20,10,0.08)',
        borderRadius: 18,
        padding: '24px 26px',
        boxShadow: '0 6px 28px rgba(20,20,10,0.04)',
      }}
    >
      {children}
    </div>
  )
}

function CardEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
        fontSize: 10,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: '#8A8A78',
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  )
}

function StatTile({
  label,
  value,
  valueNode,
  accent,
}: {
  label: string
  value?: string
  valueNode?: React.ReactNode
  accent?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        style={{
          fontFamily: "'Newsreader', Georgia, serif",
          fontSize: 36,
          fontWeight: 700,
          color: accent ? '#E2541C' : '#14140A',
          lineHeight: 1,
        }}
      >
        {valueNode ?? value}
      </span>
      <span
        style={{
          fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
          fontSize: 10,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#8A8A78',
        }}
      >
        {label}
      </span>
    </div>
  )
}

function SetupPicker({
  current,
  onSave,
  onCancel,
}: {
  current: Array<'browser' | 'desktop' | 'code'>
  onSave: (next: Array<'browser' | 'desktop' | 'code'>) => void
  onCancel: () => void
}) {
  const [picked, setPicked] = useState<Array<'browser' | 'desktop' | 'code'>>(current)
  function toggle(id: 'browser' | 'desktop' | 'code') {
    setPicked((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev
        return prev.filter((p) => p !== id)
      }
      return [...prev, id]
    })
  }
  const tiles: Array<'browser' | 'desktop' | 'code'> = ['browser', 'desktop', 'code']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {tiles.map((t) => {
          const selected = picked.includes(t)
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggle(t)}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: `1px solid ${selected ? '#E2541C' : 'rgba(20,20,10,0.08)'}`,
                background: selected ? 'rgba(226,84,28,0.06)' : 'white',
                color: '#14140A',
                fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                minHeight: 40,
              }}
            >
              {labelFor(t)}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={() => onSave(picked)} style={primaryButtonStyle}>
          <Check size={14} aria-hidden="true" /> Save
        </button>
        <button type="button" onClick={onCancel} style={ghostButtonStyle}>
          <X size={12} aria-hidden="true" /> Cancel
        </button>
      </div>
    </div>
  )
}

const primaryButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '12px 22px',
  background: '#E2541C',
  color: '#FBFAF3',
  border: 'none',
  borderRadius: 10,
  fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
  fontSize: 12,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  fontWeight: 600,
  cursor: 'pointer',
  minHeight: 44,
}

const ghostButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 16px',
  background: 'transparent',
  color: '#4A4A3A',
  border: '1px solid rgba(20,20,10,0.08)',
  borderRadius: 10,
  fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  minHeight: 40,
}

export default CommandCenter
