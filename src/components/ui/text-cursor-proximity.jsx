import { useCallback, useEffect, useMemo, useRef } from 'react'
import { motion, useAnimationFrame, useMotionValue, useTransform } from 'framer-motion'
import { useMousePositionRef } from '../../hooks/use-mouse-position-ref'

/**
 * Per-letter proximity-reactive text. The cursor's distance to each letter is
 * mapped (via a falloff curve) to a 0..1 value that interpolates each letter's
 * scale / weight / opacity / color between a `from` and `to` style.
 *
 * Rules-of-Hooks note: the original snippet called `useMotionValue` /
 * `useTransform` inside `.map()`, which violates the rules of hooks. Here each
 * letter is its own <Letter> component that owns a FIXED set of hooks, and the
 * parent runs a single `useAnimationFrame` loop that pushes the computed
 * proximity into each letter's motion value via a registered setter.
 */

function computeProximity(distance, radius, falloff) {
  if (distance >= radius) return 0
  const normalized = 1 - distance / radius
  switch (falloff) {
    case 'exponential':
      return normalized * normalized
    case 'gaussian': {
      const sigma = radius / 2
      return Math.exp(-(distance * distance) / (2 * sigma * sigma))
    }
    case 'linear':
    default:
      return normalized
  }
}

function Letter({ char, index, styles, registerSetter, assignRef }) {
  const proximity = useMotionValue(0)

  const scale = useTransform(
    proximity,
    [0, 1],
    [styles.scale?.from ?? 1, styles.scale?.to ?? 1],
  )
  const fontWeight = useTransform(
    proximity,
    [0, 1],
    [styles.fontWeight?.from ?? 400, styles.fontWeight?.to ?? 400],
  )
  const opacity = useTransform(
    proximity,
    [0, 1],
    [styles.opacity?.from ?? 1, styles.opacity?.to ?? 1],
  )
  const color = useTransform(
    proximity,
    [0, 1],
    [styles.color?.from ?? '#ffffff', styles.color?.to ?? '#ffffff'],
  )

  useEffect(() => {
    registerSetter(index, (value) => proximity.set(value))
    return () => registerSetter(index, null)
  }, [index, proximity, registerSetter])

  return (
    <motion.span
      ref={assignRef}
      style={{
        display: 'inline-block',
        whiteSpace: 'pre',
        willChange: 'transform',
        scale,
        fontWeight,
        opacity,
        color,
      }}
    >
      {char === ' ' ? '\u00A0' : char}
    </motion.span>
  )
}

export default function TextCursorProximity({
  label,
  className,
  styles = {},
  containerRef,
  radius = 100,
  falloff = 'gaussian',
}) {
  const letters = useMemo(() => label.split(''), [label])
  const letterRefs = useRef([])
  const setterRefs = useRef([])
  const mousePositionRef = useMousePositionRef(containerRef)

  const registerSetter = useCallback((index, setter) => {
    setterRefs.current[index] = setter
  }, [])

  useAnimationFrame(() => {
    const container = containerRef?.current
    if (!container) return
    const containerRect = container.getBoundingClientRect()
    const { x: mouseX, y: mouseY } = mousePositionRef.current

    for (let i = 0; i < letterRefs.current.length; i += 1) {
      const el = letterRefs.current[i]
      const setter = setterRefs.current[i]
      if (!el || !setter) continue
      const rect = el.getBoundingClientRect()
      const letterX = rect.left + rect.width / 2 - containerRect.left
      const letterY = rect.top + rect.height / 2 - containerRect.top
      const distance = Math.hypot(mouseX - letterX, mouseY - letterY)
      const value = computeProximity(distance, radius, falloff)
      setter(Math.min(1, Math.max(0, value)))
    }
  })

  return (
    <span className={className} style={{ display: 'inline-block' }} aria-label={label}>
      {letters.map((char, index) => (
        <Letter
          key={`${char}-${index}`}
          char={char}
          index={index}
          styles={styles}
          registerSetter={registerSetter}
          assignRef={(el) => {
            letterRefs.current[index] = el
          }}
        />
      ))}
    </span>
  )
}
