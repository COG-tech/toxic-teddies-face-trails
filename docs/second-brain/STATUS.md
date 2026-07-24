# Canonical Project Status

Updated: 2026-07-24
Last verified product baseline: `44f30bc874bf7d519963eb8bd2f7fef232b39119`

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

## What is implemented

- Five deterministic Toxic Toby expression puzzles.
- Expression order: Neutral, Evil Grin, Gross, Angry, Maniacal Laugh.
- Verified pointer selection, blocking feedback, head-first removal, hints, accessibility controls, and exact save restoration.
- Native iOS and Android projects with offline bundled content.
- Versioning, save migrations, content-integrity verification, local privacy-preserving research analytics, and store-release infrastructure.
- Browser demo built through Vite and published under `/play/`.
- Completion reveal screen with five manifest-driven placeholder artwork slots.
- Toxic Toby 5/5 completion state and locked private Toxic Feed.
- Feed unlock, viewed/unread post persistence, and direct-route protection.
- Manifest-validated completion destinations for `1 → 2 → 3 → 4 → 5 → feed`.
- Exact next-level loading with duplicate-tap protection, loaded-level verification, preserved completion state, and visible retry behavior.
- Owner-approved Toxic Teddies opening artwork installed as a full-screen startup layer.
- Loading progress tied to real startup stages with animated toxic scan, bubbles and reduced-motion support.
- Runtime design tokens now contain the exact Design System 1.0.0 palette.
- Home collection, game chrome, feed and accessibility controls now use the dark Grime 900 / Ink 900 shell with Toxic Green, Slime Green, Mold Olive and Patch Purple accents.
- Parchment is reserved for puzzle and modal readability instead of being used as the entire app background.
- Browser runtime/service-worker cache v37 for the palette-alignment release.
- Automated tests reject the retired cream page theme and verify canonical runtime color values and stylesheet order.
- Canonical second-brain records for status, next action, locked decisions, failures, testing, design system, visual level reference and change control.

## Owner-reported defect state

### Completion progression

- The first published completion implementation advanced Neutral to Evil Grin.
- Evil Grin completed, but **Next Expression** did not open Gross.
- Issue #29 records this defect.
- The all-level repair is implemented and automated checks validate the complete manifest chain.
- The defect remains **pending owner verification** until the published browser build is played through all five expressions and the final feed.

### Runtime visual mismatch

- The owner reported that the collection screen still used a cream background, white cards and brown text that did not match the locked Toxic Teddies design system.
- Failure F-009 records the mismatch.
- The runtime palette and shared surfaces are aligned in code.
- Final approval remains pending a published phone screenshot showing the revised home, game and feed screens.

## Canonical loading-screen state

- Approved artwork: Toxic Teddies Arrow Escape with Toxic Toby in the radioactive laboratory.
- The artwork is bundled locally and does not require a network image request.
- The in-app loading layer remains visible until startup genuinely completes, with a minimum 700 ms presentation to avoid a flash.
- The home/game interface is inert and hidden while startup is incomplete.
- Startup failure removes the splash and shows the existing actionable error screen.
- Visual placement and animation still require owner review on the published phone build.

## Canonical design-system implementation

The owner-supplied design-system board is recorded in `DESIGN_SYSTEM.md` and now reflected in runtime CSS:

- exact primary, secondary and neutral color tokens;
- approved gradients;
- Toxic Head and Inter typography roles;
- four-pixel spacing scale, twelve-column grid and breakpoints;
- dark distressed app shell and cards;
- toxic green active states and patch-purple secondary actions;
- parchment puzzle/modal readability surfaces;
- responsive and accessibility requirements.

## What is not complete

- Owner visual approval of the dark runtime palette on the published phone build remains pending.
- Owner verification of the animated loading screen remains pending.
- Owner verification of every repaired completion transition and final feed remains pending.
- The five owner-produced clean Toxic Toby reveal images have not been inserted.
- Physical iPhone testing has not been completed.
- Physical Android testing has not been completed.
- Airplane-mode, force-close, reboot, low-memory, VoiceOver, and TalkBack evidence remains pending.
- The 12-person Toxic Toby UX study has not occurred.
- Signed TestFlight and Google Play internal-test uploads remain pending.
- Moldy Molly and the remaining Founding 12 are not playable.
- Design-board concepts such as star ratings, completion times, achievements and difficulty selectors must not be described as implemented unless separately developed and verified.

## Playable content

- Playable Teddy: `tt01` Toxic Toby / Radioactive Ricky.
- Playable expressions: 5.
- Founding 12 target: 60 total levels.
- All other Teddy cards must remain honest **COMING SOON** states.

## Artwork state

Expected owner-supplied reveal files:

```text
assets/reveals/tt01/neutral.webp
assets/reveals/tt01/evil-grin.webp
assets/reveals/tt01/gross.webp
assets/reveals/tt01/angry.webp
assets/reveals/tt01/maniacal-laugh.webp
```

Until those files are approved, the app must use the existing neutral placeholders and must not invent replacement character art.
