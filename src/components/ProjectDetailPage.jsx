import { motion } from 'motion/react'

import {
  getProjectDetails,
  getProjectProcess,
  getProjectTags,
} from '@/data/chromeProjects'

const detailVariants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

/**
 * @param {{
 *   project: import('@/data/chromeProjects').ChromeProject
 *   onBack: () => void
 * }} props
 */
export default function ProjectDetailPage({ project, onBack }) {
  const tags = getProjectTags(project)
  const details = getProjectDetails(project)
  const process = getProjectProcess(project)

  return (
    <motion.article
      className="projects-detail"
      variants={detailVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <header className="projects-detail__header">
        <button type="button" className="projects-detail__back" onClick={onBack}>
          ← Back to projects
        </button>

        <div className="projects-detail__title-row">
          <h1 className="projects-detail__title">{project.title}</h1>
          <span className="projects-detail__leader" aria-hidden />
          <span className="projects-detail__year">{project.year}</span>
        </div>

        <div className="projects-detail__tags">
          {tags.map((tag) => (
            <span key={tag} className="projects-detail__tag">
              {tag}
            </span>
          ))}
        </div>
      </header>

      {project.image ? (
        <div className="projects-detail__hero">
          <img src={project.image} alt="" className="projects-detail__hero-img" loading="lazy" />
        </div>
      ) : null}

      <section className="projects-detail__section">
        <h2 className="projects-detail__section-title">Overview</h2>
        <p className="projects-detail__body">{details}</p>
        <p className="projects-detail__summary">{project.description}</p>
      </section>

      <section className="projects-detail__section">
        <h2 className="projects-detail__section-title">Work process</h2>
        <ol className="projects-detail__process">
          {process.map((step, index) => (
            <li key={`${step.title}-${index}`} className="projects-detail__process-step">
              <span className="projects-detail__process-index">{index + 1}</span>
              <div>
                <h3 className="projects-detail__process-title">{step.title}</h3>
                <p className="projects-detail__process-desc">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {project.link ? (
        <footer className="projects-detail__footer">
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="projects-detail__link"
          >
            View repository →
          </a>
        </footer>
      ) : null}
    </motion.article>
  )
}
