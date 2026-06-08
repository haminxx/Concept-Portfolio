import { useMemo, useState } from 'react'
import { ChevronLeft } from 'lucide-react'

import { useTheme } from '../context/ThemeContext'
import {
  getChromeProjectById,
  getProjectsByFilter,
} from '../data/chromeProjects'
import { ProjectFilterSwitcher } from './ui/project-filter-switcher'
import { ProjectShowcase } from './ui/project-showcase.jsx'
import './ProjectPage.css'

const DETAIL_THEME_BY_CATEGORY = {
  all: 'all',
  side: 'side',
  hackathon: 'hackathon',
  'study-case': 'study-case',
}

export default function ProjectPage() {
  const { nightMode } = useTheme()
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedProject, setSelectedProject] = useState(null)

  const projects = useMemo(() => getProjectsByFilter(activeFilter), [activeFilter])

  const handleProjectSelect = (project) => {
    const projectId = project?.id
    setSelectedProject(projectId ? getChromeProjectById(projectId) ?? project : project)
  }

  const handleFilterChange = (nextFilter) => {
    setActiveFilter(nextFilter)
    setSelectedProject(null)
  }

  const activeTheme =
    DETAIL_THEME_BY_CATEGORY[selectedProject?.category] ?? activeFilter

  return (
    <div
      className="projects-page"
      data-project-theme={activeTheme}
      aria-label="Projects"
    >
      {selectedProject ? (
        <section className="projects-page__detail" aria-label={`${selectedProject.title} details`}>
          <button
            className="projects-page__back"
            type="button"
            onClick={() => setSelectedProject(null)}
          >
            <ChevronLeft size={16} strokeWidth={2} aria-hidden />
            Back to projects
          </button>

          <div className="projects-page__detail-shell">
            <p className="projects-page__detail-kicker">Project</p>
            <h1>{selectedProject.title}</h1>
            <p>Project page coming soon</p>
          </div>
        </section>
      ) : (
        <div className="projects-page__scroll">
          <div className="projects-page__toolbar">
            <ProjectFilterSwitcher
              value={activeFilter}
              onValueChange={handleFilterChange}
              isDarkMode={nightMode}
            />
          </div>

          <ProjectShowcase
            projects={projects}
            filterKey={activeFilter}
            onProjectSelect={handleProjectSelect}
          />
        </div>
      )}
    </div>
  )
}
