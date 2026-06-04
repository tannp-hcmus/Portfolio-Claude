import { describe, it, expect, vi } from "vitest"
import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

const STRINGS = {
    portfolio_search_no_results: "No projects match your search.",
    portfolio_search_reset: "Reset search",
}
vi.mock("/src/providers/LanguageProvider.jsx", () => ({
    useLanguage: () => ({
        getString: (key) => STRINGS[key] || key,
    }),
}))

import PortfolioEmptyState from "./PortfolioEmptyState.jsx"

describe("PortfolioEmptyState", () => {
    // Scenario 3: no match shows a friendly empty-state message (no alert).
    it("renders the friendly no-results message", () => {
        render(<PortfolioEmptyState onResetSearch={() => {}} />)
        expect(
            screen.getByText("No projects match your search.")
        ).toBeInTheDocument()
    })

    it("offers a keyboard-accessible reset button that invokes onResetSearch", async () => {
        const user = userEvent.setup()
        const onResetSearch = vi.fn()
        render(<PortfolioEmptyState onResetSearch={onResetSearch} />)

        const resetButton = screen.getByRole("button", { name: "Reset search" })
        expect(resetButton).toBeInTheDocument()

        // Activate via keyboard (tab + Enter) to prove it is keyboard-usable.
        await user.tab()
        expect(resetButton).toHaveFocus()
        await user.keyboard("{Enter}")
        expect(onResetSearch).toHaveBeenCalledTimes(1)
    })

    it("omits the reset button when no handler is provided", () => {
        render(<PortfolioEmptyState onResetSearch={null} />)
        expect(
            screen.queryByRole("button", { name: "Reset search" })
        ).not.toBeInTheDocument()
    })
})
