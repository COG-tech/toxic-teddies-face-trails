# Single Canonical Next Action

Updated: 2026-08-03
Status: **ACTIVE — VERIFY THE PUBLISHED V50 CROPPED GAMEPLAY FRAME AND CLEAN STARTUP HANDOFF**

## Action

Publish and test v50 on a real phone and desktop browser. The laboratory artwork is now enlarged without distortion so more of the decorative side machinery and oversized lower frame are cropped away. The approved intro must remain visible until the requested gameplay route, background, rendered paths, and engine-measured fit are all ready, preventing an unfinished screen from flashing before play.

Playable owner-review route after merge:

```text
https://cog-tech.github.io/toxic-teddies-face-trails/play/?teddy=tt01&level=1&v=50
```

## V50 owner verification gate

1. Close every old Toxic Teddies browser tab.
2. Open the cache-busted v50 route in a new private/incognito tab.
3. Confirm the approved intro remains visible continuously until the finished Level 1 game is ready.
4. Confirm no home screen, blank panel, half-rendered maze, uncropped laboratory, or unstyled interface flashes between the intro and gameplay.
5. Confirm the laboratory image is enlarged proportionally and never stretched.
6. Confirm noticeably less side machinery is visible.
7. Confirm the oversized lower metal frame is substantially reduced by cropping.
8. Confirm the quiet central gameplay panel remains behind the maze.
9. Confirm the maze remains centered and close to the side edges.
10. Confirm no ear, chin path, arrowhead, face-critical feature, or exit lane is clipped.
11. Remove several valid trails and confirm the puzzle does not zoom or jump.
12. Refresh, rotate, and reopen the route to confirm the clean startup handoff repeats reliably.

## Locked v50 implementation

- Background artwork keeps its original aspect ratio.
- Background presentation is enlarged to `auto 122%`.
- Vertical background anchor is `42%`, preserving more of the useful upper gameplay region while cropping more of the lower frame.
- The engine-measured per-expression SVG viewBox remains the puzzle-fitting system.
- The intro remains over the app until the direct game route is visible, at least one rendered path exists, the gameplay backdrop reports loaded, and the puzzle fit reports fitted.
- Startup readiness has a bounded timeout and falls into the existing actionable startup-failure state if rendering never completes.
- Browser and service-worker presentation cache advances to v50.
- Compiled coordinates, puzzle content, input mapping, blocker calculations, trail removal, saves, progression, and reveal logic remain unchanged.

## Do not start yet

- Do not begin Moldy Molly.
- Do not insert final reveal artwork.
- Do not restore the removed menu cards.
- Do not stretch the laboratory background.
- Do not show an intermediate app screen while the direct gameplay route is still rendering.
- Do not approve the layout without a real-phone screenshot and no-clipping interaction check.

## Completion rule

The v50 gate is complete only after the owner confirms that the background bottom and side decoration are reduced, the maze remains safe and dominant, and nothing unfinished appears between the intro and the loaded game.

## Replacement rule

This file contains exactly one active next action. It may be replaced only when the action is completed, blocked with documented evidence, or explicitly reprioritized by the owner.
