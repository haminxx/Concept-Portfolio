import { lazy } from 'react'

const CHUNK_RELOAD_KEY = 'portfolio_chunk_reload_v1'

const CHUNK_ERROR_RE =
  /failed to fetch dynamically imported module|importing a module script failed|error loading dynamically imported module|loading chunk \d+ failed/i

export function isChunkLoadError(error) {
  const message = error?.message ?? String(error ?? '')
  return CHUNK_ERROR_RE.test(message)
}

/**
 * Wrap React.lazy so a stale post-deploy chunk reference triggers one hard reload
 * before surfacing the error to the nearest error boundary.
 */
export function lazyWithRetry(importFn) {
  return lazy(() =>
    importFn().catch((error) => {
      if (isChunkLoadError(error)) {
        try {
          if (!sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
            sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
            window.location.reload()
            return new Promise(() => {})
          }
          sessionStorage.removeItem(CHUNK_RELOAD_KEY)
        } catch {
          /* ignore storage failures */
        }
      }
      throw error
    }),
  )
}
