import { useEffect, useState } from "react"

/**
 * Returns a debounced copy of `value` that only updates after `delay`
 * milliseconds have passed without `value` changing. Used to avoid
 * re-filtering the portfolio grid on every keystroke.
 *
 * @param {*} value
 * @param {Number} delay - debounce delay in milliseconds (default 300)
 * @return {*}
 */
export function useDebouncedValue(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => clearTimeout(timeoutId)
    }, [value, delay])

    return debouncedValue
}
