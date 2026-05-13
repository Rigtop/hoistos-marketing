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
