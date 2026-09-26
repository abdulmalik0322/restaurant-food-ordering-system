/** Inventory page: stock items with low/out-of-stock alerts, value summary,
 *  search + category filter, and add/edit/delete. */
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Package, PackageX, Pencil, Plus, Trash2, Wallet } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import {
  Badge, DataTable, Field, Modal, PageHeader, Pagination, SearchBar, StatCard,
} from '../components/ui';
import type { Column } from '../components/ui';
import type { InventoryItem } from '../types';
import { formatDate, formatPKR } from '../utils/format';

type StockStatus = 'out' | 'low' | 'ok';

const statusOf = (it: InventoryItem): StockStatus =>
  it.qty <= 0 ? 'out' : it.qty <= it.minStock ? 'low' : 'ok';

interface FormState {
  name: string;
  category: string;
  qty: string;
  unit: string;
  minStock: string;
  purchasePrice: string;
  supplier: string;
  expiry: string;
}

const emptyForm = (): FormState => ({
  name: '', category: '', qty: '', unit: '', minStock: '', purchasePrice: '', supplier: '', expiry: '',
});

const PAGE_SIZE = 15;

export default function InventoryPage() {
  const { data, notify, confirm, addRecord, updateRecord, deleteRecord } = useStore();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [search, catFilter]);

  const allItems = data?.inventory ?? [];

  const categories = useMemo(
    () => Array.from(new Set(allItems.map((i) => i.category))).sort(),
    [allItems],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allItems.filter((it) => {
      if (catFilter !== 'all' && it.category !== catFilter) return false;
      if (q && !`${it.name} ${it.category} ${it.supplier}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allItems, search, catFilter]);

  if (!data) return null;

  const outItems = data.inventory.filter((it) => statusOf(it) === 'out');
  const lowItems = data.inventory.filter((it) => statusOf(it) === 'low');
  const stockValue = data.inventory.reduce((s, it) => s + it.qty * it.purchasePrice, 0);

  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (it: InventoryItem) => {
    setEditing(it);
    setForm({
      name: it.name,
      category: it.category,
      qty: String(it.qty),
      unit: it.unit,
      minStock: String(it.minStock),
      purchasePrice: String(it.purchasePrice),
      supplier: it.supplier,
      expiry: it.expiry ?? '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const save = () => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    const num = (key: keyof FormState): number => Number(form[key]);

    if (!form.name.trim()) errs.name = 'Item name is required';
    if (!form.category.trim()) errs.category = 'Category is required';
    if (!form.qty.trim() || !Number.isFinite(num('qty')) || num('qty') < 0) errs.qty = 'Enter a quantity of 0 or more';
    if (!form.unit.trim()) errs.unit = 'Unit is required (e.g. kg, litre, pcs)';
    if (!form.minStock.trim() || !Number.isFinite(num('minStock')) || num('minStock') < 0) errs.minStock = 'Enter a minimum stock of 0 or more';
    if (!form.purchasePrice.trim() || !Number.isFinite(num('purchasePrice')) || num('purchasePrice') < 0) errs.purchasePrice = 'Enter a purchase price of 0 or more';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      qty: Number(form.qty),
      unit: form.unit.trim(),
      minStock: Number(form.minStock),
      purchasePrice: Math.round(Number(form.purchasePrice)),
      supplier: form.supplier.trim(),
      expiry: form.expiry || undefined,
    };
    if (editing) {
      updateRecord('inventory', editing.id, payload);
      notify('Inventory item updated', 'success');
    } else {
      addRecord('inventory', payload);
      notify('Inventory item added', 'success');
    }
    setModalOpen(false);
  };

  const remove = (it: InventoryItem) => {
    confirm({
      title: 'Delete Inventory Item?',
      message: `Delete "${it.name}" from inventory? This cannot be undone.`,
      danger: true,
      confirmText: 'Delete',
      onConfirm: () => {
        deleteRecord('inventory', it.id);
        notify('Inventory item deleted', 'info');
      },
    });
  };

  const columns: Column<InventoryItem>[] = [
    { key: 'id', label: 'Item ID', render: (it) => <span className="font-mono text-xs">{it.id}</span> },
    { key: 'name', label: 'Name', render: (it) => <span className="font-bold text-stone-900">{it.name}</span> },
    { key: 'category', label: 'Category', render: (it) => <Badge tone="purple">{it.category}</Badge> },
    {
      key: 'qty', label: 'Quantity', className: 'text-right',
      render: (it) => {
        const s = statusOf(it);
        const color = s === 'out' ? 'text-red-600' : s === 'low' ? 'text-amber-600' : 'text-stone-900';
        return <span className={`font-bold ${color}`}>{it.qty} {it.unit}</span>;
      },
    },
    { key: 'minStock', label: 'Min Stock', className: 'text-right', render: (it) => `${it.minStock} ${it.unit}` },
    {
      key: 'purchasePrice', label: 'Purchase Price', className: 'text-right',
      render: (it) => formatPKR(it.purchasePrice),
    },
    { key: 'supplier', label: 'Supplier', render: (it) => it.supplier || '—' },
    { key: 'expiry', label: 'Expiry', render: (it) => (it.expiry ? formatDate(it.expiry) : '—') },
    {
      key: 'status', label: 'Status',
      render: (it) => {
        const s = statusOf(it);
        return s === 'out'
          ? <Badge tone="red">Out of Stock</Badge>
          : s === 'low'
            ? <Badge tone="amber">Low Stock</Badge>
            : <Badge tone="green">In Stock</Badge>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Track raw materials and supplies, and get low-stock alerts."
        actions={(
          <button className="btn-primary btn-sm" onClick={openAdd}>
            <Plus size={16} /> Add Item
          </button>
        )}
      />

      {outItems.length > 0 && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 font-bold text-red-700">
            <PackageX size={18} /> Out of Stock ({outItems.length})
          </div>
          <p className="mt-1 text-sm text-red-600">
            {outItems.map((it) => it.name).join(', ')} — restock these items as soon as possible.
          </p>
        </div>
      )}
      {lowItems.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 font-bold text-amber-700">
            <AlertTriangle size={18} /> Low Stock ({lowItems.length})
          </div>
          <p className="mt-1 text-sm text-amber-700">
            {lowItems.map((it) => `${it.name} (${it.qty} ${it.unit})`).join(', ')} — running below minimum stock.
          </p>
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Package} label="Total Items" value={String(data.inventory.length)} sub={`${categories.length} categories`} tone="blue" />
        <StatCard icon={AlertTriangle} label="Low Stock" value={String(lowItems.length)} sub="At or below minimum" tone="amber" />
        <StatCard icon={PackageX} label="Out of Stock" value={String(outItems.length)} sub="Quantity is zero" tone="red" />
        <StatCard icon={Wallet} label="Stock Value" value={formatPKR(stockValue)} sub="qty × purchase price" tone="green" />
      </div>

      <div className="card">
        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search by item name, category or supplier…" /></div>
          <select className="input md:w-52" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <DataTable
          columns={columns}
          data={pageRows}
          rowKey={(it) => it.id}
          emptyMessage="No inventory items found for the selected filters."
          actions={(it) => (
            <>
              <button className="icon-btn" title="Edit" onClick={() => openEdit(it)}><Pencil size={15} /></button>
              <button className="icon-btn text-red-600 hover:bg-red-50" title="Delete" onClick={() => remove(it)}><Trash2 size={15} /></button>
            </>
          )}
        />
        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Inventory Item' : 'Add Inventory Item'}
        footer={(
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={save}>{editing ? 'Save Changes' : 'Add Item'}</button>
          </>
        )}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Item Name *" error={errors.name} className="sm:col-span-2">
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Chicken (broiler)" />
          </Field>
          <Field label="Category *" error={errors.category}>
            <input
              className="input" list="inv-cats" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Meat, Dairy, Grains"
            />
            <datalist id="inv-cats">
              {categories.map((c) => <option key={c} value={c} />)}
            </datalist>
          </Field>
          <Field label="Unit * (kg / litre / pcs)" error={errors.unit}>
            <input className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="kg" />
          </Field>
          <Field label="Quantity *" error={errors.qty}>
            <input type="number" min={0} className="input" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} placeholder="0" />
          </Field>
          <Field label="Minimum Stock *" error={errors.minStock}>
            <input type="number" min={0} className="input" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} placeholder="0" />
          </Field>
          <Field label="Purchase Price (Rs) *" error={errors.purchasePrice}>
            <input type="number" min={0} className="input" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} placeholder="0" />
          </Field>
          <Field label="Supplier">
            <input className="input" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="e.g. Fresh Foods Co." />
          </Field>
          <Field label="Expiry Date" className="sm:col-span-2">
            <input type="date" className="input" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
