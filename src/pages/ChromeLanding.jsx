import { useState, useCallback, useEffect, useRef, Suspense } from 'react'
import { useDockOrder } from '../hooks/useDockOrder'
import { useDesktopItems } from '../hooks/useDesktopItems'
import ChromeFrame from '../components/ChromeFrame'
import ChromeWindow from '../components/ChromeWindow'
import ChromeHome from '../components/ChromeHome'
import ChromeContextMenu from '../components/ChromeContextMenu'
import AboutPage from '../components/AboutPage'
import ContactPage from '../components/ContactPage'
import NewsletterPage from '../components/NewsletterPage'
import ProjectPage from '../components/ProjectPage'
import Desktop from '../components/Desktop'
import DesktopDocumentsFolderModal from '../components/DesktopDocumentsFolderModal'
import {
  LazyInstagramWindow,
  LazyMapWindow,
  LazyDoomWindow,
  LazyDadNMeWindow,
  LazyNetflixWindow,
  LazyYouTubeMusicWindow,
  LazySettingsWindow,
  LazyAppStoreWindow,
  LazyGalleryWindow,
  LazyFaceTimeWindow,
  LazyFinderWindow,
  LazyNotesWindow,
  LazyNotionCalendarWindow,
  LazyTetrisWindow,
} from './chromeLazyComponents'
import MenuBar from '../components/MenuBar'
import AppErrorBoundary from '../components/AppErrorBoundary'
import Dock from '../components/Dock'
import AppWindow from '../components/AppWindow'
import { APPS } from '../config/apps'
import { SHORTCUTS } from '../config/shortcuts'
import { useLanguage } from '../context/LanguageContext'
import { MusicPlayerProvider } from '../context/MusicPlayerContext'
import { DesktopBackgroundProvider } from '../context/DesktopBackgroundContext'
import {
  Globe,
  Image,
  Film,
  Images,
  Video,
  ShoppingBag,
  Settings,
  Map as MapIcon,
  Folder,
  StickyNote,
  LayoutGrid,
} from 'lucide-react'
import {
  isDocumentFullscreen,
  toggleDocumentFullscreen,
  runBootFullscreenSequence,
} from '../utils/fullscreen'
import { clearChromeSessionState } from '../utils/chromeSessionState'
import './ChromeLanding.css'

const APP_ICONS = {
  finder: Folder,
  chrome: Globe,
  instagram: Image,
  netflix: Film,
  photos: Images,
  facetime: Video,
  appStore: ShoppingBag,
  settings: Settings,
  map: MapIcon,
  youtubeMusic: Film,
  notes: StickyNote,
  tetris: LayoutGrid,
}

const HOME_TAB = { id: 'home', title: 'Home', type: 'home' }
function getUrlForTab(tab) {
  const shortcut = SHORTCUTS.find((s) => s.type === tab.type)
  if (shortcut?.url) return shortcut.url
  const app = APPS[tab.type]
  return app?.url ?? null
}

export default function ChromeLanding({
  onReboot,
  desktopRevealed = true,
  bootRevealDelayMs = 0,
}) {
  const [tabs, setTabs] = useState([HOME_TAB])
  const [activeTabId, setActiveTabId] = useState('home')
  const [chromeMaximized, setChromeMaximized] = useState(false)
  const [chromeMinimized, setChromeMinimized] = useState(true)
  const [chromeMinimizing, setChromeMinimizing] = useState(false)
  const [chromeOpening, setChromeOpening] = useState(false)
  const [sortBy, setSortBy] = useState('name')
  const [chromeContextMenu, setChromeContextMenu] = useState(null)
  const { desktopItems, setDesktopItems, handleNewFolder: _handleNewFolder, handleNewFile: _handleNewFile } = useDesktopItems()
  const { dockOrder, updateDockOrder } = useDockOrder()
  const [openFolderId, setOpenFolderId] = useState(null)
  const [startRenameId, setStartRenameId] = useState(null)
  const [openAppWindows, setOpenAppWindows] = useState([])
  const [focusedAppWindowId, setFocusedAppWindowId] = useState(null)
  const [chromeFocused, setChromeFocused] = useState(false)
  const [chromeRefreshing, setChromeRefreshing] = useState(false)
  const [chromeWindowKey, setChromeWindowKey] = useState(0)
  const [showShutdown, setShowShutdown] = useState(false)
  const [shutdownAction, setShutdownAction] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { t } = useLanguage()

  const handleNewFolder = useCallback((x, y) => {
    const id = _handleNewFolder(x, y)
    setStartRenameId(id)
  }, [_handleNewFolder])

  const handleNewFile = useCallback((x, y) => {
    const id = _handleNewFile(x, y)
    setStartRenameId(id)
  }, [_handleNewFile])

  const handleOpenFolder = useCallback((id) => setOpenFolderId(id), [])
  const handleStartRename = useCallback((id) => setStartRenameId(id), [])

  const chromeNavStacksRef = useRef(
    new Map([['home', { entries: [{ type: 'home', title: 'Home' }], index: 0 }]]),
  )
  const chromeNavReplayRef = useRef(false)
  const closingLastTabRef = useRef(false)
  const autoOpenedChromeRef = useRef(false)

  const pushChromeNav = useCallback((tabId, type, title, meta) => {
    if (chromeNavReplayRef.current) return
    let state = chromeNavStacksRef.current.get(tabId)
    if (!state) {
      chromeNavStacksRef.current.set(tabId, { entries: [{ type, title, meta }], index: 0 })
      return
    }
    const { entries, index } = state
    const last = entries[index]
    if (
      last &&
      last.type === type &&
      last.title === title &&
      JSON.stringify(last.meta ?? null) === JSON.stringify(meta ?? null)
    ) {
      return
    }
    const nextEntries = entries.slice(0, index + 1)
    nextEntries.push({ type, title, meta })
    state.entries = nextEntries
    state.index = nextEntries.length - 1
  }, [])

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0]

  useEffect(() => {
    const tab = tabs.find((t) => t.id === activeTabId)
    if (!tab) return
    if (!chromeNavStacksRef.current.has(activeTabId)) {
      chromeNavStacksRef.current.set(activeTabId, {
        entries: [{ type: tab.type, title: tab.title }],
        index: 0,
      })
    }
  }, [activeTabId, tabs])

  const openAppTab = useCallback((appKey) => {
    const app = APPS[appKey]
    if (!app) return
    if (appKey === 'chrome') {
      if (chromeMinimized) {
        setChromeMinimized(false)
        setChromeOpening(true)
        setChromeFocused(true)
        setFocusedAppWindowId(null)
      } else {
        setChromeMinimizing(true)
      }
      return
    }
    setChromeFocused(false)
    setOpenAppWindows((prev) => {
      const existing = prev.find((w) => w.appKey === appKey)
      if (existing) {
        setFocusedAppWindowId(existing.id)
        if (existing.isMinimized) {
          return prev.map((w) =>
            w.id === existing.id ? { ...w, isMinimized: false, isOpening: true } : w
          )
        }
        return prev.map((w) =>
          w.id === existing.id ? { ...w, isMinimizing: true } : w
        )
      }
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
      const vh = typeof window !== 'undefined' ? window.innerHeight : 800
      let winWidth = Math.min(880, Math.max(400, vw * 0.85))
      let winHeight = Math.min(660, Math.max(400, vh * 0.8))
      if (appKey === 'tetris') {
        winWidth = Math.min(460, Math.max(380, vw * 0.42))
        winHeight = Math.min(560, Math.max(400, vh * 0.72))
      }
      if (appKey === 'notes') {
        winWidth = Math.min(760, Math.max(520, vw * 0.72))
        winHeight = Math.min(620, Math.max(400, vh * 0.78))
      }
      if (appKey === 'notionCalendar') {
        winWidth = Math.min(960, Math.max(560, vw * 0.88))
        winHeight = Math.min(640, Math.max(420, vh * 0.82))
      }
      const x = Math.max(0, (vw - winWidth) / 2 + prev.length * 24)
      const y = Math.max(32, (vh - winHeight) / 2 + prev.length * 24 - 36)
      const id = `app-${appKey}-${Date.now()}`
      const win = {
        id,
        appKey,
        position: { x, y },
        size: { width: winWidth, height: winHeight },
        isMaximized: false,
        isMinimized: false,
        isOpening: true,
      }
      setFocusedAppWindowId(id)
      return [...prev, win]
    })
  }, [chromeMinimized])

  const navigateToShortcut = useCallback(
    (shortcutType) => {
      const shortcut = SHORTCUTS.find((s) => s.type === shortcutType)
      if (!shortcut) return
      pushChromeNav(activeTabId, shortcutType, shortcut.label)
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId
            ? { ...t, type: shortcutType, title: shortcut.label, projectId: null }
            : t
        )
      )
      setChromeMinimized(false)
    },
    [activeTabId, pushChromeNav]
  )

  const resetChromeTabsToHome = useCallback(() => {
    chromeNavStacksRef.current.clear()
    chromeNavStacksRef.current.set('home', {
      entries: [{ type: 'home', title: 'Home' }],
      index: 0,
    })
    setTabs([HOME_TAB])
    setActiveTabId('home')
  }, [])

  const resetChromeWindow = useCallback(() => {
    resetChromeTabsToHome()
    setChromeMaximized(false)
    setChromeContextMenu(null)
    clearChromeSessionState()
    setChromeWindowKey((k) => k + 1)
    iframeRefreshKeyRef.current += 1
  }, [resetChromeTabsToHome])

  const closeTab = useCallback((id) => {
    chromeNavStacksRef.current.delete(id)

    setTabs((prev) => {
      const closedIndex = prev.findIndex((t) => t.id === id)
      if (closedIndex < 0) return prev

      if (prev.length === 1) {
        closingLastTabRef.current = true
        queueMicrotask(() => setChromeMinimizing(true))
        return []
      }

      const next = prev.filter((t) => t.id !== id)
      if (activeTabId === id) {
        const newActiveIndex = Math.max(0, closedIndex - 1)
        queueMicrotask(() => setActiveTabId(next[newActiveIndex].id))
      }
      return next
    })
  }, [activeTabId])

  const goHome = useCallback(() => {
    const id = activeTabId
    const tab = tabs.find((t) => t.id === id)
    if (!tab) return
    pushChromeNav(id, 'home', 'Home')
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, type: 'home', title: 'Home', projectId: null } : t)),
    )
  }, [activeTabId, tabs, pushChromeNav])

  const handleProjectNavigate = useCallback(
    (project) => {
      if (!project?.id) return
      pushChromeNav(activeTabId, 'project', project.title, { projectId: project.id })
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId
            ? { ...t, type: 'project', title: project.title, projectId: project.id }
            : t
        )
      )
    },
    [activeTabId, pushChromeNav]
  )

  const handleChromeNavigate = useCallback(
    (type) => {
      if (type === 'home') {
        goHome()
      } else {
        navigateToShortcut(type)
      }
    },
    [goHome, navigateToShortcut],
  )

  const handleBack = useCallback(() => {
    const id = activeTabId
    const state = chromeNavStacksRef.current.get(id)
    if (!state || state.index <= 0) return
    state.index -= 1
    const { type, title, meta } = state.entries[state.index]
    chromeNavReplayRef.current = true
    setTabs((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, type, title, projectId: meta?.projectId ?? null }
          : t
      )
    )
    queueMicrotask(() => {
      chromeNavReplayRef.current = false
    })
  }, [activeTabId])

  const handleForward = useCallback(() => {
    const id = activeTabId
    const state = chromeNavStacksRef.current.get(id)
    if (!state || state.index >= state.entries.length - 1) return
    state.index += 1
    const { type, title, meta } = state.entries[state.index]
    chromeNavReplayRef.current = true
    setTabs((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, type, title, projectId: meta?.projectId ?? null }
          : t
      )
    )
    queueMicrotask(() => {
      chromeNavReplayRef.current = false
    })
  }, [activeTabId])
  const iframeRefreshKeyRef = useRef(0)
  const handleRefresh = useCallback(() => {
    setChromeRefreshing(true)
    resetChromeWindow()
    setTimeout(() => {
      setChromeRefreshing(false)
    }, 400)
  }, [resetChromeWindow])

  useEffect(() => {
    clearChromeSessionState()
  }, [])

  const openNewHomeTab = useCallback(() => {
    const homeTab = { id: `home-${Date.now()}`, title: 'Home', type: 'home' }
    chromeNavStacksRef.current.set(homeTab.id, {
      entries: [{ type: 'home', title: 'Home' }],
      index: 0,
    })
    setTabs((prev) => [...prev, homeTab])
    setActiveTabId(homeTab.id)
    setChromeMinimized(false)
  }, [])

  const toggleMaximize = useCallback(() => setChromeMaximized((m) => !m), [])
  const setMinimized = useCallback(() => setChromeMinimizing(true), [])

  const handleChromeMinimizeComplete = useCallback(() => {
    setChromeMinimized(true)
    setChromeMinimizing(false)
    if (closingLastTabRef.current) {
      closingLastTabRef.current = false
      resetChromeTabsToHome()
    }
  }, [resetChromeTabsToHome])

  const handleChromeOpeningComplete = useCallback(() => {
    setChromeOpening(false)
  }, [])

  useEffect(() => {
    const handler = () => setIsFullscreen(isDocumentFullscreen())
    document.addEventListener('fullscreenchange', handler)
    document.addEventListener('webkitfullscreenchange', handler)
    handler()
    return () => {
      document.removeEventListener('fullscreenchange', handler)
      document.removeEventListener('webkitfullscreenchange', handler)
    }
  }, [])

  /** After pre-landing: fullscreen once home blur reveal finishes (or immediately on F11 skip). */
  useEffect(() => {
    if (!desktopRevealed) return undefined
    return runBootFullscreenSequence({ revealDelayMs: bootRevealDelayMs })
  }, [desktopRevealed, bootRevealDelayMs])

  /** Open Safari once when the desktop is first revealed (not on every re-render or re-minimize). */
  useEffect(() => {
    if (!desktopRevealed || autoOpenedChromeRef.current) return undefined

    const openSafari = () => {
      if (autoOpenedChromeRef.current) return
      autoOpenedChromeRef.current = true
      setChromeMinimized(false)
      setChromeOpening(true)
      setChromeFocused(true)
      setFocusedAppWindowId(null)
    }

    const delay = Math.max(0, bootRevealDelayMs)
    const timer = window.setTimeout(openSafari, delay)
    return () => window.clearTimeout(timer)
  }, [desktopRevealed, bootRevealDelayMs])

  const handleFullScreenToggle = useCallback(() => {
    toggleDocumentFullscreen()
  }, [])

  const handleTurnOff = useCallback(() => {
    setShutdownAction('turnOff')
    setShowShutdown(true)
  }, [])

  const handleRestart = useCallback(() => {
    setShutdownAction('restart')
    setShowShutdown(true)
  }, [])

  useEffect(() => {
    if (!showShutdown || !shutdownAction) return
    const t = setTimeout(() => {
      if (shutdownAction === 'restart') {
        onReboot?.()
      } else if (shutdownAction === 'turnOff') {
        window.close()
        setTimeout(() => {
          window.location.href = 'about:blank'
        }, 100)
      }
      setShowShutdown(false)
      setShutdownAction(null)
    }, 2000)
    return () => clearTimeout(t)
  }, [showShutdown, shutdownAction, onReboot])

  return (
    <MusicPlayerProvider>
    <DesktopBackgroundProvider>
    <div className="chrome-landing">
      <Desktop
        onOpenApp={openAppTab}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        desktopItems={desktopItems}
        onItemsChange={setDesktopItems}
        onOpenFolder={handleOpenFolder}
        onNewFolder={handleNewFolder}
        onNewFile={handleNewFile}
        onStartRename={handleStartRename}
        startRenameId={startRenameId}
        onClearStartRenameId={() => setStartRenameId(null)}
      />
      <MenuBar
        onTurnOff={handleTurnOff}
        onRestart={handleRestart}
        onSleep={() => setShowShutdown(true)}
        onNewTab={openNewHomeTab}
        onCloseTab={() => closeTab(activeTabId)}
        onReload={handleRefresh}
        onGoHome={goHome}
        onBack={handleBack}
        onForward={handleForward}
        onMinimize={setMinimized}
        onZoom={toggleMaximize}
        onFullScreenToggle={handleFullScreenToggle}
        isFullscreen={isFullscreen}
      />
      <Dock
        onOpenApp={openAppTab}
        dockOrder={dockOrder}
        onDockReorder={updateDockOrder}
        isChromeMaximized={chromeMaximized}
        anyMaximized={(chromeMaximized && !chromeMinimized) || openAppWindows.some((w) => w.isMaximized && !w.isMinimized)}
        openAppWindows={openAppWindows}
      />
      {openFolderId && (
        <DesktopDocumentsFolderModal
          folderId={openFolderId}
          desktopItems={desktopItems}
          onClose={() => setOpenFolderId(null)}
          onOpenFolder={handleOpenFolder}
          onOpenApp={openAppTab}
        />
      )}
      {[
        ...openAppWindows
          .filter((w) => !w.isMinimized || w.isMinimizing)
          .map((w) => ({ ...w, _type: 'app', _isFocused: focusedAppWindowId === w.id })),
        ...((!chromeMinimized || chromeMinimizing)
          ? [{ id: 'chrome', _type: 'chrome', _isFocused: chromeFocused }]
          : []),
      ]
        .sort((a, b) => (a._isFocused ? 1 : 0) - (b._isFocused ? 1 : 0))
        .map((win) => {
        if (win._type === 'chrome') {
          return (
            <ChromeWindow
              key={chromeWindowKey}
              isMaximized={chromeMaximized}
              onMaximize={toggleMaximize}
              isMinimizing={chromeMinimizing}
              onOpeningComplete={handleChromeOpeningComplete}
              isOpening={chromeOpening}
              onMinimizeComplete={handleChromeMinimizeComplete}
              onFocus={() => { setChromeFocused(true); setFocusedAppWindowId(null) }}
              isFocused={chromeFocused}
            >
              <ChromeFrame
                isMaximized={chromeMaximized}
                onMaximize={toggleMaximize}
                onMinimize={setMinimized}
                onWindowClose={setMinimized}
                activeTabType={activeTab?.type}
                projectTitle={activeTab?.projectId ? activeTab.title : null}
                onNavigate={handleChromeNavigate}
                onBack={handleBack}
                onForward={handleForward}
              />
              <div
                className="chrome-landing__content min-h-0 flex-1 bg-gray-100 dark:bg-zinc-800"
                onContextMenu={(e) => {
                  e.preventDefault()
                  const url = getUrlForTab(activeTab)
                  setChromeContextMenu({ x: e.clientX, y: e.clientY, url })
                }}
              >
                {chromeRefreshing && (
                  <div className="chrome-landing__refresh-overlay" aria-hidden="true">
                    <div className="chrome-landing__refresh-spinner" />
                  </div>
                )}
                {!activeTab ? null : activeTab.type === 'home' ? (
                  <ChromeHome />
                ) : activeTab.type === 'about' ? (
                  <AboutPage />
                ) : activeTab.type === 'newsletter' ? (
                  <NewsletterPage />
                ) : activeTab.type === 'project' ? (
                  <ProjectPage
                    selectedProjectId={activeTab.projectId ?? null}
                    onProjectNavigate={handleProjectNavigate}
                  />
                ) : activeTab.type === 'contact' ? (
                  <ContactPage />
                ) : activeTab.type === 'iframe' && activeTab.url ? (
                  <iframe
                    key={`${iframeRefreshKeyRef.current}-${activeTab.url}`}
                    src={activeTab.url}
                    className="chrome-landing__iframe"
                    title={activeTab.title}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                  />
                ) : (() => {
                  const url = getUrlForTab(activeTab)
                  if (url) {
                    return (
                      <iframe key={iframeRefreshKeyRef.current} src={url} className="chrome-landing__iframe" title={activeTab.title} />
                    )
                  }
                  return (
                    <div className="chrome-landing__empty">
                      <span>Opened: {activeTab.title}</span>
                    </div>
                  )
                })()}
              </div>
            </ChromeWindow>
          )
        }
        const app = APPS[win.appKey]
        if (!app) return null
        const Icon = APP_ICONS[win.appKey]
        const profileUrl = app.url ?? SHORTCUTS.find((s) => s.type === win.appKey)?.url
        let content
        if (win.appKey === 'map') {
          content = <LazyMapWindow />
        } else if (win.appKey === 'netflix') {
          content = <LazyNetflixWindow />
        } else if (win.appKey === 'youtubeMusic') {
          content = <LazyYouTubeMusicWindow />
        } else if (win.appKey === 'instagram') {
          content = <LazyInstagramWindow />
        } else if (win.appKey === 'settings') {
          content = <LazySettingsWindow />
        } else if (win.appKey === 'appStore') {
          content = <LazyAppStoreWindow />
        } else if (win.appKey === 'photos') {
          content = <LazyGalleryWindow />
        } else if (win.appKey === 'finder') {
          content = <LazyFinderWindow onOpenApp={openAppTab} />
        } else if (win.appKey === 'facetime') {
          content = <LazyFaceTimeWindow />
        } else if (win.appKey === 'doom') {
          content = <LazyDoomWindow isMinimized={win.isMinimized} isMinimizing={win.isMinimizing} />
        } else if (win.appKey === 'dadnme') {
          content = <LazyDadNMeWindow />
        } else if (win.appKey === 'notes') {
          content = <LazyNotesWindow />
        } else if (win.appKey === 'notionCalendar') {
          content = <LazyNotionCalendarWindow />
        } else if (win.appKey === 'tetris') {
          content = <LazyTetrisWindow keyboardActive={focusedAppWindowId === win.id && !win.isMinimized} />
        } else if (profileUrl) {
          content = <iframe src={profileUrl} className="chrome-landing__iframe" title={app.label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
        } else {
          content = <div className="chrome-landing__empty" style={{ padding: 24 }}><span>Opened: {app.label}</span></div>
        }
        return (
          <AppWindow
            key={win.id}
            id={win.id}
            title={t(`apps.${win.appKey}`)}
            icon={
              win.appKey === 'notionCalendar' ? (
                <img src="/dock-icons/notion-calendar.png" alt="" className="app-window__icon-img" />
              ) : Icon ? (
                <Icon size={16} strokeWidth={1.5} />
              ) : null
            }
            position={win.position}
            isOpening={win.isOpening}
            onOpeningComplete={() => setOpenAppWindows((prev) => prev.map((w) => (w.id === win.id ? { ...w, isOpening: false } : w)))}
            size={win.size ?? { width: 880, height: 660 }}
            onPositionChange={(pos) => setOpenAppWindows((prev) => prev.map((w) => (w.id === win.id ? { ...w, position: { ...pos, y: Math.max(32, pos.y) } } : w)))}
            onSizeChange={(size) => setOpenAppWindows((prev) => prev.map((w) => (w.id === win.id ? { ...w, size } : w)))}
            onClosingStart={() => {
              const nextApp = openAppWindows.find((w) => w.id !== win.id && !w.isMinimized)
              setFocusedAppWindowId(nextApp?.id ?? null)
              setChromeFocused(!nextApp)
            }}
            onClose={() => setOpenAppWindows((prev) => prev.filter((w) => w.id !== win.id))}
            onMinimizeStart={() => {
              const nextApp = openAppWindows.find((w) => w.id !== win.id && !w.isMinimized)
              setFocusedAppWindowId(nextApp?.id ?? null)
              setChromeFocused(!nextApp)
            }}
            onMinimize={() => setOpenAppWindows((prev) => prev.map((w) => (w.id === win.id ? { ...w, isMinimizing: true } : w)))}
            onMinimizeComplete={() => setOpenAppWindows((prev) => prev.map((w) => (w.id === win.id ? { ...w, isMinimized: true, isMinimizing: false } : w)))}
            onMaximize={() => setOpenAppWindows((prev) => prev.map((w) => (w.id === win.id ? { ...w, isMaximized: !w.isMaximized } : w)))}
            isMaximized={win.isMaximized}
            isMinimized={win.isMinimized}
            isMinimizing={win.isMinimizing}
            isFocused={focusedAppWindowId === win.id}
            onFocus={() => { setFocusedAppWindowId(win.id); setChromeFocused(false) }}
          >
            <AppErrorBoundary>
              <Suspense fallback={null}>{content}</Suspense>
            </AppErrorBoundary>
          </AppWindow>
        )
      })}
      {showShutdown && (
        <div
          className="chrome-landing__shutdown"
          role="dialog"
          aria-label="Shutting down"
        >
          <div className="chrome-landing__shutdown-inner" />
        </div>
      )}
      {chromeContextMenu && (
        <ChromeContextMenu
          x={chromeContextMenu.x}
          y={chromeContextMenu.y}
          currentUrl={chromeContextMenu.url}
          onClose={() => setChromeContextMenu(null)}
          onOpenInNewTab={() => {}}
          onRefresh={handleRefresh}
        />
      )}
    </div>
    </DesktopBackgroundProvider>
    </MusicPlayerProvider>
  )
}
