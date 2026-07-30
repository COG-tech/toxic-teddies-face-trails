# Game and Level Visual Reference

Sources:

- Owner-supplied mobile arrow-puzzle screenshot, 2026-07-24.
- Owner-supplied direct size comparison against the Toxic Toby phone build, 2026-07-30.

This reference defines **composition and readability**, not a style to copy. Toxic Teddies must keep its original hand-illustrated 2D grotesque world and must not imitate the reference game's branding, cream rendering, HUD icons, currencies, or exact interface.

## What the reference gets right

- The puzzle is the dominant object on the screen.
- The puzzle uses nearly the full safe width rather than sitting as a small object inside a large poster.
- The overall silhouette is readable immediately.
- The level number is easy to find without competing with the puzzle.
- Individual arrowheads are visible while still forming one dense designed shape.
- Controls are compact and pushed to the screen edges.
- Persistent top and bottom chrome consumes little vertical space.
- Progression is visually simple: the player understands that the current screen is one self-contained level.
- The background supports the puzzle instead of becoming a second focal point.

## Toxic Teddies translation

### Gameplay-first portrait composition

- Design for portrait phone play first.
- The actual arrow puzzle is the first allocation of screen space, not the background or menu cards.
- Keep the playable Teddy face centered in the primary interaction zone.
- Target approximately **88–94% of usable gameplay width** for the actual rendered outer path bounds when the silhouette permits it.
- Target at least **52% of usable portrait gameplay height** for the actual rendered path bounds when the silhouette permits it.
- Keep ears, chin, hanging props, arrowheads, and exit lanes inside safe margins.
- The combined persistent top header, status/feedback area, and bottom controls should normally remain at or below approximately **24% of gameplay height**.
- Compress title, progress, feedback, expression navigation, and accessibility triggers before reducing the puzzle.
- A compact menu may overlay decorative perimeter artwork, but it must not cover paths or exits.
- Never place a persistent control over an eye, mouth, arrowhead, face-critical feature, or likely exit lane.

### Background crop policy

- Full visibility of the 9:16 environment is not more important than puzzle size.
- The environment may be center-cropped or trimmed at the top, bottom, or sides to maximize the playable arrow area.
- Never stretch or distort the background image.
- Preserve the calm central panel behind the puzzle.
- Preserve enough peripheral pipes, vats, machinery, slime, warning details, or framing to retain the environment identity.
- Decorative top and bottom frame detail is the first material that may be cropped when vertical space is needed.
- A layout that displays more illustration but makes the arrow puzzle materially smaller fails this reference.

### Puzzle silhouette

- The trail geometry itself must describe the Teddy's head, ears, eyes, muzzle, mouth, damage, mutation, and major prop shapes.
- From a quick glance or a reduced thumbnail, the player should still recognize the intended Teddy and expression.
- The silhouette must remain readable before any path is removed.
- Decorations may strengthen identity but must not be the only reason the face is recognizable.
- The outer boundary should feel intentionally designed, not like an arbitrary square grid clipped into a face.

### Trail density and arrowheads

- Use dense coverage comparable to the reference, but preserve readable spacing and touch targets.
- Arrowheads must remain distinct at normal phone size and in high-contrast mode.
- Exit directions should feel visually distributed rather than clustering every arrow in one direction.
- Face-critical regions may use shorter or more tightly controlled trails to preserve expression readability.
- Do not increase difficulty by making arrowheads tiny, hiding them under art, or reducing contrast.

### Background and reveal behavior

- During play, the background remains secondary and low contrast.
- The expression image or placeholder sits directly behind the same face area.
- As trails leave, the player increasingly sees the completed expression beneath them.
- At completion, the clean expression artwork becomes the primary visual reward.
- Until the owner supplies approved final images, use the existing clearly marked placeholders only.

### Interface hierarchy

1. Playable Teddy face puzzle.
2. Current Teddy and expression/level.
3. Progress and immediate move feedback.
4. Hint, restart, back, accessibility, and expression navigation.
5. Decorative atmosphere.

No currency counter, shop icon, advertising icon, large persistent accessibility panel, or unrelated game system should outrank the face puzzle.

## Do not copy from the reference

- The exact cream surface or brown line style.
- The exact top icon row, lives, palette button, light bulb, settings icon, or progress graphic.
- The exact font, number treatment, shadows, panel shapes, or level layout.
- Any character silhouette, asset, branding, or commercial interface from the reference.

## Screenshot review checklist

A reviewer should be able to answer **yes** to all of these from a normal phone screenshot:

- Is the arrow puzzle the first thing I notice?
- Does the puzzle occupy nearly the full safe width?
- Is the Teddy face centered and immediately recognizable?
- Can I identify the expression from the eyes, brows, muzzle, and mouth?
- Can I see multiple arrowheads clearly?
- Does the face occupy most of the usable portrait interaction area?
- Are the top and bottom menus compact rather than large cards?
- Are all controls outside important face regions and exit lanes?
- Has background detail been cropped when necessary instead of shrinking the puzzle?
- Is the background quiet enough?
- Does the level look dense but still tappable?
- Does the puzzle feel like one designed face instead of a random pile of paths?
- Will removing the trails visibly reveal the character beneath them?

## Approval rule

This reference is part of the second brain. Future level screenshots and gameplay-layout changes must be compared against this document before merge. Any intentional departure must be explained in the pull request and approved by the owner.
