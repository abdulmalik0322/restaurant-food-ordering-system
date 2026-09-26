import React from 'react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, title, message, onConfirm, onCancel, danger }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${danger ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'}`}>
          <AlertTriangle size={20} />
        </div>
        <h3 className="font-display text-base font-semibold text-ink-900 mb-1">{title}</h3>
        <p className="text-sm text-ink-600 mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
