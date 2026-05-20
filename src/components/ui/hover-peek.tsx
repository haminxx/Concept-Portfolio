import * as RdxHoverCard from '@radix-ui/react-hover-card'
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from 'motion/react'

import { cn } from '@/lib/utils'

function usePreviewSource(
  url: string,
  width: number,
  height: number,
  isStatic: boolean,
  staticImageSrc?: string
) {
  return useMemo(() => {
    if (isStatic) {
      return staticImageSrc || ''
    }
    const params = new URLSearchParams({
      url,
      screenshot: 'true',
      meta: 'false',
      embed: 'screenshot.url',
      colorScheme: 'dark',
      'viewport.isMobile': 'true',
      'viewport.deviceScaleFactor': '1',
      'viewport.width': String(width * 2.5),
      'viewport.height': String(height * 2.5),
    })
    return `https://api.microlink.io/?${params}`
  }, [isStatic, staticImageSrc, url, width, height])
}

function useHoverState(followMouse: boolean, positionAboveCursor: boolean) {
  const [isPeeking, setPeeking] = useState(false)
  const cursorPosRef = useRef({ x: 0, y: 0 })
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const mouseX = useMotionValue(0)
  const followX = useSpring(mouseX, { stiffness: 120, damping: 20 })

  const updateCursorPos = useCallback((x: number, y: number) => {
    cursorPosRef.current = { x, y }
    setCursorPos({ x, y })
  }, [])

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (positionAboveCursor) {
        updateCursorPos(event.clientX, event.clientY)
      }
      if (!followMouse) return
      const target = event.currentTarget
      const targetRect = target.getBoundingClientRect()
      const eventOffsetX = event.clientX - targetRect.left
      const offsetFromCenter = (eventOffsetX - targetRect.width / 2) * 0.3
      mouseX.set(offsetFromCenter)
    },
    [mouseX, followMouse, positionAboveCursor, updateCursorPos]
  )

  const handlePointerEnter = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!positionAboveCursor) return
      updateCursorPos(event.clientX, event.clientY)
    },
    [positionAboveCursor, updateCursorPos]
  )

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setPeeking(open)
      if (!open) {
        mouseX.set(0)
      }
    },
    [mouseX]
  )

  return {
    isPeeking,
    handleOpenChange,
    handlePointerMove,
    handlePointerEnter,
    followX,
    cursorPos,
    cursorPosRef,
    updateCursorPos,
  }
}

type HoverPeekBaseProps = {
  children: React.ReactNode
  url: string
  className?: string
  peekWidth?: number
  peekHeight?: number
  enableMouseFollow?: boolean
  enableLensEffect?: boolean
  lensZoomFactor?: number
  lensSize?: number
  /** Portal target — keep hover card inside Chrome window bounds. */
  portalContainer?: HTMLElement | null
  /** Pin preview above the pointer instead of beside the trigger. */
  positionAboveCursor?: boolean
}

type HoverPeekProps = HoverPeekBaseProps &
  (
    | { isStatic: true; imageSrc: string }
    | { isStatic?: false; imageSrc?: never }
  )

export function HoverPeek({
  children,
  url,
  className,
  peekWidth = 200,
  peekHeight = 125,
  isStatic = false,
  imageSrc = '',
  enableMouseFollow = true,
  enableLensEffect = true,
  lensZoomFactor = 1.75,
  lensSize = 100,
  portalContainer,
  positionAboveCursor = false,
}: HoverPeekProps) {
  const [imageLoadFailed, setImageLoadFailed] = useState(false)
  const finalImageSrc = usePreviewSource(
    url,
    peekWidth,
    peekHeight,
    isStatic,
    imageSrc
  )
  const {
    isPeeking,
    handleOpenChange,
    handlePointerMove,
    handlePointerEnter,
    followX,
    cursorPos,
    cursorPosRef,
    updateCursorPos,
  } = useHoverState(enableMouseFollow, positionAboveCursor)

  const [isHoveringLens, setIsHoveringLens] = useState(false)
  const [lensMousePosition, setLensMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setImageLoadFailed(false)
  }, [finalImageSrc])

  useEffect(() => {
    if (!isPeeking) {
      setImageLoadFailed(false)
      setIsHoveringLens(false)
      return undefined
    }

    if (!positionAboveCursor) return undefined

    const handleWindowPointerMove = (event: PointerEvent) => {
      updateCursorPos(event.clientX, event.clientY)
    }

    window.addEventListener('pointermove', handleWindowPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', handleWindowPointerMove)
  }, [isPeeking, positionAboveCursor, updateCursorPos])

  const handleLensMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!enableLensEffect) return
    const rect = e.currentTarget.getBoundingClientRect()
    setLensMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleLensMouseEnter = () => {
    if (enableLensEffect) setIsHoveringLens(true)
  }

  const handleLensMouseLeave = () => {
    if (enableLensEffect) setIsHoveringLens(false)
  }

  const cardMotionVariants = {
    initial: { opacity: 0, rotateY: -90, transition: { duration: 0.15 } },
    animate: {
      opacity: 1,
      rotateY: 0,
      transition: { type: 'spring' as const, stiffness: 200, damping: 18 },
    },
    exit: { opacity: 0, rotateY: 90, transition: { duration: 0.15 } },
  }

  const lensMotionVariants = {
    initial: { opacity: 0, scale: 0.7 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.7, transition: { duration: 0.2, ease: 'easeIn' } },
  }

  const mergeTriggerHandlers = <E extends React.SyntheticEvent>(
    childHandler: ((event: E) => void) | undefined,
    nextHandler: (event: E) => void
  ) => {
    return (event: E) => {
      nextHandler(event)
      childHandler?.(event)
    }
  }

  const triggerChild = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: cn(
          (children.props as { className?: string }).className,
          className
        ),
        onPointerMove: mergeTriggerHandlers(
          (children.props as { onPointerMove?: (ev: React.PointerEvent<HTMLElement>) => void })
            .onPointerMove,
          handlePointerMove
        ),
        onPointerEnter: mergeTriggerHandlers(
          (children.props as { onPointerEnter?: (ev: React.PointerEvent<HTMLElement>) => void })
            .onPointerEnter,
          handlePointerEnter
        ),
      })
    : (
        <span
          className={className}
          onPointerMove={handlePointerMove}
          onPointerEnter={handlePointerEnter}
        >
          {children}
        </span>
      )

  const cursorOffset = 14
  const cursorStyle =
    positionAboveCursor && isPeeking
      ? {
          position: 'fixed' as const,
          left: cursorPos.x,
          top: cursorPos.y - peekHeight - cursorOffset,
          transform: 'translateX(-50%)',
          margin: 0,
        }
      : undefined

  return (
    <RdxHoverCard.Root
      openDelay={75}
      closeDelay={150}
      onOpenChange={handleOpenChange}
    >
      <RdxHoverCard.Trigger asChild>{triggerChild}</RdxHoverCard.Trigger>

      <RdxHoverCard.Portal container={portalContainer ?? undefined}>
        <RdxHoverCard.Content
          className={cn(
            'projects-hover-peek-content [perspective:800px] [--radix-hover-card-content-transform-origin:center_center] z-[8]',
            positionAboveCursor && 'projects-hover-peek-content--cursor'
          )}
          side="top"
          align="center"
          sideOffset={positionAboveCursor ? 0 : 12}
          avoidCollisions={!positionAboveCursor}
          updatePositionStrategy={positionAboveCursor ? 'always' : 'optimized'}
          style={{
            pointerEvents: enableLensEffect ? 'none' : 'auto',
            ...cursorStyle,
          }}
        >
          <AnimatePresence>
            {isPeeking && (
              <motion.div
                variants={cardMotionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{
                  x: enableMouseFollow && !positionAboveCursor ? followX : 0,
                  pointerEvents: 'auto',
                }}
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'relative block overflow-hidden rounded-lg bg-white',
                    'border border-[#e8eaed]',
                    'shadow-lg transition-shadow hover:shadow-xl',
                    'p-0.5'
                  )}
                  onMouseEnter={handleLensMouseEnter}
                  onMouseLeave={handleLensMouseLeave}
                  onMouseMove={handleLensMouseMove}
                >
                  {imageLoadFailed ? (
                    <div
                      className="flex items-center justify-center bg-[#f1f3f4] text-xs font-sans text-[#5f6368]"
                      style={{ width: peekWidth, height: peekHeight }}
                    >
                      Preview unavailable
                    </div>
                  ) : (
                    <img
                      src={finalImageSrc}
                      width={peekWidth}
                      height={peekHeight}
                      className="pointer-events-none block rounded-[5px] bg-[#f1f3f4] align-top"
                      alt={`Link preview for ${url}`}
                      onError={() => setImageLoadFailed(true)}
                      loading="lazy"
                    />
                  )}

                  <AnimatePresence>
                    {enableLensEffect && isHoveringLens && !imageLoadFailed && (
                      <motion.div
                        className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
                        variants={lensMotionVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        style={{
                          maskImage: `radial-gradient(circle ${lensSize / 2}px at ${lensMousePosition.x}px ${lensMousePosition.y}px, black ${lensSize / 2}px, transparent ${lensSize / 2}px)`,
                          WebkitMaskImage: `radial-gradient(circle ${lensSize / 2}px at ${lensMousePosition.x}px ${lensMousePosition.y}px, black ${lensSize / 2}px, transparent ${lensSize / 2}px)`,
                        }}
                      >
                        <motion.div
                          className="absolute inset-0"
                          style={{
                            transform: `scale(${lensZoomFactor})`,
                            transformOrigin: `${lensMousePosition.x}px ${lensMousePosition.y}px`,
                          }}
                        >
                          <img
                            src={finalImageSrc}
                            width={peekWidth}
                            height={peekHeight}
                            className="block rounded-[5px] bg-[#f1f3f4] align-top"
                            alt=""
                            aria-hidden
                          />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </RdxHoverCard.Content>
      </RdxHoverCard.Portal>
    </RdxHoverCard.Root>
  )
}
