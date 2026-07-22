# Store Artwork Requirements

Store artwork is a human visual-approval gate. Existing launcher resources prove that the projects build; they do not automatically become approved store artwork.

## Locked creative rule

**The face is the puzzle.**

Every store asset must accurately show the current Toxic Toby launch build. Do not advertise the other eleven Teddies as playable. They may appear only as clearly labeled `Coming soon` collection content.

Do not use:

- model or turnaround sheets;
- expression contact sheets;
- card frames or booster-pack designs;
- unapproved character substitutions;
- generic arrows placed over an unrelated bear image;
- text claiming rankings, awards, prices, discounts, or download totals.

## Apple App Store

### App icon

- 1024 × 1024 source artwork.
- No transparency in the uploaded store icon.
- No small text.
- Toxic Toby must remain readable at small sizes.
- Keep critical face features inside a generous center safe area.

### iPhone screenshots

Prepare 5–7 portrait screenshots from the installed native app. Capture a current accepted 6.9-inch iPhone size, then provide additional device sets only when App Store Connect requires them.

Recommended sequence:

1. Home collection — Toxic Toby playable, remaining Teddies honestly marked Coming soon.
2. Neutral expression — arrows visibly form the face.
3. Blocked-path feedback — selected trail and visible blocker.
4. Head-first trail removal in motion.
5. Level-complete screen.
6. Accessibility settings.
7. Exact progress restored after relaunch.

Screenshot text overlays are optional. When used, keep them short and outside important gameplay regions.

## Google Play

### Store icon

- 512 × 512 px.
- 32-bit PNG with alpha.
- Maximum 1,024 KB.
- Do not add ranking, price, category, or Google Play badges.

### Feature graphic

- 1024 × 500 px.
- JPEG or 24-bit PNG without alpha.
- Keep the central face and arrow-trail idea readable at reduced size.
- Avoid fine detail and excessive text.

### Phone screenshots

- Minimum two screenshots are required.
- Use at least four portrait screenshots at 1080 × 1920 or higher for stronger merchandising eligibility.
- PNG or JPEG without alpha.
- Show real in-game UI from the current build.
- Do not include fingers, obsolete device frames, third-party marks, rankings, pricing, or calls to install.
- Add concise accessibility alt text in Play Console.

## Required source files before submission

```text
store/assets/approved/
  apple-app-icon-1024.png
  google-play-icon-512.png
  google-play-feature-1024x500.png
  apple/iphone-6.9/
  google/phone/
  APPROVAL.md
```

The `approved` directory should be created only after final visual sign-off. Do not place drafts there.

## Approval record

`APPROVAL.md` must record:

- approver;
- approval date;
- source asset or commit;
- character/expression shown;
- app build used for screenshots;
- confirmation that store images match current gameplay;
- confirmation that no unfinished Teddy is presented as playable.
