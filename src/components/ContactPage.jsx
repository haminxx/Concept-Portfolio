import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Mail, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardFooter,
  GlassCardHeader,
  GlassCardTitle,
} from '@/components/ui/glass-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { pickRandomContactQuestion } from '@/data/contactRandomQuestions'
import { formatGenderLabel } from '@/utils/contactAvatar'
import {
  getContactMessageById,
  loadChromeContactMessages,
  saveContactChromeForm,
} from '@/utils/contactMessages'

import './ContactPage.css'

const AVATAR_SIZE = 56
const GRAVITY = 2200
const BOUNCE = 0.45
const FRICTION = 0.72
const AIR_DRAG = 0.998
const SPAWN_TOP = 12
const FLOOR_PAD = 14
const MOUSE_RADIUS = 88
const MOUSE_PUSH = 320
const DEFAULT_AVATAR_SRC = '/images/contact-default-avatar.svg'

const INITIAL_FORM = {
  name: '',
  age: '',
  gender: '',
  job: '',
  email: '',
  linkedin: '',
  phone: '',
  discussion: '',
  randomAnswer: '',
}

const STEP_LABELS = ['Information', 'Contact', 'Message']

/** @typedef {{ id: string, messageId: string, avatarUrl: string, x: number, y: number, rotation: number, vx: number, vy: number, settled: boolean }} AvatarDrop */

function canAdvanceStep(step, form) {
  if (step === 1) {
    return form.name.trim() && form.age.trim() && form.gender.trim() && form.job.trim()
  }
  if (step === 2) {
    return form.email.trim() && form.linkedin.trim()
  }
  return form.discussion.trim() && form.randomAnswer.trim()
}

function overlapsHorizontally(a, b, size = AVATAR_SIZE) {
  return a.x < b.x + size && a.x + size > b.x
}

function restingY(drop, others, floorY) {
  let y = floorY
  for (const other of others) {
    if (other.id === drop.id || !other.settled) continue
    if (overlapsHorizontally(drop, other)) {
      y = Math.min(y, other.y - AVATAR_SIZE - 4)
    }
  }
  return y
}

/** @param {string} messageId @param {string} avatarUrl @param {number} zoneWidth @param {{ settled?: boolean, y?: number }} [opts] */
function createAvatarDrop(messageId, avatarUrl, zoneWidth, opts = {}) {
  const margin = AVATAR_SIZE + 16
  const maxX = Math.max(margin, zoneWidth - margin)
  const x = margin + Math.random() * (maxX - margin)
  return {
    id: `avatar-${messageId}`,
    messageId,
    avatarUrl,
    x,
    y: opts.y ?? SPAWN_TOP,
    rotation: (Math.random() - 0.5) * 14,
    vx: (Math.random() - 0.5) * 100,
    vy: 0,
    settled: Boolean(opts.settled),
  }
}

/** @param {import('@/utils/contactMessages').ContactMessage} message @param {number} zoneWidth @param {number} zoneHeight @param {number} index */
function createSettledDropFromMessage(message, zoneWidth, zoneHeight, index) {
  const avatarUrl = message.formSection?.avatarImageUrl ?? DEFAULT_AVATAR_SRC
  const drop = createAvatarDrop(message.id, avatarUrl, zoneWidth, { settled: true })
  const floorY = zoneHeight - AVATAR_SIZE - FLOOR_PAD
  const column = index % 6
  const row = Math.floor(index / 6)
  drop.x = FLOOR_PAD + column * (AVATAR_SIZE + 10) + (Math.random() - 0.5) * 8
  drop.y = floorY - row * (AVATAR_SIZE + 6)
  drop.vx = 0
  drop.vy = 0
  drop.rotation = 0
  return drop
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

function AvatarImage({ src, alt }) {
  const [resolvedSrc, setResolvedSrc] = useState(src || DEFAULT_AVATAR_SRC)

  useEffect(() => {
    setResolvedSrc(src || DEFAULT_AVATAR_SRC)
  }, [src])

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className="contact-page__avatar-img"
      draggable={false}
      onError={() => {
        if (resolvedSrc !== DEFAULT_AVATAR_SRC) setResolvedSrc(DEFAULT_AVATAR_SRC)
      }}
    />
  )
}

export default function ContactPage() {
  const titleId = useId()
  const pageRef = useRef(null)
  const zoneRef = useRef(null)
  const dropsRef = useRef(/** @type {AvatarDrop[]} */ ([]))
  const rafRef = useRef(null)
  const lastTimeRef = useRef(null)
  const mouseRef = useRef(/** @type {{ x: number, y: number } | null} */ (null))
  const modalRef = useRef(null)
  const hydratedRef = useRef(false)

  const [portalRoot, setPortalRoot] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(INITIAL_FORM)
  const [randomQuestion, setRandomQuestion] = useState(() => pickRandomContactQuestion())
  const [submitted, setSubmitted] = useState(false)
  const [drops, setDrops] = useState(/** @type {AvatarDrop[]} */ ([]))
  const [selectedMessageId, setSelectedMessageId] = useState(null)
  const [zoneHeight, setZoneHeight] = useState(400)
  const [reducedMotion, setReducedMotion] = useState(false)

  dropsRef.current = drops

  const selectedMessage = selectedMessageId ? getContactMessageById(selectedMessageId) : null
  const selectedForm = selectedMessage?.formSection

  const closeModal = useCallback(() => setSelectedMessageId(null), [])
  useFocusTrap(Boolean(selectedMessageId), modalRef, closeModal)

  useEffect(() => {
    const root = pageRef.current?.closest('.chrome-landing__content')
    if (root instanceof HTMLElement) {
      setPortalRoot(root)
    }
  }, [])

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

    const measure = () => setZoneHeight(zone.clientHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(zone)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (hydratedRef.current) return
    const zone = zoneRef.current
    if (!zone || zone.clientWidth < 1) return

    const stored = loadChromeContactMessages()
    if (stored.length === 0) {
      hydratedRef.current = true
      return
    }

    const zoneWidth = zone.clientWidth
    const zoneH = zone.clientHeight
    const restored = stored.map((msg, index) => createSettledDropFromMessage(msg, zoneWidth, zoneH, index))
    setDrops(restored)
    hydratedRef.current = true
  }, [zoneHeight])

  useEffect(() => {
    if (step === 3) {
      setRandomQuestion(pickRandomContactQuestion())
    }
  }, [step])

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM)
    setStep(1)
    setSubmitted(false)
    setRandomQuestion(pickRandomContactQuestion())
  }, [])

  const handleOpenChange = useCallback(
    (open) => {
      setDrawerOpen(open)
      if (open) resetForm()
    },
    [resetForm],
  )

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const spawnAvatar = useCallback(
    (messageId, avatarUrl) => {
      const zoneWidth = zoneRef.current?.clientWidth ?? 400
      const next = createAvatarDrop(messageId, avatarUrl, zoneWidth)

      if (reducedMotion) {
        const floorY = zoneHeight - AVATAR_SIZE - FLOOR_PAD
        const settled = { ...next, settled: true, vy: 0, vx: 0 }
        settled.y = restingY(settled, dropsRef.current, floorY)
        setDrops((prev) => [...prev, settled])
      } else {
        setDrops((prev) => [...prev, next])
      }
    },
    [reducedMotion, zoneHeight],
  )

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault()
      if (!canAdvanceStep(3, form)) return

      const saved = saveContactChromeForm({
        ...form,
        randomQuestion,
      })
      const avatarUrl = saved.formSection?.avatarImageUrl ?? DEFAULT_AVATAR_SRC
      spawnAvatar(saved.id, avatarUrl)
      setSubmitted(true)
      window.setTimeout(() => setDrawerOpen(false), 900)
    },
    [form, randomQuestion, spawnAvatar],
  )

  const handleNext = useCallback(() => {
    if (!canAdvanceStep(step, form)) return
    setStep((current) => Math.min(current + 1, 3))
  }, [form, step])

  const handleBack = useCallback(() => {
    setStep((current) => Math.max(current - 1, 1))
  }, [])

  const handleZonePointerMove = useCallback((event) => {
    const zone = zoneRef.current
    if (!zone) return
    const rect = zone.getBoundingClientRect()
    mouseRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }, [])

  const handleZonePointerLeave = useCallback(() => {
    mouseRef.current = null
  }, [])

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
        const floorY = zone.clientHeight - AVATAR_SIZE - FLOOR_PAD
        const zoneWidth = zone.clientWidth
        const mouse = mouseRef.current
        const hadMoving = dropsRef.current.some((d) => !d.settled)

        if (!hadMoving && !mouse) {
          rafRef.current = requestAnimationFrame(tick)
          return
        }

        const next = dropsRef.current.map((drop) => {
          let { x, y, vx, vy, rotation, settled } = drop

          if (settled && mouse) {
            const cx = x + AVATAR_SIZE / 2
            const cy = y + AVATAR_SIZE / 2
            const dx = cx - mouse.x
            const dy = cy - mouse.y
            const dist = Math.hypot(dx, dy)
            if (dist < MOUSE_RADIUS && dist > 4) {
              const strength = (1 - dist / MOUSE_RADIUS) * MOUSE_PUSH
              settled = false
              vx += (dx / dist) * strength * dt
              vy += (dy / dist) * strength * dt
            }
          }

          if (settled) return drop

          vy += GRAVITY * dt
          vx *= AIR_DRAG
          x += vx * dt
          y += vy * dt
          rotation += vx * dt * 0.035

          const minX = FLOOR_PAD
          const maxX = zoneWidth - AVATAR_SIZE - FLOOR_PAD
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

          return { ...drop, x, y, vx, vy, rotation, settled }
        })

        const changed =
          hadMoving ||
          next.some((d, i) => d.settled !== dropsRef.current[i]?.settled || !d.settled)

        if (changed) setDrops(next)
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastTimeRef.current = null
    }
  }, [reducedMotion])

  return (
    <div className="contact-page" ref={pageRef}>
      <div
        ref={zoneRef}
        className="contact-page__zone"
        aria-label="Visitor avatars"
        onPointerMove={handleZonePointerMove}
        onPointerLeave={handleZonePointerLeave}
      >
        {drops.map((drop) => (
          <button
            key={drop.id}
            type="button"
            className={`contact-page__avatar${drop.settled ? ' contact-page__avatar--settled' : ''}`}
            style={{
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              transform: `translate3d(${drop.x}px, ${drop.y}px, 0) rotate(${drop.rotation}deg)`,
            }}
            onClick={() => setSelectedMessageId(drop.messageId)}
            aria-label="Open visitor details"
          >
            <AvatarImage src={drop.avatarUrl} alt="" />
          </button>
        ))}
      </div>

      <div className="contact-page__center">
        <Drawer open={drawerOpen} onOpenChange={handleOpenChange} position="bottom">
          <DrawerTrigger
            render={
              <button type="button" className="contact-page__trigger" aria-label="Get in touch">
                <span className="contact-page__trigger-icon" aria-hidden="true">
                  <Mail size={28} strokeWidth={1.75} />
                </span>
                <span className="contact-page__trigger-title">Get in touch</span>
                <span className="contact-page__trigger-sub">Share a bit about yourself</span>
              </button>
            }
          />

          <DrawerPopup
            showBar
            showCloseButton
            portalContainer={portalRoot}
            className="contact-page__drawer"
          >
            <DrawerPanel scrollable className="contact-page__drawer-panel">
              <DrawerTitle className="sr-only">Contact form</DrawerTitle>
              <GlassCard className="contact-page__glass-card">
                <GlassCardHeader className="contact-page__glass-header border-b border-white/15 pb-5">
                  <GlassCardTitle>Contact</GlassCardTitle>
                  <GlassCardDescription>
                    Step {step} of 3 · {STEP_LABELS[step - 1]}
                  </GlassCardDescription>
                  <div className="contact-page__steps" aria-hidden="true">
                    {[1, 2, 3].map((index) => (
                      <span
                        key={index}
                        className={`contact-page__step-dot${index <= step ? ' contact-page__step-dot--active' : ''}${index === step ? ' contact-page__step-dot--current' : ''}`}
                      />
                    ))}
                  </div>
                </GlassCardHeader>

                <form className="contact-page__form" onSubmit={handleSubmit}>
                  <GlassCardContent className="contact-page__glass-content">
                    {submitted ? (
                      <p className="contact-page__success" role="status">
                        Thanks — your message was saved. Watch your avatar drop in.
                      </p>
                    ) : (
                      <>
                        {step === 1 && (
                          <div className="contact-page__fields">
                            <div className="contact-page__field">
                              <Label htmlFor="contact-name">Name</Label>
                              <Input
                                id="contact-name"
                                value={form.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                autoComplete="name"
                                required
                                className="contact-page__input"
                              />
                            </div>
                            <div className="contact-page__field">
                              <Label htmlFor="contact-age">Age</Label>
                              <Input
                                id="contact-age"
                                inputMode="numeric"
                                value={form.age}
                                onChange={(e) => updateField('age', e.target.value)}
                                required
                                className="contact-page__input"
                              />
                            </div>
                            <div className="contact-page__field">
                              <Label htmlFor="contact-gender">Gender</Label>
                              <select
                                id="contact-gender"
                                value={form.gender}
                                onChange={(e) => updateField('gender', e.target.value)}
                                required
                                className="contact-page__select"
                              >
                                <option value="">Select…</option>
                                <option value="woman">Woman</option>
                                <option value="man">Man</option>
                                <option value="non-binary">Non-binary</option>
                                <option value="prefer-not">Prefer not to say</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div className="contact-page__field">
                              <Label htmlFor="contact-job">Job or specialization</Label>
                              <Input
                                id="contact-job"
                                value={form.job}
                                onChange={(e) => updateField('job', e.target.value)}
                                required
                                className="contact-page__input"
                              />
                            </div>
                          </div>
                        )}

                        {step === 2 && (
                          <div className="contact-page__fields">
                            <div className="contact-page__field">
                              <Label htmlFor="contact-email">Email</Label>
                              <Input
                                id="contact-email"
                                type="email"
                                value={form.email}
                                onChange={(e) => updateField('email', e.target.value)}
                                autoComplete="email"
                                required
                                className="contact-page__input"
                              />
                            </div>
                            <div className="contact-page__field">
                              <Label htmlFor="contact-linkedin">LinkedIn</Label>
                              <Input
                                id="contact-linkedin"
                                type="url"
                                placeholder="https://linkedin.com/in/…"
                                value={form.linkedin}
                                onChange={(e) => updateField('linkedin', e.target.value)}
                                required
                                className="contact-page__input"
                              />
                            </div>
                            <div className="contact-page__field">
                              <Label htmlFor="contact-phone">
                                Phone number <span className="contact-page__optional">(optional)</span>
                              </Label>
                              <Input
                                id="contact-phone"
                                type="tel"
                                value={form.phone}
                                onChange={(e) => updateField('phone', e.target.value)}
                                autoComplete="tel"
                                className="contact-page__input"
                              />
                            </div>
                          </div>
                        )}

                        {step === 3 && (
                          <div className="contact-page__fields">
                            <div className="contact-page__field">
                              <Label htmlFor="contact-discussion">
                                What would you like to discuss with me?
                              </Label>
                              <Textarea
                                id="contact-discussion"
                                value={form.discussion}
                                onChange={(e) => updateField('discussion', e.target.value)}
                                required
                                className="contact-page__textarea"
                              />
                            </div>
                            <div className="contact-page__field">
                              <Label htmlFor="contact-random-answer">{randomQuestion}</Label>
                              <Textarea
                                id="contact-random-answer"
                                value={form.randomAnswer}
                                onChange={(e) => updateField('randomAnswer', e.target.value)}
                                required
                                className="contact-page__textarea contact-page__textarea--short"
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </GlassCardContent>

                  {!submitted && (
                    <GlassCardFooter className="contact-page__glass-footer border-t border-white/15 pt-5">
                      {step > 1 ? (
                        <Button type="button" variant="outline" onClick={handleBack}>
                          Back
                        </Button>
                      ) : (
                        <span />
                      )}
                      {step < 3 ? (
                        <Button type="button" onClick={handleNext} disabled={!canAdvanceStep(step, form)}>
                          Next
                        </Button>
                      ) : (
                        <Button type="submit" disabled={!canAdvanceStep(step, form)}>
                          Submit
                        </Button>
                      )}
                    </GlassCardFooter>
                  )}
                </form>
              </GlassCard>
            </DrawerPanel>
          </DrawerPopup>
        </Drawer>
      </div>

      {selectedMessageId && selectedForm && (
        <div
          className="contact-page__modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <button
            type="button"
            className="contact-page__modal-backdrop"
            aria-label="Close details"
            onClick={closeModal}
          />
          <div ref={modalRef} className="contact-page__modal-panel">
            <div className="contact-page__modal-head">
              <div className="contact-page__modal-meta">
                <h2 id={titleId} className="contact-page__modal-name">
                  {selectedForm.firstName || selectedForm.name?.split(/\s+/)[0] || 'Visitor'}
                </h2>
                <p className="contact-page__modal-row">
                  <span>{selectedForm.age}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatGenderLabel(selectedForm.gender)}</span>
                </p>
              </div>
              <button
                type="button"
                className="contact-page__modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                <X size={18} strokeWidth={2} aria-hidden />
              </button>
            </div>
            <div className="contact-page__modal-body">
              <p className="contact-page__modal-question">{selectedForm.randomQuestion}</p>
              <p className="contact-page__modal-answer">{selectedForm.randomAnswer}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
