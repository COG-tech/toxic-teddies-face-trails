# Failure Ledger

Read this before proposing a fix. Do not repeat a failed approach under a new name.

## F-001 — Raw GitHub Pages source was not playable

**Symptom:** The static header appeared, the counter stayed at `0 / 5`, and no Teddy cards loaded.

**Cause:** GitHub Pages served raw source files whose JSON and Capacitor imports required the Vite build step.

**Resolution:** Publish the verified Vite bundle under `/play/` and redirect the repository root there.

**Never repeat:** Do not serve raw `index.html` as the playable app and do not hand-edit generated `/play/` files.

## F-002 — Completion progression stopped after Evil Grin

**Observed:** In the owner's browser playtest, Neutral completed and advanced to Evil Grin. Evil Grin also completed and displayed “Expression 3 is now unlocked,” but **Next Expression** did not open Gross.

**Environment/build:** Published GitHub Pages browser build after the first completion/feed implementation.

**Expected:** Every transition must work in order: `1 → 2 → 3 → 4 → 5 → private feed`.

**Implementation weakness:** Completion navigation derived its target from mutable runtime state at click time, did not capture a validated pending destination when completion occurred, did not require the exact requested level, and did not verify that the next level actually loaded. A failure could therefore stop or silently remain on the same expression without preserving a useful retry state. The exact device-side trigger for the Evil Grin failure was not observable without browser-console evidence, but these missing safeguards allowed the reported symptom.

**Resolution:** Completion now captures a manifest-validated destination at completion time, requires exact unlock and playable-content matches, prevents duplicate taps, verifies the loaded Teddy and level, keeps the completion modal available after a failed load, and provides an explicit retry action. The browser runtime and service-worker cache version were also advanced so the repaired code cannot be confused with the prior cached runtime.

**Regression evidence:** The progression test suite now validates every transition—`1 → 2`, `2 → 3`, `3 → 4`, `4 → 5`, and `5 → feed`—against the actual level and feed manifests. Missing expression or feed destinations fail before runtime navigation.

**Never repeat:** Do not navigate from a completion modal using only mutable `state.level`, do not silently fall back to an earlier unlocked level, and do not hide the completion modal until the exact destination is confirmed loaded.

**Status:** Fixed in code; owner browser retest pending.

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
