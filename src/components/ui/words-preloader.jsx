import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import './words-preloader.css'

/** English is covered by the hello handwriting — cycle the rest, ending on Korean. */
const DEFAULT_WORDS = ['Bonjour', 'Ciao', 'Olá', 'やあ', 'Hola', 'Hallå', '안녕하세요']
const KOREAN_WORD = '안녕하세요'

const wordVariants = {
  initial: { opacity: 0, y: 10 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1] },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.35, ease: [0.76, 0, 0.24, 1] },
  },
}

const bangVariants = {
  hidden: { opacity: 0, scale: 0, rotate: -18, y: 6 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 520,
      damping: 16,
      mass: 0.65,
    },
  },
}

export default function WordsPreloader({
  words = DEFAULT_WORDS,
  onComplete,
  exiting = false,
  firstHoldMs = 720,
  stepMs = 260,
  holdLastMs = 700,
  bangDelayMs = 480,
}) {
  const [index, setIndex] = useState(0)
  const [bangVisible, setBangVisible] = useState(false)
  const completedRef = useRef(false)
  const bangDoneRef = useRef(false)

  const isLast = index === words.length - 1
  const isKorean = words[index] === KOREAN_WORD

  // Advance through non-final words.
  useEffect(() => {
    if (exiting || isLast) return
    const delay = index === 0 ? firstHoldMs : stepMs
    const t = window.setTimeout(() => setIndex((i) => i + 1), delay)
    return () => window.clearTimeout(t)
  }, [index, isLast, exiting, firstHoldMs, stepMs])

  // Korean word shown — pause, then animate "!" onto the end.
  useEffect(() => {
    if (exiting || !isLast || !isKorean) {
      setBangVisible(false)
      bangDoneRef.current = false
      return
    }
    bangDoneRef.current = false
    setBangVisible(false)
    const t = window.setTimeout(() => setBangVisible(true), bangDelayMs)
    return () => window.clearTimeout(t)
  }, [index, isLast, isKorean, exiting, bangDelayMs])

  const finishSequence = () => {
    if (completedRef.current || exiting) return
    completedRef.current = true
    onComplete?.()
  }

  const handleBangComplete = () => {
    if (bangDoneRef.current || exiting) return
    bangDoneRef.current = true
    window.setTimeout(finishSequence, holdLastMs)
  }

  return (
    <div
      className={`words-preloader pre-landing__greeting-slot${exiting ? ' words-preloader--exiting' : ''}`}
      aria-hidden
    >
      <motion.p
        key={index}
        className="words-preloader__word"
        variants={wordVariants}
        initial="initial"
        animate={exiting ? 'exit' : 'enter'}
        exit="exit"
      >
        {words[index]}
        {isLast && isKorean && (
          <motion.span
            className="inline-block origin-bottom-left align-baseline ml-1 md:ml-2 font-semibold drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)]"
            variants={bangVariants}
            initial="hidden"
            animate={bangVisible && !exiting ? 'visible' : 'hidden'}
            onAnimationComplete={(definition) => {
              if (definition === 'visible' && bangVisible && !exiting) {
                handleBangComplete()
              }
            }}
          >
            !
          </motion.span>
        )}
      </motion.p>
    </div>
  )
}
