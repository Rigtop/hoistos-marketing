/**
 * Locked-state pack placeholders. 32 entries that fill out the catalog to
 * the 43-pack total reflected in SegmentedTrackerBar (so the bar denominator
 * and the catalog item count finally match).
 *
 * Round 8 (2026-05-18). Eugeen confirmed direction in the round 8 plan:
 * fill the catalog with locked cards rather than dropping the bar to 11.
 * Each locked card carries a grayscale visual treatment + lock glyph +
 * "Ships <quarter>" badge + a tap-to-toast "Not yet available, join
 * waitlist" handler. The data here is the source of truth for those
 * placeholders.
 *
 * Distribution per tier:
 *   Advanced (A-01..A-07): 7 packs, ships Q3 2026
 *   Business (BIZ-01..BIZ-08): 8 packs, ships Q4 2026
 *   Power (P-01..P-06): 6 packs, ships Q1 2027
 *   Premium (PREM-01..PREM-11): 11 packs, ships Q2 2027
 *   Total: 32 locked + 11 real foundation = 43 (matches LAYERS.totalPacks sum)
 *
 * Naming aligns with HOURS_PER_PACK (hours-saved.ts) where overlap exists
 * (e.g. A-01 Proposal Builder), so the multiplier formula in CommandCenter
 * keeps working when these eventually ship.
 *
 * Hard Rule #11: no em dashes.
 * R087 plain English in copy.
 */

import type { LayerId } from './layers'
import type { TierId } from './tiers'

export interface LockedPack {
  /** Stable id used as URL slug + click key. */
  packId: string
  /** Two-letter shorthand for the badge (A-01, BIZ-02, P-03, PREM-04). */
  badge: string
  /** Visible card title. */
  title: string
  /** One-line purpose, < 90 chars. */
  purpose: string
  /** Which of the five operating layers this pack belongs to when shipped. */
  layer: LayerId
  /** Which tier this pack belongs to. */
  tier: Exclude<TierId, 'foundation'>
  /** Ship target shown in the "Ships <quarter>" badge. */
  shipsBadge: string
}

export const LOCKED_PACKS: LockedPack[] = [
  // Advanced tier (ships Q3 2026)
  {
    packId: 'advanced-01-proposal-builder',
    badge: 'A-01',
    title: 'Proposal Builder',
    purpose: 'Drafts proposals on your letterhead, in your voice, with your pricing math intact.',
    layer: 'voice',
    tier: 'advanced',
    shipsBadge: 'Ships Q3 2026',
  },
  {
    packId: 'advanced-02-meeting-to-actions',
    badge: 'A-02',
    title: 'Meeting Transcript to Actions',
    purpose: 'Ingests meeting transcripts, extracts decisions and action items by owner.',
    layer: 'memory',
    tier: 'advanced',
    shipsBadge: 'Ships Q3 2026',
  },
  {
    packId: 'advanced-03-contract-risks',
    badge: 'A-03',
    title: 'Contract Risks in Plain English',
    purpose: 'Reads contracts, flags indemnification + termination + scope risk in your tone.',
    layer: 'sources',
    tier: 'advanced',
    shipsBadge: 'Ships Q3 2026',
  },
  {
    packId: 'advanced-04-rfi-walkthrough',
    badge: 'A-04',
    title: 'RFI Walkthrough',
    purpose: 'Generates RFI cover letters and submittal trackers with the right architect routing.',
    layer: 'routing',
    tier: 'advanced',
    shipsBadge: 'Ships Q3 2026',
  },
  {
    packId: 'advanced-05-change-order',
    badge: 'A-05',
    title: 'Change Order Generator',
    purpose: 'Turns a one-line scope add into a priced, formatted change order.',
    layer: 'routing',
    tier: 'advanced',
    shipsBadge: 'Ships Q3 2026',
  },
  {
    packId: 'advanced-06-daily-briefing',
    badge: 'A-06',
    title: 'Daily Briefing',
    purpose: 'Morning brief: top 3 projects, top 3 unreplied threads, top decision needed today.',
    layer: 'memory',
    tier: 'advanced',
    shipsBadge: 'Ships Q3 2026',
  },
  {
    packId: 'advanced-07-knowledge-search',
    badge: 'A-07',
    title: 'Knowledge Search',
    purpose: 'Cross-file search over your Outputs corpus with cited passages.',
    layer: 'sources',
    tier: 'advanced',
    shipsBadge: 'Ships Q3 2026',
  },
  // Business tier (ships Q4 2026)
  {
    packId: 'business-01-notion-mcp',
    badge: 'BIZ-01',
    title: 'Notion + MCP Setup',
    purpose: 'Wires your Notion workspace to Claude via the MCP connector, with write-gate guards.',
    layer: 'routing',
    tier: 'business',
    shipsBadge: 'Ships Q4 2026',
  },
  {
    packId: 'business-02-email-pipeline',
    badge: 'BIZ-02',
    title: 'Email to Notion Pipeline',
    purpose: 'Ingests inbox threads, classifies by client + urgency, routes to the right Notion DB.',
    layer: 'routing',
    tier: 'business',
    shipsBadge: 'Ships Q4 2026',
  },
  {
    packId: 'business-03-quickbooks-sync',
    badge: 'BIZ-03',
    title: 'QuickBooks Sync',
    purpose: 'Pulls billable hours + invoice status, surfaces AR aging in your daily brief.',
    layer: 'sources',
    tier: 'business',
    shipsBadge: 'Ships Q4 2026',
  },
  {
    packId: 'business-04-google-drive',
    badge: 'BIZ-04',
    title: 'Google Drive Indexer',
    purpose: 'Crawls Drive folders, builds a searchable index over Docs + Sheets + PDFs.',
    layer: 'sources',
    tier: 'business',
    shipsBadge: 'Ships Q4 2026',
  },
  {
    packId: 'business-05-calendar-sync',
    badge: 'BIZ-05',
    title: 'Calendar Sync',
    purpose: 'Reads Calendar, joins meetings as a participant, captures transcript via Otter.',
    layer: 'sources',
    tier: 'business',
    shipsBadge: 'Ships Q4 2026',
  },
  {
    packId: 'business-06-slack-ingest',
    badge: 'BIZ-06',
    title: 'Slack Ingest',
    purpose: 'Listens to channels you flag, surfaces decisions + action items per project.',
    layer: 'memory',
    tier: 'business',
    shipsBadge: 'Ships Q4 2026',
  },
  {
    packId: 'business-07-gmail-sender',
    badge: 'BIZ-07',
    title: 'Gmail Sender',
    purpose: 'Drafts and sends Gmail with HR #34 sign-off gate enforcement.',
    layer: 'validation',
    tier: 'business',
    shipsBadge: 'Ships Q4 2026',
  },
  {
    packId: 'business-08-zapier-bridge',
    badge: 'BIZ-08',
    title: 'Zapier Bridge',
    purpose: 'Hands off Claude actions to existing Zapier workflows with idempotency keys.',
    layer: 'routing',
    tier: 'business',
    shipsBadge: 'Ships Q4 2026',
  },
  // Power tier (ships Q1 2027)
  {
    packId: 'power-01-cli-installer',
    badge: 'P-01',
    title: 'Code CLI Bridge',
    purpose: 'Auto-installs Code CLI skills onto your terminal from the Bridge web flow.',
    layer: 'routing',
    tier: 'power',
    shipsBadge: 'Ships Q1 2027',
  },
  {
    packId: 'power-02-rag-knowledge',
    badge: 'P-02',
    title: 'RAG Knowledge Search',
    purpose: 'Embeds your full corpus into a vector store, semantic search with citations.',
    layer: 'sources',
    tier: 'power',
    shipsBadge: 'Ships Q1 2027',
  },
  {
    packId: 'power-03-voice-to-task',
    badge: 'P-03',
    title: 'Voice to Task on Mobile',
    purpose: 'Telegram + Whisper pipeline that turns a voice memo into a routed Notion task.',
    layer: 'routing',
    tier: 'power',
    shipsBadge: 'Ships Q1 2027',
  },
  {
    packId: 'power-04-multi-model-jury',
    badge: 'P-04',
    title: 'Multi-Model Jury',
    purpose: 'Routes high-stakes drafts past GPT-5 as critic, surfaces AGREE / DISAGREE diffs.',
    layer: 'validation',
    tier: 'power',
    shipsBadge: 'Ships Q1 2027',
  },
  {
    packId: 'power-05-overnight-orchestrator',
    badge: 'P-05',
    title: 'Overnight Orchestrator',
    purpose: 'Runs parallel worker tabs on a sprint plan, auto-merges results in the morning.',
    layer: 'routing',
    tier: 'power',
    shipsBadge: 'Ships Q1 2027',
  },
  {
    packId: 'power-06-self-healing-daemons',
    badge: 'P-06',
    title: 'Self-Healing Daemons',
    purpose: 'Karpathy Loop: every subsystem emits metrics + auto-remediates within blast radius.',
    layer: 'validation',
    tier: 'power',
    shipsBadge: 'Ships Q1 2027',
  },
  // Premium tier (ships Q2 2027 and later)
  {
    packId: 'premium-01-board-pack',
    badge: 'PREM-01',
    title: 'Board Pack Generator',
    purpose: 'Quarterly board pack: financials + project status + risk register + asks.',
    layer: 'memory',
    tier: 'premium',
    shipsBadge: 'Ships Q2 2027',
  },
  {
    packId: 'premium-02-investor-deck',
    badge: 'PREM-02',
    title: 'Investor Deck Refresh',
    purpose: 'Refreshes a Gamma deck from your last quarter of operating metrics.',
    layer: 'voice',
    tier: 'premium',
    shipsBadge: 'Ships Q2 2027',
  },
  {
    packId: 'premium-03-recruiting-screener',
    badge: 'PREM-03',
    title: 'Recruiting Screener',
    purpose: 'Scores inbound resumes against the role bar, drafts interview rubrics.',
    layer: 'validation',
    tier: 'premium',
    shipsBadge: 'Ships Q2 2027',
  },
  {
    packId: 'premium-04-pricing-engine',
    badge: 'PREM-04',
    title: 'Pricing Engine',
    purpose: 'Per-trade burden + labor + materials + GP unit-pricing for proposal generator.',
    layer: 'sources',
    tier: 'premium',
    shipsBadge: 'Ships Q2 2027',
  },
  {
    packId: 'premium-05-compliance-radar',
    badge: 'PREM-05',
    title: 'Compliance Radar',
    purpose: 'Sweeps Notion compliance DB for expiring COIs, licenses, and bonds.',
    layer: 'validation',
    tier: 'premium',
    shipsBadge: 'Ships Q2 2027',
  },
  {
    packId: 'premium-06-bd-pipeline',
    badge: 'PREM-06',
    title: 'BD Pipeline Synthesizer',
    purpose: 'Cross-references RFPs + warm intros + capacity to surface highest-fit opportunities.',
    layer: 'sources',
    tier: 'premium',
    shipsBadge: 'Ships Q3 2027',
  },
  {
    packId: 'premium-07-margin-watch',
    badge: 'PREM-07',
    title: 'Margin Watch',
    purpose: 'Flags projects drifting from estimated GP based on weekly cost-to-date deltas.',
    layer: 'validation',
    tier: 'premium',
    shipsBadge: 'Ships Q3 2027',
  },
  {
    packId: 'premium-08-client-pulse',
    badge: 'PREM-08',
    title: 'Client Pulse',
    purpose: 'Per-client relationship score from email sentiment + payment lag + escalation count.',
    layer: 'memory',
    tier: 'premium',
    shipsBadge: 'Ships Q3 2027',
  },
  {
    packId: 'premium-09-safety-log',
    badge: 'PREM-09',
    title: 'Safety Log Synthesis',
    purpose: 'Ingests daily safety reports, surfaces leading indicators by site and crew.',
    layer: 'sources',
    tier: 'premium',
    shipsBadge: 'Ships Q4 2027',
  },
  {
    packId: 'premium-10-subcontractor-scorecard',
    badge: 'PREM-10',
    title: 'Subcontractor Scorecard',
    purpose: 'Quality + schedule + safety + AR aging per sub, surfaced for the next bid review.',
    layer: 'sources',
    tier: 'premium',
    shipsBadge: 'Ships Q4 2027',
  },
  {
    packId: 'premium-11-executive-briefing',
    badge: 'PREM-11',
    title: 'Executive Briefing',
    purpose: 'Five-line state-of-the-empire brief: revenue, pipeline, risk, decisions, asks.',
    layer: 'voice',
    tier: 'premium',
    shipsBadge: 'Ships Q4 2027',
  },
]

export const LOCKED_PACKS_BY_TIER: Record<string, LockedPack[]> = LOCKED_PACKS.reduce(
  (acc, p) => {
    if (!acc[p.tier]) acc[p.tier] = []
    acc[p.tier].push(p)
    return acc
  },
  {} as Record<string, LockedPack[]>,
)

export const LOCKED_COUNT_BY_TIER: Record<string, number> = Object.fromEntries(
  Object.entries(LOCKED_PACKS_BY_TIER).map(([tier, packs]) => [tier, packs.length]),
)
