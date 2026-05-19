import { useState, useCallback } from 'react'
import PreLanding from '../pages/PreLanding'
import ChromeLanding from '../pages/ChromeLanding'
import iPhoneMobileLanding from '../pages/iPhoneMobileLanding'
import { markFullscreenAfterBoot } from '../utils/fullscreen'
import './LandingTransition.css'

const VIEW_KEY = 'portfolio-view' // sessionStorage key

/** Aligns MusicPlayer autoplay unlock with finished boot flow (replacing WelcomeOverlay). */
function markPortfolioWelcomeComplete() {
  try {
    localStorage.setItem('portfolio_welcome_done_v1', '1')
  } catch {
    /* ignore */
  }
}

export default function LandingWrapper() {
  const [view, setViewState] = useState(() => {
    if (typeof window === 'undefined') return 'boot'
    const saved = sessionStorage.getItem(VIEW_KEY)
    if (saved === 'desktop' || saved === 'mobile') return saved
    return 'boot'
  })

  const setView = useCallback((v) => {
    setViewState(v)
    sessionStorage.setItem(VIEW_KEY, v)
  }, [])

  const handleExitStart = useCallback(() => {
    setViewState('transitioning')
  }, [])

  const handleEnterDesktop = useCallback(() => {
    markPortfolioWelcomeComplete()
    markFullscreenAfterBoot()
    setView('desktop')
  }, [setView])

  if (view === 'mobile') {
    return <iPhoneMobileLanding onEnterDesktop={handleEnterDesktop} />
  }

  const showDesktop = view === 'transitioning' || view === 'desktop'
  const showOverlay = view === 'boot' || view === 'transitioning'
  const desktopRevealed = view === 'desktop'

  return (
    <div className="landing-transition">
      {showDesktop && (
        <div
          className={`landing-transition__desktop ${desktopRevealed ? 'landing-transition__desktop--revealed' : 'landing-transition__desktop--pre-reveal'}`}
          aria-hidden={!desktopRevealed}
        >
          <ChromeLanding />
        </div>
      )}
      {showOverlay && (
        <div className="landing-transition__overlay">
          <PreLanding
            onExitStart={handleExitStart}
            onEnterDesktop={handleEnterDesktop}
          />
        </div>
      )}
    </div>
  )
}

