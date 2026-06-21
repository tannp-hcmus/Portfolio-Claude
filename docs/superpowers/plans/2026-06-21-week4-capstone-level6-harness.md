# Week 4 Capstone — Level-6 Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the Week 2 React portfolio from Level 5 to Level 6 by adding a `CLAUDE.md` foundation doc and a GitHub Actions CI gate that runs lint + test + build on every push/PR, then prove backpressure with a red → green demo.

**Architecture:** Two additive files — `CLAUDE.md` at repo root (L3/L4 context) and `.github/workflows/ci.yml` (L6 gate). The existing `deploy.yml`, feature code, and 21 passing tests are left untouched. Backpressure is proven by flipping one assertion in `portfolioSearch.test.js` on a throwaway branch (RED), then reverting it (GREEN).

**Tech Stack:** React 18 + Vite 6, Vitest 3 + React Testing Library, ESLint 9 (flat config), GitHub Actions, Node 20 (jsdom@29 requires Node 20+; Node 18 fails with ERR_REQUIRE_ESM).

---

## File Structure

- **Create:** `CLAUDE.md` — repo-root context/rules doc (L3/L4 foundation).
- **Create:** `.github/workflows/ci.yml` — quality gate workflow (L6 harness).
- **Touch (temporarily, on a throwaway branch only):** `src/hooks/utils/portfolioSearch.test.js` — one flipped assertion for the red → green demo, then reverted.
- **Unchanged:** `.github/workflows/deploy.yml`, all `src/` feature code, `package.json`.

The capstone work is committed on the `week4-capstone` branch (already checked out, already holds the design spec). The demo uses a child branch `demo/backpressure-red`.

---

## Task 1: Add the L3/L4 foundation — `CLAUDE.md`

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Write `CLAUDE.md`**

Create `CLAUDE.md` at the repo root with exactly this content:

```markdown
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
```

- [ ] **Step 2: Verify the file exists and is non-empty**

Run: `test -s CLAUDE.md && echo OK`
Expected: `OK`

- [ ] **Step 3: Confirm the documented commands actually pass**

Run: `npm run lint && npm test && npm run build`
Expected: lint finishes with `0 errors` (warnings are fine), Vitest reports `21 passed`, and the Vite build completes with `built in ...`.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md foundation doc (L3/L4)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Add the L6 harness — CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write the CI workflow**

Create `.github/workflows/ci.yml` with exactly this content:

```yaml
name: CI

on:
  push:
  pull_request:

jobs:
  build-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test

      - name: Build
        run: npm run build
```

- [ ] **Step 2: Lint the YAML locally for obvious syntax errors**

Run: `node -e "const fs=require('fs');const s=fs.readFileSync('.github/workflows/ci.yml','utf8');if(!/jobs:/.test(s)||!/npm test/.test(s)){throw new Error('ci.yml missing required content')}console.log('ci.yml OK')"`
Expected: `ci.yml OK`

- [ ] **Step 3: Confirm `deploy.yml` is untouched**

Run: `git status --porcelain .github/workflows/`
Expected: only `?? .github/workflows/ci.yml` (no `M .github/workflows/deploy.yml`).

- [ ] **Step 4: Re-run the gate steps locally to mirror CI**

Run: `npm ci && npm run lint && npm test && npm run build`
Expected: all four succeed — `npm ci` installs cleanly, lint `0 errors`, `21 passed`, build completes.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add lint+test+build gate on push and PR (L6 harness)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 6: Push the branch so CI runs**

```bash
git push -u origin week4-capstone
```

Expected: branch pushed; the CI workflow triggers on GitHub. Open the **Actions** tab and confirm the `CI` run on `week4-capstone` goes **green**. Capture this green run for the PR (baseline-passing evidence).

---

## Task 3: Backpressure demo — RED (failure caught)

**Files:**
- Modify (temporarily): `src/hooks/utils/portfolioSearch.test.js`

- [ ] **Step 1: Create the throwaway demo branch off `week4-capstone`**

```bash
git checkout -b demo/backpressure-red
```

Expected: `Switched to a new branch 'demo/backpressure-red'`.

- [ ] **Step 2: Flip one assertion to make a passing test fail**

In `src/hooks/utils/portfolioSearch.test.js`, find this existing assertion in the `itemMatchesQuery` block:

```javascript
    it("matches on a tag", () => {
        expect(itemMatchesQuery(ITEMS[0], "reactjs")).toBe(true)
    })
```

Change `true` to `false` so the test asserts the wrong thing (a matching query is wrongly expected to NOT match):

```javascript
    it("matches on a tag", () => {
        expect(itemMatchesQuery(ITEMS[0], "reactjs")).toBe(false)
    })
```

- [ ] **Step 3: Run the test locally to verify it FAILS**

Run: `npm test`
Expected: FAIL — Vitest reports 1 failed test in `portfolioSearch.test.js`, "matches on a tag", `expected true to be false`.

- [ ] **Step 4: Commit and push the deliberate break**

```bash
git add src/hooks/utils/portfolioSearch.test.js
git commit -m "test: deliberately break tag-match assertion (backpressure demo)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
git push -u origin demo/backpressure-red
```

- [ ] **Step 5: Open a draft PR and capture the RED run**

```bash
gh pr create --base week4-capstone --head demo/backpressure-red \
  --title "DEMO: backpressure red (do not merge)" \
  --body "Intentional failure to prove the CI gate catches it. Will be reverted." \
  --draft
```

Expected: PR created. In the **Actions** tab / PR checks, the `CI` run fails at the **Test** step. **Capture a screenshot/log of the RED run** for the capstone PR.

---

## Task 4: Backpressure demo — GREEN (fixed)

**Files:**
- Modify: `src/hooks/utils/portfolioSearch.test.js` (revert the break)

- [ ] **Step 1: Revert the assertion back to correct**

In `src/hooks/utils/portfolioSearch.test.js`, change the assertion back:

```javascript
    it("matches on a tag", () => {
        expect(itemMatchesQuery(ITEMS[0], "reactjs")).toBe(true)
    })
```

- [ ] **Step 2: Run the test locally to verify it PASSES**

Run: `npm test`
Expected: PASS — `21 passed`.

- [ ] **Step 3: Commit and push the fix**

```bash
git add src/hooks/utils/portfolioSearch.test.js
git commit -m "test: revert deliberate break — gate goes green (backpressure demo)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
git push
```

- [ ] **Step 4: Capture the GREEN run**

Expected: the same demo PR's `CI` check now passes (all steps green). **Capture a screenshot/log of the GREEN run.** The RED → GREEN pair is the backpressure proof.

- [ ] **Step 5: Close the demo PR without merging**

```bash
gh pr close demo/backpressure-red
```

Expected: the demo PR is closed (it has served its purpose; the demo branch is not merged into `week4-capstone`).

- [ ] **Step 6: Return to the capstone branch**

```bash
git checkout week4-capstone
```

Expected: `Switched to branch 'week4-capstone'`.

---

## Task 5: Open the capstone PR

**Files:** none (uses GitHub).

- [ ] **Step 1: Create the capstone PR against `main`**

Write the PR body to a temp file first (so the template renders cleanly), then create the PR. Fill every `___`/checkbox with real values and paste the captured RED/GREEN evidence links.

```bash
gh pr create --base main --head week4-capstone \
  --title "[NguyenPhuTan] Week 4 — Capstone: Build to Level 6" \
  --body-file /private/tmp/claude-501/-Users-tannp-Company-react-portfolio-template/681c8d92-7d07-455d-84d9-40e3dc3add97/scratchpad/capstone-pr-body.md
```

The PR body must use the exercise's template and fill in:
- **Task path:** check **A — Week 2 React portfolio**.
- **Current level:** project = personalized React portfolio + live search; before = Level 5; target = Level 6.
- **Foundation evidence:** L3/L4 → link to `CLAUDE.md`; L5 → the live-search feature (`portfolioSearch.js` + `PortfolioSearchBar`/`PortfolioEmptyState`) as the working tool/skill, plus the 21-test Vitest suite.
- **Harness build:** (1) Vitest + RTL covering `portfolioSearch` logic, search bar, and empty state — 21 passing; files linked. (2) GitHub Actions `ci.yml` running lint+test+build on push/PR, blocking on failure.
- **Backpressure demo:** flipped tag-match assertion → RED CI run (link/screenshot) → reverted → GREEN CI run (link/screenshot).
- **Bonus:** check "lint/type-check in the gate" (the `Lint` step in `ci.yml`).
- **L7/L8:** mark not attempted.
- **Reflection + 60-second share:** fill in honestly.

- [ ] **Step 2: Verify the PR was created and points the right way**

Run: `gh pr view --json title,baseRefName,headRefName,url`
Expected: title is `[NguyenPhuTan] Week 4 — Capstone: Build to Level 6`, `baseRefName` = `main`, `headRefName` = `week4-capstone`.

- [ ] **Step 3: Confirm the capstone branch's own CI is green**

Open the **Actions** tab for the `week4-capstone` branch / the capstone PR checks.
Expected: the `CI` run passes (lint + test + build all green) — the harness gating the capstone PR itself.

---

## Self-Review (completed during planning)

- **Spec coverage:** CLAUDE.md (Task 1), ci.yml gate (Task 2), red demo (Task 3), green demo (Task 4), capstone PR (Task 5). `deploy.yml` untouched is verified in Task 2 Step 3. Non-goals (no pre-commit, no L7/L8, no warning cleanup) are respected — none introduced.
- **Placeholder scan:** all file contents are written out in full; no TBD/TODO. The only `___` left for the human is inside the PR-body template in Task 5, which is inherently per-author evidence (screenshots) — explicitly itemized.
- **Type consistency:** function names referenced (`stripHtml`, `normalize`, `itemMatchesQuery`, `filterPortfolioItems`) match the actual exports in `src/hooks/utils/portfolioSearch.js`; the flipped assertion matches the real existing test ("matches on a tag" → `itemMatchesQuery(ITEMS[0], "reactjs")`).
```
