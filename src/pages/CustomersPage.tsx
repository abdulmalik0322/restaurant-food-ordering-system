/** Customers page: list, search, profiles with order history, add/edit/delete. */
import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Banknote, Eye, Pencil, Plus, Trash2, UserCheck, UserPlus, Users } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import type { Customer, Order } from '../types';
import { Badge, DataTable, Field, Modal, PageHeader, Pagination, SearchBar, StatCard } from '../components/ui';
import { formatDate, formatDateTime, formatPKR, todayISO } from '../utils/format';

interface CustomerFormState {
  name: string;
  phone: string;
  address: string;
  email: string;
}

const EMPTY_FORM: CustomerFormState = { name: '', phone: '', address: '', email: '' };
const PAGE_SIZE = 10;

export default function CustomersPage() {
  const { data, notify, confirm, addRecord, updateRecord, deleteRecord } = useStore();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [viewing, setViewing] = useState<Customer | null>(null);

  const stats = useMemo(() => {
    if (!data) return { total: 0, active: 0, revenue: 0, newThisMonth: 0 };
    const prefix = todayISO().slice(0, 7);
    return {
      total: data.customers.length,
      active: data.customers.filter((c) => c.status === 'active').length,
      revenue: data.customers.reduce((s, c) => s + c.totalSpent, 0),
      newThisMonth: data.customers.filter((c) => c.lastOrder?.startsWith(prefix)).length,
    };
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.customers.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (!q) return true;
      return (c.name + ' ' + c.phone + ' ' + c.id + ' ' + (c.address ?? '')).toLowerCase().includes(q);
    });
  }, [data, query, statusFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const viewingOrders = useMemo(
    () => (data && viewing ? data.orders.filter((o) => o.customerId === viewing.id) : []),
    [data, viewing],
  );

  if (!data) return null;

  const set = (k: keyof CustomerFormState) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: '' }));
  };

  const openForm = (c?: Customer) => {
    setEditing(c ?? null);
    setForm(c ? { name: c.name, phone: c.phone, address: c.address ?? '', email: c.email ?? '' } : EMPTY_FORM);
    setErrors({});
    setFormOpen(true);
  };

  const validate = () => {
    const er: Record<string, string> = {};
    if (!form.name.trim()) er.name = 'Name is required';
    if (!form.phone.trim()) er.phone = 'Phone is required';
    const email = form.email.trim();
    if (email && !email.includes('@')) er.email = 'Enter a valid email address';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim() || undefined,
      email: form.email.trim() || undefined,
    };
    if (editing) {
      updateRecord('customers', editing.id, payload);
      notify('Customer updated', 'success');
    } else {
      addRecord('customers', { ...payload, totalOrders: 0, totalSpent: 0, status: 'active' });
      notify('Customer added', 'success');
    }
    setFormOpen(false);
  };

  const remove = (c: Customer) =>
    confirm({
      title: 'Delete Customer',
      message: `Delete ${c.name} (${c.id})? This cannot be undone.`,
      danger: true,
      confirmText: 'Delete',
      onConfirm: () => {
        deleteRecord('customers', c.id);
        notify('Customer deleted', 'info');
      },
    });

  const statusTone = (s: Customer['status']) => (s === 'active' ? 'green' : 'gray');
  const orderStatusTone = (s: Order['status']) => (s === 'paid' ? 'green' : s === 'pending' ? 'amber' : 'blue');

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Manage customer records, profiles and order history."
        actions={
          <button className="btn-primary" onClick={() => openForm()}>
            <Plus size={16} /> Add Customer
          </button>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total Customers" value={String(stats.total)} tone="orange" />
        <StatCard icon={UserCheck} label="Active Customers" value={String(stats.active)} tone="green" />
        <StatCard icon={Banknote} label="Total Revenue" value={formatPKR(stats.revenue)} tone="blue" />
        <StatCard icon={UserPlus} label="New This Month" value={String(stats.newThisMonth)} tone="purple" />
      </div>

      <div className="card p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <div className="min-w-56 flex-1">
            <SearchBar value={query} onChange={(v) => { setQuery(v); setPage(1); }} placeholder="Search name, phone, ID…" />
          </div>
          <select
            className="input w-40"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as 'all' | 'active' | 'inactive'); setPage(1); }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <DataTable<Customer>
          columns={[
            { key: 'id', label: 'Customer ID', render: (c) => <span className="text-xs font-semibold text-stone-500">{c.id}</span> },
            { key: 'name', label: 'Name', render: (c) => <span className="font-bold text-stone-900">{c.name}</span> },
            { key: 'phone', label: 'Phone' },
            {
              key: 'address', label: 'Address',
              render: (c) => <span className="block max-w-52 truncate" title={c.address}>{c.address || '—'}</span>,
            },
            { key: 'totalOrders', label: 'Orders', render: (c) => <span className="font-semibold">{c.totalOrders}</span> },
            {
              key: 'totalSpent', label: 'Total Spending',
              render: (c) => <span className="font-bold text-stone-900">{formatPKR(c.totalSpent)}</span>,
            },
            { key: 'lastOrder', label: 'Last Order', render: (c) => formatDate(c.lastOrder) },
            {
              key: 'status', label: 'Status',
              render: (c) => <Badge tone={statusTone(c.status)}>{c.status === 'active' ? 'Active' : 'Inactive'}</Badge>,
            },
          ]}
          data={paged}
          rowKey={(c) => c.id}
          actions={(c) => (
            <>
              <button className="icon-btn" title="View profile" onClick={() => setViewing(c)}><Eye size={16} /></button>
              <button className="icon-btn" title="Edit" onClick={() => openForm(c)}><Pencil size={16} /></button>
              <button className="icon-btn hover:!bg-red-50 hover:!text-red-600" title="Delete" onClick={() => remove(c)}><Trash2 size={16} /></button>
            </>
          )}
        />
        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} />
      </div>

      {/* Add / Edit modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit Customer' : 'Add Customer'}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setFormOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={save}>{editing ? 'Save Changes' : 'Add Customer'}</button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full Name *" error={errors.name}>
            <input className="input" value={form.name} onChange={set('name')} placeholder="e.g. Ahmad Khan" />
          </Field>
          <Field label="Phone *" error={errors.phone}>
            <input className="input" value={form.phone} onChange={set('phone')} placeholder="e.g. 0333-1234567" />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <input className="input" value={form.address} onChange={set('address')} placeholder="House, street, area" />
          </Field>
          <Field label="Email (optional)" error={errors.email} className="sm:col-span-2">
            <input className="input" value={form.email} onChange={set('email')} placeholder="name@example.com" />
          </Field>
        </div>
      </Modal>

      {/* Profile modal */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Customer Profile" size="lg">
        {viewing && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-stone-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">Customer ID</p>
                <p className="text-sm font-bold text-stone-800">{viewing.id}</p>
              </div>
              <div className="rounded-lg bg-stone-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">Name</p>
                <p className="text-sm font-bold text-stone-800">{viewing.name}</p>
              </div>
              <div className="rounded-lg bg-stone-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">Phone</p>
                <p className="text-sm font-medium text-stone-800">{viewing.phone}</p>
              </div>
              <div className="rounded-lg bg-stone-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">Address</p>
                <p className="text-sm font-medium text-stone-800">{viewing.address || '—'}</p>
              </div>
              <div className="rounded-lg bg-stone-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">Email</p>
                <p className="text-sm font-medium text-stone-800">{viewing.email || '—'}</p>
              </div>
              <div className="rounded-lg bg-stone-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">Status</p>
                <p><Badge tone={statusTone(viewing.status)}>{viewing.status === 'active' ? 'Active' : 'Inactive'}</Badge></p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="card p-3 text-center">
                <p className="text-xl font-extrabold text-stone-900">{viewing.totalOrders}</p>
                <p className="text-[11px] font-medium text-stone-500">Total Orders</p>
              </div>
              <div className="card p-3 text-center">
                <p className="text-xl font-extrabold text-orange-700">{formatPKR(viewing.totalSpent)}</p>
                <p className="text-[11px] font-medium text-stone-500">Total Spent</p>
              </div>
              <div className="card p-3 text-center">
                <p className="text-xl font-extrabold text-stone-900">{viewing.lastOrder ? formatDate(viewing.lastOrder) : '—'}</p>
                <p className="text-[11px] font-medium text-stone-500">Last Order</p>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-bold text-stone-800">Order History</h4>
              <div className="card overflow-hidden">
                <DataTable<Order>
                  columns={[
                    { key: 'id', label: 'Order ID', render: (o) => <span className="text-xs font-semibold text-stone-500">{o.id}</span> },
                    { key: 'date', label: 'Date', render: (o) => formatDateTime(o.date) },
                    { key: 'items', label: 'Items', render: (o) => o.items.reduce((s, i) => s + i.qty, 0) },
                    { key: 'total', label: 'Total', render: (o) => <span className="font-bold">{formatPKR(o.total)}</span> },
                    {
                      key: 'status', label: 'Status',
                      render: (o) => <Badge tone={orderStatusTone(o.status)}>{o.status.toUpperCase()}</Badge>,
                    },
                  ]}
                  data={viewingOrders}
                  rowKey={(o) => o.id}
                  emptyMessage="No orders yet for this customer."
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
