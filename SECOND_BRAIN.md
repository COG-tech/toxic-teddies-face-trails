# Toxic Teddies Second Brain

This is the project memory and control system. Read it before changing code, art mappings, progression, releases, level composition, interface layout, or the production roadmap.

## Canonical read order

1. `docs/second-brain/STATUS.md` — what exists now.
2. `docs/second-brain/NEXT_ACTION.md` — the one active next action.
3. `docs/second-brain/LOCKED_DECISIONS.md` — rules that may not be silently changed.
4. `docs/second-brain/FAILURE_LEDGER.md` — approaches and defects that must not be repeated.
5. `docs/second-brain/TEST_MATRIX.md` — automated passes and human gates.
6. `docs/second-brain/DESIGN_SYSTEM.md` — the canonical app colors, typography, spacing, components, navigation, cards, alerts, badges, completion modal and accessibility direction.
7. `docs/second-brain/VISUAL_REFERENCE.md` — how the game screen and face-shaped levels must read on a phone.
8. `docs/second-brain/BRAND_ASSET_PIPELINE.md` — the proven static-image, loading-artwork, logo-crop and loading-bar implementation.
9. `docs/second-brain/CHANGE_PROTOCOL.md` — required workflow for every change.
10. `docs/second-brain/project-memory.json` — machine-readable project memory.

## Core rule

Do not begin a new feature merely because it sounds like the next idea. First confirm that the current `NEXT_ACTION.md` item is complete or explicitly replaced by the owner.

## Before work starts

- Read all ten canonical records above.
- Check the failure ledger for the same symptom or approach.
- Confirm the proposed work does not violate a locked decision.
- For any interface, component, card, navigation, alert, badge, completion, board, level, background or reveal change, compare against both the design system and visual reference.
- For opening art, logos, backgrounds or other essential static images, follow `BRAND_ASSET_PIPELINE.md`.
- Create a branch from the latest `main` commit.
- Define the evidence required to call the work complete.

## Before work is merged

- Run `npm run validate:second-brain`, the full automated checks, and the production build.
- Update the second brain when status, decisions, failures, tests, visuals, design-system rules or next action changed.
- Record unresolved physical-device, artwork-approval, research, signing, or store gates as pending—not completed.
- Never claim a feature works merely because code exists.
- Never merge a visual change without phone-size evidence and confirmation that the face remains the dominant readable object.

## Immutable product direction

- Brand promise: **The face is the puzzle.**
- Installed native iOS and Android app through Capacitor; GitHub Pages is the browser prototype/demo.
- Deterministic precompiled levels; no runtime random generation.
- Preserve the verified click, blocking, removal, save, and progression systems unless a tested replacement is intentionally approved.
- Do not generate, redraw, or substitute final character artwork without owner approval.
- The owner-supplied design-system board is the canonical app component and visual-language reference.
- The owner-supplied puzzle reference guides composition and readability only; do not copy its commercial art style, branding, blue plastic tiles, HUD, currencies, or exact interface.

## Automated guardrail

The repository must contain one valid canonical second brain. Validation is run with:

```text
npm run validate:second-brain
```

The validator checks the required records, one active next action, locked project truths, failure history, design-system memory, visual guardrails, brand-asset delivery rules, expression order, playable-content truth, and pending human gates.
