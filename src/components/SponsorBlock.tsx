/**
 * SponsorBlock: companywide-AI-sponsor reframe surface.
 *
 * Driven by H5 findings #1, #2, #7 (Steve's adoption dashboard, NABTU
 * positioning, Procore/Autodesk integration disclosure) and H1 finding #7
 * (4E pedagogical alignment with Anthropic Academy).
 *
 * Renders between the hero and the first timeline item. Reframes the page
 * for the executive sponsor (the actual reader who can authorize a rollout)
 * instead of only the individual operator.
 *
 * Code DB sync: skipped (reason: propagation-only)
 *
 * Hard Rule #11: no em dashes.
 */

import { useEffect, useRef } from 'react'
import { trackFunnel } from '../lib/funnel'

const FOUR_E = [
  { letter: 'E', label: 'Effective', hint: 'does the right thing' },
  { letter: 'E', label: 'Efficient', hint: 'in the right time' },
  { letter: 'E', label: 'Ethical', hint: 'with the right care' },
  { letter: 'S', label: 'Safe', hint: 'with human review on the loop' },
]

const SPONSOR_METRICS = [
  {
    value: '70%',
    label: 'enterprise top-quartile',
    hint: 'Daily AI use 30+ min per seat (Writer, 2026)',
  },
  {
    value: '5.1 mo',
    label: 'median time to value',
    hint: 'Agent deployment baseline (DigitalApplied, 2026)',
  },
  {
    value: '38%',
    label: 'contractors with measured AI ROI',
    hint: 'Doubled YoY from 17% (ENR, 2026)',
  },
  {
    value: '43%',
    label: 'rollout failures blame sponsorship',
    hint: 'Not operator laziness, sponsor disengagement (Prosci)',
  },
]

const TOOL_OVERLAP = [
  'Procore',
  'Autodesk Construction Cloud',
  'Buildots',
  'Bluebeam',
  'BIM 360',
  'Sage 300',
]

export function SponsorBlock() {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.5) {
            trackFunnel('sponsor_block_view', {})
            obs.disconnect()
          }
        })
      },
      { threshold: 0.5 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      aria-label="Sponsor adoption frame"
      className="mx-auto my-8 max-w-6xl px-[6vw]"
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-ink/12 bg-white p-6 shadow-sm sm:p-9"
        style={{
          backgroundImage:
            'radial-gradient(circle at 0% 0%, rgb(var(--color-accent) / 0.08), transparent 38%), radial-gradient(circle at 100% 100%, rgb(var(--color-accent) / 0.04), transparent 42%)',
        }}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em]"
            style={{ color: 'rgb(var(--color-accent))' }}
          >
            For the sponsor, not just the operator
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45">
            What Jay actually asks Steve
          </p>
        </div>

        <h2 className="mt-3 font-display text-[clamp(1.5rem,3.4vw,2.4rem)] leading-[1.1] text-ink">
          Adoption is a curve, not a checkbox.
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink/75 md:text-lg">
          If you sponsor a companywide AI rollout, the metric you own is not
          seat count, it is adoption velocity, time to value, and a portfolio
          of named before-after artifacts. This page is structured so an
          executive sponsor can scroll once and walk away with the four
          numbers that matter.
        </p>

        {/* Sponsor metric grid */}
        <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {SPONSOR_METRICS.map((m) => (
            <li
              key={m.label}
              className="rounded-xl border border-ink/10 bg-white/70 p-3.5"
              title={m.hint}
            >
              <div className="font-display text-[clamp(1.4rem,2.6vw,1.9rem)] leading-none text-ink">
                {m.value}
              </div>
              <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
                {m.label}
              </div>
              <div className="mt-2 text-[11px] leading-snug text-ink/60">
                {m.hint}
              </div>
            </li>
          ))}
        </ul>

        {/* Three-column row: NABTU + 4E + tool overlap */}
        <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* NABTU positioning */}
          <div className="rounded-xl border border-ink/10 bg-white/65 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55">
              Downstream of NABTU + Microsoft
            </p>
            <p className="mt-2 text-[13px] leading-snug text-ink/80">
              If your trades workforce went through the NABTU and Microsoft
              AI 101 program (April 2026 launch, 1,500 instructors, 1,900
              apprenticeship centers), this is the operator-shaped follow-on.
              We do not compete with literacy. We are the next step after it.
            </p>
          </div>

          {/* 4E framework */}
          <div className="rounded-xl border border-ink/10 bg-white/65 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55">
              4E framework, Anthropic-aligned
            </p>
            <p className="mt-2 text-[12px] leading-snug text-ink/70">
              Every pack is mapped to the lens Anthropic Academy itself uses
              to teach Claude.
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-1.5">
              {FOUR_E.map((e) => (
                <li
                  key={e.label}
                  className="flex items-baseline gap-2 text-[11px]"
                  title={e.hint}
                >
                  <span
                    className="font-mono font-semibold"
                    style={{ color: 'rgb(var(--color-accent))' }}
                  >
                    {e.letter}
                  </span>
                  <span className="text-ink/80">{e.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Procore + Autodesk integration disclosure */}
          <div className="rounded-xl border border-ink/10 bg-white/65 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55">
              Sits alongside what you already pay for
            </p>
            <p className="mt-2 text-[13px] leading-snug text-ink/80">
              Works alongside the construction stack you already run. Does
              not replace, does not compete.
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {TOOL_OVERLAP.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-ink/12 bg-white px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-ink/65"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Liability + tier disclosure footer */}
        <p className="mt-7 max-w-3xl text-[11px] leading-relaxed text-ink/55">
          Liability note. Safety, contract, and RFI packs include a human review
          gate. Treat AI output as a draft until a competent person signs off.
          Pack tier guidance: individual operator runs on Pro. If your team
          uploads contracts, drawings, or pricing schedules, your IT lead
          should provision Team or Enterprise tier so the GC NDA boundary
          holds.
        </p>
      </div>
    </section>
  )
}

export default SponsorBlock
