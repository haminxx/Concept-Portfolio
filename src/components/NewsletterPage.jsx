import { useRef } from 'react'
import { DynamicIslandTOC } from '@/components/ui/dynamic-island-toc'
import './NewsletterPage.css'

export default function NewsletterPage() {
  const scrollRef = useRef(null)

  return (
    <div className="newsletter-page">
      <div className="newsletter-page__scroll" ref={scrollRef}>
        <main className="newsletter-page__main">
          <article className="newsletter-page__article">
            <header className="newsletter-page__header">
              <p className="newsletter-page__eyebrow">Issue #01 · May 2026</p>
              <h1>Building in Public</h1>
              <p className="newsletter-page__subtitle">
                Notes from designing a portfolio that feels like an operating system.
              </p>
            </header>

            <p>
              Welcome to the first edition of this newsletter — a short, scrollable letter
              about the ideas behind this site. Each issue covers what I shipped, what broke,
              and what I learned while treating a personal portfolio like a product.
            </p>

            <h2>Why a desktop metaphor?</h2>
            <p>
              Most portfolios are linear: hero, projects, contact. I wanted visitors to
              explore — open Chrome, poke around apps, and discover work at their own pace.
              The desktop metaphor turns browsing into play without hiding the substance.
            </p>

            <div className="newsletter-page__callout">
              <p>
                The Chrome window is the front door. Shortcuts to About, Newsletter, Projects,
                and Contact live on the new-tab page, just like pinned bookmarks.
              </p>
            </div>

            <h3>Small details, big feel</h3>
            <p>
              Window chrome, draggable tabs, and dock icons are not decoration. They set
              expectations: this site is crafted, responsive, and a little whimsical. The
              goal is delight that still loads fast and works on mobile.
            </p>

            <h2 data-toc-title="Stack & tooling">
              The stack behind the scenes: React, Vite, Firebase, and motion
            </h2>
            <p>
              The long heading above is shortened in the table of contents thanks to{' '}
              <code>data-toc-title</code>. Under the hood: React 19, Vite, Tailwind, and
              Firebase Hosting. Motion powers micro-interactions like this Dynamic Island TOC.
            </p>

            <h3>Performance choices</h3>
            <p>
              Heavy windows are lazy-loaded so the first paint stays lean. Map, Netflix, and
              game embeds only download when you open them — the desktop should feel instant.
            </p>

            <h4>What is next</h4>
            <p>
              More app windows, richer About content, and deeper project case studies. If
              something here sparks an idea for your own site, reply via the Contact tab —
              I read every message.
            </p>

            <div
              data-toc
              data-toc-depth="2"
              data-toc-title="Featured project"
              className="newsletter-page__feature"
            >
              <h3>Featured: Portfolio OS</h3>
              <p>
                This highlighted block is a custom TOC entry using <code>data-toc</code> on a
                non-heading element — useful when a section is more than a single line of title.
              </p>
            </div>

            <p>
              Thanks for reading. Scroll back up or tap the island at the bottom to jump
              between sections. The progress ring tracks how far you have made it through
              this issue.
            </p>

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
        scrollContainerRef={scrollRef}
        contained
        selector=".newsletter-page article h1, .newsletter-page article h2, .newsletter-page article h3, .newsletter-page article h4, .newsletter-page [data-toc]"
      />
    </div>
  )
}
