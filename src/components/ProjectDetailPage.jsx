/**
 * @param {{
 *   project: import('@/data/projectGantt').GanttProject
 * }} props
 */
export default function ProjectDetailPage({ project }) {
  return (
    <article className="projects-detail" aria-label={`${project.title} details`}>
      <p className="projects-detail__placeholder">Project page coming soon</p>
    </article>
  )
}
