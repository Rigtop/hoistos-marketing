/**
 * Claude install helpers.
 *
 * The current public install policy is copy/paste or Bridge-first. This file
 * intentionally does not build instruction-loaded Claude URLs. The desktop app
 * URL scheme is only used elsewhere as a blank-chat launcher, while the full
 * pack body arrives through the user's clipboard or through EmpireWorks Bridge.
 */

/** Production origin where the direct markdown fallback files are served. */
export const PACK_BASE_URL = 'https://hoistos.com/packs-v2'

/** Tier ids the fallback install buttons surface on the timeline + bonus pages. */
export type ClaudeTier = 'desktop' | 'code' | 'unknown'

const TIER_STORAGE_KEY = 'hoistos.empire.tier'

/**
 * Read the persisted tier from localStorage, with a URL ?tier= override.
 * Desktop is the default because the Bridge path assumes Claude Desktop.
 */
export function readTier(): ClaudeTier {
  if (typeof window === 'undefined') return 'desktop'
  try {
    const params = new URLSearchParams(window.location.search)
    const fromUrl = (params.get('tier') ?? '').toLowerCase()
    if (fromUrl === 'code') return 'code'
  } catch {
    // URLSearchParams should not throw in modern browsers.
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
    // localStorage may be blocked. The picker still works session-only.
  }
}

/**
 * The one-line command Code-tier users paste into a terminal. Drops the pack
 * into ~/.claude/skills/<id>/SKILL.md and auto-registers on next session.
 */
export function buildCodeCliInstallCommand(packId: string): string {
  return `mkdir -p ~/.claude/skills/${packId} && curl -fsSL ${PACK_BASE_URL}/${packId}.md -o ~/.claude/skills/${packId}/SKILL.md && echo "Installed ${packId}. Restart your Claude Code session to register."`
}
