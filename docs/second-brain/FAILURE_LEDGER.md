# Failure Ledger

Read this before proposing a fix. Do not repeat a failed approach under a new name.

## F-001 — Raw GitHub Pages source was not playable

**Symptom:** The static header appeared, the counter stayed at `0 / 5`, and no Teddy cards loaded.

**Cause:** GitHub Pages served raw source files whose JSON and Capacitor imports required the Vite build step.

**Resolution:** Publish the verified Vite bundle under `/play/` and redirect the repository root there.

**Never repeat:** Do not serve raw `index.html` as the playable app and do not hand-edit generated `/play/` files.

## F-002 — Completion did not advance to the next expression

**Symptom:** A finished puzzle showed completion but the player could not continue correctly.

**Cause:** Completion routing was not protected by a dedicated progression rule and the final state returned home instead of opening the intended reward flow.

**Resolution:** Central progression logic now routes levels 1–4 to the following expression and level 5 to the unlocked Toxic Feed.

**Never repeat:** Do not add independent click handlers that bypass the canonical completion destination logic.

## F-003 — Final artwork was discussed before it existed

**Risk:** Placeholder or generated art could be mistaken for approved final character art.

**Resolution:** The completion system uses explicit placeholder slots until the owner provides five clean approved images.

**Never repeat:** Do not generate, fabricate, substitute, or silently crop final reveal art.

## F-004 — Unfinished Teddy fallback risk

**Risk:** Loading Toxic Toby data or artwork for another Teddy would make the app look complete while violating the brand promise.

**Resolution:** Manifest status gates playable content; unfinished Teddies remain **COMING SOON**.

**Never repeat:** No fallback from `tt02`–`tt12` to `tt01` in production behavior.

## F-005 — Patch-on-patch interaction regressions

**Risk:** Changing backgrounds, input code, or mobile wrappers can re-break the proven click/removal system.

**Resolution:** Preserve the current interaction layer and require focused regression tests plus full builds for any input or board change.

**Never repeat:** Do not replace stable interaction behavior while solving an unrelated visual problem.

## F-006 — Runtime-generated puzzle risk

**Risk:** Random or runtime-generated levels can be unsolvable, inconsistent, impossible to restore exactly, or different across devices.

**Resolution:** Levels are deterministic precompiled JSON with solver and geometry reports.

**Never repeat:** No runtime random generation and no unverified level JSON.

## F-007 — Automated success mistaken for physical validation

**Risk:** Passing CI could be reported as proof of real iPhone, Android, VoiceOver, TalkBack, signing, store upload, or participant testing.

**Resolution:** Automated and human gates are recorded separately.

**Never repeat:** Never mark a human gate complete without physical evidence or account-side confirmation.

## F-008 — Reopening finished planning instead of executing the active step

**Risk:** Repeatedly discussing already-settled architecture, names, expressions, or release order wastes work and creates contradictory plans.

**Resolution:** `NEXT_ACTION.md` contains exactly one active action. New work must either complete it or explicitly replace it with owner approval.

**Never repeat:** Do not restart completed planning unless new evidence shows a defect.

## Incident entry template

```text
## F-XXX — Title

Observed:
Environment/build:
Exact reproduction steps:
Expected:
Actual:
Root cause:
Resolution:
Regression test/evidence:
Never repeat:
Status: open | fixed | monitoring
```
