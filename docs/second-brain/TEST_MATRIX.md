# Test Matrix

Updated: 2026-07-24

## Automated repository gates — passing at the last verified product baseline

| Area | Evidence type | Status |
|---|---|---|
| JavaScript syntax | Node checks | PASS |
| Deterministic five-level compiler | Compiler + reports | PASS |
| Geometry and solver validation | Automated tests | PASS |
| Pointer geometry and touch selection | Unit tests | PASS |
| Save migration and exact path restoration | Unit tests | PASS |
| Expression progression 1→2 and 4→5 | Unit tests | PASS |
| Final expression → feed unlock | Unit tests | PASS |
| Restart cannot unlock content | Unit tests | PASS |
| Direct locked feed route rejected | Unit tests | PASS |
| Feed viewed/unread persistence | Unit tests | PASS |
| Analytics allow-list and privacy | Unit tests | PASS |
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
| Browser completion flow | Screen recording: complete level, next expression opens, level 5 opens feed | PENDING |
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

Any change touching `compiled-app.js`, `mobile-enhancements.js`, input geometry, progression, save state, manifests, service-worker behavior, build publication, or native bundling must run the complete automated suite and update this matrix when the evidence changes.
