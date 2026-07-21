# Architecture Decision Register — Native Mobile App

This file records product and technical decisions that should not be reopened without new evidence.

## ADR-001 — The product is a native mobile app

Decision:

- Primary distribution is Apple App Store and Google Play.
- The existing GitHub Pages build is a prototype/browser demo only.
- Production acceptance requires installable iOS and Android builds.

Reason:

- The product requirement is a mobile app, not a PWA.

## ADR-002 — Use Capacitor around the existing game core

Decision:

- Package the Vite/JavaScript/SVG game locally with Capacitor v8.
- Commit and maintain native `ios/` and `android/` projects.
- Do not rewrite the working engine in Flutter or React Native.

Reason:

- The current renderer and geometric touch logic already work.
- Capacitor produces native iOS/Android projects while preserving the engine.

## ADR-003 — Bundle launch content inside the app

Decision:

- Approved game code, Toxic Toby levels and launch assets ship in the app package.
- The app does not load the live website as its primary experience.
- The launch game works in airplane mode.

Reason:

- The app must be reliable, app-like and independently functional.

## ADR-004 — Store updates replace service-worker updates

Decision:

- Native app code is updated through App Store and Google Play releases.
- A service worker is not required inside the native app.
- Future downloadable content may include versioned data/assets, not untrusted executable code.

Reason:

- Native store packages must remain the controlled executable source.

## ADR-005 — Production levels are precompiled

Decision:

- The Python compiler generates and validates production level JSON.
- The mobile runtime does not randomly create production puzzles.

Reason:

- Recognition, fairness and solvability require deterministic authored output.

## ADR-006 — The arrow paths construct the character

Decision:

- Character-defining face regions are represented primarily by playable path geometry.
- Backdrop artwork is secondary support.

Reason:

- This is the product's core differentiation.

## ADR-007 — One canonical content manifest

Decision:

- Characters, expressions, availability and backdrops are manifest-driven.
- Unavailable characters never fall back to another Teddy's content.

Reason:

- Hard-coded duplicates and fallbacks create false availability and naming drift.

## ADR-008 — Dedicated backdrop files

Decision:

- Use one text-free backdrop file per Teddy and expression.
- Do not ship the complete expression sheet and reposition it with CSS.

Reason:

- Dedicated exports provide predictable alignment and no accidental labels.

## ADR-009 — One touch-input controller

Decision:

- All path selection uses one input-controller module.
- Presentation layers receive no touch events.
- Visible arrowheads may remain small while effective geometric selection remains generous.
- The controller responds to app resume, viewport and orientation changes.

Reason:

- Competing SVG, board and document handlers previously caused broken interaction.

## ADR-010 — Blocking must be visibly explainable

Decision:

- The production rule uses visible active-path geometry.
- A blocked result returns blocker identity and highlights it.
- Hidden forced order is prohibited.

Open validation:

- Toxic-drop life penalties remain disabled until research proves they improve the game.

## ADR-011 — Native save architecture

Decision:

- Use Capacitor Preferences for lightweight settings and flags.
- Use Capacitor Filesystem for a versioned progress JSON file.
- Use Capacitor App lifecycle events to save on pause/background and restore on resume.
- Save removed path IDs, level version, compiler version and app version.

Reason:

- Completion-only browser storage does not support exact native resume.

## ADR-012 — Native APIs are purposeful and minimal

Decision:

- Use official Capacitor plugins for App lifecycle, Haptics, Preferences, Filesystem, Share, Splash Screen, System/Status Bars and Screen Orientation.
- Request no sensitive permission unless a shipped feature requires it.

Reason:

- Native features make the product app-like without unnecessary privacy risk.

## ADR-013 — Design system is separate from artwork

Decision:

- Names, labels, progress, warnings, borders and controls are rendered by the app UI.
- Final character/backdrop art contains no interface text.

Reason:

- This protects spelling, accessibility, localization and responsiveness.

## ADR-014 — One complete Teddy production unit at a time

Decision:

- A Teddy is completed as five expressions, five backdrops, five levels, five reports and one iOS/Android QA package before the next Teddy moves to production.

Reason:

- Uncontrolled parallel generation multiplies inconsistency.

## ADR-015 — Portrait-first native layout

Decision:

- Phone gameplay is portrait-first.
- Tablet/landscape support is an intentional secondary layout.
- Android system Back and iOS safe areas are handled explicitly.
- Touch precision cannot be a source of difficulty.

Reason:

- The game targets short one-handed mobile sessions.

## ADR-016 — Accessibility is a base requirement

Decision:

- VoiceOver, TalkBack, reduced motion, high contrast, large text, switch/external-keyboard support and non-color state feedback are included in the architecture.

Reason:

- Retrofitting accessibility after 60 levels would be costly and unreliable.

## ADR-017 — Runtime `eval()` is temporary

Decision:

- Replace `dense-loader.js` runtime fetch-and-eval composition through incremental module migration.
- Do not remove it until baseline interaction tests exist and the native shell reproduces the current behavior.

Reason:

- `eval()` complicates testing and security, but immediate removal could break the working prototype.

## ADR-018 — Product availability is honest

Decision:

- The UI may show the 60-level roadmap, but playable counts include only approved content.
- Coming-soon characters remain unavailable.

Reason:

- False availability undermines trust and risks loading the wrong face.

## ADR-019 — Same repository for shared core and native projects

Decision:

- Keep the shared game engine, compiler, `ios/`, `android/`, store resources and documentation in `COG-tech/toxic-teddies-face-trails`.

Reason:

- One source of truth reduces version drift between platforms.

## ADR-020 — Signing secrets are never committed

Decision:

- Apple certificates, provisioning profiles, Android keystores, passwords and store API keys remain outside Git.
- GitHub Actions may run checks and unsigned builds; signed release workflows use secure credentials.

Reason:

- Store signing credentials are sensitive production secrets.

## ADR-021 — App Store quality is an architecture requirement

Decision:

- The native app bundles substantial interactive gameplay.
- It includes offline play, native save/lifecycle, haptics, share, system UI integration and accessibility.
- It is not a thin remote-webview wrapper.

Reason:

- Store acceptance and player trust require a stable, functional, app-like experience.
