# Toxic Teddies: Arrow Escape

A calm sequential arrow-clearing puzzle where every board is arranged to look like the face of an original Toxic Teddy.

This is **not** a tracing game.

## Core mechanic

- Each puzzle is a grid of directional arrow tiles.
- The tiles collectively form a recognizable Toxic Teddy face.
- A tile can leave only when its arrow has a completely open lane to the perimeter.
- Removing a tile clears its lane and can free arrows that were trapped behind it.
- Tapping a blocked arrow costs one toxic-drop life.
- Long-pressing any arrow previews its path and highlights the first blocker.
- The puzzle is solved when every arrow has slid off the board.

## Content structure

The game contains 12 Founding Teddies with five increasingly difficult puzzles each:

1. Toxic Toby / Radioactive Ricky
2. Moldy Molly / Fungus Faye
3. Dumpster Danny / Trashcan Travis
4. Sludge Sam / Gooey Grant
5. Battery Barry / Leaking Leon
6. Maggot Mitch / Wormy Walt
7. Burger Bear / Greasy Gina
8. Rusty Randy / Corroded Cory
9. Acid Andy / Meltdown Mel
10. Gas Mask Max / Fumey Frank
11. Patchwork Pat / Quilted Quinn
12. Plague Bear / Sickly Sonny

Total: **60 puzzles**.

## Difficulty progression

1. Easy — 7×7 Teddy face grid
2. Gross — 9×9 Teddy face grid
3. Toxic — 11×11 Teddy face grid
4. Vile — 13×13 Teddy face grid
5. Legendary — 15×15 Teddy face grid

Higher levels contain more tiles and stronger dependency chains, so more arrows must be removed in the correct order.

## Experience rules

- no countdown timer;
- no flashing visual clutter;
- smooth directional slide animations;
- three toxic-drop lives;
- deterministic, guaranteed-solvable boards;
- local progress saving;
- responsive mouse, touch, and stylus input;
- offline play through a service worker cache.

## Project files

```text
index.html
styles.css
arrow-extras.css
app.js
characters.js
manifest.webmanifest
sw.js
```

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The source files can also be served directly through GitHub Pages from `main` and `/ (root)`.
