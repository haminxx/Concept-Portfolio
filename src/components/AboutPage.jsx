import { useRef } from 'react'

import { AboutGlassCursor } from '@/components/ui/about-glass-cursor'
import { CursorRevealAbout } from '@/components/ui/cursor-reveal-about'

import './AboutPage.css'

export default function AboutPage() {
  const pageRef = useRef(null)

  return (
    <div ref={pageRef} className="about-page h-full w-full overflow-hidden">
      <CursorRevealAbout />
      <AboutGlassCursor containerRef={pageRef} />
    </div>
  )
}
