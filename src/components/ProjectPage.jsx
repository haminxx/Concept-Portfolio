import { useMemo } from 'react'
import { motion } from 'framer-motion'

import { useDesktopBackground } from '../context/DesktopBackgroundContext'
import { foregroundOnSolid } from '../lib/colorUtils'
import {
  GANTT_MONTH_LABELS,
  GANTT_PROJECTS,
  getGanttProjectById,
} from '../data/projectGantt'
import ProjectDetailPage from './ProjectDetailPage'
import './ProjectPage.css'

const DEFAULT_PROJECTS_BG = '#f5f5f0'
const DEFAULT_MESH_COLOR1 = '#1a1a1a'
const DEFAULT_MESH_COLOR2 = '#000000'

function resolveProjectsBackground(color1, color2) {
  const isDefaultMesh =
    color1 === DEFAULT_MESH_COLOR1 && color2 === DEFAULT_MESH_COLOR2
  return isDefaultMesh ? DEFAULT_PROJECTS_BG : color2
}

function monthSpanPercent(startMonth, endMonth) {
  const span = Math.max(1, endMonth - startMonth + 1)
  return {
    left: `${(startMonth / 12) * 100}%`,
    width: `${(span / 12) * 100}%`,
  }
}

/**
 * @param {{
 *   selectedProjectId?: string | null
 *   onProjectNavigate?: (project: import('../data/projectGantt').GanttProject) => void
 * }} props
 */
export default function ProjectPage({ selectedProjectId = null, onProjectNavigate }) {
  const { color1, color2 } = useDesktopBackground()
  const backgroundColor = useMemo(
    () => resolveProjectsBackground(color1, color2),
    [color1, color2],
  )
  const barFg = useMemo(() => foregroundOnSolid(backgroundColor), [backgroundColor])
  const tone = barFg === '#f5f5f7' ? 'dark' : 'light'
  const selectedProject = selectedProjectId
    ? getGanttProjectById(selectedProjectId)
    : null

  if (selectedProject) {
    return (
      <div
        className="projects-page"
        data-tone={tone}
        style={{ '--projects-bg': backgroundColor, '--projects-fg': barFg }}
        aria-label={`${selectedProject.title} project`}
      >
        <ProjectDetailPage project={selectedProject} />
      </div>
    )
  }

  return (
    <div
      className="projects-page"
      data-tone={tone}
      style={{ '--projects-bg': backgroundColor, '--projects-fg': barFg }}
      aria-label="Projects timeline"
    >
      <div className="projects-page__scroll">
        <div className="projects-gantt">
          <header className="projects-gantt__header">
            <span className="projects-gantt__corner" aria-hidden="true" />
            {GANTT_MONTH_LABELS.map((label) => (
              <span key={label} className="projects-gantt__month">
                {label}
              </span>
            ))}
          </header>

          <div className="projects-gantt__body">
            {GANTT_PROJECTS.map((project, index) => {
              const geometry = monthSpanPercent(project.startMonth, project.endMonth)
              const fromLeft = index % 2 === 0

              return (
                <div key={project.id} className="projects-gantt__row">
                  <div className="projects-gantt__track">
                    <motion.button
                      type="button"
                      className="projects-gantt__bar"
                      style={geometry}
                      initial={{
                        opacity: 0,
                        x: fromLeft ? '-110%' : '110%',
                      }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.55,
                        delay: index * 0.07,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      onClick={() => onProjectNavigate?.(project)}
                      aria-label={`${project.title}: ${project.description}`}
                    >
                      <span className="projects-gantt__bar-title">{project.title}</span>
                      <span className="projects-gantt__bar-desc">{project.description}</span>
                    </motion.button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
