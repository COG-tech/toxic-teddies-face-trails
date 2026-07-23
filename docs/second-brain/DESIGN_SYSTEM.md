# Toxic Teddies App Design System

Source: owner-supplied **Toxic Teddies Design System** board, version `1.0.0`, July 2026.

This file records what the supplied design-system board defines for the app. It is a visual and component standard. It does not replace the separate gameplay, level-geometry, save, analytics, native-build, or store-release systems.

## 1. Brand identity

- Game name: **Toxic Teddies**.
- Product type: grotesque, nostalgic arrow-escape puzzle game.
- Core promise: **The Teddy face is the puzzle.**
- Logo direction: dripping/slimy Toxic Teddies lettering.
- Recurring motifs: radiation, stitching, mold, grime, corrosion, distressed paper, dirty plush and collectible-card framing.
- Overall atmosphere: dark, gross-out, humorous, collectible and approachable rather than realistic horror.
- Tagline example shown in the board: **Radiation makes everything better.**

## 2. Design principles

### Playful & Nostalgic

Evokes 1980s–1990s collectible culture.

### Gross but Approachable

Humor meets horror in a friendly, entertaining way.

### Clarity First

Controls, labels, cards and game states must always remain readable and tappable.

### Consistent & Scalable

The system must support additional Teddies, expressions, levels, cards, achievements and future content without visual drift.

### Inclusive & Accessible

The app must be designed for broad usability rather than treating accessibility as an afterthought.

## 3. Primary color palette

| Token | Hex | Intended role |
|---|---:|---|
| Toxic Green | `#8DBB13` | Primary actions, progress, selected navigation and success highlights |
| Slime Green | `#B7E24B` | Bright toxic accents, active states and glow |
| Rust Orange | `#A84F18` | Rust, damage, corrosion and destructive accents |
| Mold Olive | `#6F762C` | Muted toxic panels, mold areas and subdued backgrounds |
| Patch Purple | `#8F456D` | Stitching, alternate actions and character accents |

## 4. Secondary color palette

| Token | Hex | Intended role |
|---|---:|---|
| Acid Yellow | `#E7D32D` | Attention, collectibles and high-energy highlights |
| Sewer Teal | `#3E7C7B` | Information and secondary system states |
| Warning Amber | `#D8A72D` | Warnings and limited-resource states |
| Blood Red | `#8C1D1D` | Errors, danger and failed actions |
| Stitch Pink | `#C97CA3` | Secondary buttons, textile details and stitched accents |

## 5. Neutral color palette

| Token | Hex | Intended role |
|---|---:|---|
| Parchment 100 | `#F3E4BD` | Bright parchment panels and readable content surfaces |
| Parchment 300 | `#D8BF8A` | Darker parchment, borders and secondary surfaces |
| Brown 700 | `#382D1F` | Frames, shadows, distressed structure and dark trim |
| Ink 900 | `#1D160F` | Main dark text and interface areas |
| Grime 900 | `#0F0C08` | App background and deepest shadows |

## 6. Approved gradients

| Gradient | From | To | Suggested role |
|---|---:|---:|---|
| Toxic Glow | `#B7E24B` | `#7AA10F` | Primary buttons, progress, active states and toxic glow |
| Rust Fade | `#A84F18` | `#6E341D` | Damage, danger and rust-themed surfaces |
| Sewer Fade | `#3E7C7B` | `#1F4F4F` | Informational states and secondary panels |

## 7. Typography system

### Display font

- **Toxic Head — custom**.
- Used for the logo, major branded display text and high-impact titles.
- The custom display treatment must remain legible and should not be used for long body copy.

### Body font

- **Inter — system**.
- Used for interface copy, instructions, labels, descriptions, metadata and accessibility-sensitive text.

### Type scale

| Style | Size / line height | Weight |
|---|---:|---|
| H1 — Level Title | `48px / 56px` | Bold |
| H2 — Section Title | `32px / 40px` | Bold |
| H3 — Card Title | `24px / 32px` | Bold |
| H4 — Button / Label | `18px / 24px` | Semi Bold |
| Body Large | `16px / 24px` | Regular |
| Body | `14px / 20px` | Regular |
| Small | `12px / 16px` | Regular |
| Micro | `11px / 14px` | Regular |

## 8. Spacing and layout system

### Spacing scale

The board uses a four-pixel base scale:

```text
4, 8, 12, 16, 24, 32, 64
```

Use it for margins, padding, component gaps, card spacing, button spacing, navigation spacing and modal composition.

### Grid

- Twelve-column responsive grid.
- Portrait mobile remains the primary game layout even though the system adapts to larger screens.

### Breakpoints

| Device class | Width |
|---|---:|
| Mobile | `0–479px` |
| Tablet | `480–767px` |
| Desktop | `768–1099px` |
| Wide | `1100px+` |

## 9. Button system

### Primary buttons

Examples shown:

- `PLAY NOW`
- `NEXT LEVEL`

Required states:

- Default
- Hover
- Active
- Disabled

Primary actions use Toxic Green/Slime Green emphasis, strong outlines and highly readable labels.

### Secondary buttons

Example shown:

- `VIEW COLLECTION`

Required states:

- Default
- Hover
- Active
- Disabled

Secondary actions use Patch Purple/Stitch Pink or another clearly subordinate treatment.

### Icon buttons

Examples shown:

- Settings
- Sound
- Help
- Locked/unavailable action

Required states:

- Default
- Hover
- Active
- Disabled

Icon-only actions require accessible labels and visible focus states.

## 10. Form elements

The system defines:

### Text inputs

- Default
- Focused
- Error
- Error explanation text beneath the input

### Dropdowns

- Closed state
- Open menu
- Selected option

Difficulty examples shown:

- Easy
- Medium
- Hard
- Nightmare

### Selection controls

- Checkbox unchecked
- Checkbox checked
- Toggle off
- Toggle on
- Radio button unselected
- Radio button selected

These components may support settings, accessibility preferences, difficulty selection and later profile/configuration systems.

## 11. Card system

### Teddy collection card

Contains:

- Teddy artwork
- Teddy name
- Number of expressions completed
- Progress bar
- Toxic distressed frame

Example:

```text
TOXIC TOBY
5/5 Completed
```

### Expression or level card

Contains:

- Expression name
- Teddy image
- Arrow count
- Difficulty or performance stars

Example:

```text
NEUTRAL
125 Arrows
★★★☆☆
```

### Locked or coming-soon card

Contains:

- Desaturated character artwork
- Padlock icon
- `COMING SOON`
- Clear disabled state

This component must respect the product rule that unfinished Teddies never appear playable and never fall back to Toxic Toby content.

## 12. Navigation system

### Desktop/tablet top navigation

- Toxic Teddies icon
- Play
- Collection
- How to Play
- Settings

### Mobile bottom navigation

- Play
- Collection
- Levels
- Settings
- More

The selected destination uses Toxic Green emphasis. Navigation must remain secondary to the active face puzzle.

## 13. Alert system

| Type | Color family | Example shown |
|---|---|---|
| Success | Green | `Level completed! Great job!` |
| Warning | Amber | `No more hints available.` |
| Error | Red | `Connection lost. Please try again.` |
| Information | Teal | `New content available!` |

Each alert includes:

- Status icon
- Message
- Appropriate semantic color
- Dismiss control

Because core puzzle play is offline-first, connection alerts apply only to optional online features and must not imply that a local puzzle requires a network connection.

## 14. Badge and achievement system

The board proposes:

1. **First Clear**
2. **Perfect**
3. **Speed Demon**
4. **Collector**
5. **Survivor**
6. **Toxic Master**

Possible reward purposes shown or implied by the board:

- First completion
- Clean/perfect completion
- Fast completion
- Collection progress
- Survival or difficult completion
- Full Teddy or full-series mastery

These are design-system concepts, not yet proof that the achievement logic is implemented.

## 15. Level-complete modal

The board defines a completion modal containing:

- Clean Teddy artwork
- `LEVEL COMPLETE!`
- Number of arrows cleared
- Three-star performance rating
- Completion time
- Next Level button
- View Collection button
- Close button
- Parchment background
- Slime/grime decoration

For the current Toxic Toby product flow, the canonical mapping is:

```text
EXPRESSION CLEARED
→ reveal the clean expression or approved placeholder
→ Replay
→ Share
→ Next Expression
```

After expression five:

```text
TOXIC TOBY COMPLETED
5 / 5 expressions cleared
PRIVATE FEED UNLOCKED
```

The board's stars and completion-time treatment are visual-system options. They are not automatically implemented gameplay rules unless separately approved and developed.

## 16. Game-screen visual direction

The design system establishes that:

- The Teddy face remains the primary screen object.
- Dark grime backgrounds establish atmosphere.
- Parchment surfaces carry readable information.
- Toxic Green identifies active, selected and successful actions.
- Controls remain compact and secondary.
- Character art remains grotesque, illustrated and clearly 2D.
- The experience must not become generic, glossy, photorealistic, plastic, clay-like or 3D.

For exact portrait puzzle composition and level readability, also follow `VISUAL_REFERENCE.md`.

## 17. Accessibility standards

The board explicitly requires:

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen-reader-friendly controls
- High-contrast support
- Reduced-motion support

The component examples also require:

- Visible focus states
- Clear disabled states
- Text labels for important actions
- Sufficiently large touch targets
- Readable contrast
- No information communicated by color alone

Accessibility claims remain subject to real VoiceOver, TalkBack, keyboard and target-device evidence.

## 18. Responsive behavior

The system adapts across:

- Mobile phones
- Tablets
- Desktop browser builds
- Wide screens

Phone behavior:

- Mobile navigation may use a bottom bar.
- Cards stack or scroll without becoming too small.
- The face puzzle receives most of the usable viewport.
- Completion actions stack vertically when space is limited.
- Touch targets remain large.
- Safe areas remain clear on notched and gesture-navigation devices.

## 19. Character-content structure

The design-system board supports these content types:

- Teddy collection
- Individual Teddy cards
- Five-expression completion progress
- Expression/level cards
- Arrow count
- Star rating
- Locked characters
- Coming-soon characters
- Achievement badges
- Completion rewards
- Collection navigation

These are UI/content patterns. Their underlying data and unlock logic must remain manifest-driven and tested.

## 20. Design-system version

```text
Version 1.0.0
July 2026
```

This identifies the visual design system and is separate from the app software version, native build numbers, content version, save schema and compiler version.

## 21. What this design system does not define

The board does not define:

- Puzzle-path geometry
- Blocker calculations
- Save and exact restoration logic
- Level-generation or compiler rules
- Solver verification
- Toxic Feed post content
- Analytics implementation
- Store signing
- Final artwork for every Teddy
- Exact arrow counts for every future level
- Whether star ratings, completion times, difficulty selectors or achievements are currently implemented

Those remain separate product, content and engineering decisions.

## Implementation rule

Any new or changed app screen must be reviewed against this file and `VISUAL_REFERENCE.md`. A pull request must state which design-system sections it uses, which parts remain unimplemented, and whether the work changes only presentation or also changes gameplay behavior.
