import { useEffect, useRef, useState } from 'react'

import { ProjectShowcase } from '@/components/ui/project-showcase'
import { getPortfolioProjects } from '@/data/portfolioProjects'
import './ProjectPage.css'

const portfolioProjects = getPortfolioProjects()

export default function ProjectPage() {
  const pageRef = useRef(null)
  const [portalContainer, setPortalContainer] = useState(null)

  useEffect(() => {
    setPortalContainer(pageRef.current)
  }, [])

  return (
    <div ref={pageRef} className="projects-page">
      <div className="projects-page__scroll">
        <div className="projects-page__main">
          <ProjectShowcase
            projects={portfolioProjects}
            portalContainer={portalContainer}
          />
        </div>
      </div>
    </div>
  )
}
