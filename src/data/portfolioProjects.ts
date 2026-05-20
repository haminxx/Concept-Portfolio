import type { Project } from '@/components/ui/project-showcase'
import {
  getProjectCounts,
  getProjectsByFilter,
  type ProjectFilter,
} from './chromeProjects'

export type { ProjectFilter }
export { getProjectCounts, getProjectsByFilter }

/** Portfolio projects for ProjectShowcase — defaults to the All tab list. */
export function getPortfolioProjects(): Project[] {
  return getProjectsByFilter('all')
}
