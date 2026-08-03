# Locked Decisions

A locked decision cannot be changed silently. A change requires explicit owner approval, a new decision entry, migration impact, test impact, and rollback plan.

## D-001 — Brand promise

**The face is the puzzle.** Every playable level must visibly belong to the actual Teddy, not a generic puzzle wearing a theme.

## D-002 — Native product architecture

The production target is an installed iOS and Android app using Capacitor. GitHub Pages is a prototype/demo surface only. Production must bundle local content and must not depend on a remote `server.url`.

## D-003 — Deterministic level pipeline

Levels are precompiled and solver-verified. Runtime random generation is forbidden. Invalid geometry, duplicate paths, overlaps, disconnected paths, self-intersections, or unsolved level orders must fail validation.

## D-004 — Preserve proven interactions

The verified click/tap selection, screen-space hit testing, blocked-path feedback, head-first removal, exact save recovery, and expression progression must not be replaced casually. Changes require focused regression tests and browser/native validation.

## D-005 — Honest content states

Only a Teddy with complete approved levels and content may be playable. Never load Toxic Toby as a hidden fallback for an unfinished Teddy. Unfinished characters remain **COMING SOON**.

## D-006 — Founding 12 and expression order

The Founding 12 names and IDs are fixed. Every Teddy uses five expression positions in this order:

1. Neutral
2. Evil Grin
3. Gross
4. Angry
5. Maniacal Laugh

## D-007 — Artwork control

No final character artwork may be generated, redrawn, substituted, restyled, moved, or approved without the owner. Placeholder UI may be built while artwork is pending, but it must be clearly non-final and easy to replace.

## D-008 — Toxic Feed scope

The Toxic Feed is fictional authored in-app content. It has no public profiles, stranger messaging, user posting, user uploads, or real social-network dependency. A Teddy's feed unlocks only after all five expressions are completed.

## D-009 — Save truthfulness

Completion, feed unlocks, viewed posts, and exact unfinished path state must persist. A restart or direct URL must never grant completion or bypass an unlock.

## D-010 — Evidence standard

Automated tests prove repository behavior only. Physical-device, accessibility, participant-research, artwork-approval, signing, and store-upload work stays marked pending until real evidence exists.

## D-011 — Visual style

Toxic Teddies remains unified hand-illustrated 2D grotesque cartoon art. Do not drift into photorealistic, 3D, CGI, clay, plastic-toy photography, infographic, random poster, contact-sheet, card-system, or coloring-page-grid directions.

## D-012 — Canonical production control

Use one controlled production pipeline and one canonical status record. Do not create competing trackers, duplicate manifests, duplicate character files, or alternate sources of truth.

## D-013 — Canonical app design system

The owner-supplied **Toxic Teddies Design System 1.0.0, July 2026** is the canonical visual and component standard. Its recorded colors, typography, spacing scale, responsive grid, buttons, forms, cards, navigation, alerts, badges, completion-modal direction and accessibility requirements may not be silently replaced by a different design system.

The design board defines visual and component concepts. It does not by itself prove that star ratings, completion times, achievements, difficulty selectors, profile forms, collection screens or other shown concepts are implemented. Those require separate approval, development and testing.

## D-014 — Canonical opening/loading screen

The owner-approved Toxic Teddies Arrow Escape artwork with Toxic Toby in the radioactive laboratory is the canonical startup image. It must be used as the branded opening layer for browser and native bundles unless the owner explicitly approves a replacement.

The opening layer must:

- remain local and offline-capable;
- cover the unfinished interface during startup;
- animate the toxic loading bar without altering the approved artwork;
- report real startup progress rather than a fake indefinite delay;
- support reduced motion;
- disappear only after the home/game shell is ready;
- yield to the actionable startup-error screen when integrity or initialization fails.

## D-015 — Gameplay-first mobile hierarchy

The arrow puzzle is the product. On portrait gameplay screens, the actual rendered arrow paths must receive the largest safe area before decorative background art or persistent interface chrome.

The locked mobile rules are:

- Target actual rendered path bounds of approximately **88–94% of the usable gameplay width** and at least **52% of the portrait gameplay height** when the Teddy silhouette permits it.
- The top header, progress/feedback area, and bottom persistent controls together should consume no more than approximately **24% of usable gameplay height** during normal play.
- The owner-approved environment may be center-cropped or trimmed at the top, bottom, or sides to protect puzzle size. It must never be stretched or distorted.
- Decorative perimeter art may be sacrificed before the arrow puzzle is reduced. Preserve the quiet central panel and enough outer machinery to retain the Teddy's environment identity.
- Top and bottom controls must be compressed into compact rows or edge overlays. They may overlap decorative outer-frame regions, but never cover an arrow path, arrowhead, face-critical feature, or exit lane.
- Compact visual controls must retain accessible touch targets of at least 44 CSS pixels through their visible or invisible hit area.
- The accessibility move list remains opt-in and must not occupy a large persistent gameplay panel.
- Scale and layout approval must use actual rendered path bounds from `getBBox()` plus `getScreenCTM()`, a no-clipping assertion, and inspected production-browser screenshots at phone size.

A layout that shows more background but makes the arrow puzzle materially smaller is a failed layout.

## D-016 — Approved full-screen v47 intro composition

The owner-approved portrait intro created on 2026-08-02 is the canonical mobile opening composition for the current release. It replaces the previous opening artwork while preserving the existing startup lifecycle and home logo.

The locked intro rules are:

- The artwork fills the complete portrait mobile game frame without a separate browser-style card, white margin, or stretched aspect ratio.
- The illustrated loading trough begins dark, empty, and colorless.
- The static artwork must not contain the word `LOADING` inside or above the trough.
- The only green color inside the loading trough comes from the real runtime progress fill moving left to right.
- The runtime fill remains tied to actual startup stages, moves monotonically, reaches visible completion, and then hands off to the app.
- The `ENTER THE LAB` plate remains part of the artwork; it is not a second loading bar and must not be treated as a required tap during startup.
- The approved home-logo treatment remains unchanged by this intro replacement.
- No puzzle geometry, input, blockers, removal, progression, saves, reveal state, or gameplay-layout rules are changed by the intro replacement.
- Browser and service-worker cache version `v47` identifies this intro release.
- Any later replacement requires a new owner-approved image, a new locked decision, updated cache identifiers, and a published phone review.

The published v47 intro remains pending owner verification until the real-phone loading trough, animated fill, crop, and handoff are confirmed.

## D-017 — Adaptive gameplay canvas and preserved Teddy proportions

The v51 tall-board presentation is rejected because non-uniform SVG scaling distorted the Teddy face. Gameplay must use a viewport-adaptive canvas without stretching the compiled Teddy geometry.

The locked adaptive-canvas rules are:

- The gameplay canvas follows the complete available viewport rather than a fixed 9:16 gameplay picture.
- The former expression-specific raster gameplay backgrounds are retired from active runtime presentation.
- The laboratory environment is generated responsively from CSS surfaces and may adapt independently from the puzzle.
- The SVG must use uniform scaling with `preserveAspectRatio="xMidYMid meet"` or an equivalent non-distorting transform.
- `preserveAspectRatio="none"` is forbidden for Teddy gameplay.
- The engine measures the complete rendered Teddy once per newly rendered expression, adds a clipping-safe margin, and locks that full-level viewBox for the entire expression.
- Removing arrows must never change the Teddy scale, center, aspect ratio, or viewBox.
- Resize and rotation may reapply the locked viewBox but must not remeasure only the remaining arrows.
- The puzzle should use the largest safe uniform scale permitted by the current viewport. Empty space caused by aspect-ratio mismatch is preferable to distorting the Teddy.
- The generated frame must not block startup and must not require a raster image request.
- Browser and service-worker presentation cache `v52` identifies this adaptive-canvas release.

Any later attempt to fill more portrait height must change the authored Teddy geometry itself through the controlled level-generation pipeline. It may not be achieved by stretching the rendered puzzle.

## D-018 — Portrait-native Toxic Toby geometry

The owner rejected the v52 square-authored face because uniform scaling preserved the shape but left excessive empty portrait space. Toxic Toby must therefore use genuinely portrait-authored coordinates rather than presentation stretching.

The locked portrait-geometry rules are:

- All five Toxic Toby expressions use rectangular portrait grids with more rows than columns.
- Cells remain square and every path remains orthogonal. No path may be transformed with a non-uniform presentation matrix.
- The face silhouette, ears, eyes, muzzle, nose, mouth, cheeks, and chin are authored directly for the taller coordinate field.
- Level grids are 87×57, 89×59, 91×61, 93×63, and 95×65 for expressions 1–5.
- The actual rendered path-bounds aspect ratio must remain approximately **1.42–1.65** so the face uses substantially more phone height while remaining recognizably Teddy-shaped.
- Compiler version is `toxic-toby-portrait-v2`; level version is `2`; content version is `tt01-portrait-2026.08.03.1`.
- A level-version change invalidates incompatible unfinished sessions safely. Completed expressions and feed unlocks must remain intact.
- Path IDs remain deterministic and unique within each expression, and the reverse-construction head-ray solver must verify every complete removal order.
- The full-level viewBox is captured once and locked for the expression. Removing arrows must never change scale, center, aspect ratio, or viewBox.
- The adaptive full-viewport canvas and generated CSS laboratory frame from D-017 remain active.
- Browser and service-worker cache `v53` identifies this portrait-native release.

Automated geometry and browser audits are required, but the owner must still approve the recognizable face and portrait use on a real phone.
