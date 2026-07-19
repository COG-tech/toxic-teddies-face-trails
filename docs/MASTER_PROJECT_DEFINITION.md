# Toxic Teddies: Arrow Escape — Master Project Definition

## Locked product statement

**Toxic Teddies: Arrow Escape is a calm sequential arrow-clearing puzzle game. Every board is made from directional arrow tiles arranged to form the recognizable face of one original Toxic Teddy.**

The player does not trace a path. The player studies the direction of every arrow, identifies which arrow has a completely open lane to the perimeter, and removes the arrows in a safe order until the Teddy face is cleared.

## Non-negotiable rules

> The game is a sequential arrow-order puzzle, not a tracing game.

> The complete arrow layout must visibly resemble the active Toxic Teddy’s face.

The arrow mosaic must communicate:

- teddy head silhouette;
- two ears;
- button or damaged eye;
- infected eye;
- nose;
- mouth;
- central stitches or scars;
- character-specific toxic mutation colors and shapes.

## Core gameplay mechanics

### Sequential clearing

A directional tile is removable only when no active tile blocks the straight lane from its arrow tip to the board perimeter.

### Unlocking lanes

When a tile slides away, its former position becomes empty. That opening can release one or more arrows that were previously trapped behind it.

### Strategic planning

The player must inspect the board and choose a safe order. Tapping a blocked arrow removes one toxic-drop life.

### Built-in assistance

Long-pressing any arrow highlights its planned trajectory. If the lane is blocked, the first blocking arrow is identified. The hint button highlights one currently removable arrow.

### Completion

The level is complete when every arrow tile has slid off the board.

## Experience rules

The game must feel quiet, clear, and tactile:

- no countdown timers;
- no rapid flashing effects;
- no unnecessary interface clutter;
- smooth directional slide animations;
- responsive touch, mouse, and stylus input;
- three toxic-drop lives;
- offline operation after first load;
- automatic local progress saving.

## Founding 12

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

## Level structure

Each Founding Teddy receives five increasingly difficult face puzzles.

| Level | Difficulty | Grid |
|---|---|---|
| 1 | Easy | 7×7 |
| 2 | Gross | 9×9 |
| 3 | Toxic | 11×11 |
| 4 | Vile | 13×13 |
| 5 | Legendary | 15×15 |

Total launch structure: **12 Teddies × 5 levels = 60 puzzles**.

Higher difficulty means:

- more arrow tiles;
- denser facial detail;
- longer dependency chains;
- fewer immediately open lanes;
- more careful ordering required.

## Puzzle-generation contract

Every generated board must be guaranteed solvable.

The generator works by reverse construction:

1. Start with the full Teddy-face mask.
2. Select a tile that currently has an open lane to the perimeter.
3. Assign that tile its outward direction.
4. Remove it from the construction state.
5. Prefer later tiles whose lanes depend on previously removed positions.
6. Repeat until every tile has a direction and a valid removal sequence.
7. Restore all tiles for play.

The resulting level may allow more than one safe move, but it must always contain at least one valid move until completion.

## Visual construction

The arrow board itself is the character artwork.

Tile colors and regions establish:

- fur;
- dark button eye;
- infected bright eye;
- nose;
- mouth;
- stitched forehead;
- character-specific mutation pattern.

Examples:

- Toxic Toby: radioactive forehead and cheek arrows;
- Moldy Molly: fungus clusters;
- Dumpster Danny: trash-lid upper face;
- Gas Mask Max: respirator-shaped central region;
- Plague Bear: dark beak-shaped facial region.

## Technical direction

- standards-based HTML, CSS, and JavaScript;
- CSS Grid directional-tile board;
- deterministic procedural puzzle generation;
- Pointer Events for touch, mouse, and stylus;
- localStorage for level progress;
- Service Worker caching for offline play;
- static deployment through GitHub Pages;
- no backend required for the first release.

## Acceptance criteria

The game is acceptable only when:

1. Clicking a clear arrow slides it smoothly off-screen.
2. Clicking a blocked arrow costs exactly one life.
3. Removing arrows can unlock previously blocked arrows.
4. Long-press previews the selected arrow’s trajectory.
5. A blocker is visibly identified during trajectory preview.
6. Every generated level is solvable.
7. Each board reads as a Toxic Teddy face before any move.
8. All 12 Teddies have five levels.
9. Level completion unlocks the next difficulty for that Teddy.
10. Progress survives browser restarts.
11. The game works on mobile and desktop.
12. The game works offline after its first successful load.
