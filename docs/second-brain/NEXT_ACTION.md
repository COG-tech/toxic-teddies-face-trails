# Single Canonical Next Action

Updated: 2026-07-24
Status: **ACTIVE — OWNER BROWSER RETEST REQUIRED**

## Action

Verify the new animated Toxic Teddies startup screen and the repaired Toxic Toby completion chain through every expression and the final private feed before inserting final artwork, changing puzzle visuals, or beginning Moldy Molly.

Playable build after this feature is merged and published:

```text
https://cog-tech.github.io/toxic-teddies-face-trails/play/?v=7
```

## Required retest sequence

1. Close the old game tab and open the `?v=7` build in a new tab.
2. Confirm the approved radioactive-laboratory artwork appears before the home screen.
3. Confirm the toxic loading bar visibly animates and the image is not stretched or cropped incorrectly.
4. Confirm the loading screen disappears cleanly when the app is ready.
5. Complete Neutral and press **Next Expression**.
6. Confirm Evil Grin loads.
7. Complete Evil Grin and press **Next Expression**.
8. Confirm Gross loads. This is the transition that previously failed.
9. Complete Gross and confirm Angry loads.
10. Complete Angry and confirm Maniacal Laugh loads.
11. Complete Maniacal Laugh and confirm Toxic Toby is shown as `5 / 5` complete.
12. Press the feed button and confirm Toxic Toby's private feed opens.
13. Return home and confirm the feed remains available.
14. Refresh the page and confirm the loading screen reappears, then completion and feed unlock remain saved.
15. Press **Next Expression** only once at each modal and confirm no duplicate or skipped level load occurs.

## Evidence needed

- One screenshot or short recording of the loading screen on the phone.
- One recording or screenshots showing `1 → 2`, `2 → 3`, `3 → 4`, `4 → 5`, and `5 → feed`.
- Exact text and screenshot for any failure.
- Phone/browser model and whether the page was opened fresh or from an existing tab.

## Loading behavior to verify

- The approved artwork is the opening visual.
- The loading animation aligns with the illustrated toxic bar.
- The app does not show a blank or partially rendered home screen underneath.
- The loading screen stays only while startup runs and does not create an excessive delay.
- Reduced-motion mode removes decorative movement on a later accessibility pass.

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
2. Mark the startup-screen phone review complete.
3. Insert the five owner-approved Toxic Toby reveal images when supplied.
4. Review image crop and readability on target phone sizes.
5. Complete physical Android and iPhone validation.
6. Only then start Moldy Molly's complete five-expression package.

## Replacement rule

This file contains exactly one active next action. It may be replaced only when the action is completed, blocked with documented evidence, or explicitly reprioritized by the owner.
