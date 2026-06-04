import "./PortfolioSearchBar.scss"
import React, { useRef } from 'react'
import { useLanguage } from "/src/providers/LanguageProvider.jsx"

/**
 * Live search input for the Portfolio section.
 * Renders a labeled, full-width search field with a clear (×) button that
 * appears only when there is text. Clearing returns focus to the input.
 *
 * @param {String} value - current (raw, un-debounced) input value
 * @param {Function} onChange - called with the new string on each keystroke
 * @param {String} className
 * @return {JSX.Element}
 * @constructor
 */
function PortfolioSearchBar({ value, onChange, className = "" }) {
    const language = useLanguage()
    const inputRef = useRef(null)

    const label = language.getString("portfolio_search_label")
    const placeholder = language.getString("portfolio_search_placeholder")
    const clearLabel = language.getString("portfolio_search_clear")

    const hasText = Boolean(value)

    const _handleClear = () => {
        onChange("")
        if (inputRef.current)
            inputRef.current.focus()
    }

    return (
        <div className={`portfolio-search-bar ${className}`}>
            <label className={`portfolio-search-bar-label visually-hidden`}
                   htmlFor={`portfolio-search-input`}>
                {label}
            </label>

            <span className={`portfolio-search-bar-icon`} aria-hidden={true}>
                <i className={`fa-solid fa-magnifying-glass`}/>
            </span>

            <input id={`portfolio-search-input`}
                   ref={inputRef}
                   type={`search`}
                   className={`portfolio-search-bar-input text-2`}
                   value={value}
                   onChange={(e) => onChange(e.target.value)}
                   placeholder={placeholder}
                   autoComplete={`off`}/>

            {hasText && (
                <button type={`button`}
                        className={`portfolio-search-bar-clear`}
                        onClick={_handleClear}
                        aria-label={clearLabel}
                        data-tooltip={clearLabel}>
                    <i className={`fa-solid fa-xmark`} aria-hidden={true}/>
                </button>
            )}
        </div>
    )
}

export default PortfolioSearchBar
