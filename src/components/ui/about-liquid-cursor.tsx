import { useEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import { cn } from '@/lib/utils'

import './about-liquid-cursor.css'

const DEFAULT_SIZE = 48
const LERP = 0.16
const MAX_STRETCH = 0.55

type AboutLiquidCursorProps = {
  boundsRef: RefObject<HTMLElement | null>
  portalRef?: RefObject<HTMLElement | null>
  size?: number
  className?: string
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

export function AboutLiquidCursor({
  boundsRef,
  portalRef,
  size = DEFAULT_SIZE,
  className,
}: AboutLiquidCursorProps) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  const posRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0 })
  const prevRef = useRef({ x: 0, y: 0 })
  const visibleRef = useRef(false)
  const insideRef = useRef(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    setPortalTarget(portalRef?.current ?? boundsRef.current)
  }, [boundsRef, portalRef])

  useGSAP(
    () => {
      const bounds = boundsRef.current
      const outer = outerRef.current
      const inner = innerRef.current
      if (!bounds || !outer || !inner || reducedMotion) return

      gsap.set(outer, { xPercent: -50, yPercent: -50, opacity: 0 })
      gsap.set(inner, { scaleX: 1, scaleY: 1, rotate: 0, scale: 1 })

      const setVisible = (next: boolean) => {
        if (visibleRef.current === next) return
        visibleRef.current = next
        gsap.to(outer, {
          opacity: next ? 1 : 0,
          duration: next ? 0.22 : 0.28,
          ease: next ? 'power2.out' : 'power2.in',
        })
      }

      const syncTarget = (clientX: number, clientY: number) => {
        const rect = bounds.getBoundingClientRect()
        targetRef.current.x = clientX - rect.left
        targetRef.current.y = clientY - rect.top
      }

      const handlePointerMove = (event: PointerEvent) => {
        const boundsEl = boundsRef.current
        if (!boundsEl) {
          insideRef.current = false
          setVisible(false)
          return
        }

        const inside = isPointerInsideBounds(event.clientX, event.clientY, boundsEl)
        insideRef.current = inside

        if (!inside) {
          setVisible(false)
          return
        }

        syncTarget(event.clientX, event.clientY)

        if (!visibleRef.current) {
          posRef.current.x = targetRef.current.x
          posRef.current.y = targetRef.current.y
          prevRef.current.x = posRef.current.x
          prevRef.current.y = posRef.current.y
          gsap.set(outer, { x: posRef.current.x, y: posRef.current.y })
        }

        setVisible(true)
      }

      const handlePointerLeave = () => {
        insideRef.current = false
        setVisible(false)
      }

      const handlePointerDown = (event: PointerEvent) => {
        const boundsEl = boundsRef.current
        if (!boundsEl || !insideRef.current) return
        if (!isPointerInsideBounds(event.clientX, event.clientY, boundsEl)) return

        gsap.fromTo(
          inner,
          { scale: 1.3 },
          {
            scale: 1,
            duration: 0.55,
            ease: 'elastic.out(1, 0.45)',
            overwrite: 'auto',
          }
        )
      }

      const tick = () => {
        if (!visibleRef.current) return

        const target = targetRef.current
        const pos = posRef.current
        const prev = prevRef.current

        pos.x += (target.x - pos.x) * LERP
        pos.y += (target.y - pos.y) * LERP

        const vx = pos.x - prev.x
        const vy = pos.y - prev.y
        prev.x = pos.x
        prev.y = pos.y

        const speed = Math.hypot(vx, vy)
        const angle = Math.atan2(vy, vx) * (180 / Math.PI)
        const stretch = Math.min(speed * 0.045, MAX_STRETCH)

        gsap.set(outer, { x: pos.x, y: pos.y })
        gsap.set(inner, {
          rotate: speed > 0.15 ? angle : 0,
          scaleX: 1 + stretch,
          scaleY: Math.max(0.45, 1 - stretch * 0.55),
        })
      }

      document.addEventListener('pointermove', handlePointerMove, { passive: true })
      bounds.addEventListener('pointerleave', handlePointerLeave)
      document.addEventListener('pointerdown', handlePointerDown)
      gsap.ticker.add(tick)

      return () => {
        document.removeEventListener('pointermove', handlePointerMove)
        bounds.removeEventListener('pointerleave', handlePointerLeave)
        document.removeEventListener('pointerdown', handlePointerDown)
        gsap.ticker.remove(tick)
      }
    },
    { dependencies: [boundsRef, reducedMotion, portalTarget], scope: outerRef }
  )

  if (reducedMotion || !portalTarget) return null

  return createPortal(
    <div
      ref={outerRef}
      className={cn('about-liquid-cursor', className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div ref={innerRef} className="about-liquid-cursor__blob" />
    </div>,
    portalTarget
  )
}

export default AboutLiquidCursor
