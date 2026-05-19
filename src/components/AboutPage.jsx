import { ScrollMorphHero } from '@/components/ui/scroll-morph-hero'

import './AboutPage.css'

const ABOUT_SECTIONS = [
  {
    id: 'intro',
    threshold: 0,
    title: 'The future is built on AI.',
    subtitle: 'SCROLL TO EXPLORE',
    align: 'center',
  },
  {
    id: 'vision',
    threshold: 0.2,
    title: 'Explore Our Vision',
    body: (
      <>
        Discover a world where technology meets creativity.
        <br className="hidden md:block" />
        Scroll through our curated collection of innovations designed to shape the future.
      </>
    ),
    align: 'top',
  },
  {
    id: 'craft',
    threshold: 0.3,
    title: 'Design Meets Engineering',
    body: 'Interfaces, systems, and experiences crafted with intent — from concept sketches to shipped products.',
    align: 'top',
  },
  {
    id: 'work',
    threshold: 0.6,
    title: 'Selected Work',
    body: 'Each project blends product thinking, visual design, and full-stack development into something people actually use.',
    align: 'top',
  },
  {
    id: 'connect',
    threshold: 0.9,
    title: "Let's Build Together",
    body: 'Open to collaborations, freelance projects, and conversations about what comes next.',
    align: 'top',
  },
]

export default function AboutPage() {
  return (
    <div className="about-page h-full w-full overflow-hidden">
      <ScrollMorphHero contentSections={ABOUT_SECTIONS} />
    </div>
  )
}
