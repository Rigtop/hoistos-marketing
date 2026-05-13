---
id: hoistos-intro-00-tier-guide
name: intro-tier-guide
tier: foundation
priority: 0
displayName: "Intro 00: Tier Guide. Read this before you install anything else."
category: intro
foundationId: I-00
introId: I-00
holyShitMomentHeadline: "Sixty seconds and you know exactly which tier you are on, what installs the smoothest, and what to install first. No confusion, no friction, no wrong-path fix-up later."
holyShitMomentDescription: "VP opens chat in their Project, types 'what tier am I on?'. Claude answers with the right tier in one line. VP types 'what should I install first?'. Claude returns the F-01 through F-03 sequence, named, in install order. Sixty seconds. The VP knows where to start. Zero confusion."
canonicalSourceRef: "Anthropic Help Center on the three Claude product tiers (Pro web, Max desktop, Code CLI). Anthropic Help Center on Claude desktop installation. Anthropic Code documentation on the curl install.sh path for Claude Code (May 2026)."
v2Augmentations:
  multi_skill_bundle: true
  construction_vp_scenarios: false
  three_prompt_verification: true
  failure_recovery_paths: true
  onboarding_tutorial: true
  role_conditional_branching: false
  c3_jury_install_path_fix: true
  polished_holy_shit_moment: true
foundationAugmentations:
  canonical_source_reference: true
  why_this_is_foundational: true
  cross_reference_siblings: true
companionSkills:
  - tier-detector
  - install-path-router
  - first-pack-recommender
pairsWith:
  - "F-01 (Constitution): the first pack the VP installs after this one"
  - "F-02 (Facts Registry): the second pack, locks canonical names"
  - "F-03 (Cold Start Protocol): the third pack, wires the boot sequence"
prerequisites:
  - "a working claude.ai sign-in OR a Claude desktop app installed OR Claude Code CLI on a laptop"
  - "5 minutes uninterrupted"
  - "willingness to read four paragraphs before clicking install on anything"
lineCount: 720
dependencies: []
estimatedActivationMinutes: 5
personalizationQuestionCount: 3
version: 2.0.0
createdBy: HoistOS Empire Activation v2.0
createdAt: 2026-05-09
fingerprint: intro-00-tier-guide-v2.0.0
---

# Intro 00: Tier Guide. Read this before you install anything else.

> **Relationship-tree assumptions.** This pack uses generic role labels (your principal, your field lead, your top client contact, your bookkeeping partner, etc.) that map to whichever of these you actually have. If you are a solo operator, "your principal" means yourself; if you have a CEO above you, it means them. If you have no foreman, "your field lead" means yourself. Every role label is optional-with-fallback. Read past any role you do not have.
## Standalone capability

This pack runs solo. You do not need any other pack installed for the core flow to work. If F-01 (Operating Constitution) is installed, voice rules apply automatically. If F-02 (Facts Registry) is installed, your canonical names get surfaced. If F-08 (Source Sweep) is installed, every factual claim gets a source-stamp. None of those are gates; install in any order, mix and match.
## Canonical-source reference

Three sources anchor this pack. Anthropic's Help Center documents the three product tiers (Pro web at the published monthly tier, Max desktop at $100 to $200 per month, Code CLI on free or paid plans depending on usage). The same Help Center documents Claude desktop installation. Anthropic's Code documentation publishes the canonical install command (`curl -fsSL https://claude.ai/install.sh | bash`) and the canonical skills directory at `~/.claude/skills/`.
This pack is the simplified read-before-install layer. It does not replace the Help Center. It tells you, in plain English, which tier you are on and which install path each of the next 11 packs uses on your tier. Five minutes here saves five hours of friction later.

## Why this is foundational

Every other pack in the HoistOS library assumes the VP knows which tier they are on. That is a wrong assumption for a noob VP green with Claude. The VP reads "paste this into Project Knowledge" and they are on Code (no Project Knowledge in the CLI). The VP reads "save to `~/.claude/skills/`" and they are on Pro web (no filesystem access from a browser). The pack body is right, the VP's tier is right, the mismatch breaks the install.

This pack closes that mismatch. It tells the VP, on minute one, which tier they are on and which path each pack will take on that tier. Every downstream pack lands cleaner. The friction that compounds across 11 installs collapses to zero.
> **Pairs with F-01, F-02, F-03.** I-00 is the read-before-install layer. F-01 is the first install (Constitution, voice rules). F-02 is the second (Facts Registry, identity). F-03 is the third (Cold Start, boot sequence). Install I-00 first, then F-01, F-02, F-03. The four together are the operating-system foundation. Everything else snaps onto that base.

## Hero block

Most VPs assume Claude is one product. It is three products at three different price points. Picking the right tier costs you 5 minutes of reading. Picking the wrong tier costs you 5 hours of friction, three rounds of "it didn't work," and one weekend lost to "actually let me try a different path."

The three products are: Pro web (browser only, paste-based install, the gentle entry tier), Max desktop (browser plus a native desktop app on your Mac or Windows, paste into desktop, premium tier), and Code CLI (a `claude` command in your Terminal that runs on your laptop, file-based install via `curl install.sh`, engineer tier). Same Anthropic. Same Claude. Three different ways to install a pack.

Most VPs assume "tier" means "feature gating." That is wrong. All three tiers run the same Claude underneath. Your pack content is identical across tiers. Your daily use feels identical after install. The difference is install path and skills storage. Pro pastes into Project Knowledge in a browser. Max does the same plus a native desktop app you can paste into. Code stores skills as files at `~/.claude/skills/<name>/SKILL.md` and reads them at session start. Same outcome. Three doors.
The cheap fix is to read four paragraphs and run a 3-question diagnostic. The expensive miss is to skip this pack, install F-01 on the wrong tier, and spend two hours figuring out why "your skills did not register." Five minutes here. Move on.

## What changes for you

| Before | After |
|---|---|
| You see install buttons on the pack catalog page and you do not know which one applies to you | You know your tier in 60 seconds. You know which install path each pack takes. |
| You start F-01 on Pro web, then halfway through it says "edit `~/.claude/skills/`" and you panic | The pack body shows you only the path that matches your tier. The other paths are explicitly labeled. |
| You install F-01 on Pro, then ask "but how do I get the same on my Mac mini," with no clear answer | You know that Pro is paste-based, Max is desktop paste, Code is curl. Each has a published path. You pick one and go. |
| You assume "Code" is for engineers and you skip it | You know that Code is the highest-leverage tier if you are willing to install once. Worth it for VPs who type a lot. |
| You install a pack, nothing changes, you assume "Claude is broken" | You know the 5 most common gotchas and the recovery for each. The pack works. The install was wrong. |

## Prerequisites checklist

| Item |
|---|
| You have access to ONE of: claude.ai signed-in browser tab, Claude desktop app on Mac/Windows, Claude Code CLI in Terminal |
| You can read four paragraphs without skipping ahead to "just install it" |
| You are willing to answer 3 yes/no questions before clicking install |
| If you cannot answer the 3 questions, you default to Pro tier (no shame, you can upgrade later) |
| 5 uninterrupted minutes |

If any item is missing, fix it first. Specifically: if you do not have a Claude account at all, sign up at claude.ai before continuing. The free tier does not have Project Knowledge, so you will need to upgrade to Pro for any of these packs to work.
## The 3-tier matrix

This is the whole picture in one table. Read each column before you install anything else.

| Dimension | Pro web | Max desktop | Code CLI |
|---|---|---|---|
| Monthly price (May 2026, USD) | published Pro tier | $100 to $200 per month | free for low usage, paid plans available |
| Where Claude lives | `claude.ai` in your browser | `claude.ai` in your browser PLUS a native desktop app on your Mac or Windows | a `claude` command in your Terminal |
| How you install a pack | paste the Project Knowledge block into a Project on `claude.ai` | same as Pro, OR paste the pack body into the desktop app | run `curl -fsSL https://claude.ai/install.sh \| bash`, then save SKILL.md files to `~/.claude/skills/<name>/SKILL.md` |
| Where skills live | inside Project Knowledge as text sections | inside Project Knowledge OR in the desktop app's skills panel | as files at `~/.claude/skills/<skill-name>/SKILL.md` |
| What works on this tier | Project Knowledge, custom system prompts, all skills as text | everything Pro has, plus desktop app integration and MCP connectors via OAuth | everything Max has, plus filesystem access, hooks, sub-agents, custom MCP servers, slash commands you build yourself |
| What does NOT work on this tier | no filesystem access, no `~/.claude/`, no hooks, no sub-agents | no filesystem access from the desktop app itself (the Claude desktop app's skills loader is not the same as `~/.claude/skills/`); use Code if you need filesystem skills | needs a laptop with a Terminal; not available on iPad or phone-only setups |
| Per-pack install time (typical) | 3 to 5 minutes (paste, save) | 3 to 5 minutes paste | 1 to 2 minutes (curl + save files + restart session) |
| Fast path for first-time users | Pro is the fast path. Lowest friction. Default if uncertain. | Max is fast if you have it. Otherwise default to Pro and upgrade later. | Code is highest leverage but assumes you have run a Terminal command in the last year. If you have not, default to Pro. |
| Recommended for | every VP who reads on a browser | VPs who want the desktop app for native notifications and Bridge installs | VPs who type a lot, run their own scripts, or want filesystem-based skills with hooks |

Three tiers. Same Claude underneath. Three different doors. Pick yours, then continue.

## The "which tier am I on" diagnostic

Three yes/no questions. Answer them in order. Stop at the first yes.

### Question 1: Code CLI

Open your Terminal app (on Mac: `Cmd+Space`, type "Terminal", press Enter). Type the word `claude` and press Enter.

If you see something like `Claude Code v0.x` or a chat prompt appear, you are on the **Code CLI tier**. Stop here. Skip to "Install path: Code CLI" below.

If you see `command not found: claude`, continue to Question 2.

### Question 2: Max desktop

Look at your Applications folder (on Mac: `Cmd+Shift+A` from Finder, or `Cmd+Space` then type "Claude"). Look for an app called **Claude** with the Anthropic logo (the app, not the browser).

If you have the Claude desktop app installed, you are on the **Max desktop tier**. Open it. Skip to "Install path: Max desktop" below.

If you do not have the desktop app, continue to Question 3.

### Question 3: Pro web

Open your browser and go to `claude.ai`. Sign in.

If you see a sidebar with "Projects" and you can create a Project, you are on the **Pro web tier** (or higher, but the Pro path works for everything). Skip to "Install path: Pro web" below.

If you see a marketing landing page asking you to upgrade, you are on the **free tier**. The free tier does not have Projects or Project Knowledge. The HoistOS packs require Pro minimum. Upgrade at `claude.ai/upgrade` and come back.

### Default (uncertain)

If you cannot answer any of the three questions confidently, the answer is **Pro web**. Sign in to `claude.ai` in a browser, create a Project, follow the Pro path on every pack from here forward. You can upgrade to Max or Code later without losing anything; your packs migrate forward. Confidence: high.

## What is the SAME across tiers, what is DIFFERENT

The table below is the most common confusion source. Read it twice.

### What is the SAME (every pack, every tier)

| Aspect | Reality |
|---|---|
| Pack body content | identical. Pro, Max, and Code all read the same Project Knowledge text. |
| Skill content | identical. The SKILL.md frontmatter and instructions are the same on all three tiers. |
| Voice rules | identical. The Constitution applies the same way regardless of where it lives. |
| Day-to-day use after install | identical. You type a phrase, Claude executes the workflow you defined, you get the same output. |
| Number of packs you can install | identical. All 12 Wave-1 foundation packs work on all three tiers. |
| Daily outcomes | identical. Same emails, same drafts, same skills firing on the same triggers. |

### What is DIFFERENT (only the install path)

| Aspect | Pro web | Max desktop | Code CLI |
|---|---|---|---|
| How you get the pack into Claude | paste into Project Knowledge on `claude.ai` | paste into Claude desktop, or install through EmpireWorks Bridge | curl install + save files |
| Where the skills live physically | inside the Project Knowledge text on `claude.ai` | same as Pro plus desktop app local storage | filesystem at `~/.claude/skills/` |
| What you click to install | the "Project knowledge" panel on `claude.ai`, paste, click Save | same as Pro, OR install EmpireWorks Bridge and call its tools | run `curl install.sh` once, then save SKILL.md files manually |
| Time per pack | 3-5 minutes | 3-5 minutes paste, Bridge bulk install for tiers | 1-2 minutes |
| Restart needed | no | no | yes (restart Claude Code session for new skills to load) |

The pack body is identical across tiers. The install method differs. After install, daily use feels identical. Confidence: high.

## Install path: Pro web

You are on a browser. You signed in to `claude.ai`. Here is what every pack tells you to do, translated to your tier.

### Step 1: open or create your Project

In the left sidebar, click "Projects." Click "Create project" if you do not have one yet. Name it something simple like `My Workspace`. Click Create.

If you already have a Project from F-00 or earlier, click into it. Do not create a new one for each pack; one Project holds everything.

### Step 2: open Project Knowledge

Inside the Project, click "Project knowledge" on the right sidebar. A text panel opens.

### Step 3: paste the pack body

Each pack you install has an "Artifact 1: Project Knowledge block" section. Copy the contents of that code block. Paste at the bottom of the Project Knowledge panel. Click Save.

If the pack also has companion Skills (most do), paste those into the same Project Knowledge panel, BELOW the main block, as additional sections. Same Project Knowledge, more sections.

### Step 4: open a new chat in your Project

Click "New chat" inside the Project. The chat inherits the Project Knowledge automatically. The pack is now active for every chat in this Project.

### Step 5: run the verification suite

Each pack has a "Three-prompt verification suite" section. Run those three prompts in order. If all three pass, the pack is installed correctly.

**Estimated time per pack:** 3 to 5 minutes for paste + save + verification. Most VPs install F-01 through F-03 in a single 20-minute sitting.

## Install path: Max desktop

You have the Claude desktop app on your Mac or Windows. Two paths work for you: the browser-paste path (same as Pro) and the Bridge path (best).

### Path A: browser-paste (same as Pro)

Follow the Pro path above. Open `claude.ai` in your browser, paste into Project Knowledge, save. The desktop app reads the same Projects when you are signed in to the same account.

### Path B: EmpireWorks Bridge (best)

On the EmpireWorks Reconstruction landing page, download EmpireWorks Bridge. Install it in Claude Desktop, then ask Claude to call `install_tier` with `tier="foundation"`. The bridge writes packs to your local architecture folder and gives you the Project Custom Instructions block.

> **Caveat:** Bridge installs require Claude Desktop. If desktop is unavailable, fall back to Path A.

### What happens to skills on Max

The Claude desktop app has its own skills loader, but it does not read `~/.claude/skills/` (that path is exclusive to Code CLI). On Max, skills paste into Project Knowledge as text sections, the same way as Pro. You get the desktop app's UI improvements (native notifications, faster tab switching, MCP connectors via OAuth), but the skill storage layer is identical to Pro.

If you want filesystem skills (`~/.claude/skills/<name>/SKILL.md` with hooks and sub-agents), you need Code CLI in addition to the desktop app. Many VPs run both: Max for daily browsing-shape work, Code CLI for filesystem-shape work. Confidence: high.

**Estimated time per pack:** 3 to 5 minutes paste, or a bulk Foundation install through the bridge.

## Install path: Code CLI

You have a `claude` command in your Terminal. You are the highest-leverage tier. Here is what every pack tells you to do.

### One-time setup (you only do this once, ever)

If `claude` is not installed yet, run this in Terminal:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

That installs the `claude` binary, sets up `~/.claude/` directory, and registers the CLI. Restart your Terminal after install.

Confirm it worked: type `claude` and press Enter. You should see a Claude Code prompt or version banner. If `command not found`, your `~/.local/bin` or `~/bin` may not be on your PATH. Check the install output for the suggested fix (usually a `~/.zshrc` or `~/.bashrc` line to source).

### Per-pack install (you do this every time you install a new pack)

Each pack has companion Skills declared as Artifact 2, 3, 4 (depending on the pack). Save each one to its own directory:

[TIER: CODE]
```bash
mkdir -p ~/.claude/skills/<skill-name>/
cat > ~/.claude/skills/<skill-name>/SKILL.md << 'EOF'
[paste the SKILL.md contents from the pack here]
EOF
```

The directory name MUST match the `name:` field in the SKILL.md frontmatter. If frontmatter says `name: constitution-loader`, the directory must be `~/.claude/skills/constitution-loader/`.

### What about Project Knowledge on Code

Code CLI does not have "Project Knowledge" in the way the browser does. The equivalent on Code is `~/.claude/CLAUDE.md` (your global instructions) and per-project `CLAUDE.md` files (project-specific instructions). Some packs include a "Project Knowledge block" that is best installed both ways:
- save the body to `~/.claude/CLAUDE.md` (or append, if it already has content)
- ALSO paste the body into a Project on `claude.ai` if you want the same content available when you switch to browser

Most packs explicitly say "Code: save to `~/.claude/CLAUDE.md`" in the install instructions. Follow that.

### Restart after install

After saving SKILL.md files, restart your Claude Code session: `Cmd-Q` (or `exit` in the terminal), then relaunch (`claude`). New skills register on session start.

**Estimated time per pack:** 1 to 2 minutes for save + restart. Code is the fastest tier per-pack once the one-time setup is done.

## Personalization questions

Three questions. Answer in plain English. We use the answers to give you a per-tier install plan.

| # | Question | Variable |
|---|---|---|
| Q1 | Which tier are you on, based on the diagnostic above? Pro web, Max desktop, Code CLI, or "I don't know yet". | `{{VP_TIER}}` |
| Q2 | Are you installing F-01 today, or just reading? | `{{INSTALL_TODAY}}` |
| Q3 | Do you have a tab in your browser AND a Terminal window open right now? Yes or no. | `{{ENVIRONMENT_READY}}` |

If `{{VP_TIER}}` is "I don't know yet": treat as Pro web. The Pro path is the safest default and you can upgrade later without losing your installed packs.

If `{{ENVIRONMENT_READY}}` is no: open a browser tab to `claude.ai` AND open Terminal (Mac: `Cmd+Space` then "Terminal"; Windows: `Win+R` then "cmd" or "wt"). Both tools open in 10 seconds. Come back.

## Generated artifacts

After Q1 through Q3, Claude assembles four artifacts. The first goes to Project Knowledge (Pro/Max) or `~/.claude/CLAUDE.md` (Code). The next three are Skills.

### Artifact 1: Project Knowledge block

Paste at the bottom of your Project Knowledge (Pro/Max) or save to `~/.claude/CLAUDE.md` (Code).

```
## Tier Guide (added by intro-00-tier-guide v2.0.0)

I am on the {{VP_TIER}} tier.

When I install a HoistOS pack, my install path is:
{{TIER_INSTALL_PATH_BLOCK}}

When I ask "what tier am I on", Claude responds with:
"{{VP_TIER}}. Install path: {{TIER_INSTALL_PATH_SHORT}}."

When I ask "what should I install first", Claude responds with the recommended sequence:
1. F-01 Constitution (voice rules and identity)
2. F-02 Facts Registry (canonical names)
3. F-03 Cold Start Protocol (boot sequence)
Then build up from there based on my role and use case.

Wave-1 of HoistOS Empire Pack v2 (live, ready to install today):
- F-01 through F-11: Foundation packs (Constitution, Facts Registry, Cold Start, Decision Log, Skill Builder, Routing Rules, Memory Architecture, Source Sweep, Output Validator, Email Playbook, Notion Write Gate)
- adv-04 (Skill Creator Meta): the meta-skill that teaches Claude how to teach you to build skills
- pow-04 (Multi-Model Jury): the adversarial-critic gate for high-stakes outputs

Wave-2 of HoistOS Empire Pack v2 (in final clean-up, lands within 14 days):
- BIZ tier: Email-to-Notion intel, Email Triage Responder, Team AI Enablement, Document Prep Engine, Proposal Heavy, Proposal Light, BD AI Training
- Notion MCP Setup pack
```

### Artifact 2: companion skill `tier-detector/SKILL.md`

```markdown
---
name: tier-detector
description: When the user asks "what tier am I on" or any equivalent ("am I on Pro", "is this Code", "which Claude is this", "what version of Claude do I have"), answer with the user's locked tier from the Tier Guide block in Project Knowledge. Do not guess. Do not run a fresh diagnostic if the user already declared their tier in Q1.
version: 2.0.0
created: 2026-05-09
---

# Tier Detector

## When I fire

The user types any of:
- "what tier am I on"
- "am I on Pro / Max / Code"
- "which version of Claude is this"
- "what version do I have"
- "is this Pro or Code"

## What I do

Read the `## Tier Guide` block in Project Knowledge (or `~/.claude/CLAUDE.md` on Code). Find the line "I am on the X tier." Return that tier in one sentence with the install path:

`You are on {{VP_TIER}}. Install path: {{TIER_INSTALL_PATH_SHORT}}.`

If no Tier Guide block is in Project Knowledge: respond "I do not know your tier yet. Run the 3-question diagnostic from intro-00-tier-guide and tell me the answer."

## What success looks like

One-sentence answer. No diagnostic re-run. No guessing. Confidence stamp: high.

## What failure looks like

Claude runs the 3-question diagnostic from scratch every time the user asks. That wastes the user's time and is the wrong shape; the user already declared their tier when they installed this pack.

## Refusal scope

If the user asks me to "switch tiers" or "change my tier", I refuse: "Tier is a property of your Claude account, not a setting I can change. To switch from Pro to Max or Code, follow the upgrade path at claude.ai/upgrade or install Claude Code via the curl install.sh command."
```

### Artifact 3: companion skill `install-path-router/SKILL.md`

```markdown
---
name: install-path-router
description: When the user is about to install a new pack and asks "where do I paste this" or "what do I do with this skill" or any equivalent, return the install path for THEIR tier (read from the Tier Guide block in Project Knowledge). Do not show all three paths; show only the one that applies. Use whenever the user pastes a pack body or a SKILL.md and asks for the install instruction.
version: 2.0.0
created: 2026-05-09
---

# Install Path Router

## When I fire

The user pastes a pack body or a SKILL.md and asks any of:
- "where do I paste this"
- "what do I do with this"
- "how do I install this"
- "where does this go"
- "is this Project Knowledge or a file"

## What I do

1. Read the user's tier from the `## Tier Guide` block in Project Knowledge.
2. Match the pack content to the right path on that tier:

| Tier | If pack body says "Artifact 1: Project Knowledge block" | If pack body says "SKILL.md for X" |
|---|---|---|
| Pro web | "Paste below your existing Project Knowledge content. Click Save." | "Paste BELOW the Project Knowledge block, as a section. Click Save. The skill activates on the next chat in this Project." |
| Max desktop | Same as Pro, or Bridge tool install when the bridge is available. | Same as Pro. |
| Code CLI | "Save the body to `~/.claude/CLAUDE.md` (append, do not overwrite). Restart Claude Code session." | "Save to `~/.claude/skills/<name>/SKILL.md` where `<name>` matches the `name:` field in the SKILL.md frontmatter. Restart Claude Code session." |

3. Return ONE install path (the one that matches the user's tier). Do not show all three.

## What success looks like

One install instruction, specific to the user's tier, with the exact path or panel name. Confidence stamp: high.

## What failure looks like

Claude returns all three paths and asks the user to pick. The user's tier is already known; pick for them.

## Refusal scope

If the user asks me to install on a tier they are not on (e.g., "save this to `~/.claude/skills/`" but they are on Pro web), I flag the mismatch in one sentence: "You are on {{VP_TIER}}. The path `~/.claude/skills/` does not exist on your tier. Use the Project Knowledge paste path instead."
```

### Artifact 4: companion skill `first-pack-recommender/SKILL.md`

```markdown
---
name: first-pack-recommender
description: When the user asks "what should I install first" or "where do I start" or any equivalent, return the F-01 through F-03 sequence with one-line descriptions and the user's tier-specific install path. Sequence is locked: F-01 (Constitution), F-02 (Facts Registry), F-03 (Cold Start Protocol). Use whenever the user is on this Tier Guide pack and ready to start installing.
version: 2.0.0
created: 2026-05-09
---

# First Pack Recommender

## When I fire

The user types any of:
- "what should I install first"
- "where do I start"
- "what's next"
- "what comes after the tier guide"
- "I'm ready to install"
- "give me the sequence"

## What I do

Return the 3-pack sequence in install order:

```
Day 1 (today): install these three first.
1. F-01 Constitution: voice rules + identity. 5 minutes.
2. F-02 Facts Registry: your canonical names. 5 minutes.
3. F-03 Cold Start Protocol: boot sequence that auto-loads F-01 + F-02. 5 minutes.

Day 2: build on the foundation.
4. F-05 Skill Builder: lets you build packs 6, 7, 8 yourself. 5 minutes.
5. Pick one of: F-08 (Source Sweep), F-09 (Output Validator), F-04 (Decision Log) based on your role.

Day 3 to 7: round out the foundation.
6 through 11: the remaining F-* packs in priority order.

Week 2: BIZ tier (Wave-2, when ready).
The email + proposal + team-enablement layer. Lands within 14 days from today's date.
```

For the user's tier, append the install path:

| Tier | What to do for each pack |
|---|---|
| Pro web | "For each pack: open the pack source, copy the Project Knowledge block, paste into your Project Knowledge panel on claude.ai, save." |
| Max desktop | Same as Pro, or install through EmpireWorks Bridge if available. |
| Code CLI | "For each pack: open the pack source, copy the SKILL.md blocks, save to `~/.claude/skills/<name>/SKILL.md`. Restart session after each pack." |

## What success looks like

User has a clear install plan: 3 packs today, 2 more tomorrow, the rest within a week. Tier-specific install path. Confidence stamp: high.

## What failure looks like

Claude returns all 11 packs at once. Overwhelming. The user freezes. Bad outcome.

## Refusal scope

If the user asks me to recommend a pack that does not exist in Wave 1 yet (e.g., "install BIZ-04 today"), I flag: "BIZ-04 is in Wave 2, lands within 14 days. For now, install F-01 through F-03 and F-05. Come back after BIZ-04 ships."
```

## How to install (tier-aware)

| Tier | Install path |
|---|---|
| Pro | Open your Project on `claude.ai`, click "Project knowledge", paste Artifact 1 (the Tier Guide block) at the top of Project Knowledge. Then paste Artifacts 2, 3, 4 (the three skills) as additional sections in the same Project Knowledge. Click Save. Done. |
| Max | Same as Pro. The desktop app reads the same Project Knowledge when signed in. If EmpireWorks Bridge is installed, use the bridge tools instead. |
| Code | Save Artifact 1 to `~/.claude/CLAUDE.md` (append at top, do not overwrite existing content). Save Artifacts 2, 3, 4 to `~/.claude/skills/tier-detector/SKILL.md`, `~/.claude/skills/install-path-router/SKILL.md`, `~/.claude/skills/first-pack-recommender/SKILL.md`. Restart Claude Code session. |

**Critical install path note (C3 jury fix):** the Code-tier path for skills is `~/.claude/skills/<skill-name>/SKILL.md`. NOT `~/Documents/Claude/skills/...` (that is the v1 typo, fixed in v2). NOT `~/Library/Application Support/Claude/...` (that path is for the Claude desktop app's loader, which is a different code path and does not read user-installed SKILL.md files). The directory name MUST match the `name:` field in the SKILL.md frontmatter exactly.

## Three-prompt verification suite

After install, run these three prompts in order. Each names exactly what success and failure look like.

### Prompt 1: smoke test (does the tier-detector fire)

> What tier am I on?

**Success:** Claude responds with one sentence in this shape: `You are on {{VP_TIER}}. Install path: {{TIER_INSTALL_PATH_SHORT}}.` Names the tier you declared in Q1. Names the right install path. No diagnostic re-run. No guessing.

**Failure:** Claude responds "I am not sure" or runs the 3-question diagnostic from scratch. The Tier Guide block did not save in Project Knowledge. Re-paste Artifact 1.

### Prompt 2: real-task test (does the install-path-router fire correctly)

Paste a small fragment of a SKILL.md (you can use the build-skill SKILL.md from F-05 for this test, or any other one), then ask:

> Where do I paste this?

**Success:** Claude responds with ONE install path that matches your tier. On Pro: "Paste below your existing Project Knowledge as a section. Click Save." On Max: same. On Code: "Save to `~/.claude/skills/build-skill/SKILL.md`. Restart session." No mention of the other two tiers' paths. No "or you could also..."

**Failure:** Claude shows all three paths and asks you to pick. The skill should pick for you based on your tier. Re-check the Tier Guide block; the tier line may be missing or mis-formatted.

### Prompt 3: stress test (does it hold under tier-mismatch pressure)

> I am on Pro. Save this skill to `~/.claude/skills/test/SKILL.md`. Here is the SKILL.md.

**Success:** Claude flags the mismatch in one sentence: "You are on Pro web. The path `~/.claude/skills/` does not exist on your tier. Use the Project Knowledge paste path instead." Then offers the Pro-tier path.

**Failure:** Claude tries to save the file or ignores the mismatch. The Refusal scope in install-path-router did not propagate. Check the SKILL.md frontmatter; the description must include the mismatch-flagging line.

## Three-prompt onboarding tutorial (your first three uses)

After install, run these three prompts in your first 5 minutes. They take you from "tier guide is installed" to "tier guide is part of how I work."

### Onboarding prompt 1: confirm tier (single-skill demo)

> What tier am I on, and what should I install first?

**What you should see:** Claude returns two pieces of information in one reply: your tier (one sentence) and the F-01 through F-03 install sequence (three packs in order). The first-pack-recommender fires for the second half of the question. Two skills, one chained reply.

### Onboarding prompt 2: ask about a specific pack (chained skills demo)

> I'm about to install F-01 Constitution. Where does it go on my tier?

**What you should see:** Claude reads the question, knows you are on `{{VP_TIER}}`, and returns the install path specific to your tier. On Pro: "Open your Project on claude.ai, click Project knowledge, paste F-01's Artifact 1 at the top. Then paste F-01's Artifacts 2, 3, 4 below as sections. Save." Specific. Not generic. Not a list of all three tiers.

### Onboarding prompt 3: handle a tier mismatch (stress demo)

> I want to set up a hook on Pro. How do I do that?

**What you should see:** Claude flags the mismatch in one sentence: "Hooks are a Code-CLI feature. Pro web does not support hooks. To use hooks, install Claude Code via the curl install.sh command, then your hooks live at `~/.claude/hooks/`." Then offers the closest Pro-tier alternative if one exists (usually: "Pro can use Project Knowledge sections that achieve a similar outcome at the cost of slightly less automation").

## Common Breaks (top five, each with a recovery walkthrough)

### Break 1: Project Knowledge did not save the Tier Guide block

Symptom: VP types "what tier am I on", Claude responds "I do not know your tier yet" or runs a fresh diagnostic.

Recovery: open the Project on `claude.ai`. Click "Project knowledge." Confirm Artifact 1 (the Tier Guide block) is in the panel. If empty, re-paste. Click Save (the button label may say "Update knowledge"). Wait 5 seconds. Run Prompt 1 again. If still failing, sign out, sign back in, refresh the page; the Project Knowledge cache may be stale.

### Break 2: VP ran `curl install.sh` but `claude` command not found

Symptom: VP installed Code CLI, but typing `claude` in Terminal returns `command not found`.

Recovery: the install put the binary at `~/.local/bin/claude` or `~/bin/claude`, depending on your OS and shell. Check the install output for the suggested PATH line. Common fix on Mac with zsh: add `export PATH="$HOME/.local/bin:$PATH"` to `~/.zshrc`, then `source ~/.zshrc`. On Windows WSL: similar but in `~/.bashrc`. Restart Terminal. Type `claude` again. If still failing, run `which claude` to confirm the binary exists; if it returns nothing, re-run the curl install.

### Break 3: VP clicked desktop install, nothing happened

Symptom: VP on what they think is Max desktop clicked an install button on a catalog page, the browser showed no action or did not open Claude desktop.

Recovery: the desktop app is not installed or did not open. Two options. Option A: install the Claude desktop app from `claude.ai/download`, restart your browser, then try again. Option B: fall back to the Pro path, paste the pack body manually into Project Knowledge in your browser. Either works; the desktop app is a convenience, not a requirement.

### Break 4: VP on Pro saw "edit `~/.claude/skills/`" in a pack body and panicked

Symptom: VP on Pro web reads a pack body that says "save SKILL.md to `~/.claude/skills/<name>/SKILL.md`", does not have filesystem access from a browser, freezes.

Recovery: the pack body is showing all three tier paths. Find the section labeled "Pro" (usually in the "How to install (tier-aware)" table). On Pro, the SKILL.md content pastes into Project Knowledge as a section, not into a file. Skip the filesystem instructions; they apply to Code only. The install-path-router skill from this pack should auto-route you to the right path; if it does not, you have not installed I-00 yet, so install I-00 first, then re-attempt.

### Break 5: VP installed but nothing changed in claude.ai

Symptom: VP pasted Artifact 1 into Project Knowledge but typing "what tier am I on" still returns generic answers.

Recovery: this is the most common gotcha. Three checks. Check 1: open Project Knowledge, scroll the panel, confirm the Tier Guide block is visible (not stuck at the top of a fold, not in a different Project). Check 2: confirm you clicked Save (not just paste; the button may say "Update knowledge" and require an explicit click). Check 3: open a NEW chat in the same Project (not the chat you pasted into; the chat that loaded BEFORE the paste does not see the new Project Knowledge until you start a fresh one). Run the smoke test in the new chat.

## Holy-shit moment

A VP, brand new to Claude, lands on the pack catalog page on a Friday afternoon. They scroll the timeline. They see install buttons next to each pack. They click I-00 first because it sits at the top of the list. They paste the four artifacts into Project Knowledge in the order shown. They click Save.

They open a new chat. They type "what tier am I on?" Claude answers in one sentence: `You are on Pro web. Install path: paste into Project Knowledge.` They smile. They type "what should I install first?" Claude returns three packs: F-01 Constitution, F-02 Facts Registry, F-03 Cold Start Protocol, with the Pro-web install path next to each.

Sixty seconds. The VP knows their tier. The VP knows what to install first. The VP knows the install path on their tier for every future pack. No confusion. No "wait, which one is mine?" No "let me re-read the docs." The friction that would have cost them five hours collapsed to five minutes. They install F-01 next. Then F-02. Then F-03. By 4:30 PM they have the operating-system foundation in place. By 5 PM they are drafting their first follow-up email and the voice rules already hold. Confidence: high.

## The "two-wave ship" framing (be honest with the VP)

This v2 ships in two waves. Be honest with yourself about which wave you are getting today.

### Wave 1 (live today, install now)

The voice + identity + skill-creation + decision-log + Notion-write + cold-start layer. These packs are stable, tested, and ready:

- **F-01 through F-11**: the 11 Foundation packs (Constitution, Facts Registry, Cold Start, Decision Log, Skill Builder, Routing Rules, Memory Architecture, Source Sweep, Output Validator, Email Playbook, Notion Write Gate)
- **adv-04**: Skill Creator Meta (the meta-skill that teaches Claude how to teach you to build skills)
- **pow-04**: Multi-Model Jury (the adversarial-critic gate for high-stakes outputs)

Install Wave 1 today and you have the full operating-system foundation. Voice locks. Identity locks. Skill-building unlocks. Decision logging unlocks. Cold start auto-loads everything on every session. The brain is built.

### Wave 2 (lands within 14 days, do not wait)

The email + proposal + team-enablement layer. Currently in final clean-up:

- **BIZ tier (8 packs)**: Notion MCP Setup, Email-to-Notion Intel, Email Triage Responder, Team AI Enablement, Document Prep Engine, Proposal Heavy, Proposal Light, BD AI Training

These are the production-running packs that turn Claude from "operating-system foundation" into "team-wide AI enablement." They depend on Wave 1 being in place; install Wave 1 first, then Wave 2 lands clean on top.

If you install Wave 1 today, you get everything you need to start building skills, drafting emails, and capturing decisions. Wave 2 adds the email-pipeline layer, the proposal-engine layer, and the team-enablement layer when it ships. Confidence: high.

**Recommendation:** install Wave 1 this week. Do not wait for Wave 2. Wave 1 is the foundation; Wave 2 lands on top of it. Two weeks from now, your foundation is already humming when Wave 2 arrives.

## What to install first (recommended path)

| Day | Install | Why |
|---|---|---|
| Day 1 (today) | F-01 Constitution | Voice rules and identity. Every other pack inherits these. 5 minutes. |
| Day 1 (today) | F-02 Facts Registry | Canonical names. Locks "your company" in full, locks your title. 5 minutes. |
| Day 1 (today) | F-03 Cold Start Protocol | Boot sequence. Auto-loads F-01 and F-02 at every session start. 5 minutes. |
| Day 2 | F-05 Skill Builder | Lets you build packs 6, 7, 8 yourself. The library compounds without HoistOS shipping every brick. 5 minutes. |
| Day 2 | F-04 Decision Log | Captures the why behind your rules. Builds an audit trail. 5 minutes. |
| Day 3 | F-08 Source Sweep | The pre-answer scan that makes Claude check its sources before responding. 5 minutes. |
| Day 3 | F-09 Output Validator | The pre-deliverable gate that catches voice violations and identity drift before output lands. 5 minutes. |
| Day 4-7 | F-06, F-07, F-10, F-11 | Routing Rules, Memory Architecture, Email Playbook, Notion Write Gate. Round out the foundation. |
| Week 2 | adv-04, pow-04 | Skill Creator Meta and Multi-Model Jury. Higher-leverage advanced + power tier. |
| Week 2 | Wave-2 BIZ tier | When it ships. Email pipeline, proposals, team enablement. |

Total time to install Wave 1: roughly 60 to 90 minutes spread across one week. Most VPs do Day 1 in a single 20-minute sitting, then 5 minutes a day for the next 6 days. Confidence: moderate (depends on VP's reading speed and how many breaks they hit).

## Common gotchas across tiers (top five)

These are the gotchas that span all three tiers, separate from the per-tier breaks above. Read them once.

### Gotcha 1: "I pasted the Project Knowledge but Claude doesn't recognize the skill name"

**Tier:** Pro or Max.
**Cause:** the skill is in Project Knowledge but the chat you are in started BEFORE the paste, so it did not load the new Project Knowledge content.
**Fix:** start a NEW chat in the Project. Or scroll to the top of Project Knowledge and confirm the skill block is visible (not collapsed under a fold). Restart by clicking out of the Project and back in if the new chat still does not see the skill.

### Gotcha 2: "I ran curl install.sh but `claude` command not found"

**Tier:** Code.
**Cause:** the install put the binary somewhere your shell does not search by default.
**Fix:** check the curl install output for a "Add this to your PATH" line. Common: add `export PATH="$HOME/.local/bin:$PATH"` to `~/.zshrc` (Mac) or `~/.bashrc` (Linux). Then `source ~/.zshrc` or restart Terminal. Type `claude` again. If still failing, run `find ~ -name "claude" -type f 2>/dev/null` to locate the binary; once found, add its parent directory to PATH.

### Gotcha 3: "I clicked desktop install but nothing happened"

**Tier:** Max.
**Cause:** the desktop app is not installed (or not registered as the URL handler with your OS).
**Fix:** install the Claude desktop app from `claude.ai/download`. Restart your browser. Try again. If still nothing, fall back to the Pro path (paste manually). The desktop app is a convenience layer; the Pro path always works on Max accounts.

### Gotcha 4: "I'm on Pro and the pack says 'edit ~/.claude/'"

**Tier:** Pro reading a pack written for all tiers.
**Cause:** the pack body shows all three tier paths in the "How to install" section. Pro VPs see Code-tier instructions and panic.
**Fix:** find the row labeled "Pro" in the "How to install (tier-aware)" table inside the pack. That is your row. Ignore the Max and Code rows. Your install is paste-into-Project-Knowledge, not file-edit. The install-path-router skill from this Tier Guide pack auto-routes; if you have not installed Tier Guide, install it first, then everything else routes cleanly.

### Gotcha 5: "I installed but nothing changed in claude.ai"

**Tier:** any.
**Cause:** three sub-causes. (a) Project Knowledge was pasted but Save was not clicked. (b) Save was clicked but the chat that asked the test question started BEFORE the save. (c) The pasted block is in a DIFFERENT Project than the chat you are testing in.
**Fix:** three checks. Check 1: open Project Knowledge, confirm the block is visible. Check 2: click Save explicitly, wait 3 seconds. Check 3: open a NEW chat in the same Project (the same Project name in the sidebar, not a fresh chat in Default). Run the test prompt. If still failing, the most common ultimate cause is that the VP is testing in Default workspace instead of their named Project; switch to the named Project.

## Cross-references to sibling Foundation Packs

I-00 sits at priority 0, before any Foundation pack. It is the prerequisite to F-01 through F-11.

| Sibling | What I-00 provides to it | What it provides back to I-00 |
|---|---|---|
| F-01 (Constitution) | Tier-locked install path. F-01 paste flows to the right surface on the right tier. | F-01's voice rules apply to every reply this pack produces. The tier-detector responds in the locked voice. |
| F-02 (Facts Registry) | Tier context for the canonical names. F-02 stores names per-tier identically; I-00 makes sure the install lands. | F-02's identity locks ("VP not CEO", "your company in full") apply to all I-00 responses. |
| F-03 (Cold Start Protocol) | I-00 locks the tier so F-03's cold start ritual loads the right path on every session. | F-03 auto-loads I-00's tier-detector on every session start. The tier persists. |

The four packs together (I-00 + F-01 + F-02 + F-03) are the operating-system foundation. Install in order, one at a time, with 5 to 10 minutes between each to verify. Total time: 20 to 30 minutes.

## Self-rate against the 11 augmentations

| # | Augmentation | Status | Notes |
|---|---|---|---|
| 1 | Multi-skill bundle | PASS | 1 Project Knowledge block + 3 companion skills (tier-detector, install-path-router, first-pack-recommender). |
| 2 | Construction-VP scenarios threaded through | N/A | Tier Guide is tier-and-install scoped, not role-scoped. Skeleton-rule allowed (no project names, no persona names). |
| 3 | Three-prompt verification suite | PASS | Smoke (tier-detector), real-task (install-path-router), stress (tier-mismatch refusal). Success and failure named per prompt. |
| 4 | Failure recovery paths for top 5 breakages | PASS | PK did not save, curl install missing PATH, desktop app unavailable, Pro saw `~/.claude/` path, save+chat ordering. |
| 5 | Onboarding tutorial for first 3 uses | PASS | Tier confirm, pack-specific install ask, tier-mismatch handling. |
| 6 | Role-conditional question branching | N/A | Tier Guide is universal (no role branches). The three skills work identically for any role. |
| 7 | C3 jury install path fix | PASS | Critical install path note explicitly cites `~/.claude/skills/<skill-name>/SKILL.md`, NOT `~/Documents/Claude/skills/`, NOT `~/Library/Application Support/Claude/skills/`. |
| 8 | Polished holy-shit moment | PASS | 60 seconds, two questions, tier known + first-three-packs known, foundation installed by 5 PM. |
| 9 | Canonical-source reference | PASS | Section 1 cites Anthropic Help Center on three product tiers, Claude desktop installation, and the curl install.sh path. |
| 10 | Why-this-is-foundational callout | PASS | Section 2 names the multiplier: every downstream pack lands cleaner; friction collapses across 11 installs. |
| 11 | Cross-reference between Foundation Packs | PASS | Cross-reference table maps I-00 against F-01, F-02, F-03 with both directions of dependency. |

11 of 11 PASS or N/A (with N/A justified by skeleton-rule). Ship.

## Pack provenance footer

```
# PACK PROVENANCE
# hoistos-intro-00-tier-guide v2.0.0
# Sprint: empire-wireframe-v7
# Generated: 2026-05-09 by HoistOS Empire Activation v2.0
# Canonical source: Anthropic Help Center (three product tiers + Claude desktop + curl install.sh)
# Fingerprint: intro-00-tier-guide-v2.0.0
```
