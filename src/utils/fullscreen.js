/** Session flag: request fullscreen once when home is revealed after pre-landing boot. */
export const FULLSCREEN_AFTER_BOOT_KEY = 'portfolio-request-fullscreen-on-home'

/** Matches LandingTransition.css blur reveal duration. */
export const BOOT_REVEAL_TRANSITION_MS = 1350

/** Retry delay when the first post-reveal request is blocked. */
export const BOOT_FULLSCREEN_RETRY_MS = 400

export function isDocumentFullscreen() {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  )
}

function webkitRequestFullscreen(el) {
  if (typeof el.webkitRequestFullscreen === 'function') {
    return el.webkitRequestFullscreen()
  }
  if (typeof el.webkitRequestFullScreen === 'function') {
    return el.webkitRequestFullScreen()
  }
  return undefined
}

/** Match ChromeLanding / F11 menu toggle — request on documentElement with vendor fallbacks. */
export function requestDocumentFullscreen() {
  if (isDocumentFullscreen()) return Promise.resolve(true)
  const el = document.documentElement

  const tryWebkit = () => {
    try {
      const r = webkitRequestFullscreen(el)
      if (r && typeof r.then === 'function') return r.then(() => isDocumentFullscreen())
    } catch {
      /* ignore */
    }
    return Promise.resolve(isDocumentFullscreen())
  }

  try {
    const p = el.requestFullscreen?.()
    if (p && typeof p.then === 'function') {
      return p
        .then(() => isDocumentFullscreen())
        .catch(() => tryWebkit())
    }
  } catch {
    /* ignore */
  }

  return tryWebkit()
}

/** Fullscreen requires a trusted user activation in most browsers. */
export function requestDocumentFullscreenFromGesture(event) {
  if (event && !event.isTrusted) return Promise.resolve()
  return requestDocumentFullscreen()
}

export function exitDocumentFullscreen() {
  const doc = document
  if (!isDocumentFullscreen()) return
  doc.exitFullscreen?.()
  doc.webkitExitFullscreen?.()
}

export function toggleDocumentFullscreen() {
  if (isDocumentFullscreen()) exitDocumentFullscreen()
  else return requestDocumentFullscreen()
}

export function markFullscreenAfterBoot() {
  try {
    sessionStorage.setItem(FULLSCREEN_AFTER_BOOT_KEY, '1')
  } catch {
    /* ignore */
  }
}

export function clearFullscreenAfterBoot() {
  try {
    sessionStorage.removeItem(FULLSCREEN_AFTER_BOOT_KEY)
  } catch {
    /* ignore */
  }
}

export function shouldRequestFullscreenAfterBoot() {
  try {
    return sessionStorage.getItem(FULLSCREEN_AFTER_BOOT_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * After home is revealed: wait for blur transition, request fullscreen, retry once.
 * Keeps pointerdown fallback when auto-advance has no recent user gesture.
 * @returns {() => void} cleanup
 */
export function runBootFullscreenSequence({
  revealDelayMs = BOOT_REVEAL_TRANSITION_MS,
} = {}) {
  if (!shouldRequestFullscreenAfterBoot()) return () => {}

  let cancelled = false
  let revealTimer = null
  let retryTimer = null

  const finish = () => {
    if (isDocumentFullscreen()) clearFullscreenAfterBoot()
  }

  const attempt = (isRetry = false) => {
    if (cancelled) return
    if (isDocumentFullscreen()) {
      finish()
      return
    }
    requestDocumentFullscreen().then((entered) => {
      if (cancelled) return
      if (entered || isDocumentFullscreen()) {
        finish()
        return
      }
      if (!isRetry) {
        retryTimer = window.setTimeout(() => attempt(true), BOOT_FULLSCREEN_RETRY_MS)
      }
    })
  }

  const onFirstPointer = (e) => {
    requestDocumentFullscreenFromGesture(e).then(finish)
    window.removeEventListener('pointerdown', onFirstPointer, true)
  }
  window.addEventListener('pointerdown', onFirstPointer, { capture: true, passive: true })

  const onFsChange = () => finish()
  document.addEventListener('fullscreenchange', onFsChange)
  document.addEventListener('webkitfullscreenchange', onFsChange)

  revealTimer = window.setTimeout(() => attempt(false), Math.max(0, revealDelayMs))

  return () => {
    cancelled = true
    if (revealTimer != null) window.clearTimeout(revealTimer)
    if (retryTimer != null) window.clearTimeout(retryTimer)
    window.removeEventListener('pointerdown', onFirstPointer, true)
    document.removeEventListener('fullscreenchange', onFsChange)
    document.removeEventListener('webkitfullscreenchange', onFsChange)
  }
}
