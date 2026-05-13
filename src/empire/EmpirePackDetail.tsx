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

      <section
        className="mt-12 rounded-2xl p-8 border"
        style={{
          background: 'rgb(var(--color-surface))',
          borderColor: 'rgb(var(--color-border))',
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl mb-2">Included in the Bridge setup</h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'rgb(var(--color-fg-muted))' }}
            >
              Do not install this pack separately. Run the guided Bridge setup from the
              overview page. Best for: {pack.bestFor}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/empireworksreconstruction" className="btn btn-primary px-5">
              Start guided setup
            </Link>
            <Link to="/empireworksreconstruction/foundation" className="btn btn-ghost px-5">
              Back to previews
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
