import { useState } from 'react'
import { CalendarDays, Plus, Trash2, X } from 'lucide-react'
import { Card, CheckRow, Empty } from '../components/ui'
import { dueLabel, useMemos, useTodos, sortTodos, type Todo } from '../lib/todo'
import { dateKey, today } from '../lib/dates'
import { uid } from '../lib/store'

export function TodoRow({ t }: { t: Todo }) {
  const [, setTodos] = useTodos()
  const late = !t.done && t.date && t.date < dateKey(today())
  return (
    <CheckRow
      checked={t.done}
      onToggle={() => setTodos((p) => p.map((x) => (x.id === t.id ? { ...x, done: !x.done, doneAt: !x.done ? dateKey(today()) : undefined } : x)))}
      title={t.text}
      subtitle={dueLabel(t) && <span className={late ? 'late' : ''}>{dueLabel(t)}</span>}
    >
      <button type="button" className="round ghost" aria-label={`Supprimer ${t.text}`} onClick={() => setTodos((p) => p.filter((x) => x.id !== t.id))}>
        <Trash2 size={16} />
      </button>
    </CheckRow>
  )
}

function Memos() {
  const [memos, setMemos] = useMemos()
  const [text, setText] = useState('')
  const add = () => {
    if (!text.trim()) return
    setMemos((p) => [{ id: uid(), text: text.trim(), createdAt: Date.now() }, ...p])
    setText('')
  }
  return (
    <Card title="Pense-bête">
      <div className="memo-add">
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Écris un petit mémo…" rows={2} />
        <button type="button" className="btn primary" onClick={add} disabled={!text.trim()}>
          Ajouter
        </button>
      </div>
      {memos.length === 0 && <Empty>Aucun mémo pour l’instant.</Empty>}
      <div className="notes">
        {memos.map((m) => (
          <div key={m.id} className="note">
            <textarea
              value={m.text}
              aria-label="Mémo"
              onChange={(e) => setMemos((p) => p.map((x) => (x.id === m.id ? { ...x, text: e.target.value } : x)))}
              rows={Math.max(2, m.text.split('\n').length)}
            />
            <button type="button" className="round ghost" aria-label="Supprimer le mémo" onClick={() => confirm('Supprimer ce mémo ?') && setMemos((p) => p.filter((x) => x.id !== m.id))}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function TodoPage() {
  const [todos, setTodos] = useTodos()
  const [text, setText] = useState('')
  const [date, setDate] = useState('')
  const [withDate, setWithDate] = useState(false)
  const open = sortTodos(todos.filter((t) => !t.done))
  const done = todos.filter((t) => t.done)
  const add = () => {
    if (!text.trim()) return
    setTodos((p) => [...p, { id: uid(), text: text.trim(), done: false, date: withDate && date ? date : undefined, createdAt: Date.now() }])
    setText('')
  }
  return (
    <>
      <h1 className="page-title">À faire</h1>
      <Card>
        <form
          className="todo-add"
          onSubmit={(e) => {
            e.preventDefault()
            add()
          }}
        >
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ex. Racheter de la viande" aria-label="Nouvelle tâche" />
          <button type="submit" className="round primary big" aria-label="Ajouter la tâche" disabled={!text.trim()}>
            <Plus size={20} />
          </button>
        </form>
        <div className="todo-date">
          <button type="button" className={`btn small ghost ${withDate ? 'on' : ''}`} onClick={() => setWithDate(!withDate)}>
            <CalendarDays size={14} /> {withDate ? 'Pour le :' : 'Ajouter une date'}
          </button>
          {withDate && <input type="date" value={date} min={dateKey(today())} onChange={(e) => setDate(e.target.value)} aria-label="Date" />}
        </div>
      </Card>

      <Card title={`Ma liste${open.length ? ` (${open.length})` : ''}`}>
        {open.length === 0 && <Empty>Tout est fait. Bravo !</Empty>}
        {open.map((t) => (
          <TodoRow key={t.id} t={t} />
        ))}
      </Card>

      {done.length > 0 && (
        <Card
          title={`Fait (${done.length})`}
          action={
            <button type="button" className="btn small ghost" onClick={() => setTodos((p) => p.filter((t) => !t.done))}>
              Tout effacer
            </button>
          }
          className="muted-card"
        >
          {done.map((t) => (
            <TodoRow key={t.id} t={t} />
          ))}
        </Card>
      )}

      <Memos />
    </>
  )
}
