/**
 * Hours saved per week per installed pack. CommandCenter sums the values
 * of installed packs to compute the "~N hr saved per week" stat.
 *
 * Modularity floor: Eugeen edits this file directly to recalibrate. The
 * CommandCenter consumer reads HOURS_PER_PACK and sums whatever maps to
 * an installed pack ID. Unknown packs fall back to DEFAULT_HOURS so the
 * stat never NaN's on a missing entry.
 *
 * Pack IDs match foundation-cards.ts badge values (F-01, F-02, etc.) and
 * the planned advanced tier IDs (A-01 ... A-07). Calibrated estimates per
 * Eugeen's spreadsheet review: Voice + Memory packs save 1 to 2 hrs/wk on
 * draft cycles; Sources + Routing save 0.5 to 1 on retrieval friction;
 * Validation saves 1 to 2 on the post-send "oh no" cycle.
 */

/** Default hours-per-week for packs not enumerated here. */
export const DEFAULT_HOURS = 0.5

export const HOURS_PER_PACK: Record<string, number> = {
  // Foundation tier (11 packs)
  'F-01': 1.0, // Operating Constitution
  'F-02': 2.0, // Facts Registry
  'F-03': 0.5, // Cold Start Protocol
  'F-04': 1.0, // Decision Log
  'F-05': 0.5, // Skill Builder
  'F-06': 1.0, // Routing Rules
  'F-07': 1.0, // Memory Architecture
  'F-08': 1.0, // Pre-Answer Source Sweep
  'F-09': 1.5, // Output Validator
  'F-10': 1.5, // Email Playbook
  'F-11': 0.5, // Notion Write Gate

  // Advanced tier (placeholders; calibrate when packs ship)
  'A-01': 2.5, // Proposal Builder
  'A-02': 2.0, // Meeting Transcript to Action Items
  'A-03': 1.5, // Contract Risks in Plain English
  'A-04': 1.0, // RFI Walkthrough
  'A-05': 1.0, // Change Order Generator
  'A-06': 1.5, // Daily Briefing
  'A-07': 1.0, // Knowledge Search

  // Business tier (data-only this round; UI hidden)
  'BIZ-01': 1.0,
  'BIZ-02': 1.0,

  // Power tier (data-only)
  'P-01': 1.0,
  'P-02': 1.5,
  'P-03': 1.0,
  'P-04': 1.5, // Multi-Model Jury
}

/** Sum hours-per-week for an array of installed pack IDs. */
export function totalHoursSaved(installedPackIds: string[]): number {
  let total = 0
  for (const id of installedPackIds) {
    total += HOURS_PER_PACK[id] ?? DEFAULT_HOURS
  }
  return total
}

/** Round to 1 decimal for display ("~4.5 hr"). */
export function formatHoursSaved(installedPackIds: string[]): string {
  const total = totalHoursSaved(installedPackIds)
  return `~${total.toFixed(total < 10 ? 1 : 0)} hr`
}
