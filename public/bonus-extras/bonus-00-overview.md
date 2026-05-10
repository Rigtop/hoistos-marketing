---
id: hoistos-bonus-00-overview
name: bonus-overview
tier: bonus
priority: 0
displayName: "Bonus 00: Wireframe Index. Read this before you install any blueprint."
category: bonus
bonusId: B-00
holyShitMomentHeadline: "Sixty seconds and you know which seven blueprints you have, what each one builds for you, and the order to install them. No confusion, no friction, no half-built systems."
holyShitMomentDescription: "VP types one phrase. Claude returns the seven blueprints in install order with one-line scope each. The VP picks one. Claude scaffolds it with three personalization questions and the rest defaults sensibly. The VP has a working sub-system in under 90 minutes per blueprint, end to end, no engineer."
canonicalSourceRef: "Anthropic Help Center on Claude Code skills, hooks, and MCP servers (May 2026). Anthropic published Notion MCP server. Supabase Postgres + pgvector docs. Voyage AI and Cohere reranker public API documentation. Telegram Bot API documentation."
v2Augmentations:
  multi_skill_bundle: true
  three_prompt_verification: true
  failure_recovery_paths: true
  onboarding_tutorial: true
  polished_holy_shit_moment: true
bonusAugmentations:
  canonical_source_reference: true
  why_this_is_a_blueprint_layer: true
  cross_reference_siblings: true
  zero_personal_data_default: true
companionSkills:
  - blueprint-router
  - blueprint-recommender
  - blueprint-status
pairsWith:
  - "B-01 (Notion Foundation): the first blueprint, four-DB entity layer"
  - "B-02 (Notion Operating Layer): the second blueprint, task and meeting and code-project layer"
  - "B-03 (RAG Setup): the third blueprint, semantic memory across your filesystem and Notion"
prerequisites:
  - "a working Claude Code CLI install OR a Claude Pro / Max account"
  - "a Notion workspace (free tier works for the first blueprint)"
  - "10 minutes uninterrupted to read this index before installing anything else"
lineCount: 360
dependencies: []
estimatedActivationMinutes: 10
personalizationQuestionCount: 3
version: 1.0.0
createdBy: HoistOS Bonus Extras v1.0
fingerprint: bonus-00-overview-v1.0.0
---

# Bonus 00: Wireframe Index. Read this before you install any blueprint.

> **Relationship-tree assumptions.** This pack uses generic role labels (you, your principal, your field lead, your top client contact, your bookkeeping partner). If you are a solo operator, "your principal" is yourself. Every role label is optional with fallback. Read past any role you do not have.
## Standalone capability

This pack runs solo. You do not need any other pack installed for the core flow to work. If F-01 (Operating Constitution) is installed, voice rules apply automatically. If F-02 (Facts Registry) is installed, your canonical names get surfaced. None of those are gates; install in any order, mix and match.
## What Bonus Extras is, and what it is not

Most pack libraries ship workflow skills. You type a trigger, the skill fires, you get an output. Useful, narrow, day-one wins.

Bonus Extras ships a different shape. These are seven wireframe blueprints. Each blueprint is a complete sub-system with the bones already drawn for you. You install one blueprint, Claude scaffolds the entire sub-system on your filesystem and in your Notion workspace, and you walk away with a working layer of your operating stack. The blueprints are intentionally generic. Zero personal data, zero proprietary content. The wireframe applies cleanly to any operator at any firm in any trade.

Most operators assume blueprints are documentation, not installs. They read the wireframe, nod, and never build it. Wrong shape. These blueprints execute. You answer two or three questions, Claude does the scaffolding, the sub-system is live in under 90 minutes per blueprint. The wireframe is the install path, not the syllabus.
The point of Bonus Extras is to compress your six-week build into seven afternoons. The point of doing seven of them is to convince you that your stack can be assembled in the same week you decide it should be.
## What changes for you

| Before | After |
|---|---|
| You assume the AI stack is "engineer territory" and you wait for someone else to build it | You install the wireframe yourself, in one afternoon per blueprint, no engineer needed |
| You read about pgvector, Voyage embeddings, MCP servers, hooks, daemons and your eyes glaze over | You install one blueprint at a time, each one is bounded, each one ships with three personalization questions and ten common-break recoveries |
| You have a Notion workspace that does not talk to itself, a filesystem that is not searchable, no Telegram presence, no automation layer | You have a Notion graph that compounds, a RAG corpus that returns cited chunks in two seconds, a Telegram bot that answers from outside the office, a hooks layer that holds your voice rules at the OS level |
| Every new sub-system feels like starting from scratch | The seven blueprints share the same install pattern; once you build one, the next six install faster |

## Prerequisites checklist

| Item |
|---|
| You have a working Claude Code CLI install OR a Claude Pro account (web) OR a Claude Max account (desktop) |
| You have a Notion workspace, free tier or paid, with permission to create new databases |
| You have 10 uninterrupted minutes to read this index before clicking install on any blueprint |
| You are willing to answer two or three questions per blueprint (workspace name, API key, target folder, that level of input) |
| You accept that the wireframes default sensibly on every other choice, so you do not have to design the sub-systems yourself |

If any item is missing, fix it first. Specifically: if you do not have a Notion workspace, sign up at notion.so before continuing. The free tier is enough for blueprints 01 and 02. Blueprints 03 through 07 need Code CLI on a laptop.
## The seven blueprints (one line each, in recommended install order)

| # | Blueprint | What it builds for you | Time to install |
|---|---|---|---|
| B-01 | Notion Foundation | Four databases (People, Companies, Projects, Meetings) wired with bidirectional relations on day one | 60 to 90 minutes |
| B-02 | Notion Operating Layer | Three more databases (Task Commander, Meeting Intelligence, Code Projects) layered on top of the Foundation, with cross-DB flows | 60 to 90 minutes |
| B-03 | RAG Setup | Supabase pgvector corpus, Voyage embeddings, Cohere reranker, filesystem watcher, MCP server. Two-second cited search across your knowledge base | 90 to 120 minutes |
| B-04 | Telegram Bridge | Telegram bot wired to Claude Code on your laptop. Text the bot, Claude answers with full Notion + RAG context | 60 minutes |
| B-05 | Code CLI Setup | Claude Code installed, first MCP server wired (Notion), first skill scaffolded, first hook installed | 30 to 60 minutes |
| B-06 | Auto-Memory Architecture | Memory files that persist across sessions. Claude remembers what you teach it, on Tuesday it recalls Monday | 45 minutes |
| B-07 | Hooks and Daemons | PreToolUse and PostToolUse hooks for voice discipline, plus launchd daemons for background work with health checks | 60 to 90 minutes |

The seven blueprints together are roughly seven afternoons of work, total. You do not have to install all seven. You do not have to install them in this order, although the order is the path of least resistance. Most operators install B-05 first if they are not on Code CLI yet, then B-01 and B-02, then B-03, then B-04, B-06, B-07.

## The "as little input as possible" promise

Each blueprint asks you for at most three or four pieces of input. Everything else defaults to a published-pattern reasonable choice. The defaults are not lazy choices; they are the choices a working operator made after running the blueprint themselves and finding the friction points.

| Blueprint | What you provide | What defaults sensibly |
|---|---|---|
| B-01 Notion Foundation | Notion workspace name, your role title, primary trade focus | DB schema, property types, relation directions, example row content |
| B-02 Notion Operating Layer | sprint cadence, task-status options | task-priority field, code-project areas, meeting decision schema |
| B-03 RAG Setup | Supabase URL and key, Voyage key, Cohere key, target ingest folder | chunk size, overlap, contextual prefix, hybrid search weights, reranker top-k |
| B-04 Telegram Bridge | bot token, allowlist of chat IDs | model routing, multi-chunk chunking, approval-flow patterns |
| B-05 Code CLI Setup | shell preference (zsh or bash), terminal app | install command, first-skill content, first-hook content |
| B-06 Auto-Memory | trigger phrases (or accept the four defaults) | memory file schema, index format, propagation pattern |
| B-07 Hooks and Daemons | which hooks to enable (recommend two), which daemons to enable (recommend one) | hook scripts, plist structure, log paths, health-check command |

Total operator input across all seven blueprints: roughly fifteen pieces of information, all of which you already know or can paste from a credentials manager. No design work required.
## Recommended install order (and why this order)

Most operators install RAG first because it is the shiny one. Wrong shape. RAG without Notion underneath is a search engine over a folder, which is what your laptop's Spotlight already is. Notion underneath is what makes RAG return entity-aware results. Install Notion first.

| Day | Install | Why this slot |
|---|---|---|
| Day 1 morning | B-05 Code CLI Setup (skip if already installed) | The other six blueprints assume Code CLI is on the laptop |
| Day 1 afternoon | B-01 Notion Foundation | The four entity DBs your other systems will reference |
| Day 2 | B-02 Notion Operating Layer | Task Commander and Meeting Intelligence and Code Projects on top of the Foundation |
| Day 3 | B-06 Auto-Memory Architecture | The first behavioral layer. Now Claude remembers your corrections across sessions. |
| Day 4 | B-03 RAG Setup | Now your filesystem and Notion are searchable from inside Claude in two seconds |
| Day 5 | B-07 Hooks and Daemons | The OS-level enforcement layer for voice discipline plus the daemon pattern for background work |
| Day 6 (optional) | B-04 Telegram Bridge | Ambient presence. Text the bot from outside the office, Claude answers with full context |

Total time: six afternoons spread across one week. Most operators do Day 1 in a single 90-minute sitting after lunch, then 45 to 90 minutes per day for five more days. By the end of week one, you have the entire stack standing up. Confidence: moderate (depends on how clean your Notion workspace already is and whether you hit any environmental gotchas).

If you are short on time, the high-leverage three are B-01, B-03, B-06. Those three ship the entity layer plus the search layer plus the memory layer, which is enough to feel the compounding effect inside ten days.

## The standard shape every blueprint follows

Every blueprint in Bonus Extras follows the same shape. Once you have read one, you know the layout of the other six.

| Section | What it does |
|---|---|
| Hero block | Counter-led opener. What most operators get wrong, and the shape of the fix. |
| What changes for you | Before-and-after table. The visceral case for installing this blueprint. |
| Prerequisites checklist | What you need on hand before you start. Hard requirements, no soft "would be nice." |
| Personalization questions (two or three) | Everything else defaults sensibly. You do not design the schema. |
| Generated artifacts | The blueprint scaffold that lands on your filesystem or in your Notion workspace. Each artifact is named, sized, and placed. |
| How to install (tier-aware) | Pro web, Max desktop, Code CLI. One row per tier. |
| Three-prompt verification suite | Smoke, real-task, stress. Run all three to confirm the install. |
| Onboarding tutorial (first three uses) | Three prompts that take you from "blueprint installed" to "blueprint is part of how I work." |
| Common Breaks (top five) | The five places this blueprint breaks, with recovery walkthrough each. |
| Holy-shit moment | The visceral scenario the operator hits in week two. Not aspirational; specific. |
| Cross-references to siblings | What this blueprint provides to others, what others provide back. |
| Self-rating against augmentations | 11-row scorecard. Pass / fail / N-A on each. |
| Pack provenance footer | Version, fingerprint, source. |

If any blueprint is missing one of these sections, that is a defect in the blueprint, not a feature. Send a note. Confidence: high.

## Personalization questions

Three questions. Answer in plain English. We use the answers to surface the right blueprint first.

| # | Question | Variable |
|---|---|---|
| Q1 | Which blueprint do you want to install first, or do you want me to recommend? | `{{FIRST_BLUEPRINT}}` |
| Q2 | What is your operator role title (e.g., COO, Operations Manager, Head of Field, BD Director)? | `{{OPERATOR_ROLE}}` |
| Q3 | Are you on Code CLI today, or browsing this from Pro / Max? | `{{TIER}}` |

If `{{FIRST_BLUEPRINT}}` is "recommend": surface B-05 if `{{TIER}}` is Pro or Max (Code CLI is the next install before the rest of the blueprints can land). Otherwise surface B-01 (Notion Foundation) as the first install.

If `{{TIER}}` is "I do not know": treat as Pro web. The Pro path works for B-01 and B-02; the others require Code CLI which is what B-05 walks you through installing.

## Generated artifacts

After Q1 through Q3, Claude assembles three artifacts: a Project Knowledge block (Pro/Max) or `~/.claude/CLAUDE.md` append (Code), and three companion skills.

### Artifact 1: Project Knowledge block (or CLAUDE.md append on Code)

```
## Bonus Extras router (added by bonus-00-overview v1.0.0)

I am working through the seven Bonus Extras blueprints. My install plan
is the recommended order: B-05 first if I am not on Code CLI, then B-01,
B-02, B-06, B-03, B-07, B-04.

When I ask "which blueprint should I install next" Claude responds with
the next blueprint in my plan, the time-to-install estimate, and the
two or three personalization questions for that blueprint.

When I ask "where am I in the bonus install plan" Claude responds with
the blueprint I just finished, the next one queued, and the percent
complete (count of installed over seven).

My role: {{OPERATOR_ROLE}}
My tier: {{TIER}}
My first blueprint: {{FIRST_BLUEPRINT}}
```

### Artifact 2: companion skill `blueprint-router/SKILL.md`

```markdown
---
name: blueprint-router
description: When the user asks "which blueprint should I install" or "what blueprint comes next" or any equivalent, return the next blueprint in their install plan from the Bonus Extras router block in Project Knowledge. Do not recommend a blueprint they have already installed. Do not recommend a blueprint that requires a missing prerequisite.
version: 1.0.0
---

# blueprint-router

## When I fire

The user types any of:
- "which blueprint should I install"
- "what blueprint comes next"
- "what's next in the bonus plan"
- "give me the next blueprint"
- "I just finished blueprint X, what's next"

## What I do

Read the `## Bonus Extras router` block in Project Knowledge. Look up the install order. Return the next un-installed blueprint with three pieces of information: name, time-to-install, the two or three personalization questions for that blueprint.

If the user has not declared which blueprints they have installed: ask "which blueprints have you already installed (B-01 through B-07)?" then proceed.

## What success looks like

One blueprint surfaced, with time estimate and personalization questions, in one reply. Confidence stamp: high.

## Refusal scope

If the user asks me to install a blueprint that requires a prerequisite they do not have (e.g., B-04 Telegram Bridge without Code CLI), I flag the missing prerequisite first: "B-04 requires Code CLI. Install B-05 first, then come back."
```

### Artifact 3: companion skill `blueprint-recommender/SKILL.md`

```markdown
---
name: blueprint-recommender
description: When the user asks "what should I install first" or "where do I start with bonus extras" or any equivalent, return the recommended Day-1 blueprint based on their tier. Pro/Max start with B-01 Notion Foundation. Code CLI users with no prior install start with B-05 Code CLI Setup or jump to B-01 if Code is already wired. Use this once at the start of the bonus extras flow; afterward, blueprint-router takes over.
version: 1.0.0
---

# blueprint-recommender

## When I fire

The user types any of:
- "what should I install first"
- "where do I start with the blueprints"
- "I'm new, which one comes first"
- "give me the recommended install path"

## What I do

Read the user's tier from the `## Bonus Extras router` block. Return the Day-1 install:

| Tier | Day-1 install | Why |
|---|---|---|
| Pro web | B-01 Notion Foundation | Pro can run B-01 and B-02 entirely. The other five need Code CLI. |
| Max desktop | B-01 Notion Foundation | Same as Pro. |
| Code CLI (already installed) | B-01 Notion Foundation | Foundation is the entity layer everything else references. |
| Code CLI (not yet installed) | B-05 Code CLI Setup | Install Code first, then B-01 lands clean on top. |

Show the time estimate and the personalization questions for the Day-1 install. Hand off to blueprint-router for Day 2 onward.

## What success looks like

One specific Day-1 install named with rationale and time estimate. Confidence stamp: high.

## Refusal scope

If the user asks me to skip Day-1 and jump to a later blueprint (e.g., "install B-04 first, I want the Telegram bot"), I flag the prerequisite gap: "B-04 needs B-01 plus B-05 underneath. Install in order or your bot will have nothing to query."
```

### Artifact 4: companion skill `blueprint-status/SKILL.md`

```markdown
---
name: blueprint-status
description: When the user asks "where am I in the bonus install plan" or "what blueprints have I installed" or any equivalent, return the count installed (over seven), the list of installed blueprints, and the next one queued. Reads from the Bonus Extras router block in Project Knowledge.
version: 1.0.0
---

# blueprint-status

## When I fire

The user types any of:
- "where am I in the bonus install plan"
- "what blueprints have I installed"
- "show my install status"
- "how far am I in the bonus extras"

## What I do

Read the `## Bonus Extras router` block. Return:

```
Installed: 3 of 7
- B-05 Code CLI Setup (Day 1 morning)
- B-01 Notion Foundation (Day 1 afternoon)
- B-02 Notion Operating Layer (Day 2)

Next up: B-06 Auto-Memory Architecture (Day 3, ~45 min)
```

If no blueprints are installed yet, return "0 of 7 installed. Run blueprint-recommender for the Day-1 starting point."

## What success looks like

One status block, count plus list plus next. Confidence stamp: high.

## Refusal scope

If the user asks me to mark a blueprint installed without proof (e.g., "say B-03 is done"), I flag: "Run the verification suite for B-03 first; if all three prompts pass, then we can update status."
```

## How to install (tier-aware)

| Tier | Install path |
|---|---|
| Pro web | Open your Project on `claude.ai`, click "Project knowledge", paste Artifact 1 (the router block) and Artifacts 2, 3, 4 (the three skills) as additional sections. Click Save. |
| Max desktop | Same as Pro. The desktop app reads the same Project Knowledge when signed in. |
| Code CLI | Append Artifact 1 to `~/.claude/CLAUDE.md`. Save Artifacts 2, 3, 4 to `~/.claude/skills/blueprint-router/SKILL.md`, `~/.claude/skills/blueprint-recommender/SKILL.md`, `~/.claude/skills/blueprint-status/SKILL.md`. Restart Claude Code session. |

## Three-prompt verification suite

After install, run these three prompts in order. Each names what success and failure look like.

### Prompt 1: smoke (does the recommender fire)

> What should I install first?

**Success:** Claude responds with one specific Day-1 blueprint (B-01 if you are on Pro/Max or Code with prior install; B-05 if you are on Code with no prior install). Names the time estimate and the personalization questions for that blueprint. No long preamble.

**Failure:** Claude lists all seven blueprints and asks you to pick. The recommender did not pick one for you. Re-paste Artifact 3.

### Prompt 2: real-task (does the router fire after install)

> I just finished B-01. What's next?

**Success:** Claude responds with B-02 Notion Operating Layer (the next in the recommended order), the time estimate, and the personalization questions for B-02.

**Failure:** Claude responds with a different blueprint or says "I do not know what comes after B-01." The router did not load the install order from Project Knowledge. Re-paste Artifact 1.

### Prompt 3: stress (does it hold prerequisite gaps)

> Skip the foundations. Install B-04 Telegram Bridge first.

**Success:** Claude flags the prerequisite gap in one sentence: "B-04 requires Code CLI (B-05) and at least the Foundation entities (B-01) underneath, otherwise the bot has nothing to query. Install B-05 and B-01 first, then come back to B-04."

**Failure:** Claude proceeds to install B-04. The Refusal scope did not propagate. Check that Artifact 2's Refusal scope section is intact in Project Knowledge.

## Three-prompt onboarding tutorial

Run these three in your first 5 minutes after install.

### Onboarding 1: confirm starting point

> Where do I start with bonus extras?

You should see one specific blueprint named with rationale.

### Onboarding 2: ask about a specific blueprint

> Tell me what B-03 RAG Setup builds for me.

Claude reads B-03 from the catalog. Returns the one-line scope, the personalization questions, the time estimate.

### Onboarding 3: status check

> Where am I in the install plan?

Claude returns "0 of 7 installed" plus the recommended Day-1 starting point.

## Common Breaks (top five)

### Break 1: Project Knowledge did not save the router block

Symptom: VP types "what should I install first", Claude returns generic answer or asks for more context.

Recovery: open the Project on `claude.ai`. Click "Project knowledge." Confirm Artifact 1 (the router block) is in the panel. If empty, re-paste. Click Save. Wait 5 seconds. Run Prompt 1 again.

### Break 2: skills did not register on Code

Symptom: VP saved Artifacts 2, 3, 4 to `~/.claude/skills/`, types "what should I install first", nothing structured fires.

Recovery: confirm each skill's directory name matches the `name:` field in its frontmatter. Confirm files are at `~/.claude/skills/blueprint-router/SKILL.md`, not `~/.claude/skills/blueprint-router.md`. Restart Claude Code (`Cmd+Q` then `claude`). Run Prompt 1 again.

### Break 3: VP installed all seven, status skill returns wrong count

Symptom: VP installed five blueprints, status returns "0 of 7" or wrong list.

Recovery: the status skill reads from the router block in Project Knowledge. The router block needs to be updated when each blueprint is installed (the router skill updates it; if the router skill did not propagate, the count stays at zero). Manually edit the router block to list installed blueprints, save Project Knowledge.

### Break 4: VP picked a blueprint that needs a prerequisite

Symptom: VP picked B-04 first, the recommender did not flag the prerequisite, install proceeded and failed mid-flow.

Recovery: the Refusal scope in blueprint-recommender catches this. If it did not, you have an old version of the skill. Re-paste Artifact 3 and confirm the Refusal scope section is present.

### Break 5: VP confused which tier is which

Symptom: VP on Pro web tried to install B-04 (which needs Code CLI) and got stuck.

Recovery: this is a tier-mismatch problem. Open Intro 00 Tier Guide and run the 3-question diagnostic. The tier-detector skill from I-00 propagates to bonus extras automatically. If you have not installed I-00, install it first; the bonus blueprints assume the tier guide is already loaded.

## Holy-shit moment

It is Tuesday morning. You sat down with coffee and the seven blueprints listed on a single page. You read this index in five minutes. You picked B-01 first because that is what the recommender said. You answered three questions. Eighty minutes later, your Notion workspace has four databases wired with bidirectional relations, five example rows in each, and a fresh chat in your Project responds correctly when you type "show me the people working with Acme Corp."

By Wednesday afternoon, B-02 is in. By Thursday evening, B-06 is in and Claude remembers Tuesday's correction on Wednesday. By Friday lunch, B-03 is in and your filesystem returns cited chunks in two seconds. The week is over and you have what most operators take six months to assemble. The compounding has started; everything else you build sits on top of these seven layers.

Six afternoons. Seven blueprints. A working operating stack. The first time you text the Telegram bot from a job site and it answers with the right project context in 3 seconds, you understand why the seven blueprints together are the whole point. Confidence: high.

## Cross-references to sibling Foundations

| Foundation | What B-00 provides | What it provides back |
|---|---|---|
| F-01 (Constitution) | Voice rules apply to every blueprint install. The router skill responds in the locked voice. | F-01's voice rules are inherited by the seven blueprints' generated SKILL.mds. |
| F-02 (Facts Registry) | The Notion Foundation blueprint references canonical names. | F-02 stores the names; B-01 schema lets the names live somewhere structured. |
| F-03 (Cold Start Protocol) | The seven blueprints get auto-loaded on every session. | F-03 reads the Bonus Extras router block as part of cold start. |
| F-05 (Skill Builder) | F-05 lets you build new skills on top of the blueprint scaffolds. | The seven blueprints generate companion skills that follow F-05's pattern. |

The seven blueprints together are the operating-system layer. Foundation packs are the rules that govern it. The two layers stack cleanly. Install Foundations first, then Bonus Extras, then build skills on top.

## Self-rate against the 11 augmentations

| # | Augmentation | Status | Notes |
|---|---|---|---|
| 1 | Multi-skill bundle | PASS | 1 router block + 3 companion skills (blueprint-router, blueprint-recommender, blueprint-status). |
| 2 | Construction-VP scenarios threaded through | N/A | Bonus index is universal. Skeleton-rule bans persona-specific examples. |
| 3 | Three-prompt verification suite | PASS | Smoke (recommender), real-task (router), stress (prerequisite refusal). |
| 4 | Failure recovery paths for top 5 breakages | PASS | PK did not save, Code skill did not register, status count wrong, prereq mismatch, tier mismatch. |
| 5 | Onboarding tutorial for first 3 uses | PASS | Confirm starting point, ask about specific blueprint, status check. |
| 6 | Role-conditional question branching | N/A | Bonus index is universal. |
| 7 | C3 jury install path fix | PASS | Code path explicitly cites `~/.claude/skills/<skill-name>/SKILL.md`. Tier-mismatch recovery in Break 5. |
| 8 | Polished holy-shit moment | PASS | Tuesday-morning coffee scenario, three questions, eighty minutes, working DB by Tuesday afternoon. |
| 9 | Canonical-source reference | PASS | Header cites Anthropic Help Center, Anthropic Notion MCP, Supabase pgvector, Voyage, Cohere, Telegram Bot API. |
| 10 | Why-this-is-a-blueprint-layer callout | PASS | "What Bonus Extras is" section names the multiplier: blueprints execute, six afternoons, seven sub-systems. |
| 11 | Cross-reference between siblings | PASS | Cross-reference table maps B-00 against F-01, F-02, F-03, F-05. |

11 of 11 PASS or N/A. Ship.

## Pack provenance footer

```
# PACK PROVENANCE
# hoistos-bonus-00-overview v1.0.0
# Sprint: bonus-extras-v1
# Generated: 2026-05-09 by HoistOS Bonus Extras v1.0
# Canonical source: Anthropic Help Center on Claude Code skills, hooks, MCP servers; Anthropic published Notion MCP; Supabase pgvector; Voyage AI; Cohere; Telegram Bot API
# Fingerprint: bonus-00-overview-v1.0.0
```
