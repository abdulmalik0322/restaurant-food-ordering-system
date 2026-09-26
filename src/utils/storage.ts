// ==========================================================================
// localStorage persistence layer.
//
// Every piece of app data is stored under a namespaced key. This file is the
// single place that talks to localStorage, so swapping it out for real
// HTTP calls to a Node.js/Express + PostgreSQL backend later only means
// rewriting the functions in this file (and in context/AppContext.tsx) —
// no component code needs to change, since components only ever call
// context actions like `addFoodItem`, `updateOrder`, etc.
// ==========================================================================

const PREFIX = 'hfp' // Hangu Food Point

export const STORAGE_KEYS = {
  foodItems: `${PREFIX}.foodItems`,
  orders: `${PREFIX}.orders`,
  customers: `${PREFIX}.customers`,
  employees: `${PREFIX}.employees`,
  attendance: `${PREFIX}.attendance`,
  salaries: `${PREFIX}.salaries`,
  expenses: `${PREFIX}.expenses`,
  inventory: `${PREFIX}.inventory`,
  settings: `${PREFIX}.settings`,
  seeded: `${PREFIX}.seeded`,
  counters: `${PREFIX}.counters`,
} as const

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch (err) {
    console.error(`Failed to read "${key}" from localStorage`, err)
    return fallback
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error(`Failed to write "${key}" to localStorage`, err)
  }
}

interface Counters {
  order: number
  invoice: number
  customer: number
  employee: number
  expense: number
  inventory: number
  attendance: number
  salary: number
}

const DEFAULT_COUNTERS: Counters = {
  order: 0, invoice: 0, customer: 0, employee: 0,
  expense: 0, inventory: 0, attendance: 0, salary: 0,
}

export function nextSequence(kind: keyof Counters): number {
  const counters = loadFromStorage<Counters>(STORAGE_KEYS.counters, DEFAULT_COUNTERS)
  counters[kind] = (counters[kind] ?? 0) + 1
  saveToStorage(STORAGE_KEYS.counters, counters)
  return counters[kind]
}

export function pad(num: number, size = 4): string {
  return String(num).padStart(size, '0')
}

export function currentYear(): number {
  return new Date().getFullYear()
}
