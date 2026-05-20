import { useEffect, useId, useRef, type MutableRefObject } from 'react'
import { motion } from 'motion/react'

import { cn } from '@/lib/utils'

/**
 * Animated Theme Toggler — sun↔moon morph.
 *
 * Sun rays shrink and rotate away.
 * Center circle swells into a moon body.
 * A mask carves the crescent. Spring physics throughout.
 * A soft switch-click sounds on toggle.
 */

const INK = {
  dark: 'rgba(0, 0, 0, 0.82)',
  bright: 'rgba(255, 255, 255, 0.82)',
} as const

export type ThemeTogglerInkColor = keyof typeof INK

export interface AnimatedThemeTogglerProps {
  isDark: boolean
  onToggle: () => void
  sound?: boolean
  className?: string
  /** Icon ink opposite to veil for contrast. Defaults from `isDark`. */
  inkColor?: ThemeTogglerInkColor
  /** Hide the system cursor (About page custom cursor). */
  hideSystemCursor?: boolean
}

let _ctx: AudioContext | null = null
let _buf: AudioBuffer | null = null

function audioCtx() {
  if (!_ctx) {
    _ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)()
  }
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

function ensureBuf(ac: AudioContext): AudioBuffer {
  if (_buf && _buf.sampleRate === ac.sampleRate) return _buf
  const rate = ac.sampleRate
  const len = Math.floor(rate * 0.006)
  const buf = ac.createBuffer(1, len, rate)
  const ch = buf.getChannelData(0)
  for (let i = 0; i < len; i++) {
    const t = i / len
    const sine = Math.sin(2 * Math.PI * 3400 * t)
    const noise = Math.random() * 2 - 1
    ch[i] = (sine * 0.6 + noise * 0.4) * (1 - t) ** 3
  }
  _buf = buf
  return buf
}

function tick(last: MutableRefObject<number>) {
  const now = performance.now()
  if (now - last.current < 80) return
  last.current = now
  try {
    const ac = audioCtx()
    const buf = ensureBuf(ac)
    const src = ac.createBufferSource()
    const gain = ac.createGain()
    src.buffer = buf
    gain.gain.value = 0.08
    src.connect(gain)
    gain.connect(ac.destination)
    src.start()
  } catch {
    /* silent */
  }
}

export function AnimatedThemeToggler({
  isDark,
  onToggle,
  sound = true,
  className,
  inkColor,
  hideSystemCursor = false,
}: AnimatedThemeTogglerProps) {
  const rawId = useId()
  const maskId = `att${rawId.replace(/:/g, '')}`
  const lastSnd = useRef(0)
  const isFirst = useRef(true)

  useEffect(() => {
    requestAnimationFrame(() => {
      isFirst.current = false
    })
  }, [])

  const handleClick = () => {
    if (sound) tick(lastSnd)
    onToggle()
  }

  const spring = isFirst.current
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 380, damping: 30 }

  const resolvedInk = inkColor ?? (isDark ? 'bright' : 'dark')

  return (
    <motion.button
      type="button"
      className={cn('att-btn', className)}
      data-theme={isDark ? 'dark' : 'light'}
      data-ink={resolvedInk}
      onClick={handleClick}
      whileHover={hideSystemCursor ? undefined : { scale: 1.1 }}
      whileTap={hideSystemCursor ? undefined : { scale: 0.86 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{
        background: 'none',
        border: 'none',
        cursor: hideSystemCursor ? 'none' : 'pointer',
        padding: hideSystemCursor ? 0 : 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: INK[resolvedInk],
        borderRadius: 8,
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={false}
        animate={{ rotate: isDark ? 270 : 0 }}
        transition={spring}
        style={{ overflow: 'visible' }}
      >
        <mask id={maskId}>
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <motion.circle
            initial={false}
            animate={{ cx: isDark ? 17 : 33, cy: isDark ? 8 : 0 }}
            transition={spring}
            r="9"
            fill="black"
          />
        </mask>

        <motion.circle
          cx="12"
          cy="12"
          fill="currentColor"
          stroke="none"
          mask={`url(#${maskId})`}
          initial={false}
          animate={{ r: isDark ? 9 : 5 }}
          transition={spring}
        />

        <motion.g
          initial={false}
          animate={{
            opacity: isDark ? 0 : 1,
            scale: isDark ? 0 : 1,
            rotate: isDark ? -30 : 0,
          }}
          transition={spring}
          style={{ transformOrigin: '12px 12px' }}
        >
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="5.64" y1="5.64" x2="4.22" y2="4.22" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          <line x1="5.64" y1="18.36" x2="4.22" y2="19.78" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        </motion.g>
      </motion.svg>
    </motion.button>
  )
}

export default AnimatedThemeToggler
