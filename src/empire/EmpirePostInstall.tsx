/**
 * EmpirePostInstall. The "what happens after you click install" follow-up.
 *
 * Three problems this solves:
 *   1. The user clicks install and gets a single toast that disappears in 8s.
 *      They have no idea what to do next, whether it worked, or what to try
 *      if Claude Desktop did not open. The new panel stays on screen until dismissed.
 *   2. There is no record that they installed anything. Cards do not show
 *      green checks. The user cannot see their own progress. The new panel
 *      offers a "Working through it" button that marks the pack complete.
 *   3. There is no nudge to install the next pack. The new panel suggests
 *      what to do next based on what is already complete.
 *
 * Voice: friend walking you through it. No emoji clutter. No enterprise
 * help-doc tone. The panel reads as if a teammate is sitting next to you
 * confirming the install fired.
 *
 * Hard Rule #11: zero em dashes anywhere in this file.
 */

/* eslint-disable react-refresh/only-export-components */

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle2, AlertCircle, HelpCircle, X, ArrowRight } from 'lucide-react'

const COMPLETION_KEY = 'hoistos.empire.completed.packs'

// ---------------------------------------------------------------------------
// Completion-state persistence (localStorage, with safe SSR fallbacks).
// ---------------------------------------------------------------------------

export function readCompletedPacks(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(COMPLETION_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed)) return new Set(parsed.filter((v): v is string => typeof v === 'string'))
    return new Set()
  } catch {
    return new Set()
  }
}

export function markPackCompleted(packId: string): Set<string> {
  const next = readCompletedPacks()
  next.add(packId)
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(COMPLETION_KEY, JSON.stringify(Array.from(next)))
    } catch {
      // localStorage write blocked. Session-only completion is acceptable degrade.
    }
  }
  return next
}

export function clearPackCompletion(packId: string): Set<string> {
  const next = readCompletedPacks()
  next.delete(packId)
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(COMPLETION_KEY, JSON.stringify(Array.from(next)))
    } catch {
      // ignore
    }
  }
  return next
}

// ---------------------------------------------------------------------------
// Open / close API.
// ---------------------------------------------------------------------------

export interface PostInstallContext {
  packId: string
  packTitle: string
  installPath: 'desktop' | 'clipboard-curl' | 'browser-clipboard' | 'unknown'
  /** Optional next-pack suggestion. Caller controls the heuristic. */
  nextPackTitle?: string
  nextPackId?: string
  /** Callback fires when user marks pack complete. Caller handles state propagation. */
  onMarkComplete?: (packId: string) => void
  /** Callback fires when user wants to retry the install. Caller re-fires the click handler. */
  onRetry?: () => void
}

interface PostInstallPanelProps {
  ctx: PostInstallContext | null
  onClose: () => void
}

// ---------------------------------------------------------------------------
// PostInstallPanel. Renders as a fixed bottom-right card with a slide-up
// animation. Stays on screen until dismissed or marked complete.
// ---------------------------------------------------------------------------

export function PostInstallPanel({ ctx, onClose }: PostInstallPanelProps) {
  if (!ctx) return null

  return (
    <PostInstallPanelInner
      key={`${ctx.packId}-${ctx.installPath}`}
      ctx={ctx}
      onClose={onClose}
    />
  )
}

function PostInstallPanelInner({ ctx, onClose }: { ctx: PostInstallContext; onClose: () => void }) {
  const [view, setView] = useState<'main' | 'troubleshoot' | 'help' | 'success'>('main')

  const expectedFlow = useMemo(
    () => buildExpectedFlow(ctx.installPath),
    [ctx.installPath],
  )

  return (
    <AnimatePresence>
      <motion.aside
        key={`${ctx.packId}-${ctx.installPath}`}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-labelledby="post-install-heading"
        aria-describedby="post-install-body"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 'min(440px, calc(100vw - 48px))',
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          zIndex: 9000,
          background: '#fbfaf3',
          border: '1px solid rgba(20,20,19,0.18)',
          borderRadius: 18,
          boxShadow: '0 20px 50px rgba(20,20,19,0.18), 0 4px 12px rgba(20,20,19,0.08)',
          padding: 24,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#141413',
        }}
        data-post-install-panel
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close install panel"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'transparent',
            border: 'none',
            color: 'rgba(20,20,19,0.5)',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        {view === 'main' ? (
          <MainView ctx={ctx} expectedFlow={expectedFlow} onView={setView} onClose={onClose} />
        ) : null}
        {view === 'troubleshoot' ? (
          <TroubleshootView ctx={ctx} onView={setView} />
        ) : null}
        {view === 'help' ? <HelpView ctx={ctx} onView={setView} /> : null}
        {view === 'success' ? <SuccessView ctx={ctx} onClose={onClose} /> : null}
      </motion.aside>
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// Per-path expected-flow narration.
// ---------------------------------------------------------------------------

function buildExpectedFlow(path: PostInstallContext['installPath']): {
  heading: string
  steps: string[]
} {
  if (path === 'desktop') {
    return {
      heading: 'Claude Desktop should be opening now.',
      steps: [
        'Switch to Claude (Cmd+Tab on Mac, Alt+Tab on Windows).',
        'You should see your install prompt already in the Claude composer.',
        'Hit Return. Claude pulls the full pack from hoistos.com and walks you through the install.',
      ],
    }
  }
  if (path === 'clipboard-curl') {
    return {
      heading: 'The install command is in your clipboard.',
      steps: [
        'Open Terminal (Spotlight, search "Terminal" or "iTerm").',
        'Cmd+V to paste, then hit Return.',
        'The pack lands in ~/.claude/skills/ and registers on your next Claude Code session.',
      ],
    }
  }
  if (path === 'browser-clipboard') {
    return {
      heading: 'The pack is in your clipboard. A new claude.ai tab is opening.',
      steps: [
        'Switch to the new claude.ai tab (it should be on top automatically).',
        'Click the chat composer.',
        'Cmd+V to paste, then hit Return. Claude walks you through the install one question per turn.',
      ],
    }
  }
  return {
    heading: 'Install fired.',
    steps: [
      'Switch to Claude.',
      'Look for the install prompt in your composer or chat.',
      'Hit Return to start the walkthrough.',
    ],
  }
}

// ---------------------------------------------------------------------------
// Sub-views.
// ---------------------------------------------------------------------------

function MainView({
  ctx,
  expectedFlow,
  onView,
  onClose,
}: {
  ctx: PostInstallContext
  expectedFlow: { heading: string; steps: string[] }
  onView: (v: 'troubleshoot' | 'help' | 'success') => void
  onClose: () => void
}) {
  function handleWorking() {
    if (ctx.onMarkComplete) ctx.onMarkComplete(ctx.packId)
    markPackCompleted(ctx.packId)
    onView('success')
    setTimeout(() => onClose(), 5500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          fontWeight: 600,
          color: '#cc6e2e',
        }}
      >
        Install fired
      </div>
      <h3
        id="post-install-heading"
        style={{
          fontSize: 18,
          fontWeight: 600,
          lineHeight: 1.3,
          margin: 0,
          color: '#141413',
          fontFamily: 'Newsreader, Georgia, serif',
        }}
      >
        {expectedFlow.heading}
      </h3>
      <p
        id="post-install-body"
        style={{
          fontSize: 13,
          lineHeight: 1.55,
          color: '#5e5d59',
          margin: 0,
        }}
      >
        Just sent: <strong style={{ color: '#141413' }}>{ctx.packTitle}</strong>.
      </p>
      <ol
        style={{
          paddingLeft: 22,
          margin: 0,
          fontSize: 14,
          lineHeight: 1.6,
          color: '#141413',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {expectedFlow.steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          marginTop: 4,
        }}
      >
        <button
          type="button"
          onClick={handleWorking}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgb(204,110,46)]"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '11px 18px',
            borderRadius: 10,
            background: '#cc6e2e',
            color: '#fbfaf3',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(204,110,46,0.32)',
          }}
        >
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          <span>Mark this one done</span>
        </button>
        <button
          type="button"
          onClick={() => onView('troubleshoot')}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgb(204,110,46)]"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '11px 18px',
            borderRadius: 10,
            background: 'transparent',
            color: '#141413',
            border: '1px solid rgba(20,20,19,0.18)',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
          <span>Help me fix it</span>
        </button>
        <button
          type="button"
          onClick={() => onView('help')}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgb(204,110,46)]"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '8px 18px',
            borderRadius: 10,
            background: 'transparent',
            color: '#5e5d59',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'underline',
            textUnderlineOffset: 3,
          }}
        >
          <HelpCircle className="w-4 h-4" aria-hidden="true" />
          <span>Walk me through it live</span>
        </button>
      </div>
    </div>
  )
}

function TroubleshootView({
  ctx,
  onView,
}: {
  ctx: PostInstallContext
  onView: (v: 'main' | 'help') => void
}) {
  const fixes = useMemo(() => buildTroubleshooting(ctx.installPath), [ctx.installPath])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <button
        type="button"
        onClick={() => onView('main')}
        aria-label="Back to install panel"
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          alignSelf: 'flex-start',
          background: 'transparent',
          border: 'none',
          color: '#5e5d59',
          fontSize: 12,
          fontWeight: 500,
          cursor: 'pointer',
          padding: 0,
          borderRadius: 4,
        }}
      >
        <span aria-hidden="true">← </span>Back
      </button>
      <h3
        style={{
          fontSize: 16,
          fontWeight: 600,
          margin: 0,
          color: '#141413',
          fontFamily: 'Newsreader, Georgia, serif',
        }}
      >
        Try these in order. Most land in under a minute.
      </h3>
      <ol
        style={{
          paddingLeft: 22,
          margin: 0,
          fontSize: 13,
          lineHeight: 1.6,
          color: '#141413',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {fixes.map((fix, i) => (
          <li key={i}>
            <strong>{fix.title}.</strong>{' '}
            <span style={{ color: '#5e5d59' }}>{fix.body}</span>
          </li>
        ))}
      </ol>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button
          type="button"
          onClick={() => {
            if (ctx.onRetry) ctx.onRetry()
            onView('main')
          }}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgb(204,110,46)]"
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 10,
            background: '#cc6e2e',
            color: '#fbfaf3',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Retry install
        </button>
        <button
          type="button"
          onClick={() => onView('help')}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgb(204,110,46)]"
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 10,
            background: 'transparent',
            color: '#141413',
            border: '1px solid rgba(20,20,19,0.18)',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Talk to a human
        </button>
      </div>
    </div>
  )
}

function HelpView({
  ctx,
  onView,
}: {
  ctx: PostInstallContext
  onView: (v: 'main') => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <button
        type="button"
        onClick={() => onView('main')}
        aria-label="Back to install panel"
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          alignSelf: 'flex-start',
          background: 'transparent',
          border: 'none',
          color: '#5e5d59',
          fontSize: 12,
          fontWeight: 500,
          cursor: 'pointer',
          padding: 0,
          borderRadius: 4,
        }}
      >
        <span aria-hidden="true">← </span>Back
      </button>
      <h3
        style={{
          fontSize: 16,
          fontWeight: 600,
          margin: 0,
          color: '#141413',
          fontFamily: 'Newsreader, Georgia, serif',
        }}
      >
        Email us. We will book a 15-minute walkthrough the same day.
      </h3>
      <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, color: '#141413' }}>
        Email <a href="mailto:hello@hoistos.com" style={{ color: '#cc6e2e' }}>hello@hoistos.com</a>{' '}
        with a one-line subject like "Install help, {ctx.packTitle}." We will reply within the
        same business day with a 15-minute walkthrough slot.
      </p>
      <p
        style={{
          fontSize: 12,
          lineHeight: 1.55,
          margin: 0,
          color: '#5e5d59',
          fontStyle: 'italic',
        }}
      >
        Every install email teaches us where this page trips people. Tell us where you got stuck.
        The next visitor benefits.
      </p>
    </div>
  )
}

function SuccessView({ ctx, onClose }: { ctx: PostInstallContext; onClose: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          color: '#3f7c3f',
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
        <span>{ctx.packTitle}. Locked in.</span>
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, color: '#141413' }}>
        The card carries a green check from now on. Close this tab, come back tomorrow,
        the check is still there.
      </p>
      {ctx.nextPackTitle ? (
        <div
          style={{
            background: 'rgba(204,110,46,0.08)',
            borderRadius: 12,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600, color: '#cc6e2e' }}>
            What people install next
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#141413',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>{ctx.nextPackTitle}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" style={{ color: '#cc6e2e' }} />
          </div>
        </div>
      ) : null}
      <button
        type="button"
        onClick={onClose}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgb(204,110,46)]"
        style={{
          alignSelf: 'flex-end',
          padding: '8px 14px',
          borderRadius: 10,
          background: 'transparent',
          color: '#5e5d59',
          border: '1px solid rgba(20,20,19,0.18)',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        Back to packs
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Per-path troubleshooting checklist.
// ---------------------------------------------------------------------------

function buildTroubleshooting(path: PostInstallContext['installPath']): Array<{ title: string; body: string }> {
  if (path === 'desktop') {
    return [
      {
        title: 'Make sure Claude Desktop is open',
        body: 'The install button can only talk to Claude Desktop. Open Claude (Cmd+Space, type "Claude"), sign in, then come back and click the button again.',
      },
      {
        title: 'Open a Claude Desktop chat once',
        body: 'After signing in, open a blank chat in Claude Desktop once. That initializes the app before the install prompt lands.',
      },
      {
        title: 'Try the click again',
        body: 'On a cold launch, the first click can drop the prompt before the dispatcher is ready. A second click usually lands cleanly.',
      },
      {
        title: 'Cmd+Tab to Claude',
        body: 'On Safari and Firefox, the OS does not always pull Claude to the front automatically. Switch to it manually. The prompt should already be in the composer.',
      },
      {
        title: 'Browser blocked the URL scheme',
        body: 'Some browsers prompt the first time a custom URL scheme fires. Allow claude:// when prompted, then click again.',
      },
    ]
  }
  if (path === 'clipboard-curl') {
    return [
      {
        title: 'Check your clipboard',
        body: 'The install command should be there. Open Terminal and try Cmd+V. If it is not there, click the install button again.',
      },
      {
        title: 'Make sure Claude Code is installed',
        body: 'The curl one-liner expects ~/.claude/skills/ to exist, which Claude Code creates on first install. If you have not installed Claude Code yet, do that first (Bonus 05).',
      },
      {
        title: 'Restart your Claude Code session',
        body: 'Skills register at session start. If you have a Claude Code session open, type /reset or restart it after the curl finishes.',
      },
    ]
  }
  if (path === 'browser-clipboard') {
    return [
      {
        title: 'Pop-up blocker',
        body: 'Some browsers block the new claude.ai tab. Look for a pop-up icon in your address bar and allow pop-ups for hoistos.com, then click the button again.',
      },
      {
        title: 'Clipboard permission',
        body: 'Safari may ask the first time. Allow clipboard write when prompted, then click again.',
      },
      {
        title: 'Open claude.ai manually',
        body: 'If the new tab does not open, go to https://claude.ai/new yourself and Cmd+V into the chat composer. The pack is in your clipboard either way.',
      },
    ]
  }
  return [
    {
      title: 'Try the click again',
      body: 'If nothing visibly happened, the click may have been intercepted. A second click usually lands.',
    },
    {
      title: 'Make sure Claude is open',
      body: 'The install path needs Claude (desktop or web) running. Open it, sign in, then retry.',
    },
  ]
}
