# HoistOS

The AI upgrade pack for construction operators. Open-source. Built by Eugeen Bernan, COO of Perennial Empire.

Live: [https://hoistos.com](https://hoistos.com)

## What this is

HoistOS is a React/Vite/TypeScript marketing site that ships the EmpireWorks Bridge installer plus supporting Claude upgrade pack pages. The EmpireWorks Reconstruction surface now has one primary install path:

- **EmpireWorks Bridge** (one `.mcpb` Claude Desktop extension, 33 bundled packs across 6 tiers).
- **Foundation packs** (11 start-here packs, installed by the bridge with `setup_foundation`).
- **Bonus blueprints** (8 deeper how-to wireframes covering Notion, RAG, Telegram, Code CLI, hooks, daemons, auto-memory).

The bridge-first path is the canonical external packaging. The older direct pack pages are secondary preview and reference surfaces only. Pack content is served from `public/packs-v2/` and `public/bonus-extras/`.

## Stack

- React 18
- Vite
- TypeScript
- Tailwind CSS
- Motion (Framer Motion successor)
- GSAP
- Lenis (smooth scroll)
- React Three Fiber (Three.js)

## Run locally

```bash
npm install
npm run dev   # http://localhost:5173
```

## Build

```bash
npm run build
```

## Deploy

```bash
vercel deploy --prod
```

## Project structure

```
src/empire/                       Empire Wireframe surface (timeline + bonus-extras + landing + auth)
src/components/                   Page-level components, including EmpireTimeline-d (11 foundation packs)
src/components/                   Marquee, hero, panels, scroll sections
public/packs-v2/                  Markdown blueprint files, including the 33 bridge-bundled packs plus legacy/support files
public/bonus-extras/              Bonus blueprint markdown (8 packs)
public/brand/                     HoistOS + EmpireWorks logos and brand assets
public/downloads/                 Bridge .mcpb downloads
src/HoistOSHome.tsx               HoistOS home surface
src/main.tsx                      Entrypoint, routes, theme bootstrap
```

## Key surfaces

| Route | Purpose |
| --- | --- |
| `/` | HoistOS home |
| `/empireworksreconstruction` | Empire Wireframe landing |
| `/empireworksreconstruction/timeline` | 11 foundation packs in chronological story |
| `/empireworksreconstruction/bonus-extras` | 8 wireframe blueprints |

## Voice rules

- Zero em dashes anywhere (Hard Rule #11). Use commas, periods, colons, or split sentences.
- Always write "Perennial Empire" in full. The two-letter shortform is not allowed in any copy, code comment, or markdown.
- Plain English on all surfaces (R039). Talk like a friend explaining, not an engineer reporting.

## Contributing

Pull requests welcome. Before submitting:

1. Run `npm run build` and confirm a clean compile.
2. Confirm zero em dashes in any new markdown, copy, or code comments.
3. Keep the bridge count, foundation pack count, and bonus blueprint count in sync with the manifest if you add or remove packs.

## License

MIT. See [LICENSE](./LICENSE).
// auto-deploy verify 1778637248
