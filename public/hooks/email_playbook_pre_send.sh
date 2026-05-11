#!/bin/bash
# HoistOS Foundation Pack 10: Email Playbook PreToolUse hook.
#
# Blocks Gmail draft creation when the draft body contains banned patterns:
#   - Sign-off "Best,"           (matures to "Eugeen," or first-name-only)
#   - Em dashes (U+2014, U+2013) (matures to commas / periods / colons)
#   - "Attached is..."           (matures to "Please see attached")
#   - Compound-name openers      (e.g., "Hi John Smith,")
#   - Office phone 212-727-1807  (inactive, never use; cell only)
#
# Returns exit 2 with a stderr list of violations when any are found.
# Returns exit 0 otherwise. Customize the banned patterns per your stack;
# the defaults match the canonical Email Playbook.
#
# Source of truth: hoistos.com/hooks/email_playbook_pre_send.sh
# Install: curl -fsSL https://hoistos.com/install-email-hook.sh | bash
# License: open, modify freely
#
# Companion: Foundation Pack F-10 (Email Playbook), F-09 (Output Validator).
# Reference: Operating Constitution Hard Rule #34 (Email Playbook Pre-Send Gate).

INPUT=$(cat)

# jq is the standard parser. Fail open with a warning if missing.
if ! command -v jq >/dev/null 2>&1; then
  echo "[email-hook] WARN: jq not installed, hook fails open. Install jq via 'brew install jq' on macOS." >&2
  exit 0
fi

# Extract the draft body from the Gmail tool input. Gmail MCP create_draft
# accepts both plain body and htmlBody fields; scan both.
BODY=$(echo "$INPUT" | jq -r '.tool_input.body // ""')
HTML_BODY=$(echo "$INPUT" | jq -r '.tool_input.htmlBody // ""')
SUBJECT=$(echo "$INPUT" | jq -r '.tool_input.subject // ""')

# Nothing to scan = nothing to gate. Allow.
if [ -z "$BODY" ] && [ -z "$HTML_BODY" ]; then
  exit 0
fi

# Normalize: strip HTML tags from htmlBody so a sign-off inside <p>...</p>
# still matches the line-anchored regex. sed handles this in one pass.
HTML_STRIPPED=$(echo "$HTML_BODY" | sed -E 's/<[^>]+>/\n/g')
COMBINED="$BODY"$'\n'"$HTML_STRIPPED"$'\n'"$SUBJECT"

VIOLATIONS=()

# Check 1: "Best," sign-off on its own line.
if echo "$COMBINED" | grep -qE '^[[:space:]]*Best,[[:space:]]*$'; then
  VIOLATIONS+=("'Best,' sign-off found. Email Playbook canonical: 'Eugeen,' on its own line, no closing pleasantries.")
fi

# Check 2: em dashes. Build glyphs via printf hex-byte escape so the hook
# source itself never contains a literal dash (BSD grep on macOS does not
# support -P, so we cannot use Perl \x{} hex; UTF-8 byte sequence works
# in any POSIX grep via fixed-string match).
EM_DASH=$(printf '\xe2\x80\x94')
EN_DASH=$(printf '\xe2\x80\x93')
if echo "$COMBINED" | grep -q -e "$EM_DASH" -e "$EN_DASH"; then
  VIOLATIONS+=("Em dash or en dash found in draft. Replace with commas, periods, colons, or sentence splits.")
fi

# Check 3: "Attached is" / "Attached please find" (canonical alternative: "Please see attached").
if echo "$COMBINED" | grep -qiE '(Attached is|Attached please find|Attached you will find|Please find attached)'; then
  VIOLATIONS+=("Banned attachment phrasing. Canonical: 'Please see attached <thing>.'")
fi

# Check 4: office phone (inactive, never use).
if echo "$COMBINED" | grep -qE '212[-.[:space:]]?727[-.[:space:]]?1807'; then
  VIOLATIONS+=("Office phone 212-727-1807 found. That number is inactive. Use cell only.")
fi

# Check 5: compound-name opener (e.g., "Hi John Smith,"). Heuristic: greeting
# followed by two capitalized words ending in comma. False positives possible
# on Hi-FirstName-LastName-suffix names; tune to your roster.
if echo "$COMBINED" | head -3 | grep -qE '^(Hi|Hello|Dear)[[:space:]]+[A-Z][a-z]+[[:space:]]+[A-Z][a-z]+,'; then
  VIOLATIONS+=("Compound-name opener found (e.g., 'Hi John Smith,'). Canonical: first-name only on internal/sub/known-recipient threads.")
fi

# Check 6: "I hope this email finds you well" and similar empty-calorie openers.
if echo "$COMBINED" | grep -qiE '(I hope this (email|message) finds you well|I hope you.re doing well|I hope all is well)'; then
  VIOLATIONS+=("Empty-calorie opener detected. Lead with the substantive point.")
fi

# Report and decide.
if [ ${#VIOLATIONS[@]} -gt 0 ]; then
  {
    echo "[email-hook] BLOCKED by Email Playbook Pre-Send Gate (Foundation Pack F-10)."
    echo ""
    echo "Violations found in draft:"
    for v in "${VIOLATIONS[@]}"; do
      echo "  - $v"
    done
    echo ""
    echo "Edit the draft to clear these, then re-attempt. To bypass for a single"
    echo "draft (legitimate edge case), set HOISTOS_EMAIL_HOOK_BYPASS=1 in the"
    echo "Claude environment before the tool call."
  } >&2
  if [ "${HOISTOS_EMAIL_HOOK_BYPASS:-0}" = "1" ]; then
    echo "[email-hook] BYPASS engaged via HOISTOS_EMAIL_HOOK_BYPASS=1." >&2
    exit 0
  fi
  exit 2
fi

exit 0
