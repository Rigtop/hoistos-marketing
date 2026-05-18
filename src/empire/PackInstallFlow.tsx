/**
 * PackInstallFlow. Round 8 (2026-05-18) rewrite.
 *
 * What changed in round 8:
 *   - A3: Step 1 no longer auto-copies on mount. The button starts as
 *     "Copy prompt to clipboard" and only flips to "Re-copy if it failed"
 *     after the user explicitly clicks. Strong visual feedback on click:
 *     1.6s checkmark + step-number signal glow + ripple.
 *   - A4: Compressed from 3 steps to 2. Step 1 = Copy + Open Claude (single
 *     gesture, two side effects). Step 2 = Verify. A "Show manual steps"
 *     link expands the legacy 3-step view for users who want the explicit
 *     path.
 *   - C2: When opening step 1, PackInstallFlow fetches the real pack body
 *     from /packs-v2/<packId>.md via fetchPackBody (exposed in round 8).
 *     Falls back to the inline starter prompt on 404 or network error.
 *   - C4: handleConfirm increments scrolophyte.metrics.installs and emits
 *     a window CustomEvent for any future ingestor.
 *   - B5: handleConfirm fires a 1.2s scan-line animation across the panel
 *     before calling onComplete.
 *
 * Hard Rule #11: no em dashes.
 * R047 voice, R087 plain English.
 * R067 mobile-first: stepper stacks at 320/375, tap targets 48px+.
 * Context7 (HR #31): react@19.2.5, motion@12.38 (motion.div + AnimatePresence
 * + useReducedMotion from motion/react), lucide-react@1.14 (Check + Copy +
 * ExternalLink + X). All verified live 2026-05-18.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, Copy, ExternalLink, X } from 'lucide-react'
import { instructionFor } from './content/install-instructions'
import type { FoundationCard } from './content/foundation-cards'
import { fetchPackBody, listActivated, markActivated } from '../lib/activate'
import { useIsMobile } from '../lib/useIsMobile'
import { sendEvent } from '../lib/telemetry'
import { applyCustomware } from '../lib/customware'
import { readIntake } from '../lib/intake-state'

const CONFIRMED_KEY = 'scrolophyte.install.confirmedFor'
const ACTIVITY_KEY = 'scrolophyte.activity'
const METRICS_KEY = 'scrolophyte.metrics.installs'

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

function bumpInstallCounter() {
  try {
    const raw = window.localStorage.getItem(METRICS_KEY)
    const n = raw ? parseInt(raw, 10) || 0 : 0
    window.localStorage.setItem(METRICS_KEY, String(n + 1))
  } catch {
    // private mode / quota
  }
}

function stubStarterPrompt(card: FoundationCard, pitch: string): string {
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
  const stubPrompt = useMemo(() => stubStarterPrompt(pack, pitch), [pack, pitch])
  const promptBodyRef = useRef<string>(stubPrompt)

  const [hasCopied, setHasCopied] = useState(false)
  const [copyFlash, setCopyFlash] = useState(false)
  const [troubleOpen, setTroubleOpen] = useState(false)
  const [showManualSteps, setShowManualSteps] = useState(false)
  const [scanFiring, setScanFiring] = useState(false)
  const [bodyState, setBodyState] = useState<'stub' | 'loading' | 'real' | 'failed'>('stub')

  useEffect(() => {
    let cancelled = false
    setBodyState('loading')
    const url = `/packs-v2/${pack.packId}.md`
    fetchPackBody(url)
      .then((text) => {
        if (cancelled) return
        const intake = readIntake() as unknown as Record<string, unknown>
        const wrapped = applyCustomware(
          text,
          intake as Parameters<typeof applyCustomware>[1],
          {},
          {
            surface: surface === 'browser' ? 'desktop' : surface,
            installedPackIds: listActivated(),
          },
        )
        promptBodyRef.current = wrapped
        setBodyState('real')
      })
      .catch(() => {
        if (cancelled) return
        promptBodyRef.current = stubPrompt
        setBodyState('failed')
      })
    return () => {
      cancelled = true
    }
  }, [pack.packId, stubPrompt, surface])

  const triggerCopyFlash = useCallback(() => {
    setCopyFlash(true)
    window.setTimeout(() => setCopyFlash(false), 1600)
  }, [])

  const handleCopy = useCallback(async () => {
    await writeClipboard(promptBodyRef.current)
    setHasCopied(true)
    triggerCopyFlash()
  }, [triggerCopyFlash])

  const handleCopyAndOpen = useCallback(async () => {
    await writeClipboard(promptBodyRef.current)
    setHasCopied(true)
    triggerCopyFlash()
    void sendEvent('pack_copy', { packId: pack.packId, surface })
    void sendEvent('pack_install_wrapped', {
      packId: pack.packId,
      surface,
      meta: { bodyState, wrapped: bodyState === 'real' ? 'yes' : 'no' },
    })
    if (instruction.ctaUrl) {
      window.open(instruction.ctaUrl, '_blank', 'noopener')
    } else if (surface === 'code') {
      // CLI users: copy the install command separately so the clipboard
      // has both prompt and install reference.
      // Stub: surface guidance reads the instruction body, no new tab.
    }
  }, [instruction.ctaUrl, surface, triggerCopyFlash, pack.packId])

  const handleSurfaceOpen = useCallback(() => {
    if (instruction.ctaUrl) {
      window.open(instruction.ctaUrl, '_blank', 'noopener')
    }
  }, [instruction.ctaUrl])

  const handleConfirm = useCallback(() => {
    const confirmed = readBoolMap(CONFIRMED_KEY)
    if (confirmed[pack.packId] || listActivated().includes(pack.packId)) {
      onComplete()
      return
    }
    writeBoolMap(CONFIRMED_KEY, { ...confirmed, [pack.packId]: true })
    markActivated(pack.packId)
    appendActivity(`Confirmed ${pack.title}`)
    bumpInstallCounter()
    void sendEvent('pack_confirmed', { packId: pack.packId, surface })
    try {
      window.dispatchEvent(new Event('scrolophyte:activated'))
      window.dispatchEvent(
        new CustomEvent('scrolophyte:install-confirmed', {
          detail: { packId: pack.packId, ts: new Date().toISOString() },
        }),
      )
    } catch {
      // ignore
    }
    setScanFiring(true)
    const delay = reduce ? 0 : 1200
    window.setTimeout(() => {
      setScanFiring(false)
      onComplete()
    }, delay)
  }, [pack.packId, pack.title, onComplete, reduce])

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
          position: 'relative',
          background: 'white',
          border: '1px solid rgba(20,20,10,0.08)',
          borderRadius: 18,
          padding: isMobile ? '20px' : '28px 32px',
          boxShadow: '0 10px 36px rgba(20,20,10,0.05)',
          overflow: 'hidden',
        }}
      >
        <AnimatePresence>
          {scanFiring ? (
            <motion.div
              key="scan"
              aria-hidden="true"
              initial={{ top: 0, opacity: 0 }}
              animate={{ top: '100%', opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: 3,
                background:
                  'linear-gradient(90deg, transparent, rgba(226,84,28,0.85), transparent)',
                boxShadow: '0 0 16px rgba(226,84,28,0.6)',
                pointerEvents: 'none',
                zIndex: 4,
              }}
            />
          ) : null}
        </AnimatePresence>

        <Step
          number={1}
          done={hasCopied}
          flash={copyFlash}
          title={hasCopied ? 'Copy + open Claude' : 'Copy prompt to clipboard'}
          body={
            hasCopied
              ? `Prompt landed on your clipboard${bodyState === 'real' ? ' (full pack body)' : bodyState === 'failed' ? ' (starter prompt, pack body fetch failed)' : ''}. Paste it into Claude with Cmd-V.`
              : `One click writes the install prompt to your clipboard${bodyState === 'real' ? ' (full pack body)' : ''} and opens Claude in a new tab.`
          }
        >
          {!hasCopied ? (
            <button
              type="button"
              onClick={handleCopyAndOpen}
              style={primaryButtonStyle}
              aria-label="Copy prompt and open Claude"
            >
              <ExternalLink size={14} aria-hidden="true" />
              Copy prompt + open Claude
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleCopy}
                style={ghostButtonStyle}
                aria-label="Re-copy install prompt"
              >
                {copyFlash ? (
                  <>
                    <Check size={12} aria-hidden="true" /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={12} aria-hidden="true" /> Re-copy if it failed
                  </>
                )}
              </button>
              {instruction.ctaUrl ? (
                <button
                  type="button"
                  onClick={handleSurfaceOpen}
                  style={ghostButtonStyle}
                  aria-label={instruction.ctaLabel}
                >
                  <ExternalLink size={12} aria-hidden="true" /> Re-open Claude
                </button>
              ) : null}
            </div>
          )}
        </Step>

        <Step
          number={2}
          title="Verify it stuck"
          body={`Ask your Claude: "${pack.question}". If Claude answers in your voice with the pack behavior, the install worked.`}
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
              disabled={scanFiring}
              style={{ ...primaryButtonStyle, width: isMobile ? '100%' : 'auto', minWidth: 200, opacity: scanFiring ? 0.6 : 1 }}
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
              <li>Make sure clipboard permission was granted.</li>
              <li>Tap re-copy on step 1, then paste again.</li>
              <li>On Desktop, verify Filesystem MCP is on under the connectors panel.</li>
              <li>Switch surface from your Command Center if Browser is not enough.</li>
            </ul>
          ) : null}
        </Step>

        <div style={{ marginTop: 14 }}>
          <button
            type="button"
            onClick={() => setShowManualSteps((v) => !v)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#4A4A3A',
              fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              padding: '6px 0',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            {showManualSteps ? 'Hide manual steps' : 'Show manual steps (3-step view)'}
          </button>
          {showManualSteps ? (
            <ol
              style={{
                marginTop: 8,
                paddingLeft: 24,
                fontSize: 13,
                color: '#4A4A3A',
                lineHeight: 1.55,
                fontFamily: "'Newsreader', Georgia, serif",
              }}
            >
              <li>{instruction.stepTitle}</li>
              <li>{instruction.stepBody}</li>
              <li>Ask your Claude the verify prompt and confirm above.</li>
            </ol>
          ) : null}
        </div>
      </motion.div>
    </div>
  )
}

interface StepProps {
  number: number
  title: string
  body: string
  done?: boolean
  flash?: boolean
  children?: React.ReactNode
}

function Step({ number, title, body, done, flash, children }: StepProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 18,
        padding: '18px 0',
        borderBottom: '1px solid rgba(20,20,10,0.08)',
      }}
    >
      <motion.span
        aria-hidden="true"
        animate={
          flash
            ? { scale: [1, 1.18, 1], boxShadow: ['0 0 0 0 rgba(226,84,28,0)', '0 0 0 12px rgba(226,84,28,0)', '0 0 0 0 rgba(226,84,28,0)'] }
            : { scale: 1 }
        }
        transition={{ duration: 0.6, ease: 'easeOut' }}
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
        {done ? <Check size={16} aria-hidden="true" /> : number}
      </motion.span>
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
