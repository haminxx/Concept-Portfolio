import React from 'react'
import { Github, Linkedin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import './contact-section.css'

export interface ContactFormData {
  name: string
  email: string
  message: string
  projectType: string[]
}

export interface ContactSocialLink {
  id: string
  name: string
  href: string
  iconSrc?: string
}

export interface ContactSectionProps {
  title?: string
  mainMessage?: string
  contactEmail?: string
  socialLinks?: ContactSocialLink[]
  backgroundImageSrc?: string
  hideNav?: boolean
  /** @deprecated Use hideNav */
  hideHeader?: boolean
  /** Compact chrome embed — no hero background, nav, or two-column layout */
  embedded?: boolean
  className?: string
  onSubmit?: (data: ContactFormData) => void
}

const DEFAULT_SOCIAL_LINKS: ContactSocialLink[] = [
  {
    id: 'github',
    name: 'GitHub',
    href: 'https://github.com/haminxx',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/christian-j-l/',
  },
]

const PROJECT_TYPE_OPTIONS = [
  'Website',
  'Mobile App',
  'Web App',
  'E-Commerce',
  'Brand Identity',
  '3D & Animation',
  'Social Media Marketing',
  'Brand Strategy & Consulting',
  'Other',
]

const BUBBLE_LAYOUT = [
  { size: 14, left: 8, top: 72, delay: 0.5, duration: 18, xOffset: 1 },
  { size: 22, left: 18, top: 45, delay: 2.1, duration: 22, xOffset: -1 },
  { size: 16, left: 32, top: 88, delay: 4.3, duration: 16, xOffset: 1 },
  { size: 28, left: 44, top: 20, delay: 1.2, duration: 24, xOffset: -1 },
  { size: 12, left: 55, top: 65, delay: 6.8, duration: 14, xOffset: 1 },
  { size: 20, left: 63, top: 38, delay: 3.5, duration: 20, xOffset: -1 },
  { size: 18, left: 71, top: 82, delay: 5.6, duration: 19, xOffset: 1 },
  { size: 24, left: 78, top: 12, delay: 7.4, duration: 23, xOffset: -1 },
  { size: 15, left: 85, top: 55, delay: 2.8, duration: 17, xOffset: 1 },
  { size: 26, left: 12, top: 28, delay: 8.1, duration: 21, xOffset: -1 },
  { size: 13, left: 26, top: 58, delay: 9.2, duration: 15, xOffset: 1 },
  { size: 19, left: 48, top: 76, delay: 4.9, duration: 18, xOffset: -1 },
  { size: 17, left: 58, top: 8, delay: 6.1, duration: 16, xOffset: 1 },
  { size: 21, left: 68, top: 48, delay: 1.8, duration: 22, xOffset: -1 },
  { size: 11, left: 92, top: 34, delay: 5.2, duration: 13, xOffset: 1 },
]

function SocialIcon({ link }: { link: ContactSocialLink }) {
  if (link.iconSrc) {
    return <img src={link.iconSrc} alt="" className="h-4 w-4" />
  }

  if (link.id === 'github' || link.name.toLowerCase() === 'github') {
    return <Github className="h-4 w-4" aria-hidden />
  }

  if (link.id === 'linkedin' || link.name.toLowerCase() === 'linkedin') {
    return <Linkedin className="h-4 w-4" aria-hidden />
  }

  return <span className="text-xs font-semibold">{link.name.slice(0, 1)}</span>
}

function ContactFormCard({
  mainMessage,
  contactEmail,
  socialLinks,
  embedded,
  formData,
  onChange,
  onCheckboxChange,
  onSubmit,
}: {
  mainMessage: string
  contactEmail: string
  socialLinks: ContactSocialLink[]
  embedded?: boolean
  formData: ContactFormData
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onCheckboxChange: (type: string, checked: boolean) => void
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <div
      className={cn(
        'contact-section__card rounded-lg border border-border bg-background/90 shadow-xl',
        embedded ? 'contact-section__card--embedded p-4 sm:p-5' : 'p-6 md:p-8',
      )}
    >
      <h2 className={cn('font-bold text-foreground', embedded ? 'mb-4 text-lg' : 'mb-6 text-2xl')}>
        {mainMessage}
      </h2>

      <div className={cn(embedded ? 'mb-4' : 'mb-6')}>
        <p className="mb-2 text-sm text-muted-foreground">Mail us at</p>
        <a href={`mailto:${contactEmail}`} className="text-sm font-medium text-primary hover:underline">
          {contactEmail}
        </a>
        <div className="mt-3 flex items-center space-x-3">
          <span className="text-sm text-muted-foreground">OR</span>
          {socialLinks.map((link) => (
            <Button key={link.id} variant="outline" size="icon" asChild>
              <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.name}>
                <SocialIcon link={link} />
              </a>
            </Button>
          ))}
        </div>
      </div>

      <hr className="my-4 border-border sm:my-5" />

      <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
        <p className="text-sm text-muted-foreground">Leave us a brief message</p>
        <div className={cn('grid grid-cols-1 gap-4', !embedded && 'md:grid-cols-2')}>
          <div className="space-y-2">
            <Label htmlFor="contact-section-name">Your name</Label>
            <Input
              id="contact-section-name"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={onChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-section-email">Email</Label>
            <Input
              id="contact-section-email"
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-section-message">Briefly describe your project idea...</Label>
          <Textarea
            id="contact-section-message"
            name="message"
            placeholder="Briefly describe your project idea..."
            className="min-h-[80px]"
            value={formData.message}
            onChange={onChange}
            required
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">I&apos;m looking for...</p>
          <div
            className={cn(
              'grid gap-2',
              embedded ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3',
            )}
          >
            {PROJECT_TYPE_OPTIONS.map((option) => {
              const optionId = option.replace(/\s/g, '-').toLowerCase()
              return (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={optionId}
                    checked={formData.projectType.includes(option)}
                    onCheckedChange={(checked) => onCheckboxChange(option, checked === true)}
                  />
                  <Label htmlFor={optionId} className="text-xs font-normal leading-snug sm:text-sm">
                    {option}
                  </Label>
                </div>
              )
            })}
          </div>
        </div>

        <Button type="submit" className="w-full">
          Send a message
        </Button>
      </form>
    </div>
  )
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  title = 'We can turn your dream project into reality',
  mainMessage = "Let's talk! 👋",
  contactEmail = 'hello@christianlee.com',
  socialLinks = DEFAULT_SOCIAL_LINKS,
  backgroundImageSrc = 'https://images.unsplash.com/photo-1742273330004-ef9c9d228530?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=900',
  hideNav: hideNavProp = true,
  hideHeader,
  embedded = false,
  className,
  onSubmit,
}) => {
  const hideNav = hideNavProp ?? hideHeader ?? true

  const [formData, setFormData] = React.useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
    projectType: [],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (type: string, checked: boolean) => {
    setFormData((prev) => {
      const currentTypes = prev.projectType
      if (checked) {
        return { ...prev, projectType: [...currentTypes, type] }
      }
      return { ...prev, projectType: currentTypes.filter((t) => t !== type) }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  const cardProps = {
    mainMessage: embedded ? (mainMessage === "Let's talk! 👋" ? 'Get in touch' : mainMessage) : mainMessage,
    contactEmail,
    socialLinks,
    embedded,
    formData,
    onChange: handleChange,
    onCheckboxChange: handleCheckboxChange,
    onSubmit: handleSubmit,
  }

  if (embedded) {
    return (
      <section className={cn('contact-section contact-section--embedded h-full w-full', className)}>
        <ContactFormCard {...cardProps} />
      </section>
    )
  }

  return (
    <section className={cn('contact-section relative min-h-full w-full bg-background', className)}>
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-500 ease-in-out"
        style={{ backgroundImage: `url(${backgroundImageSrc})` }}
      >
        <div className="absolute inset-0 z-0 overflow-hidden">
          {BUBBLE_LAYOUT.map((bubble, i) => (
            <div
              key={i}
              className="contact-section__bubble absolute rounded-full bg-white/20 opacity-0"
              style={{
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                left: `${bubble.left}%`,
                top: `${bubble.top}%`,
                animationDelay: `${bubble.delay}s`,
                ['--bubble-duration' as string]: `${bubble.duration}s`,
                ['--bubble-x-offset' as string]: String(bubble.xOffset),
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex min-h-full w-full flex-col items-center p-4 pb-12 md:p-8 lg:p-12">
        {!hideNav ? (
          <nav className="mb-8 flex w-full max-w-7xl items-center justify-between rounded-lg bg-card/70 p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">Ravi Katiyar</span>
            </div>
            <div className="hidden items-center space-x-6 md:flex">
              {['Who we are', 'Services', 'Case studies', 'Blog'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-foreground transition-colors hover:text-primary"
                >
                  {item}
                </a>
              ))}
              <Button variant="default">Get in touch</Button>
            </div>
            <Button variant="default" className="md:hidden">
              Menu
            </Button>
          </nav>
        ) : null}

        <div className="grid w-full max-w-7xl flex-grow grid-cols-1 gap-8 rounded-xl p-4 md:p-8 lg:grid-cols-2">
          <div className="flex flex-col justify-end p-4 lg:p-8">
            <h1 className="max-w-lg text-4xl font-extrabold leading-tight text-foreground drop-shadow-lg md:text-5xl lg:text-6xl">
              {title}
            </h1>
          </div>

          <ContactFormCard {...cardProps} />
        </div>
      </div>
    </section>
  )
}
