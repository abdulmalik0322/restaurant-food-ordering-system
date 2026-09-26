/**
 * Global store: loads all collections from localStorage (via src/api/db.ts),
 * exposes typed CRUD + domain actions, toast notifications, confirm dialogs,
 * page navigation and global search. Pages never touch localStorage directly.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { api, persist } from '../api/db';
import type { AllData, CounterKind } from '../api/db';
import type {
  AttendanceRecord,
  CollectionKey,
  Customer,
  Employee,
  Expense,
  InventoryItem,
  MenuItem,
  NewOrderInput,
  Order,
  OrderItem,
  PayrollRecord,
  Settings,
} from '../types';
import { clamp, nowLocalISO } from '../utils/format';

export type PageKey =
  | 'dashboard' | 'menu' | 'pos' | 'bills' | 'customers' | 'employees'
  | 'payroll' | 'attendance' | 'expenses' | 'reports' | 'inventory' | 'settings';

export interface CollectionMap {
  menu: MenuItem;
  orders: Order;
  customers: Customer;
  employees: Employee;
  payroll: PayrollRecord;
  attendance: AttendanceRecord;
  expenses: Expense;
  inventory: InventoryItem;
}

export type ToastType = 'success' | 'error' | 'info';
export interface Toast { id: number; msg: string; type: ToastType }

export interface ConfirmOpts {
  title: string;
  message: string;
  confirmText?: string;
  danger?: boolean;
  onConfirm: () => void;
}

export interface SearchHit {
  kind: 'Food Item' | 'Order' | 'Customer' | 'Employee' | 'Bill' | 'Expense';
  id: string;
  title: string;
  subtitle: string;
  page: PageKey;
}

const KIND_FOR_KEY: Record<CollectionKey, CounterKind> = {
  menu: 'menu',
  orders: 'order',
  customers: 'customer',
  employees: 'employee',
  payroll: 'payroll',
  attendance: 'attendance',
  expenses: 'expense',
  inventory: 'inventory',
};

const ID_PREFIX_FN: Record<CounterKind, (seq: number) => string> = {
  menu: (s) => `MI-${String(s).padStart(4, '0')}`,
  order: (s) => `ORD-${new Date().getFullYear()}-${String(s).padStart(4, '0')}`,
  customer: (s) => `CUS-${String(s).padStart(4, '0')}`,
  employee: (s) => `EMP-${String(s).padStart(4, '0')}`,
  expense: (s) => `EXP-${String(s).padStart(4, '0')}`,
  inventory: (s) => `STK-${String(s).padStart(4, '0')}`,
  payroll: (s) => `PAY-${String(s).padStart(4, '0')}`,
  attendance: (s) => `ATT-${String(s).padStart(6, '0')}`,
};

interface StoreValue {
  data: AllData | null;
  loading: boolean;
  page: PageKey;
  navigate: (p: PageKey) => void;
  notify: (msg: string, type?: ToastType) => void;
  toasts: Toast[];
  dismissToast: (id: number) => void;
  confirm: (opts: ConfirmOpts) => void;
  confirmState: (ConfirmOpts & { open: boolean }) | null;
  closeConfirm: () => void;
  addRecord: <K extends CollectionKey>(key: K, input: Omit<CollectionMap[K], 'id'>) => CollectionMap[K];
  updateRecord: <K extends CollectionKey>(key: K, id: string, patch: Partial<CollectionMap[K]>) => void;
  deleteRecord: <K extends CollectionKey>(key: K, id: string) => void;
  placeOrder: (input: NewOrderInput) => Order;
  generatePayroll: (month: string) => number;
  saveSettings: (s: Settings) => void;
  resetDemo: () => Promise<void>;
  searchAll: (q: string) => SearchHit[];
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AllData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<PageKey>('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<(ConfirmOpts & { open: boolean }) | null>(null);
  const dataRef = useRef<AllData | null>(null);
  const toastId = useRef(0);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    api.getAll().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const notify = useCallback((msg: string, type: ToastType = 'success') => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const confirm = useCallback((opts: ConfirmOpts) => setConfirmState({ ...opts, open: true }), []);
  const closeConfirm = useCallback(() => setConfirmState(null), []);
  const navigate = useCallback((p: PageKey) => {
    setPage(p);
    window.scrollTo({ top: 0 });
  }, []);

  const newId = useCallback((kind: CounterKind): string => {
    const d = dataRef.current;
    if (!d) throw new Error('Store not ready');
    const seq = (d.counters[kind] ?? 0) + 1;
    const counters = { ...d.counters, [kind]: seq };
    persist('counters', counters);
    setData((prev) => (prev ? { ...prev, counters } : prev));
    return ID_PREFIX_FN[kind](seq);
  }, []);

  const addRecord = useCallback(<K extends CollectionKey>(key: K, input: Omit<CollectionMap[K], 'id'>): CollectionMap[K] => {
    const rec = { ...input, id: '' } as CollectionMap[K];
    rec.id = newId(KIND_FOR_KEY[key]);
    setData((prev) => {
      if (!prev) return prev;
      const next = [rec, ...(prev[key] as CollectionMap[K][])];
      persist(key, next);
      return { ...prev, [key]: next };
    });
    return rec;
  }, [newId]) as StoreValue['addRecord'];

  const updateRecord = useCallback(<K extends CollectionKey>(key: K, id: string, patch: Partial<CollectionMap[K]>): void => {
    setData((prev) => {
      if (!prev) return prev;
      const next = (prev[key] as CollectionMap[K][]).map((r) => (r.id === id ? { ...r, ...patch } : r));
      persist(key, next);
      return { ...prev, [key]: next };
    });
  }, []) as StoreValue['updateRecord'];

  const deleteRecord = useCallback(<K extends CollectionKey>(key: K, id: string): void => {
    setData((prev) => {
      if (!prev) return prev;
      const next = (prev[key] as CollectionMap[K][]).filter((r) => r.id !== id);
      persist(key, next);
      return { ...prev, [key]: next };
    });
  }, []) as StoreValue['deleteRecord'];

  /** Create an order: totals, unique id, customer upsert — all in one place. */
  const placeOrder = useCallback((input: NewOrderInput): Order => {
    const d = dataRef.current;
    if (!d) throw new Error('Store not ready');

    const items: OrderItem[] = input.items.map(({ menuItemId, qty, instructions }) => {
      const m = d.menu.find((x) => x.id === menuItemId);
      if (!m) throw new Error('Menu item not found');
      return { menuItemId, name: m.name, price: m.price, qty, instructions };
    });

    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
    const discount = clamp(Math.round(input.discount || 0), 0, subtotal);
    const base = subtotal - discount;
    const tax = Math.round((base * d.settings.taxPercent) / 100);
    const serviceCharge = Math.round((base * d.settings.serviceChargePercent) / 100);
    const total = base + tax + serviceCharge;
    const amountPaid = Math.max(0, Math.round(input.amountPaid || 0));
    const balance = Math.max(0, total - amountPaid);
    const change = Math.max(0, amountPaid - total);
    const status: Order['status'] = balance === 0 ? 'paid' : amountPaid > 0 ? 'partial' : 'pending';

    const orderId = newId('order');
    let customerId = input.customerId;
    const name = input.customerName.trim() || 'Walk-in Customer';

    // Upsert customer so bills stay linked to real customer records.
    let customers = d.customers;
    if (customerId) {
      customers = customers.map((c) =>
        c.id === customerId
          ? { ...c, totalOrders: c.totalOrders + 1, totalSpent: c.totalSpent + total, lastOrder: nowLocalISO(), status: 'active' as const }
          : c,
      );
    } else if (input.phone) {
      const existing = customers.find((c) => c.phone.replace(/\D/g, '') === input.phone!.replace(/\D/g, ''));
      if (existing) {
        customerId = existing.id;
        customers = customers.map((c) =>
          c.id === existing.id
            ? { ...c, name, totalOrders: c.totalOrders + 1, totalSpent: c.totalSpent + total, lastOrder: nowLocalISO(), status: 'active' as const }
            : c,
        );
      } else if (name !== 'Walk-in Customer') {
        const nc: Customer = {
          id: newId('customer'), name, phone: input.phone, address: input.address,
          totalOrders: 1, totalSpent: total, lastOrder: nowLocalISO(), status: 'active',
        };
        customerId = nc.id;
        customers = [nc, ...customers];
      }
    } else if (name !== 'Walk-in Customer') {
      const nc: Customer = {
        id: newId('customer'), name, phone: input.phone ?? '', address: input.address,
        totalOrders: 1, totalSpent: total, lastOrder: nowLocalISO(), status: 'active',
      };
      customerId = nc.id;
      customers = [nc, ...customers];
    }

    const order: Order = {
      id: orderId,
      date: nowLocalISO(),
      customerId,
      customerName: name,
      phone: input.phone,
      address: input.address,
      type: input.type,
      tableNo: input.tableNo,
      items,
      subtotal,
      discount,
      tax,
      serviceCharge,
      total,
      paymentMethod: input.paymentMethod,
      amountPaid,
      change,
      balance,
      status,
    };

    const orders = [order, ...d.orders];
    persist('orders', orders);
    persist('customers', customers);
    setData((prev) => (prev ? { ...prev, orders, customers, counters: dataRef.current!.counters } : prev));
    return order;
  }, [newId]);

  /** Create payroll rows for a month (active monthly employees missing one). Returns count created. */
  const generatePayroll = useCallback((month: string): number => {
    const d = dataRef.current;
    if (!d) return 0;
    const eligible = d.employees.filter(
      (e) => e.status === 'active' && e.salaryType === 'monthly' && !d.payroll.some((p) => p.employeeId === e.id && p.month === month),
    );
    if (eligible.length === 0) return 0;
    const rows: PayrollRecord[] = eligible.map((e) => ({
      id: newId('payroll'),
      employeeId: e.id,
      month,
      basic: e.salary,
      allowances: 0,
      overtime: 0,
      bonus: 0,
      advance: 0,
      deductions: 0,
      net: e.salary,
      status: 'pending',
    }));
    const payroll = [...rows, ...d.payroll];
    persist('payroll', payroll);
    setData((prev) => (prev ? { ...prev, payroll, counters: dataRef.current!.counters } : prev));
    return rows.length;
  }, [newId]);

  const saveSettings = useCallback((s: Settings) => {
    persist('settings', s);
    setData((prev) => (prev ? { ...prev, settings: s } : prev));
    notify('Settings saved', 'success');
  }, [notify]);

  const resetDemo = useCallback(async () => {
    const fresh = await api.resetDemo();
    setData(fresh);
    notify('Demo data has been reset', 'info');
  }, [notify]);

  const searchAll = useCallback((q: string): SearchHit[] => {
    const d = dataRef.current;
    if (!d) return [];
    const needle = q.trim().toLowerCase();
    if (needle.length < 2) return [];
    const hits: SearchHit[] = [];
    const push = (kind: SearchHit['kind'], id: string, title: string, subtitle: string, page: PageKey) =>
      hits.push({ kind, id, title, subtitle, page });
    d.menu.filter((m) => (m.name + ' ' + m.category).toLowerCase().includes(needle)).slice(0, 6)
      .forEach((m) => push('Food Item', m.id, m.name, `${m.category} · Rs ${m.price.toLocaleString('en-PK')}`, 'menu'));
    d.orders.filter((o) => (o.id + ' ' + o.customerName).toLowerCase().includes(needle)).slice(0, 6)
      .forEach((o) => push('Order', o.id, o.id, `${o.customerName} · Rs ${o.total.toLocaleString('en-PK')}`, 'bills'));
    d.customers.filter((c) => (c.name + ' ' + c.phone).toLowerCase().includes(needle)).slice(0, 6)
      .forEach((c) => push('Customer', c.id, c.name, c.phone, 'customers'));
    d.employees.filter((e) => (e.name + ' ' + e.position + ' ' + e.id).toLowerCase().includes(needle)).slice(0, 6)
      .forEach((e) => push('Employee', e.id, e.name, `${e.position} · ${e.id}`, 'employees'));
    d.expenses.filter((e) => (e.name + ' ' + e.category).toLowerCase().includes(needle)).slice(0, 6)
      .forEach((e) => push('Expense', e.id, e.name, `${e.category} · Rs ${e.amount.toLocaleString('en-PK')}`, 'expenses'));
    return hits.slice(0, 24);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      data, loading, page, navigate, notify, toasts, dismissToast,
      confirm, confirmState, closeConfirm,
      addRecord, updateRecord, deleteRecord,
      placeOrder, generatePayroll, saveSettings, resetDemo, searchAll,
    }),
    [data, loading, page, navigate, notify, toasts, dismissToast, confirm, confirmState, closeConfirm,
      addRecord, updateRecord, deleteRecord, placeOrder, generatePayroll, saveSettings, resetDemo, searchAll],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
