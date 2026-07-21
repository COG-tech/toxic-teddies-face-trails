# QA and Release Gates — Native Mobile App

## Purpose

A Toxic Teddies release is complete only after it passes content, geometry, interaction, accessibility, performance, native lifecycle, persistence, signing and store checks on iOS and Android.

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

## Gate E — Backdrop alignment

- [ ] Correct image for Teddy and expression.
- [ ] Major landmarks align with maze.
- [ ] Arrows remain dominant.
- [ ] Contrast and saturation do not hide paths.
- [ ] No false visual path boundaries.
- [ ] `pointer-events: none` confirmed.
- [ ] Parchment fallback works.
- [ ] iPhone and Android phone crops approved.
- [ ] Tablet crop approved where supported.
- [ ] Asset is bundled locally in the app.

## Gate F — Touch and interaction

- [ ] Valid path responds to intended tap.
- [ ] Effective target is mobile-friendly.
- [ ] Tap between close paths selects the intended nearest path.
- [ ] Backdrop never intercepts touches.
- [ ] Pan does not trigger accidental removal.
- [ ] Zoom does not break hit detection.
- [ ] Resume/orientation change recalculates geometry.
- [ ] Rapid taps do not corrupt state.
- [ ] Removed paths cannot be selected again.
- [ ] Missed taps do not cost lives or trigger a modal.
- [ ] Android system Back behaves correctly.
- [ ] iOS safe-area gestures do not conflict with gameplay.

## Gate G — Native haptics and animation

- [ ] Visible response begins immediately.
- [ ] Anticipation is approximately 80–120 ms.
- [ ] Arrowhead exits first.
- [ ] Body follows path bends.
- [ ] Fade occurs near the edge.
- [ ] Input lock releases correctly.
- [ ] Reduced-motion version works.
- [ ] Valid, blocked and completion haptics are restrained and distinct.
- [ ] Haptic failure does not block gameplay.
- [ ] Animation remains smooth on target devices.

## Gate H — Native progress and lifecycle

- [ ] Removed path IDs save.
- [ ] App pause/background saves state.
- [ ] Force close/relaunch restores exact state.
- [ ] Device reboot/relaunch restores state.
- [ ] Completion saves once.
- [ ] Restart resets only the intended level.
- [ ] Reset-all requires confirmation.
- [ ] Level-version mismatch is handled safely.
- [ ] Existing prototype completion data migration is tested where supported.
- [ ] Corrupt save file falls back safely without crashing.
- [ ] App update preserves compatible progress.

## Gate I — Accessibility

- [ ] VoiceOver labels and announcements work.
- [ ] TalkBack labels and announcements work.
- [ ] All standard controls are keyboard/switch operable where applicable.
- [ ] Visible focus state exists.
- [ ] Modal focus management works.
- [ ] Level identity and remaining count are announced.
- [ ] Removal and blocking are announced without excessive noise.
- [ ] State is not communicated by color alone.
- [ ] Reduced motion works.
- [ ] High contrast works.
- [ ] Large text reflows without clipping.
- [ ] Practical touch targets are maintained.
- [ ] Accessible path-list/candidate navigation works.

Critical accessibility failure blocks release.

## Gate J — Performance

Targets:

- [ ] Cold installed-app launch is acceptably fast on target devices.
- [ ] Bundled first puzzle opens without network access.
- [ ] Initial visible tap response under 50 ms.
- [ ] Near-60-fps removal animation on supported devices.
- [ ] No repeated full-board rebuild after every removal.
- [ ] No permanent idle animation loop.
- [ ] Backdrops are size-optimized.
- [ ] Memory remains stable across repeated level changes.
- [ ] Pause/resume does not duplicate listeners or state.
- [ ] Low-memory restoration does not crash.
- [ ] Battery usage remains reasonable during a normal session.

## Gate K — Capacitor native shell

- [ ] `capacitor.config.ts` uses bundled `dist` content.
- [ ] `ios/` project builds in Xcode.
- [ ] `android/` project builds in Android Studio.
- [ ] iOS simulator launch passes.
- [ ] Android emulator launch passes.
- [ ] Physical iPhone test passes.
- [ ] Physical Android test passes.
- [ ] Airplane-mode launch passes.
- [ ] App does not point to the live website as its main content source.
- [ ] No remote executable code is required for launch gameplay.
- [ ] Native plugins fail gracefully when unavailable.

## Gate L — Mobile layouts and system UI

Test:

- [ ] Small iPhone.
- [ ] Standard iPhone.
- [ ] Large iPhone.
- [ ] Narrow Android phone.
- [ ] Midrange Android phone.
- [ ] Large Android phone.
- [ ] Supported tablet layout.
- [ ] Portrait.
- [ ] Landscape where enabled.
- [ ] Display zoom / larger font.
- [ ] Gesture navigation and button navigation on Android.

Confirm:

- [ ] Board stays square.
- [ ] Controls remain reachable.
- [ ] No horizontal scrolling.
- [ ] Safe areas are respected.
- [ ] Status/system bars use approved contrast.
- [ ] Global navigation is hidden during play.

## Gate M — Offline and bundled content

- [ ] Launch content is packaged in the app.
- [ ] All five Toxic Toby levels open in airplane mode.
- [ ] All five backdrops open in airplane mode.
- [ ] Save and restore work offline.
- [ ] No service worker is required for the native app.
- [ ] No stale browser-cache mixture controls native updates.
- [ ] App update is delivered through the stores.
- [ ] Downloadable future content, if added, is data/assets only and versioned.

## Gate N — Store identity and compliance

### Apple

- [ ] Bundle ID matches App Store Connect.
- [ ] Version/build number is correct.
- [ ] Signing and provisioning succeed.
- [ ] Privacy manifest is present and accurate.
- [ ] App Privacy answers match actual data use.
- [ ] Age rating is complete.
- [ ] App icon and screenshots are approved.
- [ ] TestFlight build installs and passes smoke tests.
- [ ] Review notes explain bundled offline interactive gameplay and native features.
- [ ] App provides substantial game functionality beyond a repackaged website.

### Google Play

- [ ] Application ID matches Play Console.
- [ ] Android App Bundle builds.
- [ ] Play App Signing is configured.
- [ ] Target SDK requirement is met.
- [ ] Data Safety answers match actual data use.
- [ ] Content rating is complete.
- [ ] Store icon, screenshots and feature graphic are approved.
- [ ] Internal/closed testing build installs and passes smoke tests.
- [ ] App is stable, responsive and provides substantial gameplay.

## Gate O — Copy and brand

- [ ] Primary line uses `The face is the puzzle.`
- [ ] Instructions are clear before humorous.
- [ ] Blocked copy is explanatory.
- [ ] Errors state the next action.
- [ ] No false claim that all 60 levels are live.
- [ ] No inconsistent character names.
- [ ] No licensed-property comparisons in product copy.
- [ ] Gross-out humor remains comic, not realistic gore.
- [ ] No PWA install/update language appears in the native app.

## Required device matrix

### iOS

- [ ] Current supported iOS simulator.
- [ ] Physical small/standard iPhone.
- [ ] Physical large iPhone when available.
- [ ] TestFlight install.
- [ ] VoiceOver.
- [ ] Reduce Motion.
- [ ] Larger Text.

### Android

- [ ] Current emulator.
- [ ] Low-end physical Android.
- [ ] Midrange physical Android.
- [ ] Google Play internal install.
- [ ] TalkBack.
- [ ] Gesture navigation.
- [ ] Button navigation.
- [ ] Font/display scaling.

### Lifecycle/connectivity

- [ ] Airplane mode launch.
- [ ] Background/resume.
- [ ] Force close/relaunch.
- [ ] Device reboot/relaunch.
- [ ] Incoming interruption.
- [ ] App update over an existing save.

## Pull-request evidence

A gameplay, native or visual PR includes:

- before/after device recording or screenshots;
- app version and native build numbers;
- level/compiler versions;
- automated test results;
- physical-device checklist;
- accessibility impact;
- performance impact;
- storage/lifecycle impact;
- store/privacy impact;
- rollback instructions.

## Release decision

A mobile release is approved only when:

- all blocking gates pass;
- nonblocking issues are documented;
- content availability matches manifests;
- signed TestFlight and Google Play test builds pass;
- the submitted store build matches the approved Git tag;
- post-install smoke tests pass on both platforms.
