# Asset and Content Pipeline — Native Mobile App

## Purpose

Define how canonical Toxic Teddies references become optimized, validated and locally bundled iOS/Android game content.

## Canonical source rule

For each Founding Teddy, maintain exactly one approved copy of:

- model reference sheet;
- five-expression sheet;
- approved square master scene when available;
- palette and identity metadata.

Expression sheets and model references are internal production references. They are not final in-app backdrops and their labels must not appear inside gameplay.

## Canonical naming

```text
TT_S1_001 / tt01 / Toxic Toby / Radioactive Ricky
TT_S1_002 / tt02 / Moldy Molly / Fungus Faye
...
TT_S1_012 / tt12 / Plague Bear / Sickly Sonny
```

Expression IDs:

```text
neutral
evil_grin
gross
angry
maniacal_laugh
```

Do not introduce alternate spelling, numbering or aliases.

## Source and production folders

```text
assets-source/
  references/
    tt01/
      model-reference.png
      expression-sheet.png
      square-master.png

assets/
  characters/
    tt01/
      master-1024.webp
      thumbnail-480.webp
  backdrops/
    tt01/
      neutral.webp
      evil-grin.webp
      gross.webp
      angry.webp
      maniacal-laugh.webp
  audio/
  icons/

mobile-resources/
  app-icon/
  splash/
  store/
    ios/
    android/
```

`assets-source/` is not required inside the shipped app package. Only approved production exports are bundled by Vite and synced into Capacitor.

## Backdrop export rules

Each backdrop must:

- show the correct Teddy and expression;
- use a consistent square crop;
- remove source-sheet labels and unused panels;
- contain no UI text, logo, card border or tagline;
- align major landmarks with the compiled maze;
- remain low enough in contrast that arrows dominate;
- use a dedicated file rather than CSS-positioning a full expression sheet;
- include production metadata in the backdrop manifest;
- be bundled locally for offline native play;
- be tested on iPhone and Android screen densities.

Suggested manifest entry:

```json
{
  "id": "tt01_neutral",
  "teddy_id": "tt01",
  "expression_id": "neutral",
  "src": "assets/backdrops/tt01/neutral.webp",
  "position_x": 50,
  "position_y": 44,
  "scale": 1.08,
  "opacity": 0.17,
  "contrast": 0.82,
  "saturation": 0.68,
  "blur_px": 0,
  "status": "approved",
  "version": 1,
  "bundled": true
}
```

Values are tuned per level.

## Arrow-mask workflow

1. Import the canonical expression reference.
2. Define the head silhouette.
3. Define major face regions:
   - left ear;
   - right ear;
   - button eye;
   - infected eye;
   - forehead seam/stitches;
   - cheek patch;
   - muzzle;
   - nose;
   - mouth/teeth;
   - contamination/slime;
   - outer fur silhouette.
4. Convert regions into a grid mask.
5. Generate compact orthogonal paths.
6. Assign true endpoints and exit directions.
7. Validate no overlap, crossing or self-intersection.
8. Solve the level under the production blocking rule.
9. Compare the arrow-only board against the reference.
10. Export level JSON and report.
11. Bundle only approved output into the mobile build.

## Level data contract

```json
{
  "schema_version": 1,
  "level_id": "tt01_neutral",
  "teddy_id": "tt01",
  "expression_id": "neutral",
  "grid_size": 57,
  "cell_size": 36,
  "pieces": [],
  "regions": {},
  "animation": {
    "pause_ms": 100,
    "minimum_exit_ms": 760,
    "maximum_exit_ms": 1400
  },
  "difficulty": {
    "path_count": 125,
    "initial_open_count": 0,
    "maximum_dependency_depth": 0,
    "rating": "intro"
  },
  "compiler_version": "1.0.0",
  "qa_status": "approved",
  "mobile_bundle_version": 1
}
```

All level files are versioned and validated.

## Difficulty data

Track:

- path count;
- average and maximum path length;
- average bend count;
- initial open-path count;
- blocking relationships;
- maximum dependency depth;
- density by facial region;
- viable choices by solve stage;
- hint use;
- completion and abandonment;
- iOS and Android interaction errors.

## Recognition gate

Test each level in three conditions:

1. Arrow geometry only.
2. Arrow geometry on neutral parchment.
3. Arrow geometry with final backdrop.

Approval requires:

- immediate Teddy-head recognition;
- recognizable face orientation;
- at least two character-specific features;
- acceptable expression recognition;
- no landmark conflict between maze and backdrop.

## Native packaging gate

Before `npx cap sync` for a release candidate:

- [ ] Every manifest path resolves in the Vite build.
- [ ] No source reference sheet is accidentally copied.
- [ ] No duplicate asset is bundled.
- [ ] Every playable level and backdrop works in airplane mode.
- [ ] Image dimensions and file sizes are recorded.
- [ ] iOS bundle contains the expected assets.
- [ ] Android bundle contains the expected assets.
- [ ] Store screenshots are exported separately from in-game assets.

## App icon and splash pipeline

Maintain approved master sources separately from generated platform outputs.

Required:

- square icon master with safe central artwork;
- iOS icon exports without transparency where required;
- Android adaptive foreground/background layers;
- launch/splash artwork that does not resemble a fake loading percentage;
- dark/light system-bar compatibility;
- store icon and feature graphic exports.

Do not use character expression sheets as store graphics.

## Character production order

1. `tt01` Toxic Toby
2. `tt02` Moldy Molly
3. `tt03` Dumpster Danny
4. `tt12` Plague Bear
5. `tt04` Sludge Sam
6. `tt05` Battery Barry
7. `tt06` Maggot Mitch
8. `tt07` Burger Bear
9. `tt08` Rusty Randy
10. `tt09` Acid Andy
11. `tt10` Gas Mask Max
12. `tt11` Patchwork Pat

## Per-Teddy completion checklist

- [ ] Canonical names match manifest.
- [ ] Model reference approved.
- [ ] Expression sheet approved.
- [ ] Five text-free backdrop exports.
- [ ] Five mask definitions.
- [ ] Five level JSON files.
- [ ] Five validation reports.
- [ ] Five backdrop manifest entries.
- [ ] Arrow-only recognition approved.
- [ ] iOS interaction approved.
- [ ] Android interaction approved.
- [ ] Airplane-mode asset loading approved.
- [ ] Difficulty progression approved.
- [ ] Asset sizes optimized.
- [ ] Character marked playable only after all gates pass.

## Prohibited shortcuts

- Reusing Toxic Toby level data for another Teddy.
- Reusing Toxic Toby backdrops for another Teddy.
- Shipping the complete expression sheet as a positioned sprite.
- Using generic bear outlines.
- Adding decorative facial features to rescue a weak maze.
- Publishing random runtime-generated levels.
- Treating AI turnarounds as exact model geometry.
- Uploading duplicate canonical sources.
- Embedding names or labels inside gameplay artwork.
- Loading the live website as the native app's primary content.
- Depending on network access for bundled launch levels.
