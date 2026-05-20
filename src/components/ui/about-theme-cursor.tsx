import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'

const ICON_SIZE = 20
const CURSOR_SIZE = ICON_SIZE
const SPRING = { damping: 28, stiffness: 320, mass: 0.35 }

type AboutThemeCursorProps = {
  containerRef: RefObject<HTMLElement | null>
  isDark: boolean
  onToggle: () => void
}

export function AboutThemeCursor({
  containerRef,
  isDark,
  onToggle,
}: AboutThemeCursorProps) {
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  const smoothX = useSpring(cursorX, SPRING)
  const smoothY = useSpring(cursorY, SPRING)

  const updatePosition = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const half = CURSOR_SIZE / 2
      const x = clientX - rect.left - half
      const y = clientY - rect.top - half

      cursorX.set(Math.max(-half, Math.min(rect.width - half, x)))
      cursorY.set(Math.max(-half, Math.min(rect.height - half, y)))
    },
    [containerRef, cursorX, cursorY]
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handlePointerMove = (event: PointerEvent) => {
      updatePosition(event.clientX, event.clientY)
    }

    container.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => container.removeEventListener('pointermove', handlePointerMove)
  }, [containerRef, updatePosition])

  return (
    <motion.div
      className="about-theme-cursor"
      style={{
        width: CURSOR_SIZE,
        height: CURSOR_SIZE,
        x: smoothX,
        y: smoothY,
      }}
      aria-hidden
    >
      <AnimatedThemeToggler
        isDark={isDark}
        onToggle={onToggle}
        inkColor={isDark ? 'bright' : 'dark'}
        hideSystemCursor
        className="about-theme-cursor__toggler pointer-events-auto"
      />
    </motion.div>
  )
}

export default AboutThemeCursor
