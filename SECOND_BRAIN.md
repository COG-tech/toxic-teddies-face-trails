# Toxic Teddies Second Brain

This is the project memory and control system. Read it before changing code, art mappings, progression, releases, or the production roadmap.

## Canonical read order

1. `docs/second-brain/STATUS.md` — what exists now.
2. `docs/second-brain/NEXT_ACTION.md` — the one active next action.
3. `docs/second-brain/LOCKED_DECISIONS.md` — rules that may not be silently changed.
4. `docs/second-brain/FAILURE_LEDGER.md` — approaches and defects that must not be repeated.
5. `docs/second-brain/TEST_MATRIX.md` — automated passes and human gates.
6. `docs/second-brain/CHANGE_PROTOCOL.md` — required workflow for every change.
7. `docs/second-brain/project-memory.json` — machine-readable project memory.

## Core rule

Do not begin a new feature merely because it sounds like the next idea. First confirm that the current `NEXT_ACTION.md` item is complete or explicitly replaced by the owner.

## Before work starts

- Read all seven canonical records above.
- Check the failure ledger for the same symptom or approach.
- Confirm the proposed work does not violate a locked decision.
- Create a branch from the latest `main` commit.
- Define the evidence required to call the work complete.

## Before work is merged

- Run the full automated checks.
- Update the second brain when status, decisions, failures, tests, or next action changed.
- Record unresolved physical-device, artwork-approval, research, signing, or store gates as pending—not completed.
- Never claim a feature works merely because code exists.

## Immutable product direction

- Brand promise: **The face is the puzzle.**
- Installed native iOS and Android app through Capacitor; GitHub Pages is the browser prototype/demo.
- Deterministic precompiled levels; no runtime random generation.
- Preserve the verified click, blocking, removal, save, and progression systems unless a tested replacement is intentionally approved.
- Do not generate, redraw, or substitute final character artwork without owner approval.
