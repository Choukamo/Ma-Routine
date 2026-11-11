import { useState } from 'react'
import { Check, ChevronDown, Luggage, Pencil, Plus, RotateCcw, Save, Trash2, X } from 'lucide-react'
import { Card, Empty } from '../components/ui'
import { checkKey, sharedCheckKey, TRAVEL_CATEGORIES, TRAVEL_PEOPLE, TRAVEL_SHARED_CATEGORY, useTravelChecks, useTravelGeneralItems, useTravelLists, useTravelSharedItems, type TravelCategory, type TravelItem, type TravelPerson } from '../lib/travel'

function Category({
  person,
  category,
  items,
  checks,
  toggle,
  addItem,
  renameItem,
  removeItem,
}: {
  person: TravelPerson
  category: TravelCategory
  items: TravelItem[]
  checks: Record<string, boolean>
  toggle: (key: string) => void
  addItem: (person: TravelPerson, category: TravelCategory, label: string) => void
  renameItem: (person: TravelPerson, category: TravelCategory, itemId: string, label: string) => void
  removeItem: (person: TravelPerson, category: TravelCategory, itemId: string) => void
}) {
  const [open, setOpen] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const done = items.filter((item) => checks[checkKey(person, category, item.id)]).length
  const submitNew = () => {
    if (!newLabel.trim()) return
    addItem(person, category, newLabel)
    setNewLabel('')
    setAdding(false)
  }

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
          {items.length === 0 && <Empty>Aucun élément personnalisé.</Empty>}
          {items.map((item) => {
            const key = checkKey(person, category, item.id)
            const checked = Boolean(checks[key])
            const editing = editingId === item.id
            return (
              <div key={item.id} className={editing ? 'travel-item editing' : checked ? 'travel-item is-done' : 'travel-item'}>
                {editing ? (
                  <>
                    <input
                      className="travel-edit-input"
                      value={editingLabel}
                      aria-label={`Modifier ${item.label}`}
                      onChange={(event) => setEditingLabel(event.target.value)}
                      onKeyDown={(event) => event.key === 'Enter' && editingLabel.trim() && (renameItem(person, category, item.id, editingLabel), setEditingId(null))}
                      autoFocus
                    />
                    <button type="button" className="round ghost" aria-label="Enregistrer la modification" onClick={() => editingLabel.trim() && (renameItem(person, category, item.id, editingLabel), setEditingId(null))}>
                      <Save size={15} />
                    </button>
                    <button type="button" className="round ghost" aria-label="Annuler la modification" onClick={() => setEditingId(null)}>
                      <X size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <label className="travel-item-main">
                      <input type="checkbox" checked={checked} onChange={() => toggle(key)} />
                      <span className="travel-check">{checked && <Check size={14} strokeWidth={3} />}</span>
                      <span>{item.label}</span>
                    </label>
                    <button type="button" className="round ghost" aria-label={`Modifier ${item.label}`} onClick={() => (setEditingId(item.id), setEditingLabel(item.label))}>
                      <Pencil size={14} />
                    </button>
                    <button type="button" className="round ghost danger-icon" aria-label={`Supprimer ${item.label}`} onClick={() => removeItem(person, category, item.id)}>
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            )
          })}
          {adding ? (
            <div className="travel-add-row">
              <input value={newLabel} onChange={(event) => setNewLabel(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submitNew()} placeholder="Ex. Carnet de santé" aria-label={`Nouvel élément ${category}`} autoFocus />
              <button type="button" className="round primary" aria-label="Ajouter l’élément" onClick={submitNew} disabled={!newLabel.trim()}><Save size={15} /></button>
              <button type="button" className="round ghost" aria-label="Annuler l’ajout" onClick={() => (setAdding(false), setNewLabel(''))}><X size={15} /></button>
            </div>
          ) : (
            <button type="button" className="travel-add-button" onClick={() => setAdding(true)}><Plus size={15} /> Ajouter un élément</button>
          )}
        </div>
      )}
    </div>
  )
}

function Person({ person, lists, checks, toggle, addItem, renameItem, removeItem }: { person: TravelPerson; lists: Record<TravelCategory, TravelItem[]>; checks: Record<string, boolean>; toggle: (key: string) => void; addItem: (person: TravelPerson, category: TravelCategory, label: string) => void; renameItem: (person: TravelPerson, category: TravelCategory, itemId: string, label: string) => void; removeItem: (person: TravelPerson, category: TravelCategory, itemId: string) => void }) {
  const personTotal = Object.values(lists).reduce((count, items) => count + items.length, 0)
  const personDone = TRAVEL_CATEGORIES.reduce(
    (count, category) => count + lists[category].filter((item) => checks[checkKey(person, category, item.id)]).length,
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
          <Category key={category} person={person} category={category} items={lists[category]} checks={checks} toggle={toggle} addItem={addItem} renameItem={renameItem} removeItem={removeItem} />
        ))}
      </div>
    </Card>
  )
}

function SharedChecklist({
  title,
  description,
  addLabel,
  emptyLabel,
  items,
  checks,
  toggle,
  addItem,
  renameItem,
  removeItem,
}: {
  title: string
  description: string
  addLabel: string
  emptyLabel: string
  items: TravelItem[]
  checks: Record<string, boolean>
  toggle: (key: string) => void
  addItem: (label: string) => void
  renameItem: (itemId: string, label: string) => void
  removeItem: (itemId: string) => void
}) {
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const checked = items.filter((item) => checks[sharedCheckKey(item.id)]).length
  const submitNew = () => {
    if (!newLabel.trim()) return
    addItem(newLabel)
    setNewLabel('')
    setAdding(false)
  }

  return (
    <Card className="travel-family">
      <div className="travel-person-head">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <span className={items.length > 0 && checked === items.length ? 'badge ok' : 'badge'}>{checked}/{items.length}</span>
      </div>
      <div className="travel-family-items">
        {items.length === 0 && <Empty>{emptyLabel}</Empty>}
        {items.map((item) => {
          const key = sharedCheckKey(item.id)
          const isChecked = Boolean(checks[key])
          const editing = editingId === item.id
          return (
            <div key={item.id} className={editing ? 'travel-item editing' : isChecked ? 'travel-item is-done' : 'travel-item'}>
              {editing ? (
                <>
                  <input className="travel-edit-input" value={editingLabel} aria-label={`Modifier ${item.label}`} onChange={(event) => setEditingLabel(event.target.value)} autoFocus />
                  <button type="button" className="round ghost" aria-label="Enregistrer la modification" onClick={() => editingLabel.trim() && (renameItem(item.id, editingLabel), setEditingId(null))}><Save size={15} /></button>
                  <button type="button" className="round ghost" aria-label="Annuler la modification" onClick={() => setEditingId(null)}><X size={15} /></button>
                </>
              ) : (
                <>
                  <label className="travel-item-main">
                    <input type="checkbox" checked={isChecked} onChange={() => toggle(key)} />
                    <span className="travel-check">{isChecked && <Check size={14} strokeWidth={3} />}</span>
                    <span>{item.label}</span>
                  </label>
                  <button type="button" className="round ghost" aria-label={`Modifier ${item.label}`} onClick={() => (setEditingId(item.id), setEditingLabel(item.label))}><Pencil size={14} /></button>
                  <button type="button" className="round ghost danger-icon" aria-label={`Supprimer ${item.label}`} onClick={() => removeItem(item.id)}><Trash2 size={14} /></button>
                </>
              )}
            </div>
          )
        })}
        {adding ? (
          <div className="travel-add-row">
            <input value={newLabel} onChange={(event) => setNewLabel(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submitNew()} placeholder="Ex. Jeux de société" aria-label="Nouvel élément famille" autoFocus />
            <button type="button" className="round primary" aria-label="Ajouter l’élément famille" onClick={submitNew} disabled={!newLabel.trim()}><Save size={15} /></button>
            <button type="button" className="round ghost" aria-label="Annuler l’ajout" onClick={() => (setAdding(false), setNewLabel(''))}><X size={15} /></button>
          </div>
        ) : (
          <button type="button" className="travel-add-button" onClick={() => setAdding(true)}><Plus size={15} /> {addLabel}</button>
        )}
      </div>
    </Card>
  )
}

export default function Travel() {
  const { checks, toggle, reset, checked } = useTravelChecks()
  const { lists, addItem, renameItem, removeItem, total } = useTravelLists()
  const { items: familyItems, addItem: addFamilyItem, renameItem: renameFamilyItem, removeItem: removeFamilyItem, total: familyTotal } = useTravelSharedItems()
  const { items: generalItems, addItem: addGeneralItem, renameItem: renameGeneralItem, removeItem: removeGeneralItem, total: generalTotal } = useTravelGeneralItems()
  const fullTotal = total + familyTotal + generalTotal
  const allDone = checked === fullTotal

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
            <p>{checked}/{fullTotal} éléments cochés</p>
          </div>
          <strong>{Math.round((checked / fullTotal) * 100)}%</strong>
        </div>
        <div className="progress"><span style={{ width: `${(checked / fullTotal) * 100}%` }} /></div>
        {checked > 0 && (
          <button type="button" className="btn small ghost travel-reset" onClick={() => confirm('Réinitialiser toutes les cases du voyage ?') && reset()}>
            <RotateCcw size={14} /> Recommencer
          </button>
        )}
      </Card>

      <SharedChecklist title={TRAVEL_SHARED_CATEGORY} description="Une seule case pour les affaires partagées par toute la famille." addLabel="Ajouter un élément famille" emptyLabel="Aucun élément partagé pour l’instant." items={familyItems} checks={checks} toggle={toggle} addItem={addFamilyItem} renameItem={renameFamilyItem} removeItem={removeFamilyItem} />

      {TRAVEL_PEOPLE.map((person) => (
        <Person key={person} person={person} lists={lists[person]} checks={checks} toggle={toggle} addItem={addItem} renameItem={renameItem} removeItem={removeItem} />
      ))}

      <SharedChecklist title="Pense-bête général — Divers" description="Ta liste personnelle pour les choses à ne pas oublier." addLabel="Ajouter au pense-bête" emptyLabel="Ajoute ton premier élément : fil électrique, appareil photo, sac-poubelle…" items={generalItems} checks={checks} toggle={toggle} addItem={addGeneralItem} renameItem={renameGeneralItem} removeItem={removeGeneralItem} />

      <p className="hint travel-hint">Les cases sont enregistrées automatiquement sur ce téléphone.</p>
    </>
  )
}

export function TravelSummary() {
  const { checked } = useTravelChecks()
  const { total } = useTravelLists()
  const { total: familyTotal } = useTravelSharedItems()
  const { total: generalTotal } = useTravelGeneralItems()
  const fullTotal = total + familyTotal + generalTotal
  if (fullTotal === 0) return <Empty>La checklist est vide.</Empty>
  return <p className="travel-summary">{checked}/{fullTotal} éléments cochés · {Math.round((checked / fullTotal) * 100)}% prêt</p>
}
