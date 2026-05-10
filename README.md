# HoistOS

The AI upgrade pack for construction operators. Open-source. Built by Eugeen Bernan, COO of Perennial Empire.

Live: [https://hoistos.com](https://hoistos.com)

## What this is

HoistOS is a React/Vite/TypeScript marketing site that ships installable Claude upgrade packs. The catalog is split into two surfaces:

- **Foundation packs** (10 chronological wireframe stops, mapped to a real construction operator's AI build journey).
- **Bonus blueprints** (8 deeper how-to wireframes covering Notion, RAG, Telegram, Code CLI, hooks, daemons, auto-memory).

Each pack installs into the user's local Claude Code via a custom `claude://cowork/new?q=...` URL scheme, with a clipboard fallback when the OS handler is not registered. The bootstrap prompt is markdown sourced from `public/packs-v2/` and `public/bonus-extras/`.

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
src/components/                   Page-level components, including EmpireTimeline-d (10 foundation packs)
src/components/                   Marquee, hero, panels, scroll sections
public/packs-v2/                  Markdown blueprint files (44 packs, foundation + advanced + business + beginner)
public/bonus-extras/              Bonus blueprint markdown (8 packs)
public/brand/                     HoistOS + EmpireWorks logos and brand assets
public/install.sh                 One-line installer for Claude Code users
src/HoistOSHome.tsx               HoistOS home surface
src/main.tsx                      Entrypoint, routes, theme bootstrap
```

## Key surfaces

| Route | Purpose |
| --- | --- |
| `/` | HoistOS home |
| `/empireworksreconstruction` | Empire Wireframe landing |
| `/empireworksreconstruction/timeline` | 10 foundation packs in chronological story |
| `/empireworksreconstruction/bonus-extras` | 8 wireframe blueprints |

## Voice rules

- Zero em dashes anywhere (Hard Rule #11). Use commas, periods, colons, or split sentences.
- Always write "Perennial Empire" in full. The two-letter shortform is not allowed in any copy, code comment, or markdown.
- Plain English on all surfaces (R039). Talk like a friend explaining, not an engineer reporting.

## Contributing

Pull requests welcome. Before submitting:

1. Run `npm run build` and confirm a clean compile.
2. Confirm zero em dashes in any new markdown, copy, or code comments.
3. Keep the foundation pack count and bonus blueprint count in sync with the manifest if you add or remove packs.

## License

MIT. See [LICENSE](./LICENSE).
