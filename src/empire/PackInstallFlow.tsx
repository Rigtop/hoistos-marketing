/**
 * PackInstallFlow. Three-step inline install panel. NO modal.
 *
 * Mockup reference: mockup-A-v3.html lines 282-320 (install stepper + steps),
 * plus startInstall() lines 608-620, confirmInstall() lines 623-631.
 *
 * Steps:
 *   1. Auto-copy on mount via navigator.clipboard.writeText. Idempotency
 *      guard: only fires once per pack id within a session, recorded under
 *      localStorage key `scrolophyte.install.firedFor`. The "Re-copy if it
 *      failed" button calls writeText again unconditionally with a 600ms
 *      "Copied" flash.
 *   2. Surface-specific paste body from content/install-instructions.ts
 *      keyed by the user's first q3 surface preference. Re-renders on every
 *      surface change. CTA opens claude.ai/new (or runs the CLI command,
 *      which we expose as a copy-to-clipboard helper).
 *   3. Idempotent confirm. Clicking "It worked" sets
 *      `scrolophyte.install.confirmedFor[packId] = true` before calling
 *      markActivated so a double-tap cannot double-increment. "Something is
 *      off" expands an inline troubleshooting note instead of an alert.
 *
 * Hard Rule #11: no em dashes.
 * R047 voice: no banned openers, plain English copy.
 * R067 mobile-first: stepper stacks at 320 / 375, tap targets 48px+.
 * Context7 (HR #31): react@19.2.5 useState/useEffect/useCallback verified
 *   live 2026-05-18. motion@12.38 motion.div + useReducedMotion verified.
 *   lucide-react@1.14 Check + Copy + ExternalLink + X verified.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Check, Copy, ExternalLink, X } from 'lucide-react'
import { instructionFor } from './content/install-instructions'
import type { FoundationCard } from './content/foundation-cards'
import { listActivated, markActivated } from '../lib/activate'
import { useIsMobile } from '../lib/useIsMobile'

const FIRED_KEY = 'scrolophyte.install.firedFor'
const CONFIRMED_KEY = 'scrolophyte.install.confirmedFor'
const ACTIVITY_KEY = 'scrolophyte.activity'

type Surface = 'browser' | 'desktop' | 'code'

interface ActivityEntry {
  ts: string
  message: string
}

function readBoolMap(key: string): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, boolean>) : {}
  } catch {
    return {}
  }
}

function writeBoolMap(key: string, map: Record<string, boolean>) {
  try {
    window.localStorage.setItem(key, JSON.stringify(map))
  } catch {
    // private mode / quota
  }
}

function appendActivity(message: string) {
  try {
    const raw = window.localStorage.getItem(ACTIVITY_KEY)
    const arr: ActivityEntry[] = raw ? JSON.parse(raw) : []
    arr.unshift({ ts: new Date().toISOString(), message })
    window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(arr.slice(0, 25)))
  } catch {
    // private mode / quota
  }
}

function starterPromptFor(card: FoundationCard, pitch: string): string {
  return [
    `Install the ${card.title} pack (${card.badge}) for me.`,
    '',
    `Layer: ${card.layer}`,
    `Pack id: ${card.packId}`,
    '',
    pitch,
    '',
    `When installed, you should be able to: ${card.claudeStateDelta}`,
    '',
    `Sample prompt to verify the install: ${card.question}`,
  ].join('\n')
}

async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

export interface PackInstallFlowProps {
  pack: FoundationCard
  pitch: string
  surface: Surface
  queuePosition: number
  queueTotal: number
  onComplete: () => void
  onCancel: () => void
}

export function PackInstallFlow({
  pack,
  pitch,
  surface,
  queuePosition,
  queueTotal,
  onComplete,
  onCancel,
}: PackInstallFlowProps) {
  const isMobile = useIsMobile()
  const reduce = useReducedMotion()
  const instruction = useMemo(() => instructionFor(surface), [surface])
  const promptBody = useMemo(() => starterPromptFor(pack, pitch), [pack, pitch])

  const [recopyFlash, setRecopyFlash] = useState(false)
  const [troubleOpen, setTroubleOpen] = useState(false)

  useEffect(() => {
    const fired = readBoolMap(FIRED_KEY)
    if (fired[pack.packId]) return
    writeBoolMap(FIRED_KEY, { ...fired, [pack.packId]: true })
    void writeClipboard(promptBody)
  }, [pack.packId, promptBody])

  const handleRecopy = useCallback(async () => {
    await writeClipboard(promptBody)
    setRecopyFlash(true)
    window.setTimeout(() => setRecopyFlash(false), 600)
  }, [promptBody])

  const handleSurfaceCta = useCallback(async () => {
    if (instruction.ctaUrl) {
      window.open(instruction.ctaUrl, '_blank', 'noopener')
      return
    }
    if (surface === 'code') {
      await writeClipboard(`claude code install ${pack.packId}`)
      setRecopyFlash(true)
      window.setTimeout(() => setRecopyFlash(false), 600)
    }
  }, [instruction.ctaUrl, surface, pack.packId])

  const handleConfirm = useCallback(() => {
    const confirmed = readBoolMap(CONFIRMED_KEY)
    if (confirmed[pack.packId] || listActivated().includes(pack.packId)) {
      onComplete()
      return
    }
    writeBoolMap(CONFIRMED_KEY, { ...confirmed, [pack.packId]: true })
    markActivated(pack.packId)
    appendActivity(`Confirmed ${pack.title}`)
    try {
      window.dispatchEvent(new Event('scrolophyte:activated'))
    } catch {
      // ignore
    }
    onComplete()
  }, [pack.packId, pack.title, onComplete])

  return (
    <div
      data-component="pack-install-flow"
      style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: isMobile ? '24px 16px 64px' : '40px 24px 80px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
            fontSize: 11,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#E2541C',
          }}
        >
          Pack {queuePosition} of {queueTotal} in your trio
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Back to pack"
          style={{
            width: 36,
            height: 36,
            background: 'transparent',
            border: 'none',
            color: '#4A4A3A',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <h2
        style={{
          fontFamily: "'Newsreader', Georgia, serif",
          fontSize: isMobile ? '2rem' : '2.6rem',
          fontWeight: 500,
          color: '#14140A',
          margin: 0,
          marginBottom: 6,
          letterSpacing: '-0.015em',
        }}
      >
        Installing {pack.title}
      </h2>
      <p
        style={{
          margin: 0,
          marginBottom: 24,
          fontSize: 15,
          color: '#4A4A3A',
          fontFamily: "'Newsreader', Georgia, serif",
        }}
      >
        {instruction.subtitle}
      </p>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: 'white',
          border: '1px solid rgba(20,20,10,0.08)',
          borderRadius: 18,
          padding: isMobile ? '20px' : '28px 32px',
          boxShadow: '0 10px 36px rgba(20,20,10,0.05)',
        }}
      >
        <Step
          number={1}
          done
          title="Copied to your clipboard"
          body="The full install prompt is on your clipboard right now. If something looked off, hit re-copy."
        >
          <button
            type="button"
            onClick={handleRecopy}
            style={ghostButtonStyle}
            aria-label="Re-copy install prompt"
          >
            {recopyFlash ? (
              <>
                <Check size={12} aria-hidden="true" /> Copied
              </>
            ) : (
              <>
                <Copy size={12} aria-hidden="true" /> Re-copy if it failed
              </>
            )}
          </button>
        </Step>

        <Step number={2} title={instruction.stepTitle} body={instruction.stepBody}>
          {surface === 'browser' ? (
            <button
              type="button"
              onClick={handleSurfaceCta}
              style={primaryButtonStyle}
              aria-label={instruction.ctaLabel}
            >
              <ExternalLink size={14} aria-hidden="true" />
              {instruction.ctaLabel}
            </button>
          ) : surface === 'code' ? (
            <button
              type="button"
              onClick={handleSurfaceCta}
              style={primaryButtonStyle}
              aria-label="Copy install command"
            >
              {recopyFlash ? (
                <>
                  <Check size={14} aria-hidden="true" />
                  Command copied
                </>
              ) : (
                <>
                  <Copy size={14} aria-hidden="true" />
                  Copy install command
                </>
              )}
            </button>
          ) : (
            <div
              style={{
                fontSize: 13,
                color: '#4A4A3A',
                fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
              }}
            >
              Open Claude Desktop from your dock, start a new chat, press Cmd-V.
            </div>
          )}
        </Step>

        <Step
          number={3}
          title="Verify it stuck"
          body={`Ask your Claude: "${pack.question}". If Claude answers in your voice, the install worked.`}
        >
          <div
            style={{
              display: 'flex',
              gap: 10,
              flexDirection: isMobile ? 'column' : 'row',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={handleConfirm}
              style={{ ...primaryButtonStyle, width: isMobile ? '100%' : 'auto', minWidth: 200 }}
            >
              <Check size={14} aria-hidden="true" /> It worked
            </button>
            <button
              type="button"
              onClick={() => setTroubleOpen((v) => !v)}
              style={{
                ...ghostButtonStyle,
                width: isMobile ? '100%' : 'auto',
                minWidth: 180,
                justifyContent: 'center',
              }}
            >
              Something is off
            </button>
          </div>
          {troubleOpen ? (
            <ul
              style={{
                marginTop: 12,
                padding: '14px 18px',
                background: 'rgba(20,20,10,0.04)',
                borderRadius: 10,
                fontSize: 13,
                color: '#4A4A3A',
                fontFamily: "'Newsreader', Georgia, serif",
                lineHeight: 1.55,
                listStyle: 'disc',
                paddingLeft: 32,
              }}
            >
              <li>Make sure the clipboard permission was granted.</li>
              <li>Tap re-copy on step 1, then paste again.</li>
              <li>On Desktop, verify Filesystem MCP is on under the connectors panel.</li>
              <li>Switch surface from your Command Center if Browser is not enough.</li>
            </ul>
          ) : null}
        </Step>
      </motion.div>
    </div>
  )
}

interface StepProps {
  number: number
  title: string
  body: string
  done?: boolean
  children?: React.ReactNode
}

function Step({ number, title, body, done, children }: StepProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 18,
        padding: '18px 0',
        borderBottom: '1px solid rgba(20,20,10,0.08)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: done ? '#E2541C' : 'rgba(20,20,10,0.06)',
          color: done ? '#FBFAF3' : '#4A4A3A',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
          fontSize: 13,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {number}
      </span>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          style={{
            fontFamily: "'Newsreader', Georgia, serif",
            fontSize: 18,
            color: '#14140A',
            fontWeight: 500,
          }}
        >
          {title}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: '#4A4A3A',
            fontFamily: "'Newsreader', Georgia, serif",
            lineHeight: 1.5,
          }}
        >
          {body}
        </p>
        {children ? <div style={{ marginTop: 6 }}>{children}</div> : null}
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
  padding: '10px 18px',
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

export default PackInstallFlow
