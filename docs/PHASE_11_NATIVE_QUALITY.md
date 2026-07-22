# Phase 11 — Native Offline Quality, Lifecycle and Versioning

App version: `0.4.0`
iOS build: `2`
Android versionCode: `2`
Content version: `tt01-launch-2026.07.22.1`
Save schema: `2`

## Implemented

### Centralized version source

`app-version.json` is the source of truth for:

- app semantic version;
- iOS build number;
- Android versionCode;
- content version;
- current save schema;
- minimum compatible save schema.

`scripts/sync-app-version.mjs` synchronizes:

- `package.json`;
- `src/generated/build-info.json`;
- the level-manifest content version;
- the HTML diagnostic build ID;
- Android `versionCode` and `versionName`;
- iOS `CURRENT_PROJECT_VERSION` and `MARKETING_VERSION`.

A build fails when committed/generated values do not agree with the centralized source.

### Bundled-content integrity

Before every development or production build:

1. deterministic Toxic Toby levels are compiled;
2. SHA-256 checksums and byte counts are generated for required runtime files, levels and backdrops;
3. Vite builds the app;
4. the exact static runtime and content files are copied into `dist`;
5. `scripts/verify-offline-bundle.mjs` verifies every file against the integrity manifest.

After `npx cap sync`, CI verifies the same files inside:

```text
android/app/src/main/assets/public
ios/App/App/public
```

The installed app performs the same integrity check before starting the puzzle runtime. Missing, mixed-version or corrupt files produce a safe recovery screen instead of a partially loaded game.

### No native service-worker dependency

- Production native content uses Capacitor's local bundled `dist` output.
- There is no production `server.url`.
- Native startup unregisters any inherited service worker and removes WebView Cache API entries.
- Executable updates are delivered through App Store and Google Play packages.
- The service worker remains browser-demo-only.

### Update-safe progress

Save schema 2 adds:

- app version and native build;
- content version;
- compiler version;
- migration history;
- last successful launch;
- content-version binding on active sessions.

Progress behavior:

- schema 1 saves migrate to schema 2;
- completed expressions are preserved;
- exact removed-path state is preserved when level/compiler/content versions remain compatible;
- incompatible active sessions restart safely without deleting completed progress;
- future unsupported save schemas are refused instead of overwritten;
- every successful write preserves a backup copy;
- a corrupt primary save falls back to the backup.

### Lifecycle recovery

State is flushed when:

- Capacitor reports app inactive/backgrounded;
- the document becomes hidden;
- the WebView receives `pagehide`.

Input geometry refreshes when:

- the app resumes;
- the document becomes visible;
- `pageshow`, resize or orientation change occurs;
- Capacitor restores the app after process recreation.

### Diagnostics

Settings displays:

- native app version;
- native build number;
- content version;
- number of integrity-verified bundled files.

The root document also exposes the build ID through:

```text
window.__TOXIC_TEDDIES_BUILD__
window.ToxicBuildInfo
document.documentElement.dataset.build
```

## Automated gates

- centralized version synchronization;
- save-schema migration tests;
- future-schema refusal test;
- exact progress tests;
- level compiler and solver validation;
- SHA-256 offline bundle validation;
- no `server.url` validation;
- Android version validation;
- iOS version validation;
- Capacitor sync;
- Android debug build;
- unsigned iOS simulator build;
- exact native-copy verification.

## Physical-device gates still required

Repository automation cannot prove:

- airplane-mode launch on a physical iPhone and Android phone;
- force-close and exact restore on physical devices;
- device reboot and exact restore;
- update installation over an existing 0.3.0 save;
- low-memory process termination and restoration;
- incoming call/system-interruption behavior;
- safe-area appearance on all target devices;
- haptic behavior after interruptions.

Use `docs/PHASE_11_DEVICE_TEST.md` to record those results before closing issue #11.
