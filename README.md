# Hangu Food Point & Restaurant — Management System

A complete, professional **front-end restaurant management system** (ERP/POS) for a Pakistani
fast-food restaurant — built with **React 19 + TypeScript + Vite**, **Tailwind CSS v4**,
**Recharts** and **Lucide icons**. All data persists in the browser via **localStorage**,
and the data layer is structured so a real **Node.js/Express + PostgreSQL/MySQL** backend
can be plugged in later without touching any page or component.

---

## 1. Project structure

```
hangu-food-point/
├── index.html                 # page title, font, root div
├── package.json               # scripts: dev / build / preview
├── vite.config.ts             # Vite + React + Tailwind plugins
├── tsconfig*.json             # strict TypeScript config
├── public/
│   └── images/                # AI-generated food category photos
│       ├── cat-burgers.jpg  cat-shawarma.jpg  cat-bbq.jpg
│       ├── cat-fried.jpg    cat-desi.jpg      cat-drinks.jpg
└── src/
    ├── main.tsx               # React entry point
    ├── App.tsx                # page router (state-based) + providers
    ├── index.css              # Tailwind + theme + reusable classes
    │                            (.card .input .label .btn-* .tbl .navlink …)
    ├── types.ts               # ALL domain types + constants
    │                            (MenuItem, Order, Customer, Employee,
    │                             PayrollRecord, AttendanceRecord, Expense,
    │                             InventoryItem, Settings, MENU_CATEGORIES …)
    ├── data/
    │   └── seed.ts            # ★ demo dataset + ★ ALL MENU PRICES (PKR)
    ├── api/
    │   └── db.ts              # ★ persistence layer (localStorage now,
    │                            HTTP later) + unique-ID counters
    ├── store/
    │   └── StoreContext.tsx   # global state: collections, CRUD, toasts,
    │                            confirm dialogs, navigation, placeOrder(),
    │                            generatePayroll(), global search
    ├── utils/
    │   ├── format.ts          # formatPKR, formatDate/Time, helpers
    │   ├── print.ts           # printHtml() — hidden-iframe printing
    │   ├── documents.ts       # printable HTML: invoice, salary slip, report
    │   └── pdf.ts             # real PDF downloads via jsPDF
    ├── components/
    │   ├── ui.tsx             # Modal, DataTable, SearchBar, EmptyState,
    │   │                        Pagination, StatCard, Badge, Field,
    │   │                        PageHeader, Toasts, ConfirmDialog
    │   ├── layout.tsx         # Sidebar, Header, GlobalSearch, AppShell
    │   ├── FoodCard.tsx       # menu card + compact POS tile
    │   ├── InvoiceView.tsx    # on-screen invoice preview
    │   └── SalarySlipView.tsx # on-screen salary slip preview
    └── pages/                 # one file per sidebar section
        ├── Dashboard.tsx      # KPIs, sales chart, recent orders, popular items
        ├── MenuPage.tsx       # menu CRUD, categories, search, availability
        ├── POSPage.tsx        # cart, customer, discount, tax, payment, bill
        ├── BillsPage.tsx      # invoices: view/print/PDF/edit/delete + filters
        ├── CustomersPage.tsx  # customers + profile modal with order history
        ├── EmployeesPage.tsx  # full employee CRUD + profile view
        ├── PayrollPage.tsx    # generate payroll, components, slips, PDF/print
        ├── AttendancePage.tsx # daily marking + monthly summary
        ├── ExpensesPage.tsx   # expense CRUD + category filter + totals
        ├── ReportsPage.tsx    # daily/weekly/monthly/yearly KPIs + charts
        ├── InventoryPage.tsx  # stock CRUD + low/out-of-stock alerts
        └── SettingsPage.tsx   # restaurant profile, tax/service %, reset demo
```

---

## 2. Setup instructions

**Requirements:** Node.js 18+ and npm.

```bash
cd hangu-food-point
npm install      # install dependencies
```

---

## 3. How to run

```bash
npm run dev      # start dev server → http://localhost:5173
npm run build    # type-check + production build → dist/
npm run preview  # preview the production build locally
```

Open the printed URL in a browser. Demo data loads automatically on first visit.

---

## 4. Where menu prices can be changed

**All prices live in exactly one place: `src/data/seed.ts`, in the `MENU_ITEMS`
array** (clearly marked with a banner comment). Each item is:

```ts
['Zinger Burger', 'Burgers', 'Spicy marinated zinger fillet …', 350],
//  ↑ name          ↑ category   ↑ description                    ↑ price (PKR)
```

Change the number, reload — POS, invoices, bills and reports all use the new
price (orders already placed keep their historical snapshot, as a real system
would). Prices can also be edited at runtime via **Menu → Edit** on any item;
runtime edits are saved to localStorage.

---

## 5. How localStorage is being used

| Key | Contents |
|---|---|
| `hfp_menu` | food items |
| `hfp_orders` | orders / bills |
| `hfp_customers` | customers |
| `hfp_employees` | employees |
| `hfp_payroll` | salary records |
| `hfp_attendance` | attendance records |
| `hfp_expenses` | expenses |
| `hfp_inventory` | stock items |
| `hfp_settings` | restaurant settings |
| `hfp_counters` | unique-ID counters (ORD-2026-0001, CUS-0001 …) |
| `hfp_seeded_v1` | first-run flag |

- On **first launch**, `buildSeed()` writes the demo dataset once; the flag
  prevents re-seeding, so **refreshing the browser keeps all your changes**.
- Every mutation goes through the store (`StoreContext`), which calls
  `persist()` in `src/api/db.ts` immediately — no "save" button needed.
- **Settings → Danger Zone → Reset Demo Data** wipes everything and re-seeds.

---

## 6. Connecting the future Node.js / Express + database backend

The app is deliberately split into three layers so the backend swap is small:

```
pages & components  →  store/StoreContext.tsx  →  api/db.ts  →  localStorage
                                                        ↘ (later) HTTP → Express → PostgreSQL/MySQL
```

**Step-by-step:**

1. **Build the API** (Express + PostgreSQL/MySQL) with REST endpoints, e.g.
   `GET /api/menu`, `POST /api/orders`, `PUT /api/orders/:id`, `DELETE /api/orders/:id`,
   plus `/api/customers`, `/api/employees`, `/api/payroll`, `/api/attendance`,
   `/api/expenses`, `/api/inventory`, `/api/settings`, and auth endpoints
   (`POST /api/auth/login`, role-based middleware for Owner/Manager/HR/Cashier/
   Waiter/Accountant).

2. **Rewrite only `src/api/db.ts`.** Keep the exported `api` object's method
   signatures (`getAll()`, `saveCollection()`, `resetDemo()`, `nextId()`,
   `loadAll()`, `persist()`) and replace each body with `fetch()` calls.
   ID generation (`ORD-2026-0001` …) should move server-side (DB sequences);
   have the server return the created record including its id.

3. **Nothing else changes.** Pages and components only call the store, and the
   store only calls `api/db.ts` — no localStorage access exists anywhere else.
   The `api.*` methods already return Promises, so call sites look like network
   calls today.

4. **Suggested tables:** `menu_items, orders, order_items, customers, employees,
   payroll_records, attendance, expenses, inventory_items, settings, users,
   roles`. The TypeScript interfaces in `src/types.ts` map 1:1 to these tables —
   use them as the schema reference.

5. **Roles (UI-ready):** the sidebar and store are the natural place to add
   role-based visibility later — e.g. hide *Payroll/Reports/Settings* for the
   Cashier role once `api.getAll()` also returns the logged-in user's role.

---

## 7. Feature checklist

Dashboard KPIs · sales chart (today/week/month) · recent orders · popular items ·
menu CRUD + availability toggle · POS with cart/qty/discount/tax/service charge ·
5 payment methods · unique order IDs · customer info + auto customer records ·
invoice view/print/PDF · bills search + date/status filters · customer profiles +
order history · employee CRUD + profiles · payroll generation + salary components +
salary slip print/PDF · attendance marking + monthly summary · expenses + totals ·
reports (KPIs, charts, print, CSV) · inventory + low/out-of-stock alerts ·
settings applied to invoices/reports · global search · toasts · confirm dialogs ·
pagination · form validation · empty states · fully responsive · PKR everywhere.
