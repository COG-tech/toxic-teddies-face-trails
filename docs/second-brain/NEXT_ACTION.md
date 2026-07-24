# Single Canonical Next Action

Updated: 2026-07-24
Status: **ACTIVE — OWNER BROWSER VISUAL AND PROGRESSION RETEST REQUIRED**

## Action

Verify the canonical dark Toxic Teddies interface, animated startup screen and repaired Toxic Toby completion chain before inserting final reveal artwork or beginning Moldy Molly.

Playable build after this alignment is merged and published:

```text
https://cog-tech.github.io/toxic-teddies-face-trails/play/?v=8
```

## Required retest sequence

1. Close every old game tab and open the `?v=8` build in a new tab.
2. Confirm the approved radioactive-laboratory loading artwork appears and the toxic bar animates.
3. Confirm the loading screen hands off cleanly to the home screen.
4. Confirm the home background is dark Grime 900 rather than cream.
5. Confirm Teddy cards use dark distressed surfaces, parchment text and toxic/slime accents.
6. Confirm Coming Soon cards are clearly disabled but still readable.
7. Open Toxic Toby and confirm the surrounding game chrome is dark while the puzzle board remains readable parchment.
8. Complete Neutral and confirm Evil Grin loads.
9. Complete Evil Grin and confirm Gross loads. This is the previous failure point.
10. Complete Gross and confirm Angry loads.
11. Complete Angry and confirm Maniacal Laugh loads.
12. Complete Maniacal Laugh and confirm Toxic Toby is shown as `5 / 5` complete.
13. Open Toxic Toby's private feed and confirm the feed uses the same dark design system.
14. Return home and confirm the feed remains available.
15. Refresh the page and confirm loading, completion and feed states remain correct.
16. Press **Next Expression** only once at each modal and confirm no duplicate or skipped level occurs.

## Evidence needed

- One phone screenshot of the loading screen.
- One phone screenshot of the dark home collection.
- One phone screenshot of a gameplay screen.
- One phone screenshot of the private Toxic Feed.
- Screenshots or recording showing `1 → 2`, `2 → 3`, `3 → 4`, `4 → 5`, and `5 → feed`.
- Exact text and screenshot for any failure.
- Phone/browser model and whether the page was opened fresh or from an existing tab.

## Visual behavior to verify

- Grime 900 / Ink 900 dominate the app shell.
- Toxic Green and Slime Green identify active and completed states.
- Patch Purple identifies secondary actions.
- Parchment is used for readable text, puzzle and modal surfaces—not the entire page.
- The home, game, feed and loading screen feel like one product.
- Text remains readable and Coming Soon content remains honest.
- The face puzzle remains the dominant game-screen object.

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
- Do not mark physical iPhone or Android testing complete.
- Do not generate substitute reveal artwork.
- Do not add unrelated design-board concepts such as currencies, shops, ratings or achievements.

## After this action passes

1. Mark issue #29 verified and close it.
2. Mark loading-screen and runtime-palette review complete.
3. Insert the five owner-approved Toxic Toby reveal images when supplied.
4. Review reveal crop and readability on target phone sizes.
5. Complete physical Android and iPhone validation.
6. Only then start Moldy Molly's complete five-expression package.

## Replacement rule

This file contains exactly one active next action. It may be replaced only when the action is completed, blocked with documented evidence, or explicitly reprioritized by the owner.
