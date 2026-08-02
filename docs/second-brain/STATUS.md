# Canonical Project Status

Updated: 2026-08-02
Last merged source baseline: `2a3de7bc62da2efe97c011f5c8e47452db6cf8a8`

## Product identity

- Product: **Toxic Teddies: Arrow Escape**
- Native app name: **Toxic Teddies**
- Bundle/application ID: `com.cogtech.toxicteddies`
- Version: `0.5.0`
- iOS build: `3`
- Android versionCode: `3`
- Architecture: Vite + JavaScript/SVG + Capacitor 8
- Browser demo: `https://cog-tech.github.io/toxic-teddies-face-trails/play/`
- Visual design system: `1.0.0`, July 2026

## Current release state

PR #47 was merged on 2026-08-02 as commit `2a3de7bc62da2efe97c011f5c8e47452db6cf8a8`.

The release:

- replaces the previous opening image with the owner-approved full-screen portrait Toxic Teddies intro;
- removes the static `LOADING` text from the artwork;
- keeps the illustrated loading trough dark, empty, and colorless before progress advances;
- overlays the existing real-stage green progress fill inside the artwork's trough;
- preserves the existing startup duration, monotonic progress, reduced-motion behavior, and handoff;
- preserves the existing approved Toxic Teddies home-logo source;
- changes no puzzle geometry, input, blockers, trail removal, save state, expression progression, reveal state, or gameplay layout;
- advances browser and service-worker presentation caching to `v47`.

The published v47 phone result is **pending owner verification**. The cache-busted review route is:

```text
https://cog-tech.github.io/toxic-teddies-face-trails/play/?teddy=tt01&level=1&v=47
```

## Canonical v47 intro state

- Approved artwork: full-screen portrait Toxic Teddies Arrow Escape intro with Toxic Toby in the radioactive laboratory.
- Source modules: `src/app/intro-art.js` and `src/app/intro-art/part-00.js` through `part-03.js`.
- Runtime presentation: `#bootSplashImage` receives the approved WebP data URI before the splash transition completes.
- Display frame: portrait 9:16, fitted to the full mobile game frame without stretching.
- Illustrated trough: dark and colorless in the static artwork.
- Runtime fill: the only green loading color inside the trough; moves left to right using actual startup-stage targets.
- Static `LOADING` word: forbidden.
- `ENTER THE LAB`: part of the intro artwork, not a second progress control and not a required startup tap.
- Full-motion minimum: 1,800 ms.
- Reduced-motion minimum: 700 ms.
- Splash leaves only after visible progress completion and app readiness.
- Startup failure still removes the splash and exposes the actionable error screen.
- Browser/service-worker presentation cache: `v47`.
- Owner verification pending: crop, empty trough, moving fill, 100% completion, and handoff on a real phone.

The older static WebP at `public/assets/branding/loading/toxic-teddies-loading.webp` remains the approved home-logo source and historical fallback asset. It is not the new full-screen v47 intro composition.

## Implemented gameplay and product systems

- Five deterministic Toxic Toby expression puzzles.
- Expression order: Neutral, Evil Grin, Gross, Angry, Maniacal Laugh.
- Verified screen-space pointer selection and mobile tap/pan discrimination.
- Visible blocker feedback with no hidden life penalty.
- Head-first trail removal and reduced-motion support.
- Exact unfinished-state restoration by removed path IDs.
- Manifest-validated completion destinations for `1 → 2 → 3 → 4 → 5 → feed`.
- Duplicate-tap protection, destination verification, preserved completion state, and visible retry behavior.
- Toxic Toby 5/5 completion state and private Toxic Feed unlock.
- Feed viewed/unread persistence and direct-route protection.
- Native iOS and Android Capacitor projects with offline bundled content.
- Versioned save migrations, bundled-content integrity checks, privacy-preserving local analytics, and store-release infrastructure.
- Browser demo built through Vite and published under `/play/`.
- Five owner-approved 9:16 Toxic Toby gameplay environments mapped in expression order.
- Absolute backdrop URL resolution, successful image-load diagnostics, transparent board presentation, and high-contrast fallback.
- Five manifest-driven placeholder reveal slots pending owner-supplied final reveal art.

## Owner-reported defect and direction state

### Completion progression

- The original completion flow stopped after Evil Grin.
- Issue #29 records the defect.
- The all-level repair is implemented and automated tests validate the complete manifest chain.
- Owner verification of the published `1 → 2 → 3 → 4 → 5 → feed` sequence remains pending.

### Runtime palette

- Failure F-009 records the retired cream interface that contradicted the locked design system.
- Runtime palette and shared surfaces are aligned in code with Grime 900, Ink 900, Toxic Green, Slime Green, Mold Olive, Patch Purple, and parchment readability surfaces.
- Published phone approval of home, gameplay, and feed readability remains pending.

### Intro and loading progress

- Failures F-010 and F-011 record the earlier broken-image and data-delivery failures.
- Failure F-012 records the earlier painted bar that looked permanently full.
- The owner approved a replacement intro on 2026-08-02 with no static loading color or `LOADING` text inside the trough.
- PR #47 merged that approved v47 presentation.
- Published phone verification remains pending.

### Gameplay backgrounds

- Failure F-013 records the earlier state where tests passed but the laboratory background did not paint in the production browser.
- The production runtime now preloads and applies the selected local WebP to the real game view.
- The owner confirmed that the background renders on a real phone.

### Mobile puzzle size

- Failure F-014 records the undersized visible Teddy caused by empty cells around the compiled 57×57 path geometry.
- The current safe v46 presentation uses a 96% board shell and centered 122% SVG presentation with `inset: -11%`.
- Measured Neutral paths occupy 87.1% of gameplay width and 49.0% of portrait height.
- All 122 Neutral paths remain inside the gameplay canvas.
- A 160% scale was rejected because the measured puzzle reached 114.2% of width and clipped side paths.
- The owner rejected v46 as the final composition and required compressed menus, background cropping, and larger arrow gameplay.

## Locked gameplay-first mobile target

The intro release does not replace or weaken the gameplay-first directive.

- Actual rendered path width: approximately **90–94%** of gameplay width.
- Actual rendered path height: at least **52%** of portrait gameplay height when the silhouette permits it.
- Combined persistent top, status, and bottom chrome: no more than approximately **24%** of gameplay height.
- Background may be center-cropped or trimmed before the puzzle is reduced.
- Background must never be stretched.
- Compact controls retain at least 44 CSS-pixel touch targets.
- No ear, chin path, arrowhead, face-critical feature, or exit lane may be clipped or covered.
- Approval requires actual rendered path bounds from `getBBox()` and `getScreenCTM()`, a no-clipping assertion, production-browser screenshots, and real-phone review.

The large stacked title, progress, status, accessibility, and expression cards shown in the v46 phone screenshot are not the final approved gameplay layout.

## Current v46 gameplay baseline

- Gameplay canvas: portrait 9:16.
- Board shell width: 96% of gameplay width.
- SVG/preview presentation: 122%, centered with `inset: -11%`.
- Visible path width: 87.1% of gameplay width.
- Visible path height: 49.0% of portrait gameplay height.
- Visible path width relative to board: 90.7%.
- Neutral path count: 122.
- No clipping in the audited baseline.
- Compiled coordinates, viewBox, selection geometry, blocker logic, solver data, trail removal, saves, and progression remain unchanged.
- This is an intermediate safe baseline only.

## What is not complete

- Owner verification of the published v47 intro on a real phone.
- Gameplay-first mobile composition with compressed persistent menus and cropped background.
- Owner approval of final enlarged arrow size and no-clipping evidence.
- Owner approval of the published dark home, gameplay, and feed palette.
- Owner verification of all five gameplay-background mappings and arrow readability.
- Owner verification of every completion transition and final feed.
- Five owner-approved clean Toxic Toby reveal images.
- Full physical iPhone lifecycle and accessibility testing.
- Full physical Android lifecycle and accessibility testing.
- Airplane-mode, force-close, reboot, low-memory, VoiceOver, and TalkBack evidence.
- Twelve-person Toxic Toby UX study.
- Signed TestFlight and Google Play internal-test uploads.
- Moldy Molly and the remaining Founding 12 playable packages.

## Playable content

- Playable Teddy: `tt01` Toxic Toby / Radioactive Ricky.
- Playable expressions: 5.
- Founding 12 target: 60 total levels.
- All other Teddy cards remain honest **COMING SOON** states.

## Gameplay backdrop files

```text
assets/backdrops/tt01/neutral.webp
assets/backdrops/tt01/evil-grin.webp
assets/backdrops/tt01/gross.webp
assets/backdrops/tt01/angry.webp
assets/backdrops/tt01/maniacal-laugh.webp
```

These are environment-only gameplay backgrounds. They are separate from final expression reveal artwork.

## Expected reveal files

```text
assets/reveals/tt01/neutral.webp
assets/reveals/tt01/evil-grin.webp
assets/reveals/tt01/gross.webp
assets/reveals/tt01/angry.webp
assets/reveals/tt01/maniacal-laugh.webp
```

Until those reveal files are approved, the app must retain the existing non-final placeholders and must not invent replacement character art.
