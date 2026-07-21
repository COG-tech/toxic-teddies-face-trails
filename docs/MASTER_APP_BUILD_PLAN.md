# Toxic Teddies: Arrow Escape — Authoritative App Build Plan

Status: planning source of truth
Repository: `COG-tech/toxic-teddies-face-trails`
Deployment: GitHub Pages from `main` and repository root
Primary product: mobile-first browser/PWA puzzle game

## 1. Product definition

Toxic Teddies: Arrow Escape is a character-driven arrow-removal puzzle. Hundreds of connected orthogonal arrow paths form the actual face of a Toxic Teddy. The player taps a path with a clear arrowhead exit, the arrowhead leaves first, and the body follows. The character is not decorative artwork behind a generic maze: the face itself is the playable geometry.

Primary brand line: **The face is the puzzle.**

Launch unit:

- Toxic Toby / Radioactive Ricky
- Five expressions in this fixed order:
  1. Neutral
  2. Evil Grin
  3. Gross
  4. Angry
  5. Maniacal Laugh

Expansion target:

- 12 Founding Teddies
- 5 expressions per Teddy
- 60 compiled, tested and solvable levels

## 2. Canonical Founding 12

1. `tt01` Toxic Toby / Radioactive Ricky
2. `tt02` Moldy Molly / Fungus Faye
3. `tt03` Dumpster Danny / Trashcan Travis
4. `tt04` Sludge Sam / Gooey Grant
5. `tt05` Battery Barry / Leaking Leon
6. `tt06` Maggot Mitch / Wormy Walt
7. `tt07` Burger Bear / Greasy Gina
8. `tt08` Rusty Randy / Corroded Cory
9. `tt09` Acid Andy / Meltdown Mel
10. `tt10` Gas Mask Max / Fumey Frank
11. `tt11` Patchwork Pat / Quilted Quinn
12. `tt12` Plague Bear / Sickly Sonny

These names are locked. Do not use Dumpster Dan, Rusty Ralph or other earlier variants.

## 3. Non-negotiable product rules

- The playable paths must construct the Teddy face.
- No path overlap, crossing or self-intersection.
- Every arrowhead belongs to a true endpoint and matches the endpoint tangent.
- Levels are compiled and validated before deployment.
- The browser renders level data, handles input, saves progress and animates removal.
- Character backdrops support recognition but may not rescue a weak arrow mask.
- Every level must remain recognizable with the backdrop disabled.
- No photorealistic or 3D character art.
- No baked-in titles, logos, taglines, borders or interface labels inside final backdrop artwork.
- No generic substitute Teddy imagery.
- Do not claim unfinished Teddies or levels are playable.
- No visual change reaches `main` without approval.

## 4. Current repository audit

The current `main` branch is a working prototype, not the final architecture.

Known current-state issues:

1. `index.html` loads three CSS files and a loader that fetches/evaluates four JavaScript files at runtime.
2. `dense-loader.js` uses `eval()` to combine the runtime. This is fragile, difficult to test and complicates Content Security Policy.
3. `compiled-app.js` contains UI, state, rendering, blocking, progress and content definitions in one file.
4. `interaction-fix.js` overrides core functions after load. The working input behavior is therefore patch-based rather than owned by one module.
5. `fetchLevel()` falls back to Toxic Toby JSON for other Teddies. This can make unfinished characters appear playable with the wrong face.
6. The home counter displays `0 / 60`, although most of the 60 levels do not exist.
7. The current Toxic Toby background uses one expression-sheet SVG with CSS positioning rather than five dedicated aligned backdrop assets.
8. Progress storage records completed levels only. It does not reliably persist the exact active path state of an unfinished level.
9. The README documents an older 7×7 to 15×15 tile system, while the current dense compiler uses much larger face grids and path counts.
10. README and runtime describe toxic-drop lives and blocked-tap penalties, while the working-click history indicates this behavior previously made the game appear broken. The rule must be validated before it remains in production.
11. Build/cache versions are manually repeated as `v=30` across several files.
12. There is no single canonical manifest for characters, expressions, backdrops, level availability, asset versions and QA status.

## 5. GitHub operating rules

- `main` remains the production source and GitHub Pages deployment branch.
- Planning and implementation occur on named branches.
- Every phase uses a pull request.
- Do not combine interaction, visual, content and cache changes in one uncontrolled PR.
- Tag or record the last known working interaction commit before refactoring.
- Each PR must include acceptance criteria and a manual regression checklist.
- No GitHub Actions deployment workflow is required. GitHub Pages continues to publish from `main / root`.
- Local development and validation run through VS Code/npm.

Recommended branch naming:

- `planning/...`
- `audit/...`
- `feature/...`
- `fix/...`
- `content/...`
- `test/...`

## 6. Target repository architecture

```text
/
  index.html
  manifest.webmanifest
  sw.js
  package.json

  src/
    app/
      bootstrap.js
      router.js
      app-state.js

    game/
      input-controller.js
      board-renderer.js
      blocking-engine.js
      removal-animation.js
      level-session.js
      progress-store.js

    content/
      character-manifest.json
      expression-manifest.json
      level-manifest.json
      backdrop-manifest.json
      copy.json

    ui/
      home-view.js
      character-view.js
      expression-view.js
      puzzle-hud.js
      completion-sheet.js
      settings-view.js

    design-system/
      tokens.css
      foundations.css
      components.css
      puzzle.css
      accessibility.css

  levels/
    tt01/
      neutral.json
      evil-grin.json
      gross.json
      angry.json
      maniacal-laugh.json
    ...

  assets/
    characters/
      tt01/
        master.webp
        thumbnail.webp
      ...
    expression-sheets/
      internal-source-only/
    backdrops/
      tt01/
        neutral.webp
        evil-grin.webp
        gross.webp
        angry.webp
        maniacal-laugh.webp
      ...
    icons/

  compiler/
    compile_levels.py
    validate_levels.py
    masks/
    reports/

  tests/
    unit/
    browser/
    visual/
    fixtures/

  docs/
    MASTER_APP_BUILD_PLAN.md
    ARCHITECTURE_DECISIONS.md
    ASSET_AND_CONTENT_PIPELINE.md
    QA_AND_RELEASE_GATES.md
    DESIGN_SYSTEM.md
```

Migration must be incremental. Do not rewrite the entire working game at once.

## 7. Phase plan

### Phase 0 — Freeze and baseline the current build

Goal: preserve the last known working state before any refactor.

Actions:

- Record the current `main` commit SHA.
- Capture desktop and mobile screen recordings of click/removal behavior.
- Record current script/CSS load order.
- Add a manual smoke-test checklist.
- Add a visible or debug-only build version.
- Document current rules: open path, blocked path, life loss, hint and completion.
- Decide which current behaviors are temporary and which are production requirements.

Acceptance gate:

- The current build can be restored exactly.
- A reviewer can reproduce the current working click/removal behavior.

### Phase 1 — Create canonical manifests and availability rules

Goal: establish one source of truth for content.

Actions:

- Add `character-manifest.json` containing the locked Founding 12.
- Add `expression-manifest.json` with the five fixed expression IDs and labels.
- Add `level-manifest.json` containing availability, path count, grid size, difficulty, compiler version and QA status.
- Add `backdrop-manifest.json` containing file path, scale, position, opacity and status.
- Remove the Toxic Toby fallback for unfinished Teddies.
- Render unavailable Teddies as `Coming soon`, not clickable gameplay.
- Change collection totals to count only real available levels while optionally showing the 60-level roadmap separately.

Acceptance gate:

- No unfinished Teddy opens a Toxic Toby level.
- Every playable route resolves through a manifest entry.

### Phase 2 — Lock and protect the working input system

Goal: make one owned input module responsible for all taps.

Actions:

- Extract document-level geometric selection into `input-controller.js`.
- Preserve the working nearest-path behavior before changing algorithms.
- Separate visible arrowhead size from effective hit tolerance.
- Add tap-versus-pan discrimination.
- Add rapid-tap protection during removal animation.
- Recalculate geometry after resize, zoom and orientation changes.
- Add automated tests for intended path selection.
- Remove duplicate SVG click handlers only after tests pass.

Acceptance gate:

- Valid paths remain selectable on desktop and mobile.
- Backdrops and feedback layers cannot intercept input.
- A tap does not select a distant unrelated path.

### Phase 3 — Toxic Toby five-backdrop system

Goal: implement the immediate character-and-level mapping without touching the click system.

Actions:

- Export five separate Toxic Toby backdrop assets from the canonical expression sheet.
- Remove labels and unused expression-sheet areas from final exports.
- Align eyes, muzzle, ears and face silhouette with each compiled maze.
- Add manifest values for crop, scale, X/Y position, opacity, contrast and optional blur.
- Load by `teddy ID + expression ID`.
- Use parchment fallback if an image fails.
- Add `pointer-events: none` to all backdrop layers.
- Test each level with backdrop on and off.

Acceptance gate:

- Each Toxic Toby level shows the correct expression.
- The maze remains dominant.
- Click/removal behavior is unchanged.

### Phase 4 — UX shell and design system

Goal: replace fragmented styling with a controlled mobile-first interface.

Actions:

- Add semantic design tokens for color, type, spacing, radius, borders, shadows and motion.
- Build reusable button, icon button, card, alert, progress, modal and bottom-sheet components.
- Create four primary destinations outside gameplay: Play, Teddies, How to Play and Settings.
- Hide global navigation during active gameplay.
- Implement Home, Character, Expression, Puzzle and Completion views.
- Keep active gameplay visually quieter than marketing and collection views.
- Add `Coming soon` states for unavailable characters.
- Add the brand line: `The face is the puzzle.`

Acceptance gate:

- No visual layer blocks the puzzle.
- All core components have default, focus, active, disabled and loading states where applicable.
- Mobile controls have practical 44–48 pixel effective targets.

### Phase 5 — Progress storage and recovery

Goal: save exact unfinished-level state, not only completed levels.

Actions:

- Introduce a versioned progress schema.
- Store active/removed path IDs per level.
- Store level-data version and compiler version with progress.
- Migrate existing localStorage completion data.
- Use IndexedDB for durable state; keep a lightweight fallback only if necessary.
- Save after every successful removal, restart, completion and visibility change.
- Restore exact state after refresh, browser close and PWA reopen.
- Add safe reset-current-level and reset-all-progress flows.

Acceptance gate:

- Refreshing an unfinished level restores the same remaining paths.
- A level-data version change does not silently corrupt progress.

### Phase 6 — Blocking logic and fairness

Goal: restore real puzzle blocking only through visible geometry.

Actions:

- Define the authoritative blocking rule in an architecture decision record.
- Use arrowhead-direction geometry and active-path occupancy.
- Return structured results: removable, blocker IDs and reason.
- Highlight both the selected path and first visible blocker.
- Use the message: `That trail is still trapped.`
- Keep life loss disabled during validation.
- Do not use hidden forced sequences.
- Add deadlock detection and compiler-level solvability checks.
- Reintroduce penalties only after user testing proves they improve the game.

Acceptance gate:

- Every rejected move is visibly explainable.
- All five Toxic Toby levels are solvable under the production rule.

### Phase 7 — Head-first rope-pull animation

Goal: replace whole-group translation with a path-following removal.

Actions:

- Keep 80–120 ms anticipation.
- Move the arrowhead first.
- Animate the body following bends in sequence.
- Fade near the board edge.
- Provide reduced-motion removal.
- Keep input state safe during animation.
- Profile on low-end Android devices.

Acceptance gate:

- Animation remains readable and near 60 fps.
- No click regression or state corruption.

### Phase 8 — Compiler and level validation

Goal: make compiled level data deterministic, testable and production-safe.

Compiler responsibilities:

- generate Teddy-shaped masks;
- define face regions;
- fill regions with orthogonal paths;
- prevent overlap, crossing and self-intersection;
- keep path lengths within approved ranges;
- attach arrowheads to true endpoints;
- verify endpoint tangent direction;
- validate board containment;
- calculate dependency graph and difficulty metrics;
- prove at least one complete solution;
- export immutable JSON and a validation report.

Required report fields:

- teddy ID;
- expression ID;
- grid size;
- path count;
- path-length distribution;
- initial open-path count;
- maximum dependency depth;
- deadlock result;
- solver result;
- compiler version;
- QA status.

Acceptance gate:

- Invalid levels cannot be published.
- The browser does not randomly generate production levels.

### Phase 9 — Accessibility

Goal: meet WCAG 2.1 AA and support mobile assistive technology.

Actions:

- Add visible focus states.
- Make all standard controls keyboard operable.
- Add an accessible path list or candidate-navigation mode.
- Announce level identity, remaining path count, removal and blocked state.
- Add reduced-motion and high-contrast modes.
- Ensure color is not the only state indicator.
- Support text scaling and reflow.
- Test VoiceOver, TalkBack and keyboard navigation.

Acceptance gate:

- Core game flow is operable without precise pointer input.
- No WCAG-critical defects remain.

### Phase 10 — PWA, cache and versioning

Goal: eliminate stale-build confusion and protect progress.

Actions:

- Centralize the build version.
- Separate app-shell, level-data and image caches.
- Remove manually repeated version strings.
- Never use service-worker cache as progress storage.
- Prompt for an update after the current level, not during play.
- Support offline reopening of cached levels.
- Preserve progress across updates.
- Test GitHub Pages base paths.

Acceptance gate:

- A stale build can be identified and updated.
- Current progress survives the update.

### Phase 11 — Analytics and research instrumentation

Goal: measure comprehension, interaction reliability, fairness and retention.

Events:

- `app_open`
- `home_view`
- `play_selected`
- `tutorial_started`
- `tutorial_completed`
- `level_loaded`
- `first_pointer_input`
- `path_selected`
- `path_removed`
- `path_blocked`
- `tap_missed`
- `zoom_started`
- `zoom_reset`
- `hint_used`
- `level_restarted`
- `progress_saved`
- `progress_restored`
- `level_completed`
- `next_expression_started`
- `collection_opened`
- `install_prompt_shown`
- `pwa_installed`
- `backdrop_failed`
- `service_worker_updated`

Do not record continuous raw pointer traces in ordinary production analytics.

Research gates:

- first valid removal within 15 seconds for at least 80% of new users;
- valid-tap response above 98%;
- arrow-only Teddy recognition above 80%;
- blocked-state comprehension above 80%;
- progress recovery above 98%.

### Phase 12 — Founding 12 content production

Goal: expand one complete character package at a time.

Per-Teddy workflow:

1. Confirm canonical model reference.
2. Confirm canonical expression sheet.
3. Export five text-free backdrop assets.
4. Define five face masks.
5. Compile five levels.
6. Validate geometry and solvability.
7. Align each backdrop.
8. Test recognition with backdrop disabled.
9. Test desktop/mobile interaction.
10. Approve difficulty.
11. Mark manifest status playable.
12. Release.

Recommended order after Toxic Toby:

1. Moldy Molly
2. Dumpster Danny
3. Plague Bear
4. Sludge Sam
5. Battery Barry
6. Maggot Mitch
7. Burger Bear
8. Rusty Randy
9. Acid Andy
10. Gas Mask Max
11. Patchwork Pat

Do not begin all 55 remaining levels in one uncontrolled batch.

### Phase 13 — Testing and release gates

Required automated tests:

- compiler validation;
- input selection;
- path removal;
- blocked feedback;
- progress save/restore;
- route restoration;
- backdrop mapping;
- offline app shell;
- service-worker update;
- keyboard navigation.

Required manual/device tests:

- Chrome desktop;
- Edge desktop;
- Safari desktop;
- Chrome Android;
- Samsung Internet;
- Safari iPhone;
- installed iOS PWA;
- installed Android PWA;
- low-end Android;
- reduced motion;
- high contrast;
- large text;
- orientation change;
- offline reopen.

Release gate:

- correct Teddy and expression;
- recognizable arrow-only face;
- no generic fallback art;
- no path overlap/crossing;
- valid click/removal;
- fair blocking;
- exact progress recovery;
- no stale-cache failure;
- no critical accessibility issue;
- no unsupported claims of content availability.

## 8. MVP definition

The first production-ready MVP is not all 60 levels.

MVP includes:

- Toxic Toby’s five canonical expression levels;
- correct expression-specific backdrops;
- protected mobile input;
- fair and visible blocking;
- save/resume;
- Home, Character, Expression, Puzzle, Completion, How to Play and Settings views;
- responsive PWA behavior;
- reduced motion and high contrast;
- offline reopening of the current cached level;
- analytics for the core funnel;
- all other Teddies shown honestly as coming soon.

## 9. Definition of done for the full app

The full Founding 12 release is complete only when:

- all 60 level JSON files exist;
- all 60 backdrops are mapped and aligned;
- every level passes compiler validation and solver checks;
- every level passes desktop and mobile interaction QA;
- every face remains recognizable without its backdrop;
- all character names match the canonical manifest;
- progress survives refresh, closure and updates;
- accessibility modes work;
- unavailable fallbacks are removed;
- the live GitHub Pages build matches the approved release commit.

## 10. Immediate next execution order

1. Merge planning documentation only after review.
2. Create a baseline/audit branch from current `main`.
3. Record the current working click build and add regression tests.
4. Create the canonical manifests.
5. Disable fake Toxic Toby fallback for other Teddies.
6. Export and implement Toxic Toby’s five dedicated backdrops.
7. Verify no input regression.
8. Migrate exact progress saving.
9. Validate production blocking behavior.
10. Consolidate the runtime incrementally.

No visual redesign or broad refactor should begin before steps 1–7 are complete.