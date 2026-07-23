# Locked Decisions

A locked decision cannot be changed silently. A change requires explicit owner approval, a new decision entry, migration impact, test impact, and rollback plan.

## D-001 — Brand promise

**The face is the puzzle.** Every playable level must visibly belong to the actual Teddy, not a generic puzzle wearing a theme.

## D-002 — Native product architecture

The production target is an installed iOS and Android app using Capacitor. GitHub Pages is a prototype/demo surface only. Production must bundle local content and must not depend on a remote `server.url`.

## D-003 — Deterministic level pipeline

Levels are precompiled and solver-verified. Runtime random generation is forbidden. Invalid geometry, duplicate paths, overlaps, disconnected paths, self-intersections, or unsolved level orders must fail validation.

## D-004 — Preserve proven interactions

The verified click/tap selection, screen-space hit testing, blocked-path feedback, head-first removal, exact save recovery, and expression progression must not be replaced casually. Changes require focused regression tests and browser/native validation.

## D-005 — Honest content states

Only a Teddy with complete approved levels and content may be playable. Never load Toxic Toby as a hidden fallback for an unfinished Teddy. Unfinished characters remain **COMING SOON**.

## D-006 — Founding 12 and expression order

The Founding 12 names and IDs are fixed. Every Teddy uses five expression positions in this order:

1. Neutral
2. Evil Grin
3. Gross
4. Angry
5. Maniacal Laugh

## D-007 — Artwork control

No final character artwork may be generated, redrawn, substituted, restyled, moved, or approved without the owner. Placeholder UI may be built while artwork is pending, but it must be clearly non-final and easy to replace.

## D-008 — Toxic Feed scope

The Toxic Feed is fictional authored in-app content. It has no public profiles, stranger messaging, user posting, user uploads, or real social-network dependency. A Teddy's feed unlocks only after all five expressions are completed.

## D-009 — Save truthfulness

Completion, feed unlocks, viewed posts, and exact unfinished path state must persist. A restart or direct URL must never grant completion or bypass an unlock.

## D-010 — Evidence standard

Automated tests prove repository behavior only. Physical-device, accessibility, participant-research, artwork-approval, signing, and store-upload work stays marked pending until real evidence exists.

## D-011 — Visual style

Toxic Teddies remains unified hand-illustrated 2D grotesque cartoon art. Do not drift into photorealistic, 3D, CGI, clay, plastic-toy photography, infographic, random poster, contact-sheet, card-system, or coloring-page-grid directions.

## D-012 — Canonical production control

Use one controlled production pipeline and one canonical status record. Do not create competing trackers, duplicate manifests, duplicate character files, or alternate sources of truth.

## D-013 — Canonical app design system

The owner-supplied **Toxic Teddies Design System 1.0.0, July 2026** is the canonical visual and component standard. Its recorded colors, typography, spacing scale, responsive grid, buttons, forms, cards, navigation, alerts, badges, completion-modal direction and accessibility requirements may not be silently replaced by a different design system.

The design board defines visual and component concepts. It does not by itself prove that star ratings, completion times, achievements, difficulty selectors, profile forms, collection screens or other shown concepts are implemented. Those require separate approval, development and testing.
