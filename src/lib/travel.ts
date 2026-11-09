import { useMemo } from 'react'
import { useStored } from './store'

export const TRAVEL_PEOPLE = ['John ❤️', 'Ella', 'Flora', 'Nina', 'Matisse'] as const

export type TravelPerson = (typeof TRAVEL_PEOPLE)[number]

export const TRAVEL_CATEGORIES = ['Vêtements', 'Chaussures', 'Hygiène', 'Divers'] as const

export type TravelCategory = (typeof TRAVEL_CATEGORIES)[number]

export type TravelItem = {
  id: string
  label: string
}

export const TRAVEL_ITEMS: Record<TravelCategory, TravelItem[]> = {
  Vêtements: [
    { id: 't-shirts', label: 'T-shirts / hauts' },
    { id: 'underwear', label: 'Sous-vêtements' },
    { id: 'socks', label: 'Chaussettes' },
    { id: 'pants', label: 'Pantalons / shorts' },
    { id: 'sleepwear', label: 'Pyjama' },
    { id: 'warm-layer', label: 'Pull / veste chaude' },
    { id: 'swimwear', label: 'Maillot de bain' },
    { id: 'rainwear', label: 'Vêtement de pluie' },
  ],
  Chaussures: [
    { id: 'everyday-shoes', label: 'Chaussures de tous les jours' },
    { id: 'sandals', label: 'Sandales / claquettes' },
    { id: 'sports-shoes', label: 'Chaussures de sport' },
  ],
  Hygiène: [
    { id: 'toothbrush', label: 'Brosse à dents' },
    { id: 'toothpaste', label: 'Dentifrice' },
    { id: 'shower', label: 'Gel douche / savon' },
    { id: 'shampoo', label: 'Shampoing' },
    { id: 'brush', label: 'Brosse / peigne' },
    { id: 'deodorant', label: 'Déodorant' },
    { id: 'sunscreen', label: 'Crème solaire' },
    { id: 'medication', label: 'Médicaments habituels' },
  ],
  Divers: [
    { id: 'towel', label: 'Serviette' },
    { id: 'bag', label: 'Sac / valise' },
    { id: 'documents', label: 'Papiers / documents' },
    { id: 'glasses', label: 'Lunettes / lunettes de soleil' },
    { id: 'charger', label: 'Chargeur' },
    { id: 'comfort', label: 'Doudou / objet important' },
    { id: 'laundry', label: 'Sac pour le linge sale' },
  ],
}

export type TravelChecks = Record<string, boolean>

export function checkKey(person: TravelPerson, category: TravelCategory, itemId: string) {
  return `${person}::${category}::${itemId}`
}

export function useTravelChecks() {
  const [checks, setChecks] = useStored<TravelChecks>('travel-checks', () => ({}))
  const toggle = (key: string) => setChecks((current) => ({ ...current, [key]: !current[key] }))
  const reset = () => setChecks({})

  const total = useMemo(
    () => TRAVEL_PEOPLE.length * Object.values(TRAVEL_ITEMS).reduce((count, items) => count + items.length, 0),
    [],
  )
  const checked = Object.values(checks).filter(Boolean).length

  return { checks, setChecks, toggle, reset, total, checked }
}
