import appStoreProjects from './appStoreTodayProjects.json'
import type { Project } from '@/components/ui/project-showcase'

const PROJECT_YEARS: Record<string, string> = {
  clarte: '2025',
  fitout: '2024',
  coro: '2024',
}

const PROJECT_IMAGES: Record<string, string> = {
  clarte:
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop',
  fitout:
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&auto=format&fit=crop',
  coro:
    'https://images.unsplash.com/photo-1511379938549-c8f694198822?w=1200&auto=format&fit=crop',
}

const DEFAULT_LINK = 'https://github.com/haminxx'

/** Portfolio projects from App Store / Today data, shaped for ProjectShowcase. */
export function getPortfolioProjects(): Project[] {
  return appStoreProjects.map((p) => {
    const image =
      typeof p.image === 'string' && p.image.trim().length > 0
        ? p.image.trim()
        : (PROJECT_IMAGES[p.id] ?? PROJECT_IMAGES.clarte)

    const link =
      typeof (p as { url?: string; link?: string }).url === 'string' &&
      (p as { url?: string }).url!.trim().length > 0
        ? (p as { url: string }).url.trim()
        : typeof (p as { link?: string }).link === 'string' &&
            (p as { link?: string }).link!.trim().length > 0
          ? (p as { link: string }).link.trim()
          : DEFAULT_LINK

    return {
      title: p.title,
      description: p.description || p.subtitle,
      year: PROJECT_YEARS[p.id] ?? '2024',
      link,
      image,
    }
  })
}
