import { useEffect, useState } from 'react'
import CountUp from 'react-countup'
import { ArrowLeft, ArrowUpRight, Layers, Sparkles, Trophy } from 'lucide-react'

import { buildCaseStudies, buildCaseStudy } from '@/data/projectCaseStudies'

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(mediaQuery.matches)
    update()
    mediaQuery.addEventListener('change', update)
    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  return prefersReducedMotion
}

function parseMetricValue(raw) {
  const trimmed = String(raw).trim()
  const match = trimmed.match(/^([<>=~]?)([\d,]+(?:\.\d+)?)(.*)$/)

  if (!match) {
    return { prefix: '', end: 0, suffix: trimmed, decimals: 0 }
  }

  const [, prefix, numStr, suffix] = match
  const end = parseFloat(numStr.replace(/,/g, ''))
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0

  return { prefix, end, suffix, decimals }
}

function CategoryIcon({ category, className }) {
  switch (category) {
    case 'hackathon':
      return <Trophy className={className} aria-hidden />
    case 'side':
      return <Layers className={className} aria-hidden />
    default:
      return <Sparkles className={className} aria-hidden />
  }
}

function themeClasses(isDarkMode) {
  return {
    muted: isDarkMode ? 'text-white/55' : 'text-black/55',
    base: isDarkMode ? 'text-white' : 'text-black',
    ring: isDarkMode ? 'ring-white/12' : 'ring-black/12',
    quoteBg: isDarkMode ? 'bg-white/5' : 'bg-black/5',
    backHover: isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/10',
    linkHover: isDarkMode ? 'hover:text-white' : 'hover:text-black',
  }
}

function MetricStat({ value, label, sub, isDarkMode, prefersReducedMotion, inView }) {
  const { prefix, end, suffix, decimals } = parseMetricValue(value)
  const theme = themeClasses(isDarkMode)

  return (
    <div className="space-y-1">
      <p className={`text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums ${theme.base}`}>
        {prefersReducedMotion || !inView ? (
          value
        ) : (
          <>
            {prefix}
            <CountUp end={end} duration={2.2} decimals={decimals} enableScrollSpy scrollSpyOnce />
            {suffix}
          </>
        )}
      </p>
      <p className={`text-sm font-medium ${theme.base}`}>{label}</p>
      <p className={`text-xs leading-relaxed ${theme.muted}`}>{sub}</p>
    </div>
  )
}

function CaseStudyItem({ item, index, isDarkMode, prefersReducedMotion }) {
  const reversed = index % 2 === 1
  const theme = themeClasses(isDarkMode)

  return (
    <article
      className={`grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start py-10 ${
        index > 0 ? `border-t ${isDarkMode ? 'border-white/12' : 'border-black/12'}` : ''
      }`}
    >
      <div
        className={`lg:col-span-2 space-y-6 ${reversed ? 'lg:order-2' : 'lg:order-1'}`}
      >
        <div
          className={`relative overflow-hidden rounded-2xl ring-1 ${theme.ring} transition-transform duration-500 ease-out hover:scale-[1.02]`}
        >
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="aspect-[16/10] w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        </div>

        <blockquote className={`rounded-2xl p-5 sm:p-6 ${theme.quoteBg}`}>
          <div className="mb-4 flex items-center gap-2">
            <span
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
                isDarkMode ? 'bg-white/10' : 'bg-black/5'
              }`}
            >
              <CategoryIcon category={item.category} className={`h-4 w-4 ${theme.muted}`} />
            </span>
            <span className={`text-xs font-medium uppercase tracking-wide ${theme.muted}`}>
              Case study
            </span>
          </div>
          <p className={`text-base sm:text-lg leading-relaxed ${theme.base}`}>{item.quote}</p>
          <footer className={`mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1 ${theme.muted}`}>
            <cite className={`not-italic font-medium ${theme.base}`}>{item.name}</cite>
            <span aria-hidden>·</span>
            <span className="text-sm">{item.role}</span>
            {item.year ? (
              <>
                <span aria-hidden>·</span>
                <span className="font-mono text-xs tabular-nums">{item.year}</span>
              </>
            ) : null}
          </footer>
        </blockquote>
      </div>

      <div
        className={`flex flex-col justify-center gap-10 py-2 ${
          reversed ? 'lg:order-1' : 'lg:order-2'
        }`}
      >
        {item.metrics.slice(0, 2).map((metric) => (
          <MetricStat
            key={`${item.id}-${metric.label}`}
            value={metric.value}
            label={metric.label}
            sub={metric.sub}
            isDarkMode={isDarkMode}
            prefersReducedMotion={prefersReducedMotion}
            inView
          />
        ))}
      </div>
    </article>
  )
}

export function ProjectCaseStudyList({ projects, isDarkMode }) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const caseStudies = buildCaseStudies(projects)
  const theme = themeClasses(isDarkMode)

  if (caseStudies.length === 0) return null

  return (
    <section className="w-full max-w-2xl mx-auto px-6 py-10 sm:py-12">
      <h2 className={`text-sm font-medium tracking-wide uppercase mb-2 ${theme.muted}`}>
        Case Studies
      </h2>
      <p className={`text-sm leading-relaxed mb-6 ${theme.muted}`}>
        Deep dives into selected builds—process, constraints, and outcomes.
      </p>
      {caseStudies.map((item, index) => (
        <CaseStudyItem
          key={item.id}
          item={item}
          index={index}
          isDarkMode={isDarkMode}
          prefersReducedMotion={prefersReducedMotion}
        />
      ))}
    </section>
  )
}

export function ProjectCaseStudyDetail({ project, onBack, isDarkMode }) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const item = buildCaseStudy(project)
  const theme = themeClasses(isDarkMode)
  const externalLink = item.link?.startsWith('http') ? item.link : null

  return (
    <section className="w-full max-w-2xl mx-auto px-6 py-8 sm:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors ${theme.muted} ${theme.backHover} ${theme.linkHover}`}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to projects
        </button>
        {externalLink ? (
          <a
            href={externalLink}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-1.5 text-sm transition-colors ${theme.muted} ${theme.linkHover}`}
          >
            View project
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
        ) : null}
      </div>

      <CaseStudyItem
        item={item}
        index={0}
        isDarkMode={isDarkMode}
        prefersReducedMotion={prefersReducedMotion}
      />
    </section>
  )
}
