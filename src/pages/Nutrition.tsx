import { useState } from 'react'
import { Check, Moon, Pencil, Plus, Trash2 } from 'lucide-react'
import { Card, CheckRow, Counter, Stepper } from '../components/ui'
import { LIGHT_DINNERS, LIGHT_EVENING, MEMO, POSTPARTUM, lightStreak, useHabits, useNutritionLog, type Habit } from '../lib/nutrition'
import { DAY_SHORT, addDays, dateKey, isoWeekday, longDate, sameDay, today } from '../lib/dates'
import { uid } from '../lib/store'

export function LightEvening({ date }: { date: Date }) {
  const [log, setLog] = useNutritionLog()
  const key = dateKey(date)
  const done = !!log[key]?.[LIGHT_EVENING]
  const streak = lightStreak(log, today())
  const toggle = () => setLog((p) => ({ ...p, [key]: { ...p[key], [LIGHT_EVENING]: done ? 0 : 1 } }))
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today(), i - 6))
  return (
    <div className={`light-card ${done ? 'is-done' : ''}`}>
      <button type="button" role="checkbox" aria-checked={done} className="light-toggle" onClick={toggle}>
        <span className="light-icon">{done ? <Check size={22} strokeWidth={3} /> : <Moon size={22} />}</span>
        <span>
          <b>J’ai mangé léger ce soir</b>
          <small>{done ? 'Bravo, objectif réussi !' : 'Coche la case après le dîner'}</small>
        </span>
      </button>
      <div className="light-stats">
        <div className="streak">
          <b>{streak}</b>
          <small>{streak > 1 ? 'soirs de suite' : 'soir de suite'}</small>
        </div>
        <div className="last7">
          {last7.map((d) => (
            <span key={dateKey(d)} className={log[dateKey(d)]?.[LIGHT_EVENING] ? 'on' : ''} title={longDate(d)}>
              <i />
              {DAY_SHORT[isoWeekday(d) - 1].slice(0, 1)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function HabitList({ date }: { date: Date }) {
  const [habits] = useHabits()
  const [log, setLog] = useNutritionLog()
  const key = dateKey(date)
  const day = log[key] ?? {}
  const set = (id: string, v: number) => setLog((p) => ({ ...p, [key]: { ...p[key], [id]: v } }))
  return (
    <div className="habit-list">
      {habits.map((h) =>
        h.target <= 1 ? (
          <CheckRow key={h.id} checked={(day[h.id] ?? 0) >= 1} onToggle={() => set(h.id, (day[h.id] ?? 0) >= 1 ? 0 : 1)} title={h.label} />
        ) : (
          <Counter key={h.id} label={h.label} value={day[h.id] ?? 0} target={h.target} onChange={(v) => set(h.id, v)} />
        ),
      )}
    </div>
  )
}

function HabitEditor({ onDone }: { onDone: () => void }) {
  const [habits, setHabits] = useHabits()
  const [label, setLabel] = useState('')
  const [target, setTarget] = useState(1)
  const update = (id: string, patch: Partial<Habit>) => setHabits((p) => p.map((h) => (h.id === id ? { ...h, ...patch } : h)))
  return (
    <div className="habit-editor">
      {habits.map((h) => (
        <div key={h.id} className="habit-edit-row">
          <input value={h.label} onChange={(e) => update(h.id, { label: e.target.value })} aria-label="Nom de l’objectif" />
          <label className="target">
            <input type="number" min={1} max={20} value={h.target} onChange={(e) => update(h.id, { target: Math.max(1, Number(e.target.value) || 1) })} aria-label="Nombre par jour" />
            <small>/ jour</small>
          </label>
          <button type="button" className="round" aria-label={`Supprimer ${h.label}`} onClick={() => setHabits((p) => p.filter((x) => x.id !== h.id))}>
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <div className="habit-edit-row new">
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Nouvel objectif (ex. Une tisane)" />
        <label className="target">
          <input type="number" min={1} max={20} value={target} onChange={(e) => setTarget(Math.max(1, Number(e.target.value) || 1))} aria-label="Nombre par jour" />
          <small>/ jour</small>
        </label>
        <button
          type="button"
          className="round primary"
          aria-label="Ajouter l’objectif"
          disabled={!label.trim()}
          onClick={() => {
            setHabits((p) => [...p, { id: uid(), label: label.trim(), target }])
            setLabel('')
            setTarget(1)
          }}
        >
          <Plus size={16} />
        </button>
      </div>
      <button type="button" className="btn primary full" onClick={onDone}>
        Terminé
      </button>
    </div>
  )
}

export default function Nutrition() {
  const [date, setDate] = useState(today)
  const [editing, setEditing] = useState(false)
  return (
    <>
      <h1 className="page-title">Nutrition</h1>
      <Stepper label={longDate(date)} onPrev={() => setDate(addDays(date, -1))} onNext={() => setDate(addDays(date, 1))} onToday={() => setDate(today())} showToday={!sameDay(date, today())} />
      <LightEvening date={date} />
      <Card
        title="Mes objectifs du jour"
        action={
          !editing && (
            <button type="button" className="btn small ghost" onClick={() => setEditing(true)}>
              <Pencil size={14} /> Modifier
            </button>
          )
        }
      >
        {editing ? <HabitEditor onDone={() => setEditing(false)} /> : <HabitList date={date} />}
      </Card>

      <Card title="Idées de dîner léger">
        <ul className="bullets">
          {LIGHT_DINNERS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </Card>

      <Card title="Mémo : les repères importants">
        <div className="memo-list">
          {MEMO.map((m) => (
            <details key={m.title}>
              <summary>{m.title}</summary>
              <p>{m.text}</p>
            </details>
          ))}
        </div>
      </Card>

      <Card title="Après l’accouchement">
        <div className="memo-list">
          {POSTPARTUM.map((m) => (
            <details key={m.title}>
              <summary>{m.title}</summary>
              <p>{m.text}</p>
            </details>
          ))}
        </div>
      </Card>
    </>
  )
}
