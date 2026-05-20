import { ChevronRight, Search } from 'lucide-react'
import projects from '../data/appStoreTodayProjects.json'
import './AppStoreWindow.css'

const DEFAULT_LINK = 'https://github.com/haminxx'

const ICON_STYLES = {
  clarte: { from: '#1a1a2e', to: '#4a4e69' },
  fitout: { from: '#2d3436', to: '#636e72' },
  coro: { from: '#0f0c29', to: '#302b63' },
}

function getProjectLink(project) {
  if (typeof project.url === 'string' && project.url.trim()) return project.url.trim()
  if (typeof project.link === 'string' && project.link.trim()) return project.link.trim()
  return DEFAULT_LINK
}

function AppIcon({ project }) {
  const style = ICON_STYLES[project.id] ?? { from: '#3d3d3d', to: '#8e8e93' }
  const letter = project.title.charAt(0).toUpperCase()

  return (
    <div
      className="app-store-window__icon"
      style={{ background: `linear-gradient(145deg, ${style.from}, ${style.to})` }}
      aria-hidden
    >
      <span>{letter}</span>
    </div>
  )
}

function AppListItem({ project }) {
  const link = getProjectLink(project)

  return (
    <article className="app-store-window__list-item">
      <AppIcon project={project} />
      <div className="app-store-window__list-body">
        <h3 className="app-store-window__list-title">{project.title}</h3>
        <p className="app-store-window__list-desc">{project.subtitle}</p>
      </div>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="app-store-window__get-btn"
      >
        Open
      </a>
    </article>
  )
}

export default function AppStoreWindow() {
  return (
    <div className="app-store-window">
      <header className="app-store-window__toolbar">
        <button type="button" className="app-store-window__search-wrap" aria-label="Search">
          <Search size={16} />
          <span className="app-store-window__search-label">Search</span>
        </button>
      </header>

      <main className="app-store-window__main">
        <div className="app-store-window__content">
          <h1 className="app-store-window__page-title">Apps</h1>

          <section className="app-store-window__hero" aria-label="Featured">
            <div className="app-store-window__hero-card">
              <div className="app-store-window__hero-glow" aria-hidden />
              <div className="app-store-window__hero-text">
                <p className="app-store-window__hero-eyebrow">Featured</p>
                <h2 className="app-store-window__hero-title">My fail notes</h2>
                <p className="app-store-window__hero-subtitle">
                  Lessons, experiments, and half-finished ideas worth revisiting.
                </p>
              </div>
            </div>
          </section>

          <section className="app-store-window__section">
            <div className="app-store-window__section-header">
              <h2 className="app-store-window__section-title">App Projects</h2>
              <ChevronRight size={20} className="app-store-window__section-chevron" aria-hidden />
            </div>
            <div className="app-store-window__list">
              {projects.map((project) => (
                <AppListItem key={project.id} project={project} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
