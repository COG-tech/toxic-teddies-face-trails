# Current Prototype Baseline

Recorded: 2026-07-21

## Baseline commits

- Product source after the native planning merge: `b9679978e76e198d93bed5e11f391b45293d8eff`
- Last gameplay commit before documentation-only planning changes: `c3228d70eda6fe25d48fecd0b80ce79bd53019f5`
- Debug build identifier: `prototype-baseline-c3228d70`

The planning merge changed documentation only. The two commits above therefore contain the same gameplay/runtime files.

## Role of this build

This is the browser prototype and behavioral reference for the future native iOS and Android app.

It is not the production mobile architecture. No Capacitor configuration, `ios/` project, `android/` project, native save system or store build exists at this baseline.

## Entry-point load order

`index.html` loads these styles in order:

1. `styles.css?v=30`
2. `compiled-patterns.css?v=30`
3. `hard-mode-v3.css?v=30`

It then:

1. registers `sw.js?v=30` when service workers are supported;
2. loads `dense-loader.js?v=30`.

`dense-loader.js` fetches and evaluates these runtime files in this exact order:

1. `compiled-app.js?v=30`
2. `hard-mode-v3.js?v=30`
3. `dense-fallback.js?v=30`
4. `interaction-fix.js?v=30`
5. `boot()`

The loader removes the trailing `boot()` call from `compiled-app.js`, concatenates all four files, executes them through indirect `eval()`, and then calls `boot()` once.

This override order is essential to reproducing current behavior.

## Runtime ownership and override stack

### `compiled-app.js`

Defines the initial application state and base behavior:

- 12 hard-coded Founding Teddy records;
- five levels per Teddy;
- localStorage completion flags;
- base home/game UI;
- base SVG rendering;
- base path blocker raycast;
- three toxic-drop lives;
- long-press preview;
- hint behavior;
- base whole-path exit animation;
- completion and game-over modals.

Important base behavior:

- `fetchLevel()` tries the selected Teddy path first and then falls back to Toxic Toby.
- Toxic Toby uses one complete expression-sheet SVG as a repositioned background.
- progress persistence records completed levels only.

### `hard-mode-v3.js`

Overrides major portions of the base runtime:

- forces all game openings to Teddy index `0`;
- marks Toxic Toby as playable and other cards as coming soon;
- attempts to load the compressed dense Toxic Toby pack;
- sets strict-sequence metadata and frontier counts;
- replaces the renderer with dense path/caret SVG geometry;
- replaces blocking with strict solution-frontier blocking;
- replaces removal with the current head-first pull-through animation;
- replaces life-loss messaging and animation.

### `dense-fallback.js`

Overrides `fetchLevel()` again.

The final level source is therefore the deterministic browser generator in this file rather than the compressed dense pack from `hard-mode-v3.js`.

Current generated levels:

| Level | Expression | Grid | Target paths |
|---|---|---:|---:|
| 1 | Neutral | 57×57 | 125 |
| 2 | Evil Grin | 59×59 | 132 |
| 3 | Gross | 61×61 | 138 |
| 4 | Angry | 63×63 | 145 |
| 5 | Maniacal Laugh | 65×65 | 150 |

The generator:

- creates a Toxic Toby face mask;
- assigns facial regions and path styles;
- generates orthogonal paths;
- rejects candidate placement that cannot exit under the head-ray rule;
- verifies its reverse-construction solution;
- returns `strictSequence: false` and `movementRule: arrowhead_ray_clear_to_edge`.

### `interaction-fix.js`

Applies the final active interaction rules:

- overrides `blockersAhead()` with a raycast from `piece.cells[0]` in the arrow direction;
- overrides `attemptMove()`;
- installs a capture-phase document click listener;
- finds the nearest active path by screen-space distance to its segments;
- accepts a selection only when the nearest distance is 32 CSS pixels or less;
- calls the current removal animation for open paths;
- calls the current life-loss function for blocked paths;
- checks for deadlock after a successful move;
- exposes `window.__toxicRulesTest()` for debugging.

The final click system is therefore the document-level nearest-path selector, not only the per-SVG-path click handlers.

## Current active gameplay rules

These describe the prototype baseline, not necessarily the approved final mobile rules.

### Open move

A path is open when the ray starting one cell beyond `piece.cells[0]` and continuing in `piece.exitDirection` reaches the board edge without touching a cell occupied by another active path.

Expected result:

- status becomes `CLEAR EXIT · ARROW RELEASED`;
- current head-first animation runs;
- path is removed from `state.active`;
- progress updates;
- deadlock is checked after the animation.

### Blocked move

When the ray touches an active path:

- status becomes `BLOCKED · CLEAR THE FIRST LINE IN THIS ARROWHEAD LANE` before life-loss handling;
- one toxic drop is removed;
- selected and blocking paths receive feedback;
- hard-mode status becomes `LOCKED · another arrow must leave first`;
- zero lives opens the game-over modal.

### Deadlock

After a successful move, the runtime checks all active paths. When no remaining path has a clear head ray:

- status becomes `DEADLOCK · NO ARROWHEAD HAS A CLEAR EXIT`;
- the game-over modal opens.

### Hint

The hint button:

- finds active paths with no blockers;
- prefers the first still-active ID in `solutionOrder`;
- highlights that path;
- draws its preview ray;
- clears the preview after approximately 1.4 seconds.

### Long press

A pointer held for approximately 340 ms:

- previews the selected path ray;
- highlights the first blocker when present;
- calls `navigator.vibrate(16)` when supported.

### Progress

- only completed levels are saved;
- save key: `toxic-teddies:compiled-patterns-v1`;
- unfinished path state is not persisted;
- levels unlock sequentially after completion;
- collection count is completed flags out of 60.

## Current content and availability

- The home UI renders 12 Teddy cards.
- `hard-mode-v3.js` labels cards 2–12 as coming soon.
- All calls to `openGame()` are forced to Toxic Toby by the hard-mode override.
- Clicking another card may therefore still open a Toxic Toby level.
- The UI must not be treated as proof that another Teddy is playable.

## Current backdrop

Toxic Toby uses:

```text
assets/backdrops/toxic-toby-expression-sheet.svg
```

One sheet is repositioned by level using these background positions:

```text
4% 50%
27% 50%
50% 50%
73% 50%
96% 50%
```

Opacity is set to `0.018` by JavaScript. This is a temporary prototype method and will be replaced by five dedicated bundled mobile assets.

## Current offline behavior

`sw.js` uses cache name:

```text
toxic-teddies-arrow-escape-v30
```

It pre-caches the browser shell, runtime files, Toxic Toby manifest, expression-sheet backdrop and web manifest. Fetches are network-first with a cached fallback.

This service worker remains a browser-prototype feature. Native iOS and Android releases will bundle content locally and receive executable updates through the stores.

## Known baseline risks

- runtime code composition uses `eval()`;
- functions are overridden across three patch files;
- the same interaction may have both SVG and document click listeners;
- blocked taps currently consume lives;
- exact unfinished progress is not saved;
- other Teddy cards may route to Toxic Toby;
- one full expression sheet is used as all five backdrops;
- the package check script references older files and does not validate the active runtime stack;
- service-worker version strings are repeated manually.

These risks are documented here so later changes are compared against known behavior rather than assumptions.

## Restore procedure

To return to the gameplay baseline:

1. check out commit `c3228d70eda6fe25d48fecd0b80ce79bd53019f5`;
2. serve the repository root;
3. clear old site storage/service workers when testing cache behavior;
4. load `index.html`;
5. verify the runtime order listed above;
6. run the manual smoke test in `BASELINE_SMOKE_TEST.md`.

Do not modify interaction behavior during the native packaging phase until the same smoke tests pass inside the iOS and Android containers.
