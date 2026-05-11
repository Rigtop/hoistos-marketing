#!/usr/bin/env bash
# HoistOS Foundation Pack 10: Email Playbook PreToolUse hook installer.
#
# One-line install:
#   curl -fsSL https://hoistos.com/install-email-hook.sh | bash
#
# What it does:
#   1. Detects macOS or Linux. Bails on anything else.
#   2. Checks for Claude Code (looks for ~/.claude). Bails with install link.
#   3. Downloads email_playbook_pre_send.sh to ~/.claude/hooks/.
#   4. chmod +x the hook.
#   5. Merges the PreToolUse entry into ~/.claude/settings.json without
#      clobbering existing hooks (backup written to settings.json.bak).
#      Matcher targets the Gmail MCP create_draft tool.
#   6. Runs a verification suite: feeds a banned-pattern draft (expect
#      exit 2) and a clean draft (expect exit 0).
#
# Exit codes:
#   0 = success
#   1 = unsupported OS
#   2 = Claude Code not detected
#   3 = hook download failed
#   4 = settings.json merge failed
#   5 = verification test failed
#
# Companion: Foundation Pack F-10 (Email Playbook), F-09 (Output Validator).

set -uo pipefail

BASE_URL="${HOISTOS_BASE_URL:-https://hoistos.com}"
HOOK_URL="${BASE_URL}/hooks/email_playbook_pre_send.sh"
CLAUDE_DIR="${HOME}/.claude"
HOOKS_DIR="${CLAUDE_DIR}/hooks"
HOOK_PATH="${HOOKS_DIR}/email_playbook_pre_send.sh"
SETTINGS_PATH="${CLAUDE_DIR}/settings.json"

# Matcher targets the Gmail MCP create_draft tool. If your Gmail MCP
# server is namespaced differently, override before piping:
#   HOISTOS_GMAIL_MATCHER="mcp__my_gmail_server__create_draft" curl ...
GMAIL_MATCHER="${HOISTOS_GMAIL_MATCHER:-mcp__claude_ai_Gmail__create_draft}"

# ---------- visual helpers ----------
if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  C_GREEN=$'\033[32m'
  C_RED=$'\033[31m'
  C_DIM=$'\033[2m'
  C_BOLD=$'\033[1m'
  C_RESET=$'\033[0m'
else
  C_GREEN=""; C_RED=""; C_DIM=""; C_BOLD=""; C_RESET=""
fi

log_ok()   { printf "  %s%s%s %s\n" "$C_GREEN" "✓" "$C_RESET" "$1"; }
log_fail() { printf "  %s%s%s %s\n" "$C_RED" "✗" "$C_RESET" "$1" 1>&2; }
log_step() { printf "  %s%s%s\n" "$C_DIM" "$1" "$C_RESET"; }
log_head() { printf "\n%s%s%s\n" "$C_BOLD" "$1" "$C_RESET"; }

log_head "HoistOS Email Playbook Hook installer"

# ---------- preflight: OS ----------
case "$(uname -s)" in
  Darwin) OS="macos" ;;
  Linux)  OS="linux" ;;
  *)
    log_fail "Unsupported OS: $(uname -s). macOS or Linux only."
    exit 1
    ;;
esac
log_ok "OS detected: $OS"

# ---------- preflight: Claude Code ----------
if [ ! -d "$CLAUDE_DIR" ]; then
  log_fail "Claude Code not detected at $CLAUDE_DIR."
  log_step "Install Claude Code first: https://claude.ai/code"
  exit 2
fi
log_ok "Claude Code found at $CLAUDE_DIR"

# ---------- preflight: python3 + curl ----------
if ! command -v python3 >/dev/null 2>&1; then
  log_fail "python3 not found. Required for settings.json merge."
  log_step "macOS: run 'xcode-select --install'."
  exit 4
fi

if ! command -v curl >/dev/null 2>&1; then
  log_fail "curl not found."
  exit 3
fi

# ---------- step 1: download hook ----------
log_head "Downloading hook"
mkdir -p "$HOOKS_DIR"
if curl -fsSL "$HOOK_URL" -o "$HOOK_PATH"; then
  log_ok "Downloaded to $HOOK_PATH"
else
  log_fail "Download failed from $HOOK_URL"
  exit 3
fi

chmod +x "$HOOK_PATH"
log_ok "Made executable"

# ---------- step 2: merge settings.json ----------
log_head "Merging settings.json"

if [ -f "$SETTINGS_PATH" ]; then
  cp "$SETTINGS_PATH" "${SETTINGS_PATH}.bak.$(date +%s)"
  log_ok "Backed up existing settings.json"
else
  echo '{}' > "$SETTINGS_PATH"
  log_ok "Created new settings.json"
fi

python3 - "$SETTINGS_PATH" "$HOOK_PATH" "$GMAIL_MATCHER" <<'PYEOF'
import json
import sys

settings_path = sys.argv[1]
hook_command = sys.argv[2]
matcher = sys.argv[3]

with open(settings_path) as f:
    settings = json.load(f)

hooks = settings.setdefault("hooks", {})
pre_tool_use = hooks.setdefault("PreToolUse", [])

already_wired = any(
    isinstance(entry, dict) and entry.get("command") == hook_command
    for entry in pre_tool_use
)

if already_wired:
    print("  hook already wired, no change")
else:
    pre_tool_use.append({
        "matcher": matcher,
        "command": hook_command,
    })
    with open(settings_path, "w") as f:
        json.dump(settings, f, indent=2)
    print(f"  added PreToolUse entry: matcher={matcher}")
PYEOF

if [ $? -ne 0 ]; then
  log_fail "settings.json merge failed"
  exit 4
fi
log_ok "settings.json updated"

# ---------- step 3: verification ----------
log_head "Verifying hook"

# Case 1: feed a banned 'Best,' sign-off. Expect exit 2.
FAKE_VIOLATION='{"tool_input": {"body": "Steve,\n\nSounds good.\n\nBest,"}}'
echo "$FAKE_VIOLATION" | "$HOOK_PATH" >/dev/null 2>&1
HOOK_EXIT=$?
if [ "$HOOK_EXIT" -eq 2 ]; then
  log_ok "Hook correctly blocked 'Best,' sign-off (exit 2)"
elif [ "$HOOK_EXIT" -eq 0 ]; then
  # Check if jq is missing (fail-open path).
  CHECK_JQ=$(echo "$FAKE_VIOLATION" | "$HOOK_PATH" 2>&1)
  if echo "$CHECK_JQ" | grep -q "jq not installed"; then
    log_fail "jq is not installed. Hook fails open and cannot enforce."
    log_step "macOS: brew install jq"
    log_step "Linux: apt-get install jq OR yum install jq"
    exit 5
  fi
  log_fail "Hook did not block 'Best,' sign-off. Verification failed."
  exit 5
else
  log_fail "Hook returned unexpected exit $HOOK_EXIT."
  exit 5
fi

# Case 2: feed a clean draft. Expect exit 0.
FAKE_OK='{"tool_input": {"body": "Steve,\n\nPlease see attached the proposal.\n\nEugeen,"}}'
echo "$FAKE_OK" | "$HOOK_PATH" >/dev/null 2>&1
if [ $? -eq 0 ]; then
  log_ok "Hook correctly allowed clean draft (exit 0)"
else
  log_fail "Hook incorrectly blocked a clean draft."
  exit 5
fi

# ---------- done ----------
log_head "Install complete"
echo ""
echo "  Hook:     $HOOK_PATH"
echo "  Settings: $SETTINGS_PATH"
echo "  Matcher:  $GMAIL_MATCHER"
echo ""
echo "  Next steps:"
echo "    1. Restart your Claude Code session for the hook to load."
echo "    2. Smoke test in Claude: ask it to draft a one-line email"
echo "       ending in 'Best,' as a sign-off. The draft creation"
echo "       should be blocked with the violation list shown."
echo ""
echo "  Customize the banned patterns: edit $HOOK_PATH directly."
echo "  Defaults match the canonical Email Playbook (Best, sign-off,"
echo "  em dashes, 'Attached is...', office phone, compound-name openers,"
echo "  empty-calorie 'I hope this email finds you well' openers)."
echo ""
echo "  To disable: remove the matching PreToolUse entry from"
echo "  $SETTINGS_PATH, or restore the backup: ${SETTINGS_PATH}.bak.*"
echo ""
echo "  To bypass for one draft (legitimate edge case):"
echo "  set HOISTOS_EMAIL_HOOK_BYPASS=1 in the Claude environment."
echo ""
