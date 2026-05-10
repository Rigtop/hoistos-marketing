#!/usr/bin/env bash
# HoistOS one-line installer for Claude Code.
# Run: curl -fsSL https://hoistos.com/install.sh | bash
#
# What it does:
#   1. Detects macOS or Linux. Bails on anything else.
#   2. Checks for Claude Code (looks for ~/.claude). Bails with install link if missing.
#   3. Asks the VP one tier question. Defaults to "everything" on Enter.
#   4. Fetches the install manifest from hoistos.com.
#   5. Walks the chosen pack list, downloads each pack, parses out every SKILL.md
#      block, drops each one at ~/.claude/skills/<skill-name>/SKILL.md.
#   6. Reports a clean per-skill log and a final summary.
#
# Exit codes:
#   0 = success
#   1 = unsupported OS
#   2 = Claude Code not detected
#   3 = manifest fetch failed
#   4 = pack download or parse failure
#   5 = missing required tools (curl, awk)

set -uo pipefail

BASE_URL="${HOISTOS_BASE_URL:-https://hoistos.com}"
MANIFEST_URL="${BASE_URL}/install-manifest.json"
SKILLS_DIR="${HOME}/.claude/skills"
TMP_DIR="$(mktemp -d -t hoistos-install-XXXXXX)"
trap 'rm -rf "${TMP_DIR}"' EXIT

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

# ---------- preflight ----------
detect_os() {
  case "$(uname -s)" in
    Darwin) echo "macos" ;;
    Linux)  echo "linux" ;;
    *)      echo "unsupported" ;;
  esac
}

require_tool() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log_fail "Missing required tool: $1. Install it first."
    exit 5
  fi
}

# ---------- banner ----------
printf "\n%s%s%s\n" "$C_BOLD" "HoistOS Installer" "$C_RESET"
printf "%s34 packs. Built by a working construction COO at Perennial Empire.%s\n" "$C_DIM" "$C_RESET"

OS="$(detect_os)"
if [ "$OS" = "unsupported" ]; then
  log_fail "Unsupported OS: $(uname -s). HoistOS supports macOS and Linux."
  exit 1
fi
log_step "OS detected: $OS"

require_tool curl
require_tool awk

if [ ! -d "${HOME}/.claude" ]; then
  log_fail "Claude Code not detected. Install from https://claude.com/code first."
  exit 2
fi
log_step "Claude Code detected at ~/.claude"

# ---------- tier question ----------
log_head "Which tier?"
printf "  %s1%s) Foundations only           (11 packs)\n"      "$C_BOLD" "$C_RESET"
printf "  %s2%s) Foundations + business     (25 packs)\n"      "$C_BOLD" "$C_RESET"
printf "  %s3%s) Everything (recommended)   (33 packs)\n"      "$C_BOLD" "$C_RESET"
printf "\nChoice [3]: "

# Read from stdin if it's a TTY or has piped data, otherwise from /dev/tty so
# this works under `curl | bash` (stdin is the curl pipe, prompt comes from /dev/tty).
CHOICE=""
if [ -t 0 ]; then
  read -r CHOICE
else
  # Try stdin first (handles `bash install.sh <<< "1"` and similar).
  if read -r -t 1 CHOICE 2>/dev/null; then
    :
  elif [ -e /dev/tty ]; then
    read -r CHOICE < /dev/tty || CHOICE=""
  fi
fi
CHOICE="${CHOICE:-3}"
case "$CHOICE" in
  1|2|3) ;;
  *) log_fail "Invalid choice: $CHOICE. Pick 1, 2, or 3."; exit 1 ;;
esac

# ---------- fetch manifest ----------
log_head "Fetching manifest"
MANIFEST_FILE="${TMP_DIR}/manifest.json"
if ! curl -fsSL "$MANIFEST_URL" -o "$MANIFEST_FILE"; then
  log_fail "Could not fetch manifest from $MANIFEST_URL"
  exit 3
fi
log_ok "Manifest loaded ($(wc -c < "$MANIFEST_FILE" | tr -d ' ') bytes)"

# ---------- pick packs by tier ----------
# Use awk to parse the JSON (no jq dependency on a fresh VP machine).
# Manifest keys we need: tiers.foundations[], tiers.business[], tiers.chronological[],
# packs[].id, packs[].url, packs[].skills[].slug, packs[].skills[].raw_name, packs[].skills[].index
#
# Pragmatic JSON parsing: pull arrays by key with a small awk state machine.

parse_array() {
  # Args: $1 = manifest path, $2 = key path like "tiers.foundations"
  # Returns: one entry per line, no quotes.
  python3 - "$1" "$2" <<'PYEOF'
import json, sys
path = sys.argv[1]
keys = sys.argv[2].split(".")
data = json.load(open(path))
for k in keys:
    data = data[k]
for v in data:
    print(v)
PYEOF
}

parse_packs_for_ids() {
  # Args: $1 = manifest path, $2 = comma-separated pack ids
  # Output: one pack per block, lines:
  #   PACK <id>
  #   URL <url>
  #   SKILL <slug> <raw_name> <index>
  #   SKILL ...
  #   END
  python3 - "$1" "$2" <<'PYEOF'
import json, sys
manifest = json.load(open(sys.argv[1]))
wanted = set(sys.argv[2].split(","))
packs_by_id = {p["id"]: p for p in manifest["packs"]}
# Preserve manifest tier order
ordered = []
for bucket in ("foundations", "business", "chronological"):
    for pid in manifest["tiers"][bucket]:
        if pid in wanted and pid in packs_by_id:
            ordered.append(packs_by_id[pid])
for p in ordered:
    print(f"PACK {p['id']}")
    print(f"URL {p['url']}")
    for s in p["skills"]:
        slug = s["slug"]
        raw = s["raw_name"] or slug
        idx = s["index"] or 0
        print(f"SKILL {slug}\t{raw}\t{idx}")
    print("END")
PYEOF
}

# Check python3 availability (used for JSON parsing during install).
# Fallback: if python3 missing, abort. macOS ships it; most Linux distros do too.
if ! command -v python3 >/dev/null 2>&1; then
  log_fail "python3 required for manifest parsing. Install python3 first."
  exit 5
fi

# Determine which buckets to install.
case "$CHOICE" in
  1) BUCKETS="foundations" ;;
  2) BUCKETS="foundations business" ;;
  3) BUCKETS="foundations business chronological" ;;
esac

# Collect pack ids in order.
PACK_IDS=""
for b in $BUCKETS; do
  ids="$(parse_array "$MANIFEST_FILE" "tiers.$b")"
  for id in $ids; do
    PACK_IDS="${PACK_IDS}${PACK_IDS:+,}${id}"
  done
done

# Count total skills upfront for the [N / total] progress display.
TOTAL_SKILLS=0
PACK_PLAN_FILE="${TMP_DIR}/plan.txt"
parse_packs_for_ids "$MANIFEST_FILE" "$PACK_IDS" > "$PACK_PLAN_FILE"
TOTAL_SKILLS=$(grep -c '^SKILL ' "$PACK_PLAN_FILE")
TOTAL_PACKS=$(grep -c '^PACK ' "$PACK_PLAN_FILE")

log_head "Installing $TOTAL_SKILLS skills from $TOTAL_PACKS packs"

# ---------- the awk extractor (embedded, no external file) ----------
EXTRACTOR_FILE="${TMP_DIR}/extract.awk"
cat > "$EXTRACTOR_FILE" <<'AWKEOF'
# Extract a SKILL.md block by name OR by 1-based skill index.
# Vars: want = skill slug (matches exact, prefix, suffix, or middle).
#       want_idx = positional fallback, used when want doesn't match.
# Output on stdout: the skill block contents (without the outer fence lines).

BEGIN { depth = 0; emitted = 0; seen_idx = 0 }

function fence_count(line,   n) {
  n = 0
  while (substr(line, n+1, 1) == "`") n++
  return n
}

function name_matches(actual, w) {
  if (actual == w) return 1
  alen = length(actual); wlen = length(w)
  if (alen > wlen + 1) {
    if (substr(actual, alen - wlen) == "-" w) return 1
    if (substr(actual, 1, wlen + 1) == w "-") return 1
    if (index(actual, "-" w "-") > 0) return 1
  }
  return 0
}

{
  if (emitted) next
  fc = fence_count($0)
  if (fc >= 3) {
    is_pure_fence = (length($0) == fc)
    if (depth == 0) {
      depth = 1; stack[1] = fc
      first_line[1] = 0; has_dashes[1] = 0; saw_name[1] = ""; buf[1] = ""
      next
    }
    cur_size = stack[depth]
    if (is_pure_fence && fc == cur_size) {
      if (has_dashes[depth] && saw_name[depth] != "") {
        seen_idx++
        if (name_matches(saw_name[depth], want)) {
          printf "%s", buf[depth]
          emitted = 1
        } else if (want_idx > 0 && seen_idx == want_idx && !emitted) {
          # Stash positional candidate but only emit later if no name match wins.
          # Since we are streaming, emit immediately if asked.
          # (This branch only fires when want_idx is set as the explicit fallback.)
          if (want == "__by_index__") {
            printf "%s", buf[depth]
            emitted = 1
          }
        }
      }
      delete buf[depth]; delete first_line[depth]; delete has_dashes[depth]
      delete saw_name[depth]; delete stack[depth]
      depth--
      next
    }
    depth++; stack[depth] = fc
    first_line[depth] = 0; has_dashes[depth] = 0; saw_name[depth] = ""; buf[depth] = ""
    next
  }
  if (depth >= 1) {
    if (!first_line[depth]) {
      first_line[depth] = 1
      if ($0 == "---") has_dashes[depth] = 1
    }
    if (has_dashes[depth] && match($0, /^name:[[:space:]]+/)) {
      n = substr($0, RSTART+RLENGTH)
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", n)
      saw_name[depth] = n
    }
    buf[depth] = buf[depth] $0 "\n"
  }
}
AWKEOF

# ---------- main install loop ----------
mkdir -p "$SKILLS_DIR"

INSTALLED=0
FAILED_SKILLS=""
PACK_INDEX=0
SKILL_PROGRESS=0

current_pack_id=""
current_pack_file=""

while IFS= read -r line; do
  case "$line" in
    "PACK "*)
      current_pack_id="${line#PACK }"
      PACK_INDEX=$((PACK_INDEX + 1))
      ;;
    "URL "*)
      url="${line#URL }"
      current_pack_file="${TMP_DIR}/pack-${current_pack_id}.md"
      if ! curl -fsSL "$url" -o "$current_pack_file"; then
        log_fail "Pack download failed: $current_pack_id"
        FAILED_SKILLS="${FAILED_SKILLS}${FAILED_SKILLS:+, }${current_pack_id}(download)"
        current_pack_file=""
      fi
      ;;
    "SKILL "*)
      [ -z "$current_pack_file" ] && continue
      rest="${line#SKILL }"
      slug="$(echo "$rest" | awk -F'\t' '{print $1}')"
      raw_name="$(echo "$rest" | awk -F'\t' '{print $2}')"
      idx="$(echo "$rest" | awk -F'\t' '{print $3}')"
      SKILL_PROGRESS=$((SKILL_PROGRESS + 1))

      printf "  %s[%d / %d] Installing %s%s\r" "$C_DIM" "$SKILL_PROGRESS" "$TOTAL_SKILLS" "$slug" "$C_RESET"

      target_dir="${SKILLS_DIR}/${slug}"
      target_file="${target_dir}/SKILL.md"

      # Try by name first.
      content="$(awk -v want="$raw_name" -v want_idx="0" -f "$EXTRACTOR_FILE" "$current_pack_file")"

      # Fallback: by index.
      if [ -z "$content" ] && [ "$idx" -gt 0 ]; then
        content="$(awk -v want="__by_index__" -v want_idx="$idx" -f "$EXTRACTOR_FILE" "$current_pack_file")"
      fi

      if [ -z "$content" ]; then
        printf "\033[2K\r"
        log_fail "Could not extract skill content: $slug (in pack $current_pack_id)"
        FAILED_SKILLS="${FAILED_SKILLS}${FAILED_SKILLS:+, }${slug}"
        continue
      fi

      mkdir -p "$target_dir"
      printf "%s" "$content" > "$target_file"
      INSTALLED=$((INSTALLED + 1))
      printf "\033[2K\r"
      log_ok "$slug"
      ;;
    "END")
      current_pack_id=""
      current_pack_file=""
      ;;
  esac
done < "$PACK_PLAN_FILE"

# ---------- final summary ----------
printf "\n"
if [ -n "$FAILED_SKILLS" ]; then
  log_head "Done with errors"
  printf "  %sInstalled: %d skills%s\n" "$C_GREEN" "$INSTALLED" "$C_RESET"
  printf "  %sFailed: %s%s\n" "$C_RED" "$FAILED_SKILLS" "$C_RESET"
  printf "\nReport this at https://github.com/eugeen/hoistos/issues with the pack id above.\n"
  exit 4
fi

log_head "Done"
printf "  %s%d skills now in your Claude Code.%s\n" "$C_BOLD" "$INSTALLED" "$C_RESET"
printf "  Skills installed at: %s%s%s\n" "$C_DIM" "$SKILLS_DIR" "$C_RESET"

printf "\n%sFirst one to try:%s\n" "$C_BOLD" "$C_RESET"
printf "  %sclaude 'check my email and triage'%s\n" "$C_DIM" "$C_RESET"
printf "\n%sList what installed:%s\n" "$C_BOLD" "$C_RESET"
printf "  %sclaude 'list my skills'%s\n" "$C_DIM" "$C_RESET"

exit 0
