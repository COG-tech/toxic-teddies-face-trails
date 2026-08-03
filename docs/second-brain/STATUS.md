# Canonical Project Status

Updated: 2026-08-03
Current source baseline before merge: `fix/portrait-native-teddy-v53`

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

## Current release candidate

V53 replaces the square-authored Toxic Toby levels with portrait-native geometry while retaining the adaptive full-viewport canvas introduced in v52.

Owner-review route after merge:

```text
https://cog-tech.github.io/toxic-teddies-face-trails/play/?teddy=tt01&level=1&v=53
```

## V53 geometry state

- Compiler: `toxic-toby-portrait-v2`
- Content version: `tt01-portrait-2026.08.03.1`
- Level version: `2`
- Geometry mode: `portrait_native`
- Level grids: `87×57`, `89×59`, `91×61`, `93×63`, `95×65`
- Cells remain square and every trail remains orthogonal.
- The face is made taller by newly authored coordinates, not by SVG stretching.
- Ears, inner ears, eyes, muzzle, nose, mouth, cheeks, patch, seam, and chin are proportioned for the taller coordinate field.
- Authored rendered-path aspect ratio is constrained to approximately `1.42–1.65`.
- The full-level viewBox is captured once and locked for the whole expression.
- Arrow removal cannot change the face scale, center, aspect ratio, or viewBox.
- Existing incompatible unfinished sessions are cleared safely through the level-version change.
- Completed expressions, feed unlocks, and viewed feed posts remain preserved.

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

## Automated v53 gates

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

- Confirm the v53 face is immediately recognizable as a Teddy on a real phone.
- Confirm the face uses materially more portrait height than v52.
- Confirm the ears remain round and the facial features do not look elongated.
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

## Work blocked until v53 approval

- Moldy Molly production.
- Remaining Founding 12 playable packages.
- Final reveal insertion.
- Store approval claims based only on automated evidence.

Physical iPhone, Android, VoiceOver, TalkBack, lifecycle, airplane-mode, low-memory, participant-research, TestFlight, and Google Play internal-test evidence remain pending.
