/**
 * Demo dataset for Hangu Food Point & Restaurant.
 *
 * ═══ WHERE TO CHANGE MENU PRICES ══════════════════════════════════════════
 * Every menu price lives in the MENU_ITEMS array below (the `price` field,
 * in PKR). Change a number here, reload the app, and the new price is used
 * everywhere — POS, invoices, reports. No price is hard-coded anywhere else.
 * ══════════════════════════════════════════════════════════════════════════
 */
import type {
  AttendanceRecord,
  Customer,
  Employee,
  Expense,
  InventoryItem,
  MenuItem,
  Order,
  OrderItem,
  PayrollRecord,
  Settings,
} from '../types';
import type { AllData } from '../api/db';

/** Category → food photo shown on menu cards and in the POS. */
export const CATEGORY_IMAGES: Record<string, string> = {
  Burgers: '/images/cat-burgers.jpg',
  'Shawarma & Rolls': '/images/cat-shawarma.jpg',
  'Pakistani BBQ': '/images/cat-bbq.jpg',
  'Fried Items': '/images/cat-fried.jpg',
  'Pakistani Food': '/images/cat-desi.jpg',
  Drinks: '/images/cat-drinks.jpg',
};

type MenuSeed = [name: string, category: string, description: string, price: number];

export const MENU_SEED: MenuSeed[] = [
  // ── Burgers ──────────────────────────────────────────────────────────
  ['Chicken Burger', 'Burgers', 'Crispy chicken fillet, fresh lettuce, mayo in a toasted sesame bun', 250],
  ['Zinger Burger', 'Burgers', 'Spicy marinated zinger fillet with cheese slice and jalapeño mayo', 350],
  ['Beef Burger', 'Burgers', 'Juicy grilled beef patty, cheddar cheese, caramelised onions', 450],
  ['Cheese Burger', 'Burgers', 'Chicken patty loaded with double cheddar and smoky BBQ sauce', 320],
  ['Double Patty Burger', 'Burgers', 'Two flame-grilled patties, double cheese, house special sauce', 550],
  ['Grilled Chicken Burger', 'Burgers', 'Char-grilled chicken breast, garlic mayo, fresh veggies', 380],
  // ── Shawarma & Rolls ─────────────────────────────────────────────────
  ['Chicken Shawarma', 'Shawarma & Rolls', 'Classic Arabic-style shawarma with garlic sauce and pickles', 200],
  ['Beef Shawarma', 'Shawarma & Rolls', 'Slow-cooked beef strips, tahini sauce, wrapped in khubz', 280],
  ['Chicken Paratha Roll', 'Shawarma & Rolls', 'Desi-style flaky paratha roll with spicy chicken filling', 250],
  ['Cheese Paratha Roll', 'Shawarma & Rolls', 'Chicken paratha roll stuffed with melted mozzarella', 300],
  ['BBQ Paratha Roll', 'Shawarma & Rolls', 'Smoky BBQ chicken tikka pieces in a crispy paratha', 320],
  // ── Pakistani BBQ ────────────────────────────────────────────────────
  ['Chicken Tikka', 'Pakistani BBQ', 'Char-grilled leg piece marinated overnight in desi spices', 280],
  ['Chicken Boti (8 pcs)', 'Pakistani BBQ', 'Tender boneless cubes grilled over coal, served with chutney', 350],
  ['Beef Seekh Kabab (4 pcs)', 'Pakistani BBQ', 'Hand-minced beef kababs with green chillies and coriander', 450],
  ['Chicken Seekh Kabab (4 pcs)', 'Pakistani BBQ', 'Juicy minced chicken kababs, lightly spiced, coal-smoked', 380],
  ['Chicken Malai Boti', 'Pakistani BBQ', 'Creamy, mild and melt-in-mouth boti — a crowd favourite', 420],
  ['Special BBQ Platter', 'Pakistani BBQ', 'Tikka, malai boti, seekh kabab and wings with 4 naans — serves 3–4', 1200],
  // ── Fried Items ──────────────────────────────────────────────────────
  ['Chicken Broast (2 pcs)', 'Fried Items', 'Extra-crispy broast with fries, bun and garlic dip', 380],
  ['Crispy Fried Chicken (2 pcs)', 'Fried Items', 'Golden fried chicken pieces, crunchy coating, served hot', 350],
  ['Chicken Nuggets (6 pcs)', 'Fried Items', 'Bite-size crispy nuggets with sweet chilli dip', 300],
  ['Hot Wings (8 pcs)', 'Fried Items', 'Tossed in fiery buffalo sauce with cooling dip', 400],
  ['French Fries', 'Fried Items', 'Golden shoestring fries with our signature masala sprinkle', 180],
  ['Loaded Fries', 'Fried Items', 'Fries loaded with chicken chunks, cheese sauce and jalapeños', 350],
  // ── Pakistani Food ───────────────────────────────────────────────────
  ['Chicken Karahi (Half)', 'Pakistani Food', 'Traditional tomato-ginger karahi cooked in desi ghee', 750],
  ['Beef Karahi (Half)', 'Pakistani Food', 'Slow-cooked beef karahi, rich and full of flavour', 950],
  ['Chicken Handi (Half)', 'Pakistani Food', 'Creamy white handi with black pepper and fresh cream', 800],
  ['Chicken Biryani', 'Pakistani Food', 'Fragrant basmati layered with spiced chicken and potatoes', 250],
  ['Beef Pulao', 'Pakistani Food', 'Yakhni-style beef pulao with whole spices', 300],
  ['Daal Fry Tarka', 'Pakistani Food', 'Yellow daal finished with a sizzling garlic tarka', 200],
  ['Roghni Naan', 'Pakistani Food', 'Soft sesame-topped naan baked fresh in the tandoor', 40],
  ['Tandoori Roti', 'Pakistani Food', 'Whole-wheat roti, fresh off the tandoor wall', 25],
  // ── Drinks ───────────────────────────────────────────────────────────
  ['Pepsi (Can)', 'Drinks', 'Chilled 345ml can — the classic fast-food partner', 100],
  ['Coca-Cola (Can)', 'Drinks', 'Ice-cold Coke, 345ml can', 100],
  ['7UP', 'Drinks', 'Crisp lemon-lime cooler, served chilled', 100],
  ['Sprite', 'Drinks', 'Clear, crisp and refreshing', 100],
  ['Mineral Water', 'Drinks', 'Pure bottled mineral water, 500ml', 80],
  ['Fresh Orange Juice', 'Drinks', 'Squeezed to order — no added sugar', 250],
  ['Cold Coffee', 'Drinks', 'Blended iced coffee topped with cream', 350],
  ['Doodh Patti', 'Drinks', 'Slow-brewed milky chai, desi style', 120],
];

const menu: MenuItem[] = MENU_SEED.map(([name, category, description, price], i) => ({
  id: `MI-${String(i + 1).padStart(4, '0')}`,
  name,
  category,
  description,
  price,
  image: CATEGORY_IMAGES[category],
  available: true,
}));

// --------------------------------------------------------------- customers
const customers: Customer[] = [
  { id: 'CUS-0001', name: 'Ahmed Raza', phone: '0345-2345678', address: 'Gulberg Colony, Hangu', email: 'ahmed.raza@gmail.com', totalOrders: 0, totalSpent: 0, status: 'active' },
  { id: 'CUS-0002', name: 'Bilal Hussain', phone: '0333-8765432', address: 'Main Bazar, Hangu', totalOrders: 0, totalSpent: 0, status: 'active' },
  { id: 'CUS-0003', name: 'Fatima Noor', phone: '0321-4567890', address: 'Shahi Bagh Road, Hangu', email: 'fatima.noor@gmail.com', totalOrders: 0, totalSpent: 0, status: 'active' },
  { id: 'CUS-0004', name: 'Usman Ghani', phone: '0300-1122334', address: 'Kohat Road, Hangu', totalOrders: 0, totalSpent: 0, status: 'active' },
  { id: 'CUS-0005', name: 'Ayesha Khan', phone: '0344-5566778', address: 'Civil Colony, Hangu', totalOrders: 0, totalSpent: 0, status: 'active' },
  { id: 'CUS-0006', name: 'Muhammad Zubair', phone: '0315-9988776', address: 'Thall Road, Hangu', totalOrders: 0, totalSpent: 0, status: 'active' },
  { id: 'CUS-0007', name: 'Sana Malik', phone: '0332-4455667', address: 'Doaba Road, Hangu', email: 'sana.malik@gmail.com', totalOrders: 0, totalSpent: 0, status: 'active' },
  { id: 'CUS-0008', name: 'Kashif Mehmood', phone: '0301-7788990', address: 'Main Bazar, Hangu', totalOrders: 0, totalSpent: 0, status: 'inactive' },
];

// --------------------------------------------------------------- employees
type EmpSeed = [name: string, position: Employee['position'], salary: number, phone: string, status: Employee['status']];
const EMP_SEED: EmpSeed[] = [
  ['Abdul Malik', 'Owner', 120000, '0345-0000001', 'active'],
  ['Bilal Ahmed', 'Manager', 65000, '0345-0000002', 'active'],
  ['Fatima Khan', 'HR', 55000, '0345-0000003', 'active'],
  ['Kamran Shah', 'Accountant', 60000, '0345-0000004', 'active'],
  ['Usman Tariq', 'Cashier', 40000, '0345-0000005', 'active'],
  ['Danish Ali', 'Cashier', 40000, '0345-0000006', 'active'],
  ['Adnan Hussain', 'Waiter', 32000, '0345-0000007', 'active'],
  ['Faisal Mehmood', 'Waiter', 32000, '0345-0000008', 'on-leave'],
  ['Nadeem Butt', 'Chef', 55000, '0345-0000009', 'active'],
  ['Rashid Minhas', 'Chef', 45000, '0345-0000010', 'active'],
  ['Javed Iqbal', 'Kitchen Staff', 35000, '0345-0000011', 'active'],
  ['Salman Raza', 'Delivery Rider', 35000, '0345-0000012', 'active'],
  ['Waqas Ahmed', 'Delivery Rider', 35000, '0345-0000013', 'active'],
  ['Shabbir Hussain', 'Cleaner', 28000, '0345-0000014', 'active'],
  ['Muhammad Aslam', 'Security Guard', 30000, '0345-0000015', 'active'],
];

const DEPARTMENTS: Record<string, string> = {
  Owner: 'Management', Manager: 'Management', HR: 'Human Resources', Accountant: 'Finance',
  Cashier: 'Front Desk', Waiter: 'Service', Chef: 'Kitchen', 'Kitchen Staff': 'Kitchen',
  'Delivery Rider': 'Delivery', Cleaner: 'Housekeeping', 'Security Guard': 'Security', Other: 'General',
};

const employees: Employee[] = EMP_SEED.map(([name, position, salary, phone, status], i) => {
  const year = 2021 + (i % 4);
  const month = String(1 + ((i * 3) % 11)).padStart(2, '0');
  return {
    id: `EMP-${String(i + 1).padStart(4, '0')}`,
    name,
    fatherName: ['Islam Ud Din', 'Muhammad Rafiq', 'Ghulam Abbas', 'Sher Zaman', 'Abdul Sattar'][i % 5],
    cnic: `14202-${String(1000000 + i * 137913).slice(0, 7)}-${i % 10}`,
    phone,
    address: 'Hangu, Khyber Pakhtunkhwa',
    position,
    department: DEPARTMENTS[position],
    joiningDate: `${year}-${month}-05`,
    salary,
    salaryType: 'monthly',
    workingHours: position === 'Security Guard' ? '8:00 PM – 8:00 AM' : '11:00 AM – 11:00 PM',
    shift: position === 'Security Guard' ? 'Night' : i % 2 === 0 ? 'Morning' : 'Evening',
    status,
    emergencyContact: `03${String(40 + i)}5-999000${i % 10}`,
  };
});

// --------------------------------------------------------------- inventory
type InvSeed = [name: string, category: string, qty: number, unit: string, minStock: number, purchasePrice: number, supplier: string];
const INV_SEED: InvSeed[] = [
  ['Chicken (Meat)', 'Meat', 42, 'kg', 10, 585, 'Hangu Meat House'],
  ['Beef (Meat)', 'Meat', 24, 'kg', 8, 1150, 'Hangu Meat House'],
  ['Flour (Maida)', 'Grocery', 95, 'kg', 20, 145, 'Al-Madina General Store'],
  ['Rice (Basmati)', 'Grocery', 48, 'kg', 10, 345, 'Al-Madina General Store'],
  ['Cooking Oil', 'Grocery', 55, 'litre', 15, 520, 'Kohat Oil Depot'],
  ['Potatoes', 'Vegetables', 78, 'kg', 20, 95, 'Sabzi Mandi Hangu'],
  ['Mixed Vegetables', 'Vegetables', 26, 'kg', 8, 130, 'Sabzi Mandi Hangu'],
  ['Mixed Spices', 'Grocery', 2.5, 'kg', 3, 950, 'Al-Madina General Store'],
  ['Cheese (Mozzarella)', 'Dairy', 1.2, 'kg', 2, 1850, 'Kohat Dairy Farm'],
  ['Soft Drinks Stock', 'Beverages', 210, 'pcs', 48, 85, 'Pepsi Distributor Kohat'],
  ['Packaging (Boxes & Bags)', 'Packaging', 480, 'pcs', 100, 28, 'Lahore Packaging Co.'],
  ['BBQ Coal', 'Fuel', 0, 'kg', 5, 180, 'Local Supplier'],
  ['Fresh Cream', 'Dairy', 6, 'litre', 2, 420, 'Kohat Dairy Farm'],
];

const inventory: InventoryItem[] = INV_SEED.map(([name, category, qty, unit, minStock, purchasePrice, supplier], i) => ({
  id: `STK-${String(i + 1).padStart(4, '0')}`,
  name,
  category,
  qty,
  unit,
  minStock,
  purchasePrice,
  supplier,
  expiry: category === 'Dairy' ? '2026-10-15' : undefined,
}));

// ---------------------------------------------------------------- expenses
type ExpSeed = [name: string, category: string, amount: number, day: number, description: string, paidBy: string];
const EXP_SEED: ExpSeed[] = [
  ['Monthly Shop Rent — September', 'Rent', 60000, 1, 'Shop rent for September 2026', 'Abdul Malik'],
  ['Internet Bill (PTCL)', 'Internet', 4500, 3, 'Monthly broadband bill', 'Kamran Shah'],
  ['Vegetables & Spices Purchase', 'Food Supplies', 38500, 5, 'Weekly sabzi mandi purchase', 'Bilal Ahmed'],
  ['Electricity Bill (WAPDA)', 'Electricity', 18450, 8, 'August meter bill', 'Kamran Shah'],
  ['Chicken & Meat Purchase', 'Food Supplies', 46200, 10, 'Bulk meat purchase for the week', 'Bilal Ahmed'],
  ['Sui Gas Bill', 'Gas', 9200, 12, 'Monthly gas bill', 'Kamran Shah'],
  ['Kitchen Equipment Repair', 'Maintenance', 12500, 15, 'Fryer thermostat replacement', 'Bilal Ahmed'],
  ['Delivery Bike Fuel', 'Transportation', 8000, 18, 'Petrol for 2 delivery bikes', 'Salman Raza'],
  ['Water Tanker', 'Water', 3500, 20, 'Water supply tanker', 'Bilal Ahmed'],
  ['Facebook Page Promotion', 'Other', 15000, 22, 'Online marketing for new deals', 'Abdul Malik'],
];

const expenses: Expense[] = EXP_SEED.map(([name, category, amount, day, description, paidBy], i) => ({
  id: `EXP-${String(i + 1).padStart(4, '0')}`,
  name,
  category,
  amount,
  date: `2026-09-${String(day).padStart(2, '0')}`,
  description,
  paidBy,
}));

// ------------------------------------------------------------------ orders
/** Deterministic PRNG so the demo dataset is stable across reloads. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Popular items get picked more often (menu index → weight).
const POPULAR = [1, 6, 11, 23, 27, 30, 31, 38]; // zinger, shawarma, tikka, fries, karahi, biryani, naan, pepsi

function buildOrders(): Order[] {
  const rnd = mulberry32(20260925);
  const list: Order[] = [];
  const TAX = 0.05;
  const SERVICE = 0.05;
  const methods = ['cash', 'cash', 'cash', 'cash', 'easypaisa', 'easypaisa', 'jazzcash', 'card', 'bank'] as const;
  const types = ['dine-in', 'dine-in', 'dine-in', 'takeaway', 'takeaway', 'delivery'] as const;
  const N = 34;

  for (let i = 0; i < N; i++) {
    // Spread across the last 30 days, clustered at lunch & dinner rush.
    const daysAgo = Math.floor(rnd() * 30);
    const d = new Date(2026, 8, 25 - daysAgo);
    const rush = rnd();
    const hour = rush < 0.4 ? 12 + Math.floor(rnd() * 4) : rush < 0.8 ? 19 + Math.floor(rnd() * 4) : 10 + Math.floor(rnd() * 12);
    d.setHours(hour, Math.floor(rnd() * 60), 0, 0);

    const itemCount = 1 + Math.floor(rnd() * 3);
    const items: OrderItem[] = [];
    const picked = new Set<number>();
    for (let k = 0; k < itemCount; k++) {
      let idx: number;
      do {
        idx = rnd() < 0.55 ? POPULAR[Math.floor(rnd() * POPULAR.length)] : Math.floor(rnd() * menu.length);
      } while (picked.has(idx));
      picked.add(idx);
      const m = menu[idx];
      items.push({ menuItemId: m.id, name: m.name, price: m.price, qty: 1 + Math.floor(rnd() * 3) });
    }

    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
    const discPct = [0, 0, 0, 0, 5, 10][Math.floor(rnd() * 6)];
    const discount = Math.round((subtotal * discPct) / 100);
    const base = subtotal - discount;
    const tax = Math.round(base * TAX);
    const serviceCharge = Math.round(base * SERVICE);
    const total = base + tax + serviceCharge;

    const roll = rnd();
    const status = roll < 0.88 ? 'paid' : roll < 0.95 ? 'partial' : 'pending';
    const amountPaid = status === 'paid' ? total : status === 'partial' ? Math.round(total * (0.5 + rnd() * 0.3)) : 0;

    const useCustomer = rnd() < 0.62;
    const cust = useCustomer ? customers[Math.floor(rnd() * customers.length)] : undefined;
    const type = types[Math.floor(rnd() * types.length)];

    list.push({
      id: `ORD-2026-${String(i + 1).padStart(4, '0')}`,
      date: d.toISOString(),
      customerId: cust?.id,
      customerName: cust?.name ?? 'Walk-in Customer',
      phone: cust?.phone,
      address: cust?.address,
      type,
      tableNo: type === 'dine-in' ? `T-${1 + Math.floor(rnd() * 12)}` : undefined,
      items,
      subtotal,
      discount,
      tax,
      serviceCharge,
      total,
      paymentMethod: methods[Math.floor(rnd() * methods.length)],
      amountPaid,
      change: Math.max(0, amountPaid - total),
      balance: Math.max(0, total - amountPaid),
      status: status as Order['status'],
    });
  }

  // Newest first.
  list.sort((a, b) => +new Date(b.date) - +new Date(a.date));

  // Roll order stats into customers.
  const agg = new Map<string, { n: number; spent: number; last: string }>();
  for (const o of list) {
    if (!o.customerId) continue;
    const a = agg.get(o.customerId) ?? { n: 0, spent: 0, last: '' };
    a.n += 1; a.spent += o.total;
    if (!a.last || o.date > a.last) a.last = o.date;
    agg.set(o.customerId, a);
  }
  for (const c of customers) {
    const a = agg.get(c.id);
    if (a) { c.totalOrders = a.n; c.totalSpent = a.spent; c.lastOrder = a.last; }
  }
  return list;
}

// ----------------------------------------------------------------- payroll
function buildPayroll(): PayrollRecord[] {
  // August 2026 payroll — mostly paid. September is generated by the owner.
  return employees
    .filter((e) => e.salaryType === 'monthly')
    .map((e, i) => {
      const allowances = e.position === 'Manager' || e.position === 'Chef' ? 5000 : 2000;
      const overtime = i % 4 === 0 ? 3000 : 0;
      const bonus = i === 8 ? 5000 : 0; // head chef performance bonus
      const advance = i % 5 === 0 ? 5000 : 0;
      const deductions = i % 6 === 0 ? 1500 : 0;
      const net = e.salary + allowances + overtime + bonus - advance - deductions;
      return {
        id: `PAY-${String(i + 1).padStart(4, '0')}`,
        employeeId: e.id,
        month: '2026-08',
        basic: e.salary,
        allowances,
        overtime,
        bonus,
        advance,
        deductions,
        net,
        status: i === 13 ? 'pending' : 'paid',
        paidDate: i === 13 ? undefined : '2026-09-05',
      };
    });
}

// --------------------------------------------------------------- attendance
function buildAttendance(): AttendanceRecord[] {
  const rnd = mulberry32(77);
  const recs: AttendanceRecord[] = [];
  let n = 0;
  for (let back = 0; back < 3; back++) {
    const d = new Date(2026, 8, 25 - back);
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    for (const e of employees) {
      if (e.status !== 'active') continue;
      const r = rnd();
      const status = r < 0.85 ? 'present' : r < 0.92 ? 'late' : r < 0.97 ? 'leave' : 'absent';
      n += 1;
      recs.push({
        id: `ATT-${String(n).padStart(6, '0')}`,
        employeeId: e.id,
        date,
        checkIn: status === 'present' ? '11:05' : status === 'late' ? '11:45' : undefined,
        checkOut: status === 'present' || status === 'late' ? '23:00' : undefined,
        status: status as AttendanceRecord['status'],
      });
    }
  }
  return recs;
}

// ---------------------------------------------------------------- settings
const settings: Settings = {
  restaurantName: 'Hangu Food Point & Restaurant',
  address: 'Main Bazar Road, Hangu, Khyber Pakhtunkhwa, Pakistan',
  phone: '0333-1234567',
  email: 'info@hangufoodpoint.pk',
  currency: 'PKR',
  currencySymbol: 'Rs',
  taxPercent: 5,
  serviceChargePercent: 5,
  invoiceFooter: 'Thank you for dining with us! Please visit again.',
  openingTime: '10:00',
  closingTime: '23:00',
};

// ------------------------------------------------------------------- build
export function buildSeed(): AllData {
  const orders = buildOrders();
  return {
    menu,
    orders,
    customers,
    employees,
    payroll: buildPayroll(),
    attendance: buildAttendance(),
    expenses,
    inventory,
    settings: { ...settings },
    counters: {
      order: orders.length,
      customer: customers.length,
      employee: employees.length,
      expense: expenses.length,
      inventory: inventory.length,
      payroll: 15,
      attendance: 60,
    },
  };
}
