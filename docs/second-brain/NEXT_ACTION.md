# Single Canonical Next Action

Updated: 2026-08-02
Status: **ACTIVE — VERIFY THE PUBLISHED V49 ENGINE-FITTED MOBILE MAZE**

## Action

Publish and test the v49 gameplay engine fit on a real phone. The phone view now uses the full dynamic viewport rather than shrinking into a strict 9:16 box, and the engine measures each rendered Teddy path group to calculate its own centered SVG viewBox instead of relying on a fixed overscan percentage.

Playable owner-review route after merge:

```text
https://cog-tech.github.io/toxic-teddies-face-trails/play/?teddy=tt01&level=1&v=49
```

## Automated v49 evidence

The successful production-browser audit at 430×764 measured:

- gameplay width: 430 pixels, full viewport width;
- board width: 430 pixels;
- rendered Neutral puzzle width: 404.95 pixels;
- rendered puzzle width ratio: **94.17%** of gameplay width;
- rendered puzzle height ratio: **53.00%** of gameplay height;
- rendered puzzle-to-board ratio: **94.17%**;
- path count: 122;
- all rendered puzzle bounds inside the gameplay canvas;
- background size: `cover`;
- no runtime exceptions or gameplay-background console errors.

## V49 owner verification gate

1. Close every old Toxic Teddies browser tab.
2. Open the cache-busted v49 route in a new private/incognito tab.
3. Confirm there are no wide black side gutters around the gameplay frame.
4. Confirm the maze comes close to both side edges while retaining a narrow safety margin.
5. Confirm `Level 1` remains a small secondary label.
6. Confirm there is no large top title card, progress card, instruction strip, bottom arrow-trails bar, or expression tray.
7. Confirm only compact 44-pixel floating controls remain.
8. Confirm the laboratory background is cropped rather than stretched.
9. Confirm no ear, chin path, arrowhead, face-critical feature, or exit lane is clipped or covered.
10. Remove several valid trails and confirm the puzzle does not zoom or jump after each removal.
11. Rotate or resize the phone view and confirm the engine refits the puzzle cleanly.
12. Confirm selection, blockers, head-first removal, saves, and progression still work.

## Locked v49 implementation

- Full dynamic phone viewport width and height.
- Engine-measured puzzle bounds using `getBBox`, including stroke and markers where supported.
- A centered per-expression SVG viewBox targeting approximately 94% visual fill.
- The same viewBox applied to puzzle and preview layers.
- Refit after level rendering, board resize, orientation change, and page restoration.
- No refit caused by normal path-state changes during play.
- Compact floating controls and visually hidden persistent instruction copy.
- Background uses `cover`; stretching is forbidden.
- Compiled coordinates, puzzle content, hit testing, blocker calculations, trail removal, saves, progression, and reveal logic remain unchanged.

## Do not start yet

- Do not begin Moldy Molly.
- Do not insert final reveal artwork.
- Do not restore the removed menu cards.
- Do not reduce the maze to show more background.
- Do not return to a fixed overscan percentage as the primary fitting system.
- Do not approve the layout without a real-phone screenshot and no-clipping interaction check.

## Completion rule

The v49 engine-fit gate is complete only after the owner approves the published phone result and confirms that the maze uses the available width without clipping, jumping, or broken interaction.

## Replacement rule

This file contains exactly one active next action. It may be replaced only when the action is completed, blocked with documented evidence, or explicitly reprioritized by the owner.
