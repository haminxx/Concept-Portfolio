import { useState, useRef, useEffect, type MouseEvent as ReactMouseEvent, type RefObject } from 'react'
import { cn } from '@/lib/utils'

interface MouseFollowingEyesProps {
  className?: string
  /** Eye diameter in px (default 40). Pupil and movement scale proportionally. */
  eyeSize?: number
  /** Track pointer on the whole window (toolbar). When false, uses trackingRoot or the eyes container. */
  trackWindow?: boolean
  /** Element to listen for pointer moves (e.g. Chrome home content area). */
  trackingRoot?: RefObject<HTMLElement | null>
}

export function MouseFollowingEyes({
  className,
  eyeSize = 40,
  trackWindow = true,
  trackingRoot,
}: MouseFollowingEyesProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const eye1Ref = useRef<HTMLDivElement>(null)
  const eye2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (trackWindow) {
      const handleMouseMove = (e: MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY })
      }
      window.addEventListener('mousemove', handleMouseMove)
      return () => window.removeEventListener('mousemove', handleMouseMove)
    }

    const root = trackingRoot?.current ?? containerRef.current
    if (!root) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    root.addEventListener('mousemove', handleMouseMove)
    return () => root.removeEventListener('mousemove', handleMouseMove)
  }, [trackWindow, trackingRoot])

  const handleLocalMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (trackWindow || trackingRoot) return
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  return (
    <div
      ref={containerRef}
      className={cn('flex h-full w-full items-center justify-center', className)}
      onMouseMove={trackWindow || trackingRoot ? undefined : handleLocalMouseMove}
      aria-hidden="true"
    >
      <div className="flex items-center" style={{ gap: eyeSize * 0.2 }}>
        <Eye
          mouseX={mousePos.x}
          mouseY={mousePos.y}
          eyeSize={eyeSize}
          selfRef={eye1Ref}
          otherRef={eye2Ref}
        />
        <Eye
          mouseX={mousePos.x}
          mouseY={mousePos.y}
          eyeSize={eyeSize}
          selfRef={eye2Ref}
          otherRef={eye1Ref}
        />
      </div>
    </div>
  )
}

interface EyeProps {
  mouseX: number
  mouseY: number
  eyeSize: number
  selfRef: RefObject<HTMLDivElement | null>
  otherRef: RefObject<HTMLDivElement | null>
}

const Eye = ({ mouseX, mouseY, eyeSize, selfRef, otherRef }: EyeProps) => {
  const pupilSize = eyeSize * 0.35
  const maxMove = eyeSize * 0.2
  const highlightSize = eyeSize * 0.1
  const highlightOffset = eyeSize * 0.05
  const pupilRef = useRef<HTMLDivElement>(null)
  const [center, setCenter] = useState({ x: 0, y: 0 })

  const updateCenter = () => {
    if (!selfRef.current) return
    const rect = selfRef.current.getBoundingClientRect()
    setCenter({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
  }

  useEffect(() => {
    updateCenter()
    window.addEventListener('resize', updateCenter)
    return () => window.removeEventListener('resize', updateCenter)
  }, [selfRef])

  useEffect(() => {
    updateCenter()

    const isInside = (ref: RefObject<HTMLDivElement | null>) => {
      const rect = ref.current?.getBoundingClientRect()
      if (!rect) return false
      return (
        mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom
      )
    }

    if (isInside(selfRef) || isInside(otherRef)) return

    const dx = mouseX - center.x
    const dy = mouseY - center.y
    const angle = Math.atan2(dy, dx)

    const pupilX = Math.cos(angle) * maxMove
    const pupilY = Math.sin(angle) * maxMove

    if (pupilRef.current) {
      pupilRef.current.style.transform = `translate(${pupilX}px, ${pupilY}px)`
    }
  }, [mouseX, mouseY, center.x, center.y, selfRef, otherRef, maxMove])

  return (
    <div
      ref={selfRef}
      className="relative flex items-center justify-center rounded-full border-2 border-white/30 bg-white"
      style={{ width: eyeSize, height: eyeSize }}
    >
      <div
        ref={pupilRef}
        className="absolute rounded-full bg-black transition-all duration-[5ms]"
        style={{ width: pupilSize, height: pupilSize }}
      >
        <div
          className="absolute rounded-full bg-white"
          style={{
            width: highlightSize,
            height: highlightSize,
            bottom: highlightOffset,
            right: highlightOffset,
          }}
        />
      </div>
    </div>
  )
}
