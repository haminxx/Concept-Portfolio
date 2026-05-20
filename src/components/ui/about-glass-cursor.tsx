import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

import { GlassButton } from '@/components/ui/apple-tahoe-liquid-glass-button'

const CURSOR_SIZE = 40
const SPRING = { damping: 28, stiffness: 320, mass: 0.35 }

type AboutGlassCursorProps = {
  containerRef: RefObject<HTMLElement | null>
}

export function AboutGlassCursor({ containerRef }: AboutGlassCursorProps) {
  const followerRef = useRef<HTMLDivElement>(null)
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
      ref={followerRef}
      className="about-glass-cursor"
      style={{
        width: CURSOR_SIZE,
        height: CURSOR_SIZE,
        x: smoothX,
        y: smoothY,
      }}
      aria-hidden
    >
      <GlassButton
        size="icon"
        tabIndex={-1}
        aria-hidden
        className="about-glass-cursor__button pointer-events-none h-10 w-10 scale-[0.85]"
        glassColor="oklch(from var(--foreground) l c h / 8%)"
      >
        <span className="sr-only">Cursor</span>
      </GlassButton>
    </motion.div>
  )
}

export default AboutGlassCursor
