import { useState, useRef, useEffect, type MouseEvent as ReactMouseEvent, type RefObject } from 'react'
import { cn } from '@/lib/utils'

interface MouseFollowingEyesProps {
  className?: string
  /** Track pointer on the whole window (better for narrow toolbar). */
  trackWindow?: boolean
}

export function MouseFollowingEyes({ className, trackWindow = true }: MouseFollowingEyesProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const eye1Ref = useRef<HTMLDivElement>(null)
  const eye2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!trackWindow) return
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [trackWindow])

  const handleLocalMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (trackWindow) return
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  return (
    <div
      className={cn('flex h-full w-full items-center justify-center', className)}
      onMouseMove={trackWindow ? undefined : handleLocalMouseMove}
      aria-hidden="true"
    >
      <div className="flex items-center gap-2">
        <Eye
          mouseX={mousePos.x}
          mouseY={mousePos.y}
          selfRef={eye1Ref}
          otherRef={eye2Ref}
        />
        <Eye
          mouseX={mousePos.x}
          mouseY={mousePos.y}
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
  selfRef: RefObject<HTMLDivElement | null>
  otherRef: RefObject<HTMLDivElement | null>
}

const Eye = ({ mouseX, mouseY, selfRef, otherRef }: EyeProps) => {
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

    const maxMove = 8
    const pupilX = Math.cos(angle) * maxMove
    const pupilY = Math.sin(angle) * maxMove

    if (pupilRef.current) {
      pupilRef.current.style.transform = `translate(${pupilX}px, ${pupilY}px)`
    }
  }, [mouseX, mouseY, center.x, center.y, selfRef, otherRef])

  return (
    <div
      ref={selfRef}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-white"
    >
      <div
        ref={pupilRef}
        className="absolute h-3.5 w-3.5 rounded-full bg-black transition-all duration-[5ms]"
      >
        <div className="absolute bottom-0.5 right-0.5 h-1 w-1 rounded-full bg-white" />
      </div>
    </div>
  )
}
