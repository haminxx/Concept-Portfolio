'use client'

import { useId, type ComponentProps } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type GlowHorizonVariant = 'top' | 'bottom'

/** Wave sweep duration — text fade-in is staggered after this begins. */
export const GLOW_HORIZON_WAVE_DURATION = 1.85

/** Delay before hero glass text starts fading in (after wave is visible). */
export const GLOW_HORIZON_TEXT_BASE_DELAY = 1.05

/** Stagger between "Since 2003" and "Christian Lee" glass blocks. */
export const GLOW_HORIZON_TEXT_STAGGER = 0.38

type GlowHorizonFMProps = ComponentProps<'div'> & {
  variant?: GlowHorizonVariant
}

const WAVE_EASE = [0.22, 1, 0.36, 1] as const

export default function GlowHorizonFM({
  variant = 'top',
  className,
  ...props
}: GlowHorizonFMProps) {
  const uid = useId().replace(/:/g, '')
  const isTop = variant === 'top'

  return (
    <div
      data-slot="glow-horizon"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden="true"
      {...props}
    >
      <motion.div
        className={cn(
          'absolute left-1/2 h-[min(72%,520px)] w-[140%] -translate-x-1/2',
          isTop ? '-top-[18%]' : '-bottom-[18%]',
        )}
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: GLOW_HORIZON_WAVE_DURATION * 0.55, ease: WAVE_EASE }}
        style={{
          background: isTop
            ? 'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(120, 90, 255, 0.42) 0%, rgba(60, 130, 255, 0.18) 38%, transparent 72%)'
            : 'radial-gradient(ellipse 70% 55% at 50% 100%, rgba(120, 90, 255, 0.42) 0%, rgba(60, 130, 255, 0.18) 38%, transparent 72%)',
        }}
      />

      <motion.div
        className={cn(
          'absolute left-1/2 h-[min(48%,360px)] w-[95%] -translate-x-1/2',
          isTop ? 'top-[2%]' : 'bottom-[2%]',
        )}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: GLOW_HORIZON_WAVE_DURATION * 0.65,
          delay: 0.12,
          ease: WAVE_EASE,
        }}
        style={{
          background: isTop
            ? 'radial-gradient(ellipse 55% 45% at 50% 15%, rgba(255, 120, 180, 0.22) 0%, rgba(255, 180, 120, 0.08) 45%, transparent 70%)'
            : 'radial-gradient(ellipse 55% 45% at 50% 85%, rgba(255, 120, 180, 0.22) 0%, rgba(255, 180, 120, 0.08) 45%, transparent 70%)',
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`${uid}-wave-fill`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(130, 110, 255, 0.55)" />
            <stop offset="45%" stopColor="rgba(70, 150, 255, 0.28)" />
            <stop offset="100%" stopColor="rgba(255, 140, 190, 0.12)" />
          </linearGradient>
          <linearGradient id={`${uid}-wave-stroke`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(180, 160, 255, 0.65)" />
            <stop offset="50%" stopColor="rgba(120, 200, 255, 0.45)" />
            <stop offset="100%" stopColor="rgba(255, 170, 210, 0.35)" />
          </linearGradient>
        </defs>

        <motion.path
          d={
            isTop
              ? 'M -40 0 C 320 120, 520 80, 720 140 S 1180 220, 1480 60 L 1480 0 L -40 0 Z'
              : 'M -40 900 C 320 780, 520 820, 720 760 S 1180 680, 1480 840 L 1480 900 L -40 900 Z'
          }
          fill={`url(#${uid}-wave-fill)`}
          initial={{ opacity: 0, y: isTop ? -48 : 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: GLOW_HORIZON_WAVE_DURATION, ease: WAVE_EASE }}
        />

        <motion.path
          d={
            isTop
              ? 'M -40 0 C 280 96, 480 64, 720 118 S 1220 196, 1480 48'
              : 'M -40 900 C 280 804, 480 836, 720 782 S 1220 704, 1480 852'
          }
          fill="none"
          stroke={`url(#${uid}-wave-stroke)`}
          strokeWidth={2.5}
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: GLOW_HORIZON_WAVE_DURATION, ease: WAVE_EASE },
            opacity: { duration: 0.45 },
          }}
        />
      </svg>

      <motion.div
        className="absolute inset-x-0 h-[42%]"
        style={{
          top: isTop ? 0 : undefined,
          bottom: isTop ? undefined : 0,
          background: isTop
            ? 'linear-gradient(to bottom, rgba(130, 100, 255, 0.14) 0%, transparent 100%)'
            : 'linear-gradient(to top, rgba(130, 100, 255, 0.14) 0%, transparent 100%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: GLOW_HORIZON_WAVE_DURATION * 0.8, delay: 0.08 }}
      />
    </div>
  )
}
