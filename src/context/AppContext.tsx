import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type {
  FoodItem, Order, Customer, Employee, AttendanceRecord, SalaryRecord,
  Expense, InventoryItem, RestaurantSettings, ToastMessage, Section, AppUser,
} from '../types'
import {
  STORAGE_KEYS, loadFromStorage, saveToStorage, nextSequence, pad, currentYear,
} from '../utils/storage'
import {
  seedFoodItems, seedEmployees, seedCustomers, seedInventory, seedExpenses,
  seedSettings, buildSeedOrders, buildSeedSalaries, buildSeedAttendance,
} from '../data/seedData'

interface AppState {
  foodItems: FoodItem[]
  orders: Order[]
  customers: Customer[]
  employees: Employee[]
  attendance: AttendanceRecord[]
  salaries: SalaryRecord[]
  expenses: Expense[]
  inventory: InventoryItem[]
  settings: RestaurantSettings
}

interface AppContextValue extends AppState {
  activeSection: Section
  setActiveSection: (s: Section) => void
  currentUser: AppUser
  toasts: ToastMessage[]
  pushToast: (message: string, type?: ToastMessage['type']) => void
  dismissToast: (id: string) => void

  // Food items
  addFoodItem: (item: Omit<FoodItem, 'id'>) => void
  updateFoodItem: (id: string, patch: Partial<FoodItem>) => void
  deleteFoodItem: (id: string) => void
  toggleFoodAvailability: (id: string) => void

  // Orders
  createOrder: (order: Omit<Order, 'id' | 'invoiceId'>) => Order
  updateOrder: (id: string, patch: Partial<Order>) => void
  deleteOrder: (id: string) => void

  // Customers
  addCustomer: (c: Omit<Customer, 'id' | 'totalOrders' | 'totalSpending'>) => Customer
  updateCustomer: (id: string, patch: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  findCustomerByPhone: (phone: string) => Customer | undefined

  // Employees
  addEmployee: (e: Omit<Employee, 'id'>) => void
  updateEmployee: (id: string, patch: Partial<Employee>) => void
  deleteEmployee: (id: string) => void

  // Attendance
  markAttendance: (rec: Omit<AttendanceRecord, 'id'>) => void

  // Payroll
  upsertSalary: (rec: Omit<SalaryRecord, 'id'> & { id?: string }) => void

  // Expenses
  addExpense: (e: Omit<Expense, 'id'>) => void
  deleteExpense: (id: string) => void

  // Inventory
  addInventoryItem: (i: Omit<InventoryItem, 'id' | 'status'>) => void
  updateInventoryItem: (id: string, patch: Partial<InventoryItem>) => void
  deleteInventoryItem: (id: string) => void

  // Settings
  updateSettings: (patch: Partial<RestaurantSettings>) => void
}

const AppContext = createContext<AppContextValue | null>(null)

function computeInventoryStatus(qty: number, minStock: number): InventoryItem['status'] {
  if (qty <= 0) return 'Out of Stock'
  if (qty <= minStock) return 'Low Stock'
  return 'In Stock'
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<Section>('dashboard')
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  // ---- Seed on first run, then always read from localStorage ----
  const [foodItems, setFoodItems] = useState<FoodItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.foodItems, [] as FoodItem[]))
  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage(STORAGE_KEYS.orders, [] as Order[]))
  const [customers, setCustomers] = useState<Customer[]>(() =>
    loadFromStorage(STORAGE_KEYS.customers, [] as Customer[]))
  const [employees, setEmployees] = useState<Employee[]>(() =>
    loadFromStorage(STORAGE_KEYS.employees, [] as Employee[]))
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() =>
    loadFromStorage(STORAGE_KEYS.attendance, [] as AttendanceRecord[]))
  const [salaries, setSalaries] = useState<SalaryRecord[]>(() =>
    loadFromStorage(STORAGE_KEYS.salaries, [] as SalaryRecord[]))
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    loadFromStorage(STORAGE_KEYS.expenses, [] as Expense[]))
  const [inventory, setInventory] = useState<InventoryItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.inventory, [] as InventoryItem[]))
  const [settings, setSettings] = useState<RestaurantSettings>(() =>
    loadFromStorage(STORAGE_KEYS.settings, seedSettings))

  const currentUser: AppUser = { name: 'Muhammad Hassan', role: 'Owner' }

  // One-time seeding
  useEffect(() => {
    const alreadySeeded = loadFromStorage(STORAGE_KEYS.seeded, false)
    if (!alreadySeeded) {
      setFoodItems(seedFoodItems)
      setEmployees(seedEmployees)
      setCustomers(seedCustomers)
      setInventory(seedInventory)
      setExpenses(seedExpenses)
      setSettings(seedSettings)
      const seededOrders = buildSeedOrders(seedFoodItems)
      setOrders(seededOrders)
      setSalaries(buildSeedSalaries(seedEmployees))
      setAttendance(buildSeedAttendance(seedEmployees))
      saveToStorage(STORAGE_KEYS.seeded, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist every slice whenever it changes
  useEffect(() => saveToStorage(STORAGE_KEYS.foodItems, foodItems), [foodItems])
  useEffect(() => saveToStorage(STORAGE_KEYS.orders, orders), [orders])
  useEffect(() => saveToStorage(STORAGE_KEYS.customers, customers), [customers])
  useEffect(() => saveToStorage(STORAGE_KEYS.employees, employees), [employees])
  useEffect(() => saveToStorage(STORAGE_KEYS.attendance, attendance), [attendance])
  useEffect(() => saveToStorage(STORAGE_KEYS.salaries, salaries), [salaries])
  useEffect(() => saveToStorage(STORAGE_KEYS.expenses, expenses), [expenses])
  useEffect(() => saveToStorage(STORAGE_KEYS.inventory, inventory), [inventory])
  useEffect(() => saveToStorage(STORAGE_KEYS.settings, settings), [settings])

  const pushToast = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    const id = `t${Date.now()}${Math.random().toString(16).slice(2)}`
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])
  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // ---------------- Food items ----------------
  const addFoodItem = (item: Omit<FoodItem, 'id'>) => {
    const id = `F${pad(nextSequence('inventory') + foodItems.length + 100, 3)}`
    setFoodItems(prev => [...prev, { ...item, id }])
    pushToast(`"${item.name}" added to menu`)
  }
  const updateFoodItem = (id: string, patch: Partial<FoodItem>) => {
    setFoodItems(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f))
    pushToast('Food item updated')
  }
  const deleteFoodItem = (id: string) => {
    setFoodItems(prev => prev.filter(f => f.id !== id))
    pushToast('Food item deleted', 'info')
  }
  const toggleFoodAvailability = (id: string) => {
    setFoodItems(prev => prev.map(f => f.id === id ? { ...f, available: !f.available } : f))
  }

  // ---------------- Customers ----------------
  const findCustomerByPhone = (phone: string) => customers.find(c => c.phone === phone)

  const addCustomer = (c: Omit<Customer, 'id' | 'totalOrders' | 'totalSpending'>): Customer => {
    const id = `CUS${pad(nextSequence('customer') + customers.length, 3)}`
    const newCustomer: Customer = { ...c, id, totalOrders: 0, totalSpending: 0 }
    setCustomers(prev => [...prev, newCustomer])
    pushToast(`Customer "${c.name}" added`)
    return newCustomer
  }
  const updateCustomer = (id: string, patch: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))
    pushToast('Customer updated')
  }
  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id))
    pushToast('Customer deleted', 'info')
  }

  // ---------------- Orders ----------------
  const createOrder = (order: Omit<Order, 'id' | 'invoiceId'>): Order => {
    const seq = nextSequence('order')
    const year = currentYear()
    const id = `ORD-${year}-${pad(seq)}`
    const invoiceId = `INV-${year}-${pad(seq)}`
    const fullOrder: Order = { ...order, id, invoiceId }
    setOrders(prev => [fullOrder, ...prev])

    // Update / create customer stats
    const existing = findCustomerByPhone(order.customer.phone)
    if (existing) {
      updateCustomer(existing.id, {
        totalOrders: existing.totalOrders + 1,
        totalSpending: existing.totalSpending + order.grandTotal,
        lastOrder: order.date,
        name: order.customer.name || existing.name,
        address: order.customer.address || existing.address,
      })
    } else if (order.customer.name && order.customer.phone) {
      const newCust = addCustomer({
        name: order.customer.name,
        phone: order.customer.phone,
        address: order.customer.address,
        email: order.customer.email,
        status: 'Active',
      })
      updateCustomer(newCust.id, {
        totalOrders: 1, totalSpending: order.grandTotal, lastOrder: order.date,
      })
    }

    // Decrement inventory isn't tracked item-by-item since food items don't map
    // 1:1 to raw ingredients in this prototype; left as a hook point for the
    // real backend (see README "Connecting a backend").
    pushToast(`Order ${id} created`)
    return fullOrder
  }
  const updateOrder = (id: string, patch: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o))
    pushToast('Bill updated')
  }
  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id))
    pushToast('Bill deleted', 'info')
  }

  // ---------------- Employees ----------------
  const addEmployee = (e: Omit<Employee, 'id'>) => {
    const id = `EMP${pad(nextSequence('employee') + employees.length, 3)}`
    setEmployees(prev => [...prev, { ...e, id }])
    pushToast(`Employee "${e.fullName}" added`)
  }
  const updateEmployee = (id: string, patch: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e))
    pushToast('Employee updated')
  }
  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id))
    pushToast('Employee removed', 'info')
  }

  // ---------------- Attendance ----------------
  const markAttendance = (rec: Omit<AttendanceRecord, 'id'>) => {
    setAttendance(prev => {
      const existingIdx = prev.findIndex(a => a.employeeId === rec.employeeId && a.date === rec.date)
      if (existingIdx >= 0) {
        const copy = [...prev]
        copy[existingIdx] = { ...copy[existingIdx], ...rec }
        return copy
      }
      const id = `ATT${pad(nextSequence('attendance') + prev.length, 4)}`
      return [...prev, { ...rec, id }]
    })
  }

  // ---------------- Payroll ----------------
  const upsertSalary = (rec: Omit<SalaryRecord, 'id'> & { id?: string }) => {
    setSalaries(prev => {
      if (rec.id) {
        return prev.map(s => s.id === rec.id ? { ...s, ...rec } as SalaryRecord : s)
      }
      const existingIdx = prev.findIndex(s => s.employeeId === rec.employeeId && s.month === rec.month)
      if (existingIdx >= 0) {
        const copy = [...prev]
        copy[existingIdx] = { ...copy[existingIdx], ...rec }
        return copy
      }
      const id = `SAL${pad(nextSequence('salary') + prev.length, 3)}`
      return [...prev, { ...rec, id } as SalaryRecord]
    })
    pushToast('Payroll record saved')
  }

  // ---------------- Expenses ----------------
  const addExpense = (e: Omit<Expense, 'id'>) => {
    const id = `EXP${pad(nextSequence('expense') + expenses.length, 3)}`
    setExpenses(prev => [{ ...e, id }, ...prev])
    pushToast('Expense recorded')
  }
  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id))
    pushToast('Expense deleted', 'info')
  }

  // ---------------- Inventory ----------------
  const addInventoryItem = (i: Omit<InventoryItem, 'id' | 'status'>) => {
    const id = `INV${pad(nextSequence('inventory') + inventory.length, 3)}`
    setInventory(prev => [...prev, { ...i, id, status: computeInventoryStatus(i.quantity, i.minStock) }])
    pushToast(`"${i.name}" added to inventory`)
  }
  const updateInventoryItem = (id: string, patch: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(i => {
      if (i.id !== id) return i
      const merged = { ...i, ...patch }
      merged.status = computeInventoryStatus(merged.quantity, merged.minStock)
      return merged
    }))
    pushToast('Inventory updated')
  }
  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id))
    pushToast('Inventory item deleted', 'info')
  }

  // ---------------- Settings ----------------
  const updateSettings = (patch: Partial<RestaurantSettings>) => {
    setSettings(prev => ({ ...prev, ...patch }))
    pushToast('Settings saved')
  }

  const value: AppContextValue = {
    foodItems, orders, customers, employees, attendance, salaries, expenses, inventory, settings,
    activeSection, setActiveSection, currentUser, toasts, pushToast, dismissToast,
    addFoodItem, updateFoodItem, deleteFoodItem, toggleFoodAvailability,
    createOrder, updateOrder, deleteOrder,
    addCustomer, updateCustomer, deleteCustomer, findCustomerByPhone,
    addEmployee, updateEmployee, deleteEmployee,
    markAttendance,
    upsertSalary,
    addExpense, deleteExpense,
    addInventoryItem, updateInventoryItem, deleteInventoryItem,
    updateSettings,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
