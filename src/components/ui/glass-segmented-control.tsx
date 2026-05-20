import type { CSSProperties } from 'react'

import { cn } from '@/lib/utils'

import './glass-segmented-control.css'

export type GlassSegmentOption<T extends string> = {
  value: T
  label: string
}

type GlassSegmentedControlProps<T extends string> = {
  options: GlassSegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  name?: string
  className?: string
  'aria-label'?: string
}

export function GlassSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  name = 'glass-segment',
  className,
  'aria-label': ariaLabel = 'Filter projects',
}: GlassSegmentedControlProps<T>) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  )

  return (
    <div
      className={cn('glass-segmented-control', className)}
      role="radiogroup"
      aria-label={ariaLabel}
      data-active-index={activeIndex}
      style={{ '--glass-segment-count': options.length } as CSSProperties}
    >
      {options.map((option) => {
        const checked = option.value === value
        const inputId = `${name}-${option.value}`

        return (
          <div key={option.value} className="glass-segmented-control__option">
            <input
              id={inputId}
              className="glass-segmented-control__input"
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
            />
            <label htmlFor={inputId} className="glass-segmented-control__label">
              {option.label}
            </label>
          </div>
        )
      })}

      <div className="glass-segmented-control__glider" aria-hidden />
    </div>
  )
}
