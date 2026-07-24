# Single Canonical Next Action

Updated: 2026-07-24
Status: **ACTIVE — OWNER BROWSER VISUAL AND PROGRESSION RETEST REQUIRED**

## Action

Verify the repaired left-to-right loading bar, real static loading artwork, approved illustrated home logo, canonical dark interface and repaired Toxic Toby completion chain before inserting final reveal artwork or beginning Moldy Molly.

Playable build after this repair is merged and published:

```text
https://cog-tech.github.io/toxic-teddies-face-trails/play/?v=11
```

## Required retest sequence

1. Close every old Toxic Teddies tab.
2. Open the `?v=11` build in a new tab.
3. Confirm the full radioactive-laboratory image appears immediately—no black card and no broken-image text.
4. Confirm the illustrated bar begins near empty because the unfilled lane is visibly dark.
5. Confirm the bright toxic fill moves from left to right through the startup stages.
6. Confirm the bar visibly reaches 100 percent before the splash leaves.
7. Confirm the loading screen hands off cleanly to the home screen.
8. Confirm the home header uses the illustrated green-and-purple Toxic Teddies logo from the approved artwork, not the generic block-letter imitation.
9. Confirm the home background is dark Grime 900 rather than cream.
10. Confirm Teddy cards use dark distressed surfaces, parchment text and toxic/slime accents.
11. Confirm Coming Soon cards are clearly disabled but still readable.
12. Open Toxic Toby and confirm the surrounding game chrome is dark while the puzzle board remains readable parchment.
13. Complete Neutral and confirm Evil Grin loads.
14. Complete Evil Grin and confirm Gross loads.
15. Complete Gross and confirm Angry loads.
16. Complete Angry and confirm Maniacal Laugh loads.
17. Complete Maniacal Laugh and confirm Toxic Toby is shown as `5 / 5` complete.
18. Open Toxic Toby's private feed and confirm the feed uses the same dark design system.
19. Return home and confirm the feed remains available.
20. Refresh and confirm the real loading image, visible bar progress, completion and feed states remain correct.

## Evidence needed

- One short screen recording showing the bar begin near empty, fill left to right, reach 100 percent and hand off.
- One screenshot of the approved illustrated logo on the home screen.
- One screenshot of a gameplay screen.
- One screenshot of the private Toxic Feed.
- Screenshots or recording showing `1 → 2`, `2 → 3`, `3 → 4`, `4 → 5`, and `5 → feed`.
- Exact text and screenshot for any failure.
- Device/browser and whether the page was opened fresh or from an existing tab.

## Visual behavior to verify

- The loading artwork is a complete edge-to-edge portrait image.
- No alt text or broken-image icon is visible.
- The painted green bar has a visibly dark unfilled state.
- The runtime fill advances monotonically and visibly reaches 100 percent.
- The home display branding uses the actual approved logo artwork.
- Grime 900 / Ink 900 dominate the app shell.
- Toxic Green and Slime Green identify active and completed states.
- Patch Purple identifies secondary actions.
- Parchment is used for readable text, puzzle and modal surfaces—not the entire page.
- The home, game, feed and loading screen feel like one product.
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
2. Mark issue #34 and failures F-010/F-011/F-012 verified.
3. Mark loading-screen, home-logo and runtime-palette review complete.
4. Insert the five owner-approved Toxic Toby reveal images when supplied.
5. Review reveal crop and readability on target phone sizes.
6. Complete physical Android and iPhone validation.
7. Only then start Moldy Molly's complete five-expression package.

## Replacement rule

This file contains exactly one active next action. It may be replaced only when the action is completed, blocked with documented evidence, or explicitly reprioritized by the owner.
