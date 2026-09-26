import React from 'react'
import { Minus, Plus, Trash2, StickyNote } from 'lucide-react'
import type { OrderLineItem } from '../../types'
import { formatPKR } from '../../utils/format'

interface Props {
  items: OrderLineItem[]
  onIncrease: (itemId: string) => void
  onDecrease: (itemId: string) => void
  onRemove: (itemId: string) => void
  onInstructionChange: (itemId: string, note: string) => void
}

const POSCart: React.FC<Props> = ({ items, onIncrease, onDecrease, onRemove, onInstructionChange }) => {
  const [noteFor, setNoteFor] = React.useState<string | null>(null)

  if (items.length === 0) {
    return <p className="text-sm text-ink-400 text-center py-10">Cart is empty. Tap a menu item to add it.</p>
  }

  return (
    <div className="space-y-2.5">
      {items.map(item => (
        <div key={item.itemId} className="border border-ink-100 rounded-xl p-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink-900 truncate">{item.name}</p>
              <p className="text-xs text-ink-400">{formatPKR(item.price)} each</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={() => onDecrease(item.itemId)} className="w-6 h-6 rounded-md border border-ink-200 flex items-center justify-center text-ink-600 hover:bg-ink-50">
                <Minus size={12} />
              </button>
              <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
              <button onClick={() => onIncrease(item.itemId)} className="w-6 h-6 rounded-md border border-ink-200 flex items-center justify-center text-ink-600 hover:bg-ink-50">
                <Plus size={12} />
              </button>
            </div>
            <span className="w-16 text-right text-sm font-semibold text-ink-900 shrink-0">{formatPKR(item.price * item.quantity)}</span>
            <button onClick={() => setNoteFor(noteFor === item.itemId ? null : item.itemId)} className="p-1 text-ink-400 hover:text-brand-600 shrink-0">
              <StickyNote size={14} />
            </button>
            <button onClick={() => onRemove(item.itemId)} className="p-1 text-ink-400 hover:text-red-500 shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
          {item.instructions && noteFor !== item.itemId && (
            <p className="text-[11px] text-ink-400 mt-1.5 italic">Note: {item.instructions}</p>
          )}
          {noteFor === item.itemId && (
            <input
              autoFocus
              className="input mt-2 text-xs py-1.5"
              placeholder="Special instructions (e.g. less spicy, no onions)"
              value={item.instructions ?? ''}
              onChange={e => onInstructionChange(item.itemId, e.target.value)}
              onBlur={() => setNoteFor(null)}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default POSCart
