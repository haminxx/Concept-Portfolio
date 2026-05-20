import type { Project } from '@/components/ui/project-showcase'

export type ProjectCategory = 'hackathon' | 'side' | 'all'
export type ProjectFilter = 'all' | 'hackathon' | 'side'

export interface ChromeProject extends Project {
  id: string
  category: ProjectCategory
}

const DEFAULT_LINK = 'https://github.com/haminxx'

/** Canonical project records — category + showcase metadata. */
const CHROME_PROJECTS: ChromeProject[] = [
  {
    id: 'clover',
    title: 'Clover',
    description:
      'A lightweight productivity shell for notes, links, and daily context—organized like a desk drawer, not a dashboard.',
    year: '2024',
    link: DEFAULT_LINK,
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop',
    category: 'side',
  },
  {
    id: 'forma',
    title: 'Forma',
    description:
      'Hackathon build for spatial UI prototyping—sketch layouts, snap components, and export flows in minutes.',
    year: '2025',
    link: 'https://github.com/haminxx/Forma',
    image:
      'https://images.unsplash.com/photo-1558655146-d09347e92766?w=1200&auto=format&fit=crop',
    category: 'hackathon',
  },
  {
    id: 'quarte',
    title: 'Quarte',
    description:
      'Four-quadrant decision board for hackathon teams—compare options, vote live, and ship a clear narrative.',
    year: '2025',
    link: DEFAULT_LINK,
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop',
    category: 'hackathon',
  },
  {
    id: 'kine',
    title: 'Kine',
    description:
      'Motion-first interface experiments—gesture cues, spring physics, and tactile feedback for creative tools.',
    year: '2024',
    link: 'https://github.com/haminxx/Kine',
    image:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop',
    category: 'side',
  },
  {
    id: 'akashic',
    title: 'Akashic',
    description:
      'Personal knowledge graph for fragments, references, and half-formed ideas—searchable memory for side quests.',
    year: '2024',
    link: 'https://github.com/haminxx/Akashic',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&auto=format&fit=crop',
    category: 'all',
  },
  {
    id: 'stash',
    title: 'Stash',
    description:
      'Save-for-later layer for links, screenshots, and snippets—tagged collections with quick recall.',
    year: '2024',
    link: 'https://github.com/haminxx/Stash',
    image:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop',
    category: 'side',
  },
  {
    id: 'los',
    title: 'L.O.S (Latent Operating System)',
    description:
      'Latent Operating System—desktop metaphor for AI agents, latent state, and composable workflows.',
    year: '2025',
    link: 'https://github.com/haminxx/LatheOS',
    image:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop',
    category: 'side',
  },
  {
    id: 'clarte',
    title: 'Clarte',
    description:
      'Socratic voice AI agent—a structured cognitive framework for guided dialogue that asks the next right question.',
    year: '2025',
    link: DEFAULT_LINK,
    image:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop',
    category: 'hackathon',
  },
  {
    id: 'fitout',
    title: 'FITOUT',
    description:
      'Visual search fashion social—identify clothing via image search and build a social layer around outfits.',
    year: '2024',
    link: DEFAULT_LINK,
    image:
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&auto=format&fit=crop',
    category: 'side',
  },
]

const ALL_TAB_ORDER = [
  'clover',
  'forma',
  'quarte',
  'kine',
  'akashic',
  'stash',
  'los',
  'clarte',
  'fitout',
] as const

const HACKATHON_TAB_ORDER = ['forma', 'quarte', 'clarte'] as const
const SIDE_TAB_ORDER = ['fitout', 'clover', 'kine', 'stash', 'los'] as const

const projectById = new Map(CHROME_PROJECTS.map((project) => [project.id, project]))

function orderProjects(ids: readonly string[]): Project[] {
  return ids
    .map((id) => projectById.get(id))
    .filter((project): project is ChromeProject => Boolean(project))
    .map(({ id, title, description, year, link, image }) => ({
      id,
      title,
      description,
      year,
      link,
      image,
    }))
}

export function getProjectCounts(): Record<ProjectFilter, number> {
  return {
    all: ALL_TAB_ORDER.length,
    hackathon: HACKATHON_TAB_ORDER.length,
    side: SIDE_TAB_ORDER.length,
  }
}

export function getProjectsByFilter(filter: ProjectFilter): Project[] {
  switch (filter) {
    case 'hackathon':
      return orderProjects(HACKATHON_TAB_ORDER)
    case 'side':
      return orderProjects(SIDE_TAB_ORDER)
    case 'all':
    default:
      return orderProjects(ALL_TAB_ORDER)
  }
}

/** Full records including ids/categories — useful for App Store or admin views. */
export function getChromeProjects(): ChromeProject[] {
  return ALL_TAB_ORDER.map((id) => projectById.get(id)).filter(
    (project): project is ChromeProject => Boolean(project)
  )
}
