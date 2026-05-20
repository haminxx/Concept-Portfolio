import { useEffect, useId, useRef, useState } from 'react'
import { useAdmin } from '../context/AdminContext'
import './AdminLoginPopover.css'

export default function AdminLoginPopover({ open, onClose, anchorRef }) {
  const { login } = useAdmin()
  const titleId = useId()
  const panelRef = useRef(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [position, setPosition] = useState({ top: 36, left: 16 })

  useEffect(() => {
    if (!open) return undefined

    const updatePosition = () => {
      const anchor = anchorRef?.current
      if (!anchor) return
      const rect = anchor.getBoundingClientRect()
      setPosition({ top: rect.bottom + 6, left: rect.left })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, anchorRef])

  useEffect(() => {
    if (!open) {
      setUsername('')
      setPassword('')
      setError('')
      return undefined
    }

    const onPointerDown = (e) => {
      const panel = panelRef.current
      const anchor = anchorRef?.current
      if (panel?.contains(e.target) || anchor?.contains(e.target)) return
      onClose()
    }

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose, anchorRef])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!login(username, password)) {
      setError('Invalid username or password.')
      return
    }
    onClose()
  }

  if (!open) return null

  return (
    <div
      ref={panelRef}
      className="admin-login-popover"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      style={{ top: position.top, left: position.left }}
    >
      <h2 id={titleId} className="admin-login-popover__title">
        Log in
      </h2>
      <form className="admin-login-popover__form" onSubmit={handleSubmit}>
        <label className="admin-login-popover__field">
          <span className="admin-login-popover__label">Username</span>
          <input
            type="text"
            className="admin-login-popover__input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label className="admin-login-popover__field">
          <span className="admin-login-popover__label">Password</span>
          <input
            type="password"
            className="admin-login-popover__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error ? (
          <p className="admin-login-popover__error" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="admin-login-popover__submit">
          Log in
        </button>
      </form>
    </div>
  )
}
