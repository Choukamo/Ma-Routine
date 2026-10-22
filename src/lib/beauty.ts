import { useStored } from './store'
import { daysInMonth, diffDays, isoWeekday, parseKey, DAY_SHORT } from './dates'

export type Kind =
  | 'creme' | 'serum' | 'masque' | 'gommage' | 'huile'
  | 'demaquillant' | 'lotion' | 'yeux' | 'autre'

export const KINDS: { id: Kind; label: string; color: string }[] = [
  { id: 'creme', label: 'Crème', color: '#c98b8f' },
  { id: 'serum', label: 'Sérum', color: '#8a7bb5' },
  { id: 'masque', label: 'Masque', color: '#6f9a86' },
  { id: 'gommage', label: 'Gommage', color: '#c49a5a' },
  { id: 'huile', label: 'Huile', color: '#d2a94b' },
  { id: 'demaquillant', label: 'Démaquillant', color: '#7a9cc0' },
  { id: 'lotion', label: 'Lotion / tonique', color: '#5fa3a3' },
  { id: 'yeux', label: 'Contour des yeux', color: '#b07aa1' },
  { id: 'autre', label: 'Autre', color: '#8c8580' },
]

export const kindOf = (k: Kind) => KINDS.find((x) => x.id === k) ?? KINDS[KINDS.length - 1]

export type Moment = 'matin' | 'soir' | 'matin-soir'
export type Slot = 'matin' | 'soir'

export type Frequency =
  | { type: 'daily' }
  | { type: 'weekdays'; days: number[] }
  | { type: 'interval'; every: number; start: string }
  | { type: 'monthdays'; days: number[] }
  | { type: 'weekplan'; plan: WeekPlan }

/** jour ISO ("1" = lundi … "7" = dimanche) -> moments prévus */
export type WeekPlan = Record<string, Slot[]>

export interface Product {
  id: string
  name: string
  kind: Kind
  moment: Moment
  freq: Frequency
  note?: string
}

export function isDue(p: Product, d: Date): boolean {
  const f = p.freq
  switch (f.type) {
    case 'daily':
      return true
    case 'weekplan':
      return (f.plan[String(isoWeekday(d))] ?? []).length > 0
    case 'weekdays':
      return f.days.includes(isoWeekday(d))
    case 'interval': {
      const n = diffDays(d, parseKey(f.start))
      return n >= 0 && n % Math.max(1, f.every) === 0
    }
    case 'monthdays': {
      const last = daysInMonth(d.getFullYear(), d.getMonth())
      const day = d.getDate()
      return f.days.some((x) => x === day || (x > last && day === last))
    }
  }
}

export function slotsOf(p: Product): Slot[] {
  return p.moment === 'matin-soir' ? ['matin', 'soir'] : [p.moment]
}

export function slotsOn(p: Product, d: Date): Slot[] {
  if (p.freq.type === 'weekplan') return p.freq.plan[String(isoWeekday(d))] ?? []
  return isDue(p, d) ? slotsOf(p) : []
}

/** Planning de la semaine équivalent, ou null si la fréquence ne suit pas la semaine. */
export function toWeekPlan(p: Product): WeekPlan | null {
  const f = p.freq
  if (f.type === 'weekplan') return f.plan
  if (f.type === 'daily') return Object.fromEntries([1, 2, 3, 4, 5, 6, 7].map((d) => [String(d), slotsOf(p)]))
  if (f.type === 'weekdays') return Object.fromEntries(f.days.map((d) => [String(d), slotsOf(p)]))
  return null
}

export function freqLabel(f: Frequency): string {
  switch (f.type) {
    case 'weekplan': {
      const parts = (['matin', 'soir'] as Slot[]).map((slot) => {
        const days = [1, 2, 3, 4, 5, 6, 7].filter((d) => (f.plan[String(d)] ?? []).includes(slot))
        if (days.length === 0) return ''
        const name = slot === 'matin' ? 'Matin' : 'Soir'
        return `${name} : ${days.length === 7 ? 'tous les jours' : days.map((d) => DAY_SHORT[d - 1].toLowerCase()).join(', ')}`
      }).filter(Boolean)
      return parts.length ? parts.join(' · ') : 'Pas encore planifié'
    }
    case 'daily':
      return 'Tous les jours'
    case 'weekdays':
      if (f.days.length === 7) return 'Tous les jours'
      return [...f.days].sort().map((d) => DAY_SHORT[d - 1]).join(', ')
    case 'interval':
      return f.every === 1 ? 'Tous les jours' : `Tous les ${f.every} jours`
    case 'monthdays': {
      const ds = [...f.days].sort((a, b) => a - b)
      if (ds.length === 1) return `Le ${ds[0]} de chaque mois`
      return `Les ${ds.slice(0, -1).join(', ')} et ${ds[ds.length - 1]} du mois`
    }
  }
}

export function momentLabel(m: Moment) {
  return m === 'matin' ? 'Matin' : m === 'soir' ? 'Soir' : 'Matin et soir'
}

export function useProducts() {
  return useStored<Product[]>('beauty.products', () => [])
}

/** dateKey -> liste "productId:slot" faits */
export function useBeautyDone() {
  return useStored<Record<string, string[]>>('beauty.done', () => ({}))
}

export function dueSlots(products: Product[], d: Date) {
  const res: { product: Product; slot: Slot }[] = []
  for (const slot of ['matin', 'soir'] as Slot[])
    for (const p of products) if (slotsOn(p, d).includes(slot)) res.push({ product: p, slot })
  return res
}
