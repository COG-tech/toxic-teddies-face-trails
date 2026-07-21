# QA and Release Gates

## Purpose

No Toxic Teddies level or application release is complete because it renders. It is complete only after it passes content, geometry, interaction, accessibility, performance, persistence and PWA checks.

## Gate A — Content identity

- [ ] Correct Teddy ID.
- [ ] Correct A-name and B-name.
- [ ] Correct expression ID and label.
- [ ] Correct backdrop asset.
- [ ] No generic substitute artwork.
- [ ] No source-sheet labels inside the board.
- [ ] No baked logo, card border or tagline.
- [ ] Availability status matches reality.

Failure blocks release.

## Gate B — Geometry

- [ ] Every path uses orthogonal segments.
- [ ] No two active paths occupy the same cell.
- [ ] No path crosses another path.
- [ ] No path self-intersects.
- [ ] Arrowhead is attached to a true endpoint.
- [ ] Arrow direction matches endpoint tangent.
- [ ] Every path remains inside the approved mask.
- [ ] All required face regions are represented.
- [ ] Compiler report generated.

Failure blocks release.

## Gate C — Solvability and fairness

- [ ] Automated solver completes the level.
- [ ] No unavoidable deadlock.
- [ ] Every blocked result identifies visible blocker geometry.
- [ ] No hidden forced sequence.
- [ ] Initial open-path count is greater than zero.
- [ ] Human tester can explain the blocking rule.
- [ ] Difficulty matches the expression progression.

Failure blocks release.

## Gate D — Character recognition

Test with backdrop disabled.

- [ ] Teddy head is recognizable.
- [ ] Ear placement is readable.
- [ ] Eye regions are readable.
- [ ] Muzzle/mouth area is readable.
- [ ] At least two character-specific features are visible.
- [ ] Intended expression is reasonably identifiable.

A backdrop may improve the result but cannot be the sole reason the face is recognizable.

## Gate E — Backdrop alignment

- [ ] Correct image for Teddy and expression.
- [ ] Major landmarks align with maze.
- [ ] Arrows remain dominant.
- [ ] Contrast and saturation do not hide paths.
- [ ] No false visual path boundaries.
- [ ] `pointer-events: none` confirmed.
- [ ] Parchment fallback works.
- [ ] Mobile and desktop crops approved.

## Gate F — Input and interaction

- [ ] Valid path responds to intended tap.
- [ ] Effective target is mobile-friendly.
- [ ] Tap between close paths selects the intended nearest path.
- [ ] Backdrop never intercepts input.
- [ ] Pan does not trigger accidental removal.
- [ ] Zoom does not break hit detection.
- [ ] Orientation change recalculates geometry.
- [ ] Rapid taps do not corrupt state.
- [ ] Removed paths cannot be selected again.
- [ ] Missed taps do not cost lives or trigger a modal.

## Gate G — Animation

- [ ] Visible response begins immediately.
- [ ] Anticipation is approximately 80–120 ms.
- [ ] Arrowhead exits first.
- [ ] Body follows the path bends.
- [ ] Fade occurs near the edge.
- [ ] Input lock releases correctly.
- [ ] Reduced-motion version works.
- [ ] Animation remains smooth on target devices.

## Gate H — Progress and state

- [ ] Removed path IDs save.
- [ ] Refresh restores exact state.
- [ ] Browser close/reopen restores exact state.
- [ ] PWA close/reopen restores exact state.
- [ ] Completion saves once.
- [ ] Restart resets only the intended level.
- [ ] Reset-all requires confirmation.
- [ ] Level-version mismatch is handled safely.
- [ ] Existing completion data migrates.

## Gate I — Accessibility

- [ ] All standard controls are keyboard operable.
- [ ] Visible focus state exists.
- [ ] Modal focus management works.
- [ ] Screen reader announces level identity and remaining count.
- [ ] Removal and blocking are announced without excessive noise.
- [ ] State is not communicated by color alone.
- [ ] Reduced motion works.
- [ ] High contrast works.
- [ ] Large text reflows without clipping.
- [ ] Practical touch target sizes are maintained.
- [ ] VoiceOver check completed.
- [ ] TalkBack check completed.

WCAG-critical failure blocks release.

## Gate J — Performance

Targets:

- [ ] Cold first puzzle ready in approximately 3 seconds or less on average mobile 4G.
- [ ] Warm PWA load approximately 1 second where feasible.
- [ ] Initial visible tap response under 50 ms.
- [ ] Near-60-fps removal animation on target devices.
- [ ] No repeated full-board rebuild after every path removal.
- [ ] No permanent idle animation loop.
- [ ] Backdrops use optimized sizes.
- [ ] Current and next level are prefetched selectively.
- [ ] App does not download all 60 levels on first launch.

## Gate K — PWA and cache

- [ ] Manifest validates.
- [ ] Icons load at required sizes.
- [ ] GitHub Pages relative paths work.
- [ ] App shell opens offline after caching.
- [ ] Current cached level opens offline.
- [ ] Update is deferred until a safe point.
- [ ] Progress survives update.
- [ ] Build version is visible for diagnosis.
- [ ] No mixed old/new JavaScript and CSS in test scenarios.
- [ ] Service worker failure does not erase progress.

## Gate L — Responsive layout

Test:

- [ ] 320–479 px compact mobile.
- [ ] 480–767 px large mobile.
- [ ] 768–1099 px tablet.
- [ ] 1100 px+ desktop.
- [ ] Portrait.
- [ ] Landscape.
- [ ] Browser mode.
- [ ] Installed PWA.

Confirm:

- [ ] Board stays square.
- [ ] Controls remain reachable.
- [ ] No horizontal scrolling.
- [ ] Content does not overlap safe areas.
- [ ] Global navigation is hidden during play.

## Gate M — Copy and brand

- [ ] Primary line uses `The face is the puzzle.`
- [ ] Instructions are clear before humorous.
- [ ] Blocked copy is explanatory.
- [ ] Errors state the next action.
- [ ] No false claim that all 60 levels are live.
- [ ] No inconsistent character names.
- [ ] No licensed-property comparisons in product copy.
- [ ] Gross-out humor remains comic, not realistic gore.

## Required test matrix

### Desktop

- Chrome
- Edge
- Safari

### Mobile

- Chrome Android
- Samsung Internet
- Safari iPhone
- Android installed PWA
- iOS home-screen PWA
- Low-end Android device

### Accessibility states

- Keyboard only
- Screen reader
- Reduced motion
- High contrast
- Large text

### Connectivity states

- Cold online load
- Warm cached load
- Offline reopen
- Reconnect
- Service-worker update available

## Pull-request evidence

A gameplay or visual PR must include:

- before/after recording or screenshots;
- exact build and level versions;
- automated test result;
- manual device checklist;
- accessibility impact;
- performance impact;
- cache impact;
- rollback instructions.

## Release decision

A release is approved only when:

- all blocking gates pass;
- remaining nonblocking issues are documented;
- live content availability matches manifests;
- GitHub Pages deploy commit is recorded;
- post-deploy smoke test passes.
