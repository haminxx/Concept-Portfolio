/**
 * Breadcrumb segments for the Chrome address bar from a per-tab nav stack.
 * @param {{ entries: { type: string, title: string }[], index: number } | undefined} navState
 * @returns {string[]}
 */
export function getAddressPathSegments(navState) {
  if (!navState?.entries?.length) return ['home']
  const { entries, index } = navState
  return entries.slice(0, index + 1).map((entry, i) =>
    i === 0 && entry.type === 'home' ? 'home' : entry.title,
  )
}
