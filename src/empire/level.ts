/**
 * Shared level computation for the journey gamification surfaces.
 *
 * Both JourneyTrackerBar (the fixed-top progress strip) and LevelUpOverlay
 * (the threshold-cross celebration) read from this single source so the level
 * thresholds and labels stay in lockstep. Pulling out of the component file
 * also keeps react-refresh happy (component files should only export
 * components).
 *
 * MASTER_PLAN v2 S3 thresholds: 1, 3, 5, 9, 16, 24, 36 packs.
 *
 * Hard Rule #11: no em dashes.
 */

export interface LevelState {
  num: number
  label: string
}

export function computeLevel(count: number): LevelState {
  if (count >= 36) return { num: 7, label: 'Operator' }
  if (count >= 24) return { num: 6, label: 'Builder' }
  if (count >= 16) return { num: 5, label: 'Compounding' }
  if (count >= 9) return { num: 4, label: 'Threshold' }
  if (count >= 5) return { num: 3, label: 'Foundation laid' }
  if (count >= 3) return { num: 2, label: 'Lit the match' }
  if (count >= 1) return { num: 1, label: 'First spark' }
  return { num: 0, label: 'Not started' }
}
