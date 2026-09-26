import React from 'react'
import { LucideIcon, Inbox } from 'lucide-react'

const EmptyState: React.FC<{ icon?: LucideIcon; title: string; message?: string }> = ({ icon: Icon = Inbox, title, message }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-ink-400">
    <Icon size={30} />
    <p className="text-sm font-medium text-ink-600">{title}</p>
    {message && <p className="text-xs text-ink-400 max-w-xs">{message}</p>}
  </div>
)

export default EmptyState
