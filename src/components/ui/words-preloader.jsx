import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import './words-preloader.css'

/** English is covered by the hello handwriting — cycle the rest, ending on Korean. */
const DEFAULT_WORDS = ['Bonjour', 'Ciao', 'Olá', 'やあ', 'Hola', 'Hallå', '안녕하세요']

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

export default function WordsPreloader({
  words = DEFAULT_WORDS,
  onComplete,
  exiting = false,
  firstHoldMs = 720,
  stepMs = 260,
  holdLastMs = 950,
}) {
  const [index, setIndex] = useState(0)
  const completedRef = useRef(false)

  useEffect(() => {
    if (exiting) return
    const isLast = index === words.length - 1
    if (isLast) {
      const t = window.setTimeout(() => {
        if (completedRef.current) return
        completedRef.current = true
        onComplete?.()
      }, holdLastMs)
      return () => window.clearTimeout(t)
    }
    const delay = index === 0 ? firstHoldMs : stepMs
    const t = window.setTimeout(() => setIndex((i) => i + 1), delay)
    return () => window.clearTimeout(t)
  }, [index, words.length, onComplete, firstHoldMs, stepMs, holdLastMs, exiting])

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
        <span className="words-preloader__dot" aria-hidden />
        {words[index]}
      </motion.p>
    </div>
  )
}
