/**
 * Customware substitution engine.
 *
 * Replaces `{{TOKEN}}` placeholders inside pack markdown with values resolved
 * by priority: per-pack mini-form answers first, then global intake answers,
 * then sensible defaults from `customware-defaults.json`. Then strips
 * tier-aware install blocks that do not match the user's stored surface.
 *
 * Surface mapping (from `readTier()` in `empire/lib/claude-deep-link.ts`):
 *   - 'desktop' (Claude Desktop app on Mac or Windows) wants the `max` and
 *     `pro` install rows. Pro and Desktop share the Project Knowledge surface;
 *     Max adds local SKILL.md paths. Keep both pro and max blocks.
 *   - 'code' (Claude Code CLI in Terminal) wants the `code` install row.
 *   - 'unknown' or missing keeps every install block so the user can pick.
 *
 * Why blocks live in pack body, not in metadata: each of the 43 packs encodes
 * its own install steps. Editing 43 markdown files for tier-routing would
 * break the audit-trail. Stripping at clipboard-write time keeps the pack
 * source-of-truth single and the user's clipboard scoped to their surface.
 *
 * Hard Rule #11 (no em dashes), R087 (plain conversational English in user
 * prose; this file is engine code, not user-facing prose).
 */

import defaults from './customware-defaults.json'
import { readTier, type ClaudeTier } from '../empire/lib/claude-deep-link'

/**
 * Intake answers shape. Agent A owns `intake-state.ts`; this module imports
 * its shape via `IntakeAnswers` but defines the contract here for clarity.
 * Keys are loose `string | number | string[]` so per-question answer types
 * survive without forcing every consumer to pre-coerce.
 *
 * Substitution treats arrays as comma-joined strings and numbers as their
 * `String()` form. Missing or empty values fall through to the next layer.
 */
export type CustomwareValue = string | number | string[] | null | undefined

export type CustomwareAnswers = Record<string, CustomwareValue>

/**
 * Convenience alias used by `activate.ts` and intake plumbing.
 */
export type IntakeAnswers = CustomwareAnswers

/**
 * Optional context overrides. Surface tier is auto-resolved via `readTier()`
 * when not passed; tests pass it explicitly to make the assertion explicit.
 */
export interface ApplyCustomwareOptions {
  /** Forces a specific surface tier; defaults to `readTier()` at call time. */
  surface?: ClaudeTier
  /** Disable tier-block stripping (debug only). */
  keepAllTierBlocks?: boolean
}

const TOKEN_REGEX = /\{\{\s*([A-Z][A-Z0-9_]*)\s*\}\}/g

/**
 * Normalize a customware value to its display string. Arrays comma-join.
 * Empty strings, null, and undefined all return null so the next layer can
 * supply the answer.
 */
function valueToString(value: CustomwareValue): string | null {
  if (value === null || value === undefined) return null
  if (Array.isArray(value)) {
    const joined = value.map((v) => String(v).trim()).filter((v) => v.length > 0).join(', ')
    return joined.length > 0 ? joined : null
  }
  const asString = String(value).trim()
  return asString.length > 0 ? asString : null
}

/**
 * Three-layer lookup: per-pack mini-form answers, then global intake answers,
 * then `customware-defaults.json`. Returns the literal `{{TOKEN}}` string
 * unchanged when no layer supplies a value, so the user can see what the pack
 * still needs.
 */
function resolveToken(
  token: string,
  intakeAnswers: CustomwareAnswers,
  perPackAnswers: CustomwareAnswers,
): string {
  const perPack = valueToString(perPackAnswers[token])
  if (perPack !== null) return perPack

  const intake = valueToString(intakeAnswers[token])
  if (intake !== null) return intake

  const fallback = valueToString((defaults as Record<string, CustomwareValue>)[token])
  if (fallback !== null) return fallback

  return `{{${token}}}`
}

/**
 * Replace every `{{TOKEN}}` match in `body` with its resolved value.
 */
function substituteTokens(
  body: string,
  intakeAnswers: CustomwareAnswers,
  perPackAnswers: CustomwareAnswers,
): string {
  return body.replace(TOKEN_REGEX, (_match, token: string) =>
    resolveToken(token, intakeAnswers, perPackAnswers),
  )
}

/**
 * Map the stored surface tier (`desktop` | `code` | `unknown`) to the pack
 * tier tokens (`pro` | `max` | `code`) that should remain in output. Desktop
 * keeps Pro and Max install paths; Code keeps only Code; unknown keeps all.
 */
function tierAllowlist(surface: ClaudeTier): Set<string> | null {
  switch (surface) {
    case 'desktop':
      return new Set(['pro', 'max'])
    case 'code':
      return new Set(['code'])
    case 'unknown':
    default:
      return null
  }
}

/**
 * Strip tier-aware section blocks of the form:
 *
 *     ## If WIRE_TIER == pro
 *     ...block body...
 *     ## If WIRE_TIER == max
 *     ...block body...
 *     ## If WIRE_TIER == code
 *     ...block body...
 *
 * Each block runs from its header to the next header at the same level
 * (`##`) or stronger (`#`). Tokens are case-insensitive on the header marker
 * (`If`, `if`, `IF`) and the variable name (`WIRE_TIER`, `wire_tier`).
 */
function stripTierBlocks(body: string, allowed: Set<string>): string {
  // Header pattern: `## If <var> == <tier>` allowing single or double `=`,
  // optional surrounding whitespace.
  const headerPattern =
    /^(##\s+If\s+[A-Z_]+\s*={1,2}\s*([a-z0-9_-]+)\s*)$/im
  const lines = body.split('\n')
  const out: string[] = []

  let skipBlock = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const headerMatch = line.match(headerPattern)
    if (headerMatch) {
      const blockTier = headerMatch[2].toLowerCase()
      if (allowed.has(blockTier)) {
        skipBlock = false
        out.push(line)
      } else {
        skipBlock = true
      }
      continue
    }
    // Any `#` heading at level 1 or 2 outside the tier set ends the skip.
    if (skipBlock && /^#{1,2}\s+/.test(line)) {
      skipBlock = false
      out.push(line)
      continue
    }
    if (!skipBlock) out.push(line)
  }
  return out.join('\n')
}

/**
 * Strip non-matching rows from a tier-table of the form:
 *
 *     | Tier | Surfaces | Trigger |
 *     |---|---|---|
 *     | Pro | ... | ... |
 *     | Max | ... | ... |
 *     | Code | ... | ... |
 *
 * Header rows (the labels + the `|---|` separator) survive. Rows whose first
 * cell does not match the allowed set are dropped. Tables without a leading
 * `Tier` column are left untouched.
 */
function stripTierTableRows(body: string, allowed: Set<string>): string {
  const lines = body.split('\n')
  const out: string[] = []

  let insideTierTable = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Detect entry into a tier table by spotting a header row whose first
    // labeled column is `Tier`.
    if (!insideTierTable && /^\|\s*Tier\s*\|/i.test(trimmed)) {
      insideTierTable = true
      out.push(line)
      continue
    }

    if (insideTierTable) {
      // Separator row like `|---|---|---|` always passes through.
      if (/^\|\s*-+/.test(trimmed)) {
        out.push(line)
        continue
      }
      // Non-table line ends the tier-table scope.
      if (!trimmed.startsWith('|')) {
        insideTierTable = false
        out.push(line)
        continue
      }
      // Inspect the first content cell.
      const cells = trimmed.split('|').map((c) => c.trim()).filter((c) => c.length > 0)
      if (cells.length === 0) {
        out.push(line)
        continue
      }
      const firstCellLower = cells[0].toLowerCase()
      // The first cell might be `Pro`, `Max`, `Code`, or another label. We
      // only drop a row when the first cell is a recognized tier outside the
      // allowed set. This keeps unrelated tables safe.
      const recognizedTiers = new Set(['pro', 'max', 'code'])
      if (recognizedTiers.has(firstCellLower) && !allowed.has(firstCellLower)) {
        // Drop the row.
        continue
      }
      out.push(line)
      continue
    }

    out.push(line)
  }
  return out.join('\n')
}

/**
 * Main entry point. Takes the raw pack markdown, the intake answers, and the
 * per-pack mini-form answers, returns the customized markdown ready for
 * clipboard write.
 *
 * Call order matters. Token substitution first so any `{{TIER}}` style tokens
 * resolve to the user's actual answer before tier-block stripping reads the
 * literal tier labels in headers and tables.
 */
export function applyCustomware(
  packMarkdown: string,
  intakeAnswers: CustomwareAnswers,
  perPackAnswers: CustomwareAnswers = {},
  options: ApplyCustomwareOptions = {},
): string {
  const surface = options.surface ?? readTier()

  // Layer 1+2+3 token substitution.
  let body = substituteTokens(packMarkdown, intakeAnswers, perPackAnswers)

  if (options.keepAllTierBlocks) return body

  const allowed = tierAllowlist(surface)
  if (allowed === null) return body

  body = stripTierBlocks(body, allowed)
  body = stripTierTableRows(body, allowed)
  return body
}

/**
 * Inline self-test. Not exported as a test runner integration; this is a
 * pure-function suite that throws on the first failure so consumers (or a
 * CI smoke step) can call it and surface regressions before merge.
 *
 * Sample pack markdown is intentionally tiny so a future contributor can
 * grok the contract in 30 seconds.
 */
export function __runCustomwareSelfTest(): { passed: number; failures: string[] } {
  const failures: string[] = []
  let passed = 0

  const samplePack = [
    '# Foundation 01: Operating Constitution',
    '',
    'Welcome {{VP_NAME_SLUG}}. Your division: {{DIVISION_SLUG}}.',
    'Trade focus: {{TRADE_FOCUS}}.',
    '',
    '## How to install',
    '',
    '| Tier | Surfaces | Trigger |',
    '|---|---|---|',
    '| Pro | claude.ai Project knowledge | /constitution |',
    '| Max | claude.ai Project knowledge plus ~/.claude/skills/constitution/SKILL.md | /constitution |',
    '| Code | ~/.claude/skills/constitution/SKILL.md | /constitution |',
    '',
    '## If WIRE_TIER == pro',
    '',
    'Pro install. Paste the artifact into Project knowledge.',
    '',
    '## If WIRE_TIER == max',
    '',
    'Max install. Same Pro flow plus local SKILL.md path.',
    '',
    '## If WIRE_TIER == code',
    '',
    'Code install. mkdir -p ~/.claude/skills/constitution && pbpaste > ~/.claude/skills/constitution/SKILL.md',
    '',
    '## Done',
    '',
    'Run the verification suite.',
  ].join('\n')

  const intake: CustomwareAnswers = {
    VP_NAME_SLUG: 'john',
    DIVISION_SLUG: 'reconstruction',
  }
  const perPack: CustomwareAnswers = {
    TRADE_FOCUS: 'paint and plaster',
  }

  // Case 1: code surface keeps only the Code install row plus header sections.
  {
    const output = applyCustomware(samplePack, intake, perPack, { surface: 'code' })
    const check = (label: string, condition: boolean) => {
      if (condition) passed++
      else failures.push(`code surface: ${label}`)
    }
    check('placeholder VP_NAME_SLUG resolved', output.includes('Welcome john.'))
    check('placeholder DIVISION_SLUG resolved', output.includes('Your division: reconstruction.'))
    check('per-pack TRADE_FOCUS resolved', output.includes('Trade focus: paint and plaster.'))
    check('Code tier-block kept', output.includes('Code install. mkdir -p'))
    check('Pro tier-block stripped', !output.includes('Pro install. Paste'))
    check('Max tier-block stripped', !output.includes('Max install. Same Pro'))
    check('Code tier-table row kept', /\|\s*Code\s*\|/.test(output))
    check('Pro tier-table row stripped', !/\|\s*Pro\s*\|/.test(output))
    check('Max tier-table row stripped', !/\|\s*Max\s*\|/.test(output))
    check('Done section survives', output.includes('## Done'))
    check('Verification line survives', output.includes('Run the verification suite.'))
  }

  // Case 2: desktop surface keeps Pro and Max blocks plus their table rows.
  {
    const output = applyCustomware(samplePack, intake, perPack, { surface: 'desktop' })
    const check = (label: string, condition: boolean) => {
      if (condition) passed++
      else failures.push(`desktop surface: ${label}`)
    }
    check('Pro tier-block kept', output.includes('Pro install. Paste'))
    check('Max tier-block kept', output.includes('Max install. Same Pro'))
    check('Code tier-block stripped', !output.includes('Code install. mkdir -p'))
    check('Pro tier-table row kept', /\|\s*Pro\s*\|/.test(output))
    check('Max tier-table row kept', /\|\s*Max\s*\|/.test(output))
    check('Code tier-table row stripped', !/\|\s*Code\s*\|/.test(output))
  }

  // Case 3: unknown surface keeps every install block.
  {
    const output = applyCustomware(samplePack, intake, perPack, { surface: 'unknown' })
    const check = (label: string, condition: boolean) => {
      if (condition) passed++
      else failures.push(`unknown surface: ${label}`)
    }
    check('Pro tier-block kept', output.includes('Pro install. Paste'))
    check('Max tier-block kept', output.includes('Max install. Same Pro'))
    check('Code tier-block kept', output.includes('Code install. mkdir -p'))
    check('All tier-table rows kept', /\|\s*Pro\s*\|/.test(output) && /\|\s*Max\s*\|/.test(output) && /\|\s*Code\s*\|/.test(output))
  }

  // Case 4: unresolved token survives as literal so authors see the gap.
  {
    const output = applyCustomware('Hello {{UNDEFINED_TOKEN}}.', {}, {}, { surface: 'unknown' })
    if (output === 'Hello {{UNDEFINED_TOKEN}}.') passed++
    else failures.push('unresolved token did not survive')
  }

  // Case 5: defaults from JSON fire when neither layer supplies a value.
  {
    const output = applyCustomware('Role: {{ROLE_TILT}}.', {}, {}, { surface: 'unknown' })
    if (output === 'Role: general.') passed++
    else failures.push(`defaults fallback failed: got "${output}"`)
  }

  // Case 6: per-pack answers beat intake answers for the same token.
  {
    const output = applyCustomware(
      'Name: {{VP_NAME_SLUG}}.',
      { VP_NAME_SLUG: 'intake-value' },
      { VP_NAME_SLUG: 'per-pack-value' },
      { surface: 'unknown' },
    )
    if (output === 'Name: per-pack-value.') passed++
    else failures.push(`per-pack precedence failed: got "${output}"`)
  }

  // Case 7: array values comma-join.
  {
    const output = applyCustomware(
      'Outcomes: {{OUTCOMES_PRIMARY}}.',
      { OUTCOMES_PRIMARY: ['faster proposals', 'faster emails'] },
      {},
      { surface: 'unknown' },
    )
    if (output === 'Outcomes: faster proposals, faster emails.') passed++
    else failures.push(`array join failed: got "${output}"`)
  }

  return { passed, failures }
}
