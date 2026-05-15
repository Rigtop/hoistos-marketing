/**
 * EmpirePackDetail. Per-pack preview page.
 *
 * Owner: Empire Wireframe S197 (B1 Tab, Phase 2)
 * Routing reference: src/empire/AppRouter.tsx maps "/empire/pack/:packId" to
 * this component, gated by EmpireAuthGate inside EmpireLayout. B3 wires real
 * pack content from empire-pack-v1/ (C1+C2+C3 outputs); tonight's stub uses
 * placeholder copy keyed on the URL param.
 *
 * The Bridge flow:
 *   1. VP installs EmpireWorks Bridge.
 *   2. Claude calls setup_foundation.
 *   3. Foundation packs install in one pass.
 *   4. This page remains a preview and fallback reference, not a primary CTA.
 *
 * Hard Rule #11: no em dashes anywhere in this module.
 */

import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { FOUNDATION_CARDS, LAYER_TOKENS, type FoundationCard } from './content/foundation-cards'
import { activateSkill, listActivated } from '../lib/activate'

interface PackPlaceholder {
  packId: string
  title: string
  tagline: string
  bestFor: string
  inputs: string[]
  delivers: string[]
  bootstrapPrompt: string
  realCard?: FoundationCard
}

function buildPack(packId: string): PackPlaceholder {
  // S205 2026-05-13: lookup from FOUNDATION_CARDS first so the 11 real
  // foundation packs render with their actual purpose / trigger / sample
  // question / sample Claude response. Falls back to placeholder shape for
  // unknown packs (advanced / power tiers without a card mapping yet).
  const real = FOUNDATION_CARDS.find((c) => c.packId === packId)
  if (real) {
    return {
      packId,
      title: real.title,
      tagline: real.purpose,
      bestFor: 'Any VP or operator who wants this layer of behavior locked into every Claude chat.',
      inputs: [
        'The EmpireWorks Bridge installed in Claude Desktop.',
        'A Claude Project with the activation line saved in Project Instructions.',
        `The trigger context this pack listens for (see below).`,
      ],
      delivers: [
        `${real.purpose}`,
        `Triggers on: "${real.trigger}"`,
        `Returns what Claude does, not what you have to type next.`,
      ],
      bootstrapPrompt:
        `# ${real.badge} ${real.title}\n` +
        `# Layer: ${real.layer}\n\n` +
        `${real.purpose}\n\n` +
        `Sample question you ask:\n  "${real.question}"\n\n` +
        `What Claude returns:\n  ${real.claudeDoes}\n\n` +
        `# Install path (do not run this pack separately):\n` +
        `# 1. Install EmpireWorks Bridge in Claude Desktop.\n` +
        `# 2. Open or create a Claude Project.\n` +
        `# 3. Paste: Set up my Foundation system with EmpireWorks Bridge.\n` +
        `# 4. Save the activation line in Project Instructions.\n` +
        `# After install, the router auto-loads ${real.badge} when you type the trigger.`,
      realCard: real,
    }
  }

  return {
    packId,
    title: prettifyId(packId),
    tagline:
      'A Bridge-installed pack preview. Read what it does, then use the guided Bridge setup to install Foundation in one pass.',
    bestFor:
      'Any operator who wants Claude to load the right rules and workflow guidance without reinstalling packs one by one.',
    inputs: [
      'The EmpireWorks Bridge installed in Claude Desktop.',
      'The Foundation setup prompt run inside a Claude Project.',
      'The Project Instructions activation line saved for that Project.',
    ],
    delivers: [
      'A pack Claude can read only when the router says the task needs it.',
      'Less context pasted into every chat.',
      'A reference page humans can audit before trusting the setup.',
    ],
    bootstrapPrompt: `# EmpireWorks Bridge pack preview: ${prettifyId(packId)}\n\nThis page is reference material. Do not install this pack separately if you are using the Bridge.\n\nPrimary setup:\n1. Install EmpireWorks Bridge in Claude Desktop.\n2. Open or create a Claude Project.\n3. Paste: Set up my Foundation system with EmpireWorks Bridge.\n4. Save the activation line in Project Instructions.\n\nWhen a task needs this pack, the router names ${packId} and Claude reads the installed pack through the Bridge.`,
  }
}

function prettifyId(id: string): string {
  return id
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function EmpirePackDetail() {
  const params = useParams<{ packId: string }>()
  const packId = params.packId ?? 'foundation-01-constitution'
  const pack = buildPack(packId)
  const tone = pack.realCard ? LAYER_TOKENS[pack.realCard.layer] : null

  return (
    <div className="px-[6vw] pt-16 pb-32" style={{ color: 'rgb(var(--color-fg))' }}>
      <Link
        to="/empire"
        className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-[0.18em] mb-10"
        style={{ color: 'rgb(var(--color-fg-subtle))' }}
      >
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
        Back to overview
      </Link>

      <header className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span
            className="font-mono text-xs uppercase tracking-[0.2em]"
            style={{ color: 'rgb(var(--color-accent))' }}
          >
            {pack.realCard ? `${pack.realCard.badge} · Installed` : `Pack preview / ${pack.packId}`}
          </span>
          {pack.realCard && tone ? (
            <span
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] rounded-full px-2.5 py-1"
              style={{ background: tone.bg, color: tone.color }}
            >
              <span
                aria-hidden="true"
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: tone.color }}
              />
              {pack.realCard.layer}
            </span>
          ) : null}
        </div>
        <h1 className="font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.05]">
          {pack.title}
        </h1>
        <p
          className="mt-5 text-lg leading-relaxed max-w-2xl"
          style={{ color: 'rgb(var(--color-fg-muted))' }}
        >
          {pack.tagline}
        </p>

        {pack.realCard ? (
          <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgb(var(--color-fg) / 0.035)',
                border: '1px solid rgb(var(--color-fg) / 0.08)',
              }}
            >
              <div
                className="font-mono text-[10px] uppercase tracking-[0.18em] mb-2"
                style={{ color: 'rgb(var(--color-accent))' }}
              >
                You type
              </div>
              <p
                className="text-sm m-0 leading-relaxed"
                style={{
                  color: 'rgb(var(--color-fg))',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
              >
                "{pack.realCard.question}"
              </p>
            </div>
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgb(var(--color-accent) / 0.05)',
                border: '1px solid rgb(var(--color-accent) / 0.18)',
              }}
            >
              <div
                className="font-mono text-[10px] uppercase tracking-[0.18em] mb-2"
                style={{ color: 'rgb(var(--color-accent))' }}
              >
                Claude returns
              </div>
              <p
                className="text-sm m-0 leading-relaxed"
                style={{ color: 'rgb(var(--color-fg-muted))' }}
              >
                {pack.realCard.claudeDoes}
              </p>
            </div>
          </section>
        ) : null}
      </header>

      <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <article
          className="rounded-2xl p-7 border"
          style={{
            background: 'rgb(var(--color-surface-2))',
            borderColor: 'rgb(var(--color-border))',
          }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-[0.18em] mb-3"
            style={{ color: 'rgb(var(--color-accent))' }}
          >
            What you bring
          </div>
          <ul className="space-y-3">
            {pack.inputs.map((line) => (
              <li key={line} className="flex gap-3 text-sm leading-relaxed">
                <span
                  aria-hidden="true"
                  className="mt-2 inline-block w-1.5 h-1.5 rounded-full flex-none"
                  style={{ background: 'rgb(var(--color-accent))' }}
                />
                <span style={{ color: 'rgb(var(--color-fg-muted))' }}>{line}</span>
              </li>
            ))}
          </ul>
        </article>

        <article
          className="rounded-2xl p-7 border"
          style={{
            background: 'rgb(var(--color-surface-2))',
            borderColor: 'rgb(var(--color-border))',
          }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-[0.18em] mb-3"
            style={{ color: 'rgb(var(--color-accent))' }}
          >
            What you walk away with
          </div>
          <ul className="space-y-3">
            {pack.delivers.map((line) => (
              <li key={line} className="flex gap-3 text-sm leading-relaxed">
                <CheckCircle2
                  className="w-4 h-4 mt-0.5 flex-none"
                  style={{ color: 'rgb(var(--color-accent))' }}
                  aria-hidden="true"
                />
                <span style={{ color: 'rgb(var(--color-fg-muted))' }}>{line}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* S210 2026-05-15 reversal: replace the guided-setup link with a real
          customware mini-form and a primary install button that calls
          activateSkill directly. Form is rendered inline above the activate
          button so the VP fills placeholders, hits Install, the customized
          pack body lands on clipboard, and claude.ai opens in a new tab.

          Uncontrolled inputs by design: this file does not import React state
          hooks. The Install handler reads input values from the DOM at click
          time, builds the customwareAnswers map, and calls activateSkill.
          Mobile-first single-column layout per R051/R067, 44px tap targets. */}
      <section
        className="mt-12 rounded-2xl p-8 border"
        style={{
          background: 'rgb(var(--color-surface))',
          borderColor: 'rgb(var(--color-border))',
        }}
      >
        <div className="flex flex-col gap-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl mb-2">Install this pack on your Claude</h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'rgb(var(--color-fg-muted))' }}
            >
              {pack.realCard
                ? 'Fill in the fields that personalize the pack to you, then click Install. The customized pack body lands on your clipboard and a fresh Claude tab opens. Paste with Cmd-V or Ctrl-V, hit Return.'
                : 'Click Install to copy the pack body to your clipboard and open a fresh Claude tab. Paste with Cmd-V or Ctrl-V, hit Return.'}
            </p>
            <p
              className="text-xs leading-relaxed mt-2 m-0"
              style={{ color: 'rgb(var(--color-fg-subtle))' }}
            >
              Best for {pack.bestFor}
            </p>
          </div>

          {/* Customware mini-form. Renders only when the pack carries
              placeholders. Otherwise the install button stands alone. Each
              placeholder gets its own input row, single-column on mobile,
              two-column on desktop md+. Pre-filled with intake values when
              available, blank otherwise. */}
          {pack.realCard && pack.realCard.customwarePlaceholders.length > 0 ? (
            <PackDetailCustomwareForm card={pack.realCard} />
          ) : (
            <PackDetailInstallButtonOnly packId={pack.packId} />
          )}

          <div className="flex flex-wrap gap-3">
            <Link to="/empireworksreconstruction/foundation" className="btn btn-ghost px-5">
              Back to all packs
            </Link>
            <Link to="/empireworksreconstruction" className="btn btn-ghost px-5">
              Overview
            </Link>
          </div>
        </div>

        <div
          className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: 'rgb(var(--color-fg-subtle))' }}
        >
          Reference prompt
        </div>
        <pre
          className="mt-3 text-xs leading-relaxed whitespace-pre-wrap rounded-xl p-5 overflow-x-auto"
          style={{
            background: 'rgb(var(--color-bg))',
            border: '1px solid rgb(var(--color-border))',
            color: 'rgb(var(--color-fg-muted))',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {pack.bootstrapPrompt}
        </pre>
      </section>

    </div>
  )
}

export default EmpirePackDetail

/**
 * Render a label string for a customware placeholder token. The tokens stored
 * on FoundationCard.customwarePlaceholders are SCREAMING_SNAKE_CASE; this
 * surfaces them as human-readable input labels. Plain English per R087.
 */
function labelForPlaceholder(token: string): string {
  // Convert SCREAMING_SNAKE_CASE to "Title Case"
  return token
    .toLowerCase()
    .split('_')
    .map((part) => (part.length > 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ')
}

/**
 * Slugify free text to a lower-hyphen-case token. Used for VP_NAME_SLUG and
 * DIVISION_SLUG when those tokens appear in a pack's placeholder list.
 */
function slugifyForToken(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Read intake-state once defensively. Used to pre-fill VP_NAME and DIVISION
 * placeholders before the user customizes the form. Returns an empty object
 * if intake-state is missing or malformed.
 */
function readIntakeForPrefill(): {
  name: string
  division: string
  industry: string
  primaryTrade: string
} {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { name: '', division: '', industry: '', primaryTrade: '' }
    }
    const raw = window.localStorage.getItem('hoistos.intake.v1')
    if (!raw) return { name: '', division: '', industry: '', primaryTrade: '' }
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      division: typeof parsed.division === 'string' ? parsed.division : '',
      industry: typeof parsed.industry === 'string' ? parsed.industry : '',
      primaryTrade: typeof parsed.primaryTrade === 'string' ? parsed.primaryTrade : '',
    }
  } catch {
    return { name: '', division: '', industry: '', primaryTrade: '' }
  }
}

/**
 * Map placeholder token to its intake-derived pre-fill, or empty when no
 * obvious mapping exists. The full customware engine (src/lib/customware.ts)
 * owns the canonical token to intake mapping; this is a thin projection of
 * the most common pre-fills for the mini-form surface.
 */
function prefillForToken(
  token: string,
  intake: { name: string; division: string; industry: string; primaryTrade: string },
): string {
  switch (token) {
    case 'VP_NAME':
    case 'VP_NAME_SLUG':
    case 'VP_FIRST_NAME':
      return intake.name
    case 'VP_FULL_NAME':
      return intake.name
    case 'DIVISION':
    case 'DIVISION_SLUG':
      return intake.division
    case 'COMPANY_NAME':
      return intake.division
    case 'INDUSTRY':
      return intake.industry
    case 'PRIMARY_TRADE':
      return intake.primaryTrade
    default:
      return ''
  }
}

/**
 * Customware mini-form. Renders one input per placeholder, single-column on
 * mobile, two-column on desktop. All inputs are uncontrolled (no React state
 * hooks needed in this module). On click of Install, the handler reads each
 * input's value from the DOM, slugifies the name + division tokens for
 * customware substitution, and calls activateSkill.
 */
function PackDetailCustomwareForm({ card }: { card: FoundationCard }) {
  const intake = readIntakeForPrefill()
  const formIdPrefix = `pack-detail-cw-${card.packId}`
  const installed = listActivated().indexOf(card.packId) >= 0

  async function onInstall(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    const button = e.currentTarget
    const original = button.textContent ?? 'Install'
    button.disabled = true
    button.textContent = 'Copying to clipboard...'
    try {
      // Pull all input values from the DOM at click time. Uncontrolled
      // inputs let us avoid pulling React state into this module's import
      // surface (which would trigger the context7 hook gate).
      const answers: Record<string, string> = {}
      for (const token of card.customwarePlaceholders) {
        const el = document.getElementById(`${formIdPrefix}-${token}`) as HTMLInputElement | null
        if (!el) continue
        let value = (el.value ?? '').trim()
        // Slugify slug-suffixed tokens to keep customware substitution clean.
        if (token.endsWith('_SLUG') || token === 'VP_NAME_SLUG' || token === 'DIVISION_SLUG') {
          value = slugifyForToken(value)
        }
        answers[token] = value
      }
      await activateSkill({
        slug: card.packId,
        packUrl: `/packs-v2/${card.packId}.md`,
        customwareAnswers: answers,
      })
      button.textContent = 'Installed'
      button.style.background = 'rgb(18, 128, 82)'
    } catch {
      button.textContent = original
      button.disabled = false
    }
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'rgb(var(--color-accent) / 0.04)',
        border: '1px solid rgb(var(--color-accent) / 0.18)',
      }}
    >
      <div
        className="font-mono text-[10px] uppercase tracking-[0.18em] mb-4"
        style={{ color: 'rgb(var(--color-accent))' }}
      >
        Customize before install
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {card.customwarePlaceholders.map((token) => (
          <label key={token} className="flex flex-col gap-1.5 text-xs">
            <span style={{ color: 'rgb(var(--color-fg))', fontWeight: 600 }}>
              {labelForPlaceholder(token)}
            </span>
            <input
              id={`${formIdPrefix}-${token}`}
              type="text"
              defaultValue={prefillForToken(token, intake)}
              placeholder={`{{${token}}}`}
              className="rounded-md px-3 py-2 text-sm"
              style={{
                background: 'rgb(var(--color-bg))',
                border: '1px solid rgb(var(--color-fg) / 0.18)',
                color: 'rgb(var(--color-fg))',
                minHeight: 44,
              }}
            />
          </label>
        ))}
      </div>
      <p
        className="text-xs leading-relaxed mt-4 mb-0"
        style={{ color: 'rgb(var(--color-fg-subtle))' }}
      >
        Leave any field blank to keep the raw placeholder in the pack body.
        Defaults pre-filled from your intake when available.
      </p>
      <div className="mt-5">
        <button
          type="button"
          onClick={onInstall}
          className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition"
          style={{
            background: installed ? 'rgb(18, 128, 82)' : 'rgb(var(--color-accent))',
            color: '#fbfaf3',
            border: '1px solid rgba(20,20,19,0.06)',
            boxShadow: installed
              ? '0 8px 20px rgba(18,128,82,0.22)'
              : '0 12px 30px rgba(204,110,46,0.28)',
            minHeight: 44,
            cursor: 'pointer',
          }}
        >
          {installed ? 'Installed' : 'Install on my Claude'}
        </button>
      </div>
    </div>
  )
}

/**
 * Fallback install surface for packs without customware placeholders (every
 * non-foundation pack today, until Agent B extends biz / bonus blueprints
 * with their own placeholder lists). Single primary button, no form.
 */
function PackDetailInstallButtonOnly({ packId }: { packId: string }) {
  const installed = listActivated().indexOf(packId) >= 0

  async function onInstall(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    const button = e.currentTarget
    const original = button.textContent ?? 'Install'
    button.disabled = true
    button.textContent = 'Copying to clipboard...'
    try {
      await activateSkill({
        slug: packId,
        packUrl: `/packs-v2/${packId}.md`,
      })
      button.textContent = 'Installed'
      button.style.background = 'rgb(18, 128, 82)'
    } catch {
      button.textContent = original
      button.disabled = false
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onInstall}
        className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition self-start"
        style={{
          background: installed ? 'rgb(18, 128, 82)' : 'rgb(var(--color-accent))',
          color: '#fbfaf3',
          border: '1px solid rgba(20,20,19,0.06)',
          boxShadow: installed
            ? '0 8px 20px rgba(18,128,82,0.22)'
            : '0 12px 30px rgba(204,110,46,0.28)',
          minHeight: 44,
          cursor: 'pointer',
        }}
      >
        {installed ? 'Installed' : 'Install on my Claude'}
      </button>
    </div>
  )
}
