import { motion } from 'motion/react'
import { useEffect, useRef, type CSSProperties, type FC } from 'react'

export const CHROME_HOME_GRADIENT_COLORS = [
  '#1a1a1a', // charcoal
  '#2d2d2d', // dark grey
  '#3d4a3d', // grey-green
  '#4a5d4a', // muted green
  '#5c4a3a', // brown
  '#3a3530', // dark brown-grey
  '#1a1a1a', // charcoal edge
] as const

export const CHROME_HOME_GRADIENT_STOPS = [0, 25, 45, 60, 75, 90, 100] as const

interface AnimatedGradientBackgroundProps {
  /** Initial size of the radial gradient, defining the starting width. @default 110 */
  startingGap?: number

  /** Enables or disables the breathing animation effect. @default false */
  Breathing?: boolean

  /** Colors for the radial gradient; each pairs with a stop in `gradientStops`. */
  gradientColors?: string[]

  /** Percentage stops (0–100) for each color in `gradientColors`. */
  gradientStops?: number[]

  /** Speed of the breathing animation; lower is slower. @default 0.02 */
  animationSpeed?: number

  /** Breathing range in percentage points. @default 5 */
  breathingRange?: number

  /** Additional inline styles for the gradient container. */
  containerStyle?: CSSProperties

  /** Additional class names for the gradient container. */
  containerClassName?: string

  /** Vertical stretch offset for the radial gradient ellipse. @default 0 */
  topOffset?: number
}

const AnimatedGradientBackground: FC<AnimatedGradientBackgroundProps> = ({
  startingGap = 110,
  Breathing = false,
  gradientColors = [...CHROME_HOME_GRADIENT_COLORS],
  gradientStops = [...CHROME_HOME_GRADIENT_STOPS],
  animationSpeed = 0.02,
  breathingRange = 5,
  containerStyle = {},
  topOffset = 0,
  containerClassName = '',
}) => {
  if (gradientColors.length !== gradientStops.length) {
    throw new Error(
      `GradientColors and GradientStops must have the same length. Received gradientColors length: ${gradientColors.length}, gradientStops length: ${gradientStops.length}`,
    )
  }

  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let animationFrame: number
    let width = startingGap
    let directionWidth = 1

    const animateGradient = () => {
      if (width >= startingGap + breathingRange) directionWidth = -1
      if (width <= startingGap - breathingRange) directionWidth = 1

      if (!Breathing) directionWidth = 0
      width += directionWidth * animationSpeed

      const gradientStopsString = gradientStops
        .map((stop, index) => `${gradientColors[index]} ${stop}%`)
        .join(', ')

      const gradient = `radial-gradient(${width}% ${width + topOffset}% at 50% 18%, ${gradientStopsString})`

      if (containerRef.current) {
        containerRef.current.style.background = gradient
      }

      animationFrame = requestAnimationFrame(animateGradient)
    }

    animationFrame = requestAnimationFrame(animateGradient)

    return () => cancelAnimationFrame(animationFrame)
  }, [
    startingGap,
    Breathing,
    gradientColors,
    gradientStops,
    animationSpeed,
    breathingRange,
    topOffset,
  ])

  return (
    <motion.div
      key="animated-gradient-background"
      initial={{
        opacity: 0,
        scale: 1.5,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: {
          duration: 2,
          ease: [0.25, 0.1, 0.25, 1],
        },
      }}
      className={`absolute inset-0 z-0 overflow-hidden ${containerClassName}`}
      aria-hidden="true"
    >
      <div
        ref={containerRef}
        style={containerStyle}
        className="absolute inset-0 transition-transform"
      />
    </motion.div>
  )
}

export default AnimatedGradientBackground
