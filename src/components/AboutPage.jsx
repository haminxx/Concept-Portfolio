import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { AboutThemeCursor } from '@/components/ui/about-theme-cursor'
import { CursorRevealAbout } from '@/components/ui/cursor-reveal-about'

import './AboutPage.css'

export default function AboutPage({ cursorContainerRef }) {
  const pageRef = useRef(null)
  const [cursorHost, setCursorHost] = useState(null)
  const [isDark, setIsDark] = useState(false)

  const handleToggleTheme = useCallback(() => {
    setIsDark((prev) => !prev)
  }, [])

  useLayoutEffect(() => {
    setCursorHost(cursorContainerRef?.current ?? null)
  }, [cursorContainerRef])

  const portalRef = cursorHost ? cursorContainerRef : pageRef
  const themeCursor = (
    <AboutThemeCursor
      portalRef={portalRef}
      boundsRef={pageRef}
      isDark={isDark}
      onToggle={handleToggleTheme}
    />
  )

  return (
    <div
      ref={pageRef}
      className={`about-page h-full w-full overflow-hidden${isDark ? ' about-page--dark' : ''}`}
    >
      <CursorRevealAbout isDark={isDark} />
      <div className="about-page__cursor-guard" aria-hidden />
      {cursorHost ? createPortal(themeCursor, cursorHost) : themeCursor}
    </div>
  )
}
