# Toxic Teddies: Arrow Escape — Native Mobile App Build Plan

Status: authoritative planning source
Repository: `COG-tech/toxic-teddies-face-trails`
Primary deliverable: native iOS and Android game
Store targets: Apple App Store and Google Play
Technology: Vite web game core packaged locally with Capacitor v8
Prototype target: the existing GitHub Pages build remains a browser reference/demo only

## 1. Correction and product definition

This project is a **mobile app**, not a PWA product.

The existing browser game is valuable because its SVG renderer, compiler output and geometric tap-selection system already work. We will preserve that code as the shared game core, package the compiled app locally inside native iOS and Android containers, and add native mobile features through Capacitor.

The production app will:

- install from the App Store and Google Play;
- ship as an iOS app and Android app bundle;
- run without browser chrome;
- bundle its approved game code, level JSON and launch content inside the app;
- use native storage for progress;
- use native haptics, app lifecycle, splash screen, status/system bars and sharing;
- work offline after installation;
- use store-delivered updates rather than service-worker updates.

It will **not** be a remote website opened inside a wrapper. The app package will contain the game build and provide lasting interactive game value.

Primary brand line: **The face is the puzzle.**

## 2. Core mechanic

Hundreds of connected orthogonal arrow paths form the actual face of a Toxic Teddy.

- The player taps a path with a clear arrowhead exit.
- The arrowhead exits first.
- The body follows through its bends.
- Paths do not overlap, cross or self-intersect.
- Production levels are compiled, solver-verified and shipped as immutable level data.
- The Teddy face is constructed by the playable paths, not placed behind a generic maze.

## 3. Launch scope

### Mobile MVP

The first store-testable app contains:

- Toxic Toby / Radioactive Ricky;
- five expressions in this fixed order:
  1. Neutral
  2. Evil Grin
  3. Gross
  4. Angry
  5. Maniacal Laugh;
- five dedicated, aligned and text-free backdrops;
- protected mobile touch selection;
- visible geometry-based blocking;
- exact save and resume;
- native haptics;
- native splash and app icon;
- native share sheet for completion results;
- airplane-mode/offline play;
- Home, Teddy, Expression, Puzzle, Completion, How to Play and Settings screens;
- reduced motion, high contrast, VoiceOver and TalkBack support;
- Android internal testing build and iOS TestFlight build.

All other Teddies appear honestly as `Coming soon` until their complete packages pass QA.

### Full Founding 12 release

- 12 Founding Teddies;
- 5 expressions each;
- 60 compiled and approved levels;
- 60 dedicated backdrop mappings;
- 60 solver reports;
- full iOS and Android release QA.

## 4. Canonical Founding 12

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

These names are locked.

## 5. Native architecture decision

### Chosen architecture

Use **Capacitor v8** around the existing Vite/JavaScript/SVG game core.

Why:

- it preserves the working SVG renderer and geometric input system;
- it avoids rewriting the puzzle engine in Flutter or React Native;
- it produces native iOS and Android projects;
- it provides official native APIs through plugins;
- it allows the app to bundle all launch content locally;
- it keeps one game engine for both platforms.

### Native platforms

Commit and maintain:

```text
ios/
android/
```

The app build flow is:

```text
Python compiler
    ↓
Validated level JSON and reports
    ↓
Vite web build to dist/
    ↓
Capacitor sync
    ↓
iOS Xcode project / Android Studio project
    ↓
TestFlight IPA / Google Play AAB
```

### Native APIs

Use official Capacitor plugins where needed:

- App lifecycle;
- Haptics;
- Preferences for lightweight settings and flags;
- Filesystem for the versioned save-state JSON;
- Share for completion sharing;
- Splash Screen;
- Status Bar/System Bars;
- Screen Orientation;
- Network only if online features are later added.

No permission is requested unless a shipped feature requires it.

## 6. App identity to lock before native initialization

Recommended identifiers:

```text
App name: Toxic Teddies: Arrow Escape
Short name: Toxic Teddies
Bundle ID / Application ID: com.cogtech.toxicteddies
Initial app version: 0.1.0
Initial iOS build: 1
Initial Android versionCode: 1
```

Before running `npx cap init`, confirm the final bundle/application ID because changing it later creates store and signing complications.

## 7. Repository role

The same repository will contain:

- the shared game core;
- compiler and level data;
- native iOS project;
- native Android project;
- store assets and metadata;
- automated tests;
- the optional GitHub Pages browser demo.

`main` becomes the approved product source, not merely the live website branch.

GitHub Pages may remain enabled as a prototype/demo, but it is not the production distribution target.

## 8. Target repository structure

```text
/
  package.json
  vite.config.js
  capacitor.config.ts
  index.html

  src/
    app/
      bootstrap.js
      router.js
      app-state.js
      native-bridge.js

    game/
      input-controller.js
      board-renderer.js
      blocking-engine.js
      removal-animation.js
      level-session.js

    storage/
      save-schema.js
      save-store.js
      settings-store.js
      migrations.js

    content/
      character-manifest.json
      expression-manifest.json
      level-manifest.json
      backdrop-manifest.json
      copy.json

    ui/
      home-view.js
      teddy-view.js
      expression-view.js
      puzzle-view.js
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

  assets/
    characters/
    backdrops/
    icons/
    audio/

  mobile-resources/
    app-icon/
    splash/
    store/
      ios/
      android/

  compiler/
    compile_levels.py
    validate_levels.py
    masks/
    reports/

  ios/
  android/
  dist/

  tests/
    unit/
    browser/
    mobile/
    visual/

  docs/
    MASTER_APP_BUILD_PLAN.md
    GITHUB_EXECUTION_CHECKLIST.md
    ASSET_AND_CONTENT_PIPELINE.md
    QA_AND_RELEASE_GATES.md
    ARCHITECTURE_DECISIONS.md
    STORE_RELEASE_CHECKLIST.md
```

`dist/` should normally be generated rather than hand-edited.

## 9. Current repository audit

The current `main` branch is a useful browser prototype, not yet a native mobile app.

Current issues to correct:

1. No `capacitor.config.ts`, `ios/` or `android/` project exists.
2. The current app launches through a browser/PWA shell rather than a store-installable native container.
3. `dense-loader.js` fetches and evaluates four scripts at runtime using `eval()`.
4. `compiled-app.js` mixes rendering, game state, UI, blocking, storage and content.
5. `interaction-fix.js` overrides core behavior after load.
6. Other Teddies can fall back to Toxic Toby level JSON.
7. Toxic Toby uses one positioned expression-sheet SVG rather than five dedicated backdrops.
8. Progress stores completed levels only, not exact unfinished state.
9. `localStorage` is not the final native save system.
10. Service-worker versioning is irrelevant to the installed native build and should not control app updates.
11. The README describes an older sparse-grid system.
12. The current life-loss blocker behavior conflicts with the previously confirmed working interaction and must be validated.
13. There is no store icon, splash package, privacy manifest, store metadata or signing plan.
14. There is no Android AAB or iOS TestFlight build process.

## 10. GitHub operating rules

- Every phase uses a branch and pull request.
- Do not modify approved visuals without explicit approval.
- Record the working prototype commit before native integration.
- Separate native-shell, interaction, content, design and release changes.
- Every PR includes platform impact: Web core, iOS, Android or all.
- Native configuration changes include Xcode and Android Studio test evidence.
- `ios/` and `android/` are committed after Capacitor initialization.
- Secrets, certificates, keystores and provisioning profiles are never committed.
- Store signing credentials remain in Apple/Google accounts and secure local/CI secret storage.
- GitHub Actions may run checks and unsigned builds; signed store submission remains controlled.

Recommended branch names:

```text
planning/...
audit/...
mobile/...
ios/...
android/...
feature/...
fix/...
content/...
test/...
release/...
```

## 11. Phase 0 — Freeze the working prototype

Actions:

- record the current `main` commit SHA;
- capture the current click/removal behavior on desktop and a real phone;
- document loaded CSS and JavaScript;
- document current blocking, lives, hint and completion behavior;
- add a baseline smoke-test checklist;
- update README to label the current site as the prototype/reference build.

Gate:

- the current working interaction can be restored exactly.

## 12. Phase 1 — Bootstrap the native mobile shell

Branch: `mobile/capacitor-bootstrap`

Actions:

- install Capacitor core and CLI;
- lock bundle/application ID;
- add `capacitor.config.ts` with `webDir: 'dist'`;
- install iOS and Android platforms;
- add `ios/` and `android/` projects;
- add scripts for build, sync, open and run;
- bundle the current Vite build locally;
- open and run in Xcode simulator and Android emulator;
- run on at least one physical Android device;
- configure portrait phone orientation;
- configure safe areas and system bars;
- add temporary app icon and splash only until approved final assets exist.

Expected commands:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
npm run build
npx cap sync
npx cap open ios
npx cap open android
```

Gate:

- the same Toxic Toby prototype runs from a native iOS simulator and native Android app;
- the native app loads bundled local files, not the live website URL;
- airplane mode does not prevent launch.

## 13. Phase 2 — Canonical manifests and honest availability

Actions:

- add character, expression, level and backdrop manifests;
- remove hard-coded duplicate content definitions;
- remove Toxic Toby fallback for unfinished Teddies;
- mark unfinished Teddies `Coming soon`;
- count only approved playable content;
- bundle approved manifests inside the native app.

Gate:

- no unavailable Teddy can load another character's level.

## 14. Phase 3 — Protect mobile touch input

Actions:

- extract geometric selection into one input controller;
- preserve current nearest-path behavior before optimization;
- use Pointer Events inside the native WebView;
- distinguish tap from pan;
- support pinch zoom and board reset;
- recalculate screen transforms after rotation, resume and viewport change;
- block rapid repeat input during unsafe animation states;
- add native haptic feedback for valid, blocked and completion events;
- test on real iPhone and Android screen densities.

Gate:

- valid paths are reliably selected with one hand;
- decorative layers never intercept touches;
- touch precision is not used as difficulty.

## 15. Phase 4 — Toxic Toby five-backdrop system

Actions:

- export five dedicated square, text-free backdrops;
- align ears, eyes, muzzle and silhouette to each maze;
- add per-expression position, scale, opacity, contrast and saturation;
- bundle the images in the app package;
- provide a parchment fallback;
- test all five without network access;
- test all five with the backdrop disabled.

Gate:

- the correct expression appears on every level;
- the arrow maze remains dominant;
- input behavior is unchanged.

## 16. Phase 5 — Native save and lifecycle recovery

Use:

- Capacitor Preferences for settings, onboarding state and small flags;
- Capacitor Filesystem for a versioned `save-state.json` containing progress;
- Capacitor App lifecycle events to save on pause/background and restore on resume.

Save schema includes:

- schema version;
- app version;
- compiler version;
- level version;
- completed levels;
- removed path IDs for the active level;
- settings;
- timestamps.

Actions:

- migrate existing browser completion data where practical;
- save after every successful removal;
- save before backgrounding;
- restore after force close and relaunch;
- handle corrupted or incompatible saves safely;
- add reset-current and reset-all flows.

Gate:

- force-closing the app and reopening restores the same unfinished board.

## 17. Phase 6 — Fair geometry-based blocking

Actions:

- define one authoritative blocking rule;
- return structured blocker data;
- visually highlight selected and blocking paths;
- use `That trail is still trapped.`;
- remove hidden forced sequences;
- keep lives disabled until user testing validates them;
- add solver and deadlock checks;
- map blocked/valid outcomes to native haptics.

Gate:

- every rejected move is visibly explainable;
- all five Toxic Toby levels remain solvable.

## 18. Phase 7 — Mobile product shell and design system

Screens:

- launch/splash;
- Home;
- Teddies;
- Teddy detail;
- expression selection;
- active puzzle;
- completion;
- How to Play;
- Settings;
- accessibility;
- legal/privacy.

Native-mobile requirements:

- portrait-first layout;
- safe-area support;
- Android system-back handling;
- iOS swipe/back behavior where appropriate;
- bottom navigation outside gameplay;
- global navigation hidden during gameplay;
- minimum practical 44–48 px controls;
- no browser install prompts or PWA language;
- no browser chrome assumptions.

Gate:

- the app feels like an installed mobile game, not a website squeezed into a phone.

## 19. Phase 8 — Head-first rope-pull animation

Actions:

- preserve 80–120 ms anticipation;
- move arrowhead first;
- pull the body through bends;
- fade near the edge;
- add reduced-motion behavior;
- integrate native haptics without delaying visuals;
- profile on low-end Android and current iPhone hardware.

Gate:

- near-60-fps play on supported devices;
- no state corruption or touch regression.

## 20. Phase 9 — Compiler and level validation

Compiler responsibilities:

- Teddy-shaped masks;
- expression regions;
- orthogonal path generation;
- no overlap, crossings or self-intersections;
- real endpoint arrowheads;
- endpoint tangent validation;
- mask containment;
- dependency and difficulty metrics;
- complete solver proof;
- immutable JSON and validation report.

The browser/native runtime only reads approved compiled output.

Gate:

- invalid level data cannot enter a mobile release build.

## 21. Phase 10 — Accessibility

Actions:

- VoiceOver and TalkBack labels;
- accessible path list or sequential path-focus mode;
- visible focus for external keyboard/switch users;
- reduced motion;
- high contrast;
- large text and reflow;
- non-color state communication;
- screen-reader announcements for remaining paths, removal and blocking;
- touch-target assistance setting.

Gate:

- the core flow can be completed without precise pointer input.

## 22. Phase 11 — Native app quality and performance

Targets:

- fast cold launch;
- no network dependency for bundled launch content;
- visible tap response under 50 ms;
- near-60-fps path animation;
- no continuous idle loops;
- no full-board rebuild after every move;
- memory stable across repeated level changes;
- no app pause/resume corruption;
- no crash on rotation or low-memory restoration.

Native tests:

- iOS simulator plus physical iPhone;
- Android emulator plus low-end and midrange physical Android;
- background/resume;
- force close/relaunch;
- airplane mode;
- low battery mode;
- orientation and safe areas;
- interrupted audio/haptics.

## 23. Phase 12 — Analytics and research

Analytics must identify platform and app build:

- iOS or Android;
- app version and native build number;
- Teddy, expression, level and compiler versions;
- first valid tap;
- missed tap;
- blocked tap;
- path removal;
- hint;
- restart;
- save/restore;
- level completion;
- next-expression start;
- share action.

Do not collect continuous raw touch traces in ordinary analytics.

Research targets:

- 80% first valid removal within 15 seconds;
- 98% valid-tap response;
- 80% arrow-only Teddy recognition;
- 80% blocked-state comprehension;
- 98% progress recovery after relaunch.

## 24. Phase 13 — Store preparation

### Apple

- Apple Developer account;
- App Store Connect record;
- bundle ID and signing capability;
- privacy manifest and privacy answers;
- app icon and screenshots;
- age rating;
- TestFlight internal and external testing;
- review notes explaining offline interactive gameplay and native features;
- production archive and submission.

### Google

- Google Play Console account;
- application ID and Play App Signing;
- Android App Bundle;
- data safety form;
- content rating;
- store listing, icon, feature graphic and screenshots;
- internal, closed and production tracks;
- target SDK and device-quality checks.

Store acceptance guardrail:

- the app must provide substantial interactive game content and native app behavior;
- it must not be a thin remote-website wrapper;
- launch content is bundled and playable offline;
- the app includes native lifecycle, save, haptics and share integration.

## 25. Phase 14 — Founding 12 production

Complete one Teddy at a time:

1. references approved;
2. five backdrops exported;
3. five masks created;
4. five levels compiled;
5. five solver reports passed;
6. arrow-only recognition passed;
7. iOS and Android interaction QA passed;
8. difficulty approved;
9. manifest marked playable;
10. new store build tested before release.

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

## 26. Build scripts to add

Recommended package scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "check": "node scripts/run-checks.mjs",
    "mobile:sync": "npm run build && npx cap sync",
    "mobile:ios": "npm run mobile:sync && npx cap open ios",
    "mobile:android": "npm run mobile:sync && npx cap open android",
    "mobile:run:ios": "npm run build && npx cap run ios",
    "mobile:run:android": "npm run build && npx cap run android"
  }
}
```

Exact commands should be verified against the installed Capacitor version.

## 27. CI strategy

GitHub Actions should run on pull requests:

- npm install;
- lint/type checks;
- compiler validation;
- unit tests;
- browser rendering tests;
- unsigned Android debug build where practical.

Do not commit:

- Apple certificates;
- provisioning profiles;
- Android keystore;
- store API keys;
- private signing passwords.

Signed release builds remain controlled through Xcode/Play signing or secure release automation.

## 28. Definition of done — mobile MVP

The MVP is complete when:

- native iOS and Android projects exist;
- the game runs from bundled local assets;
- Toxic Toby's five levels and backdrops work offline;
- touch selection is reliable on real devices;
- blocked feedback is fair;
- exact progress survives force close and relaunch;
- native haptics and share work;
- VoiceOver/TalkBack and reduced motion work;
- TestFlight and Google Play internal builds install successfully;
- no other Teddy falsely appears playable.

## 29. Definition of done — full mobile app

- 60 approved level files;
- 60 approved backdrops;
- 60 passing solver reports;
- all levels tested on iOS and Android;
- canonical names everywhere;
- no fallback character content;
- stable saves across app updates;
- store privacy and metadata complete;
- App Store and Google Play production releases match the approved Git tag.

## 30. Immediate execution order

```text
1. Freeze the current prototype
2. Bootstrap Capacitor iOS and Android projects
3. Run the existing Toxic Toby build natively on both platforms
4. Add canonical manifests and remove false fallbacks
5. Protect the working touch controller
6. Implement five dedicated Toxic Toby backdrops
7. Add native save/lifecycle recovery
8. Validate blocking
9. Build the mobile UI shell
10. Produce TestFlight and Google Play internal builds
```

Do not begin the full visual redesign or remaining 55 levels before steps 1–6 pass on real mobile devices.