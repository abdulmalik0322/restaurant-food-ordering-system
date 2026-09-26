import React, { useMemo, useState } from 'react'
import { Menu, Search, Bell, ChevronDown, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatPKR } from '../../utils/format'

const SECTION_TITLES: Record<string, string> = {
  dashboard: 'Dashboard', menu: 'Menu / Food Items', pos: 'POS / New Order',
  bills: 'Bills & Invoices', customers: 'Customers', employees: 'Employees',
  attendance: 'Attendance', payroll: 'Salaries & Payroll', expenses: 'Expenses',
  reports: 'Sales Reports', inventory: 'Inventory', settings: 'Settings',
}

interface HeaderProps {
  onOpenMobileNav: () => void
}

const Header: React.FC<HeaderProps> = ({ onOpenMobileNav }) => {
  const { activeSection, setActiveSection, currentUser, foodItems, orders, customers, employees, expenses } = useApp()
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return {
      foodItems: foodItems.filter(f => f.name.toLowerCase().includes(q)).slice(0, 4),
      orders: orders.filter(o => o.id.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q)).slice(0, 4),
      customers: customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q)).slice(0, 4),
      employees: employees.filter(e => e.fullName.toLowerCase().includes(q)).slice(0, 4),
      expenses: expenses.filter(e => e.name.toLowerCase().includes(q)).slice(0, 4),
    }
  }, [query, foodItems, orders, customers, employees, expenses])

  const hasResults = results && Object.values(results).some(arr => arr.length > 0)

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-ink-100 h-16 flex items-center gap-3 px-4 sm:px-6">
      <button className="sm:hidden text-ink-600" onClick={onOpenMobileNav}>
        <Menu size={22} />
      </button>

      <h2 className="font-display font-semibold text-ink-900 text-base sm:text-lg hidden sm:block shrink-0">
        {SECTION_TITLES[activeSection]}
      </h2>

      <div className="relative flex-1 max-w-md ml-0 sm:ml-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          className="input pl-9 text-sm"
          placeholder="Search items, orders, customers, employees..."
          value={query}
          onChange={e => { setQuery(e.target.value); setShowResults(true) }}
          onFocus={() => setShowResults(true)}
        />
        {query && (
          <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400" onClick={() => setQuery('')}>
            <X size={14} />
          </button>
        )}

        {showResults && query && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl border border-ink-100 shadow-xl max-h-96 overflow-y-auto z-40">
            {!hasResults && <p className="p-4 text-sm text-ink-400">No matches for "{query}"</p>}
            {results?.foodItems.length ? (
              <SearchGroup label="Menu Items">
                {results.foodItems.map(f => (
                  <SearchRow key={f.id} title={f.name} sub={`${f.category} · ${formatPKR(f.price)}`}
                    onClick={() => { setActiveSection('menu'); setShowResults(false); setQuery('') }} />
                ))}
              </SearchGroup>
            ) : null}
            {results?.orders.length ? (
              <SearchGroup label="Orders / Bills">
                {results.orders.map(o => (
                  <SearchRow key={o.id} title={o.id} sub={`${o.customer.name} · ${formatPKR(o.grandTotal)}`}
                    onClick={() => { setActiveSection('bills'); setShowResults(false); setQuery('') }} />
                ))}
              </SearchGroup>
            ) : null}
            {results?.customers.length ? (
              <SearchGroup label="Customers">
                {results.customers.map(c => (
                  <SearchRow key={c.id} title={c.name} sub={c.phone}
                    onClick={() => { setActiveSection('customers'); setShowResults(false); setQuery('') }} />
                ))}
              </SearchGroup>
            ) : null}
            {results?.employees.length ? (
              <SearchGroup label="Employees">
                {results.employees.map(e => (
                  <SearchRow key={e.id} title={e.fullName} sub={e.position}
                    onClick={() => { setActiveSection('employees'); setShowResults(false); setQuery('') }} />
                ))}
              </SearchGroup>
            ) : null}
            {results?.expenses.length ? (
              <SearchGroup label="Expenses">
                {results.expenses.map(e => (
                  <SearchRow key={e.id} title={e.name} sub={formatPKR(e.amount)}
                    onClick={() => { setActiveSection('expenses'); setShowResults(false); setQuery('') }} />
                ))}
              </SearchGroup>
            ) : null}
          </div>
        )}
      </div>

      <button className="relative p-2 rounded-lg hover:bg-ink-100 text-ink-500 shrink-0">
        <Bell size={19} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-600" />
      </button>

      <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-ink-100 shrink-0">
        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold">
          {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="text-xs leading-tight">
          <p className="font-medium text-ink-800">{currentUser.name}</p>
          <p className="text-ink-400">{currentUser.role}</p>
        </div>
        <ChevronDown size={14} className="text-ink-400" />
      </div>
    </header>
  )
}

const SearchGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="py-1.5">
    <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-400">{label}</p>
    {children}
  </div>
)

const SearchRow: React.FC<{ title: string; sub: string; onClick: () => void }> = ({ title, sub, onClick }) => (
  <button onClick={onClick} className="w-full text-left px-4 py-2 hover:bg-brand-50/60 flex items-center justify-between gap-2">
    <span className="text-sm text-ink-800 truncate">{title}</span>
    <span className="text-xs text-ink-400 shrink-0">{sub}</span>
  </button>
)

export default Header
