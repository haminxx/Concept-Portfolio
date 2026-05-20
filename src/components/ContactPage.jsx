import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Mail, X } from 'lucide-react'
import { ContactSection } from '@/components/ui/contact'
import './ContactPage.css'

const ICON_SIZE = 52
const GRAVITY = 2200
const BOUNCE = 0.45
const FRICTION = 0.72
const AIR_DRAG = 0.998
const SPAWN_TOP = 20
const FLOOR_PAD = 12
const MAX_TEXT = 280

/** @typedef {{ id: string, text: string, x: number, y: number, rotation: number, vx: number, vy: number, settled: boolean }} Drop */

function createDrop(text, zoneWidth) {
  const margin = ICON_SIZE + 16
  const maxX = Math.max(margin, zoneWidth - margin)
  const x = margin + Math.random() * (maxX - margin)
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    x,
    y: SPAWN_TOP,
    rotation: (Math.random() - 0.5) * 18,
    vx: (Math.random() - 0.5) * 120,
    vy: 0,
    settled: false,
  }
}

function overlapsHorizontally(a, b, size = ICON_SIZE) {
  return a.x < b.x + size && a.x + size > b.x
}

function restingY(drop, others, floorY) {
  let y = floorY
  for (const other of others) {
    if (other.id === drop.id || !other.settled) continue
    if (overlapsHorizontally(drop, other)) {
      y = Math.min(y, other.y - ICON_SIZE - 4)
    }
  }
  return y
}

function useFocusTrap(active, containerRef, onClose) {
  useEffect(() => {
    if (!active || !containerRef.current) return undefined

    const root = containerRef.current
    const focusables = () =>
      Array.from(
        root.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled'))

    const first = focusables()[0]
    first?.focus()

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const nodes = focusables()
      if (nodes.length === 0) return

      const firstEl = nodes[0]
      const lastEl = nodes[nodes.length - 1]

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [active, containerRef, onClose])
}

export default function ContactPage() {
  const titleId = useId()
  const zoneRef = useRef(null)
  const dropsRef = useRef(/** @type {Drop[]} */ ([]))
  const rafRef = useRef(null)
  const lastTimeRef = useRef(null)
  const modalRef = useRef(null)

  const [drops, setDrops] = useState(/** @type {Drop[]} */ ([]))
  const [draft, setDraft] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [zoneHeight, setZoneHeight] = useState(400)
  const [reducedMotion, setReducedMotion] = useState(false)

  dropsRef.current = drops

  const selectedDrop = drops.find((d) => d.id === selectedId) ?? null

  const closeModal = useCallback(() => setSelectedId(null), [])
  useFocusTrap(Boolean(selectedDrop), modalRef, closeModal)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const zone = zoneRef.current
    if (!zone) return undefined

    const measure = () => {
      setZoneHeight(zone.clientHeight)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(zone)
    return () => ro.disconnect()
  }, [])

  const submitMessage = useCallback(
    (e) => {
      e?.preventDefault?.()
      const text = draft.trim()
      if (!text) return

      const zoneWidth = zoneRef.current?.clientWidth ?? 400
      const next = createDrop(text, zoneWidth)

      if (reducedMotion) {
        const floorY = zoneHeight - ICON_SIZE - FLOOR_PAD
        const settled = { ...next, settled: true, vy: 0, vx: 0 }
        settled.y = restingY(settled, dropsRef.current, floorY)
        setDrops((prev) => [...prev, settled])
      } else {
        setDrops((prev) => [...prev, next])
      }

      setDraft('')
    },
    [draft, reducedMotion, zoneHeight],
  )

  useEffect(() => {
    if (reducedMotion) return undefined

    const tick = (time) => {
      const zone = zoneRef.current
      if (!zone) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const dt = lastTimeRef.current == null ? 0 : Math.min(0.032, (time - lastTimeRef.current) / 1000)
      lastTimeRef.current = time

      if (dt > 0) {
        const floorY = zone.clientHeight - ICON_SIZE - FLOOR_PAD
        const zoneWidth = zone.clientWidth
        const hadMoving = dropsRef.current.some((d) => !d.settled)
        if (!hadMoving) {
          rafRef.current = requestAnimationFrame(tick)
          return
        }

        const next = dropsRef.current.map((drop) => {
          if (drop.settled) return drop

          let { x, y, vx, vy, rotation } = drop
          vy += GRAVITY * dt
          vx *= AIR_DRAG
          x += vx * dt
          y += vy * dt
          rotation += vx * dt * 0.04

          const minX = FLOOR_PAD
          const maxX = zoneWidth - ICON_SIZE - FLOOR_PAD
          if (x < minX) {
            x = minX
            vx = Math.abs(vx) * BOUNCE * 0.6
          } else if (x > maxX) {
            x = maxX
            vx = -Math.abs(vx) * BOUNCE * 0.6
          }

          const targetY = restingY({ ...drop, x, y }, dropsRef.current, floorY)

          if (y >= targetY) {
            y = targetY
            if (Math.abs(vy) < 80) {
              return {
                ...drop,
                x,
                y,
                vx: 0,
                vy: 0,
                rotation: rotation * 0.85,
                settled: true,
              }
            }
            vy = -Math.abs(vy) * BOUNCE
            vx *= FRICTION
          }

          return { ...drop, x, y, vx, vy, rotation }
        })

        setDrops(next)
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastTimeRef.current = null
    }
  }, [reducedMotion])

  const handleContactSubmit = useCallback((data) => {
    console.log('Contact form submitted:', data)
  }, [])

  return (
    <div className="contact-page">
      <div className="contact-page__physics">
        <div
          ref={zoneRef}
          className="contact-page__zone"
          aria-label="Dropped messages"
        >
          {drops.length === 0 && (
            <p className="contact-page__hint" aria-live="polite">
              Type a message below and send it — it drops here as a note you can open.
            </p>
          )}

          {drops.map((drop) => (
            <button
              key={drop.id}
              type="button"
              className={`contact-page__icon${drop.settled ? ' contact-page__icon--settled' : ''}`}
              style={{
                width: ICON_SIZE,
                height: ICON_SIZE,
                transform: `translate3d(${drop.x}px, ${drop.y}px, 0) rotate(${drop.rotation}deg)`,
              }}
              onClick={() => setSelectedId(drop.id)}
              aria-label={`Open message: ${drop.text.slice(0, 60)}${drop.text.length > 60 ? '…' : ''}`}
            >
              <Mail size={26} strokeWidth={1.75} aria-hidden />
            </button>
          ))}
        </div>

        <form
          className="contact-page__composer"
          onSubmit={submitMessage}
          aria-label="Send a message"
        >
          <label htmlFor="contact-message" className="contact-page__label">
            Your message
          </label>
          <div className="contact-page__composer-inner">
            <input
              id="contact-message"
              type="text"
              className="contact-page__input"
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MAX_TEXT))}
              placeholder="Say something…"
              autoComplete="off"
              maxLength={MAX_TEXT}
            />
            <button
              type="submit"
              className="contact-page__send"
              disabled={!draft.trim()}
              aria-label="Drop message"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      <div className="contact-page__form">
        <div className="contact-page__form-scroll">
          <ContactSection
            embedded
            contactEmail="hello@christianlee.com"
            onSubmit={handleContactSubmit}
          />
        </div>
      </div>

      <AnimatePresence>
        {selectedDrop && (
          <motion.div
            className="contact-page__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <button
              type="button"
              className="contact-page__modal-backdrop"
              aria-label="Close message"
              onClick={closeModal}
            />
            <motion.div
              ref={modalRef}
              className="contact-page__modal-panel"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            >
              <div className="contact-page__modal-head">
                <h2 id={titleId} className="contact-page__modal-title">
                  Message
                </h2>
                <button
                  type="button"
                  className="contact-page__modal-close"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  <X size={18} strokeWidth={2} aria-hidden />
                </button>
              </div>
              <p className="contact-page__modal-body">{selectedDrop.text}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
