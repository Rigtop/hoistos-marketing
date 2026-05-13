/**
 * EmpirePreflight. The "Before You Install" checklist that lives between the
 * tier picker and the blueprint grid on the Bonus Extras page.
 *
 * Historical component. The live flow now uses EmpireWorks Bridge first and
 * copy/paste fallback second. Kept on disk for reference only.
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
 * Five-step preflight. Removed from the live page after the Bridge-first
 * packaging pass.
 */
export function EmpirePreflight({ tier, onScrollToPicker }: EmpirePreflightProps) {
  // Both vars retained for back-compat with prop types after Step 4 removal.
  // void markers keep TS from flagging unused declarations.
  void tier
  void onScrollToPicker

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
          Two small steps. <span style={{ color: 'rgb(var(--color-accent))' }}>One minute.</span>
        </h2>
        <p
          className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          style={{ color: 'rgb(var(--color-fg-muted))' }}
        >
          Each blueprint below copies to your clipboard and opens claude.ai in a new tab. You
          paste with Cmd+V (Ctrl+V on Windows) and hit Return. Two preconditions need to be true.
          If both are already true, skim past in ten seconds.
        </p>
      </div>

      <ol className="flex flex-col gap-4">
        <PreflightRow
          n={1}
          title="Have a paid Claude plan."
          subtitle="Pro is enough. Max, Team, and Enterprise work the same way. Free tier does not have the full skill surface these blueprints depend on."
          done={false}
          cta={{
            label: 'Upgrade to Pro',
            sub: 'opens claude.ai',
            href: 'https://claude.ai/upgrade',
          }}
          detail={
            <div className="flex flex-col gap-3 text-sm" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              <p>
                Pro is $17 a month annual or $20 monthly. Includes Project Knowledge (where the
                packs install), Claude Code, and the higher rate limits you need to walk through
                each install conversation without hitting a wall.
              </p>
              <p>
                Max ($100 to $200 a month) is the same software with five to twenty times the
                rate limits. Useful if you plan to live in Claude all day. Not required.
              </p>
              <p>
                Team and Enterprise work the same way. Same install path.
              </p>
              <p style={{ color: 'rgb(var(--color-fg-subtle))', fontStyle: 'italic' }}>
                Free tier does not include Project Knowledge. Upgrade first or expect the install
                to land but not persist.
              </p>
            </div>
          }
        />

        <PreflightRow
          n={2}
          title="Click an install button below. Paste into Claude. Hit Return."
          subtitle="Click Install. The full pack copies to your clipboard. A new tab opens at claude.ai. Press Cmd+V (Ctrl+V on Windows) in the chat input. Hit Return. Each blueprint asks two or three questions and handles the rest."
          done={false}
          detail={
            <div className="flex flex-col gap-3 text-sm" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              <p>
                <strong>What if nothing happens after I click?</strong> Most common cause: popup
                blocker. Cmd+click (or Ctrl+click) the install button to force a new tab, or
                check your browser's blocked-popup notification. The pack is still on your
                clipboard regardless; you can manually open claude.ai/new and paste.
              </p>
              <p>
                <strong>I pasted but Claude says it cannot fetch external URLs.</strong> You
                probably copied the URL of the pack, not the pack itself. Click the install
                button again. It copies the full pack content (about 30 to 70 KB of markdown)
                to your clipboard, which Claude reads as a direct message and runs without any
                fetch step.
              </p>
              <p>
                <strong>Clipboard blocked by my browser?</strong> Some corporate-locked-down
                browsers block JavaScript clipboard writes. Use the Download .md button on each
                pack to save the file, then open it in any text editor, Cmd+A select all, Cmd+C,
                and paste into Claude.
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
