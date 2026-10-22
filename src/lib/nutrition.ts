import { useStored } from './store'
import { addDays, dateKey } from './dates'

export interface Habit {
  id: string
  label: string
  target: number
}

export const LIGHT_EVENING = 'leger-soir'

export const DEFAULT_HABITS: Habit[] = [
  { id: 'fruits-legumes', label: '5 fruits et légumes', target: 5 },
  { id: 'eau', label: 'Boire 6 grands verres d’eau', target: 6 },
  { id: 'proteines', label: 'Des protéines à chaque repas', target: 3 },
  { id: 'laitier', label: '2 produits laitiers (calcium)', target: 2 },
  { id: 'feculent', label: 'Un féculent complet', target: 1 },
  { id: 'grignotage', label: 'Pas de grignotage sucré', target: 1 },
]

export function useHabits() {
  return useStored<Habit[]>('nutrition.habits', () => DEFAULT_HABITS)
}

/** dateKey -> habitId -> compteur */
export function useNutritionLog() {
  return useStored<Record<string, Record<string, number>>>('nutrition.log', () => ({}))
}

export function lightStreak(log: Record<string, Record<string, number>>, from: Date): number {
  let d = from
  if (!log[dateKey(d)]?.[LIGHT_EVENING]) d = addDays(d, -1)
  let n = 0
  while (log[dateKey(d)]?.[LIGHT_EVENING]) {
    n++
    d = addDays(d, -1)
  }
  return n
}

export const MEMO: { title: string; text: string }[] = [
  { title: '5 fruits et légumes par jour', text: 'Au moins 5 portions (une portion = une poignée ou un fruit moyen). Frais, surgelés ou en conserve, tout compte.' },
  { title: 'Féculents complets chaque jour', text: 'Pain complet, riz complet, pâtes complètes, flocons d’avoine : ils calent plus longtemps.' },
  { title: 'Légumes secs 2 fois par semaine', text: 'Lentilles, pois chiches, haricots : riches en fibres, en protéines et en fer.' },
  { title: 'Poisson 2 fois par semaine', text: 'Dont un poisson gras (saumon, sardine, maquereau) pour les oméga-3.' },
  { title: '2 produits laitiers par jour', text: 'Yaourt, fromage blanc, lait ou fromage, pour le calcium.' },
  { title: 'Une petite poignée de fruits à coque', text: 'Amandes, noix, noisettes non salées : une petite poignée par jour.' },
  { title: 'Limiter la viande rouge et la charcuterie', text: 'Viande rouge : environ 500 g par semaine maximum. Charcuterie : 150 g par semaine maximum.' },
  { title: 'L’eau à volonté', text: 'La seule boisson indispensable. Limiter les sodas et jus, même « 100 % fruits ».' },
  { title: 'Moins de sucre, de sel et de produits ultra-transformés', text: 'Privilégier le fait maison simple et lire les étiquettes.' },
]

export const POSTPARTUM: { title: string; text: string }[] = [
  { title: 'Pas de régime strict', text: 'Après l’accouchement le corps récupère : on mange équilibré, sans se priver, et on perd doucement.' },
  { title: 'Le fer', text: 'Lentilles, viande, œufs, épinards. Avec un fruit ou un légume riche en vitamine C (orange, kiwi, poivron) pour mieux l’absorber.' },
  { title: 'Si tu allaites', text: 'Boire davantage (un verre d’eau à chaque tétée) et ne pas réduire les quantités : l’allaitement demande de l’énergie.' },
  { title: 'Des collations utiles', text: 'Un fruit, un yaourt, une poignée d’amandes plutôt que des biscuits.' },
]

export const LIGHT_DINNERS: string[] = [
  'Soupe de légumes + un œuf ou un peu de fromage',
  'Omelette aux légumes + salade verte',
  'Poisson blanc + légumes vapeur',
  'Salade composée (crudités, pois chiches, thon)',
  'Légumes rôtis + fromage blanc aux herbes',
  'Yaourt nature + un fruit + une tranche de pain complet',
]
