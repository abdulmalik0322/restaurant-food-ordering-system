import React from 'react'

export type DateFilterValue = 'today' | 'yesterday' | 'week' | 'month' | 'all'

const OPTIONS: { value: DateFilterValue; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
]

const DateFilter: React.FC<{ value: DateFilterValue; onChange: (v: DateFilterValue) => void }> = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-1.5">
    {OPTIONS.map(opt => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
          value === opt.value
            ? 'bg-brand-600 text-white border-brand-600'
            : 'bg-white text-ink-600 border-ink-200 hover:bg-ink-50'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
)

export function matchesDateFilter(iso: string, filter: DateFilterValue): boolean {
  if (filter === 'all') return true
  const d = new Date(iso)
  const now = new Date()
  if (filter === 'today') {
    return d.toDateString() === now.toDateString()
  }
  if (filter === 'yesterday') {
    const y = new Date(now); y.setDate(now.getDate() - 1)
    return d.toDateString() === y.toDateString()
  }
  if (filter === 'week') {
    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7)
    return d >= weekAgo && d <= now
  }
  if (filter === 'month') {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }
  return true
}

export default DateFilter
