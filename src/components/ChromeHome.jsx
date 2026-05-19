import { useState, useEffect, useRef } from 'react'
import { Search, User, Folder, Mail, Newspaper } from 'lucide-react'
import { StarsBackground } from '@/components/ui/stars-background'
import { SHORTCUTS } from '../config/shortcuts'
import { useLanguage } from '../context/LanguageContext'
import { useWeatherTheme, WEATHER_THEMES } from '../hooks/useWeatherTheme'
import './ChromeHome.css'

const SHORTCUT_ICONS = {
  user: User,
  folder: Folder,
  mail: Mail,
  newspaper: Newspaper,
}

export default function ChromeHome({ onNavigateShortcut, onShortcutInNewTab, onSearch }) {
  const { t } = useLanguage()
  const { theme, showStars, isDark } = useWeatherTheme()
  const [shortcutContextMenu, setShortcutContextMenu] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const menuRef = useRef(null)

  useEffect(() => {
    if (!shortcutContextMenu) return
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShortcutContextMenu(null)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [shortcutContextMenu])

  const handleSearch = (e) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    onSearch?.(q)
  }

  const themeClass = theme || WEATHER_THEMES.LOADING

  const backgroundLayer = showStars ? (
    <StarsBackground
      className={`chrome-home__bg chrome-home__bg--stars chrome-home__bg--${themeClass}`}
      speed={theme === WEATHER_THEMES.EVENING ? 70 : 50}
      starColor={theme === WEATHER_THEMES.EVENING ? 'rgba(255, 220, 180, 0.9)' : '#fff'}
    />
  ) : (
    <div className={`chrome-home__bg chrome-home__bg--${themeClass}`} aria-hidden="true" />
  )

  return (
    <div className={`chrome-home chrome-home--${themeClass}${isDark ? ' chrome-home--dark' : ''}`}>
      {backgroundLayer}
      <div className="chrome-home__content">
        <form className="chrome-home__search-wrap" onSubmit={handleSearch}>
          <Search size={20} className="chrome-home__search-icon" strokeWidth={2} />
          <input
            type="text"
            className="chrome-home__search"
            placeholder={t('chrome.searchPlaceholder')}
            aria-label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
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
