/**
 * Shared todo tree store (mirrors the notes sync pattern in notesStorage.js).
 *
 * Data shape (persisted to localStorage AND Firestore doc `todos/shared`):
 *   TodoNode  = { id: string, text: string, done: boolean, children: TodoNode[] }
 *   TodosStore = { todos: TodoNode[] }
 *
 * Flat todos simply have an empty `children` array; nested sub-todos live under
 * a parent's `children`. The same store powers the home desktop Tree widget and
 * the Notes window todo editor, so edits in either place stay in sync in real
 * time via Firestore (last-writer-wins) and fall back to localStorage offline.
 */

export const TODOS_STORAGE_KEY = 'portfolio-todos-v1'
export const TODOS_CHANGED_EVENT = 'portfolio-todos-changed'

/** @typedef {{ id: string, text: string, done: boolean, children: TodoNode[] }} TodoNode */
/** @typedef {{ todos: TodoNode[] }} TodosStore */

export function newTodoId(prefix = 'todo') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function sanitizeNode(node) {
  if (!node || typeof node !== 'object') return null
  const id = typeof node.id === 'string' ? node.id : newTodoId()
  const text = typeof node.text === 'string' ? node.text : ''
  const done = !!node.done
  const children = Array.isArray(node.children)
    ? node.children.map(sanitizeNode).filter(Boolean)
    : []
  return { id, text, done, children }
}

function defaultTodos() {
  return [
    {
      id: newTodoId(),
      text: 'My Todos',
      done: false,
      children: [
        { id: newTodoId(), text: 'Tap the circle to complete a todo', done: false, children: [] },
        { id: newTodoId(), text: 'Edit or add todos from the Notes app', done: false, children: [] },
      ],
    },
  ]
}

/** @returns {TodosStore} */
export function loadTodosStore() {
  try {
    const raw = localStorage.getItem(TODOS_STORAGE_KEY)
    if (!raw) return { todos: defaultTodos() }
    const o = JSON.parse(raw)
    const todos = Array.isArray(o?.todos) ? o.todos.map(sanitizeNode).filter(Boolean) : []
    return { todos }
  } catch {
    return { todos: defaultTodos() }
  }
}

export function persistTodosLocal(store) {
  try {
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify({ todos: store.todos }))
  } catch {
    // ignore
  }
  try {
    window.dispatchEvent(new CustomEvent(TODOS_CHANGED_EVENT))
  } catch {
    // ignore
  }
}

/** Persist locally and schedule a debounced push to Firestore. */
export function saveTodosStore(store) {
  persistTodosLocal(store)
  import('./todosFirestoreSync')
    .then((m) => m.schedulePushTodosStore(store))
    .catch(() => {})
}

function mapNodes(nodes, fn) {
  return nodes.map((n) => {
    const mapped = fn(n)
    return { ...mapped, children: mapNodes(mapped.children ?? [], fn) }
  })
}

function removeNode(nodes, id) {
  const out = []
  for (const n of nodes) {
    if (n.id === id) continue
    out.push({ ...n, children: removeNode(n.children ?? [], id) })
  }
  return out
}

function insertChild(nodes, parentId, child) {
  return nodes.map((n) => {
    if (n.id === parentId) {
      return { ...n, children: [...(n.children ?? []), child] }
    }
    return { ...n, children: insertChild(n.children ?? [], parentId, child) }
  })
}

/** Toggle a todo's done state. */
export function toggleTodo(store, id, done) {
  const todos = mapNodes(store.todos, (n) => (n.id === id ? { ...n, done } : n))
  return { ...store, todos }
}

/** Set a todo's text. */
export function setTodoText(store, id, text) {
  const todos = mapNodes(store.todos, (n) => (n.id === id ? { ...n, text } : n))
  return { ...store, todos }
}

/**
 * Add a new todo. When `parentId` is null/undefined it is appended at the root,
 * otherwise it becomes a child of `parentId`. Returns `{ store, id }`.
 */
export function addTodo(store, parentId = null, text = '') {
  const node = { id: newTodoId(), text, done: false, children: [] }
  const todos = parentId
    ? insertChild(store.todos, parentId, node)
    : [...store.todos, node]
  return { store: { ...store, todos }, id: node.id }
}

/** Delete a todo (and its entire subtree). */
export function deleteTodo(store, id) {
  return { ...store, todos: removeNode(store.todos, id) }
}

/** Collect ids of every node that has at least one child (useful for default-expanded keys). */
export function collectParentIds(nodes, acc = []) {
  for (const n of nodes) {
    if (n.children && n.children.length > 0) {
      acc.push(n.id)
      collectParentIds(n.children, acc)
    }
  }
  return acc
}
