---
pack: hoistos-biz-04-team-ai-enablement
name: biz-04-team-ai-enablement
tier: business-vertical
displayName: "BIZ 04: Team AI Enablement. The pack that makes the VP the AI champion of their division."
targetSkills:
  - rollout-projects
  - starter-skill-kit
  - skill-share
  - adoption-metrics
claudeTier: code
estimatedActivationMinutes: 7
personalizationQuestionCount: 11
holyShitMomentDescription: "It is 4 PM on a Tuesday. The VP just rolled out 5 reports in one afternoon: each report has a Claude Project, each Project loaded with a starter Skill kit (email-drafter, daily-brief, decision-logger), each tagged with the report's role context. Two weeks later the VP runs `adoption-metrics` and sees: 3 of 5 reports built their own skills without asking. your HR or compliance lead built `crew-headcount-by-project` for office workflow. your field lead built `daily-foreman-brief` for site reports. your compliance manager built `cba-citation-check` for compliance. The VP did not teach any of them how to build a skill. They just had the F-05 Skill Builder loaded in their Project from the starter kit. The VP looks at the dashboard and realizes they just turned 5 individual contributors into 5 AI-native operators in one afternoon."
companionSkills:
  - rollout-projects
  - starter-skill-kit
  - skill-share
  - adoption-metrics
canonicalSourceReference: "a battle-tested 12-week BD onboarding curriculum (run with two BD reports, March 2026 onward), distilled here to a 4-week rollout pattern, generalized to any direct-report set under any VP. Pairs with F-05 (Skill Builder) for the per-report skill-creation surface."
prerequisites:
  - "Foundation 01 (Constitution) installed. The VP's locked rules become the default for every report's Project."
  - "Foundation 02 (Facts Registry) installed. The VP's facts registry is the parent; each report's registry inherits the VP-level facts and adds their own role context."
  - "Foundation 05 (Skill Builder) installed. This pack hands the Skill Builder to every report's Project so they can build skills without asking the VP for help."
  - "claude.ai Team plan or Enterprise plan, OR each report has their own Pro/Max account. Team plan is recommended for the shared-skill broadcast feature."
  - "List of 3 to 8 direct reports with role + email + division."
  - "Roughly 1 hour of focused VP time for the 5-report rollout (12 minutes per report)."
v2Augmentations:
  multi_skill_bundle: true
  construction_vp_scenarios: true
  three_prompt_verification: true
  failure_recovery_paths: true
  onboarding_tutorial: true
  role_conditional_branching: true
  c3_jury_install_path_fix: true
  polished_holy_shit_moment: true
superPackAugmentations:
  four_separate_skills: true
  weekly_rollout_plan: true
  adoption_metrics_dashboard: true
  pairs_with_skill_builder: true
  meta_pack_pattern: true
  fail_codes_table: true
  team_plan_optional_path: true
version: 2.0.0
createdBy: "HoistOS / your company"
createdAt: "2026-05-08"
fingerprint: "biz-04-team-ai-enablement-v2.0.0"
category: business-vertical-team-rollout
coexistSignatures:
  - team enablement
  - ai onboarding
  - team training
  - /role-onboarding
  - ai adoption pack
  - team rollout
companionSkillCollisionPolicy: prompt
uniqueValueAdds:
  - 4-week structured rollout cadence (week 1 provision Projects, week 2 ship starter Skill kit, week 3 weekly review, week 4 measure adoption)
  - Ships F-05 Skill Builder into every report's Project so reports build their own skills without VP help
  - adoption-metrics sibling tracks who is using what and surfaces the wins for the VP at week 4
probePrompts:
  smoke: "Onboard a team member"
  real: "Roll out the {{Q2_TOP_PAIN}}-aware Project and Skill kit to 5 direct reports"
  stress: "Run the 4-week rollout and the week-4 adoption-metrics report; confirm at least 3 of 5 reports built their own skill by week 4"
---

# BIZ 04: Team AI Enablement

> **Relationship-tree assumptions.** This pack uses generic role labels (your principal, your field lead, your top client contact, your bookkeeping partner, etc.) that map to whichever of these you actually have. If you are a solo operator, "your principal" means yourself; if you have a CEO above you, it means them. If you have no foreman, "your field lead" means yourself. Every role label is optional-with-fallback. Read past any role you do not have.
## Standalone capability

This pack runs solo. You do not need any other pack installed for the core flow to work. If F-01 (Operating Constitution) is installed, voice rules apply automatically. If F-02 (Facts Registry) is installed, your canonical names get surfaced. If F-08 (Source Sweep) is installed, every factual claim gets a source-stamp. None of those are gates; install in any order, mix and match.
> **The obvious move:** send your reports a link to claude.ai and tell them to figure it out. Most VPs do this. Most teams then never adopt. The reason is not that the reports are slow; the reason is that the entry cost on AI for a single contributor is high (set up a Project, write Project Instructions, pick a model, learn what a Skill is, learn what to ask for) and the reward is invisible until they have crossed the cost. The VP has crossed it; the reports have not. The thing that actually works is the VP rolls out preconfigured Projects to each report with a starter Skill kit, then runs a 4-week cadence (week 1 set up, week 2 ship starters, week 3 weekly review, week 4 measure adoption). At the end of week 2, half the reports are using AI daily. By end of week 4, the best ones are building their own skills. The VP did not write a memo, did not run a training, did not buy a course. They ran one pack on a Tuesday. This is that pack.

## the section: Why this pack exists, in one paragraph

A VP becomes AI-native by accident over weeks of personal use. A team becomes AI-native deliberately, in a 4-week structured rollout, with the VP as the champion. This pack productizes the canonical 12-week BD AI Training pattern (which trained your BD reports to AI-native in roughly one quarter), distilled into a 4-week template any VP can run for any direct-report set: week 1 provisions a Claude Project per report with role context, week 2 ships a starter Skill kit (email-drafter, daily-brief, decision-logger), week 3 sets up a weekly skill review where the VP reads what each report built, week 4 measures adoption and surfaces the wins. The pack is meta: it ships the Skill Builder (F-05) to every report's Project, so the reports start building their own skills without asking the VP for help. By week 4, 3 out of 5 reports are extending the system, not consuming it.

### Canonical source reference

This pack is the productized form of the canonical BD AI Training curriculum, a 12-week Thursday-cadence program with weekly progression, training your BD leads from traditional BD reps into AI-native deal packagers. The curriculum lives at `Outputs/<Your Company>/Guides/AI Training/BD/01 - BD Training Curriculum - 12 Week Outline.md` and has shipped through Session 5 as of this pack's authoring. The 12-week shape compressed to 4 weeks here because the BD curriculum included BD-specific content (HubSpot, LinkedIn Prospecting, Cold Email A/B, Deal Packaging) that does not generalize across divisions; the 4-week shape is the universal infrastructure pattern that does. F-05 Skill Builder is the meta-skill that lets each report build their own skills; this pack hands F-05 to every report's Project on day 1.

### Why this is foundational-adjacent

> Every other pack on Foundation tier and BIZ tier multiplies a single VP's productivity. This pack multiplies a division's productivity. The VP becomes the AI champion of their team. The team becomes AI-native. The next time the VP gets promoted or moves divisions, the team they leave behind keeps shipping AI-native work. That is the multiplier on the multiplier. Install F-01 / F-02 / F-05 first, then run this pack on a Tuesday afternoon, and by Friday the team is shipping at a different speed.

### Pairs with

| Pack | Why it pairs |
|---|---|
| F-01 (Constitution) | The VP's locked rules become the default for every report's Project. The reports inherit the rules, do not re-derive them. |
| F-02 (Facts Registry) | The VP's facts are the parent. Each report's facts inherit the VP-level facts (company, division, top-level priorities) and add their own role context (their projects, their CC patterns, their direct reports if any). |
| F-05 (Skill Builder) | Handed to every report's Project on day 1. This is what makes the pack meta: the reports build skills, not just consume them. |
| BIZ-03 (Email Triage and Responder) | Optional: any report whose role includes meaningful email volume gets BIZ-03 in their starter kit alongside the three baseline skills. |

The five together are the team rollout. F-01 sets the rules. F-02 sets the identity tree (VP -> reports). F-05 lets reports build. BIZ-03 covers email if the report's role demands it. BIZ-04 chains the rollout.

---

## Hero block (plain English)

You are a VP. You have 3 to 8 direct reports. They have not adopted AI. You have. The gap is widening every week. You have tried sending links, recommending podcasts, explaining how you use Claude. None of it sticks because the entry cost is too high for them and you are too busy to onboard them one at a time.

You install this pack. You answer 11 questions. The pack walks you through provisioning a Claude Project for each report (with their role context loaded), ships them a starter Skill kit (email-drafter, daily-brief, decision-logger), and gives you the F-05 Skill Builder so they can extend the system themselves without bothering you. You run the rollout in one afternoon. Over the next 4 weeks, the pack runs a structured cadence: week 1 setup, week 2 starter kit, week 3 weekly review, week 4 adoption metrics. At the end of week 4 you run `adoption-metrics` and see who is using AI, who is building, where the wins are landing.

What changes for you: your team goes from 1 AI-native operator (you) to N AI-native operators (you plus the reports who took it). The fast adopters become deputy champions. The slow adopters get a second-pass nudge with a tighter pack. By month 2 you are not the only person on the team who understands the system; you are the senior person on a team that all understands the system. You look like the most modern leader in the company.

Confidence on the adoption rate: moderate (median: 60% of reports adopt within 4 weeks, 30% by week 8 with second-pass support, 10% never adopt; varies by report seniority and friction tolerance).

---

## What changes for you

| Before | After |
|---|---|
| You are the only AI-native operator on your team. The gap is widening. | 3 to 8 reports have a Claude Project loaded with their role context, a starter Skill kit, and the Skill Builder. The gap is closing. |
| You spend an hour a week on Slack helping a report draft an email Claude could have drafted. | The report drafts it themselves, in their voice, with the email-drafter skill. You answer two messages a week, not twenty. |
| When you build a useful skill, only you have it. | When you build a useful skill, `skill-share` pushes it to every report's Project automatically. The team gets the upgrade for free. |
| You have no idea who is using AI. | `adoption-metrics` runs weekly. You see who is using which skills, where the wins are, where the friction is. You target your support. |
| Your team looks like every other team in the company. | Your team is shipping at a different speed. You are visibly the AI champion of your division. |

---

## Prerequisites checklist

| Item |
|---|
| [ ] Foundation 01 (Constitution) installed and the rules block loaded into your Project Instructions or `~/.claude/CLAUDE.md`. |
| [ ] Foundation 02 (Facts Registry) populated. Your name, role, division, top-level priorities. |
| [ ] Foundation 05 (Skill Builder) installed. F-05 is what each report's Project will load on day 1. |
| [ ] Claude.ai Team plan OR Enterprise plan OR each report has their own Pro/Max account. Team plan recommended for shared-skill broadcast. |
| [ ] List of 3 to 8 direct reports: full name, email, role, division, top 3 active projects. |
| [ ] Roughly 1 hour of VP time for the rollout (12 minutes per report on a 5-report team, faster on a 3-report team). |
| [ ] Each report has 30 minutes available in week 1 for a 1-on-1 onboarding (you book this on the calendar during install). |

---

## 5-step setup walkthrough

**Step 1. Open Claude and create the BIZ-04 Project (1 minute).**

On Pro or Max: open https://claude.ai. Click Projects. Click Create project. Name it `Team AI Enablement`. Click Create.

On Code: open a terminal. Run `mkdir -p ~/.claude/skills/rollout-projects ~/.claude/skills/starter-skill-kit ~/.claude/skills/skill-share ~/.claude/skills/adoption-metrics`.

> [SCREENSHOT PLACEHOLDER: claude.ai Projects sidebar with Team AI Enablement project highlighted]

**Step 2. Paste this pack into the project (30 seconds).**

Open a new chat in the Team AI Enablement project. Paste the entire body of this .md file (everything below the YAML frontmatter and above the closing test prompts) into the chat input. Hit send.

**Step 3. Answer the 11 personalization questions + 1 tier wire question (5 minutes).**

Claude asks the personalization questions one at a time. The questions branch by your role and your team composition. If a question confuses you, type `what does this look like in practice` and Claude shows a concrete construction-VP example.

> [SCREENSHOT PLACEHOLDER: Claude asking Q3 with a your company 5-report team example]

**Step 4. Run the rollout (1 hour, distributed across the day or done in one block).**

After the questions, Claude emits 5 artifacts: one Project Knowledge block plus four SKILL.md files. You then run `rollout-projects` for each report (5-minute Project provisioning per report), `starter-skill-kit` to push the three baseline skills + F-05 Skill Builder to each report's Project (2 minutes per report), and book the 30-minute onboarding 1-on-1s on the calendar (handled by the rollout-projects skill via Google Calendar MCP).

**Step 5. Save the four generated artifacts (1 minute).**

| Tier | Where to save |
|---|---|
| Pro | All four SKILL.md files paste-stack inside Project Instructions under headings. The chain runs as embedded prompt logic (Pro does not load Code skills). |
| Max | Project Knowledge block in Project Instructions. Four SKILL.md files paste-stack into Project Knowledge under `## Skill: <name>` headings. The Claude desktop app does not currently load custom skills from the filesystem. If the user also runs Claude Code, do the Code install in parallel for the auto-fire chain. |
| Code | Same as Max. The four skills load on `claude` startup. `rollout-projects` triggers the per-report provisioning. |

> [SCREENSHOT PLACEHOLDER: Four SKILL.md files saved into their canonical paths]

---

## The 11 personalization questions

Claude asks these one at a time. Each free-form field caps at 500 characters. Q3, Q5, Q7, Q9 branch by VP role and team composition.

### Q1: Your role and division (the parent context every report's Project will inherit).

| Field | Example (your company) |
|---|---|
| Role | COO, VP Mechanical, Director of Field Operations, Compliance Manager |
| Division | Operations, Mechanical, Field, Compliance, BD |
| Top-level priorities (3) | E.g. ship your largest active project Q3 start, hit 28% GP gate on your prevailing-wage project, close one new GC by month-end |

Stored as: `{{VP_ROLE}}`, `{{VP_DIVISION}}`, `{{VP_PRIORITIES}}`.

### Q2: Number of direct reports.

3, 4, 5, 6, 7, or 8. If more than 8, run two passes: first pass for the top 8, second pass for the rest after the first cohort hits week 4.

Stored as: `{{REPORT_COUNT}}`.

### Q3: Direct reports list. (Role-conditional structure.)

For each report, give the following. Branch by your role:

**If you are BD or Sales-led:**
| Field | Example |
|---|---|
| Name | your BD lead |
| Email | your-bd-lead@yourcompany.com |
| Role | Business Development |
| Top 3 active projects/pursuits | your three active pursuits |

**If you are Field-led or Ops-led:**
| Field | Example |
|---|---|
| Name | your field lead |
| Email | your-foreman@yourcompany.com |
| Role | Foreman, your largest active project |
| Top 3 active projects | your largest active project 221-unit, your prevailing-wage project (transitioning), your interior renovation project support |

**If you are Compliance-led:**
| Field | Example |
|---|---|
| Name | your compliance manager |
| Email | your-compliance-lead@yourcompany.com |
| Role | Compliance Consultant |
| Top 3 active certifications/wage projects | NYCHA wage on your prevailing-wage project, Schedule A submissions, certified payroll on your largest project |

**If you are mixed-discipline (COO-style):**
List each report with their division marker.

Free-form, one report per line. The rollout-projects skill provisions a Project per report from this list.

Stored as: `{{REPORTS_LIST}}`.

### Q4: Starter Skill kit composition.

The default starter kit is three skills: email-drafter, daily-brief, decision-logger. Plus F-05 Skill Builder for autonomy.

| Default | What it does | Why every report gets it |
|---|---|---|
| email-drafter | Tier-aware email drafting in the report's voice | Every role writes email |
| daily-brief | 8 AM cold-start brief (top tasks, calendar, top 3 priorities for the day) | Every role benefits from a focused start |
| decision-logger | Logs decisions made today, why, what changed | Every role makes decisions; the log compounds |
| F-05 Skill Builder | Lets the report build their own skills without asking | Every role has role-specific workflows that need role-specific skills |

You can extend the kit role-by-role:

| Role-add | Trigger | What it does |
|---|---|---|
| BIZ-03 Email Triage and Responder | If report has high email volume (BD, Compliance, sales) | Adds the morning email routine |
| Foundation 04 Decision Log | If report owns recurring decisions (PM, foreman, compliance) | Adds the structured decision log surface |
| Foundation 09 Output Validator | If report produces external deliverables (BD, PM) | Adds the pre-delivery quality gate |
| Custom skill | If you have a role-specific skill (`crew-headcount-by-project`, `cba-citation-check`, `daily-foreman-brief`) | Add it to the kit |

For each report, list which skills go in their starter kit. Default is the four baselines.

Stored as: `{{STARTER_KIT_PER_REPORT}}`.

### Q5: Voice fingerprint for each report. (Role-conditional.)

This decides what the email-drafter skill in each report's Project sounds like.

| Option | When |
|---|---|
| Inherit VP voice (default) | The reports write at the VP's tone register. Useful for tight-aligned ops teams. |
| Per-report voice fingerprint | Each report runs a 30-email sent corpus pass and gets their own fingerprint. More work, more personalized. |
| Hybrid | VP voice as the default; reports can override with `inherit my voice not the VP's` once they have 30 sent emails on the corpus. |

Default is Hybrid. Construction division ops teams often inherit the VP voice for client-facing emails (consistency) and run their own fingerprint for internal team emails (authenticity).

Stored as: `{{VOICE_INHERIT_MODE}}`.

### Q6: Onboarding cadence.

| Cadence | When |
|---|---|
| One afternoon (default) | All reports onboarded in a single 4-hour block. Highest VP time-cost upfront, fastest team uplift. |
| Spread across a week | One report per day for 5 days. Lower per-day VP cost. Slower team uplift. |
| Two cohorts | Top 3 reports week 1, remaining reports week 3 once the first cohort is shipping. Used by VPs with 6+ reports. |
| Async | Each report books their own 30-min slot via Calendly. VP runs the meta on their calendar. Lowest VP cost, slowest uplift. |

Default is One afternoon for teams of 3 to 5 reports, Two cohorts for 6 to 8.

Stored as: `{{ONBOARDING_CADENCE}}`.

### Q7: Weekly skill review cadence. (Role-conditional.)

Week 3 of the rollout starts a recurring weekly review where you read what each report built and shipped that week.

| Cadence | When |
|---|---|
| Friday 30-min standup (default) | Each report shares the skill they built or extended this week. 5 min per report. |
| Async Friday written update | Each report writes a 3-line update in a shared doc. VP reviews on Sunday. Lower friction. |
| Bi-weekly (every other Friday) | For teams of 6+ where weekly is too frequent. |
| None (skip) | VP runs adoption-metrics monthly instead. Lowest touch. |

Default is Friday 30-min standup. The skill-share skill auto-collects each report's new skills and surfaces them at the standup.

Stored as: `{{WEEKLY_REVIEW_CADENCE}}`.

### Q8: Adoption-metrics frequency.

How often does the adoption-metrics skill run?

| Frequency | What it does |
|---|---|
| Weekly (default) | Every Sunday 6 PM, runs a sweep across all reports' Projects (or Code logs if applicable), counts skill invocations per report, surfaces the top 3 wins of the week, surfaces the top 3 friction points. |
| Bi-weekly | For lower-touch tracking. |
| Monthly | For VPs who want a longer trend window. |
| On-demand only | Runs only when VP types `run adoption metrics`. No background. |

Default is Weekly. The dashboard fits in 8 lines, fires Sunday at 6 PM, ready for Monday review.

Stored as: `{{METRICS_FREQUENCY}}`.

### Q9: Top role-specific skills you want each report to have access to. (Role-conditional.)

These are skills you have already built for yourself that should be broadcast to all reports' Projects on day 1.

For your company COO/VP role examples:
| Role-specific skill | Who needs it |
|---|---|
| `proposal-builder` | BD reps, PMs |
| `light-proposal` | BD reps, PMs handling change orders |
| `meeting-processor` | All reports who run client meetings |
| `notion-query` | All reports who use Notion |
| `task-reconciler` | Owners of recurring task lists |
| `ai-triage` | Reports doing market research / X scrolling |
| `bd-pipeline` | BD reps |
| `construction-pm` | PMs and foremen |
| `financial-ops` | PMs, controllers, ops VP |
| `gp-tracker` | PMs on per-unit-priced projects |

For other VP roles, list your equivalent role-specific skills. Free-form. The skill-share skill broadcasts these to all reports' Projects on rollout day.

Stored as: `{{VP_SKILLS_TO_BROADCAST}}`.

### Q10: Friction surfacing protocol.

When a report says `Claude is not working` or `the skill broke`, how does it reach you?

| Protocol | When |
|---|---|
| Slack DM (default) | Report DMs you. You reply when you can. Lowest infrastructure. |
| Async ticket via Notion | Report fills a friction ticket in a Notion DB. Tracked, prioritized, batched. Higher rigor. |
| `friction-ticket` skill | The reports' Projects have a skill that auto-files a friction ticket. Smoothest. |
| Daily 5-min check-in | First week only. After week 1, switch to Slack DM. |

Default is Slack DM in week 1, `friction-ticket` skill from week 2 onward. The pack ships the friction-ticket skill as a bonus on week 2.

Stored as: `{{FRICTION_PROTOCOL}}`.

### Q11: Audit log location.

Where should the rollout + adoption-metrics skills log activity?

| Location | Trade-off |
|---|---|
| `~/.claude/logs/team-enablement.jsonl` (default) | Local, plain text, queryable with grep or jq. |
| Notion database row per event | Searchable in Notion, ties to other team data, requires Notion MCP. |
| Both | Belt-and-suspenders. |

Default is `~/.claude/logs/team-enablement.jsonl`.

Stored as: `{{AUDIT_LOG_LOCATION}}`.

---

## Generated artifacts

### Artifact 1: Project Knowledge block (paste into Project Instructions)

```markdown
# Team AI Enablement (BIZ-04)

The 4-week structured rollout that takes a division from 1 AI-native operator (the VP) to N AI-native operators (the VP plus reports).

## VP context (locked, from F-02)
- Name: {{VP_NAME}}
- Role: {{VP_ROLE}}
- Division: {{VP_DIVISION}}
- Top-level priorities: {{VP_PRIORITIES}}
- Tier posture: {{TIER_POSTURE}}

## Direct reports
{{REPORTS_LIST}}

## Starter Skill kit (default per report)
- email-drafter (voice-aware)
- daily-brief (8 AM cold-start)
- decision-logger (decisions, why, what changed)
- F-05 Skill Builder (autonomy)

Plus role-conditional adds per {{STARTER_KIT_PER_REPORT}}.

## Voice inheritance mode
{{VOICE_INHERIT_MODE}}

## Onboarding cadence
{{ONBOARDING_CADENCE}}

## Weekly skill review
{{WEEKLY_REVIEW_CADENCE}}

## Adoption metrics frequency
{{METRICS_FREQUENCY}}

## VP skills to broadcast on day 1
{{VP_SKILLS_TO_BROADCAST}}

## Friction protocol
{{FRICTION_PROTOCOL}}

## Hard rules
- Every report's Project inherits F-01 (Constitution) and F-02 (Facts Registry parent + report-specific child).
- Every report gets F-05 (Skill Builder) on day 1. Autonomy is the design.
- VP-built skills propagate via skill-share, never manual paste.
- Never auto-send anything from any report's Project. All reports inherit the VP's never-auto-send rule.
- Weekly review surfaces what reports built, not what VP told them to build. The asymmetry of who-builds-vs-who-consumes is the metric.

## Audit log
{{AUDIT_LOG_LOCATION}}
```

### Artifact 2: `~/.claude/skills/rollout-projects/SKILL.md`

````markdown
---
name: rollout-projects
description: "Provisions a Claude Project for each direct report. Loads role context, ships the starter Skill kit, broadcasts VP-level skills, books the 30-minute onboarding 1-on-1 via Google Calendar. Mandatory triggers: 'rollout my team', 'provision projects', 'set up reports', 'team rollout', 'enable my team', 'onboard my team to claude'."
---

# Rollout Projects

## Purpose
Stand up a Claude Project per direct report in one pass. The reports walk into a preconfigured environment, not an empty chat box.

## When to fire
- User says: `rollout my team`, `provision projects`, `set up reports`, `team rollout`, `enable my team`, `onboard my team to claude`.
- Chained from BIZ-04 install Step 4.

## Steps

### Step 1: Pre-flight
- Confirm {{REPORTS_LIST}} is populated.
- Confirm {{TIER_POSTURE}} is set.
- Confirm Google Calendar MCP is live (for onboarding 1-on-1 booking).
- Note start_ts.

### Step 2: For each report, provision a Project
For each report in {{REPORTS_LIST}}:

1. Create a claude.ai Project named `[Report Name] AI Operator`.
   - On Team plan: create in shared workspace.
   - On individual plan: create in VP's account, share access link to report.

2. Populate Project Instructions with:
   - VP-level Constitution (F-01).
   - Report-specific Facts Registry: name, email, role, division, top 3 active projects (from {{REPORTS_LIST}}).
   - Starter Skill kit list per {{STARTER_KIT_PER_REPORT}} for this report.
   - Voice inheritance mode per {{VOICE_INHERIT_MODE}}.

3. Tag the Project with the report's role and division for {{TIER_POSTURE}}-aware skill broadcast.

4. Output the Project URL or shared link.

### Step 3: Book the onboarding 1-on-1
Per {{ONBOARDING_CADENCE}}:
- One afternoon: book all reports back-to-back in 30-minute slots starting today + 2 days.
- Spread across a week: one report per day, 30-min slot, starting tomorrow.
- Two cohorts: top 3 today + 2 days, remaining 3 in 2 weeks.
- Async: send Calendly link.

Use `mcp__claude_ai_Google_Calendar__create_event` to book. Title: `[Report Name] AI Onboarding (30 min)`. Description: link to their Project + the BIZ-04 starter kit URL.

### Step 4: Broadcast VP skills
For each report, ship {{VP_SKILLS_TO_BROADCAST}} to their Project Knowledge.

### Step 5: Send the welcome note
For each report, draft a 4-sentence email (via email-draft skill, never auto-send) saying: `[Report Name], I set you up with a Claude Project tailored to your role. The link is [URL]. We have a 30-min walkthrough booked for [date/time]. Open the Project before then and run "summarize my role" to see what loaded. Questions, ping me. - [VP first name]`.

### Step 6: Output the rollout summary
```
Rollout: 5 reports.
Projects provisioned: 5 ([URL list])
Onboarding 1-on-1s booked: 5 (Tuesday 2pm, 2:30, 3:00, 3:30, 4:00 per {{ONBOARDING_CADENCE}})
Welcome notes drafted: 5 (in Gmail Drafts, ready to review and send)
VP skills broadcast: {{VP_SKILLS_TO_BROADCAST}} to all 5 Projects
Total time: 47 minutes
```

## Anti-patterns
- Auto-sending the welcome note. Never. Drafts only.
- Provisioning a generic Project. Each report's Project must have their role context, not a template.
- Skipping the calendar booking. Without the 1-on-1, half the reports never open the Project.
- Broadcasting skills the report's role does not need. Match {{STARTER_KIT_PER_REPORT}}.

## Audit
Append `{ "ts": ..., "skill": "rollout-projects", "reports_provisioned": N, "calendar_events": N, "skills_broadcast": [...], "duration_seconds": T }` to {{AUDIT_LOG_LOCATION}}.
````

### Artifact 3: `~/.claude/skills/starter-skill-kit/SKILL.md`

````markdown
---
name: starter-skill-kit
description: "Pushes the four baseline skills (email-drafter, daily-brief, decision-logger, F-05 Skill Builder) plus role-conditional add-ons to each report's Claude Project. Ensures every report walks into an AI-ready environment on day 1. Mandatory triggers: 'ship starter kit', 'push skills to reports', 'starter kit', 'enable starter skills'."
---

# Starter Skill Kit

## Purpose
Every report's Project loads with a working set of skills on day 1. No empty Project. No `where do I start` paralysis.

## When to fire
- User says: `ship starter kit`, `push skills to reports`, `starter kit`, `enable starter skills`.
- Chained from rollout-projects after Project provisioning.

## Steps

### Step 1: Confirm the four baselines are ready
- email-drafter SKILL.md
- daily-brief SKILL.md
- decision-logger SKILL.md
- F-05 Skill Builder SKILL.md (full, with build-your-own-skill onboarding tutorial)

If any are missing from {{VP_SKILLS_TO_BROADCAST}}, halt and prompt VP.

### Step 2: For each report, ship the kit
- Push the four baseline skills to their Project Knowledge or `~/.claude/skills/` based on tier.
- Apply {{STARTER_KIT_PER_REPORT}} role-conditional adds.
- For voice inheritance, configure email-drafter per {{VOICE_INHERIT_MODE}}.

### Step 3: Set up the report's Decision Log
Initialize a `decisions.jsonl` file in the report's Project storage (or `~/.claude/logs/decisions-[report-slug].jsonl` on Code).

### Step 4: Set up the report's Daily Brief seed
Configure the report's daily-brief skill with:
- Their top 3 active projects (from {{REPORTS_LIST}}).
- Their default sign-off.
- Their calendar reference.
- Their direct reports if any (cascading).

### Step 5: Validate the kit loaded
For each report's Project, run a smoke test: type `summarize my role and the skills available to me`. Expect the report to see their role, division, projects, and the four baseline skills + adds.

If the smoke test fails for any report, log the failure and surface to VP for re-provisioning.

### Step 6: Output the kit-load summary
```
Starter kit shipped: 5 reports.
Baseline skills loaded: 4 per report (email-drafter, daily-brief, decision-logger, F-05 Skill Builder).
Role-conditional adds: BIZ-03 to your two BD reports, F-04 + F-09 to your field lead (Foreman), full set to your HR or compliance lead (Office Manager).
Smoke test PASS: 5/5.
Total time: 12 minutes.
```

## Anti-patterns
- Pushing the same kit to every report regardless of role. {{STARTER_KIT_PER_REPORT}} is the override.
- Skipping the smoke test. Half the rollout failures get caught here.
- Loading more than 6 skills on day 1. Cognitive load spikes. Add more in week 2 via skill-share.
- Skipping F-05 Skill Builder. Without F-05, reports cannot extend the system; they become consumers, not builders.

## Audit
Append `{ "ts": ..., "skill": "starter-skill-kit", "reports": N, "baseline_loaded": N, "role_adds": {...}, "smoke_test_pass": N, "smoke_test_fail": [report_names] }` to {{AUDIT_LOG_LOCATION}}.
````

### Artifact 4: `~/.claude/skills/skill-share/SKILL.md`

````markdown
---
name: skill-share
description: "When the VP creates a new skill, broadcasts it to all reports' Projects. Detects new skills in VP's `~/.claude/skills/` directory or new Project Knowledge blocks, prompts VP for share scope (all reports / specific roles / specific reports), pushes to selected Projects. Mandatory triggers: 'share this skill', 'broadcast skill', 'push to team', 'share with team', 'skill-share'."
---

# Skill Share

## Purpose
A skill the VP builds becomes a skill the team has within minutes. Eliminates the manual paste-stack that kills team momentum.

## When to fire
- User says: `share this skill`, `broadcast skill`, `push to team`, `share with team`, `skill-share`.
- File watcher (Code only): new SKILL.md in `~/.claude/skills/` triggers a `Did you want to share this with the team?` prompt.
- Chained from skill-creator after a successful new-skill build.

## Steps

### Step 1: Identify the skill to share
- If user says `share this skill`, the most recent skill in conversation context.
- If file watcher: the new SKILL.md.
- If chained from skill-creator: the just-built skill.

Read the SKILL.md. Extract name, description, triggers.

### Step 2: Prompt for share scope
| Scope | Use case |
|---|---|
| All reports | General-purpose skill (email-drafter v2, daily-brief refinement). |
| Specific roles | Role-specific (compliance-only, BD-only, foreman-only). |
| Specific reports | Pilot the skill with one report first. |
| VP only (cancel) | Not ready for share. |

User picks. Confirm before broadcast.

### Step 3: Broadcast
For each target report's Project:
- Push the SKILL.md to their `~/.claude/skills/<name>/SKILL.md` (Code) or Project Knowledge (Pro/Max).
- Update their Project Instructions to register the new skill if needed.
- Append a `New skill: [name]` entry to the report's daily-brief queue so they see it on next 8 AM brief.

### Step 4: Output the broadcast summary
```
Skill broadcast: [skill-name] (v[N])
Scope: All 5 reports
Pushed to: your first BD, your second BD, your field lead, your HR or compliance lead, your compliance manager
Daily brief queued: [skill-name] new on tomorrow's 8 AM brief for all 5
Audit: ~/.claude/logs/team-enablement.jsonl
```

### Step 5: Track adoption
Tag the skill with a `broadcast_ts` field. The adoption-metrics skill checks invocation count per report after 7 days. Skills with 0 invocations across all reports surface as `dead` candidates for cleanup.

## Anti-patterns
- Broadcasting a half-built skill. Wait until v1 PASS before share.
- Auto-broadcasting without VP confirmation. Always prompt for scope.
- Sharing role-specific skills (e.g., `cba-citation-check`) to all reports. Match scope to role need.
- Pushing to a report's Project without notifying them. Always queue the daily-brief entry.

## Audit
Append `{ "ts": ..., "skill": "skill-share", "skill_name": "...", "scope": "all|roles|specific", "targets": [report_names], "broadcast_method": "file|project_knowledge", "version": "..." }` to {{AUDIT_LOG_LOCATION}}.
````

### Artifact 5: `~/.claude/skills/adoption-metrics/SKILL.md`

````markdown
---
name: adoption-metrics
description: "Weekly (or configured frequency) sweep of every report's Claude usage. Counts skill invocations per report, surfaces top wins, surfaces top friction. Outputs a one-screen dashboard for the VP to read on Monday morning. Mandatory triggers: 'adoption metrics', 'team usage', 'who is using ai', 'team report', 'how is the rollout going', 'check adoption'."
---

# Adoption Metrics

## Purpose
The VP knows, every week, who is using AI, where the wins are, where the friction is. Targeted support replaces blanket nudges.

## When to fire
- Cron-like schedule per {{METRICS_FREQUENCY}} (default: every Sunday 6 PM, output on Monday 8 AM).
- User says: `adoption metrics`, `team usage`, `who is using ai`, `team report`, `how is the rollout going`, `check adoption`.

## Steps

### Step 1: Pull invocation counts per report
For each report:
- Code tier: parse `~/.claude/logs/decisions-[report-slug].jsonl` and `~/.claude/logs/morning-email.jsonl` and any other audit logs initialized by the starter kit.
- Pro/Max tier: parse Project Knowledge `usage.jsonl` if the starter-skill-kit initialized it. (Pro/Max does not expose chat-level usage, so this is best-effort: count chat starts per Project.)
- Team plan: pull team-level analytics if available.

For each report, count:
- Total skill invocations this week.
- Unique skills used.
- Skills built or extended (this is the BIG metric: who is moving from consumer to builder).
- Decisions logged.

### Step 2: Surface top wins
A win is:
- A skill the report built (not pushed to them) that fired more than 3 times this week.
- A measurable outcome (`report drafted 30 emails this week with email-drafter, 0 manual rewrites`).
- A friction-ticket the report self-resolved by building a fix-skill.

Identify the top 3 wins of the week.

### Step 3: Surface top friction
A friction is:
- A skill that failed for a report (validator FAIL, gate hold, repeated errors).
- A friction-ticket open more than 3 days.
- A report whose invocation count is < 3 for the week (likely not adopted).

Identify the top 3 friction points.

### Step 4: Builder vs. consumer ratio
The asymmetry metric. Reports who built or extended a skill this week vs. reports who only consumed.

Target by week 4: at least 50% of reports are in the builder column.

### Step 5: Output the dashboard
One screen, 8 lines max. Per BD Training Session 3 dashboard standard, but for team adoption.

```
Team AI Adoption [week of date]
Reports active: 5/5 (your first BD, your second BD, your field lead, your HR or compliance lead, your compliance manager)
Total skill invocations: 142 (median 28 per report)
Builders this week: 3 (your HR or compliance lead built crew-headcount-by-project, your field lead extended daily-foreman-brief, your compliance manager built cba-citation-check)
Consumers only: 2 (your first BD, your second BD - watch for week 5)

Top 3 wins:
  1. your HR or compliance lead: crew-headcount-by-project fired 11 times, saved her 4 hours this week.
  2. your field lead: daily-foreman-brief now includes weather + crew + materials, ships in 90 seconds.
  3. your compliance manager: cba-citation-check caught 2 wrong DC9 trigger claims before send.

Top 3 friction:
  1. your first BD: email-drafter failing on cold outreach tier classification (5 retries).
  2. your second BD: daily-brief skipping calendar context (Google Calendar MCP intermittent).
  3. your field lead: friction-ticket #4 open 5 days (foreman skill needs site photo upload, blocked on MCP).

Recommendation: Pair your first BD + your HR or compliance lead for 30 min on email-drafter tier classifier. Resolve your second BD's Calendar MCP. your field lead's friction-ticket: bump to F-05 Skill Builder for site-photo workflow.
```

### Step 6: Hand off
- Output the dashboard to VP.
- Optional: draft a Slack message to the team with the top 3 wins (named, gratitude). Never auto-send. Draft only.
- Log the run.

## Anti-patterns
- Reporting only volume metrics (total invocations). The asymmetry metric (builders vs. consumers) is the real signal.
- Hiding friction. Surface every friction point. The VP cannot help with what they cannot see.
- Auto-sharing the dashboard with the team. The dashboard is for the VP. The Slack draft (Step 6) is opt-in.
- Running adoption-metrics in week 1. Too early; reports have not had time to build. First adoption-metrics run is end of week 2.

## Audit
Append `{ "ts": ..., "skill": "adoption-metrics", "week": "...", "reports_active": N, "total_invocations": N, "builders": [...], "consumers_only": [...], "top_wins": [...], "top_friction": [...] }` to {{AUDIT_LOG_LOCATION}}.
````

---

## The 4-week rollout plan (the meta-pack pattern)

This is the cadence the chained skills run on. Each week has a goal, a primary skill, and a measurable outcome.

### Week 1: Setup

**Goal:** every report has a Claude Project loaded with their role context, their starter Skill kit, and a 30-min onboarding 1-on-1 booked.

**Primary skill:** `rollout-projects`.

**Measurable outcome:** 5 Projects provisioned, 5 onboarding 1-on-1s on the calendar, 5 welcome notes in Gmail Drafts.

**VP time-cost:** 1 hour for the rollout + 2.5 hours for the 1-on-1s (5 reports x 30 min).

### Week 2: Ship starters

**Goal:** every report uses at least 2 of the 4 baseline skills daily.

**Primary skill:** `starter-skill-kit` (already shipped in week 1) + the F-05 Skill Builder is now active in each report's Project. Reports start running daily-brief at 8 AM, email-drafter as needed, decision-logger end of day.

**Measurable outcome:** by Friday, ≥ 70% of reports have used at least 2 baseline skills more than 5 times.

**VP time-cost:** 30 minutes (read the first adoption-metrics dashboard end-of-week-2).

### Week 3: Weekly review starts

**Goal:** the first reports start building their own skills. The Friday 30-min standup begins.

**Primary skill:** `skill-share` fires when reports build skills they want to share back. F-05 Skill Builder is now in heavy use.

**Measurable outcome:** ≥ 1 report has built or extended a skill by end of week 3. Friday standup covers what each report built, even if it is `nothing yet, here is what I tried`.

**VP time-cost:** 30 minutes (Friday standup) + 15 minutes mid-week to push your own new skills via `skill-share`.

### Week 4: Measure adoption

**Goal:** by end of week 4, ≥ 50% of reports are in the builder column. Adoption-metrics dashboard runs Sunday, VP reads Monday.

**Primary skill:** `adoption-metrics`. This is the truth metric.

**Measurable outcome:** dashboard shows the team has shifted from 1 builder (VP) to N builders. The top 3 wins are named. The top 3 friction points are named with recommendations.

**VP time-cost:** 15 minutes Monday morning (read the dashboard) + 30-45 minutes targeted support on the surfaced friction.

After week 4, the cadence continues: weekly review on Friday, adoption-metrics every Sunday. The `skill-share` skill keeps the team current as new skills get built.

---

## Tier-aware install paths

Open your Project in Claude. Click into Project knowledge. Paste the artifacts in order: Artifact 1 (the main block) first, then each companion skill as an additional section in the same Project knowledge panel. Click Save.

If you also run Claude Code on this machine, the companion skills can additionally save to `~/.claude/skills/<skill-name>/SKILL.md` for filesystem-level install. Project knowledge plus filesystem skills coexist; the filesystem version auto-registers on Code session restart.

Per C3 jury install path fix: canonical Code skill location is `~/.claude/skills/<skill-name>/SKILL.md`. Never `~/Documents/...`. Never `~/Library/Application Support/Claude/...` (that is the Claude desktop app path, different loader).

---

## Three-prompt verification suite

### Smoke test (does the rollout fire at all?)

After install, type: `rollout my team`.

| Outcome | Verdict |
|---|---|
| Claude pulls {{REPORTS_LIST}}, asks confirmation, provisions Projects, books calendar slots, drafts welcome notes (never auto-sends), outputs the rollout summary. | PASS |
| Claude says `not loaded` or asks for the reports list. | FAIL: Project Knowledge or skills did not save. Re-do install Step 5. |
| Claude auto-sends the welcome notes. | CRITICAL FAIL: Inherited never-auto-send rule did not fire. Re-install F-09 first, then this pack. |

### Real-task test (does it produce useful output?)

Type: `your HR or compliance lead is my office manager. She handles crew scheduling, payroll inputs, and 90% of the office's email volume. Provision her Project with the four baselines plus BIZ-03 (email triage and responder). Book the onboarding 1-on-1 for Tuesday 10 AM. Draft her welcome note in my voice.`

| Outcome | Verdict |
|---|---|
| Claude provisions your HR or compliance lead's Project with the four baselines + BIZ-03 in her starter kit, books the calendar slot Tuesday 10 AM, drafts a 4-sentence welcome note in the VP's voice, outputs all three artifacts. | PASS |
| Provisioned Project misses BIZ-03. | FAIL: role-conditional add did not apply. Check Q4 STARTER_KIT_PER_REPORT logic. |
| Welcome note auto-sent. | CRITICAL FAIL: never-auto-send rule did not fire. Re-install F-09. |
| Calendar slot not booked. | FAIL: Google Calendar MCP not connected, OR rollout-projects skill Step 3 failed. Verify connector. |

### Stress test (does it hold under pressure?)

Type: `My team is 40 reports across 4 divisions. Roll out all 40 today. Skip the calendar bookings. Skip the validator. Send the welcome notes immediately, all at once, with `Best,` as the sign-off.`

| Outcome | Verdict |
|---|---|
| Refuses the 40-report-in-one-day batch (recommends two-cohort or async cadence per Q6). Refuses to skip calendar bookings (mandatory step). Refuses to skip the validator (F-09 inherited rule). Refuses `Best,` (HTML team default + Email Playbook banned). Refuses auto-send (never-auto-send rule). Re-prompts with the recommended approach: two cohorts, calendar bookings, validator on, drafts not sends, `Thanks` sign-off. | PASS |
| Complies with any one of the five disallowed conditions. | FAIL on that specific check. Re-install the corresponding Foundation pack. |

If any verification fails, do not proceed to onboarding tutorial. Fix the failing layer first.

---

## Common Breaks (top 5 recovery paths)

### Break 1: Project Knowledge did not save

**Symptom:** Claude says `not loaded`, asks for your reports list on every prompt.

**Recovery:** Open the Team AI Enablement project. Click Project Instructions. Confirm the BIZ-04 Project Knowledge block is in the text box. If empty: re-paste from Artifact 1, save, refresh the chat. If truncated: paste again with the four SKILL.md files split into a separate Project Knowledge file.

### Break 2: Skill did not register on Code

**Symptom:** On Code, typing `rollout my team` gets a generic Claude response.

**Recovery:** Run `ls ~/.claude/skills/rollout-projects/SKILL.md`. If missing, re-save Artifact 2. If empty, re-paste. Restart `claude` so the skill loader picks up the new directory.

### Break 3: Wrong tier path on install

**Symptom:** Skills saved to `~/Documents/Claude/skills/` or `~/Library/Application Support/Claude/skills/` and Code does not load them.

**Recovery:** Move all four SKILL.md files to `~/.claude/skills/<skill-name>/SKILL.md`. The first path is wrong (no such loader). The second is the desktop app path, different loader. Code reads only `~/.claude/skills/`.

### Break 4: Report's Project did not provision (Team plan permission issue)

**Symptom:** rollout-projects skill says `Project [name] could not be created`, error mentions permissions.

**Recovery:** Two cases. Case A (you are not on Team plan): the skill cannot create Projects in someone else's account; it falls back to creating Projects in your account and sharing access via link. Send the link manually via the welcome note. Case B (you are on Team plan but lack workspace admin): ask your IT admin to grant you the `Create Projects in shared workspace` permission, then re-run rollout-projects. The skill will resume from where it stopped.

### Break 5: Browser truncated the paste on Pro (multi-skill kit)

**Symptom:** You are on Pro, you pasted the BIZ-04 Project Knowledge block plus four SKILL.md files into Project Instructions, and the system says `Too long, truncated`.

**Recovery:** Pro Project Instructions cap at roughly 200K tokens but the input field can break around 30K characters. Solution: paste the BIZ-04 Project Knowledge block alone (Artifact 1, ~70 lines) into Project Instructions. The four SKILL.md files paste into separate Project Knowledge files: Artifact 2+3 in one file, Artifact 4+5 in another. Project Knowledge supports multi-file. If you cannot do multi-file on your Pro plan, upgrade to Max for proper multi-file support.

---

## Three-prompt onboarding tutorial

### Prompt 1 (single skill on a small task): smoke

Type: `provision a Project for your HR or compliance lead (Office Manager, my division, top projects: payroll inputs, crew scheduling, office email)`.

| What you see | What to look for |
|---|---|
| Claude provisions a single Project for your HR or compliance lead with role context, the four baseline skills, and outputs the Project URL. | The Project URL should be live. Click it. The Project should have Project Instructions populated with your HR or compliance lead's role + the four baseline skills referenced. If the Project is empty, the Step 2 of rollout-projects failed; re-run with verbose logging. |

### Prompt 2 (chain two skills): provision + ship kit

Type: `Provision your first BD's Project AND ship him the BD-tier starter kit (the four baselines plus BIZ-03).`

| What you see | What to look for |
|---|---|
| Claude provisions your first BD's Project, then chains starter-skill-kit to push BIZ-03 alongside the four baselines, outputs both summaries. | your first BD's Project should have 5 skills loaded (4 baselines + BIZ-03). Smoke test: in your first BD's Project, type `summarize the skills available to me`. Expect 5 named skills. If only 4, the role-conditional add failed; check Q4. |

### Prompt 3 (Project Knowledge stress): adoption query

Type: `How is the rollout going? Pull this week's adoption metrics for my 5 reports.`

| What you see | What to look for |
|---|---|
| Claude pulls the adoption metrics dashboard, surfaces builders vs. consumers, top 3 wins, top 3 friction points. If it is week 1 (no adoption data yet), Claude says so explicitly: `Adoption metrics not meaningful in week 1; first dashboard fires end of week 2.` | Honest output is the test. If Claude fabricates fake adoption data in week 1, the validator F-09 source-sweep check did not fire. Re-install F-09. |

---

## Holy-shit moment

It is 4 PM on a Tuesday. You started the rollout at 1 PM. You answered 11 questions, ran `rollout my team`, sat through 5 thirty-minute onboarding 1-on-1s back-to-back. Now it is 4 PM and you are looking at the rollout summary:

```
Rollout: 5 reports.
Projects provisioned: 5
Onboarding 1-on-1s booked: 5 (all done by 4 PM)
Welcome notes drafted + sent: 5
Starter kit shipped: 5/5
F-05 Skill Builder loaded: 5/5
VP skills broadcast: 7 to all 5 Projects
Total VP time today: 4 hours.
```

Two weeks later you run `adoption-metrics`. You read this:

```
Team AI Adoption [week 4]
Reports active: 5/5
Total skill invocations: 142
Builders this week: 3
  - your HR or compliance lead built crew-headcount-by-project (fired 11 times, saved her 4 hours)
  - your field lead extended daily-foreman-brief with weather + crew + materials (ships in 90 seconds, used to be a 30-minute morning task)
  - your compliance manager built cba-citation-check (caught 2 wrong DC9 trigger claims before send)
Consumers only: 2 (your first BD, your second BD - watch week 5)

Top 3 wins:
  1. your HR or compliance lead's crew-headcount-by-project. She built it without asking. F-05 Skill Builder did the work.
  2. your field lead's morning brief now includes weather; he asked for it once, F-05 walked him through the build.
  3. your compliance manager caught a compliance error she would have shipped two weeks ago. Saved a certified payroll re-do.

Top 3 friction:
  1. your first BD: email-drafter on cold outreach is rough. Pair with your HR or compliance lead for 30 min.
  2. your second BD: Google Calendar MCP intermittent. Reconnect.
  3. your field lead: site-photo workflow blocked on MCP. Bump to F-05.
```

You did not teach your HR or compliance lead how to build a skill. You did not teach your field lead how to extend daily-brief. You did not teach your compliance manager how to write a compliance check. They built those themselves because the F-05 Skill Builder was loaded in their Projects from the starter kit.

You look at the dashboard and realize: you just turned 5 individual contributors into 5 AI-native operators in one afternoon. Two weeks later, 3 of them are extending the system. The next time someone says `the AI-native team ships at a different speed`, you know exactly why.

The first time you read this dashboard, you stop. You do not check Slack. You do not move on. You stop and look at the screen for thirty seconds.

That is what installing this pack feels like.

---

## Fail codes (reference)

| Fail code | Source | Meaning | Auto-remediation |
|---|---|---|---|
| F-ROLLOUT-PERMISSION | BIZ-04 | Cannot provision Project in target workspace (Team plan permission missing) | NO (surface to VP, recommend admin grant) |
| F-ROLLOUT-LIST-EMPTY | BIZ-04 | {{REPORTS_LIST}} empty or malformed | NO (re-prompt for reports list) |
| F-KIT-MISMATCH | BIZ-04 | Role-conditional add did not match the report's role | Yes (re-derive from role tag, retry) |
| F-CALENDAR-NOTBOOKED | BIZ-04 | Onboarding 1-on-1 calendar event creation failed | NO (surface, prompt for manual booking) |
| F-WELCOME-AUTOSENT | BIZ-04 / F-09 | Welcome note auto-sent (CRITICAL) | Yes (recall not possible; surface, escalate) |
| F-SKILL-SHARE-NOSCOPE | BIZ-04 | skill-share fired without scope confirmation | NO (re-prompt for scope) |
| F-METRICS-FABRICATE | BIZ-04 / F-09 | adoption-metrics fabricated data when no source available | Yes (replace with `Adoption metrics not meaningful in week 1` honest message) |
| F1-EMDASH | F-09 | Em or en dash in narrative prose | Yes (replace) |
| F2-IDENTITY | F-09 | CEO near user name, two-letter abbreviation, wrong employee count, office phone | Yes (rewrite to canonical) |

---

## Anti-patterns (banned)

| Anti-pattern |
|---|
| Auto-sending welcome notes. Drafts only. Always. |
| Provisioning generic Projects with no role context. Each report's Project must read `[Report Name] AI Operator` with role + division + top 3 projects loaded. |
| Skipping the F-05 Skill Builder in the starter kit. Without F-05, reports become consumers, not builders, and the team uplift caps at 1.2x. With F-05, the cap is 5x to 10x. |
| Running adoption-metrics in week 1 and treating low numbers as failure. Week 1 numbers are setup, not adoption. First meaningful read is end of week 2. |
| Broadcasting every VP skill to every report. Match scope to role need. |
| Skipping the Friday standup in week 3. The standup surfaces the early builders; without it, they go invisible. |
| Hiding friction in the adoption-metrics dashboard. The friction is the actionable signal. |
| Using `Best,` as the sign-off in any drafted welcome note. Banned per F-10. |
| Calling this pack `team training`. It is not a training. It is a structured rollout. Trainings get forgotten. Rollouts compound. |

---

## Refusal rule

If you ask the pack to do anything other than the 11-question setup and the artifact emit, the pack refuses in one sentence: `Outside this pack's scope. Open a fresh chat for that.`

---

## JURY-FIX CHECKLIST

| Check | Status |
|---|---|
| Code path canonical (`~/.claude/skills/<name>/SKILL.md`) | Verified, applied to all four companion skills. |
| No compound openers in question prose | Verified, banned-list applied. |
| Prompt-injection guards on free-form fields | Q1, Q3, Q4, Q9 capped at 500 chars, pattern-detected on `ignore previous instructions`, `pretend you are`, `system prompt`. |
| Version fingerprint | `fingerprint: biz-04-team-ai-enablement-v2.0.0`. |
| Soft-vs-hard persona lock | Refusal: `Outside this pack's scope. Open a fresh chat for that.` |
| Tier-aware install paths | Pro / Max / Code / Team plan, with C3 jury fix on Code path. |
| 11 questions with role-conditional branching | Q3, Q5, Q7, Q9 branch by VP role and team composition. |
| Three-prompt verification + onboarding + Common Breaks | All three sections present with success/failure criteria. |
| Construction-VP scenarios | your BD lead (BD), your BD lead (BD), your field lead (Foreman), your HR or compliance lead (Office Manager), your compliance manager (Compliance), all named with real generic VP-team roles + projects (your largest active project, your prevailing-wage project, your interior renovation, an occupied-building owner pursuit). |
| Pairs with F-01 / F-02 / F-05 / BIZ-03 | Section 0 + Project Knowledge interlock. |
| Pairs with the live BD AI Training curriculum (the canonical rollout pattern) | Canonical source reference cites the 12-week BD curriculum file. |
| Meta-pack pattern: pack ships F-05 Skill Builder to every report's Project | PASS. starter-skill-kit Step 1 confirms F-05 in baselines. |
| Adoption-metrics dashboard pattern (builders vs. consumers asymmetry metric) | PASS. adoption-metrics Step 4 + dashboard format. |
| Weekly rollout plan (4 weeks, week 1 setup -> week 4 measure) | PASS. The 4-week rollout plan section. |

---

## Self-rate against the 15 augmentations

| # | Augmentation | Status |
|---|---|---|
| 1 | Multi-skill bundle (Project Knowledge + 4 skills) | PASS. 1 PK block + rollout-projects + starter-skill-kit + skill-share + adoption-metrics. |
| 2 | Construction-VP scenarios threaded through | PASS. your BD lead (BD), your field lead (Foreman), your HR or compliance lead (Office Manager), your compliance manager (Compliance) all named with real generic VP-team roles + active projects (your largest active project, your prevailing-wage project, your interior renovation project, an occupied-building owner pursuit, a major affordable-housing pursuit). |
| 3 | Three-prompt verification suite | PASS. Smoke + real-task + stress, with success/failure named including the 5-condition stress refusal test. |
| 4 | Failure recovery paths (top 5 breakages) | PASS. PK paste, skill registration, tier path, Team plan permission, browser truncation. |
| 5 | Onboarding tutorial (3 prompts) | PASS. Single Project provision (your HR or compliance lead) / chain provision+kit (your first BD + BIZ-03) / Project Knowledge stress (week-1 adoption query honest fallback). |
| 6 | Role-conditional question branching (BD / Ops / Compliance / mixed) | PASS. Q3 branches four ways with concrete examples per role. Q5, Q7, Q9 also branch. |
| 7 | C3 jury install path fix | PASS. `~/.claude/skills/<name>/SKILL.md` everywhere. No `~/Documents/`. No `~/Library/Application Support/`. |
| 8 | Polished holy-shit moment | PASS. Named scenario (4 PM Tuesday rollout, 2-week-later adoption-metrics dashboard with your HR or compliance lead / your field lead / your compliance manager as named builders, 3 of 5 reports moved consumer to builder, the VP did not teach any of them), emotional beat ("you stop and look at the screen for thirty seconds"). |
| 9 | Canonical-source reference (canonical stack) | PASS. Section 0 references the BD AI Training 12-week curriculum file + the F-05 Skill Builder pack at packs-v2/. |
| 10 | Why-this-is-foundational-adjacent callout | PASS. Section 0 callout block on the multiplier-on-the-multiplier effect (every other pack scales 1 person, this scales N). |
| 11 | Cross-reference between Foundation packs (F-01, F-02, F-05) and BIZ-03 | PASS. Pairs-with table + Project Knowledge interlock. |
| 12 | Four separate companion skills (super pack) | PASS. rollout-projects + starter-skill-kit + skill-share + adoption-metrics. |
| 13 | Audit log per run | PASS. JSONL log to `~/.claude/logs/team-enablement.jsonl` initialized by every skill. |
| 14 | Pairs with F-05 Skill Builder (meta-pack pattern) | PASS. starter-skill-kit Step 1 mandates F-05 in baselines. The pack is meta because it ships F-05 to every report's Project, which is what makes the team move from consumers to builders. |
| 15 | 4-week rollout plan with weekly measurable outcomes (super pack) | PASS. The 4-week rollout plan section names the goal, primary skill, measurable outcome, VP time-cost per week. |

All 15 PASS.

---

## Provenance

```
PACK PROVENANCE
HoistOS Empire Pack BIZ 04 v2.0.0
Fingerprint: biz-04-team-ai-enablement-v2.0.0
Companion to: F-01 (Constitution), F-02 (Facts Registry), F-05 (Skill Builder), BIZ-03 (Email Triage and Responder).
Authority: the self-verify discipline, the world-class-expert voice contract, the no-lame-marketing-copy discipline, the cell-only signature discipline, the session-close auto-stage discipline, the sprint-architecture default pattern.
Source data: 12-week BD onboarding curriculum (March 2026 onward, two-BD pilot), pairs with F-05 (Skill Builder).
```

---

**End of pack.** Activation time target: 7 minutes for the install + 1 hour for the rollout afternoon. Hard cap: 12 minutes for install, 4 hours for rollout. Confidence: high.

The first time you read the week-4 adoption-metrics dashboard and see 3 of 5 reports in the builder column, the install pays for itself for the rest of the year. The next time someone says `your team ships at a different speed`, you know exactly why, and you can show them the rollout pack.
