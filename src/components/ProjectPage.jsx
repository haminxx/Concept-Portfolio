import { useEffect, useMemo, useRef, useState } from 'react'
import { Dithering } from '@paper-design/shaders-react'
import { ArrowUpRight } from 'lucide-react'

import { getProjectsByFilter } from '@/data/chromeProjects'
import { ProjectFilterSwitcher } from '@/components/ui/project-filter-switcher'
import './ProjectPage.css'

const FALLBACK_IMAGE = '/images/chrome-shortcuts/project.png'

function mapToShowcaseProjects(projects) {
  return projects.map((project) => ({
    title: project.title,
    description: project.description,
    year: project.year,
    link: project.link || '#',
    image: project.image || FALLBACK_IMAGE,
  }))
}

function ProjectShowcase({ isDarkMode, projects }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef(null)
  const animationRef = useRef(null)

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
    setHoveredIndex(index)
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setHoveredIndex(null)
    setIsVisible(false)
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
          transform: `translate3d(${smoothPosition.x + 20}px, ${smoothPosition.y - 100}px, 0)`,
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? 1 : 0.8,
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
            <a
              key={project.title}
              href={project.link}
              target={project.link?.startsWith('http') ? '_blank' : undefined}
              rel={project.link?.startsWith('http') ? 'noreferrer' : undefined}
              className="group block"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
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
            </a>
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
  const [isFilterFloating, setIsFilterFloating] = useState(false)
  const scrollRef = useRef(null)

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

  useEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return undefined

    const onScroll = () => {
      setIsFilterFloating(scrollEl.scrollTop > 20)
    }

    onScroll()
    scrollEl.addEventListener('scroll', onScroll, { passive: true })
    return () => scrollEl.removeEventListener('scroll', onScroll)
  }, [])

  const handleFilterChange = (nextFilter) => {
    setFilter(nextFilter)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }

  const mutedText = isDarkMode ? 'text-white/55' : 'text-black/55'
  const baseText = isDarkMode ? 'text-white' : 'text-black'

  return (
    <div className="projects-page relative h-full overflow-hidden flex">
      <div
        className={`flex-[2] min-w-0 h-full flex flex-col overflow-hidden font-mono relative z-10 ${
          isDarkMode ? 'bg-black text-white' : 'bg-white text-black'
        }`}
      >
        <header
          className={`flex-shrink-0 flex items-center justify-end px-6 py-4 border-b ${
            isDarkMode ? 'border-white/12' : 'border-black/12'
          }`}
        >
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
          <div
            className={`projects-page__filter-anchor ${
              isFilterFloating ? 'projects-page__filter-anchor--floating' : ''
            }`}
            data-theme={isDarkMode ? 'dark' : 'light'}
          >
            <div className="projects-page__filter-card">
              <ProjectFilterSwitcher
                value={filter}
                onValueChange={handleFilterChange}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="projects-page__empty">
              <p className={`projects-page__empty-title ${baseText}`}>Coming soon</p>
              <p className={`projects-page__empty-note ${mutedText}`}>
                No study cases to show just yet.
              </p>
            </div>
          ) : (
            <ProjectShowcase key={filter} isDarkMode={isDarkMode} projects={projects} />
          )}
        </div>
      </div>

      <div className="flex-[1] min-w-0 h-full relative overflow-hidden">
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
    </div>
  )
}
