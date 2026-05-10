/**
 * EmpirePreflight. The "Before You Install" checklist that lives between the
 * tier picker and the blueprint grid on the Bonus Extras page.
 *
 * Why this exists: the install button fires a `claude://cowork/new?q=...` URL
 * scheme that only works when (a) the user is on a paid Claude plan, (b) the
 * Claude desktop app is installed, and (c) the desktop app has been opened
 * and signed in at least once so the OS registers the URL handler. Without
 * those three preconditions the button silently no-ops and the user thinks
 * the page is broken. The preflight surfaces them as an explicit, inline,
 * collapsible checklist before the user clicks anything.
 *
 * Tone: the page reads like a friend walking you through it. Plain English,
 * no jargon. Each step is one short paragraph, sometimes a CTA, sometimes
 * an expandable detail block. The novice sees a clear path; the operator
 * who already has all three skims past in 10 seconds.
 *
 * Design rules followed in this file:
 *   - R051: single-column vertical stack, never multi-column step rows.
 *   - R049: no lame marketing copy; outcomes in plain language.
 *   - R039: plain English everywhere; talk like a friend explaining.
 *   - HR #11: zero em dashes (U+2014, U+2013).
 *   - HR #31 disclosure: motion@11 is the only external lib touched here.
 *
 * Authoritative sources cited (verified May 2026):
 *   - https://claude.ai/download (Claude desktop installer, free)
 *   - https://claude.ai/upgrade (Pro plan, $17/mo annual or $20/mo monthly)
 *   - https://support.claude.com/en/articles/10065433-installing-claude-for-desktop
 *   - https://www.anthropic.com/product/claude-cowork
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle2, ChevronDown, ExternalLink } from 'lucide-react'
import type { ClaudeTier } from './lib/claude-deep-link'

interface EmpirePreflightProps {
  tier: ClaudeTier
  onScrollToPicker: () => void
}

/**
 * Five-step preflight. Step 1 confirms paid plan. Step 2 ships Claude desktop.
 * Step 3 nudges the first sign-in (registers the URL scheme). Step 4 confirms
 * tier so the install button matches. Step 5 explains what the button does
 * and surfaces the troubleshooting accordion.
 */
export function EmpirePreflight({ tier, onScrollToPicker }: EmpirePreflightProps) {
  const tierPicked = tier === 'desktop' || tier === 'code'

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7 }}
      className="max-w-3xl mx-auto mb-20"
      aria-labelledby="preflight-heading"
    >
      <div className="text-center mb-10">
        <div
          className="font-mono text-[11px] uppercase tracking-[0.22em] mb-4"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          Before you install
        </div>
        <h2
          id="preflight-heading"
          className="font-display text-[clamp(1.75rem,4.5vw,2.75rem)] leading-[1.1] mb-5"
        >
          Five small steps. <span style={{ color: 'rgb(var(--color-accent))' }}>Two minutes.</span>
        </h2>
        <p
          className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          style={{ color: 'rgb(var(--color-fg-muted))' }}
        >
          The install button below opens Claude desktop and prefills your prompt. Make sure these
          five things are true first. If you already have a paid plan and Claude desktop installed,
          you can skim past in ten seconds.
        </p>
      </div>

      <ol className="flex flex-col gap-4">
        <PreflightRow
          n={1}
          title="Have a paid Claude plan."
          subtitle="Pro is enough. Max and Team work too. The free tier does not include Cowork, which is what these blueprints land in."
          done={false}
          cta={{
            label: 'Upgrade to Pro',
            sub: 'opens claude.ai',
            href: 'https://claude.ai/upgrade',
          }}
          detail={
            <div className="flex flex-col gap-3 text-sm" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              <p>
                Pro is $17 a month annual or $20 monthly. It includes Cowork, Claude Code, and the
                higher rate limits you need to walk through these install conversations without
                hitting a wall.
              </p>
              <p>
                Max ($100 to $200 a month) is the same software with five to twenty times the rate
                limits. Useful if you plan to live in Cowork all day. Not required to install these
                blueprints.
              </p>
              <p>
                Team and Enterprise also include Cowork. Same install path.
              </p>
              <p style={{ color: 'rgb(var(--color-fg-subtle))', fontStyle: 'italic' }}>
                Free tier does not have Cowork. Upgrade first or use the browser-only path at the
                bottom of this page.
              </p>
            </div>
          }
        />

        <PreflightRow
          n={2}
          title="Download the Claude desktop app."
          subtitle="Free. macOS or Windows. The desktop app is what registers the install button so it can talk to Claude on your machine."
          done={false}
          cta={{
            label: 'Get the desktop app',
            sub: 'opens claude.ai/download',
            href: 'https://claude.ai/download',
          }}
          detail={
            <div className="flex flex-col gap-3 text-sm" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              <p>
                <strong>macOS:</strong> requires macOS 11 (Big Sur) or higher. Open the .dmg, drag
                Claude into Applications, then launch it.
              </p>
              <p>
                <strong>Windows:</strong> requires Windows 10 or higher. Run the installer, then
                launch Claude from your Start menu.
              </p>
              <p>
                <strong>Linux:</strong> not officially supported by Anthropic. Use the browser-only
                path at the bottom of this page or run Claude Code on a sidecar Mac mini.
              </p>
              <p style={{ color: 'rgb(var(--color-fg-subtle))', fontStyle: 'italic' }}>
                Already have the desktop app? Skip ahead.
              </p>
            </div>
          }
        />

        <PreflightRow
          n={3}
          title="Open the desktop app once and sign in."
          subtitle="This is the step that wakes up the install button. The first launch registers a small URL handler with your operating system, which is what lets the button on this page open Claude on your machine."
          done={false}
          detail={
            <div className="flex flex-col gap-3 text-sm" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              <p>
                After you sign in, look in the left sidebar for <strong>Cowork</strong>. Click it
                once. That initializes the Cowork dispatcher, which is what receives your install
                prompt when you click the button below.
              </p>
              <p>
                You only have to do this once per machine. Future sessions reuse the same handler.
              </p>
              <p style={{ color: 'rgb(var(--color-fg-subtle))', fontStyle: 'italic' }}>
                What is Cowork? Anthropic's agentic workspace inside the desktop app. It lets
                Claude work on a persistent thread, fetch URLs, and run tools. The blueprints below
                install through it.
              </p>
            </div>
          }
        />

        <PreflightRow
          n={4}
          title="Pick your path above: Desktop or Code."
          subtitle="Two paths, two buttons. Desktop covers Pro, Max, Team, and Enterprise (one click into Cowork). Code is the CLI path (one-line curl in Terminal)."
          done={tierPicked}
          cta={
            tierPicked
              ? {
                  label: `You picked ${tier === 'desktop' ? 'Desktop' : 'Code'}`,
                  sub: 'change it anytime above',
                  onClick: onScrollToPicker,
                }
              : {
                  label: 'Pick your path',
                  sub: 'scrolls up',
                  onClick: onScrollToPicker,
                }
          }
          detail={
            <div className="flex flex-col gap-3 text-sm" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              <p>
                <strong>Desktop:</strong> the install button opens Claude Cowork with your prompt
                pre-filled. You hit Return. Claude grabs the full blueprint from hoistos.com using
                its web-fetch tool, then walks you through install one question per turn. Works
                identically on Pro, Max, Team, and Enterprise.
              </p>
              <p>
                <strong>Code CLI:</strong> the button copies a one-line curl command to your
                clipboard. You paste it in Terminal. The blueprint lands in
                <code className="mx-1 px-1.5 py-0.5 rounded text-[11px]" style={{ background: 'rgba(20,20,19,0.06)', fontFamily: 'ui-monospace, Menlo, monospace' }}>~/.claude/skills/</code>
                and Claude registers it on the next session.
              </p>
            </div>
          }
        />

        <PreflightRow
          n={5}
          title="Pick a blueprint below and click the install button."
          subtitle="That is it. The button opens Claude on your machine, prefills the install prompt, and you hit Return. Each blueprint asks two or three questions and handles the rest."
          done={false}
          detail={
            <div className="flex flex-col gap-3 text-sm" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              <p>
                <strong>What if the button does nothing?</strong> Most common cause: Claude desktop
                is closed. Open it once, then click the button again. Second-most-common: Cowork
                has not been opened yet on this machine. Click Cowork in the sidebar once, then
                retry.
              </p>
              <p>
                <strong>The prompt opened in Claude but did not autofill?</strong> Some browsers
                (Safari, Firefox) do not bring Claude to the front automatically. Cmd+Tab to it.
                The prompt is already in the composer.
              </p>
              <p>
                <strong>Browser blocked the popup?</strong> The Code CLI path uses your clipboard
                only and never opens a popup. If you are on Pro or Max and the popup gets blocked,
                Cmd+click the install button to force a new tab, or scroll to the bottom of the
                page for the manual browser-only path.
              </p>
            </div>
          }
        />
      </ol>
    </motion.section>
  )
}

// ---------------------------------------------------------------------------
// PreflightRow. Single accordion row for one step.
// ---------------------------------------------------------------------------

interface PreflightRowProps {
  n: number
  title: string
  subtitle: string
  done: boolean
  cta?: {
    label: string
    sub: string
    href?: string
    onClick?: () => void
  }
  detail: React.ReactNode
}

function PreflightRow({ n, title, subtitle, done, cta, detail }: PreflightRowProps) {
  const [open, setOpen] = useState(false)

  return (
    <li
      className="rounded-2xl p-5 md:p-6 transition-all duration-200"
      style={{
        background: done ? 'rgba(63, 124, 63, 0.06)' : 'rgba(20,20,19,0.025)',
        border: `1px solid ${done ? 'rgba(63, 124, 63, 0.22)' : 'rgba(20,20,19,0.08)'}`,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-full font-mono text-sm font-bold shrink-0"
          style={{
            background: done ? 'rgb(63, 124, 63)' : 'rgb(var(--color-accent))',
            color: '#fbfaf3',
          }}
          aria-hidden="true"
        >
          {done ? <CheckCircle2 className="w-5 h-5" /> : n}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-semibold leading-snug mb-1.5">
            {title}
          </h3>
          <p className="text-sm md:text-[15px] leading-relaxed" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            {subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {cta ? (
              cta.href ? (
                <a
                  href={cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200"
                  style={{
                    background: done ? 'transparent' : 'rgb(var(--color-accent))',
                    color: done ? 'rgb(var(--color-fg))' : 'rgb(var(--color-bg))',
                    border: done ? '1px solid rgba(20,20,19,0.18)' : 'none',
                  }}
                >
                  <span>{cta.label}</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="text-[11px] opacity-70 ml-1">{cta.sub}</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={cta.onClick}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200"
                  style={{
                    background: done ? 'transparent' : 'rgb(var(--color-accent))',
                    color: done ? 'rgb(var(--color-fg))' : 'rgb(var(--color-bg))',
                    border: done ? '1px solid rgba(20,20,19,0.18)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span>{cta.label}</span>
                  <span className="text-[11px] opacity-70 ml-1">{cta.sub}</span>
                </button>
              )
            ) : null}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 text-sm font-medium transition-all duration-200"
              style={{ color: 'rgb(var(--color-fg-muted))', cursor: 'pointer' }}
              aria-expanded={open}
            >
              <span>{open ? 'Hide details' : 'Show me how'}</span>
              <ChevronDown
                className="w-3.5 h-3.5 transition-transform duration-200"
                style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div
              className="mt-4 pt-4 pl-13 ml-1"
              style={{ borderTop: '1px solid rgba(20,20,19,0.06)' }}
            >
              {detail}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  )
}

export default EmpirePreflight
