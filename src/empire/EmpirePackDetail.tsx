/**
 * EmpirePackDetail. Per-pack landing page with the Activate-in-Claude CTA.
 *
 * Owner: Empire Wireframe S197 (B1 Tab, Phase 2)
 * Routing reference: src/empire/AppRouter.tsx maps "/empire/pack/:packId" to
 * this component, gated by EmpireAuthGate inside EmpireLayout. B3 wires real
 * pack content from empire-pack-v1/ (C1+C2+C3 outputs); tonight's stub uses
 * placeholder copy keyed on the URL param.
 *
 * The Activate flow:
 *   1. VP lands here.
 *   2. Reads what the pack does + what they get.
 *   3. Hits "Activate in Claude" which copies the bootstrap prompt to clipboard
 *      and opens claude.ai in a new tab.
 *   4. Pastes the prompt. Answers twelve questions. Receives a custom skill.
 *
 * Hard Rule #11: no em dashes anywhere in this module.
 */

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Copy, ExternalLink, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface PackPlaceholder {
  packId: string
  title: string
  tagline: string
  bestFor: string
  inputs: string[]
  delivers: string[]
  bootstrapPrompt: string
}

function buildPlaceholder(packId: string): PackPlaceholder {
  // B3 swaps this for a real loader off empire-pack-v1/{packId}/manifest.json.
  return {
    packId,
    title: prettifyId(packId),
    tagline:
      'A drop-in pack for Claude.ai. Three to seven questions, one custom skill, five minutes of your time.',
    bestFor:
      'Any VP who keeps writing the same prompt three different ways and wants it locked down.',
    inputs: [
      'Your role and the task you want to automate.',
      'One real example from your last week of work.',
      'The shape of the output you want, line by line.',
    ],
    delivers: [
      'A custom skill tuned for your role, not mine.',
      'The same prompt saved so you can rerun it any time the inputs change.',
      'A short check so you can grade the skill against your own work.',
    ],
    bootstrapPrompt: `# Empire activation pack: ${prettifyId(packId)}\n\nLoad the full pack from /packs/${packId}.md if you can reach it. If not, follow this short bootstrap.\n\nWhat happens next:\n1. Three to seven questions about your role and the task you want to automate.\n2. A custom skill written to fit your answers.\n3. Saved to ~/.claude/skills/ if you're on Code, or paste instructions for the Claude.ai web app.\n4. A quick test run so you see it works before you walk away.`,
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
  const packId = params.packId ?? 'proposal-builder'
  const pack = buildPlaceholder(packId)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(pack.bootstrapPrompt)
      setCopied(true)
      toast.success('Bootstrap copied. Paste into Claude.ai.')
      setTimeout(() => setCopied(false), 3500)
    } catch {
      toast.error('Clipboard blocked. Select the prompt below and copy manually.')
    }
  }

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
        <div
          className="font-mono text-xs uppercase tracking-[0.2em] mb-4"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          Activation pack / {pack.packId}
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
            <h2 className="font-display text-2xl mb-2">Activate in Claude</h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'rgb(var(--color-fg-muted))' }}
            >
              Click copy, open claude.ai in a new tab, paste, and answer the
              questions. Five minutes. Best for: {pack.bestFor}
            </p>
          </div>
          <div className="flex gap-3">
            <button type="button" className="btn btn-primary px-5" onClick={handleCopy}>
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" aria-hidden="true" />
                  Copy bootstrap prompt
                </>
              )}
            </button>
            <a
              href="https://claude.ai/new"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost px-5"
            >
              Open claude.ai
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <pre
          className="mt-6 text-xs leading-relaxed whitespace-pre-wrap rounded-xl p-5 overflow-x-auto"
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
