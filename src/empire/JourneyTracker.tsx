/**
 * JourneyTracker. The "Claude is growing" panel.
 *
 * Owner: Agent E (S217 yes-this-new-mcbp-dapper-corbato sprint).
 * Plan reference: ~/.claude/plans/yes-this-new-mcbp-dapper-corbato.md
 *   sections "The Claude is growing tracker" and
 *   "Code CLI introduction logic, formalized".
 *
 * Layout (Mobile-First Render Mandate, Hard Rule #35):
 *   - Desktop (>= 768 px): renders as a right-side panel column.
 *   - Mobile (< 768 px):  renders as a top panel above the gallery.
 *
 * Voice: R087 plain English. No em dashes.
 *
 * Context7: react@v19.2.0 useState/useEffect/useMemo stable + JSX namespace
 *   moved to package import per official v19 CHANGELOG (verified via
 *   mcp__context7__query-docs).
 */

import { useEffect, useMemo, useState, type CSSProperties, type JSX } from 'react'
import { useReducedMotion } from 'motion/react'

import useIsMobile from '../lib/useIsMobile'
import { listActivated, onActivatedChange } from '../lib/activate'
import {
  codeIntroCopy,
  isAsteriskedPack,
  shouldSurfaceCodeIntro,
  type SurfaceMix,
} from '../lib/code-intro-logic'

import {
  INTAKE_CHANGE_EVENT,
  onIntakeChange,
  readIntake,
  type IntakeState,
  type Surface,
} from '../lib/intake-state'

const RULES_NODES: ReadonlyArray<{ packId: string; label: string }> = [
  { packId: 'foundation-01-constitution', label: 'Constitution' },
  { packId: 'foundation-08-source-sweep', label: 'Source Sweep' },
  { packId: 'foundation-09-output-validator', label: 'Output Validator' },
  { packId: 'foundation-11-notion-write-gate', label: 'Notion Write Gate' },
]

const KNOWLEDGE_NODES: ReadonlyArray<{ packId: string; label: string }> = [
  { packId: 'foundation-02-facts-registry', label: 'Facts Registry' },
  { packId: 'foundation-04-decision-log', label: 'Decision Log' },
  { packId: 'foundation-07-memory-architecture', label: 'Memory Architecture' },
  { packId: 'bonus-06-auto-memory-architecture', label: 'Auto-Memory' },
]

const SKILLS_NODES: ReadonlyArray<{ packId: string; label: string }> = [
  { packId: 'intro-00-tier-guide', label: 'Tier Guide' },
  { packId: 'foundation-03-cold-start-protocol', label: 'Cold Start' },
  { packId: 'foundation-05-skill-builder', label: 'Skill Builder' },
  { packId: 'foundation-06-routing-rules', label: 'Routing Rules' },
  { packId: 'foundation-10-email-playbook', label: 'Email Playbook' },
  { packId: 'biz-01-notion-mcp-setup', label: 'Notion MCP' },
  { packId: 'biz-02-email-to-notion-intel', label: 'Email Intel' },
  { packId: 'biz-03-email-triage-responder', label: 'Email Triage' },
  { packId: 'biz-04-team-ai-enablement', label: 'Team Enablement' },
  { packId: 'biz-05-document-prep-engine', label: 'Doc Prep' },
  { packId: 'biz-06-proposal-heavy', label: 'Proposal Heavy' },
  { packId: 'biz-07-proposal-light', label: 'Proposal Light' },
  { packId: 'biz-08-bd-ai-training', label: 'BD Training' },
  { packId: 'mid-01-email-playbook-tier-aware', label: 'Email Tier' },
  { packId: 'mid-02-expense-automation', label: 'Expense' },
  { packId: 'mid-03-daily-briefing', label: 'Daily Briefing' },
  { packId: 'mid-04-knowledge-search', label: 'Knowledge Search' },
  { packId: 'pow-01-cold-start-protocol', label: 'Cold Start Plus' },
  { packId: 'pow-02-rag-knowledge-search', label: 'RAG Search' },
  { packId: 'pow-04-multi-model-jury', label: 'Multi-Model Jury' },
  { packId: 'adv-01-proposal-builder', label: 'Proposal Builder' },
  { packId: 'adv-02-meeting-to-tasks', label: 'Meeting To Tasks' },
  { packId: 'adv-03-contract-review', label: 'Contract Review' },
  { packId: 'adv-04-skill-creator-meta', label: 'Skill Creator' },
  { packId: 'beg-01-chat-to-projects', label: 'Chat To Projects' },
  { packId: 'beg-02-desktop-organizer', label: 'Desktop Organizer' },
  { packId: 'beg-03-voice-to-task', label: 'Voice To Task' },
  { packId: 'beg-04-first-skill-bootstrap', label: 'First Skill' },
  { packId: 'bonus-00-overview', label: 'Overview' },
  { packId: 'bonus-01-notion-foundation', label: 'Notion Foundation' },
  { packId: 'bonus-02-notion-operating-layer', label: 'Notion Operating' },
  { packId: 'bonus-03-rag-setup', label: 'RAG Setup' },
  { packId: 'bonus-04-telegram-bridge', label: 'Telegram' },
  { packId: 'bonus-05-code-cli-setup', label: 'Code CLI' },
  { packId: 'bonus-07-hooks-and-daemons', label: 'Hooks + Daemons' },
]

const TOTAL_PACK_COUNT = 43

const COLORS = {
  accent: '#cc6e2e',
  accentSoft: 'rgba(204,110,46,0.10)',
  accentMid: 'rgba(204,110,46,0.25)',
  accentDeep: 'rgba(204,110,46,0.42)',
  inkDeep: '#1f1d1a',
  inkSoft: '#5b554d',
  paper: '#fdfaf5',
  paperLine: 'rgba(31,29,26,0.10)',
  dim: 'rgba(31,29,26,0.55)',
  asterisk: '#a5550a',
} as const

function surfacesToMix(surfaces: Surface[] | undefined): SurfaceMix {
  if (!surfaces || surfaces.length === 0) {
    return { browser: true, desktop: false, code: false }
  }
  return {
    browser: surfaces.includes('browser'),
    desktop: surfaces.includes('desktop'),
    code: surfaces.includes('code'),
  }
}

function readSelectedOutcomes(state: IntakeState | undefined): string[] {
  const map = state?.outcomes
  if (!map) return []
  return Object.entries(map)
    .filter(([, v]) => typeof v === 'number' && v > 0)
    .map(([k]) => k)
}

function useInstalledPackIds(): string[] {
  const [installed, setInstalled] = useState<string[]>(() => listActivated())
  useEffect(() => {
    const refresh = () => setInstalled(listActivated())
    const unsubscribe = onActivatedChange(refresh)
    return unsubscribe
  }, [])
  return installed
}

function useIntakeState(): IntakeState {
  const [intake, setIntake] = useState<IntakeState>(() => readIntake())
  useEffect(() => {
    const refresh = () => setIntake(readIntake())
    const unsubscribe = onIntakeChange(refresh)
    return unsubscribe
  }, [])
  return intake
}

function buildClaudeKnowsProse(
  installed: ReadonlyArray<string>,
  intake: IntakeState,
): string {
  const count = installed.length
  if (count === 0) {
    return 'Install your first pack to start. After I-00 + F-01 + F-02, your Claude will know your voice, your identity, and your team.'
  }
  const has = (id: string) => installed.includes(id)
  const phrases: string[] = []
  if (has('foundation-01-constitution')) phrases.push('respects your voice rules')
  if (has('foundation-02-facts-registry')) phrases.push('knows your team and clients by name')
  if (has('foundation-03-cold-start-protocol')) phrases.push('opens every chat warm with your role loaded')
  if (has('foundation-08-source-sweep')) phrases.push('cites sources before answering')
  if (has('foundation-09-output-validator')) phrases.push('gates drafts before they reach a client')
  if (has('foundation-10-email-playbook')) phrases.push('drafts emails by audience tier')
  if (has('biz-07-proposal-light') || has('adv-01-proposal-builder'))
    phrases.push('builds proposals on your letterhead')
  if (has('bonus-05-code-cli-setup')) phrases.push('runs on Code CLI with hooks and daemons')
  if (has('bonus-06-auto-memory-architecture')) phrases.push('carries corrections across sessions')
  if (has('bonus-03-rag-setup'))
    phrases.push('searches your filesystem with citations in two seconds')
  if (has('bonus-04-telegram-bridge')) phrases.push('talks to you from a job site over Telegram')

  if (phrases.length === 0) {
    return `You have installed ${count} packs. Each one adds a capability your Claude carries forward.`
  }
  const name = intake.name ? intake.name : 'you'
  const list =
    phrases.length === 1
      ? phrases[0]
      : phrases.slice(0, -1).join(', ') + ', and ' + phrases[phrases.length - 1]
  return `After ${count} packs, your Claude ${list}. That is the operating stack ${name} has built.`
}

function ColumnNode(props: {
  packId: string
  label: string
  installed: boolean
  asterisked: boolean
}): JSX.Element {
  const { label, installed, asterisked } = props
  const reduced = useReducedMotion()
  const lit = installed
  const stateTransition = reduced
    ? 'none'
    : 'background 200ms ease-in-out, opacity 200ms ease-in-out, border 200ms ease-in-out'
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        borderRadius: 8,
        background: lit ? COLORS.accentSoft : 'transparent',
        border: lit ? `1px solid ${COLORS.accentMid}` : `1px dashed ${COLORS.paperLine}`,
        opacity: lit ? 1 : 0.55,
        transition: stateTransition,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: lit ? COLORS.accent : 'transparent',
          border: `1.5px solid ${lit ? COLORS.accent : COLORS.dim}`,
          flexShrink: 0,
          boxShadow: lit ? `0 0 8px ${COLORS.accentDeep}` : 'none',
        }}
      />
      <span
        style={{
          fontSize: 13,
          lineHeight: 1.3,
          color: lit ? COLORS.inkDeep : COLORS.inkSoft,
          fontWeight: lit ? 600 : 500,
        }}
      >
        {label}
      </span>
      {asterisked ? (
        <span
          aria-label="installs on Pro, fires fully on Code"
          title="installs on Pro, fires fully on Code"
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            color: COLORS.asterisk,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          *
        </span>
      ) : null}
    </div>
  )
}

function Column(props: {
  title: string
  description: string
  nodes: ReadonlyArray<{ packId: string; label: string }>
  installed: ReadonlyArray<string>
}): JSX.Element {
  const { title, description, nodes, installed } = props
  const installedSet = useMemo(() => new Set(installed), [installed])
  const ordered = useMemo(() => {
    const lit = nodes.filter((n) => installedSet.has(n.packId))
    const unlit = nodes.filter((n) => !installedSet.has(n.packId))
    return [...lit, ...unlit]
  }, [nodes, installedSet])
  const litCount = ordered.filter((n) => installedSet.has(n.packId)).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: COLORS.inkDeep,
            }}
          >
            {title}
          </span>
          <span style={{ fontSize: 12, color: COLORS.dim }}>
            {litCount}/{nodes.length}
          </span>
        </div>
        <span style={{ fontSize: 11, color: COLORS.inkSoft, lineHeight: 1.4 }}>
          {description}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ordered.map((n) => (
          <ColumnNode
            key={n.packId}
            packId={n.packId}
            label={n.label}
            installed={installedSet.has(n.packId)}
            asterisked={isAsteriskedPack(n.packId)}
          />
        ))}
      </div>
    </div>
  )
}

function CodeIntroPanel(props: {
  installed: ReadonlyArray<string>
  surfaceMix: SurfaceMix
  outcomes: ReadonlyArray<string>
  onPrimary?: () => void
  onSecondary?: () => void
}): JSX.Element | null {
  const { installed, surfaceMix, outcomes, onPrimary, onSecondary } = props
  const state = shouldSurfaceCodeIntro(installed, surfaceMix, outcomes)
  const copy = codeIntroCopy(state, installed, surfaceMix, outcomes)
  if (!copy) return null
  const isPrimary = copy.isPrimary

  return (
    <div
      role="region"
      aria-label="Claude Code CLI upgrade"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: 16,
        borderRadius: 12,
        background: isPrimary ? COLORS.accentSoft : COLORS.paper,
        border: isPrimary ? `2px solid ${COLORS.accent}` : `1px solid ${COLORS.paperLine}`,
        boxShadow: isPrimary
          ? `0 12px 28px ${COLORS.accentDeep}`
          : '0 2px 8px rgba(20,20,19,0.04)',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: COLORS.accent,
        }}
      >
        {isPrimary ? 'Primary next step' : 'Upgrade available'}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.inkDeep, lineHeight: 1.3 }}>
        {copy.headline}
      </div>
      <div style={{ fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.5 }}>{copy.body}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
        <button
          type="button"
          onClick={onPrimary}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            minHeight: 44,
            padding: '10px 18px',
            borderRadius: 8,
            border: 'none',
            background: isPrimary ? COLORS.accent : 'transparent',
            color: isPrimary ? '#fff' : COLORS.accent,
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: isPrimary ? `0 8px 18px ${COLORS.accentDeep}` : 'none',
            outline: isPrimary ? 'none' : `1.5px solid ${COLORS.accent}`,
            outlineOffset: -1.5,
          }}
        >
          {copy.primaryCta}
        </button>
        <button
          type="button"
          onClick={onSecondary}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            minHeight: 44,
            padding: '10px 14px',
            borderRadius: 8,
            border: `1px solid ${COLORS.paperLine}`,
            background: 'transparent',
            color: COLORS.inkSoft,
            fontWeight: 500,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          {copy.secondaryCta}
        </button>
      </div>
    </div>
  )
}

export interface JourneyTrackerProps {
  onCodeIntroPrimary?: () => void
  onCodeIntroSecondary?: () => void
  intakeEventName?: string
}

export function JourneyTracker(props: JourneyTrackerProps): JSX.Element {
  const { onCodeIntroPrimary, onCodeIntroSecondary, intakeEventName } = props
  useEffect(() => {
    if (!intakeEventName || intakeEventName === INTAKE_CHANGE_EVENT) return
    const noop = () => {}
    window.addEventListener(intakeEventName, noop)
    return () => window.removeEventListener(intakeEventName, noop)
  }, [intakeEventName])

  const isMobile = useIsMobile()
  const reduced = useReducedMotion()
  const installed = useInstalledPackIds()
  const intake = useIntakeState()
  const surfaceMix = useMemo(() => surfacesToMix(intake.surfaces), [intake.surfaces])
  const outcomes = useMemo(() => readSelectedOutcomes(intake), [intake])
  const packCount = installed.length
  const prose = useMemo(() => buildClaudeKnowsProse(installed, intake), [installed, intake])

  // Per-session collapse: once the user has packs installed and has dismissed
  // the columns at least once this session, start collapsed on return so the
  // hero CTA can breathe. Default open on first visit.
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    try {
      return window.sessionStorage.getItem('scrolophyte.tracker-collapsed') !== '1'
    } catch {
      return true
    }
  })
  function toggleOpen() {
    setOpen((prev) => {
      const next = !prev
      try {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('scrolophyte.tracker-collapsed', next ? '0' : '1')
        }
      } catch {
        // sessionStorage unavailable, ignore
      }
      return next
    })
  }

  const tierCounts = useMemo(() => {
    const buckets = { foundation: 0, business: 0, power: 0, advanced: 0, beginner: 0, bonus: 0 }
    for (const id of installed) {
      if (id.startsWith('foundation-') || id.startsWith('intro-')) buckets.foundation++
      else if (id.startsWith('biz-') || id.startsWith('mid-')) buckets.business++
      else if (id.startsWith('pow-')) buckets.power++
      else if (id.startsWith('adv-')) buckets.advanced++
      else if (id.startsWith('beg-')) buckets.beginner++
      else if (id.startsWith('bonus-')) buckets.bonus++
    }
    return buckets
  }, [installed])

  const columnsStyle: CSSProperties = isMobile
    ? { display: 'flex', flexDirection: 'column', gap: 16 }
    : { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    padding: isMobile ? 16 : 20,
    borderRadius: 16,
    background: COLORS.paper,
    border: `1px solid ${COLORS.paperLine}`,
    boxShadow: '0 12px 30px rgba(20,20,19,0.05)',
    width: '100%',
    maxWidth: isMobile ? '100%' : 380,
    boxSizing: 'border-box',
  }

  return (
    <aside
      aria-label="Claude is growing tracker"
      data-testid="journey-tracker"
      style={containerStyle}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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
              fontSize: 12,
              fontWeight: 600,
              color: COLORS.accent,
            }}
          >
            Claude is growing
          </div>
          <button
            type="button"
            onClick={toggleOpen}
            aria-expanded={open}
            aria-controls="tracker-body"
            aria-label={open ? 'Collapse tracker columns' : 'Expand tracker columns'}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 44,
              minHeight: 44,
              padding: '8px 10px',
              borderRadius: 8,
              border: `1px solid ${COLORS.paperLine}`,
              background: 'transparent',
              color: COLORS.inkSoft,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              aria-hidden="true"
              style={{
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: reduced ? 'none' : 'transform 200ms ease-in-out',
              }}
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span
            style={{ fontSize: 28, fontWeight: 800, color: COLORS.inkDeep, lineHeight: 1 }}
          >
            {packCount}
          </span>
          <span style={{ fontSize: 14, color: COLORS.inkSoft }}>
            of {TOTAL_PACK_COUNT} packs installed
          </span>
        </div>
        <div style={{ fontSize: 12, color: COLORS.dim, lineHeight: 1.4 }}>
          Foundation {tierCounts.foundation} . Business {tierCounts.business} . Power{' '}
          {tierCounts.power} . Advanced {tierCounts.advanced} . Beginner {tierCounts.beginner} .
          Bonus {tierCounts.bonus}
        </div>
      </header>

      {packCount === 0 ? (
        <div
          role="status"
          style={{
            fontSize: 12,
            color: COLORS.inkSoft,
            lineHeight: 1.5,
            padding: '10px 12px',
            borderRadius: 10,
            border: `1px dashed ${COLORS.paperLine}`,
            background: 'transparent',
          }}
        >
          Nothing installed yet. The columns light up as you install. Start with
          Tier Guide, then drop in the Constitution and the Facts Registry.
        </div>
      ) : null}

      <div
        id="tracker-body"
        style={{
          ...columnsStyle,
          maxHeight: open ? 4000 : 0,
          opacity: open ? 1 : 0,
          overflow: 'hidden',
          transition: reduced
            ? 'none'
            : 'max-height 320ms ease-in-out, opacity 200ms ease-in-out',
          pointerEvents: open ? 'auto' : 'none',
        }}
        aria-hidden={!open}
      >
        <Column
          title="Rules"
          description="Voice, validation, source rigor."
          nodes={RULES_NODES}
          installed={installed}
        />
        <Column
          title="Knowledge"
          description="Facts, decisions, persistent memory."
          nodes={KNOWLEDGE_NODES}
          installed={installed}
        />
        <Column
          title="Skills"
          description="Everything Claude can do for you."
          nodes={SKILLS_NODES}
          installed={installed}
        />
      </div>

      <div
        style={{
          fontSize: 14,
          color: COLORS.inkDeep,
          lineHeight: 1.5,
          padding: '12px 14px',
          borderRadius: 10,
          background: COLORS.accentSoft,
          border: `1px solid ${COLORS.accentMid}`,
        }}
      >
        {prose}
      </div>

      <CodeIntroPanel
        installed={installed}
        surfaceMix={surfaceMix}
        outcomes={outcomes}
        onPrimary={onCodeIntroPrimary}
        onSecondary={onCodeIntroSecondary}
      />
    </aside>
  )
}

export default JourneyTracker
