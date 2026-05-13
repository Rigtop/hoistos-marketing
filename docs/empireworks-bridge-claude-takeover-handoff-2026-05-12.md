# EmpireWorks Bridge Claude Takeover Handoff

Date: 2026-05-12
Owner request: Eugeen wants Claude Code to audit this later, extract what is useful, and kill what regressed.
Repo: `/Users/eugeenbernan/Desktop/Outputs/AI Authority/HoistOS/hoistos-marketing`
Bridge repo: `/Users/eugeenbernan/Desktop/Outputs/AI Authority/HoistOS/empireworks-bridge`
Primary route: `/empireworksreconstruction`
Local preview: `http://127.0.0.1:4173/empireworksreconstruction`

## Why This Handoff Exists

Eugeen reviewed the latest onboarding pass and felt the UX may have regressed. The page got more explicit, but it may have become heavier, less elegant, and less convincing. Claude Code should treat this as an audit and recovery sprint, not as a continuation of the current direction.

The next owner should inspect what was built, decide what is useful, and remove what is not.

## Product Intent To Preserve

The product sell is:

> Eugeen created a way for a user to barely do anything, with almost no thinking involved, and get a supercharged, infrastructure-ready Claude that is more useful for business now and can compound over time.

The onboarding should feel like:

1. One download.
2. One Claude Desktop install approval.
3. One Project setup prompt.
4. One Project Instructions activation paste.
5. One verification prompt.

The website should help people understand what they are downloading and why it matters. It should not make the install feel like a long documentation task.

## Current Product Truth

EmpireWorks Bridge is the installer.

The Bridge exposes `setup_foundation`, which installs the 11 Foundation packs in one pass, writes the router, and returns the activation line.

Users should not install Foundation pack by pack.

Foundation pages should be previews and reference material only.

Claude browser can preview pages, but it cannot run the local Bridge.

Claude Desktop is the real install surface for the Bridge.

Claude Projects matter because Project Instructions are what make future chats in that Project call the router automatically.

Claude Code and filesystem connectors still matter for deeper local work: file reads, file writes, hooks, daemons, routing enforcement, and CLI workflows.

## What Changed In This Workstream

Marketing repo changes:

- `src/empire/EmpireLanding.tsx`
- `src/components/EmpireTimeline-d.tsx`
- `src/empire/EmpirePackDetail.tsx`
- `src/empire/EmpireBonusExtras.tsx`
- `src/empire/EmpirePostInstall.tsx`
- `src/empire/cards/MapCard.tsx`
- `src/empire/cards/PackCard.tsx`
- `README.md`
- `public/downloads/empireworks-bridge-1.0.2.mcpb`
- `docs/empireworks-bridge-onboarding-audit-2026-05-12.md`
- `docs/empireworks-bridge-claude-takeover-handoff-2026-05-12.md`

Bridge repo changes from the same workstream:

- Added `server/tools/setup-foundation.js`
- Registered `setup_foundation` in `server/index.js`
- Bumped Bridge to `v1.0.2`
- Added `setup_foundation` to `manifest.json`
- Updated Bridge README and build script copy
- Updated install tool output language from older Custom Instructions wording to Project Instructions

## What The Current Page Now Does

Landing headline:

```
Supercharge Claude.
Compounding productivity.
Very easy install.
```

Hero subhead:

```
Claude stops opening cold. The Bridge gives Claude Desktop a local operating layer with the rules, memory, source checks, validation, routing, and upgrade packs it needs to become more useful for your business over time.
```

The hero has a 6-card "what you get" grid:

- Rules
- Memory
- Routing
- Source checks
- Validation
- 33 packs

The guided setup section has 6 steps:

1. Download Bridge for Claude Desktop.
2. Double-click it and click Install.
3. Create or open a Claude Project.
4. Paste one setup prompt.
5. Paste the activation line into Project Instructions.
6. Run the check.

The Foundation page is now preview-only. It no longer shows Foundation pack install buttons.

Legacy `/pack/:packId` deep links now say the pack is included in Bridge setup and link back to guided setup.

Bonus Extras still has install-like flows and likely needs a separate audit. Some Bonus packs are advanced and may require Claude Code, daemons, hooks, or connector setup.

## Regression Concerns To Audit

The current implementation may be too instructional and not persuasive enough.

The mock screenshots may feel fake, heavy, or less premium than real screenshots.

The setup section may still feel like too many steps for a "barely do anything" product.

The hero phrase may not be final. It is better than the prior wall text, but it may still not carry the product promise cleanly.

The page now explains more, but it may have lost the smooth SaaS onboarding feel.

The Foundation page may still be confusing because it remains a full pack catalog even though nobody should install packs one by one.

The Bonus Extras page may be functionally inconsistent with the Bridge-first model.

The Project Instructions requirement may be unavoidable, but the page needs to make it feel like a single final activation switch, not an annoying extra manual configuration step.

## Strong Recommendation For Claude Code

Do not keep polishing the current layout by inertia.

Audit from first principles:

1. What must the user do?
2. What can the Bridge automate?
3. What can the website hide until needed?
4. What can be collapsed into a single "after download" checklist?
5. What needs a real screenshot instead of a mock?
6. What should be removed entirely?

Claude Code should produce one of these outcomes:

1. Keep the current structure and polish it.
2. Collapse the page into a simpler SaaS onboarding flow.
3. Revert parts of the prior visual treatment and only keep the Bridge-first logic.
4. Split the page into "Download" and "What You Get" tabs or sections.
5. Hide or demote Foundation and Bonus previews until after setup.

## UX Copy Options To Reconsider

Current:

```
Supercharge Claude.
Compounding productivity.
Very easy install.
```

Alternatives:

1. `Supercharge Claude. Infrastructure-ready in minutes.`
2. `Supercharge Claude. Less setup. More compounding.`
3. `Supercharge Claude. No setup maze. Just working AI.`
4. `Supercharge Claude. Your operating layer. Installed once.`
5. `Claude, upgraded for real work. Installed once. Useful every day.`
6. `A business-ready Claude setup. One guided install.`
7. `Install the operating layer Claude should have shipped with.`

Audit for novice clarity, premium feel, and whether the phrase earns the orange emphasis.

## Critical Product Questions

Can the Project Instructions activation line be shortened without reducing reliability?

Can `setup_foundation` return a copy-ready activation line plus a human-readable "where to paste it" instruction?

Should Bridge add a dedicated `verify_setup` tool?

Should Bridge add a `project_activation_instructions` tool?

Can the `.mcpb` installer open a post-install instruction page or include clearer built-in instructions?

Can Claude Desktop extension metadata itself explain the exact next step better?

Should Foundation pack pages be hidden behind "See what got installed" instead of being a main CTA?

Should Bonus Extras be hidden until Foundation setup is verified?

Should the site include real Claude Desktop screenshots instead of CSS mock screenshots?

## What To Kill Or Reduce If It Feels Heavy

Consider killing:

- The 6-card "what you get" grid if it feels like generic SaaS blocks.
- The CSS mock screenshot panels if they read fake.
- The separate Foundation preview CTA above the fold.
- The old story/timeline framing if it competes with the installer.
- Any Bonus Extras install CTA until the beginner Bridge path is proven.

Consider reducing:

- Six setup steps into three grouped steps:
  1. Install Bridge.
  2. Run setup in a Claude Project.
  3. Paste activation line and verify.
- Long prompt blocks into expandable copy fields.
- Project Instructions explanation into a visual "final switch" moment.

Consider preserving:

- Bridge-first install logic.
- No pack-by-pack Foundation install.
- Claude Desktop required for real local install.
- Browser preview-only warning.
- Project Instructions as the persistence mechanism.
- Verification prompt.

## Verification Already Run

Bridge:

- `npm run build` passed in the Bridge repo.
- MCPB manifest validation passed.
- `setup_foundation` smoke test installed all 11 Foundation packs into a temp install directory and returned router-ready.
- Built bundle: `empireworks-bridge-1.0.2.mcpb`.

Marketing:

- `npm run build` passed.
- Focused ESLint passed for touched files:
  - `src/empire/EmpireLanding.tsx`
  - `src/components/EmpireTimeline-d.tsx`
  - `src/empire/EmpireBonusExtras.tsx`
  - `src/empire/EmpirePostInstall.tsx`
  - `src/empire/EmpirePackDetail.tsx`
- Full repo lint is still blocked by unrelated pre-existing lint debt.
- Playwright checked:
  - `/empireworksreconstruction`
  - `/empireworksreconstruction/foundation`
  - `/empireworksreconstruction/pack/foundation-01-constitution`
  - widths `390` and `1440`
- Checked routes had no legacy Claude Project wording.
- Checked routes had no legacy direct-pack activation copy.
- Checked Foundation route had no Foundation pack install buttons.
- Layout scroll width matched viewport width. Landing page overflow reports were decorative background elements only.

Known issue:

- Local preview reports a minor 404 resource request, likely favicon or static asset. It did not affect onboarding content.

## Current Git State Warning

The marketing repo is dirty beyond this specific workstream. Do not assume every modified file came from this pass.

Directly touched in this pass:

- `src/empire/EmpireLanding.tsx`
- `src/components/EmpireTimeline-d.tsx`
- `src/empire/EmpireBonusExtras.tsx`
- `src/empire/EmpirePostInstall.tsx`
- `src/empire/EmpirePackDetail.tsx`
- `docs/empireworks-bridge-onboarding-audit-2026-05-12.md`
- `docs/empireworks-bridge-claude-takeover-handoff-2026-05-12.md`

Directly touched earlier in the same workstream:

- `src/empire/cards/MapCard.tsx`
- `src/empire/cards/PackCard.tsx`
- `README.md`
- `public/downloads/empireworks-bridge-1.0.2.mcpb`

Other modified files existed in the working tree and should be inspected before reverting or committing.

## Suggested Code Projects Row

Name:
`Audit and simplify EmpireWorks Bridge onboarding UX`

Status:
`Spec'd`

Priority:
`🟡 P2`

Project Area:
`HoistOS`

Sprint:
`Backlog`

Effort Hours:
`4`

Phase:
`Single`

Owner Platform:
`Claude`

Risk Tier:
`T1 release-critical`

Handoff Required:
`yes`

Claude Inspect Required:
`yes`

Acceptance Criteria:

- Audit current `/empireworksreconstruction` onboarding against novice-user install clarity.
- Decide what to extract, what to rewrite, and what to remove.
- Produce a simplified install flow that preserves Bridge-first setup.
- Confirm Foundation pages are preview/reference only.
- Confirm Bonus Extras either align with Bridge-first model or are clearly marked advanced.
- Verify desktop and mobile at `390px` and `1440px`.
- Run `npm run build`.
- Run focused lint on touched files.

Context for Code:

- Start with this handoff file.
- Compare against `docs/empireworks-bridge-onboarding-audit-2026-05-12.md`.
- Inspect `src/empire/EmpireLanding.tsx`, `src/components/EmpireTimeline-d.tsx`, `src/empire/EmpireBonusExtras.tsx`, `src/empire/EmpirePackDetail.tsx`, and Bridge `setup_foundation`.

Autonomous Trigger:

`n/a (one-off): product UX audit and simplification sprint requires human product judgment.`

## Claude Takeover Instruction

Claude Code should not assume the latest state is correct. Treat it as a draft with potentially useful components. Preserve the Bridge-first product logic, but be willing to delete most of the current onboarding presentation if it is not the clearest path for a novice user.

