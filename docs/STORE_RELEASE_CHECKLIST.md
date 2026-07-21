# Store Release Checklist

## App identity

- [ ] Final app name approved.
- [ ] Bundle ID/Application ID locked.
- [ ] Marketing version set.
- [ ] iOS build number set.
- [ ] Android versionCode set.
- [ ] Copyright and developer name confirmed.

## Apple App Store

- [ ] Apple Developer membership active.
- [ ] App Store Connect app record created.
- [ ] Bundle ID registered.
- [ ] Signing team configured in Xcode.
- [ ] App icon set complete.
- [ ] Launch screen approved.
- [ ] PrivacyInfo.xcprivacy created and accurate.
- [ ] App Privacy questionnaire completed.
- [ ] Age rating completed.
- [ ] App category selected.
- [ ] Subtitle and description approved.
- [ ] Keywords approved.
- [ ] Support and privacy URLs available.
- [ ] iPhone screenshots approved.
- [ ] iPad screenshots supplied if tablet support is claimed.
- [ ] TestFlight internal build passes.
- [ ] TestFlight external test passes where required.
- [ ] Review notes explain offline bundled gameplay and native features.
- [ ] Production archive uploaded.
- [ ] App Review submission completed.

## Google Play

- [ ] Google Play Console developer account active.
- [ ] App record created.
- [ ] Application ID locked.
- [ ] Play App Signing configured.
- [ ] Upload key secured outside Git.
- [ ] Android App Bundle generated.
- [ ] Target SDK requirement met.
- [ ] Data Safety form completed.
- [ ] Content rating completed.
- [ ] Ads declaration completed.
- [ ] App access declaration completed.
- [ ] Short and full descriptions approved.
- [ ] App icon approved.
- [ ] Feature graphic approved.
- [ ] Phone screenshots approved.
- [ ] Tablet screenshots provided if tablet support is claimed.
- [ ] Internal testing release passes.
- [ ] Closed testing requirement completed where applicable.
- [ ] Pre-launch report reviewed.
- [ ] Production rollout configured.

## Functional store-readiness

- [ ] App launches without network access.
- [ ] Toxic Toby's five launch levels are bundled.
- [ ] Exact progress survives force close/relaunch.
- [ ] Exact progress survives app update.
- [ ] Native haptics fail gracefully on unsupported devices.
- [ ] Native share sheet works.
- [ ] Android system Back works.
- [ ] iOS safe areas work.
- [ ] No browser/PWA install copy appears.
- [ ] No remote website is used as the primary app experience.
- [ ] No unfinished Teddy appears playable.
- [ ] No crash, freeze or blank screen in release configuration.

## Privacy and permissions

- [ ] No unnecessary permission requested.
- [ ] Analytics collection matches store declarations.
- [ ] No continuous raw touch data collected.
- [ ] Privacy policy matches actual behavior.
- [ ] Data deletion/contact process documented if accounts are later added.
- [ ] Third-party SDK disclosures are complete.

## Release evidence

- [ ] Approved Git tag recorded.
- [ ] iOS archive corresponds to approved tag.
- [ ] Android AAB corresponds to approved tag.
- [ ] Release notes approved.
- [ ] Rollback/hotfix plan documented.
- [ ] Post-install smoke test completed from TestFlight.
- [ ] Post-install smoke test completed from Google Play testing track.
