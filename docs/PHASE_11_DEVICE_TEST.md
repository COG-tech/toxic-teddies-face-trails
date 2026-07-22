# Phase 11 Physical-Device Test

Test build:

```text
App version: 0.4.0
Build: 2
Content: tt01-launch-2026.07.22.1
```

Run this protocol on one physical iPhone and one physical Android phone before closing issue #11.

## Device record

```text
Platform:
Device:
OS version:
Install source:
Previous installed version:
Test date:
Tester:
```

## A. Fresh offline install

1. Install the test build while online.
2. Launch once.
3. Open Settings and record the displayed version/build/content information.
4. Force close the app.
5. Enable airplane mode.
6. Relaunch.

Pass criteria:

- [ ] App launches without network access.
- [ ] Startup integrity check passes.
- [ ] Toxic Toby and all five expressions are available.
- [ ] No blank image, missing level or startup error appears.
- [ ] Settings reports 16 verified bundled files.

## B. Background and resume

1. Open Neutral.
2. Remove at least five paths.
3. Background the app for 30 seconds.
4. Resume.

- [ ] The same paths remain removed.
- [ ] Input works immediately after resume.
- [ ] Board geometry and touch selection remain aligned.
- [ ] No duplicate haptic or duplicate removal occurs.

## C. Force close and relaunch

1. Remove another five paths.
2. Force close from the app switcher.
3. Relaunch and reopen the same expression.

- [ ] Exact unfinished state returns.
- [ ] Completed-expression flags are unchanged.
- [ ] No progress is rolled back to the backup unexpectedly.

## D. Device reboot

1. Leave a level unfinished.
2. Reboot the phone.
3. Relaunch in airplane mode.

- [ ] App launches.
- [ ] Exact unfinished state returns.
- [ ] Haptics work after reboot.

## E. Installed update over progress

1. Install version 0.3.0 or an approved schema-1 fixture build.
2. Complete one expression and partially complete another.
3. Install version 0.4.0 build 2 over the existing app without uninstalling.
4. Relaunch.

- [ ] Completed expression remains completed.
- [ ] Compatible unfinished path state returns.
- [ ] Save schema reports version 2 internally.
- [ ] No user data is cleared.

## F. Low-memory/process recreation

1. Leave a level unfinished.
2. Background the app.
3. Open memory-intensive apps until the operating system removes Toxic Teddies from memory, or use platform developer tools to terminate the process without clearing app data.
4. Relaunch.

- [ ] Exact unfinished state returns from durable storage.
- [ ] No blank board or stale input geometry appears.

## G. System interruptions

During gameplay test:

- incoming call or system call overlay;
- notification shade/control center;
- screen lock and unlock;
- permission/system dialog from another app;
- audio route change where available.

- [ ] App resumes safely.
- [ ] No path is removed accidentally.
- [ ] Haptics still work.
- [ ] Progress remains exact.

## H. Safe areas and system UI

- [ ] Content avoids the iPhone notch/Dynamic Island.
- [ ] Content avoids the Home indicator.
- [ ] Android status and navigation areas remain readable.
- [ ] Android gesture Back closes dialogs or returns from gameplay correctly.
- [ ] No content is clipped with larger text/display scaling.

## I. Corrupt-primary recovery test

Developer/test build only:

1. Create valid progress and ensure a second successful write creates a backup.
2. Corrupt the primary save file while leaving the backup intact.
3. Relaunch.

- [ ] App loads the backup.
- [ ] App does not crash.
- [ ] Previously backed-up progress is present.

## Result

```text
Platform:
Pass/fail:
Failed sections:
Screenshots/recording:
Observed build information:
Notes:
```
