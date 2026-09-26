/**
 * Domain types for the Hangu Food Point restaurant management system.
 * Keep these in sync with the future backend models (see README § Backend).
 */

// ---------------------------------------------------------------- menu ----
export interface MenuItem {
  id: string; // e.g. "MI-0001"
  name: string;
  category: string; // one of MENU_CATEGORIES
  description: string;
  price: number; // PKR — change prices in src/data/seed.ts (MENU_ITEMS)
  image?: string; // /images/cat-*.jpg
  available: boolean;
}

export const MENU_CATEGORIES = [
  'Burgers',
  'Shawarma & Rolls',
  'Pakistani BBQ',
  'Fried Items',
  'Pakistani Food',
  'Drinks',
] as const;

// ----------------------------------------------------------------- POS ----
export type OrderType = 'dine-in' | 'takeaway' | 'delivery';
export type PaymentMethod = 'cash' | 'card' | 'easypaisa' | 'jazzcash' | 'bank';
export type PaymentStatus = 'paid' | 'pending' | 'partial';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number; // unit price snapshot at order time
  qty: number;
  instructions?: string;
}

export interface Order {
  id: string; // ORD-2026-0001
  date: string; // ISO string
  customerId?: string;
  customerName: string;
  phone?: string;
  address?: string;
  type: OrderType;
  tableNo?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number; // flat PKR
  tax: number; // PKR
  serviceCharge: number; // PKR
  total: number; // grand total
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number; // change returned to customer
  balance: number; // remaining unpaid (total - amountPaid when partial/pending)
  status: PaymentStatus;
}

// ------------------------------------------------------------ customers ----
export interface Customer {
  id: string; // CUS-0001
  name: string;
  phone: string;
  address?: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder?: string; // ISO
  status: 'active' | 'inactive';
}

// ------------------------------------------------------------ employees ----
export type EmployeePosition =
  | 'Owner'
  | 'Manager'
  | 'HR'
  | 'Accountant'
  | 'Cashier'
  | 'Waiter'
  | 'Chef'
  | 'Kitchen Staff'
  | 'Delivery Rider'
  | 'Cleaner'
  | 'Security Guard'
  | 'Other';

export const EMPLOYEE_POSITIONS: EmployeePosition[] = [
  'Owner',
  'Manager',
  'HR',
  'Accountant',
  'Cashier',
  'Waiter',
  'Chef',
  'Kitchen Staff',
  'Delivery Rider',
  'Cleaner',
  'Security Guard',
  'Other',
];

export interface Employee {
  id: string; // EMP-0001
  name: string;
  fatherName: string;
  cnic: string;
  phone: string;
  address: string;
  position: EmployeePosition;
  department: string;
  joiningDate: string; // yyyy-mm-dd
  salary: number; // basic salary PKR
  salaryType: 'monthly' | 'daily' | 'weekly';
  workingHours: string; // e.g. "9:00 AM – 6:00 PM"
  shift: string; // e.g. "Morning" | "Evening"
  status: 'active' | 'on-leave' | 'inactive';
  emergencyContact: string;
}

// -------------------------------------------------------------- payroll ----
export interface PayrollRecord {
  id: string; // PAY-2026-09-0001
  employeeId: string;
  month: string; // yyyy-mm
  basic: number;
  allowances: number;
  overtime: number;
  bonus: number;
  advance: number;
  deductions: number;
  net: number; // basic + allowances + overtime + bonus - advance - deductions
  status: 'paid' | 'pending';
  paidDate?: string; // yyyy-mm-dd
}

// ----------------------------------------------------------- attendance ----
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // yyyy-mm-dd
  checkIn?: string; // HH:MM
  checkOut?: string; // HH:MM
  status: AttendanceStatus;
}

// ------------------------------------------------------------- expenses ----
export const EXPENSE_CATEGORIES = [
  'Electricity',
  'Gas',
  'Water',
  'Rent',
  'Food Supplies',
  'Salaries',
  'Maintenance',
  'Transportation',
  'Internet',
  'Other',
] as const;

export interface Expense {
  id: string; // EXP-0001
  name: string;
  category: string;
  amount: number;
  date: string; // yyyy-mm-dd
  description?: string;
  paidBy: string;
}

// ------------------------------------------------------------ inventory ----
export interface InventoryItem {
  id: string; // STK-0001
  name: string;
  category: string;
  qty: number;
  unit: string; // kg, litre, pcs, pack …
  minStock: number;
  purchasePrice: number; // per unit PKR
  supplier: string;
  expiry?: string; // yyyy-mm-dd
}

// ------------------------------------------------------------- settings ----
export interface Settings {
  restaurantName: string;
  address: string;
  phone: string;
  email: string;
  currency: string; // "PKR"
  currencySymbol: string; // "Rs"
  taxPercent: number;
  serviceChargePercent: number;
  invoiceFooter: string;
  openingTime: string; // HH:MM
  closingTime: string; // HH:MM
}

// ----------------------------------------------------------------- misc ----
export type CollectionKey =
  | 'menu'
  | 'orders'
  | 'customers'
  | 'employees'
  | 'payroll'
  | 'attendance'
  | 'expenses'
  | 'inventory';

export interface NewOrderInput {
  customerName: string;
  customerId?: string;
  phone?: string;
  address?: string;
  type: OrderType;
  tableNo?: string;
  items: { menuItemId: string; qty: number; instructions?: string }[];
  discount: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  card: 'Card',
  easypaisa: 'Easypaisa',
  jazzcash: 'JazzCash',
  bank: 'Bank Transfer',
};
