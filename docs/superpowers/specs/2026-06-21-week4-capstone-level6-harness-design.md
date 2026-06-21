# Week 4 Capstone — Portfolio to Level 6 (Harness Engineering) — Design

**Date:** 2026-06-21
**Author:** Nguyen Phu Tan (with Claude Code)
**Exercise:** Week 4 — Capstone: Build Your Project to Level 6
**Path:** A — Week 2 React portfolio

---

## Problem

The Week 2 portfolio already has the *feature* (live project search) and a
*test suite* (21 passing tests across 3 files), but it has no automated gate and
no foundation context doc. On the 8-Level Agentic Engineering ladder it sits at
**Level 5**: it uses tools/tests but has no automated safety net that catches
failures and lets an agent self-correct without a human checking every step.

Two gaps stand between it and **Level 6 (Harness Engineering)**:

1. **L3/L4 foundation** — there is no `CLAUDE.md` / rules file.
2. **L6 gate** — the only CI workflow (`deploy.yml`) builds and deploys on push
   to `main`; it does **not** run tests or lint. There is no backpressure.

This capstone closes exactly those two gaps and then proves the gate works with
a deliberate red → green failure demo.

## Goals

- Add a focused, practical `CLAUDE.md` that satisfies L3/L4 and genuinely guides
  an agent working in this repo.
- Add a **new** GitHub Actions CI workflow that runs lint + tests + build on
  every push and pull request, and **blocks on failure**.
- Demonstrate backpressure: introduce one deliberate test failure on a throwaway
  branch, capture the RED CI run, fix it, capture the GREEN run.
- Open a fully-filled capstone PR on a fresh `week4-capstone` branch.

## Non-Goals (YAGNI)

- No pre-commit hook (CI-only gate chosen).
- No Level 7 / Level 8 stretch goals.
- No changes to `deploy.yml` (deploy stays `main`-only).
- No new feature code, no refactors.
- No `--max-warnings 0` cleanup of the 266 pre-existing template lint warnings.

## Key Decisions

1. **CI is a separate workflow from deploy.** A new `.github/workflows/ci.yml`
   handles the quality gate; `deploy.yml` is left untouched. CI runs broadly
   (push + PR, all branches); deploy stays narrow (`main` only).

2. **The gate fails on errors, not pre-existing warnings.** Lint currently
   reports 0 errors / 266 warnings (template patterns). CI runs `npm run lint`
   *without* `--max-warnings 0`, so the gate is meaningful (fails on real errors)
   rather than noisy (failing on inherited template warnings).

3. **`CLAUDE.md` is focused & practical, not exhaustive.** It documents the
   overview, commands, the search architecture (pure logic + thin components),
   test conventions, and the "tests/lint/build must pass" gate rule — enough to
   satisfy L3/L4 and steer an agent, without duplicating the existing tutorials.

4. **The deliberate failure is a flipped assertion in
   `portfolioSearch.test.js`.** One obviously-wrong line (a matching query
   asserted to return zero results), easy to explain and trivially reversible.

5. **Capstone work lands on a fresh `week4-capstone` branch** cut from the
   current `week2-claude-code-exercise/portfolio-search` branch, which already
   contains the feature and existing tests.

## Components

### 1. L3/L4 Foundation — `CLAUDE.md` (root)

Sections:
- **Overview** — personalized React portfolio with live project search.
- **Commands** — `npm run dev | build | test | test:watch | lint`.
- **Search architecture** — pure match logic in `src/hooks/utils/portfolioSearch.js`
  (framework-agnostic, unit-tested) + thin React components
  (`PortfolioSearchBar`, `PortfolioEmptyState`). New search logic goes in the
  pure module so it stays testable.
- **Test conventions** — Vitest + React Testing Library; co-located
  `*.test.{js,jsx}`; prefer pure-logic tests over render tests.
- **The gate rule** — tests, lint, and build must pass before merge; CI enforces
  this on every push and PR.

### 2. L6 Harness — `.github/workflows/ci.yml`

- **Triggers:** `push` (all branches) + `pull_request`. The push trigger is what
  makes the red → green branch demo surface as CI runs.
- **Steps:** checkout → setup-node (18) → `npm ci` → `npm run lint` →
  `npm test` → `npm run build`.
- **Blocking:** any failing step fails the job, which blocks the PR merge — the
  backpressure.
- **Bonus:** the `lint` step satisfies the optional lint/type-check bonus; the
  `build` step doubles as a smoke check.

### 3. Backpressure demo (red → green)

1. Branch `demo/backpressure-red` off `week4-capstone`.
2. Flip one assertion in `portfolioSearch.test.js` so a matching query is
   asserted to return zero results.
3. Push → open a draft PR → capture the RED CI run (failed check / Actions log).
4. Revert the one line → push → capture the GREEN run.
5. Red → green pair + logs go into the capstone PR description.

### 4. The capstone PR

- Branch: `week4-capstone`.
- Title: `[NguyenPhuTan] Week 4 — Capstone: Build to Level 6`.
- Body: the provided template, fully filled — path A checked; current level
  (5 → 6); foundation evidence (`CLAUDE.md` + the search feature as the working
  tool/skill); harness build; red → green evidence; bonus (lint in gate); L7/L8
  marked not-attempted; reflection + 60-second share.

## Acceptance Criteria

- [ ] `CLAUDE.md` exists at repo root with the sections above (L3/L4 evidence).
- [ ] `.github/workflows/ci.yml` runs lint + test + build on push and PR.
- [ ] `deploy.yml` is unchanged.
- [ ] Locally, `npm run lint && npm test && npm run build` all pass.
- [ ] RED captured: a CI run failing on the deliberate flipped assertion.
- [ ] GREEN captured: the same CI passing after the one-line revert.
- [ ] Capstone PR opened on `week4-capstone` with the template fully filled and
      evidence attached.

## Verification

The harness *is* the test. Primary verification is the red CI run failing and
the green CI run passing. Locally, confirm `npm run lint`, `npm test`, and
`npm run build` all pass before pushing.
