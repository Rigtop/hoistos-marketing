#!/bin/bash
# HoistOS Foundation Pack 06: Routing Rules PreToolUse hook.
#
# Blocks file writes into `Claude Workspace/` outside the allowlisted
# Global/ and Skills/ subdirectories. Returns exit code 2 with a stderr
# message, which Claude Code surfaces back to the model as a block.
#
# Source of truth: hoistos.com/hooks/pre_tool_use_routing.sh
# Install: curl -fsSL https://hoistos.com/install-routing-hook.sh | bash
# License: open, modify freely
#
# Companion: Foundation Pack F-06 (Routing Rules).
# Reference: Operating Constitution Hard Rule #24 (Routing Gate).

INPUT=$(cat)

# jq is the standard parser. If absent on the user's system, the hook
# fails open (exit 0) rather than blocking every write. Print a warning.
if ! command -v jq >/dev/null 2>&1; then
  echo "[routing-hook] WARN: jq not installed, hook fails open. Install jq via 'brew install jq' on macOS." >&2
  exit 0
fi

# Extract the target path from the tool input. Different Claude tools name
# their path field differently, so check the common ones.
TARGET=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.target // .tool_input.path // ""')

# No target = nothing to gate. Allow.
if [ -z "$TARGET" ] || [ "$TARGET" = "null" ]; then
  exit 0
fi

# Expand ~ if present.
TARGET="${TARGET/#\~/$HOME}"

# The gate: writes into Claude Workspace/ are blocked unless under the
# two allowlisted subdirs.
if [[ "$TARGET" == *"/Claude Workspace/"* ]]; then
  if [[ "$TARGET" != *"/Claude Workspace/Global/"* && "$TARGET" != *"/Claude Workspace/Skills/"* ]]; then
    cat >&2 <<EOF
[routing-hook] BLOCKED by Routing Gate (Foundation Pack F-06).

Target: $TARGET
Tool: PreToolUse

Claude Workspace/ is the engine, not the warehouse. Generated outputs
route to ~/Desktop/Outputs/ per your routing matrix.

Allowlisted exceptions inside Claude Workspace/:
  - Claude Workspace/Global/   (canonical config)
  - Claude Workspace/Skills/   (canonical skills)

To clear this block, route to ~/Desktop/Outputs/<lane>/ instead.
EOF
    exit 2
  fi
fi

exit 0
