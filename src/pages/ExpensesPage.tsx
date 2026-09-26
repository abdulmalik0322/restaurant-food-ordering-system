/** Expenses page: record and manage restaurant expenses, with month/category
 *  filters and summary stat cards. */
import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays, CalendarRange, ClipboardList, Pencil, Plus, Receipt, Trash2, Wallet, X,
} from 'lucide-react';
import { useStore } from '../store/StoreContext';
import {
  Badge, DataTable, Field, Modal, PageHeader, Pagination, SearchBar, StatCard,
} from '../components/ui';
import type { Column } from '../components/ui';
import { EXPENSE_CATEGORIES } from '../types';
import type { Expense } from '../types';
import { formatDate, formatPKR, monthLabel, todayISO, toISODate } from '../utils/format';

interface FormState {
  name: string;
  category: string;
  amount: string;
  date: string;
  paidBy: string;
  description: string;
}

const emptyForm = (): FormState => ({
  name: '',
  category: EXPENSE_CATEGORIES[0],
  amount: '',
  date: todayISO(),
  paidBy: '',
  description: '',
});

const PAGE_SIZE = 15;

export default function ExpensesPage() {
  const { data, notify, confirm, addRecord, updateRecord, deleteRecord } = useStore();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [month, setMonth] = useState(todayISO().slice(0, 7));
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [search, catFilter, month]);

  const allExpenses = data?.expenses ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allExpenses.filter((e) => {
      if (catFilter !== 'all' && e.category !== catFilter) return false;
      if (month && !e.date.startsWith(month)) return false;
      if (q) {
        const hay = `${e.name} ${e.category} ${e.paidBy} ${e.description ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allExpenses, search, catFilter, month]);

  if (!data) return null;

  const today = todayISO();
  const monthPrefix = today.slice(0, 7);
  const weekStart = (() => {
    const now = new Date();
    const d = new Date(now);
    d.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
    return toISODate(d);
  })();

  const sum = (list: Expense[]) => list.reduce((s, e) => s + e.amount, 0);
  const monthTotal = sum(data.expenses.filter((e) => e.date.startsWith(monthPrefix)));
  const todayTotal = sum(data.expenses.filter((e) => e.date === today));
  const weekTotal = sum(data.expenses.filter((e) => e.date >= weekStart && e.date <= today));

  const filteredTotal = sum(filtered);
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (e: Expense) => {
    setEditing(e);
    setForm({
      name: e.name,
      category: e.category,
      amount: String(e.amount),
      date: e.date,
      paidBy: e.paidBy,
      description: e.description ?? '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const save = () => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) errs.name = 'Expense name is required';
    if (!form.category) errs.category = 'Category is required';
    const amt = Number(form.amount);
    if (!form.amount.trim() || !Number.isFinite(amt) || amt <= 0) errs.amount = 'Enter an amount greater than 0';
    if (!form.date) errs.date = 'Date is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      name: form.name.trim(),
      category: form.category,
      amount: Math.round(amt),
      date: form.date,
      paidBy: form.paidBy.trim(),
      description: form.description.trim(),
    };
    if (editing) {
      updateRecord('expenses', editing.id, payload);
      notify('Expense updated', 'success');
    } else {
      addRecord('expenses', payload);
      notify('Expense added', 'success');
    }
    setModalOpen(false);
  };

  const remove = (e: Expense) => {
    confirm({
      title: 'Delete Expense?',
      message: `Delete "${e.name}" (${formatPKR(e.amount)})? This cannot be undone.`,
      danger: true,
      confirmText: 'Delete',
      onConfirm: () => {
        deleteRecord('expenses', e.id);
        notify('Expense deleted', 'info');
      },
    });
  };

  const catOptions =
    editing && !(EXPENSE_CATEGORIES as readonly string[]).includes(editing.category)
      ? [editing.category, ...EXPENSE_CATEGORIES]
      : [...EXPENSE_CATEGORIES];

  const columns: Column<Expense>[] = [
    { key: 'id', label: 'Expense ID', render: (e) => <span className="font-mono text-xs">{e.id}</span> },
    { key: 'name', label: 'Name', render: (e) => <span className="font-bold text-stone-900">{e.name}</span> },
    { key: 'category', label: 'Category', render: (e) => <Badge tone="blue">{e.category}</Badge> },
    {
      key: 'amount', label: 'Amount', className: 'text-right',
      render: (e) => <span className="font-bold text-red-600">{formatPKR(e.amount)}</span>,
    },
    { key: 'date', label: 'Date', render: (e) => formatDate(e.date) },
    { key: 'paidBy', label: 'Paid By', render: (e) => e.paidBy || '—' },
    {
      key: 'description', label: 'Description',
      render: (e) => <span className="block max-w-xs truncate" title={e.description}>{e.description || '—'}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Track electricity, rent, supplies and all other business costs."
        actions={(
          <button className="btn-primary btn-sm" onClick={openAdd}>
            <Plus size={16} /> Add Expense
          </button>
        )}
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarDays} label="This Month" value={formatPKR(monthTotal)} sub={monthLabel(monthPrefix)} tone="orange" />
        <StatCard icon={CalendarRange} label="This Week" value={formatPKR(weekTotal)} sub={`Since ${formatDate(weekStart)}`} tone="blue" />
        <StatCard icon={Wallet} label="Today" value={formatPKR(todayTotal)} sub={formatDate(today)} tone="green" />
        <StatCard icon={ClipboardList} label="Total Records" value={String(data.expenses.length)} sub="All recorded expenses" tone="purple" />
      </div>

      <div className="card mb-5">
        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search expenses by name, category, payer…" /></div>
          <select className="input md:w-52" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <input
              type="month"
              className="input md:w-44"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              title="Filter by month — clear for all time"
            />
            {month && (
              <button className="icon-btn" title="Show all time" onClick={() => setMonth('')}><X size={16} /></button>
            )}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={pageRows}
          rowKey={(e) => e.id}
          emptyMessage="No expenses found for the selected filters."
          actions={(e) => (
            <>
              <button className="icon-btn" title="Edit" onClick={() => openEdit(e)}><Pencil size={15} /></button>
              <button className="icon-btn text-red-600 hover:bg-red-50" title="Delete" onClick={() => remove(e)}><Trash2 size={15} /></button>
            </>
          )}
        />

        <div className="flex items-center justify-between border-t border-stone-200 px-4 py-3">
          <p className="text-sm text-stone-600">
            <Receipt size={15} className="mr-1.5 inline text-stone-400" />
            Total{month ? ` for ${monthLabel(month)}` : ' (all time)'}:{' '}
            <span className="font-extrabold text-stone-900">{formatPKR(filteredTotal)}</span>
            <span className="text-stone-400"> · {filtered.length} record{filtered.length === 1 ? '' : 's'}</span>
          </p>
        </div>
        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Expense' : 'Add Expense'}
        footer={(
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={save}>{editing ? 'Save Changes' : 'Add Expense'}</button>
          </>
        )}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Expense Name *" error={errors.name} className="sm:col-span-2">
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Electricity bill — September" />
          </Field>
          <Field label="Category *" error={errors.category}>
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {catOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Amount (Rs) *" error={errors.amount}>
            <input type="number" min={0} className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" />
          </Field>
          <Field label="Date *" error={errors.date}>
            <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Paid By">
            <input className="input" value={form.paidBy} onChange={(e) => setForm({ ...form, paidBy: e.target.value })} placeholder="e.g. Owner / Manager" />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional notes…" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
