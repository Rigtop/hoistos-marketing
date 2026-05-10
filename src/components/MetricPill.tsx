/**
 * MetricPill: lightweight evidence pill for timeline cards.
 *
 * Lightweight version of H3's full ReceiptDrawer pattern. Renders a small
 * chip with the headline metric (e.g. "100ms on 2.4MB corpus") and surfaces
 * the source-file citation in a hover tooltip + click-to-reveal.
 *
 * Full drawer pattern (excerpt baking, side-drawer, github-permalink) is
 * deferred to V5 per H3 phasing recommendation; H6 ships the pill so cards
 * show evidence of falsifiable claims today.
 *
 * Hard Rule #11: no em dashes.
 */

import { useState } from 'react'
import { Sparkles, ExternalLink } from 'lucide-react'

export interface MetricCite {
  /** Headline metric, e.g. "100ms on 2.4MB corpus" */
  value: string
  /** Source file path, e.g. "Subsystems/knowledge-search/bench.py" */
  sourcePath: string
  /** Optional line range, e.g. "1-30" */
  lineRange?: string
  /** Optional public URL (github permalink) if the source is shareable */
  href?: string
  /** Optional one-line context shown on click */
  caption?: string
}

export function MetricPill({
  value,
  sourcePath,
  lineRange,
  href,
  caption,
}: MetricCite) {
  const [open, setOpen] = useState<boolean>(false)
  const sourceLabel = lineRange ? `${sourcePath}:${lineRange}` : sourcePath

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider transition-colors"
        style={{
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: 'rgb(var(--color-accent) / 0.25)',
          background: 'rgb(var(--color-accent) / 0.06)',
          color: 'rgb(var(--color-accent))',
        }}
        aria-expanded={open}
        aria-label={`Source: ${sourceLabel}`}
        title={`Source: ${sourceLabel}`}
      >
        <Sparkles className="h-2.5 w-2.5 opacity-70" aria-hidden />
        <span className="font-semibold normal-case tracking-normal">{value}</span>
        <span style={{ color: 'rgb(var(--color-accent) / 0.5)' }}>.</span>
        <span style={{ color: 'rgb(var(--color-accent) / 0.75)' }}>cite</span>
      </button>
      {open && (
        <span
          role="region"
          aria-label="Source citation"
          className="absolute left-0 top-full z-30 mt-2 inline-block w-[18rem] rounded-md border border-ink/15 bg-white p-3 text-left shadow-lg"
        >
          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45">
            Receipt
          </span>
          <span className="mt-1 block break-all font-mono text-[11px] text-ink/80">
            {sourceLabel}
          </span>
          {caption && (
            <span className="mt-2 block text-[12px] leading-snug text-ink/70">
              {caption}
            </span>
          )}
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium hover:underline"
              style={{ color: 'rgb(var(--color-accent))' }}
            >
              <ExternalLink className="h-3 w-3" aria-hidden />
              Open original
            </a>
          )}
        </span>
      )}
    </span>
  )
}

export default MetricPill
