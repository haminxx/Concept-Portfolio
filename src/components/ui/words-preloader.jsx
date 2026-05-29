import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import './words-preloader.css'

// Multilingual greetings, ending on Korean per request.
const DEFAULT_WORDS = ['Bonjour', 'Ciao', 'Olá', 'やあ', 'Hola', 'Hallå', '안녕하세요']

const wordOpacity = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 0.9, y: 0, transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] } },
}

/**
 * Dennis Snellenberg / Skiper "words preloader" style transition.
 * Cycles greetings (first holds longer, rest quick) and finishes on the last
 * word, then calls `onComplete` so the caller can run its own fade-out.
 */
export default function WordsPreloader({
  words = DEFAULT_WORDS,
  onComplete,
  firstHoldMs = 800,
  stepMs = 240,
  holdLastMs = 900,
}) {
  const [index, setIndex] = useState(0)
  const completedRef = useRef(false)

  useEffect(() => {
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
  }, [index, words.length, onComplete, firstHoldMs, stepMs, holdLastMs])

  return (
    <div className="words-preloader" aria-hidden>
      <motion.p
        key={index}
        className="words-preloader__word"
        variants={wordOpacity}
        initial="initial"
        animate="enter"
      >
        <span className="words-preloader__dot" />
        {words[index]}
      </motion.p>
    </div>
  )
}
