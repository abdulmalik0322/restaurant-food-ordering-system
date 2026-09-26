import React from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
  footer?: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ open, title, onClose, children, wide, footer }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative bg-white w-full ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'} sm:rounded-2xl shadow-xl max-h-full sm:max-h-[90vh] overflow-y-auto animate-[fadeIn_.15s_ease-out]`}>
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-500">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="sticky bottom-0 bg-white px-5 py-4 border-t border-ink-100 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}

export default Modal
