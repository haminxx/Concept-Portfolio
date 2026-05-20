import { useCallback, useRef, useState } from 'react'

import { AboutThemeCursor } from '@/components/ui/about-theme-cursor'
import { CursorRevealAbout } from '@/components/ui/cursor-reveal-about'

import './AboutPage.css'

export default function AboutPage() {
  const pageRef = useRef(null)
  const [isDark, setIsDark] = useState(false)

  const handleToggleTheme = useCallback(() => {
    setIsDark((prev) => !prev)
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
