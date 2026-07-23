# Canonical Project Status

Updated: 2026-07-24
Last verified product baseline: `8c908fb91b3ca2a2c6507029585d6fe1046bc40c`

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
- Completion progression from expression 1 through 5.
- Completion reveal screen with five manifest-driven placeholder artwork slots.
- Toxic Toby 5/5 completion state and locked private Toxic Feed.
- Feed unlock, viewed/unread post persistence, and direct-route protection.
- Canonical second-brain records for status, next action, locked decisions, failures, testing, design system, visual level reference and change control.
- Automated second-brain validation included in the full repository quality check.

## Canonical design-system memory

The owner-supplied design-system board is recorded in `DESIGN_SYSTEM.md`, including:

- brand identity and five design principles;
- primary, secondary and neutral color tokens;
- approved gradients;
- Toxic Head and Inter typography roles and type scale;
- four-pixel spacing scale, twelve-column grid and breakpoints;
- buttons, forms, cards, navigation, alerts, badges and completion-modal patterns;
- responsive behavior and accessibility requirements;
- explicit boundaries separating design concepts from implemented gameplay logic.

## What is not complete

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

Expected owner-supplied files:

```text
assets/reveals/tt01/neutral.webp
assets/reveals/tt01/evil-grin.webp
assets/reveals/tt01/gross.webp
assets/reveals/tt01/angry.webp
assets/reveals/tt01/maniacal-laugh.webp
```

Until those files are approved, the app must use the existing neutral placeholders and must not invent replacement character art.
