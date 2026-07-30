# Single Canonical Next Action

Updated: 2026-07-30
Status: **ACTIVE — OWNER V46 MOBILE SIZE AND PROGRESSION RETEST REQUIRED**

## Action

Verify the published cache-v46 build on a real phone: confirm the measured larger Toxic Toby arrow face now dominates the quiet gameplay panel, all five owner-approved backgrounds remain correct, every path remains readable and clickable, and the complete `1 → 2 → 3 → 4 → 5 → feed` chain still works before inserting final reveal artwork or beginning Moldy Molly.

Playable build after merge:

```text
https://cog-tech.github.io/toxic-teddies-face-trails/play/?teddy=tt01&level=1&v=46
```

## Locked v46 mobile scale

- Gameplay canvas remains 9:16.
- Transparent puzzle shell width is 96% of the gameplay canvas.
- Board and preview SVG layers use a centered 122% presentation with `inset: -11%`.
- The rendered Neutral Teddy face measures 87.1% of gameplay-canvas width.
- The rendered face measures 49.0% of the portrait canvas height.
- The face fills 90.7% of the transparent board width.
- The board measures 96.0% of gameplay width.
- All 122 paths remain fully inside the gameplay canvas.
- Path coordinates, viewBox, solver data, input geometry, blocker logic, removal behavior, saves, progression and reveal logic remain unchanged.

## Rejected enlargement

- A 160% SVG scale was rendered and audited before merge.
- It measured 114.2% of gameplay width and clipped the side paths.
- The audit failed and that scale was removed.
- Do not restore the 160% scale or weaken the no-clipping assertion.

## Automated evidence already passed

- Full repository quality checks.
- Vite production browser build.
- All five Toxic Toby WebPs served with valid RIFF/WEBP signatures.
- Clean Chrome navigation through the loading-screen handoff.
- Neutral backdrop resolved to an absolute URL and returned HTTP 200.
- Computed `.game-view` background contains `neutral.webp`.
- The gameplay view reports `data-gameplay-backdrop-status="loaded"`.
- All 122 Neutral paths render over the background.
- Mobile 430×764 and desktop 1365×768 screenshots show the enlarged Teddy face filling the quiet center panel.
- Measured board-width ratio is 0.960.
- Measured visible-puzzle-width ratio is 0.871.
- Measured visible-puzzle-height ratio is 0.490.
- Measured puzzle-to-board-width ratio is 0.907.
- The enlarged puzzle remains fully inside the gameplay canvas.
- No runtime exceptions or gameplay-background console errors.
- Native Android and iOS validation passed.
- Store validation, Android AAB and iOS archive checks passed.

## Required owner retest sequence

1. Close every old Toxic Teddies tab.
2. Open the cache-busted v46 link in a new private/incognito tab.
3. Confirm the loading image hands off to gameplay.
4. Confirm the arrow-face puzzle is substantially larger than the v45 phone screenshot and resembles the reference puzzle’s screen coverage.
5. Confirm no ear, chin, arrowhead or exit lane is clipped.
6. Confirm Neutral displays `neutral.webp` behind the arrows, with the laboratory frame visible around the perimeter.
7. Remove at least one valid trail and confirm selection and head-first removal still work.
8. Complete Neutral and confirm Evil Grin loads with `evil-grin.webp`.
9. Complete Evil Grin and confirm Gross loads with `gross.webp`.
10. Complete Gross and confirm Angry loads with `angry.webp`.
11. Complete Angry and confirm Maniacal Laugh loads with `maniacal-laugh.webp`.
12. Complete Maniacal Laugh and confirm Toxic Toby becomes `5 / 5` complete.
13. Open Toxic Toby's private feed and confirm it remains readable and unlocked.
14. Refresh and confirm backgrounds, progress, completion state and feed access persist.
15. Turn on High Contrast and confirm the decorative background is removed while the enlarged puzzle remains clear.

## Evidence needed from the published build

- One phone screenshot proving the deployed v46 puzzle size.
- One screenshot for any expression whose background or puzzle scale is incorrect.
- Exact text and screenshot for any loading, clipping, interaction, progression or persistence failure.
- Device/browser and whether the page was opened in a new private tab.

## Visual behavior to verify

- The Teddy face is the dominant screen object.
- The face remains centered and immediately recognizable.
- The puzzle fills most of the quiet central panel without overlapping important outer-frame detail.
- Every arrowhead remains readable at normal phone size.
- Controls stay outside important face regions and exit lanes.
- Each expression uses its matching owner-approved environment.
- No duplicate square backdrop appears.
- High Contrast restores a strong solid board surface.

## Do not start yet

- Do not begin Moldy Molly levels.
- Do not replace the stable path interaction system.
- Do not alter compiled level geometry merely to change screen size.
- Do not mark physical iPhone or Android testing complete without device evidence.
- Do not generate substitute reveal artwork.
- Do not add currencies, shops, ratings or unrelated achievement systems.

## After this action passes

1. Mark the v46 mobile-size gate verified on the published build.
2. Mark F-013 and F-014 verified.
3. Mark issue #29 verified after the complete progression chain passes.
4. Insert the five owner-approved Toxic Toby reveal images when supplied.
5. Review reveal crop and readability on target phone sizes.
6. Complete remaining physical-device accessibility and lifecycle validation.
7. Only then start Moldy Molly's complete five-expression package.

## Replacement rule

This file contains exactly one active next action. It may be replaced only when the action is completed, blocked with documented evidence, or explicitly reprioritized by the owner.
