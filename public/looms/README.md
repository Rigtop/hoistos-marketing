# /public/looms/

Loom poster scaffolding for the 6 big-moment chapter breaks rendered via
`BigMomentChapterBreak.tsx`. Tab G5 Phase 1 placeholders, S198 morning
2026-05-08.

## How the slot resolves

`<LoomEmbed url="/looms/<slug>.mp4" thumbnail="/looms/<slug>-thumb.png" duration={90} />`

Until the real Loom recordings exist, the component falls back to:
1. The poster SVG at `/looms/<slug>-thumb.svg` (rendered as `<img>`).
2. A "recording captured pending" overlay if `url` is missing.
3. The actual `<iframe>` once `url` is set to a Loom embed URL.

## Six slots, one per big moment

| # | Chapter | Slug | Item | Title |
|---|--------|------|------|-------|
| 1 | 02 | `chat-to-cowork` | 2 | Cowork, Projects, and pinned context |
| 2 | 03 | `cowork-takes-control` | 3 | Cowork could organize the desktop |
| 3 | 04 | `skills-compounding` | 4 | First skill ever: Memory Architect |
| 4 | 05 | `memory-was-the-bottleneck` | 22 | Cold-start + One-Brain Gate |
| 5 | 06A | `move-to-code` | 24 | Bernie Migration to Code CLI |
| 6 | 06B | `autonomous-loops-shipped` | 26 | First parallel autonomous overnight |

## Filename conventions

- `<slug>-thumb.svg` (or `.png`) is the poster.
- `<slug>.mp4` (or `.webm`) is the played clip.
- Loom embed URL form: `https://www.loom.com/embed/<id>`. Pass that to
  `LoomEmbed.url` once the recording is uploaded.

## Replacement workflow

1. Record a 90 sec recap on Loom using the chapter slug as the title.
2. Copy the embed URL.
3. In `BIG_MOMENT_CUSTOMIZATIONS` (`src/empire/content/timeline-d-real.ts`),
   set `loomEmbedUrl: 'https://www.loom.com/embed/<id>'` for the matching
   moment. The component swaps to the live iframe automatically.
