import { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import './ChromeHome.css'

const SINCE_TEXT = 'Since 2003'
const NAME_TEXT = 'Christian'

const CHAR_STAGGER = 0.045
const CHAR_DURATION = 0.55
const CHAR_EASE = [0.22, 1, 0.36, 1]

const SINCE_CHAR_COUNT = SINCE_TEXT.length
const NAME_CHAR_COUNT = NAME_TEXT.length

/** Christian starts shortly after the last "Since" char begins moving. */
const NAME_BASE_DELAY =
  (SINCE_CHAR_COUNT - 1) * CHAR_STAGGER + CHAR_DURATION * 0.28

const TEXT_ANIM_END =
  NAME_BASE_DELAY + (NAME_CHAR_COUNT - 1) * CHAR_STAGGER + CHAR_DURATION

const LINE_START_DELAY = TEXT_ANIM_END + 0.28
const LINE_DRAW_DURATION = 1.65

function StaggeredText({ text, className, baseDelay = 0 }) {
  return (
    <span className={className} aria-label={text}>
      {text.split('').map((char, index) => (
        <span key={`${char}-${index}`} className="chrome-home__char-wrap" aria-hidden="true">
          <motion.span
            className="chrome-home__char"
            initial={{ y: '115%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: CHAR_DURATION,
              delay: baseDelay + index * CHAR_STAGGER,
              ease: CHAR_EASE,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

function computeGuideMetrics(containerEl, heroEl) {
  const inner = containerEl.closest('.chrome-window__inner')
  const search = inner?.querySelector('.safari-search-bar__field')
  if (!inner || !search) return null

  const contentRect = containerEl.getBoundingClientRect()
  const heroRect = heroEl.getBoundingClientRect()
  const searchRect = search.getBoundingClientRect()
  const innerRect = inner.getBoundingClientRect()

  const toolbarOffset = contentRect.top - innerRect.top
  const width = contentRect.width
  const height = contentRect.height + toolbarOffset

  const toLocal = (rect) => ({
    left: rect.left - contentRect.left,
    right: rect.right - contentRect.left,
    top: rect.top - contentRect.top + toolbarOffset,
    bottom: rect.bottom - contentRect.top + toolbarOffset,
    centerX: rect.left + rect.width / 2 - contentRect.left,
    centerY: rect.top + rect.height / 2 - contentRect.top + toolbarOffset,
  })

  const hero = toLocal(heroRect)
  const searchLocal = toLocal(searchRect)

  const startX = width / 2
  const startY = height
  const endX = searchLocal.centerX
  const endY = searchLocal.bottom

  const gap = Math.max(18, Math.min(36, width * 0.04))
  const laneY = hero.bottom + gap
  const upperLaneY = hero.top - gap

  const spaceLeft = hero.left
  const spaceRight = width - hero.right
  const detourX =
    spaceLeft >= spaceRight
      ? Math.max(gap, hero.left - gap)
      : Math.min(width - gap, hero.right + gap)

  const startInsideHero = startX > hero.left - gap && startX < hero.right + gap

  let pathD
  if (!startInsideHero) {
    pathD = [
      `M ${startX} ${startY}`,
      `L ${startX} ${laneY}`,
      `L ${endX} ${laneY}`,
      `L ${endX} ${endY}`,
    ].join(' ')
  } else {
    pathD = [
      `M ${startX} ${startY}`,
      `L ${startX} ${laneY}`,
      `L ${detourX} ${laneY}`,
      `L ${detourX} ${upperLaneY}`,
      `L ${endX} ${upperLaneY}`,
      `L ${endX} ${endY}`,
    ].join(' ')
  }

  const arrowSize = Math.max(7, Math.min(11, width * 0.018))
  const arrowY = endY - arrowSize * 0.35

  return {
    width,
    height,
    toolbarOffset,
    pathD,
    arrow: {
      x: endX,
      y: arrowY,
      size: arrowSize,
    },
  }
}

function GuideLine({ containerRef, heroRef }) {
  const [metrics, setMetrics] = useState(null)
  const [visible, setVisible] = useState(false)

  const measure = useCallback(() => {
    const container = containerRef.current
    const hero = heroRef.current
    if (!container || !hero) return null
    return computeGuideMetrics(container, hero)
  }, [containerRef, heroRef])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = measure()
      if (next) {
        setMetrics(next)
        setVisible(true)
      }
    }, LINE_START_DELAY * 1000)

    return () => window.clearTimeout(timer)
  }, [measure])

  useEffect(() => {
    if (!visible) return undefined

    const container = containerRef.current
    if (!container) return undefined

    const handleResize = () => {
      const next = measure()
      if (next) setMetrics(next)
    }

    window.addEventListener('resize', handleResize)

    const inner = container.closest('.chrome-window__inner')
    const observer = inner ? new ResizeObserver(handleResize) : null
    if (inner && observer) observer.observe(inner)

    return () => {
      window.removeEventListener('resize', handleResize)
      observer?.disconnect()
    }
  }, [visible, measure, containerRef])

  if (!metrics) return null

  const { width, height, toolbarOffset, pathD, arrow } = metrics
  const { x: arrowX, y: arrowY, size: arrowSize } = arrow

  return (
    <div
      className="chrome-home__guide"
      style={{
        top: -toolbarOffset,
        height,
      }}
      aria-hidden="true"
    >
      <svg
        className="chrome-home__guide-svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <motion.path
          d={pathD}
          fill="none"
          stroke="rgba(255,255,255,0.62)"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={visible ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{
            pathLength: { duration: LINE_DRAW_DURATION, ease: [0.45, 0, 0.2, 1] },
            opacity: { duration: 0.35 },
          }}
        />

        <motion.polygon
          points={[
            `${arrowX},${arrowY - arrowSize}`,
            `${arrowX - arrowSize * 0.72},${arrowY + arrowSize * 0.55}`,
            `${arrowX + arrowSize * 0.72},${arrowY + arrowSize * 0.55}`,
          ].join(' ')}
          fill="rgba(255,255,255,0.78)"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={
            visible
              ? { opacity: 1, scale: 1 }
              : { opacity: 0, scale: 0.6 }
          }
          style={{ transformOrigin: `${arrowX}px ${arrowY}px` }}
          transition={{
            delay: LINE_DRAW_DURATION * 0.82,
            duration: 0.38,
            ease: CHAR_EASE,
          }}
        />
      </svg>
    </div>
  )
}

export default function ChromeHome() {
  const containerRef = useRef(null)
  const heroRef = useRef(null)

  return (
    <div ref={containerRef} className="chrome-home">
      <video
        className="chrome-home__video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        src="/videos/home-bg.mp4"
      />
      <div className="chrome-home__overlay" aria-hidden="true" />

      <GuideLine containerRef={containerRef} heroRef={heroRef} />

      <div ref={heroRef} className="chrome-home__hero">
        <div className="chrome-home__since">
          <StaggeredText
            text={SINCE_TEXT}
            className="chrome-home__since-text"
            baseDelay={0}
          />
        </div>

        <div className="chrome-home__name">
          <StaggeredText
            text={NAME_TEXT}
            className="chrome-home__name-line"
            baseDelay={NAME_BASE_DELAY}
          />
        </div>
      </div>

      <span className="chrome-home__sr-copy" aria-live="polite">
        {SINCE_TEXT} {NAME_TEXT}
      </span>
    </div>
  )
}
