import { useRef, useState } from 'react'
import DynamicIslandTOC from './ui/dynamic-island-toc'
import './NewsletterPage.css'

const LOREM = [
  'The kettle had not yet whistled when the first idea arrived, uninvited and slightly damp from the morning fog. We have been collecting these small arrivals for years, pressing them between pages like wildflowers nobody asked us to keep.',
  'There is a particular pleasure in returning to a thought you abandoned. It waits for you without resentment, holding the exact shape it had when you left, and offers itself again as if no time had passed at all.',
  'Consider the humble margin. It is where the real conversation happens, where doubt and delight are scribbled in pencil, where the reader becomes, for a moment, a co-author of the thing they are reading.',
  'We are told that attention is the scarcest resource of the age. Perhaps. But generosity of attention, freely given to a single small thing, still feels like the closest most of us come to a quiet kind of magic.',
]

function makeSection(id, title, paragraphs = 3) {
  return {
    id,
    title,
    body: Array.from({ length: paragraphs }, (_, i) => LOREM[i % LOREM.length]),
  }
}

const chapters = [
  {
    id: 'chapter-1',
    number: 1,
    title: 'The Quiet Architecture of Mornings',
    blurb:
      'On rituals, slow coffee, and why the first hour decides the shape of the rest of the day.',
    sections: [
      makeSection('c1-rituals', 'Rituals Before Reason'),
      makeSection('c1-light', 'A Note on Early Light'),
      makeSection('c1-noise', 'The Cost of Borrowed Noise'),
      makeSection('c1-pages', 'Three Pages, Longhand', 4),
    ],
  },
  {
    id: 'chapter-2',
    number: 2,
    title: 'Letters We Never Sent',
    blurb:
      'An archive of unfinished correspondence and what the unsaid teaches us about intention.',
    sections: [
      makeSection('c2-drafts', 'In Defense of Drafts'),
      makeSection('c2-distance', 'The Geometry of Distance'),
      makeSection('c2-stamps', 'Collecting Stamps, Not Replies'),
      makeSection('c2-silence', 'A Grammar of Silence', 4),
      makeSection('c2-return', 'Return to Sender'),
    ],
  },
  {
    id: 'chapter-3',
    number: 3,
    title: 'Field Notes from the Margins',
    blurb:
      'Where annotation becomes authorship, and the reader quietly joins the writing.',
    sections: [
      makeSection('c3-pencil', 'Always Use a Pencil'),
      makeSection('c3-doubt', 'Marginal Doubt'),
      makeSection('c3-maps', 'Maps Drawn in the Gutter'),
      makeSection('c3-echo', 'The Echo of a Good Line'),
    ],
  },
  {
    id: 'chapter-4',
    number: 4,
    title: 'The Economics of Attention',
    blurb:
      'A gentle accounting of where our hours go and the dividends of paying close attention.',
    sections: [
      makeSection('c4-scarcity', 'Scarcity, Reconsidered'),
      makeSection('c4-generosity', 'Generosity as a Strategy'),
      makeSection('c4-ledger', 'Keeping an Honest Ledger', 4),
      makeSection('c4-interest', 'Compound Interest of Care'),
      makeSection('c4-rest', 'The Rest Dividend'),
    ],
  },
  {
    id: 'chapter-5',
    number: 5,
    title: 'Endings, and How to Postpone Them',
    blurb:
      'On last paragraphs, lingering goodbyes, and the art of leaving the door slightly open.',
    sections: [
      makeSection('c5-last', 'The Last Paragraph Problem'),
      makeSection('c5-doors', 'Doors Left Ajar'),
      makeSection('c5-encore', 'In Praise of the Encore'),
      makeSection('c5-thread', 'One Loose Thread', 4),
    ],
  },
]

function ChapterIndex({ onSelect }) {
  return (
    <div className="newsletter-page__main">
      <header className="newsletter-page__header">
        <p className="newsletter-page__eyebrow">Issue No. 12 &middot; The Marginalia Letter</p>
        <h1>A Field Guide to Slow Reading</h1>
        <p className="newsletter-page__subtitle">
          Five chapters on attention, ritual, and the quiet pleasures of the page. Pick a chapter to
          begin.
        </p>
      </header>

      <div className="newsletter-page__index">
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            type="button"
            className="newsletter-page__index-card"
            onClick={() => onSelect(chapter.id)}
          >
            <span className="newsletter-page__index-number">
              Chapter {String(chapter.number).padStart(2, '0')}
            </span>
            <span className="newsletter-page__index-title">{chapter.title}</span>
            <span className="newsletter-page__index-blurb">{chapter.blurb}</span>
            <span className="newsletter-page__index-meta">
              {chapter.sections.length} sections &middot; Read &rarr;
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ChapterView({ chapter, onBack }) {
  return (
    <div className="newsletter-page__main">
      <button type="button" className="newsletter-page__back" onClick={onBack}>
        &larr; All chapters
      </button>

      <header className="newsletter-page__header newsletter-page__header--left">
        <p className="newsletter-page__eyebrow">
          Chapter {String(chapter.number).padStart(2, '0')}
        </p>
        <h1>{chapter.title}</h1>
        <p className="newsletter-page__subtitle">{chapter.blurb}</p>
      </header>

      <nav className="newsletter-page__chapter-toc" aria-label="In this chapter">
        <p className="newsletter-page__chapter-toc-label">In this chapter</p>
        <ol>
          {chapter.sections.map((section, i) => (
            <li key={section.id}>
              <a href={`#${section.id}`}>
                <span className="newsletter-page__chapter-toc-num">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <article className="newsletter-page__article">
        {chapter.sections.map((section) => (
          <section key={section.id} className="newsletter-page__section">
            <h2 id={section.id} data-toc data-toc-title={section.title}>
              {section.title}
            </h2>
            {section.body.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </section>
        ))}

        <footer className="newsletter-page__chapter-footer">
          <button type="button" className="newsletter-page__back" onClick={onBack}>
            &larr; Back to all chapters
          </button>
        </footer>
      </article>
    </div>
  )
}

export default function NewsletterPage() {
  const [selectedChapter, setSelectedChapter] = useState(null)
  const scrollRef = useRef(null)
  const contentRef = useRef(null)

  const chapter = chapters.find((c) => c.id === selectedChapter) || null

  const handleSelect = (id) => {
    setSelectedChapter(id)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }

  const handleBack = () => {
    setSelectedChapter(null)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }

  return (
    <div className="newsletter-page" aria-label="Newsletter">
      <div className="newsletter-page__scroll" ref={scrollRef}>
        <div className="newsletter-page__content" ref={contentRef}>
          {chapter ? (
            <ChapterView chapter={chapter} onBack={handleBack} />
          ) : (
            <ChapterIndex onSelect={handleSelect} />
          )}
        </div>
      </div>

      {chapter && (
        <DynamicIslandTOC
          scrollContainerRef={scrollRef}
          contentRef={contentRef}
          scanKey={chapter.id}
          label={`Chapter ${chapter.number}`}
        />
      )}
    </div>
  )
}
