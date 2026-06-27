export interface GanttProject {
  id: string
  title: string
  /** Inclusive month index 0–11 (Jan–Dec). */
  startMonth: number
  /** Inclusive month index 0–11 (Jan–Dec). */
  endMonth: number
  /** Shown inside the bar on hover. */
  description: string
}

/** Eight timeline rows for the Chrome Projects Gantt (calendar year). */
export const GANTT_PROJECTS: GanttProject[] = [
  {
    id: 'clover',
    title: 'Clover',
    startMonth: 0,
    endMonth: 3,
    description:
      'A lightweight productivity shell for notes, links, and daily context—organized like a desk drawer.',
  },
  {
    id: 'forma',
    title: 'Forma',
    startMonth: 2,
    endMonth: 4,
    description:
      'Hackathon build for spatial UI prototyping—sketch layouts, snap components, and export flows.',
  },
  {
    id: 'quarte',
    title: 'Quarte',
    startMonth: 1,
    endMonth: 2,
    description:
      'Four-quadrant decision board for hackathon teams—compare options and vote live.',
  },
  {
    id: 'kine',
    title: 'Kine',
    startMonth: 4,
    endMonth: 7,
    description:
      'Motion-first interface experiments—gesture cues, spring physics, and tactile feedback.',
  },
  {
    id: 'akashic',
    title: 'Akashic',
    startMonth: 3,
    endMonth: 6,
    description:
      'Personal knowledge graph for fragments, references, and half-formed ideas.',
  },
  {
    id: 'stash',
    title: 'Stash',
    startMonth: 6,
    endMonth: 9,
    description:
      'Save-for-later layer for links, screenshots, and snippets with quick recall.',
  },
  {
    id: 'los',
    title: 'L.O.S',
    startMonth: 8,
    endMonth: 11,
    description:
      'Latent Operating System—desktop metaphor for AI agents and composable workflows.',
  },
  {
    id: 'clarte',
    title: 'Clarte',
    startMonth: 5,
    endMonth: 8,
    description:
      'Socratic voice AI agent—a structured cognitive framework for guided dialogue.',
  },
]

export const GANTT_MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

export function getGanttProjectById(id: string): GanttProject | undefined {
  return GANTT_PROJECTS.find((project) => project.id === id)
}
