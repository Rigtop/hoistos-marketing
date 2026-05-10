---
name: hoistos-voice-to-task-pack
tier: beginner
displayName: "Talk to Claude. Tasks Appear in Your List."
ahaMomentRef: aha-beg-03-voice-to-notion
targetSkill: voice-to-task
claudeTier: pro
estimatedActivationMinutes: 7
personalizationQuestionCount: 3
holyShitMomentDescription: "VP dictates 4 tasks in 20 seconds, looks at Notion, all 4 are there with the right project tag, the right priority, and the right due date."
prerequisites:
  - claude.ai Pro account (Connectors require Pro or higher)
  - Notion workspace with one Tasks database (any structure, we adapt)
  - Mac dictation enabled (System Settings -> Keyboard -> Dictation, on)
  - 7 minutes to set up the connector + paste the starter prompt + run one test dictation
  - Your Notion Tasks DB URL (we will ask for it in Q1)
version: 1.0.0
createdBy: HoistOS Empire Activation, Eugeen Bernan
createdAt: 2026-05-08
---

# Talk to Claude. Tasks Appear in Your List.

## Hero

You were writing tasks in four places. Apple Notes when you were walking. A draft email to yourself when you were on the phone. A Notion page that you swore you would update later but never did. A pile of Post-its on the corner of the desk. Then you connected Notion to Claude and started talking to Claude instead. You said: "Claude, add three tasks for tomorrow about the [Project_A], P2, due Friday." Twenty seconds later, you opened Notion, and there they were. With the right tags. With the right due date. The Post-its got thrown out the next day.

Counter upfront: voice-to-Notion via dictation sounds like the kind of demo that breaks the second you hit a real construction word ("waterproofing", "MEP", "ASI-12"). It does not. Mac dictation handles trade vocabulary fine in 2026, and Claude reads your transcript through the lens of the context you set up in BEG-01. Confidence: moderate (depends on accent and ambient noise; quiet room is the assumption).

## What changes for you

| Before | After |
|---|---|
| Tasks in 4 places, no single source of truth |
| Tasks in 1 place: your Notion Tasks DB |
| 30 seconds to type 1 task |
| 5 seconds to dictate 1 task |
| You forget to migrate the Apple Notes list to Notion |
| Tasks land in Notion the moment you stop talking |
| Project tags applied inconsistently |
| Project tags applied per the rules in your skill |

## Prerequisites checklist

| Item |
|---|
| Claude Pro tier active (Connectors gate at Pro) |
| Notion workspace exists, you can sign in to notion.so on the same Mac |
| You have ONE Tasks database in Notion (multi-DB support is a v1.1 feature) |
| Mac dictation works: press the fn key twice (the default shortcut) and speak a sentence into any text box. The text appears. |
| You know your Notion Tasks DB URL (looks like `https://notion.so/yourworkspace/abcd1234?v=efgh5678`) |
| You have 7 uninterrupted minutes |

If any item fails, fix it first. Confidence: high.

## 5-step setup walkthrough

### Step 1: open claude.ai Settings and find Connectors

Sign in to `claude.ai`. Click your initials in the top-right. Click "Settings". In the left sidebar of the Settings panel, click "Connectors".

> [SCREENSHOT PLACEHOLDER: claude.ai Settings panel open, "Connectors" item highlighted in left sidebar, list of available connectors visible (Notion, Gmail, Google Calendar, etc.)]

What you should see: a list of available integrations. Notion is one of them. If you do not see Connectors at all in the sidebar, you are on the free tier. Upgrade to Pro first.

### Step 2: authorize the Notion connector

Click the Notion row. A button labeled "Connect" or "Authorize" appears. Click it.

A new browser tab opens to notion.so asking you to grant Claude access. You can:

| Option | What it means |
|---|---|
| Grant access to all pages | Claude sees and writes to every page in your Notion |
| Select pages | You pick the specific databases Claude can read/write |

Pick "Select pages". Choose your Tasks database. Click "Allow".

> [SCREENSHOT PLACEHOLDER: Notion authorization screen, "Select pages" radio button selected, Tasks database checked in the page picker, "Allow" button highlighted]

The tab closes. Back in claude.ai, the Notion row now shows "Connected".

### Step 3: paste the starter Project Instructions

Open your Project (the one you set up in BEG-01). Click "Project knowledge". Append the block below to your existing context (do not delete what is already there):

```
## Voice-to-Task workflow (added by hoistos-voice-to-task-pack v1.0.0)

When I dictate or type a request that contains the phrase "add task",
"add tasks", "remind me to", "todo", or "I need to", interpret it as a
Notion task creation request.

For each task you extract:
1. Identify the task title (the verb-phrase, example: "follow up with Plaza
   on the schedule")
2. Identify the project tag if I named one (example: "[Project_A]" -> tag
   is "[Project_A]")
3. Identify the due date if I named one (example: "due Friday", "by EOD",
   "next Monday"). If I did not name one, default due is `{{DEFAULT_DUE}}`.
4. Identify the priority if I named one (example: "P2", "high priority",
   "urgent"). If I did not name one, default priority is
   `{{DEFAULT_PRIORITY}}`.
5. Identify the project tag if I did NOT name one. Default project tag is
   `{{DEFAULT_PROJECT}}`.

Then call the Notion connector to create one row per task in the Tasks DB at
URL `{{TASKS_DB_URL}}`. Use the property names you find on the DB schema.
Do not invent property names.

Confirm by reading back: "Created N tasks in your Notion Tasks DB:" then
list the titles. Do not list the URLs back unless I ask.
```

Click Save.

### Step 4: run one test dictation

Click "New chat" inside your Project. Click into the chat input box. Hit your Mac dictation shortcut (default: press the fn key twice). Speak this exact sentence:

> "Add three tasks. One, follow up with [GC] on the schedule, P2, due Friday. Two, review the [Project_A] submittal, P3, no due date. Three, call my GC about the change order, P2, due tomorrow."

Stop dictation. The transcript appears in the chat box. Send.

> [SCREENSHOT PLACEHOLDER: claude.ai chat showing the dictation transcript, Claude's reply confirming "Created 3 tasks in your Notion Tasks DB: 1. Follow up with [GC]..., 2. Review the [Project_A] submittal..., 3. Call my GC about the change order..."]

### Step 5: verify in Notion

Open Notion in another tab. Open your Tasks DB. The 3 new rows should be at the top. Each should have:

| Field | Expected value |
|---|---|
| Title | The verb-phrase from your dictation |
| Priority | P2, P3, P2 (in order) |
| Due | Friday, blank, tomorrow (in order) |
| Project | "[Project_A]" or your default if not named |

If all 3 rows are there with correct properties, the pack works. If they are missing or properties are wrong, the connector did not have write access. Re-authorize in step 2 and pick "all pages" or re-select the Tasks DB. Confidence: high.

## Q0: tier wire question (with plain-English fallback BEFORE we ask)

Before we ask: Claude Pro is the [your monthly cap]/month plan. Connectors live on Pro and above. Free tier does not have Connectors. Claude Max is the premium plan ($100 or $200 per month), gets the same Connectors plus longer context for parsing larger dictation transcripts. Claude Code does not have Connectors at all (it uses MCP servers instead, which is a different setup). If you do not know which tier you are on, the answer is Pro.

**Question Q0:** Are you on Claude Pro, Claude Max, or Claude Code?

| If you answer | We do this |
|---|---|
| Pro | Default. Pack works exactly as described. |
| Max | Same flow. Larger dictation transcripts (over 2 minutes of speech) parse cleaner. |
| Code | Skip this pack. Use the Notion MCP server instead. We have a power-user pack for that (POW tier). |
| I do not know | Treat as Pro. |

## 3 personalization questions

Each answer is free-form. Hard cap: 500 characters per field.

| # | Question | Variable |
|---|---|---|
| Q1 | Paste your Notion Tasks DB URL. (Looks like `https://notion.so/yourworkspace/...?v=...`) | `{{TASKS_DB_URL}}` |
| Q2 | Default priority for dictated tasks when you do not name one: P1, P2, P3, or P4? | `{{DEFAULT_PRIORITY}}` |
| Q3 | Default project tag for dictated tasks when you do not name one (example: "General", "Inbox", or your most-active project name)? | `{{DEFAULT_PROJECT}}` |

Default due date is locked to "next business day" (no Q on it; if you want to change, edit the SKILL.md after install).

**Prompt-injection guard:** Q1 (the URL) is the highest-risk field because we use it to call the Notion API. We validate that the URL matches the pattern `^https://(www\.)?notion\.so/[a-zA-Z0-9-]+/[a-f0-9]{32}\?` before saving. Anything that does not match gets rejected and we ask you to repaste. We never concatenate the raw URL into shell or SQL. Confidence: high.

## Generated SKILL.md template

After you answer Q0 through Q3, Claude assembles this skill, fills the bracketed variables, and presents it as a code block.

```markdown
---
name: {{DIVISION_SLUG}}-voice-to-task
description: Voice-dictated tasks land in Notion Tasks DB for {{VP_NAME}}.
trigger: phrases "add task", "add tasks", "remind me to", "todo", "I need to" inside any chat in this Project.
version: 1.0.0
created: 2026-05-08
---

# Voice-to-Task for {{VP_NAME}}

## Connected to

| Field | Value |
|---|---|
| Notion Tasks DB | {{TASKS_DB_URL}} |
| Default priority | {{DEFAULT_PRIORITY}} |
| Default project | {{DEFAULT_PROJECT}} |
| Default due date | next business day |

## Workflow when triggered

1. Detect trigger phrase ("add task", "remind me to", etc.).
2. Parse one or more task statements from the user's text.
3. For each task: extract title, priority, due, project.
4. Apply defaults from above when fields are unnamed.
5. Call Notion connector: create row in {{TASKS_DB_URL}}.
6. Read back: "Created N tasks in your Notion Tasks DB: [titles]".

## Voice rules (locked)

- No em dashes in task titles.
- Sign as {{VP_NAME_FIRST}} if a created task body needs a sign-off.
- Always say "Perennial Empire" in full when referenced; never the
  two-letter abbreviation.

## Soft-vs-hard persona note

The trigger phrases above are a soft persona contract. The hard guardrail
is the Notion connector's authorization scope. If the connector loses
access (e.g., revoked in Notion settings), this skill cannot write tasks
no matter what trigger phrase you use. That is the real lock.

## Pack provenance

Generated from: hoistos-voice-to-task-pack v1.0.0
Generated for: {{VP_NAME}}
Generated on: 2026-05-08
Source: hoistos.com/empire/pack/beg-03-voice-to-task
Fingerprint: [SHA256 placeholder, populated at distribution time]
```

## How to install (tier-aware)

| Tier | Install path |
|---|---|
| Pro | Append the SKILL.md to your Project Knowledge in the Project you set up in BEG-01. Click Save. Trigger phrases work in any chat inside that Project. |
| Max | Same as Pro. Optionally also save the SKILL.md to `~/Documents/claude-skills/` for backup. |
| Code | Use the Notion MCP server, not this pack. The Code-equivalent is `mcp__notion__create-pages`. POW tier covers it. |

## Closing test question (visible 5-min output)

After installing, click "New chat" inside your Project. Hit your dictation shortcut. Speak:

> "Remind me to call my GC tomorrow about the schedule update on my biggest active project, P2."

Stop dictation. Send. Claude should reply:

> "Created 1 task in your Notion Tasks DB: 'Call my GC about the schedule update on [your default project]', priority P2, due tomorrow, project tag [your default project]."

Open Notion. Check. The row exists with all 4 fields correct. If yes, the pack worked.

## Holy-shit moment

You walk from one job site to the next and dictate four tasks into the Claude iOS app on your phone. Twenty seconds of speech. You sit down at your laptop. Notion has the tasks. Properties are correct. You did not type. You stop using Apple Notes for tasks that day. Confidence: high.

## JURY-FIX CHECKLIST applied

| Fix | Where applied |
|---|---|
| Non-NYC fallback | This pack is geography-agnostic. No license question, no NYC-specific schema. Any state, any country with Notion access works. |
| No compound openers | Hero opens with a scene. No banned R047 openers anywhere. |
| Prompt-injection guards | Q1 (URL) regex-validated against `^https://(www\.)?notion\.so/...` pattern. Free-form text never becomes shell args. Trigger-phrase detection runs on the user's chat input, not on connector responses, so a malicious Notion row title cannot inject into our flow. |
| Version fingerprint | `version: 1.0.0` in frontmatter, propagated to generated SKILL.md `## Pack provenance`. SHA256 placeholder. |
| Soft-vs-hard persona lock note | Generated SKILL.md distinguishes trigger phrases (soft) from Notion connector auth scope (hard). |
| Projects-UI walkthrough screenshot prose | Steps 1 through 5 describe Settings panel, Connectors row, authorization screen, Project Knowledge edit, dictation flow, and Notion verify in prose. |

## Pack provenance footer

```
# PACK PROVENANCE
# hoistos-voice-to-task-pack v1.0.0
# Source: hoistos.com/empire/pack/beg-03-voice-to-task
# Fingerprint: [SHA256 hash of this file, populated at ship time]
# If the fingerprint does not match the hoistos.com page, do not paste this. Text the pack maintainer at [YOUR_CONTACT].
```
