import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SHORTCUTS } from '../config/shortcuts'
import './SafariSearchBar.css'

const HOME_DESTINATION = {
  type: 'home',
  label: 'Home',
  keywords: ['home', 'start', 'portfolio'],
}

const ALL_DESTINATIONS = [
  HOME_DESTINATION,
  ...SHORTCUTS.map((s) => ({
    type: s.type,
    label: s.label,
    keywords: [s.label.toLowerCase(), s.type, s.id],
  })),
]

function filterDestinations(query) {
  const q = query.trim().toLowerCase()
  if (!q) return ALL_DESTINATIONS
  return ALL_DESTINATIONS.filter(
    (d) =>
      d.label.toLowerCase().includes(q) ||
      d.keywords.some((kw) => kw.includes(q)),
  )
}

function getDisplayLabel(activeTabType) {
  if (!activeTabType || activeTabType === 'home') return 'Home'
  const shortcut = SHORTCUTS.find((s) => s.type === activeTabType)
  return shortcut?.label ?? activeTabType
}

function stopWindowDrag(e) {
  e.stopPropagation()
}

export default function SafariSearchBar({ activeTabType, onNavigate }) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef(null)
  const wrapRef = useRef(null)

  const filtered = useMemo(() => filterDestinations(query), [query])

  const navigateTo = useCallback(
    (destination) => {
      if (!destination) return
      onNavigate?.(destination.type)
      setQuery('')
      setIsOpen(false)
      setHighlightedIndex(0)
      inputRef.current?.blur()
    },
    [onNavigate],
  )

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setIsOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleFocus = () => {
    setIsOpen(true)
    setQuery('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setQuery('')
      inputRef.current?.blur()
      return
    }

    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1))
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.max(i - 1, 0))
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered.length > 0) {
        navigateTo(filtered[highlightedIndex] ?? filtered[0])
      }
    }
  }

  const showDropdown = isOpen && filtered.length > 0
  const idleLabel = getDisplayLabel(activeTabType)

  return (
    <div
      ref={wrapRef}
      className="safari-search-bar"
      onMouseDown={stopWindowDrag}
      onPointerDown={stopWindowDrag}
    >
      <div className="safari-search-bar__field">
        <Search className="safari-search-bar__icon" size={14} strokeWidth={2} aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          className="safari-search-bar__input"
          placeholder="Search or enter address"
          value={isOpen ? query : idleLabel}
          onChange={(e) => {
            setQuery(e.target.value)
            setHighlightedIndex(0)
          }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          aria-label="Search or enter address"
          aria-expanded={showDropdown}
          aria-controls="safari-search-dropdown"
          aria-activedescendant={
            showDropdown ? `safari-search-option-${highlightedIndex}` : undefined
          }
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {showDropdown && (
        <ul
          id="safari-search-dropdown"
          className="safari-search-bar__dropdown"
          role="listbox"
        >
          {filtered.map((dest, index) => (
            <li key={dest.type} role="presentation">
              <button
                id={`safari-search-option-${index}`}
                type="button"
                role="option"
                aria-selected={index === highlightedIndex}
                className={cn(
                  'safari-search-bar__option',
                  index === highlightedIndex && 'safari-search-bar__option--highlighted',
                )}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => navigateTo(dest)}
              >
                <span className="safari-search-bar__option-label">{dest.label}</span>
                <span className="safari-search-bar__option-hint">
                  {dest.type === 'home' ? 'portfolio.local' : `${dest.type}.local`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
