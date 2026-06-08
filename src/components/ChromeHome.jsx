import { useRef } from 'react'
import TextCursorProximity from './ui/text-cursor-proximity'
import './ChromeHome.css'

const NAME_STYLES = {
  scale: { from: 1, to: 1.18 },
  fontWeight: { from: 600, to: 800 },
}

const SINCE_STYLES = {
  scale: { from: 1, to: 1.22 },
  fontWeight: { from: 500, to: 700 },
}

export default function ChromeHome() {
  const containerRef = useRef(null)

  return (
    <div ref={containerRef} className="chrome-home">
      {/*
        Full-bleed background video. Drop the real file at
        `public/videos/home-bg.mp4` (the user will supply it later). Until then
        the neutral dark `.chrome-home` background colour shows through, so a
        missing file degrades gracefully.
      */}
      <video
        className="chrome-home__video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        src="/videos/home-bg.mp4"
      />
      <div className="chrome-home__overlay" aria-hidden="true" />

      <div className="chrome-home__hero">
        <div className="chrome-home__name">
          <TextCursorProximity
            label="Christian"
            className="chrome-home__name-line"
            containerRef={containerRef}
            styles={NAME_STYLES}
            radius={130}
            falloff="gaussian"
          />
          <TextCursorProximity
            label="Lee"
            className="chrome-home__name-line"
            containerRef={containerRef}
            styles={NAME_STYLES}
            radius={130}
            falloff="gaussian"
          />
        </div>

        <div className="chrome-home__since">
          <TextCursorProximity
            label="Since 2003"
            className="chrome-home__since-text"
            containerRef={containerRef}
            styles={SINCE_STYLES}
            radius={90}
            falloff="gaussian"
          />
        </div>
      </div>
    </div>
  )
}
