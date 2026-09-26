/** Sales Reports: KPI summary, charts and order detail for a selected date range,
 *  with print and CSV export. */
import { useEffect, useMemo, useState } from 'react';
import { BadgePercent, Download, Printer, Scale, ShoppingBag, TrendingUp, Wallet } from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useStore } from '../store/StoreContext';
import { DataTable, Field, PageHeader, Pagination, StatCard, Badge } from '../components/ui';
import type { Column } from '../components/ui';
import type { Order } from '../types';
import {
  formatDate, formatDateTime, formatPKR, titleCase, todayISO, toISODate,
} from '../utils/format';
import { buildReportHtml } from '../utils/documents';
import { esc, printHtml } from '../utils/print';

type Preset = 'today' | 'week' | 'month' | 'year' | 'custom';

const PRESETS: { key: Preset; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'year', label: 'This Year' },
  { key: 'custom', label: 'Custom' },
];

const PIE_COLORS = ['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#eab308', '#14b8a6', '#ec4899', '#84cc16', '#f43f5e'];

const parseYMD = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

const dayLabel = (ymd: string): string =>
  parseYMD(ymd).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' });

const hourLabel = (h: number): string =>
  h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;

const ORDER_PAGE_SIZE = 10;

export default function ReportsPage() {
  const { data } = useStore();
  const [preset, setPreset] = useState<Preset>('month');
  const [customFrom, setCustomFrom] = useState(todayISO().slice(0, 7) + '-01');
  const [customTo, setCustomTo] = useState(todayISO());
  const [page, setPage] = useState(1);

  const today = todayISO();
  const { from, to } = useMemo(() => {
    const d = new Date();
    switch (preset) {
      case 'today': return { from: today, to: today };
      case 'week': {
        const w = new Date(d);
        w.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
        return { from: toISODate(w), to: today };
      }
      case 'month': return { from: today.slice(0, 7) + '-01', to: today };
      case 'year': return { from: today.slice(0, 4) + '-01-01', to: today };
      case 'custom': return { from: customFrom || today, to: customTo || today };
    }
  }, [preset, customFrom, customTo, today]);

  useEffect(() => { setPage(1); }, [from, to]);

  const allOrders = data?.orders ?? [];
  const allExpenses = data?.expenses ?? [];

  const orders = useMemo(
    () => allOrders.filter((o) => { const d = o.date.slice(0, 10); return d >= from && d <= to; }),
    [allOrders, from, to],
  );
  const expenses = useMemo(
    () => allExpenses.filter((e) => e.date >= from && e.date <= to),
    [allExpenses, from, to],
  );

  const totalOrders = orders.length;
  const totalSales = orders.reduce((s, o) => s + o.total, 0);
  const totalDiscounts = orders.reduce((s, o) => s + o.discount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const net = totalSales - totalExpenses;

  const days = useMemo(() => {
    const out: string[] = [];
    const d = parseYMD(from);
    const end = parseYMD(to);
    while (d <= end) { out.push(toISODate(d)); d.setDate(d.getDate() + 1); }
    return out;
  }, [from, to]);

  const salesData = useMemo(() => {
    if (from === to) {
      const hours = Array.from({ length: 24 }, (_, h) => ({ label: hourLabel(h), sales: 0 }));
      orders.forEach((o) => { hours[new Date(o.date).getHours()].sales += o.total; });
      return hours;
    }
    return days.map((d) => ({
      label: dayLabel(d),
      sales: orders.reduce((s, o) => s + (o.date.slice(0, 10) === d ? o.total : 0), 0),
    }));
  }, [from, to, days, orders]);

  const ordersData = useMemo(
    () => days.map((d) => ({
      label: dayLabel(d),
      orders: orders.filter((o) => o.date.slice(0, 10) === d).length,
    })),
    [days, orders],
  );

  const categoryData = useMemo(() => {
    const m = new Map<string, number>();
    expenses.forEach((e) => m.set(e.category, (m.get(e.category) ?? 0) + e.amount));
    return [...m.entries()].map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const popular = useMemo(() => {
    const m = new Map<string, { name: string; qty: number; revenue: number }>();
    orders.forEach((o) => o.items.forEach((it) => {
      const cur = m.get(it.name) ?? { name: it.name, qty: 0, revenue: 0 };
      cur.qty += it.qty;
      cur.revenue += it.price * it.qty;
      m.set(it.name, cur);
    }));
    return [...m.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [orders]);

  const maxPopularQty = Math.max(1, ...popular.map((p) => p.qty));

  if (!data) return null;

  const orderColumns: Column<Order>[] = [
    { key: 'id', label: 'Order ID', render: (o) => <span className="font-mono text-xs">{o.id}</span> },
    { key: 'date', label: 'Date', render: (o) => <span className="whitespace-nowrap">{formatDateTime(o.date)}</span> },
    { key: 'customerName', label: 'Customer', render: (o) => <span className="font-medium">{o.customerName}</span> },
    { key: 'items', label: 'Items', render: (o) => `${o.items.length} items` },
    {
      key: 'total', label: 'Total', className: 'text-right',
      render: (o) => <span className="font-bold">{formatPKR(o.total)}</span>,
    },
    { key: 'paymentMethod', label: 'Payment', render: (o) => titleCase(o.paymentMethod) },
    {
      key: 'status', label: 'Status',
      render: (o) => (
        <Badge tone={o.status === 'paid' ? 'green' : o.status === 'pending' ? 'amber' : 'blue'}>
          {titleCase(o.status)}
        </Badge>
      ),
    },
  ];

  const pageRows = orders.slice((page - 1) * ORDER_PAGE_SIZE, page * ORDER_PAGE_SIZE);

  const handlePrint = () => {
    const rows: [string, string][] = [
      ['Total Orders', String(totalOrders)],
      ['Total Sales', formatPKR(totalSales)],
      ['Total Discounts', formatPKR(totalDiscounts)],
      ['Total Expenses', formatPKR(totalExpenses)],
      ['Net Revenue', formatPKR(net)],
    ];
    const summary = `<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      ${rows.map(([k, v]) => `<tr><td style="padding:6px 8px;border:1px solid #ddd;">${esc(k)}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:right;font-weight:bold;">${esc(v)}</td></tr>`).join('')}
    </table>`;
    const items = popular.length
      ? `<h3 style="margin:12px 0 6px;">Top Items</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="background:#f5f5f5;"><th style="text-align:left;padding:6px 8px;border:1px solid #ddd;">Item</th>
          <th style="padding:6px 8px;border:1px solid #ddd;">Qty Sold</th>
          <th style="padding:6px 8px;border:1px solid #ddd;text-align:right;">Revenue</th></tr>
          ${popular.map((p, i) => `<tr><td style="padding:6px 8px;border:1px solid #ddd;">${i + 1}. ${esc(p.name)}</td>
            <td style="padding:6px 8px;border:1px solid #ddd;text-align:center;">${p.qty}</td>
            <td style="padding:6px 8px;border:1px solid #ddd;text-align:right;">${esc(formatPKR(p.revenue))}</td></tr>`).join('')}
        </table>`
      : '';
    const html = buildReportHtml(
      'Sales Report',
      `${formatDate(from)} – ${formatDate(to)}`,
      `<h3 style="margin:0 0 6px;">Summary</h3>${summary}${items}`,
      data.settings,
    );
    printHtml('Sales Report', html);
  };

  const handleDownload = () => {
    const header = ['Order ID', 'Date', 'Customer', 'Type', 'Items', 'Subtotal', 'Discount', 'Tax', 'Service', 'Total', 'Payment', 'Status'];
    const lines = orders.map((o) => [
      o.id, o.date.slice(0, 10), o.customerName, titleCase(o.type),
      o.items.map((it) => `${it.name} x${it.qty}`).join('; '),
      o.subtotal, o.discount, o.tax, o.serviceCharge, o.total,
      titleCase(o.paymentMethod), titleCase(o.status),
    ]);
    const csv = [header, ...lines]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${from}-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title="Sales Reports"
        subtitle="Analyse sales, orders, expenses and popular items."
        actions={(
          <>
            <button className="btn-secondary btn-sm" onClick={handleDownload}>
              <Download size={16} /> Download CSV
            </button>
            <button className="btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={16} /> Print Report
            </button>
          </>
        )}
      />

      <div className="card mb-5 flex flex-wrap items-center gap-3 p-4">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              className={`btn-sm ${preset === p.key ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPreset(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
        {preset === 'custom' && (
          <div className="flex flex-wrap items-center gap-3">
            <Field label="From">
              <input type="date" className="input" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
            </Field>
            <Field label="To">
              <input type="date" className="input" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
            </Field>
          </div>
        )}
        <p className="ml-auto text-sm text-stone-500">
          {formatDate(from)} – {formatDate(to)}
        </p>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={ShoppingBag} label="Total Orders" value={String(totalOrders)} tone="blue" />
        <StatCard icon={TrendingUp} label="Total Sales" value={formatPKR(totalSales)} tone="green" />
        <StatCard icon={BadgePercent} label="Total Discounts" value={formatPKR(totalDiscounts)} tone="amber" />
        <StatCard icon={Wallet} label="Total Expenses" value={formatPKR(totalExpenses)} tone="red" />
        <StatCard icon={Scale} label="Net Revenue" value={formatPKR(net)} sub="Sales − Expenses" tone={net >= 0 ? 'green' : 'red'} />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h3 className="mb-3 font-bold text-stone-800">
            {from === to ? 'Hourly Sales' : 'Daily Sales'}
          </h3>
          {salesData.some((d) => d.sales > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={salesData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={from === to ? 2 : 'preserveStartEnd'} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : String(v))} />
                <Tooltip formatter={(v) => formatPKR(Number(v) || 0)} />
                <Bar dataKey="sales" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-sm text-stone-400">No sales in this range.</p>
          )}
        </div>

        <div className="card p-4">
          <h3 className="mb-3 font-bold text-stone-800">Orders Trend</h3>
          {ordersData.some((d) => d.orders > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={ordersData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-sm text-stone-400">No orders in this range.</p>
          )}
        </div>

        <div className="card p-4">
          <h3 className="mb-3 font-bold text-stone-800">Expenses by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatPKR(Number(v) || 0)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-sm text-stone-400">No expenses in this range.</p>
          )}
          {categoryData.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {categoryData.map((c, i) => (
                <span key={c.name} className="inline-flex items-center gap-1.5 text-xs text-stone-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {c.name} · {formatPKR(c.value)}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="card p-4">
          <h3 className="mb-3 font-bold text-stone-800">Popular Items (Top 5)</h3>
          {popular.length > 0 ? (
            <div className="flex flex-col gap-4 py-2">
              {popular.map((p) => (
                <div key={p.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold text-stone-800">{p.name}</span>
                    <span className="text-xs text-stone-500">{p.qty} sold · {formatPKR(p.revenue)}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                      style={{ width: `${(p.qty / maxPopularQty) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-stone-400">No items sold in this range.</p>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="border-b border-stone-200 px-4 py-3 font-bold text-stone-800">
          Orders Detail <span className="ml-1 text-xs font-medium text-stone-400">({orders.length})</span>
        </h3>
        <DataTable
          columns={orderColumns}
          data={pageRows}
          rowKey={(o) => o.id}
          emptyMessage="No orders found in the selected range."
        />
        <Pagination page={page} pageSize={ORDER_PAGE_SIZE} total={orders.length} onChange={setPage} />
      </div>
    </div>
  );
}
