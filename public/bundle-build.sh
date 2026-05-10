#!/usr/bin/env bash
# bundle-build.sh
# Builds /public/hoistos-empire-pack-v2.zip from the live packs-v2/ directory.
# Re-run whenever packs change. Idempotent. No network access.
#
# Output:
#   public/hoistos-empire-pack-v2.zip
#   public/_bundle-stage/  (intermediate build dir, recreated each run)
#
# Requires: python3, zip, mktemp.

set -euo pipefail

PUBLIC_DIR="$(cd "$(dirname "$0")" && pwd)"
PACKS_DIR="$PUBLIC_DIR/packs-v2"
STAGE_DIR="$PUBLIC_DIR/_bundle-stage"
ZIP_OUT="$PUBLIC_DIR/hoistos-empire-pack-v2.zip"
BUILD_DATE="$(date +%Y-%m-%d)"
VERSION="2.0.0"

if [[ ! -d "$PACKS_DIR" ]]; then
  echo "ERROR: packs-v2/ not found at $PACKS_DIR" >&2
  exit 1
fi

PACK_COUNT=$(find "$PACKS_DIR" -maxdepth 1 -name "*.md" -not -name "coordination.md" | wc -l | tr -d ' ')
if [[ "$PACK_COUNT" -lt 30 ]]; then
  echo "ERROR: expected at least 30 packs, found $PACK_COUNT" >&2
  exit 1
fi

echo "[bundle-build] $PACK_COUNT packs found in $PACKS_DIR"
echo "[bundle-build] staging at $STAGE_DIR"

# Clean stage
rm -rf "$STAGE_DIR"
mkdir -p "$STAGE_DIR"
mkdir -p "$STAGE_DIR/packs"
mkdir -p "$STAGE_DIR/skills"

# Copy all packs (skip coordination.md, that is sprint metadata not a pack)
for f in "$PACKS_DIR"/*.md; do
  base="$(basename "$f")"
  [[ "$base" == "coordination.md" ]] && continue
  cp "$f" "$STAGE_DIR/packs/$base"
done

# Generate manifest + README + tier installers via embedded Python
python3 - "$STAGE_DIR" "$BUILD_DATE" "$VERSION" <<'PYEOF'
import json
import os
import re
import sys
from pathlib import Path

stage_dir = Path(sys.argv[1])
build_date = sys.argv[2]
version = sys.argv[3]
packs_dir = stage_dir / "packs"
skills_dir = stage_dir / "skills"

# Parse YAML frontmatter from each pack (no PyYAML dep, simple line parse).
def parse_frontmatter(text):
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end == -1:
        return {}
    block = text[3:end]
    out = {}
    current_list_key = None
    for raw in block.splitlines():
        line = raw.rstrip()
        if not line.strip():
            continue
        if line.startswith("  - ") and current_list_key:
            out[current_list_key].append(line[4:].strip().strip('"'))
            continue
        m = re.match(r"^([A-Za-z0-9_]+):\s*(.*)$", line)
        if not m:
            continue
        key, val = m.group(1), m.group(2).strip()
        if val == "":
            out[key] = []
            current_list_key = key
        else:
            out[key] = val.strip('"').strip("'")
            current_list_key = None
    return out

packs = []
for md in sorted(packs_dir.glob("*.md")):
    text = md.read_text(encoding="utf-8")
    fm = parse_frontmatter(text)
    pack_id = md.stem
    target_skill = fm.get("targetSkill", "")
    display = fm.get("displayName", pack_id)
    tier_default = fm.get("claudeTier", "all") or "all"
    minutes_raw = fm.get("estimatedActivationMinutes", "0")
    try:
        minutes = int(re.search(r"\d+", str(minutes_raw)).group(0)) if re.search(r"\d+", str(minutes_raw)) else 0
    except Exception:
        minutes = 0
    pack_tier = fm.get("tier", "")
    companion = fm.get("companionSkills", []) if isinstance(fm.get("companionSkills"), list) else []

    # Extract a one-line description: prefer first sentence after the H1 hero block.
    desc = ""
    # Grab the first bolded-heading sentence or first paragraph after frontmatter
    body = text.split("\n---", 2)[-1] if text.startswith("---") else text
    # Find first H1
    h1_match = re.search(r"^# (.+)$", body, re.MULTILINE)
    if h1_match:
        # Pull display name minus pack number prefix as the description seed
        desc = h1_match.group(1).strip()
    if not desc:
        desc = display

    # Derive skills list: targetSkill is primary; companionSkills are secondary.
    skill_entries = []
    seen = set()
    if target_skill:
        skill_entries.append(target_skill)
        seen.add(target_skill)
    for c in companion:
        c = c.strip()
        if c and c not in seen:
            skill_entries.append(c)
            seen.add(c)

    pack_record = {
        "id": pack_id,
        "tier_pack": pack_tier,
        "tier_default": tier_default,
        "display_name": display,
        "description": desc,
        "skills": [
            {
                "name": s,
                "code_path": f"~/.claude/skills/{s}/SKILL.md",
                "pro_paste_section": f"## Skill: {s}",
            }
            for s in skill_entries if s
        ],
        "depends_on": [],
        "install_minutes": minutes,
        "pack_file": f"packs/{md.name}",
    }
    packs.append(pack_record)

# Order packs: foundation -> beg -> mid -> adv -> pow -> biz
order_key = {"foundation": 0, "beginner": 1, "beg": 1, "intermediate": 2, "mid": 2,
             "advanced": 3, "adv": 3, "power": 4, "pow": 4, "business-vertical": 5, "biz": 5}
def sort_key(p):
    t = p["tier_pack"] or p["id"].split("-")[0]
    return (order_key.get(t, 9), p["id"])
packs.sort(key=sort_key)

# Build skills/<name>/SKILL.md stubs. Each stub points back to the pack and gives
# install path + a marker line so the bundle works as a drag-into-place reference.
all_skills = {}
for p in packs:
    for s in p["skills"]:
        if s["name"] not in all_skills:
            all_skills[s["name"]] = {"name": s["name"], "from_pack": p["id"], "code_path": s["code_path"]}

for name, meta in all_skills.items():
    skill_folder = skills_dir / name
    skill_folder.mkdir(parents=True, exist_ok=True)
    pack_path = packs_dir / (meta["from_pack"] + ".md")
    pack_text = pack_path.read_text(encoding="utf-8") if pack_path.exists() else ""
    # Best effort: extract any embedded fenced block labeled SKILL.md or with the
    # skill name in a heading. Fall back to a stub that points back at the pack.
    extracted = ""
    # Try a series of patterns. First match wins.
    patterns = [
        # Pattern A: ### Artifact N: `~/.claude/skills/<name>/SKILL.md`  + 4-backtick fence
        r"###[^\n]*~/\.claude/skills/" + re.escape(name) + r"/SKILL\.md[^\n]*\n+````[a-zA-Z]*\n(.*?)````",
        # Pattern B: ### Artifact N: `~/.claude/skills/<name>/SKILL.md`  + 3-backtick fence
        r"###[^\n]*~/\.claude/skills/" + re.escape(name) + r"/SKILL\.md[^\n]*\n+```[a-zA-Z]*\n(.*?)```",
        # Pattern C: ### Artifact N: companion skill `<name>/SKILL.md` + 3-backtick fence
        r"###[^\n]*companion skill[^\n]*`" + re.escape(name) + r"/SKILL\.md`[^\n]*\n+```[a-zA-Z]*\n(.*?)```",
        # Pattern D: ### Artifact N: SKILL.md for `<name>`  + 3-backtick fence (often after a "Save to ~/.claude..." line)
        r"###[^\n]*SKILL\.md for `" + re.escape(name) + r"`[^\n]*\n+(?:[^\n]*\n+)?```[a-zA-Z]*\n(.*?)```",
        # Pattern E: ### Artifact N: <name> SKILL.md + 3-backtick fence
        r"###[^\n]*" + re.escape(name) + r"[^\n]*SKILL\.md[^\n]*\n+```[a-zA-Z]*\n(.*?)```",
    ]
    for pat in patterns:
        m = re.search(pat, pack_text, re.DOTALL)
        if m:
            extracted = m.group(1).strip()
            break

    skill_md = skill_folder / "SKILL.md"
    if extracted:
        # Embedded canonical SKILL.md content found in pack; write verbatim.
        skill_md.write_text(extracted + "\n", encoding="utf-8")
    else:
        # Stub: tells operator where the canonical SKILL.md lives + install path.
        stub = f"""---
name: {name}
description: |
  Companion skill for HoistOS Empire Pack v2. Source pack: {meta['from_pack']}.md.
  This file is a placeholder. The canonical body lives inside the pack file in this bundle
  at packs/{meta['from_pack']}.md, in the skill artifact section. Copy that body here, or
  re-run bundle-build.sh after the source pack adds an `Artifact: ~/.claude/skills/{name}/SKILL.md`
  fenced block.
install_path: {meta['code_path']}
source_pack: packs/{meta['from_pack']}.md
version: {version}
---

# {name}

Open `packs/{meta['from_pack']}.md` and follow Step 2 (Save the SKILL.md files locally).
The pack body is the source of truth. This stub exists so the bundle's `skills/` tree
is browsable and the install script has a path to copy from.
"""
        skill_md.write_text(stub, encoding="utf-8")

# Write routing manifest
manifest = {
    "version": version,
    "build_date": build_date,
    "tiers": {
        "pro": {
            "install_method": "project_knowledge_paste",
            "destination": "Claude.ai > Settings > Projects > [Your Project] > Project Knowledge",
            "instructions": "Paste each SKILL.md block into the Project Knowledge text box. Save.",
        },
        "max_desktop": {
            "install_method": "deep_link_or_paste",
            "destination": "claude://prompt?q=<URL-encoded-pack-content>",
            "instructions": "Click the deep-link button on hoistos.com or paste the SKILL.md as Pro tier.",
        },
        "code": {
            "install_method": "filesystem",
            "destination": "~/.claude/skills/<skill-name>/SKILL.md",
            "instructions": "Run INSTALL-CODE.sh, or copy each skills/<name>/ folder to ~/.claude/skills/.",
        },
    },
    "packs": packs,
}
(stage_dir / "routing-manifest.json").write_text(
    json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
)

# Build README.md (top-level, tier-aware)
def tier_badge(p):
    t = p["tier_default"]
    if "code" in t and "pro" in t:
        return "Pro / Max / Code"
    if "code" in t:
        return "Code"
    if "pro" in t and "max" in t:
        return "Pro / Max"
    if "pro" in t:
        return "Pro"
    if "max" in t:
        return "Max"
    if t == "all" or t == "":
        return "Pro / Max / Code"
    return t

readme_lines = []
readme_lines.append(f"# HoistOS Empire Pack v2")
readme_lines.append("")
readme_lines.append(f"You just downloaded {len(packs)} skills. Here is how to install in your tier.")
readme_lines.append("")
readme_lines.append(f"Bundle version: {version}. Build date: {build_date}.")
readme_lines.append("")
readme_lines.append("## 1. Pick your tier")
readme_lines.append("")
readme_lines.append("Three install paths, one bundle. Pick the one that matches your Claude account.")
readme_lines.append("")
readme_lines.append("| Tier | Who it is | Install file |")
readme_lines.append("|---|---|---|")
readme_lines.append("| Pro (claude.ai web) | Most operators. $20/month. Project Knowledge paste install. | INSTALL-PRO.md |")
readme_lines.append("| Max (claude.ai desktop app) | Power web users. $200/month. Deep-link install or paste. | INSTALL-MAX.sh |")
readme_lines.append("| Code (Claude Code CLI) | Engineers. Filesystem skill install at `~/.claude/skills/`. | INSTALL-CODE.sh |")
readme_lines.append("")
readme_lines.append("Not sure which tier you have? If you log into claude.ai in a browser, you are Pro or Max. If you run `claude` in a terminal, you are Code. Both can be true. Pick whichever you use most.")
readme_lines.append("")
readme_lines.append("## 2. Per-tier install")
readme_lines.append("")
readme_lines.append("### Pro tier (Project Knowledge paste)")
readme_lines.append("")
readme_lines.append("Open `INSTALL-PRO.md`. It walks you through opening claude.ai, finding your Project, and pasting each `SKILL.md` block into Project Knowledge. About 5 minutes per pack. Save after each paste so the work is not lost on a tab close.")
readme_lines.append("")
readme_lines.append("### Max desktop tier (deep link or paste)")
readme_lines.append("")
readme_lines.append("Run `bash INSTALL-MAX.sh` from a terminal. It opens hoistos.com so you can use the per-pack `claude://` deep-link buttons, which install one pack at a time straight into your Claude desktop app. If the deep link does not register, fall back to the Pro paste flow.")
readme_lines.append("")
readme_lines.append("### Code tier (filesystem)")
readme_lines.append("")
readme_lines.append("Run `bash INSTALL-CODE.sh` from a terminal. It copies every `skills/<name>/` folder into `~/.claude/skills/`. Existing skills with the same name are left alone unless you pass `--overwrite`. Run `bash setup-verify.sh` after.")
readme_lines.append("")
readme_lines.append(f"## 3. What you got: {len(packs)} packs")
readme_lines.append("")
readme_lines.append("| Pack | Tier default | Skills | Install minutes |")
readme_lines.append("|---|---|---|---|")
for p in packs:
    skills_str = ", ".join(s["name"] for s in p["skills"]) or "embedded"
    readme_lines.append(f"| `{p['id']}` | {tier_badge(p)} | {skills_str} | {p['install_minutes']} |")
readme_lines.append("")
readme_lines.append("Total install time if you do every pack: about " +
                    f"{sum(p['install_minutes'] for p in packs)} minutes. Realistically you do not install all 34 in one sitting. Pick 3 from the Foundation tier, run them this week, come back for more.")
readme_lines.append("")
readme_lines.append("## 4. Verify install")
readme_lines.append("")
readme_lines.append("Open a fresh Claude chat in the Project where you installed the packs. Paste this exact prompt:")
readme_lines.append("")
readme_lines.append("```")
readme_lines.append("Smoke test. List every Skill or Project Knowledge block you can see in this chat. For each one, give me the name and one sentence on what it does. Do not invent any.")
readme_lines.append("```")
readme_lines.append("")
readme_lines.append("What you should see back: a list of the skills you just installed, named correctly, one sentence each. If the list is shorter than the count of packs you installed, the install did not register all of them. Re-run the install for the missing ones.")
readme_lines.append("")
readme_lines.append("On Code tier you can also run `bash setup-verify.sh` from inside the unpacked bundle. It prints the pack count, the installed skill count under `~/.claude/skills/`, and runs a smoke test on the first skill.")
readme_lines.append("")
readme_lines.append("## 5. Get help")
readme_lines.append("")
readme_lines.append("Stuck on a pack? Open the pack's `.md` file in `packs/`. Each one ships with a `Common breaks and how to fix` section. If that does not solve it, the timeline page on `hoistos.com` has the same content with screenshots and the `claude://` deep links for one-click activation.")
readme_lines.append("")
readme_lines.append("Routing manifest: `routing-manifest.json` lists every pack, every skill name, every install path, every tier default. If you want to script the install, that is the file to read.")
readme_lines.append("")
readme_lines.append("Built by Perennial Empire and HoistOS. Confidence: high.")
readme_lines.append("")

(stage_dir / "README.md").write_text("\n".join(readme_lines), encoding="utf-8")

# Build INSTALL-PRO.md (paste-into-Project-Knowledge instructions per pack)
pro_lines = []
pro_lines.append("# INSTALL-PRO.md")
pro_lines.append("")
pro_lines.append("Pro tier install: paste each SKILL.md block into Claude.ai Project Knowledge. About 5 minutes per pack.")
pro_lines.append("")
pro_lines.append("## 1. Open your Project")
pro_lines.append("")
pro_lines.append("Open `claude.ai` in a desktop browser. Sign in. Click the Projects tab in the left sidebar. Open the Project you want these skills installed in, or click `Create project` and name it `[Your name]'s Workspace`.")
pro_lines.append("")
pro_lines.append("## 2. Open Project Knowledge")
pro_lines.append("")
pro_lines.append("Inside the Project, look at the right side panel. Find the section labeled `Project knowledge`. That is the text box you paste into.")
pro_lines.append("")
pro_lines.append("## 3. Paste packs in this order")
pro_lines.append("")
pro_lines.append("Recommended order: Foundation packs first (they set voice + identity + routing), then pick the chronological packs that match what you want to do.")
pro_lines.append("")
pro_lines.append("For each pack:")
pro_lines.append("")
pro_lines.append("1. Open the pack file from `packs/` in this bundle (any text editor, or VS Code).")
pro_lines.append("2. Find the section labeled `## Skill: <name>` or `Artifact: ~/.claude/skills/<name>/SKILL.md`. That fenced block is the SKILL.md body.")
pro_lines.append("3. Copy the entire fenced block including the YAML frontmatter (`---` to `---`).")
pro_lines.append("4. Paste it into the Project Knowledge text box on claude.ai.")
pro_lines.append("5. Click `Save`.")
pro_lines.append("6. Open a fresh chat in this Project to confirm the skill is loaded.")
pro_lines.append("")
pro_lines.append("## Pack list")
pro_lines.append("")
for p in packs:
    skill_names = ", ".join(s["name"] for s in p["skills"]) or "(skill body embedded inline)"
    pro_lines.append(f"### `{p['id']}`")
    pro_lines.append("")
    pro_lines.append(f"- Tier default: {tier_badge(p)}")
    pro_lines.append(f"- Skills to paste: {skill_names}")
    pro_lines.append(f"- Pack file: `packs/{p['id']}.md`")
    pro_lines.append(f"- Install minutes: ~{p['install_minutes']}")
    pro_lines.append("")
pro_lines.append("## After install")
pro_lines.append("")
pro_lines.append("Open a fresh chat in your Project. Paste the smoke test from `README.md` Section 4. Confirm every skill comes back named. Done.")
pro_lines.append("")
(stage_dir / "INSTALL-PRO.md").write_text("\n".join(pro_lines), encoding="utf-8")

# Build INSTALL-MAX.sh (placeholder, opens hoistos.com)
max_lines = []
max_lines.append("#!/usr/bin/env bash")
max_lines.append("# INSTALL-MAX.sh")
max_lines.append("# Max desktop tier install: opens hoistos.com so you can use the per-pack")
max_lines.append("# claude:// deep links to install one pack at a time into your Claude desktop app.")
max_lines.append("# If your machine does not have the claude:// scheme registered (no Claude desktop")
max_lines.append("# app installed, or browser blocked it), fall back to the Pro paste flow.")
max_lines.append("set -euo pipefail")
max_lines.append("")
max_lines.append('URL="https://hoistos.com/empireworksreconstruction/timeline"')
max_lines.append('BUNDLE_DIR="$(cd "$(dirname "$0")" && pwd)"')
max_lines.append("")
max_lines.append('echo "HoistOS Empire Pack v2 - Max desktop install"')
max_lines.append('echo ""')
max_lines.append('echo "This installer opens the timeline page so you can use the claude:// deep links"')
max_lines.append('echo "for one-click install into your Claude desktop app."')
max_lines.append('echo ""')
max_lines.append('echo "Bundle location: $BUNDLE_DIR"')
max_lines.append('echo "Opening: $URL"')
max_lines.append('echo ""')
max_lines.append('if command -v open >/dev/null 2>&1; then')
max_lines.append('  open "$URL"')
max_lines.append('elif command -v xdg-open >/dev/null 2>&1; then')
max_lines.append('  xdg-open "$URL"')
max_lines.append('else')
max_lines.append('  echo "No open command found. Manually open: $URL"')
max_lines.append('fi')
max_lines.append('echo ""')
max_lines.append('echo "Fallback: if claude:// does not register, use INSTALL-PRO.md instead."')
max_lines.append('echo "It paste-installs each pack into Project Knowledge on claude.ai."')
max_lines.append("")
(stage_dir / "INSTALL-MAX.sh").write_text("\n".join(max_lines), encoding="utf-8")
os.chmod(stage_dir / "INSTALL-MAX.sh", 0o755)

# Build INSTALL-CODE.sh
code_lines = []
code_lines.append("#!/usr/bin/env bash")
code_lines.append("# INSTALL-CODE.sh")
code_lines.append("# Code tier install: copies every skills/<name>/ folder from this bundle into")
code_lines.append("# ~/.claude/skills/. Existing skills with the same name are left alone unless")
code_lines.append("# --overwrite is passed. Idempotent. Offline.")
code_lines.append("set -euo pipefail")
code_lines.append("")
code_lines.append('BUNDLE_DIR="$(cd "$(dirname "$0")" && pwd)"')
code_lines.append('SKILLS_SRC="$BUNDLE_DIR/skills"')
code_lines.append('SKILLS_DST="$HOME/.claude/skills"')
code_lines.append('OVERWRITE=0')
code_lines.append("")
code_lines.append('for arg in "$@"; do')
code_lines.append('  if [[ "$arg" == "--overwrite" ]]; then')
code_lines.append('    OVERWRITE=1')
code_lines.append('  fi')
code_lines.append('done')
code_lines.append("")
code_lines.append('if [[ ! -d "$SKILLS_SRC" ]]; then')
code_lines.append('  echo "ERROR: skills/ not found at $SKILLS_SRC. Bundle may be corrupt." >&2')
code_lines.append('  exit 1')
code_lines.append('fi')
code_lines.append("")
code_lines.append('mkdir -p "$SKILLS_DST"')
code_lines.append('echo "[INSTALL-CODE] source: $SKILLS_SRC"')
code_lines.append('echo "[INSTALL-CODE] dest:   $SKILLS_DST"')
code_lines.append('echo "[INSTALL-CODE] overwrite: $OVERWRITE"')
code_lines.append('echo ""')
code_lines.append("")
code_lines.append('installed=0')
code_lines.append('skipped=0')
code_lines.append('for src in "$SKILLS_SRC"/*/; do')
code_lines.append('  [[ -d "$src" ]] || continue')
code_lines.append('  name="$(basename "$src")"')
code_lines.append('  dst="$SKILLS_DST/$name"')
code_lines.append('  if [[ -d "$dst" && "$OVERWRITE" -eq 0 ]]; then')
code_lines.append('    echo "  [skip] $name (already installed; pass --overwrite to replace)"')
code_lines.append('    skipped=$((skipped + 1))')
code_lines.append('    continue')
code_lines.append('  fi')
code_lines.append('  mkdir -p "$dst"')
code_lines.append('  cp -R "$src"* "$dst/"')
code_lines.append('  echo "  [ok]   $name"')
code_lines.append('  installed=$((installed + 1))')
code_lines.append('done')
code_lines.append("")
code_lines.append('echo ""')
code_lines.append('echo "[INSTALL-CODE] installed: $installed"')
code_lines.append('echo "[INSTALL-CODE] skipped:   $skipped"')
code_lines.append('echo ""')
code_lines.append('echo "Run bash setup-verify.sh next to confirm the install."')
code_lines.append("")
(stage_dir / "INSTALL-CODE.sh").write_text("\n".join(code_lines), encoding="utf-8")
os.chmod(stage_dir / "INSTALL-CODE.sh", 0o755)

# Build setup-verify.sh
verify_lines = []
verify_lines.append("#!/usr/bin/env bash")
verify_lines.append("# setup-verify.sh")
verify_lines.append("# Post-install smoke test. Prints pack count, installed skill count, and runs a")
verify_lines.append("# first-skill smoke test (cats the first SKILL.md frontmatter).")
verify_lines.append("set -euo pipefail")
verify_lines.append("")
verify_lines.append('BUNDLE_DIR="$(cd "$(dirname "$0")" && pwd)"')
verify_lines.append('PACKS="$BUNDLE_DIR/packs"')
verify_lines.append('SKILLS_DST="$HOME/.claude/skills"')
verify_lines.append("")
verify_lines.append('echo "HoistOS Empire Pack v2 - setup verify"')
verify_lines.append('echo "Bundle: $BUNDLE_DIR"')
verify_lines.append('echo ""')
verify_lines.append("")
verify_lines.append('pack_count=$(find "$PACKS" -maxdepth 1 -name "*.md" | wc -l | tr -d " ")')
verify_lines.append('echo "Packs in bundle:        $pack_count"')
verify_lines.append("")
verify_lines.append('if [[ -d "$SKILLS_DST" ]]; then')
verify_lines.append('  installed=$(find "$SKILLS_DST" -maxdepth 2 -name "SKILL.md" | wc -l | tr -d " ")')
verify_lines.append('  echo "Skills installed:       $installed (in $SKILLS_DST)"')
verify_lines.append('else')
verify_lines.append('  echo "Skills installed:       0 (no $SKILLS_DST directory)"')
verify_lines.append('fi')
verify_lines.append('echo ""')
verify_lines.append("")
verify_lines.append('first_skill_dir=$(find "$BUNDLE_DIR/skills" -mindepth 1 -maxdepth 1 -type d | head -1)')
verify_lines.append('if [[ -n "$first_skill_dir" ]]; then')
verify_lines.append('  first_name="$(basename "$first_skill_dir")"')
verify_lines.append('  echo "Smoke test: first skill in bundle is $first_name"')
verify_lines.append('  echo "  Bundle path:  $first_skill_dir/SKILL.md"')
verify_lines.append('  if [[ -f "$SKILLS_DST/$first_name/SKILL.md" ]]; then')
verify_lines.append('    echo "  Install path: $SKILLS_DST/$first_name/SKILL.md (PRESENT)"')
verify_lines.append('    echo ""')
verify_lines.append('    echo "  Frontmatter from installed copy:"')
verify_lines.append('    head -10 "$SKILLS_DST/$first_name/SKILL.md" | sed "s/^/    /"')
verify_lines.append('  else')
verify_lines.append('    echo "  Install path: $SKILLS_DST/$first_name/SKILL.md (MISSING)"')
verify_lines.append('    echo "  If you are on Code tier: run bash INSTALL-CODE.sh first."')
verify_lines.append('    echo "  If you are on Pro or Max: this is expected. Verify via the smoke prompt"')
verify_lines.append('    echo "  in README.md Section 4."')
verify_lines.append('  fi')
verify_lines.append('else')
verify_lines.append('  echo "No skills/ folder in bundle. Bundle may be corrupt."')
verify_lines.append('fi')
verify_lines.append('echo ""')
verify_lines.append('echo "Done. If counts look wrong, re-run bundle-build.sh and reinstall."')
verify_lines.append("")
(stage_dir / "setup-verify.sh").write_text("\n".join(verify_lines), encoding="utf-8")
os.chmod(stage_dir / "setup-verify.sh", 0o755)

print(f"[bundle-build] manifest: {len(packs)} packs, {len(all_skills)} unique skills")
PYEOF

# Zip the staged content
echo "[bundle-build] zipping to $ZIP_OUT"
rm -f "$ZIP_OUT"
( cd "$STAGE_DIR" && zip -rq "$ZIP_OUT" . )

ZIP_SIZE_KB=$(du -k "$ZIP_OUT" | awk '{print $1}')
ZIP_FILES=$(unzip -l "$ZIP_OUT" | tail -1 | awk '{print $2}')
echo "[bundle-build] DONE: $ZIP_OUT ($ZIP_SIZE_KB KB, $ZIP_FILES files)"
