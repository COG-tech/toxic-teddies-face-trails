# GitHub Execution Checklist

This checklist converts the master build plan into branch, pull-request and issue work.

## Working rules

- [ ] `main` remains the live GitHub Pages branch.
- [ ] Every implementation change starts from current `main`.
- [ ] One concern per pull request where practical.
- [ ] No visual change is merged without approval.
- [ ] Every PR includes screenshots or recordings when it changes UI or gameplay.
- [ ] Every PR includes a regression checklist.
- [ ] Every production content file is referenced by a manifest.
- [ ] No unfinished character falls back to Toxic Toby content.

## Phase 0 — Baseline and audit

Branch: `audit/current-build-baseline`

- [ ] Record current commit SHA and build version.
- [ ] Capture desktop and mobile videos of working path selection/removal.
- [ ] Document exact CSS and JavaScript load order.
- [ ] Document current lives/blocking/deadlock behavior.
- [ ] Add a manual smoke-test document.
- [ ] Add a debug build-version display.
- [ ] Update README so it matches the dense compiled system.

PR acceptance:

- [ ] Current live behavior can be reproduced and restored.
- [ ] No visual or gameplay change.

## Phase 1 — Canonical content manifests

Branch: `feature/canonical-manifests`

- [ ] Add character manifest.
- [ ] Add expression manifest.
- [ ] Add level manifest.
- [ ] Add backdrop manifest.
- [ ] Use locked Founding 12 names.
- [ ] Replace hard-coded `TEDDIES` data with manifest loading.
- [ ] Remove fallback from other Teddies to `tt01` levels.
- [ ] Mark non-existent levels `coming_soon`.
- [ ] Correct collection counters.

PR acceptance:

- [ ] Only real levels can open.
- [ ] No duplicate or incorrect canonical name.

## Phase 2 — Input controller protection

Branch: `refactor/input-controller`

- [ ] Move geometric nearest-path logic into one module.
- [ ] Preserve current hit tolerance initially.
- [ ] Add tap/pan threshold.
- [ ] Add rapid-tap lock.
- [ ] Recalculate geometry after resize/orientation.
- [ ] Add input unit tests.
- [ ] Add Playwright click tests.
- [ ] Remove duplicate event handlers only after tests pass.

PR acceptance:

- [ ] Same or better selection reliability than baseline.
- [ ] No decorative layer receives pointer events.

## Phase 3 — Toxic Toby backdrop mapping

Branch: `content/tt01-backdrops`

- [ ] Export five separate 1:1 backdrop files.
- [ ] Remove source-sheet labels.
- [ ] Add one backdrop entry per expression.
- [ ] Add crop/scale/position/opacity values.
- [ ] Add parchment fallback.
- [ ] Add screenshot tests for all five expressions.
- [ ] Test each level with backdrop disabled.

PR acceptance:

- [ ] Correct expression on every level.
- [ ] Maze remains dominant.
- [ ] Input regression test passes.

## Phase 4 — Exact progress saving

Branch: `feature/versioned-progress-store`

- [ ] Define versioned progress schema.
- [ ] Save removed path IDs.
- [ ] Save level/compiler version.
- [ ] Migrate current completed-level data.
- [ ] Restore after refresh and PWA reopen.
- [ ] Add reset-current and reset-all confirmations.
- [ ] Add save/restore tests.

PR acceptance:

- [ ] Exact unfinished board returns after reload.

## Phase 5 — Blocking and fairness

Branch: `feature/geometry-blocking`

- [ ] Write an architecture decision for the production rule.
- [ ] Return structured blocker results.
- [ ] Highlight selected and blocking paths.
- [ ] Remove hidden forced-order behavior.
- [ ] Keep lives disabled during validation.
- [ ] Add deadlock detection.
- [ ] Add solver tests for all five `tt01` levels.
- [ ] Conduct blocked-state user testing.

PR acceptance:

- [ ] Every rejected move is visually explainable.
- [ ] No valid tap is rejected.

## Phase 6 — Design system and product shell

Branches:

- `feature/design-tokens`
- `feature/product-navigation`
- `feature/character-and-expression-views`

- [ ] Add semantic token files.
- [ ] Add buttons, cards, progress, alerts, modal and bottom sheet.
- [ ] Build Play, Teddies, How to Play and Settings navigation.
- [ ] Build Home, Character, Expression and Completion views.
- [ ] Hide global navigation during play.
- [ ] Add coming-soon cards.
- [ ] Add responsive mobile/tablet/desktop states.
- [ ] Add focus, large-text and high-contrast states.

PR acceptance:

- [ ] Puzzle stays the dominant element.
- [ ] No approved visual is changed without review.

## Phase 7 — Rope-pull animation

Branch: `feature/head-first-rope-animation`

- [ ] Preserve 80–120 ms anticipation.
- [ ] Move arrowhead first.
- [ ] Pull path body through bends.
- [ ] Fade near edge.
- [ ] Add reduced-motion version.
- [ ] Profile on low-end mobile.
- [ ] Add animation-state tests.

PR acceptance:

- [ ] No interaction or progress corruption.

## Phase 8 — Compiler and reports

Branch: `feature/compiler-validation`

- [ ] Consolidate compiler entry point.
- [ ] Validate overlap, crossing and self-intersection.
- [ ] Validate true endpoint/tangent.
- [ ] Validate mask containment.
- [ ] Calculate dependency graph.
- [ ] Prove solvability.
- [ ] Export validation report.
- [ ] Fail build on invalid levels.

PR acceptance:

- [ ] No invalid level can be marked playable.

## Phase 9 — Accessibility

Branch: `feature/accessibility-foundation`

- [ ] Keyboard-operable controls.
- [ ] Visible path focus.
- [ ] Accessible path list or candidate navigation.
- [ ] Screen-reader announcements.
- [ ] Reduced motion.
- [ ] High contrast.
- [ ] Text reflow.
- [ ] VoiceOver/TalkBack test notes.

PR acceptance:

- [ ] Core game can be completed without precise pointer input.

## Phase 10 — PWA and cache reliability

Branch: `fix/pwa-versioned-cache`

- [ ] Centralize build version.
- [ ] Separate shell/data/image caches.
- [ ] Remove repeated `?v=30` strings.
- [ ] Add deferred update prompt.
- [ ] Verify offline cached-level reopen.
- [ ] Verify progress survives update.
- [ ] Test GitHub Pages paths.

PR acceptance:

- [ ] No stale mixed-build state in test matrix.

## Phase 11 — Analytics and research

Branch: `feature/core-analytics`

- [ ] Add approved event list.
- [ ] Add build, Teddy, expression and level version properties.
- [ ] Do not collect continuous raw pointer traces.
- [ ] Add a research-build flag.
- [ ] Run first-use usability study.
- [ ] Run backdrop recognition study.
- [ ] Run Toxic Toby difficulty test.

PR acceptance:

- [ ] Core funnel is measurable without collecting unnecessary personal data.

## Phase 12 — Founding 12 production

One branch per Teddy:

- `content/tt02-moldy-molly`
- `content/tt03-dumpster-danny`
- ...
- `content/tt12-plague-bear`

Per Teddy:

- [ ] Five backdrop exports.
- [ ] Five masks.
- [ ] Five compiled levels.
- [ ] Five solver reports.
- [ ] Recognition QA without backdrop.
- [ ] Mobile/desktop QA.
- [ ] Difficulty approval.
- [ ] Manifest availability update.

## Phase 13 — Release

Branch: `release/founding-12-v1`

- [ ] Run complete automated suite.
- [ ] Run full device matrix.
- [ ] Confirm 60/60 level files.
- [ ] Confirm 60/60 backdrop mappings.
- [ ] Confirm 60/60 solver passes.
- [ ] Confirm canonical names.
- [ ] Confirm no fallback assets.
- [ ] Confirm accessibility modes.
- [ ] Confirm PWA update and offline behavior.
- [ ] Confirm GitHub Pages live build matches release commit.
- [ ] Tag release.

## Pull-request template checklist

Every PR should include:

- Purpose
- Scope
- Files changed
- Behavior before
- Behavior after
- Screenshots or recording where relevant
- Automated tests
- Manual tests
- Accessibility impact
- Performance impact
- Cache/version impact
- Rollback method
- Approval gate
