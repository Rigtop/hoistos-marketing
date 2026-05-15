/**
 * Intake. The 4-question modal that gates the customware journey on
 * /empireworksreconstruction.
 *
 * Owner: Agent A (S217 yes-this-new-mcbp-dapper-corbato sprint).
 * Plan reference: ~/.claude/plans/yes-this-new-mcbp-dapper-corbato.md
 * sections "Audit findings" and "Reality-based scope".
 *
 * Why it exists:
 *   The 2026-05-12 Bridge-led page failed on the first non-internal user
 *   (Windows VP, .mcpb would not open). The reversal: gate the gallery with
 *   a 60-second intake that captures who the user is, what they want, and
 *   what surfaces they have. That data drives the customware substitution
 *   and the pack-by-pack compounding ranker downstream.
 *
 * Four questions, per plan section "Reality-based scope":
 *   Q1: name + division (two text fields)
 *   Q2: industry dropdown, with construction sub-fields when applicable
 *   Q3: outcomes ranking (1-5 sliders per outcome)
 *   Q4: surfaces checkboxes (browser default checked, Desktop, Code)
 *
 * Explicitly NOT in the intake:
 *   - Tier picker. Capability is surface (browser, desktop, code), not
 *     price tier (Pro, Max). The plan's audit findings section is clear:
 *     surface != tier. The intake is 4 questions, not 5.
 *
 * UX:
 *   - One question per step, with a slim progress bar at the top.
 *   - Back + Next buttons. Submit on the final step.
 *   - All text fields are optional except the surface array (defaults to
 *     ['browser']). Partial answers are fine. Compounding ranker just
 *     uses fewer signals when fields are blank.
 *   - Mobile first: single-column layout, 44px tap targets, no horizontal
 *     scroll at 320 / 375 / 768 px viewports.
 *
 * Voice (R047): no banned openers in copy. Plain English per R087: no
 * markdown bold in displayed prose, no em dashes.
 *
 * Hard Rule #11: zero em dashes (U+2014, U+2013) anywhere in this file.
 * Hard Rule #25 / "PE" abbreviation: not used anywhere.
 *
 * Context7 disclosure for HR #31:
 *   react@19.2.0: useState / useEffect / useCallback / useMemo standard
 *     hook signatures verified via Context7 query on /facebook/react/v19_2_0.
 *   motion@12.38.0: motion.div polymorphic plus AnimatePresence mode wait
 *     from motion/react, props initial/animate/exit/transition verified
 *     via Context7 query on /websites/motion_dev.
 *   lucide-react@1.14.0: named exports for icon components, accept size,
 *     color, strokeWidth, plus standard SVG attrs including aria-hidden
 *     (auto-applied in v1). Verified via Context7 query on
 *     /lucide-icons/lucide.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
import { useIsMobile } from '../lib/useIsMobile'
import {
  CONSTRUCTION_ROLE_LABELS,
  CONSTRUCTION_ROLES,
  INDUSTRIES,
  INDUSTRY_LABELS,
  OUTCOMES,
  OUTCOME_LABELS,
  SURFACE_LABELS,
  SURFACES,
  type ConstructionRole,
  type Industry,
  type IntakeState,
  type Outcome,
  type Surface,
  completeIntake,
  defaultIntakeDraft,
  isIntakeComplete,
  readIntake,
  writeIntake,
} from '../lib/intake-state'

const STEP_COUNT = 4

export interface IntakeProps {
  /**
   * Render mode. `modal` overlays the page with a backdrop; `inline`
   * renders as a normal block so EmpireLanding can host it directly when
   * design favors that over a modal.
   */
  variant?: 'modal' | 'inline'
  /** Callback fired after the user clicks Submit on the final step. */
  onComplete?: (state: IntakeState) => void
  /**
   * Force the modal to show even if intake is already complete. Used by a
   * "Retake intake" link in the journey tracker if Eugeen wires it later.
   */
  forceOpen?: boolean
  /** Optional close handler. Only meaningful when variant is `modal`. */
  onDismiss?: () => void
}

export function Intake({ variant = 'modal', onComplete, forceOpen, onDismiss }: IntakeProps) {
  const isMobile = useIsMobile()
  const [draft, setDraft] = useState<IntakeState>(() => {
    const existing = readIntake()
    if (existing && Object.keys(existing).length > 0) {
      return existing
    }
    return defaultIntakeDraft()
  })
  const [step, setStep] = useState(0)
  const [open, setOpen] = useState<boolean>(() => {
    if (forceOpen) return true
    return !isIntakeComplete()
  })

  // Re-check on mount in case localStorage was cleared in a sibling tab.
  useEffect(() => {
    if (forceOpen) {
      setOpen(true)
      return
    }
    setOpen(!isIntakeComplete())
  }, [forceOpen])

  const setField = useCallback(<K extends keyof IntakeState>(key: K, value: IntakeState[K]) => {
    setDraft((prev) => {
      const next = { ...prev, [key]: value }
      // Auto-persist draft so a refresh between questions does not lose work.
      writeIntake({ [key]: value } as Partial<IntakeState>)
      return next
    })
  }, [])

  const setOutcomeRank = useCallback((outcome: Outcome, rank: number) => {
    setDraft((prev) => {
      const nextOutcomes = { ...(prev.outcomes ?? {}), [outcome]: rank }
      const next = { ...prev, outcomes: nextOutcomes }
      writeIntake({ outcomes: nextOutcomes })
      return next
    })
  }, [])

  const toggleSurface = useCallback((surface: Surface) => {
    setDraft((prev) => {
      const current = new Set(prev.surfaces ?? [])
      if (current.has(surface)) {
        current.delete(surface)
      } else {
        current.add(surface)
      }
      // Browser stays as a sensible default if the user un-checks everything.
      const surfacesArray: Surface[] = current.size === 0 ? ['browser'] : (Array.from(current) as Surface[])
      const next = { ...prev, surfaces: surfacesArray }
      writeIntake({ surfaces: surfacesArray })
      return next
    })
  }, [])

  const goNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, STEP_COUNT - 1))
  }, [])

  const goBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0))
  }, [])

  const submit = useCallback(() => {
    const final = completeIntake(draft)
    setDraft(final)
    setOpen(false)
    onComplete?.(final)
  }, [draft, onComplete])

  const dismiss = useCallback(() => {
    setOpen(false)
    onDismiss?.()
  }, [onDismiss])

  if (!open) return null

  const progress = ((step + 1) / STEP_COUNT) * 100

  const body = (
    <div
      className="relative w-full max-w-2xl rounded-2xl border bg-[rgb(var(--color-bg))] shadow-xl"
      style={{
        borderColor: 'rgb(var(--color-fg) / 0.12)',
        padding: isMobile ? '1.25rem' : '2rem',
      }}
    >
      {variant === 'modal' ? (
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close intake"
          className="absolute right-3 top-3 inline-flex items-center justify-center rounded-full"
          style={{
            width: 44,
            height: 44,
            color: 'rgb(var(--color-fg-muted))',
          }}
        >
          <X size={18} aria-hidden="true" />
        </button>
      ) : null}

      <div className="mb-5">
        <div
          className="font-mono text-[10px] uppercase tracking-[0.22em]"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          Step {step + 1} of {STEP_COUNT}
        </div>
        <div
          className="mt-2 h-1 w-full overflow-hidden rounded-full"
          style={{ background: 'rgb(var(--color-fg) / 0.08)' }}
          aria-hidden="true"
        >
          <motion.div
            className="h-full"
            style={{ background: 'rgb(var(--color-accent))' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === 0 ? (
            <StepName
              name={draft.name ?? ''}
              division={draft.division ?? ''}
              onNameChange={(v) => setField('name', v)}
              onDivisionChange={(v) => setField('division', v)}
              isMobile={isMobile}
            />
          ) : null}
          {step === 1 ? (
            <StepIndustry
              industry={draft.industry}
              constructionRole={draft.constructionRole}
              primaryTrade={draft.primaryTrade ?? ''}
              onIndustryChange={(v) => setField('industry', v)}
              onRoleChange={(v) => setField('constructionRole', v)}
              onTradeChange={(v) => setField('primaryTrade', v)}
              isMobile={isMobile}
            />
          ) : null}
          {step === 2 ? (
            <StepOutcomes
              outcomes={draft.outcomes ?? {}}
              customOutcome={draft.customOutcome ?? ''}
              onRankChange={setOutcomeRank}
              onCustomChange={(v) => setField('customOutcome', v)}
              isMobile={isMobile}
            />
          ) : null}
          {step === 3 ? (
            <StepSurfaces
              surfaces={draft.surfaces ?? ['browser']}
              onToggle={toggleSurface}
              isMobile={isMobile}
            />
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div
        className="mt-6 flex items-center justify-between gap-3"
        style={{ flexDirection: isMobile ? 'column-reverse' : 'row' }}
      >
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0}
          className="inline-flex items-center gap-2 rounded-lg border px-4 font-mono text-[11px] uppercase tracking-[0.18em] transition-opacity"
          style={{
            minHeight: 44,
            width: isMobile ? '100%' : 'auto',
            opacity: step === 0 ? 0.4 : 1,
            borderColor: 'rgb(var(--color-fg) / 0.18)',
            color: 'rgb(var(--color-fg))',
            background: 'transparent',
          }}
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back
        </button>

        {step < STEP_COUNT - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center gap-2 rounded-lg px-5 font-mono text-[11px] uppercase tracking-[0.18em]"
            style={{
              minHeight: 44,
              width: isMobile ? '100%' : 'auto',
              background: 'rgb(var(--color-accent))',
              color: 'rgb(var(--color-bg))',
            }}
          >
            Next
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            className="inline-flex items-center gap-2 rounded-lg px-5 font-mono text-[11px] uppercase tracking-[0.18em]"
            style={{
              minHeight: 44,
              width: isMobile ? '100%' : 'auto',
              background: 'rgb(var(--color-accent))',
              color: 'rgb(var(--color-bg))',
            }}
          >
            <Check size={14} aria-hidden="true" />
            Build my journey
          </button>
        )}
      </div>
    </div>
  )

  if (variant === 'inline') {
    return <div className="w-full">{body}</div>
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="HoistOS install intake"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
      style={{
        background: 'rgb(0 0 0 / 0.55)',
        padding: isMobile ? '1rem' : '2rem',
      }}
    >
      {body}
    </div>
  )
}

interface StepNameProps {
  name: string
  division: string
  onNameChange: (v: string) => void
  onDivisionChange: (v: string) => void
  isMobile: boolean
}

function StepName({ name, division, onNameChange, onDivisionChange, isMobile }: StepNameProps) {
  return (
    <div>
      <h2
        className="font-display text-[1.5rem] sm:text-[1.85rem] leading-tight mb-2"
        style={{ color: 'rgb(var(--color-fg))' }}
      >
        Let us start with you.
      </h2>
      <p
        className="text-sm sm:text-base leading-relaxed mb-5"
        style={{ color: 'rgb(var(--color-fg-muted))' }}
      >
        Your name and division feed every customized pack downstream. Skip either field if it does
        not apply; the gallery still works with blanks.
      </p>

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}
      >
        <label className="block">
          <span
            className="block font-mono text-[10px] uppercase tracking-[0.18em] mb-1.5"
            style={{ color: 'rgb(var(--color-fg-subtle))' }}
          >
            Name
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="John"
            autoComplete="given-name"
            className="w-full rounded-lg border px-3 text-base"
            style={{
              minHeight: 44,
              borderColor: 'rgb(var(--color-fg) / 0.18)',
              background: 'rgb(var(--color-bg))',
              color: 'rgb(var(--color-fg))',
            }}
          />
        </label>

        <label className="block">
          <span
            className="block font-mono text-[10px] uppercase tracking-[0.18em] mb-1.5"
            style={{ color: 'rgb(var(--color-fg-subtle))' }}
          >
            Division
          </span>
          <input
            type="text"
            value={division}
            onChange={(e) => onDivisionChange(e.target.value)}
            placeholder="Construction"
            autoComplete="organization-title"
            className="w-full rounded-lg border px-3 text-base"
            style={{
              minHeight: 44,
              borderColor: 'rgb(var(--color-fg) / 0.18)',
              background: 'rgb(var(--color-bg))',
              color: 'rgb(var(--color-fg))',
            }}
          />
        </label>
      </div>
    </div>
  )
}

interface StepIndustryProps {
  industry?: Industry
  constructionRole?: ConstructionRole
  primaryTrade: string
  onIndustryChange: (v: Industry) => void
  onRoleChange: (v: ConstructionRole) => void
  onTradeChange: (v: string) => void
  isMobile: boolean
}

function StepIndustry({
  industry,
  constructionRole,
  primaryTrade,
  onIndustryChange,
  onRoleChange,
  onTradeChange,
  isMobile,
}: StepIndustryProps) {
  const showConstructionSubFields = industry === 'construction'
  return (
    <div>
      <h2
        className="font-display text-[1.5rem] sm:text-[1.85rem] leading-tight mb-2"
        style={{ color: 'rgb(var(--color-fg))' }}
      >
        What industry are you in?
      </h2>
      <p
        className="text-sm sm:text-base leading-relaxed mb-5"
        style={{ color: 'rgb(var(--color-fg-muted))' }}
      >
        This narrows the recommended pack order. Construction picks unlock a sub-question on role
        and primary trade.
      </p>

      <label className="block mb-4">
        <span
          className="block font-mono text-[10px] uppercase tracking-[0.18em] mb-1.5"
          style={{ color: 'rgb(var(--color-fg-subtle))' }}
        >
          Industry
        </span>
        <select
          value={industry ?? ''}
          onChange={(e) => onIndustryChange(e.target.value as Industry)}
          className="w-full rounded-lg border px-3 text-base"
          style={{
            minHeight: 44,
            borderColor: 'rgb(var(--color-fg) / 0.18)',
            background: 'rgb(var(--color-bg))',
            color: 'rgb(var(--color-fg))',
          }}
        >
          <option value="" disabled>
            Pick one
          </option>
          {INDUSTRIES.map((id) => (
            <option key={id} value={id}>
              {INDUSTRY_LABELS[id]}
            </option>
          ))}
        </select>
      </label>

      {showConstructionSubFields ? (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}
        >
          <label className="block">
            <span
              className="block font-mono text-[10px] uppercase tracking-[0.18em] mb-1.5"
              style={{ color: 'rgb(var(--color-fg-subtle))' }}
            >
              Role
            </span>
            <select
              value={constructionRole ?? ''}
              onChange={(e) => onRoleChange(e.target.value as ConstructionRole)}
              className="w-full rounded-lg border px-3 text-base"
              style={{
                minHeight: 44,
                borderColor: 'rgb(var(--color-fg) / 0.18)',
                background: 'rgb(var(--color-bg))',
                color: 'rgb(var(--color-fg))',
              }}
            >
              <option value="" disabled>
                Pick one
              </option>
              {CONSTRUCTION_ROLES.map((role) => (
                <option key={role} value={role}>
                  {CONSTRUCTION_ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span
              className="block font-mono text-[10px] uppercase tracking-[0.18em] mb-1.5"
              style={{ color: 'rgb(var(--color-fg-subtle))' }}
            >
              Primary trade
            </span>
            <input
              type="text"
              value={primaryTrade}
              onChange={(e) => onTradeChange(e.target.value)}
              placeholder="painting, electrical, plumbing"
              className="w-full rounded-lg border px-3 text-base"
              style={{
                minHeight: 44,
                borderColor: 'rgb(var(--color-fg) / 0.18)',
                background: 'rgb(var(--color-bg))',
                color: 'rgb(var(--color-fg))',
              }}
            />
          </label>
        </div>
      ) : null}
    </div>
  )
}

interface StepOutcomesProps {
  outcomes: Partial<Record<Outcome, number>>
  customOutcome: string
  onRankChange: (outcome: Outcome, rank: number) => void
  onCustomChange: (v: string) => void
  isMobile: boolean
}

function StepOutcomes({ outcomes, customOutcome, onRankChange, onCustomChange, isMobile }: StepOutcomesProps) {
  const showCustomBox = (outcomes.custom ?? 0) > 0
  return (
    <div>
      <h2
        className="font-display text-[1.5rem] sm:text-[1.85rem] leading-tight mb-2"
        style={{ color: 'rgb(var(--color-fg))' }}
      >
        Rank what you want first.
      </h2>
      <p
        className="text-sm sm:text-base leading-relaxed mb-5"
        style={{ color: 'rgb(var(--color-fg-muted))' }}
      >
        Slide each outcome from 0 (skip) to 5 (top priority). The gallery re-ranks based on this.
        You can leave most at zero; one or two at 5 is enough signal.
      </p>

      <div className="flex flex-col gap-4">
        {OUTCOMES.map((outcome) => (
          <OutcomeSlider
            key={outcome}
            label={OUTCOME_LABELS[outcome]}
            value={outcomes[outcome] ?? 0}
            onChange={(v) => onRankChange(outcome, v)}
            isMobile={isMobile}
          />
        ))}

        {showCustomBox ? (
          <label className="block mt-2">
            <span
              className="block font-mono text-[10px] uppercase tracking-[0.18em] mb-1.5"
              style={{ color: 'rgb(var(--color-fg-subtle))' }}
            >
              Custom outcome
            </span>
            <input
              type="text"
              value={customOutcome}
              onChange={(e) => onCustomChange(e.target.value)}
              placeholder="describe what you want"
              className="w-full rounded-lg border px-3 text-base"
              style={{
                minHeight: 44,
                borderColor: 'rgb(var(--color-fg) / 0.18)',
                background: 'rgb(var(--color-bg))',
                color: 'rgb(var(--color-fg))',
              }}
            />
          </label>
        ) : null}
      </div>
    </div>
  )
}

interface OutcomeSliderProps {
  label: string
  value: number
  onChange: (v: number) => void
  isMobile: boolean
}

function OutcomeSlider({ label, value, onChange, isMobile }: OutcomeSliderProps) {
  const choices = useMemo(() => [0, 1, 2, 3, 4, 5], [])
  return (
    <div
      className="grid items-center gap-3"
      style={{
        gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(0, 1.4fr)',
      }}
    >
      <div
        className="text-sm"
        style={{ color: 'rgb(var(--color-fg))' }}
      >
        {label}
      </div>
      <div
        className="flex gap-1.5"
        role="radiogroup"
        aria-label={`${label} priority`}
      >
        {choices.map((n) => {
          const active = n === value
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${label} priority ${n}`}
              onClick={() => onChange(n)}
              className="inline-flex flex-1 items-center justify-center rounded-md font-mono text-xs"
              style={{
                minHeight: 44,
                minWidth: 44,
                background: active ? 'rgb(var(--color-accent))' : 'rgb(var(--color-fg) / 0.05)',
                color: active ? 'rgb(var(--color-bg))' : 'rgb(var(--color-fg-muted))',
                border: '1px solid rgb(var(--color-fg) / 0.08)',
              }}
            >
              {n}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface StepSurfacesProps {
  surfaces: Surface[]
  onToggle: (surface: Surface) => void
  isMobile: boolean
}

function StepSurfaces({ surfaces, onToggle, isMobile }: StepSurfacesProps) {
  const set = new Set(surfaces)
  return (
    <div>
      <h2
        className="font-display text-[1.5rem] sm:text-[1.85rem] leading-tight mb-2"
        style={{ color: 'rgb(var(--color-fg))' }}
      >
        Where do you use Claude today?
      </h2>
      <p
        className="text-sm sm:text-base leading-relaxed mb-5"
        style={{ color: 'rgb(var(--color-fg-muted))' }}
      >
        Pick what you have installed, not what you pay for. This decides the install path on each
        pack card (paste into Project Knowledge, Claude Desktop, or Code CLI). Browser is the
        default.
      </p>

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(1, minmax(0, 1fr))' }}
      >
        {SURFACES.map((surface) => {
          const active = set.has(surface)
          return (
            <button
              key={surface}
              type="button"
              role="checkbox"
              aria-checked={active}
              onClick={() => onToggle(surface)}
              className="flex items-center gap-3 rounded-lg border px-4 py-3 text-left"
              style={{
                minHeight: 44,
                borderColor: active ? 'rgb(var(--color-accent))' : 'rgb(var(--color-fg) / 0.18)',
                background: active ? 'rgb(var(--color-accent) / 0.08)' : 'transparent',
                color: 'rgb(var(--color-fg))',
              }}
            >
              <span
                className="inline-flex items-center justify-center rounded"
                style={{
                  width: 20,
                  height: 20,
                  border: '1.5px solid rgb(var(--color-fg) / 0.4)',
                  background: active ? 'rgb(var(--color-accent))' : 'transparent',
                  color: 'rgb(var(--color-bg))',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                {active ? <Check size={14} /> : null}
              </span>
              <span className="text-sm sm:text-base">{SURFACE_LABELS[surface]}</span>
            </button>
          )
        })}
      </div>

      <p
        className="mt-4 text-xs leading-relaxed"
        style={{ color: 'rgb(var(--color-fg-subtle))' }}
      >
        Picking none defaults to browser. Pro and Max pricing tiers do not change capability; the
        surface does.
      </p>
    </div>
  )
}

export default Intake
