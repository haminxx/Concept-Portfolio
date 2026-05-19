import { useState, useEffect, useMemo, useRef, type ReactNode } from 'react'
import {
  motion,
  useTransform,
  useSpring,
  useMotionValue,
} from 'motion/react'

export type AnimationPhase = 'scatter' | 'line' | 'circle' | 'bottom-strip'

export type ScrollContentSection = {
  id: string
  /** Scroll progress 0–1 (virtualScroll / MAX_SCROLL) where this section peaks */
  threshold: number
  title: string
  subtitle?: string
  body?: ReactNode
  align?: 'center' | 'top'
}

export type ScrollMorphHeroProps = {
  contentSections?: ScrollContentSection[]
  /** Called when scroll progress changes (0–1) */
  onScrollProgress?: (progress: number) => void
}

interface FlipCardProps {
  src: string
  index: number
  target: { x: number; y: number; rotation: number; scale: number; opacity: number }
}

const IMG_WIDTH = 60
const IMG_HEIGHT = 85
const TOTAL_IMAGES = 20
const MAX_SCROLL = 3000
const FADE_RANGE = 0.14

const IMAGES = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&q=80',
  'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=300&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&q=80',
  'https://images.unsplash.com/photo-1506765515384-028b60a970df?w=300&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&q=80',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=300&q=80',
  'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=300&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&q=80',
  'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=300&q=80',
  'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=300&q=80',
  'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=300&q=80',
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=300&q=80',
  'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=300&q=80',
  'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=300&q=80',
  'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=300&q=80',
  'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=300&q=80',
  'https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=300&q=80',
]

const DEFAULT_SECTIONS: ScrollContentSection[] = [
  {
    id: 'intro',
    threshold: 0,
    title: 'The future is built on AI.',
    subtitle: 'SCROLL TO EXPLORE',
    align: 'center',
  },
  {
    id: 'vision',
    threshold: 0.2,
    title: 'Explore Our Vision',
    body: (
      <>
        Discover a world where technology meets creativity.
        <br className="hidden md:block" />
        Scroll through our curated collection of innovations designed to shape the future.
      </>
    ),
    align: 'top',
  },
  {
    id: 'craft',
    threshold: 0.3,
    title: 'Design Meets Engineering',
    body: 'Interfaces, systems, and experiences crafted with intent — from concept sketches to shipped products.',
    align: 'top',
  },
  {
    id: 'work',
    threshold: 0.6,
    title: 'Selected Work',
    body: 'Each project blends product thinking, visual design, and full-stack development into something people actually use.',
    align: 'top',
  },
  {
    id: 'connect',
    threshold: 0.9,
    title: "Let's Build Together",
    body: 'Open to collaborations, freelance projects, and conversations about what comes next.',
    align: 'top',
  },
]

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t

function sectionOpacity(progress: number, threshold: number, fadeRange = FADE_RANGE): number {
  const dist = Math.abs(progress - threshold)
  if (dist >= fadeRange) return 0
  return 1 - dist / fadeRange
}

function FlipCard({ src, index, target }: FlipCardProps) {
  return (
    <motion.div
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotation,
        scale: target.scale,
        opacity: target.opacity,
      }}
      transition={{
        type: 'spring',
        stiffness: 40,
        damping: 15,
      }}
      style={{
        position: 'absolute',
        width: IMG_WIDTH,
        height: IMG_HEIGHT,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      className="cursor-pointer group"
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ rotateY: 180 }}
      >
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-gray-200"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <img src={src} alt={`hero-${index}`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />
        </div>

        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-gray-900 flex flex-col items-center justify-center p-4 border border-gray-700"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="text-center">
            <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest mb-1">View</p>
            <p className="text-xs font-medium text-white">Details</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ScrollTextLayers({
  sections,
  scrollProgress,
  introPhase,
  morphValue,
}: {
  sections: ScrollContentSection[]
  scrollProgress: number
  introPhase: AnimationPhase
  morphValue: number
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {sections.map((section) => {
        let opacity = sectionOpacity(scrollProgress, section.threshold)

        if (section.id === 'intro') {
          const introVisible = introPhase === 'circle' && morphValue < 0.5
          opacity = introVisible ? Math.max(opacity, 1 - morphValue * 2) : 0
        }

        const isCenter = section.align === 'center'
        const yOffset = isCenter ? 0 : 0

        return (
          <motion.div
            key={section.id}
            className={
              isCenter
                ? 'absolute inset-0 flex flex-col items-center justify-center px-4 text-center'
                : 'absolute top-[10%] left-0 right-0 flex flex-col items-center justify-center px-4 text-center'
            }
            style={{ opacity, y: (1 - opacity) * 20 + yOffset }}
            aria-hidden={opacity < 0.05}
          >
            {section.subtitle && (
              <p className="text-xs font-bold tracking-[0.2em] text-gray-500 mb-4">{section.subtitle}</p>
            )}
            <h2
              className={
                isCenter
                  ? 'text-2xl font-medium tracking-tight text-gray-800 md:text-4xl'
                  : 'text-3xl md:text-5xl font-semibold text-gray-900 tracking-tight mb-4'
              }
            >
              {section.title}
            </h2>
            {section.body && (
              <p className="text-sm md:text-base text-gray-600 max-w-lg leading-relaxed">{section.body}</p>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

export function ScrollMorphHero({ contentSections = DEFAULT_SECTIONS, onScrollProgress }: ScrollMorphHeroProps) {
  const [introPhase, setIntroPhase] = useState<AnimationPhase>('scatter')
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [scrollProgress, setScrollProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    }

    const observer = new ResizeObserver(handleResize)
    observer.observe(containerRef.current)

    setContainerSize({
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
    })

    return () => observer.disconnect()
  }, [])

  const virtualScroll = useMotionValue(0)
  const scrollRef = useRef(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const newScroll = Math.min(Math.max(scrollRef.current + e.deltaY, 0), MAX_SCROLL)
      scrollRef.current = newScroll
      virtualScroll.set(newScroll)

      const progress = newScroll / MAX_SCROLL
      setScrollProgress(progress)
      onScrollProgress?.(progress)
    }

    let touchStartY = 0
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const touchY = e.touches[0].clientY
      const deltaY = touchStartY - touchY
      touchStartY = touchY

      const newScroll = Math.min(Math.max(scrollRef.current + deltaY, 0), MAX_SCROLL)
      scrollRef.current = newScroll
      virtualScroll.set(newScroll)

      const progress = newScroll / MAX_SCROLL
      setScrollProgress(progress)
      onScrollProgress?.(progress)
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
    }
  }, [virtualScroll, onScrollProgress])

  const morphProgress = useTransform(virtualScroll, [0, 600], [0, 1])
  const smoothMorph = useSpring(morphProgress, { stiffness: 40, damping: 20 })

  const scrollRotate = useTransform(virtualScroll, [600, 3000], [0, 360])
  const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 40, damping: 20 })

  const mouseX = useMotionValue(0)
  const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const relativeX = e.clientX - rect.left
      const normalizedX = (relativeX / rect.width) * 2 - 1
      mouseX.set(normalizedX * 100)
    }
    container.addEventListener('mousemove', handleMouseMove)
    return () => container.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX])

  useEffect(() => {
    const timer1 = setTimeout(() => setIntroPhase('line'), 500)
    const timer2 = setTimeout(() => setIntroPhase('circle'), 2500)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  const scatterPositions = useMemo(
    () =>
      IMAGES.map(() => ({
        x: (Math.random() - 0.5) * 1500,
        y: (Math.random() - 0.5) * 1000,
        rotation: (Math.random() - 0.5) * 180,
        scale: 0.6,
        opacity: 0,
      })),
    [],
  )

  const [morphValue, setMorphValue] = useState(0)
  const [rotateValue, setRotateValue] = useState(0)
  const [parallaxValue, setParallaxValue] = useState(0)

  useEffect(() => {
    const unsubscribeMorph = smoothMorph.on('change', setMorphValue)
    const unsubscribeRotate = smoothScrollRotate.on('change', setRotateValue)
    const unsubscribeParallax = smoothMouseX.on('change', setParallaxValue)
    return () => {
      unsubscribeMorph()
      unsubscribeRotate()
      unsubscribeParallax()
    }
  }, [smoothMorph, smoothScrollRotate, smoothMouseX])

  return (
    <div ref={containerRef} className="scroll-morph-hero relative h-full w-full overflow-hidden bg-[#FAFAFA]">
      <div className="flex h-full w-full flex-col items-center justify-center [perspective:1000px]">
        <ScrollTextLayers
          sections={contentSections}
          scrollProgress={scrollProgress}
          introPhase={introPhase}
          morphValue={morphValue}
        />

        <div className="relative flex h-full w-full items-center justify-center">
          {IMAGES.slice(0, TOTAL_IMAGES).map((src, i) => {
            let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 }

            if (introPhase === 'scatter') {
              target = scatterPositions[i]
            } else if (introPhase === 'line') {
              const lineSpacing = 70
              const lineTotalWidth = TOTAL_IMAGES * lineSpacing
              const lineX = i * lineSpacing - lineTotalWidth / 2
              target = { x: lineX, y: 0, rotation: 0, scale: 1, opacity: 1 }
            } else {
              const isMobile = containerSize.width < 768
              const minDimension = Math.min(containerSize.width, containerSize.height)

              const circleRadius = Math.min(minDimension * 0.35, 350)
              const circleAngle = (i / TOTAL_IMAGES) * 360
              const circleRad = (circleAngle * Math.PI) / 180
              const circlePos = {
                x: Math.cos(circleRad) * circleRadius,
                y: Math.sin(circleRad) * circleRadius,
                rotation: circleAngle + 90,
              }

              const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5)
              const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1)
              const arcApexY = containerSize.height * (isMobile ? 0.35 : 0.25)
              const arcCenterY = arcApexY + arcRadius

              const spreadAngle = isMobile ? 100 : 130
              const startAngle = -90 - spreadAngle / 2
              const step = spreadAngle / (TOTAL_IMAGES - 1)

              const scrollProgressRot = Math.min(Math.max(rotateValue / 360, 0), 1)
              const maxRotation = spreadAngle * 0.8
              const boundedRotation = -scrollProgressRot * maxRotation

              const currentArcAngle = startAngle + i * step + boundedRotation
              const arcRad = (currentArcAngle * Math.PI) / 180

              const arcPos = {
                x: Math.cos(arcRad) * arcRadius + parallaxValue,
                y: Math.sin(arcRad) * arcRadius + arcCenterY,
                rotation: currentArcAngle + 90,
                scale: isMobile ? 1.4 : 1.8,
              }

              target = {
                x: lerp(circlePos.x, arcPos.x, morphValue),
                y: lerp(circlePos.y, arcPos.y, morphValue),
                rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
                scale: lerp(1, arcPos.scale, morphValue),
                opacity: 1,
              }
            }

            return <FlipCard key={i} src={src} index={i} target={target} />
          })}
        </div>
      </div>
    </div>
  )
}

export default ScrollMorphHero
