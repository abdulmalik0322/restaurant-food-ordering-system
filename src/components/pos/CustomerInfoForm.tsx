import React from 'react'
import type { CustomerInfo, OrderType } from '../../types'

const ORDER_TYPES: OrderType[] = ['Dine-in', 'Takeaway', 'Delivery']

interface Props {
  value: CustomerInfo
  onChange: (v: CustomerInfo) => void
}

const CustomerInfoForm: React.FC<Props> = ({ value, onChange }) => {
  const set = (patch: Partial<CustomerInfo>) => onChange({ ...value, ...patch })

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="label">Customer Name</label>
          <input className="input" value={value.name} onChange={e => set({ name: e.target.value })} placeholder="Walk-in Customer" />
        </div>
        <div>
          <label className="label">Phone Number</label>
          <input className="input" value={value.phone} onChange={e => set({ phone: e.target.value })} placeholder="03xx-xxxxxxx" />
        </div>
      </div>
      <div>
        <label className="label">Address (optional)</label>
        <input className="input" value={value.address ?? ''} onChange={e => set({ address: e.target.value })} placeholder="For delivery orders" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="label">Email (optional)</label>
          <input className="input" value={value.email ?? ''} onChange={e => set({ email: e.target.value })} placeholder="optional@email.com" />
        </div>
        <div>
          <label className="label">Table Number (optional)</label>
          <input className="input" value={value.tableNumber ?? ''} onChange={e => set({ tableNumber: e.target.value })} placeholder="e.g. T-04" disabled={value.orderType !== 'Dine-in'} />
        </div>
      </div>
      <div>
        <label className="label">Order Type</label>
        <div className="flex gap-1.5">
          {ORDER_TYPES.map(t => (
            <button key={t} type="button" onClick={() => set({ orderType: t })}
              className={`flex-1 py-2 rounded-lg text-xs font-medium border ${value.orderType === t ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-ink-600 border-ink-200 hover:bg-ink-50'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CustomerInfoForm
