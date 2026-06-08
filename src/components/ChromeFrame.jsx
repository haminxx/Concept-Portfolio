import {
  X,
  Minus,
  Maximize2,
  Square,
  ChevronLeft,
  ChevronRight,
  Sidebar,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'
import SafariSearchBar from './SafariSearchBar'
import './ChromeFrame.css'

const TRAFFIC_HOVER = { scale: 1.12 }
const TRAFFIC_TAP = { scale: 0.92 }
const ICON_HOVER = { scale: 1.08 }
const ICON_TAP = { scale: 0.94 }

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
  onBack,
  onForward,
}) {
  return (
    <motion.header
      className={cn('chrome-frame flex flex-shrink-0 flex-col')}
      initial={{ opacity: 0, y: -6, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={cn(
          'relative flex items-center gap-2 border-b border-black/10 bg-[#f6f6f8] px-3 py-2',
          'dark:border-white/10 dark:bg-[#262626]',
        )}
      >
        <div className="chrome-frame__drag" aria-hidden="true" />

        {/* Traffic lights */}
        <div
          className={cn('chrome-frame__traffic-lights relative z-[3] flex shrink-0 items-center gap-2')}
          onMouseDown={stopWindowDrag}
          onPointerDown={stopWindowDrag}
        >
          <motion.button
            type="button"
            className={cn(
              'chrome-frame__traffic chrome-frame__traffic--close',
              'h-3 w-3 rounded-full bg-[#ff5f57] p-0',
            )}
            aria-label="Close"
            onClick={onWindowClose}
            onMouseDown={stopWindowDrag}
            onPointerDown={stopWindowDrag}
            whileHover={TRAFFIC_HOVER}
            whileTap={TRAFFIC_TAP}
          >
            <X className="chrome-frame__traffic-icon" size={9} strokeWidth={3} />
          </motion.button>
          <motion.button
            type="button"
            className={cn(
              'chrome-frame__traffic chrome-frame__traffic--minimize',
              'h-3 w-3 rounded-full bg-[#febc2e] p-0',
            )}
            aria-label="Minimize"
            onClick={onMinimize}
            onMouseDown={stopWindowDrag}
            onPointerDown={stopWindowDrag}
            whileHover={TRAFFIC_HOVER}
            whileTap={TRAFFIC_TAP}
          >
            <Minus className="chrome-frame__traffic-icon" size={9} strokeWidth={3} />
          </motion.button>
          <motion.button
            type="button"
            className={cn(
              'chrome-frame__traffic chrome-frame__traffic--maximize',
              'h-3 w-3 rounded-full bg-[#28c840] p-0',
            )}
            aria-label={isMaximized ? 'Restore' : 'Maximize'}
            onClick={onMaximize}
            onMouseDown={stopWindowDrag}
            onPointerDown={stopWindowDrag}
            whileHover={TRAFFIC_HOVER}
            whileTap={TRAFFIC_TAP}
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
          </motion.button>
        </div>

        {/* Sidebar + back/forward */}
        <div
          className="chrome-frame__tools relative z-[4] flex shrink-0 items-center gap-0.5"
          onMouseDown={stopWindowDrag}
          onPointerDown={stopWindowDrag}
        >
          <motion.button
            type="button"
            className="chrome-frame__icon-btn"
            aria-label="Sidebar"
            title="Sidebar"
            whileHover={ICON_HOVER}
            whileTap={ICON_TAP}
          >
            <Sidebar size={16} strokeWidth={1.75} />
          </motion.button>
          <motion.button
            type="button"
            className="chrome-frame__icon-btn"
            aria-label="Back"
            title="Back"
            onClick={() => onBack?.()}
            whileHover={ICON_HOVER}
            whileTap={ICON_TAP}
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </motion.button>
          <motion.button
            type="button"
            className="chrome-frame__icon-btn"
            aria-label="Forward"
            title="Forward"
            onClick={() => onForward?.()}
            whileHover={ICON_HOVER}
            whileTap={ICON_TAP}
          >
            <ChevronRight size={18} strokeWidth={2} />
          </motion.button>
        </div>

        {/* Address / search field centred in the window. Page navigation
            (About / Project / Newsletter / Contact) flies out HORIZONTALLY to
            the right of this search on hover — see SafariSearchBar — so the
            static toolbar nav icons were removed to avoid duplicating the
            spotlight fly-out. Absolutely positioned so the right fly-out can
            overlay the toolbar without shifting the centred field. */}
        <div className="chrome-frame__search">
          <SafariSearchBar activeTabType={activeTabType} onNavigate={onNavigate} />
        </div>
      </div>
    </motion.header>
  )
}
