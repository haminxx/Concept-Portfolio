import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Search, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../lib/utils'
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

// Rotating animated placeholders (Apple Spotlight "SpotlightPlaceholder" feel).
const PLACEHOLDERS = [
  'Search portfolio',
  'Go to About',
  'Open Project',
  'Read Newsletter',
  'Say hi via Contact',
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

/** Animated placeholder that swaps phrases with a blur/translate transition. */
function SpotlightPlaceholder() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % PLACEHOLDERS.length)
    }, 2400)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="safari-search-bar__placeholder" aria-hidden="true">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={index}
          className="safari-search-bar__placeholder-text"
          initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          {PLACEHOLDERS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
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
    setHighlightedIndex(0)
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
  const showPlaceholder = isOpen && query.length === 0

  return (
    <div
      ref={wrapRef}
      className="safari-search-bar"
      onMouseDown={stopWindowDrag}
      onPointerDown={stopWindowDrag}
    >
      <motion.div
        layout
        className={cn('safari-search-bar__field', isOpen && 'safari-search-bar__field--open')}
        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      >
        <Search className="safari-search-bar__icon" size={14} strokeWidth={2} aria-hidden="true" />
        <div className="safari-search-bar__input-wrap">
          {showPlaceholder && <SpotlightPlaceholder />}
          <input
            ref={inputRef}
            type="search"
            className="safari-search-bar__input"
            placeholder={isOpen ? '' : 'Search or enter address'}
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
      </motion.div>

      <AnimatePresence>
        {showDropdown && (
          <motion.ul
            id="safari-search-dropdown"
            className="safari-search-bar__dropdown"
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, scale: 0.98, filter: 'blur(6px)' }}
            transition={{ type: 'spring', stiffness: 460, damping: 36, mass: 0.7 }}
          >
            {filtered.map((dest, index) => {
              const isHighlighted = index === highlightedIndex
              return (
                <motion.li
                  key={dest.type}
                  role="presentation"
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{
                    delay: index * 0.035,
                    duration: 0.22,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <button
                    id={`safari-search-option-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isHighlighted}
                    className={cn(
                      'safari-search-bar__option',
                      isHighlighted && 'safari-search-bar__option--highlighted',
                    )}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => navigateTo(dest)}
                  >
                    <span className="safari-search-bar__option-main">
                      <Search
                        className="safari-search-bar__option-icon"
                        size={13}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      <span className="safari-search-bar__option-label">{dest.label}</span>
                    </span>
                    <span className="safari-search-bar__option-trailing">
                      <span className="safari-search-bar__option-hint">
                        {dest.type === 'home' ? 'portfolio.local' : `${dest.type}.local`}
                      </span>
                      <AnimatePresence initial={false}>
                        {isHighlighted && (
                          <motion.span
                            className="safari-search-bar__option-chevron"
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -4 }}
                            transition={{ duration: 0.16 }}
                          >
                            <ChevronRight size={14} strokeWidth={2.25} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                  </button>
                </motion.li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
