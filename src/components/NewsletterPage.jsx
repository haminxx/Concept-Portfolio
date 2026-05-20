import { useEffect, useRef, useState } from 'react'
import { DynamicIslandTOC } from '@/components/ui/dynamic-island-toc'
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon'
import { RevealImageList } from '@/components/ui/reveal-images'
import './NewsletterPage.css'

const editions = [
  {
    id: 'building-in-public',
    title: 'Building in public feels like shipping a tiny OS every week.',
    dateLabel: '2:30 PM · Mon, 12 May 2025',
    eyebrow: 'Issue #01 · May 2025',
    headline: 'Building in Public',
    subtitle: 'Notes from designing a portfolio that feels like an operating system.',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&auto=format&fit=crop&q=60',
        alt: 'Developer at laptop',
      },
      {
        src: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&auto=format&fit=crop&q=60',
        alt: 'Code on screen',
      },
    ],
    sections: [
      {
        type: 'paragraph',
        text: 'Welcome to the first edition of this newsletter — a short, scrollable letter about the ideas behind this site. Each issue covers what I shipped, what broke, and what I learned while treating a personal portfolio like a product.',
      },
      { type: 'h2', text: 'Why a desktop metaphor?' },
      {
        type: 'paragraph',
        text: 'Most portfolios are linear: hero, projects, contact. I wanted visitors to explore — open Chrome, poke around apps, and discover work at their own pace. The desktop metaphor turns browsing into play without hiding the substance.',
      },
      { type: 'callout', text: 'The Chrome window is the front door. Shortcuts to About, Newsletter, Projects, and Contact live on the new-tab page, just like pinned bookmarks.' },
      { type: 'h3', text: 'Small details, big feel' },
      {
        type: 'paragraph',
        text: 'Window chrome, draggable tabs, and dock icons are not decoration. They set expectations: this site is crafted, responsive, and a little whimsical. The goal is delight that still loads fast and works on mobile.',
      },
      {
        type: 'h2',
        text: 'The stack behind the scenes: React, Vite, Firebase, and motion',
        tocTitle: 'Stack & tooling',
      },
      {
        type: 'paragraph',
        text: 'The long heading above is shortened in the table of contents thanks to data-toc-title. Under the hood: React 19, Vite, Tailwind, and Firebase Hosting. Motion powers micro-interactions like this Dynamic Island TOC.',
      },
      { type: 'h3', text: 'Performance choices' },
      {
        type: 'paragraph',
        text: 'Heavy windows are lazy-loaded so the first paint stays lean. Map, Netflix, and game embeds only download when you open them — the desktop should feel instant.',
      },
      { type: 'h4', text: 'What is next' },
      {
        type: 'paragraph',
        text: 'More app windows, richer About content, and deeper project case studies. If something here sparks an idea for your own site, reply via the Contact tab — I read every message.',
      },
      {
        type: 'feature',
        title: 'Featured: Portfolio OS',
        tocTitle: 'Featured project',
        text: 'This highlighted block is a custom TOC entry using data-toc on a non-heading element — useful when a section is more than a single line of title.',
      },
      {
        type: 'paragraph',
        text: 'Thanks for reading. Scroll back up or tap the island at the bottom to jump between sections. The progress ring tracks how far you have made it through this issue.',
      },
    ],
  },
  {
    id: 'motion-micro-interactions',
    title: 'Motion should explain state, not decorate every pixel.',
    dateLabel: '9:15 AM · Thu, 24 Apr 2025',
    eyebrow: 'Issue #02 · Apr 2025',
    headline: 'Motion as Meaning',
    subtitle: 'How micro-interactions guide attention without slowing the page.',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=60',
        alt: 'Retro tech aesthetic',
      },
      {
        src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60',
        alt: 'Abstract gradient shapes',
      },
    ],
    sections: [
      {
        type: 'paragraph',
        text: 'This issue is about restraint. Every animation on the portfolio answers a question: where did that window go, what is active, what can I click next?',
      },
      { type: 'h2', text: 'Spring vs tween' },
      {
        type: 'paragraph',
        text: 'Springs feel physical — great for dock magnification and island expansion. Tweens feel precise — better for sidebars, opacity fades, and progress rings. Mixing both keeps the UI lively without feeling chaotic.',
      },
      { type: 'callout', text: 'Rule of thumb: if the motion communicates layout change, keep duration under 500ms and ease out aggressively.' },
      { type: 'h3', text: 'Reduced motion' },
      {
        type: 'paragraph',
        text: 'Respecting prefers-reduced-motion is non-negotiable. The site should remain fully usable with transitions turned off — motion is enhancement, not the interface itself.',
      },
      {
        type: 'h2',
        text: 'Case study: Dynamic Island table of contents',
        tocTitle: 'Dynamic Island TOC',
      },
      {
        type: 'paragraph',
        text: 'The island collapses reading progress, current section, and navigation into one control. Expanding it reveals the full outline without leaving the article — a pattern borrowed from long-form apps, adapted for a contained Chrome tab.',
      },
      { type: 'h4', text: 'Takeaway' },
      {
        type: 'paragraph',
        text: 'Ship motion only when it reduces cognitive load. If you cannot explain what an animation communicates in one sentence, cut it.',
      },
    ],
  },
  {
    id: 'lazy-loading-wins',
    title: 'Lazy loading heavy embeds kept first paint under two seconds.',
    dateLabel: '4:45 PM · Wed, 9 Apr 2025',
    eyebrow: 'Issue #03 · Apr 2025',
    headline: 'Lazy Loading Wins',
    subtitle: 'Why the desktop loads fast even with maps, games, and video.',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&auto=format&fit=crop&q=60',
        alt: 'Analytics dashboard',
      },
      {
        src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&auto=format&fit=crop&q=60',
        alt: 'Performance metrics',
      },
    ],
    sections: [
      {
        type: 'paragraph',
        text: 'A portfolio with embedded games and streaming apps sounds heavy. In practice, code-splitting and lazy routes mean visitors only pay for what they open.',
      },
      { type: 'h2', text: 'Route-level splits' },
      {
        type: 'paragraph',
        text: 'Chrome tabs load their content on demand. Newsletter, About, and project pages are separate chunks — the new-tab experience stays lean.',
      },
      { type: 'h3', text: 'Window-level splits' },
      {
        type: 'paragraph',
        text: 'MapLibre, js-dos, and media players initialize after their window mounts. Closing a tab drops listeners and frees memory where possible.',
      },
      {
        type: 'feature',
        title: 'Featured: Bundle budget',
        tocTitle: 'Bundle budget',
        text: 'Each new window gets a rough KB budget before merge. If a dependency blows the budget, it ships behind a user gesture or a lighter fallback.',
      },
      { type: 'h2', text: 'Measuring in production' },
      {
        type: 'paragraph',
        text: 'Firebase Hosting plus Vite build reports keep an eye on chunk sizes. Real devices on slow networks remain the final judge — Lighthouse is a guide, not a grade.',
      },
    ],
  },
  {
    id: 'chrome-as-canvas',
    title: 'Chrome is the canvas — tabs are chapters, not routes.',
    dateLabel: '11:00 AM · Fri, 21 Mar 2025',
    eyebrow: 'Issue #04 · Mar 2025',
    headline: 'Chrome as Canvas',
    subtitle: 'Designing a browser frame that feels native inside a portfolio.',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=200&auto=format&fit=crop&q=60',
        alt: 'Mobile browser mockup',
      },
      {
        src: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=200&auto=format&fit=crop&q=60',
        alt: 'Design workspace',
      },
    ],
    sections: [
      {
        type: 'paragraph',
        text: 'Framing content inside Chrome does more than look clever — it sets a contract. Users know how to close tabs, go home, and open bookmarks. Familiar chrome lowers the learning curve.',
      },
      { type: 'h2', text: 'Tabs as navigation' },
      {
        type: 'paragraph',
        text: 'Each pinned shortcut on the new-tab page is a doorway. Draggable tabs reinforce that these are parallel spaces, not a single scrolling résumé.',
      },
      { type: 'callout', text: 'The address bar doubles as context — it shows where you are in the site without exposing raw URLs on every view.' },
      { type: 'h3', text: 'Mobile compromises' },
      {
        type: 'paragraph',
        text: 'On small screens the frame simplifies: fewer draggable affordances, larger touch targets, and scroll regions that respect nested overflow.',
      },
      { type: 'h2', text: 'Newsletter inside Chrome', tocTitle: 'Newsletter tab' },
      {
        type: 'paragraph',
        text: 'Long-form reading lives in a tab with its own scroll container and table of contents. The sidebar you are using now lists past editions — pick one to swap the article without leaving the browser metaphor.',
      },
    ],
  },
  {
    id: 'design-system-notes',
    title: 'A loose design system beats a perfect Figma file nobody opens.',
    dateLabel: '6:20 PM · Tue, 4 Mar 2025',
    eyebrow: 'Issue #05 · Mar 2025',
    headline: 'Design System Notes',
    subtitle: 'Tokens, spacing, and when to break the rules on purpose.',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&auto=format&fit=crop&q=60',
        alt: 'Color swatches',
      },
      {
        src: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=200&auto=format&fit=crop&q=60',
        alt: 'UI design review',
      },
    ],
    sections: [
      {
        type: 'paragraph',
        text: 'This site mixes CSS modules, Tailwind utilities, and one-off window chrome. The system is intentionally pragmatic: shared tokens where they matter, bespoke styling where personality matters.',
      },
      { type: 'h2', text: 'Color and contrast' },
      {
        type: 'paragraph',
        text: 'Dark desktop chrome contrasts with light in-window content — Newsletter included. Scoped CSS variables keep Tailwind semantic classes readable inside each surface.',
      },
      { type: 'h3', text: 'Typography' },
      {
        type: 'paragraph',
        text: 'System UI fonts keep load times down and match the OS metaphor. Headings get weight and tracking adjustments per context — article, window title, or dock label.',
      },
      {
        type: 'h2',
        text: 'Components live in ui/, windows stay bespoke',
        tocTitle: 'Component boundaries',
      },
      {
        type: 'paragraph',
        text: 'Reusable pieces — buttons, TOC island, reveal lists — live under components/ui. Each app window keeps its own layout because the metaphor matters as much as reuse.',
      },
      { type: 'h4', text: 'Closing thought' },
      {
        type: 'paragraph',
        text: 'Document decisions in issues like this one. Future you will forget why the newsletter sidebar slides instead of fades — write it down while it is fresh.',
      },
    ],
  },
  {
    id: 'shipping-log-april',
    title: 'April shipped: sidebar editions, island TOC, and shader tweaks.',
    dateLabel: '8:05 AM · Mon, 28 Feb 2025',
    eyebrow: 'Issue #06 · Feb 2025',
    headline: 'Shipping Log',
    subtitle: 'A quick changelog disguised as a newsletter.',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=200&auto=format&fit=crop&q=60',
        alt: 'Code editor close-up',
      },
      {
        src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=60',
        alt: 'Workspace at night',
      },
    ],
    sections: [
      {
        type: 'paragraph',
        text: 'Short and practical: what landed, what is next, and what I would do differently if I started the desktop metaphor from scratch today.',
      },
      { type: 'h2', text: 'Shipped' },
      {
        type: 'paragraph',
        text: 'Edition sidebar with hover previews, contained Dynamic Island TOC, lazy Chrome routes, and Firebase deploy pipeline wired into the workflow.',
      },
      { type: 'h3', text: 'In progress' },
      {
        type: 'paragraph',
        text: 'Richer project case studies, optional audio notes per issue, and better offline caching for repeat visitors.',
      },
      {
        type: 'feature',
        title: 'Featured: Deploy pipeline',
        tocTitle: 'Deploy pipeline',
        text: 'Build, commit, push, and firebase deploy — repeatable steps so experiments like this sidebar reach production the same day.',
      },
      { type: 'h2', text: 'If I restarted' },
      {
        type: 'paragraph',
        text: 'I would centralize z-index layers earlier and define scroll-container contracts before adding the fifth nested overflow. Lesson learned.',
      },
    ],
  },
]

function ArticleSection({ section }) {
  switch (section.type) {
    case 'h2':
      return (
        <h2 {...(section.tocTitle ? { 'data-toc-title': section.tocTitle } : {})}>
          {section.text}
        </h2>
      )
    case 'h3':
      return <h3>{section.text}</h3>
    case 'h4':
      return <h4>{section.text}</h4>
    case 'callout':
      return (
        <div className="newsletter-page__callout">
          <p>{section.text}</p>
        </div>
      )
    case 'feature':
      return (
        <div
          data-toc
          data-toc-depth="2"
          {...(section.tocTitle ? { 'data-toc-title': section.tocTitle } : {})}
          className="newsletter-page__feature"
        >
          <h3>{section.title}</h3>
          <p>{section.text}</p>
        </div>
      )
    default:
      return <p>{section.text}</p>
  }
}

export default function NewsletterPage({
  restoredEditionId = null,
  onEditionNavigate,
}) {
  const scrollRef = useRef(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeEditionId, setActiveEditionId] = useState(editions[0].id)

  useEffect(() => {
    if (restoredEditionId) {
      setActiveEditionId(restoredEditionId)
    }
  }, [restoredEditionId])

  const activeEdition = editions.find((edition) => edition.id === activeEditionId) ?? editions[0]

  const sidebarItems = editions.map((edition, index) => ({
    id: edition.id,
    title: `#${index + 1} ${edition.title}`,
    dateLabel: edition.dateLabel,
    images: edition.images,
  }))

  const handleSelectEdition = (id) => {
    const edition = editions.find((e) => e.id === id)
    setActiveEditionId(id)
    setSidebarOpen(false)
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    if (edition) {
      onEditionNavigate?.(edition.headline, { editionId: edition.id })
    }
  }

  return (
    <div className="newsletter-page">
      <button
        type="button"
        className="newsletter-page__menu-toggle"
        aria-label={sidebarOpen ? 'Close editions menu' : 'Open editions menu'}
        aria-expanded={sidebarOpen}
        onClick={() => setSidebarOpen((open) => !open)}
      >
        <MenuToggleIcon open={sidebarOpen} className="h-7 w-7" />
      </button>

      <div
        className={`newsletter-page__sidebar-backdrop${sidebarOpen ? ' newsletter-page__sidebar-backdrop--visible' : ''}`}
        aria-hidden={!sidebarOpen}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`newsletter-page__sidebar${sidebarOpen ? ' newsletter-page__sidebar--open' : ''}`}
        aria-hidden={!sidebarOpen}
      >
        <div className="newsletter-page__sidebar-inner">
          <RevealImageList
            items={sidebarItems}
            header="Editions"
            compact
            activeId={activeEditionId}
            onSelect={handleSelectEdition}
          />
        </div>
      </aside>

      <div className="newsletter-page__scroll" ref={scrollRef}>
        <main className="newsletter-page__main">
          <article className="newsletter-page__article" key={activeEditionId}>
            <header className="newsletter-page__header">
              <p className="newsletter-page__eyebrow">{activeEdition.eyebrow}</p>
              <h1>{activeEdition.headline}</h1>
              <p className="newsletter-page__subtitle">{activeEdition.subtitle}</p>
            </header>

            {activeEdition.sections.map((section, index) => (
              <ArticleSection key={`${activeEditionId}-${index}`} section={section} />
            ))}

            <hr className="newsletter-page__divider" />

            <h2 data-toc-ignore>Subscribe</h2>
            <p className="newsletter-page__subscribe-note">
              This footer uses <code>data-toc-ignore</code> so it stays out of the table of
              contents.
            </p>
            <form className="newsletter-page__subscribe" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="you@example.com" aria-label="Email address" />
              <button type="submit">Get the next issue</button>
            </form>
          </article>
        </main>
      </div>

      <DynamicIslandTOC
        key={activeEditionId}
        scrollContainerRef={scrollRef}
        contained
        selector=".newsletter-page article h1, .newsletter-page article h2, .newsletter-page article h3, .newsletter-page article h4, .newsletter-page [data-toc]"
      />
    </div>
  )
}
