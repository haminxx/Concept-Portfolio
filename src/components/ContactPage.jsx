import { useCallback, useEffect, useRef, useState } from 'react'
import { Mail } from 'lucide-react'

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
import { saveContactChromeForm } from '@/utils/contactMessages'

import './ContactPage.css'

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

function canAdvanceStep(step, form) {
  if (step === 1) {
    return form.name.trim() && form.age.trim() && form.gender.trim() && form.job.trim()
  }
  if (step === 2) {
    return form.email.trim() && form.linkedin.trim()
  }
  return form.discussion.trim() && form.randomAnswer.trim()
}

export default function ContactPage() {
  const pageRef = useRef(null)
  const [portalRoot, setPortalRoot] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(INITIAL_FORM)
  const [randomQuestion, setRandomQuestion] = useState(() => pickRandomContactQuestion())
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const root = pageRef.current?.closest('.chrome-landing__content')
    if (root instanceof HTMLElement) {
      setPortalRoot(root)
    }
  }, [])

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
      if (open) {
        resetForm()
      }
    },
    [resetForm],
  )

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault()
      if (!canAdvanceStep(3, form)) return

      saveContactChromeForm({
        ...form,
        randomQuestion,
      })
      setSubmitted(true)
      window.setTimeout(() => {
        setDrawerOpen(false)
      }, 1200)
    },
    [form, randomQuestion],
  )

  const handleNext = useCallback(() => {
    if (!canAdvanceStep(step, form)) return
    setStep((current) => Math.min(current + 1, 3))
  }, [form, step])

  const handleBack = useCallback(() => {
    setStep((current) => Math.max(current - 1, 1))
  }, [])

  return (
    <div className="contact-page" ref={pageRef}>
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

          <DrawerPopup showBar showCloseButton portalContainer={portalRoot} className="contact-page__drawer">
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
                        Thanks — your message was saved. Talk soon.
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
    </div>
  )
}
