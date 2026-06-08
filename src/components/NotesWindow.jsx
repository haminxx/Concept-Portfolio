import { useState, useCallback, useMemo, useEffect } from 'react'
import { Pin, Plus, Trash2 } from 'lucide-react'
import { loadNotesStore, saveNotesStore, NOTES_CHANGED_EVENT } from '../lib/notesStorage'
import { subscribeNotesStore } from '../lib/notesFirestoreSync'
import {
  loadTodosStore,
  saveTodosStore,
  toggleTodo,
  setTodoText,
  addTodo,
  deleteTodo,
  TODOS_CHANGED_EVENT,
} from '../lib/todosStorage'
import { subscribeTodosStore } from '../lib/todosFirestoreSync'
import './NotesWindow.css'

function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Recursive editable row for the shared todo tree (text input + checkbox + add/delete). */
function TodoEditorRow({ node, depth, onToggle, onText, onAdd, onDelete }) {
  return (
    <li className="notes-window__todo-node">
      <div className="notes-window__todo-row" style={{ paddingLeft: depth * 20 }}>
        <input
          type="checkbox"
          className="notes-window__checkbox"
          checked={!!node.done}
          onChange={(e) => onToggle(node.id, e.target.checked)}
        />
        <input
          type="text"
          className="notes-window__item-input"
          value={node.text}
          placeholder="Todo"
          onChange={(e) => onText(node.id, e.target.value)}
        />
        <button
          type="button"
          className="notes-window__todo-btn"
          aria-label="Add subtask"
          onClick={() => onAdd(node.id)}
        >
          <Plus size={15} strokeWidth={2} />
        </button>
        <button
          type="button"
          className="notes-window__todo-btn notes-window__todo-btn--danger"
          aria-label="Delete todo"
          onClick={() => onDelete(node.id)}
        >
          <Trash2 size={15} strokeWidth={2} />
        </button>
      </div>
      {node.children && node.children.length > 0 ? (
        <ul className="notes-window__todo-children">
          {node.children.map((child) => (
            <TodoEditorRow
              key={child.id}
              node={child}
              depth={depth + 1}
              onToggle={onToggle}
              onText={onText}
              onAdd={onAdd}
              onDelete={onDelete}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

function defaultNewNote() {
  return {
    id: newId('note'),
    title: 'New note',
    updatedAt: Date.now(),
    blocks: [{ type: 'checklist', items: [{ id: newId('item'), text: '', done: false }] }],
  }
}

export default function NotesWindow() {
  const [store, setStore] = useState(() => loadNotesStore())
  const [activeId, setActiveId] = useState(() => {
    const s = loadNotesStore()
    return s.notes[0]?.id ?? null
  })
  const [view, setView] = useState('note')
  const [todos, setTodos] = useState(() => loadTodosStore())

  const persist = useCallback((next) => {
    saveNotesStore(next)
    setStore(next)
  }, [])

  const persistTodos = useCallback((next) => {
    saveTodosStore(next)
    setTodos(next)
  }, [])

  useEffect(() => {
    const unsub = subscribeNotesStore()
    return unsub
  }, [])

  useEffect(() => {
    const sync = () => setTodos(loadTodosStore())
    window.addEventListener(TODOS_CHANGED_EVENT, sync)
    const unsub = subscribeTodosStore()
    return () => {
      window.removeEventListener(TODOS_CHANGED_EVENT, sync)
      unsub()
    }
  }, [])

  const todoToggle = useCallback(
    (id, done) => persistTodos(toggleTodo(loadTodosStore(), id, done)),
    [persistTodos],
  )
  const todoSetText = useCallback(
    (id, text) => persistTodos(setTodoText(loadTodosStore(), id, text)),
    [persistTodos],
  )
  const todoAdd = useCallback(
    (parentId = null) => persistTodos(addTodo(loadTodosStore(), parentId, '').store),
    [persistTodos],
  )
  const todoDelete = useCallback(
    (id) => persistTodos(deleteTodo(loadTodosStore(), id)),
    [persistTodos],
  )

  useEffect(() => {
    const sync = () => {
      const s = loadNotesStore()
      setStore(s)
      setActiveId((id) => {
        if (id && s.notes.some((n) => n.id === id)) return id
        return s.notes[0]?.id ?? null
      })
    }
    window.addEventListener(NOTES_CHANGED_EVENT, sync)
    return () => window.removeEventListener(NOTES_CHANGED_EVENT, sync)
  }, [])

  const activeNote = useMemo(() => store.notes.find((n) => n.id === activeId), [store.notes, activeId])

  const checklist = useMemo(() => {
    if (!activeNote) return { items: [] }
    const b = activeNote.blocks.find((x) => x.type === 'checklist')
    return b ?? { items: [] }
  }, [activeNote])

  const setTitle = (title) => {
    if (!activeId) return
    const notes = store.notes.map((n) => (n.id === activeId ? { ...n, title, updatedAt: Date.now() } : n))
    persist({ ...store, notes })
  }

  const setItemText = (itemId, text) => {
    if (!activeId) return
    const notes = store.notes.map((n) => {
      if (n.id !== activeId) return n
      return {
        ...n,
        updatedAt: Date.now(),
        blocks: n.blocks.map((b) => {
          if (b.type !== 'checklist') return b
          return { ...b, items: b.items.map((it) => (it.id === itemId ? { ...it, text } : it)) }
        }),
      }
    })
    persist({ ...store, notes })
  }

  const toggleItem = (itemId, done) => {
    if (!activeId) return
    const notes = store.notes.map((n) => {
      if (n.id !== activeId) return n
      return {
        ...n,
        updatedAt: Date.now(),
        blocks: n.blocks.map((b) => {
          if (b.type !== 'checklist') return b
          return { ...b, items: b.items.map((it) => (it.id === itemId ? { ...it, done } : it)) }
        }),
      }
    })
    persist({ ...store, notes })
  }

  const addChecklistItem = () => {
    if (!activeId) return
    const item = { id: newId('item'), text: '', done: false }
    const notes = store.notes.map((n) => {
      if (n.id !== activeId) return n
      return {
        ...n,
        updatedAt: Date.now(),
        blocks: n.blocks.map((b) => {
          if (b.type !== 'checklist') return b
          return { ...b, items: [...b.items, item] }
        }),
      }
    })
    persist({ ...store, notes })
  }

  const newNote = () => {
    const n = defaultNewNote()
    persist({ ...store, notes: [n, ...store.notes] })
    setActiveId(n.id)
  }

  const deleteActive = () => {
    if (!activeId) return
    const notes = store.notes.filter((n) => n.id !== activeId)
    const nextPinned = store.pinnedNoteId === activeId ? null : store.pinnedNoteId
    const next = { ...store, notes: notes.length ? notes : [defaultNewNote()], pinnedNoteId: nextPinned }
    if (!notes.length) {
      setActiveId(next.notes[0].id)
    } else {
      setActiveId(notes[0].id)
    }
    persist(next)
  }

  const togglePin = () => {
    if (!activeId) return
    const pinned = store.pinnedNoteId === activeId ? null : activeId
    persist({ ...store, pinnedNoteId: pinned })
  }

  const sortedNotes = useMemo(
    () => [...store.notes].sort((a, b) => b.updatedAt - a.updatedAt),
    [store.notes],
  )

  return (
    <div className="notes-window">
      <aside className="notes-window__sidebar">
        <div className="notes-window__tabs">
          <button
            type="button"
            className={`notes-window__tab ${view === 'note' ? 'notes-window__tab--active' : ''}`}
            onClick={() => setView('note')}
          >
            Notes
          </button>
          <button
            type="button"
            className={`notes-window__tab ${view === 'todos' ? 'notes-window__tab--active' : ''}`}
            onClick={() => setView('todos')}
          >
            Todos
          </button>
        </div>
        {view === 'note' ? (
          <>
            <div className="notes-window__sidebar-head">
              <button type="button" className="notes-window__new" onClick={newNote}>
                <Plus size={18} strokeWidth={2} />
                <span>New Note</span>
              </button>
            </div>
            <ul className="notes-window__list">
              {sortedNotes.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={`notes-window__row ${n.id === activeId ? 'notes-window__row--active' : ''} ${store.pinnedNoteId === n.id ? 'notes-window__row--pinned' : ''}`}
                    onClick={() => setActiveId(n.id)}
                  >
                    <span className="notes-window__row-title">{n.title?.trim() || 'Untitled'}</span>
                    <span className="notes-window__row-date">
                      {new Date(n.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="notes-window__sidebar-head">
            <button type="button" className="notes-window__new" onClick={() => todoAdd(null)}>
              <Plus size={18} strokeWidth={2} />
              <span>New Todo</span>
            </button>
            <p className="notes-window__todo-hint">
              Synced live with the desktop Todos widget.
            </p>
          </div>
        )}
      </aside>
      <main className="notes-window__editor">
        {view === 'todos' ? (
          <div className="notes-window__todos">
            <div className="notes-window__todos-head">
              <h2 className="notes-window__todos-title">Todos</h2>
              <button type="button" className="notes-window__add-item" onClick={() => todoAdd(null)}>
                Add todo
              </button>
            </div>
            {todos.todos.length === 0 ? (
              <p className="notes-window__empty">No todos yet. Add one to get started.</p>
            ) : (
              <ul className="notes-window__todo-tree">
                {todos.todos.map((node) => (
                  <TodoEditorRow
                    key={node.id}
                    node={node}
                    depth={0}
                    onToggle={todoToggle}
                    onText={todoSetText}
                    onAdd={todoAdd}
                    onDelete={todoDelete}
                  />
                ))}
              </ul>
            )}
          </div>
        ) : activeNote ? (
          <>
            <div className="notes-window__toolbar">
              <button
                type="button"
                className={`notes-window__pin ${store.pinnedNoteId === activeId ? 'notes-window__pin--on' : ''}`}
                onClick={togglePin}
                title={store.pinnedNoteId === activeId ? 'Unpin from desktop widget' : 'Pin to desktop widget'}
              >
                <Pin size={18} strokeWidth={2} fill={store.pinnedNoteId === activeId ? 'currentColor' : 'none'} />
              </button>
              <button type="button" className="notes-window__trash" onClick={deleteActive} title="Delete note">
                <Trash2 size={18} strokeWidth={2} />
              </button>
            </div>
            <input
              className="notes-window__title-input"
              value={activeNote.title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              aria-label="Note title"
            />
            <div className="notes-window__check-section">
              <div className="notes-window__check-head">
                <span>Checklist</span>
                <button type="button" className="notes-window__add-item" onClick={addChecklistItem}>
                  Add item
                </button>
              </div>
              <ul className="notes-window__checklist">
                {checklist.items.map((it) => (
                  <li key={it.id} className="notes-window__check-row">
                    <input
                      type="checkbox"
                      checked={!!it.done}
                      onChange={(e) => toggleItem(it.id, e.target.checked)}
                      className="notes-window__checkbox"
                    />
                    <input
                      type="text"
                      className="notes-window__item-input"
                      value={it.text}
                      onChange={(e) => setItemText(it.id, e.target.value)}
                      placeholder="List item"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="notes-window__empty">Select or create a note.</p>
        )}
      </main>
    </div>
  )
}
