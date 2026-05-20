import { useEffect, useRef, type RefObject } from 'react'

export interface InteractiveCanvasProps {
  containerRef?: RefObject<HTMLElement | null>
  gridWidth?: number
  gridHeight?: number
  dotColor?: string
  lineColor?: string
  accentLineColor?: string
  accentDistance?: number
  backgroundColor?: string
  padding?: number
  maxDistance?: number
  dotSizeMultiplier?: number
  className?: string
}

type Dot = {
  x: number
  y: number
  ox: number
  oy: number
  size?: number
  angle?: number
}

export function InteractiveCanvas({
  containerRef,
  gridWidth = 120,
  gridHeight = 120,
  dotColor = '#d1d5db',
  lineColor = '#6b7280',
  accentLineColor = '#4ade80',
  accentDistance = 120,
  backgroundColor = 'transparent',
  padding = 0,
  maxDistance = 72,
  dotSizeMultiplier = 200,
  className = '',
}: InteractiveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const dotsRef = useRef<Dot[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef?.current ?? canvas?.parentElement
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const ratio = window.devicePixelRatio || 1
    let width = 0
    let height = 0

    const createDots = () => {
      dotsRef.current = []
      if (width <= 0 || height <= 0) return

      for (let i = 0; i < gridWidth; i++) {
        const x = Math.floor(((width - padding * 2) / (gridWidth - 1)) * i + padding)

        for (let j = 0; j < gridHeight; j++) {
          const y = Math.floor(((height - padding * 2) / (gridHeight - 1)) * j + padding)

          dotsRef.current.push({
            x,
            y,
            ox: x,
            oy: y,
          })
        }
      }
    }

    const handleResize = () => {
      const rect = container.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.max(1, Math.floor(width * ratio))
      canvas.height = Math.max(1, Math.floor(height * ratio))
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      createDots()
    }

    handleResize()

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }

    const handleMouseLeave = () => {
      mouseRef.current.x = -9999
      mouseRef.current.y = -9999
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    const getDistance = (obj1: { x: number; y: number }, obj2: { x: number; y: number }) => {
      const dx = obj1.x - obj2.x
      const dy = obj1.y - obj2.y
      return Math.sqrt(dx * dx + dy * dy)
    }

    const getAngle = (obj1: { x: number; y: number }, obj2: { x: number; y: number }) => {
      const dX = obj2.x - obj1.x
      const dY = obj2.y - obj1.y
      return (Math.atan2(dY, dX) / Math.PI) * 180
    }

    const getVector = (dot: Dot) => {
      const d = getDistance(dot, mouseRef.current)
      dot.size = (dotSizeMultiplier - d) / 18
      dot.size = dot.size < 1 ? 1 : dot.size
      dot.angle = getAngle(dot, mouseRef.current)

      const distance = d > maxDistance ? maxDistance : d
      return {
        distance: d,
        x: distance * Math.cos((dot.angle * Math.PI) / 180),
        y: distance * Math.sin((dot.angle * Math.PI) / 180),
      }
    }

    const circleMethod = function (this: CanvasRenderingContext2D, x: number, y: number, r: number) {
      this.beginPath()
      this.arc(x, y, r, 0, 2 * Math.PI, false)
      this.closePath()
    }
    ;(ctx as CanvasRenderingContext2D & { circle?: typeof circleMethod }).circle = circleMethod

    let frameId = 0

    const animate = () => {
      if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
      } else {
        ctx.clearRect(0, 0, width, height)
      }

      for (let i = 0; i < dotsRef.current.length; i++) {
        const dot = dotsRef.current[i]
        const v = getVector(dot)
        const nearCursor = v.distance < accentDistance

        ctx.beginPath()
        ctx.moveTo(dot.x, dot.y)
        ctx.lineTo(dot.x + v.x, dot.y + v.y)
        ctx.strokeStyle = nearCursor ? accentLineColor : lineColor
        ctx.lineWidth = nearCursor ? 1.25 : 1
        ctx.stroke()
        ctx.closePath()
      }

      ctx.fillStyle = dotColor

      for (let i = 0; i < dotsRef.current.length; i++) {
        const dot = dotsRef.current[i]
        const v = getVector(dot)
        const nearCursor = v.distance < accentDistance
        if (nearCursor) {
          ctx.fillStyle = accentLineColor
        } else {
          ctx.fillStyle = dotColor
        }
        ;(ctx as CanvasRenderingContext2D & { circle: typeof circleMethod }).circle(
          dot.x + v.x,
          dot.y + v.y,
          (dot.size || 1) / 2
        )
        ctx.fill()
      }

      frameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [
    containerRef,
    gridWidth,
    gridHeight,
    dotColor,
    lineColor,
    accentLineColor,
    accentDistance,
    backgroundColor,
    padding,
    maxDistance,
    dotSizeMultiplier,
  ])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 block h-full w-full ${className}`.trim()}
      aria-hidden="true"
      style={{
        margin: 0,
        overflow: 'hidden',
        background: 'transparent',
        pointerEvents: 'none',
      }}
    />
  )
}
