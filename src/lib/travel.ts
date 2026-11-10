import { useEffect, useMemo } from 'react'
import { uid, useStored } from './store'

export const TRAVEL_PEOPLE = ['John ❤️', 'Ella', 'Flora', 'Nina', 'Matis'] as const

export type TravelPerson = (typeof TRAVEL_PEOPLE)[number]

export const TRAVEL_CATEGORIES = ['Vêtements', 'Chaussures', 'Hygiène', 'Divers', 'Pense-bête'] as const

export type TravelCategory = (typeof TRAVEL_CATEGORIES)[number]

export const TRAVEL_SHARED_CATEGORY = 'Famille' as const

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
    { id: 'shower', label: 'Gel douche / savon' },
    { id: 'shampoo', label: 'Shampoing' },
    { id: 'brush', label: 'Brosse / peigne' },
    { id: 'deodorant', label: 'Déodorant' },
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
  'Pense-bête': [],
}

export const TRAVEL_SHARED_ITEMS: TravelItem[] = [
  { id: 'family-toothpaste', label: 'Dentifrice' },
  { id: 'family-sunscreen', label: 'Crème solaire' },
  { id: 'family-shower', label: 'Gel douche familial' },
  { id: 'family-shampoo', label: 'Shampoing familial' },
  { id: 'family-first-aid', label: 'Trousse de premiers soins' },
  { id: 'family-tissues', label: 'Mouchoirs' },
]

export type TravelChecks = Record<string, boolean>
export type TravelLists = Record<TravelPerson, Record<TravelCategory, TravelItem[]>>

function defaultLists(): TravelLists {
  return Object.fromEntries(
    TRAVEL_PEOPLE.map((person) => [
      person,
      Object.fromEntries(TRAVEL_CATEGORIES.map((category) => [category, TRAVEL_ITEMS[category].map((item) => ({ ...item }))])),
    ]),
  ) as TravelLists
}

export function checkKey(person: TravelPerson, category: TravelCategory, itemId: string) {
  return `${person}::${category}::${itemId}`
}

export function sharedCheckKey(itemId: string) {
  return `${TRAVEL_SHARED_CATEGORY}::${itemId}`
}

export function useTravelChecks() {
  const [checks, setChecks] = useStored<TravelChecks>('travel-checks', () => ({}))
  const toggle = (key: string) => setChecks((current) => ({ ...current, [key]: !current[key] }))
  const reset = () => setChecks({})

  useEffect(() => {
    const migrated = Object.entries(checks).reduce<TravelChecks>((next, [key, value]) => {
      if (key.endsWith('::Hygiène::toothpaste') || key.endsWith('::Hygiène::sunscreen')) return next
      next[key.replace('Matisse::', 'Matis::')] = value
      return next
    }, {})
    if (Object.keys(migrated).length !== Object.keys(checks).length || Object.keys(checks).some((key) => key.includes('Matisse::'))) {
      setChecks(migrated)
    }
  }, [checks, setChecks])

  const checked = Object.values(checks).filter(Boolean).length
  return { checks, setChecks, toggle, reset, checked }
}

export function useTravelLists() {
  const [lists, setLists] = useStored<TravelLists>('travel-items', defaultLists)
  const [migratedSharedItems, setMigratedSharedItems] = useStored('travel-family-items-migrated', () => false)
  const normalizedLists = useMemo(() => {
    const defaults = defaultLists()
    return Object.fromEntries(
      TRAVEL_PEOPLE.map((person) => [
        person,
        Object.fromEntries(
          TRAVEL_CATEGORIES.map((category) => [category, lists[person]?.[category] ?? defaults[person][category]]),
        ),
      ]),
    ) as TravelLists
  }, [lists])

  useEffect(() => {
    if (migratedSharedItems) return
    setLists((current) =>
      Object.fromEntries(
        TRAVEL_PEOPLE.map((person) => [
          person,
          {
            ...current[person],
            Hygiène: (current[person]?.Hygiène ?? TRAVEL_ITEMS.Hygiène).filter((item) => item.id !== 'toothpaste' && item.id !== 'sunscreen'),
          },
        ]),
      ) as TravelLists,
    )
    setMigratedSharedItems(true)
  }, [migratedSharedItems, setLists, setMigratedSharedItems])

  const addItem = (person: TravelPerson, category: TravelCategory, label: string) => {
    setLists((current) => ({
      ...normalizedLists,
      ...current,
      [person]: {
        ...normalizedLists[person],
        ...current[person],
        [category]: [...(normalizedLists[person][category] ?? []), { id: uid(), label: label.trim() }],
      },
    }))
  }
  const renameItem = (person: TravelPerson, category: TravelCategory, itemId: string, label: string) => {
    setLists((current) => ({
      ...normalizedLists,
      ...current,
      [person]: {
        ...normalizedLists[person],
        ...current[person],
        [category]: normalizedLists[person][category].map((item) => (item.id === itemId ? { ...item, label: label.trim() } : item)),
      },
    }))
  }
  const removeItem = (person: TravelPerson, category: TravelCategory, itemId: string) => {
    setLists((current) => ({
      ...normalizedLists,
      ...current,
      [person]: {
        ...normalizedLists[person],
        ...current[person],
        [category]: normalizedLists[person][category].filter((item) => item.id !== itemId),
      },
    }))
  }

  const total = useMemo(
    () => TRAVEL_PEOPLE.reduce((count, person) => count + TRAVEL_CATEGORIES.reduce((sum, category) => sum + normalizedLists[person][category].length, 0), 0),
    [normalizedLists],
  )
  return { lists: normalizedLists, addItem, renameItem, removeItem, total }
}

export function useTravelSharedItems() {
  const [items, setItems] = useStored<TravelItem[]>('travel-family-items', () => TRAVEL_SHARED_ITEMS.map((item) => ({ ...item })))
  const addItem = (label: string) => setItems((current) => [...current, { id: uid(), label: label.trim() }])
  const renameItem = (itemId: string, label: string) => setItems((current) => current.map((item) => (item.id === itemId ? { ...item, label: label.trim() } : item)))
  const removeItem = (itemId: string) => setItems((current) => current.filter((item) => item.id !== itemId))
  return { items, addItem, renameItem, removeItem, total: items.length }
}
