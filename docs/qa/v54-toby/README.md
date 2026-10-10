# V54 Toby correction review

Baseline: `b03905019be3062042c61bef8beaf8f41d2dcd5f` (v53 generator).
Candidate build: `0.5.0+3.tt01-teddy-2026.10.10.1`.

## Scope

Correct the five existing Toby puzzles: round attached ears, wider head/full cheeks, stronger muzzle/nose, short round chin and five distinct mouths. Keep the deterministic square-cell, connected orthogonal non-overlapping path system, tangent heads, complete solutions and uniform full-level fit. Leave the eleven unfinished Teddies Coming Soon and final reveal slots unapproved.

The diagrams below are **code-derived geometry previews**, not screenshots of the browser UI. They use a plain review canvas and approximate runtime stroke colors. They do not prove CSS layout, touch targets, contrast or actual phone fit.

- [Before: regenerated v53 Neutral](before-neutral.svg)
- [After: Neutral](level-1.svg)
- [After: Evil Grin](level-2.svg)
- [After: Gross](level-3.svg)
- [After: Angry](level-4.svg)
- [After: Maniacal Laugh](level-5.svg)

## Root causes and changes

The old normalized ear radii mapped to different physical radii on the tall grid. The v54 radius ratio now compensates for row/column counts. The cheek/head mask is fuller and the chin shorter. Nose/muzzle regions are broader; path growth cannot carry one feature's color into another feature. Each expression has its own mouth geometry.

A new runtime regression also reproduced a save failure: ten removed paths came back after reload. A redundant delayed startup `openGame` raced the canonical boot and could persist the fresh board before restoration. Removing that second startup load fixes the reproduced case; the production loader already installs every wrapper before booting once.

## Reproduce local checks

Use Node 22 or newer:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run prepare:build
npm run check
npm run build
```

Build preparation synchronizes generated/native metadata using the repository's existing scripts. This candidate does not introduce native project edits or change signing settings. Browser dependencies include test-only `jsdom@26.1.0` (supports the repository's Node floor).

Passed: the full repository check, all five solver orders (138/167/151/167/168 paths, 791 total), Vite production build and 19-file offline integrity check. The DOM regression solves each real level through production move/Next handlers and checks duplicate taps, blocked paths, ten-removal fit reapplication, exact restored IDs, 2→3 load retry, locked routes, Coming Soon, migration, completion and feed/view persistence.

DOM tests simulate animations and SVG bounds. They are not a real-browser render, physical touch test, accessibility audit or native-device run. The SVG diagrams were inspected as geometry review aids only. Subjective recognition is awaiting owner approval.

## Required before merge/release

- Independent review of the exact candidate.
- Production-browser screenshots and actual `getBBox()`/`getScreenCTM()` measurements for all five levels.
- At 430×764: ≥86% gameplay width and ≥72% height; at 1365×768: ≥28% width and ≥82% height, without clipping.
- Actual ten-removal, resize/rotation, five-level flow and reload checks.
- Owner phone approval; separate physical iPhone/Android, VoiceOver/TalkBack, lifecycle/offline and store gates.

Local Chromium cannot start within this execution environment's Unix-socket restriction. The separate supported cloud browser was tried against the temporary local candidate server, but returned `ERR_CONNECTION_REFUSED`; no accessible candidate preview route was established. No restriction was bypassed and no user computer was accessed. Browser/device verification remains blocked/pending. This draft is not merged, deployed or store-ready. No paid Actions or workflow dispatch is part of the work. The public `/play/` demo remains the previous build.

## Rollback

Revert the candidate's source, version and generated-content changes together, then run normal build preparation. Completion/feed/view state is preserved; incompatible unfinished sessions reset safely.
