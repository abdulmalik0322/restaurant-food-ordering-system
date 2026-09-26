/** Menu / Food Items: category filters, search, add/edit/delete/enable-disable. */
import { useMemo, useState } from 'react';
import { Image as ImageIcon, Plus, UtensilsCrossed } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { EmptyState, Field, Modal, PageHeader, SearchBar } from '../components/ui';
import { FoodCard } from '../components/FoodCard';
import { MENU_CATEGORIES } from '../types';
import type { MenuItem } from '../types';

const CATEGORY_IMAGE: Record<string, string> = {
  'Burgers': '/images/cat-burgers.jpg',
  'Shawarma & Rolls': '/images/cat-shawarma.jpg',
  'Pakistani BBQ': '/images/cat-bbq.jpg',
  'Fried Items': '/images/cat-fried.jpg',
  'Pakistani Food': '/images/cat-desi.jpg',
  'Drinks': '/images/cat-drinks.jpg',
};

interface FormState {
  name: string;
  category: string;
  description: string;
  price: string;
  image: string;
  available: boolean;
}

const EMPTY_FORM: FormState = {
  name: '',
  category: MENU_CATEGORIES[0],
  description: '',
  price: '',
  image: CATEGORY_IMAGE[MENU_CATEGORIES[0]],
  available: true,
};

export default function MenuPage() {
  const { data, addRecord, updateRecord, deleteRecord, notify, confirm } = useStore();
  const [category, setCategory] = useState<string>('All');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  if (!data) return null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.menu.filter((m) => {
      if (category !== 'All' && m.category !== category) return false;
      if (q && !(m.name + ' ' + m.description + ' ' + m.id).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data.menu, category, query]);

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      category: item.category,
      description: item.description,
      price: String(item.price),
      image: item.image ?? '',
      available: item.available,
    });
    setErrors({});
    setModalOpen(true);
  };

  const onCategoryChange = (c: string) => {
    set({ category: c, image: CATEGORY_IMAGE[c] ?? '' });
  };

  const save = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Item name is required.';
    if (!form.category) errs.category = 'Category is required.';
    const price = Number(form.price);
    if (!form.price.trim() || !Number.isFinite(price) || price <= 0) {
      errs.price = 'Enter a valid price greater than 0.';
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      price: Math.round(price),
      image: form.image.trim() || undefined,
      available: form.available,
    };
    if (editing) {
      updateRecord('menu', editing.id, payload);
      notify(`"${payload.name}" updated`, 'success');
    } else {
      addRecord('menu', payload);
      notify(`"${payload.name}" added to menu`, 'success');
    }
    setModalOpen(false);
  };

  const remove = (item: MenuItem) => {
    confirm({
      title: 'Delete menu item',
      message: `Delete "${item.name}" from the menu? This cannot be undone.`,
      danger: true,
      confirmText: 'Delete',
      onConfirm: () => {
        deleteRecord('menu', item.id);
        notify(`"${item.name}" deleted`, 'success');
      },
    });
  };

  const toggle = (item: MenuItem) => {
    updateRecord('menu', item.id, { available: !item.available });
    notify(`"${item.name}" ${item.available ? 'disabled' : 'enabled'}`, 'info');
  };

  return (
    <div>
      <PageHeader
        title="Menu / Food Items"
        subtitle={`${data.menu.length} items · prices in ${data.settings.currency} (${data.settings.currencySymbol})`}
        actions={
          <button className="btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Item
          </button>
        }
      />

      {/* Filters */}
      <div className="card mb-5 flex flex-col gap-3 p-4 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-1.5">
          {['All', ...MENU_CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                category === c
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="md:ml-auto md:w-72">
          <SearchBar value={query} onChange={setQuery} placeholder="Search food items…" />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={UtensilsCrossed}
            title="No food items found"
            message={
              data.menu.length === 0
                ? 'The menu is empty. Add your first food item to get started.'
                : 'No items match your search or filter. Try a different keyword or category.'
            }
            action={
              <button className="btn-primary btn-sm" onClick={openAdd}>
                <Plus size={14} /> Add Item
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((m) => (
            <FoodCard
              key={m.id}
              item={m}
              onEdit={() => openEdit(m)}
              onDelete={() => remove(m)}
              onToggle={() => toggle(m)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit Item — ${editing.id}` : 'Add Menu Item'}
        size="md"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={save}>{editing ? 'Save Changes' : 'Add Item'}</button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Item Name *" error={errors.name}>
            <input className="input" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Chicken Zinger Burger" />
          </Field>
          <Field label="Category *" error={errors.category}>
            <select className="input" value={form.category} onChange={(e) => onCategoryChange(e.target.value)}>
              {MENU_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea
              className="input min-h-20"
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
              placeholder="Short tasty description…"
            />
          </Field>
          <Field label="Price (Rs) *" error={errors.price}>
            <input
              className="input"
              type="number"
              min={1}
              value={form.price}
              onChange={(e) => set({ price: e.target.value })}
              placeholder="350"
            />
          </Field>
          <Field label="Image">
            <div className="flex items-center gap-2">
              <ImageIcon size={16} className="shrink-0 text-stone-400" />
              <input
                className="input"
                value={form.image}
                onChange={(e) => set({ image: e.target.value })}
                placeholder="/images/cat-burgers.jpg"
              />
            </div>
            <p className="mt-1 text-[11px] text-stone-400">Auto-set from category — you can override it.</p>
          </Field>
          <label className="flex cursor-pointer items-center gap-2.5 sm:col-span-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded accent-orange-600"
              checked={form.available}
              onChange={(e) => set({ available: e.target.checked })}
            />
            <span className="text-sm font-medium text-stone-700">Available for ordering</span>
          </label>
          {form.image && (
            <div className="sm:col-span-2">
              <p className="label">Preview</p>
              <img src={form.image} alt="preview" className="h-28 w-full rounded-xl object-cover" />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
