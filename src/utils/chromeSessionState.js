/** sessionStorage keys for in-session Chrome UI (cleared on full page reload). */
export const CHROME_TABS_KEY = 'portfolio-chrome-tabs'
export const CHROME_NAV_KEY = 'portfolio-chrome-nav-stacks'
export const CHROME_WINDOW_KEY = 'portfolio-chrome-window'

export const CHROME_SESSION_KEYS = [
  CHROME_TABS_KEY,
  CHROME_NAV_KEY,
  CHROME_WINDOW_KEY,
]

export function clearChromeSessionState() {
  try {
    for (const key of CHROME_SESSION_KEYS) {
      sessionStorage.removeItem(key)
    }
  } catch {
    /* ignore */
  }
}
