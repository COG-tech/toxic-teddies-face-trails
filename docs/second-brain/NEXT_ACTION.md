# Single Canonical Next Action

Updated: 2026-07-24
Status: **ACTIVE — OWNER BROWSER RETEST REQUIRED**

## Action

Verify the repaired Toxic Toby completion chain through every expression and the final private feed before inserting final artwork, changing puzzle visuals, or beginning Moldy Molly.

Playable build after this repair is merged and published:

```text
https://cog-tech.github.io/toxic-teddies-face-trails/play/?v=6
```

## Required retest sequence

1. Open the build in a new browser tab.
2. Complete Neutral and press **Next Expression**.
3. Confirm Evil Grin loads.
4. Complete Evil Grin and press **Next Expression**.
5. Confirm Gross loads. This is the transition that previously failed.
6. Complete Gross and confirm Angry loads.
7. Complete Angry and confirm Maniacal Laugh loads.
8. Complete Maniacal Laugh and confirm Toxic Toby is shown as `5 / 5` complete.
9. Press the feed button and confirm Toxic Toby's private feed opens.
10. Return home and confirm the feed remains available.
11. Refresh the page and confirm completion and feed unlock remain saved.
12. Press **Next Expression** only once at each modal and confirm no duplicate or skipped level load occurs.

## Evidence needed

- One screen recording or screenshots showing `1 → 2`, `2 → 3`, `3 → 4`, `4 → 5`, and `5 → feed`.
- Exact text and screenshot for any failure.
- Phone/browser model and whether the page was opened fresh or from an existing tab.

## Repair behavior to verify

- The completion destination is captured when the expression is cleared.
- The next button opens the exact next playable manifest entry.
- The app does not silently reload the same expression.
- Double taps are ignored while navigation is already running.
- A failed next-level load keeps the completion modal open and changes the button to a retry action.
- Completion remains saved even if the next screen fails to open.

## Do not start yet

- Do not begin Moldy Molly levels.
- Do not redesign the puzzle board.
- Do not replace the stable path interaction system.
- Do not mark physical iPhone or Android testing complete.
- Do not generate substitute reveal artwork.

## After this action passes

1. Mark issue #29 verified and close it.
2. Insert the five owner-approved Toxic Toby reveal images when supplied.
3. Review image crop and readability on target phone sizes.
4. Complete physical Android and iPhone validation.
5. Only then start Moldy Molly's complete five-expression package.

## Replacement rule

This file contains exactly one active next action. It may be replaced only when the action is completed, blocked with documented evidence, or explicitly reprioritized by the owner.
