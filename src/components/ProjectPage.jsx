import { useCallback, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'motion/react'

import ProjectDetailPage from '@/components/ProjectDetailPage'
import { GlassSegmentedControl } from '@/components/ui/glass-segmented-control'
import { ProjectShowcase } from '@/components/ui/project-showcase'
import { getChromeProjectById, getProjectsByFilter } from '@/data/chromeProjects'
import './ProjectPage.css'

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'hackathon', label: 'Hack-a-thon' },
  { value: 'side', label: 'Side projects' },
]

/** @typedef {'all' | 'hackathon' | 'side'} ProjectFilter */

export default function ProjectPage() {
  const scrollRef = useRef(null)
  /** @type {[ProjectFilter, import('react').Dispatch<import('react').SetStateAction<ProjectFilter>>]} */
  const [filter, setFilter] = useState('all')
  const [selectedProjectId, setSelectedProjectId] = useState(null)

  const projects = useMemo(() => getProjectsByFilter(filter), [filter])
  const selectedProject = useMemo(
    () => (selectedProjectId ? getChromeProjectById(selectedProjectId) : undefined),
    [selectedProjectId]
  )

  const resetScroll = useCallback(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [])

  const handleSelectProject = useCallback(
    (projectId) => {
      setSelectedProjectId(projectId)
      resetScroll()
    },
    [resetScroll]
  )

  const handleBack = useCallback(() => {
    setSelectedProjectId(null)
    resetScroll()
  }, [resetScroll])

  const handleFilterChange = useCallback(
    (nextFilter) => {
      setFilter(nextFilter)
      setSelectedProjectId(null)
      resetScroll()
    },
    [resetScroll]
  )

  const isDetail = Boolean(selectedProject)

  return (
    <div className="projects-page">
      <div ref={scrollRef} className="projects-page__scroll">
        {!isDetail ? (
          <div className="projects-page__filters">
            <GlassSegmentedControl
              options={FILTER_OPTIONS}
              value={filter}
              onChange={handleFilterChange}
              name="project-category"
              aria-label="Filter projects by category"
            />
          </div>
        ) : null}

        <AnimatePresence mode="wait" initial={false}>
          {selectedProject ? (
            <ProjectDetailPage
              key={`detail-${selectedProject.id}`}
              project={selectedProject}
              onBack={handleBack}
            />
          ) : (
            <ProjectShowcase
              key={`list-${filter}`}
              projects={projects}
              filterKey={filter}
              onSelectProject={handleSelectProject}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
