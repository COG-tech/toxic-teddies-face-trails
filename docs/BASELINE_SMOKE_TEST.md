# Prototype Baseline Smoke Test

Purpose: prove that native packaging and later refactoring preserve the current working prototype behavior.

Run against gameplay commit:

```text
c3228d70eda6fe25d48fecd0b80ce79bd53019f5
```

Expected debug identifier after this baseline documentation PR:

```text
prototype-baseline-c3228d70
```

## Test setup

- Serve the repository through Vite or a normal static HTTP server.
- Use a clean browser profile for the first run.
- Open developer tools.
- Record browser, operating system, screen size and input type.
- Confirm no runtime error occurs before interaction.

## A. Application load

- [ ] Page title is `Toxic Teddies: Arrow Escape`.
- [ ] Home screen displays the Toxic Teddies heading.
- [ ] Collection counter renders.
- [ ] Twelve Teddy cards render.
- [ ] Toxic Toby appears playable.
- [ ] Cards 2–12 display a coming-soon treatment.
- [ ] No blank board or `Dense Toxic Toby build failed to load` message appears.
- [ ] `window.__TOXIC_TEDDIES_BUILD__` returns `prototype-baseline-c3228d70` after the baseline metadata change.

## B. Runtime/debug confirmation

In the console:

```js
window.__toxicRulesTest?.()
```

- [ ] Returns an object.
- [ ] `rule` is `arrowhead_ray_clear_to_edge`.
- [ ] `active` is greater than zero.
- [ ] `openCount` is greater than zero.
- [ ] `lives` starts at `3`.

## C. Open Toxic Toby

- [ ] Tap/click Toxic Toby.
- [ ] Game view opens.
- [ ] Character name is Toxic Toby.
- [ ] Level 1 is selected.
- [ ] Three toxic-drop indicators appear.
- [ ] Progress begins at `0 / total` and `0%`.
- [ ] Board contains dense arrow paths forming a Teddy head.
- [ ] The faint Toxic Toby expression-sheet backdrop appears.

## D. Working nearest-path selection

- [ ] Tap close to a visible path segment rather than exactly on its arrowhead.
- [ ] A nearby active path is selected when within the current 32 px tolerance.
- [ ] Tapping outside the board does nothing.
- [ ] Tapping far from every active path does nothing.
- [ ] Removed paths cannot be selected again.

## E. Open-path removal

Use the console output from `window.__toxicRulesTest()` to identify an open path when necessary.

- [ ] Tap an open path.
- [ ] Status reports a clear/released arrow.
- [ ] Arrowhead leads the motion.
- [ ] Path body follows through bends.
- [ ] Path fades near exit.
- [ ] Progress increases by one.
- [ ] Lives remain unchanged.
- [ ] Input unlocks after the animation.

## F. Blocked-path behavior

Use the console output to identify a blocked path when necessary.

- [ ] Tap a blocked path.
- [ ] Selected path receives blocked feedback.
- [ ] First blocker receives highlight feedback.
- [ ] One toxic drop is lost.
- [ ] Status reports that another arrow must leave first.
- [ ] The blocked path remains active.

Repeat blocked taps:

- [ ] At zero lives, the `NO TOXIC DROPS LEFT` modal opens.
- [ ] `Try again` resets the current level and restores three lives.

This records the current behavior only. It is not approval to keep life loss in the final mobile game.

## G. Long-press preview

- [ ] Hold a path for approximately 340 ms.
- [ ] A preview ray appears.
- [ ] Open path reports an open exit.
- [ ] Blocked path highlights its first blocker.
- [ ] Supported devices provide a brief vibration.
- [ ] Preview clears automatically.

## H. Hint

- [ ] Tap the hint button.
- [ ] An open path highlights.
- [ ] A preview ray appears.
- [ ] Status reports a clear exit.
- [ ] Hint clears after approximately 1.4 seconds.

## I. Reset and navigation

- [ ] Reset returns the current level to its initial state.
- [ ] Reset restores three lives.
- [ ] Back returns to the home view.
- [ ] Opening a level updates the URL query parameters.
- [ ] Returning home removes the query parameters.

## J. Completion and unlock

Complete a test level or use a controlled developer test build.

- [ ] Final path removal opens the completion modal.
- [ ] Completion is saved under `toxic-teddies:compiled-patterns-v1`.
- [ ] Next level unlocks.
- [ ] Next-level action opens the next expression.
- [ ] Collection count increases.
- [ ] Reload preserves completed-level flags.

## K. Exact-progress limitation

- [ ] Remove several paths without completing the level.
- [ ] Reload the page.
- [ ] Confirm the level restarts rather than restoring the exact unfinished path state.

This is the known baseline limitation that native save-state work must correct later.

## L. Other Teddy card behavior

- [ ] Tap a coming-soon Teddy card.
- [ ] Record whether it opens Toxic Toby due to the current `openGame()` override.
- [ ] Do not interpret this as playable content for that Teddy.

## M. Offline browser-prototype test

- [ ] Load the site online once.
- [ ] Confirm service worker `toxic-teddies-arrow-escape-v30` is installed.
- [ ] Go offline.
- [ ] Reload the browser prototype.
- [ ] Confirm the cached shell loads when the service worker cache is complete.

This test does not replace the future native airplane-mode test.

## Result record

```text
Date:
Commit:
Build identifier:
Browser:
OS:
Device:
Screen dimensions:
Input type:
Pass/fail:
Failed sections:
Notes:
Recording link or filename:
```
