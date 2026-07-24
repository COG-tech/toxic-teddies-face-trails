# Test Matrix

Updated: 2026-07-24

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
| Canonical runtime color hex values | Runtime CSS unit test | PASS when branch checks pass |
| Retired cream page gradient rejected | Runtime CSS unit test | PASS when branch checks pass |
| Dark home/card styling present | Runtime CSS unit test | PASS when branch checks pass |
| Final dark-theme stylesheet order | Runtime CSS unit test | PASS when branch checks pass |
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
| Dark home collection | Owner confirms Grime 900 background, dark cards and toxic accents on phone | PENDING |
| Coming-soon distinction | Owner confirms disabled cards remain visibly distinct and readable | PENDING |
| Dark game chrome | Owner confirms top bar, progress, level chips and controls match the system | PENDING |
| Parchment board readability | Owner confirms paths and arrowheads remain clear against the board | PENDING |
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

Any change touching `compiled-app.js`, `mobile-enhancements.js`, input geometry, progression, save state, manifests, design tokens, shared components, startup/loading behavior, service-worker behavior, build publication, or native bundling must run the complete automated suite and update this matrix when the evidence changes.
