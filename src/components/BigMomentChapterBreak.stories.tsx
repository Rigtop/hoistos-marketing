/**
 * Ladle stories for BigMomentChapterBreak.
 *
 * Three sample chapter breaks, each tuned to a different variant + payload
 * mix. Run with `npm run docs` to eyeball at the /empire-fidelity URL.
 *
 * Tab C-fx Phase 1 stories, S198 morning, 2026-05-08.
 *
 * Hard Rule #11: zero em dashes.
 */

import type { Story } from '@ladle/react'
import BigMomentChapterBreak from './BigMomentChapterBreak'
import { LenisProvider } from './LenisProvider'

export default {
  title: 'C-fx · Big Moment Chapter Break',
}

/**
 * Frame wrapper. Sets the HoistOS-light theme + scroll context so the
 * sticky hero panel + parallax + tracing beam all wire correctly.
 */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      <div
        data-theme="hoistos-light"
        className="min-h-screen"
        style={{
          background: 'rgb(var(--color-bg))',
          color: 'rgb(var(--color-fg))',
        }}
      >
        {/* Spacer above so the sticky-on-entry effect is observable */}
        <div className="h-[40vh]" aria-hidden />
        {children}
        {/* Spacer below so end-of-section transitions are observable */}
        <div className="h-[60vh]" aria-hidden />
      </div>
    </LenisProvider>
  )
}

const SAMPLE_BODY = (
  <>
    <p
      className="font-[var(--font-display)]"
      style={{ fontSize: '1.25rem', lineHeight: 1.55 }}
    >
      Two months in, Cowork could install software, browse, fill forms, and
      summarize meeting transcripts. The bottleneck stopped being "what can
      Claude do" and started being "what can Claude remember between
      sessions". That was the pivot.
    </p>
    <p
      className="font-[var(--font-display)]"
      style={{ fontSize: '1.25rem', lineHeight: 1.55 }}
    >
      I built a single read-first contract: identity, rules, routing, and the
      cold-start file list. Every surface (Code, Cowork, Bernie) loads it
      first. From that day, drift dropped 80 percent.
    </p>
    <p
      className="font-[var(--font-display)]"
      style={{ fontSize: '1.25rem', lineHeight: 1.55 }}
    >
      Memory was never a model problem. It was a contract problem.
    </p>
  </>
)

/**
 * Variant: memory. Parallax-heavy, dim shader, paper-globe forward. Renders
 * the "Memory was the bottleneck" moment with a Loom recap and a download
 * pack CTA. No before/after slider on this one (memory is conceptual).
 */
export const MemoryBottleneck: Story = () => (
  <Frame>
    <BigMomentChapterBreak
      chapterNumber={4}
      kicker="The contract pivot"
      chapterTitle="When I realized memory was the bottleneck"
      ahaQuote="Identity, rules, and routing belong in a single read-first contract."
      impactStat={{
        value: 3247,
        suffix: ' hours',
        label: 'compounding rework saved per year across the surface',
      }}
      packHref="/packs/memory-bottleneck.md"
      packLabel="Download memory pack"
      variant="memory"
      shaderMode="noise"
      morphTitles={[
        'When the bottleneck was memory, not the model',
        'When memory beat raw model gain',
      ]}
      loomEmbedUrl="https://www.loom.com/embed/00000000000000000000000000000001"
    >
      {SAMPLE_BODY}
    </BigMomentChapterBreak>
  </Frame>
)

/**
 * Variant: code. Shader-heavy, vortex forward, paper-globe muted. The
 * "Move to Code (CLI)" moment with a before/after slider showing chat-era
 * vs Code-era operating loop. Includes the pack CTA.
 */
export const MoveToCode: Story = () => (
  <Frame>
    <BigMomentChapterBreak
      chapterNumber={7}
      kicker="From chat to CLI"
      chapterTitle="When I moved to Claude Code"
      ahaQuote="The CLI is where the operating loop wants to live."
      impactStat={{
        value: 14,
        suffix: 'x',
        label: 'parallel sprints overnight on the M4',
      }}
      packHref="/packs/move-to-code.md"
      packLabel="Get the Code starter"
      variant="code"
      shaderMode="noise"
      beforeImage="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=70"
      afterImage="https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1200&q=70"
      loomEmbedUrl="https://www.loom.com/embed/00000000000000000000000000000002"
    >
      <p
        className="font-[var(--font-display)]"
        style={{ fontSize: '1.25rem', lineHeight: 1.55 }}
      >
        Chat was a window. Cowork was a desk. Code is a workshop. The minute
        I had subagents, hooks, and a real session lifecycle, the work
        stopped feeling like prompting and started feeling like running an
        engineering team.
      </p>
      <p
        className="font-[var(--font-display)]"
        style={{ fontSize: '1.25rem', lineHeight: 1.55 }}
      >
        Eleven parallel tabs, autonomous overnight, multi-model jury on the
        deliverables, auto-merge gate. R055 pattern.
      </p>
    </BigMomentChapterBreak>
  </Frame>
)

/**
 * Variant: automation. Particles-heavy, sparkles forward. The
 * "Automation compounds" moment, a higher chapter number, no Loom (yet),
 * no compare slider. Pack CTA is on, kicker is suppressed (defaults to
 * "A pivot in the operating loop").
 */
export const AutomationCompounds: Story = () => (
  <Frame>
    <BigMomentChapterBreak
      chapterNumber={5}
      chapterTitle="When automation started compounding"
      ahaQuote="A skill is a versioned, triggered, evaluatable prompt with structured I/O."
      impactStat={{
        value: 47,
        suffix: ' skills',
        label: 'composing into one operator surface',
      }}
      packHref="/packs/skill-substrate.md"
      packLabel="Download skill pack"
      variant="automation"
      shaderMode="noise"
    >
      <p
        className="font-[var(--font-display)]"
        style={{ fontSize: '1.25rem', lineHeight: 1.55 }}
      >
        The first skill saved an hour. The fifth saved a week. The
        twentieth made me unrecognizable to last-quarter-Eugeen.
      </p>
      <p
        className="font-[var(--font-display)]"
        style={{ fontSize: '1.25rem', lineHeight: 1.55 }}
      >
        Each skill ships with a trigger, a prompt, an output contract, and
        an evaluation. They compose because the substrate underneath is
        boring on purpose: registry, dispatcher, memory contract, gate.
      </p>
    </BigMomentChapterBreak>
  </Frame>
)
