# Failure Ledger

Read this before proposing a fix. Do not repeat a failed approach under a new name.

## F-001 — Raw GitHub Pages source was not playable

**Symptom:** The static header appeared, the counter stayed at `0 / 5`, and no Teddy cards loaded.

**Cause:** GitHub Pages served raw source files whose JSON and Capacitor imports required the Vite build step.

**Resolution:** Publish the verified Vite bundle under `/play/` and redirect the repository root there.

**Never repeat:** Do not serve raw `index.html` as the playable app and do not hand-edit generated `/play/` files.

## F-002 — Completion progression stopped after Evil Grin

**Observed:** In the owner's browser playtest, Neutral completed and advanced to Evil Grin. Evil Grin also completed and displayed “Expression 3 is now unlocked,” but **Next Expression** did not open Gross.

**Environment/build:** Published GitHub Pages browser build after the first completion/feed implementation.

**Expected:** Every transition must work in order: `1 → 2 → 3 → 4 → 5 → private feed`.

**Implementation weakness:** Completion navigation derived its target from mutable runtime state at click time, did not capture a validated pending destination when completion occurred, did not require the exact requested level, and did not verify that the next level actually loaded. A failure could therefore stop or silently remain on the same expression without preserving a useful retry state. The exact device-side trigger for the Evil Grin failure was not observable without browser-console evidence, but these missing safeguards allowed the reported symptom.

**Resolution:** Completion now captures a manifest-validated destination at completion time, requires exact unlock and playable-content matches, prevents duplicate taps, verifies the loaded Teddy and level, keeps the completion modal available after a failed load, and provides an explicit retry action. The browser runtime and service-worker cache version were also advanced so the repaired code cannot be confused with the prior cached runtime.

**Regression evidence:** The progression test suite now validates every transition—`1 → 2`, `2 → 3`, `3 → 4`, `4 → 5`, and `5 → feed`—against the actual level and feed manifests. Missing expression or feed destinations fail before runtime navigation.

**Never repeat:** Do not navigate from a completion modal using only mutable `state.level`, do not silently fall back to an earlier unlocked level, and do not hide the completion modal until the exact destination is confirmed loaded.

**Status:** Fixed in code; owner browser retest pending.

## F-003 — Final artwork was discussed before it existed

**Risk:** Placeholder or generated art could be mistaken for approved final character art.

**Resolution:** The completion system uses explicit placeholder slots until the owner provides five clean approved images.

**Never repeat:** Do not generate, fabricate, substitute, or silently crop final reveal art.

## F-004 — Unfinished Teddy fallback risk

**Risk:** Loading Toxic Toby data or artwork for another Teddy would make the app look complete while violating the brand promise.

**Resolution:** Manifest status gates playable content; unfinished Teddies remain **COMING SOON**.

**Never repeat:** No fallback from `tt02`–`tt12` to `tt01` in production behavior.

## F-005 — Patch-on-patch interaction regressions

**Risk:** Changing backgrounds, input code, or mobile wrappers can re-break the proven click/removal system.

**Resolution:** Preserve the current interaction layer and require focused regression tests plus full builds for any input or board change.

**Never repeat:** Do not replace stable interaction behavior while solving an unrelated visual problem.

## F-006 — Runtime-generated puzzle risk

**Risk:** Random or runtime-generated levels can be unsolvable, inconsistent, impossible to restore exactly, or different across devices.

**Resolution:** Levels are deterministic precompiled JSON with solver and geometry reports.

**Never repeat:** No runtime random generation and no unverified level JSON.

## F-007 — Automated success mistaken for physical validation

**Risk:** Passing CI could be reported as proof of real iPhone, Android, VoiceOver, TalkBack, signing, store upload, or participant testing.

**Resolution:** Automated and human gates are recorded separately.

**Never repeat:** Never mark a human gate complete without physical evidence or account-side confirmation.

## F-008 — Reopening finished planning instead of executing the active step

**Risk:** Repeatedly discussing already-settled architecture, names, expressions, or release order wastes work and creates contradictory plans.

**Resolution:** `NEXT_ACTION.md` contains exactly one active action. New work must either complete it or explicitly replace it with owner approval.

**Never repeat:** Do not restart completed planning unless new evidence shows a defect.

## F-009 — Runtime interface drifted away from the locked design system

**Observed:** The published collection screen used a cream background, pale white cards, brown text and faint pastel accents even though the approved Toxic Teddies Design System defined a dark Grime 900 shell, toxic/slime greens, mold olive, patch purple, parchment text and distressed dark cards.

**Environment/build:** Browser build shown by the owner after the animated loading-screen merge.

**Expected:** The loading screen, home collection, gameplay chrome, feed and shared controls must feel like one Toxic Teddies product and use the canonical Design System 1.0.0 palette.

**Root cause:** The second-brain design tokens were documented, but the original prototype CSS still contained independent legacy variables such as `#faf6ef`, `#efe6d7`, `#fbf6ed`, `#543f2b` and translucent white card surfaces. Documentation validation did not verify that runtime CSS used the same values.

**Resolution:** Runtime tokens now contain the complete canonical palette. The app shell, collection cards, game chrome, feed and accessibility surfaces use the dark grime system, while parchment remains reserved for puzzle and modal readability. Automated tests now reject the retired cream page gradient and validate the exact runtime token values and final override order.

**Regression evidence:** `tests/design-system-runtime.test.mjs` and the second-brain validator check the canonical hex values, dark home shell, dark cards and loaded override stylesheet. The full browser/native build remains required.

**Never repeat:** Do not treat a design-system document as implementation. Runtime tokens, components and published screenshots must be audited together before claiming visual alignment.

**Status:** Fixed in code; owner visual review pending.

## F-010 — Loading artwork module was included as a classic script

**Observed:** The phone loading screen showed a black portrait card, the image alt text, and only the decorative glow and bubble layers. The approved Toxic Toby radioactive-laboratory artwork did not appear.

**Environment/build:** Published browser build after the dark design-system alignment.

**Expected:** The approved bundled WebP must fill the portrait loading card before the home screen appears.

**Root cause:** `src/app/loading-screen.js` contained an ES-module `import`, but `index.html` initially loaded it with a classic `<script>` tag. The browser rejected the file before it could assign the bundled artwork to `#bootSplashImage`.

**First repair:** The loader was changed to a module and cache version `v38` was published.

**Why that was insufficient:** The artwork still depended on JavaScript execution and a large base64 data URI before the first visual could appear. The owner still saw the broken-image fallback in the published build.

**Never repeat:** The essential opening artwork must not depend on a JavaScript module successfully executing.

**Status:** Superseded by F-011.

## F-011 — Essential brand artwork was embedded in JavaScript instead of shipped as a real image

**Observed:** The approved loading artwork still did not render after the module-tag repair, and the home title used a generic heavy system font rather than the approved Toxic Teddies logo treatment.

**Environment/build:** Published GitHub Pages build shown by the owner on desktop after PR #35.

**Expected:** The browser should request and display a normal WebP file immediately from HTML. The home header should use the approved illustrated Toxic Teddies logo, not an imitation font.

**Root cause:** The full image existed only as a base64 string inside a generated JavaScript module. This made the first visual dependent on module loading and execution, produced an oversized JavaScript entry, and left the home header substituting typography because the custom display font asset was not present.

**Resolution:** Build preparation now decodes the approved source payload into `public/assets/branding/loading/toxic-teddies-loading.webp`. Vite copies that stable file into the browser and native bundles. `index.html` preloads it and assigns it directly to the splash `<img>`, before JavaScript. The same approved artwork is cropped with CSS to provide the exact Toxic Teddies logo on the home screen while retaining a semantic hidden H1.

**Regression evidence:** `tests/loading-screen.test.mjs` verifies byte-for-byte materialization, direct HTML image markup, preload, service-worker caching, the non-module loading controller and the approved home-logo crop. The service-worker cache advances to `v39`.

**Never repeat:** Essential first-paint images must be real built assets referenced directly from HTML. Do not use base64 JavaScript modules as the runtime source of a splash screen. Do not simulate the official logo with an unrelated system font.

**Status:** Fixed in code; published owner confirmation received for image visibility.

## F-012 — The illustrated loading bar looked permanently full and did not visibly progress

**Observed:** The owner confirmed that the full loading artwork finally appeared, but the green contamination bar did not visibly load from left to right.

**Environment/build:** Published GitHub Pages build after PR #36, shown on desktop on 2026-07-24.

**Expected:** The illustrated bar must clearly begin near empty, move through the real startup-stage targets, visibly reach 100 percent, and only then hand off to the app.

**Root cause:** The approved artwork already contains a fully illuminated green bar. The first runtime treatment only placed a translucent green glow on top, so the unfilled portion remained bright and looked complete. The 700 ms minimum also allowed multiple startup targets to occur too quickly to read as movement.

**Resolution:** The progress lane now has a dark mask over the painted bar, and a bright runtime fill reveals it from left to right. A requestAnimationFrame controller advances monotonically toward each real startup-stage target, requires visible 100 percent completion before handoff, uses a 1,800 ms full-motion minimum, and retains a 700 ms reduced-motion path. Browser and service-worker caching advance to `v40`.

**Regression evidence:** `tests/loading-screen.test.mjs` requires the dark lane mask, scale-based fill, animation-frame controller, monotonic target handling, visible 100 percent completion, duration rules and cache `v40`.

**Never repeat:** Do not animate only brightness over artwork that already looks full. A progress indicator needs a visibly different unfilled state and enough painted time to show meaningful movement.

**Status:** Fixed in code; published owner confirmation pending.

## F-013 — Gameplay backdrop class activated but the image did not render

**Observed:** The owner’s published v43 screenshot showed the new portrait layout, transparent square board, and resized arrow face, but the gameplay area remained flat black. No pipes, machinery, barrels, slime, or radioactive laboratory perimeter were visible.

**Environment/build:** GitHub Pages browser build v43, desktop Chrome Incognito, reported by the owner on 2026-07-29.

**Expected:** The matching owner-approved 9:16 WebP must visibly fill the gameplay view, with the arrow face positioned over its quiet central panel and the illustrated laboratory frame visible around the perimeter.

**Root cause:** The runtime copied a relative CSS `url('./assets/...')` string from the hidden legacy board layer into a separate presentation layer. Source-string and CSS tests confirmed the class and stacking rules but did not prove that the production browser had successfully loaded and painted the image. The previous release therefore passed non-rendering tests while the image remained absent.

**Resolution:** The runtime now resolves the manifest path against `document.baseURI`, preloads it with a real `Image`, applies the successfully loaded absolute URL directly to `.game-view`, and exposes explicit `loading`, `loaded`, `invalid-url`, and `load-error` diagnostics. The game view uses an exact 9:16 canvas, the legacy square backdrop stays suppressed, and the browser/service-worker cache advances to `v44`.

**Regression evidence:** `tests/gameplay-backdrops.test.mjs` exercises relative-to-absolute URL loading with a fake browser DOM. `.github/workflows/gameplay-backdrop-visual-audit.yml` builds and serves the actual Vite production bundle, validates all five WebPs over HTTP, waits for the intro to hand off, verifies the computed Neutral background and 122 rendered paths in Chrome, and saves mobile and desktop gameplay screenshots. The successful audit artifact visibly shows the radioactive laboratory behind the arrows at 430×764 and 1365×768.

**Never repeat:** Do not approve visual asset rendering from manifest paths, class names, CSS strings, or successful compilation alone. A gameplay-background change must pass a clean production-browser render, computed-style/network assertions, and screenshot inspection before merge.

**Status:** Fixed and independently rendered in the PR build; published owner verification pending.

## F-014 — The gameplay background rendered, but the Teddy puzzle remained undersized

**Observed:** The owner’s real-phone screenshot showed the approved radioactive laboratory correctly, but the arrow-face occupied only the middle of the quiet panel and was substantially smaller than the reference puzzle.

**Environment/build:** Published GitHub Pages v45 on a real Android phone, reported by the owner on 2026-07-30.

**Expected:** The Teddy face must be the dominant gameplay object, approximately matching the reference puzzle’s screen coverage while preserving the illustrated perimeter and every exit lane.

**Root cause:** The compiled level uses a 57×57 SVG viewBox with deliberate empty grid cells around the actual Teddy silhouette. Enlarging only the transparent board shell to 92% and the SVG to 108% left those internal margins in place, so source-level CSS measurements overstated the visible face size.

**Rejected overcorrection:** A first v46 attempt used a 160% SVG scale. The new browser audit measured the actual rendered paths at 114.2% of gameplay width and rejected the build because ears and side paths were clipped. That failed render was not merged.

**Resolution:** The shell is 96% wide and the centered SVG/preview layers use a measured 122% scale with `inset: -11%`. The production Chrome audit measures actual path bounds using `getBBox()` and `getScreenCTM()`. The final render measures 87.1% of gameplay width, 49.0% of portrait height, and 90.7% of board width, with all 122 paths inside the canvas.

**Regression evidence:** Mobile 430×764 and desktop 1365×768 production screenshots were captured after the intro handoff. Both passed background loading, path-count, measured-size and clipping assertions. Quality, browser, native and store workflows also pass on the final branch head.

**Never repeat:** Do not infer visible puzzle size from the outer SVG or board rectangle. Measure the rendered path bounds. Do not merge an enlargement without both lower size limits and a no-clipping assertion.

**Status:** Fixed and independently rendered in PR #45; published owner verification pending.

## Incident entry template

```text
## F-XXX — Title

Observed:
Environment/build:
Exact reproduction steps:
Expected:
Actual:
Root cause:
Resolution:
Regression test/evidence:
Never repeat:
Status: open | fixed | monitoring
```
