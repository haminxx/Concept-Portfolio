import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import {
  Search,
  ChevronRight,
  Home,
  User,
  FolderKanban,
  Newspaper,
  MessageCircle,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../lib/utils'
import './SafariSearchBar.css'

/**
 * Real in-app destinations. `home` is excluded from the hover nav dropdown (it is the
 * default state) but IS searchable in the typed-results dropdown.
 */
const DESTINATIONS = [
  {
    type: 'home',
    label: 'Home',
    icon: Home,
    description: 'Back to the start',
    keywords: ['home', 'start', 'portfolio', 'main'],
    flyout: false,
  },
  {
    type: 'about',
    label: 'About',
    icon: User,
    description: 'Who I am',
    keywords: ['about', 'bio', 'me', 'story'],
    flyout: true,
  },
  {
    type: 'project',
    label: 'Project',
    icon: FolderKanban,
    description: 'Things I have built',
    keywords: ['project', 'work', 'portfolio', 'build'],
    flyout: true,
  },
  {
    type: 'newsletter',
    label: 'Newsletter',
    icon: Newspaper,
    description: 'Writing & updates',
    keywords: ['newsletter', 'blog', 'writing', 'posts'],
    flyout: true,
  },
  {
    type: 'contact',
    label: 'Contact',
    icon: MessageCircle,
    description: 'Get in touch',
    keywords: ['contact', 'email', 'message', 'hi', 'hello'],
    flyout: true,
  },
]

const NAV_ITEMS = DESTINATIONS.filter((d) => d.flyout)
const DEFAULT_PLACEHOLDER = 'Search or jump to a page'
const HOVER_LEAVE_DELAY_MS = 120

function filterDestinations(query) {
  const q = query.trim().toLowerCase()
  if (!q) return DESTINATIONS
  return DESTINATIONS.filter(
    (d) =>
      d.label.toLowerCase().includes(q) ||
      d.keywords.some((kw) => kw.includes(q)),
  )
}

function getDisplayLabel(activeTabType) {
  if (!activeTabType || activeTabType === 'home') return 'Home'
  const dest = DESTINATIONS.find((d) => d.type === activeTabType)
  return dest?.label ?? activeTabType
}

function stopWindowDrag(e) {
  e.stopPropagation()
}

/**
 * Animated placeholder that swaps text with a blur/translate transition
 * (Spotlight "SpotlightPlaceholder" feel).
 */
function SpotlightPlaceholder({ text }) {
  return (
    <span className="safari-search-bar__placeholder" aria-hidden="true">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={text}
          className="safari-search-bar__placeholder-text"
          initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function DestinationOption({ dest, index, isHighlighted, onSelect, onHighlight }) {
  const Icon = dest.icon

  return (
    <motion.li
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
        onMouseEnter={() => onHighlight(index)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onSelect(dest)}
      >
        <span className="safari-search-bar__option-main">
          <Icon
            className="safari-search-bar__option-icon"
            size={15}
            strokeWidth={2}
            aria-hidden="true"
          />
          <span className="safari-search-bar__option-text">
            <span className="safari-search-bar__option-label">{dest.label}</span>
            <span className="safari-search-bar__option-desc">{dest.description}</span>
          </span>
        </span>
        <span className="safari-search-bar__option-trailing">
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
}

export default function SafariSearchBar({ activeTabType, onNavigate }) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef(null)
  const wrapRef = useRef(null)
  const leaveTimerRef = useRef(null)

  const filtered = useMemo(() => filterDestinations(query), [query])
  const hasQuery = query.trim().length > 0

  const showNavDropdown = (hovered || isFocused) && !hasQuery
  const showResults = hasQuery && (isFocused || hovered)

  const navigateTo = useCallback(
    (destination) => {
      if (!destination) return
      onNavigate?.(destination.type)
      setQuery('')
      setHovered(false)
      setIsFocused(false)
      setHighlightedIndex(-1)
      inputRef.current?.blur()
    },
    [onNavigate],
  )

  useEffect(() => {
    if (!isFocused && !hovered) return undefined
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setIsFocused(false)
        setHovered(false)
        setQuery('')
        setHighlightedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isFocused, hovered])

  // Keyboard navigation targets whichever panel is visible.
  const activeList = hasQuery ? filtered : NAV_ITEMS

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setQuery('')
      setIsFocused(false)
      setHovered(false)
      setHighlightedIndex(-1)
      inputRef.current?.blur()
      return
    }

    if (!isFocused && !hovered) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.min(i + 1, activeList.length - 1))
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.max(i - 1, 0))
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      if (activeList.length === 0) return
      const target = activeList[highlightedIndex] ?? activeList[0]
      navigateTo(target)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    setQuery('')
    setHighlightedIndex(-1)
  }

  const clearLeaveTimer = useCallback(() => {
    if (leaveTimerRef.current) {
      window.clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
  }, [])

  const handleMouseEnter = () => {
    clearLeaveTimer()
    setHovered(true)
  }

  const handleMouseLeave = () => {
    clearLeaveTimer()
    leaveTimerRef.current = window.setTimeout(() => {
      setHovered(false)
      if (!isFocused) setHighlightedIndex(-1)
      leaveTimerRef.current = null
    }, HOVER_LEAVE_DELAY_MS)
  }

  useEffect(() => () => clearLeaveTimer(), [clearLeaveTimer])

  const idleLabel = getDisplayLabel(activeTabType)
  const isActive = hovered || isFocused
  const inputValue = isActive ? query : idleLabel
  const showPlaceholder = isActive && !hasQuery

  return (
    <div
      ref={wrapRef}
      className="safari-search-bar"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={stopWindowDrag}
      onPointerDown={stopWindowDrag}
    >
      <motion.div
        layout
        className={cn(
          'safari-search-bar__field',
          isActive && 'safari-search-bar__field--open',
        )}
        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      >
        <Search className="safari-search-bar__icon" size={14} strokeWidth={2} aria-hidden="true" />
        <div className="safari-search-bar__input-wrap">
          {showPlaceholder && <SpotlightPlaceholder text={DEFAULT_PLACEHOLDER} />}
          <input
            ref={inputRef}
            type="search"
            className="safari-search-bar__input"
            placeholder={isActive ? '' : 'Search or enter address'}
            value={inputValue}
            onChange={(e) => {
              setQuery(e.target.value)
              setHighlightedIndex(-1)
            }}
            onFocus={handleFocus}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            aria-label="Search or enter address"
            aria-expanded={showNavDropdown || showResults}
            aria-controls="safari-search-dropdown"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {showNavDropdown && (
          <motion.ul
            id="safari-search-dropdown"
            className="safari-search-bar__dropdown safari-search-bar__dropdown--nav"
            role="listbox"
            aria-label="Pages"
            initial={{ opacity: 0, y: -6, scale: 0.98, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, scale: 0.98, filter: 'blur(6px)' }}
            transition={{ type: 'spring', stiffness: 460, damping: 36, mass: 0.7 }}
          >
            {NAV_ITEMS.map((dest, index) => (
              <DestinationOption
                key={dest.type}
                dest={dest}
                index={index}
                isHighlighted={index === highlightedIndex}
                onSelect={navigateTo}
                onHighlight={setHighlightedIndex}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResults && filtered.length > 0 && (
          <motion.ul
            className="safari-search-bar__dropdown"
            role="listbox"
            id="safari-search-dropdown"
            initial={{ opacity: 0, y: -6, scale: 0.98, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, scale: 0.98, filter: 'blur(6px)' }}
            transition={{ type: 'spring', stiffness: 460, damping: 36, mass: 0.7 }}
          >
            {filtered.map((dest, index) => (
              <DestinationOption
                key={dest.type}
                dest={dest}
                index={index}
                isHighlighted={index === highlightedIndex}
                onSelect={navigateTo}
                onHighlight={setHighlightedIndex}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
