import { ArrowUpRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import { HoverPeek } from '@/components/ui/hover-peek'

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
  /** Resolves portal mount target when the preview opens. */
  portalContainer?: HTMLElement | null | (() => HTMLElement | null)
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
  portalContainer,
}: ProjectShowcaseProps) {
  const projects = projectsProp?.length ? projectsProp : DEFAULT_PROJECTS
  const portalTarget =
    typeof portalContainer === 'function' ? portalContainer() : portalContainer

  return (
    <section className="project-showcase relative w-full px-6 pb-12 pt-4 text-foreground sm:px-10 sm:pb-16 sm:pt-6">
      <h2 className="mb-8 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Selected work
      </h2>

      <div className="space-y-0">
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
              <HoverPeek
                url={project.link}
                isStatic
                imageSrc={project.image}
                peekWidth={200}
                peekHeight={130}
                positionAboveCursor
                enableMouseFollow={false}
                enableLensEffect={false}
                portalContainer={portalTarget}
              >
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="relative border-t border-border py-5 transition-all duration-300 ease-out">
                    <div className="absolute inset-0 -mx-4 scale-95 rounded-lg bg-secondary/50 px-4 opacity-0 transition-all duration-300 ease-out group-hover:scale-100 group-hover:opacity-100" />

                    <div className="relative flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="inline-flex items-center gap-2">
                          <h3 className="text-lg font-medium tracking-tight text-foreground">
                            <span className="relative">
                              {project.title}
                              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-foreground transition-all duration-300 ease-out group-hover:w-full" />
                            </span>
                          </h3>

                          <ArrowUpRight className="h-4 w-4 -translate-x-2 translate-y-2 text-muted-foreground opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                        </div>

                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground transition-all duration-300 ease-out group-hover:text-foreground/70">
                          {project.description}
                        </p>
                      </div>

                      <span className="font-mono text-xs tabular-nums text-muted-foreground transition-all duration-300 ease-out group-hover:text-foreground/60">
                        {project.year}
                      </span>
                    </div>
                  </div>
                </a>
              </HoverPeek>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="border-t border-border" />
      </div>
    </section>
  )
}
