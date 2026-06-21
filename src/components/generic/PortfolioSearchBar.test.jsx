import { describe, it, expect, vi, beforeEach } from "vitest"
import React, { useState } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

// Mock the language provider so the component can render without the full app.
// getString simply echoes a readable label for each known key.
const STRINGS = {
    portfolio_search_label: "Search projects",
    portfolio_search_placeholder: "Search by title, tag, or description...",
    portfolio_search_clear: "Clear search",
}
vi.mock("/src/providers/LanguageProvider.jsx", () => ({
    useLanguage: () => ({
        getString: (key) => STRINGS[key] || key,
    }),
}))

import PortfolioSearchBar from "./PortfolioSearchBar.jsx"

/**
 * Wrapper that owns the search state, mirroring how ArticlePortfolio drives
 * the controlled input.
 */
function ControlledSearchBar() {
    const [value, setValue] = useState("")
    return <PortfolioSearchBar value={value} onChange={setValue} />
}

describe("PortfolioSearchBar", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders an accessible, labeled search input", () => {
        render(<PortfolioSearchBar value="" onChange={() => {}} />)
        const input = screen.getByRole("searchbox", { name: "Search projects" })
        expect(input).toBeInTheDocument()
        expect(input).toHaveValue("")
    })

    it("calls onChange as the user types", async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn()
        render(<PortfolioSearchBar value="" onChange={handleChange} />)

        await user.type(screen.getByRole("searchbox"), "laravel")
        expect(handleChange).toHaveBeenCalled()
        // userEvent fires one onChange per character.
        expect(handleChange).toHaveBeenCalledTimes("laravel".length)
    })

    it("hides the clear button when empty and shows it once there is text", () => {
        const { rerender } = render(
            <PortfolioSearchBar value="" onChange={() => {}} />
        )
        expect(
            screen.queryByRole("button", { name: "Clear search" })
        ).not.toBeInTheDocument()

        rerender(<PortfolioSearchBar value="react" onChange={() => {}} />)
        expect(
            screen.getByRole("button", { name: "Clear search" })
        ).toBeInTheDocument()
    })

    // Scenario 4: clicking clear empties the field and returns focus to it.
    it("clears the input and refocuses it when the clear button is clicked", async () => {
        const user = userEvent.setup()
        render(<ControlledSearchBar />)

        const input = screen.getByRole("searchbox")
        await user.type(input, "redis")
        expect(input).toHaveValue("redis")

        const clearButton = screen.getByRole("button", { name: "Clear search" })
        await user.click(clearButton)

        expect(input).toHaveValue("")
        expect(input).toHaveFocus()
        // The clear button disappears again once the field is empty.
        expect(
            screen.queryByRole("button", { name: "Clear search" })
        ).not.toBeInTheDocument()
    })
})
