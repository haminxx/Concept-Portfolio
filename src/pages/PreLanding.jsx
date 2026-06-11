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

function PreLandingContent({ onEnterDesktop, onExitStart }) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [helloVisible, setHelloVisible] = useState(false)
  const exitingTimerRef = useRef(null)
  const helloPauseRef = useRef(null)

  const phase = PHASES[phaseIndex]
  const isExiting = phase === 'exiting'
  const showHello = phase === 'hello'

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHelloVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const startExit = useCallback((e) => {
    if (e) requestDocumentFullscreenFromGesture(e)
    setPhaseIndex((current) => {
      if (current >= 1) return current
      onExitStart?.()
      return 1
    })
  }, [onExitStart])

  const handleHelloComplete = useCallback(() => {
    if (helloPauseRef.current != null) window.clearTimeout(helloPauseRef.current)
    helloPauseRef.current = window.setTimeout(() => {
      startExit()
      helloPauseRef.current = null
    }, 450)
  }, [startExit])

  useEffect(() => {
    return () => {
      if (exitingTimerRef.current != null) window.clearTimeout(exitingTimerRef.current)
      if (helloPauseRef.current != null) window.clearTimeout(helloPauseRef.current)
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
        {showHello && (
          <div className="pre-landing__greeting-slot">
            <AppleHelloEnglishEffect
              className={`pre-landing__hello h-full w-auto max-w-full text-white${helloVisible ? ' pre-landing__hello--visible' : ''}`}
              speed={1.1}
              onAnimationComplete={handleHelloComplete}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default function PreLanding({ onEnterDesktop, onExitStart }) {
  return (
    <DesktopBackgroundProvider>
      <PreLandingContent onEnterDesktop={onEnterDesktop} onExitStart={onExitStart} />
    </DesktopBackgroundProvider>
  )
}
