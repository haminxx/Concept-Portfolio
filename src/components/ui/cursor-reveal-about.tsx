import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type PointerEvent,
} from 'react'

import './cursor-reveal-about.css'

const STAMP_RADIUS = 56
const STAMP_SOFT = 24
const MIN_DISTANCE = 8

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

export type CursorRevealAboutHandle = {
  getContainer: () => HTMLDivElement | null
}

export const CursorRevealAbout = forwardRef<CursorRevealAboutHandle>(
  function CursorRevealAbout(_props, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const hintRef = useRef<HTMLParagraphElement>(null)
    const hasMovedRef = useRef(false)
    const lastPointRef = useRef<{ x: number; y: number } | null>(null)
    const dprRef = useRef(1)

    useImperativeHandle(ref, () => ({
      getContainer: () => containerRef.current,
    }))

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
      ctx.fillStyle = '#ffffff'
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

    const handlePointerMove = useCallback(
      (event: PointerEvent<HTMLDivElement>) => {
        const container = containerRef.current
        if (!container) return

        const rect = container.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        revealAt(x, y)

        if (!hasMovedRef.current) {
          hasMovedRef.current = true
          hintRef.current?.style.setProperty('opacity', '0')
        }
      },
      [revealAt]
    )

    const handlePointerDown = useCallback(
      (event: PointerEvent<HTMLDivElement>) => {
        const container = containerRef.current
        if (!container) return

        const rect = container.getBoundingClientRect()
        revealAt(event.clientX - rect.left, event.clientY - rect.top, true)

        if (!hasMovedRef.current) {
          hasMovedRef.current = true
          hintRef.current?.style.setProperty('opacity', '0')
        }
      },
      [revealAt]
    )

    return (
      <div
        ref={containerRef}
        className="cursor-reveal-about"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
      >
        <div className="cursor-reveal-about__content">
          <p className="cursor-reveal-about__eyebrow">haminxx</p>
          <h1 className="cursor-reveal-about__headline">Portfolio</h1>
          <p className="cursor-reveal-about__intro">
            Product designer and engineer building interfaces, systems, and
            experiences — from hackathon prototypes to side-project tools people
            actually use.
          </p>

          <div className="cursor-reveal-about__meta">
            <div className="cursor-reveal-about__meta-block">
              <span className="cursor-reveal-about__meta-label">Focus</span>
              <p className="cursor-reveal-about__meta-value">
                Visual design, interaction, full-stack development
              </p>
            </div>
            <div className="cursor-reveal-about__meta-block">
              <span className="cursor-reveal-about__meta-label">Currently</span>
              <p className="cursor-reveal-about__meta-value">
                Open to collaborations and freelance projects
              </p>
            </div>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="cursor-reveal-about__veil"
          aria-hidden
        />

        <p ref={hintRef} className="cursor-reveal-about__hint">
          Move cursor to reveal
        </p>
      </div>
    )
  }
)

export default CursorRevealAbout
