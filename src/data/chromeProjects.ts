import type { Project } from '@/components/ui/project-showcase'

export type ProjectCategory = 'hackathon' | 'side' | 'all'
export type ProjectFilter = 'all' | 'hackathon' | 'side' | 'study-case'

export interface ProcessStep {
  title: string
  description: string
}

export interface ChromeProject extends Project {
  id: string
  category: ProjectCategory
  tags?: string[]
  details?: string
  process?: ProcessStep[]
}

const DEFAULT_LINK = 'https://github.com/haminxx'

const DEFAULT_PROCESS: ProcessStep[] = [
  {
    title: 'Frame the problem',
    description: 'Define scope, constraints, and what “done” looks like for a portfolio-scale build.',
  },
  {
    title: 'Prototype fast',
    description: 'Ship a thin vertical slice—layout, motion, and one happy path—before polishing edge cases.',
  },
  {
    title: 'Iterate in public',
    description: 'Refine interaction, performance, and copy based on real usage inside the Chrome desktop metaphor.',
  },
]

/** Canonical project records — category + showcase metadata. */
const CHROME_PROJECTS: ChromeProject[] = [
  {
    id: 'clover',
    title: 'Clover',
    description:
      'A lightweight productivity shell for notes, links, and daily context—organized like a desk drawer, not a dashboard.',
    details:
      'Clover treats personal context as physical objects: notes stack, links clip together, and search feels like rifling through a drawer. The UI stays minimal so adding a thought never competes with organizing one.',
    year: '2024',
    link: DEFAULT_LINK,
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop',
    category: 'side',
    tags: ['Side projects'],
    process: [
      { title: 'Desk metaphor', description: 'Mapped CRUD flows to “place, clip, stack” instead of tables and modals.' },
      { title: 'Local-first drafts', description: 'Autosave and offline-friendly storage before syncing optional cloud backup.' },
      { title: 'Keyboard paths', description: 'Power shortcuts for capture, search, and jump between contexts.' },
    ],
  },
  {
    id: 'forma',
    title: 'Forma',
    description:
      'Hackathon build for spatial UI prototyping—sketch layouts, snap components, and export flows in minutes.',
    details:
      'Built for a 48-hour sprint: Forma lets teams sketch spatial UI, snap primitives, and export a shareable flow without leaving the canvas. The goal was speed from whiteboard to clickable demo.',
    year: '2025',
    link: 'https://github.com/haminxx/Forma',
    image:
      'https://images.unsplash.com/photo-1558655146-d09347e92766?w=1200&auto=format&fit=crop',
    category: 'hackathon',
    tags: ['Hack-a-thon'],
    process: [
      { title: '48h scope', description: 'One canvas, drag-and-drop blocks, and export—no auth or collaboration v1.' },
      { title: 'Snap grid', description: 'Magnetic alignment and spacing tokens so layouts stay consistent under pressure.' },
      { title: 'Demo export', description: 'JSON + preview link so judges could open flows without installing tooling.' },
    ],
  },
  {
    id: 'quarte',
    title: 'Quarte',
    description:
      'Four-quadrant decision board for hackathon teams—compare options, vote live, and ship a clear narrative.',
    details:
      'Quarte structures team decisions into four quadrants—impact, effort, risk, and delight—so debates become visible artifacts instead of endless threads. Live voting keeps the room aligned during pitches.',
    year: '2025',
    link: DEFAULT_LINK,
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop',
    category: 'hackathon',
    tags: ['Hack-a-thon'],
    process: [
      { title: 'Quadrant model', description: 'Fixed axes so every idea lands in the same coordinate system.' },
      { title: 'Live votes', description: 'Realtime tallies with optimistic UI for crowded hackathon rooms.' },
      { title: 'Narrative export', description: 'One-page summary slide for judges: top picks and dissent notes.' },
    ],
  },
  {
    id: 'kine',
    title: 'Kine',
    description:
      'Motion-first interface experiments—gesture cues, spring physics, and tactile feedback for creative tools.',
    details:
      'Kine explores how motion communicates affordance: springs, drag thresholds, and micro-feedback that make creative tools feel physical without skeuomorphic chrome.',
    year: '2024',
    link: 'https://github.com/haminxx/Kine',
    image:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop',
    category: 'side',
    tags: ['Side projects'],
    process: [
      { title: 'Motion vocabulary', description: 'Shared spring configs and gesture thresholds across components.' },
      { title: 'Prototype gallery', description: 'Isolated demos for drag, fling, and scrub interactions.' },
      { title: 'Perf budget', description: 'GPU-friendly transforms; avoid layout thrash on pointer move.' },
    ],
  },
  {
    id: 'akashic',
    title: 'Akashic',
    description:
      'Personal knowledge graph for fragments, references, and half-formed ideas—searchable memory for side quests.',
    details:
      'Akashic links fragments—quotes, screenshots, half-sentences—into a searchable graph. Backlinks and loose tagging replace rigid folders for creative side quests.',
    year: '2024',
    link: 'https://github.com/haminxx/Akashic',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&auto=format&fit=crop',
    category: 'all',
    tags: ['Side projects', 'Hack-a-thon'],
    process: [
      { title: 'Graph primitives', description: 'Nodes for snippets; edges for “references” and “continues”.' },
      { title: 'Fuzzy recall', description: 'Search across body text, tags, and connected neighbors.' },
      { title: 'Capture surfaces', description: 'Browser clipper and quick-add for low-friction ingestion.' },
    ],
  },
  {
    id: 'stash',
    title: 'Stash',
    description:
      'Save-for-later layer for links, screenshots, and snippets—tagged collections with quick recall.',
    details:
      'Stash is a save-for-later layer with tagged collections, full-text recall, and screenshot snippets—built for researchers who hoard tabs guilt-free.',
    year: '2024',
    link: 'https://github.com/haminxx/Stash',
    image:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop',
    category: 'side',
    tags: ['Side projects'],
    process: [
      { title: 'Ingest pipeline', description: 'Normalize URLs, titles, and previews on save.' },
      { title: 'Tag facets', description: 'Multi-tag filters with recent and pinned collections.' },
      { title: 'Recall UI', description: 'Command-palette search with keyboard-first navigation.' },
    ],
  },
  {
    id: 'los',
    title: 'L.O.S (Latent Operating System)',
    description:
      'Latent Operating System—desktop metaphor for AI agents, latent state, and composable workflows.',
    details:
      'L.O.S experiments with a desktop metaphor for agents: windows as tasks, latent state as files, and composable workflows you can rearrange like apps on a dock.',
    year: '2025',
    link: 'https://github.com/haminxx/LatheOS',
    image:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop',
    category: 'side',
    tags: ['Side projects'],
    process: [
      { title: 'Agent windows', description: 'Each agent runs in a scoped surface with its own history stack.' },
      { title: 'Latent state', description: 'Serializable context blobs passed between tools and panes.' },
      { title: 'Composable flows', description: 'Drag-and-chain steps; export as reproducible recipes.' },
    ],
  },
  {
    id: 'clarte',
    title: 'Clarte',
    description:
      'Socratic voice AI agent—a structured cognitive framework for guided dialogue that asks the next right question.',
    details:
      'Clarte is a voice-first Socratic agent: it listens, reflects, and asks the next right question using a structured cognitive framework instead of open-ended chit-chat.',
    year: '2025',
    link: DEFAULT_LINK,
    image:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop',
    category: 'hackathon',
    tags: ['Hack-a-thon'],
    process: [
      { title: 'Dialogue frames', description: 'Prompt templates for clarify → challenge → synthesize loops.' },
      { title: 'Voice loop', description: 'Low-latency STT/TTS with barge-in and pause detection.' },
      { title: 'Safety rails', description: 'Topic boundaries and escalation for sensitive threads.' },
    ],
  },
  {
    id: 'fitout',
    title: 'FITOUT',
    description:
      'Visual search fashion social—identify clothing via image search and build a social layer around outfits.',
    details:
      'FITOUT combines visual search with a social layer: snap an outfit, find similar pieces, and share fits—bridging discovery and expression for fashion hobbyists.',
    year: '2024',
    link: DEFAULT_LINK,
    image:
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&auto=format&fit=crop',
    category: 'side',
    tags: ['Side projects'],
    process: [
      { title: 'Visual search', description: 'Embedding pipeline for garment similarity and near-duplicate detection.' },
      { title: 'Social feed', description: 'Outfit posts, likes, and lightweight profiles without heavy onboarding.' },
      { title: 'Mobile-first UX', description: 'Camera capture flow optimized for one-thumb use.' },
    ],
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

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  hackathon: 'Hack-a-thon',
  side: 'Side projects',
  all: 'Featured',
}

export function getCategoryLabel(category: ProjectCategory): string {
  return CATEGORY_LABELS[category] ?? 'Project'
}

export function getChromeProjectById(id: string): ChromeProject | undefined {
  return projectById.get(id)
}

export function getProjectProcess(project: ChromeProject): ProcessStep[] {
  if (project.process?.length) return project.process
  return DEFAULT_PROCESS
}

export function getProjectDetails(project: ChromeProject): string {
  return project.details ?? project.description
}

export function getProjectTags(project: ChromeProject): string[] {
  if (project.tags?.length) return project.tags
  if (project.category === 'hackathon') return ['Hack-a-thon']
  if (project.category === 'side') return ['Side projects']
  if (project.category === 'all') return ['Side projects', 'Hack-a-thon']
  return [getCategoryLabel(project.category)]
}

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
    'study-case': 0,
  }
}

export function getProjectsByFilter(filter: ProjectFilter): Project[] {
  switch (filter) {
    case 'hackathon':
      return orderProjects(HACKATHON_TAB_ORDER)
    case 'side':
      return orderProjects(SIDE_TAB_ORDER)
    case 'study-case':
      // No study cases yet — intentionally empty.
      return []
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
