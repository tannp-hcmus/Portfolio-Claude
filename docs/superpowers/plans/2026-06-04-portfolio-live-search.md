# Portfolio Live Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Personalize the portfolio content and add a debounced, accessible live search over projects in the Portfolio section, backed by a Vitest unit-test suite.

**Architecture:** Keep the match/filter logic in a pure, framework-agnostic module so it is unit-testable in isolation. A small `useDebouncedValue` hook delays grid updates ~300ms. Two thin React components (`PortfolioSearchBar`, `PortfolioEmptyState`) handle UI/a11y. `ArticlePortfolio` owns the search state and composes the text filter on top of the existing category filter (`getOrderedItemsFilteredBy`). i18n strings are added to `strings.json` and fall back to English.

**Tech Stack:** React 18, Vite 6, Bootstrap 5 (SCSS), Vitest 3 + React Testing Library + jsdom, ESLint 9 (flat config).

**Spec:** `docs/superpowers/specs/2026-06-04-portfolio-live-search.md`

---

## File Structure

- `public/data/profile.json` — real name/role/bio (modify)
- `public/data/sections/cover.json` — bio, contact, remove placeholder testimonials (modify)
- `public/data/sections/skills.json` — 12 real skills (modify)
- `public/data/sections/portfolio.json` — 8 real projects, Apps/Web/Utilities (modify)
- `public/data/strings.json` — search i18n strings, 4 locales (modify)
- `src/hooks/utils/portfolioSearch.js` — pure search logic (create)
- `src/hooks/utils/useDebouncedValue.js` — debounce hook (create)
- `src/components/generic/PortfolioSearchBar.jsx` + `.scss` — search input UI (create)
- `src/components/generic/PortfolioEmptyState.jsx` — no-results UI (create)
- `src/components/articles/ArticlePortfolio.jsx` + `.scss` — wire search into grid (modify)
- `vite.config.js` — Vitest config block (modify)
- `eslint.config.js` — flat config so `npm run lint` works (create)
- `src/test/setup.js` — RTL/jest-dom setup (create)
- `package.json` — `test` / `test:watch` scripts (modify)
- Test files: `portfolioSearch.test.js`, `PortfolioSearchBar.test.jsx`, `PortfolioEmptyState.test.jsx` (create)

---

## Task 1: Set up the test runner

**Files:**
- Modify: `vite.config.js`
- Modify: `package.json` (scripts)
- Create: `src/test/setup.js`
- Create: `eslint.config.js`

- [ ] **Step 1: Install dev dependencies**

```bash
npm install -D vitest@^3 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Add the Vitest config block to `vite.config.js`**

Add `/// <reference types="vitest/config" />` at the top and a `test` block:

```js
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.js'],
        css: false,
    },
```

- [ ] **Step 3: Create `src/test/setup.js`**

```js
import "@testing-library/jest-dom/vitest"
import { afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

afterEach(() => {
    cleanup()
})
```

- [ ] **Step 4: Add scripts to `package.json`**

```json
"test": "vitest run",
"test:watch": "vitest",
```

- [ ] **Step 5: Add `eslint.config.js`** (the starter ships a `lint` script with no config)

A flat config that uses `@eslint/js`, `eslint-plugin-react-hooks`,
`eslint-plugin-react-refresh`, and `globals`; ignores `dist`/`node_modules`/`npm`;
demotes `react-hooks/rules-of-hooks`, `no-empty`, `no-case-declarations` to
`warn` (the template's `useX` factory helpers trip rules-of-hooks); adds a test
override exposing `globals.vitest`.

- [ ] **Step 6: Sanity-check the runner with a throwaway test, then remove it**

Run: `npx vitest run src/test/sanity.test.js`
Expected: PASS (`typeof window !== 'undefined'`). Delete the file after.

- [ ] **Step 7: Verify lint passes**

Run: `npm run lint`
Expected: exit 0 (warnings only, all pre-existing template files).

- [ ] **Step 8: Commit**

```bash
git add vite.config.js package.json package-lock.json src/test/setup.js eslint.config.js
git commit -m "chore: add Vitest + RTL test runner and eslint flat config"
```

---

## Task 2: Pure search logic (TDD)

**Files:**
- Create: `src/hooks/utils/portfolioSearch.js`
- Test: `src/hooks/utils/portfolioSearch.test.js`

- [ ] **Step 1: Write the failing tests**

```js
import { describe, it, expect } from "vitest"
import { filterPortfolioItems, itemMatchesQuery, normalize } from "./portfolioSearch.js"

const ITEMS = [
    { id: 1, locales: { title: "Smart Task Manager", text: "A task management system with a <b>real-time</b> dashboard.", tags: ["Laravel", "ReactJS", "MySQL"] } },
    { id: 2, locales: { title: "URL Shortener Service", text: "A link-shortening tool with click analytics.", tags: ["Node.js", "Express", "MongoDB"] } },
    { id: 3, locales: { title: "E-Commerce Platform", text: "Online store optimized with Redis caching.", tags: ["Laravel", "Vue.js", "Redis"] } },
]

it("normalize strips HTML, lowercases, trims", () => {
    expect(normalize("  <b>Hello</b> WORLD  ")).toBe("hello  world")
})
it("empty query returns all", () => {
    expect(filterPortfolioItems(ITEMS, "")).toHaveLength(3)
})
it("matches title / tag / description case-insensitively", () => {
    expect(filterPortfolioItems(ITEMS, "shortener")).toHaveLength(1)
    expect(filterPortfolioItems(ITEMS, "LARAVEL").map(i => i.id)).toEqual([1, 3])
    expect(filterPortfolioItems(ITEMS, "caching")[0].id).toBe(3)
})
it("no match returns empty array", () => {
    expect(filterPortfolioItems(ITEMS, "nonexistent-xyz")).toHaveLength(0)
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/hooks/utils/portfolioSearch.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `portfolioSearch.js`**

```js
export function stripHtml(value) {
    if (!value) return ""
    return String(value).replace(/<[^>]*>/g, " ")
}
export function normalize(value) {
    return stripHtml(value).toLowerCase().trim()
}
export function itemMatchesQuery(item, query) {
    const needle = normalize(query)
    if (!needle) return true
    if (!item) return false
    const locales = item.locales || {}
    const title = normalize(locales.title)
    const description = normalize(locales.text)
    const tags = Array.isArray(locales.tags) ? locales.tags.map(normalize) : []
    return title.includes(needle) || description.includes(needle) || tags.some(t => t.includes(needle))
}
export function filterPortfolioItems(items, query) {
    if (!Array.isArray(items)) return []
    if (!normalize(query)) return items
    return items.filter(item => itemMatchesQuery(item, query))
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/hooks/utils/portfolioSearch.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/utils/portfolioSearch.js src/hooks/utils/portfolioSearch.test.js
git commit -m "feat: add pure portfolio search logic with unit tests"
```

---

## Task 3: Debounce hook

**Files:**
- Create: `src/hooks/utils/useDebouncedValue.js`

- [ ] **Step 1: Implement the hook**

```js
import { useEffect, useState } from "react"

export function useDebouncedValue(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value)
    useEffect(() => {
        const timeoutId = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(timeoutId)
    }, [value, delay])
    return debouncedValue
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/utils/useDebouncedValue.js
git commit -m "feat: add useDebouncedValue hook"
```

---

## Task 4: i18n strings

**Files:**
- Modify: `public/data/strings.json`

- [ ] **Step 1: Add these keys after `filter_by` in each of the `en`, `es`, `fr`, `ko` blocks** (English shown; translate the rest)

```json
"portfolio_search_label": "Search projects",
"portfolio_search_placeholder": "Search by title, tag, or description...",
"portfolio_search_clear": "Clear search",
"portfolio_search_no_results": "No projects match your search.",
"portfolio_search_reset": "Reset search",
"portfolio_search_results_count": "{x} project(s) found",
```

Note: the count string uses plain `{x}` (NOT `[[{x}]]`) because it is rendered
as a JSX text node in an aria-live region — the `[[ ]]` highlight syntax would
leak literal `<strong>` characters to screen readers.

- [ ] **Step 2: Validate JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('public/data/strings.json','utf8'));console.log('OK')"`
Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add public/data/strings.json
git commit -m "feat: add portfolio search i18n strings"
```

---

## Task 5: Search bar component (TDD)

**Files:**
- Create: `src/components/generic/PortfolioSearchBar.jsx`
- Create: `src/components/generic/PortfolioSearchBar.scss`
- Test: `src/components/generic/PortfolioSearchBar.test.jsx`

- [ ] **Step 1: Write the failing tests** (mock `useLanguage`)

Cover: renders a labeled searchbox; `onChange` fires per keystroke; clear button
hidden when empty / shown with text; clicking clear empties the field, refocuses
it, and hides the button again. (See repo file for full code.)

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/components/generic/PortfolioSearchBar.test.jsx`
Expected: FAIL — component not found.

- [ ] **Step 3: Implement `PortfolioSearchBar.jsx`**

Controlled input (`value` + `onChange`) with: a visually-hidden `<label
htmlFor="portfolio-search-input">` (single source of the accessible name — no
duplicate `aria-label`), a search icon, `type="search"`, and a clear `<button>`
shown only when `value` is truthy that calls `onChange("")` and refocuses the
input via a ref.

- [ ] **Step 4: Add `PortfolioSearchBar.scss`**

Full-width flex row (max-width 900px, centered), themed via CSS variables,
`:focus-within` border highlight, hides the native `::-webkit-search-cancel-button`.

- [ ] **Step 5: Run to verify pass**

Run: `npx vitest run src/components/generic/PortfolioSearchBar.test.jsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/generic/PortfolioSearchBar.jsx src/components/generic/PortfolioSearchBar.scss src/components/generic/PortfolioSearchBar.test.jsx
git commit -m "feat: add accessible PortfolioSearchBar with clear button"
```

---

## Task 6: Empty-state component (TDD)

**Files:**
- Create: `src/components/generic/PortfolioEmptyState.jsx`
- Test: `src/components/generic/PortfolioEmptyState.test.jsx`

- [ ] **Step 1: Write the failing tests** (mock `useLanguage`)

Cover: renders the friendly no-results message; the reset `<button>` is
keyboard-focusable (tab) and invokes `onResetSearch` on Enter; the button is
omitted when no handler is passed.

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/components/generic/PortfolioEmptyState.test.jsx`
Expected: FAIL — component not found.

- [ ] **Step 3: Implement `PortfolioEmptyState.jsx`**

A centered block with an `aria-hidden` icon, the `portfolio_search_no_results`
message, and (when `onResetSearch` is provided) a `portfolio_search_reset`
`<button>` calling `onResetSearch`.

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/components/generic/PortfolioEmptyState.test.jsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/generic/PortfolioEmptyState.jsx src/components/generic/PortfolioEmptyState.test.jsx
git commit -m "feat: add PortfolioEmptyState with keyboard-accessible reset"
```

---

## Task 7: Wire search into the Portfolio grid

**Files:**
- Modify: `src/components/articles/ArticlePortfolio.jsx`
- Modify: `src/components/articles/ArticlePortfolio.scss`

- [ ] **Step 1: Import the new modules** in `ArticlePortfolio.jsx`

```js
import PortfolioSearchBar from "/src/components/generic/PortfolioSearchBar.jsx"
import PortfolioEmptyState from "/src/components/generic/PortfolioEmptyState.jsx"
import {filterPortfolioItems} from "/src/hooks/utils/portfolioSearch.js"
import {useDebouncedValue} from "/src/hooks/utils/useDebouncedValue.js"
```

- [ ] **Step 2: Own search state in `ArticlePortfolio` and render the bar as the first child of `<Article>`** (so it sits directly under the category buttons)

```js
const [searchQuery, setSearchQuery] = useState("")
const debouncedSearchQuery = useDebouncedValue(searchQuery, 300)
// ...
<PortfolioSearchBar value={searchQuery} onChange={setSearchQuery} className={`article-portfolio-search`}/>
<ArticlePortfolioItems dataWrapper={dataWrapper}
                       selectedItemCategoryId={selectedItemCategoryId}
                       searchQuery={debouncedSearchQuery}
                       onResetSearch={() => setSearchQuery("")}/>
```

- [ ] **Step 3: In `ArticlePortfolioItems`, filter on top of the category list and render the empty state only when searching**

```js
const categoryItems = dataWrapper.getOrderedItemsFilteredBy(selectedItemCategoryId)
const filteredItems = filterPortfolioItems(categoryItems, searchQuery)
const isSearching = Boolean(searchQuery && searchQuery.trim())
// include searchQuery in refreshFlag so the grid re-renders on query change
// if (!filteredItems.length && isSearching) -> <PortfolioEmptyState onResetSearch={onResetSearch}/>
```

- [ ] **Step 4: Add an aria-live results-count region**

```jsx
<div className={`visually-hidden`} role={`status`} aria-live={`polite`}>
    {language.getString("portfolio_search_results_count").replace("{x}", String(filteredItems.length))}
</div>
```

- [ ] **Step 5: Add empty-state styles to `ArticlePortfolio.scss`**

`.article-portfolio-empty` centered column with icon, message, and a themed
`.article-portfolio-empty-reset` button.

- [ ] **Step 6: Build to verify it compiles**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/components/articles/ArticlePortfolio.jsx src/components/articles/ArticlePortfolio.scss
git commit -m "feat: wire live search and empty state into Portfolio grid"
```

---

## Task 8: Personalize content

**Files:**
- Modify: `public/data/profile.json`, `public/data/sections/cover.json`, `public/data/sections/skills.json`, `public/data/sections/portfolio.json`

- [ ] **Step 1: `profile.json`** — name "Nguyen Phu Tan", Full Stack Developer roles (en/es/fr/ko), drop missing pronunciation audio refs.
- [ ] **Step 2: `cover.json`** — real 2–4 sentence bio (4 locales), contact (Ho Chi Minh City, tannp@zigexn.vn, @tannp-hcmus), remove placeholder client testimonials.
- [ ] **Step 3: `skills.json`** — 12 real skills with FontAwesome icons (Laravel, React, Vue, MySQL, PostgreSQL, Docker, AWS, Git, REST API, Linux, Redis, TypeScript), English-only locales.
- [ ] **Step 4: `portfolio.json`** — 8 real projects with truthful title/description/tags and `categoryId` mapped to Apps(1)/Web(5)/Utilities(2); keep `categorize_by` defaults.
- [ ] **Step 5: Validate all JSON**

Run: `for f in profile.json sections/skills.json sections/portfolio.json sections/cover.json; do node -e "JSON.parse(require('fs').readFileSync('public/data/$f','utf8'));console.log('$f OK')"; done`
Expected: all `OK`.

- [ ] **Step 6: Commit**

```bash
git add public/data/profile.json public/data/sections/cover.json public/data/sections/skills.json public/data/sections/portfolio.json
git commit -m "feat: personalize profile, skills, and portfolio content"
```

---

## Task 9: Final verification + review

- [ ] **Step 1: Run the full suite**

Run: `npm run build && npm run lint && npm test`
Expected: build exit 0; lint exit 0 (warnings only); tests all pass (≥3 search tests).

- [ ] **Step 2: Manual smoke test (desktop + mobile)**

Run `npm run dev`; open the Portfolio section. Confirm the search bar sits under
the category buttons and above the grid; typing filters within the category;
clear resets and refocuses; no-match shows the empty state. Repeat at a mobile
width (≈390px) — bar is full-width and readable.

- [ ] **Step 3: Adversarial diff review**

Run a code review over `git diff` for correctness, accessibility, and
test-coverage gaps; fix any confirmed findings (e.g. markup leaking into the
aria-live announcement; empty state appearing for non-search empties).

- [ ] **Step 4: Open the PR** with the exercise template filled in.

---

## Self-Review

**Spec coverage:** Every spec acceptance criterion maps to a task — content
(Task 8), search behavior (Tasks 2/3/5/6/7), tests (Tasks 2/5/6), tooling
(Task 1), verification (Task 9). ✓

**Placeholder scan:** Code-bearing steps show real code or name the exact
component/behavior; no "TODO/handle edge cases" stubs. ✓

**Type consistency:** `filterPortfolioItems`, `itemMatchesQuery`, `normalize`,
`useDebouncedValue`, `PortfolioSearchBar({value,onChange})`,
`PortfolioEmptyState({onResetSearch})` are referenced consistently across tasks. ✓
