/**
 * EmpireBonusExtras. The wireframe-blueprints surface.
 *
 * S199 refactor: tier-aware install. The button you see depends on which
 * Claude tier you picked. Pro copies to your clipboard plus opens Claude.ai
 * in a new tab. Max opens the desktop app with the prompt pre-filled. Code
 * copies a one-line curl command for your terminal. The bonus packs live
 * under public/bonus-extras/, not public/packs-v2/, so we wrap the
 * claude-deep-link.ts helper with a bonus-specific URL base.
 *
 * Hard Rule #11: zero em dashes anywhere in this file.
 *
 * External libs (HR #31 disclosure on this turn):
 *   - react-router-dom@6 (Link)
 *   - motion@11 (motion primitives)
 *   - lucide-react@0.400+ (icons)
 *   - react-hot-toast@2.6.0 (toast.success / toast.error, repo convention)
 */

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, CheckCircle2, Download, ExternalLink, Globe2, Terminal } from 'lucide-react'
import toast from 'react-hot-toast'
import { type ClaudeTier, readTier, writeTier } from './lib/claude-deep-link'
// EmpirePreflight import removed 2026-05-11: preflight moved to Foundation page.
import {
  PostInstallPanel,
  type PostInstallContext,
  readCompletedPacks,
} from './EmpirePostInstall'

const BONUS_BASE_URL = 'https://hoistos.com/bonus-extras'

interface BonusBlueprint {
  id: string
  slug: string
  number: string
  title: string
  oneLine: string
  scope: string
  installMinutes: number
  installDisplay: string
  artifact: string
  /** Hint for users on Claude desktop (Pro / Max / Team / Enterprise). */
  desktopHint: string
  /** Hint for users on Claude Code CLI. */
  codeHint: string
  /** When true, the pack runs daemons or hooks that require Claude Code CLI
   *  on the user's machine. Pro/Max desktop cannot host the runtime. Surfaces
   *  as a "Requires Code CLI" badge on the card. */
  requiresCodeCli?: boolean
}

const BLUEPRINTS: BonusBlueprint[] = [
  {
    id: 'bonus-00-overview',
    slug: 'bonus-00-overview',
    number: 'B-00',
    title: 'Wireframe Index',
    oneLine: 'A 90-second tour of the eight blueprints below. Tells you what each one builds, the order they were designed to install in, and which two or three to start with based on how you actually work. Read this once before you click any other install button so you do not waste a coffee break installing the wrong piece first.',
    scope: 'The map before the maps. Tells you what to install when, what depends on what, and which packs you can safely skip if your shape does not need them.',
    installMinutes: 10,
    installDisplay: '10 min read',
    artifact: 'A 90-second tour of the eight blueprints, ordered by what builds on what.',
    desktopHint: 'Open in Cowork with one click. Read the index, then click into a blueprint.',
    codeHint: 'One-liner drops the index into your skills folder. Claude surfaces it the next time you open a session.',
  },
  {
    id: 'bonus-01-notion-foundation',
    slug: 'bonus-01-notion-foundation',
    number: 'B-01',
    title: 'Notion Foundation',
    oneLine: 'Four Notion databases (People, Companies, Projects, Meetings) created with the relations between them already drawn, plus five example rows in each so you can see the shape before you fill it in. This is the Notion structure most operators rebuild three times before getting it right. Install once, get it right on day one, never re-architect again.',
    scope: 'The entity layer everything else snaps onto. One parent Operating Stack page, four databases, every relation already drawn, five seed rows per database for shape.',
    installMinutes: 75,
    installDisplay: '60 to 90 min',
    artifact: 'Four Notion databases plus a parent Operating Stack page. Relations live, with five example rows in each so you can see the shape.',
    desktopHint: 'Click Open in Cowork. Claude pulls the skill, walks the four database creates through your Notion connection, then reads the live state back to confirm the relations wired correctly.',
    codeHint: 'Run the one-liner. The skill walks the database creation through your Notion connection. Three questions, ninety seconds, four databases land.',
  },
  {
    id: 'bonus-02-notion-operating-layer',
    slug: 'bonus-02-notion-operating-layer',
    number: 'B-02',
    title: 'Notion Operating Layer',
    oneLine: 'Three more Notion databases on top of the Foundation: Task Commander (your action item bus), Meeting Intelligence (transcript-to-decision capture), and Code Projects (engineering work tracking). Plus the flows that link them automatically. Paste a meeting transcript and watch the tasks, decisions, and follow-up engineering items all wire themselves to the right People and Projects with zero manual linking.',
    scope: 'The day-two operating layer. Paste a meeting transcript and watch the tasks, decisions, and follow-up Code Projects all link themselves to the right People and Projects without you touching the linking step.',
    installMinutes: 75,
    installDisplay: '60 to 90 min',
    artifact: 'Three more databases on top of the Foundation. Plus the flow that turns a meeting transcript into linked decisions, action items, and code projects.',
    desktopHint: 'Same install pattern as the Foundation. The skill checks for the Foundation first and prompts you to install it if you skipped ahead. After the create runs, you can watch the relations land in your Notion sidebar in under two minutes.',
    codeHint: 'One-liner drops the skill. Restart your session. Trigger phrase builds the three databases and runs the three example flows.',
  },
  {
    id: 'bonus-03-rag-setup',
    slug: 'bonus-03-rag-setup',
    number: 'B-03',
    title: 'RAG Setup',
    requiresCodeCli: true,
    oneLine: 'A search layer that lets Claude answer from your own knowledge instead of from what it was trained on. A watcher on your filesystem indexes every file you create. A daily sync pulls your Notion content into the same index. Ask any question and Claude returns a ranked list of passages from your own writing, with the file path back to the source. The first time you watch Claude answer "what did I tell Steve about the proposal" with citations from a meeting note you forgot you wrote, the upgrade pays for itself.',
    scope: 'The search layer. A watcher on your filesystem and a daily Notion sync feed the index. Claude answers from your own knowledge, not from what it was trained on.',
    installMinutes: 105,
    installDisplay: '90 to 120 min',
    artifact: 'A search tool wired into Claude, running on your own database, indexing your files and Notion. Cites every claim with a file path.',
    desktopHint: 'The watcher itself runs on Code, not on Claude desktop. Open the markdown in Cowork to read the pattern, then install for real on your Code laptop.',
    codeHint: 'The blueprint asks for three API keys. Everything else picks sensible defaults. The first index runs while you read the README.',
  },
  {
    id: 'bonus-04-telegram-bridge',
    slug: 'bonus-04-telegram-bridge',
    number: 'B-04',
    title: 'Telegram Bridge',
    requiresCodeCli: true,
    oneLine: 'A Telegram bot tied to your laptop that lets you reach your full Claude setup from your phone. Text the bot from a jobsite, Claude reads your Notion and your knowledge base, runs whatever skills you have installed, and replies in seconds. The bridge holds your tier identity, your memory, your routing rules, all of it. Same Claude as the one on your laptop, addressable from any pocket.',
    scope: 'Lets you reach your full Claude setup from your phone. Text the bot from a jobsite, Claude reads your Notion and your knowledge base, replies in seconds with the same identity and rules as on your laptop.',
    installMinutes: 60,
    installDisplay: '60 min',
    artifact: 'A small Python bridge, a launchd job that keeps it running, and an allowlist so only your phone can drive your bot.',
    desktopHint: 'Read-only in Cowork. The bridge is a small daemon on your laptop and lives on Code tier. Open the markdown to understand the pattern, install on Code when you are ready.',
    codeHint: 'Two inputs: a bot token from BotFather, your own Telegram chat ID. Skill scaffolds the bridge, the launchd job, and a health check.',
  },
  {
    id: 'bonus-05-code-cli-setup',
    slug: 'bonus-05-code-cli-setup',
    number: 'B-05',
    title: 'Code CLI Setup',
    oneLine: 'The day-one terminal setup most blueprints assume you already have. Installs Claude Code on your laptop, walks you through the login flow, wires your first connector (Notion or your filesystem), drops your first hook (the em-dash blocker so banned characters cannot ship from your CLI). Verifies the install with one prompt at the end so you know it worked before you close the tab.',
    scope: 'The base layer under everything else. Most blueprints assume Code is installed. This pack installs Code, walks you through login, and shows you the basic patterns.',
    installMinutes: 35,
    installDisplay: '30 to 45 min',
    artifact: 'A working claude command in your terminal, your first cold-start file, the Notion connector wired up, and an em-dash blocker hook running.',
    desktopHint: 'Skip if you only use Claude desktop. The CLI is for users who want a terminal-first workflow alongside Cowork. If you want both, install this.',
    codeHint: 'Run the one-liner. The skill walks you through it: install command, login flow, first connector, first hook. Verify with one prompt at the end.',
  },
  {
    id: 'bonus-06-auto-memory-architecture',
    slug: 'bonus-06-auto-memory-architecture',
    number: 'B-06',
    title: 'Auto-Memory Architecture',
    oneLine: 'The pattern that turns ad-hoc corrections into structural lessons Claude carries across every chat. A memory folder layout, an index file Claude reads automatically when a session starts, and a propagator skill that fires on phrases like "remember", "from now on", and "correction." Tell Claude something on Tuesday. Wednesday morning, fresh chat, the correction holds. Every correction compounds. By correction 200 your Claude is sharper than the second-most-senior teammate on your bench.',
    scope: 'You correct Claude on Tuesday. Wednesday morning, fresh chat, the correction holds. Every correction compounds. By correction 200, Claude is sharper than your second-most-senior teammate.',
    installMinutes: 45,
    installDisplay: '45 min',
    artifact: 'A memory folder layout, an index file Claude loads when a session starts, and a skill that fires on "remember" and writes to the right place.',
    desktopHint: 'Lighter version on desktop. Memory lives in your Project Knowledge with a manual paste pattern, and the desktop app auto-loads at session start. Read the markdown to see the shape; the full pattern lives on Code.',
    codeHint: 'Code is where this lives best. Memory files on disk, auto-loaded at session start, and a propagator skill that fires on the trigger phrases you already use.',
  },
  {
    id: 'bonus-07-hooks-and-daemons',
    slug: 'bonus-07-hooks-and-daemons',
    number: 'B-07',
    title: 'Hooks Plus Daemons',
    requiresCodeCli: true,
    oneLine: 'The plumbing that keeps Claude reliable in the long run. Hooks fire before and after every tool call (file writes, Notion writes, email drafts) so your voice rules and routing rules block bad output at the OS exit-code level instead of asking the prompt nicely. Background jobs run on their own schedule with health checks that surface a flag if anything stops working. This is the pack that turns voice rules from advisory text into structural enforcement.',
    scope: 'The plumbing that keeps Claude reliable. Voice and routing rules block bad writes at the OS exit-code level. Background jobs stay alive with health checks. Hooks before and after every tool call.',
    installMinutes: 60,
    installDisplay: '60 min',
    artifact: 'Three example hooks (em-dash blocker, Notion write check, banned-pattern blocker) plus three example background jobs (daily reconcile, watcher, the Telegram bridge from B-04).',
    desktopHint: 'Claude desktop does not run hooks or background jobs. Open the markdown in Cowork to understand the pattern, then install on Code when you are ready.',
    codeHint: 'The blueprint scaffolds three hooks and three launchd jobs. You pick which to turn on. The health check is one paste.',
  },
]

// ---------------------------------------------------------------------------
// Bonus-specific helpers (mirror claude-deep-link.ts but for /bonus-extras/).
// ---------------------------------------------------------------------------

// One-line curl install for Code tier. Drops the bonus pack into
// ~/.claude/skills/<slug>/SKILL.md and prints a confirmation. Single line so
// a paste lands as one history entry. Used by oneClickInstall (code branch)
// and the install-modal footer hint.
function buildBonusCurlInstall(b: BonusBlueprint): string {
  return `mkdir -p ~/.claude/skills/${b.slug} && curl -fsSL ${BONUS_BASE_URL}/${b.id}.md -o ~/.claude/skills/${b.slug}/SKILL.md && echo "Installed ${b.id}. Restart your Claude Code session to register."`
}

const BONUS_CACHE = new Map<string, string>()

// Async fetch helper. Used to populate the cache on mount; click handlers
// pull from the cache synchronously so the clipboard write stays inside the
// user-gesture context (Safari + Firefox are strict about this).
async function fetchBonusMarkdown(b: BonusBlueprint): Promise<string> {
  if (BONUS_CACHE.has(b.id)) return BONUS_CACHE.get(b.id)!
  try {
    const res = await fetch(`/bonus-extras/${b.id}.md`, { cache: 'default' })
    if (!res.ok) throw new Error(`bonus ${b.id} returned ${res.status}`)
    const text = await res.text()
    BONUS_CACHE.set(b.id, text)
    return text
  } catch {
    return `# ${b.title}\n\nUnable to load this blueprint right now. Try again in a moment.`
  }
}

// Pre-fetch every blueprint markdown on first render. Hot cache means click
// handlers can call clipboard.writeText synchronously (within the user
// gesture) which is the only path Safari + Firefox accept.
function prefetchAllBonusMarkdowns(): void {
  for (const b of BLUEPRINTS) {
    if (BONUS_CACHE.has(b.id)) continue
    fetch(`/bonus-extras/${b.id}.md`, { cache: 'default' })
      .then((r) => (r.ok ? r.text() : null))
      .then((t) => {
        if (typeof t === 'string') BONUS_CACHE.set(b.id, t)
      })
      .catch(() => {})
  }
}

// Manual-copy fallback. Renders an alert + opens a textarea overlay so the
// user can select-all + Cmd+C even when navigator.clipboard.writeText fails.
// Per H4 download-launch-ux research, this is the recommended fallback path.
function showFallbackTextarea(text: string, label: string): void {
  const wrap = document.createElement('div')
  wrap.style.cssText =
    'position:fixed;inset:0;background:rgba(20,20,19,0.92);z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,-apple-system,sans-serif;'
  wrap.id = 'hoistos-fallback-copy'

  const card = document.createElement('div')
  card.style.cssText =
    'background:#fbfaf3;border-radius:16px;padding:24px;max-width:720px;width:100%;max-height:80vh;display:flex;flex-direction:column;gap:14px;'

  const heading = document.createElement('div')
  heading.style.cssText = 'font-size:16px;font-weight:600;color:#141413;'
  heading.textContent = `Manual copy: ${label}`

  const sub = document.createElement('div')
  sub.style.cssText = 'font-size:13px;color:#5e5d59;line-height:1.5;'
  sub.textContent =
    'Browser blocked the auto-copy. Click inside the box, press Cmd+A then Cmd+C. Then close this and paste in Claude.'

  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.cssText =
    'width:100%;flex:1;min-height:240px;padding:12px;border:1px solid rgba(20,20,19,0.18);border-radius:8px;font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.5;color:#141413;background:#ffffff;resize:vertical;'

  const row = document.createElement('div')
  row.style.cssText = 'display:flex;gap:10px;justify-content:flex-end;'

  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.textContent = 'Close'
  closeBtn.style.cssText =
    'padding:10px 18px;border-radius:10px;background:#cc6e2e;color:#fbfaf3;border:none;cursor:pointer;font-size:14px;font-weight:500;'
  closeBtn.onclick = () => wrap.remove()

  const tryAgainBtn = document.createElement('button')
  tryAgainBtn.type = 'button'
  tryAgainBtn.textContent = 'Try copy again'
  tryAgainBtn.style.cssText =
    'padding:10px 18px;border-radius:10px;background:transparent;color:#141413;border:1px solid rgba(20,20,19,0.2);cursor:pointer;font-size:14px;font-weight:500;'
  tryAgainBtn.onclick = () => {
    ta.focus()
    ta.select()
    try {
      // execCommand is deprecated but still works as a fallback in older browsers
      const ok = document.execCommand('copy')
      if (ok) {
        toast.success('Copied via fallback. Now paste in Claude.', { duration: 4000 })
      }
    } catch {
      // ignore
    }
  }

  row.appendChild(tryAgainBtn)
  row.appendChild(closeBtn)
  card.appendChild(heading)
  card.appendChild(sub)
  card.appendChild(ta)
  card.appendChild(row)
  wrap.appendChild(card)
  document.body.appendChild(wrap)

  // Auto-select on open so the user can hit Cmd+C immediately.
  setTimeout(() => {
    ta.focus()
    ta.select()
  }, 50)
}

// ONE-CLICK INSTALL (tier-aware).
//
// Two functional paths, one button. Verified May 2026 against the Anthropic
// Help Center: Cowork is included on every paid Claude plan (Pro $17 to $20
// per month, Max 5x and 20x, Team Standard and Premium, Enterprise). Pro and
// Max therefore share one install path. Code CLI is a separate path because
// the artifact lives in ~/.claude/skills, not the Cowork composer.
//
//   Pro / Max / Team:  Single-fire claude://cowork/new?q=<bootstrap> via
//                      anchor click. The OS hands the URL to Claude desktop
//                      (registered on first sign-in). Cowork dispatcher
//                      prefills the composer. User hits Return. Claude's
//                      web-fetch tool grabs the full pack from hoistos.com,
//                      walks the install one question per turn.
//
//                      Trade-offs:
//                      - Cold-launch race may drop first prompt if Cowork
//                        dispatcher is not yet initialized. Mitigation:
//                        preflight Step 3 says "Open Claude desktop once
//                        and sign in" before clicking.
//                      - Safari + Firefox do not auto-focus the existing
//                        Cowork window (Anthropic-side quirk). User Cmd+Tab.
//
//   Code:  navigator.clipboard.writeText(curl one-liner) inside the click
//          gesture. Toast: "Paste in Terminal." One-liner drops the pack
//          into ~/.claude/skills/<slug>/SKILL.md and prints a confirmation.
//
//   Unknown:  Toast asking the user to pick a tier; scroll the TierPicker
//             into view. Nothing destructive fires.
//
// Browser-only / Linux users: handled by a separate "Use the browser" panel
// rendered below the blueprint grid. That panel exposes a copy-to-clipboard
// + open-claude.ai-in-new-tab flow that does not depend on the desktop app.
//
// Hard Rule #11: zero em dashes anywhere in this function or its toasts.
function oneClickInstall(b: BonusBlueprint, tier: ClaudeTier): void {
  // Code: clipboard the curl one-liner.
  if (tier === 'code') {
    const cmd = buildBonusCurlInstall(b)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cmd).then(
        () => {
          toast.success(
            `Copied install command for ${b.title}. Paste in Terminal.`,
            { duration: 8000 },
          )
        },
        () => {
          showFallbackTextarea(cmd, `${b.title} install command`)
        },
      )
    } else {
      showFallbackTextarea(cmd, `${b.title} install command`)
    }
    return
  }

  // Desktop (Pro / Max / Team / Enterprise): claude://cowork/new?q=<bootstrap>.
  if (tier === 'desktop') {
    const fullUrl = `${BONUS_BASE_URL}/${b.id}.md`
    const bootstrap = [
      `Install the HoistOS Bonus Extras blueprint: ${b.title}.`,
      ``,
      `Use your web-fetch tool to retrieve the full pack from ${fullUrl}, then walk me through install one question per turn.`,
      `After the personalization questions, emit the artifacts as code blocks with clear "save this as" instructions.`,
      ``,
      `Voice rules: no em dashes, no banned openers, plain English.`,
    ].join('\n')
    const encoded = encodeURIComponent(bootstrap)
    const url = `claude://cowork/new?q=${encoded}`

    // Anchor click preserves user-gesture trust on Firefox; the OS routes
    // the URL to Claude desktop; Cowork dispatcher prefills the composer.
    const a = document.createElement('a')
    a.href = url
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      if (a.parentNode) document.body.removeChild(a)
    }, 200)

    toast.success(
      `Opening Cowork with the ${b.title} prompt pre-filled. If Claude does not come to front, Cmd+Tab to it. Hit Return on the prompt.`,
      { duration: 8000 },
    )
    return
  }

  // Unknown tier. Nudge to the picker; do nothing destructive. Try to scroll
  // the TierPicker into view so the next gesture is one click away.
  toast(
    `Pick Desktop or Code above so the install button matches your setup.`,
    { duration: 6000 },
  )
  const picker = document.querySelector('[data-tier-picker]') as HTMLElement | null
  if (picker) {
    picker.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

// BROWSER-ONLY FALLBACK INSTALL.
// For users on Linux, locked-down work machines, or anyone who cannot install
// the Claude desktop app. Copies the full markdown body to the clipboard and
// opens https://claude.ai/new in a new tab. User pastes with Cmd+V and hits
// Return. No Cowork dispatcher dependency, no claude:// scheme registration.
//
// Trade-off versus the desktop path: 1.5 clicks instead of 1, and the user
// has to wait for the new tab to load. Acceptable degrade for the Linux
// audience and corporate-locked-down operators.
function browserFallbackInstall(b: BonusBlueprint): void {
  const cached = BONUS_CACHE.get(b.id)
  if (!cached) {
    // Cache miss. Async fetch would lose gesture trust on Safari. Open the
    // install modal which surfaces an explicit Copy button + launch links
    // so the user can complete the flow in two isolated gestures.
    fetchBonusMarkdown(b).then((text) => renderInstallModal(b, text))
    toast(`Loading ${b.title}, opening copy panel…`, { duration: 2500 })
    return
  }
  // Open the new tab first while user-gesture trust is fresh, then write the
  // clipboard. Order is verified across Safari + Firefox + Chrome.
  const newTab = window.open('https://claude.ai/new', '_blank', 'noopener,noreferrer')
  let copied = false
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      navigator.clipboard.writeText(cached).then(
        () => {
          copied = true
          toast.success(
            `Copied ${b.title}. Paste with Cmd+V in the new Claude.ai tab and hit Return.`,
            { duration: 8000 },
          )
        },
        () => {
          showFallbackTextarea(cached, b.title)
        },
      )
    } catch {
      showFallbackTextarea(cached, b.title)
    }
  } else {
    showFallbackTextarea(cached, b.title)
  }
  if (!newTab) {
    setTimeout(() => {
      if (!copied) return
      toast(
        `Popup blocked. Open https://claude.ai/new manually and paste with Cmd+V.`,
        { duration: 8000 },
      )
    }, 400)
  }
}
void browserFallbackInstall

// USER-DRIVEN INSTALL MODAL.
// Architecture decision (S199 after 4 install-button bug reports):
// We do NOT chain clipboard.writeText() with window.location.href in a single
// click. The chained pattern races: the navigation cancels the clipboard
// before it commits. Instead, we open a modal that contains the markdown in
// a textarea (user can Cmd+C themselves), an explicit Copy button (separate
// click for clipboard API), and explicit <a href> launch links (separate
// click for URL handoff). User gestures stay isolated. No race. No silent
// failure. Works on every browser, every Claude.app version.
//
// The modal also lets the user pick their launch destination at install time
// (Cowork desktop, Claude desktop chat, Claude.ai web, Code CLI). One UI
// solves all four tier paths.
// Reserved for fallback modal path if oneClickInstall fails on user's Claude.app.
// Currently unused but kept for quick-revert if diagnostics show q= prefill broken.
function _openInstallModal(b: BonusBlueprint): void {
  const cached = BONUS_CACHE.get(b.id)
  if (!cached) {
    toast('Loading blueprint…', { duration: 1500 })
    fetchBonusMarkdown(b).then((text) => renderInstallModal(b, text))
    return
  }
  renderInstallModal(b, cached)
}
void _openInstallModal

function renderInstallModal(b: BonusBlueprint, text: string): void {
  // Remove any existing modal so we never stack.
  const prev = document.getElementById('hoistos-install-modal')
  if (prev) prev.remove()

  const wrap = document.createElement('div')
  wrap.id = 'hoistos-install-modal'
  wrap.style.cssText =
    'position:fixed;inset:0;background:rgba(20,20,19,0.92);z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,-apple-system,sans-serif;overflow-y:auto;'
  wrap.addEventListener('click', (e) => {
    if (e.target === wrap) wrap.remove()
  })

  const card = document.createElement('div')
  card.style.cssText =
    'background:#fbfaf3;border-radius:16px;padding:28px;max-width:760px;width:100%;display:flex;flex-direction:column;gap:18px;max-height:90vh;'

  const heading = document.createElement('div')
  heading.style.cssText = 'font-size:18px;font-weight:600;color:#141413;'
  heading.textContent = `Install ${b.title} in your Claude`

  const sub = document.createElement('div')
  sub.style.cssText = 'font-size:14px;color:#5e5d59;line-height:1.55;'
  sub.innerHTML =
    'Two clicks. <b>1.</b> Copy the blueprint (Cmd+C below or click Copy). <b>2.</b> Click the launch button for your tier.'

  // Step 1: textarea (auto-selected on open) + explicit Copy button.
  const step1Label = document.createElement('div')
  step1Label.style.cssText =
    'font-size:11px;text-transform:uppercase;letter-spacing:0.18em;color:#9c9b97;font-weight:600;'
  step1Label.textContent = 'Step 1, copy this'

  const ta = document.createElement('textarea')
  ta.value = text
  ta.readOnly = true
  ta.style.cssText =
    'width:100%;min-height:160px;max-height:280px;padding:12px;border:1px solid rgba(20,20,19,0.18);border-radius:8px;font-family:ui-monospace,Menlo,monospace;font-size:11px;line-height:1.55;color:#141413;background:#ffffff;resize:vertical;'

  const copyRow = document.createElement('div')
  copyRow.style.cssText = 'display:flex;align-items:center;gap:10px;'

  const copyBtn = document.createElement('button')
  copyBtn.type = 'button'
  copyBtn.textContent = 'Copy to clipboard'
  copyBtn.style.cssText =
    'padding:10px 18px;border-radius:10px;background:#cc6e2e;color:#fbfaf3;border:none;cursor:pointer;font-size:14px;font-weight:600;'
  const copyStatus = document.createElement('span')
  copyStatus.style.cssText = 'font-size:12px;color:#5e5d59;'

  function attemptCopy(): void {
    // Try modern Clipboard API first.
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          copyStatus.textContent = 'Copied. Now click your launch button.'
          copyStatus.style.color = '#3f7c3f'
          copyBtn.textContent = 'Copied ✓'
        })
        .catch(() => {
          // Fallback to execCommand on the textarea.
          ta.focus()
          ta.select()
          try {
            const ok = document.execCommand('copy')
            copyStatus.textContent = ok
              ? 'Copied via fallback. Click your launch button.'
              : 'Auto-copy blocked. Use Cmd+C in the box above.'
            copyStatus.style.color = ok ? '#3f7c3f' : '#cc6e2e'
            if (ok) copyBtn.textContent = 'Copied ✓'
          } catch {
            copyStatus.textContent = 'Auto-copy blocked. Use Cmd+C in the box above.'
            copyStatus.style.color = '#cc6e2e'
          }
        })
    } else {
      // No Clipboard API; use the textarea path.
      ta.focus()
      ta.select()
      try {
        const ok = document.execCommand('copy')
        copyStatus.textContent = ok
          ? 'Copied via fallback. Click your launch button.'
          : 'Use Cmd+C in the box above to copy.'
        copyStatus.style.color = ok ? '#3f7c3f' : '#cc6e2e'
        if (ok) copyBtn.textContent = 'Copied ✓'
      } catch {
        copyStatus.textContent = 'Use Cmd+C in the box above to copy.'
        copyStatus.style.color = '#cc6e2e'
      }
    }
  }
  copyBtn.onclick = attemptCopy

  copyRow.appendChild(copyBtn)
  copyRow.appendChild(copyStatus)

  // Step 2: launch links. Real anchor tags so each click is its own user
  // gesture and the URL handoff is bulletproof. Multiple paths so the user
  // picks the one that matches their setup.
  const step2Label = document.createElement('div')
  step2Label.style.cssText =
    'font-size:11px;text-transform:uppercase;letter-spacing:0.18em;color:#9c9b97;font-weight:600;margin-top:6px;'
  step2Label.textContent = 'Step 2, launch your Claude'

  const linkRow = document.createElement('div')
  linkRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;'

  function makeLaunchLink(opts: {
    href: string
    label: string
    sub: string
    primary: boolean
    target?: string
  }): HTMLAnchorElement {
    const a = document.createElement('a')
    a.href = opts.href
    if (opts.target) a.target = opts.target
    if (opts.target === '_blank') a.rel = 'noopener noreferrer'
    a.style.cssText = `display:inline-flex;flex-direction:column;align-items:flex-start;gap:2px;padding:12px 18px;border-radius:10px;background:${
      opts.primary ? '#cc6e2e' : 'transparent'
    };color:${opts.primary ? '#fbfaf3' : '#141413'};text-decoration:none;cursor:pointer;border:1px solid ${
      opts.primary ? 'transparent' : 'rgba(20,20,19,0.18)'
    };font-size:14px;font-weight:600;`
    const main = document.createElement('span')
    main.textContent = opts.label
    const subSpan = document.createElement('span')
    subSpan.textContent = opts.sub
    subSpan.style.cssText = 'font-size:11px;font-weight:400;opacity:0.78;'
    a.appendChild(main)
    a.appendChild(subSpan)
    return a
  }

  linkRow.appendChild(
    makeLaunchLink({
      href: 'claude://cowork/new',
      label: 'Open Cowork',
      sub: 'Claude desktop, Cowork mode',
      primary: true,
    }),
  )
  linkRow.appendChild(
    makeLaunchLink({
      href: 'claude://claude.ai/new',
      label: 'Open Claude desktop',
      sub: 'regular chat',
      primary: false,
    }),
  )
  linkRow.appendChild(
    makeLaunchLink({
      href: 'https://claude.ai/new',
      label: 'Open Claude.ai',
      sub: 'browser tab',
      primary: false,
      target: '_blank',
    }),
  )

  // Footer: close + curl install
  const footer = document.createElement('div')
  footer.style.cssText =
    'display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(20,20,19,0.08);padding-top:14px;margin-top:6px;'

  const cliHint = document.createElement('div')
  cliHint.style.cssText = 'font-size:12px;color:#5e5d59;'
  cliHint.innerHTML = `For Code CLI: <code style="background:rgba(20,20,19,0.06);padding:2px 6px;border-radius:4px;font-family:ui-monospace,Menlo,monospace;font-size:11px;">curl ${BONUS_BASE_URL}/${b.id}.md -o ~/.claude/skills/${b.slug}/SKILL.md</code>`

  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.textContent = 'Close'
  closeBtn.style.cssText =
    'padding:8px 16px;border-radius:8px;background:transparent;color:#5e5d59;border:1px solid rgba(20,20,19,0.18);cursor:pointer;font-size:13px;'
  closeBtn.onclick = () => wrap.remove()

  footer.appendChild(cliHint)
  footer.appendChild(closeBtn)

  card.appendChild(heading)
  card.appendChild(sub)
  card.appendChild(step1Label)
  card.appendChild(ta)
  card.appendChild(copyRow)
  card.appendChild(step2Label)
  card.appendChild(linkRow)
  card.appendChild(footer)
  wrap.appendChild(card)
  document.body.appendChild(wrap)

  // Auto-select the textarea contents so user can Cmd+C immediately.
  setTimeout(() => {
    ta.focus()
    ta.select()
  }, 50)
}


// Bulletproof JS Blob download. Sync-first using cached content.
function downloadBonusMarkdown(b: BonusBlueprint): void {
  const cached = BONUS_CACHE.get(b.id)

  function fireDownload(text: string): void {
    try {
      const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${b.slug}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      toast.success(`Downloaded ${b.slug}.md.`, { duration: 4000 })
    } catch {
      // Last-resort fallback: show manual-copy textarea
      showFallbackTextarea(text, `${b.title} (download)`)
    }
  }

  if (cached) {
    fireDownload(cached)
    return
  }
  toast('Loading blueprint…', { duration: 1500 })
  fetchBonusMarkdown(b).then((text) => fireDownload(text))
}

// ---------------------------------------------------------------------------
// Page component.
// ---------------------------------------------------------------------------

export function EmpireBonusExtras() {
  const [tier, setTier] = useState<ClaudeTier>('unknown')
  const [postInstall, setPostInstall] = useState<PostInstallContext | null>(null)
  const [completedPacks, setCompletedPacks] = useState<Set<string>>(new Set())
  const tierPickerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setTier(readTier())
    setCompletedPacks(readCompletedPacks())
    // Pre-fetch every bonus markdown so click handlers can write to the
    // clipboard synchronously inside the user gesture. Without this, the
    // first click on any tier path either fails silently (Safari) or shows
    // a clipboard-blocked toast (Firefox). The fetch is fire-and-forget.
    prefetchAllBonusMarkdowns()
  }, [])

  function handleTierPick(next: ClaudeTier) {
    setTier(next)
    writeTier(next)
  }
  // void markers keep TS from flagging these after tier-picker UI removal.
  void handleTierPick
  void TierPicker

  function scrollToTierPicker() {
    if (tierPickerRef.current) {
      tierPickerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
  // Kept after preflight relocation 2026-05-11 for any future component that
  // needs to surface the picker from elsewhere on the page. void marker
  // prevents the TS6133 unused-decl warning.
  void scrollToTierPicker

  // Post-install context builder. Called by BlueprintCard right after the
  // user clicks an install button. We use the current tier + the just-clicked
  // pack to compute the install path label, plus the first uncompleted other
  // blueprint as the "what's next" suggestion. The PostInstallPanel renders
  // until the user dismisses it or marks the pack complete.
  function firePostInstall(
    b: BonusBlueprint,
    installPath: PostInstallContext['installPath'],
  ) {
    const next = BLUEPRINTS.find((p) => p.id !== b.id && !completedPacks.has(p.id))
    setPostInstall({
      packId: b.id,
      packTitle: b.title,
      installPath,
      nextPackId: next?.id,
      nextPackTitle: next?.title,
      onMarkComplete: (id) =>
        setCompletedPacks((s) => {
          const next = new Set(s)
          next.add(id)
          return next
        }),
      onRetry: () => oneClickInstall(b, tier),
    })
  }

  return (
    <div className="px-[6vw] pt-20 pb-32" style={{ color: 'rgb(var(--color-fg))' }}>
      <section className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-mono text-xs uppercase tracking-[0.22em] mb-6 flex items-center justify-center gap-3 flex-wrap"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          <span>HoistOS</span>
          <span style={{ color: 'rgb(var(--color-fg-subtle))' }}>·</span>
          <span>Advanced</span>
          <span style={{ color: 'rgb(var(--color-fg-subtle))' }}>·</span>
          <span>For operators who installed the Foundation</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.05] mb-8"
        >
          Eight blueprints. <br />
          <span style={{ color: 'rgb(var(--color-accent))' }}>Yours</span> in a day.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8"
          style={{ color: 'rgb(var(--color-fg-muted))' }}
        >
          The upgrades on the timeline are the workflow skills. These blueprints are the plumbing underneath. Notion
          wired up. Search across your own knowledge. A Telegram bot you can text from a jobsite. Code CLI installed.
          Memory that sticks. Voice rules held by hooks at the OS layer, not the prompt. Each blueprint asks you two
          or three questions and picks reasonable defaults for the rest. Install one at a time. The stack compounds
          as you go.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base max-w-2xl mx-auto leading-relaxed mb-10"
          style={{ color: 'rgb(var(--color-fg-subtle))', fontStyle: 'italic' }}
        >
          Most VPs think infrastructure is engineer territory. It is not. Each blueprint asks you two or three
          questions and handles the rest itself. Pick one and start.
        </motion.p>

        {/* Tier picker removed 2026-05-11 per Steve live feedback. Install
            path defaults to Desktop universally. ref kept on a hidden div
            so the scrollToTierPicker callback below does not throw. */}
        <div ref={tierPickerRef} aria-hidden="true" style={{ display: 'none' }} />
      </section>

      {/* Preflight relocated to Foundation page 2026-05-11 per Eugeen.
          The "download Claude desktop / sign in / pick tier" checklist
          applies to Foundation packs (installed first), not Advanced.
          Advanced visitors are expected to have already completed the
          preflight on the Foundation page. */}

      <section className="mt-8 max-w-4xl mx-auto space-y-8">
        {BLUEPRINTS.map((b, idx) => (
          <BlueprintCard
            key={b.id}
            blueprint={b}
            index={idx}
            tier={tier}
            completed={completedPacks.has(b.id)}
            onPostInstall={firePostInstall}
          />
        ))}
      </section>

      {/* Browser-only fallback panel. For users on Linux, Chromebooks,
          locked-down corporate machines, or anyone who genuinely cannot
          install the Claude desktop app. Three-step manual path that does
          not depend on the claude:// URL scheme. */}
      <BrowserFallbackPanel onPostInstall={firePostInstall} />

      {/* Post-install follow-up panel. Lives at page level so it persists
          across re-renders and stays positioned bottom-right regardless of
          which card was clicked. */}
      <PostInstallPanel ctx={postInstall} onClose={() => setPostInstall(null)} />

      <section className="mt-24 max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6 }}
          className="font-mono text-[11px] uppercase tracking-[0.22em] mb-5"
          style={{ color: 'rgb(var(--color-fg-subtle))' }}
        >
          Install order matters less than starting
        </motion.p>

        <p className="text-base leading-relaxed mb-12" style={{ color: 'rgb(var(--color-fg-muted))' }}>
          If you want a recommended order: B-01, B-02, B-03, B-05, B-04, B-06, B-07. Foundation first because
          everything else builds on it. Search third because it works best once your Notion has real content in it.
          If you only have time for one, do B-01. If you want the moment that makes you sit up, do B-03 and watch
          Claude answer from your own knowledge in two seconds.
        </p>

        <Link
          to="/empireworksreconstruction/timeline"
          className="inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-base md:text-lg font-medium transition-all duration-300"
          style={{
            background: 'transparent',
            color: 'rgb(var(--color-accent))',
            border: '1px solid rgb(var(--color-accent) / 0.4)',
          }}
        >
          <span>Back to the timeline</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </section>

      <section className="mt-24 max-w-3xl mx-auto">
        <p
          className="font-mono text-xs uppercase tracking-[0.22em] mb-4"
          style={{ color: 'rgb(var(--color-fg-subtle))' }}
        >
          Confidential
        </p>
        <p className="text-base leading-relaxed" style={{ color: 'rgb(var(--color-fg-muted))' }}>
          For people inside EmpireWorks Reconstruction only. Please don&apos;t share outside the team.
        </p>
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TierPicker. Three pill buttons that persist the choice to localStorage.
// ---------------------------------------------------------------------------

interface TierPickerProps {
  tier: ClaudeTier
  onPick: (next: ClaudeTier) => void
}

function TierPicker({ tier, onPick }: TierPickerProps) {
  // Two paths, two buttons. Pro and Max collapse into Desktop because Cowork
  // is included on every paid plan and the install behavior is identical.
  // The third button used to be Pro vs Max which surfaced no real difference.
  const options: Array<{ id: ClaudeTier; label: string; sub: string }> = [
    { id: 'desktop', label: 'Desktop', sub: 'Pro, Max, or Team' },
    { id: 'code', label: 'Code', sub: 'one-line CLI' },
  ]
  return (
    <div
      data-tier-picker
      className="inline-flex items-center gap-2 p-1 rounded-full border"
      style={{ borderColor: 'rgba(20,20,19,0.14)', background: '#fbfaf3' }}
    >
      {options.map((opt) => {
        const active = tier === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onPick(opt.id)}
            className="rounded-full px-4 py-2 transition-all duration-200"
            style={{
              background: active ? 'rgb(var(--color-accent))' : 'transparent',
              color: active ? 'rgb(var(--color-bg))' : 'rgb(var(--color-fg))',
              fontWeight: active ? 600 : 500,
              fontSize: 13,
              boxShadow: active ? '0 4px 14px rgb(var(--color-accent) / 0.32)' : 'none',
              cursor: 'pointer',
              border: 'none',
            }}
            aria-pressed={active}
          >
            <span style={{ display: 'block', lineHeight: 1.05 }}>{opt.label}</span>
            <span style={{ display: 'block', fontSize: 10, fontWeight: 400, opacity: 0.78, marginTop: 1 }}>
              {opt.sub}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// BlueprintCard with tier-aware install actions.
// ---------------------------------------------------------------------------

interface CardProps {
  blueprint: BonusBlueprint
  index: number
  tier: ClaudeTier
  completed: boolean
  onPostInstall: (b: BonusBlueprint, path: PostInstallContext['installPath']) => void
}

function BlueprintCard({ blueprint, index, tier, completed, onPostInstall }: CardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-3xl p-8 md:p-10 border overflow-hidden"
      style={{
        borderColor: completed ? 'rgba(63, 124, 63, 0.32)' : 'rgba(20,20,19,0.12)',
        background: completed ? 'rgba(63, 124, 63, 0.04)' : '#fbfaf3',
      }}
    >
      {/* Completion badge. Persistent green check that lands when the user
          marks the pack complete in the PostInstallPanel. localStorage-backed
          so it survives a page reload and lets the user see their progress
          across return visits. */}
      {completed ? (
        <div
          data-completed-badge
          className="absolute top-6 right-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ background: 'rgb(63, 124, 63)', color: '#fbfaf3' }}
        >
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
            In progress
          </span>
        </div>
      ) : null}

      <div className="flex items-baseline gap-4 mb-3 flex-wrap">
        <span
          className="font-mono text-[11px] uppercase tracking-[0.22em]"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          {blueprint.number}
        </span>
        <span
          className="font-mono text-[11px] uppercase tracking-[0.18em]"
          style={{ color: 'rgb(var(--color-fg-subtle))' }}
        >
          {blueprint.installDisplay}
        </span>
        {/* Code CLI Required badge. Renders only on packs that ship daemons
            or hooks (B-03 RAG, B-04 Telegram, B-07 Hooks). These cannot run
            on Pro/Max desktop and need Claude Code CLI on the user's machine.
            Set per-pack via requiresCodeCli flag on the blueprint manifest. */}
        {blueprint.requiresCodeCli ? (
          <span
            className="font-mono text-[10px] uppercase tracking-[0.18em] rounded-md px-2 py-1"
            style={{
              color: '#fbfaf3',
              background: '#141413',
              fontWeight: 600,
              letterSpacing: '0.14em',
            }}
            title="This pack needs Claude Code CLI installed on your machine. Pro/Max desktop alone cannot host the daemons/hooks this pack ships."
          >
            Code CLI required
          </span>
        ) : null}
      </div>

      <h2
        className="font-display text-3xl md:text-4xl leading-tight mb-4"
        style={{ color: 'rgb(var(--color-fg))' }}
      >
        {blueprint.title}
      </h2>

      <p className="text-lg leading-relaxed mb-6" style={{ color: 'rgb(var(--color-fg-muted))' }}>
        {blueprint.oneLine}
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em] mb-2"
            style={{ color: 'rgb(var(--color-fg-subtle))' }}
          >
            Scope
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            {blueprint.scope}
          </p>
        </div>
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em] mb-2"
            style={{ color: 'rgb(var(--color-fg-subtle))' }}
          >
            What ships
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            {blueprint.artifact}
          </p>
        </div>
      </div>

      {/* Tier-specific install hint, only the relevant tier shows. */}
      {tier !== 'unknown' ? (
        <div
          className="rounded-xl p-4 mb-6 flex items-start gap-3"
          style={{ background: 'rgba(20,20,19,0.04)' }}
        >
          <span
            className="font-mono text-[10px] uppercase tracking-[0.18em] mt-1 shrink-0"
            style={{ color: 'rgb(var(--color-accent))' }}
          >
            {tier === 'desktop' ? 'Desktop' : 'Code'}
          </span>
          <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--color-fg-muted))' }}>
            {tier === 'desktop' ? blueprint.desktopHint : blueprint.codeHint}
          </p>
        </div>
      ) : null}

      {/* Install action buttons. Label + icon + title shift by tier so the
          user sees what is about to happen before clicking. The actual fork
          lives in oneClickInstall(blueprint, tier). After the install fires,
          we open the PostInstallPanel so the user gets the "what now" follow
          up + a way to mark the pack complete + troubleshooting if needed. */}
      <div className="flex flex-wrap gap-3 items-center">
        <button
          type="button"
          onClick={() => {
            oneClickInstall(blueprint, tier)
            // Map tier to post-install path label. Unknown tier just nudges
            // the user to pick first, so we do not open the panel for it.
            if (tier === 'desktop') onPostInstall(blueprint, 'cowork')
            else if (tier === 'code') onPostInstall(blueprint, 'clipboard-curl')
          }}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200"
          style={{
            background: 'rgb(var(--color-accent))',
            color: 'rgb(var(--color-bg))',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgb(var(--color-accent) / 0.32)',
          }}
          title={
            tier === 'desktop'
              ? 'Open Claude Cowork with the install prompt pre-filled.'
              : tier === 'code'
              ? 'Copy a one-line curl command. Paste in Terminal.'
              : 'Pick Desktop or Code above so the install button matches your setup.'
          }
        >
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
          <span>
            {tier === 'desktop'
              ? 'Open in Cowork'
              : tier === 'code'
              ? 'Copy install command'
              : 'Install in my Claude'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => downloadBonusMarkdown(blueprint)}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200"
          style={{
            background: 'transparent',
            color: 'rgb(var(--color-fg-muted))',
            border: '1px solid rgba(20,20,19,0.18)',
            cursor: 'pointer',
          }}
          title="Downloads the .md file via JS Blob, bypasses any browser inline-display behavior"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>Download .md</span>
        </button>
      </div>
    </motion.article>
  )
}

// ---------------------------------------------------------------------------
// BrowserFallbackPanel.
// ---------------------------------------------------------------------------

// Shown below the blueprint grid for users on Linux, Chromebooks, or any
// machine where the Claude desktop app is not an option. Two paths inside:
//
//   - Browser one-click: copies the first blueprint to clipboard + opens
//     https://claude.ai/new in a new tab. The user pastes with Cmd+V and
//     hits Return. Same install conversation, no desktop app required.
//   - Code CLI: same one-line curl every Code-tier user gets, but framed as
//     the "I would rather use Terminal" alternative.
//
// The panel keeps the page bullet-proof: no reasonable Claude user reaches
// the bottom of this page without a working install path.
function BrowserFallbackPanel({
  onPostInstall,
}: {
  onPostInstall: (b: BonusBlueprint, path: PostInstallContext['installPath']) => void
}) {
  function copyFirstBlueprintAndOpenClaude() {
    const first = BLUEPRINTS[0]
    browserFallbackInstall(first)
    onPostInstall(first, 'browser-clipboard')
  }

  function copyCurlForFirst() {
    const first = BLUEPRINTS[0]
    const cmd = buildBonusCurlInstall(first)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cmd).then(
        () => {
          toast.success(
            `Copied install command for ${first.title}. Paste in Terminal.`,
            { duration: 8000 },
          )
        },
        () => {
          showFallbackTextarea(cmd, `${first.title} install command`)
        },
      )
    } else {
      showFallbackTextarea(cmd, `${first.title} install command`)
    }
    onPostInstall(first, 'clipboard-curl')
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className="mt-20 max-w-3xl mx-auto"
      aria-labelledby="fallback-heading"
    >
      <div
        className="rounded-2xl p-6 md:p-8"
        style={{
          background: 'rgba(20,20,19,0.04)',
          border: '1px solid rgba(20,20,19,0.08)',
        }}
      >
        <div
          className="font-mono text-[10px] uppercase tracking-[0.22em] mb-3"
          style={{ color: 'rgb(var(--color-fg-subtle))' }}
        >
          Linux, Chromebook, or no desktop app
        </div>
        <h3
          id="fallback-heading"
          className="font-display text-[clamp(1.4rem,3vw,2rem)] leading-[1.15] mb-3"
        >
          Two more paths if the desktop app is not an option.
        </h3>
        <p className="text-sm md:text-base leading-relaxed mb-6" style={{ color: 'rgb(var(--color-fg-muted))' }}>
          Anthropic does not ship a Linux desktop build, and some work machines
          block app installs. Either of the paths below works with just a browser
          or just a terminal.
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={copyFirstBlueprintAndOpenClaude}
            className="inline-flex items-start gap-3 rounded-xl p-4 text-left transition-all duration-200"
            style={{
              background: 'rgb(var(--color-bg))',
              border: '1px solid rgba(20,20,19,0.12)',
              cursor: 'pointer',
            }}
          >
            <Globe2
              className="w-5 h-5 mt-0.5 shrink-0"
              style={{ color: 'rgb(var(--color-accent))' }}
              aria-hidden="true"
            />
            <div className="flex-1">
              <div className="text-sm md:text-base font-semibold mb-0.5">
                Browser path: copy and open claude.ai
              </div>
              <div className="text-xs md:text-sm" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                Copies the first blueprint to your clipboard and opens claude.ai in a new tab. Paste
                with Cmd+V and hit Return. Same install conversation, no app required. Works on any
                browser including Chromebook.
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={copyCurlForFirst}
            className="inline-flex items-start gap-3 rounded-xl p-4 text-left transition-all duration-200"
            style={{
              background: 'rgb(var(--color-bg))',
              border: '1px solid rgba(20,20,19,0.12)',
              cursor: 'pointer',
            }}
          >
            <Terminal
              className="w-5 h-5 mt-0.5 shrink-0"
              style={{ color: 'rgb(var(--color-accent))' }}
              aria-hidden="true"
            />
            <div className="flex-1">
              <div className="text-sm md:text-base font-semibold mb-0.5">
                Terminal path: one-line curl
              </div>
              <div className="text-xs md:text-sm" style={{ color: 'rgb(var(--color-fg-muted))' }}>
                Copies a one-line shell command. Paste in Terminal. Drops the blueprint into{' '}
                <code className="px-1.5 py-0.5 rounded text-[11px]" style={{ background: 'rgba(20,20,19,0.06)', fontFamily: 'ui-monospace, Menlo, monospace' }}>
                  ~/.claude/skills/
                </code>
                . Claude registers it on the next session. Requires Claude Code installed.
              </div>
            </div>
          </button>
        </div>

        <p className="text-xs md:text-sm leading-relaxed mt-6" style={{ color: 'rgb(var(--color-fg-subtle))', fontStyle: 'italic' }}>
          The browser button above ships the first blueprint as a sample. Once you are in
          claude.ai, you can repeat the pattern for any other blueprint by clicking Download .md on
          its card and pasting the file contents.
        </p>
      </div>
    </motion.section>
  )
}

export default EmpireBonusExtras
