import { useState, useEffect, useRef, type RefObject } from 'react'

interface CursorProps {
  size?: number
  containerRef: RefObject<HTMLElement | null>
}

export function Cursor({ size = 60, containerRef }: CursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<number>()
  const previousPos = useRef({ x: -size, y: -size })
  const positionRef = useRef({ x: -size, y: -size })

  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const animate = () => {
      if (!cursorRef.current) return

      const currentX = previousPos.current.x
      const currentY = previousPos.current.y
      const targetX = positionRef.current.x - size / 2
      const targetY = positionRef.current.y - size / 2

      const deltaX = (targetX - currentX) * 0.2
      const deltaY = (targetY - currentY) * 0.2

      const newX = currentX + deltaX
      const newY = currentY + deltaY

      previousPos.current = { x: newX, y: newY }
      cursorRef.current.style.transform = `translate(${newX}px, ${newY}px)`

      requestRef.current = requestAnimationFrame(animate)
    }

    const handleMouseMove = (e: MouseEvent) => {
      positionRef.current = { x: e.clientX, y: e.clientY }
      setVisible(true)
    }

    const handleMouseEnter = () => {
      setVisible(true)
    }

    const handleMouseLeave = () => {
      setVisible(false)
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)

    requestRef.current = requestAnimationFrame(animate)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [containerRef, size])

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed z-50 rounded-full bg-white mix-blend-difference transition-opacity duration-300"
      style={{
        width: size,
        height: size,
        opacity: visible ? 1 : 0,
      }}
      aria-hidden="true"
    />
  )
}

export default Cursor
