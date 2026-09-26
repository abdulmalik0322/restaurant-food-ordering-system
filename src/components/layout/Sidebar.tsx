import React from 'react'
import {
  LayoutDashboard, UtensilsCrossed, ShoppingCart, Receipt, Users, UserCog,
  CalendarCheck, Wallet, TrendingDown, BarChart3, Boxes, Settings, X,
} from 'lucide-react'
import type { Section } from '../../types'
import { useApp } from '../../context/AppContext'
import { classNames } from '../../utils/format'

const NAV: { section: Section; label: string; icon: React.ElementType }[] = [
  { section: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { section: 'menu', label: 'Menu / Food Items', icon: UtensilsCrossed },
  { section: 'pos', label: 'POS / New Order', icon: ShoppingCart },
  { section: 'bills', label: 'Bills & Invoices', icon: Receipt },
  { section: 'customers', label: 'Customers', icon: Users },
  { section: 'employees', label: 'Employees', icon: UserCog },
  { section: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { section: 'payroll', label: 'Salaries & Payroll', icon: Wallet },
  { section: 'expenses', label: 'Expenses', icon: TrendingDown },
  { section: 'reports', label: 'Sales Reports', icon: BarChart3 },
  { section: 'inventory', label: 'Inventory', icon: Boxes },
  { section: 'settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  mobileOpen: boolean
  onCloseMobile: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeSection, setActiveSection, settings } = useApp()

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-ink-800/60 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-lg shrink-0">
          {settings.logoEmoji}
        </div>
        <div className="min-w-0">
          <p className="font-display font-semibold text-white text-sm leading-tight truncate">{settings.name}</p>
          <p className="text-[11px] text-ink-400">Management System</p>
        </div>
        <button className="ml-auto text-ink-400 hover:text-white sm:hidden" onClick={onCloseMobile}>
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        {NAV.map(item => {
          const Icon = item.icon
          const active = activeSection === item.section
          return (
            <button
              key={item.section}
              onClick={() => { setActiveSection(item.section); onCloseMobile() }}
              className={classNames(
                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                active ? 'bg-brand-600 text-white font-medium' : 'text-ink-300 hover:bg-ink-800 hover:text-white'
              )}
            >
              <Icon size={17} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          )
        })}
      </nav>
      <div className="px-4 py-3.5 border-t border-ink-800/60 text-[11px] text-ink-500">
        Front-end prototype · v1.0
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden sm:flex flex-col w-64 shrink-0 bg-ink-900 h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-ink-900/50" onClick={onCloseMobile} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-ink-900">{content}</aside>
        </div>
      )}
    </>
  )
}

export default Sidebar
