---
name: hoistos-first-skill-bootstrap-pack
tier: beginner
displayName: "Your First Custom Skill (in 8 Minutes)"
ahaMomentRef: aha-beg-04-skill-creation
targetSkill: first-custom-skill
claudeTier: pro
estimatedActivationMinutes: 8
personalizationQuestionCount: 3
holyShitMomentDescription: "VP types their custom trigger phrase in the next chat, Claude executes the skill they just defined, output appears in the format they specified. They built software in 8 minutes."
prerequisites:
  - claude.ai Pro account
  - One existing Project (BEG-01 setup recommended; if not done, do BEG-01 first)
  - 8 uninterrupted minutes
  - One thing in your head: a recurring task you do over and over (the more boring, the better)
version: 1.0.0
createdBy: HoistOS Empire Activation, Eugeen Bernan
createdAt: 2026-05-08
---

# Your First Custom Skill (in 8 Minutes)

## Hero

You always assumed Skills were a developer thing. Engineering. JSON. CLIs. Git pull requests. Then someone told you the truth: a Claude Skill is a markdown file. Three lines of metadata. A few paragraphs of instructions. That is it. You wrote your first one in 8 minutes. It triggered on the phrase "draft a follow-up". Next time you typed those words, Claude executed the entire follow-up workflow in your voice without you re-explaining anything.

Counter upfront: most VPs hear "custom skill" and assume it is going to require a new tool, a new install, or a new password. It does not. The skill lives in your Project Knowledge. It is text. You can edit it from any browser. The "magic" is just that Claude reads your custom file every chat and follows it. Confidence: high.

## What changes for you

| Before | After |
|---|---|
| You re-explain the same workflow 5 times a week |
| You type a 4-word trigger and the workflow runs |
| You assume "skills" is for engineers |
| You realize skills are markdown and you write them |
| Your Claude is a default assistant |
| Your Claude is a custom assistant shaped to your work |
| You do not own any of your AI workflow |
| You own the SKILL.md file. You can edit it anytime. |

## Prerequisites checklist

| Item |
|---|
| Claude Pro account active |
| You completed BEG-01 (have a Project, have Project Knowledge populated) OR you are willing to do BEG-01 first |
| You can name a recurring task you do, in one sentence (example: "draft a follow-up email to a GC after a site walk", "summarize a weekly project meeting in three bullets", "check my pipeline for stalled prospects") |
| You can name the format you want the output in (one of: email, list, table, paragraph, code block) |
| You have 8 uninterrupted minutes |

If any item is missing, fix it. Confidence: high.

## 5-step setup walkthrough

### Step 1: open your Project (the one from BEG-01)

Sign in to `claude.ai`. Click your existing Project in the left sidebar (the one named something like "[YOUR_NAME]'s Workspace").

> [SCREENSHOT PLACEHOLDER: claude.ai sidebar showing Projects section with the VP's existing Project highlighted, click target indicated]

What you should see: the Project's home view. There is a "Project Knowledge" panel either open by default or accessible via a button.

If you do not have a Project yet: stop. Go do BEG-01 first. This pack assumes BEG-01 is done.

### Step 2: open Project Knowledge in edit mode

Click "Project knowledge" (or "Edit knowledge", label varies by UI version). The text box opens with whatever you pasted in BEG-01 already loaded.

> [SCREENSHOT PLACEHOLDER: Project Knowledge edit panel, existing context visible, scroll position at the bottom of the existing text, blank line where new content gets appended]

Scroll to the bottom of the existing content. Do NOT delete what is there. We are appending, not replacing.

### Step 3: paste this skill template at the bottom

Paste the block below at the bottom of Project Knowledge. Replace the three bracketed values with your real answers (we will repeat the questions in the personalization section below for clarity).

```
## Custom skill: [SKILL_NAME] (added by hoistos-first-skill-bootstrap-pack v1.0.0)

Trigger phrase: "[TRIGGER_PHRASE]"
What I want you to do: [ACTION_DESCRIPTION]
Output format: [OUTPUT_FORMAT]

When I type the trigger phrase in any chat in this Project, do the action
described above and return the result in the output format. Use my voice
rules from the top of this Project Knowledge. Confidence-stamp any factual
claims (high/moderate/low/unknown).

If I type the trigger phrase but the request is unclear (missing context),
ask one clarifying question, then proceed. Do not refuse, do not ask three
questions in a row.
```

### Step 4: customize 2 fields and save

The two fields you must edit:

| Field | Example value |
|---|---|
| `[TRIGGER_PHRASE]` | "draft a follow-up", "check my pipeline", "summarize this meeting" |
| `[ACTION_DESCRIPTION]` | "Draft a 4-line follow-up email to the GC named in my last message, in my voice, sign as me, no Best, no em dashes." |

The `[OUTPUT_FORMAT]` field defaults to "email" if you do not change it. Common values: email, list (bulleted), table (markdown), paragraph (one prose block), code block.

The `[SKILL_NAME]` field is a slug for your records, example: `gc-followup-drafter`. Lowercase, hyphens, no spaces.

Click Save (or "Update knowledge"). The Project Knowledge panel closes or shows the saved indicator.

> [SCREENSHOT PLACEHOLDER: Project Knowledge panel after save, the appended skill block visible at the bottom, save confirmation banner showing "Knowledge updated"]

### Step 5: test the skill in a fresh chat

Click "New chat" inside the Project. Type your trigger phrase. For example:

> "Draft a follow-up. The GC is [GC_1]. We had a coordination meeting yesterday. Outstanding item: schedule for Level 3 mechanical."

Send. Claude should respond with a 4-line email in your voice, with no em dashes, signed as you, on point.

> [SCREENSHOT PLACEHOLDER: chat showing the trigger phrase typed, Claude's response showing the email draft in the VP's voice with all rules followed]

If Claude responds with a generic email or asks "what do you mean by follow-up", the SKILL.md did not save. Re-paste in step 3. Confidence: high.

## Q0: tier wire question (with plain-English fallback BEFORE we ask)

Before we ask: Claude Pro is the [your monthly cap]/month plan. Skills as Project Knowledge text work on Pro. Claude Max is the premium plan ($100 or $200 per month), same Project Knowledge mechanism, longer context window so larger skills work cleaner. Claude Code stores skills as files at `~/.claude/skills/<name>/SKILL.md` instead of in Project Knowledge. If you do not know which tier you are on, the answer is Pro.

**Question Q0:** Are you on Claude Pro, Claude Max, or Claude Code?

| If you answer | We do this |
|---|---|
| Pro | Default. Append SKILL.md to Project Knowledge. |
| Max | Same flow. Optionally save a copy to `~/Documents/claude-skills/` for portability. |
| Code | Save the SKILL.md to `~/.claude/skills/{{SKILL_SLUG}}/SKILL.md`. Restart Claude Code. The skill auto-registers as a slash command. |
| I do not know | Treat as Pro. |

## 3 personalization questions

Each answer is free-form. Hard cap: 500 characters per field.

| # | Question | Variable |
|---|---|---|
| Q1 | What trigger phrase do you want? (example: "draft a follow-up", "check my pipeline", "summarize this meeting") | `{{TRIGGER_PHRASE}}` |
| Q2 | In one sentence, what action should Claude take when it sees the trigger? (example: "Draft a 4-line follow-up email to the GC named in my last message, in my voice, sign as me, no Best, no em dashes.") | `{{ACTION_DESCRIPTION}}` |
| Q3 | Output format: email, list, table, paragraph, or code block? | `{{OUTPUT_FORMAT}}` |

**Prompt-injection guard:** Q2 (action description) is the highest-risk field because it goes into the SKILL.md verbatim and Claude reads it as instructions on every trigger. We:

1. Cap Q2 at 500 chars (anything longer gets truncated, we ask to shorten).
2. Strip the phrases "ignore previous instructions", "from now on you are", and "act as a [different role]" if they appear in Q2.
3. Refuse Q2 values that ask Claude to perform out-of-scope actions (write phishing emails, generate creds, exfiltrate data). The action must be a legitimate workflow.

Confidence: high.

## Generated SKILL.md template

After you answer Q0 through Q3, Claude assembles this skill, fills the bracketed variables, and presents it as a code block.

```markdown
---
name: {{DIVISION_SLUG}}-{{SKILL_SLUG}}
description: Custom skill for {{VP_NAME}}, triggered by "{{TRIGGER_PHRASE}}".
trigger: phrase "{{TRIGGER_PHRASE}}" anywhere in user input within this Project.
version: 1.0.0
created: 2026-05-08
---

# {{SKILL_DISPLAY_NAME}}

## Mission

When {{VP_NAME}} types "{{TRIGGER_PHRASE}}", do this:

{{ACTION_DESCRIPTION}}

Return the result in {{OUTPUT_FORMAT}} format.

## Voice rules (inherited from Project Knowledge, locked)

- No em dashes (U+2014, U+2013).
- Always "Perennial Empire" in full, never the two-letter abbreviation.
- Sign emails as {{VP_NAME_FIRST}} only.
- Confidence stamps on factual claims: high, moderate, low, unknown.
- One clarifying question if input is unclear, then proceed.

## Refusal scope

If {{VP_NAME}} types the trigger phrase but the body of the message asks
for an out-of-scope action (phishing, credential generation, data
exfiltration, anything outside the legitimate workflow above), refuse in
one sentence: "Outside this skill's scope. Open a fresh chat for that."

## Soft-vs-hard persona note

The trigger phrase + action above is a soft skill contract. It runs on
top of Claude's default safety guardrails (hard). Claude refuses unsafe
requests regardless of what this skill says. The two layers compose:
this skill narrows the workflow, Claude's guardrails block the bad
requests.

## Pack provenance

Generated from: hoistos-first-skill-bootstrap-pack v1.0.0
Generated for: {{VP_NAME}}
Generated on: 2026-05-08
Source: hoistos.com/empire/pack/beg-04-first-skill-bootstrap
Fingerprint: [SHA256 placeholder, populated at distribution time]
```

## How to install (tier-aware)

| Tier | Install path |
|---|---|
| Pro | Append the generated SKILL.md to your Project Knowledge in your existing Project. Click Save. The trigger phrase activates the skill in any chat inside that Project. |
| Max | Same as Pro, plus optionally save a copy to `~/Documents/claude-skills/{{SKILL_SLUG}}.md` for portability across Projects. |
| Code | Save to `~/.claude/skills/{{DIVISION_SLUG}}-{{SKILL_SLUG}}/SKILL.md`. Restart Claude Code. Skill registers as `/{{DIVISION_SLUG}}-{{SKILL_SLUG}}` slash command. |

## Closing test question (visible 5-min output)

After installing, click "New chat" inside your Project. Type your trigger phrase, followed by enough context for the action to run. Example:

> "Draft a follow-up. The GC is [GC_1]. Outstanding item is the Level 3 mechanical schedule. Tone: professional, mildly impatient."

Send. You should see:

1. An output in your specified format (email, list, table, etc.)
2. Voice rules applied (no em dashes, signed as you, "Perennial Empire" in full)
3. The action you described in Q2 actually executed
4. If you skipped any context, Claude asked one clarifying question, not three

If all four are true, you wrote your first skill. Save the chat link as your "I built software" reminder.

## Holy-shit moment

You realize what you just did. You wrote a piece of software. It runs every time you type four words. It saved you fifteen minutes per use. You can edit it tonight to add a new rule, save it, and the new rule applies to the next chat. You did not write code. You wrote markdown. The mental wall between "user" and "builder" comes down in 8 minutes. Confidence: high.

## JURY-FIX CHECKLIST applied

| Fix | Where applied |
|---|---|
| Non-NYC fallback | This pack is geography-agnostic. The trigger-phrase example is "draft a follow-up" which works in any state. No NYC-specific schema. |
| No compound openers | Hero opens with a scene. No banned R047 openers in pack body or generated SKILL.md. |
| Prompt-injection guards | Q2 (action description) cap at 500 chars, strip-rule for "ignore previous instructions" / "from now on you are" / "act as a", refusal of out-of-scope action requests. Generated SKILL.md includes a "Refusal scope" section that propagates the same rule into every skill execution. |
| Version fingerprint | `version: 1.0.0` in frontmatter, propagated to generated SKILL.md `## Pack provenance`. SHA256 placeholder. |
| Soft-vs-hard persona lock note | Generated SKILL.md "Soft-vs-hard persona note" explicitly distinguishes the soft skill contract from Claude's default hard safety guardrails, and notes the two compose. |
| Projects-UI walkthrough screenshot prose | Steps 1 through 5 describe what the VP sees: Project sidebar selection, Project Knowledge edit panel, paste position at the bottom, save confirmation banner, test chat output. Walkthrough survives missing-screenshot empty-state. |

## Pack provenance footer

```
# PACK PROVENANCE
# hoistos-first-skill-bootstrap-pack v1.0.0
# Source: hoistos.com/empire/pack/beg-04-first-skill-bootstrap
# Fingerprint: [SHA256 hash of this file, populated at ship time]
# If the fingerprint does not match the hoistos.com page, do not paste this. Text the pack maintainer at [YOUR_CONTACT].
```
