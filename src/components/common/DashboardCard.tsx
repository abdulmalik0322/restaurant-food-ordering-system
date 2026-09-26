import React from 'react'
import { LucideIcon } from 'lucide-react'
import { classNames } from '../../utils/format'

interface DashboardCardProps {
  label: string
  value: string
  icon: LucideIcon
  tone?: 'brand' | 'leaf' | 'ink' | 'amber' | 'red'
  hint?: string
}

const TONE_MAP: Record<string, string> = {
  brand: 'bg-brand-50 text-brand-600',
  leaf: 'bg-green-50 text-leaf-600',
  ink: 'bg-ink-100 text-ink-700',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
}

const DashboardCard: React.FC<DashboardCardProps> = ({ label, value, icon: Icon, tone = 'brand', hint }) => {
  return (
    <div className="card p-4 sm:p-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink-500 mb-1.5">{label}</p>
        <p className="font-display text-xl sm:text-2xl font-semibold text-ink-900 truncate">{value}</p>
        {hint && <p className="text-[11px] text-ink-400 mt-1">{hint}</p>}
      </div>
      <div className={classNames('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', TONE_MAP[tone])}>
        <Icon size={20} />
      </div>
    </div>
  )
}

export default DashboardCard
