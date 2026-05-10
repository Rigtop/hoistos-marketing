---
id: hoistos-bonus-05-code-cli-setup
name: bonus-code-cli-setup
tier: bonus
priority: 5
displayName: "Bonus 05: Code CLI Setup. Claude Code installed, first MCP wired, first skill scaffolded, first hook installed."
category: bonus
bonusId: B-05
holyShitMomentHeadline: "Operator runs one curl command. 60 seconds later Claude Code is installed. They type one prompt. Claude reads their Notion workspace via MCP, returns a structured answer in 4 seconds. The operator never opened a browser."
holyShitMomentDescription: "Operator opens Terminal, runs the canonical Anthropic install command. The CLI installs in 60 seconds. They authenticate with claude /login. They drop a 5-line CLAUDE.md cold-start file at ~/.claude/CLAUDE.md. They run claude mcp add notion. They restart the session. They type 'list my Notion databases'. Claude calls the Notion MCP, returns the list. Total time from curl to first MCP-driven query: 8 minutes. The operator now has a Terminal-resident AI with filesystem access, MCP tool access, and the foundation for hooks, skills, sub-agents."
canonicalSourceRef: "Anthropic Code documentation on the canonical install command (curl-based install.sh, May 2026). Anthropic Help Center on `~/.claude/CLAUDE.md` boot file structure. Anthropic Code documentation on `claude mcp add` and `~/.claude.json` MCP server registration. Anthropic published Notion MCP server."
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
  auto_creation_skill: true
companionSkills:
  - cli-install-walkthrough
  - first-mcp-wire
  - first-skill-bootstrap
pairsWith:
  - "B-00 (Bonus Overview): the index that surfaced this blueprint"
  - "B-01 (Notion Foundation): the next install if you want the entity layer"
  - "B-03 (RAG Setup): requires Code CLI as prerequisite"
  - "B-04 (Telegram Bridge): requires Code CLI as prerequisite"
  - "B-07 (Hooks and Daemons): hooks live at ~/.claude/hooks/, this blueprint installs the first one"
prerequisites:
  - "macOS or Linux (Windows requires WSL)"
  - "Terminal app installed (Terminal, iTerm, Warp, Ghostty, etc.)"
  - "30 to 60 minutes of focused time"
  - "An Anthropic account (Pro, Max, or Code-tier subscription)"
lineCount: 720
dependencies: []
estimatedActivationMinutes: 50
personalizationQuestionCount: 2
version: 1.0.0
createdBy: HoistOS Bonus Extras v1.0
fingerprint: bonus-05-code-cli-setup-v1.0.0
---

# Bonus 05: Code CLI Setup. Claude Code installed, first MCP wired, first skill scaffolded, first hook installed.

> **Relationship-tree assumptions.** This pack uses generic role labels (you, your principal, your field lead, your top client contact, your bookkeeping partner). If you are a solo operator, "your principal" is yourself. Every role label is optional with fallback. Read past any role you do not have.
## Standalone capability

This blueprint is the prerequisite for B-03, B-04, B-06, B-07. It installs the Code CLI and wires the foundation for everything else. If you are on Pro or Max only, this blueprint is the bridge: install Code, then the rest of the bonus extras unlock. If you are already on Code with prior install, this blueprint is a fast confirmation pass plus first MCP wiring.
## Canonical-source reference

Four sources anchor this blueprint. Anthropic Code documentation defines the canonical curl install command and the post-install authentication flow. Anthropic Help Center defines the `~/.claude/CLAUDE.md` boot file structure (loaded automatically at session start). Anthropic Code documentation defines `claude mcp add` and the `~/.claude.json` MCP server registration format. Anthropic published Notion MCP server is the first MCP this blueprint wires.

The blueprint is opinionated. Anthropic's docs cover every option; the blueprint picks the path that lands fastest: curl install, paste cold-start, wire one MCP, scaffold one skill, install one hook. You can extend any time; the foundation is built.

## Why this is a blueprint layer

Most operators install Claude Code, run it once, type "hello," see a response, and never come back. The Terminal feels like the wrong shape; the install does not show its value in the first session. Three weeks later they uninstall.

The fix is to install Claude Code with a useful first session. Wire one MCP so the very first prompt does something the operator could not do in the chat app. Scaffold one skill so the operator sees that "this thing builds itself." Install one hook so the operator sees that the install is starting to defend their voice rules.

Most operators assume Code CLI is "for engineers." Wrong shape. Code CLI is for operators who type a lot, want filesystem access, and want their Claude to compose with their existing terminal workflow. If you live in the terminal already, Code is your tier. If you do not, the install still earns its keep because the MCP layer plus skills plus hooks unlocks 80 percent of the bonus extras blueprints.

The cheap fix is 30 to 60 minutes of install today. The expensive miss is two more years of clipboard-pasting between Pro web and your Terminal because nothing connects them.
> **Pairs with B-01, B-03, B-04, B-06, B-07.** B-01 needs Notion MCP wired (this blueprint wires the first MCP). B-03 needs Code CLI to host the RAG MCP. B-04 needs Code CLI to host the bridge daemon. B-06 needs Code CLI for filesystem-based memory. B-07 needs Code CLI for hooks and daemons.

## Hero

Most VPs assume Claude is a chat. Wrong shape. Claude is a foundation model with three product surfaces: Pro web (chat in browser), Max desktop (chat in app), Code CLI (chat in your Terminal with filesystem and shell and MCPs). All three are the same Claude underneath. The product surface is the difference.

Most operators try Pro web first, find it useful, and assume that is the whole story. They do not realize that Code CLI unlocks an order-of-magnitude more capability because it lets Claude read files, write files, run shell commands, call MCPs, fire hooks. The Pro web Claude can think; the Code CLI Claude can act on your machine.

The cheap fix is to install Code today and have your first MCP-driven query in 8 minutes. The expensive miss is to assume you have to be an engineer to use Code. Most operators figure out the Terminal in one afternoon and never go back to clipboard-pasting.
## What changes for you

| Before | After |
|---|---|
| Claude is a chat in a browser; you copy-paste content in and out | Claude is a command in your Terminal; it reads your files directly |
| You ask Claude "what's in my Notion" and you get general advice | You ask Claude "what's in my Notion" and it calls the Notion MCP and reads your actual workspace |
| Skills are something you wish you had | Skills are markdown files at `~/.claude/skills/` that you build in 8 minutes each |
| Voice rules are something you have to remember on every prompt | Voice rules are enforced by hooks at the OS level; the install holds the rule for you |
| Every new sub-system needs a new tool | Every new sub-system is a SKILL.md plus possibly a hook plus possibly a daemon, all in your `~/.claude/` directory |

## Prerequisites checklist

| Item |
|---|
| macOS or Linux. Windows users need WSL (Windows Subsystem for Linux); the install command runs inside WSL. |
| Terminal app installed. macOS ships Terminal by default; iTerm, Warp, Ghostty are popular alternatives. Linux desktop ships GNOME Terminal or similar. |
| 30 to 60 minutes of focused time. The actual install is 60 seconds; the rest is the first MCP plus first skill plus first hook walkthrough. |
| An Anthropic account (Pro, Max, or Code-tier subscription). Free tier does not support Claude Code. |
| Optional: a Notion workspace with admin access (used in the first MCP wire step). |

If any item is missing, fix it first. Specifically: if you are on Windows without WSL, install WSL via `wsl --install` from PowerShell, then run the curl command inside WSL.
## The five-step setup

| Step | What happens | Time |
|---|---|---|
| 1 | Install the CLI via curl | 60 seconds |
| 2 | Authenticate via `claude /login` | 90 seconds (browser-based OAuth) |
| 3 | Drop a 5-line cold-start file at `~/.claude/CLAUDE.md` | 5 minutes |
| 4 | Wire the first MCP server (Notion) | 5 minutes |
| 5 | Scaffold the first skill at `~/.claude/skills/first-skill/SKILL.md` and one hook at `~/.claude/hooks/em-dash-blocker.sh` | 10 minutes |

Total: 22 to 30 minutes for the install plus first MCP plus first skill plus first hook. After this you are ready to run any of B-01 through B-07.

## Personalization questions

Two questions. Answer in plain English. Hard cap: 200 characters per field.

| # | Question | Variable | Default if blank |
|---|---|---|---|
| Q1 | Which shell do you use, zsh or bash? | `{{SHELL}}` | `zsh` (macOS default since Catalina) |
| Q2 | Which terminal app do you use? Terminal, iTerm, Warp, Ghostty, or other? | `{{TERMINAL}}` | "Terminal" |

That is the full personalization surface. Everything else uses the locked defaults: install path, CLAUDE.md content, MCP server choice, first skill content, first hook content.

## Step 1: install the CLI

Open your Terminal. Run the canonical Anthropic install command:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

What happens:
1. The script downloads the `claude` binary to `~/.local/bin/` (or your platform's user-bin path).
2. It registers the path in your shell config (`~/.zshrc` or `~/.bashrc`).
3. It prints a "Restart your terminal" message.

Restart your Terminal (Cmd-Q + relaunch on macOS, or open a new tab). Type:

```bash
claude --version
```

You should see a version number. If you see "command not found," your shell did not pick up the new PATH. Add this line to your `~/.{{SHELL}}rc`:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Then `source ~/.{{SHELL}}rc` and try `claude --version` again.

## Step 2: authenticate

```bash
claude /login
```

This opens a browser window. Sign in to your Anthropic account. The browser confirms the auth, the CLI receives a token. Close the browser tab. Run:

```bash
claude
```

You should see a prompt. Type "hello." You should see a response. The CLI is live.

## Step 3: drop a cold-start file

Every Claude Code session reads `~/.claude/CLAUDE.md` at session start. The file is a markdown document; the contents become the system context for the session.

Create the directory and the file:

```bash
mkdir -p ~/.claude
cat > ~/.claude/CLAUDE.md << 'EOF'
# Cold Start

I am the operator at {{ORG_NAME}}.
My role: {{OPERATOR_ROLE}}.
My voice rules: no em dashes (U+2014, U+2013); confidence stamps on factual claims (high, moderate, low, unknown); first-person from me.

When I ask a factual question, you read the source first (filesystem, MCP, RAG if installed) before answering.

When I ask "where am I in <X>" you check Notion or RAG before guessing.

When I correct you, you write the correction to memory and propagate it.
EOF
```

Replace `{{ORG_NAME}}` and `{{OPERATOR_ROLE}}` with your actual values. The cold-start file is the foundation that every subsequent install (B-01 through B-07) appends to.

## Step 4: wire the first MCP (Notion)

Most useful first MCP: Notion. Wire it via Anthropic's published Notion MCP server.

```bash
claude mcp add notion
```

The CLI prompts you for OAuth. Click the link, sign in to Notion, grant access to the workspace(s) you want Claude to read. The CLI receives the OAuth token and writes the MCP entry to `~/.claude.json`.

Confirm:

```bash
claude mcp list
```

You should see `notion` in the list. Restart your Claude Code session for the MCP to register. Then:

```bash
claude
```

Type:

> List my Notion databases.

Claude should call the Notion MCP, return the list of databases in your workspace. Total time from curl install to first MCP-driven query: 8 minutes.

## Step 5: scaffold first skill and first hook

Skills live at `~/.claude/skills/<skill-name>/SKILL.md`. Hooks live at `~/.claude/hooks/<name>.sh`.

### First skill: a "hello" smoke test

```bash
mkdir -p ~/.claude/skills/first-skill
cat > ~/.claude/skills/first-skill/SKILL.md << 'EOF'
---
name: first-skill
description: When the user types "first skill smoke test" or "test my first skill", confirm the skill registry is working by responding with a structured answer. Use only for confirming the skills loader works on Code CLI.
version: 1.0.0
---

# first-skill

## When I fire

The user types any of:
- "first skill smoke test"
- "test my first skill"
- "verify skills installed"

## What I do

Respond with:

```
Skills registry: working.
Skill loaded: first-skill v1.0.0.
~/.claude/skills/ directory: confirmed.
```

Stamp confidence: high.

## Refusal scope

If asked to do anything other than confirm skill loader status, refuse and route the user to a different skill.
EOF
```

Restart your Claude Code session. Type:

> first skill smoke test.

You should see the structured response. Skills registry is live.

### First hook: em-dash blocker

PreToolUse hooks fire before Claude calls a tool. Exit 0 = allow; exit 2 = block. We install a hook that blocks Write/Edit operations if the content contains em dashes (U+2014 or U+2013).

```bash
mkdir -p ~/.claude/hooks
cat > ~/.claude/hooks/em-dash-blocker.sh << 'EOF'
#!/bin/bash
# PreToolUse hook for Write/Edit/MultiEdit. Blocks em dashes (U+2014, U+2013).

INPUT=$(cat)

# Extract content field via jq (PreToolUse hook input is JSON)
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // .tool_input.new_string // ""')

if echo "$CONTENT" | grep -qE '[\xE2\x80\x94\xE2\x80\x93]'; then
  echo "BLOCKED: em dash detected (U+2014 or U+2013). Use commas, periods, colons, or split sentences." >&2
  exit 2
fi

exit 0
EOF
chmod +x ~/.claude/hooks/em-dash-blocker.sh
```

Register the hook in `~/.claude/settings.json`:

```bash
mkdir -p ~/.claude
cat > ~/.claude/settings.json << 'EOF'
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "$HOME/.claude/hooks/em-dash-blocker.sh"
          }
        ]
      }
    ]
  }
}
EOF
```

Restart your Claude Code session. Now any Write or Edit that includes em dashes gets blocked at the OS level. Voice discipline holds without you remembering.

## Generated artifacts

The blueprint produces three companion skills.

### Artifact 1: companion skill `cli-install-walkthrough/SKILL.md`

```markdown
---
name: cli-install-walkthrough
description: When the user types "install Claude Code" or "set up Code CLI" or "I want to install the CLI", walk them through the five steps: curl install, authenticate, cold-start file, first MCP, first skill plus first hook. Refuse if they are not on macOS or Linux.
version: 1.0.0
---

# cli-install-walkthrough

## When I fire

The user types any of:
- "install Claude Code"
- "set up Code CLI"
- "I want to install the CLI"
- "scaffold my Code install"

## What I do

1. Confirm OS: ask "macOS, Linux, or Windows? If Windows, are you using WSL?". If Windows without WSL, refuse and route them to install WSL first.

2. Ask the two personalization questions: SHELL, TERMINAL.

3. Walk through Step 1: print the curl command. Wait for operator to confirm install completed.

4. Walk through Step 2: print the `claude /login` command. Wait for operator to confirm authentication completed.

5. Walk through Step 3: print the cold-start file. Help the operator fill in ORG_NAME and OPERATOR_ROLE.

6. Walk through Step 4: print the `claude mcp add notion` command. Help the operator complete the OAuth.

7. Walk through Step 5: print the first-skill and em-dash-blocker scaffolds. Confirm both register on restart.

8. Return summary: 5 steps complete, time taken, what the operator can run next (smoke test).

## Refusal scope

If the user asks to install on Windows without WSL, I refuse and route them to install WSL first via `wsl --install`.

If the user pastes a curl command from somewhere other than `claude.ai/install.sh`, I refuse: "Use the canonical Anthropic install command. Untrusted install scripts are a security gap."
```

### Artifact 2: companion skill `first-mcp-wire/SKILL.md`

```markdown
---
name: first-mcp-wire
description: When the user types "wire my first MCP" or "add Notion MCP" or any equivalent, walk them through `claude mcp add <name>`, the OAuth flow, and the verification step (`claude mcp list`). Triggers on "wire MCP", "add MCP", "first MCP", "connect to Notion".
version: 1.0.0
---

# first-mcp-wire

## When I fire

The user types any of:
- "wire my first MCP"
- "add Notion MCP"
- "connect to Notion"
- "wire MCP"

## What I do

1. Confirm Code CLI is installed (`claude --version` returns a version).

2. Print the `claude mcp add notion` command.

3. Walk through OAuth: link, sign in, grant access, token returned to CLI.

4. Confirm with `claude mcp list`. Verify `notion` appears.

5. Tell operator to restart Claude Code session.

6. After restart, run smoke test: `claude -p "list my Notion databases"`. Confirm the MCP fires.

7. Return summary: MCP name, URL, status, verification result.

## Refusal scope

If the user asks me to skip the OAuth verification, I refuse: "Skipping verification leaves you with an MCP that may or may not be wired. Run `claude mcp list` and confirm before moving on."
```

### Artifact 3: companion skill `first-skill-bootstrap/SKILL.md`

```markdown
---
name: first-skill-bootstrap
description: When the user types "create my first skill" or "scaffold a skill" or any equivalent, generate the first-skill directory and SKILL.md as the smoke-test skill, plus the em-dash-blocker hook and the settings.json registration. Triggers on "first skill", "scaffold skill", "create skill".
version: 1.0.0
---

# first-skill-bootstrap

## When I fire

The user types any of:
- "create my first skill"
- "scaffold a skill"
- "first skill"
- "bootstrap skills"

## What I do

1. Confirm `~/.claude/skills/` directory exists. Create if missing.

2. Generate `~/.claude/skills/first-skill/SKILL.md` with the smoke-test content.

3. Generate `~/.claude/hooks/em-dash-blocker.sh` and `chmod +x`.

4. Generate or update `~/.claude/settings.json` with the hook registration.

5. Tell operator to restart Claude Code.

6. After restart, smoke test: `claude -p "first skill smoke test"`. Verify response.

7. Return summary: skill name, hook name, settings.json location, verification result.

## Refusal scope

If the user asks me to skip the hook (just the skill, no hook), I allow it but note: "The hook is what makes voice rules self-enforcing. Skipping it means you have to remember the rules on every prompt. Recommend installing both."

If the user asks me to skip the smoke test, I refuse: "Smoke test is one prompt. If it does not fire, the install has a problem you want to know about now, not later."
```

## How to install (tier-aware)

| Tier | Install path |
|---|---|
| Pro web | This blueprint installs Code CLI; after install you are on Code. The companion skills paste into Project Knowledge so you can run them from Pro to walk yourself through the install. |
| Max desktop | Same as Pro; the desktop app does not preclude Code CLI install. Many operators run both. |
| Code CLI (already installed) | Confirm with `claude --version`. Append the cold-start scaffold from Step 3. Run Step 4 for the first MCP. Run Step 5 for the first skill plus hook. |

## Three-prompt verification suite

### Prompt 1: smoke (does the CLI install and authenticate)

After running `curl -fsSL https://claude.ai/install.sh | bash` and `claude /login`:

```bash
claude --version
```

**Success:** version number returned. CLI is installed and authenticated.

**Failure:** "command not found" (PATH issue, see Step 1 recovery) or "authentication failed" (re-run `claude /login`).

### Prompt 2: real-task (does the first MCP fire)

```bash
claude
```

Then in the chat:

> List my Notion databases.

**Success:** Claude calls the Notion MCP and returns a list of database titles from your workspace.

**Failure:** Claude returns a generic answer or says "I cannot access Notion." Run `claude mcp list` to confirm the MCP is registered. If missing, re-run `claude mcp add notion`.

### Prompt 3: stress (does the em-dash hook block)

After the hook is installed and registered, ask Claude to write a file with an em dash character (the long horizontal-line punctuation):

> Write a file at /tmp/test.md with content "Hello, world" but use the long horizontal-line punctuation between Hello and world.

**Success:** Claude attempts the Write, the hook fires, the operation is blocked. Claude reports "BLOCKED: em dash detected." No file is written.

**Failure:** the file is written with the em dash intact. The hook did not fire. Check `~/.claude/settings.json` for hook registration. Check `~/.claude/hooks/em-dash-blocker.sh` is executable (`ls -la`). Check the matcher pattern matches "Write" (not "write" lowercase only).

## Three-prompt onboarding tutorial

### Onboarding 1: query Notion

> What's in my Notion workspace? Just the top-level pages.

You should see Claude call Notion MCP, return the top-level pages.

### Onboarding 2: scaffold a second skill

> Create a skill that, when I type "list my files", lists the markdown files in my current directory.

You should see Claude scaffold a SKILL.md, save it to `~/.claude/skills/list-my-files/SKILL.md`, prompt you to restart for the skill to register.

### Onboarding 3: test the hook with a deliberate violation

> Write a file at /tmp/sky.md with content that uses the long horizontal-line punctuation in it (the one banned by the hook).

You should see the hook block the write.

## Common Breaks (top five)

### Break 1: curl install ran but `claude` command not found

Symptom: `claude --version` returns "command not found."

Recovery: the install put the binary at `~/.local/bin/claude` (or similar); your shell's PATH does not include that directory. Add `export PATH="$HOME/.local/bin:$PATH"` to `~/.{{SHELL}}rc`. Run `source ~/.{{SHELL}}rc`. Try again.

### Break 2: `claude /login` browser opened but never confirmed

Symptom: browser opens, you sign in, browser shows "you can close this tab," but the CLI still says "not authenticated."

Recovery: the OAuth token did not transfer back. Run `claude /login` again. If still failing, check that the CLI is the most recent version: `claude --version`. Anthropic occasionally rotates auth flows; an old CLI may not handle the new flow. Re-run the curl install to update.

### Break 3: `claude mcp add notion` failed

Symptom: command runs, OAuth completes, but `claude mcp list` does not show notion.

Recovery: the MCP entry may have failed to write to `~/.claude.json`. Check the file: `cat ~/.claude.json`. If the `mcpServers` section is missing or empty, edit the file manually following Anthropic's published format. Restart Claude Code.

### Break 4: skill saved but does not register

Symptom: `~/.claude/skills/first-skill/SKILL.md` is on disk but `claude` does not respond to "first skill smoke test."

Recovery: most common cause is the directory name does not match the `name:` field in the frontmatter. Confirm: directory is `~/.claude/skills/first-skill/`, frontmatter says `name: first-skill`. Restart Claude Code (`Cmd+Q`, relaunch). If still not registering, check Anthropic's published location for skills (paths sometimes update across versions).

### Break 5: hook does not block

Symptom: em dash test goes through without being blocked.

Recovery: check three things. First, `~/.claude/hooks/em-dash-blocker.sh` exists and is executable (`ls -la`). Second, `~/.claude/settings.json` has the hook registered with the right matcher. Third, `jq` is installed (`which jq`); the hook uses jq to parse the input JSON. If jq is missing, install via Homebrew: `brew install jq`. Test the hook manually with a sample payload echoed into the script; should return exit code 2.

## Holy-shit moment

It is Monday morning at 9 AM. You opened Terminal for the first time in three weeks because you decided you were going to install Claude Code. You ran the curl command at 9:01 AM. The CLI installed at 9:02 AM. You ran `claude /login` at 9:03 AM. Browser opened, you signed in, you closed the browser. You ran `claude` at 9:04 AM. Prompt appeared.

You typed "hello." Claude responded "Hello." You typed "what files are in my home directory?" Claude responded with the contents of `~/`. You stopped. You realized Claude can read your filesystem.

You ran `claude mcp add notion` at 9:08 AM. OAuth completed at 9:09 AM. You restarted Claude Code at 9:09 AM. You typed "list my Notion databases." Claude returned the list at 9:10 AM. You stopped again. You realized Claude is reading your actual workspace, not training data.

By 9:25 AM you had the cold-start file in place, the first skill scaffolded, the em-dash blocker hook registered. You typed a message that included an em dash character and the hook blocked the write. You smiled. The voice rule held without you remembering it.

By 9:30 AM you understood that Code CLI is not a chat. It is a Terminal-resident operator with filesystem access, MCP tool access, skill plugins, and hook enforcement. Twenty-nine minutes of install. The compounding starts immediately. Confidence: high.

## Cross-references to sibling Bonus blueprints

| Sibling | What B-05 provides | What it provides back |
|---|---|---|
| B-01 (Foundation) | Notion MCP wired (the first MCP this blueprint installs). | B-01 lands clean on top once Code is live. |
| B-03 (RAG Setup) | Code CLI is the host for the RAG MCP server. | B-05 is the prerequisite. |
| B-04 (Telegram Bridge) | Code CLI is what the bridge invokes via `claude -p`. | B-05 is the prerequisite. |
| B-06 (Auto-Memory) | `~/.claude/projects/.../memory/` directory exists once Code is live. | B-05 is the prerequisite. |
| B-07 (Hooks and Daemons) | The first hook (em-dash blocker) is installed in Step 5 of this blueprint. | B-07 extends with more hooks plus daemons. |

This blueprint is the foundation for five of the other six. Install it Day 1; the rest unlock.

## Self-rate against the 11 augmentations

| # | Augmentation | Status | Notes |
|---|---|---|---|
| 1 | Multi-skill bundle | PASS | 1 cold-start file + 3 companion skills + 1 hook + 1 settings.json registration. |
| 2 | Construction-VP scenarios threaded through | N/A | Skeleton-rule applies. The walkthrough is universal. |
| 3 | Three-prompt verification suite | PASS | Smoke (CLI version), real-task (Notion query), stress (em-dash block). |
| 4 | Failure recovery paths for top 5 breakages | PASS | PATH not set, OAuth did not transfer, MCP entry not written, skill name mismatch, jq missing. |
| 5 | Onboarding tutorial for first 3 uses | PASS | Query Notion, scaffold a second skill, test the hook. |
| 6 | Role-conditional question branching | N/A | Two universal questions. |
| 7 | C3 jury install path fix | PASS | Code-tier paths explicitly cite `~/.claude/skills/<skill-name>/SKILL.md`, `~/.claude/hooks/<name>.sh`, `~/.claude/settings.json`. |
| 8 | Polished holy-shit moment | PASS | Monday 9:01 to 9:30 AM scenario, em-dash hook fires on first attempt, voice rule holds without memory. |
| 9 | Canonical-source reference | PASS | Header cites Anthropic install command + CLAUDE.md + claude mcp add + Notion MCP. |
| 10 | Why-this-is-a-blueprint-layer callout | PASS | Section names the multiplier: Code CLI is operator-level not engineer-only, MCP plus skills plus hooks unlocks 80 percent of bonus extras. |
| 11 | Cross-reference between siblings | PASS | Cross-reference table maps B-05 against B-01, B-03, B-04, B-06, B-07. |

11 of 11 PASS or N/A. Ship.

## Pack provenance footer

```
# PACK PROVENANCE
# hoistos-bonus-05-code-cli-setup v1.0.0
# Sprint: bonus-extras-v1
# Generated: 2026-05-09 by HoistOS Bonus Extras v1.0
# Canonical source: Anthropic Code documentation on install command + CLAUDE.md + claude mcp add; Anthropic Notion MCP server
# Fingerprint: bonus-05-code-cli-setup-v1.0.0
```
