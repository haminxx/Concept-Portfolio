import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  { value: 'study-case', label: 'Study Case' },
]

/** @typedef {'all' | 'hackathon' | 'side' | 'study-case'} ProjectFilter */

export default function ProjectPage({
  restoredProjectId = null,
  onProjectNavigate,
  onProjectBack,
}) {
  const scrollRef = useRef(null)
  /** @type {[ProjectFilter, import('react').Dispatch<import('react').SetStateAction<ProjectFilter>>]} */
  const [filter, setFilter] = useState('all')
  const [selectedProjectId, setSelectedProjectId] = useState(restoredProjectId)

  useEffect(() => {
    setSelectedProjectId(restoredProjectId)
  }, [restoredProjectId])

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
      const project = getChromeProjectById(projectId)
      setSelectedProjectId(projectId)
      resetScroll()
      if (project) {
        onProjectNavigate?.(project.title, { projectId })
      }
    },
    [resetScroll, onProjectNavigate]
  )

  const handleBack = useCallback(() => {
    setSelectedProjectId(null)
    resetScroll()
    onProjectBack?.()
  }, [resetScroll, onProjectBack])

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
          ) : projects.length === 0 ? (
            <div key={`empty-${filter}`} className="projects-page__empty">
              <p className="projects-page__empty-title">Coming soon</p>
              <p className="projects-page__empty-note">No study cases to show just yet.</p>
            </div>
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
