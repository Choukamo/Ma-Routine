import { useState, type CSSProperties } from 'react'
import { CalendarRange, Moon, Pencil, Plus, Sun } from 'lucide-react'
import { Card, CheckRow, Empty, Segmented, Sheet, Stepper } from '../components/ui'
import {
  KINDS, dueSlots, freqLabel, kindOf, momentLabel, toWeekPlan, useBeautyDone, useProducts,
  type Frequency, type Kind, type Moment, type Product, type Slot, type WeekPlan,
} from '../lib/beauty'
import { DAY_LONG, DAY_SHORT, MONTHS, addDays, dateKey, daysInMonth, isoWeekday, longDate, sameDay, startOfWeek, today } from '../lib/dates'
import { uid } from '../lib/store'

type View = 'jour' | 'semaine' | 'mois'

function useBeautyToggle() {
  const [done, setDone] = useBeautyDone()
  const toggle = (key: string, id: string) =>
    setDone((prev) => {
      const cur = prev[key] ?? []
      return { ...prev, [key]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] }
    })
  return [done, toggle] as const
}

export function BeautyDay({ date, compact = false }: { date: Date; compact?: boolean }) {
  const [products] = useProducts()
  const [done, toggleDone] = useBeautyToggle()
  const key = dateKey(date)
  const items = dueSlots(products, date)
  const toggle = (id: string) => toggleDone(key, id)
  if (products.length === 0) return <Empty>Aucun produit pour l’instant. Ajoute tes produits dans l’onglet Beauté.</Empty>
  if (items.length === 0) return <Empty>Rien de prévu ce jour-là.</Empty>
  return (
    <div className="slot-list">
      {(['matin', 'soir'] as Slot[]).map((slot) => {
        const list = items.filter((i) => i.slot === slot)
        if (list.length === 0) return null
        return (
          <div key={slot} className="slot">
            <div className="slot-head">
              {slot === 'matin' ? <Sun size={16} /> : <Moon size={16} />}
              {slot === 'matin' ? 'Matin' : 'Soir'}
            </div>
            {list.map(({ product: p }) => {
              const id = `${p.id}:${slot}`
              return (
                <CheckRow
                  key={id}
                  checked={(done[key] ?? []).includes(id)}
                  onToggle={() => toggle(id)}
                  color={kindOf(p.kind).color}
                  title={p.name}
                  subtitle={compact ? kindOf(p.kind).label : [kindOf(p.kind).label, p.note].filter(Boolean).join(' · ')}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function Dots({ products, date }: { products: Product[]; date: Date }) {
  const items = dueSlots(products, date)
  return (
    <span className="dots">
      {items.slice(0, 6).map(({ product, slot }) => (
        <i key={product.id + slot} style={{ background: kindOf(product.kind).color }} />
      ))}
    </span>
  )
}

export default function Beauty() {
  const [products, setProducts] = useProducts()
  const [view, setView] = useState<View>('jour')
  const [date, setDate] = useState(today)
  const [editing, setEditing] = useState<Product | 'new' | null>(null)
  const [planning, setPlanning] = useState(false)
  const now = today()

  const step = (dir: number) => {
    if (view === 'jour') setDate(addDays(date, dir))
    else if (view === 'semaine') setDate(addDays(date, dir * 7))
    else setDate(new Date(date.getFullYear(), date.getMonth() + dir, 1))
  }
  const weekStart = startOfWeek(date)
  const label =
    view === 'jour'
      ? longDate(date)
      : view === 'semaine'
        ? `Semaine du ${weekStart.getDate()} ${MONTHS[weekStart.getMonth()]}`
        : `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
  const isCurrent =
    view === 'jour' ? sameDay(date, now) : view === 'semaine' ? sameDay(weekStart, startOfWeek(now)) : date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  const openDay = (d: Date) => {
    setDate(d)
    setView('jour')
  }

  return (
    <>
      <h1 className="page-title">Beauté</h1>
      <Segmented<View>
        value={view}
        onChange={(v) => {
          setView(v)
          if (v !== 'jour') setDate(date)
        }}
        options={[
          { id: 'jour', label: 'Jour' },
          { id: 'semaine', label: 'Semaine' },
          { id: 'mois', label: 'Mois' },
        ]}
      />
      <Stepper label={label} onPrev={() => step(-1)} onNext={() => step(1)} onToday={() => setDate(today())} showToday={!isCurrent} />

      {view === 'jour' && (
        <Card>
          <BeautyDay date={date} />
        </Card>
      )}

      {view === 'semaine' && (
        <>
          <button type="button" className="btn full-soft" onClick={() => setPlanning(true)}>
            <CalendarRange size={16} /> Modifier le planning de la semaine
          </button>
          <WeekCheck weekStart={weekStart} onOpenDay={openDay} />
        </>
      )}

      {view === 'mois' && (
        <Card>
          <div className="month-grid">
            {DAY_SHORT.map((d) => (
              <span key={d} className="month-dow">
                {d.slice(0, 1)}
              </span>
            ))}
            {Array.from({ length: isoWeekday(new Date(date.getFullYear(), date.getMonth(), 1)) - 1 }, (_, i) => (
              <span key={'e' + i} />
            ))}
            {Array.from({ length: daysInMonth(date.getFullYear(), date.getMonth()) }, (_, i) => {
              const d = new Date(date.getFullYear(), date.getMonth(), i + 1)
              return (
                <button key={i} type="button" className={`month-cell ${sameDay(d, now) ? 'is-today' : ''}`} onClick={() => openDay(d)}>
                  <span>{i + 1}</span>
                  <Dots products={products} date={d} />
                </button>
              )
            })}
          </div>
          <div className="legend">
            {KINDS.filter((k) => products.some((p) => p.kind === k.id)).map((k) => (
              <span key={k.id}>
                <i style={{ background: k.color }} />
                {k.label}
              </span>
            ))}
          </div>
        </Card>
      )}

      <Card
        title="Mes produits"
        action={
          <button type="button" className="btn small" onClick={() => setEditing('new')}>
            <Plus size={16} /> Ajouter
          </button>
        }
      >
        {products.length === 0 && <Empty>Ajoute ta première crème, ton sérum ou ton masque.</Empty>}
        <ul className="product-list">
          {products.map((p) => (
            <li key={p.id}>
              <i className="kind-dot" style={{ background: kindOf(p.kind).color }} />
              <div>
                <div className="check-title">{p.name}</div>
                <div className="check-sub">
                  {kindOf(p.kind).label} · {p.freq.type === 'weekplan' ? freqLabel(p.freq) : `${momentLabel(p.moment)} · ${freqLabel(p.freq)}`}
                </div>
              </div>
              <button type="button" className="round" aria-label={`Modifier ${p.name}`} onClick={() => setEditing(p)}>
                <Pencil size={16} />
              </button>
            </li>
          ))}
        </ul>
      </Card>

      {planning && (
        <WeekPlanner
          onClose={() => setPlanning(false)}
          onAdd={() => {
            setPlanning(false)
            setEditing('new')
          }}
        />
      )}

      {editing && (
        <ProductForm
          initial={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSave={(p) => {
            setProducts((prev) => (prev.some((x) => x.id === p.id) ? prev.map((x) => (x.id === p.id ? p : x)) : [...prev, p]))
            setEditing(null)
          }}
          onDelete={(id) => {
            setProducts((prev) => prev.filter((x) => x.id !== id))
            setEditing(null)
          }}
        />
      )}
    </>
  )
}

function WeekCheck({ weekStart, onOpenDay }: { weekStart: Date; onOpenDay: (d: Date) => void }) {
  const [products] = useProducts()
  const [done, toggle] = useBeautyToggle()
  const now = today()
  return (
    <div className="week-check">
      {Array.from({ length: 7 }, (_, i) => {
        const d = addDays(weekStart, i)
        const key = dateKey(d)
        const items = dueSlots(products, d)
        const n = items.filter(({ product, slot }) => (done[key] ?? []).includes(`${product.id}:${slot}`)).length
        return (
          <Card
            key={key}
            className={sameDay(d, now) ? 'is-today' : ''}
            title={
              <button type="button" className="day-title" onClick={() => onOpenDay(d)}>
                {DAY_LONG[i]} {d.getDate()}
                {sameDay(d, now) && <em>Aujourd’hui</em>}
              </button>
            }
            action={items.length > 0 && <span className={`badge ${n === items.length ? 'ok' : ''}`}>{n}/{items.length}</span>}
          >
            {items.length === 0 && <Empty>Rien de prévu.</Empty>}
            {(['matin', 'soir'] as Slot[]).map((slot) => {
              const list = items.filter((x) => x.slot === slot)
              if (list.length === 0) return null
              return (
                <div key={slot} className="slot">
                  <div className="slot-head">
                    {slot === 'matin' ? <Sun size={16} /> : <Moon size={16} />}
                    {slot === 'matin' ? 'Matin' : 'Soir'}
                  </div>
                  {list.map(({ product: p }) => {
                    const id = `${p.id}:${slot}`
                    return (
                      <CheckRow key={id} checked={(done[key] ?? []).includes(id)} onToggle={() => toggle(key, id)} color={kindOf(p.kind).color} title={p.name} subtitle={kindOf(p.kind).label} />
                    )
                  })}
                </div>
              )
            })}
          </Card>
        )
      })}
    </div>
  )
}

function PlanGrid({ plan, onChange }: { plan: WeekPlan; onChange: (p: WeekPlan) => void }) {
  const toggle = (day: number, slot: Slot) => {
    const cur = plan[String(day)] ?? []
    const next = cur.includes(slot) ? cur.filter((x) => x !== slot) : ([...cur, slot].sort() as Slot[])
    onChange({ ...plan, [String(day)]: next })
  }
  return (
    <div className="plan-grid">
      {DAY_SHORT.map((label, i) => (
        <div key={label} className="plan-day">
          <span>{label}</span>
          {(['matin', 'soir'] as Slot[]).map((slot) => {
            const on = (plan[String(i + 1)] ?? []).includes(slot)
            return (
              <button
                key={slot}
                type="button"
                className={on ? 'on' : ''}
                aria-pressed={on}
                aria-label={`${DAY_LONG[i]} ${slot}`}
                onClick={() => toggle(i + 1, slot)}
              >
                {slot === 'matin' ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function WeekPlanner({ onClose, onAdd }: { onClose: () => void; onAdd: () => void }) {
  const [products, setProducts] = useProducts()
  const setPlan = (id: string, plan: WeekPlan) =>
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, freq: { type: 'weekplan', plan } } : p)))
  return (
    <Sheet title="Planning de la semaine" onClose={onClose}>
      <p className="hint top">
        Pour chaque produit, appuie sur <Sun size={13} /> pour le matin et sur <Moon size={13} /> pour le soir, jour par jour. Le planning se répète chaque semaine.
      </p>
      {products.length === 0 && <Empty>Aucun produit pour l’instant.</Empty>}
      {products.map((p) => {
        const plan = toWeekPlan(p)
        return (
          <div key={p.id} className="plan-product">
            <div className="plan-name">
              <i className="kind-dot" style={{ background: kindOf(p.kind).color }} />
              <b>{p.name}</b>
              <small>{kindOf(p.kind).label}</small>
            </div>
            {plan ? (
              <PlanGrid plan={plan} onChange={(next) => setPlan(p.id, next)} />
            ) : (
              <p className="muted">{freqLabel(p.freq)} — se règle dans « Mes produits ».</p>
            )}
          </div>
        )
      })}
      <div className="sheet-actions">
        <button type="button" className="btn ghost" onClick={onAdd}>
          <Plus size={16} /> Nouveau produit
        </button>
        <button type="button" className="btn primary" onClick={onClose}>
          Terminé
        </button>
      </div>
    </Sheet>
  )
}

type FreqType = Exclude<Frequency['type'], 'weekdays'>

function ProductForm({ initial, onClose, onSave, onDelete }: {
  initial?: Product
  onClose: () => void
  onSave: (p: Product) => void
  onDelete: (id: string) => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [kind, setKind] = useState<Kind>(initial?.kind ?? 'creme')
  const [moment, setMoment] = useState<Moment>(initial?.moment ?? 'soir')
  const initType = initial?.freq.type
  const [ftype, setFtype] = useState<FreqType>(initType === 'weekdays' ? 'weekplan' : (initType ?? 'daily'))
  const [plan, setPlan] = useState<WeekPlan>(() =>
    initial?.freq.type === 'weekplan' || initial?.freq.type === 'weekdays' ? (toWeekPlan(initial) ?? {}) : {},
  )
  const [every, setEvery] = useState(initial?.freq.type === 'interval' ? initial.freq.every : 3)
  const [start, setStart] = useState(initial?.freq.type === 'interval' ? initial.freq.start : dateKey(today()))
  const [monthdays, setMonthdays] = useState<number[]>(initial?.freq.type === 'monthdays' ? initial.freq.days : [1, 15])
  const [note, setNote] = useState(initial?.note ?? '')

  const toggleIn = (list: number[], v: number) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
  const freq: Frequency =
    ftype === 'daily'
      ? { type: 'daily' }
      : ftype === 'weekplan'
        ? { type: 'weekplan', plan }
        : ftype === 'interval'
          ? { type: 'interval', every: Math.max(1, every || 1), start }
          : { type: 'monthdays', days: monthdays }
  const valid = name.trim() && (ftype !== 'weekplan' || Object.values(plan).some((x) => x.length)) && (ftype !== 'monthdays' || monthdays.length)

  return (
    <Sheet title={initial ? 'Modifier le produit' : 'Nouveau produit'} onClose={onClose}>
      <label className="field">
        <span>Nom du produit</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Sérum vitamine C" autoFocus={!initial} />
      </label>

      <div className="field">
        <span>Type</span>
        <div className="chips">
          {KINDS.map((k) => (
            <button key={k.id} type="button" className={`chip-btn ${kind === k.id ? 'on' : ''}`} style={{ '--c': k.color } as CSSProperties} onClick={() => setKind(k.id)}>
              {k.label}
            </button>
          ))}
        </div>
      </div>

      {ftype !== 'weekplan' && (
      <div className="field">
        <span>Quand</span>
        <Segmented<Moment>
          value={moment}
          onChange={setMoment}
          options={[
            { id: 'matin', label: 'Matin' },
            { id: 'soir', label: 'Soir' },
            { id: 'matin-soir', label: 'Matin et soir' },
          ]}
        />
      </div>
      )}

      <div className="field">
        <span>Fréquence</span>
        <div className="radio-list">
          {([
            ['daily', 'Tous les jours'],
            ['weekplan', 'Certains jours de la semaine'],
            ['interval', 'Tous les X jours'],
            ['monthdays', 'Certains jours du mois'],
          ] as [FreqType, string][]).map(([id, l]) => (
            <label key={id} className={`radio ${ftype === id ? 'on' : ''}`}>
              <input type="radio" name="freq" checked={ftype === id} onChange={() => setFtype(id)} />
              {l}
            </label>
          ))}
        </div>
        {ftype === 'weekplan' && (
          <>
            <p className="hint">Choisis le matin et / ou le soir pour chaque jour.</p>
            <PlanGrid
              plan={plan}
              onChange={(next) => {
                setPlan(next)
                const slots = new Set(Object.values(next).flat())
                setMoment(slots.size === 2 ? 'matin-soir' : slots.has('matin') ? 'matin' : 'soir')
              }}
            />
          </>
        )}
        {ftype === 'interval' && (
          <div className="inline-fields">
            <label>
              Tous les
              <input type="number" min={1} max={60} value={every} onChange={(e) => setEvery(Number(e.target.value))} />
              jours
            </label>
            <label>
              à partir du
              <input type="date" value={start} onChange={(e) => e.target.value && setStart(e.target.value)} />
            </label>
          </div>
        )}
        {ftype === 'monthdays' && (
          <div className="monthday-picker">
            {Array.from({ length: 31 }, (_, i) => (
              <button key={i} type="button" className={monthdays.includes(i + 1) ? 'on' : ''} onClick={() => setMonthdays(toggleIn(monthdays, i + 1))}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <label className="field">
        <span>Note (facultatif)</span>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex. 3 gouttes, sur peau propre" />
      </label>

      <div className="sheet-actions">
        {initial && (
          <button type="button" className="btn danger ghost" onClick={() => confirm(`Supprimer « ${initial.name} » ?`) && onDelete(initial.id)}>
            Supprimer
          </button>
        )}
        <button
          type="button"
          className="btn primary"
          disabled={!valid}
          onClick={() => onSave({ id: initial?.id ?? uid(), name: name.trim(), kind, moment, freq, note: note.trim() || undefined })}
        >
          Enregistrer
        </button>
      </div>
    </Sheet>
  )
}
