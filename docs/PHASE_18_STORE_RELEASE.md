# Phase 18 — App Store and Google Play Internal Release

Version: `0.5.0`
iOS build: `3`
Android versionCode: `3`
Bundle/Application ID: `com.cogtech.toxicteddies`

This document separates repository-complete work from account-holder, signing, artwork, and physical-device gates.

## Repository-complete infrastructure

- Canonical store metadata: `store/metadata/en-US.json`
- Draft privacy/content declarations: `store/declarations/privacy-and-content.json`
- Public privacy policy: `privacy.html`
- Public support page: `support.html`
- iOS privacy manifest: `ios/App/App/PrivacyInfo.xcprivacy`
- Android upload-key environment configuration in `android/app/build.gradle`
- Signing-secret exclusions in `.gitignore`
- Store readiness validator: `scripts/validate-store-readiness.mjs`
- Store artifact workflow: `.github/workflows/store-artifacts.yml`
- Offline, version, content-integrity, solver, analytics-privacy, Android AAB, and iOS archive gates

## Release identity

Do not create a second package or bundle identity.

```text
Apple bundle ID: com.cogtech.toxicteddies
Google application ID: com.cogtech.toxicteddies
App name: Toxic Teddies
Subtitle/tagline: The Face Is the Puzzle
Primary category: Games / Puzzle
Secondary category: Games / Casual
```

Version numbers are controlled only by `app-version.json`. Run:

```bash
npm install
npm run prepare:build
npm run check
npm run build
```

## Store artifact workflow

Run **Store release artifacts** from GitHub Actions or open a pull request that changes release files.

The workflow produces:

- a store evidence archive;
- an Android release AAB;
- an unsigned iOS release `.xcarchive` validation artifact.

An unsigned artifact proves that the repository builds correctly. It cannot be uploaded to a public store as a production binary.

## Android upload-key secrets

Google Play App Signing should hold the app-signing key. Keep the upload key outside Git.

Configure these GitHub Actions secrets only after the Play app record and upload key exist:

```text
TOXIC_ANDROID_KEYSTORE_BASE64
TOXIC_ANDROID_STORE_PASSWORD
TOXIC_ANDROID_KEY_ALIAS
TOXIC_ANDROID_KEY_PASSWORD
```

The workflow decodes the keystore only inside the temporary GitHub runner. The file is not committed or uploaded as an artifact.

Local signed AAB:

```bash
export TOXIC_ANDROID_KEYSTORE_PATH=/absolute/path/to/toxic-teddies-upload.jks
export TOXIC_ANDROID_STORE_PASSWORD='...'
export TOXIC_ANDROID_KEY_ALIAS='toxic-teddies-upload'
export TOXIC_ANDROID_KEY_PASSWORD='...'
npm run store:android:aab
```

Expected output:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

The project targets Android API 36.

## Apple signing

The repository intentionally contains no certificate, provisioning profile, App Store Connect API key, or Apple Team ID.

Account-holder steps:

1. Activate Apple Developer Program membership.
2. Register `com.cogtech.toxicteddies` as an explicit App ID.
3. Create the App Store Connect app record.
4. Open `ios/App/App.xcodeproj` with Xcode 26 or later.
5. Select the App target and choose the correct Team under Signing & Capabilities.
6. Confirm automatic signing or install the approved App Store distribution certificate and provisioning profile.
7. Archive the Release configuration for a generic iOS device.
8. Validate the archive.
9. Upload through Xcode Organizer or Transporter.
10. Select the processed build for TestFlight internal testing.

`ios/ExportOptions.plist.example` is a non-secret template. Copy it to an ignored `ios/ExportOptions.plist` only after replacing the Team ID.

## Privacy answers

Current release behavior:

- no account;
- no advertising;
- no in-app purchase;
- no tracking;
- no third-party network analytics;
- no personal data transmitted to COG-tech;
- puzzle progress and settings stored locally;
- optional research logging off by default and stored locally;
- no raw touch coordinates or personal identifiers;
- deliberate user-initiated research export only.

Use `store/declarations/privacy-and-content.json` as the draft source for App Store App Privacy and Google Play Data Safety. Re-audit before submission if any SDK, account, ad, purchase, cloud-save, crash-reporting, or analytics behavior changes.

## Content rating

The game contains stylized gross-out cartoon teddy imagery. It does not contain realistic violence, graphic gore, profanity, sexual content, gambling, loot boxes, chat, or user-generated content.

Do not manually force a final rating. Complete the current Apple and Google questionnaires accurately and accept the resulting regional ratings.

## Store artwork still required

Repository checks confirm that launcher icon resources exist, but that is not the same as approving final store artwork.

Human visual approval is required for:

- final 1024 × 1024 App Store icon;
- final 512 × 512 Google Play icon;
- 1024 × 500 Google Play feature graphic;
- current required iPhone screenshots;
- current required Android phone screenshots;
- optional tablet screenshots only if tablet support is intentionally marketed;
- launch-screen presentation on physical devices.

Do not use model sheets, expression sheets, contact sheets, posters, card frames, or unapproved AI drafts as store artwork.

## Internal testing gates

### TestFlight

- build processes without privacy-manifest errors;
- internal tester installs the app;
- airplane-mode launch works;
- all five Toxic Toby expressions load;
- exact unfinished progress restores after force close;
- share sheet and haptics fail gracefully;
- VoiceOver test is recorded;
- safe areas and orientation are approved.

### Google Play internal testing

- signed AAB uploads successfully;
- internal tester installs through Google Play;
- airplane-mode launch works;
- exact unfinished progress restores;
- Android Back works;
- TalkBack test is recorded;
- Play pre-launch report is reviewed;
- no unexpected permission, privacy, or stability warning remains unresolved.

## Production-access warning

A newly created personal Google Play developer account may require a qualifying closed test before production access. Verify the account type and current Play Console requirements before planning a public rollout.

## Final release evidence

Record all of the following in issue #18 before calling the phase complete:

```text
approved Git tag
iOS archive build ID
TestFlight build number and installation result
Android AAB SHA-256
Google Play internal release versionCode and installation result
privacy declaration review date
content-rating result
screenshot approval link
physical-device test records
open defects and waivers
```

## Completion rule

Repository infrastructure can be merged when all automated gates pass. Issue #18 remains open until signed TestFlight and Google Play internal builds install and launch on physical devices.
