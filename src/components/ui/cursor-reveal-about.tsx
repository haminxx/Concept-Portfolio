import { useCallback, useRef, type CSSProperties, type PointerEvent } from 'react'

import './cursor-reveal-about.css'

export function CursorRevealAbout() {
  const containerRef = useRef<HTMLDivElement>(null)
  const pointerActiveRef = useRef(false)
  const veilRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLParagraphElement>(null)

  const setRevealPosition = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    container.style.setProperty('--reveal-x', `${x}px`)
    container.style.setProperty('--reveal-y', `${y}px`)
  }, [])

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      setRevealPosition(event.clientX, event.clientY)

      if (!pointerActiveRef.current) {
        pointerActiveRef.current = true
        veilRef.current?.classList.add('cursor-reveal-about__veil--active')
        hintRef.current?.style.setProperty('opacity', '0')
      }
    },
    [setRevealPosition]
  )

  const handlePointerLeave = useCallback(() => {
    pointerActiveRef.current = false
    veilRef.current?.classList.remove('cursor-reveal-about__veil--active')
    hintRef.current?.style.removeProperty('opacity')
  }, [])

  return (
    <div
      ref={containerRef}
      className="cursor-reveal-about"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        {
          '--reveal-x': '50%',
          '--reveal-y': '50%',
        } as CSSProperties
      }
    >
      <div className="cursor-reveal-about__content">
        <p className="cursor-reveal-about__eyebrow">haminxx</p>
        <h1 className="cursor-reveal-about__headline">Portfolio</h1>
        <p className="cursor-reveal-about__intro">
          Product designer and engineer building interfaces, systems, and
          experiences — from hackathon prototypes to side-project tools people
          actually use.
        </p>

        <div className="cursor-reveal-about__meta">
          <div className="cursor-reveal-about__meta-block">
            <span className="cursor-reveal-about__meta-label">Focus</span>
            <p className="cursor-reveal-about__meta-value">
              Visual design, interaction, full-stack development
            </p>
          </div>
          <div className="cursor-reveal-about__meta-block">
            <span className="cursor-reveal-about__meta-label">Currently</span>
            <p className="cursor-reveal-about__meta-value">
              Open to collaborations and freelance projects
            </p>
          </div>
        </div>
      </div>

      <div ref={veilRef} className="cursor-reveal-about__veil" aria-hidden />

      <p ref={hintRef} className="cursor-reveal-about__hint">
        Move cursor to reveal
      </p>
    </div>
  )
}

export default CursorRevealAbout
