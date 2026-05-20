import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { cn } from '@/lib/utils'

const DEFAULT_MORPH_TIME = 1.5
const DEFAULT_COOLDOWN_TIME = 0.5
/** Hover / one-shot morph (e.g. Chrome Home shortcut labels). */
const SHORT_MORPH_TIME = 0.45
const SHORT_COOLDOWN_TIME = 0.15
const MORPH_BLUR_SCALE = 3
const MORPH_BLUR_MAX = 10
const MORPH_OPACITY_EXP = 0.65

function morphBlurPx(fraction: number): string {
  const safe = Math.max(fraction, 0.06)
  const px = Math.min(MORPH_BLUR_SCALE / safe - MORPH_BLUR_SCALE, MORPH_BLUR_MAX)
  return `${px}px`
}

function morphOpacityPct(fraction: number): string {
  return `${Math.pow(fraction, MORPH_OPACITY_EXP) * 100}%`
}

export type MorphingTextProps = {
  className?: string
  texts: string[]
  /** Unique SVG filter id (required when multiple instances on one page). */
  filterId?: string
  /** With exactly 2 texts: morph once toward texts[1] while true, back to texts[0] while false. */
  active?: boolean
  morphTime?: number
  cooldownTime?: number
  /** Text color for both morph layers (e.g. #fff on photo backgrounds). */
  color?: string
}

function MorphingSpans({
  text1Ref,
  text2Ref,
}: {
  text1Ref: RefObject<HTMLSpanElement | null>
  text2Ref: RefObject<HTMLSpanElement | null>
}) {
  return (
    <>
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
        ref={text1Ref}
      />
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
        ref={text2Ref}
      />
    </>
  )
}

function useMorphingTextLoop(texts: string[], morphTime: number, cooldownTime: number) {
  const textIndexRef = useRef(0)
  const morphRef = useRef(0)
  const cooldownRef = useRef(0)
  const timeRef = useRef(new Date())
  const text1Ref = useRef<HTMLSpanElement>(null)
  const text2Ref = useRef<HTMLSpanElement>(null)

  const setStyles = useCallback(
    (fraction: number) => {
      const current1 = text1Ref.current
      const current2 = text2Ref.current
      if (!current1 || !current2 || texts.length === 0) return

      current2.style.filter = `blur(${morphBlurPx(fraction)})`
      current2.style.opacity = morphOpacityPct(fraction)

      const invertedFraction = 1 - fraction
      current1.style.filter = `blur(${morphBlurPx(invertedFraction)})`
      current1.style.opacity = morphOpacityPct(invertedFraction)

      current1.textContent = texts[textIndexRef.current % texts.length]
      current2.textContent = texts[(textIndexRef.current + 1) % texts.length]
    },
    [texts],
  )

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current
    cooldownRef.current = 0

    let fraction = morphRef.current / morphTime
    if (fraction > 1) {
      cooldownRef.current = cooldownTime
      fraction = 1
    }

    setStyles(fraction)

    if (fraction === 1) {
      textIndexRef.current++
    }
  }, [setStyles, morphTime, cooldownTime])

  const doCooldown = useCallback(() => {
    morphRef.current = 0
    const current1 = text1Ref.current
    const current2 = text2Ref.current
    if (current1 && current2) {
      current2.style.filter = 'none'
      current2.style.opacity = '100%'
      current1.style.filter = 'none'
      current1.style.opacity = '0%'
    }
  }, [])

  useEffect(() => {
    let animationFrameId = 0

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const newTime = new Date()
      const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000
      timeRef.current = newTime
      cooldownRef.current -= dt

      if (cooldownRef.current <= 0) doMorph()
      else doCooldown()
    }

    animate()
    return () => cancelAnimationFrame(animationFrameId)
  }, [doMorph, doCooldown])

  return { text1Ref, text2Ref }
}

function useMorphingTextOnce(
  from: string,
  to: string,
  active: boolean,
  morphTime: number,
) {
  const morphRef = useRef(0)
  const timeRef = useRef(new Date())
  const atSecondRef = useRef(false)
  const animatingRef = useRef(false)
  const targetActiveRef = useRef(active)
  const text1Ref = useRef<HTMLSpanElement>(null)
  const text2Ref = useRef<HTMLSpanElement>(null)

  const applyStyles = useCallback(
    (fraction: number, forward: boolean) => {
      const current1 = text1Ref.current
      const current2 = text2Ref.current
      if (!current1 || !current2) return

      const primary = forward ? from : to
      const secondary = forward ? to : from

      current1.textContent = primary
      current2.textContent = secondary

      current2.style.filter = `blur(${morphBlurPx(fraction)})`
      current2.style.opacity = morphOpacityPct(fraction)

      const invertedFraction = 1 - fraction
      current1.style.filter = `blur(${morphBlurPx(invertedFraction)})`
      current1.style.opacity = morphOpacityPct(invertedFraction)
    },
    [from, to],
  )

  const settle = useCallback(
    (showSecond: boolean) => {
      const current1 = text1Ref.current
      const current2 = text2Ref.current
      if (!current1 || !current2) return

      current1.textContent = showSecond ? to : from
      current2.textContent = showSecond ? to : from
      current1.style.filter = 'none'
      current1.style.opacity = showSecond ? '0%' : '100%'
      current2.style.filter = 'none'
      current2.style.opacity = showSecond ? '100%' : '0%'
      atSecondRef.current = showSecond
      animatingRef.current = false
      morphRef.current = 0
    },
    [from, to],
  )

  useEffect(() => {
    targetActiveRef.current = active
    if (active === atSecondRef.current) return

    animatingRef.current = true
    morphRef.current = 0
    timeRef.current = new Date()
  }, [active])

  useEffect(() => {
    settle(false)
  }, [from, to, settle])

  useEffect(() => {
    let animationFrameId = 0

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      if (!animatingRef.current) return

      const newTime = new Date()
      const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000
      timeRef.current = newTime

      const forward = targetActiveRef.current
      morphRef.current += dt

      let fraction = morphRef.current / morphTime
      if (fraction >= 1) {
        settle(forward)
        return
      }

      applyStyles(fraction, forward)
    }

    animate()
    return () => cancelAnimationFrame(animationFrameId)
  }, [applyStyles, settle, morphTime])

  return { text1Ref, text2Ref }
}

function MorphingTextLoop({
  texts,
  morphTime,
  cooldownTime,
}: {
  texts: string[]
  morphTime: number
  cooldownTime: number
}) {
  const { text1Ref, text2Ref } = useMorphingTextLoop(texts, morphTime, cooldownTime)
  return <MorphingSpans text1Ref={text1Ref} text2Ref={text2Ref} />
}

function MorphingTextOnce({
  from,
  to,
  active,
  morphTime,
}: {
  from: string
  to: string
  active: boolean
  morphTime: number
}) {
  const { text1Ref, text2Ref } = useMorphingTextOnce(from, to, active, morphTime)
  return <MorphingSpans text1Ref={text1Ref} text2Ref={text2Ref} />
}

function SvgFilters({ filterId }: { filterId: string }) {
  return (
    <svg className="hidden" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <filter id={filterId}>
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 255 -140"
          />
        </filter>
      </defs>
    </svg>
  )
}

export function MorphingText({
  texts,
  className,
  filterId = 'threshold',
  active,
  morphTime,
  cooldownTime,
  color,
}: MorphingTextProps) {
  const isControlled = active !== undefined && texts.length === 2
  const filterStyle = {
    filter: isControlled ? `url(#${filterId})` : `url(#${filterId}) blur(0.6px)`,
    ...(color ? { color } : {}),
  } as const

  return (
    <div
      className={cn(
        'relative mx-auto w-full text-center font-sans leading-none',
        isControlled ? 'font-semibold' : 'font-normal',
        className,
      )}
      style={filterStyle}
    >
      {isControlled ? (
        <MorphingTextOnce
          from={texts[0]}
          to={texts[1]}
          active={active}
          morphTime={morphTime ?? SHORT_MORPH_TIME}
        />
      ) : (
        <MorphingTextLoop
          texts={texts}
          morphTime={morphTime ?? DEFAULT_MORPH_TIME}
          cooldownTime={cooldownTime ?? DEFAULT_COOLDOWN_TIME}
        />
      )}
      <SvgFilters filterId={filterId} />
    </div>
  )
}
