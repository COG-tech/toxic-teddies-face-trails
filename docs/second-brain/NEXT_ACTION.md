# Single Canonical Next Action

Updated: 2026-10-10
Status: **ACTIVE — REVIEW AND VERIFY THE V54 TOBY FIX CANDIDATE**

## Action

Finish independent review and browser/phone verification of the v54 draft Toby correction before requesting merge or deployment approval. The owner's 2026-10-10 instruction to fix the unfinished Toby slice reprioritizes the unresolved v53 shape gate. It does not approve final artwork, other Teddies, merge, deployment, paid Actions or workflows.

Baseline: `b03905019be3062042c61bef8beaf8f41d2dcd5f`. Candidate compiler: `toxic-toby-teddy-v3`; level version `3`; content `tt01-teddy-2026.10.10.1`.

## Candidate verification gate

1. Review code-derived before/after geometry previews for attached round ears, fuller cheeks, stronger muzzle/nose and short rounded chin. These diagrams are not browser screenshots.
2. Run `npm ci`, `npm run prepare:build`, `npm run check`, and `npm run build` on the exact candidate.
3. Independently review all five expressions and the duplicate-startup-load fix.
4. In an authorized browser environment, serve the production bundle and inspect actual phone/desktop screenshots. At 430×764 require ≥86% gameplay width and ≥72% height; at 1365×768 require ≥28% width and ≥82% height. No clipping or non-uniform scaling is allowed.
5. Remove ten valid arrows, resize and rotate; scale, center, aspect ratio and full-level viewBox must remain fixed within each expression.
6. Play `1 → 2 → 3 → 4 → 5 → feed`, repeat Next taps, interrupt/reload, test a failed-load retry, and confirm completion/feed-view persistence.
7. Obtain the owner's real-phone confirmation that Toby is immediately recognizable and all five expressions remain distinct.

## Current limitations

DOM regression tests simulate SVG bounds and animation. They establish runtime state behavior, not rendered fit, physical touch targets, accessibility or native lifecycle. Local Chromium startup is blocked by Unix-socket restrictions. The supported cloud browser also returned `ERR_CONNECTION_REFUSED` for the temporary local candidate server; no accessible candidate preview route was established. Physical iPhone/Android and owner visual evidence remain pending. No merge or deployment has occurred.

## Do not start yet

- Do not begin Moldy Molly or the other eleven Teddies.
- Do not insert or generate final reveal artwork.
- Do not restore raster gameplay backgrounds, stretch the SVG, or remeasure fit from only remaining arrows.
- Do not waive browser, owner or device gates based on the solver or simulated DOM alone.

## Completion rule

The candidate gate closes only after independent checks, authorized browser evidence and owner real-phone visual approval. Merge and deployment need separate approval; the existing public v53 route does not show this draft.

## Replacement rule

This file contains exactly one active next action. It may be replaced only when completed, blocked with documented evidence, or explicitly reprioritized by the owner.
