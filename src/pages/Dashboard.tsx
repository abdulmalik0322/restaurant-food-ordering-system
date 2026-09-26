/** Dashboard: stat cards, sales chart (Today / This Week / This Month),
 *  recent orders and popular items. */
import { useMemo, useState } from 'react';
import {
  Banknote, FileWarning, PiggyBank, ShoppingCart, TrendingDown, TrendingUp, UserCog, Users, Wallet,
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useStore } from '../store/StoreContext';
import { Badge, DataTable, PageHeader, StatCard } from '../components/ui';
import { formatDateTime, formatPKR, todayISO, toISODate } from '../utils/format';
import type { Order, PaymentStatus } from '../types';

type ChartTab = 'today' | 'week' | 'month';

function statusTone(s: PaymentStatus): 'green' | 'amber' | 'red' {
  return s === 'paid' ? 'green' : s === 'partial' ? 'amber' : 'red';
}

export default function Dashboard() {
  const { data, navigate } = useStore();
  const [tab, setTab] = useState<ChartTab>('today');
  if (!data) return null;

  const sym = data.settings.currencySymbol;
  const today = todayISO();
  const monthKey = today.slice(0, 7);

  const todayOrders = data.orders.filter((o) => toISODate(new Date(o.date)) === today);
  const todaySales = todayOrders.reduce((s, o) => s + o.total, 0);
  const todayExpenses = data.expenses
    .filter((e) => e.date === today)
    .reduce((s, e) => s + e.amount, 0);
  const monthOrders = data.orders.filter((o) => toISODate(new Date(o.date)).startsWith(monthKey));
  const monthlyRevenue = monthOrders.reduce((s, o) => s + o.total, 0);
  const monthlyExpenses = data.expenses
    .filter((e) => e.date.startsWith(monthKey))
    .reduce((s, e) => s + e.amount, 0);
  const pendingBills = data.orders.filter((o) => o.status === 'pending' || o.status === 'partial').length;
  const netProfit = monthlyRevenue - monthlyExpenses;

  const chartData = useMemo(() => {
    const orders = data.orders;
    if (tab === 'today') {
      const buckets = Array.from({ length: 14 }, (_, i) => ({ label: `${10 + i}:00`, sales: 0 }));
      orders.forEach((o) => {
        if (toISODate(new Date(o.date)) !== today) return;
        const h = new Date(o.date).getHours();
        if (h >= 10 && h <= 23) buckets[h - 10].sales += o.total;
      });
      return buckets;
    }
    if (tab === 'week') {
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { key: toISODate(d), label: d.toLocaleDateString('en-PK', { weekday: 'short' }), sales: 0 };
      });
      const byKey = new Map(days.map((d) => [d.key, d]));
      orders.forEach((o) => {
        const b = byKey.get(toISODate(new Date(o.date)));
        if (b) b.sales += o.total;
      });
      return days;
    }
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return {
        key: toISODate(d),
        label: d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }),
        sales: 0,
      };
    });
    const byKey = new Map(days.map((d) => [d.key, d]));
    orders.forEach((o) => {
      const b = byKey.get(toISODate(new Date(o.date)));
      if (b) b.sales += o.total;
    });
    return days;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, tab, today]);

  const popular = useMemo(() => {
    const agg = new Map<string, { qty: number; revenue: number; name: string }>();
    data.orders.forEach((o) =>
      o.items.forEach((it) => {
        const cur = agg.get(it.menuItemId) ?? { qty: 0, revenue: 0, name: it.name };
        cur.qty += it.qty;
        cur.revenue += it.qty * it.price;
        agg.set(it.menuItemId, cur);
      }),
    );
    const menuById = new Map(data.menu.map((m) => [m.id, m]));
    return [...agg.entries()]
      .map(([id, a]) => ({
        id,
        name: menuById.get(id)?.name ?? a.name,
        category: menuById.get(id)?.category ?? '—',
        qty: a.qty,
        revenue: a.revenue,
      }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }, [data]);

  const recent = data.orders.slice(0, 8);

  const tabs: { key: ChartTab; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={`${data.settings.restaurantName} — live business overview`} />

      {/* Stat cards */}
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard icon={Banknote} tone="green" label="Today's Sales" value={formatPKR(todaySales, sym)} sub={`${todayOrders.length} orders today`} onClick={() => navigate('bills')} />
        <StatCard icon={ShoppingCart} tone="blue" label="Today's Orders" value={String(todayOrders.length)} sub="orders placed today" onClick={() => navigate('bills')} />
        <StatCard icon={Users} tone="purple" label="Total Customers" value={String(data.customers.length)} sub="registered customers" onClick={() => navigate('customers')} />
        <StatCard icon={UserCog} tone="amber" label="Total Employees" value={String(data.employees.length)} sub="on the team" onClick={() => navigate('employees')} />
        <StatCard icon={FileWarning} tone="red" label="Pending Bills" value={String(pendingBills)} sub="awaiting payment" onClick={() => navigate('bills')} />
        <StatCard icon={Wallet} tone="orange" label="Today's Expenses" value={formatPKR(todayExpenses, sym)} sub="spent today" onClick={() => navigate('expenses')} />
        <StatCard icon={TrendingUp} tone="green" label="Monthly Revenue" value={formatPKR(monthlyRevenue, sym)} sub={today.slice(0, 7)} onClick={() => navigate('reports')} />
        <StatCard icon={TrendingDown} tone="red" label="Monthly Expenses" value={formatPKR(monthlyExpenses, sym)} sub={today.slice(0, 7)} onClick={() => navigate('expenses')} />
        <StatCard icon={PiggyBank} tone="blue" label="Net Profit" value={formatPKR(netProfit, sym)} sub="revenue − expenses" onClick={() => navigate('reports')} />
      </div>

      {/* Sales chart */}
      <div className="card mb-5 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-bold text-stone-900">Sales Chart</h3>
          <div className="flex gap-1 rounded-lg bg-stone-100 p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  tab === t.key ? 'bg-white text-orange-600 shadow-sm' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#78716c' }} interval={tab === 'month' ? 3 : 0} />
              <YAxis
                tick={{ fontSize: 11, fill: '#78716c' }}
                tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)}
                width={44}
              />
              <Tooltip formatter={(v) => [formatPKR(Number(v) || 0, sym), 'Sales']} />
              <Bar dataKey="sales" fill="#ea580c" radius={[6, 6, 0, 0]} maxBarSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-5">
        {/* Recent orders */}
        <div className="card xl:col-span-3">
          <div className="flex items-center justify-between px-5 pt-4">
            <h3 className="text-base font-bold text-stone-900">Recent Orders</h3>
            <button className="btn-ghost btn-sm" onClick={() => navigate('bills')}>View all</button>
          </div>
          <DataTable<Order>
            rowKey={(o) => o.id}
            data={recent}
            emptyMessage="No orders yet."
            columns={[
              { key: 'id', label: 'Order ID', render: (o) => <span className="font-semibold text-stone-800">{o.id}</span> },
              { key: 'customerName', label: 'Customer', render: (o) => o.customerName },
              {
                key: 'items', label: 'Items',
                render: (o) => <span className="text-stone-600">{o.items.reduce((s, i) => s + i.qty, 0)}</span>,
              },
              {
                key: 'total', label: 'Total',
                render: (o) => <span className="font-bold text-stone-900">{formatPKR(o.total, sym)}</span>,
              },
              {
                key: 'status', label: 'Payment Status',
                render: (o) => <Badge tone={statusTone(o.status)}>{o.status.toUpperCase()}</Badge>,
              },
              { key: 'date', label: 'Date/Time', render: (o) => <span className="text-xs text-stone-500">{formatDateTime(o.date)}</span> },
            ]}
          />
        </div>

        {/* Popular items */}
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between px-5 pt-4">
            <h3 className="text-base font-bold text-stone-900">Popular Items</h3>
            <button className="btn-ghost btn-sm" onClick={() => navigate('menu')}>View menu</button>
          </div>
          <DataTable
            rowKey={(r) => r.id}
            data={popular}
            emptyMessage="No sales data yet."
            columns={[
              {
                key: 'rank', label: '#',
                render: (r) => <span className="font-extrabold text-orange-600">{r.rank}</span>,
              },
              { key: 'name', label: 'Item', render: (r) => <span className="font-semibold text-stone-800">{r.name}</span> },
              { key: 'category', label: 'Category', render: (r) => <span className="text-xs text-stone-500">{r.category}</span> },
              { key: 'qty', label: 'Sold', render: (r) => <Badge tone="orange">{r.qty}</Badge> },
              {
                key: 'revenue', label: 'Revenue',
                render: (r) => <span className="font-semibold text-green-700">{formatPKR(r.revenue, sym)}</span>,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
