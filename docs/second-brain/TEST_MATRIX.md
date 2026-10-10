# Test Matrix

Updated: 2026-10-10

## V54 candidate evidence

Baseline: `b03905019be3062042c61bef8beaf8f41d2dcd5f`. These results concern the local draft candidate; no public deployment or physical-device result is implied.

| Area | Evidence | Status |
|---|---|---|
| Canonical records, versions and syntax | `npm run check` after build preparation | PASS |
| Geometry, style-region landmarks and complete solver orders | Five levels, 791 paths | PASS |
| Full `1→2→3→4→5→feed` through production Next handlers | DOM integration with simulated animation | PASS |
| Duplicate Next, blocked moves and 2→3 failed-load retry | Production runtime DOM integration | PASS |
| Ten removals, resize/rotation/pageshow fit reapplication | DOM integration with simulated SVG bounds | PASS — state behavior only |
| Exact ten-path reload, v53 migration, completion and feed/view persistence | Production runtime and save store | PASS |
| Locked routes and eleven disabled Coming Soon cards | Production runtime DOM integration | PASS |
| Unit tests for input geometry, saves, analytics and design tokens | `npm test` | PASS |
| Generated CSS frame and uniform locked viewBox wiring | Repository regression tests | PASS — not a rendered-browser claim |
| Vite build and offline integrity | `npm run build` | PASS |
| Native/store configuration | 30 repository checks | PASS — signing/device warnings remain |
| Actual 430×764 and 1365×768 browser geometry and screenshots | Production Chromium audit | BLOCKED — local Chromium Unix-socket restriction; cloud browser candidate URL refused connection |
| Real touch input, visual recognition, all five expressions on phone | Owner/device playthrough | NOT RUN |
| Native iOS/Android compilation, lifecycle and accessibility | Native and physical-device evidence | NOT RUN |
| GitHub Actions / publication | No workflows dispatched or enabled | NOT RUN |

The code-derived geometry previews are review aids, not browser screenshots. DOM bounds and animation are simulated. Re-run all applicable checks after any later edit; actual-browser and owner gates cannot be closed by these tests.

## Human/device gates — still pending

| Gate | Required evidence | Status |
|---|---|---|
| Gameplay-first mobile hierarchy | Owner confirms arrows dominate the screen and menus are compact | PENDING — CURRENT PRIORITY |
| Generated CSS frame | Owner confirms the adaptive laboratory frame stays secondary to the puzzle | PENDING |
| Top/bottom menu compression | Owner confirms persistent chrome no longer consumes excessive gameplay height | PENDING — CURRENT PRIORITY |
| Dark home collection | Owner confirms Grime 900 background, dark cards and toxic accents on phone | PENDING |
| Coming-soon distinction | Owner confirms disabled cards remain visibly distinct and readable | PENDING |
| Dark game chrome | Owner confirms top bar, progress, level chips and controls match the system | PENDING |
| Five-expression recognition | Owner confirms each expression is readable and distinctly Toby | PENDING — CURRENT PRIORITY |
| Uniform locked puzzle fit | Actual-browser resize/rotation and ten-removal measurements | PENDING |
| Arrow readability over gameplay backdrops | Owner confirms dark, cream and accent trails remain readable on phone | PENDING |
| High-contrast fallback | Owner confirms decorative backdrop fades and the board becomes a solid readable surface | PENDING |
| Dark Toxic Feed | Owner confirms profile, posts, unread state and replies remain readable | PENDING |
| Modal hierarchy | Owner confirms parchment modals and toxic primary buttons match the design board | PENDING |
| Animated startup screen | Owner confirms image, crop, loading animation and handoff on phone | PENDING |
| Reduced-motion startup | Owner or device evidence that animation is suppressed | PENDING |
| Repaired browser transition 1→2 | Owner recording or screenshots | PENDING |
| Repaired browser transition 2→3 | Owner confirms Gross opens after Evil Grin | PENDING — PRIOR FAILURE POINT |
| Repaired browser transition 3→4 | Owner recording or screenshots | PENDING |
| Repaired browser transition 4→5 | Owner recording or screenshots | PENDING |
| Repaired browser transition 5→feed | Owner confirms 5/5 state and feed opens | PENDING |
| Completion persistence | Refresh after completion and confirm unlocks remain | PENDING |
| Duplicate-tap protection | One tap advances once; rapid taps do not skip or duplicate | PENDING |
| Failed-load retry state | Completion modal remains usable if a destination fails | PENDING when reproducible |
| Five reveal images | Owner approval of all five clean expression images | PENDING |
| Completion-art placement | Screenshots on target phone sizes | PENDING |
| Physical Android playthrough | Install, five levels, airplane mode, force close, resume | PENDING |
| Physical iPhone playthrough | Install, five levels, airplane mode, force close, resume | PENDING |
| Android Back and safe areas | Device recording | PENDING |
| iPhone notch/Home-indicator safe areas | Device recording | PENDING |
| TalkBack | Full task completion evidence | PENDING |
| VoiceOver | Full task completion evidence | PENDING |
| Low-memory restoration | Physical-device evidence | PENDING |
| Signed TestFlight build | App Store Connect evidence | PENDING |
| Signed Play internal build | Play Console evidence | PENDING |
| 12-person UX study | Participant exports, notes, metrics, report | PENDING |

## Gameplay-first mobile acceptance gates

The next mobile gameplay layout must satisfy all of the following before merge:

- At 430×764, actual rendered arrow-path width is at least 86% of gameplay width (88–94% design target).
- At 430×764, actual rendered arrow-path height is at least 72% of gameplay height.
- At 1365×768, width is at least 28% and height at least 82%.
- These current portrait-native gates supersede the old 52% and square-board targets.
- Every path, arrowhead, ear, chin line, and exit lane stays inside the gameplay canvas.
- Combined persistent top header, status/feedback, and bottom controls consume no more than approximately 24% of gameplay height.
- Top and bottom controls are compact rather than large card stacks.
- Compact visual controls retain at least 44 CSS-pixel touch targets.
- The accessibility move list remains opt-in and does not occupy a large persistent gameplay region.
- The responsive CSS laboratory frame adapts independently; the Teddy is never stretched.
- The quiet central panel remains aligned behind the Teddy face.
- Enough pipes, machinery, slime, warning details, or frame structure remain to preserve the Toxic Toby laboratory identity.
- The arrow puzzle is the first visual focus.
- At least one valid path can be selected and removed after the layout change.
- The complete progression and persistence regression suite still passes.

## Runtime color acceptance gates

- The page background uses Grime 900 / Ink 900 rather than the retired cream gradient.
- Toxic Green and Slime Green identify active, completed and primary states.
- Patch Purple identifies secondary actions without outranking the main green action.
- Mold Olive and Brown 700 support frames, dividers and distressed surfaces.
- Parchment 100 and 300 are used for readable text and selected light surfaces, not as the entire app shell.
- Teddy cards use dark distressed surfaces with clear playable, completed and coming-soon states.
- The puzzle board may remain parchment for path readability, but surrounding game chrome remains dark.
- Modals may remain parchment for clarity and must retain dark readable text.
- No text relies on color alone to communicate locked, completed or failed status.
- High-contrast mode remains able to replace decorative colors with a clear functional presentation.

## Loading-screen acceptance gates

- The approved radioactive-laboratory artwork fills the portrait startup frame without stretching.
- The loading scan, bubbles and fill remain aligned with the illustrated loading bar.
- Startup copy is not duplicated over the image.
- The app shell is hidden and inert until initialization completes.
- Progress updates correspond to actual startup stages.
- The splash stays visible for at least 700 ms but does not create an unnecessary long delay.
- Reduced-motion settings stop decorative animation.
- Startup errors remove the splash and show the actionable failure screen.
- The loading artwork remains fully offline in browser and native bundles.

## Generated-frame acceptance gates

- No raster gameplay backdrop is active in any expression.
- The generated CSS frame fills the available viewport independently of the puzzle.
- Startup does not wait for a retired gameplay raster image.
- Narrow rails, grime and laboratory lighting remain secondary to the arrow face.
- The SVG uses `xMidYMid meet`; `preserveAspectRatio="none"` is forbidden.
- Removing paths never changes the complete-level viewBox, scale, center or aspect.
- Resize and rotation reapply the complete-level fit rather than measuring only remaining paths.
- Actual browser bounds, no-clipping checks and phone screenshots remain mandatory.

## Visual-level acceptance gates

Every new or changed level must pass all of the following before approval:

- The Teddy face is recognizable before the player removes a trail.
- The puzzle occupies most of the usable portrait viewport without clipping the ears, chin, or outer silhouette.
- Arrowheads remain readable at normal phone size.
- The Teddy silhouette is formed by the trail geometry, not by unrelated decoration.
- Interface controls stay outside the important facial features.
- The board maintains strong contrast between trails, arrowheads, blockers, and the background.
- The first valid move is discoverable without using Hint.
- Cleared trails reveal the expression artwork or placeholder behind the same face area.
- Level-to-level difficulty increases without changing the basic interaction rules.
- The result works with high contrast, reduced motion, touch assistance, VoiceOver, and TalkBack.

## Regression rule

Any change touching `compiled-app.js`, `mobile-enhancements.js`, gameplay layout, background crop, input geometry, progression, save state, manifests, design tokens, shared components, startup/loading behavior, service-worker behavior, build publication, or native bundling must run the complete automated suite and update this matrix when the evidence changes.
