# Architecture Decision Register

This file records product and technical decisions that should not be repeatedly reopened without new evidence.

## ADR-001 — GitHub Pages remains the deployment target

Decision:

- Deploy from `main` and repository root through GitHub Pages.
- No Cloudflare dependency.
- No custom GitHub Actions deployment workflow is required.

Reason:

- The current product is a static browser/PWA game.
- The existing live site already uses GitHub Pages.
- Keeping deployment simple reduces operational risk.

## ADR-002 — Preserve and modularize the existing browser game

Decision:

- Do not rewrite the app in Flutter or another large framework.
- Incrementally extract modules from the working JavaScript prototype.

Reason:

- The current SVG renderer and geometric click system already work.
- A rewrite would risk losing interaction behavior without creating immediate user value.

## ADR-003 — Production levels are precompiled

Decision:

- The Python compiler generates and validates production level JSON.
- The browser does not randomly create production puzzles.

Reason:

- Character recognition, fairness and solvability require deterministic authored output.

## ADR-004 — The arrow paths construct the character

Decision:

- Character-defining face regions must be represented primarily by playable path geometry.
- Backdrop artwork is secondary support.

Reason:

- This is the product's core differentiation.

## ADR-005 — One canonical content manifest

Decision:

- Characters, expressions, level availability and backdrops are manifest-driven.
- Unavailable characters never fall back to another Teddy's content.

Reason:

- Hard-coded duplicates and fallbacks create incorrect characters, false availability and naming drift.

## ADR-006 — Dedicated backdrop files

Decision:

- Use one text-free backdrop file per Teddy and expression.
- Do not ship the complete expression sheet and reposition it with CSS.

Reason:

- Dedicated exports provide predictable alignment, smaller files and no accidental labels.

## ADR-007 — Input behavior is owned by one controller

Decision:

- All pointer selection uses one input-controller module.
- Presentation layers have no pointer events.
- Visible arrowheads may be small while effective geometric selection remains generous.

Reason:

- Competing SVG, board and document handlers previously caused broken interaction.

## ADR-008 — Blocking must be visibly explainable

Decision:

- The production rule uses visible active-path geometry.
- A blocked result returns the blocker identity and highlights it.
- Hidden forced order is prohibited.

Reason:

- Players interpreted unexplained rejection as a broken game.

Open validation:

- Whether blocked taps should ever cost a toxic-drop life remains a research question.
- Lives remain disabled during fairness validation.

## ADR-009 — Progress stores exact board state

Decision:

- Persist removed/active path IDs, level version and compiler version.
- Use versioned durable storage.

Reason:

- Completion-only storage does not support real resume behavior.

## ADR-010 — Service-worker cache is not progress storage

Decision:

- PWA caches store application and content assets only.
- User progress uses IndexedDB or an equivalent durable application store.

Reason:

- Cache replacement must not erase or corrupt progress.

## ADR-011 — Design system is separated from character artwork

Decision:

- Names, labels, progress, warnings, borders and buttons are rendered by HTML/CSS.
- Final character/backdrop art contains no interface text.

Reason:

- This protects spelling, accessibility, responsiveness and consistency.

## ADR-012 — One complete Teddy production unit at a time

Decision:

- A Teddy is completed as five expressions, five backdrops, five levels, five reports and one QA package before the next Teddy moves to production.

Reason:

- Parallel uncontrolled generation would multiply visual, naming and difficulty inconsistency.

## ADR-013 — Mobile-first interaction

Decision:

- Portrait mobile is the primary layout.
- Desktop is a responsive enhancement.
- Touch accuracy cannot be used as a source of difficulty.

Reason:

- The target audience is expected to play in short mobile sessions.

## ADR-014 — Accessibility is a base requirement

Decision:

- WCAG 2.1 AA, reduced motion, high contrast, keyboard access and screen-reader state are included in the architecture.

Reason:

- Retrofitting accessibility after 60 levels would be more expensive and less reliable.

## ADR-015 — Runtime `eval()` is temporary

Decision:

- Replace `dense-loader.js` runtime fetch-and-eval composition through incremental module migration.
- Do not remove it until the baseline interaction tests exist.

Reason:

- `eval()` makes debugging, security policy and testing harder, but immediate removal could break the current game.

## ADR-016 — Product availability is honest

Decision:

- The UI may show the 60-level roadmap, but playable counts include only approved content.
- Coming-soon characters remain visibly unavailable.

Reason:

- False availability undermines trust and currently risks loading Toxic Toby data for other characters.
