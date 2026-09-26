import React, { useState } from 'react'
import type { FoodItem, FoodCategory } from '../../types'

const CATEGORIES: FoodCategory[] = ['Burgers', 'Shawarma & Rolls', 'Pakistani BBQ', 'Fried Items', 'Pakistani Food', 'Drinks']
const EMOJIS = ['🍔', '🌯', '🍗', '🍢', '🍖', '🍟', '🍛', '🍚', '🥘', '🫓', '🥤', '💧', '🧃', '☕', '🧀']

interface Props {
  initial?: FoodItem
  onSubmit: (data: Omit<FoodItem, 'id'>) => void
  onCancel: () => void
}

const FoodItemForm: React.FC<Props> = ({ initial, onSubmit, onCancel }) => {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<FoodCategory>(initial?.category ?? 'Burgers')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [price, setPrice] = useState(initial?.price?.toString() ?? '')
  const [image, setImage] = useState(initial?.image ?? '🍔')
  const [available, setAvailable] = useState(initial?.available ?? true)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('Item name is required')
    const priceNum = Number(price)
    if (!priceNum || priceNum <= 0) return setError('Enter a valid price greater than 0')
    setError('')
    onSubmit({ name: name.trim(), category, description: description.trim(), price: priceNum, image, available })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <div>
        <label className="label">Item Name</label>
        <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Zinger Burger" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Category</label>
          <select className="input" value={category} onChange={e => setCategory(e.target.value as FoodCategory)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Price (PKR)</label>
          <input className="input" type="number" min={0} value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 350" />
        </div>
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input" rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description shown to cashiers and customers" />
      </div>
      <div>
        <label className="label">Icon</label>
        <div className="flex flex-wrap gap-1.5">
          {EMOJIS.map(em => (
            <button type="button" key={em} onClick={() => setImage(em)}
              className={`w-9 h-9 rounded-lg border text-lg flex items-center justify-center ${image === em ? 'border-brand-500 bg-brand-50' : 'border-ink-200 bg-white'}`}>
              {em}
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-700">
        <input type="checkbox" checked={available} onChange={e => setAvailable(e.target.checked)} className="rounded border-ink-300" />
        Available for order
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">{initial ? 'Save Changes' : 'Add Item'}</button>
      </div>
    </form>
  )
}

export default FoodItemForm
