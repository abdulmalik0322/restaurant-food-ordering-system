import type {
  FoodItem, Employee, Customer, InventoryItem, Expense, Order, SalaryRecord,
  AttendanceRecord, RestaurantSettings, OrderType, PaymentMethod, PaymentStatus,
} from '../types'

// --------------------------------------------------------------------------
// Menu — prices live ONLY here (and in whatever the user edits at runtime,
// persisted to localStorage). Nothing in the POS/invoice/reports logic
// hard-codes a price; everything reads FoodItem.price. See README section
// "Where to change menu prices".
// --------------------------------------------------------------------------
export const seedFoodItems: FoodItem[] = [
  // Burgers
  { id: 'F001', name: 'Chicken Burger', category: 'Burgers', description: 'Grilled chicken patty, lettuce, mayo in a soft bun', price: 350, image: '🍔', available: true },
  { id: 'F002', name: 'Zinger Burger', category: 'Burgers', description: 'Crispy fried chicken fillet with spicy mayo', price: 420, image: '🍔', available: true },
  { id: 'F003', name: 'Beef Burger', category: 'Burgers', description: 'Juicy beef patty with cheese and pickles', price: 450, image: '🍔', available: true },
  { id: 'F004', name: 'Cheese Burger', category: 'Burgers', description: 'Classic beef patty loaded with melted cheese', price: 400, image: '🧀', available: true },
  { id: 'F005', name: 'Double Patty Burger', category: 'Burgers', description: 'Two beef patties, double cheese, special sauce', price: 620, image: '🍔', available: true },

  // Shawarma & Rolls
  { id: 'F006', name: 'Chicken Shawarma', category: 'Shawarma & Rolls', description: 'Rolled flatbread with grilled chicken and garlic sauce', price: 250, image: '🌯', available: true },
  { id: 'F007', name: 'Beef Shawarma', category: 'Shawarma & Rolls', description: 'Rolled flatbread with spiced beef strips', price: 280, image: '🌯', available: true },
  { id: 'F008', name: 'Chicken Roll', category: 'Shawarma & Rolls', description: 'Paratha roll stuffed with spicy chicken', price: 220, image: '🌯', available: true },
  { id: 'F009', name: 'Cheese Roll', category: 'Shawarma & Rolls', description: 'Paratha roll with chicken and melted cheese', price: 260, image: '🌯', available: true },
  { id: 'F010', name: 'BBQ Roll', category: 'Shawarma & Rolls', description: 'Paratha roll with smoky BBQ chicken tikka', price: 270, image: '🌯', available: true },

  // Pakistani BBQ
  { id: 'F011', name: 'Chicken Tikka (Full)', category: 'Pakistani BBQ', description: 'Charcoal-grilled marinated chicken', price: 650, image: '🍗', available: true },
  { id: 'F012', name: 'Chicken Boti', category: 'Pakistani BBQ', description: 'Boneless chicken chunks, char-grilled', price: 480, image: '🍢', available: true },
  { id: 'F013', name: 'Beef Seekh Kabab (4pc)', category: 'Pakistani BBQ', description: 'Minced beef skewers with signature spices', price: 400, image: '🍢', available: true },
  { id: 'F014', name: 'Chicken Seekh Kabab (4pc)', category: 'Pakistani BBQ', description: 'Minced chicken skewers, char-grilled', price: 360, image: '🍢', available: true },
  { id: 'F015', name: 'Malai Boti', category: 'Pakistani BBQ', description: 'Creamy marinated chicken boti', price: 520, image: '🍢', available: true },
  { id: 'F016', name: 'BBQ Platter', category: 'Pakistani BBQ', description: 'Mixed grill: tikka, boti, seekh kabab & naan', price: 1450, image: '🍖', available: true },

  // Fried Items
  { id: 'F017', name: 'Chicken Broast (2pc)', category: 'Fried Items', description: 'Crispy fried chicken with fries', price: 480, image: '🍗', available: true },
  { id: 'F018', name: 'Fried Chicken (4pc)', category: 'Fried Items', description: 'Golden fried chicken pieces', price: 620, image: '🍗', available: true },
  { id: 'F019', name: 'Chicken Nuggets (6pc)', category: 'Fried Items', description: 'Breaded chicken nuggets with dip', price: 320, image: '🍗', available: true },
  { id: 'F020', name: 'Chicken Wings (6pc)', category: 'Fried Items', description: 'Spicy fried chicken wings', price: 380, image: '🍗', available: true },
  { id: 'F021', name: 'French Fries', category: 'Fried Items', description: 'Crispy golden fries, salted', price: 200, image: '🍟', available: true },
  { id: 'F022', name: 'Loaded Fries', category: 'Fried Items', description: 'Fries topped with cheese, jalapeños & sauce', price: 350, image: '🍟', available: true },

  // Pakistani Food
  { id: 'F023', name: 'Chicken Karahi (Half)', category: 'Pakistani Food', description: 'Traditional wok-cooked chicken karahi', price: 950, image: '🍛', available: true },
  { id: 'F024', name: 'Beef Karahi (Half)', category: 'Pakistani Food', description: 'Traditional wok-cooked beef karahi', price: 1100, image: '🍛', available: true },
  { id: 'F025', name: 'Chicken Handi (Half)', category: 'Pakistani Food', description: 'Creamy chicken handi with special masala', price: 980, image: '🍛', available: true },
  { id: 'F026', name: 'Chicken Biryani (Plate)', category: 'Pakistani Food', description: 'Fragrant basmati rice with spiced chicken', price: 320, image: '🍚', available: true },
  { id: 'F027', name: 'Beef Pulao (Plate)', category: 'Pakistani Food', description: 'Aromatic rice cooked with tender beef', price: 340, image: '🍚', available: true },
  { id: 'F028', name: 'Daal Mash', category: 'Pakistani Food', description: 'Slow-cooked lentils, home style', price: 220, image: '🥘', available: true },
  { id: 'F029', name: 'Naan', category: 'Pakistani Food', description: 'Fresh tandoor-baked bread', price: 40, image: '🫓', available: true },
  { id: 'F030', name: 'Roti', category: 'Pakistani Food', description: 'Whole wheat tandoor bread', price: 25, image: '🫓', available: true },

  // Drinks
  { id: 'F031', name: 'Pepsi (Regular)', category: 'Drinks', description: 'Chilled 345ml can', price: 100, image: '🥤', available: true },
  { id: 'F032', name: 'Coke (Regular)', category: 'Drinks', description: 'Chilled 345ml can', price: 100, image: '🥤', available: true },
  { id: 'F033', name: '7UP (Regular)', category: 'Drinks', description: 'Chilled 345ml can', price: 100, image: '🥤', available: true },
  { id: 'F034', name: 'Sprite (Regular)', category: 'Drinks', description: 'Chilled 345ml can', price: 100, image: '🥤', available: true },
  { id: 'F035', name: 'Mineral Water', category: 'Drinks', description: '500ml bottle', price: 60, image: '💧', available: true },
  { id: 'F036', name: 'Fresh Juice', category: 'Drinks', description: 'Seasonal fresh fruit juice', price: 180, image: '🧃', available: true },
  { id: 'F037', name: 'Cold Coffee', category: 'Drinks', description: 'Chilled blended coffee with cream', price: 250, image: '☕', available: true },
  { id: 'F038', name: 'Tea (Doodh Patti)', category: 'Drinks', description: 'Traditional milk tea', price: 80, image: '☕', available: true },
]

export const seedEmployees: Employee[] = [
  { id: 'EMP001', fullName: 'Muhammad Hassan', fatherName: 'Abdul Rahman', cnic: '17301-1234567-1', phone: '0300-1234567', address: 'Model Town, Kohat', position: 'Owner', department: 'Management', joiningDate: '2019-01-05', salary: 0, salaryType: 'Monthly', workingHours: '—', shift: '—', status: 'Active', emergencyContact: '0300-9876543' },
  { id: 'EMP002', fullName: 'Ayesha Bibi', fatherName: 'Sher Alam', cnic: '17301-2345678-2', phone: '0301-2345678', address: 'Sadar Bazaar, Kohat', position: 'Manager', department: 'Operations', joiningDate: '2020-03-12', salary: 55000, salaryType: 'Monthly', workingHours: '10 AM - 8 PM', shift: 'Day', status: 'Active', emergencyContact: '0301-1112222' },
  { id: 'EMP003', fullName: 'Bilal Khan', fatherName: 'Sher Zaman Khan', cnic: '17301-3456789-3', phone: '0302-3456789', address: 'Jarma Road, Kohat', position: 'Chef', department: 'Kitchen', joiningDate: '2020-06-01', salary: 45000, salaryType: 'Monthly', workingHours: '11 AM - 11 PM', shift: 'Day', status: 'Active', emergencyContact: '0302-2223333' },
  { id: 'EMP004', fullName: 'Fahad Iqbal', fatherName: 'Iqbal Hussain', cnic: '17301-4567890-4', phone: '0303-4567890', address: 'Kachari Bazaar, Kohat', position: 'Cashier', department: 'Front Desk', joiningDate: '2021-02-20', salary: 30000, salaryType: 'Monthly', workingHours: '11 AM - 11 PM', shift: 'Day', status: 'Active', emergencyContact: '0303-3334444' },
  { id: 'EMP005', fullName: 'Sana Gul', fatherName: 'Gul Nawaz', cnic: '17301-5678901-5', phone: '0304-5678901', address: 'Cantt Area, Kohat', position: 'Waiter', department: 'Front of House', joiningDate: '2021-09-15', salary: 25000, salaryType: 'Monthly', workingHours: '12 PM - 12 AM', shift: 'Evening', status: 'Active', emergencyContact: '0304-4445555' },
  { id: 'EMP006', fullName: 'Zeeshan Ahmed', fatherName: 'Ahmed Nawaz', cnic: '17301-6789012-6', phone: '0305-6789012', address: 'Bannu Road, Kohat', position: 'Kitchen Staff', department: 'Kitchen', joiningDate: '2022-01-10', salary: 22000, salaryType: 'Monthly', workingHours: '11 AM - 11 PM', shift: 'Day', status: 'On Leave', emergencyContact: '0305-5556666' },
  { id: 'EMP007', fullName: 'Kamran Shah', fatherName: 'Shah Fahad', cnic: '17301-7890123-7', phone: '0306-7890123', address: 'Peshawar Road, Kohat', position: 'Delivery Rider', department: 'Delivery', joiningDate: '2022-05-18', salary: 20000, salaryType: 'Monthly', workingHours: '12 PM - 12 AM', shift: 'Evening', status: 'Active', emergencyContact: '0306-6667777' },
  { id: 'EMP008', fullName: 'Naseem Akhtar', fatherName: 'Akhtar Ali', cnic: '17301-8901234-8', phone: '0307-8901234', address: 'Township, Kohat', position: 'Accountant', department: 'Finance', joiningDate: '2021-07-01', salary: 40000, salaryType: 'Monthly', workingHours: '10 AM - 6 PM', shift: 'Day', status: 'Active', emergencyContact: '0307-7778888' },
  { id: 'EMP009', fullName: 'Rukhsana Bibi', fatherName: 'Bakht Zaman', cnic: '17301-9012345-9', phone: '0308-9012345', address: 'Hangu Road, Kohat', position: 'Cleaner', department: 'Maintenance', joiningDate: '2022-11-01', salary: 18000, salaryType: 'Monthly', workingHours: '9 AM - 5 PM', shift: 'Day', status: 'Active', emergencyContact: '0308-8889999' },
  { id: 'EMP010', fullName: 'Imran Wazir', fatherName: 'Wazir Gul', cnic: '17301-0123456-0', phone: '0309-0123456', address: 'Karak Road, Kohat', position: 'Security Guard', department: 'Security', joiningDate: '2020-09-09', salary: 22000, salaryType: 'Monthly', workingHours: 'Night Shift', shift: 'Night', status: 'Active', emergencyContact: '0309-9990000' },
]

export const seedCustomers: Customer[] = [
  { id: 'CUS001', name: 'Adil Mehmood', phone: '0333-1112233', address: 'Jarma Road, Kohat', email: 'adil.mehmood@example.com', totalOrders: 14, totalSpending: 48200, lastOrder: daysAgo(1), status: 'Active' },
  { id: 'CUS002', name: 'Farah Naz', phone: '0334-2223344', address: 'Cantt, Kohat', totalOrders: 9, totalSpending: 26400, lastOrder: daysAgo(3), status: 'Active' },
  { id: 'CUS003', name: 'Usman Tariq', phone: '0335-3334455', address: 'Model Town, Kohat', totalOrders: 21, totalSpending: 71500, lastOrder: daysAgo(0), status: 'Active' },
  { id: 'CUS004', name: 'Hina Yousaf', phone: '0336-4445566', address: 'Township, Kohat', totalOrders: 4, totalSpending: 9800, lastOrder: daysAgo(20), status: 'Inactive' },
  { id: 'CUS005', name: 'Junaid Afridi', phone: '0337-5556677', address: 'Bannu Road, Kohat', totalOrders: 30, totalSpending: 112300, lastOrder: daysAgo(2), status: 'Active' },
]

export const seedInventory: InventoryItem[] = [
  { id: 'INV001', name: 'Chicken', category: 'Meat', quantity: 45, unit: 'kg', minStock: 20, purchasePrice: 480, supplier: 'Kohat Poultry Farm', expiryDate: daysAhead(2), status: 'In Stock' },
  { id: 'INV002', name: 'Beef', category: 'Meat', quantity: 12, unit: 'kg', minStock: 15, purchasePrice: 900, supplier: 'Al-Madina Meat Suppliers', expiryDate: daysAhead(3), status: 'Low Stock' },
  { id: 'INV003', name: 'Flour (Atta)', category: 'Grocery', quantity: 80, unit: 'kg', minStock: 30, purchasePrice: 130, supplier: 'Sadar Grocers', status: 'In Stock' },
  { id: 'INV004', name: 'Rice (Basmati)', category: 'Grocery', quantity: 60, unit: 'kg', minStock: 25, purchasePrice: 260, supplier: 'Sadar Grocers', status: 'In Stock' },
  { id: 'INV005', name: 'Cooking Oil', category: 'Grocery', quantity: 8, unit: 'litre', minStock: 15, purchasePrice: 620, supplier: 'Kohat Oil Traders', status: 'Low Stock' },
  { id: 'INV006', name: 'Potatoes', category: 'Vegetables', quantity: 35, unit: 'kg', minStock: 15, purchasePrice: 90, supplier: 'Kachari Vegetable Market', status: 'In Stock' },
  { id: 'INV007', name: 'Mixed Vegetables', category: 'Vegetables', quantity: 5, unit: 'kg', minStock: 10, purchasePrice: 110, supplier: 'Kachari Vegetable Market', status: 'Low Stock' },
  { id: 'INV008', name: 'Spice Mix (Masala)', category: 'Spices', quantity: 18, unit: 'kg', minStock: 5, purchasePrice: 900, supplier: 'National Spices Co.', status: 'In Stock' },
  { id: 'INV009', name: 'Cheese Slices', category: 'Dairy', quantity: 0, unit: 'pack', minStock: 10, purchasePrice: 450, supplier: 'Kohat Dairy Mart', status: 'Out of Stock' },
  { id: 'INV010', name: 'Soft Drink Cans', category: 'Beverages', quantity: 220, unit: 'pcs', minStock: 100, purchasePrice: 70, supplier: 'PepsiCo Distributor', status: 'In Stock' },
  { id: 'INV011', name: 'Packaging Boxes', category: 'Packaging', quantity: 90, unit: 'pcs', minStock: 100, purchasePrice: 25, supplier: 'Kohat Packaging House', status: 'Low Stock' },
]

export const seedExpenses: Expense[] = [
  { id: 'EXP001', name: 'Monthly Electricity Bill', category: 'Electricity', amount: 42000, date: daysAgo(5), description: 'PESCO bill for last month', paidBy: 'Ayesha Bibi' },
  { id: 'EXP002', name: 'Gas Cylinder Refill', category: 'Gas', amount: 8500, date: daysAgo(4), description: 'Commercial gas cylinders x2', paidBy: 'Bilal Khan' },
  { id: 'EXP003', name: 'Shop Rent', category: 'Rent', amount: 65000, date: daysAgo(10), description: 'Monthly rent for outlet', paidBy: 'Muhammad Hassan' },
  { id: 'EXP004', name: 'Chicken & Meat Purchase', category: 'Food Supplies', amount: 38000, date: daysAgo(1), description: 'Weekly meat supply', paidBy: 'Naseem Akhtar' },
  { id: 'EXP005', name: 'Fridge Repair', category: 'Maintenance', amount: 6500, date: daysAgo(7), description: 'Walk-in freezer compressor fix', paidBy: 'Ayesha Bibi' },
  { id: 'EXP006', name: 'Delivery Fuel', category: 'Transportation', amount: 9000, date: daysAgo(2), description: 'Petrol for delivery bikes', paidBy: 'Kamran Shah' },
  { id: 'EXP007', name: 'Internet & WiFi', category: 'Internet', amount: 4500, date: daysAgo(12), description: 'Monthly internet package', paidBy: 'Naseem Akhtar' },
]

export const seedSettings: RestaurantSettings = {
  name: 'Hangu Food Point & Restaurant',
  logoEmoji: '🍽️',
  address: 'Main Bazaar Road, Kohat, Khyber Pakhtunkhwa, Pakistan',
  phone: '0333-9998877',
  email: 'info@hangufoodpoint.pk',
  currency: 'PKR',
  taxPercent: 5,
  serviceChargePercent: 5,
  invoiceFooter: 'Thank you for dining with us! Visit again.',
  openingTime: '11:00',
  closingTime: '23:30',
}

// --------------------------------------------------------------------------
// Helper: relative-date generators used only to make demo data feel current
// --------------------------------------------------------------------------
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(13, 30, 0, 0)
  return d.toISOString()
}
function daysAhead(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

// --------------------------------------------------------------------------
// Seed orders — a handful of realistic recent orders for dashboard/reports
// --------------------------------------------------------------------------
function buildOrder(
  seq: number, daysBack: number, customerName: string, phone: string,
  items: { item: FoodItem; qty: number }[], paymentMethod: PaymentMethod,
  paymentStatus: PaymentStatus, orderType: OrderType,
): Order {
  const subtotal = items.reduce((s, i) => s + i.item.price * i.qty, 0)
  const discount = seq % 4 === 0 ? Math.round(subtotal * 0.05) : 0
  const taxAmount = Math.round((subtotal - discount) * 0.05)
  const serviceChargeAmount = Math.round((subtotal - discount) * 0.05)
  const grandTotal = subtotal - discount + taxAmount + serviceChargeAmount
  const paid = paymentStatus === 'Pending' ? 0 : paymentStatus === 'Partial' ? Math.round(grandTotal * 0.5) : grandTotal
  return {
    id: `ORD-2026-${String(seq).padStart(4, '0')}`,
    invoiceId: `INV-2026-${String(seq).padStart(4, '0')}`,
    date: daysAgo(daysBack),
    customer: { name: customerName, phone, orderType },
    items: items.map(i => ({ itemId: i.item.id, name: i.item.name, price: i.item.price, quantity: i.qty })),
    subtotal, discount, discountType: 'flat', taxPercent: 5, taxAmount,
    serviceChargePercent: 5, serviceChargeAmount, grandTotal,
    paymentMethod, paymentStatus,
    amountPaid: paid, remaining: grandTotal - paid, changeReturn: 0,
  }
}

export function buildSeedOrders(foodItems: FoodItem[]): Order[] {
  const byId = (id: string) => foodItems.find(f => f.id === id)!
  return [
    buildOrder(1, 0, 'Usman Tariq', '0335-3334455', [{ item: byId('F002'), qty: 2 }, { item: byId('F021'), qty: 1 }, { item: byId('F031'), qty: 2 }], 'Cash', 'Paid', 'Dine-in'),
    buildOrder(2, 0, 'Junaid Afridi', '0337-5556677', [{ item: byId('F026'), qty: 2 }, { item: byId('F038'), qty: 2 }], 'Easypaisa', 'Paid', 'Takeaway'),
    buildOrder(3, 0, 'Adil Mehmood', '0333-1112233', [{ item: byId('F016'), qty: 1 }, { item: byId('F029'), qty: 4 }], 'Card', 'Paid', 'Dine-in'),
    buildOrder(4, 0, 'Farah Naz', '0334-2223344', [{ item: byId('F006'), qty: 3 }], 'JazzCash', 'Pending', 'Delivery'),
    buildOrder(5, 1, 'Usman Tariq', '0335-3334455', [{ item: byId('F023'), qty: 1 }, { item: byId('F030'), qty: 3 }], 'Cash', 'Paid', 'Dine-in'),
    buildOrder(6, 1, 'Hina Yousaf', '0336-4445566', [{ item: byId('F017'), qty: 1 }, { item: byId('F035'), qty: 1 }], 'Cash', 'Paid', 'Takeaway'),
    buildOrder(7, 2, 'Junaid Afridi', '0337-5556677', [{ item: byId('F013'), qty: 2 }, { item: byId('F022'), qty: 1 }], 'Bank Transfer', 'Paid', 'Dine-in'),
    buildOrder(8, 2, 'Adil Mehmood', '0333-1112233', [{ item: byId('F002'), qty: 1 }, { item: byId('F004'), qty: 1 }], 'Cash', 'Partial', 'Dine-in'),
    buildOrder(9, 3, 'Farah Naz', '0334-2223344', [{ item: byId('F009'), qty: 2 }, { item: byId('F037'), qty: 2 }], 'Easypaisa', 'Paid', 'Delivery'),
    buildOrder(10, 4, 'Junaid Afridi', '0337-5556677', [{ item: byId('F026'), qty: 3 }, { item: byId('F031'), qty: 3 }], 'Cash', 'Paid', 'Takeaway'),
    buildOrder(11, 6, 'Usman Tariq', '0335-3334455', [{ item: byId('F011'), qty: 1 }, { item: byId('F029'), qty: 4 }], 'Card', 'Paid', 'Dine-in'),
    buildOrder(12, 8, 'Adil Mehmood', '0333-1112233', [{ item: byId('F005'), qty: 2 }], 'Cash', 'Paid', 'Takeaway'),
    buildOrder(13, 12, 'Farah Naz', '0334-2223344', [{ item: byId('F024'), qty: 1 }, { item: byId('F030'), qty: 2 }], 'JazzCash', 'Paid', 'Delivery'),
    buildOrder(14, 18, 'Junaid Afridi', '0337-5556677', [{ item: byId('F002'), qty: 4 }, { item: byId('F021'), qty: 2 }], 'Cash', 'Paid', 'Dine-in'),
    buildOrder(15, 25, 'Usman Tariq', '0335-3334455', [{ item: byId('F026'), qty: 1 }], 'Cash', 'Paid', 'Takeaway'),
  ]
}

export function buildSeedSalaries(employees: Employee[]): SalaryRecord[] {
  return employees
    .filter(e => e.salary > 0)
    .map((e, idx) => {
      const allowances = Math.round(e.salary * 0.1)
      const overtime = idx % 3 === 0 ? 2000 : 0
      const bonus = idx % 4 === 0 ? 3000 : 0
      const advance = idx % 5 === 0 ? 5000 : 0
      const deductions = idx % 3 === 1 ? 1000 : 0
      const netSalary = e.salary + allowances + overtime + bonus - advance - deductions
      return {
        id: `SAL${String(idx + 1).padStart(3, '0')}`,
        employeeId: e.id,
        month: currentMonthKeyLocal(),
        basicSalary: e.salary,
        allowances, overtime, bonus, advance, deductions, netSalary,
        paymentStatus: idx % 3 === 0 ? 'Pending' : 'Paid',
        paymentDate: idx % 3 === 0 ? undefined : daysAgo(3).slice(0, 10),
      } as SalaryRecord
    })
}

export function buildSeedAttendance(employees: Employee[]): AttendanceRecord[] {
  const records: AttendanceRecord[] = []
  let seq = 1
  for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
    const date = daysAgo(dayOffset).slice(0, 10)
    employees.forEach((e, idx) => {
      const roll = (idx + dayOffset) % 10
      let status: AttendanceRecord['status'] = 'Present'
      if (roll === 7) status = 'Absent'
      else if (roll === 4) status = 'Late'
      else if (roll === 9) status = 'Leave'
      records.push({
        id: `ATT${String(seq++).padStart(4, '0')}`,
        employeeId: e.id,
        date,
        checkIn: status === 'Absent' || status === 'Leave' ? undefined : (status === 'Late' ? '11:15 AM' : '10:00 AM'),
        checkOut: status === 'Absent' || status === 'Leave' ? undefined : '08:00 PM',
        status,
      })
    })
  }
  return records
}

function currentMonthKeyLocal(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
