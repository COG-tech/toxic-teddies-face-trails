# Asset and Content Pipeline

## Purpose

This document defines how canonical Toxic Teddies references become safe, consistent and playable Arrow Escape content.

## Source assets

For each Founding Teddy, maintain exactly one canonical copy of:

- model reference sheet;
- five-expression sheet;
- approved square master scene when available;
- palette and identity metadata.

Expression sheets and model references are internal production references. They are not final in-game backdrops and should not be shown with their labels inside the active puzzle.

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

Do not introduce alternate spelling, numbering or aliases in filenames.

## Recommended source folder

```text
assets-source/
  references/
    tt01/
      model-reference.png
      expression-sheet.png
      square-master.png
    ...
```

The source folder may be excluded from the production deployment if files are too large or contain working references not needed by the app.

## Production asset folder

```text
assets/
  characters/
    tt01/
      master-1024.webp
      thumbnail-480.webp
      social-1200x630.webp

  backdrops/
    tt01/
      neutral.webp
      evil-grin.webp
      gross.webp
      angry.webp
      maniacal-laugh.webp
```

## Backdrop export rules

Each backdrop must:

- show the correct Teddy and expression;
- use a consistent square crop;
- remove source-sheet labels and unused panels;
- contain no UI text, logo, card border or tagline;
- align major landmarks with the compiled maze;
- remain low enough in contrast that arrows dominate;
- use a dedicated file rather than CSS-positioning a full expression sheet;
- include production metadata in the backdrop manifest.

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
  "version": 1
}
```

Values are tuned per level. Do not use one global opacity blindly.

## Arrow-mask production workflow

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
4. Convert the regions into a grid mask.
5. Generate compact orthogonal paths.
6. Assign true endpoints and exit directions.
7. Validate no overlap, crossing or self-intersection.
8. Solve the level under the production blocking rule.
9. Compare the arrow-only board against the character reference.
10. Export level JSON and report.

## Level data contract

Each level file should contain:

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
  "qa_status": "approved"
}
```

The exact schema can evolve, but all level files must be versioned and validated.

## Difficulty rules

Do not use path count as the only difficulty measurement.

Track:

- path count;
- average and maximum path length;
- average bend count;
- initial open-path count;
- number of blocking relationships;
- maximum dependency depth;
- density by facial region;
- number of viable choices by solve stage;
- hint use during testing;
- completion and abandonment rates.

## Recognition gate

Every level is tested in three conditions:

1. Arrow geometry only.
2. Arrow geometry on neutral parchment.
3. Arrow geometry with final backdrop.

Approval requires:

- immediate Teddy-head recognition;
- recognizable face orientation;
- at least two character-specific features;
- expression recognition at an acceptable rate;
- no major landmark conflict between maze and backdrop.

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

The first four provide strong visual contrast and expose different mask challenges.

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
- [ ] Mobile and desktop interaction approved.
- [ ] Difficulty progression approved.
- [ ] Asset sizes optimized.
- [ ] Character marked playable only after all required gates pass.

## Prohibited production shortcuts

- Reusing Toxic Toby level data for another Teddy.
- Reusing Toxic Toby backdrops for another Teddy.
- Shipping the complete expression sheet as a positioned sprite.
- Using generic bear outlines.
- Adding decorative eyes/nose/mouth to compensate for a weak maze.
- Publishing random browser-generated levels.
- Treating an AI turnaround as mathematically exact model geometry.
- Uploading duplicate copies of the same canonical source.
- Embedding character names or level labels inside final gameplay artwork.
