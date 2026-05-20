import { AnimatePresence, motion } from 'motion/react'

import { BlogCard } from '@/components/ui/blog-card'

export interface Project {
  id?: string
  title: string
  description: string
  year: string
  link: string
  image: string
}

export const DEFAULT_PROJECTS: Project[] = [
  {
    title: 'Portfolio OS',
    description: 'Chrome-style portfolio with dock, windows, shaders, and lazy-loaded apps.',
    year: '2025',
    link: 'https://github.com/haminxx',
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop',
  },
  {
    title: 'Creative UI Lab',
    description: 'Interactive components, glass effects, and motion-driven landing experiments.',
    year: '2024',
    link: 'https://github.com/haminxx',
    image:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop',
  },
  {
    title: 'Data & Maps',
    description: 'Leaflet heatmaps and location storytelling inside the desktop metaphor.',
    year: '2024',
    link: 'https://github.com/haminxx',
    image:
      'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&auto=format&fit=crop',
  },
  {
    title: 'Media & Play',
    description: 'Embedded experiences: music, gallery, and retro games in the dock.',
    year: '2023',
    link: 'https://github.com/haminxx',
    image:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop',
  },
]

type ProjectShowcaseProps = {
  projects?: Project[]
  filterKey?: string
}

const listItemVariants = {
  initial: { opacity: 0, y: 28 },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.36,
      ease: [0.22, 1, 0.36, 1] as const,
      delay: index * 0.05,
    },
  }),
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.24, ease: 'easeIn' as const },
  },
}

export function ProjectShowcase({
  projects: projectsProp,
  filterKey = 'all',
}: ProjectShowcaseProps) {
  const projects = projectsProp?.length ? projectsProp : DEFAULT_PROJECTS

  return (
    <section className="projects-page__list">
      <AnimatePresence mode="popLayout" initial={false}>
        {projects.map((project, index) => (
          <motion.div
            key={`${filterKey}-${project.id ?? project.title}`}
            layout
            custom={index}
            variants={listItemVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <BlogCard
              title={project.title}
              date={project.year}
              description={project.description}
              href={project.link}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </section>
  )
}
