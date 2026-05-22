import { useRef } from 'react'

import { AboutLiquidCursor } from '@/components/ui/about-liquid-cursor'
import { ParallaxAbout } from '@/components/ui/parallax-about'

import './AboutPage.css'

export default function AboutPage() {
  const pageRef = useRef(null)
  const scrollRef = useRef(null)

  return (
    <div ref={pageRef} className="about-page" aria-label="About">
      <div ref={scrollRef} className="about-page__scroll">
        <ParallaxAbout scrollRef={scrollRef} />
      </div>
      <AboutLiquidCursor boundsRef={pageRef} portalRef={pageRef} size={52} />
    </div>
  )
}
