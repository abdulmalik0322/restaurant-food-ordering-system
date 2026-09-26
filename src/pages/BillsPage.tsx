/** Bills & Invoices: search, date/status/method filters, view/print/download/edit/delete. */
import { useEffect, useMemo, useState } from 'react';
import { Download, Eye, Pencil, Printer, ReceiptText, Trash2 } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { invoiceNoFor } from '../api/db';
import { Badge, DataTable, Field, Modal, PageHeader, Pagination, SearchBar } from '../components/ui';
import { InvoiceView } from '../components/InvoiceView';
import { PAYMENT_METHOD_LABELS } from '../types';
import type { Order, PaymentMethod, PaymentStatus } from '../types';
import { formatDate, formatPKR, titleCase, todayISO, toISODate } from '../utils/format';
import { printHtml } from '../utils/print';
import { buildInvoiceHtml } from '../utils/documents';
import { downloadInvoicePdf } from '../utils/pdf';

type Preset = 'today' | 'yesterday' | 'week' | 'month' | 'all' | 'custom';

const PRESETS: { key: Preset; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'custom', label: 'Custom' },
  { key: 'all', label: 'All' },
];

function statusTone(s: PaymentStatus): 'green' | 'amber' | 'red' {
  return s === 'paid' ? 'green' : s === 'partial' ? 'amber' : 'red';
}

export default function BillsPage() {
  const { data, updateRecord, deleteRecord, notify, confirm } = useStore();
  const [query, setQuery] = useState('');
  const [preset, setPreset] = useState<Preset>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState<'all' | PaymentStatus>('all');
  const [method, setMethod] = useState<'all' | PaymentMethod>('all');
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Order | null>(null);
  const [editing, setEditing] = useState<Order | null>(null);
  const [editPaid, setEditPaid] = useState(0);
  const [editStatus, setEditStatus] = useState<PaymentStatus>('paid');
  if (!data) return null;

  const sym = data.settings.currencySymbol;
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const t = todayISO();
    return data.orders.filter((o) => {
      if (q && !(o.id + ' ' + o.customerName + ' ' + (o.phone ?? '')).toLowerCase().includes(q)) return false;
      if (status !== 'all' && o.status !== status) return false;
      if (method !== 'all' && o.paymentMethod !== method) return false;
      const d = toISODate(new Date(o.date));
      if (preset === 'today' && d !== t) return false;
      if (preset === 'yesterday') {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        if (d !== toISODate(y)) return false;
      }
      if (preset === 'week') {
        const w = new Date();
        w.setDate(w.getDate() - 6);
        if (d < toISODate(w) || d > t) return false;
      }
      if (preset === 'month' && !d.startsWith(t.slice(0, 7))) return false;
      if (preset === 'custom') {
        if (from && d < from) return false;
        if (to && d > to) return false;
      }
      return true;
    });
  }, [data.orders, query, preset, from, to, status, method]);

  useEffect(() => {
    setPage(1);
  }, [query, preset, from, to, status, method]);

  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const onPreset = (p: Preset) => {
    setPreset(p);
    if (p !== 'custom') {
      setFrom('');
      setTo('');
    }
  };

  const openEdit = (o: Order) => {
    setEditing(o);
    setEditPaid(o.amountPaid);
    setEditStatus(o.status);
  };

  const saveEdit = () => {
    if (!editing) return;
    const paid = Math.max(0, Math.round(editPaid || 0));
    const balance = Math.max(0, editing.total - paid);
    const change = Math.max(0, paid - editing.total);
    const newStatus: PaymentStatus = balance === 0 ? 'paid' : editStatus === 'paid' ? 'partial' : editStatus;
    updateRecord('orders', editing.id, { amountPaid: paid, balance, change, status: newStatus });
    notify(`Bill ${invoiceNoFor(editing.id)} updated`, 'success');
    setEditing(null);
  };

  const remove = (o: Order) => {
    confirm({
      title: 'Delete bill',
      message: `Delete bill ${invoiceNoFor(o.id)} (${formatPKR(o.total, sym)})? This cannot be undone.`,
      danger: true,
      confirmText: 'Delete',
      onConfirm: () => {
        deleteRecord('orders', o.id);
        notify('Bill deleted', 'success');
      },
    });
  };

  return (
    <div>
      <PageHeader title="Bills & Invoices" subtitle={`${filtered.length} bill${filtered.length === 1 ? '' : 's'} found`} />

      {/* Filter bar */}
      <div className="card mb-5 flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="lg:w-72">
            <SearchBar value={query} onChange={setQuery} placeholder="Search by ID or customer…" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => onPreset(p.key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  preset === p.key
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 lg:ml-auto">
            <select className="input" style={{ width: 'auto' }} value={status} onChange={(e) => setStatus(e.target.value as 'all' | PaymentStatus)}>
              <option value="all">All statuses</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="pending">Pending</option>
            </select>
            <select className="input" style={{ width: 'auto' }} value={method} onChange={(e) => setMethod(e.target.value as 'all' | PaymentMethod)}>
              <option value="all">All methods</option>
              {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((m) => (
                <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>
              ))}
            </select>
          </div>
        </div>
        {preset === 'custom' && (
          <div className="flex flex-wrap items-end gap-3 border-t border-stone-100 pt-3">
            <Field label="From date">
              <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
            </Field>
            <Field label="To date">
              <input type="date" className="input" value={to} max={todayISO()} onChange={(e) => setTo(e.target.value)} />
            </Field>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card">
        <DataTable<Order>
          rowKey={(o) => o.id}
          data={pageRows}
          emptyMessage="No bills match your filters."
          columns={[
            {
              key: 'invoice', label: 'Invoice ID',
              render: (o) => <span className="font-semibold text-stone-800">{invoiceNoFor(o.id)}</span>,
            },
            { key: 'id', label: 'Order ID', render: (o) => <span className="text-stone-500">{o.id}</span> },
            {
              key: 'customer', label: 'Customer',
              render: (o) => (
                <div>
                  <p className="font-medium text-stone-800">{o.customerName}</p>
                  {o.phone && <p className="text-[11px] text-stone-400">{o.phone}</p>}
                </div>
              ),
            },
            {
              key: 'total', label: 'Total',
              render: (o) => <span className="font-extrabold text-stone-900">{formatPKR(o.total, sym)}</span>,
            },
            { key: 'paymentMethod', label: 'Method', render: (o) => titleCase(o.paymentMethod) },
            {
              key: 'status', label: 'Status',
              render: (o) => <Badge tone={statusTone(o.status)}>{o.status.toUpperCase()}</Badge>,
            },
            {
              key: 'date', label: 'Date',
              render: (o) => <span className="text-xs text-stone-500">{formatDate(o.date)}</span>,
            },
          ]}
          actions={(o) => (
            <>
              <button className="icon-btn" title="View" onClick={() => setViewing(o)}><Eye size={15} /></button>
              <button className="icon-btn" title="Print" onClick={() => printHtml(`Invoice ${invoiceNoFor(o.id)}`, buildInvoiceHtml(o, data.settings))}><Printer size={15} /></button>
              <button className="icon-btn" title="Download PDF" onClick={() => downloadInvoicePdf(o, data.settings)}><Download size={15} /></button>
              <button className="icon-btn" title="Edit payment" onClick={() => openEdit(o)}><Pencil size={15} /></button>
              <button className="icon-btn" title="Delete" onClick={() => remove(o)}><Trash2 size={15} className="text-red-500" /></button>
            </>
          )}
        />
        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} />
      </div>

      {/* View modal */}
      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing ? `Invoice ${invoiceNoFor(viewing.id)}` : 'Invoice'}
        size="lg"
        footer={
          viewing ? (
            <>
              <button className="btn-secondary" onClick={() => printHtml(`Invoice ${invoiceNoFor(viewing.id)}`, buildInvoiceHtml(viewing, data.settings))}>
                <Printer size={15} /> Print
              </button>
              <button className="btn-secondary" onClick={() => downloadInvoicePdf(viewing, data.settings)}>
                <Download size={15} /> Download PDF
              </button>
              <button className="btn-primary" onClick={() => setViewing(null)}>Close</button>
            </>
          ) : undefined
        }
      >
        {viewing && <InvoiceView order={viewing} settings={data.settings} />}
      </Modal>

      {/* Edit payment modal */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? `Edit Payment — ${invoiceNoFor(editing.id)}` : 'Edit Payment'}
        size="sm"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn-primary" onClick={saveEdit}>Save</button>
          </>
        }
      >
        {editing && (
          <div className="grid gap-4">
            <div className="rounded-xl bg-stone-50 p-3 text-sm">
              <div className="flex justify-between text-stone-600"><span>Grand total</span><span className="font-bold text-stone-900">{formatPKR(editing.total, sym)}</span></div>
            </div>
            <Field label="Amount Paid (Rs)">
              <input type="number" min={0} className="input" value={editPaid} onChange={(e) => setEditPaid(Number(e.target.value))} />
            </Field>
            <Field label="Payment Status">
              <select className="input" value={editStatus} onChange={(e) => setEditStatus(e.target.value as PaymentStatus)}>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="pending">Pending</option>
              </select>
            </Field>
            <p className="flex items-start gap-1.5 text-xs text-stone-500">
              <ReceiptText size={14} className="mt-0.5 shrink-0" />
              Balance, change and status are recalculated automatically from the amount paid.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
