import React from 'react'
import { classNames } from '../../utils/format'

const COLOR_MAP: Record<string, string> = {
  green: 'bg-green-50 text-leaf-600',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-600',
  ink: 'bg-ink-100 text-ink-600',
  brand: 'bg-brand-50 text-brand-600',
}

const STATUS_COLORS: Record<string, string> = {
  Paid: 'green', Present: 'green', Active: 'green', 'In Stock': 'green',
  Pending: 'amber', Late: 'amber', 'Low Stock': 'amber', Partial: 'amber', 'On Leave': 'amber',
  Absent: 'red', Inactive: 'red', 'Out of Stock': 'red', Leave: 'red',
}

const Badge: React.FC<{ status: string; className?: string }> = ({ status, className }) => {
  const color = STATUS_COLORS[status] ?? 'ink'
  return (
    <span className={classNames('badge', COLOR_MAP[color], className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  )
}

export default Badge
