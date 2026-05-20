import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { GlassSegmentedControl } from '@/components/ui/glass-segmented-control'
import { ProjectShowcase } from '@/components/ui/project-showcase'
import { getProjectsByFilter } from '@/data/chromeProjects'
import './ProjectPage.css'

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'hackathon', label: 'Hack-a-thon' },
  { value: 'side', label: 'Side projects' },
]

/** @typedef {'all' | 'hackathon' | 'side'} ProjectFilter */

function useSmoothedScroll(scrollRef) {
  useEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return undefined

    let targetScroll = scrollEl.scrollTop
    let currentScroll = scrollEl.scrollTop
    let rafId = null

    const maxScroll = () =>
      Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight)

    const tick = () => {
      const diff = targetScroll - currentScroll

      if (Math.abs(diff) < 0.5) {
        currentScroll = targetScroll
        scrollEl.scrollTop = currentScroll
        rafId = null
        return
      }

      currentScroll += diff * 0.14
      scrollEl.scrollTop = currentScroll
      rafId = requestAnimationFrame(tick)
    }

    const scheduleTick = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(tick)
      }
    }

    const onWheel = (event) => {
      event.preventDefault()
      targetScroll = Math.min(maxScroll(), Math.max(0, targetScroll + event.deltaY))
      scheduleTick()
    }

    const onScroll = () => {
      if (rafId === null) {
        targetScroll = scrollEl.scrollTop
        currentScroll = scrollEl.scrollTop
      }
    }

    scrollEl.addEventListener('wheel', onWheel, { passive: false })
    scrollEl.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      scrollEl.removeEventListener('wheel', onWheel)
      scrollEl.removeEventListener('scroll', onScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [scrollRef])
}

export default function ProjectPage() {
  const pageRef = useRef(null)
  const scrollRef = useRef(null)
  /** @type {[ProjectFilter, import('react').Dispatch<import('react').SetStateAction<ProjectFilter>>]} */
  const [filter, setFilter] = useState('all')

  const projects = useMemo(() => getProjectsByFilter(filter), [filter])

  useSmoothedScroll(scrollRef)

  const resolvePortalContainer = useCallback(() => {
    const pageEl = pageRef.current
    if (!pageEl) return null
    return pageEl.closest('.chrome-landing') ?? document.body
  }, [])

  return (
    <div ref={pageRef} className="projects-page">
      <div ref={scrollRef} className="projects-page__scroll">
        <div className="projects-page__main">
          <div className="projects-page__filters">
            <div className="projects-page__filters-glass">
              <GlassSegmentedControl
                options={FILTER_OPTIONS}
                value={filter}
                onChange={setFilter}
                name="project-category"
                aria-label="Filter projects by category"
              />
            </div>
          </div>

          <ProjectShowcase
            projects={projects}
            filterKey={filter}
            portalContainer={resolvePortalContainer}
          />
        </div>
      </div>
    </div>
  )
}
