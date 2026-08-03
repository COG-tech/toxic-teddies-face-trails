# Single Canonical Next Action

Updated: 2026-08-03
Status: **ACTIVE — VERIFY THE PUBLISHED V52 ADAPTIVE CANVAS AND UNDISTORTED TEDDY**

## Action

Publish and test v52 on a real phone and desktop browser. The fixed portrait gameplay artwork has been retired. Gameplay now uses a full-viewport adaptive canvas with a generated laboratory frame, while the SVG engine preserves the Teddy's original proportions and locks the complete full-level viewBox for the whole expression.

Playable owner-review route after merge:

```text
https://cog-tech.github.io/toxic-teddies-face-trails/play/?teddy=tt01&level=1&v=52
```

## V52 owner verification gate

1. Close every old Toxic Teddies browser tab.
2. Open the cache-busted v52 route in a new private/incognito tab.
3. Confirm the gameplay canvas expands to the complete available browser viewport instead of remaining inside a narrow 9:16 picture.
4. Confirm no raster laboratory backdrop appears or loads behind the puzzle.
5. Confirm the generated background adapts cleanly to phone, tablet, desktop, and rotated dimensions.
6. Confirm the Teddy face keeps its natural proportions and is not vertically or horizontally stretched.
7. Confirm the complete Teddy remains immediately recognizable.
8. Confirm the puzzle uses the largest possible uniform scale permitted by the current viewport.
9. Confirm the visible controls remain tiny while each control keeps a 44 CSS-pixel touch target.
10. Remove at least ten valid arrows and confirm the Teddy never shrinks, zooms, jumps, or recenters.
11. Resize or rotate and confirm the locked full-level fit is reapplied without distortion.
12. Confirm no ear, chin path, arrowhead, face-critical feature, or exit lane is clipped.
13. Confirm selection, blockers, head-first removal, saves, progression, and reveal logic still work.

## Locked v52 implementation

- The gameplay canvas follows the full dynamic viewport instead of a fixed 9:16 card.
- The former expression-specific WebP gameplay backdrops are no longer active runtime content.
- The laboratory environment is generated from responsive CSS surfaces, narrow rails, grime, glow, and a thin hazard lip.
- The SVG uses `preserveAspectRatio="xMidYMid meet"`.
- Non-uniform SVG scaling is forbidden.
- The engine captures the complete rendered Teddy bounds once for a newly rendered expression.
- The original full-level viewBox remains locked during normal arrow removal.
- The puzzle scales uniformly to the largest safe size supported by each viewport.
- The generated frame reports startup-ready without waiting for a raster backdrop download.
- Browser and service-worker presentation cache advances to v52.
- Puzzle content, compiled coordinates, input mapping, blockers, removal, saves, progression, and reveal logic remain unchanged.

## Do not start yet

- Do not begin Moldy Molly.
- Do not insert final reveal artwork.
- Do not restore the fixed portrait background image.
- Do not use `preserveAspectRatio="none"`.
- Do not stretch the Teddy to consume empty portrait height.
- Do not recalculate the puzzle from the reduced set of remaining arrows.
- Do not approve the layout without phone and desktop screenshots showing a recognizable undistorted face.

## Completion rule

The v52 gate is complete only after the owner confirms that the adaptive canvas fills the available screen, the generated environment replaces the fixed picture, the Teddy remains recognizable and undistorted, and its size remains fixed throughout normal gameplay.

## Replacement rule

This file contains exactly one active next action. It may be replaced only when the action is completed, blocked with documented evidence, or explicitly reprioritized by the owner.
