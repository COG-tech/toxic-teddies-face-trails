# Single Canonical Next Action

Updated: 2026-08-02
Status: **ACTIVE — OWNER VERIFY THE PUBLISHED V47 INTRO, THEN RESUME GAMEPLAY-FIRST MOBILE IMPLEMENTATION**

## Action

Open the published cache-busted v47 build on a real phone and verify the newly approved full-screen intro. After the intro gate is confirmed, continue the already locked gameplay-first mobile composition work: remove the oversized persistent menu cards, compress the remaining controls, crop the laboratory background when necessary, and maximize the actual rendered Toxic Toby arrows without clipping.

Playable owner-review route:

```text
https://cog-tech.github.io/toxic-teddies-face-trails/play/?teddy=tt01&level=1&v=47
```

## V47 intro verification gate

1. Close every old Toxic Teddies browser tab.
2. Open the cache-busted v47 route in a new private/incognito tab.
3. Confirm the approved intro artwork fills the complete mobile game frame.
4. Confirm the illustrated loading trough begins dark, empty, and colorless.
5. Confirm no static `LOADING` word appears in the artwork or trough.
6. Confirm only the runtime green progress fill adds color as it moves left to right.
7. Confirm the progress reaches 100 percent and then hands off to the app.
8. Confirm the `ENTER THE LAB` plate remains part of the intro artwork and is not presented as a second loading control.
9. Confirm no broken-image icon, alt text, white gap, stretched artwork, or clipped title appears.
10. Confirm the existing home logo and gameplay behavior remain unchanged.

## Locked gameplay-first implementation target after the intro gate

- Keep the gameplay viewport portrait-first and full-width on phones.
- Target actual rendered path bounds of approximately **90–94% of usable gameplay width**.
- Target actual rendered path bounds of at least **52% of usable portrait gameplay height** when the Toxic Toby silhouette permits it.
- Keep every ear, chin path, arrowhead, and exit lane inside the gameplay canvas.
- Keep the top header compact, with title and utility controls in one short row.
- Compress progress and feedback into a short row or overlay instead of a large separate card stack.
- Compress the bottom accessibility trigger and five expression controls into one compact control region.
- Keep combined persistent top, status, and bottom chrome at or below approximately **24% of usable gameplay height**.
- Retain accessible 44 CSS-pixel touch targets through visible or invisible hit areas.
- Allow the owner-approved environment to be center-cropped or trimmed at the top, bottom, or sides.
- Never stretch the environment.
- Preserve the quiet central board panel and enough perimeter machinery to retain the Toxic Toby laboratory identity.
- Preserve all compiled path coordinates, viewBox data, input geometry, blocker calculations, head-first removal, save state, progression, and reveal logic.

## Do not start yet

- Do not begin Moldy Molly.
- Do not insert final reveal artwork.
- Do not alter compiled level geometry merely to gain screen size.
- Do not weaken rendered-path or no-clipping audits.
- Do not restore the old intro artwork or a permanently colored loading trough.
- Do not keep large decorative gameplay menu cards because they show more branding.
- Do not prioritize full background visibility over arrow gameplay.

## Completion rule

The v47 intro gate is complete only after the owner confirms the published phone result. The gameplay-first composition gate remains separate and incomplete until the compressed-menu layout is implemented, measured, published, and approved.

## Replacement rule

This file contains exactly one active next action. It may be replaced only when the action is completed, blocked with documented evidence, or explicitly reprioritized by the owner.
