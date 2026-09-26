/**
 * Persistence layer — localStorage for the front-end prototype.
 *
 * ── How it works ──────────────────────────────────────────────────────────
 * Every collection is stored under a `hfp_` prefixed key as JSON.
 * On first launch the demo dataset from `src/data/seed.ts` is written once
 * (guarded by the `hfp_seeded_v1` flag) so a browser refresh keeps all data.
 *
 * ── Replacing with a real backend ─────────────────────────────────────────
 * All reads/writes in the app go through the exported `api` object below.
 * To connect Node.js/Express + PostgreSQL later, keep the same method
 * signatures and swap each body for a `fetch(...)` call — no component or
 * page code needs to change. See README § "Connecting the future backend".
 */
import type {
  AttendanceRecord,
  CollectionKey,
  Customer,
  Employee,
  Expense,
  InventoryItem,
  MenuItem,
  Order,
  PayrollRecord,
  Settings,
} from '../types';
import { buildSeed } from '../data/seed';

const PREFIX = 'hfp_';
const SEED_FLAG = `${PREFIX}seeded_v1`;

export interface AllData {
  menu: MenuItem[];
  orders: Order[];
  customers: Customer[];
  employees: Employee[];
  payroll: PayrollRecord[];
  attendance: AttendanceRecord[];
  expenses: Expense[];
  inventory: InventoryItem[];
  settings: Settings;
  counters: Record<string, number>;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full / unavailable — app keeps running in memory */
  }
}

/** Load everything; seeds demo data exactly once. */
export function loadAll(): AllData {
  if (!localStorage.getItem(SEED_FLAG)) {
    const seed = buildSeed();
    (Object.keys(seed) as (keyof AllData)[]).forEach((k) => write(k, seed[k]));
    localStorage.setItem(SEED_FLAG, '1');
    return seed;
  }
  const seed = buildSeed();
  return {
    menu: read<MenuItem[]>('menu', seed.menu),
    orders: read<Order[]>('orders', seed.orders),
    customers: read<Customer[]>('customers', seed.customers),
    employees: read<Employee[]>('employees', seed.employees),
    payroll: read<PayrollRecord[]>('payroll', seed.payroll),
    attendance: read<AttendanceRecord[]>('attendance', seed.attendance),
    expenses: read<Expense[]>('expenses', seed.expenses),
    inventory: read<InventoryItem[]>('inventory', seed.inventory),
    settings: read<Settings>('settings', seed.settings),
    counters: read<Record<string, number>>('counters', seed.counters),
  };
}

/** Persist one collection (called by the store after every mutation). */
export function persist(key: CollectionKey | 'settings' | 'counters', value: unknown): void {
  write(key, value);
}

/** Wipe everything and re-seed (used by "Reset demo data"). */
export function resetAll(): AllData {
  Object.values({
    menu: 'menu',
    orders: 'orders',
    customers: 'customers',
    employees: 'employees',
    payroll: 'payroll',
    attendance: 'attendance',
    expenses: 'expenses',
    inventory: 'inventory',
    settings: 'settings',
    counters: 'counters',
  }).forEach((k) => localStorage.removeItem(PREFIX + k));
  localStorage.removeItem(SEED_FLAG);
  return loadAll();
}

// ------------------------------------------------------------ id counters --
export type CounterKind =
  | 'menu'
  | 'order'
  | 'customer'
  | 'employee'
  | 'expense'
  | 'inventory'
  | 'payroll'
  | 'attendance';

const ID_PREFIX: Record<CounterKind, (seq: number) => string> = {
  menu: (s) => `MI-${String(s).padStart(4, '0')}`,
  order: (s) => `ORD-${new Date().getFullYear()}-${String(s).padStart(4, '0')}`,
  customer: (s) => `CUS-${String(s).padStart(4, '0')}`,
  employee: (s) => `EMP-${String(s).padStart(4, '0')}`,
  expense: (s) => `EXP-${String(s).padStart(4, '0')}`,
  inventory: (s) => `STK-${String(s).padStart(4, '0')}`,
  payroll: (s) => `PAY-${String(s).padStart(4, '0')}`,
  attendance: (s) => `ATT-${String(s).padStart(6, '0')}`,
};

/**
 * Returns the next unique id for a kind AND persists the bumped counter.
 * Pass the live counters object from the store.
 */
export function nextId(kind: CounterKind, counters: Record<string, number>): string {
  const seq = (counters[kind] ?? 0) + 1;
  counters[kind] = seq;
  write('counters', counters);
  return ID_PREFIX[kind](seq);
}

/** Invoice numbers mirror the order number: INV-2026-0001 for ORD-2026-0001. */
export function invoiceNoFor(orderId: string): string {
  return orderId.replace(/^ORD-/, 'INV-');
}

// ------------------------------------------------------------------- api --
/**
 * Async façade over the synchronous localStorage layer.
 * Every method returns a Promise so call sites already look like
 * network calls — the future Express backend only changes these bodies.
 */
function delay<T>(v: T, ms = 60): Promise<T> {
  return new Promise((res) => setTimeout(() => res(v), ms));
}

export const api = {
  getAll: (): Promise<AllData> => delay(loadAll()),
  saveCollection: (key: CollectionKey | 'settings', value: unknown): Promise<void> =>
    delay(persist(key, value)),
  resetDemo: (): Promise<AllData> => delay(resetAll(), 150),
};
