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
 * Round 9 (2026-05-18): bulletproof install meta-layer.
 *
 * The engine wraps every pack body with a state-aware pre-flight + post-flight
 * verification probe so any pack inherits "tally before install, branch on
 * existing state, probe after install" behavior without per-pack rewrite.
 *
 * Pack authors get bulletproof installs for free. Per-pack frontmatter
 * additions (coexistSignatures, probePrompts, companionSkillCollisionPolicy,
 * uniqueValueAdds) are optional, with sensible defaults.
 */

/** The inferred tier used by the wrapper. Distinct from ClaudeTier (the surface
 *  tier) because the wrapper handles power-user heuristics that the legacy
 *  Pro/Code split does not. */
export type InferredTier = 'pro' | 'max' | 'code' | 'cowork-power-user'

/** Minimal frontmatter shape the wrapper reads. Pack authors can add more
 *  fields, but only these drive the pre-flight + post-flight. */
export interface PackMeta {
  pack?: string
  name?: string
  tier?: string
  targetSkill?: string
  prerequisites?: string[]
  companionSkills?: string[]
  coexistSignatures?: string[]
  probePrompts?: {
    smoke?: string
    real?: string
    stress?: string
  }
  companionSkillCollisionPolicy?: 'prompt' | 'rename-to-v2' | 'overwrite'
  uniqueValueAdds?: string[]
}

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
  /** Round 9: installed pack ids (from listActivated()). Drives tally + prereq check. */
  installedPackIds?: string[]
  /** Round 9: audience flag from useAudience() (default | empireworks). */
  audienceFlag?: string
  /** Round 9: skip the round 9 pre/post-flight wrapping (legacy callers). */
  skipBulletproofWrapping?: boolean
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
 *
 * Round 9: After the existing substitute + strip pass, the engine parses the
 * pack frontmatter and wraps the body with renderPreFlight + renderPostFlight.
 * Legacy callers can pass `skipBulletproofWrapping: true` to opt out (e.g. for
 * raw pack body copy in dev mode).
 */
export function applyCustomware(
  packMarkdown: string,
  intakeAnswers: CustomwareAnswers,
  perPackAnswers: CustomwareAnswers = {},
  options: ApplyCustomwareOptions = {},
): string {
  const surface = options.surface ?? readTier()
  const installedPackIds = options.installedPackIds ?? []
  const audienceFlag = options.audienceFlag ?? readAudienceFlag()
  const inferredTier = resolveInferredTier({
    surface,
    audienceFlag,
    installedPackIds,
    intakeAnswers,
  })

  // Round 9: parse frontmatter before substitution so the auto-tokens include
  // pack metadata (companionSkills count, prereq count, etc.).
  const { meta, body: rawBody } = parsePackFrontmatter(packMarkdown)

  // Round 9: enrich intake with auto-injected tokens so packs can reference
  // them via {{KNOWN_INSTALLED_PACK_IDS}}, {{INFERRED_TIER}}, etc.
  const enrichedIntake: CustomwareAnswers = {
    ...intakeAnswers,
    KNOWN_INSTALLED_PACK_IDS:
      installedPackIds.length > 0 ? installedPackIds.join(', ') : 'none yet',
    Q3_PRIMARY_SURFACE: pickQ3Primary(intakeAnswers),
    Q2_TOP_PAIN: pickQ2Top(intakeAnswers),
    INTAKE_VP_NAME: stringOrEmpty(intakeAnswers.name) || 'operator',
    INTAKE_VP_ROLE: stringOrEmpty(intakeAnswers.division) || 'operator',
    INFERRED_TIER: inferredTier,
    AUDIENCE_FLAG: audienceFlag,
  }

  // Layer 1+2+3 token substitution on the FULL markdown (frontmatter included
  // because some packs reference tokens in displayName etc.).
  let body = substituteTokens(packMarkdown, enrichedIntake, perPackAnswers)

  if (!options.keepAllTierBlocks) {
    const allowed = tierAllowlist(surface)
    if (allowed !== null) {
      body = stripTierBlocks(body, allowed)
      body = stripTierTableRows(body, allowed)
    }
  }

  // Round 9: wrap with pre/post flight unless explicitly disabled or no
  // frontmatter (e.g. plain markdown without YAML header).
  if (options.skipBulletproofWrapping || !meta) {
    return body
  }

  void rawBody // raw body kept for future direct-render use
  const pre = renderPreFlight(meta, enrichedIntake, installedPackIds, inferredTier)
  const post = renderPostFlight(meta, enrichedIntake)
  return `${pre}\n\n---\n\n${body}\n\n---\n\n${post}`
}

// ---------------------------------------------------------------------------
// Round 9 helpers.
// ---------------------------------------------------------------------------

function stringOrEmpty(v: CustomwareValue): string {
  if (v === null || v === undefined) return ''
  if (Array.isArray(v)) return v.join(', ')
  return String(v)
}

function pickQ2Top(intake: CustomwareAnswers): string {
  const q2 = intake.q2Pains
  if (Array.isArray(q2) && q2.length > 0) return String(q2[0])
  const customOutcome = intake.customOutcome
  if (typeof customOutcome === 'string' && customOutcome.trim().length > 0) {
    return customOutcome
  }
  return 'general productivity'
}

function pickQ3Primary(intake: CustomwareAnswers): string {
  const q3 = intake.q3Surfaces
  if (Array.isArray(q3) && q3.length > 0) return String(q3[0])
  const surfaces = intake.surfaces
  if (Array.isArray(surfaces) && surfaces.length > 0) return String(surfaces[0])
  return 'browser'
}

function readAudienceFlag(): string {
  if (typeof window === 'undefined') return 'default'
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get('ew') === '1' || params.get('steve') === '1') return 'empireworks'
    const stored = window.sessionStorage.getItem('hoistos.empire.audience')
    if (stored === 'empireworks') return 'empireworks'
  } catch {
    // ignore
  }
  return 'default'
}

/** Infer the user's tier from a basket of signals. */
export function resolveInferredTier(args: {
  surface: ClaudeTier
  audienceFlag: string
  installedPackIds: string[]
  intakeAnswers: CustomwareAnswers
}): InferredTier {
  const { surface, audienceFlag, installedPackIds, intakeAnswers } = args
  if (surface === 'code') return 'code'
  const q3 = intakeAnswers.q3Surfaces
  const multiSurface = Array.isArray(q3) && q3.length >= 2
  const powerUser =
    audienceFlag === 'empireworks' && installedPackIds.length >= 2 && multiSurface
  if (powerUser) return 'cowork-power-user'
  if (multiSurface) return 'max'
  return 'pro'
}

const FRONTMATTER_BOUNDARY = /^---\s*\n([\s\S]*?)\n---\s*\n?/

/** Tiny YAML-ish parser. Handles top-level string / number / list-of-strings
 *  scalars + simple nested object fields. Returns null when no frontmatter. */
export function parsePackFrontmatter(markdown: string): {
  meta: PackMeta | null
  body: string
} {
  const match = markdown.match(FRONTMATTER_BOUNDARY)
  if (!match) return { meta: null, body: markdown }
  const frontmatterBlock = match[1]
  const body = markdown.slice(match[0].length)
  const meta = parseYamlMinimal(frontmatterBlock)
  return { meta, body }
}

function parseYamlMinimal(yaml: string): PackMeta {
  const meta: Record<string, unknown> = {}
  const lines = yaml.split('\n')
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim() || line.trim().startsWith('#')) {
      i += 1
      continue
    }
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/)
    if (!m) {
      i += 1
      continue
    }
    const key = m[1]
    const rest = m[2].trim()
    if (rest === '') {
      // Multi-line value: list (next non-blank line starts with "  - ") or
      // nested object (next non-blank line starts with "  key:").
      const block: string[] = []
      let j = i + 1
      while (j < lines.length && (lines[j].startsWith('  ') || lines[j].trim() === '')) {
        block.push(lines[j])
        j += 1
      }
      const trimmedBlock = block.map((l) => l.replace(/^ {2}/, ''))
      const isList = trimmedBlock.some((l) => l.trim().startsWith('- '))
      if (isList) {
        const items: string[] = trimmedBlock
          .filter((l) => l.trim().startsWith('- '))
          .map((l) => l.trim().slice(2).trim())
          .map((l) => String(unquoteScalar(l)))
        meta[key] = items
      } else {
        const nested = parseYamlMinimal(trimmedBlock.join('\n'))
        meta[key] = nested
      }
      i = j
      continue
    }
    meta[key] = unquoteScalar(rest)
    i += 1
  }
  return meta as PackMeta
}

function unquoteScalar(v: string): string | number | boolean {
  let trimmed = v.trim()
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    trimmed = trimmed.slice(1, -1)
  } else if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    trimmed = trimmed.slice(1, -1)
  }
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed)
  return trimmed
}

/** Render the pre-flight block that runs BEFORE the install body. */
export function renderPreFlight(
  meta: PackMeta,
  intake: CustomwareAnswers,
  installedPackIds: string[],
  inferredTier: InferredTier,
): string {
  const name = stringOrEmpty(intake.name) || 'operator'
  const role = stringOrEmpty(intake.division) || 'operator'
  const pain = pickQ2Top(intake)
  const surface = pickQ3Primary(intake)
  const audience = stringOrEmpty(intake.AUDIENCE_FLAG) || 'default'
  const installedList = installedPackIds.length > 0 ? installedPackIds.join(', ') : 'none yet'
  const packName = meta.pack || meta.name || 'this pack'

  const prereqsBlock = renderPrereqCheck(meta.prerequisites ?? [], installedPackIds)
  const branchBlock = renderBranchSelection(meta, inferredTier)
  const collisionBlock = renderCollisionCheck(
    meta.companionSkills ?? [],
    meta.companionSkillCollisionPolicy ?? 'prompt',
    inferredTier,
  )

  return [
    '# Bulletproof Install: Pre-Flight',
    '',
    `> Read this section first. Do not run the install body below until each gate passes.`,
    '',
    '## Tally (what I already know about you)',
    '',
    `- Name: ${name}`,
    `- Role: ${role}`,
    `- Top pain: ${pain}`,
    `- Primary surface: ${surface}`,
    `- Audience: ${audience}`,
    `- Inferred tier: ${inferredTier}`,
    `- Installed packs: ${installedList}`,
    `- Pack being installed: ${packName}`,
    '',
    `I have these answers already. I will not ask you to retype them. I will ask only delta questions for this pack.`,
    '',
    prereqsBlock,
    '',
    branchBlock,
    '',
    collisionBlock,
  ].join('\n')
}

function renderPrereqCheck(prereqs: string[], installedPackIds: string[]): string {
  if (prereqs.length === 0) return ''
  const installedSet = new Set(installedPackIds.map((id) => id.toLowerCase()))
  const lines: string[] = ['## Prereq Check', '']
  let allClear = true
  for (const req of prereqs) {
    const reqLower = req.toLowerCase()
    // Heuristic: if the prereq mentions a pack id like "F-01" or "foundation-01",
    // try to match against installedPackIds. Otherwise just print as advisory.
    const codeMatch = reqLower.match(/f-0?(\d+)|foundation-0?(\d+)/)
    if (codeMatch) {
      const num = codeMatch[1] || codeMatch[2]
      const padded = num.padStart(2, '0')
      const matches = Array.from(installedSet).filter((id) =>
        id.includes(`foundation-${padded}`),
      )
      const mark = matches.length > 0 ? '✓' : '✗'
      if (matches.length === 0) allClear = false
      lines.push(`- ${mark} ${req}`)
    } else {
      lines.push(`- ? ${req} (advisory, check yourself)`)
    }
  }
  if (!allClear) {
    lines.push('')
    lines.push(
      'HALT: at least one prereq pack is not detected. Install the missing prereq first, then re-paste this pack. Do not proceed with the install body below.',
    )
  }
  return lines.join('\n')
}

function renderBranchSelection(meta: PackMeta, inferredTier: InferredTier): string {
  const signatures = meta.coexistSignatures ?? []
  if (signatures.length === 0) {
    return [
      '## Branch Selection',
      '',
      `No coexist signatures declared by this pack. Proceeding on the FRESH branch by default.`,
    ].join('\n')
  }
  const valueAdds = meta.uniqueValueAdds ?? []
  return [
    '## Branch Selection',
    '',
    `Scan the user's Project Knowledge / loaded context for these regex signatures:`,
    ...signatures.map((s) => `- \`${s}\``),
    '',
    `If ZERO signatures match, this is a FRESH install. Proceed with the body below.`,
    '',
    `If SOME signatures match but the user's existing tool is missing key features, this is an UPGRADE install. Ask only the delta questions and skip the rest.`,
    '',
    `If signatures match AND the inferred tier is "cowork-power-user" (this user has tooling that supersedes the pack), this is a COEXIST install. DO NOT scaffold the artifacts below verbatim. Instead, tell the user:`,
    '',
    `> Your existing setup already covers most of what this pack ships. Here are the unique value-adds you could splice into your existing tool:`,
    valueAdds.length > 0
      ? valueAdds.map((v) => `> - ${v}`).join('\n')
      : '> - (no unique value-adds declared by this pack)',
    '',
    `Then ask the user if they want to splice. If yes, output ONLY the relevant splice fragments. If no, stop. Inferred tier for this user: ${inferredTier}.`,
  ].join('\n')
}

function renderCollisionCheck(
  companionSkills: string[],
  policy: 'prompt' | 'rename-to-v2' | 'overwrite',
  inferredTier: InferredTier,
): string {
  if (companionSkills.length === 0) return ''
  const lines: string[] = ['## Companion Skill Collision Check', '']
  for (const skill of companionSkills) {
    if (inferredTier === 'code') {
      lines.push(`- Check: \`ls ~/.claude/skills/${skill}/SKILL.md\``)
    } else {
      lines.push(
        `- Check: scan Project Knowledge for \`name: ${skill}\` frontmatter (a SKILL.md block already present in this Project).`,
      )
    }
  }
  const policyText =
    policy === 'overwrite'
      ? 'If any exist, OVERWRITE them with the new versions in this pack.'
      : policy === 'rename-to-v2'
        ? 'If any exist, RENAME the new versions to `<original-name>-v2` and install alongside the old.'
        : 'If any exist, ASK the user: overwrite, rename to -v2, or skip.'
  lines.push('')
  lines.push(`Policy: ${policyText}`)
  return lines.join('\n')
}

/** Render the post-flight verification probe block. */
export function renderPostFlight(meta: PackMeta, intake: CustomwareAnswers): string {
  const probes = meta.probePrompts ?? {}
  const pain = pickQ2Top(intake)
  const smoke = probes.smoke || 'Hi'
  const real = (probes.real || `Quick status: ${pain} pulse this week?`)
    .replace(/\{\{Q2_TOP_PAIN\}\}/g, pain)
  const stress = probes.stress || 'How fresh is the briefing right now?'

  return [
    '# Bulletproof Install: Post-Flight Verification',
    '',
    `> Run these three probes IN THIS SAME CHAT immediately after the install body lands. Do not declare success until the INSTALL_VERIFIED stamp appears.`,
    '',
    `## Probe 1 (smoke)`,
    '',
    `Type: \`${smoke}\``,
    '',
    `Expected: the cold-start stamp (or pack-specific stamp) lands on line 1. PROBE 1 ✓ if it does, PROBE 1 ✗ if it does not.`,
    '',
    `## Probe 2 (real task)`,
    '',
    `Type: \`${real}\``,
    '',
    `Expected: the reply pulls from the pack's installed fields, not from training data. PROBE 2 ✓ if it does, PROBE 2 ✗ if it does not.`,
    '',
    `## Probe 3 (stress)`,
    '',
    `Type: \`${stress}\``,
    '',
    `Expected: pack edge-case behavior fires correctly. PROBE 3 ✓ if it does, PROBE 3 ✗ if it does not.`,
    '',
    `## Stamp`,
    '',
    `After running all three probes, emit on a single line:`,
    '',
    `\`PROBE 1 [✓|✗] | PROBE 2 [✓|✗] | PROBE 3 [✓|✗] | INSTALL_VERIFIED [yes|no|partial]\``,
    '',
    `If any probe failed, surface the matching "Common Breaks" entry from the install body above and offer recovery. If probes could not run (e.g. the user moved on before you could fire them), stamp \`INSTALL_DEFERRED\` and tell the user how to run the probes manually.`,
  ].join('\n')
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
