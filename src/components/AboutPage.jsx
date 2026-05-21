import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { AboutThemeCursor } from '@/components/ui/about-theme-cursor'
import { CursorRevealAbout } from '@/components/ui/cursor-reveal-about'

import './AboutPage.css'

export default function AboutPage({ cursorContainerRef: _cursorContainerRef }) {
  const pageRef = useRef(null)
  const revealRef = useRef(null)
  const [cursorHost, setCursorHost] = useState(null)
  const [isDark, setIsDark] = useState(false)

  const handleToggleTheme = useCallback(() => {
    setIsDark((prev) => !prev)
  }, [])

  useLayoutEffect(() => {
    setCursorHost(revealRef.current?.getContainer() ?? null)
  }, [])

  const portalRef = useRef(null)
  portalRef.current = cursorHost

  const themeCursor = cursorHost ? (
    <AboutThemeCursor
      portalRef={portalRef}
      boundsRef={pageRef}
      isDark={isDark}
      onToggle={handleToggleTheme}
    />
  ) : null

  return (
    <div
      ref={pageRef}
      className={`about-page h-full w-full overflow-hidden${isDark ? ' about-page--dark' : ''}`}
    >
      <CursorRevealAbout ref={revealRef} isDark={isDark} />
      <div className="about-page__cursor-guard" aria-hidden />
      {cursorHost && themeCursor ? createPortal(themeCursor, cursorHost) : null}
    </div>
  )
}
