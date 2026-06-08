import { X, Minus, Maximize2, Square, User, FolderKanban, Newspaper, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import SafariSearchBar from './SafariSearchBar'
import './ChromeFrame.css'

const NAV_ITEMS = [
  { type: 'about', label: 'About', Icon: User },
  { type: 'project', label: 'Project', Icon: FolderKanban },
  { type: 'newsletter', label: 'Newsletter', Icon: Newspaper },
  { type: 'contact', label: 'Contact', Icon: MessageCircle },
]

function stopWindowDrag(e) {
  e.stopPropagation()
}

export default function ChromeFrame({
  onMinimize,
  onMaximize,
  onWindowClose,
  isMaximized = false,
  activeTabType,
  onNavigate,
}) {
  return (
    <header className={cn('chrome-frame flex flex-shrink-0 flex-col overflow-hidden')}>
      <div
        className={cn(
          'relative flex items-center gap-3 border-b border-gray-200/80 bg-gray-100 px-4 py-2',
          'dark:border-zinc-700 dark:bg-zinc-900',
        )}
      >
        <div className="chrome-frame__drag" aria-hidden="true" />
        <div className={cn('relative z-[3] flex shrink-0 items-center gap-2')}>
          <button
            type="button"
            className={cn(
              'chrome-frame__traffic chrome-frame__traffic--close',
              'h-3 w-3 rounded-full bg-red-400 p-0',
            )}
            aria-label="Close"
            onClick={onWindowClose}
            onMouseDown={stopWindowDrag}
            onPointerDown={stopWindowDrag}
          >
            <X className="chrome-frame__traffic-icon" size={9} strokeWidth={3} />
          </button>
          <button
            type="button"
            className={cn(
              'chrome-frame__traffic chrome-frame__traffic--minimize',
              'h-3 w-3 rounded-full bg-yellow-400 p-0',
            )}
            aria-label="Minimize"
            onClick={onMinimize}
            onMouseDown={stopWindowDrag}
            onPointerDown={stopWindowDrag}
          >
            <Minus className="chrome-frame__traffic-icon" size={9} strokeWidth={3} />
          </button>
          <button
            type="button"
            className={cn(
              'chrome-frame__traffic chrome-frame__traffic--maximize',
              'h-3 w-3 rounded-full bg-green-500 p-0',
            )}
            aria-label={isMaximized ? 'Restore' : 'Maximize'}
            onClick={onMaximize}
            onMouseDown={stopWindowDrag}
            onPointerDown={stopWindowDrag}
          >
            {isMaximized ? (
              <Square
                className="chrome-frame__traffic-icon chrome-frame__traffic-icon--restore"
                size={8}
                strokeWidth={2.5}
              />
            ) : (
              <Maximize2 className="chrome-frame__traffic-icon" size={8} strokeWidth={2.5} />
            )}
          </button>
        </div>

        <div className="relative z-[4] min-w-0 flex-1">
          <SafariSearchBar activeTabType={activeTabType} onNavigate={onNavigate} />
        </div>

        <nav
          className="chrome-frame__nav relative z-[4] flex shrink-0 items-center gap-0.5"
          aria-label="Page navigation"
          onMouseDown={stopWindowDrag}
          onPointerDown={stopWindowDrag}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTabType === item.type
            const NavIcon = item.Icon
            return (
              <button
                key={item.type}
                type="button"
                className={cn(
                  'chrome-frame__nav-btn',
                  isActive && 'chrome-frame__nav-btn--active',
                )}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                title={item.label}
                onClick={() => onNavigate?.(item.type)}
              >
                <NavIcon size={16} strokeWidth={1.75} />
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
