# Native Mobile Phases 1–10 Implementation

Branch: `mobile/phases-1-10`
Pull request: #20
App version: `0.3.0`
Bundle/Application ID: `com.cogtech.toxicteddies`

## Phase status

| Phase | Repository implementation | Automated validation | Human/device gate |
|---|---|---|---|
| 1. Native bootstrap | Capacitor config, dependencies, build scripts and native generation workflow | Vite, Capacitor, Android debug and iOS simulator jobs | Physical iPhone/Android launch and baseline recordings |
| 2. Canonical manifests | Founding 12, expressions, playable levels and backdrops are manifest-driven | JSON is bundled by Vite | Confirm copy and availability on devices |
| 3. Mobile input | One geometric pointer controller, tap/pan discrimination, duplicate-click suppression and touch assistance | Syntax/build validation | Physical-device tap accuracy and pinch/pan study |
| 4. Toby backdrops | Five dedicated square SVG crop assets and one backdrop entry per expression | Asset paths bundled and offline | Visual alignment approval on all five boards |
| 5. Native save | Preferences/Filesystem/App lifecycle bridge and exact removed-path restoration | Syntax/build validation | Force-close, reboot and app-update recovery on devices |
| 6. Blocking | Visible head-ray geometry, visible blocker feedback and no hidden life penalty | Solver checks use the same movement rule | Blocked-state comprehension testing |
| 7. Mobile shell | Safe areas, Android Back, How to Play, Settings, share and honest Coming soon states | Vite/native build | iOS and Android UI review |
| 8. Animation | Existing head-first pull-through preserved; reduced-motion exit added | Runtime syntax and native build | Frame-rate profiling on low-end Android and iPhone |
| 9. Compiler | Deterministic production compiler writes five JSON files; validator rejects overlaps, self-intersections, nonorthogonal paths, bad arrow tangents and unsolved levels | Required in every quality/native build | Recognition and difficulty review |
| 10. Accessibility | VoiceOver/TalkBack labels, live announcements, high contrast, reduced motion, touch assistance and accessible open-trail chooser | Markup/runtime build checks | VoiceOver, TalkBack, larger-text and switch/external keyboard sessions |

## Native modules

```text
capacitor.config.ts
src/app/bootstrap.js
src/app/native-bridge.js
src/app/mobile-shell.js
src/content/content-registry.js
src/game/input-controller.js
src/storage/save-store.js
src/accessibility/accessibility.js
```

## Content modules

```text
src/content/character-manifest.json
src/content/expression-manifest.json
src/content/level-manifest.json
src/content/backdrop-manifest.json
levels/tt01/level-1.json ... level-5.json
assets/backdrops/tt01/*.svg
compiler/reports/tt01-level-*.json
```

The level and report files are generated deterministically and committed by the native scaffold workflow after all native build gates pass.

## Runtime order

The preserved game renderer is still loaded through `dense-loader.js` for this migration phase. The production order is:

1. `compiled-app.js`
2. `hard-mode-v3.js`
3. `compiled-level-source.js`
4. `interaction-fix.js`
5. `mobile-enhancements.js`
6. `boot()`

`dense-fallback.js` is no longer loaded. Production levels are generated before the app build and read from individual JSON files.

## Save contract

```json
{
  "schemaVersion": 1,
  "appVersion": "0.3.0",
  "compilerVersion": "toxic-toby-deterministic-v1",
  "completed": {},
  "activeSession": {
    "levelKey": "tt01-l1",
    "teddyId": "tt01",
    "level": 1,
    "expressionId": "neutral",
    "levelVersion": 1,
    "compilerVersion": "toxic-toby-deterministic-v1",
    "removedPathIds": []
  },
  "updatedAt": "ISO-8601"
}
```

## Gameplay decisions implemented

- The face itself remains the playable path geometry.
- Only approved manifest entries can open.
- Only Toxic Toby is playable in the current build.
- Blocked moves are determined by visible active geometry.
- Blocked taps do not consume lives.
- No hidden strict solution order is enforced.
- Missed touches have no penalty.
- Unfinished progress saves by removed path ID.
- Final launch levels are bundled and do not require network access.

## Automated release gates

The pull request must pass:

- deterministic level compilation;
- JavaScript syntax checks;
- geometry and solver validation;
- Vite production build;
- Capacitor environment check;
- iOS platform generation;
- Android platform generation;
- Capacitor sync;
- Android debug build;
- unsigned iOS simulator build.

## Gates that remain human-controlled

Repository automation cannot truthfully complete these checks:

- desktop and physical-phone baseline recordings for issue #1;
- physical iPhone touch testing;
- physical Android touch testing;
- VoiceOver and TalkBack sessions;
- final approval of each backdrop crop/alignment;
- Apple Developer signing and TestFlight;
- Google Play signing and internal testing;
- App Store/Google Play submission.

The branch must not be called store-ready until those gates are completed.
