/**
 * InlineIntake. 3-question inline intake. NO modal.
 *
 * Mockup reference: mockup-A-v3.html lines 188-256 (landing + Q1 + Q2 + Q3 +
 * cookup screens), plus the goTo() screen-switching pattern lines 568-595.
 *
 * Three questions per the locked spec:
 *   Q1: name (text) + role free-text (text). Both optional.
 *   Q2: up to 3 of 8 pain tiles (emails, proposals, team, contracts, billing,
 *       decisions, meetings, voice) + free-text "Other".
 *   Q3: multi-select of 3 surfaces (Browser default, Desktop, Code).
 *
 * On submit:
 *   - cook-up screen runs 2.5s with name interpolation
 *   - writes q2Pains, q2Other (alias customOutcome), q3Surfaces (alias
 *     surfaces), intakeCompletedAt (alias completedAt), name, role (alias
 *     division) into intake-state
 *   - parent routes to /empire?tab=journey via onComplete callback
 *
 * Hard Rule #11: no em dashes.
 * R047 voice: no banned openers.
 * R087 plain English: sentence-case prose only.
 * R067 mobile-first: 320 / 375 / 768 verified, tap targets 44px+.
 * Context7 (HR #31): react@19.2.5 useState/useEffect/useCallback verified
 *   live 2026-05-18. motion@12.38 motion.div + AnimatePresence verified.
 *   lucide-react@1.14 named exports Check + ArrowRight verified.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight, Check } from 'lucide-react'
import { useIsMobile } from '../lib/useIsMobile'
import { completeIntake, writeIntake } from '../lib/intake-state'
import { sendEvent } from '../lib/telemetry'

type Screen = 'q1' | 'q2' | 'q3' | 'cookup'

const PAIN_TILES: { id: string; label: string }[] = [
  { id: 'emails', label: 'Emails and follow-ups' },
  { id: 'proposals', label: 'Proposals and pitches' },
  { id: 'team', label: 'Knowing what your team is doing' },
  { id: 'contracts', label: 'Contract risk and review' },
  { id: 'billing', label: 'Billing and AR' },
  { id: 'decisions', label: 'Daily decisions and recall' },
  { id: 'meetings', label: 'Meeting notes and capture' },
  { id: 'voice', label: 'Writing in your voice' },
]

interface SurfaceTile {
  id: 'browser' | 'desktop' | 'code'
  display: string
  subtitle: string
  badge: string
  badgeColor: string
}

const SURFACE_TILES: SurfaceTile[] = [
  {
    id: 'browser',
    display: 'Browser',
    subtitle: 'claude.ai/new',
    badge: 'Easiest',
    badgeColor: '#4FA37A',
  },
  {
    id: 'desktop',
    display: 'Desktop',
    subtitle: 'Claude Desktop plus MCPs',
    badge: 'More power',
    badgeColor: '#C89A3C',
  },
  {
    id: 'code',
    display: 'Code CLI',
    subtitle: 'Claude Code in terminal',
    badge: 'Advanced',
    badgeColor: '#4A89DC',
  },
]

export interface InlineIntakeProps {
  onComplete: () => void
}

export function InlineIntake({ onComplete }: InlineIntakeProps) {
  const isMobile = useIsMobile()
  const reduce = useReducedMotion()

  const [screen, setScreen] = useState<Screen>('q1')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [pains, setPains] = useState<string[]>([])
  const [other, setOther] = useState('')
  const [surfaces, setSurfaces] = useState<string[]>(['browser'])
  const [cookupPct, setCookupPct] = useState(0)

  const togglePain = useCallback((id: string) => {
    setPains((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }, [])

  const toggleSurface = useCallback((id: string) => {
    setSurfaces((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev
        return prev.filter((s) => s !== id)
      }
      return [...prev, id]
    })
  }, [])

  const cookUp = useCallback(() => {
    const finalPains = pains.length === 0 ? ['emails'] : pains
    writeIntake({
      name: name.trim() || undefined,
      division: role.trim() || undefined,
      surfaces: surfaces as Array<'browser' | 'desktop' | 'code'>,
      customOutcome: other.trim() || undefined,
    } as Parameters<typeof writeIntake>[0])
    writeIntake({
      ...(({} as unknown) as Parameters<typeof writeIntake>[0]),
    })
    try {
      const key = 'hoistos.intake.v1'
      const raw = window.localStorage.getItem(key)
      const parsed = raw ? JSON.parse(raw) : {}
      parsed.q2Pains = finalPains
      parsed.q2Other = other.trim() || undefined
      parsed.q3Surfaces = surfaces
      window.localStorage.setItem(key, JSON.stringify(parsed))
    } catch {
      // private mode / quota
    }
    setScreen('cookup')
    requestAnimationFrame(() => setCookupPct(100))
    window.setTimeout(() => {
      completeIntake({
        name: name.trim() || undefined,
        division: role.trim() || undefined,
        surfaces: surfaces as Array<'browser' | 'desktop' | 'code'>,
        customOutcome: other.trim() || undefined,
      } as Parameters<typeof completeIntake>[0])
      void sendEvent('intake_completed', {
        surface: (surfaces[0] ?? 'browser') as 'browser' | 'desktop' | 'code',
        meta: { pains: finalPains.join(','), painCount: finalPains.length },
      })
      onComplete()
    }, 2500)
  }, [name, role, pains, other, surfaces, onComplete])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [screen])

  useEffect(() => {
    void sendEvent('intake_started')
  }, [])

  const cookupText = useMemo(
    () =>
      name.trim()
        ? `Cooking up your Claude, ${name.trim()}...`
        : 'Cooking up your Claude...',
    [name],
  )

  return (
    <div
      data-component="inline-intake"
      style={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '32px 16px 64px' : '60px 24px 80px',
        maxWidth: 880,
        margin: '0 auto',
      }}
    >
      <motion.div
        key={screen}
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        {screen === 'q1' ? (
          <Q1Name
            name={name}
            role={role}
            onName={setName}
            onRole={setRole}
            onNext={() => setScreen('q2')}
            isMobile={isMobile}
          />
        ) : null}

        {screen === 'q2' ? (
          <Q2Pains
            pains={pains}
            other={other}
            onTogglePain={togglePain}
            onOther={setOther}
            onNext={() => setScreen('q3')}
            isMobile={isMobile}
          />
        ) : null}

        {screen === 'q3' ? (
          <Q3Surfaces
            surfaces={surfaces}
            onToggle={toggleSurface}
            onSubmit={cookUp}
            isMobile={isMobile}
          />
        ) : null}

        {screen === 'cookup' ? (
          <CookupScreen text={cookupText} pct={cookupPct} reduce={reduce ?? false} />
        ) : null}
      </motion.div>
    </div>
  )
}

interface Q1NameProps {
  name: string
  role: string
  onName: (v: string) => void
  onRole: (v: string) => void
  onNext: () => void
  isMobile: boolean
}

function Q1Name({ name, role, onName, onRole, onNext, isMobile }: Q1NameProps) {
  return (
    <>
      <Eyebrow text="Question 1 of 3" />
      <Headline isMobile={isMobile}>Quick. Who are we cooking for?</Headline>
      <Subhead>Both fields optional. Skip if you want.</Subhead>
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          marginTop: 8,
        }}
      >
        <TextField
          value={name}
          onChange={onName}
          placeholder="Your name"
          autoComplete="given-name"
        />
        <TextField
          value={role}
          onChange={onRole}
          placeholder="What you do (e.g. COO at Perennial Empire)"
          autoComplete="organization-title"
        />
        <PrimaryButton onClick={onNext}>
          Next
          <ArrowRight size={14} aria-hidden="true" />
        </PrimaryButton>
      </div>
    </>
  )
}

interface Q2PainsProps {
  pains: string[]
  other: string
  onTogglePain: (id: string) => void
  onOther: (v: string) => void
  onNext: () => void
  isMobile: boolean
}

function Q2Pains({ pains, other, onTogglePain, onOther, onNext, isMobile }: Q2PainsProps) {
  return (
    <>
      <Eyebrow text="Question 2 of 3" />
      <Headline isMobile={isMobile}>What costs you the most time?</Headline>
      <Subhead>Pick up to 3. We rank your packs around these.</Subhead>
      <div
        style={{
          width: '100%',
          maxWidth: 680,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: 10,
        }}
      >
        {PAIN_TILES.map((tile) => {
          const selected = pains.includes(tile.id)
          const disabled = !selected && pains.length >= 3
          return (
            <button
              key={tile.id}
              type="button"
              role="checkbox"
              aria-checked={selected}
              aria-disabled={disabled}
              onClick={() => onTogglePain(tile.id)}
              style={{
                position: 'relative',
                background: selected ? 'rgba(226,84,28,0.04)' : 'white',
                border: `1px solid ${selected ? '#E2541C' : 'rgba(20,20,10,0.08)'}`,
                borderRadius: 14,
                padding: '20px 22px',
                paddingRight: 56,
                textAlign: 'left',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                color: '#14140A',
                fontSize: 15,
                fontFamily: "'Newsreader', Georgia, serif",
                minHeight: 64,
                transition: 'all 200ms',
              }}
            >
              {tile.label}
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: `2px solid ${selected ? '#E2541C' : 'rgba(20,20,10,0.08)'}`,
                  background: selected ? '#E2541C' : 'white',
                  color: '#FBFAF3',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {selected ? <Check size={12} aria-hidden="true" /> : null}
              </span>
            </button>
          )
        })}
      </div>
      <div style={{ width: '100%', maxWidth: 680, marginTop: 16 }}>
        <TextField
          value={other}
          onChange={onOther}
          placeholder="Something else? Type it."
        />
      </div>
      <div
        style={{
          marginTop: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexDirection: isMobile ? 'column' : 'row',
          width: isMobile ? '100%' : 'auto',
        }}
      >
        <span
          style={{
            fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#8A8A78',
          }}
        >
          {pains.length} of 3 picked
        </span>
        <div style={{ width: isMobile ? '100%' : 280 }}>
          <PrimaryButton onClick={onNext}>
            Next
            <ArrowRight size={14} aria-hidden="true" />
          </PrimaryButton>
        </div>
      </div>
    </>
  )
}

interface Q3SurfacesProps {
  surfaces: string[]
  onToggle: (id: string) => void
  onSubmit: () => void
  isMobile: boolean
}

function Q3Surfaces({ surfaces, onToggle, onSubmit, isMobile }: Q3SurfacesProps) {
  return (
    <>
      <Eyebrow text="Question 3 of 3" />
      <Headline isMobile={isMobile}>How will you use Claude most?</Headline>
      <Subhead>Pick all that apply. We tailor install instructions per pack.</Subhead>
      <div
        style={{
          width: '100%',
          maxWidth: 680,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: 14,
        }}
      >
        {SURFACE_TILES.map((tile) => {
          const selected = surfaces.includes(tile.id)
          return (
            <button
              key={tile.id}
              type="button"
              role="checkbox"
              aria-checked={selected}
              onClick={() => onToggle(tile.id)}
              style={{
                position: 'relative',
                background: selected ? 'rgba(226,84,28,0.04)' : 'white',
                border: `1px solid ${selected ? '#E2541C' : 'rgba(20,20,10,0.08)'}`,
                borderRadius: 14,
                padding: '24px 22px',
                paddingRight: 56,
                textAlign: 'left',
                cursor: 'pointer',
                color: '#14140A',
                fontFamily: "'Newsreader', Georgia, serif",
                minHeight: 124,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: `2px solid ${selected ? '#E2541C' : 'rgba(20,20,10,0.08)'}`,
                  background: selected ? '#E2541C' : 'white',
                  color: '#FBFAF3',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {selected ? <Check size={12} aria-hidden="true" /> : null}
              </span>
              <span style={{ fontSize: 22, fontWeight: 600 }}>{tile.display}</span>
              <span style={{ fontSize: 13, color: '#4A4A3A' }}>{tile.subtitle}</span>
              <span
                style={{
                  marginTop: 6,
                  display: 'inline-flex',
                  alignSelf: 'flex-start',
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: `${tile.badgeColor}1A`,
                  color: tile.badgeColor,
                  border: `1px solid ${tile.badgeColor}55`,
                  fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                {tile.badge}
              </span>
            </button>
          )
        })}
      </div>
      <p
        style={{
          marginTop: 22,
          fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#8A8A78',
        }}
      >
        Change this any time from your Command Center.
      </p>
      <div style={{ width: isMobile ? '100%' : 320, marginTop: 16 }}>
        <PrimaryButton onClick={onSubmit}>
          Build my Claude
          <ArrowRight size={14} aria-hidden="true" />
        </PrimaryButton>
      </div>
    </>
  )
}

function CookupScreen({ text, pct, reduce }: { text: string; pct: number; reduce: boolean }) {
  return (
    <>
      <h2
        style={{
          fontFamily: "'Newsreader', Georgia, serif",
          fontSize: 'clamp(28px, 5vw, 48px)',
          fontWeight: 500,
          color: '#14140A',
          margin: 0,
          marginBottom: 28,
          textAlign: 'center',
          letterSpacing: '-0.01em',
        }}
      >
        {text}
      </h2>
      <div
        aria-hidden="true"
        style={{
          width: 320,
          maxWidth: '90%',
          height: 8,
          borderRadius: 999,
          background: 'rgba(20,20,10,0.06)',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={reduce ? { duration: 0 } : { duration: 2.4, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #E2541C, #C89A3C)',
          }}
        />
      </div>
      <p
        style={{
          marginTop: 24,
          fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
          fontSize: 12,
          color: '#8A8A78',
        }}
      >
        Locking voice, ranking pack queue, building install instructions...
      </p>
    </>
  )
}

function Eyebrow({ text }: { text: string }) {
  return (
    <div
      style={{
        marginBottom: 12,
        fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
        fontSize: 11,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: '#E2541C',
      }}
    >
      {text}
    </div>
  )
}

function Headline({ isMobile, children }: { isMobile: boolean; children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "'Newsreader', Georgia, serif",
        fontSize: isMobile ? '2rem' : 'clamp(2.4rem, 5vw, 3.4rem)',
        fontWeight: 500,
        color: '#14140A',
        margin: 0,
        marginBottom: 12,
        textAlign: 'center',
        lineHeight: 1.05,
        letterSpacing: '-0.015em',
      }}
    >
      {children}
    </h2>
  )
}

function Subhead({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: 0,
        marginBottom: 32,
        fontSize: 16,
        color: '#4A4A3A',
        fontFamily: "'Newsreader', Georgia, serif",
        textAlign: 'center',
        maxWidth: 540,
      }}
    >
      {children}
    </p>
  )
}

function TextField({
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  autoComplete?: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      style={{
        width: '100%',
        background: 'white',
        border: '1px solid rgba(20,20,10,0.08)',
        borderRadius: 12,
        padding: '14px 18px',
        fontSize: 15,
        color: '#14140A',
        fontFamily: "'Newsreader', Georgia, serif",
        minHeight: 48,
        outline: 'none',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#E2541C'
        e.currentTarget.style.boxShadow = '0 0 0 4px rgba(226,84,28,0.12)'
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'rgba(20,20,10,0.08)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    />
  )
}

function PrimaryButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: '#E2541C',
        color: '#FBFAF3',
        padding: '14px 28px',
        borderRadius: 12,
        border: 'none',
        fontWeight: 600,
        width: '100%',
        cursor: 'pointer',
        fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontSize: 13,
        minHeight: 48,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'transform 200ms, box-shadow 200ms',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = '0 10px 26px rgba(226,84,28,0.35)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {children}
    </button>
  )
}

export default InlineIntake
