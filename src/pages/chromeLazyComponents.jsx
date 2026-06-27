import { lazyWithRetry } from '../lib/lazyWithRetry'

/** Code-split heavy app / tab bodies so the initial landing bundle stays smaller. */
export const LazyInstagramWindow = lazyWithRetry(() => import('../components/InstagramWindow'))
export const LazyMapWindow = lazyWithRetry(() => import('../components/MapWindow'))
export const LazyDoomWindow = lazyWithRetry(() => import('../components/DoomWindow'))
export const LazyDadNMeWindow = lazyWithRetry(() => import('../components/DadNMeWindow'))
export const LazyNetflixWindow = lazyWithRetry(() => import('../components/NetflixWindow'))
export const LazyYouTubeMusicWindow = lazyWithRetry(() => import('../components/YouTubeMusicWindow'))
export const LazySettingsWindow = lazyWithRetry(() => import('../components/SettingsWindow'))
export const LazyAppStoreWindow = lazyWithRetry(() => import('../components/AppStoreWindow'))
export const LazyGalleryWindow = lazyWithRetry(() => import('../components/GalleryWindow'))
export const LazyFaceTimeWindow = lazyWithRetry(() => import('../components/FaceTimeWindow'))
export const LazyFinderWindow = lazyWithRetry(() => import('../components/FinderWindow'))
export const LazyNotesWindow = lazyWithRetry(() => import('../components/NotesWindow'))
export const LazyNotionCalendarWindow = lazyWithRetry(() => import('../components/NotionCalendarWindow'))
export const LazyTetrisWindow = lazyWithRetry(() => import('../components/TetrisWindow'))
