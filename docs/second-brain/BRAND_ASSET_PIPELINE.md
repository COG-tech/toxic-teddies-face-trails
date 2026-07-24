# Brand Asset Pipeline

Updated: 2026-07-24

This document records the exact proven method used to place the owner-approved Toxic Teddies loading artwork into the browser, Android and iOS builds. Read this before changing the opening artwork, home logo treatment, static brand images, or first-paint loading behavior.

## Canonical loading artwork

- Approved artwork: Toxic Teddies Arrow Escape with Toxic Toby in the radioactive laboratory.
- Runtime filename: `assets/branding/loading/toxic-teddies-loading.webp`.
- Build source parts: `src/generated/loading-image-approved-part-01.txt` through `loading-image-approved-part-05.txt`.
- Expected byte size: `64,450` bytes.
- Expected SHA-256: `a0a6a06e34b538027b755427d0a24026b988d69705468dff1bf075e2286198ed`.

## Why this method works

The artwork is not imported into JavaScript and is not delivered as a data URI. Essential first-paint art must exist as a normal image file before application JavaScript runs.

The build pipeline works in this order:

1. `scripts/materialize-brand-assets.mjs` reads the five approved Base64 source parts.
2. The script joins and decodes them into WebP bytes.
3. It rejects the image if the byte length, SHA-256, RIFF signature, or WebP signature is wrong.
4. It writes the validated image to `public/assets/branding/loading/toxic-teddies-loading.webp`.
5. Vite copies the `public` file unchanged into `dist/assets/branding/loading/toxic-teddies-loading.webp`.
6. The browser publication workflow copies the verified Vite output under `/play/`.
7. Capacitor sync copies the same verified `dist` bundle into the Android and iOS projects.
8. The service worker caches the same runtime path for offline browser use.

## HTML loading rule

`index.html` must preload the image and give the splash image a direct source:

```html
<link rel="preload" as="image" type="image/webp" href="./assets/branding/loading/toxic-teddies-loading.webp" />
<img src="./assets/branding/loading/toxic-teddies-loading.webp" ... />
```

This lets the browser request and paint the image immediately. The loading image must never wait for a JavaScript import, Base64 conversion, or DOM source assignment.

## Home logo rule

The custom Toxic Head font file is not bundled. The exact illustrated Toxic Teddies lettering is therefore shown by cropping the approved artwork inside `.home-brand-logo`. A hidden semantic `h1` remains for accessibility.

Do not replace the illustrated logo with a generic heavy font. Do not distribute or invent a substitute font file.

## Loading-bar rule

The green bar is already painted inside the artwork, so a plain transparent glow can appear permanently full. The runtime overlay must:

- darken the complete illustrated fluid lane;
- reveal a bright fill from left to right;
- move only toward the latest real startup-stage target;
- visibly reach 100 percent before the splash leaves;
- use a minimum full-motion presentation of 1,800 ms;
- use the shorter 700 ms presentation when reduced motion is requested;
- stop and expose the startup failure screen if application startup fails.

The controller lives in `src/app/loading-screen.js`. The aligned visual mask and fill live in `src/design-system/loading-screen.css`.

## Replacing the approved image

A replacement requires explicit owner approval. After approval:

1. Convert the final image to WebP at the approved dimensions and quality.
2. Split its Base64 text into deterministic source parts small enough for repository tooling.
3. Replace all `loading-image-approved-part-XX.txt` files as one reviewed change.
4. Update the expected byte length and SHA-256 in `scripts/materialize-brand-assets.mjs`.
5. Run `npm run prepare:build`.
6. Confirm the generated file has RIFF and WEBP signatures.
7. Run the full quality, browser, Android, iOS and store workflows.
8. Advance the browser/service-worker cache version.
9. Confirm the published image on a real phone before closing the visual gate.

## Never repeat

- Do not embed essential opening artwork in a JavaScript module.
- Do not use a Base64 data URI as the splash image source.
- Do not hand-edit generated files under `/play/`.
- Do not depend on CSS background URLs that are outside Vite's verified output.
- Do not change the approved artwork, crop, filename, checksum, or cache version silently.
- Do not mark the image verified from CI alone; owner phone confirmation remains a separate gate.
