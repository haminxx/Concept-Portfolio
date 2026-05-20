/** sessionStorage key for demo admin session */
export const ADMIN_SESSION_KEY = 'cnl-admin-session'

/**
 * Demo credentials — override in production via .env (do not commit real passwords).
 * VITE_ADMIN_USER / VITE_ADMIN_PASS
 */
const DEFAULT_USER = 'admin'
const DEFAULT_PASS = 'cnl-demo'

export function getAdminCredentials() {
  return {
    user: import.meta.env.VITE_ADMIN_USER || DEFAULT_USER,
    pass: import.meta.env.VITE_ADMIN_PASS || DEFAULT_PASS,
  }
}

export function verifyAdminLogin(username, password) {
  const { user, pass } = getAdminCredentials()
  return username.trim() === user && password === pass
}

export function readAdminSession() {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function writeAdminSession(active) {
  try {
    if (active) sessionStorage.setItem(ADMIN_SESSION_KEY, '1')
    else sessionStorage.removeItem(ADMIN_SESSION_KEY)
  } catch {
    /* ignore */
  }
}
