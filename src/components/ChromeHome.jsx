import { useState, useEffect, useRef } from 'react'
import { User, Folder, Mail, Newspaper } from 'lucide-react'
import { MouseFollowingEyes } from '@/components/ui/mouse-following-eyes'
import { SHORTCUTS } from '../config/shortcuts'
import { useLanguage } from '../context/LanguageContext'
import './ChromeHome.css'

const SHORTCUT_ICON_SRC = {
  about: '/images/chrome-shortcuts/about.png',
  newsletter: '/images/chrome-shortcuts/newsletter.png',
  project: '/images/chrome-shortcuts/project.png',
  contact: '/images/chrome-shortcuts/contact.png',
}

const SHORTCUT_ICONS = {
  user: User,
  folder: Folder,
  mail: Mail,
  newspaper: Newspaper,
}

function ShortcutIcon({ shortcutType, lucideIcon: LucideIcon }) {
  const [imgFailed, setImgFailed] = useState(false)
  const iconSrc = SHORTCUT_ICON_SRC[shortcutType]

  if (!iconSrc || imgFailed) {
    return <LucideIcon size={28} strokeWidth={1.5} />
  }

  return (
    <img
      src={iconSrc}
      alt=""
      className="chrome-home__shortcut-icon-img"
      onError={() => setImgFailed(true)}
    />
  )
}

export default function ChromeHome({ onNavigateShortcut, onShortcutInNewTab }) {
  const { t } = useLanguage()
  const [shortcutContextMenu, setShortcutContextMenu] = useState(null)
  const menuRef = useRef(null)
  const homeRef = useRef(null)

  useEffect(() => {
    if (!shortcutContextMenu) return
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShortcutContextMenu(null)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [shortcutContextMenu])

  return (
    <div ref={homeRef} className="chrome-home">
      <div className="chrome-home__eyes" aria-hidden="true">
        <MouseFollowingEyes trackWindow={false} trackingRoot={homeRef} eyeSize={80} />
      </div>
      <p className="chrome-home__scene-caption" aria-hidden="true">
        Everything Everywhere All at Once (2022) Scene 1:36:00
      </p>
      <div className="chrome-home__content">
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
                  <ShortcutIcon shortcutType={s.type} lucideIcon={Icon} />
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
