/**
 * Pain to pack registry. Ported verbatim from mockup-A-v3.html PACK_BY_PAIN
 * (line 557). Drives SerialPackStage personalized pitch text based on the
 * user's Q2 top-ranked pain answer from intake.
 *
 * Modularity floor: adding a new pain tile to InlineIntake question 2 is
 * a data change here (add the key, add the tile to the intake), not a
 * component code change.
 *
 * The 8 keys match exactly the 8 tile values in mockup-A-v3.html intake-2
 * screen (emails, proposals, team, contracts, billing, decisions, meetings,
 * voice).
 */

import type { LayerId } from './layers'

/** Surface that the pack is most naturally installed against. Drives the
 * MCP badge on the pack card. */
export type McpRequirement = 'browser' | 'desktop' | 'code'

export interface PainPackMapping {
  /** The pack name shown as the headline on the pack card. */
  name: string
  /** Which of the 5 layers this pack lives in. */
  layer: LayerId
  /** Personalized pitch sentence shown directly under the pack name.
   * References the pain literally (e.g. "You said emails cost..."). */
  pitch: string
  /** "Claude can do this after install" line shown in the cream callout. */
  after: string
  /** The surface the pack runs against (browser, desktop, code). */
  mcp: McpRequirement
}

export const PACK_BY_PAIN: Record<string, PainPackMapping> = {
  emails: {
    name: 'Constitution',
    layer: 'voice',
    pitch:
      'You said emails cost you the most time. After this pack, Claude drafts every follow-up in your voice. No rewrites.',
    after:
      'Draft GC follow-ups, client emails, internal replies. All in your voice. Signed as you.',
    mcp: 'browser',
  },
  proposals: {
    name: 'Constitution',
    layer: 'voice',
    pitch:
      'You said proposals eat your time. After this pack, Claude drafts proposal sections in your voice. Pricing math stays yours.',
    after:
      'Draft proposal sections, cover letters, scope summaries. All sounding like you wrote them.',
    mcp: 'browser',
  },
  team: {
    name: 'Facts Registry',
    layer: 'memory',
    pitch:
      'You said tracking your team hurts most. After this pack, Claude remembers every person, project, decision.',
    after:
      'Remember every person, every project, every decision. Recall in one prompt.',
    mcp: 'browser',
  },
  contracts: {
    name: 'Constitution',
    layer: 'voice',
    pitch:
      'You said contract risk is a time sink. After this pack, Claude reads contracts in your voice and flags risks.',
    after:
      'Read contracts, flag risks, draft red-line comments in your tone.',
    mcp: 'desktop',
  },
  billing: {
    name: 'Facts Registry',
    layer: 'memory',
    pitch:
      'You said billing eats your time. After this pack, Claude remembers every billing rule and client term.',
    after:
      'Remember billing rules per client. Draft invoices and AR follow-ups in your voice.',
    mcp: 'browser',
  },
  decisions: {
    name: 'Facts Registry',
    layer: 'memory',
    pitch:
      'You said daily decisions and recall hurt. After this pack, Claude remembers every decision and surfaces them.',
    after:
      'Log decisions once, recall any time. Ask why you chose X over Y three months later.',
    mcp: 'browser',
  },
  meetings: {
    name: 'Facts Registry',
    layer: 'memory',
    pitch:
      'You said meeting capture is the problem. After this pack, Claude ingests meetings and extracts action items.',
    after:
      'Capture every meeting, extract decisions, surface action items by owner.',
    mcp: 'desktop',
  },
  voice: {
    name: 'Constitution',
    layer: 'voice',
    pitch:
      'You said writing in your voice is the gap. After this pack, every Claude reply sounds like you.',
    after:
      'Every reply, every draft, every doc reads exactly like you wrote it.',
    mcp: 'browser',
  },
}

/** Returns the mapping for the user's top-ranked pain, or the emails
 * mapping as a sane default. Mirrors mockup-A-v3.html personalizePack(). */
export function packForTopPain(topPain: string | undefined): PainPackMapping {
  if (!topPain) return PACK_BY_PAIN.emails
  return PACK_BY_PAIN[topPain] || PACK_BY_PAIN.emails
}
