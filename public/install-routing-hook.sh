#!/usr/bin/env bash
# HoistOS Foundation Pack 06: Routing Rules PreToolUse hook installer.
#
# One-line install:
#   curl -fsSL https://hoistos.com/install-routing-hook.sh | bash
#
# What it does:
#   1. Detects macOS or Linux. Bails on anything else.
#   2. Checks for Claude Code (looks for ~/.claude). Bails with install link.
#   3. Downloads pre_tool_use_routing.sh to ~/.claude/hooks/.
#   4. chmod +x the hook.
#   5. Merges the PreToolUse entry into ~/.claude/settings.json without
#      clobbering existing hooks (backup written to settings.json.bak).
#   6. Runs a verification test: feeds a fake disallowed path to the hook
#      and confirms it returns exit code 2.
#
# Exit codes:
#   0 = success
#   1 = unsupported OS
#   2 = Claude Code not detected
#   3 = hook download failed
#   4 = settings.json merge failed
#   5 = verification test failed

set -uo pipefail

BASE_URL="${HOISTOS_BASE_URL:-https://hoistos.com}"
HOOK_URL="${BASE_URL}/hooks/pre_tool_use_routing.sh"
CLAUDE_DIR="${HOME}/.claude"
HOOKS_DIR="${CLAUDE_DIR}/hooks"
HOOK_PATH="${HOOKS_DIR}/pre_tool_use_routing.sh"
SETTINGS_PATH="${CLAUDE_DIR}/settings.json"

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

log_ok()    { printf "  %s%s%s %s\n" "$C_GREEN" "✓" "$C_RESET" "$1"; }
log_fail()  { printf "  %s%s%s %s\n" "$C_RED" "✗" "$C_RESET" "$1" 1>&2; }
log_step()  { printf "  %s%s%s\n" "$C_DIM" "$1" "$C_RESET"; }
log_head()  { printf "\n%s%s%s\n" "$C_BOLD" "$1" "$C_RESET"; }

log_head "HoistOS Routing Hook installer"

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

# ---------- preflight: python3 (for JSON merge) ----------
if ! command -v python3 >/dev/null 2>&1; then
  log_fail "python3 not found. Required for settings.json merge."
  log_step "macOS: comes with Xcode CLI tools. Run 'xcode-select --install'."
  exit 4
fi

# ---------- preflight: curl ----------
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

# Back up existing settings if present.
if [ -f "$SETTINGS_PATH" ]; then
  cp "$SETTINGS_PATH" "${SETTINGS_PATH}.bak.$(date +%s)"
  log_ok "Backed up existing settings.json"
else
  echo '{}' > "$SETTINGS_PATH"
  log_ok "Created new settings.json"
fi

# Python-based JSON merge. Idempotent: if the same hook entry already
# exists (same command path), no duplicate is added.
python3 - "$SETTINGS_PATH" "$HOOK_PATH" <<'PYEOF'
import json
import sys

settings_path = sys.argv[1]
hook_command = sys.argv[2]

with open(settings_path) as f:
    settings = json.load(f)

hooks = settings.setdefault("hooks", {})
pre_tool_use = hooks.setdefault("PreToolUse", [])

# Check if our hook is already wired.
already_wired = any(
    isinstance(entry, dict) and entry.get("command") == hook_command
    for entry in pre_tool_use
)

if already_wired:
    print("  hook already wired, no change")
else:
    pre_tool_use.append({
        "matcher": "Write|Edit|Bash",
        "command": hook_command,
    })
    with open(settings_path, "w") as f:
        json.dump(settings, f, indent=2)
    print(f"  added PreToolUse entry for {hook_command}")
PYEOF

if [ $? -ne 0 ]; then
  log_fail "settings.json merge failed"
  exit 4
fi
log_ok "settings.json updated"

# ---------- step 3: verification ----------
log_head "Verifying hook"

# Feed a fake disallowed path. The hook should return exit 2.
FAKE_INPUT='{"tool_input": {"file_path": "/tmp/fake/Claude Workspace/wrong-lane/test.txt"}}'
HOOK_OUTPUT=$(echo "$FAKE_INPUT" | "$HOOK_PATH" 2>&1)
HOOK_EXIT=$?

if [ "$HOOK_EXIT" -eq 2 ]; then
  log_ok "Hook correctly blocked disallowed path (exit 2)"
elif [ "$HOOK_EXIT" -eq 0 ] && echo "$HOOK_OUTPUT" | grep -q "jq not installed"; then
  log_fail "jq is not installed. Hook fails open."
  log_step "macOS: brew install jq"
  log_step "Linux: apt-get install jq OR yum install jq"
  exit 5
else
  log_fail "Verification failed. Hook returned exit $HOOK_EXIT."
  log_step "Output: $HOOK_OUTPUT"
  exit 5
fi

# Feed an allowed path. The hook should return exit 0.
FAKE_INPUT_OK='{"tool_input": {"file_path": "/tmp/fake/Claude Workspace/Global/test.md"}}'
echo "$FAKE_INPUT_OK" | "$HOOK_PATH" >/dev/null 2>&1
if [ $? -eq 0 ]; then
  log_ok "Hook correctly allowed allowlisted path (exit 0)"
else
  log_fail "Hook incorrectly blocked an allowlisted path."
  exit 5
fi

# ---------- done ----------
log_head "Install complete"
echo ""
echo "  Hook: $HOOK_PATH"
echo "  Settings: $SETTINGS_PATH"
echo ""
echo "  Next steps:"
echo "    1. Restart your Claude Code session for the hook to load."
echo "    2. Smoke test: ask Claude to write a file to"
echo "       ~/Desktop/AI Architecture/Claude Workspace/test/test.txt"
echo "       The write should be blocked with the routing-gate message."
echo ""
echo "  To disable: remove the PreToolUse entry from $SETTINGS_PATH or"
echo "  restore the backup: ${SETTINGS_PATH}.bak.*"
echo ""
