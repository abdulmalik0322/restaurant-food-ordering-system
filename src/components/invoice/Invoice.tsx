import React from 'react'
import type { Order, RestaurantSettings } from '../../types'
import { formatPKR, formatDateTime } from '../../utils/format'

interface Props {
  order: Order
  settings: RestaurantSettings
}

const Invoice: React.FC<Props> = ({ order, settings }) => (
  <div id="print-area" className="bg-white text-ink-900 max-w-[480px] mx-auto p-6 font-sans text-sm">
    <div className="text-center mb-4">
      <div className="text-3xl mb-1">{settings.logoEmoji}</div>
      <h2 className="font-display text-lg font-bold">{settings.name}</h2>
      <p className="text-xs text-ink-500">{settings.address}</p>
      <p className="text-xs text-ink-500">{settings.phone} {settings.email ? `· ${settings.email}` : ''}</p>
    </div>
    <div className="border-t border-dashed border-ink-300 my-3" />
    <div className="grid grid-cols-2 gap-y-1 text-xs mb-3">
      <span className="text-ink-500">Invoice #</span><span className="text-right font-medium">{order.invoiceId}</span>
      <span className="text-ink-500">Order ID</span><span className="text-right font-medium">{order.id}</span>
      <span className="text-ink-500">Date & Time</span><span className="text-right font-medium">{formatDateTime(order.date)}</span>
      <span className="text-ink-500">Order Type</span><span className="text-right font-medium">{order.customer.orderType}{order.customer.tableNumber ? ` (${order.customer.tableNumber})` : ''}</span>
    </div>
    <div className="border-t border-dashed border-ink-300 my-3" />
    <div className="text-xs mb-3 space-y-0.5">
      <p><span className="text-ink-500">Customer: </span><span className="font-medium">{order.customer.name || 'Walk-in Customer'}</span></p>
      {order.customer.customerId && <p><span className="text-ink-500">Customer ID: </span>{order.customer.customerId}</p>}
      <p><span className="text-ink-500">Phone: </span>{order.customer.phone || '—'}</p>
      {order.customer.address && <p><span className="text-ink-500">Address: </span>{order.customer.address}</p>}
    </div>
    <div className="border-t border-dashed border-ink-300 my-3" />
    <table className="w-full text-xs mb-3">
      <thead>
        <tr className="border-b border-ink-200">
          <th className="text-left py-1.5 font-semibold">Item</th>
          <th className="text-center py-1.5 font-semibold w-10">Qty</th>
          <th className="text-right py-1.5 font-semibold w-16">Price</th>
          <th className="text-right py-1.5 font-semibold w-16">Total</th>
        </tr>
      </thead>
      <tbody>
        {order.items.map((it, idx) => (
          <tr key={idx} className="border-b border-ink-100 align-top">
            <td className="py-1.5">
              {it.name}
              {it.instructions && <div className="text-[10px] text-ink-400 italic">Note: {it.instructions}</div>}
            </td>
            <td className="text-center py-1.5">{it.quantity}</td>
            <td className="text-right py-1.5">{formatPKR(it.price)}</td>
            <td className="text-right py-1.5">{formatPKR(it.price * it.quantity)}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="space-y-1 text-xs">
      <Row label="Subtotal" value={formatPKR(order.subtotal)} />
      {order.discount > 0 && <Row label="Discount" value={`- ${formatPKR(order.discount)}`} />}
      <Row label={`Tax (${order.taxPercent}%)`} value={formatPKR(order.taxAmount)} />
      <Row label={`Service Charge (${order.serviceChargePercent}%)`} value={formatPKR(order.serviceChargeAmount)} />
      <div className="border-t border-ink-300 my-1.5" />
      <Row label="Grand Total" value={formatPKR(order.grandTotal)} bold />
      <div className="border-t border-dashed border-ink-300 my-1.5" />
      <Row label="Payment Method" value={order.paymentMethod} />
      <Row label="Amount Paid" value={formatPKR(order.amountPaid)} />
      {order.remaining > 0 && <Row label="Remaining Amount" value={formatPKR(order.remaining)} />}
      {order.changeReturn > 0 && <Row label="Change Returned" value={formatPKR(order.changeReturn)} />}
    </div>
    <div className="border-t border-dashed border-ink-300 my-3" />
    <p className="text-center text-xs text-ink-500">{settings.invoiceFooter}</p>
  </div>
)

const Row: React.FC<{ label: string; value: string; bold?: boolean }> = ({ label, value, bold }) => (
  <div className={`flex justify-between ${bold ? 'text-sm font-bold' : ''}`}>
    <span className={bold ? '' : 'text-ink-500'}>{label}</span>
    <span className={bold ? '' : 'font-medium'}>{value}</span>
  </div>
)

export default Invoice
