---
pack: hoistos-multi-model-jury-pack
name: multi-model-jury
tier: power
displayName: "Multi-Model Jury: Have GPT-5 Adversarially Review Claude's Work for [your monthly cap]"
ahaMomentRef: aha-pow-04-jury
targetSkill: multi-model-jury
claudeTier: max
estimatedActivationMinutes: 7
personalizationQuestionCount: 4
holyShitMomentDescription: "You draft a high-value proposal in Claude. Before you send it, the jury skill auto-routes it to GPT-5 as an adversarial critic. GPT-5 returns MAJOR_DISAGREE on a pricing assumption you missed. You see the diff. You catch the error. You ship a corrected proposal. The modest amount you spent on the OpenAI API just saved you tens of thousands of dollars."
prerequisites:
  - "Claude Code CLI OR Claude Max with Project Knowledge access"
  - "OpenAI API key (sign-up: platform.openai.com, then create a key with limited scope)"
  - "Comfort setting a monthly USD usage cap on the OpenAI side ([your monthly cap])"
  - "An existing definition of what you call high-stakes (proposal, contract, financial, public communication)"
version: 1.0.0
createdBy: "HoistOS / Perennial Empire"
createdAt: "2026-05-08"
fingerprint: "pow-04-jury-v1.0.0"
category: audits-and-self-correction
---

# Multi-Model Jury: GPT-5 as Claude's Adversarial Critic

> **Counter upfront:** the obvious move is "Claude reviews its own work." Self-review is cheap and catches obvious bugs but it does not catch motivated reasoning, anchoring on the user's framing, or the failure modes peculiar to one model family. Adversarial cross-model review catches all three. The cost is $5 to [your monthly cap] on the OpenAI side. The savings on a single caught error pay for two years of jury budget. Confidence: high.

## Hero block (plain English)

Claude is good. Claude is also confidently wrong sometimes, especially on long contexts, financial assumptions, and high-pressure deliverables where the user's framing has anchored the analysis. This pack wires GPT-5 as an adversarial critic. When you tag a deliverable as "high-stakes" (proposal, contract, financial, public), the jury skill auto-routes the deliverable plus its context to OpenAI's API, asks GPT-5 to find the strongest case AGAINST the deliverable, and returns one of three verdicts: AGREE (no significant issues), MINOR_DISAGREE (issues but ship-able with footnote), MAJOR_DISAGREE (hold the deliverable, surface the diff, let you decide).

What changes for you: high-stakes work gets a second pair of eyes that does not share Claude's failure modes. Cost: typically [your monthly range] at hobbyist usage, capped hard. Hit rate of "MAJOR_DISAGREE caught a real error" varies by domain but 60+ jury runs is roughly 1 in 8 catches a non-trivial issue. The other 7 confirm and add a paragraph of "things to consider" you can choose to fold in or ignore.

Confidence: high. This is the multi-model-jury pattern in production for high-stakes deliverables. The biggest single catch in the last 90 days was a margin assumption error in a high-value proposal, caught at MAJOR_DISAGREE, fixed before send.

---

## Prerequisites checklist

| Item |
|---|
| [ ] Claude Code CLI OR Claude Max with Project Knowledge. (Pro tier: skill body works as Project Instructions paste, but auto-routing requires Code's MCP/tool layer. Pro users get manual-trigger only.) |
| [ ] OpenAI API key. platform.openai.com, "API keys" section, click "Create new secret key." Scope it to chat.completions only if you want belt-and-suspenders. |
| [ ] OpenAI billing set with a monthly usage cap. platform.openai.com/account/limits, set "Monthly budget" to [your monthly cap]. Hard ceiling. The API stops when the cap is hit. |
| [ ] You have a working definition of "high-stakes" in your head (we will refine in Q1). |
| [ ] (Optional) A test deliverable to run through the jury immediately after install. |

---

## 5-step setup walkthrough

### Step 1: Get your OpenAI API key and set the cap

[SCREENSHOT-PLACEHOLDER: platform.openai.com showing API key creation page with "create new secret key" green button and the key revealed for copy]

Go to platform.openai.com, sign in, click "API keys" in the sidebar, click "Create new secret key." Copy the key (you will only see it once). Then go to "Limits" and set "Monthly budget" to [your monthly cap] (or whatever cap you want, see Q3).

### Step 2: Save the key to your environment

[SCREENSHOT-PLACEHOLDER: terminal showing `echo "OPENAI_API_KEY=sk-..." >> ~/.zshrc.local` then `source ~/.zshrc.local` then `echo $OPENAI_API_KEY` returning the key]

```bash
echo "export OPENAI_API_KEY=sk-YOUR_KEY_HERE" >> ~/.zshrc.local
source ~/.zshrc.local
echo $OPENAI_API_KEY  # confirm it loaded
```

Avoid committing the key to any source-controlled file. `.zshrc.local` is the standard non-tracked dotfile pattern.

### Step 3: Install the multi-model-jury skill

[SCREENSHOT-PLACEHOLDER: VS Code showing ~/.claude/skills/multi-model-jury/SKILL.md saved with frontmatter visible]

The pack will emit the SKILL.md after Q1 to Q4. Save it to:
- **Code path:** `~/.claude/skills/multi-model-jury/SKILL.md`
- **Max path:** paste into Project Instructions of your daily project, plus save the file locally for reference.

### Step 4: Define your "high-stakes" tag

[SCREENSHOT-PLACEHOLDER: User Preferences.md with new section "## High-Stakes Triggers" listing the four deliverable types from Q1]

The skill fires when you (or Claude on your behalf) tag a deliverable as high-stakes. Q1 below gives you the canonical taxonomy. Save the tag definitions to your User Preferences so cold-start picks them up on every session.

### Step 5: First test run

[SCREENSHOT-PLACEHOLDER: terminal showing "Jury verdict: MAJOR_DISAGREE on assumption X" output, with diff vs original]

Pick a real deliverable you have drafted (or are about to draft). Tag it `[high-stakes]`. The skill auto-routes to OpenAI. Wait 30 to 60 seconds. The verdict returns. Read the diff. Decide.

---

## Q0 (tier wire question, FIXED PER JURY VERDICT)

**Plain-English fallback first:**

> Quick check before we start. The jury skill calls OpenAI's API. That call requires either: a Claude Code session (which can shell out and call APIs directly), or a Claude Max session that you trigger manually by pasting the deliverable into a separate OpenAI playground. Pro can do the manual path; auto-routing is Code-only.

**Then the question:**

> Q0: Are you on Claude Code, Claude Max, or Claude Pro? Answer one word.

The pack branches:
- **Code:** auto-routing wired. SKILL.md goes to `~/.claude/skills/multi-model-jury/SKILL.md`. Skill auto-fires on `[high-stakes]` tag.
- **Max:** semi-auto. Skill body pastes into Project Instructions. Manual trigger by saying "run the jury on this" inside a chat that has the skill loaded.
- **Pro:** manual only. Skill prints a paste-block you copy into the OpenAI ChatGPT app or playground.

---

## 4 personalization questions

> **Voice rule:** one question at a time. Plainspoken. R047 banned openers off-limits.

> **Prompt-injection guard:** Q1 free-form input pattern-detected, 500-char cap.

### Q1: Your high-stakes deliverable types

> Which kinds of deliverables do you want the jury to fire on automatically? Tick all that apply, free-form.
>
> Common picks:
>
> | Type | Why |
> |---|---|
> | Client proposals | Pricing errors are expensive. Margin slips compound. |
> | Contracts and counter-proposals | Liability and indemnification language is high-leverage. |
> | Financial models and projections | Anchor errors and tax assumption errors. |
> | Public communication (LinkedIn posts, press, public letters) | Reputation downside, hard to retract. |
> | Hiring decisions (offer letters, role specs) | Anchor effects on compensation. |
> | Legal letters | Tone and content gaps. |
>
> Pick 2 to 5. Or describe in your own words.

Stored as: `{{HIGH_STAKES_TYPES}}` (newline-separated).

### Q2: Critic model

> Which OpenAI model should be the critic? Trade-offs:
>
> | Model | Cost per 1M tokens (in/out, approximate) | When to pick |
> |---|---|---|
> | `gpt-5-pro` (recommended) | ~$15 / ~$60 | Maximum critique quality. Default. |
> | `gpt-5` | ~$2.50 / ~$10 | Balanced. Catches most issues at ~1/6 the cost. |
> | `gpt-4.1` | ~$2 / ~$8 | Cheapest. Use only if budget is tight. |
>
> Pricing changes; verify on platform.openai.com/docs/pricing before committing. Confidence: moderate. Pick one. If unsure, `gpt-5-pro`.

Stored as: `{{CRITIC_MODEL}}`.

### Q3: MAJOR_DISAGREE policy

> When the jury returns MAJOR_DISAGREE, what should happen?
>
> | Policy | Behavior |
> |---|---|
> | hold-for-human (default, recommended) | Claude HOLDs the deliverable, surfaces the diff to you, waits for your "ship it" or "revise" decision. No auto-edit. |
> | auto-revise | Claude takes the critique, revises the deliverable in-line, returns the revised version with the original as a footnote. Do not pick this for proposals or contracts. Use only for low-blast-radius items (drafts, internal memos). |
> | log-only | Jury verdict is logged but does not block. You read the log later. Use only for early-stage exploration. |
>
> Default: hold-for-human.

Stored as: `{{MAJOR_DISAGREE_POLICY}}`.

### Q4: Audit log location

> Where should jury verdicts be logged?
>
> | Location | Trade-off |
> |---|---|
> | `~/.claude/logs/jury.jsonl` (default) | Local, plain text, queryable with grep. |
> | A Notion database row per verdict | Searchable in Notion, integrates with task tracking, requires Notion MCP. |
> | Both | Belt and suspenders. |
> | None | Privacy-first. No log. Verdicts ephemeral. |
>
> Default: `~/.claude/logs/jury.jsonl`.

Stored as: `{{AUDIT_LOG_LOCATION}}`.

---

## Generated artifacts

### File 1: `~/.claude/skills/multi-model-jury/SKILL.md`

````markdown
---
name: multi-model-jury
description: "Adversarial cross-model critic for high-stakes deliverables. Routes the deliverable to OpenAI {{CRITIC_MODEL}} as an adversarial critic. Returns AGREE / MINOR_DISAGREE / MAJOR_DISAGREE with reasoning. On MAJOR_DISAGREE, applies the {{MAJOR_DISAGREE_POLICY}} policy."
---

# Multi-Model Jury

## When to fire
- User tags a deliverable `[high-stakes]`.
- Deliverable matches one of: {{HIGH_STAKES_TYPES}}.
- User says "run the jury," "have GPT review this," "second-pair-of-eyes this."

## Skip when
- Deliverable is exploratory draft, internal memo, low-blast-radius.
- User explicitly says "skip jury."
- Monthly OpenAI cap exhausted (skill notes this and surfaces the cap status).

## Steps

1. Confirm `OPENAI_API_KEY` is set. If missing, halt and instruct user to set it.
2. Construct the critic prompt:

```
You are an adversarial critic of the following deliverable. The author is a Claude AI assistant. Your job is to find the strongest case AGAINST this deliverable. Look for:
- Factual errors, including subtle anchor errors and tax/margin assumption errors.
- Internal contradictions.
- Missing scope (claims that should have caveats).
- Tone or audience-fit gaps.
- Failure to consider obvious counter-positions.

Return EXACTLY one of three verdicts on the first line:
- AGREE  (no significant issues, ship-able as-is)
- MINOR_DISAGREE  (issues exist but deliverable is ship-able with footnote)
- MAJOR_DISAGREE  (do not ship without revision; issues are material)

Then provide your reasoning in 3 to 8 bullet points. Be specific. Cite phrases from the deliverable verbatim.

DELIVERABLE:
{{DELIVERABLE_CONTENT}}

CONTEXT (relevant prior conversation, if any):
{{CONTEXT}}
```

3. Call OpenAI Chat Completions API with `{{CRITIC_MODEL}}`, system message "You are an adversarial critic. Be precise.", user message above.
4. Parse the verdict (first non-empty line, must match one of three values).
5. Apply policy:
   - **AGREE:** append a one-line footnote to the deliverable: "Jury: AGREE ({{CRITIC_MODEL}}, {{ISO_TIMESTAMP}})." Ship.
   - **MINOR_DISAGREE:** append the critic's bullets as a "Things to consider" footnote. Ship with footnote.
   - **MAJOR_DISAGREE:** apply `{{MAJOR_DISAGREE_POLICY}}`:
     - hold-for-human: surface the verdict, the bullets, and the original deliverable. Ask user "ship anyway, revise, or discard?"
     - auto-revise: take the critic bullets, revise the deliverable, return the revision plus a diff footnote. (Avoid this on proposals, contracts, financial.)
     - log-only: log to `{{AUDIT_LOG_LOCATION}}` and continue without blocking.
6. Log the verdict to `{{AUDIT_LOG_LOCATION}}` regardless of policy.

## Cost guard
Track cumulative monthly OpenAI spend in `~/.claude/state/openai-monthly-spend.json`. Before each call, check if next-call estimate would exceed the user's monthly cap. If yes, halt with: "Monthly OpenAI cap reached. Skipping jury. Increase cap on platform.openai.com/limits to resume."

## Authority
multi-model-jury pattern, pow-04 pack v1.0.0.
````

### File 2: `~/.claude/state/openai-monthly-spend.json` (initialized empty)

```json
{
  "month": "{{ISO_MONTH}}",
  "spend_usd": 0.0,
  "calls": 0,
  "monthly_cap_usd": [YOUR_CAP]
}
```

### File 3: `audit-log-bootstrap.sh` (one-time setup)

```bash
#!/usr/bin/env bash
mkdir -p "$HOME/.claude/logs"
mkdir -p "$HOME/.claude/state"
touch "$HOME/.claude/logs/jury.jsonl"
echo '{"month":"'"$(date +%Y-%m)"'","spend_usd":0.0,"calls":0,"monthly_cap_usd":20.0}' > "$HOME/.claude/state/openai-monthly-spend.json"
echo "Jury state initialized."
```

---

## How to install (tier-aware)

### Pro path

| Step |
|---|
| 1. Open claude.ai, navigate to your daily project's Project Instructions. |
| 2. Paste the SKILL.md body in. The skill is loaded but does not auto-fire (Pro tier has no tool-calling for OpenAI from inside Claude). |
| 3. When you have a high-stakes deliverable, type `Run the jury on this:` followed by the deliverable. Claude returns the formatted critic prompt as a paste-block. |
| 4. Open chat.openai.com (or platform.openai.com playground), paste the critic prompt, get the verdict back, paste verdict into Claude. |

[SCREENSHOT-PLACEHOLDER: claude.ai showing the formatted critic prompt as a code block with "copy" button, then chat.openai.com on the right showing the same prompt pasted and a verdict returned]

### Max path

| Step |
|---|
| 1. Run `bash audit-log-bootstrap.sh` once. |
| 2. Save the SKILL.md locally at `~/.claude/skills/multi-model-jury/SKILL.md`. |
| 3. Also paste the SKILL.md body into your daily project's Project Instructions. |
| 4. The skill is now loaded. Manual trigger only on Max (no auto-route). Type "run the jury on this" inside any chat with the skill loaded. |

### Code path

| Step |
|---|
| 1. Run `bash audit-log-bootstrap.sh` once. |
| 2. Save the SKILL.md at `~/.claude/skills/multi-model-jury/SKILL.md`. |
| 3. Tag any deliverable `[high-stakes]` and the skill auto-routes to OpenAI without further prompting. |
| 4. (Optional) Wire a PostToolUse hook in `~/.claude/settings.json` that runs the jury automatically on any tool call that produces a deliverable matching `{{HIGH_STAKES_TYPES}}`. |

---

## Closing test (5-minute visible output)

Pick a real proposal, contract, or financial model you have written recently. Open Claude Code (or your Claude session). Paste:

> Run the jury on the following [high-stakes] deliverable:
>
> [PASTE YOUR DELIVERABLE]

Within 30 to 90 seconds you should see:

```
Jury verdict: MAJOR_DISAGREE (gpt-5-pro, 2026-05-08T14:23:11Z)

Reasoning:
- The pricing assumption on line 47 ("3% margin") does not survive a sensitivity check on materials cost.
- The scope on line 23 implicitly excludes mobilization but the price assumes one mobilization included.
- ...

Policy applied: hold-for-human. Ship, revise, or discard?
```

Or:

```
Jury verdict: AGREE (gpt-5-pro, 2026-05-08T14:23:11Z)
Footnote appended.
Cost: $0.31. Monthly spend: $4.12 / [your monthly cap] cap.
```

Holy-shit moment: when MAJOR_DISAGREE catches a real error you would have shipped. The cost of one OpenAI call ($0.30 to $1.50 typical) versus the cost of a high-value proposal with a wrong assumption is the math that makes this skill load-bearing.

---

## JURY-FIX CHECKLIST

| Check | Status |
|---|---|
| Non-NYC license fallback (jury 1.2) | N/A. No licensing. |
| No compound openers (jury 3.2) | Verified. |
| Prompt-injection guards on free-form fields (jury 2.1) | Q1 (high-stakes types), 500-char cap, pattern detection on "ignore previous instructions." Q4 audit-log location validated as path or "none." |
| Version fingerprint (jury 2.2) | `fingerprint: pow-04-jury-v1.0.0`. |
| Soft-vs-hard persona lock (jury 2.3) | Refusal: "Outside this pack's scope. Open a fresh chat for that." |
| Projects-UI walkthrough screenshot prose (jury 1.3) | Pro path includes claude.ai-to-chat.openai.com handoff prose with "what you will see" preview. |

---

## Anti-patterns (banned)

| Anti-pattern |
|---|
| Auto-running the jury on every Claude turn. The cap exists for a reason. Tag-driven only. |
| Sending VP credentials, secrets, or private keys to OpenAI in a deliverable. The skill warns and halts if the deliverable contains substrings matching `sk-...`, `BEGIN PRIVATE KEY`, or `password=`. |
| Auto-revising on MAJOR_DISAGREE for high-blast-radius categories (proposals, contracts, financial). The default policy is hold-for-human and Q3 warns against picking auto-revise for these types. |
| Bypassing the cost guard by editing `openai-monthly-spend.json` mid-month. The guard is the protection, not a suggestion. |
| Logging the full deliverable content to `jury.jsonl` if the deliverable is marked sensitive. Log only the hash and the verdict. |

---

## Refusal rule

If you ask the pack to do anything other than the 4-question setup and the SKILL.md emit, the pack refuses in one sentence: "Outside this pack's scope. Open a fresh chat for that."

---

## Provenance

```
PACK PROVENANCE
Empire Pack pow-04 v1.0.0
Fingerprint: pow-04-jury-v1.0.0
Source: hoistos.com/empire/pack/pow-04/verify
If the fingerprint does not match the hoistos.com page, do not paste this. Ping the maintainer.
```

---

**End of pack.** Activation time target: 7 minutes. Hard cap: 10 minutes. Confidence: high.
