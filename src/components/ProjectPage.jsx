import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Dithering } from '@paper-design/shaders-react'
import { ArrowUpRight } from 'lucide-react'

import { getChromeProjectById, getProjectsByFilter } from '@/data/chromeProjects'
import { ProjectCaseStudyDetail } from '@/components/ProjectCaseStudy'
import { ProjectFilterSwitcher } from '@/components/ui/project-filter-switcher'
import './ProjectPage.css'

const FALLBACK_IMAGE = '/images/chrome-shortcuts/project.png'
const PREVIEW_WIDTH = 280
const PREVIEW_HEIGHT = 180
const PREVIEW_OFFSET_X = 20
const PREVIEW_OFFSET_Y = -100

function mapToShowcaseProjects(projects) {
  return projects.map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    year: project.year,
    link: project.link || '#',
    image: project.image || FALLBACK_IMAGE,
  }))
}

function ProjectShowcase({ isDarkMode, projects, onProjectSelect, isInteractionLocked }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef(null)
  const animationRef = useRef(null)
  const smoothPositionRef = useRef(smoothPosition)

  useEffect(() => {
    smoothPositionRef.current = smoothPosition
  }, [smoothPosition])

  useEffect(() => {
    const lerp = (start, end, factor) => start + (end - start) * factor
    const animate = () => {
      setSmoothPosition((prev) => ({
        x: lerp(prev.x, mousePosition.x, 0.15),
        y: lerp(prev.y, mousePosition.y, 0.15),
      }))
      animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [mousePosition])

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
  }

  const handleMouseEnter = (index) => {
    if (isInteractionLocked) return
    setHoveredIndex(index)
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    if (isInteractionLocked) return
    setHoveredIndex(null)
    setIsVisible(false)
  }

  const handleProjectClick = (project, index) => {
    if (isInteractionLocked) return

    const pos = smoothPositionRef.current
    const showcaseRect = containerRef.current?.getBoundingClientRect()

    if (!showcaseRect) {
      onProjectSelect?.(project.id, null)
      return
    }

    const origin = {
      x: showcaseRect.left + pos.x + PREVIEW_OFFSET_X,
      y: showcaseRect.top + pos.y + PREVIEW_OFFSET_Y,
      width: PREVIEW_WIDTH,
      height: PREVIEW_HEIGHT,
      image: project.image || FALLBACK_IMAGE,
    }

    setHoveredIndex(index)
    setIsVisible(true)
    onProjectSelect?.(project.id, origin)
  }

  const mutedText = isDarkMode ? 'text-white/55' : 'text-black/55'
  const baseText = isDarkMode ? 'text-white' : 'text-black'
  const borderColor = isDarkMode ? 'border-white/12' : 'border-black/12'
  const hoverPanel = isDarkMode ? 'bg-white/5' : 'bg-black/5'
  const previewBg = isDarkMode ? 'bg-white/10' : 'bg-black/5'

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full max-w-2xl mx-auto px-6 py-16"
    >
      <h2 className={`text-sm font-medium tracking-wide uppercase mb-8 ${mutedText}`}>
        Selected Work
      </h2>

      <div
        className="pointer-events-none absolute left-0 top-0 z-50 overflow-hidden rounded-xl shadow-2xl"
        style={{
          transform: `translate3d(${smoothPosition.x + PREVIEW_OFFSET_X}px, ${smoothPosition.y + PREVIEW_OFFSET_Y}px, 0)`,
          opacity: isVisible && !isInteractionLocked ? 1 : 0,
          scale: isVisible && !isInteractionLocked ? 1 : 0.8,
          transition:
            'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), scale 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className={`relative w-[280px] h-[180px] rounded-xl overflow-hidden ${previewBg}`}>
          {projects.map((project, index) => (
            <img
              key={project.title}
              src={project.image || FALLBACK_IMAGE}
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out"
              style={{
                opacity: hoveredIndex === index ? 1 : 0,
                scale: hoveredIndex === index ? 1 : 1.1,
                filter: hoveredIndex === index ? 'none' : 'blur(10px)',
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      </div>

      <div className="space-y-0">
        {projects.map((project, index) => {
          const isHovered = hoveredIndex === index
          return (
            <button
              type="button"
              key={project.id ?? project.title}
              className="group block w-full text-left cursor-pointer"
              onClick={() => handleProjectClick(project, index)}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              disabled={isInteractionLocked}
            >
              <div className={`relative py-5 border-t transition-all duration-300 ease-out ${borderColor}`}>
                <div
                  className={`absolute inset-0 -mx-4 px-4 rounded-lg transition-all duration-300 ease-out ${hoverPanel} ${
                    isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center gap-2">
                      <h3 className={`font-medium text-lg tracking-tight ${baseText}`}>
                        <span className="relative">
                          {project.title}
                          <span
                            className={`absolute left-0 -bottom-0.5 h-px transition-all duration-300 ease-out ${
                              isDarkMode ? 'bg-white' : 'bg-black'
                            } ${isHovered ? 'w-full' : 'w-0'}`}
                          />
                        </span>
                      </h3>
                      <ArrowUpRight
                        className={`w-4 h-4 transition-all duration-300 ease-out ${mutedText} ${
                          isHovered
                            ? 'opacity-100 translate-x-0 translate-y-0'
                            : 'opacity-0 -translate-x-2 translate-y-2'
                        }`}
                      />
                    </div>
                    <p
                      className={`text-sm mt-1 leading-relaxed transition-all duration-300 ease-out ${
                        isHovered ? baseText : mutedText
                      }`}
                    >
                      {project.description}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-mono tabular-nums transition-all duration-300 ease-out ${mutedText}`}
                  >
                    {project.year}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
        <div className={`border-t ${borderColor}`} />
      </div>
    </section>
  )
}

export default function ProjectPage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [expandOrigin, setExpandOrigin] = useState(null)
  const [pageBounds, setPageBounds] = useState(null)
  const [caseStudyPhase, setCaseStudyPhase] = useState('idle')
  const pageRef = useRef(null)
  const scrollRef = useRef(null)
  const caseStudyPhaseRef = useRef(caseStudyPhase)

  useEffect(() => {
    caseStudyPhaseRef.current = caseStudyPhase
  }, [caseStudyPhase])

  const projects = useMemo(
    () => mapToShowcaseProjects(getProjectsByFilter(filter)),
    [filter]
  )

  const ditheringColors = useMemo(
    () => ({
      colorBack: isDarkMode ? 'hsl(0, 0%, 0%)' : 'hsl(0, 0%, 95%)',
      colorFront: isDarkMode ? 'hsl(320, 100%, 70%)' : 'hsl(220, 100%, 70%)',
    }),
    [isDarkMode]
  )

  const selectedProject = useMemo(
    () => (selectedProjectId ? getChromeProjectById(selectedProjectId) : null),
    [selectedProjectId]
  )

  const isCaseStudyActive = caseStudyPhase !== 'idle'
  const showCaseStudyContent = caseStudyPhase === 'open'

  const readPageBounds = useCallback(() => {
    const pageEl = pageRef.current
    if (!pageEl) {
      return { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight }
    }
    const rect = pageEl.getBoundingClientRect()
    return { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
  }, [])

  useLayoutEffect(() => {
    if (!isCaseStudyActive) return undefined

    const updateBounds = () => setPageBounds(readPageBounds())
    updateBounds()
    window.addEventListener('resize', updateBounds)
    return () => window.removeEventListener('resize', updateBounds)
  }, [isCaseStudyActive, readPageBounds])

  const handleFilterChange = (nextFilter) => {
    setFilter(nextFilter)
    setSelectedProjectId(null)
    setExpandOrigin(null)
    setPageBounds(null)
    setCaseStudyPhase('idle')
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }

  const handleBackToList = () => {
    setCaseStudyPhase('closing')
  }

  const finishClose = () => {
    setSelectedProjectId(null)
    setExpandOrigin(null)
    setPageBounds(null)
    setCaseStudyPhase('idle')
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }

  const handleProjectSelect = (projectId, origin) => {
    setPageBounds(readPageBounds())
    setSelectedProjectId(projectId)
    setExpandOrigin(origin)
    setCaseStudyPhase('expanding')
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }

  const handleExpandComplete = () => {
    if (caseStudyPhaseRef.current === 'expanding') {
      setCaseStudyPhase('open')
    }
  }

  const handleCloseComplete = () => {
    if (caseStudyPhaseRef.current === 'closing') {
      finishClose()
    }
  }

  const mutedText = isDarkMode ? 'text-white/55' : 'text-black/55'
  const baseText = isDarkMode ? 'text-white' : 'text-black'

  const expandFrom = expandOrigin ?? {
    x: pageBounds?.x ?? 0,
    y: pageBounds?.y ?? 0,
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
  }

  const expandTransition = {
    duration: 0.55,
    ease: [0.4, 0, 0.2, 1],
  }

  return (
    <div
      ref={pageRef}
      className="projects-page relative h-full overflow-hidden flex"
      data-theme={isDarkMode ? 'dark' : 'light'}
    >
      <div
        className={`flex-[2] min-w-0 h-full flex flex-col overflow-hidden font-mono relative z-10 ${
          isDarkMode ? 'bg-black text-white' : 'bg-white text-black'
        }`}
      >
        <header
          className={`projects-page__header flex-shrink-0 border-b ${
            isDarkMode ? 'border-white/12' : 'border-black/12'
          }`}
        >
          <div className="projects-page__header-filter">
            <ProjectFilterSwitcher
              value={filter}
              onValueChange={handleFilterChange}
              isDarkMode={isDarkMode}
            />
          </div>
          <button
            onClick={() => setIsDarkMode((prev) => !prev)}
            className={`flex-shrink-0 p-2 rounded-full transition-colors ${
              isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'
            }`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </header>

        <div ref={scrollRef} className="projects-page__scroll flex-1 min-h-0">
          {projects.length === 0 ? (
            <div className="projects-page__empty">
              <p className={`projects-page__empty-title ${baseText}`}>Coming soon</p>
              <p className={`projects-page__empty-note ${mutedText}`}>
                No study cases to show just yet.
              </p>
            </div>
          ) : (
            <ProjectShowcase
              key={filter}
              isDarkMode={isDarkMode}
              projects={projects}
              onProjectSelect={handleProjectSelect}
              isInteractionLocked={isCaseStudyActive}
            />
          )}
        </div>
      </div>

      <div
        className={`flex-[1] min-w-0 h-full relative overflow-hidden transition-opacity duration-300 ${
          isCaseStudyActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-hidden={isCaseStudyActive}
      >
        <Dithering
          style={{ height: '100%', width: '100%' }}
          colorBack={ditheringColors.colorBack}
          colorFront={ditheringColors.colorFront}
          shape="cat"
          type="4x4"
          pxSize={3}
          offsetX={0}
          offsetY={0}
          scale={0.8}
          rotation={0}
          speed={0.1}
        />
      </div>

      <AnimatePresence>
        {isCaseStudyActive && selectedProject && pageBounds ? (
          <motion.div
            key="case-study-overlay"
            className={`projects-page__case-study-overlay ${
              isDarkMode ? 'projects-page__case-study-overlay--dark' : 'projects-page__case-study-overlay--light'
            }`}
            style={{ position: 'absolute' }}
            initial={{
              left: expandFrom.x - pageBounds.x,
              top: expandFrom.y - pageBounds.y,
              width: expandFrom.width,
              height: expandFrom.height,
              borderRadius: 12,
            }}
            animate={
              caseStudyPhase === 'closing'
                ? {
                    left: expandFrom.x - pageBounds.x,
                    top: expandFrom.y - pageBounds.y,
                    width: expandFrom.width,
                    height: expandFrom.height,
                    borderRadius: 12,
                    opacity: 0,
                  }
                : {
                    left: 0,
                    top: 0,
                    width: pageBounds.width,
                    height: pageBounds.height,
                    borderRadius: 0,
                    opacity: 1,
                  }
            }
            exit={{
              opacity: 0,
              transition: { duration: 0.25 },
            }}
            transition={expandTransition}
            onAnimationComplete={() => {
              if (caseStudyPhase === 'expanding') handleExpandComplete()
              if (caseStudyPhase === 'closing') handleCloseComplete()
            }}
          >
            {expandOrigin?.image ? (
              <motion.img
                src={expandOrigin.image}
                alt=""
                aria-hidden
                className="projects-page__case-study-expand-image"
                initial={{ opacity: 1 }}
                animate={{ opacity: showCaseStudyContent ? 0 : 1 }}
                transition={{ duration: 0.35, delay: showCaseStudyContent ? 0 : 0 }}
              />
            ) : null}

            <motion.div
              className="projects-page__case-study-inner"
              initial={{ opacity: 0 }}
              animate={{ opacity: showCaseStudyContent ? 1 : 0 }}
              transition={{ duration: 0.35, delay: showCaseStudyContent ? 0.1 : 0 }}
            >
              <ProjectCaseStudyDetail
                project={selectedProject}
                onBack={handleBackToList}
                isDarkMode={isDarkMode}
                fullscreen
                showContent={showCaseStudyContent}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
