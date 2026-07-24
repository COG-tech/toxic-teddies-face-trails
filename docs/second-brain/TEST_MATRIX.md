# Test Matrix

Updated: 2026-07-24

## Automated repository gates — passing at the current repair branch

| Area | Evidence type | Status |
|---|---|---|
| JavaScript syntax | Node checks | PASS |
| Deterministic five-level compiler | Compiler + reports | PASS |
| Geometry and solver validation | Automated tests | PASS |
| Pointer geometry and touch selection | Unit tests | PASS |
| Save migration and exact path restoration | Unit tests | PASS |
| Expression progression 1→2 | Manifest-backed unit test | PASS |
| Expression progression 2→3 | Manifest-backed unit test | PASS |
| Expression progression 3→4 | Manifest-backed unit test | PASS |
| Expression progression 4→5 | Manifest-backed unit test | PASS |
| Final expression 5→feed | Manifest-backed unit test | PASS |
| Missing playable next expression rejected | Unit test | PASS |
| Missing final feed rejected | Unit test | PASS |
| Restart cannot unlock content | Unit test | PASS |
| Direct locked feed route rejected | Unit test | PASS |
| Feed viewed/unread persistence | Unit test | PASS |
| Analytics allow-list and privacy | Unit tests | PASS |
| Second-brain canonical records | Automated validator | PASS |
| Design-system tokens and scope boundaries | Automated second-brain validator | PASS |
| Vite production build | GitHub Actions | PASS |
| Offline bundle integrity | SHA-256 verification | PASS |
| Browser `/play/` bundle generation | GitHub Actions | PASS |
| Android debug compilation | GitHub Actions | PASS |
| iOS simulator compilation | GitHub Actions | PASS |
| Android release AAB packaging | GitHub Actions | PASS, unsigned without secrets |
| iOS Release archive packaging | GitHub Actions | PASS, unsigned |

## Human/device gates — still pending

| Gate | Required evidence | Status |
|---|---|---|
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
| Design-system implementation audit | Screen-by-screen comparison against `DESIGN_SYSTEM.md` | PENDING |
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

## Design-system acceptance gates

Every new or changed app screen must demonstrate:

- canonical color tokens rather than unrelated one-off colors;
- Toxic Head only for display use and Inter/system typography for readable interface copy;
- spacing from the `4, 8, 12, 16, 24, 32, 64` scale;
- responsive behavior across mobile, tablet, desktop and wide breakpoints;
- correct primary, secondary, icon and disabled button hierarchy;
- visible focused, selected, disabled, success, warning, error, information and locked states where applicable;
- cards that clearly separate playable, completed, locked and coming-soon content;
- navigation that does not outrank the active face puzzle;
- completion screens that use parchment readability and toxic/slime accents without obscuring the character;
- no claim that stars, times, badges, difficulty selectors or collection systems are implemented merely because they appear in the design board;
- WCAG 2.1 AA intent, keyboard navigation, screen-reader labels, high contrast, reduced motion, visible focus and large touch targets.

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

Any change touching `compiled-app.js`, `mobile-enhancements.js`, input geometry, progression, save state, manifests, design tokens, shared components, service-worker behavior, build publication, or native bundling must run the complete automated suite and update this matrix when the evidence changes.
