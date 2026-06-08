import {
  getCategoryLabel,
  getChromeProjectById,
  getProjectDetails,
  getProjectTags,
} from '@/data/chromeProjects'

const PROJECT_METRICS = {
  clover: [
    { value: '<2s', label: 'Capture time', sub: 'From thought to saved note' },
    { value: '40%', label: 'Less visual noise', sub: 'Drawer metaphor vs dashboard clutter' },
  ],
  forma: [
    { value: '48h', label: 'Build window', sub: 'Whiteboard to clickable demo' },
    { value: '3.5x', label: 'Layout speed', sub: 'Snap grid vs manual wireframes' },
  ],
  quarte: [
    { value: '4', label: 'Decision axes', sub: 'Impact, effort, risk, and delight' },
    { value: '90%', label: 'Room alignment', sub: 'Live voting during hackathon pitches' },
  ],
  kine: [
    { value: '60fps', label: 'Motion target', sub: 'GPU-friendly transforms on drag' },
    { value: '12', label: 'Interaction demos', sub: 'Springs, fling, and scrub prototypes' },
  ],
  akashic: [
    { value: '10k+', label: 'Graph nodes', sub: 'Fragments linked by references' },
    { value: '2x', label: 'Recall speed', sub: 'Fuzzy search across tags and neighbors' },
  ],
  stash: [
    { value: '500+', label: 'Saved items', sub: 'Links, screenshots, and snippets' },
    { value: '85%', label: 'Recall hit rate', sub: 'Command-palette search accuracy' },
  ],
  los: [
    { value: '6', label: 'Agent surfaces', sub: 'Scoped windows with history stacks' },
    { value: '3x', label: 'Workflow reuse', sub: 'Composable recipes exported as flows' },
  ],
  clarte: [
    { value: '<400ms', label: 'Voice loop', sub: 'Low-latency STT/TTS with barge-in' },
    { value: '3', label: 'Dialogue frames', sub: 'Clarify, challenge, and synthesize' },
  ],
  fitout: [
    { value: '92%', label: 'Visual match', sub: 'Garment similarity from embeddings' },
    { value: '1-thumb', label: 'Capture flow', sub: 'Mobile-first outfit posting UX' },
  ],
}

const DEFAULT_METRICS = [
  { value: '100%', label: 'Scope delivered', sub: 'Portfolio-scale vertical slice shipped' },
  { value: '3', label: 'Build phases', sub: 'Frame, prototype, and iterate in public' },
]

/**
 * @param {{ id: string } | import('@/data/chromeProjects').ChromeProject} project
 */
export function buildCaseStudy(project) {
  const full = getChromeProjectById(project.id) ?? project
  const metrics = PROJECT_METRICS[full.id] ?? DEFAULT_METRICS
  const tags = getProjectTags(full)

  return {
    id: full.id,
    quote: getProjectDetails(full),
    name: full.title,
    role: tags[0] ?? getCategoryLabel(full.category),
    category: full.category,
    image: full.image,
    year: full.year,
    link: full.link,
    metrics,
  }
}

export function buildCaseStudies(projects) {
  return projects.map((project) => buildCaseStudy(project))
}
