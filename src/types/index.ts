// ==========================================================================
// Core domain types for Hangu Food Point & Restaurant Management System
// ==========================================================================

export type Section =
  | 'dashboard'
  | 'menu'
  | 'pos'
  | 'bills'
  | 'customers'
  | 'employees'
  | 'attendance'
  | 'payroll'
  | 'expenses'
  | 'reports'
  | 'inventory'
  | 'settings'

// ---------------- Menu ----------------
export type FoodCategory =
  | 'Burgers'
  | 'Shawarma & Rolls'
  | 'Pakistani BBQ'
  | 'Fried Items'
  | 'Pakistani Food'
  | 'Drinks'

export interface FoodItem {
  id: string
  name: string
  category: FoodCategory
  description: string
  price: number
  image: string // emoji placeholder used as a lightweight image stand-in
  available: boolean
}

// ---------------- Orders / POS ----------------
export type OrderType = 'Dine-in' | 'Takeaway' | 'Delivery'
export type PaymentMethod = 'Cash' | 'Card' | 'Easypaisa' | 'JazzCash' | 'Bank Transfer'
export type PaymentStatus = 'Paid' | 'Pending' | 'Partial'

export interface OrderLineItem {
  itemId: string
  name: string
  price: number
  quantity: number
  instructions?: string
}

export interface CustomerInfo {
  customerId?: string
  name: string
  phone: string
  address?: string
  email?: string
  orderType: OrderType
  tableNumber?: string
}

export interface Order {
  id: string // ORD-2026-0001
  invoiceId: string // INV-2026-0001
  date: string // ISO
  customer: CustomerInfo
  items: OrderLineItem[]
  subtotal: number
  discount: number
  discountType: 'flat' | 'percent'
  taxPercent: number
  taxAmount: number
  serviceChargePercent: number
  serviceChargeAmount: number
  grandTotal: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  amountPaid: number
  remaining: number
  changeReturn: number
}

// ---------------- Customers ----------------
export interface Customer {
  id: string
  name: string
  phone: string
  address?: string
  email?: string
  totalOrders: number
  totalSpending: number
  lastOrder?: string
  status: 'Active' | 'Inactive'
}

// ---------------- Employees ----------------
export type EmployeePosition =
  | 'Owner' | 'Manager' | 'HR' | 'Accountant' | 'Cashier'
  | 'Waiter' | 'Chef' | 'Kitchen Staff' | 'Delivery Rider' | 'Cleaner' | 'Security Guard' | 'Other'

export type SalaryType = 'Monthly' | 'Daily' | 'Weekly'
export type EmployeeStatus = 'Active' | 'On Leave' | 'Inactive'

export interface Employee {
  id: string
  fullName: string
  fatherName: string
  cnic: string
  phone: string
  address: string
  position: EmployeePosition
  department: string
  joiningDate: string
  salary: number
  salaryType: SalaryType
  workingHours: string
  shift: string
  status: EmployeeStatus
  emergencyContact: string
}

// ---------------- Attendance ----------------
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave'

export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string // YYYY-MM-DD
  checkIn?: string
  checkOut?: string
  status: AttendanceStatus
}

// ---------------- Payroll ----------------
export type SalaryPaymentStatus = 'Paid' | 'Pending'

export interface SalaryRecord {
  id: string
  employeeId: string
  month: string // "2026-09"
  basicSalary: number
  allowances: number
  overtime: number
  bonus: number
  advance: number
  deductions: number
  netSalary: number
  paymentStatus: SalaryPaymentStatus
  paymentDate?: string
}

// ---------------- Expenses ----------------
export type ExpenseCategory =
  | 'Electricity' | 'Gas' | 'Water' | 'Rent' | 'Food Supplies'
  | 'Salaries' | 'Maintenance' | 'Transportation' | 'Internet' | 'Other'

export interface Expense {
  id: string
  name: string
  category: ExpenseCategory
  amount: number
  date: string
  description?: string
  paidBy: string
}

// ---------------- Inventory ----------------
export type InventoryUnit = 'kg' | 'g' | 'litre' | 'pcs' | 'pack' | 'dozen'
export type InventoryStatus = 'In Stock' | 'Low Stock' | 'Out of Stock'

export interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: InventoryUnit
  minStock: number
  purchasePrice: number
  supplier: string
  expiryDate?: string
  status: InventoryStatus
}

// ---------------- Settings ----------------
export interface RestaurantSettings {
  name: string
  logoEmoji: string
  address: string
  phone: string
  email: string
  currency: string
  taxPercent: number
  serviceChargePercent: number
  invoiceFooter: string
  openingTime: string
  closingTime: string
}

// ---------------- User roles (future backend) ----------------
export type UserRole = 'Owner' | 'Manager' | 'HR' | 'Cashier' | 'Waiter' | 'Accountant'

export interface AppUser {
  name: string
  role: UserRole
}

// ---------------- Misc ----------------
export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}
