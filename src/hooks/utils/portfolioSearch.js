/**
 * @description Pure, framework-agnostic search helpers for the Portfolio section.
 * Kept free of React / app singletons so it can be unit-tested in isolation.
 */

/**
 * Strips HTML tags from a string so the raw text can be searched.
 * @param {string} value
 * @return {string}
 */
export function stripHtml(value) {
    if (!value) return ""
    return String(value).replace(/<[^>]*>/g, " ")
}

/**
 * Normalizes a string for case-insensitive comparison.
 * @param {string} value
 * @return {string}
 */
export function normalize(value) {
    return stripHtml(value).toLowerCase().trim()
}

/**
 * Returns true if the given portfolio item matches the query against its
 * title, tags, or description (all case-insensitive). An empty/whitespace
 * query matches everything.
 *
 * The item shape mirrors ArticleItemDataWrapper: `{ locales: { title, text, tags } }`.
 *
 * @param {Object} item
 * @param {string} query
 * @return {boolean}
 */
export function itemMatchesQuery(item, query) {
    const needle = normalize(query)
    if (!needle) return true
    if (!item) return false

    const locales = item.locales || {}
    const title = normalize(locales.title)
    const description = normalize(locales.text)
    const tags = Array.isArray(locales.tags)
        ? locales.tags.map(normalize)
        : []

    return (
        title.includes(needle) ||
        description.includes(needle) ||
        tags.some(tag => tag.includes(needle))
    )
}

/**
 * Filters a list of portfolio items by a free-text query.
 * The list is expected to already be scoped to the selected category.
 *
 * @param {Array<Object>} items
 * @param {string} query
 * @return {Array<Object>}
 */
export function filterPortfolioItems(items, query) {
    if (!Array.isArray(items)) return []
    const needle = normalize(query)
    if (!needle) return items
    return items.filter(item => itemMatchesQuery(item, query))
}
