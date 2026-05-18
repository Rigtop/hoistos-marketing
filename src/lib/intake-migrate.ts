/**
 * intake-migrate. Round 7 (2026-05-18) added q2Pains, q2Other, q3Surfaces,
 * intakeCompletedAt as alias fields onto IntakeState. Because the new
 * intake (InlineIntake) writes BOTH the new keys and the legacy ones on
 * submit, and because intake-state.readIntake() returns whatever JSON.parse
 * yields (defensively wrapped), there is no destructive migration needed.
 *
 * This module exists so a future migration has a single home, and so the
 * round-7 brief's "Update intake-migrate.ts to no-op gracefully on old
 * payload" instruction has a place to land. The function is exported and
 * called by readIntake on demand (today: just a passthrough).
 */

import type { IntakeState, Surface } from './intake-state'

/**
 * Passthrough migration. Returns the payload unchanged. Future versions
 * can attach migration logic by branching on `parsed.version`.
 */
export function migrateIntake(parsed: IntakeState): IntakeState {
  if (!parsed || typeof parsed !== 'object') return {}

  const next: IntakeState = { ...parsed, version: 1 }

  // Mirror legacy completedAt to the new intakeCompletedAt alias if only
  // the legacy field is present. Cheap, idempotent, makes downstream
  // readers consistent.
  if (next.completedAt && !next.intakeCompletedAt) {
    next.intakeCompletedAt = next.completedAt
  }

  // Mirror legacy surfaces to q3Surfaces alias if only the legacy field is
  // present. Browser stays the safe default.
  if (Array.isArray(next.surfaces) && next.surfaces.length > 0 && !next.q3Surfaces) {
    next.q3Surfaces = next.surfaces as Surface[]
  }

  return next
}

export default migrateIntake
