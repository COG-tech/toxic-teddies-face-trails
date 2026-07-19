# Toxic Teddies: Face Trails

A collectible tracing puzzle game where **every level map is built from the face of an original Toxic Teddy**. The player traces the ears, eyes, scars, stitches, mouth, slime, mold, cracks, and mutations—not a random maze placed over character artwork.

## Playable prototype

Two reusable, data-driven levels are now included:

1. **Toxic Toby / Radioactive Ricky**
2. **Moldy Molly / Fungus Faye**

Each level contains its own character metadata, SVG face map, path rules, and full-color completion reveal.

## Implemented gameplay

- mouse, touch, and stylus support through Pointer Events;
- responsive SVG coordinate conversion;
- configurable path-distance tolerance;
- ordered trail completion;
- wrong-direction detection;
- disconnected-route jump prevention;
- three toxic-drop lives;
- reset, retry, and hints;
- progress percentage and route checklist;
- full-color Teddy reveal;
- local completion and collection saving;
- level selector and URL-based level loading;
- reusable JSON/SVG level architecture.

## Project structure

```text
assets/teddies/<character_slug>/
  character.json
  face_map.json
  face_map.svg
  completed_reveal.svg

data/levels.json
scripts/validate-levels.mjs
docs/MASTER_PROJECT_DEFINITION.md
```

The tracing engine contains no level-specific geometry. New Teddy levels are registered in `data/levels.json` and loaded through the same engine.

## Local development

```bash
npm install
npm run dev
```

## Validation and production build

```bash
npm run check
npm run build
```

The generated production site is written to `dist/`. GitHub Actions runs the same validation and build steps on pushes to `main` and on pull requests.

## Current milestone status

- Two playable Teddy face maps: complete
- Reusable tracing engine: complete
- Local data validation: passing
- Vite production build: passing
- Next milestone: real-device touch tuning, visual QA, and the third Founding Teddy
