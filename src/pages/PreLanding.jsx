import { useEffect, useState, useCallback, useRef, Suspense, lazy } from 'react'
import { AppleHelloEnglishEffect } from '@/components/ui/apple-hello-effect'
import { DesktopBackgroundProvider, useDesktopBackground } from '../context/DesktopBackgroundContext'
import { requestDocumentFullscreenFromGesture } from '../utils/fullscreen'
import './PreLanding.css'

const DesktopShaderBackground = lazy(() => import('../components/ui/DesktopShaderBackground'))

const PHASES = ['hello', 'exiting']

function PreLandingBackground() {
  const { color1, color2, speed } = useDesktopBackground()

  return (
    <Suspense fallback={<div className="pre-landing__bg-fallback" aria-hidden />}>
      <DesktopShaderBackground color1={color1} color2={color2} speed={speed} />
    </Suspense>
  )
}

function PreLandingContent({ onEnterDesktop }) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const exitingTimerRef = useRef(null)
  const pauseTimerRef = useRef(null)

  const phase = PHASES[phaseIndex]
  const isExiting = phase === 'exiting'

  const startExit = useCallback((e) => {
    requestDocumentFullscreenFromGesture(e)
    setPhaseIndex((current) => (current >= 1 ? current : 1))
  }, [])

  const handleAnimationComplete = useCallback(() => {
    if (pauseTimerRef.current != null) window.clearTimeout(pauseTimerRef.current)
    const pauseMs = 700
    pauseTimerRef.current = window.setTimeout(() => {
      startExit()
      pauseTimerRef.current = null
    }, pauseMs)
  }, [startExit])

  useEffect(() => {
    return () => {
      if (exitingTimerRef.current != null) window.clearTimeout(exitingTimerRef.current)
      if (pauseTimerRef.current != null) window.clearTimeout(pauseTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (phase !== 'exiting') return
    const fadeMs = 1350
    exitingTimerRef.current = window.setTimeout(() => onEnterDesktop?.(), fadeMs)
    return () => {
      if (exitingTimerRef.current != null) window.clearTimeout(exitingTimerRef.current)
    }
  }, [phase, onEnterDesktop])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F11') {
        e.preventDefault()
        requestDocumentFullscreenFromGesture(e)
        onEnterDesktop?.()
        return
      }
      if (e.key === 'Enter' || e.key === ' ') {
        if (phase !== 'hello') return
        e.preventDefault()
        startExit(e)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onEnterDesktop, phase, startExit])

  return (
    <div
      className={`pre-landing pre-landing--${phase} ${isExiting ? 'pre-landing--exiting-fade' : ''}`}
      onClick={phase === 'hello' ? (e) => startExit(e) : undefined}
      onKeyDown={
        phase === 'hello'
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                startExit(e)
              }
            }
          : undefined
      }
      role={phase === 'hello' ? 'button' : undefined}
      tabIndex={phase === 'hello' ? 0 : undefined}
      aria-label={phase === 'hello' ? 'Continue to portfolio' : undefined}
    >
      <div className="pre-landing__bg" aria-hidden>
        <PreLandingBackground />
      </div>
      <div className="pre-landing__content">
        {phase === 'hello' && (
          <AppleHelloEnglishEffect
            className="pre-landing__hello h-32 md:h-48 text-white"
            speed={1.1}
            onAnimationComplete={handleAnimationComplete}
          />
        )}
      </div>
    </div>
  )
}

export default function PreLanding({ onEnterDesktop }) {
  return (
    <DesktopBackgroundProvider>
      <PreLandingContent onEnterDesktop={onEnterDesktop} />
    </DesktopBackgroundProvider>
  )
}
