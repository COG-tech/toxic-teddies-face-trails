# Single Canonical Next Action

Updated: 2026-08-03
Status: **ACTIVE — VERIFY THE PUBLISHED V51 TALLER TEDDY FIT AND LOCKED IN-GAME SCALE**

## Action

Publish and test v51 on a real phone and desktop browser. The visible HUD is now much smaller, the portrait board uses nearly the full available screen length, and the engine locks the full Teddy bounds when the level first renders so removing arrows can never make the remaining face shrink or zoom.

Playable owner-review route after merge:

```text
https://cog-tech.github.io/toxic-teddies-face-trails/play/?teddy=tt01&level=1&v=51
```

## V51 owner verification gate

1. Close every old Toxic Teddies browser tab.
2. Open the cache-busted v51 route in a new private/incognito tab.
3. Confirm the visible back, trails, hint, and restart circles are substantially smaller.
4. Confirm their invisible touch areas remain at least 44 CSS pixels.
5. Confirm `Level 1` and progress are tiny overlays rather than a header.
6. Confirm the Teddy maze uses nearly the complete portrait length below the thin HUD.
7. Confirm the face is taller and remains the dominant screen object.
8. Remove at least ten valid arrows and confirm the Teddy never becomes smaller, zooms, jumps, or recenters around the remaining arrows.
9. Confirm the same original full-level viewBox remains active throughout the expression.
10. Change expressions and confirm the engine calculates one new full-level fit for the new puzzle.
11. Rotate or resize and confirm the same locked full-level fit is reapplied without using only the remaining arrows.
12. Confirm no ear, chin path, arrowhead, face-critical feature, or exit lane is clipped.
13. Confirm selection, blockers, head-first removal, saves, progression, and reveal logic still work.

## Locked v51 implementation

- The board shell begins approximately 30–32 pixels below the top edge and extends to the bottom of the gameplay frame.
- The compiled square Teddy presentation is mapped vertically across the portrait board so the face uses the available screen length.
- The engine captures the complete rendered path bounds once per newly rendered expression.
- The resulting viewBox and initial path count are locked for the whole expression.
- Normal arrow removal is not observed by the fitting engine and cannot trigger a new fit.
- A new fit occurs only when the compiled renderer resets the board viewBox for a newly rendered puzzle.
- Resize, orientation, and page restoration reapply the locked viewBox rather than measuring the reduced set of remaining paths.
- Visible HUD circles are 28 pixels inside 44-pixel accessible targets.
- Browser and service-worker presentation cache advances to v51.
- Background crop, startup handoff, puzzle content, coordinates, input mapping, blockers, removal, saves, progression, and reveals remain unchanged.

## Do not start yet

- Do not begin Moldy Molly.
- Do not insert final reveal artwork.
- Do not restore large menu cards.
- Do not recalculate the puzzle bounds after an arrow is removed.
- Do not reduce the Teddy to preserve more laboratory artwork.
- Do not approve the layout without removing multiple arrows and confirming that scale remains fixed.

## Completion rule

The v51 gate is complete only after the owner confirms that the face uses the portrait length, the visible HUD is small, and the Teddy stays exactly the same size throughout normal arrow removal.

## Replacement rule

This file contains exactly one active next action. It may be replaced only when the action is completed, blocked with documented evidence, or explicitly reprioritized by the owner.
