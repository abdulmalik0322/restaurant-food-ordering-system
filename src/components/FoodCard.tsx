/** Food item card — full card for the Menu page, compact tile for the POS. */
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { MenuItem } from '../types';
import { formatPKR } from '../utils/format';
import { Badge } from './ui';

export function FoodCard({ item, onEdit, onDelete, onToggle }: {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  return (
    <div className={`card animate-fade-up overflow-hidden transition hover:-translate-y-1 hover:shadow-lg ${!item.available ? 'opacity-75' : ''}`}>
      <div className="relative h-36">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-amber-200 text-3xl font-extrabold text-orange-400">
            {item.name[0]}
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-stone-950/70 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
          {item.category}
        </span>
        <button
          onClick={onToggle}
          title={item.available ? 'Disable item' : 'Enable item'}
          className={`absolute right-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-bold backdrop-blur transition ${
            item.available ? 'bg-green-600/90 text-white hover:bg-green-700' : 'bg-stone-700/90 text-stone-200 hover:bg-stone-600'
          }`}
        >
          {item.available ? 'Available' : 'Disabled'}
        </button>
      </div>
      <div className="p-3.5">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold leading-tight text-stone-900">{item.name}</h4>
          <p className="shrink-0 text-sm font-extrabold text-orange-600">{formatPKR(item.price)}</p>
        </div>
        <p className="mb-1 text-[11px] text-stone-400">{item.id}</p>
        <p className="mb-3 line-clamp-2 min-h-8 text-xs text-stone-500">{item.description}</p>
        <div className="flex gap-1.5">
          <button className="btn-secondary btn-sm flex-1" onClick={onEdit}><Pencil size={13} /> Edit</button>
          <button className="btn-sm inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50" onClick={onDelete}>
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function FoodTile({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  return (
    <button
      onClick={onAdd}
      disabled={!item.available}
      className="card group overflow-hidden p-0 text-left transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="relative h-24">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-amber-200 text-2xl font-extrabold text-orange-400">
            {item.name[0]}
          </div>
        )}
        {!item.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-950/50">
            <Badge tone="gray">Unavailable</Badge>
          </div>
        )}
        <span className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-orange-600 text-white opacity-0 shadow transition group-hover:opacity-100">
          <Plus size={16} />
        </span>
      </div>
      <div className="p-2.5">
        <p className="truncate text-xs font-bold text-stone-900">{item.name}</p>
        <p className="text-xs font-extrabold text-orange-600">{formatPKR(item.price)}</p>
      </div>
    </button>
  );
}
