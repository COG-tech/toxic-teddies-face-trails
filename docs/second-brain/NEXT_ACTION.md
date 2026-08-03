# Single Canonical Next Action

Updated: 2026-08-03
Status: **ACTIVE — VERIFY THE PUBLISHED V53 PORTRAIT-NATIVE TEDDY GEOMETRY**

## Action

Publish and test v53 on a real phone and desktop browser. The adaptive full-viewport canvas and generated laboratory frame remain in place, but the old square Toxic Toby geometry has now been replaced by newly authored portrait-native levels. The new face uses a taller rectangular cell grid and preserves square cells, orthogonal paths, solver rules, and uniform SVG scaling.

Playable owner-review route after merge:

```text
https://cog-tech.github.io/toxic-teddies-face-trails/play/?teddy=tt01&level=1&v=53
```

## V53 owner verification gate

1. Close every old Toxic Teddies browser tab.
2. Open the cache-busted v53 route in a new private/incognito tab.
3. Confirm Toxic Toby is immediately recognizable as a Teddy face.
4. Confirm the face is visibly taller than v52 and uses substantially more of the phone's safe portrait height.
5. Confirm the ears remain round, the eyes remain balanced, the muzzle remains horizontal, and the chin extends lower without appearing stretched.
6. Confirm there is materially less empty space above and below the face.
7. Confirm the puzzle remains uniformly scaled with no vertical or horizontal distortion.
8. Confirm no fixed raster gameplay background appears; the generated laboratory frame must adapt independently.
9. Confirm the visible controls remain tiny while each control keeps a 44 CSS-pixel touch target.
10. Remove at least ten valid arrows and confirm the Teddy never shrinks, zooms, jumps, or recenters.
11. Resize or rotate and confirm the locked full-level fit is reapplied without distortion.
12. Confirm no ear, chin path, arrowhead, face-critical feature, or exit lane is clipped.
13. Confirm selection, blockers, head-first removal, save migration, progression, and reveal logic still work.

## Locked v53 implementation

- All five Toxic Toby expressions are generated from portrait-native rectangular grids.
- Level 1 uses an 87×57 grid; Levels 2–5 increase to 89×59, 91×61, 93×63, and 95×65.
- Cells remain square. The face is taller because its coordinates are newly authored, not because the SVG is stretched.
- Ears, inner ears, eyes, patch, muzzle, nose, mouth, cheeks, and chin are proportioned independently for the taller grid.
- The authored rendered-path aspect ratio must remain between approximately 1.42 and 1.65.
- Compiler version is `toxic-toby-portrait-v2` and level version is `2`.
- Old unfinished sessions are invalidated safely through the level-version change.
- The deterministic reverse-construction head-ray solver remains mandatory.
- The full-level viewBox remains locked during arrow removal.
- The SVG continues to use `preserveAspectRatio="xMidYMid meet"`.
- The generated CSS laboratory frame remains active; raster gameplay backdrops remain retired.
- Browser and service-worker presentation cache advances to v53.

## Do not start yet

- Do not begin Moldy Molly.
- Do not insert final reveal artwork.
- Do not restore the fixed portrait background image.
- Do not use `preserveAspectRatio="none"`.
- Do not stretch the Teddy to consume portrait height.
- Do not recalculate the puzzle from the reduced set of remaining arrows.
- Do not approve the geometry from automated measurements alone; the owner must confirm the face visually on a real phone.

## Completion rule

The v53 gate is complete only after the owner confirms that the newly authored geometry is clearly a Teddy face, uses substantially more portrait height than v52, remains undistorted, and stays exactly the same size throughout normal arrow removal.

## Replacement rule

This file contains exactly one active next action. It may be replaced only when the action is completed, blocked with documented evidence, or explicitly reprioritized by the owner.
