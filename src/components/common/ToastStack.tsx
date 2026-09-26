import React from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const ICONS: Record<string, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-leaf-500" />,
  error: <XCircle size={18} className="text-red-500" />,
  info: <Info size={18} className="text-brand-500" />,
}

const ToastStack: React.FC = () => {
  const { toasts, dismissToast } = useApp()
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 no-print">
      {toasts.map(t => (
        <div key={t.id} className="flex items-center gap-2 bg-white border border-ink-100 shadow-card rounded-xl px-4 py-3 min-w-[240px] animate-[fadeIn_.15s_ease-out]">
          {ICONS[t.type]}
          <span className="text-sm text-ink-800 flex-1">{t.message}</span>
          <button onClick={() => dismissToast(t.id)} className="text-ink-400 hover:text-ink-600">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

export default ToastStack
