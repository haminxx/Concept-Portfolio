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
  'tiktok-travel-hub': [
    { value: '12', label: 'User testers', sub: 'College students who use short-form video for discovery' },
    { value: '3', label: 'Prototype iterations', sub: 'From reply browsing to destination guides' },
  ],
}

const CASE_STUDY_CONTENT = {
  'tiktok-travel-hub': {
    tagline: 'Helping TikTok Users Explore Travel Content',
    subtitle:
      'A UX case study about turning TikTok travel searches into organized destination guides.',
    quote:
      'Travelers, international students, and new visitors need a faster way to find useful destination information because current short-form video search makes them piece together advice from scattered videos.',
    role: 'UX Case Study · Team project',
    sections: [
      {
        title: 'Overview',
        body: 'TikTok already has travel content, but it is scattered across search results, hashtags, and algorithm recommendations. I designed a Cultural Travel Hub that helps users search a destination, read quick travel notes, filter by categories, scan videos in a grid, and open full-screen TikTok videos.',
      },
      {
        title: 'Problem',
        body: 'Many people already use TikTok to search for travel ideas, food spots, local tips, and cultural content. However, this information is often scattered across random videos, hashtags, search results, and algorithm recommendations—making it hard to quickly understand a place before traveling, studying abroad, or moving somewhere new.',
      },
      {
        title: 'Project Pivot',
        body: 'This project started as a TikTok video reply browsing feature, but feedback showed that the idea was too broad and mostly focused on engagement. We shifted toward a more specific problem: helping people understand a destination before they travel, study abroad, or move somewhere new.',
      },
      {
        title: 'User Research',
        body: 'We tested the prototype with college students who use short-form video platforms or online tools to search for information. We asked how they find travel tips, what information they want before going somewhere new, and whether they preferred text summaries, video grids, or full-screen videos.',
      },
      {
        title: 'Team',
        body: 'Nicholas Campos, Ran Ji, Chris Davies, and Chuck Davies — extending TikTok with a Cultural Travel Hub for travelers, international students, and new visitors exploring destinations through organized short-form video guides.',
      },
    ],
  },
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
  const extra = CASE_STUDY_CONTENT[full.id]

  return {
    id: full.id,
    quote: extra?.quote ?? getProjectDetails(full),
    name: full.title,
    role: extra?.role ?? tags[0] ?? getCategoryLabel(full.category),
    category: full.category,
    image: full.image,
    year: full.year,
    link: full.link,
    metrics,
    tagline: extra?.tagline ?? null,
    subtitle: extra?.subtitle ?? null,
    sections: extra?.sections ?? [],
  }
}

export function buildCaseStudies(projects) {
  return projects.map((project) => buildCaseStudy(project))
}
