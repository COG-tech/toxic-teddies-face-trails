# Canonical Project Status

Updated: 2026-10-10
Source baseline: `b03905019be3062042c61bef8beaf8f41d2dcd5f`
Candidate: v54 draft, not merged or deployed. The public demo still reflects v53.

## Product identity

- Product: **Toxic Teddies: Arrow Escape**
- Native app name: **Toxic Teddies**
- Bundle/application ID: `com.cogtech.toxicteddies`
- Version: `0.5.0`
- iOS build: `3`
- Android versionCode: `3`
- Architecture: Vite + JavaScript/SVG + Capacitor 8
- Browser demo: `https://cog-tech.github.io/toxic-teddies-face-trails/play/`
- Design system: `1.0.0`, July 2026
- Brand promise: **The face is the puzzle.**

## Current draft candidate

The owner requested the Toby fixes on 2026-10-10 after the unresolved shape feedback. V54 reauthors the existing five puzzles with round attached ears, a wider head and fuller cheeks, a stronger muzzle/nose, a shorter rounded chin, and distinct mouths. No final character artwork is added or approved.

The ear radii are equal in **cell coordinates**, so rectangular grids cannot elongate them. Landmark-colored paths remain within their authored style regions instead of spilling into neighboring features.

- Compiler: `toxic-toby-teddy-v3`
- Content version: `tt01-teddy-2026.10.10.1`
- Level version: `3`
- Geometry mode: `portrait_native`
- Level grids remain `87×57`, `89×59`, `91×61`, `93×63`, `95×65`.
- Cells remain square; paths remain connected, orthogonal and non-overlapping with tangent arrowheads.
- All five complete removal orders validate: 138, 167, 151, 167 and 168 paths, 791 total.
- Authored path-bounds height/width remains within `1.42–1.65`.
- The complete-level fit remains locked during removal and reapplied on resize/rotation.
- Versioned unfinished v53 sessions restart safely; completion, feed unlocks and viewed posts remain preserved.
- Removed a redundant delayed startup load that could overwrite restored removed-path state. Regression coverage reproduces the former failure and verifies ten-path restoration.

### Evidence boundary

DOM integration tests execute the production runtime against all five real levels, including repeated Next, blocked moves, locked routes, 2→3 failed-load retry, ten removals, fit reapplication and save/feed reload. SVG bounds and animations are simulated. These are not browser renders or physical-phone tests.

Geometry previews are code-derived diagrams, explicitly labeled as such. Browser screenshots, actual measured phone fit, physical-device playthroughs and owner visual approval remain pending. Local Chromium startup is blocked by this execution environment's Unix-socket restriction. The separate supported cloud browser was also tried, but the temporary local candidate URL returned `ERR_CONNECTION_REFUSED`; no accessible candidate preview route was established. No user computer was accessed and no restriction was bypassed.

## Adaptive canvas state

- Gameplay uses the complete available viewport rather than a fixed 9:16 picture.
- The expression-specific raster gameplay backgrounds are retired from active runtime presentation.
- The laboratory frame is generated responsively with CSS surfaces, narrow rails, grime, glow, and a thin hazard lip.
- The SVG uses `preserveAspectRatio="xMidYMid meet"`.
- `preserveAspectRatio="none"` is forbidden.
- Empty space caused by a genuine aspect-ratio mismatch is preferable to distorting the Teddy.
- Visible HUD controls are 24 pixels inside 44 CSS-pixel touch targets.
- Level and progress remain tiny overlays.

## Startup state

- The owner-approved full-screen portrait intro remains canonical.
- The static loading trough begins dark, empty, and colorless.
- No static `LOADING` word is present.
- Only the real runtime green progress fill adds color inside the trough.
- The intro remains visible until the requested route, generated frame, and measured puzzle fit are ready.
- The home-logo asset remains unchanged.

## Implemented gameplay systems

- Five deterministic Toxic Toby expressions.
- Expression order: Neutral, Evil Grin, Gross, Angry, Maniacal Laugh.
- Screen-space pointer selection and mobile tap/pan discrimination.
- Visible blocker feedback.
- Head-first arrow-trail removal.
- Exact unfinished-state restoration when level versions match.
- Version-safe restart when geometry changes.
- Manifest-validated progression `1 → 2 → 3 → 4 → 5 → feed`.
- Toxic Toby completion and private Toxic Feed unlock.
- Feed viewed/unread persistence and direct-route protection.
- Offline browser and Capacitor bundles.
- Generated content-integrity verification.

## Automated candidate gates

- Portrait grids must contain more rows than columns.
- Every cell must remain inside its rectangular board.
- Path IDs must be unique.
- Trails must remain orthogonal, connected, and non-overlapping.
- Arrow direction must remain tangent to the true head endpoint.
- Every expression must retain a complete verified removal order.
- Authored face aspect ratio must remain between `1.42` and `1.65`.
- Mobile browser audit requires at least `86%` gameplay-width use and `72%` gameplay-height use.
- Browser audit must confirm no raster gameplay backdrop, no clipping, no stretching, and a locked full-level fit.

## Owner verification still required

- Confirm the v54 candidate face is immediately recognizable as a Teddy on a real phone.
- Confirm the round ears, fuller cheeks, stronger muzzle/nose and short chin read clearly on a real phone.
- Confirm the ears remain round, visibly attached, and the facial features do not look elongated.
- Confirm empty space above and below is materially reduced.
- Remove at least ten arrows and confirm the face never shrinks, zooms, jumps, or recenters.
- Confirm no ear, chin path, arrowhead, face-critical feature, or exit lane is clipped.
- Confirm all five expressions remain readable and distinct.
- Confirm progression, saves, completion, and feed behavior on the published build.

## Playable content

- Playable Teddy: `tt01` Toxic Toby / Radioactive Ricky.
- Playable expressions: `5`.
- Founding 12 target: `60` total levels.
- Every other Teddy remains an honest **COMING SOON** state.

## Artwork state

- Final Toxic Toby expression reveal images are not approved.
- Existing reveal placeholders remain non-final.
- Do not invent or insert final reveal art without owner approval.

Expected future reveal slots:

```text
assets/reveals/tt01/neutral.webp
assets/reveals/tt01/evil-grin.webp
assets/reveals/tt01/gross.webp
assets/reveals/tt01/angry.webp
assets/reveals/tt01/maniacal-laugh.webp
```

## Work blocked until Toby visual approval

- Moldy Molly production.
- Remaining Founding 12 playable packages.
- Final reveal insertion.
- Store approval claims based only on automated evidence.

Physical iPhone, Android, VoiceOver, TalkBack, lifecycle, airplane-mode, low-memory, participant-research, TestFlight, and Google Play internal-test evidence remain pending.
