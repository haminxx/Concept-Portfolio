import { useRef } from 'react'

import { AboutLiquidCursor } from '@/components/ui/about-liquid-cursor'

import './AboutPage.css'

export default function AboutPage() {
  const pageRef = useRef(null)

  return (
    <div ref={pageRef} className="about-page" aria-label="About">
      <AboutLiquidCursor boundsRef={pageRef} size={52} />
    </div>
  )
}
