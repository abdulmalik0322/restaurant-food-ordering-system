import { StoreProvider, useStore } from './store/StoreContext';
import type { PageKey } from './store/StoreContext';
import { AppShell } from './components/layout';
import { ConfirmDialog, Toasts } from './components/ui';
import { UtensilsCrossed } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import MenuPage from './pages/MenuPage';
import POSPage from './pages/POSPage';
import BillsPage from './pages/BillsPage';
import CustomersPage from './pages/CustomersPage';
import EmployeesPage from './pages/EmployeesPage';
import PayrollPage from './pages/PayrollPage';
import AttendancePage from './pages/AttendancePage';
import ExpensesPage from './pages/ExpensesPage';
import ReportsPage from './pages/ReportsPage';
import InventoryPage from './pages/InventoryPage';
import SettingsPage from './pages/SettingsPage';

const PAGES: Record<PageKey, React.ComponentType> = {
  dashboard: Dashboard,
  menu: MenuPage,
  pos: POSPage,
  bills: BillsPage,
  customers: CustomersPage,
  employees: EmployeesPage,
  payroll: PayrollPage,
  attendance: AttendancePage,
  expenses: ExpensesPage,
  reports: ReportsPage,
  inventory: InventoryPage,
  settings: SettingsPage,
};

function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-950">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-xl">
        <UtensilsCrossed size={30} className="text-white" />
      </div>
      <div className="h-1.5 w-40 overflow-hidden rounded-full bg-stone-800">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-orange-500" />
      </div>
      <p className="text-sm text-stone-400">Loading restaurant data…</p>
    </div>
  );
}

function Router() {
  const { page, data, loading } = useStore();
  if (loading || !data) return <LoadingScreen />;
  const Page = PAGES[page];
  return (
    <AppShell>
      <div key={page} className="animate-fade-up">
        <Page />
      </div>
    </AppShell>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Router />
      <ConfirmDialog />
      <Toasts />
    </StoreProvider>
  );
}
