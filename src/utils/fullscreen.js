/** Session flag: request fullscreen once when ChromeLanding mounts after pre-landing boot. */
export const FULLSCREEN_AFTER_BOOT_KEY = 'portfolio-request-fullscreen-on-home'

export function isDocumentFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement)
}

/** Match ChromeLanding / F11 menu toggle — request on documentElement with webkit fallback. */
export function requestDocumentFullscreen() {
  if (isDocumentFullscreen()) return Promise.resolve()
  const el = document.documentElement
  try {
    const p = el.requestFullscreen?.()
    if (p && typeof p.catch === 'function') {
      return p.catch(() => {
        try {
          if (typeof el.webkitRequestFullscreen === 'function') el.webkitRequestFullscreen()
        } catch {
          /* ignore */
        }
      })
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof el.webkitRequestFullscreen === 'function') el.webkitRequestFullscreen()
  } catch {
    /* ignore */
  }
  return Promise.resolve()
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
