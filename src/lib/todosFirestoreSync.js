/**
 * Real-time Firestore sync for the shared todo tree (single doc, last-writer-wins).
 * Mirrors notesFirestoreSync.js: collection `todos`, doc `shared`.
 *
 * Security: demo rules may allow public read/write — anyone can overwrite todos.
 * Do not use for sensitive data; tighten rules + Firebase Auth for production.
 */
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'
import { TODOS_STORAGE_KEY, TODOS_CHANGED_EVENT, loadTodosStore } from './todosStorage'

const COLLECTION = 'todos'
const DOC_ID = 'shared'
const DEBOUNCE_MS = 600

let debounceTimer = null
/** @type {string | null} */
let lastAppliedSerialized = null
let subscriptionRefCount = 0
/** @type {null | (() => void)} */
let unsubscribeSnapshot = null

function serializeStore(store) {
  return JSON.stringify({ todos: store.todos ?? [] })
}

function parseDoc(data) {
  if (!data || typeof data !== 'object') return null
  const todos = Array.isArray(data.todos) ? data.todos : null
  if (!todos) return null
  return { todos }
}

function persistFromRemote(store) {
  try {
    localStorage.setItem(TODOS_STORAGE_KEY, serializeStore(store))
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new CustomEvent(TODOS_CHANGED_EVENT))
  } catch {
    /* ignore */
  }
}

function handleSnapshot(snap) {
  const db = getFirebaseDb()
  if (!db) return
  const ref = doc(db, COLLECTION, DOC_ID)

  if (!snap.exists()) {
    const local = loadTodosStore()
    setDoc(
      ref,
      { todos: local.todos, updatedAt: serverTimestamp() },
      { merge: true },
    ).catch(() => {})
    return
  }

  const store = parseDoc(snap.data())
  if (!store) return
  const serialized = serializeStore(store)
  if (serialized === lastAppliedSerialized) return
  lastAppliedSerialized = serialized
  persistFromRemote(store)
}

function attachSnapshotIfNeeded() {
  const db = getFirebaseDb()
  if (!db || unsubscribeSnapshot) return

  const ref = doc(db, COLLECTION, DOC_ID)
  unsubscribeSnapshot = onSnapshot(ref, handleSnapshot, () => {
    /* ignore; offline or rules */
  })
}

function detachSnapshotIfNeeded() {
  if (subscriptionRefCount > 0) return
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot()
    unsubscribeSnapshot = null
  }
}

/**
 * Subscribe to remote todos (shared singleton). Updates localStorage + dispatches TODOS_CHANGED_EVENT.
 * @returns {() => void} Unsubscribe
 */
export function subscribeTodosStore() {
  const db = getFirebaseDb()
  if (!db) return () => {}

  subscriptionRefCount += 1
  attachSnapshotIfNeeded()

  return () => {
    subscriptionRefCount = Math.max(0, subscriptionRefCount - 1)
    detachSnapshotIfNeeded()
  }
}

/**
 * Debounced push after local edits (called from saveTodosStore).
 * @param {{ todos: unknown[] }} store
 */
export function schedulePushTodosStore(store) {
  const db = getFirebaseDb()
  if (!db) return

  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = window.setTimeout(() => {
    debounceTimer = null
    const ref = doc(db, COLLECTION, DOC_ID)
    const serialized = serializeStore(store)
    setDoc(
      ref,
      { todos: store.todos ?? [], updatedAt: serverTimestamp() },
      { merge: true },
    )
      .then(() => {
        lastAppliedSerialized = serialized
      })
      .catch(() => {})
  }, DEBOUNCE_MS)
}
