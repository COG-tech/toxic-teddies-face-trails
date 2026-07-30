# Single Canonical Next Action

Updated: 2026-07-30
Status: **ACTIVE — IMPLEMENT GAMEPLAY-FIRST MOBILE COMPOSITION BEFORE FURTHER OWNER RETEST**

## Action

Replace the current v46 mobile presentation with a gameplay-first layout that maximizes the actual rendered Toxic Toby arrow paths, compresses the persistent top and bottom menus, and crops the environment when necessary instead of shrinking the puzzle.

This owner directive supersedes the prior instruction to stop at the v46 layout.

## Locked implementation target

- Keep the gameplay viewport portrait-first and full-width on phones.
- Target actual rendered path bounds of approximately **90–94% of usable gameplay width**.
- Target actual rendered path bounds of at least **52% of usable portrait gameplay height** when the Toxic Toby silhouette permits it.
- Keep every ear, chin path, arrowhead, and exit lane inside the gameplay canvas.
- Keep the top header compact, with title and utility controls in one short row.
- Compress progress and feedback into a short row or overlay instead of a large separate card stack.
- Compress the bottom accessibility trigger and five expression controls into one compact control region.
- Keep the combined persistent top, status, and bottom chrome at or below approximately **24% of usable gameplay height**.
- Retain accessible 44 CSS-pixel touch targets through visible or invisible hit areas.
- Allow the owner-approved environment to be center-cropped or trimmed at the top, bottom, or sides.
- Never stretch the environment.
- Preserve the calm central board panel and enough perimeter machinery to retain the Toxic Toby laboratory identity.
- Preserve all compiled path coordinates, viewBox data, input geometry, blocker calculations, head-first removal, save state, progression, and reveal logic.

## Required engineering sequence

1. Create a dedicated gameplay-layout branch from current `main`.
2. Measure the current production mobile layout as the baseline.
3. Compress the top header, progress/feedback area, and bottom controls without removing required actions.
4. Change background sizing/positioning to crop decorative frame art when needed.
5. Increase the rendered puzzle scale only as far as the no-clipping gate permits.
6. Keep the accessibility move list opt-in rather than persistently expanded.
7. Build the real Vite production bundle.
8. Serve the production bundle locally.
9. Capture clean Chrome screenshots at 430×764 and at least one taller real-phone-like viewport.
10. Measure actual rendered path bounds with `getBBox()` and `getScreenCTM()`.
11. Fail the audit if the puzzle is below the locked size target, if any path is clipped, or if persistent chrome exceeds the locked height budget.
12. Verify `neutral.webp` loads with HTTP 200 and remains visible around the puzzle.
13. Verify all 122 Neutral paths render and at least one valid path can still be removed.
14. Run full quality, browser, native Android/iOS, and store validation before merge.
15. Inspect the screenshots manually before merge.

## Automated acceptance gates

- Actual visible path width ratio: target `0.90–0.94` of gameplay width.
- Actual visible path height ratio: minimum `0.52` of gameplay height when the silhouette permits it.
- All rendered paths inside gameplay bounds.
- Persistent top/status/bottom chrome height ratio: maximum approximately `0.24` of gameplay height.
- Background image successfully loaded and computed on the visible game view.
- Background is cropped without distortion when needed.
- Quiet central panel remains behind the arrow puzzle.
- No duplicate square backdrop appears.
- No runtime exceptions or gameplay-background errors.
- Pointer selection, blocker feedback, and head-first removal remain functional.

## Owner retest after implementation

1. Close all old game tabs.
2. Open the new cache-busted build on a real phone.
3. Confirm the arrows are the dominant screen object.
4. Confirm the puzzle is substantially larger than the phone screenshot supplied on 2026-07-30.
5. Confirm the top and bottom menus are compact.
6. Confirm background cropping does not remove the Toxic Toby laboratory identity.
7. Confirm no arrowhead or exit lane is clipped.
8. Remove at least one valid trail.
9. Complete the full `1 → 2 → 3 → 4 → 5 → feed` chain.
10. Refresh and verify persistence.

## Do not start yet

- Do not begin Moldy Molly.
- Do not insert final reveal artwork.
- Do not alter compiled level geometry merely to gain screen size.
- Do not weaken the rendered-path or no-clipping audits.
- Do not keep large decorative menu cards because they show more branding.
- Do not prioritize full background visibility over arrow gameplay.

## After this action passes

1. Lock the approved mobile chrome dimensions and rendered puzzle ratios.
2. Mark the gameplay-first composition gate verified.
3. Mark F-014 verified only after the owner approves the published real-phone layout.
4. Complete the progression-chain owner verification.
5. Insert the five owner-approved Toxic Toby reveal images when supplied.
6. Complete remaining physical-device accessibility and lifecycle validation.
7. Only then begin Moldy Molly's complete five-expression package.

## Replacement rule

This file contains exactly one active next action. It may be replaced only when the action is completed, blocked with documented evidence, or explicitly reprioritized by the owner.
