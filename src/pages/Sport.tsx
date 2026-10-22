import { Fragment, useState } from 'react'
import { ChevronDown, Minus, Plus, ShieldCheck } from 'lucide-react'
import { Card, CheckRow } from '../components/ui'
import { PHASES, SAFETY, currentPhase, sessionFor, useSport, useSportDone, type Session } from '../lib/sport'
import { DAY_LONG, addDays, dateKey, diffDays, longDate, parseKey, sameDay, startOfWeek, today } from '../lib/dates'

export function SessionView({ date, session, compact = false }: { date: Date; session: Session; compact?: boolean }) {
  const [done, setDone] = useSportDone()
  const [open, setOpen] = useState<string | null>(null)
  const key = dateKey(date)
  const list = done[key] ?? []
  const toggle = (id: string) => setDone((p) => ({ ...p, [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] }))
  return (
    <div className="session">
      <div className="session-head">
        <div>
          <b>{session.title}</b>
          <small>
            {session.focus}
            {session.minutes > 0 && ` · environ ${session.minutes} min`}
          </small>
        </div>
        <span className="badge">
          {session.items.filter((i) => list.includes(i.id)).length}/{session.items.length}
        </span>
      </div>
      {session.items.map((ex) => (
        <Fragment key={ex.id}>
          <CheckRow checked={list.includes(ex.id)} onToggle={() => toggle(ex.id)} title={ex.name} subtitle={ex.dose}>
            {!compact && (
              <button type="button" className={`round ghost ${open === ex.id ? 'flip' : ''}`} aria-label={`Comment faire : ${ex.name}`} onClick={() => setOpen(open === ex.id ? null : ex.id)}>
                <ChevronDown size={16} />
              </button>
            )}
          </CheckRow>
          {!compact && open === ex.id && <p className="how">{ex.how}</p>}
        </Fragment>
      ))}
    </div>
  )
}

export default function Sport() {
  const [state, setState] = useSport()
  const [done] = useSportDone()
  const now = today()
  const [date, setDate] = useState(now)
  const phase = currentPhase(state, now)
  const finished = state.reeducDone >= state.reeducTotal
  const left = Math.max(0, state.reeducTotal - state.reeducDone)
  const weekStart = startOfWeek(now)
  const daysInPhase = state.phase2Start ? diffDays(now, parseKey(state.phase2Start)) : 0

  const setCount = (n: number) => setState((s) => ({ ...s, reeducDone: Math.min(s.reeducTotal, Math.max(0, n)), ...(n < s.reeducTotal ? { feuVert: false, phase2Start: undefined } : {}) }))

  return (
    <>
      <h1 className="page-title">Sport</h1>

      <Card title="Rééducation du périnée">
        <div className="reeduc">
          <button type="button" className="round" aria-label="Retirer une séance" onClick={() => setCount(state.reeducDone - 1)} disabled={state.reeducDone === 0}>
            <Minus size={16} />
          </button>
          <div className="reeduc-mid">
            <b>
              {state.reeducDone} / {state.reeducTotal}
            </b>
            <small>séances faites</small>
          </div>
          <button type="button" className="round primary" aria-label="Ajouter une séance" onClick={() => setCount(state.reeducDone + 1)} disabled={finished}>
            <Plus size={16} />
          </button>
        </div>
        <div className="progress">
          <span style={{ width: `${(state.reeducDone / state.reeducTotal) * 100}%` }} />
        </div>
        <p className="hint">
          {finished
            ? 'Rééducation terminée, bravo !'
            : `Encore ${left} séance${left > 1 ? 's' : ''}. À une séance par semaine, la reprise des abdos est possible dans environ ${left} semaine${left > 1 ? 's' : ''}.`}
        </p>
        {finished && (
          <CheckRow
            checked={state.feuVert}
            onToggle={() => setState((s) => (s.feuVert ? { ...s, feuVert: false, phase2Start: undefined } : { ...s, feuVert: true, phase2Start: dateKey(now) }))}
            className="no-strike"
            title="Ma sage-femme ou ma kiné m’a donné le feu vert"
            subtitle="Coche-la seulement après leur accord : le programme passe alors à la reprise progressive."
          />
        )}
      </Card>

      <div className="phase">
        <div className="phase-steps">
          {([1, 2, 3] as const).map((p) => (
            <span key={p} className={p === phase ? 'on' : p < phase ? 'past' : ''}>
              {p}. {PHASES[p].name}
            </span>
          ))}
        </div>
        <p>{PHASES[phase].text}</p>
        {phase === 2 && <p className="hint">Passage automatique au renforcement dans {Math.max(0, 28 - daysInPhase)} jours.</p>}
      </div>

      <Card title={sameDay(date, now) ? 'Séance du jour' : longDate(date)}>
        <SessionView key={dateKey(date)} date={date} session={sessionFor(phase, date)} />
      </Card>

      <Card title="Ma semaine">
        <div className="week-list">
          {Array.from({ length: 7 }, (_, i) => {
            const d = addDays(weekStart, i)
            const s = sessionFor(phase, d)
            const n = s.items.filter((x) => (done[dateKey(d)] ?? []).includes(x.id)).length
            return (
              <button key={i} type="button" className={`week-row ${sameDay(d, now) ? 'is-today' : ''} ${sameDay(d, date) ? 'is-selected' : ''}`} onClick={() => setDate(d)}>
                <span className="week-day">
                  <b>{DAY_LONG[i].slice(0, 3)}</b>
                  <small>{d.getDate()}</small>
                </span>
                <span className="week-items col">
                  <span className="check-title">{s.title}</span>
                  <span className="muted">{s.focus}</span>
                </span>
                <span className={`badge ${n === s.items.length ? 'ok' : ''}`}>
                  {n}/{s.items.length}
                </span>
              </button>
            )
          })}
        </div>
      </Card>

      <p className="safety">
        <ShieldCheck size={18} />
        <span>{SAFETY}</span>
      </p>
    </>
  )
}
