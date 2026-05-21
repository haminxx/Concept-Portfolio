import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent,
} from 'react'

import './cursor-reveal-about.css'

const STAMP_RADIUS = 84
const STAMP_SOFT = 32
const MIN_DISTANCE = 8

const VEIL_LIGHT = '#ffffff'
const VEIL_DARK = '#0a0a0a'
const CONTENT_LIGHT = '#0a0a0a'
const CONTENT_DARK = '#f5f5f5'

function stampTrail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  soft: number
) {
  const gradient = ctx.createRadialGradient(x, y, Math.max(0, radius - soft), x, y, radius)
  gradient.addColorStop(0, 'rgba(0, 0, 0, 1)')
  gradient.addColorStop(0.72, 'rgba(0, 0, 0, 0.85)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function recolorVeil(ctx: CanvasRenderingContext2D, width: number, height: number, color: string) {
  ctx.save()
  ctx.globalCompositeOperation = 'source-atop'
  ctx.fillStyle = color
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
}

export type CursorRevealAboutHandle = {
  getContainer: () => HTMLDivElement | null
}

type CursorRevealAboutProps = {
  isDark?: boolean
}

export const CursorRevealAbout = forwardRef<CursorRevealAboutHandle, CursorRevealAboutProps>(
  function CursorRevealAbout({ isDark = false }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const hasMovedRef = useRef(false)
    const [hasRevealed, setHasRevealed] = useState(false)
    const lastPointRef = useRef<{ x: number; y: number } | null>(null)
    const dprRef = useRef(1)
    const veilColor = isDark ? VEIL_DARK : VEIL_LIGHT
    const contentColor = isDark ? CONTENT_DARK : CONTENT_LIGHT

    useImperativeHandle(ref, () => ({
      getContainer: () => containerRef.current,
    }))

    const veilColorRef = useRef(veilColor)
    veilColorRef.current = veilColor

    const resizeCanvas = useCallback(() => {
      const container = containerRef.current
      const canvas = canvasRef.current
      if (!container || !canvas) return

      const rect = container.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      dprRef.current = dpr

      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = veilColorRef.current
      ctx.fillRect(0, 0, rect.width, rect.height)
      lastPointRef.current = null
    }, [])

    useEffect(() => {
      resizeCanvas()

      const container = containerRef.current
      if (!container) return

      const observer = new ResizeObserver(() => resizeCanvas())
      observer.observe(container)
      window.addEventListener('orientationchange', resizeCanvas)

      return () => {
        observer.disconnect()
        window.removeEventListener('orientationchange', resizeCanvas)
      }
    }, [resizeCanvas])

    useEffect(() => {
      const canvas = canvasRef.current
      const container = containerRef.current
      const ctx = canvas?.getContext('2d')
      if (!ctx || !container) return

      const rect = container.getBoundingClientRect()
      recolorVeil(ctx, rect.width, rect.height, veilColor)
    }, [veilColor])

    const revealAt = useCallback((x: number, y: number, force = false) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!ctx) return

      const last = lastPointRef.current
      if (!force && last) {
        const dx = x - last.x
        const dy = y - last.y
        if (Math.hypot(dx, dy) < MIN_DISTANCE) return
      }

      stampTrail(ctx, x, y, STAMP_RADIUS, STAMP_SOFT)
      lastPointRef.current = { x, y }
    }, [])

    const markRevealed = useCallback(() => {
      if (hasMovedRef.current) return
      hasMovedRef.current = true
      setHasRevealed(true)
    }, [])

    const handlePointerMove = useCallback(
      (event: PointerEvent<HTMLDivElement>) => {
        const container = containerRef.current
        if (!container) return

        const rect = container.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        revealAt(x, y)
        markRevealed()
      },
      [revealAt, markRevealed]
    )

    const handlePointerDown = useCallback(
      (event: PointerEvent<HTMLDivElement>) => {
        const container = containerRef.current
        if (!container) return

        const rect = container.getBoundingClientRect()
        revealAt(event.clientX - rect.left, event.clientY - rect.top, true)
        markRevealed()
      },
      [revealAt, markRevealed]
    )

    return (
      <div
        ref={containerRef}
        className={`cursor-reveal-about${isDark ? ' cursor-reveal-about--dark' : ''}`}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
      >
        <div
          className="cursor-reveal-about__content"
          style={{ backgroundColor: contentColor }}
          aria-hidden
        />

        <div className="cursor-reveal-about__below-veil" aria-hidden>
          <div className="cursor-reveal-about__headline-row">
            <span className="cursor-reveal-about__question-spacer">Who am I?</span>
            <p className="cursor-reveal-about__name" aria-hidden={!hasRevealed}>
              Christian Lee
            </p>
          </div>

          <p className="cursor-reveal-about__bio">
            Designer and developer crafting thoughtful digital experiences — from
            concept to polished interfaces — based in the Pacific Northwest.
          </p>

          <p className="cursor-reveal-about__hint">Move cursor to reveal</p>
        </div>

        <canvas
          ref={canvasRef}
          className="cursor-reveal-about__veil"
          aria-hidden
        />

        <h1 className="cursor-reveal-about__question">Who am I?</h1>
      </div>
    )
  }
)

export default CursorRevealAbout
