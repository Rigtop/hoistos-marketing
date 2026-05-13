# Capture Screenshots for EmpireWorks Bridge Landing Page

**Owner:** Eugeen Bernan  
**When:** Before v1.0.2 release (target: Tuesday 2026-05-13)  
**Output dir:** `public/screenshots/empireworks-bridge/`  
**Exact filenames expected by TSX:** see list below

---

## What to capture (3 screenshots)

| Filename | Step | What it shows |
|---|---|---|
| `install-dialog-placeholder.png` | Step 2 | Claude Desktop extension install screen |
| `project-instructions-placeholder.png` | Step 5 | Project Instructions panel with activation line pasted |
| `verify-setup-placeholder.png` | Step 6 | Claude response confirming Bridge + Foundation live |

Replace the placeholder files with the real captures using the same filenames. Vite serves them from `/screenshots/empireworks-bridge/` automatically.

---

## Step-by-step capture instructions

### Screenshot 1: Install dialog (Step 2)

1. Download `empireworks-bridge-1.0.2.mcpb` from the landing page (or from `public/downloads/`).
2. Double-click the `.mcpb` file in Finder. Claude Desktop opens an extension install screen.
3. **Before clicking Install**, take the screenshot:
   - macOS: `Cmd+Shift+4`, then `Space`, then click the Claude Desktop window.
   - OR: `Cmd+Shift+3` for full screen, then crop in Preview.
4. The screen should show the EmpireWorks Bridge extension card with the **Install** button visible.
5. Target crop: the Claude Desktop window only, no Dock or background apps visible.
6. Save as: `install-dialog-placeholder.png` (exact name).

### Screenshot 2: Project Instructions (Step 5)

1. Open Claude Desktop. Open (or create) a Project where Bridge will live.
2. Click the Project name at top of the left sidebar, choose **Project settings**, then **Instructions**.
3. Paste the activation line:
   ```
   At the start of every conversation, call the EmpireWorks Bridge get_router tool and follow the instructions it returns. For task-specific guidance, call read_installed_pack with the pack id named in the router.
   ```
4. The Project Instructions panel should show the activation line in the text field, not yet saved (or right after save - either is fine as long as text is visible).
5. Take the screenshot:
   - macOS: `Cmd+Shift+4`, drag to capture the Project settings panel area.
   - OR `Cmd+Shift+4 Space` to capture the whole Claude Desktop window.
6. Save as: `project-instructions-placeholder.png` (exact name).

### Screenshot 3: verify_setup tool response (Step 6)

1. Open a fresh chat inside the same Claude Project.
2. Paste the check prompt:
   ```
   Check my EmpireWorks Bridge setup. Confirm Foundation is installed, list the installed packs, and tell me what I can ask you to do now.
   ```
3. When Claude responds, it should call `verify_setup` (or similar), then return a confirmation message listing the Foundation packs.
4. Let the full response render, then screenshot the conversation showing:
   - The tool call card (`verify_setup`) with green checkmark or similar.
   - The response text listing installed packs.
5. Take the screenshot:
   - `Cmd+Shift+4 Space`, click the Claude Desktop window.
6. Save as: `verify-setup-placeholder.png` (exact name).

---

## Crop and quality spec

- **Target dimensions:** 1200 x 800 px (3:2 aspect ratio).
- **Retina note:** if you capture at 2x (Retina), Preview will export at 2400x1600. Scale down to 1200x800 in Preview: `Tools > Adjust Size > 1200 px wide`.
- **Padding:** keep at least 16 px of Claude Desktop window chrome on each edge so it reads as "real app" and not a cropped grab.
- **Format:** PNG (no JPEG compression artifacts on UI chrome).
- **No personally identifiable content:** check that no unrelated conversations, emails, or personal data are visible in the sidebar or background.

---

## After capture

1. Drop the 3 PNG files into `public/screenshots/empireworks-bridge/`, replacing the placeholders.
2. Verify filenames match exactly (no `(1)` suffixes from macOS duplicate protection).
3. Run `npm run build` from the repo root to confirm Vite picks them up.
4. Optionally run Playwright: `npx playwright test` if the test suite is wired.
5. Deploy via standard preview branch push.

---

## File paths reference

```
hoistos-marketing/
  public/
    screenshots/
      empireworks-bridge/
        install-dialog-placeholder.png       <- replace with real
        project-instructions-placeholder.png <- replace with real
        verify-setup-placeholder.png         <- replace with real
  src/
    empire/
      EmpireLanding.tsx   <- ScreenshotPlaceholder components point here
  scripts/
    capture-screenshots.md  <- this file
```
