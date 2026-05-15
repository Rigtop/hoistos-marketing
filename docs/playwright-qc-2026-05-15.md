# HoistOS install surface Playwright QC, 2026-05-15

Generated: 2026-05-15T19:10:34.485Z
Dev server: http://localhost:5174

Sprint: yes-this-new-mcbp-dapper-corbato (S217)
Plan: ~/.claude/plans/yes-this-new-mcbp-dapper-corbato.md, "Mobile-First Render (Hard Rule #35, R067)"

## Stamp

```
Mobile render: scanned 5 viewports, horizontal-scroll=false, overflow-elements=0, tap-test=PASS
```

## Summary

Routes scanned: 3
Viewports per route: 5 (320, 375, 768, 1024, 1440 px)
Total checks: 55 (PASS=50, FAIL=0, SKIP=5)
Tap-target test: PASS
Horizontal scroll detected: false
Overflow elements: 0
Bridge .mcpb regression: PASS (GET /downloads/empireworks-bridge-1.0.3.mcpb returned 200 (content-length=4194803))

## Per-route, per-viewport results

### /empireworksreconstruction

#### 320 px: PASS

Screenshot: `screenshots-qc-2026-05-15/landing--320px.png`

PASS (5):

- horizontal-scroll: scrollWidth=320 clientWidth=320
- intake-modal-dismissible: closed via Escape (or not open to begin with)
- journey-tracker-renders: tag=aside width=282px
- bridge-panel-optional-framing: string "Optional Desktop convenience" found
- edit-your-setup-pill: height=44px width=163px

SKIP (1):

- intake-modal-renders: no intake dialog visible (likely already-complete state from localStorage)

Console errors: 6
- console: Error: <circle> attribute r: Expected length, "undefined".
- console: Error: <circle> attribute r: Expected length, "undefined".
- console: Error: <circle> attribute r: Expected length, "undefined".
- console: Error: <circle> attribute r: Expected length, "undefined".
- console: Error: <circle> attribute r: Expected length, "undefined".

#### 375 px: PASS

Screenshot: `screenshots-qc-2026-05-15/landing--375px.png`

PASS (5):

- horizontal-scroll: scrollWidth=375 clientWidth=375
- intake-modal-dismissible: closed via Escape (or not open to begin with)
- journey-tracker-renders: tag=aside width=330px
- bridge-panel-optional-framing: string "Optional Desktop convenience" found
- edit-your-setup-pill: height=44px width=163px

SKIP (1):

- intake-modal-renders: no intake dialog visible (likely already-complete state from localStorage)

Console errors: 6
- console: Error: <circle> attribute r: Expected length, "undefined".
- console: Error: <circle> attribute r: Expected length, "undefined".
- console: Error: <circle> attribute r: Expected length, "undefined".
- console: Error: <circle> attribute r: Expected length, "undefined".
- console: Error: <circle> attribute r: Expected length, "undefined".

#### 768 px: PASS

Screenshot: `screenshots-qc-2026-05-15/landing--768px.png`

PASS (5):

- horizontal-scroll: scrollWidth=768 clientWidth=768
- intake-modal-dismissible: closed via Escape (or not open to begin with)
- journey-tracker-renders: tag=aside width=320px
- bridge-panel-optional-framing: string "Optional Desktop convenience" found
- edit-your-setup-pill: height=44px width=163px

SKIP (1):

- intake-modal-renders: no intake dialog visible (likely already-complete state from localStorage)

Console errors: 6
- console: Error: <circle> attribute r: Expected length, "undefined".
- console: Error: <circle> attribute r: Expected length, "undefined".
- console: Error: <circle> attribute r: Expected length, "undefined".
- console: Error: <circle> attribute r: Expected length, "undefined".
- console: Error: <circle> attribute r: Expected length, "undefined".

#### 1024 px: PASS

Screenshot: `screenshots-qc-2026-05-15/landing--1024px.png`

PASS (5):

- horizontal-scroll: scrollWidth=1024 clientWidth=1024
- intake-modal-dismissible: closed via Escape (or not open to begin with)
- journey-tracker-renders: tag=aside width=320px
- bridge-panel-optional-framing: string "Optional Desktop convenience" found
- edit-your-setup-pill: height=44px width=163px

SKIP (1):

- intake-modal-renders: no intake dialog visible (likely already-complete state from localStorage)

Console errors: 6
- console: Error: <circle> attribute r: Expected length, "undefined".
- console: Error: <circle> attribute r: Expected length, "undefined".
- console: Error: <circle> attribute r: Expected length, "undefined".
- console: Error: <circle> attribute r: Expected length, "undefined".
- console: Error: <circle> attribute r: Expected length, "undefined".

#### 1440 px: PASS

Screenshot: `screenshots-qc-2026-05-15/landing--1440px.png`

PASS (5):

- horizontal-scroll: scrollWidth=1440 clientWidth=1440
- intake-modal-dismissible: closed via Escape (or not open to begin with)
- journey-tracker-renders: tag=aside width=320px
- bridge-panel-optional-framing: string "Optional Desktop convenience" found
- edit-your-setup-pill: height=44px width=163px

SKIP (1):

- intake-modal-renders: no intake dialog visible (likely already-complete state from localStorage)

Console errors: 6
- console: Error: <circle> attribute r: Expected length, "undefined".
- console: Error: <circle> attribute r: Expected length, "undefined".
- console: Error: <circle> attribute r: Expected length, "undefined".
- console: Error: <circle> attribute r: Expected length, "undefined".
- console: Error: <circle> attribute r: Expected length, "undefined".

### /empireworksreconstruction/foundation

#### 320 px: PASS

Screenshot: `screenshots-qc-2026-05-15/foundation--320px.png`

PASS (3):

- horizontal-scroll: scrollWidth=320 clientWidth=320
- foundation-cards-install-button: found 11 install buttons; sample=[{"text":"Install on my Claude","w":232,"h":44},{"text":"Install on my Claude","w":232,"h":44},{"text":"Install on my Claude","w":232,"h":44},{"text":"Install on my Claude","w":232,"h":44},{"text":"Install on my Claude","w":232,"h":44}]
- customware-form-expand-and-tap-target: inputs=2 minH=45px sample=[{"placeholder":"e.g. john","h":45,"w":197},{"placeholder":"e.g. acme-construction","h":45,"w":196}]

#### 375 px: PASS

Screenshot: `screenshots-qc-2026-05-15/foundation--375px.png`

PASS (3):

- horizontal-scroll: scrollWidth=375 clientWidth=375
- foundation-cards-install-button: found 11 install buttons; sample=[{"text":"Install on my Claude","w":280,"h":44},{"text":"Install on my Claude","w":280,"h":44},{"text":"Install on my Claude","w":280,"h":44},{"text":"Install on my Claude","w":280,"h":44},{"text":"Install on my Claude","w":280,"h":44}]
- customware-form-expand-and-tap-target: inputs=2 minH=45px sample=[{"placeholder":"e.g. john","h":46,"w":245},{"placeholder":"e.g. acme-construction","h":45,"w":245}]

#### 768 px: PASS

Screenshot: `screenshots-qc-2026-05-15/foundation--768px.png`

PASS (3):

- horizontal-scroll: scrollWidth=768 clientWidth=768
- foundation-cards-install-button: found 11 install buttons; sample=[{"text":"Install on my Claude","w":131,"h":62},{"text":"Install on my Claude","w":131,"h":62},{"text":"Install on my Claude","w":131,"h":62},{"text":"Install on my Claude","w":131,"h":62},{"text":"Install on my Claude","w":131,"h":62}]
- customware-form-expand-and-tap-target: inputs=2 minH=47px sample=[{"placeholder":"e.g. john","h":47,"w":232},{"placeholder":"e.g. acme-construction","h":47,"w":231}]

#### 1024 px: PASS

Screenshot: `screenshots-qc-2026-05-15/foundation--1024px.png`

PASS (3):

- horizontal-scroll: scrollWidth=1024 clientWidth=1024
- foundation-cards-install-button: found 11 install buttons; sample=[{"text":"Install on my Claude","w":186,"h":62},{"text":"Install on my Claude","w":186,"h":62},{"text":"Install on my Claude","w":186,"h":62},{"text":"Install on my Claude","w":186,"h":62},{"text":"Install on my Claude","w":186,"h":62}]
- customware-form-expand-and-tap-target: inputs=2 minH=47px sample=[{"placeholder":"e.g. john","h":47,"w":345},{"placeholder":"e.g. acme-construction","h":47,"w":344}]

#### 1440 px: PASS

Screenshot: `screenshots-qc-2026-05-15/foundation--1440px.png`

PASS (3):

- horizontal-scroll: scrollWidth=1440 clientWidth=1440
- foundation-cards-install-button: found 11 install buttons; sample=[{"text":"Install on my Claude","w":202,"h":44},{"text":"Install on my Claude","w":202,"h":44},{"text":"Install on my Claude","w":202,"h":44},{"text":"Install on my Claude","w":202,"h":44},{"text":"Install on my Claude","w":202,"h":44}]
- customware-form-expand-and-tap-target: inputs=2 minH=47px sample=[{"placeholder":"e.g. john","h":47,"w":406},{"placeholder":"e.g. acme-construction","h":48,"w":405}]

### /empireworksreconstruction/pack/foundation-01-constitution

#### 320 px: PASS

Screenshot: `screenshots-qc-2026-05-15/pack-detail--320px.png`

PASS (2):

- horizontal-scroll: scrollWidth=320 clientWidth=320
- pack-detail-renders: heading="Operating Constitution"

#### 375 px: PASS

Screenshot: `screenshots-qc-2026-05-15/pack-detail--375px.png`

PASS (2):

- horizontal-scroll: scrollWidth=375 clientWidth=375
- pack-detail-renders: heading="Operating Constitution"

#### 768 px: PASS

Screenshot: `screenshots-qc-2026-05-15/pack-detail--768px.png`

PASS (2):

- horizontal-scroll: scrollWidth=768 clientWidth=768
- pack-detail-renders: heading="Operating Constitution"

#### 1024 px: PASS

Screenshot: `screenshots-qc-2026-05-15/pack-detail--1024px.png`

PASS (2):

- horizontal-scroll: scrollWidth=1024 clientWidth=1024
- pack-detail-renders: heading="Operating Constitution"

#### 1440 px: PASS

Screenshot: `screenshots-qc-2026-05-15/pack-detail--1440px.png`

PASS (2):

- horizontal-scroll: scrollWidth=1440 clientWidth=1440
- pack-detail-renders: heading="Operating Constitution"

## Bridge install regression

Status: PASS
Detail: GET /downloads/empireworks-bridge-1.0.3.mcpb returned 200 (content-length=4194803)
Verifies: clicking the "Download Bridge for Claude Desktop" anchor on the landing page still triggers the .mcpb download.

## Reproduction harness

```bash
cd ~/Desktop/Outputs/AI\ Authority/HoistOS/hoistos-marketing
npm run dev
QC_BASE_URL=http://localhost:5174 node scripts/playwright-qc-2026-05-15.mjs
```

Screenshots land in `screenshots-qc-2026-05-15/`. This report regenerates on every run.
