# Test Matrix

Updated: 2026-07-30

## Automated repository gates — current alignment branch

| Area | Evidence type | Status |
|---|---|---|
| JavaScript syntax | Node checks | PASS when branch checks pass |
| Deterministic five-level compiler | Compiler + reports | PASS when branch checks pass |
| Geometry and solver validation | Automated tests | PASS when branch checks pass |
| Pointer geometry and touch selection | Unit tests | PASS when branch checks pass |
| Save migration and exact path restoration | Unit tests | PASS when branch checks pass |
| Expression progression 1→2 | Manifest-backed unit test | PASS when branch checks pass |
| Expression progression 2→3 | Manifest-backed unit test | PASS when branch checks pass |
| Expression progression 3→4 | Manifest-backed unit test | PASS when branch checks pass |
| Expression progression 4→5 | Manifest-backed unit test | PASS when branch checks pass |
| Final expression 5→feed | Manifest-backed unit test | PASS when branch checks pass |
| Missing playable next expression rejected | Unit test | PASS when branch checks pass |
| Missing final feed rejected | Unit test | PASS when branch checks pass |
| Restart cannot unlock content | Unit test | PASS when branch checks pass |
| Direct locked feed route rejected | Unit test | PASS when branch checks pass |
| Feed viewed/unread persistence | Unit test | PASS when branch checks pass |
| Approved loading artwork decodes as WebP | Unit test | PASS when branch checks pass |
| Loading screen markup and lifecycle hooks | Unit test | PASS when branch checks pass |
| Five Toxic Toby gameplay backgrounds decode as WebP | Unit test | PASS when branch checks pass |
| Gameplay backdrop expression order and manifest paths | Unit test | PASS when branch checks pass |
| Full-screen backdrop synchronizer loaded after HTML exists | Markup/runtime unit test | PASS when branch checks pass |
| Canonical runtime color hex values | Runtime CSS unit test | PASS when branch checks pass |
| Retired cream page gradient rejected | Runtime CSS unit test | PASS when branch checks pass |
| Dark home/card styling present | Runtime CSS unit test | PASS when branch checks pass |
| Final dark-theme stylesheet order | Runtime CSS unit test | PASS when branch checks pass |
| Gameplay-first mobile chrome budget | Production-browser measurement | REQUIRED for next layout branch |
| Actual rendered path width/height target | `getBBox()` + `getScreenCTM()` | REQUIRED for next layout branch |
| Background crop without distortion | Computed-style and screenshot audit | REQUIRED for next layout branch |
| All rendered paths remain inside gameplay bounds | Production-browser assertion | REQUIRED for next layout branch |
| Compact controls retain accessible touch targets | DOM geometry assertion | REQUIRED for next layout branch |
| Analytics allow-list and privacy | Unit tests | PASS when branch checks pass |
| Second-brain canonical records | Automated validator | PASS when branch checks pass |
| Design-system documentation and runtime tokens | Automated second-brain validator | PASS when branch checks pass |
| Vite production build | GitHub Actions | PASS when branch checks pass |
| Offline bundle integrity | SHA-256 verification | PASS when branch checks pass |
| Browser `/play/` bundle generation | GitHub Actions | PASS when branch checks pass |
| Android debug compilation | GitHub Actions | PASS when branch checks pass |
| iOS simulator compilation | GitHub Actions | PASS when branch checks pass |
| Android release AAB packaging | GitHub Actions | PASS when branch checks pass |
| iOS Release archive packaging | GitHub Actions | PASS when branch checks pass |

## Human/device gates — still pending

| Gate | Required evidence | Status |
|---|---|---|
| Gameplay-first mobile hierarchy | Owner confirms arrows dominate the screen and menus are compact | PENDING — CURRENT PRIORITY |
| Background crop acceptance | Owner confirms crop preserves laboratory identity without shrinking the puzzle | PENDING — CURRENT PRIORITY |
| Top/bottom menu compression | Owner confirms persistent chrome no longer consumes excessive gameplay height | PENDING — CURRENT PRIORITY |
| Dark home collection | Owner confirms Grime 900 background, dark cards and toxic accents on phone | PENDING |
| Coming-soon distinction | Owner confirms disabled cards remain visibly distinct and readable | PENDING |
| Dark game chrome | Owner confirms top bar, progress, level chips and controls match the system | PENDING |
| Toxic Toby gameplay backdrop mapping | Owner confirms Neutral, Evil Grin, Gross, Angry and Maniacal Laugh each show the correct environment | PENDING |
| Gameplay backdrop board alignment | Owner confirms the quiet central panel sits behind the arrow face without visible misalignment | PENDING |
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

- Actual rendered arrow-path width is approximately 90–94% of gameplay width.
- Actual rendered arrow-path height is at least 52% of gameplay height when the silhouette permits it.
- Every path, arrowhead, ear, chin line, and exit lane stays inside the gameplay canvas.
- Combined persistent top header, status/feedback, and bottom controls consume no more than approximately 24% of gameplay height.
- Top and bottom controls are compact rather than large card stacks.
- Compact visual controls retain at least 44 CSS-pixel touch targets.
- The accessibility move list remains opt-in and does not occupy a large persistent gameplay region.
- The environment may crop at the top, bottom, or sides but is never stretched.
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

## Gameplay-backdrop acceptance gates

- The five WebP files remain local and available offline.
- Each expression maps to its matching background in the locked expression order.
- The environment fills or intentionally crops to the complete portrait gameplay view instead of being trapped in the old square board layer.
- The central quiet panel remains behind the Teddy face puzzle.
- Strong pipes, slime, sparks, barrels and lighting remain peripheral.
- The arrow puzzle remains the first visual focus.
- No gameplay background introduces a teddy, character, text, logo, UI, arrows or puzzle pieces.
- The background presentation does not modify pointer selection, blocker detection, trail removal, saves or progression.

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
