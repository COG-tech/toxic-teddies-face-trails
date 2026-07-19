# Toxic Teddies: Face Trails — Master Project Definition

## Locked product statement

**Toxic Teddies: Face Trails is a collectible tracing puzzle game in which every level map is built from the face of an original Toxic Teddy.** Players follow directional paths through the Teddy’s ears, eyes, scars, stitches, mouth, slime, mold, masks, cracks, and mutations. They receive three toxic-drop lives, lose a drop for tracing errors, and reveal the complete full-color character when the face-map is solved. Every finished level unlocks that Teddy in the player’s collection.

## Non-negotiable rule

> One Toxic Teddy equals one face-shaped tracing map.

The puzzle must be recognizable as the character before completion. Never place an unrelated maze over a Teddy image.

## Core loop

1. Select a Teddy.
2. Start at the highlighted point.
3. Trace each ordered facial path in the arrow direction.
4. Lose a toxic drop for leaving the path, starting incorrectly, moving backward, jumping between segments, or lifting early.
5. Complete every segment.
6. Reveal and collect the full-color Teddy.

## First playable set

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

The wider Series 1 target remains 41 artworks with A/B names, creating 82 collectible identities.

## Prototype scope

The first prototype uses Moldy Molly and must provide:

- responsive web gameplay;
- mouse, touch, and stylus input;
- SVG-to-screen coordinate conversion;
- configurable path tolerance;
- direction validation;
- ordered segment completion;
- jump prevention;
- three toxic-drop lives;
- reset and retry;
- local completion storage;
- full-color reveal;
- JSON-driven level data;
- a reusable engine that can load a second Teddy without being rewritten.

## Asset contract

```text
assets/teddies/<character_slug>/
  character.json
  face_map.svg
  face_map.json
  completed_reveal.svg
  thumbnail.svg                 # later
  optional_sound.mp3            # later
```

No level-specific geometry belongs inside the tracing engine. The engine reads SVG paths and JSON configuration.

## Technical direction

- Vite
- standards-based HTML/CSS/JavaScript
- SVG maps
- Pointer Events
- localStorage for prototype progress
- GitHub source control
- deployable to GitHub Pages or Cloudflare Pages

A backend, authentication, purchases, advertisements, cloud sync, and physical-card systems are explicitly outside the first prototype.

## Prototype acceptance criteria

The prototype is acceptable only when:

1. The unsolved map visibly forms Moldy Molly’s face.
2. Tracing works on desktop and mobile.
3. Leaving the path removes a life.
4. Wrong-way movement removes a life.
5. A player cannot jump between disconnected paths.
6. Three toxic drops display and update correctly.
7. Reset works without refreshing.
8. Completion is detected reliably.
9. The full-color Teddy reveal appears.
10. Completion persists after reopening the browser.
11. The map comes from SVG and JSON assets.
12. A second level can use the same engine unchanged.
