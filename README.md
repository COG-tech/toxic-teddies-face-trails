# Toxic Teddies: Arrow Escape

Toxic Teddies: Arrow Escape is being built as a native iOS and Android puzzle game for the Apple App Store and Google Play.

The current GitHub Pages build is the **browser prototype and interaction reference**, not the finished mobile app.

Primary rule:

> **The face is the puzzle.**

Hundreds of connected orthogonal arrow paths form the actual face of a Toxic Teddy. The player selects a path with a clear arrowhead exit, the arrowhead leaves first, and the connected body follows through its bends.

## Current prototype status

The current browser build provides:

- Toxic Toby / Radioactive Ricky;
- five expression levels:
  1. Neutral
  2. Evil Grin
  3. Gross
  4. Angry
  5. Maniacal Laugh;
- dense face-shaped path geometry;
- document-level nearest-path selection;
- head-ray blocking;
- head-first pull-through animation;
- three toxic-drop lives in the current prototype;
- long-press preview;
- hints;
- completed-level persistence;
- browser service-worker caching.

The other eleven Founding Teddies are not yet playable. Their cards are prototype placeholders/coming-soon states and must not be treated as completed content.

## Known prototype limitations

- The runtime is assembled through `dense-loader.js` and indirect `eval()`.
- Core functions are overridden across several patch files.
- Blocked taps currently consume lives; this is not yet approved as the final mobile rule.
- Exact unfinished path state is not saved.
- Other Teddy cards can still route to Toxic Toby through the current override stack.
- One complete Toxic Toby expression sheet is repositioned as five temporary backdrops.
- The service worker is a browser-prototype feature, not the native update system.
- Native iOS and Android projects have not yet been generated.

## Native mobile target

The production app will use the existing Vite/JavaScript/SVG game core packaged locally through Capacitor.

Planned native deliverables:

```text
Vite game build
    ↓
Capacitor native runtime
    ↓
ios/ Xcode project
android/ Android Studio project
    ↓
TestFlight and Google Play internal testing
    ↓
Apple App Store and Google Play
```

The installed apps will bundle approved launch levels and assets locally, work in airplane mode, save exact progress through native storage/lifecycle handling, and add native haptics and sharing.

## Authoritative planning documents

Start with:

```text
docs/README_NATIVE_PLAN.md
docs/MASTER_APP_BUILD_PLAN.md
docs/NATIVE_MOBILE_TECHNICAL_SETUP.md
docs/GITHUB_EXECUTION_CHECKLIST.md
docs/QA_AND_RELEASE_GATES.md
docs/STORE_RELEASE_CHECKLIST.md
```

Current browser baseline:

```text
docs/BASELINE_CURRENT_BUILD.md
docs/BASELINE_SMOKE_TEST.md
docs/BASELINE_RECORDING_CHECKLIST.md
```

## Current runtime files

```text
index.html
styles.css
compiled-patterns.css
hard-mode-v3.css
dense-loader.js
compiled-app.js
hard-mode-v3.js
dense-fallback.js
interaction-fix.js
levels/tt01/
assets/backdrops/toxic-toby-expression-sheet.svg
manifest.webmanifest
sw.js
```

The exact load and override order is documented in `docs/BASELINE_CURRENT_BUILD.md`.

## Local development

```bash
npm install
npm run dev
```

## Browser production build

```bash
npm run build
```

## Important development rule

Do not refactor or replace the current touch/click behavior until the baseline smoke tests are recorded and the same behavior runs inside the Capacitor iOS and Android containers.
