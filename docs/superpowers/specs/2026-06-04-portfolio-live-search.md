# Portfolio Live Search — Spec

**Date:** 2026-06-04
**Author:** Nguyen Phu Tan (with Claude Code)
**Exercise:** Week 2 — Claude Code Exercise (Default path)

---

## Problem

The starter portfolio (`react-portfolio-template`) ships with demo content and a
Portfolio section that can only be filtered by category buttons (All / Apps /
Web / Utilities). For a real portfolio we need:

1. Truthful, personalized content (profile, skills, projects).
2. A live text search over projects, layered on top of the existing category
   filter, with good UX and accessibility.
3. Automated unit tests — the starter has **no test runner at all**.

## Goals

- Personalize `profile`, `skills` (≥8), and `portfolio` (≥6 projects) with real,
  truthful content categorized into Apps / Web / Utilities.
- Add a search bar **between the category buttons and the project grid** that:
  - Matches each project's **title, tags, and description**, case-insensitively.
  - Only searches **within the currently selected category**.
  - Is **debounced ~300ms** so the grid doesn't flicker on every keystroke.
  - Shows a **clear (×) button** when there is text; clicking it empties the box
    and returns focus to the input.
  - Shows a **friendly empty state** (not a browser alert) with a way to reset
    when nothing matches.
  - Is **keyboard- and screen-reader-accessible**: labeled field, result-count
    changes announced.
  - Stays **full-width and readable on mobile**.
- Add a **test runner** (Vitest + React Testing Library) and `npm test`.
- At least **3 unit tests** for the search covering: empty query shows all,
  matching query shows only matches, no-match shows the empty state, and
  (optional) clear resets the list.

## Non-Goals

- EmailJS / contact-form setup (optional in the exercise).
- Server-side search or fuzzy/typo-tolerant search — substring match is enough.
- Searching across other sections (skills, experience, etc.).
- Persisting the search query across navigation (category persistence already
  exists in the template; search resets per visit is acceptable).

## Key Decisions

1. **Pure logic separated from UI.** The match/filter logic lives in a
   framework-agnostic module (`portfolioSearch.js`) so it can be unit-tested
   without rendering React or mocking providers. The React components stay thin.

2. **Search is scoped to the selected category.** The grid first calls the
   existing `getOrderedItemsFilteredBy(categoryId)`, then applies the text
   filter on that already-scoped list. This composes cleanly with the existing
   category mechanism instead of replacing it.

3. **Debounce via a small reusable hook** (`useDebouncedValue`) rather than
   inline `setTimeout` logic, so the 300ms behavior is isolated and reusable.

4. **English-only locale content is acceptable.** The template's
   `getTranslation`/`getString` fall back to the default language (`en`) when a
   locale key is missing, so real English content renders correctly across all
   four supported languages without translating every project.

5. **Empty state only appears for an active search.** When the result list is
   empty because a *category* has no items (not because of a search), the grid
   renders normally — the "No projects match your search / Reset" UI is reserved
   for the case where the user actually typed a query.

6. **Add an ESLint flat config.** The starter declares a `lint` script and
   ESLint deps but ships **no config file**, so `npm run lint` fails out of the
   box. A standard Vite-React flat config is added so the documented command
   works. Pre-existing template patterns (factory helpers named `useX` that are
   not React hooks) are demoted to warnings so the existing codebase stays green.

## Acceptance Criteria

- [ ] Profile shows real name, role, and a 2–4 sentence bio.
- [ ] Skills section has ≥8 real skills.
- [ ] Portfolio has ≥6 truthful projects with tags and category IDs.
- [ ] Category buttons filter projects (All + Apps + Web + Utilities).
- [ ] Search filters title, tags, and description; debounced; clear + empty
      state work; accessible; full-width on mobile.
- [ ] ≥3 unit tests for live search pass via `npm test`.
- [ ] `npm run build`, `npm run lint`, and `npm run test` all pass.

## Test Scenarios (must be covered)

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Empty search box, a category selected | All projects for that category appear |
| 2 | Query matching a title / tag / description | Only matching projects appear (case-insensitive) |
| 3 | Query matching nothing | Empty state shown (zero cards) |
| 4 | Click clear (×) | Search resets, full category list returns, focus back in input |

## Risks / Edge Cases

- Descriptions contain HTML (`<b>…</b>`) → must strip tags before matching.
- `tags` may be missing/non-array on some items → guard with `[]` fallback.
- Falsy query of only whitespace must behave like empty (show all).
- Debounce cleanup must clear the pending timeout to avoid stale updates.
