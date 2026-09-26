import React from 'react'
import { Pencil, Trash2, Power } from 'lucide-react'
import type { FoodItem } from '../../types'
import { formatPKR } from '../../utils/format'

interface Props {
  item: FoodItem
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}

const FoodCard: React.FC<Props> = ({ item, onEdit, onDelete, onToggle }) => (
  <div className="card p-4 flex flex-col gap-3 group relative">
    {!item.available && (
      <span className="absolute top-3 right-3 badge bg-ink-100 text-ink-500">Disabled</span>
    )}
    <div className="w-full h-24 rounded-xl bg-brand-50 flex items-center justify-center text-4xl">
      {item.image}
    </div>
    <div>
      <p className="text-[11px] text-brand-600 font-medium mb-0.5">{item.category}</p>
      <h4 className="font-display font-semibold text-ink-900 leading-snug">{item.name}</h4>
      <p className="text-xs text-ink-500 mt-1 line-clamp-2">{item.description}</p>
    </div>
    <div className="flex items-center justify-between mt-auto pt-2 border-t border-ink-100">
      <span className="font-display font-semibold text-brand-700">{formatPKR(item.price)}</span>
      <div className="flex items-center gap-1">
        <button onClick={onToggle} title="Enable/Disable" className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-500">
          <Power size={14} />
        </button>
        <button onClick={onEdit} title="Edit" className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-500">
          <Pencil size={14} />
        </button>
        <button onClick={onDelete} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  </div>
)

export default FoodCard
