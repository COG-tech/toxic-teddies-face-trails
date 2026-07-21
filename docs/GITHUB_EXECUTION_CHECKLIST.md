# GitHub Execution Checklist — Native iOS and Android App

This checklist converts the mobile app plan into branches, pull requests and release work.

## Working rules

- [ ] `main` is the approved product source.
- [ ] GitHub Pages is optional prototype/demo hosting only.
- [ ] Production distribution is Apple App Store and Google Play.
- [ ] Every implementation change starts from current `main`.
- [ ] One concern per pull request where practical.
- [ ] No visual change is merged without approval.
- [ ] Every UI/gameplay PR includes mobile screenshots or recordings.
- [ ] Every native PR states iOS, Android or cross-platform impact.
- [ ] Every production content file is referenced by a manifest.
- [ ] No unfinished Teddy falls back to Toxic Toby content.
- [ ] Never commit certificates, provisioning profiles, Android keystores or store secrets.

## Phase 0 — Freeze the browser prototype

Branch: `audit/current-build-baseline`

- [ ] Record current commit SHA and browser build version.
- [ ] Capture desktop and real-phone videos of working selection/removal.
- [ ] Document current CSS/JavaScript load order.
- [ ] Document lives, blocking, hint and deadlock behavior.
- [ ] Add a baseline smoke-test document.
- [ ] Update README to call the current site the prototype/reference build.

PR acceptance:

- [ ] Current behavior can be reproduced and restored.
- [ ] No visual or gameplay change.

## Phase 1 — Bootstrap Capacitor mobile projects

Branch: `mobile/capacitor-bootstrap`

- [ ] Confirm app name and final bundle/application ID.
- [ ] Install `@capacitor/core` and `@capacitor/cli`.
- [ ] Add `capacitor.config.ts` with `webDir: 'dist'`.
- [ ] Install `@capacitor/ios` and `@capacitor/android`.
- [ ] Run `npx cap add ios`.
- [ ] Run `npx cap add android`.
- [ ] Commit `ios/` and `android/` projects.
- [ ] Add `mobile:sync`, `mobile:ios`, `mobile:android`, `mobile:run:ios` and `mobile:run:android` scripts.
- [ ] Bundle the Vite build locally inside the apps.
- [ ] Run in iOS simulator.
- [ ] Run in Android emulator.
- [ ] Run on at least one physical Android device.
- [ ] Configure portrait phones, safe areas and system bars.
- [ ] Add temporary icon/splash resources pending final approval.

PR acceptance:

- [ ] Toxic Toby opens from installed native apps on iOS and Android.
- [ ] App launches in airplane mode.
- [ ] App does not load the live website URL.

## Phase 2 — Canonical content manifests

Branch: `feature/canonical-manifests`

- [ ] Add character manifest.
- [ ] Add expression manifest.
- [ ] Add level manifest.
- [ ] Add backdrop manifest.
- [ ] Use locked Founding 12 names.
- [ ] Replace hard-coded `TEDDIES` data.
- [ ] Remove fallback from other Teddies to `tt01` levels.
- [ ] Mark non-existent levels `coming_soon`.
- [ ] Correct playable-content counters.
- [ ] Bundle manifests in the native build.

PR acceptance:

- [ ] Only real levels can open.
- [ ] No duplicate or incorrect canonical name.

## Phase 3 — Protect mobile touch input

Branch: `refactor/input-controller`

- [ ] Move geometric nearest-path logic into one module.
- [ ] Preserve current hit tolerance initially.
- [ ] Add tap/pan threshold.
- [ ] Add pinch zoom and reset view.
- [ ] Add rapid-tap lock.
- [ ] Recalculate geometry after resume, resize and orientation change.
- [ ] Integrate Capacitor Haptics for valid, blocked and completion states.
- [ ] Add input unit tests.
- [ ] Add browser and device interaction tests.
- [ ] Remove duplicate handlers only after parity passes.

PR acceptance:

- [ ] Same or better reliability than the prototype.
- [ ] No decorative layer receives touch events.
- [ ] No distant unrelated path is selected.

## Phase 4 — Toxic Toby backdrops

Branch: `content/tt01-backdrops`

- [ ] Export five dedicated square files.
- [ ] Remove source-sheet labels.
- [ ] Add one manifest entry per expression.
- [ ] Add crop, scale, position, opacity, contrast and saturation.
- [ ] Add parchment fallback.
- [ ] Bundle all five assets locally.
- [ ] Add iPhone and Android screenshots for all five.
- [ ] Test each level with backdrop disabled.
- [ ] Test all five in airplane mode.

PR acceptance:

- [ ] Correct expression on every level.
- [ ] Maze remains dominant.
- [ ] Touch regression tests pass.

## Phase 5 — Native save and lifecycle recovery

Branch: `feature/native-save-store`

- [ ] Define versioned save schema.
- [ ] Install Capacitor App, Preferences and Filesystem plugins.
- [ ] Use Preferences for settings/onboarding flags.
- [ ] Store versioned progress JSON through Filesystem.
- [ ] Save removed path IDs.
- [ ] Save level/compiler/app versions.
- [ ] Migrate existing completion data where practical.
- [ ] Save when the app pauses/backgrounds.
- [ ] Restore after force close and relaunch.
- [ ] Add corrupted-save recovery.
- [ ] Add reset-current and reset-all confirmations.
- [ ] Add iOS and Android lifecycle tests.

PR acceptance:

- [ ] Exact unfinished board returns after native app relaunch.

## Phase 6 — Blocking and fairness

Branch: `feature/geometry-blocking`

- [ ] Write the authoritative production rule ADR.
- [ ] Return structured blocker results.
- [ ] Highlight selected and blocking paths.
- [ ] Remove hidden forced-order behavior.
- [ ] Keep lives disabled during validation.
- [ ] Add deadlock detection.
- [ ] Add solver tests for all five `tt01` levels.
- [ ] Map blocked/valid states to restrained haptics.
- [ ] Conduct blocked-state testing on phones.

PR acceptance:

- [ ] Every rejected move is visibly explainable.
- [ ] No valid tap is rejected.

## Phase 7 — Native mobile shell and design system

Branches:

- `feature/design-tokens`
- `mobile/app-navigation`
- `mobile/character-expression-screens`

- [ ] Add semantic design tokens.
- [ ] Add buttons, cards, progress, alerts, modal and bottom sheet.
- [ ] Build Launch, Home, Teddies, How to Play and Settings.
- [ ] Build Teddy, Expression, Puzzle and Completion screens.
- [ ] Hide global navigation during play.
- [ ] Handle Android system Back.
- [ ] Respect iOS/Android safe areas.
- [ ] Add coming-soon cards.
- [ ] Add phone and tablet layouts.
- [ ] Add focus, large-text, reduced-motion and high-contrast states.
- [ ] Remove PWA install/update language from the native UI.

PR acceptance:

- [ ] App feels like an installed mobile game, not a website wrapper.
- [ ] Puzzle remains dominant.
- [ ] No approved visual changes without review.

## Phase 8 — Rope-pull animation

Branch: `feature/head-first-rope-animation`

- [ ] Preserve 80–120 ms anticipation.
- [ ] Move arrowhead first.
- [ ] Pull path body through bends.
- [ ] Fade near edge.
- [ ] Add reduced-motion version.
- [ ] Integrate haptics without delaying animation.
- [ ] Profile on low-end Android and physical iPhone.
- [ ] Add animation-state tests.

PR acceptance:

- [ ] No interaction, lifecycle or progress corruption.

## Phase 9 — Compiler and reports

Branch: `feature/compiler-validation`

- [ ] Consolidate compiler entry point.
- [ ] Validate overlap, crossing and self-intersection.
- [ ] Validate true endpoint/tangent.
- [ ] Validate mask containment.
- [ ] Calculate dependency graph.
- [ ] Prove solvability.
- [ ] Export validation report.
- [ ] Fail checks on invalid levels.
- [ ] Ensure only approved output is bundled into mobile builds.

PR acceptance:

- [ ] No invalid level can enter a mobile release.

## Phase 10 — Accessibility

Branch: `feature/accessibility-foundation`

- [ ] VoiceOver labels and announcements.
- [ ] TalkBack labels and announcements.
- [ ] Visible focus for external keyboard/switch use.
- [ ] Accessible path list or candidate navigation.
- [ ] Reduced motion.
- [ ] High contrast.
- [ ] Text reflow.
- [ ] Touch-target assistance.
- [ ] Physical-device accessibility notes.

PR acceptance:

- [ ] Core game can be completed without precise pointer input.

## Phase 11 — Native quality, offline and app lifecycle

Branch: `mobile/native-quality`

- [ ] Bundle launch content locally.
- [ ] Remove native dependence on service worker updates.
- [ ] Centralize app version/build number.
- [ ] Test airplane-mode launch.
- [ ] Test pause/resume.
- [ ] Test force close/relaunch.
- [ ] Test low-memory restoration.
- [ ] Test system interruptions.
- [ ] Test orientation and safe areas.
- [ ] Confirm no remote executable code is loaded.

PR acceptance:

- [ ] No network is required for bundled gameplay.
- [ ] No mixed browser-cache build state exists in the native app.

## Phase 12 — Analytics and research

Branch: `feature/mobile-analytics`

- [ ] Add approved event list.
- [ ] Add iOS/Android platform and native build properties.
- [ ] Add Teddy, expression, level and compiler versions.
- [ ] Do not collect continuous raw touch traces.
- [ ] Add research-build flag.
- [ ] Run mobile first-use study.
- [ ] Run backdrop recognition study.
- [ ] Run Toxic Toby difficulty test.
- [ ] Validate force-close recovery.

PR acceptance:

- [ ] Core native funnel is measurable without unnecessary personal data.

## Phase 13 — Store infrastructure

Branch: `mobile/store-preparation`

- [ ] Create Apple Developer/App Store Connect records.
- [ ] Create Google Play Console record.
- [ ] Configure iOS signing and TestFlight.
- [ ] Configure Play App Signing and Android App Bundle.
- [ ] Add approved icon and splash assets.
- [ ] Add iOS privacy manifest and App Privacy answers.
- [ ] Add Google Play Data Safety answers.
- [ ] Complete age/content ratings.
- [ ] Prepare phone/tablet screenshots.
- [ ] Prepare App Store subtitle/description/keywords.
- [ ] Prepare Google short/full description and feature graphic.
- [ ] Add review notes explaining bundled offline gameplay and native features.
- [ ] Produce TestFlight and Play internal builds.

PR acceptance:

- [ ] Both internal builds install and launch.
- [ ] No secret or signing credential is committed.

## Phase 14 — Founding 12 production

One branch per Teddy:

- `content/tt02-moldy-molly`
- `content/tt03-dumpster-danny`
- ...
- `content/tt12-plague-bear`

Per Teddy:

- [ ] Five backdrops.
- [ ] Five masks.
- [ ] Five compiled levels.
- [ ] Five solver reports.
- [ ] Arrow-only recognition QA.
- [ ] iOS QA.
- [ ] Android QA.
- [ ] Difficulty approval.
- [ ] Manifest availability update.

## Phase 15 — Store release

Branch: `release/founding-12-mobile-v1`

- [ ] Run complete automated suite.
- [ ] Run full iOS/Android device matrix.
- [ ] Confirm 60/60 level files.
- [ ] Confirm 60/60 backdrop mappings.
- [ ] Confirm 60/60 solver passes.
- [ ] Confirm canonical names.
- [ ] Confirm no fallback assets.
- [ ] Confirm accessibility modes.
- [ ] Confirm exact save recovery across app updates.
- [ ] Upload release candidate to TestFlight and Play closed testing.
- [ ] Resolve store review findings.
- [ ] Submit production releases.
- [ ] Tag the approved source commit.

## Pull-request template checklist

Every PR includes:

- Purpose
- Scope
- Platform impact: Web core / iOS / Android / all
- Files changed
- Behavior before
- Behavior after
- Screenshots or device recording
- Automated tests
- Physical-device tests
- Accessibility impact
- Performance impact
- Native lifecycle/storage impact
- Store/privacy impact
- Rollback method
- Approval gate
