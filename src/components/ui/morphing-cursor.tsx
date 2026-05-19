import type { ReactNode } from 'react'
import { useRef, useState, useCallback, useEffect, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'

interface MagneticTextProps {
  text?: string
  hoverText?: string
  className?: string
  textClassName?: string
  hoverTextClassName?: string
  circleClassName?: string
  circleSize?: number
  children?: ReactNode
}

const defaultTextClass = 'text-5xl font-bold tracking-tighter tracking-wide text-foreground'

export function MagneticText({
  text = 'CREATIVE',
  hoverText = 'EXPLORE',
  className,
  textClassName,
  hoverTextClassName,
  circleClassName,
  circleSize = 150,
  children,
}: MagneticTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)
  const innerTextRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  const mousePos = useRef({ x: 0, y: 0 })
  const currentPos = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number>()

  const baseTextClass = cn(defaultTextClass, textClassName)
  const revealTextClass = cn(defaultTextClass, 'text-background whitespace-nowrap', hoverTextClassName)

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [text, children])

  useEffect(() => {
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor

    const animate = () => {
      currentPos.current.x = lerp(currentPos.current.x, mousePos.current.x, 0.15)
      currentPos.current.y = lerp(currentPos.current.y, mousePos.current.y, 0.15)

      if (circleRef.current) {
        circleRef.current.style.transform = `translate(${currentPos.current.x}px, ${currentPos.current.y}px) translate(-50%, -50%)`
      }

      if (innerTextRef.current) {
        innerTextRef.current.style.transform = `translate(${-currentPos.current.x}px, ${-currentPos.current.y}px)`
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    mousePos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }, [])

  const handleMouseEnter = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    mousePos.current = { x, y }
    currentPos.current = { x, y }
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  const baseContent = children ?? <span className={baseTextClass}>{text}</span>

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative z-[1] inline-flex cursor-none select-none items-center justify-center overflow-visible',
        className,
      )}
    >
      {baseContent}

      <div
        ref={circleRef}
        className={cn(
          'pointer-events-none absolute top-0 left-0 z-[2] overflow-hidden rounded-full bg-foreground',
          circleClassName,
        )}
        style={{
          width: isHovered ? circleSize : 0,
          height: isHovered ? circleSize : 0,
          transition: 'width 0.5s cubic-bezier(0.33, 1, 0.68, 1), height 0.5s cubic-bezier(0.33, 1, 0.68, 1)',
          willChange: 'transform, width, height',
        }}
      >
        <div
          ref={innerTextRef}
          className="absolute flex items-center justify-center"
          style={{
            width: containerSize.width,
            height: containerSize.height,
            top: '50%',
            left: '50%',
            willChange: 'transform',
          }}
        >
          <span className={revealTextClass}>{hoverText}</span>
        </div>
      </div>
    </div>
  )
}
