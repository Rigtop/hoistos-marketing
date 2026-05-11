/**
 * Claude deep-link helpers.
 *
 * The macOS + Windows desktop app registers a `claude://claude.ai/new?q=<urlencoded>`
 * scheme. Clicking that URL opens the desktop app and prefills the chat input
 * with the decoded query. We use it to ship a one-click installer for foundation
 * packs and chronological install rows on the live timeline page.
 *
 * Hard cap on the URL: 14,000 characters total (per H4 download/launch UX
 * research, 2026-05-08). encodeURIComponent inflates non-ASCII bytes roughly
 * 1x to 3x. We never push more than ~13,500 chars of encoded payload to leave
 * margin for the scheme prefix and any minor inflation drift between browsers.
 *
 * Strategy (b) selected: send the bootstrap prompt only. The bootstrap is a
 * compact "I want to install pack X. Here is the trim. Walk me through it,
 * the full pack lives at <URL>" block that fits comfortably under 14K. The
 * full pack file stays at /packs-v2/<id>.md for the user (or Claude over a
 * web-fetch tool) to grab.
 *
 * Why not gzip+base64: pack ranges 25KB to 90KB. Even at the 50% net floor
 * gzip+base64 hits, the largest packs still bust 14K. Bootstrap-only ships
 * deterministically inside the cap and degrades gracefully (the full pack
 * is one click away on the same domain).
 *
 * Why not multi-step paste: every extra paste is a tier-1 user-experience
 * cost. One desktop click into one prefilled chat is the entire promise.
 *
 * Hard Rule #11: zero em dashes anywhere in this file.
 * Hard Rule #31 disclosure: stdlib only (no external library imports).
 */

// ---------------------------------------------------------------------------
// Constants.
// ---------------------------------------------------------------------------

/** Hard cap for the entire claude:// URL including the scheme prefix. */
export const CLAUDE_URL_CAP = 14000

/** Headroom we keep below the cap to absorb any browser-specific overhead. */
export const SAFE_PAYLOAD_CAP = 13500

/** Production origin where the full pack files are served. */
export const PACK_BASE_URL = 'https://hoistos.com/packs-v2'

/** Tier ids the install button surfaces on the timeline + bonus pages.
 *
 * Two functional paths, not three. Pro and Max share the Cowork install path
 * (verified May 2026 against Anthropic Help Center: Cowork is included on
 * every paid plan). Splitting them into two picker buttons was redundant
 * dead-weight UI, so we collapse to a single 'desktop' identity.
 *
 * Legacy localStorage values 'pro' and 'max' are migrated to 'desktop' on
 * read by readTier(). Existing campaign URLs with ?tier=pro or ?tier=max
 * still resolve correctly.
 */
export type ClaudeTier = 'desktop' | 'code' | 'unknown'

// ---------------------------------------------------------------------------
// Bootstrap builder.
// ---------------------------------------------------------------------------

export interface BootstrapInput {
  /** Pack id (matches the markdown filename without extension). */
  packId: string
  /** Display title. Used for the human-readable confirmation in the prompt. */
  packTitle: string
  /** Estimated install minutes from the manifest. */
  estimatedMinutes: number
  /** Optional: caller's preferred tier. Sets tier hints inside the prompt. */
  tier?: ClaudeTier
}

/**
 * Build the bootstrap prompt body that gets URL-encoded into the deep link.
 *
 * The body is a compact installer instruction that points Claude at the full
 * pack URL on hoistos.com. The desktop app, on Max plans, has the web-fetch
 * tool available out of the box, so Claude can pull the full markdown itself.
 * On Pro the user pastes the full pack manually after the initial chat opens.
 * Either way the experience is one-click into a chat that already knows what
 * the user is trying to do.
 *
 * Plain English so the user can read it themselves if they ever inspect
 * the URL or the chat history.
 */
export function buildBootstrapPrompt(input: BootstrapInput): string {
  const tier = input.tier ?? 'unknown'
  const fullUrl = `${PACK_BASE_URL}/${input.packId}.md`

  const tierHint =
    tier === 'desktop'
      ? 'Tier: Claude desktop (Pro, Max, Team, or Enterprise). Cowork holds the persistent install thread. Use web-fetch for the full pack URL below.'
      : tier === 'code'
      ? 'Tier: Claude Code. Skills install at ~/.claude/skills/<name>/SKILL.md and auto-register on next session.'
      : 'Tier: not specified. Ask which tier I am on as your first question.'

  // Body kept compact. No filler. The user-side prompt has to fit alongside
  // the opening Q0 round-trip without overwhelming the chat input box.
  return [
    `I am installing the HoistOS pack: ${input.packTitle}.`,
    ``,
    `Pack id: ${input.packId}`,
    `Estimated time: ${input.estimatedMinutes} minutes`,
    `Full pack: ${fullUrl}`,
    ``,
    tierHint,
    ``,
    `Walk me through the install. Start with Q0 (the tier wire question), then run the personalization interview one question per turn. Pull the full pack markdown from the URL above when you need the canonical text. After the interview, emit the artifacts as code blocks with clear "save this as" instructions.`,
    ``,
    `Voice rules apply during the install: no em dashes, no banned openers, plain English, one question per turn.`,
  ].join('\n')
}

// ---------------------------------------------------------------------------
// URL builder + cap check.
// ---------------------------------------------------------------------------

export interface DeepLinkResult {
  /** Final claude:// URL ready to assign to window.location.href. */
  url: string
  /** Final URL length. Use to surface a char-count to the user. */
  length: number
  /** True when the encoded payload comfortably fits the SAFE_PAYLOAD_CAP. */
  withinCap: boolean
  /** Bytes of the bootstrap body before encoding. Diagnostic only. */
  rawBytes: number
}

/**
 * Build a claude://claude.ai/new?q=<encoded> URL from a bootstrap body.
 *
 * Returns both the URL and the diagnostic data so the UI can surface
 * the install footprint to the user (char count delivered, headroom).
 * Never throws on cap overflow. Caller decides how to degrade.
 */
export function buildClaudeDeepLinkUrl(bootstrap: string): DeepLinkResult {
  const encoded = encodeURIComponent(bootstrap)
  const url = `claude://claude.ai/new?q=${encoded}`

  return {
    url,
    length: url.length,
    withinCap: url.length <= SAFE_PAYLOAD_CAP,
    rawBytes: bootstrap.length,
  }
}

/**
 * One-shot helper. Given a pack manifest entry, return the deep-link result.
 * The UI calls this. No async, no fetch. The bootstrap is built locally so
 * the deep-link click is instant.
 */
export function buildDeepLinkForPack(input: BootstrapInput): DeepLinkResult {
  const body = buildBootstrapPrompt(input)
  return buildClaudeDeepLinkUrl(body)
}

// ---------------------------------------------------------------------------
// Char-cap fragmentation strategy (degraded path).
// ---------------------------------------------------------------------------

export interface FragmentationPlan {
  strategy: 'single' | 'bootstrap-only' | 'multi-paste'
  fragments: string[]
  totalChars: number
  rationale: string
}

/**
 * If a future pack needs to ship the full body inline (rare, only for
 * special tiny packs), this helper checks whether it fits and returns a
 * plan. For oversize bodies we fall back to bootstrap-only or, if even that
 * fails, to a multi-paste plan the UI can render as a guided checklist.
 *
 * Today every foundation + chronological pack rides bootstrap-only. This
 * helper is here for future packs that authors might want to ship inline.
 */
export function planFragmentation(fullBody: string): FragmentationPlan {
  const single = buildClaudeDeepLinkUrl(fullBody)
  if (single.withinCap) {
    return {
      strategy: 'single',
      fragments: [fullBody],
      totalChars: fullBody.length,
      rationale: `Body fits in one URL (${single.length} chars, cap ${SAFE_PAYLOAD_CAP}).`,
    }
  }

  // Bootstrap-only path is the default. The caller usually does not invoke
  // this helper for that path, so we stub the rationale and return an empty
  // fragments array as a signal the UI should use buildDeepLinkForPack.
  if (fullBody.length > 50000) {
    // Multi-paste. Chunk by paragraph boundaries, never split a code block.
    const fragments = splitByParagraphs(fullBody, SAFE_PAYLOAD_CAP - 800)
    return {
      strategy: 'multi-paste',
      fragments,
      totalChars: fullBody.length,
      rationale: `Body too large for a single URL. Multi-paste in ${fragments.length} steps.`,
    }
  }

  // Mid-range: send a bootstrap that points at the full URL.
  return {
    strategy: 'bootstrap-only',
    fragments: [],
    totalChars: fullBody.length,
    rationale: `Body over single-URL cap (${fullBody.length} > ${SAFE_PAYLOAD_CAP}). Use bootstrap-only deep link, full pack at hoistos.com.`,
  }
}

/**
 * Split a long markdown body on paragraph boundaries so each fragment fits
 * under maxChars and no fragment cuts a fenced code block in half.
 *
 * Conservative: walks the body keeping a running buffer, flushes on
 * paragraph break when adding the next paragraph would push past the cap.
 * Code blocks are detected by triple-backtick parity and held intact.
 */
export function splitByParagraphs(body: string, maxChars: number): string[] {
  const paragraphs = body.split(/\n\n+/)
  const fragments: string[] = []
  let buf = ''
  let inCodeBlock = false

  for (const para of paragraphs) {
    // Track code-block parity. If we are inside one, never break.
    const fenceCount = (para.match(/```/g) ?? []).length
    if (fenceCount % 2 === 1) inCodeBlock = !inCodeBlock

    const candidate = buf.length === 0 ? para : `${buf}\n\n${para}`
    if (candidate.length <= maxChars || inCodeBlock) {
      buf = candidate
      continue
    }
    if (buf.length > 0) fragments.push(buf)
    buf = para
  }
  if (buf.length > 0) fragments.push(buf)
  return fragments
}

// ---------------------------------------------------------------------------
// Tier picker persistence.
// ---------------------------------------------------------------------------

const TIER_STORAGE_KEY = 'hoistos.empire.tier'

/**
 * Read the persisted tier from localStorage, with a URL ?tier= override.
 *
 * SUPERSESSION 2026-05-11 (Eugeen live feedback from Steve install):
 * Steve hit choice paralysis at the tier picker. Returning 'desktop'
 * unconditionally collapses the friction. Install paths assume Max
 * (the strongest Anthropic plan with Cowork + web-fetch + every tier
 * mechanic the packs depend on). Pro users get the same experience
 * because every pack's install behavior is identical on Pro and Max
 * once Cowork is registered. The ?tier=code URL override still resolves
 * for developers who explicitly want the CLI path.
 */
export function readTier(): ClaudeTier {
  if (typeof window === 'undefined') return 'desktop'
  // ?tier=code URL override stays for developers who want the CLI path.
  try {
    const params = new URLSearchParams(window.location.search)
    const fromUrl = (params.get('tier') ?? '').toLowerCase()
    if (fromUrl === 'code') return 'code'
  } catch {
    // URLSearchParams should never throw in modern browsers.
  }
  return 'desktop'
}

/** Persist the user's tier pick across sessions. */
export function writeTier(tier: ClaudeTier): void {
  if (typeof window === 'undefined') return
  try {
    if (tier === 'unknown') {
      window.localStorage.removeItem(TIER_STORAGE_KEY)
    } else {
      window.localStorage.setItem(TIER_STORAGE_KEY, tier)
    }
  } catch {
    // localStorage write blocked. Silent fail. The tier picker stays usable
    // session-only; the user just has to pick again next visit.
  }
}

// ---------------------------------------------------------------------------
// Code CLI install command.
// ---------------------------------------------------------------------------

/**
 * The one-line command Code-tier users paste into a terminal. Drops the
 * pack into ~/.claude/skills/<id>/SKILL.md and auto-registers on next
 * session. The user provides their own claude.ai login on first run.
 *
 * The curl one-liner pulls from the same /packs-v2/ folder the web tier
 * fetches so we have a single source of truth.
 */
export function buildCodeCliInstallCommand(packId: string): string {
  // Single-line shell command. Two steps: mkdir + curl. Quoted so a paste
  // into iTerm/Terminal/Warp lands as one history entry.
  return `mkdir -p ~/.claude/skills/${packId} && curl -fsSL ${PACK_BASE_URL}/${packId}.md -o ~/.claude/skills/${packId}/SKILL.md && echo "Installed ${packId}. Restart your Claude Code session to register."`
}
