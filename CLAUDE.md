# CLAUDE.md

Context and rules for agents working in this repository.

## Overview

A personalized React portfolio (forked from `react-portfolio-template`) with a
**live project search** feature layered on top of the existing category filter.
The Portfolio section lets a visitor filter projects by category (All / Apps /
Web / Utilities) and then text-search within the selected category by title,
tags, and description.

## Commands

- `npm run dev` — start the Vite dev server.
- `npm run build` — production build (also acts as a CI smoke check).
- `npm test` — run the Vitest suite once (CI uses this).
- `npm run test:watch` — Vitest in watch mode for local development.
- `npm run lint` — ESLint over the repo.

## Search architecture

Keep the match/filter logic **pure and framework-agnostic** so it can be
unit-tested without rendering React:

- `src/hooks/utils/portfolioSearch.js` — pure functions: `stripHtml`,
  `normalize`, `itemMatchesQuery`, `filterPortfolioItems`. **New search logic
  goes here.**
- `src/components/generic/PortfolioSearchBar.jsx` — thin debounced input.
- `src/components/generic/PortfolioEmptyState.jsx` — friendly "no matches" UI.

When changing search behavior, put the logic in `portfolioSearch.js` and cover
it with unit tests; keep the React components thin.

## Test conventions

- Vitest + React Testing Library; jsdom environment (see `vite.config.js`).
- Tests are co-located next to their source as `*.test.js` / `*.test.jsx`.
- Prefer pure-logic tests (against `portfolioSearch.js`) over render tests.

## The gate rule

`npm run lint`, `npm test`, and `npm run build` must all pass before merge.
CI (`.github/workflows/ci.yml`) enforces this on every push and pull request —
a failing step blocks the merge. Do not merge red.
