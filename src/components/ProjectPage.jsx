import { ProjectShowcase } from '@/components/ui/project-showcase'
import { getPortfolioProjects } from '@/data/portfolioProjects'
import './ProjectPage.css'

const portfolioProjects = getPortfolioProjects()

export default function ProjectPage() {
  return (
    <div className="projects-page">
      <div className="projects-page__scroll">
        <div className="projects-page__main">
          <ProjectShowcase projects={portfolioProjects} />
        </div>
      </div>
    </div>
  )
}
