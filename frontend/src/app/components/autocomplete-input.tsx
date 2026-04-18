'use client'

import { useState, useRef, useEffect } from "react"
import "../styles/autocomplete-input.css"

type Props<T extends string> = {
    options: T[]
    selected: T[]
    placeholder?: string
    onSelect: (value: T) => void
    variant?: "modal" | "sidebar"
}

export default function AutocompleteInput<T extends string>({
    options,
    selected,
    placeholder = "Buscar...",
    onSelect,
    variant = "modal",
}: Props<T>) {
    const [query, setQuery] = useState("")
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const filtered = options.filter(
        (opt) =>
            opt.toLowerCase().includes(query.toLowerCase()) &&
            !selected.includes(opt)
    )

    const handleSelect = (value: T) => {
        onSelect(value)
        setQuery("")
        setOpen(false)
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const prefix = variant === "sidebar" ? "sidebar-ac" : "modal-ac"

    return (
        <div className={`${prefix}-wrapper`} ref={containerRef}>
            <div className={`${prefix}-input-row`}>
                <svg className={`${prefix}-search-icon`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                    type="text"
                    className={`${prefix}-input`}
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setOpen(true)
                    }}
                    onFocus={() => setOpen(true)}
                />
                {query && (
                    <button
                        type="button"
                        className={`${prefix}-clear`}
                        onClick={() => { setQuery(""); setOpen(false) }}
                    >
                        ×
                    </button>
                )}
            </div>

            {open && filtered.length > 0 && (
                <ul className={`${prefix}-dropdown`}>
                    {filtered.map((opt) => {
                        // Highlight the matching part
                        const idx = opt.toLowerCase().indexOf(query.toLowerCase())
                        if (query && idx !== -1) {
                            const before = opt.slice(0, idx)
                            const match = opt.slice(idx, idx + query.length)
                            const after = opt.slice(idx + query.length)
                            return (
                                <li
                                    key={opt}
                                    className={`${prefix}-option`}
                                    onMouseDown={() => handleSelect(opt)}
                                >
                                    {before}
                                    <span className={`${prefix}-option-highlight`}>{match}</span>
                                    {after}
                                </li>
                            )
                        }
                        return (
                            <li
                                key={opt}
                                className={`${prefix}-option`}
                                onMouseDown={() => handleSelect(opt)}
                            >
                                {opt}
                            </li>
                        )
                    })}
                </ul>
            )}

            {open && query && filtered.length === 0 && (
                <div className={`${prefix}-no-results`}>
                    Sin resultados para "{query}"
                </div>
            )}
        </div>
    )
}
