import React, { useMemo } from 'react'
import {
  Wallet, ShoppingBag, Users, UserCog, FileWarning, TrendingDown,
  TrendingUp, PiggyBank, Flame,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useApp } from '../context/AppContext'
import DashboardCard from '../components/common/DashboardCard'
import PageHeader from '../components/common/PageHeader'
import Badge from '../components/common/Badge'
import { formatPKR, formatDateTime, isSameDay, isSameMonth, isWithinDays } from '../utils/format'

const DashboardPage: React.FC = () => {
  const { orders, customers, employees, expenses, setActiveSection } = useApp()

  const stats = useMemo(() => {
    const todayOrders = orders.filter(o => isSameDay(o.date))
    const todaySales = todayOrders.reduce((s, o) => s + o.grandTotal, 0)
    const todayExpenses = expenses.filter(e => isSameDay(e.date)).reduce((s, e) => s + e.amount, 0)
    const monthOrders = orders.filter(o => isSameMonth(o.date))
    const monthlyRevenue = monthOrders.reduce((s, o) => s + o.grandTotal, 0)
    const monthlyExpenses = expenses.filter(e => isSameMonth(e.date)).reduce((s, e) => s + e.amount, 0)
    const pendingBills = orders.filter(o => o.paymentStatus !== 'Paid').length
    return {
      todaySales, todayOrdersCount: todayOrders.length, todayExpenses,
      monthlyRevenue, monthlyExpenses, netProfit: monthlyRevenue - monthlyExpenses,
      pendingBills,
    }
  }, [orders, expenses])

  const chartData = useMemo(() => {
    const days: { label: string; sales: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const label = d.toLocaleDateString('en-GB', { weekday: 'short' })
      const sales = orders
        .filter(o => new Date(o.date).toDateString() === d.toDateString())
        .reduce((s, o) => s + o.grandTotal, 0)
      days.push({ label, sales })
    }
    return days
  }, [orders])

  const popularItems = useMemo(() => {
    const counts = new Map<string, number>()
    orders.forEach(o => o.items.forEach(i => counts.set(i.name, (counts.get(i.name) ?? 0) + i.quantity)))
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }))
  }, [orders])

  const recentOrders = orders.slice(0, 6)

  return (
    <div>
      <PageHeader
        title={`Welcome back 👋`}
        subtitle="Here's how Hangu Food Point is doing today"
        actions={<button className="btn-primary" onClick={() => setActiveSection('pos')}>+ New Order</button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        <DashboardCard label="Today's Sales" value={formatPKR(stats.todaySales)} icon={Wallet} tone="brand" />
        <DashboardCard label="Today's Orders" value={String(stats.todayOrdersCount)} icon={ShoppingBag} tone="leaf" />
        <DashboardCard label="Total Customers" value={String(customers.length)} icon={Users} tone="ink" />
        <DashboardCard label="Total Employees" value={String(employees.length)} icon={UserCog} tone="ink" />
        <DashboardCard label="Pending Bills" value={String(stats.pendingBills)} icon={FileWarning} tone="amber" />
        <DashboardCard label="Today's Expenses" value={formatPKR(stats.todayExpenses)} icon={TrendingDown} tone="red" />
        <DashboardCard label="Monthly Revenue" value={formatPKR(stats.monthlyRevenue)} icon={TrendingUp} tone="brand" />
        <DashboardCard label="Net Profit (Month)" value={formatPKR(stats.netProfit)} icon={PiggyBank} tone="leaf" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="card p-4 sm:p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-ink-900">Sales — Last 7 Days</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec6620" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#ec6620" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eff0f2" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#686d75' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#686d75' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip formatter={(v: number) => formatPKR(v)} contentStyle={{ borderRadius: 12, border: '1px solid #eff0f2', fontSize: 13 }} />
              <Area type="monotone" dataKey="sales" stroke="#ec6620" strokeWidth={2.5} fill="url(#salesFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={17} className="text-brand-600" />
            <h3 className="font-display font-semibold text-ink-900">Popular Items</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={popularItems} layout="vertical" margin={{ left: 8 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: '#4a4e54' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #eff0f2', fontSize: 12 }} />
              <Bar dataKey="qty" fill="#ec6620" radius={[0, 6, 6, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-ink-900">Recent Orders</h3>
          <button className="text-sm text-brand-600 font-medium hover:underline" onClick={() => setActiveSection('bills')}>View all</button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date/Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id}>
                  <td className="font-medium text-ink-900">{o.id}</td>
                  <td>{o.customer.name}</td>
                  <td className="max-w-[220px] truncate">{o.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</td>
                  <td className="font-medium">{formatPKR(o.grandTotal)}</td>
                  <td><Badge status={o.paymentStatus} /></td>
                  <td className="text-ink-500">{formatDateTime(o.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
