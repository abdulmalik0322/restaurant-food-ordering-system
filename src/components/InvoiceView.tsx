/** On-screen invoice preview (used in POS success modal and Bills view). */
import type { Order, Settings } from '../types';
import { invoiceNoFor } from '../api/db';
import { formatDateTime, formatPKR, titleCase } from '../utils/format';

export function InvoiceView({ order, settings }: { order: Order; settings: Settings }) {
  const sym = settings.currencySymbol;
  const invNo = invoiceNoFor(order.id);
  const Row = ({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) => (
    <div className={`flex justify-between py-1 ${bold ? 'text-base font-extrabold' : 'text-sm'} ${accent ? 'text-orange-700' : ''}`}>
      <span className={bold ? '' : 'text-stone-500'}>{label}</span>
      <span>{value}</span>
    </div>
  );
  return (
    <div className="mx-auto max-w-md rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-extrabold text-stone-900">{settings.restaurantName}</h2>
        <p className="text-xs text-stone-500">{settings.address}</p>
        <p className="text-xs text-stone-500">Phone: {settings.phone}{settings.email ? ` · ${settings.email}` : ''}</p>
      </div>
      <div className="mb-3 border-y-2 border-dashed border-stone-300 py-2 text-center">
        <p className="text-sm font-bold tracking-[0.2em] text-stone-700">TAX INVOICE</p>
      </div>
      <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <p><span className="font-semibold">Invoice No:</span> {invNo}</p>
        <p className="text-right"><span className="font-semibold">Order:</span> {order.id}</p>
        <p className="col-span-2"><span className="font-semibold">Date:</span> {formatDateTime(order.date)}</p>
        <p><span className="font-semibold">Type:</span> {titleCase(order.type)}{order.tableNo ? ` · ${order.tableNo}` : ''}</p>
        <p className="text-right"><span className="font-semibold">Payment:</span> {titleCase(order.paymentMethod)}</p>
      </div>
      <div className="mb-3 rounded-lg bg-stone-50 p-3 text-xs">
        <p className="font-semibold text-stone-800">{order.customerName}</p>
        {order.phone && <p className="text-stone-500">{order.phone}</p>}
        {order.address && <p className="text-stone-500">{order.address}</p>}
      </div>
      <table className="mb-3 w-full text-xs">
        <thead>
          <tr className="border-b-2 border-stone-800 text-left">
            <th className="py-1.5">Item</th>
            <th className="py-1.5 text-center">Qty</th>
            <th className="py-1.5 text-right">Price</th>
            <th className="py-1.5 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((it, i) => (
            <tr key={i} className="border-b border-dashed border-stone-200 align-top">
              <td className="py-1.5 pr-2">
                {it.name}
                {it.instructions && <span className="block text-[10px] text-stone-400">Note: {it.instructions}</span>}
              </td>
              <td className="py-1.5 text-center">{it.qty}</td>
              <td className="py-1.5 text-right">{formatPKR(it.price, sym)}</td>
              <td className="py-1.5 text-right font-medium">{formatPKR(it.price * it.qty, sym)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-stone-200 pt-2">
        <Row label="Subtotal" value={formatPKR(order.subtotal, sym)} />
        {order.discount > 0 && <Row label="Discount" value={`− ${formatPKR(order.discount, sym)}`} accent />}
        <Row label={`Tax (${settings.taxPercent}%)`} value={formatPKR(order.tax, sym)} />
        <Row label={`Service Charge (${settings.serviceChargePercent}%)`} value={formatPKR(order.serviceCharge, sym)} />
        <div className="mt-1 border-t border-stone-200 pt-1">
          <Row label="GRAND TOTAL" value={formatPKR(order.total, sym)} bold />
        </div>
        <Row label="Amount Paid" value={formatPKR(order.amountPaid, sym)} />
        {order.change > 0 && <Row label="Change Returned" value={formatPKR(order.change, sym)} accent />}
        {order.balance > 0 && <Row label="Balance Due" value={formatPKR(order.balance, sym)} accent />}
        <Row label="Status" value={order.status.toUpperCase()} />
      </div>
      <p className="mt-4 border-t-2 border-dashed border-stone-300 pt-3 text-center text-xs text-stone-500">
        {settings.invoiceFooter}
      </p>
    </div>
  );
}
