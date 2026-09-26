/** App shell: dark sidebar navigation, top header with global search, content area. */
import { useEffect, useRef, useState } from 'react';
import {
  BarChart3, Bell, CalendarCheck, LayoutDashboard, Menu as MenuIcon, Package,
  Receipt, Search, Settings, ShoppingCart, TrendingDown, UserCog, Users, UtensilsCrossed, Wallet, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import type { PageKey } from '../store/StoreContext';

interface NavItem { key: PageKey; label: string; icon: LucideIcon }
interface NavGroup { label: string; items: NavItem[] }

const NAV: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { key: 'pos', label: 'POS / New Order', icon: ShoppingCart },
      { key: 'menu', label: 'Menu / Food Items', icon: UtensilsCrossed },
      { key: 'bills', label: 'Bills & Invoices', icon: Receipt },
    ],
  },
  {
    label: 'People',
    items: [
      { key: 'customers', label: 'Customers', icon: Users },
      { key: 'employees', label: 'Employees', icon: UserCog },
      { key: 'attendance', label: 'Attendance', icon: CalendarCheck },
      { key: 'payroll', label: 'Salaries & Payroll', icon: Wallet },
    ],
  },
  {
    label: 'Finance & Stock',
    items: [
      { key: 'expenses', label: 'Expenses', icon: TrendingDown },
      { key: 'reports', label: 'Sales Reports', icon: BarChart3 },
      { key: 'inventory', label: 'Inventory', icon: Package },
    ],
  },
  {
    label: 'System',
    items: [{ key: 'settings', label: 'Settings', icon: Settings }],
  },
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { page, navigate, data } = useStore();
  const name = data?.settings.restaurantName ?? 'Hangu Food Point';
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-stone-950/50 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-stone-950 text-stone-300 transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-950/50">
            <UtensilsCrossed size={22} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-white">{name}</p>
            <p className="text-[11px] text-stone-500">Management System</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV.map((g) => (
            <div key={g.label} className="mb-4">
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-600">{g.label}</p>
              <div className="space-y-0.5">
                {g.items.map((it) => {
                  const active = page === it.key;
                  const Icon = it.icon;
                  return (
                    <button
                      key={it.key}
                      onClick={() => { navigate(it.key); onClose(); }}
                      className={`navlink ${active ? 'navlink-active' : ''}`}
                    >
                      <Icon size={18} className="shrink-0" />
                      <span className="truncate">{it.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 px-5 py-4">
          <p className="text-[11px] text-stone-600">Signed in as</p>
          <p className="text-sm font-semibold text-white">Owner</p>
        </div>
      </aside>
    </>
  );
}

function GlobalSearch() {
  const { searchAll, navigate } = useStore();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const results = searchAll(q);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        placeholder="Search food, orders, customers, employees, bills, expenses…"
        className="input pl-9"
      />
      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-xl">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-stone-400">No matches for “{q}”.</p>
          ) : (
            results.map((r) => (
              <button
                key={`${r.kind}-${r.id}`}
                onClick={() => { navigate(r.page); setOpen(false); setQ(''); }}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-orange-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-stone-800">{r.title}</p>
                  <p className="truncate text-xs text-stone-500">{r.subtitle}</p>
                </div>
                <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-500">{r.kind}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function Header({ onMenu }: { onMenu: () => void }) {
  const { data, navigate } = useStore();
  const lowStock = (data?.inventory ?? []).filter((i) => i.qty <= i.minStock).length;
  const today = new Date().toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-white/90 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
        <button className="icon-btn lg:hidden" onClick={onMenu} aria-label="Open menu"><MenuIcon size={20} /></button>
        <div className="hidden flex-1 md:block"><GlobalSearch /></div>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <span className="hidden text-xs text-stone-500 xl:block">{today}</span>
          <button
            className="icon-btn relative"
            title={lowStock > 0 ? `${lowStock} low-stock item(s)` : 'Inventory OK'}
            onClick={() => navigate('inventory')}
          >
            <Bell size={19} />
            {lowStock > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {lowStock}
              </span>
            )}
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white">O</div>
        </div>
      </div>
      <div className="px-4 pb-3 md:hidden"><GlobalSearch /></div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-full">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Header onMenu={() => setSidebarOpen(true)} />
        <main className="mx-auto max-w-[1400px] px-4 py-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
}

/** Small "close" helper for drawers/modals rendered inside pages. */
export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="icon-btn" onClick={onClick} aria-label="Close"><X size={18} /></button>
  );
}
