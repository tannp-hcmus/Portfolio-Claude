import { describe, it, expect } from "vitest"
import {
    filterPortfolioItems,
    itemMatchesQuery,
    normalize,
} from "./portfolioSearch.js"

/**
 * Minimal fixtures mirroring the ArticleItemDataWrapper shape used by the
 * Portfolio grid: each item exposes `locales.{title, text, tags}`.
 */
const ITEMS = [
    {
        id: 1,
        locales: {
            title: "Smart Task Manager",
            text: "A task management system with a <b>real-time</b> dashboard.",
            tags: ["Laravel", "ReactJS", "MySQL"],
        },
    },
    {
        id: 2,
        locales: {
            title: "URL Shortener Service",
            text: "A link-shortening tool with click analytics.",
            tags: ["Node.js", "Express", "MongoDB"],
        },
    },
    {
        id: 3,
        locales: {
            title: "E-Commerce Platform",
            text: "Online store optimized with Redis caching.",
            tags: ["Laravel", "Vue.js", "Redis"],
        },
    },
]

describe("normalize", () => {
    it("lowercases, trims, and strips HTML tags", () => {
        expect(normalize("  <b>Hello</b> WORLD  ")).toBe("hello  world")
    })

    it("returns an empty string for nullish input", () => {
        expect(normalize(null)).toBe("")
        expect(normalize(undefined)).toBe("")
    })
})

describe("itemMatchesQuery", () => {
    it("matches on title, case-insensitively", () => {
        expect(itemMatchesQuery(ITEMS[0], "smart")).toBe(true)
        expect(itemMatchesQuery(ITEMS[0], "SMART")).toBe(true)
    })

    it("matches on a tag", () => {
        expect(itemMatchesQuery(ITEMS[0], "reactjs")).toBe(true)
    })

    it("matches on the description (ignoring HTML)", () => {
        expect(itemMatchesQuery(ITEMS[0], "real-time")).toBe(true)
        expect(itemMatchesQuery(ITEMS[0], "dashboard")).toBe(true)
    })

    it("does not match unrelated text", () => {
        expect(itemMatchesQuery(ITEMS[0], "python")).toBe(false)
    })

    it("treats an empty query as a match", () => {
        expect(itemMatchesQuery(ITEMS[0], "")).toBe(true)
        expect(itemMatchesQuery(ITEMS[0], "   ")).toBe(true)
    })
})

describe("filterPortfolioItems", () => {
    // Scenario 1: empty search returns the full (category) list.
    it("returns all items when the query is empty", () => {
        expect(filterPortfolioItems(ITEMS, "")).toHaveLength(3)
        expect(filterPortfolioItems(ITEMS, "   ")).toHaveLength(3)
    })

    // Scenario 2: a matching query returns only matching items.
    it("returns only items matching the title", () => {
        const result = filterPortfolioItems(ITEMS, "shortener")
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe(2)
    })

    it("returns multiple items when a shared tag matches", () => {
        const result = filterPortfolioItems(ITEMS, "laravel")
        expect(result.map(item => item.id)).toEqual([1, 3])
    })

    it("matches on description text", () => {
        const result = filterPortfolioItems(ITEMS, "caching")
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe(3)
    })

    it("is case-insensitive", () => {
        expect(filterPortfolioItems(ITEMS, "LARAVEL")).toHaveLength(2)
    })

    // Scenario 3: no match returns an empty array (drives the empty state).
    it("returns an empty array when nothing matches", () => {
        expect(filterPortfolioItems(ITEMS, "nonexistent-xyz")).toHaveLength(0)
    })

    it("guards against non-array input", () => {
        expect(filterPortfolioItems(null, "x")).toEqual([])
        expect(filterPortfolioItems(undefined, "")).toEqual([])
    })
})
