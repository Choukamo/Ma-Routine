import { useRef } from 'react'
import { ArrowRight, Download, Upload } from 'lucide-react'
import { Card, Empty } from '../components/ui'
import { BeautyDay } from './Beauty'
import { HabitList, LightEvening } from './Nutrition'
import { SessionView } from './Sport'
import { TodoRow } from './Todo'
import { currentPhase, sessionFor, useSport } from '../lib/sport'
import { sortTodos, useMemos, useTodos } from '../lib/todo'
import { dateKey, longDate, today } from '../lib/dates'
import { exportAll, importAll } from '../lib/store'
import type { Tab } from '../App'

function greeting() {
  const h = new Date().getHours()
  return h < 18 ? 'Bonjour' : 'Bonsoir'
}

function More({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" className="btn small ghost" onClick={onClick}>
      {label} <ArrowRight size={14} />
    </button>
  )
}

export default function Today({ go }: { go: (t: Tab) => void }) {
  const d = today()
  const [sport] = useSport()
  const [todos] = useTodos()
  const [memos] = useMemos()
  const file = useRef<HTMLInputElement>(null)
  const k = dateKey(d)
  const openTodos = sortTodos(todos.filter((t) => !t.done && (!t.date || t.date <= k)))
  const later = todos.filter((t) => !t.done && t.date && t.date > k).length

  const backup = () => {
    const blob = new Blob([exportAll()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `ma-routine-${k}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const restore = async (f: File) => {
    try {
      if (!confirm('Remplacer les données actuelles par celles de la sauvegarde ?')) return
      importAll(await f.text())
      alert('Sauvegarde restaurée.')
    } catch {
      alert('Ce fichier n’est pas une sauvegarde Ma Routine.')
    }
  }

  return (
    <>
      <header className="hello">
        <small>{longDate(d)}</small>
        <h1>{greeting()}</h1>
      </header>

      <Card title="Beauté" action={<More label="Planning" onClick={() => go('beaute')} />}>
        <BeautyDay date={d} compact />
      </Card>

      <LightEvening date={d} />

      <Card title="Nutrition" action={<More label="Mémo" onClick={() => go('nutrition')} />}>
        <HabitList date={d} />
      </Card>

      <Card title="Sport" action={<More label="Programme" onClick={() => go('sport')} />}>
        <SessionView date={d} session={sessionFor(currentPhase(sport, d), d)} compact />
      </Card>

      <Card title="À faire" action={<More label="Tout voir" onClick={() => go('todo')} />}>
        {openTodos.length === 0 && <Empty>Rien d’urgent aujourd’hui.</Empty>}
        {openTodos.map((t) => (
          <TodoRow key={t.id} t={t} />
        ))}
        {later > 0 && <p className="hint">+ {later} tâche{later > 1 ? 's' : ''} prévue{later > 1 ? 's' : ''} plus tard</p>}
      </Card>

      {memos.length > 0 && (
        <Card title="Pense-bête" action={<More label="Modifier" onClick={() => go('todo')} />}>
          <div className="notes read">
            {memos.slice(0, 3).map((m) => (
              <p key={m.id} className="note">
                {m.text}
              </p>
            ))}
          </div>
        </Card>
      )}

      <div className="backup">
        <p>Tes données sont enregistrées sur ce téléphone. Pense à faire une sauvegarde de temps en temps.</p>
        <div>
          <button type="button" className="btn small ghost" onClick={backup}>
            <Download size={14} /> Sauvegarder
          </button>
          <button type="button" className="btn small ghost" onClick={() => file.current?.click()}>
            <Upload size={14} /> Restaurer
          </button>
          <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && restore(e.target.files[0])} />
        </div>
      </div>
    </>
  )
}
