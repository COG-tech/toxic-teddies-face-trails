# Game and Level Visual Reference

Source: owner-supplied mobile puzzle screenshot, 2026-07-24.

This reference defines **composition and readability**, not a style to copy. Toxic Teddies must keep its original hand-illustrated 2D grotesque world and must not imitate the reference game's branding, blue plastic rendering, HUD icons, currencies, or exact interface.

## What the reference gets right

- The puzzle is the dominant object on the screen.
- The overall face silhouette is readable immediately.
- The level number is easy to find without competing with the puzzle.
- The board is centered and has generous breathing room around the outer silhouette.
- Individual arrowheads are visible while still forming one dense character shape.
- Controls are pushed to the screen edges and bottom so the face remains unobstructed.
- Progression is visually simple: the player understands that the current screen is one self-contained level.
- The background supports the puzzle instead of becoming a second focal point.

## Toxic Teddies translation

### Portrait composition

- Design for portrait phone play first.
- Keep the playable Teddy face centered in the primary interaction zone.
- Target approximately 68–82% of the usable screen width for the full outer silhouette.
- Keep ears, chin, hanging props, and major mutations inside safe margins.
- Reserve the top region for Teddy name, expression/level, progress, and compact utility controls.
- Reserve the bottom region for expression navigation, accessibility actions, or contextual controls.
- Never place a persistent control over an eye, mouth, arrowhead, or likely exit lane.

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
3. Progress and feedback.
4. Hint, restart, back, accessibility, and settings.
5. Decorative atmosphere.

No currency counter, shop icon, advertising icon, or unrelated game system should outrank the face puzzle.

## Do not copy from the reference

- Blue beveled or plastic 3D tiles.
- The exact green gradient background.
- The exact top icon row, coins, shop controls, sound icon, or bottom booster buttons.
- The exact font, number treatment, shadows, panel shapes, or level layout.
- Any character silhouette, asset, branding, or commercial interface from the reference.

## Screenshot review checklist

A reviewer should be able to answer **yes** to all of these from a normal phone screenshot:

- Is the Teddy face the first thing I notice?
- Can I identify the Teddy without reading the name?
- Can I identify the expression from the eyes, brows, muzzle, and mouth?
- Can I see multiple arrowheads clearly?
- Does the face occupy most of the usable portrait area?
- Are all controls outside important face regions?
- Is the background quiet enough?
- Does the level look dense but still tappable?
- Does the puzzle feel like one designed face instead of a random pile of paths?
- Will removing the trails visibly reveal the character beneath them?

## Approval rule

This reference is now part of the second brain. Future level screenshots must be compared against this document before merge. Any intentional departure must be explained in the pull request and approved by the owner.
