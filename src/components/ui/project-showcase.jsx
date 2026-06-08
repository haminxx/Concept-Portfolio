import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'

const DEFAULT_PROJECTS = [
  {
    id: 'portfolio-os',
    title: 'Portfolio OS',
    description: 'Chrome-style portfolio with dock, windows, shaders, and lazy-loaded apps.',
    year: '2025',
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop',
  },
]

const listVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

const rowVariants = {
  initial: { opacity: 0, y: 24 },
  animate: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.36,
      ease: [0.22, 1, 0.36, 1],
      delay: index * 0.045,
    },
  }),
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

export function ProjectShowcase({
  projects: projectsProp,
  filterKey = 'all',
  onProjectSelect,
  className = '',
}) {
  const projects = projectsProp?.length ? projectsProp : DEFAULT_PROJECTS
  const [hoveredProject, setHoveredProject] = useState(null)
  const previewRef = useRef(null)
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })
  const frameRef = useRef(null)

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  useEffect(() => {
    if (!hoveredProject) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
      return
    }

    const animatePreview = () => {
      const preview = previewRef.current
      const target = targetRef.current
      const current = currentRef.current

      current.x += (target.x - current.x) * 0.16
      current.y += (target.y - current.y) * 0.16

      if (preview) {
        preview.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`
      }

      frameRef.current = requestAnimationFrame(animatePreview)
    }

    frameRef.current = requestAnimationFrame(animatePreview)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [hoveredProject])

  const movePreview = (event) => {
    const nextX = clamp(event.clientX + 28, 16, window.innerWidth - 304)
    const nextY = clamp(event.clientY - 92, 16, window.innerHeight - 196)
    targetRef.current = { x: nextX, y: nextY }

    if (!hoveredProject) {
      currentRef.current = { x: nextX, y: nextY }
    }
  }

  const showPreview = (project, event) => {
    movePreview(event)
    currentRef.current = targetRef.current
    setHoveredProject(project)
  }

  const hidePreview = () => {
    setHoveredProject(null)
  }

  return (
    <motion.section
      className={`project-showcase ${className}`.trim()}
      variants={listVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="project-showcase__heading">
        <p>Portfolio</p>
        <h1>Selected Work</h1>
      </div>

      <div className="project-showcase__list" onPointerMove={movePreview}>
        <AnimatePresence mode="popLayout" initial={false}>
          {projects.map((project, index) => {
            const projectId = project.id ?? project.title

            return (
              <motion.div
                key={`${filterKey}-${projectId}`}
                layout
                custom={index}
                variants={rowVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <button
                  className="project-showcase__row"
                  type="button"
                  onClick={() => onProjectSelect?.(project)}
                  onPointerEnter={(event) => showPreview(project, event)}
                  onPointerMove={movePreview}
                  onPointerLeave={hidePreview}
                >
                  <span className="project-showcase__row-main">
                    <span className="project-showcase__row-title">
                      {project.title}
                      <ArrowUpRight className="project-showcase__arrow" size={18} aria-hidden />
                    </span>
                    <span className="project-showcase__row-description">
                      {project.description}
                    </span>
                  </span>
                  <span className="project-showcase__year">{project.year}</span>
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {hoveredProject?.image ? (
          <motion.div
            ref={previewRef}
            className="project-showcase__preview"
            initial={{ opacity: 0, scale: 0.92, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={hoveredProject.image}
                src={hoveredProject.image}
                alt=""
                initial={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              />
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  )
}

