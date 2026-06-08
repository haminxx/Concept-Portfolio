import { useState } from 'react'
import { BookOpen, LayoutGrid, Rocket, Sparkles } from 'lucide-react'

import { DISPLACEMENT_MAP_HREF } from './project-filter-switcher-map'
import './project-filter-switcher.css'

const FILTER_OPTIONS = [
  {
    value: 'all',
    label: 'All',
    cOption: '1',
    Icon: LayoutGrid,
  },
  {
    value: 'side',
    label: 'Side Project',
    cOption: '2',
    Icon: Sparkles,
  },
  {
    value: 'hackathon',
    label: 'Hackathon',
    cOption: '3',
    Icon: Rocket,
  },
  {
    value: 'study-case',
    label: 'Case Study',
    cOption: '4',
    Icon: BookOpen,
  },
]

export function ProjectFilterSwitcher({
  defaultValue = 'all',
  value,
  onValueChange,
  isDarkMode = true,
  className = '',
}) {
  const switcherFilterId = 'project-filter-switcher'
  const togglerFilterId = 'project-filter-toggler'
  const inputName = 'project-filter'

  const [internalValue, setInternalValue] = useState(defaultValue)
  const [previousCOption, setPreviousCOption] = useState(
    FILTER_OPTIONS.find((option) => option.value === (value ?? defaultValue))?.cOption ?? null
  )

  const activeValue = value ?? internalValue

  const handleChange = (nextValue) => {
    const currentOption = FILTER_OPTIONS.find((option) => option.value === activeValue)?.cOption
    setPreviousCOption(currentOption ?? null)

    if (onValueChange) {
      onValueChange(nextValue)
    } else {
      setInternalValue(nextValue)
    }
  }

  const themeClass = isDarkMode ? 'switcher--dark' : 'switcher--light'

  return (
    <fieldset
      className={`switcher project-filter-switcher ${themeClass} ${className}`.trim()}
      data-previous={previousCOption ?? undefined}
      data-active={activeValue}
    >
      <legend className="switcher__legend">Filter projects by category</legend>

      {FILTER_OPTIONS.map((option) => {
        const Icon = option.Icon
        return (
          <label key={option.value} className="switcher__option" title={option.label}>
            <input
              className="switcher__input"
              type="radio"
              name={inputName}
              value={option.value}
              checked={activeValue === option.value}
              onChange={() => handleChange(option.value)}
              aria-label={option.label}
              {...{ 'c-option': option.cOption }}
            />
            <Icon className="switcher__icon" strokeWidth={2} aria-hidden />
            <span className="switcher__label">{option.label}</span>
          </label>
        )
      })}

      <div className="switcher__filter" aria-hidden>
        <svg>
          <filter id={switcherFilterId} primitiveUnits="objectBoundingBox">
            <feImage
              result="map"
              width="100%"
              height="100%"
              x="0"
              y="0"
              href={DISPLACEMENT_MAP_HREF}
            />
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.04" result="blur" />
            <feDisplacementMap
              in="blur"
              in2="map"
              scale="0.5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          <filter id={togglerFilterId} primitiveUnits="objectBoundingBox">
            <feImage
              result="map"
              width="100%"
              height="100%"
              x="0"
              y="0"
              href={DISPLACEMENT_MAP_HREF}
            />
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.01" result="blur" />
            <feDisplacementMap
              in="blur"
              in2="map"
              scale="0.5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>
      </div>
    </fieldset>
  )
}
