# Single Canonical Next Action

Updated: 2026-08-02
Status: **ACTIVE — VERIFY THE PUBLISHED V48 GAMEPLAY-FIRST MOBILE LAYOUT**

## Action

Publish and test the v48 gameplay-first mobile composition on a real phone. The oversized persistent gameplay cards have been removed from the visible layout, the maze has been enlarged, the background now crops without stretching, and only compact floating controls remain.

Playable owner-review route after merge:

```text
https://cog-tech.github.io/toxic-teddies-face-trails/play/?teddy=tt01&level=1&v=48
```

## V48 owner verification gate

1. Close every old Toxic Teddies browser tab.
2. Open the cache-busted v48 route in a new private/incognito tab.
3. Confirm there is no large top title card.
4. Confirm `Level 1` is a small secondary label.
5. Confirm the large progress card and instruction strip are gone.
6. Confirm the bottom `Open arrow trails` text bar and five-expression tray are gone.
7. Confirm only compact 44-pixel floating controls remain.
8. Confirm the maze is the dominant screen object.
9. Confirm the visible Teddy paths occupy approximately 90–94% of gameplay width and at least 52% of portrait gameplay height.
10. Confirm the laboratory background is cropped rather than stretched.
11. Confirm no ear, chin path, arrowhead, face-critical feature, or exit lane is clipped or covered.
12. Remove at least one valid trail and confirm selection, blockers, and head-first removal still work.
13. Complete the `1 → 2 → 3 → 4 → 5 → feed` sequence and refresh to verify persistence.

## Locked v48 implementation

- Full-width board shell inside the 9:16 gameplay frame.
- Centered 125% SVG presentation with `inset: -12.5%`.
- Compact 44-pixel back, hint, restart, and open-trails controls.
- Tiny level and progress labels only.
- Persistent instruction copy visually hidden while live accessibility announcements remain.
- Expression controls hidden during normal play.
- Background uses `cover`; stretching is forbidden.
- Compiled coordinates, viewBox data, hit testing, blocker calculations, trail removal, saves, progression, and reveal logic remain unchanged.

## Do not start yet

- Do not begin Moldy Molly.
- Do not insert final reveal artwork.
- Do not restore the removed menu cards.
- Do not reduce the maze to show more background.
- Do not alter compiled level geometry merely to gain screen size.
- Do not approve the layout without a real-phone screenshot and no-clipping check.

## Completion rule

The gameplay-first composition gate is complete only after the owner approves the published v48 phone result and confirms that the maze dominates the screen without clipping or broken interaction.

## Replacement rule

This file contains exactly one active next action. It may be replaced only when the action is completed, blocked with documented evidence, or explicitly reprioritized by the owner.
