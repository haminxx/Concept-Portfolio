import { useCallback, useEffect, useRef, useState } from 'react'

import { AboutThemeCursor } from '@/components/ui/about-theme-cursor'
import { CursorRevealAbout } from '@/components/ui/cursor-reveal-about'

import './AboutPage.css'

export default function AboutPage() {
  const pageRef = useRef(null)
  const [isDark, setIsDark] = useState(false)

  const handleToggleTheme = useCallback(() => {
    setIsDark((prev) => !prev)
  }, [])

  useEffect(() => {
    document.body.classList.add('chrome-about-active')
    return () => document.body.classList.remove('chrome-about-active')
  }, [])

  return (
    <div
      ref={pageRef}
      className={`about-page h-full w-full overflow-hidden${isDark ? ' about-page--dark' : ''}`}
    >
      <CursorRevealAbout isDark={isDark} />
      <div className="about-page__cursor-guard" aria-hidden />
      <AboutThemeCursor
        containerRef={pageRef}
        isDark={isDark}
        onToggle={handleToggleTheme}
      />
    </div>
  )
}
