import { useCallback, useEffect, useState, type RefObject } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'

const ICON_SIZE = 20
const CURSOR_SIZE = ICON_SIZE
const SPRING = { damping: 28, stiffness: 320, mass: 0.35 }

type AboutThemeCursorProps = {
  portalRef: RefObject<HTMLElement | null>
  boundsRef: RefObject<HTMLElement | null>
  isDark: boolean
  onToggle: () => void
}

function isPointerInsideBounds(
  clientX: number,
  clientY: number,
  bounds: HTMLElement
): boolean {
  const rect = bounds.getBoundingClientRect()
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  )
}

export function AboutThemeCursor({
  portalRef,
  boundsRef,
  isDark,
  onToggle,
}: AboutThemeCursorProps) {
  const [isVisible, setIsVisible] = useState(false)
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  const smoothX = useSpring(cursorX, SPRING)
  const smoothY = useSpring(cursorY, SPRING)

  const updatePosition = useCallback(
    (clientX: number, clientY: number) => {
      const portal = portalRef.current
      if (!portal) return

      const rect = portal.getBoundingClientRect()
      const half = CURSOR_SIZE / 2
      const x = clientX - rect.left - half
      const y = clientY - rect.top - half

      cursorX.set(Math.max(-half, Math.min(rect.width - half, x)))
      cursorY.set(Math.max(-half, Math.min(rect.height - half, y)))
    },
    [portalRef, cursorX, cursorY]
  )

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const bounds = boundsRef.current
      if (!bounds) {
        setIsVisible(false)
        return
      }

      const inside =
        isPointerInsideBounds(event.clientX, event.clientY, bounds) &&
        (() => {
          const hovered = document.elementFromPoint(event.clientX, event.clientY)
          return hovered != null && bounds.contains(hovered)
        })()

      if (!inside) {
        setIsVisible(false)
        return
      }

      setIsVisible(true)
      updatePosition(event.clientX, event.clientY)
    }

    document.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => document.removeEventListener('pointermove', handlePointerMove)
  }, [boundsRef, updatePosition])

  return (
    <motion.div
      className={`about-theme-cursor${isVisible ? '' : ' about-theme-cursor--hidden'}`}
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
        inkColor="invert"
        hideSystemCursor
        className="about-theme-cursor__toggler pointer-events-auto"
      />
    </motion.div>
  )
}

export default AboutThemeCursor
