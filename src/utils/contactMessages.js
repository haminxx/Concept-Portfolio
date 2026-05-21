export const CONTACT_MESSAGES_KEY = 'cnl-contact-messages'

/**
 * @typedef {Object} ContactMessagePublicSection
 * @property {string} [name]
 * @property {string} [age]
 * @property {string} [setback]
 */

/**
 * @typedef {Object} ContactMessagePrivateSection
 * @property {string} [email]
 * @property {string} [linkedin]
 * @property {string} [phone]
 * @property {string} [discussion]
 */

/**
 * @typedef {Object} ContactChromeFormSection
 * @property {string} [name]
 * @property {string} [age]
 * @property {string} [gender]
 * @property {string} [job]
 * @property {string} [email]
 * @property {string} [linkedin]
 * @property {string} [phone]
 * @property {string} [discussion]
 * @property {string} [randomQuestion]
 * @property {string} [randomAnswer]
 */

/**
 * @typedef {Object} ContactMessage
 * @property {string} id
 * @property {string} text
 * @property {number} timestamp
 * @property {boolean} [public]
 * @property {boolean} [private]
 * @property {'physics' | 'form-public' | 'form-private' | 'form-chrome'} [source]
 * @property {ContactMessagePublicSection} [publicSection]
 * @property {ContactMessagePrivateSection} [privateSection]
 * @property {ContactChromeFormSection} [formSection]
 */

export function loadContactMessages() {
  try {
    const raw = localStorage.getItem(CONTACT_MESSAGES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** @param {ContactMessage} message */
export function saveContactMessage(message) {
  const list = loadContactMessages()
  list.push(message)
  try {
    localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify(list))
  } catch {
    /* quota / private mode */
  }
  return message
}

/** @param {string} id */
export function getContactMessageById(id) {
  return loadContactMessages().find((m) => m.id === id) ?? null
}

export function createMessageId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/** @param {ContactChromeFormSection} formSection */
export function saveContactChromeForm(formSection) {
  const discussion = formSection.discussion?.trim() ?? ''
  const randomAnswer = formSection.randomAnswer?.trim() ?? ''
  const text = [discussion, randomAnswer && `Random Q: ${formSection.randomQuestion}\n${randomAnswer}`]
    .filter(Boolean)
    .join('\n\n')

  return saveContactMessage({
    id: createMessageId(),
    timestamp: Date.now(),
    source: 'form-chrome',
    text,
    formSection,
    publicSection: {
      name: formSection.name,
      age: formSection.age,
      setback: randomAnswer || undefined,
    },
    privateSection: {
      email: formSection.email,
      linkedin: formSection.linkedin,
      phone: formSection.phone,
      discussion,
    },
  })
}

/** @param {ContactMessage} message */
export function formatMessageDetail(message) {
  if (!message) return ''

  const lines = []
  const when = new Date(message.timestamp).toLocaleString()
  lines.push(`Received: ${when}`)

  if (message.source === 'physics') {
    lines.push('', message.text)
    return lines.join('\n')
  }

  if (message.formSection) {
    lines.push('', '— Chrome contact form —')
    const f = message.formSection
    if (f.name) lines.push(`Name: ${f.name}`)
    if (f.age) lines.push(`Age: ${f.age}`)
    if (f.gender) lines.push(`Gender: ${f.gender}`)
    if (f.job) lines.push(`Job / specialization: ${f.job}`)
    if (f.email) lines.push(`Email: ${f.email}`)
    if (f.linkedin) lines.push(`LinkedIn: ${f.linkedin}`)
    if (f.phone) lines.push(`Phone: ${f.phone}`)
    if (f.discussion) {
      lines.push('Discussion:')
      lines.push(f.discussion)
    }
    if (f.randomQuestion) {
      lines.push('Random question:')
      lines.push(f.randomQuestion)
    }
    if (f.randomAnswer) {
      lines.push('Answer:')
      lines.push(f.randomAnswer)
    }
    if (lines.length === 1) lines.push('', message.text)
    return lines.join('\n')
  }

  if (message.publicSection) {
    lines.push('', '— Public message —')
    if (message.publicSection.name) lines.push(`Name: ${message.publicSection.name}`)
    if (message.publicSection.age) lines.push(`Age: ${message.publicSection.age}`)
    if (message.publicSection.setback) {
      lines.push('Memorable setback:')
      lines.push(message.publicSection.setback)
    }
  }

  if (message.privateSection) {
    lines.push('', '— Private message —')
    if (message.privateSection.email) lines.push(`Email: ${message.privateSection.email}`)
    if (message.privateSection.linkedin) lines.push(`LinkedIn: ${message.privateSection.linkedin}`)
    if (message.privateSection.phone) lines.push(`Phone: ${message.privateSection.phone}`)
    if (message.privateSection.discussion) {
      lines.push('Discussion:')
      lines.push(message.privateSection.discussion)
    }
  }

  if (lines.length === 1) lines.push('', message.text)
  return lines.join('\n')
}
