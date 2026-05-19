import { useState, useCallback } from 'react'
import PreLanding from './PreLanding'
import ChromeLanding from './ChromeLanding'
import iPhoneMobileLanding from './iPhoneMobileLanding'
import { markFullscreenAfterBoot } from '../utils/fullscreen'
import '../components/LandingTransition.css'

const STORAGE_KEY = 'portfolio-view'

function getStoredView() {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY)
    if (v === 'desktop' || v === 'mobile') return v
  } catch {
    /* ignore */
  }
  return null
}

function setStoredView(view) {
  try {
    sessionStorage.setItem(STORAGE_KEY, view)
  } catch {
    /* ignore */
  }
}

/** Align MusicPlayer autoplay with finished boot flow. */
function markPortfolioWelcomeComplete() {
  try {
    localStorage.setItem('portfolio_welcome_done_v1', '1')
  } catch {
    /* ignore */
  }
}

export default function LandingWrapper() {
  const [view, setView] = useState(() => getStoredView() || 'boot')

  const handleExitStart = useCallback(() => {
    setView('transitioning')
  }, [])

  const handleEnterDesktop = useCallback(() => {
    markPortfolioWelcomeComplete()
    markFullscreenAfterBoot()
    setView('desktop')
    setStoredView('desktop')
  }, [])

  if (view === 'mobile') {
    return <iPhoneMobileLanding />
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
          <PreLanding onExitStart={handleExitStart} onEnterDesktop={handleEnterDesktop} />
        </div>
      )}
    </div>
  )
}
