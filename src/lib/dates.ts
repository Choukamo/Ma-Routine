export const DAY_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
export const DAY_LONG = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
export const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]

export function dateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function parseKey(k: string): Date {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function today(): Date {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

/** 1 = lundi … 7 = dimanche */
export function isoWeekday(d: Date): number {
  return ((d.getDay() + 6) % 7) + 1
}

export function startOfWeek(d: Date): Date {
  return addDays(d, 1 - isoWeekday(d))
}

export function diffDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86400000)
}

export function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate()
}

export function longDate(d: Date): string {
  return `${DAY_LONG[isoWeekday(d) - 1]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export function shortDate(d: Date): string {
  return `${DAY_SHORT[isoWeekday(d) - 1]} ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 4).replace(/\.$/, '')}.`
}

export function sameDay(a: Date, b: Date) {
  return dateKey(a) === dateKey(b)
}
