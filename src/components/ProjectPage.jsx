import { useCallback, useMemo, useRef, useState } from 'react'

import { GlassSegmentedControl } from '@/components/ui/glass-segmented-control'
import { ProjectShowcase } from '@/components/ui/project-showcase'
import { getProjectsByFilter } from '@/data/chromeProjects'
import './ProjectPage.css'

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'hackathon', label: 'Hack-a-thon' },
  { value: 'side', label: 'Side projects' },
] 

/** @typedef {'all' | 'hackathon' | 'side'} ProjectFilter */

export default function ProjectPage() {
  const pageRef = useRef(null)
  /** @type {[ProjectFilter, import('react').Dispatch<import('react').SetStateAction<ProjectFilter>>]} */
  const [filter, setFilter] = useState('all')

  const projects = useMemo(() => getProjectsByFilter(filter), [filter])

  const resolvePortalContainer = useCallback(() => {
    const pageEl = pageRef.current
    if (!pageEl) return null
    return pageEl.closest('.chrome-landing') ?? document.body
  }, [])

  return (
    <div ref={pageRef} className="projects-page">
      <div className="projects-page__scroll">
        <div className="projects-page__main">
          <div className="projects-page__filters">
            <GlassSegmentedControl
              options={FILTER_OPTIONS}
              value={filter}
              onChange={setFilter}
              name="project-category"
              aria-label="Filter projects by category"
            />
          </div>

          <ProjectShowcase
            projects={projects}
            portalContainer={resolvePortalContainer}
          />
        </div>
      </div>
    </div>
  )
}
