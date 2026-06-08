import { X, Minus, Maximize2, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import './ChromeFrame.css'

export default function ChromeFrame({
  onMinimize,
  onMaximize,
  onWindowClose,
  isMaximized = false,
}) {
  return (
    <header className={cn('chrome-frame flex flex-shrink-0 flex-col overflow-hidden')}>
      <div
        className={cn(
          'relative flex items-center justify-between border-b border-gray-200/80 bg-gray-100 px-4 py-2',
          'dark:border-zinc-700 dark:bg-zinc-900',
        )}
      >
        <div className="chrome-frame__drag" aria-hidden="true" />
        <div className={cn('relative z-[3] flex items-center gap-2')}>
          <button
            type="button"
            className={cn(
              'chrome-frame__traffic chrome-frame__traffic--close',
              'h-3 w-3 rounded-full bg-red-400 p-0',
            )}
            aria-label="Close"
            onClick={onWindowClose}
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
        <div
          className={cn(
            'mx-4 h-5 max-w-md flex-1 rounded-md bg-gray-200',
            'dark:bg-zinc-800',
          )}
          aria-hidden="true"
        />
        <div className="h-4 w-4 shrink-0" aria-hidden="true" />
      </div>
    </header>
  )
}
