# EmpireWorks Bridge Onboarding Audit Brief

Date: 2026-05-12
Repo: `/Users/eugeenbernan/Desktop/Outputs/AI Authority/HoistOS/hoistos-marketing`
Primary route: `/empireworksreconstruction`
Bridge repo: `/Users/eugeenbernan/Desktop/Outputs/AI Authority/HoistOS/empireworks-bridge`

## Audit Goal

Audit whether a novice user can install EmpireWorks Bridge with minimal thinking:

1. Download one `.mcpb` file.
2. Install or update the Claude Desktop extension.
3. Create or open a Claude Project.
4. Paste one setup prompt.
5. Paste one Project Instructions activation line.
6. Run one verification prompt.

The page should not imply users install Foundation packs one by one.

## Current Product Model

EmpireWorks Bridge is the installer. It exposes `setup_foundation`, which installs the 11 Foundation packs in one pass, writes the router, and returns the activation line.

Foundation pack pages are now preview/reference surfaces. They explain what each pack adds after setup. They should not present themselves as primary install actions.

Legacy `/pack/:packId` deep links now render as reference pages with a "Start guided setup" CTA. They should not copy bootstrap prompts as the primary path.

Bonus Extras may still have separate install paths because those are deeper blueprints and some require Claude Code, daemons, hooks, or connector setup. Audit whether that page needs the same Bridge-first reframing before public use.

## Interface Truth

The Foundation files do not magically transfer to every Claude surface.

Claude Desktop:
Can use the Bridge tools after the `.mcpb` extension is installed and enabled. This is the real install path.

Claude Projects:
Project Instructions are per Project. The activation line makes new chats inside that Project call the router first. If a user creates another Project, they need the same activation line there too.

Claude browser:
Can preview pack pages. It cannot run the local Bridge extension or reach local files through the Bridge.

Claude Code:
Can use the installed files if its local runtime has access to the install directory and its instructions tell it to read them. Code-specific hooks, filesystem routing, daemons, and CLI workflows still need Code-side setup.

Filesystem work:
Bridge installs and reads packs. It is not a universal filesystem editor for every user business file. File reads, writes, moves, hooks, and daemons require local tool approval, Claude Code, or a filesystem connector depending on the task.

## Files Changed In This Pass

Marketing repo:

- `src/empire/EmpireLanding.tsx`
- `src/components/EmpireTimeline-d.tsx`
- `src/empire/EmpirePackDetail.tsx`
- `src/empire/EmpireBonusExtras.tsx`
- `src/empire/EmpirePostInstall.tsx`
- `docs/empireworks-bridge-onboarding-audit-2026-05-12.md`

Earlier Bridge implementation from the same workstream:

- `server/tools/setup-foundation.js`
- `server/index.js`
- `manifest.json`
- `package.json`
- `package-lock.json`
- `README.md`
- `MASTER_PLAN.md`
- `scripts/build-mcpb.sh`
- Bridge tool copy in `server/tools/*`

## Current Landing UX

Implemented headline:

```
Supercharge Claude.
Compounding productivity.
Very easy install.
```

Other headline candidates to test:

1. `Supercharge Claude. Business-ready intelligence. Easy install.`
2. `Supercharge Claude. Infrastructure-ready in minutes.`
3. `Supercharge Claude. Less setup. More compounding.`
4. `Supercharge Claude. Your operating layer. Installed once.`
5. `Supercharge Claude. No setup maze. Just working AI.`

Hero subhead is now value-first, not a wall of instructions. The instruction flow lives below as one detailed sequence.

The "what you get" cards now carry the payload:

- Rules
- Memory
- Routing
- Source checks
- Validation
- 33 packs

## Current Guided Setup

Step 1:
Download Bridge for Claude Desktop. Button is centered.

Step 2:
Double-click and install or update the Claude Desktop extension. Includes an in-page mock of the extension screen and a short explanation of what is installed now versus after approval.

Step 3:
Create or open a Claude Project. Copy now says Claude Project and emphasizes starting setup inside the Project, not a loose chat.

Step 4:
Paste the setup prompt and allow `setup_foundation`.

Step 5:
Paste the activation line into Project Instructions. The page explains that this is per Project and must be repeated for any additional Project.

Step 6:
Run the check prompt. This confirms Bridge, Foundation, manifest, and router readiness.

## Audit Checks For Tomorrow

1. Confirm no user-facing copy uses the old Claude Project wording.
2. Confirm public copy consistently says Claude, Claude Desktop, Claude browser, Claude Code, or Claude Project.
3. Confirm the Foundation page has no pack-by-pack install CTA for the 11 Foundation packs.
4. Confirm the first orange download button is centered on desktop and mobile.
5. Confirm the copy buttons are compact and do not dominate the setup cards.
6. Confirm mobile text does not overflow any button, code block, card, or mock screenshot.
7. Confirm the Bridge download path points to `empireworks-bridge-1.0.2.mcpb`.
8. Confirm `.mcpb` response headers are still attachment-friendly in production.
9. Confirm the page clearly says Claude Desktop is required for real install.
10. Confirm the page clearly says Claude browser is preview only.
11. Confirm Project Instructions copy matches the current Claude Desktop UI.
12. Decide whether Bonus Extras should be hidden, renamed, or reframed until those flows are also Bridge-aware.

## Open Product Questions

1. Should `setup_foundation` automatically return a shorter activation line, or should the current line stay explicit for reliability?
2. Should the Bridge expose a `verify_setup` tool so the test prompt can call one tool instead of asking Claude to infer the checks?
3. Should the Bridge expose a `project_activation_instructions` tool that returns UI-specific Project Instructions steps?
4. Should the Foundation page become a pure "What got installed" reference and remove all timing estimates?
5. Should Bonus Extras move behind a "Requires advanced setup" gate until the beginner path is proven?

## Verification Already Run

- Bridge build passed.
- MCPB manifest validation passed.
- `setup_foundation` smoke test installed all 11 Foundation packs and returned router-ready.
- Marketing build passed after the latest copy polish.
- Focused ESLint passed on touched marketing files after the latest copy polish.
- Full repo lint had unrelated pre-existing failures.
- Playwright checked `/empireworksreconstruction`, `/empireworksreconstruction/foundation`, and `/empireworksreconstruction/pack/foundation-01-constitution` at `390px` and `1440px`.
- Playwright found no legacy Claude Project wording on those routes.
- Playwright found no legacy direct-pack activation copy on those routes.
- Playwright found no Foundation-page pack install buttons on those routes.
- Layout scroll width matched viewport width on the checked content. Remaining overflow reports were decorative background elements on the landing page.

Remaining note: the local preview reports a 404 resource request, likely an icon or minor static asset. It did not affect the checked onboarding content.

## 2026-05-15 Reversal

The 2026-05-12 audit pushed the Bridge to the front of the install surface as the universal install path. Three days later that bet failed on the first non-internal user. The reversal moves the Bridge to an optional Desktop convenience lane and makes the intake-driven customware journey the primary path. The points below capture what changed, why, and what we learned, in the voice this codebase uses everywhere else.

### What broke

A construction VP installed Claude Desktop on Windows and the `.mcpb` Bridge would not open. The download landed, the file was on disk, the Desktop app was present, and the double-click did nothing. The same `.mcpb` had been verified on Mac in internal testing the week before. The audit treated Bridge-first as a finished decision based on Mac-only smoke tests and a single internal Windows pass that ran a different `.mcpb` build. The product surface depended on a single fragile pathway, with no fallback the VP could reach inside the browser tab he already had open.

### Reversal: what changed in the codebase

a) Windows VP install failed today on `.mcpb`. The Bridge did not open on his machine. Cause is still under investigation (drag-into-Settings-then-Extensions may recover in some Desktop versions). Failure surfaced live, not in QA. Internal Mac verification did not generalize.

b) The reversal moves the Bridge to an optional Desktop-convenience lane. The Bridge `setup_foundation` tool, the `.mcpb` download, and the six-step install panel all stay in the codebase, functional, and still recommended for users who already have Claude Desktop and want the 11 Foundations wired in one pass. The Bridge is no longer the primary path; it is a shortcut for users whose surface already supports it.

c) The primary install path is now the intake-driven customware journey. Flow:
   - The 4-question intake modal (`src/empire/Intake.tsx`) captures name, division, industry/trade, outcome ranking, and the surfaces the user has. Stored in localStorage under `hoistos.intake.v1` via `src/lib/intake-state.ts`.
   - The customware engine (`src/lib/customware.ts`) reads intake state and per-pack mini-form answers, substitutes `{{TOKEN}}` placeholders inside pack markdown, strips install rows that do not match the user's surface, and writes the personalized pack body to the clipboard at click time.
   - The activate function (`src/lib/activate.ts`) routes clipboard-paste to `https://claude.ai/new` (or the Claude desktop deep link if the user has opted in), markets the slug as activated, drives the JourneyTracker.
   - The Foundation gallery (`src/empire/EmpireFoundationGrid.tsx`) and the per-pack route (`src/empire/EmpirePackDetail.tsx`) expose the install action per pack with the customware mini-form.

d) The Foundation cards now have install actions per surface. Each card reads the user's intake `surfaces` array and surfaces the correct install action: clipboard paste for browser, paste + `claude://` deep link for Desktop, save-SKILL.md for Code. The Bridge stays as a per-card secondary action on Foundation packs ("Bulk install all 11 Foundations via Bridge, Claude Desktop required, one click") only when the user has checked Desktop in intake Q4.

e) Lessons captured per R047 voice rules (counter-led, no apology for disagreement, accuracy is the metric):
   - Internal smoke tests on one OS do not validate a multi-OS install surface. The 2026-05-12 audit shipped Bridge-first based on Mac-only verification. Counter-position should have surfaced before merge: "what happens when this VP is on Windows" is a one-line question that would have caught the gap.
   - A single fragile pathway with no in-browser fallback is a load-bearing single point of failure. The reversal eliminates that by making clipboard paste (works on every surface) the primary path and treating the Bridge as a Desktop bulk-install shortcut.
   - "Preview only" on the Foundation page was wrong. The Foundation page should install. The reversal flips the CTA to install pack by pack and removes the "preview only" microcopy that channeled users into the Bridge they could not run.
   - The capability axis is SURFACE (browser vs Desktop vs Code), not TIER (Pro vs Max pricing). The intake collects surfaces with multi-select checkboxes. Pro on Desktop has the same MCP reach as Max on Desktop. Pro on browser has the same limits as Max on browser. Forcing tier on the install surface was a layer-of-abstraction mistake.
   - Decision fatigue is the enemy. The reversal hides the full 43-pack catalog behind the intake gate and shows three next-best packs at a time inside the gallery. The customware-of-the-customware is the JourneyTracker, which visualizes what Claude knows after each install.
   - Code CLI introduction follows a 3-signal logic (surface mix, pack count, outcomes). The page does not push Code CLI before pack 8; under that count the compounding case is too thin to justify a 60-minute one-time setup. The "Unlock the asterisks" panel surfaces at 18+ packs with 2+ asterisks installed, framed around what the user has already built up, not as a sales pitch.

### What did not change

The Bridge codebase under `empireworks-bridge/` stays intact. `setup_foundation` still installs the 11 Foundations in one pass. The `.mcpb` download still resolves to `/downloads/empireworks-bridge-1.0.3.mcpb` (current build). The six-step install panel inside `EmpireLanding.tsx` still renders, with new framing copy and reduced visual prominence (border softened, headline rewritten, eyebrow says "Optional Desktop convenience for bulk install"). For Desktop users who hit the Bridge install panel, the experience is the same flow the audit shipped on 2026-05-12; for everyone else, the Foundation gallery is now the front door.

### Files touched in the reversal

- `src/lib/activate.ts`: imports `readIntake()` directly from `intake-state.ts` (canonical key `hoistos.intake.v1`), replacing the stub.
- `src/empire/EmpireLanding.tsx`: adds `useIntakeGate` hook, renders the Intake modal as a gate above the hero when intake is incomplete, mounts JourneyTracker as a right-side sidebar on lg+ and as a top panel on mobile, reframes the Bridge install panel from primary install path to optional Desktop convenience, adds an "Edit your setup" pill below the AuthorByline.
- `docs/empireworks-bridge-onboarding-audit-2026-05-12.md`: this addendum.

### Verification

TypeScript compiles clean (`npx tsc --noEmit -p tsconfig.app.json` returns zero errors). Vite production build still bundles cleanly. Mobile-first render is preserved via `useIsMobile` branches on the new layout. The Intake modal renders single-column at 320px per Hard Rule #35 / R067.
