/**
 * intake-state. localStorage + URL plumbing for the 4-question intake modal.
 *
 * Owner: Agent A (S217 yes-this-new-mcbp-dapper-corbato sprint).
 * Plan reference: ~/.claude/plans/yes-this-new-mcbp-dapper-corbato.md
 * sections "Audit findings" and "Reality-based scope".
 *
 * What this file does:
 *   1. Defines the IntakeState shape captured by the 4-question modal in
 *      src/empire/Intake.tsx.
 *   2. Reads and writes that state to localStorage under
 *      key `hoistos.intake.v1`. Also reads URL query params so a link like
 *      `?name=John&division=Ops&industry=construction` pre-fills intake.
 *   3. Exposes subscribe + emit helpers so any component (gallery, journey
 *      tracker, pack cards) can react to intake changes the moment the user
 *      submits.
 *
 * Design notes:
 *   - This is NOT the tier picker. Surface (browser, desktop, code) is a
 *     separate concept from price tier (Pro, Max). The plan's audit findings
 *     section is explicit: capability axis is surface, not tier. The intake
 *     question 4 captures `surfaces` (multi-select). Existing
 *     src/empire/lib/claude-deep-link.ts readTier/writeTier still owns the
 *     `desktop` vs `code` install-path routing for activate.ts compatibility,
 *     so we mirror the intake's primary surface to writeTier() on submit
 *     (rules: code wins over desktop wins over browser, since downstream
 *     install actions read tier for routing).
 *   - 4 questions per plan section "Reality-based scope":
 *       Q1: name + division (two text fields)
 *       Q2: industry dropdown with construction sub-fields
 *       Q3: outcomes ranking (1-5 sliders per outcome)
 *       Q4: surfaces checkboxes (browser default checked, Desktop, Code)
 *   - No tier picker question per audit (surface != tier).
 *   - All localStorage operations wrapped in try/catch (private mode + quota).
 *
 * Hard Rule #11: zero em dashes (U+2014, U+2013) anywhere in this file.
 * Hard Rule #25 / "PE" abbreviation: not present anywhere.
 * R087 plain English: comments and names read like an engineer talking, no
 *   markdown decoration in prose.
 */

import { writeTier, type ClaudeTier } from '../empire/lib/claude-deep-link'

/** Storage key versioned to allow future migrations without data loss. */
export const INTAKE_STORAGE_KEY = 'hoistos.intake.v1'

/** Browser event fired when intake state is written. Components can listen. */
export const INTAKE_CHANGE_EVENT = 'hoistos:intake-change'

/** Industries the dropdown surfaces in Q2. Plan section "Reality-based scope". */
export const INDUSTRIES = [
  'construction',
  'real-estate',
  'services',
  'manufacturing',
  'professional-services',
  'other',
] as const
export type Industry = (typeof INDUSTRIES)[number]

/** Construction-specific sub-fields surfaced when industry === 'construction'. */
export const CONSTRUCTION_ROLES = ['gc', 'sub', 'mixed'] as const
export type ConstructionRole = (typeof CONSTRUCTION_ROLES)[number]

/**
 * Primary trade focus for construction users. Optional. Free text so the
 * user can type whatever fits, with a few hints in the placeholder.
 */
export type PrimaryTrade = string

/** The 11 outcomes the user ranks 1 to 5 in Q3. Plan persona-1 step-0 list. */
export const OUTCOMES = [
  'faster-proposals',
  'faster-emails',
  'contract-risk-review',
  'meeting-capture',
  'decision-tracking',
  'team-enablement',
  'expense-automation',
  'knowledge-search',
  'voice-to-task-mobile',
  'rag-retrieval',
  'custom',
] as const
export type Outcome = (typeof OUTCOMES)[number]

/** Surfaces the user picks in Q4 (multi-select checkboxes). */
export const SURFACES = ['browser', 'desktop', 'code'] as const
export type Surface = (typeof SURFACES)[number]

/** Human labels for UI display. Kept here so labels stay in one place. */
export const OUTCOME_LABELS: Record<Outcome, string> = {
  'faster-proposals': 'Faster proposals',
  'faster-emails': 'Faster emails',
  'contract-risk-review': 'Contract risk review',
  'meeting-capture': 'Meeting capture',
  'decision-tracking': 'Decision tracking',
  'team-enablement': 'Team enablement',
  'expense-automation': 'Expense automation',
  'knowledge-search': 'Knowledge search across files',
  'voice-to-task-mobile': 'Voice to task on mobile',
  'rag-retrieval': 'RAG retrieval',
  custom: 'Custom (other)',
}

export const INDUSTRY_LABELS: Record<Industry, string> = {
  construction: 'Construction',
  'real-estate': 'Real estate',
  services: 'Services',
  manufacturing: 'Manufacturing',
  'professional-services': 'Professional services',
  other: 'Other',
}

export const CONSTRUCTION_ROLE_LABELS: Record<ConstructionRole, string> = {
  gc: 'General contractor',
  sub: 'Subcontractor',
  mixed: 'Mixed (both)',
}

export const SURFACE_LABELS: Record<Surface, string> = {
  browser: 'I open claude.ai in a browser',
  desktop: 'I have the Claude Desktop app installed',
  code: 'I use Claude Code in Terminal',
}

/**
 * The full intake payload persisted to localStorage. Every field is optional
 * at write time so partial drafts survive a refresh, but the modal only marks
 * `completedAt` once the user clicks Submit on the final question.
 */
export interface IntakeState {
  /** Q1a: VP name. Becomes VP_NAME_SLUG for customware substitution. */
  name?: string
  /** Q1b: division. Becomes DIVISION_SLUG. */
  division?: string
  /** Q2: industry pick. */
  industry?: Industry
  /** Q2a: construction sub-role, only if industry === 'construction'. */
  constructionRole?: ConstructionRole
  /** Q2b: primary trade, only if industry === 'construction'. Free text. */
  primaryTrade?: PrimaryTrade
  /** Q3: outcome rankings. Map outcome key to 1-5 priority. */
  outcomes?: Partial<Record<Outcome, number>>
  /** Q4: surfaces the user has, multi-select. Default is ['browser']. */
  surfaces?: Surface[]
  /**
   * Optional free text the user can type if they pick the `custom` outcome.
   * Persisted alongside outcomes so the gallery can surface it as a label.
   */
  customOutcome?: string
  /** ISO timestamp when the user submitted the final question. */
  completedAt?: string
  /** Schema version. Hard-coded to 1 today. Bump when shape changes. */
  version?: 1
}

/**
 * The shape of the data the modal pre-fills from URL params. Keep this
 * mapping explicit so a malformed URL never injects unexpected keys.
 */
function readUrlPrefill(): Partial<IntakeState> {
  if (typeof window === 'undefined') return {}
  try {
    const params = new URLSearchParams(window.location.search)
    const prefill: Partial<IntakeState> = {}
    const name = params.get('name')
    if (name) prefill.name = name
    const division = params.get('division')
    if (division) prefill.division = division
    const industry = params.get('industry')
    if (industry && (INDUSTRIES as readonly string[]).includes(industry)) {
      prefill.industry = industry as Industry
    }
    const role = params.get('role')
    if (role && (CONSTRUCTION_ROLES as readonly string[]).includes(role)) {
      prefill.constructionRole = role as ConstructionRole
    }
    const trade = params.get('trade')
    if (trade) prefill.primaryTrade = trade
    return prefill
  } catch {
    return {}
  }
}

/**
 * Load intake state from localStorage. Merges URL prefill on top of stored
 * state so a `?name=John` link wins over a stale localStorage entry.
 */
export function readIntake(): IntakeState {
  if (typeof window === 'undefined') return {}
  let stored: IntakeState = {}
  try {
    const raw = window.localStorage.getItem(INTAKE_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as unknown
      if (parsed && typeof parsed === 'object') {
        stored = parsed as IntakeState
      }
    }
  } catch {
    // private mode / quota / malformed JSON
  }
  const urlPrefill = readUrlPrefill()
  return { ...stored, ...urlPrefill }
}

/**
 * Persist intake state. Merges with whatever is already on disk so partial
 * writes (the modal advancing question by question) accumulate cleanly.
 * Fires INTAKE_CHANGE_EVENT so listeners (gallery, tracker) re-render.
 */
export function writeIntake(patch: Partial<IntakeState>): IntakeState {
  if (typeof window === 'undefined') return patch as IntakeState
  const current = readIntake()
  const next: IntakeState = { ...current, ...patch, version: 1 }
  try {
    window.localStorage.setItem(INTAKE_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // private mode / quota
  }
  // Mirror primary surface to the existing tier-storage system so
  // activate.ts and other tier-aware components see the right value.
  if (patch.surfaces) {
    const tier = pickPrimaryTier(patch.surfaces)
    writeTier(tier)
  }
  try {
    window.dispatchEvent(new Event(INTAKE_CHANGE_EVENT))
  } catch {
    // dispatchEvent should not throw, but defend anyway.
  }
  return next
}

/**
 * Clear intake state. Used by the "Start over" button in the modal and by
 * automated tests. Also resets the tier so the user sees a clean slate.
 */
export function clearIntake(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(INTAKE_STORAGE_KEY)
  } catch {
    // private mode
  }
  writeTier('unknown')
  try {
    window.dispatchEvent(new Event(INTAKE_CHANGE_EVENT))
  } catch {
    // ignore
  }
}

/**
 * True once the user submits the final question. Components gate their
 * render on this (e.g. EmpireLanding shows the intake modal until done).
 */
export function isIntakeComplete(state?: IntakeState): boolean {
  const s = state ?? readIntake()
  return typeof s.completedAt === 'string' && s.completedAt.length > 0
}

/**
 * Mark intake complete. Called by the modal on Submit. Pass the final patch
 * here so the completedAt timestamp lands atomically with the last answers.
 */
export function completeIntake(finalPatch: Partial<IntakeState> = {}): IntakeState {
  return writeIntake({ ...finalPatch, completedAt: new Date().toISOString() })
}

/**
 * Subscribe to intake-state changes. Returns an unsubscribe function so
 * components can cleanly tear down in useEffect.
 */
export function onIntakeChange(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = () => callback()
  window.addEventListener(INTAKE_CHANGE_EVENT, handler)
  // Also listen to storage so cross-tab updates stay in sync.
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(INTAKE_CHANGE_EVENT, handler)
    window.removeEventListener('storage', handler)
  }
}

/**
 * Reduce a surfaces array to a single ClaudeTier value for the existing
 * tier-storage system. Code wins over desktop wins over browser, because
 * activate.ts uses tier to pick the install-path (Code-CLI install vs
 * paste-to-Project-Knowledge). The intake itself keeps the full surfaces
 * array; this is only the legacy compatibility shim.
 */
export function pickPrimaryTier(surfaces: Surface[]): ClaudeTier {
  if (surfaces.includes('code')) return 'code'
  if (surfaces.includes('desktop')) return 'desktop'
  // Browser only. The existing ClaudeTier type does not have a 'browser'
  // value, so we return 'desktop' as the safer-default for activation flows
  // (paste-into-Project-Knowledge works on both browser and desktop).
  return 'desktop'
}

/**
 * Return the user's top N outcomes sorted by priority (higher number =
 * higher priority). Used by the gallery's compounding ranker to bias
 * recommendations toward what the user said they want.
 */
export function topOutcomes(state: IntakeState | undefined, n = 3): Outcome[] {
  const map = state?.outcomes
  if (!map) return []
  const entries = Object.entries(map) as [Outcome, number][]
  return entries
    .filter(([, v]) => typeof v === 'number' && v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k)
}

/**
 * Sensible defaults for a brand-new intake. Browser checked, no outcomes
 * ranked, no industry pick. The modal uses this as the initial form state.
 */
export function defaultIntakeDraft(): IntakeState {
  const prefill = readUrlPrefill()
  return {
    surfaces: ['browser'],
    outcomes: {},
    version: 1,
    ...prefill,
  }
}
