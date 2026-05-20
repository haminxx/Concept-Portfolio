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
 * @property {string} [discussion]
 */

/**
 * @typedef {Object} ContactMessage
 * @property {string} id
 * @property {string} text
 * @property {number} timestamp
 * @property {boolean} [public]
 * @property {boolean} [private]
 * @property {'physics' | 'form-public' | 'form-private'} [source]
 * @property {ContactMessagePublicSection} [publicSection]
 * @property {ContactMessagePrivateSection} [privateSection]
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
    if (message.privateSection.discussion) {
      lines.push('Discussion:')
      lines.push(message.privateSection.discussion)
    }
  }

  if (lines.length === 1) lines.push('', message.text)
  return lines.join('\n')
}
