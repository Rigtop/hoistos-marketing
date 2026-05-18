/**
 * Level thresholds. SegmentedTrackerBar level display, LevelUpOverlay
 * trigger logic, and CommandCenter dash-hero level number all read from
 * this array.
 *
 * Modularity floor: 10 levels in the data even though only 7 are visible
 * in mockup-A-v3.html. Adjusting a threshold is a data change.
 *
 * computeLevel returns the highest level whose packsRequired is <=
 * installed count. computeNextLevel returns the next entry above the
 * current level so the bar can render "N packs to Level X".
 *
 * Round 6 v3 spec: thresholds in the mockup are 1, 3, 5, 9, 16, 24, 36,
 * 43 (the latter being the 43-pack ceiling). Extended to 10 with extra
 * tiers reserved for the future 100-pack expansion.
 */

export interface LevelConfig {
  /** Level number, 0 to 10. */
  num: number
  /** Display name shown next to the level number. */
  name: string
  /** Installed-pack count required to reach this level. */
  packsRequired: number
}

export const LEVELS: LevelConfig[] = [
  { num: 0, name: 'Not started', packsRequired: 0 },
  { num: 1, name: 'Lit the match', packsRequired: 1 },
  { num: 2, name: 'Foundation laid', packsRequired: 3 },
  { num: 3, name: 'Compounding', packsRequired: 5 },
  { num: 4, name: 'Threshold', packsRequired: 9 },
  { num: 5, name: 'Operator', packsRequired: 16 },
  { num: 6, name: 'Builder', packsRequired: 24 },
  { num: 7, name: 'Architect', packsRequired: 36 },
  { num: 8, name: 'Strategist', packsRequired: 50 },
  { num: 9, name: 'Commander', packsRequired: 70 },
  { num: 10, name: 'Founder', packsRequired: 100 },
]

export function computeLevel(installed: number): LevelConfig {
  let current = LEVELS[0]
  for (const lvl of LEVELS) {
    if (installed >= lvl.packsRequired) current = lvl
    else break
  }
  return current
}

export function computeNextLevel(installed: number): LevelConfig | undefined {
  return LEVELS.find((lvl) => lvl.packsRequired > installed)
}

export function packsToNextLevel(installed: number): number {
  const next = computeNextLevel(installed)
  if (!next) return 0
  return Math.max(0, next.packsRequired - installed)
}
