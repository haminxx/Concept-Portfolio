import { ContactSection } from '@/components/ui/contact'

import './ContactPage.css'

const PORTFOLIO_CONTACT = {
  title: 'We can turn your dream project into reality',
  mainMessage: "Let's talk! 👋",
  contactEmail: 'hello@example.com',
  socialLinks: [
    { id: 'github', name: 'GitHub', href: 'https://github.com/haminxx' },
    { id: 'linkedin', name: 'LinkedIn', href: 'https://www.linkedin.com/in/christian-j-l/' },
  ],
}

function handleContactSubmit(data) {
  const subject = encodeURIComponent(`Portfolio contact from ${data.name || 'visitor'}`)
  const projectTypes = data.projectType.length
    ? `\n\nProject types: ${data.projectType.join(', ')}`
    : ''
  const body = encodeURIComponent(`${data.message}${projectTypes}\n\n— ${data.name}\n${data.email}`)
  window.location.href = `mailto:${PORTFOLIO_CONTACT.contactEmail}?subject=${subject}&body=${body}`
}

export default function ContactPage() {
  return (
    <ContactSection
      hideNav
      title={PORTFOLIO_CONTACT.title}
      mainMessage={PORTFOLIO_CONTACT.mainMessage}
      contactEmail={PORTFOLIO_CONTACT.contactEmail}
      socialLinks={PORTFOLIO_CONTACT.socialLinks}
      onSubmit={handleContactSubmit}
    />
  )
}
