import { ArrowUpRight } from 'lucide-react'

import { HoverPeek } from '@/components/ui/hover-peek'

export interface Project {
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
  portalContainer?: HTMLElement | null
}

export function ProjectShowcase({
  projects: projectsProp,
  portalContainer,
}: ProjectShowcaseProps) {
  const projects = projectsProp?.length ? projectsProp : DEFAULT_PROJECTS

  return (
    <section className="project-showcase relative w-full px-6 py-12 text-foreground sm:px-10 sm:py-16">
      <h2 className="mb-8 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Selected work
      </h2>

      <div className="space-y-0">
        {projects.map((project) => (
          <HoverPeek
            key={project.title}
            url={project.link}
            isStatic
            imageSrc={project.image}
            peekWidth={200}
            peekHeight={130}
            positionAboveCursor
            portalContainer={portalContainer}
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
        ))}

        <div className="border-t border-border" />
      </div>
    </section>
  )
}
