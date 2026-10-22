import { useCallback, useSyncExternalStore } from 'react'

const PREFIX = 'mr.'
const listeners = new Map<string, Set<() => void>>()
const cache = new Map<string, unknown>()

function read<T>(key: string, init: () => T): T {
  if (cache.has(key)) return cache.get(key) as T
  let value: T
  try {
    const raw = localStorage.getItem(PREFIX + key)
    value = raw ? (JSON.parse(raw) as T) : init()
  } catch {
    value = init()
  }
  cache.set(key, value)
  return value
}

function write<T>(key: string, value: T) {
  cache.set(key, value)
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
  listeners.get(key)?.forEach((l) => l())
}

export function useStored<T>(key: string, init: () => T) {
  const subscribe = useCallback(
    (cb: () => void) => {
      if (!listeners.has(key)) listeners.set(key, new Set())
      listeners.get(key)!.add(cb)
      return () => listeners.get(key)!.delete(cb)
    },
    [key],
  )
  const value = useSyncExternalStore(subscribe, () => read(key, init))
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read(key, init)
      write(key, typeof next === 'function' ? (next as (p: T) => T)(prev) : next)
    },
    [key, init],
  )
  return [value, set] as const
}

export function exportAll(): string {
  const data: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!
    if (k.startsWith(PREFIX)) data[k.slice(PREFIX.length)] = JSON.parse(localStorage.getItem(k)!)
  }
  return JSON.stringify({ app: 'ma-routine', version: 1, data }, null, 2)
}

export function importAll(json: string) {
  const parsed = JSON.parse(json) as { app?: string; data?: Record<string, unknown> }
  if (parsed.app !== 'ma-routine' || !parsed.data) throw new Error('Fichier non reconnu')
  for (const [k, v] of Object.entries(parsed.data)) write(k, v)
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}
