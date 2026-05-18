/**
 * Install instructions per surface. PackInstallFlow.tsx step 2 body
 * re-renders by reading this registry keyed by the user's Q3 first-picked
 * surface ('browser' | 'desktop' | 'code').
 *
 * Modularity floor: adding a 4th surface (e.g. 'mobile' or 'api') later
 * means adding a key here, not editing PackInstallFlow.tsx.
 *
 * Each entry carries the step-2 title, body, and the CTA label that
 * routes the user to the right destination. Round 6 v3 spec: subtitle
 * lives on the install screen header above the 3-step stepper.
 */

import type { McpRequirement } from './pain-to-pack'

export interface InstallInstruction {
  /** Top-of-screen subtitle: "Browser path. Switch your setup any time
   * from the Command Center." */
  subtitle: string
  /** Step 2 headline shown next to the bullet. */
  stepTitle: string
  /** Step 2 body paragraph under the headline. */
  stepBody: string
  /** Label for the step-2 primary CTA (only shown for browser path; the
   * other paths show a Re-copy or surface-specific hint instead). */
  ctaLabel: string
  /** URL the CTA opens in a new tab. Empty string for non-browser paths. */
  ctaUrl: string
}

export const INSTALL_INSTRUCTIONS: Record<McpRequirement, InstallInstruction> = {
  browser: {
    subtitle:
      'Browser path. Switch your setup any time from the Command Center.',
    stepTitle: 'Paste it in claude.ai/new',
    stepBody:
      'Open a new Claude chat at claude.ai/new and press Cmd-V to paste. Claude responds with what just got installed.',
    ctaLabel: 'Open claude.ai/new',
    ctaUrl: 'https://claude.ai/new',
  },
  desktop: {
    subtitle:
      'Desktop path. Open Claude Desktop and paste into a new chat. Filesystem MCP must be enabled.',
    stepTitle: 'Paste it in Claude Desktop',
    stepBody:
      'Open Claude Desktop, start a new chat, paste with Cmd-V. If Filesystem MCP is enabled (check connectors panel), Claude can write pack files locally.',
    ctaLabel: 'Open Claude Desktop',
    ctaUrl: '',
  },
  code: {
    subtitle:
      'Code CLI path. Run the install command in your terminal.',
    stepTitle: 'Run the install command',
    stepBody:
      'In your terminal, cd into your project and run: claude code install constitution-pack. The pack lands as a skill ready to invoke.',
    ctaLabel: 'Copy install command',
    ctaUrl: '',
  },
}

export function instructionFor(surface: McpRequirement): InstallInstruction {
  return INSTALL_INSTRUCTIONS[surface] || INSTALL_INSTRUCTIONS.browser
}
