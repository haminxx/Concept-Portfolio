const DEFAULT_LINKEDIN_SLUG = 'christian-j-l'

/** @param {string | undefined} url */
export function parseLinkedInSlug(url) {
  if (!url?.trim()) return null
  const raw = url.trim()
  try {
    const pathname = new URL(raw.startsWith('http') ? raw : `https://${raw}`).pathname
    const match = pathname.match(/\/in\/([^/]+)/i)
    return match?.[1] ?? null
  } catch {
    const match = raw.match(/linkedin\.com\/in\/([^/?#]+)/i)
    return match?.[1] ?? null
  }
}

/**
 * Best-effort avatar URL: unavatar.io for LinkedIn slugs, ui-avatars fallback.
 * @param {{ linkedin?: string, name?: string }} params
 */
export function resolveContactAvatarUrl({ linkedin, name }) {
  const slug = parseLinkedInSlug(linkedin) ?? DEFAULT_LINKEDIN_SLUG
  if (slug) {
    return `https://unavatar.io/linkedin/${encodeURIComponent(slug)}`
  }

  const label = encodeURIComponent(name?.trim() || 'Guest')
  return `https://ui-avatars.com/api/?name=${label}&size=128&background=0A66C2&color=ffffff&bold=true`
}

/** @param {string | undefined} name */
export function parseFirstName(name) {
  const trimmed = name?.trim() ?? ''
  if (!trimmed) return ''
  return trimmed.split(/\s+/)[0]
}

/** @param {string | undefined} value */
export function formatGenderLabel(value) {
  const labels = {
    woman: 'Woman',
    man: 'Man',
    'non-binary': 'Non-binary',
    'prefer-not': 'Prefer not to say',
    other: 'Other',
  }
  return labels[value ?? ''] ?? value ?? ''
}
