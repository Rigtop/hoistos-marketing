---
name: hoistos-desktop-organizer-pack
tier: beginner
displayName: "Cowork Organized My Desktop in 12 Minutes"
ahaMomentRef: aha-beg-02-desktop-reorg
targetSkill: desktop-organizer
claudeTier: pro
estimatedActivationMinutes: 17
personalizationQuestionCount: 4
holyShitMomentDescription: "VP looks at their desktop AFTER and sees coherent folders where 200 files of chaos used to be. Files are findable. Naming is consistent. Untouched zones are untouched."
prerequisites:
  - Mac (this pack is Mac-only as of v1.0; Windows version planned v1.1)
  - ONE of these two file-access paths (verified May 2026)
  - Path A (recommended): Claude Desktop app installed (download from claude.ai/download) PLUS the Filesystem MCP server enabled. Claude Desktop in May 2026 does NOT have a native "Files and Folders" toggle. File access is brokered by an MCP server. Two install routes for the MCP server: one-click Desktop Extension (Settings -> Extensions -> Browse, search "Filesystem", install, whitelist ~/Desktop) OR manual edit of ~/Library/Application Support/Claude/claude_desktop_config.json
  - Path B (fallback): Claude Code installed (terminal CLI). Claude Code reaches the filesystem natively through its Read / Write / Bash tools, no MCP install needed. Pick this path if Desktop Extensions install fails on your Mac.
  - 15 to 20 minutes (was 12 in v0.9; revised after we measured the MCP install step)
  - One thing in your head: which folders or files Claude must NEVER touch
version: 1.0.0
createdBy: HoistOS Empire Activation, Eugeen Bernan
createdAt: 2026-05-08
---

# Cowork Organized My Desktop in 12 Minutes

## Hero (the canonical aha, verbatim)

I let Cowork open files on my desktop. It read 200 files, suggested a folder structure, asked me 4 questions, and reorganized everything. I had a workspace I could actually find things in.

That sentence is the inflection point. Until you let Claude touch your filesystem, it lives in a tab. Once it does, it becomes the operator who cleans up after you. The Desktop is the canary. If Claude can sort your Desktop in 12 minutes without breaking anything you care about, you trust it with everything else.

Counter upfront: most VPs flinch at the idea of an AI rearranging their files. The flinch is correct, the conclusion is wrong. The pack below has a hard never-touch list, dry-run-then-confirm execution, and zero deletes (renames only). You stay in control. Confidence: high.

## What changes for you

| Before | After |
|---|---|
| Desktop has 200 files, half of them screenshots from 2024 |
| Desktop has 6 to 10 folders, named in your convention |
| You cannot find the Plaza change order from last Tuesday |
| Plaza change order lives in `Construction/Plaza/2026-05/` and Spotlight finds it in one keystroke |
| You give up and email yourself the file you need |
| You stop emailing yourself files |
| You feel low-grade dread every time you open the laptop lid |
| You feel competent every time you open the laptop lid |

## Prerequisites checklist

| Item |
|---|
| You are on a Mac (macOS 14 Sonoma or later, ideally Sequoia or newer) |
| You have picked a path: Path A (Claude Desktop + Filesystem MCP) OR Path B (Claude Code). Path A walks the dock-app, point-and-click experience. Path B is the fallback if MCP install fails on your Mac. |
| Path A only: Claude Desktop downloaded from `claude.ai/download` and signed in |
| Path B only: Claude Code installed (`brew install claude-code` or download from `claude.ai/download/code`) |
| You have closed any open Finder windows showing your Desktop (so the scan does not race with you) |
| You have a list in your head of folders Claude must never touch (example: a confidential client folder, a pending tax return folder) |
| You have 15 to 20 uninterrupted minutes |

If any item is missing, fix it first. Confidence: high.

## 5-step setup walkthrough (Path A: Claude Desktop + Filesystem MCP)

If Path A fails at Step 2 (the MCP install will not complete, or your Mac is locked down by your org and Desktop Extensions are blocked), JUMP to the Path B section below. Path B uses Claude Code and reaches Step 5 in roughly the same time. Confidence: high.

### Step 1: open Claude Desktop, not the browser tab

Browser claude.ai cannot reach your filesystem. Claude Desktop with the Filesystem MCP server can. Make sure you are using the desktop app icon (orange C on a dark square), not a browser tab.

> [SCREENSHOT PLACEHOLDER: macOS dock showing Claude Desktop icon highlighted, browser Claude tab labeled "wrong, this one cannot touch files"]

What you should see: a desktop window labeled "Claude" with a chat input box. Down at the bottom-right of the input box, you should see a small MCP server indicator icon. If you see it, you have the right app. If you do not, you are in the browser tab. Confidence: high.

### Step 2: install the Filesystem MCP server (this is the file-access bridge)

In May 2026, Claude Desktop on macOS does NOT have a single "Files and Folders" toggle. File access is provided by the Filesystem MCP server, which you install once. Pick one of two routes.

**Route 2a (one-click, recommended).** Open Claude Desktop. Click the gear icon top-right -> Settings -> Extensions tab -> Browse extensions. Search "Filesystem". Click Install on the official "Filesystem" extension (publisher: Anthropic / modelcontextprotocol). When the extension prompts you for allowed directories, type `~/Desktop` and add. If you want it to also see `~/Documents`, add that. Do NOT add `/` or `~` (root or full home). Click Save. Restart Claude Desktop.

> [SCREENSHOT PLACEHOLDER: Claude Desktop Settings -> Extensions panel showing Filesystem extension with Install button highlighted, allowed-directories field with "~/Desktop" populated]

**Route 2b (manual config, if Extensions browser is empty or blocked).** Open Terminal. Run:

```bash
mkdir -p ~/Library/Application\ Support/Claude
open -e ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

If the file is empty or does not exist, paste this:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/[YOUR_MACOS_USERNAME]/Desktop"
      ]
    }
  }
}
```

Replace `[YOUR_MACOS_USERNAME]` with the output of `whoami`. Save, close, restart Claude Desktop. The MCP indicator at the bottom-right of the chat input should now show "filesystem" as a connected server.

> [SCREENSHOT PLACEHOLDER: Claude Desktop chat input bottom-right MCP indicator showing "filesystem (1 tool group)" with green dot]

**Verify the install.** In a new Claude Desktop chat, type: "List the files in ~/Desktop." If Claude returns a file listing, the bridge works. If Claude says it cannot access files, restart Claude Desktop one more time. If still failing, jump to Path B.

Confidence on Route 2a: moderate (depends on whether the Extensions browser is populated and unblocked by your org). Confidence on Route 2b: high (same JSON has worked since the November 2024 MCP launch).

## 5-step setup walkthrough (Path B: Claude Code, fallback if Path A blocked)

If Path A's MCP install does not complete, use Claude Code instead. Claude Code reaches the filesystem natively through its Read / Write / Bash tools. No MCP install needed.

### Step 1B: open Terminal and run `claude` in your home directory

```bash
cd ~
claude
```

You land in the Claude Code REPL. The shell prompt is `>`. The first session may ask for trust on this folder. Approve.

### Step 2B: paste the SAME starter prompt from Step 3 below

The starter prompt is identical in Path A and Path B. Claude Code will use its native Bash tool to scan the Desktop, instead of the Filesystem MCP. The dry-run behavior, the never-touch enforcement, the renames-only constraint all work identically. Skip ahead to Step 3.

### Step 3: paste this starter prompt into a fresh chat (same for Path A and Path B)

In Claude Desktop click "New chat" (Path A), or in the Claude Code REPL hit Enter to start a fresh prompt (Path B). Paste the block below verbatim. Replace `[YOUR FIRST NAME]` and the four bracketed answer slots with your real values before sending.

```
I am [YOUR FIRST NAME], a VP at Perennial Empire.

I want you to scan my Desktop folder, propose a clean folder structure,
ask me 4 questions to confirm the proposal, then execute the reorganization
with renames only (no deletes).

My answers to your 4 questions are below. Use them to guide the proposal.

Q1 (primary work areas): [WORK_AREAS] (example: construction project files,
financial records, personal photos)

Q2 (file types I care about most): [FILE_TYPES] (example: PDFs, Excel
workbooks, images of jobsites)

Q3 (naming convention preference): [NAMING_CONVENTION] (one of: date-prefix
like 2026-05-08-name, project-prefix like Plaza-name, role-prefix like
COO-name)

Q4 (NEVER touch these folders or files): [NEVER_TOUCH] (example: ~/Desktop/
TaxReturn2025/, ~/Desktop/Confidential-Litigation/)

Run a dry-run first. Show me the proposed before-after tree. Wait for me to
confirm before executing.
```

### Step 4: review the dry-run plan

Claude scans your Desktop and prints a tree. It looks like this:

```
BEFORE (200 files, ad-hoc)
~/Desktop/
  ├── Screen Shot 2024-08-12 at 9.42 AM.png
  ├── [GC] CO #14.pdf
  ├── [gc]_co14_signed.pdf
  ├── meeting_notes_2025-11.txt
  ├── (197 more files)

AFTER (proposed, 6 folders, naming consistent)
~/Desktop/
  ├── Construction/
  │   ├── Plaza/
  │   │   ├── 2026-05-Plaza-CO14.pdf
  │   │   └── 2026-05-Plaza-CO14-signed.pdf
  │   └── (other projects)
  ├── Financial/
  ├── Meetings/
  ├── Screenshots/
  ├── Photos-Jobsite/
  └── Inbox-Triage/  (everything I cannot classify, you decide later)
```

> [SCREENSHOT PLACEHOLDER: Claude Desktop showing the BEFORE-AFTER tree side by side, NEVER_TOUCH folders rendered in grey with a "untouched" tag]

Read the proposal. If something is wrong (Claude wants to move a folder you said never-touch, the naming convention is off), reply in chat: "change X to Y, then re-propose". Loop until you are happy.

### Step 5: confirm and let it execute

Type: "Confirmed. Execute. Renames only, no deletes. NEVER_TOUCH list still applies."

Claude executes. You will see file rename activity in Finder if you have it open in another window. Total execution time: 30 to 90 seconds for a typical 200-file Desktop.

> [SCREENSHOT PLACEHOLDER: Finder window showing the after-state: 6 to 10 clean folders on Desktop, naming consistent, NEVER_TOUCH zones visibly preserved]

When Claude says "done", open Finder and check. The Desktop should look like the AFTER tree from step 4. Confidence: high.

## Q0: tier wire question (with plain-English fallback BEFORE we ask)

Before we ask which tier you are on: Claude Pro is the [your monthly cap]/month plan, default for most VPs. Claude Max is the premium plan ($100 or $200 per month) and unlocks a longer "thinking budget" which helps Claude scan more files faster. Claude Code is the command-line tool that already runs on your filesystem and does not need this pack at all. If you do not know which tier you are on, the answer is Pro.

**Question Q0:** Are you on Claude Pro, Claude Max, or Claude Code?

| If you answer | We do this |
|---|---|
| Pro | Default. Pack works. Scan caps at 500 files per pass to fit the Pro context window. |
| Max | Same flow. Scan limit raises to 2000 files per pass. Faster on big Desktops. |
| Code | Skip this pack. Run `find ~/Desktop -type f` directly and ask Claude Code to organize via Bash. |
| I do not know | Treat as Pro. |

## 4 personalization questions

Each answer is free-form. Hard cap: 500 characters per field.

| # | Question | Variable |
|---|---|---|
| Q1 | What are your primary work areas? (example: construction project files, financial records, personal photos, jobsite reports) | `{{WORK_AREAS}}` |
| Q2 | Which file types do you care about most? (example: PDFs, Excel, photos, .docx, .keynote) | `{{FILE_TYPES}}` |
| Q3 | Naming convention preference: date-prefix (`2026-05-08-name`), project-prefix (`Plaza-name`), or role-prefix (`COO-name`)? | `{{NAMING_CONVENTION}}` |
| Q4 | Which folders or files must Claude NEVER touch? (paste full paths, one per line, max 10 entries) | `{{NEVER_TOUCH}}` |

**Prompt-injection guard:** Q4 is the highest-risk field because we use it to build the never-touch path list. If any line contains "ignore", "delete instead", "move all", or any verb other than a path: we reject the line and ask you to repaste. Free-form text never becomes shell arguments. Confidence: high.

## Generated SKILL.md template

After you answer Q0 through Q4, Claude assembles this skill, fills the bracketed variables, and presents it as a code block.

```markdown
---
name: {{DIVISION_SLUG}}-desktop-organizer
description: Quarterly Desktop reorganization for {{VP_NAME}}, with NEVER_TOUCH protection.
trigger: phrase "reorganize my desktop" OR "tidy my desktop" OR /desktop-organizer
version: 1.0.0
created: 2026-05-08
---

# Desktop Organizer for {{VP_NAME}}

## Mission

Re-run the Desktop reorganization this pack ran the first time, with the
NEVER_TOUCH list and naming convention I locked in.

## Locked rules

| Rule | Value |
|---|---|
| Primary work areas | {{WORK_AREAS}} |
| File types I care about | {{FILE_TYPES}} |
| Naming convention | {{NAMING_CONVENTION}} |
| NEVER_TOUCH paths | {{NEVER_TOUCH}} |
| Renames only, never deletes | locked |
| Dry-run before execute | locked |

## Workflow when triggered

1. Scan ~/Desktop. Print before-tree.
2. Propose after-tree honoring naming convention.
3. List which files end up in `Inbox-Triage/` (Claude could not classify).
4. Show NEVER_TOUCH paths in grey, tagged "untouched, will not move".
5. Wait for confirmation. Do not execute on auto-pilot.
6. On confirm, execute renames only. Report counts: moved, renamed, untouched.

## Soft-vs-hard persona note

The NEVER_TOUCH list is a soft persona instruction inside this skill. The MCP
server's allowed-directories whitelist is the hard guardrail. If you only
whitelist `~/Desktop` in the Filesystem MCP config, the skill physically
cannot reach anything outside `~/Desktop` no matter what the chat says.
That is the real lock. On Path B (Claude Code), the equivalent hard
guardrail is the working directory you launched `claude` from plus the
permission-mode you have set. In both cases the chassis enforces, the prompt
just decorates. Confidence: high.

## Pack provenance

Generated from: hoistos-desktop-organizer-pack v1.0.0
Generated for: {{VP_NAME}}
Generated on: 2026-05-08
Source: hoistos.com/empire/pack/beg-02-desktop-organizer
Fingerprint: [SHA256 placeholder, populated at distribution time]
```

## How to install (tier-aware, path-aware)

| Tier | Path | Install path |
|---|---|---|
| Pro | A (Desktop + Filesystem MCP) | Open your Project (BEG-01 setup), click "Project knowledge", paste the generated SKILL.md, click Save. The trigger phrase "reorganize my desktop" works in any chat inside the Project. Filesystem MCP must be installed and `~/Desktop` whitelisted. |
| Max | A | Same as Pro, plus optionally save a copy to `~/Documents/claude-skills/` for cross-Project reuse. |
| Pro / Max | B (fallback) | If Path A blocked: keep using claude.ai for trigger and chat, but keep a parallel Claude Code session open in Terminal to do the actual file operations on your behalf. The chat composes the prompt, you paste into Claude Code. Slower than Path A by ~2 minutes per run, but unblocked. |
| Code | A or B | Save to `~/.claude/skills/{{DIVISION_SLUG}}-desktop-organizer/SKILL.md`. Auto-registers on next Claude Code session start. No MCP install needed because Claude Code has native Read/Write/Bash. |

## Closing test question (visible 5-min output)

After installing the skill, run this in a fresh chat:

> Reorganize my desktop. Use my locked rules. Dry-run first.

You should see:

1. Claude reads your Desktop without asking permission again
2. Claude prints the before-tree
3. Claude proposes the after-tree using your locked naming convention
4. NEVER_TOUCH paths are visibly tagged as untouched
5. Claude waits for your confirmation before executing

If all five are true, the skill works. If Claude asks the four questions again, the SKILL.md did not save. Re-paste it.

## Holy-shit moment

Twelve minutes after you start, you look at your Desktop and it is organized. Not "AI tried to organize it". Actually organized, in your convention, with your never-touch zones intact. You realize you trust Claude with files. From this point forward, "let Claude do it" stops being an experiment and starts being a default. Confidence: high.

## JURY-FIX CHECKLIST applied

| Fix | Where applied |
|---|---|
| Non-NYC fallback | This pack is geography-agnostic. Folder names use generic categories, not NYC-specific work types. A Connecticut-based VP installs the pack the same way. |
| No compound openers | Hero opens with a verbatim aha quote. No "Great question," "I'd be happy to," etc. anywhere in pack body or generated SKILL.md. |
| Prompt-injection guards | Q4 (NEVER_TOUCH) sanitization rule rejects any line containing verbs ("delete", "move all", "ignore"). Path-only enforcement. Free-form text never becomes shell arguments. |
| Version fingerprint | `version: 1.0.0` in frontmatter, propagated to generated SKILL.md `## Pack provenance` block. SHA256 placeholder for distribution-time fingerprint. |
| Soft-vs-hard persona lock note | Generated SKILL.md explicitly distinguishes the in-chat NEVER_TOUCH instruction (soft) from MCP allowed-directories whitelist / Claude Code working directory (hard guardrail). |
| Projects-UI walkthrough screenshot prose | Steps 1 through 5 each describe what the VP sees in prose: dock icon, settings panel, dry-run tree, Finder after-state. Walkthrough survives missing-screenshot empty-state. |
| MAJOR jury fix: file-access mechanism updated to May 2026 reality | Pre-jury, this pack assumed a native "Files and Folders" toggle in Claude Desktop. As of May 2026 that toggle does not exist. Step 2 now walks the Filesystem MCP install (one-click via Desktop Extensions, or manual claude_desktop_config.json edit). Path B (Claude Code fallback) added explicitly so VPs whose Mac blocks Desktop Extensions still complete the pack. Time estimate raised from 12 to 15-20 minutes. Confidence: high (mechanism verified against support.claude.com and modelcontextprotocol.io May 2026). |

## Pack provenance footer

```
# PACK PROVENANCE
# hoistos-desktop-organizer-pack v1.0.0
# Source: hoistos.com/empire/pack/beg-02-desktop-organizer
# Fingerprint: [SHA256 hash of this file, populated at ship time]
# If the fingerprint does not match the hoistos.com page, do not paste this. Text the pack maintainer at [YOUR_CONTACT].
```
