import { useStored } from './store'
import { dateKey, parseKey, shortDate, today } from './dates'

export interface Todo {
  id: string
  text: string
  done: boolean
  date?: string
  doneAt?: string
  createdAt: number
}

export interface Memo {
  id: string
  text: string
  createdAt: number
}

export function useTodos() {
  return useStored<Todo[]>('todo.items', () => [])
}

export function useMemos() {
  return useStored<Memo[]>('todo.memos', () => [])
}

export function dueLabel(t: Todo) {
  if (!t.date) return undefined
  const k = dateKey(today())
  if (t.date < k) return `En retard · ${shortDate(parseKey(t.date))}`
  if (t.date === k) return 'Aujourd’hui'
  return `Pour le ${shortDate(parseKey(t.date))}`
}

export function sortTodos(list: Todo[]) {
  return [...list].sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999') || a.createdAt - b.createdAt)
}

