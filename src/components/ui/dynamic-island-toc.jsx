import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../../lib/utils'

const islandTransition = {
  type: 'spring',
  stiffness: 400,
  damping: 32,
  mass: 0.9,
}

/* Distance from the top of the scroll container at which a heading is
 * considered the "active" section. */
const ACTIVE_OFFSET = 120

function CircleProgress({ progress, size = 22, strokeWidth = 2.5 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(1, progress))
  const offset = circumference * (1 - clamped)

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="dynamic-island-toc__progress"
      aria-hidden="true"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className="dynamic-island-toc__progress-track"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="dynamic-island-toc__progress-indicator"
      />
    </svg>
  )
}

/**
 * Dynamic Island style table of contents.
 *
 * Critical adaptation: instead of listening to `window` scroll / using
 * `document.documentElement`, this reads scroll metrics from a provided
 * scroll container ref and scopes the heading query to a content ref, so it
 * works inside the Safari window's own scrollable content area.
 */
export default function DynamicIslandTOC({
  scrollContainerRef,
  contentRef,
  headingSelector = '[data-toc], h2, h3',
  scanKey,
  label = 'On this page',
  className,
}) {
  const [headings, setHeadings] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [progress, setProgress] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const rafRef = useRef(0)

  // Scan headings inside the scoped content container.
  const scanHeadings = useCallback(() => {
    const root = contentRef?.current
    if (!root) {
      setHeadings([])
      return
    }
    const nodes = Array.from(root.querySelectorAll(headingSelector))
    const next = nodes
      .filter((node) => node.id && !node.closest('[data-toc-ignore]'))
      .map((node) => {
        const explicit = node.getAttribute('data-toc-depth') ?? node.getAttribute('data-toc-level')
        const tag = node.tagName.toLowerCase()
        const parsedLevel = explicit === null ? NaN : Number(explicit)
        const level = Number.isFinite(parsedLevel)
          ? parsedLevel
          : tag === 'h3'
            ? 1
            : tag === 'h4'
              ? 2
              : 0
        return {
          id: node.id,
          title: node.getAttribute('data-toc-title') || node.textContent?.trim() || '',
          level,
        }
      })
    setHeadings(next)
  }, [contentRef, headingSelector])

  useLayoutEffect(() => {
    // Defer to avoid a synchronous setState within the effect body; re-scan
    // again shortly after so content/route swaps settle.
    const raf = window.requestAnimationFrame(scanHeadings)
    const id = window.setTimeout(scanHeadings, 60)
    return () => {
      window.cancelAnimationFrame(raf)
      window.clearTimeout(id)
    }
  }, [scanHeadings, scanKey])

  // Compute progress + active heading relative to the scroll CONTAINER.
  const recompute = useCallback(() => {
    const container = scrollContainerRef?.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const scrollable = scrollHeight - clientHeight
    setProgress(scrollable > 0 ? scrollTop / scrollable : 0)

    const root = contentRef?.current
    if (!root) return
    const containerTop = container.getBoundingClientRect().top

    let current = null
    const nodes = Array.from(root.querySelectorAll(headingSelector)).filter(
      (node) => node.id && !node.closest('[data-toc-ignore]'),
    )
    for (const node of nodes) {
      const top = node.getBoundingClientRect().top - containerTop
      if (top <= ACTIVE_OFFSET) {
        current = node.id
      } else {
        break
      }
    }
    // If nothing has crossed the threshold yet, default to the first heading.
    if (!current && nodes.length > 0) current = nodes[0].id
    setActiveId(current)
  }, [scrollContainerRef, contentRef, headingSelector])

  useEffect(() => {
    const container = scrollContainerRef?.current
    if (!container) return undefined

    const onScroll = () => {
      if (rafRef.current) return
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = 0
        recompute()
      })
    }

    // Defer the initial measurement off the effect body.
    const initRaf = window.requestAnimationFrame(recompute)
    container.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.cancelAnimationFrame(initRaf)
      container.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [recompute, scanKey, headings.length, scrollContainerRef])

  const scrollToHeading = useCallback(
    (id) => {
      const container = scrollContainerRef?.current
      const root = contentRef?.current
      if (!container || !root) return
      const target = root.querySelector(`#${CSS.escape(id)}`)
      if (!target) return
      const containerTop = container.getBoundingClientRect().top
      const targetTop = target.getBoundingClientRect().top
      const next = container.scrollTop + (targetTop - containerTop) - 24
      container.scrollTo({ top: next, behavior: 'smooth' })
      setActiveId(id)
      setIsExpanded(false)
    },
    [scrollContainerRef, contentRef],
  )

  const activeTitle = useMemo(() => {
    const found = headings.find((h) => h.id === activeId)
    return found?.title || label
  }, [headings, activeId, label])

  if (headings.length === 0) return null

  return (
    <div className={cn('dynamic-island-toc', className)}>
      <AnimatePresence>
        {isExpanded && (
          <motion.button
            type="button"
            aria-label="Close table of contents"
            className="dynamic-island-toc__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        layout
        transition={islandTransition}
        className={cn(
          'dynamic-island-toc__island',
          isExpanded && 'dynamic-island-toc__island--expanded',
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {isExpanded ? (
            <motion.div
              key="panel"
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="dynamic-island-toc__panel"
            >
              <div className="dynamic-island-toc__panel-head">
                <div className="dynamic-island-toc__panel-title">
                  <span className="dynamic-island-toc__panel-label">TABLE OF CONTENTS</span>
                  <span className="dynamic-island-toc__panel-sublabel">{label}</span>
                </div>
                <button
                  type="button"
                  className="dynamic-island-toc__close"
                  onClick={() => setIsExpanded(false)}
                  aria-label="Close table of contents"
                >
                  <CircleProgress progress={progress} size={26} />
                  <span className="dynamic-island-toc__close-x" aria-hidden="true">
                    &times;
                  </span>
                </button>
              </div>
              <nav className="dynamic-island-toc__list" aria-label="Table of contents">
                {headings.map((heading) => {
                  const isActive = heading.id === activeId

                  return (
                    <button
                      key={heading.id}
                      type="button"
                      onClick={() => scrollToHeading(heading.id)}
                      style={{ paddingLeft: `${0.8 + heading.level * 0.85}rem` }}
                      className={cn(
                        'dynamic-island-toc__item',
                        isActive && 'dynamic-island-toc__item--active',
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="dynamic-island-toc-active"
                          className="dynamic-island-toc__item-active-bg"
                          transition={islandTransition}
                        />
                      )}
                      <span className="dynamic-island-toc__item-dot" aria-hidden="true" />
                      <motion.span
                        className="dynamic-island-toc__item-text"
                        animate={{ x: isActive ? 2 : 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        {heading.title}
                      </motion.span>
                    </button>
                  )
                })}
              </nav>
            </motion.div>
          ) : (
            <motion.button
              key="pill"
              type="button"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="dynamic-island-toc__pill"
              onClick={() => setIsExpanded(true)}
              aria-label="Open table of contents"
            >
              <CircleProgress progress={progress} />
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={activeTitle}
                  className="dynamic-island-toc__pill-text"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                >
                  {activeTitle}
                </motion.span>
              </AnimatePresence>
              <span className="dynamic-island-toc__pill-count">
                {Math.min(
                  headings.length,
                  Math.max(1, headings.findIndex((h) => h.id === activeId) + 1),
                )}
                /{headings.length}
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
