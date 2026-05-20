import { useState, useEffect, useRef } from 'react'
import { User, Folder, Mail, Newspaper } from 'lucide-react'
import { MouseFollowingEyes } from '@/components/ui/mouse-following-eyes'
import { SHORTCUTS } from '../config/shortcuts'
import { useLanguage } from '../context/LanguageContext'
import './ChromeHome.css'

const SHORTCUT_ICONS = {
  user: User,
  folder: Folder,
  mail: Mail,
  newspaper: Newspaper,
}

export default function ChromeHome({ onNavigateShortcut, onShortcutInNewTab }) {
  const { t } = useLanguage()
  const [shortcutContextMenu, setShortcutContextMenu] = useState(null)
  const menuRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    if (!shortcutContextMenu) return
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShortcutContextMenu(null)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [shortcutContextMenu])

  return (
    <div className="chrome-home">
      <div className="chrome-home__bg" aria-hidden="true" />
      <div ref={contentRef} className="chrome-home__content">
        <div className="chrome-home__eyes" aria-hidden="true">
          <MouseFollowingEyes trackWindow={false} trackingRoot={contentRef} eyeSize={80} />
        </div>
        <div className="chrome-home__shortcuts">
          {SHORTCUTS.map((s) => {
            const Icon = SHORTCUT_ICONS[s.icon] || Folder
            const label = t(`shortcuts.${s.type}`)
            return (
              <button
                key={s.id}
                type="button"
                className="chrome-home__shortcut"
                onClick={() => onNavigateShortcut?.(s.type)}
                onContextMenu={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShortcutContextMenu({ x: e.clientX, y: e.clientY, shortcutType: s.type })
                }}
                title={label}
                aria-label={label}
              >
                <span className="chrome-home__shortcut-icon">
                  <Icon size={28} strokeWidth={1.5} />
                </span>
                <span className="chrome-home__shortcut-label">{label}</span>
              </button>
            )
          })}
        </div>
      </div>
      {shortcutContextMenu && (
        <div
          ref={menuRef}
          className="chrome-home__context-menu"
          style={{
            left: Math.min(shortcutContextMenu.x, typeof window !== 'undefined' ? window.innerWidth - 180 : shortcutContextMenu.x),
            top: shortcutContextMenu.y,
          }}
        >
          <button
            type="button"
            className="chrome-home__context-item"
            onClick={() => {
              onShortcutInNewTab?.(shortcutContextMenu.shortcutType)
              setShortcutContextMenu(null)
            }}
          >
            Open in new tab
          </button>
        </div>
      )}
    </div>
  )
}
