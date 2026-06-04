import React from 'react'
import { useLanguage } from "/src/providers/LanguageProvider.jsx"

/**
 * Empty state shown in the Portfolio grid area when a search returns no
 * matching projects. Provides a friendly message and a keyboard-accessible
 * button to reset the search (no browser alert).
 *
 * @param {Function} onResetSearch - called when the reset button is activated
 * @return {JSX.Element}
 * @constructor
 */
function PortfolioEmptyState({ onResetSearch }) {
    const language = useLanguage()

    return (
        <div className={`article-portfolio-empty`}>
            <i className={`article-portfolio-empty-icon fa-solid fa-magnifying-glass`} aria-hidden={true}/>
            <p className={`article-portfolio-empty-message text-3`}>
                {language.getString("portfolio_search_no_results")}
            </p>
            {onResetSearch && (
                <button type={`button`}
                        className={`article-portfolio-empty-reset btn text-2`}
                        onClick={onResetSearch}>
                    {language.getString("portfolio_search_reset")}
                </button>
            )}
        </div>
    )
}

export default PortfolioEmptyState
