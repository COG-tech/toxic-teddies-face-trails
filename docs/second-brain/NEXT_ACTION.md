# Single Canonical Next Action

Updated: 2026-07-29
Status: **ACTIVE — PUBLISH V44 AND COMPLETE OWNER BROWSER RETEST**

## Action

Publish the independently rendered cache-v44 gameplay-background repair, then verify all five Toxic Toby environments, arrow readability, interaction behavior, and the complete `1 → 2 → 3 → 4 → 5 → feed` chain before inserting final reveal artwork or beginning Moldy Molly.

Playable build after merge:

```text
https://cog-tech.github.io/toxic-teddies-face-trails/play/?teddy=tt01&level=1&v=44
```

## Automated evidence already passed on the PR build

- Full repository quality checks.
- Vite production browser build.
- All five Toxic Toby WebPs served with valid RIFF/WEBP signatures.
- Clean Chrome navigation through the loading-screen handoff.
- Neutral backdrop resolved to an absolute URL and returned HTTP 200.
- Computed `.game-view` background contains `neutral.webp`.
- The gameplay view reports `data-gameplay-backdrop-status="loaded"`.
- All 122 Neutral paths render over the background.
- Mobile 430×764 and desktop 1365×768 gameplay screenshots visibly show the radioactive laboratory perimeter, quiet central panel, and arrow-face puzzle.
- No runtime exceptions or gameplay-background console errors.

## Required owner retest sequence

1. Close every old Toxic Teddies tab.
2. Open the cache-busted v44 link in a new private/incognito tab.
3. Confirm the complete radioactive-laboratory loading image appears and hands off to gameplay.
4. Confirm Neutral displays `neutral.webp` behind the arrows, with pipes, slime, machinery, warning stripes, and barrels visible around the perimeter.
5. Confirm the quiet central panel aligns behind the Teddy face and every arrow remains readable and clickable.
6. Remove at least one valid trail and confirm head-first removal still works.
7. Complete Neutral and confirm Evil Grin loads with `evil-grin.webp`.
8. Complete Evil Grin and confirm Gross loads with `gross.webp`.
9. Complete Gross and confirm Angry loads with `angry.webp`.
10. Complete Angry and confirm Maniacal Laugh loads with `maniacal-laugh.webp`.
11. Complete Maniacal Laugh and confirm Toxic Toby becomes `5 / 5` complete.
12. Open Toxic Toby's private feed and confirm it remains readable and unlocked.
13. Refresh and confirm backgrounds, progress, completion state, and feed access persist.
14. Turn on High Contrast and confirm the decorative background is removed while the puzzle remains clear.

## Evidence needed from the published build

- One Neutral screenshot proving the deployed v44 environment is visible behind the arrows.
- A screenshot for any expression whose background is incorrect.
- Exact text and screenshot for any loading, interaction, progression, or persistence failure.
- Device/browser and whether the page was opened in a new private tab.

## Visual behavior to verify

- Each expression uses its matching owner-approved environment.
- The environment fills the portrait gameplay canvas rather than the old square board.
- The central quiet panel sits behind the arrow face.
- Pipes, slime, vats, sparks, barrels, warning stripes, and lighting remain peripheral.
- The face puzzle remains the first visual focus.
- Dark, cream, green, rust, pink, and yellow trails remain distinguishable.
- Controls stay outside important face regions and exit lanes.
- No duplicate square backdrop appears.
- High Contrast restores a strong solid board surface.

## Progression behavior to verify

- The completion destination is captured when the expression is cleared.
- The next button opens the exact next playable manifest entry.
- The app does not silently reload the same expression.
- Double taps are ignored while navigation is running.
- A failed next-level load keeps the completion modal open and exposes a retry action.
- Completion remains saved if the next screen fails to open.

## Do not start yet

- Do not begin Moldy Molly levels.
- Do not replace the stable path interaction system.
- Do not mark physical iPhone or Android testing complete without device evidence.
- Do not generate substitute reveal artwork.
- Do not add currencies, shops, ratings, or unrelated achievement systems.

## After this action passes

1. Mark F-013 and the gameplay-background visual gate verified on the published build.
2. Mark issue #29 verified after the complete progression chain passes.
3. Insert the five owner-approved Toxic Toby reveal images when supplied.
4. Review reveal crop and readability on target phone sizes.
5. Complete physical Android and iPhone validation.
6. Only then start Moldy Molly's complete five-expression package.

## Replacement rule

This file contains exactly one active next action. It may be replaced only when the action is completed, blocked with documented evidence, or explicitly reprioritized by the owner.
