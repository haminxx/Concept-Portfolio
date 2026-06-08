import { useEffect, useRef } from 'react'

/**
 * Tracks the mouse position relative to `containerRef` (falls back to viewport
 * coordinates when no container is provided). The position is stored in a ref
 * and updated on every mousemove so consumers can read it inside an animation
 * frame loop WITHOUT triggering React re-renders.
 *
 * @param {React.RefObject<HTMLElement>} [containerRef]
 * @returns {React.MutableRefObject<{ x: number, y: number }>}
 */
export function useMousePositionRef(containerRef) {
  const positionRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const updatePosition = (clientX, clientY) => {
      const container = containerRef?.current
      if (container) {
        const rect = container.getBoundingClientRect()
        positionRef.current = { x: clientX - rect.left, y: clientY - rect.top }
      } else {
        positionRef.current = { x: clientX, y: clientY }
      }
    }

    const handleMouseMove = (e) => updatePosition(e.clientX, e.clientY)
    const handleTouchMove = (e) => {
      const touch = e.touches[0]
      if (touch) updatePosition(touch.clientX, touch.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [containerRef])

  return positionRef
}

export default useMousePositionRef
