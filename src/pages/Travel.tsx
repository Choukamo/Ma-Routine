import { useState } from 'react'
import { Check, ChevronDown, Luggage, RotateCcw } from 'lucide-react'
import { Card, Empty } from '../components/ui'
import { checkKey, TRAVEL_CATEGORIES, TRAVEL_ITEMS, TRAVEL_PEOPLE, useTravelChecks, type TravelCategory, type TravelPerson } from '../lib/travel'

function Category({
  person,
  category,
  checks,
  toggle,
}: {
  person: TravelPerson
  category: TravelCategory
  checks: Record<string, boolean>
  toggle: (key: string) => void
}) {
  const [open, setOpen] = useState(true)
  const items = TRAVEL_ITEMS[category]
  const done = items.filter((item) => checks[checkKey(person, category, item.id)]).length

  return (
    <div className="travel-category">
      <button type="button" className="travel-category-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>
          <b>{category}</b>
          <small>{done}/{items.length}</small>
        </span>
        <ChevronDown size={18} className={open ? 'travel-chevron open' : 'travel-chevron'} />
      </button>
      {open && (
        <div className="travel-items">
          {items.map((item) => {
            const key = checkKey(person, category, item.id)
            const checked = Boolean(checks[key])
            return (
              <label key={item.id} className={checked ? 'travel-item is-done' : 'travel-item'}>
                <input type="checkbox" checked={checked} onChange={() => toggle(key)} />
                <span className="travel-check">{checked && <Check size={14} strokeWidth={3} />}</span>
                <span>{item.label}</span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Person({ person, checks, toggle }: { person: TravelPerson; checks: Record<string, boolean>; toggle: (key: string) => void }) {
  const personTotal = Object.values(TRAVEL_ITEMS).reduce((count, items) => count + items.length, 0)
  const personDone = TRAVEL_CATEGORIES.reduce(
    (count, category) => count + TRAVEL_ITEMS[category].filter((item) => checks[checkKey(person, category, item.id)]).length,
    0,
  )

  return (
    <Card className="travel-person">
      <div className="travel-person-head">
        <div>
          <h2>{person}</h2>
          <p>{personDone === personTotal ? 'Valise prête !' : `${personDone}/${personTotal} éléments cochés`}</p>
        </div>
        <span className={personDone === personTotal ? 'badge ok' : 'badge'}>{Math.round((personDone / personTotal) * 100)}%</span>
      </div>
      <div className="travel-categories">
        {TRAVEL_CATEGORIES.map((category) => (
          <Category key={category} person={person} category={category} checks={checks} toggle={toggle} />
        ))}
      </div>
    </Card>
  )
}

export default function Travel() {
  const { checks, toggle, reset, total, checked } = useTravelChecks()
  const allDone = checked === total

  return (
    <>
      <header className="travel-hero">
        <div className="travel-hero-icon"><Luggage size={25} /></div>
        <div>
          <h1 className="page-title">Voyages</h1>
          <p>Le pense-bête pour préparer les valises sans rien oublier.</p>
        </div>
      </header>

      <Card className={allDone ? 'travel-progress is-done' : 'travel-progress'}>
        <div className="travel-progress-head">
          <div>
            <b>{allDone ? 'Tout est prêt !' : 'Préparation du voyage'}</b>
            <p>{checked}/{total} éléments cochés</p>
          </div>
          <strong>{Math.round((checked / total) * 100)}%</strong>
        </div>
        <div className="progress"><span style={{ width: `${(checked / total) * 100}%` }} /></div>
        {checked > 0 && (
          <button type="button" className="btn small ghost travel-reset" onClick={() => confirm('Réinitialiser toutes les cases du voyage ?') && reset()}>
            <RotateCcw size={14} /> Recommencer
          </button>
        )}
      </Card>

      {TRAVEL_PEOPLE.map((person) => (
        <Person key={person} person={person} checks={checks} toggle={toggle} />
      ))}

      <p className="hint travel-hint">Les cases sont enregistrées automatiquement sur ce téléphone.</p>
    </>
  )
}

export function TravelSummary() {
  const { checked, total } = useTravelChecks()
  if (total === 0) return <Empty>La checklist est vide.</Empty>
  return <p className="travel-summary">{checked}/{total} éléments cochés · {Math.round((checked / total) * 100)}% prêt</p>
}
