/** POS / New Order: menu browser + cart + customer + payment + bill generation. */
import { useMemo, useState } from 'react';
import { Download, Minus, Plus, Printer, ReceiptText, ShoppingCart, Trash2 } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { Badge, EmptyState, Field, Modal, PageHeader, SearchBar } from '../components/ui';
import { FoodTile } from '../components/FoodCard';
import { InvoiceView } from '../components/InvoiceView';
import { MENU_CATEGORIES, PAYMENT_METHOD_LABELS } from '../types';
import type { Order, OrderType, PaymentMethod } from '../types';
import { clamp, formatPKR } from '../utils/format';
import { printHtml } from '../utils/print';
import { buildInvoiceHtml } from '../utils/documents';
import { downloadInvoicePdf } from '../utils/pdf';

interface CartLine {
  menuItemId: string;
  qty: number;
  instructions: string;
}

const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  'dine-in': 'Dine-in',
  'takeaway': 'Takeaway',
  'delivery': 'Delivery',
};

export default function POSPage() {
  const { data, notify, placeOrder } = useStore();
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [custName, setCustName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [tableNo, setTableNo] = useState('');
  const [discount, setDiscount] = useState(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState(0);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [showBill, setShowBill] = useState(false);
  if (!data) return null;

  const sym = data.settings.currencySymbol;
  const taxPct = data.settings.taxPercent;
  const svcPct = data.settings.serviceChargePercent;
  const menuById = useMemo(() => new Map(data.menu.map((m) => [m.id, m])), [data.menu]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.menu.filter((m) => {
      if (category !== 'All' && m.category !== category) return false;
      if (q && !(m.name + ' ' + m.description).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data.menu, category, query]);

  // ------------------------------- cart ----------------------------------
  const addToCart = (menuItemId: string) => {
    setCart((c) => {
      const line = c.find((l) => l.menuItemId === menuItemId);
      if (line) return c.map((l) => (l.menuItemId === menuItemId ? { ...l, qty: l.qty + 1 } : l));
      return [...c, { menuItemId, qty: 1, instructions: '' }];
    });
  };

  const changeQty = (menuItemId: string, delta: number) => {
    setCart((c) =>
      c
        .map((l) => (l.menuItemId === menuItemId ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0),
    );
  };

  const removeLine = (menuItemId: string) => setCart((c) => c.filter((l) => l.menuItemId !== menuItemId));

  const setInstructions = (menuItemId: string, v: string) =>
    setCart((c) => c.map((l) => (l.menuItemId === menuItemId ? { ...l, instructions: v } : l)));

  // ------------------------------ totals ---------------------------------
  const subtotal = cart.reduce((s, l) => s + (menuById.get(l.menuItemId)?.price ?? 0) * l.qty, 0);
  const disc = clamp(Math.round(discount || 0), 0, subtotal);
  const base = subtotal - disc;
  const tax = Math.round((base * taxPct) / 100);
  const service = Math.round((base * svcPct) / 100);
  const total = base + tax + service;
  const paid = Math.max(0, Math.round(amountPaid || 0));
  const change = Math.max(0, paid - total);
  const balance = Math.max(0, total - paid);
  const itemCount = cart.reduce((s, l) => s + l.qty, 0);

  // ----------------------------- customer --------------------------------
  const pickCustomer = (id: string) => {
    setCustomerId(id);
    const c = data.customers.find((x) => x.id === id);
    if (c) {
      setCustName(c.name);
      setPhone(c.phone);
      setAddress(c.address ?? '');
    } else {
      setCustName('');
      setPhone('');
      setAddress('');
    }
  };

  const resetAll = () => {
    setCart([]);
    setCustomerId('');
    setCustName('');
    setPhone('');
    setAddress('');
    setOrderType('dine-in');
    setTableNo('');
    setDiscount(0);
    setPayMethod('cash');
    setAmountPaid(0);
  };

  const submit = () => {
    if (cart.length === 0) {
      notify('Add at least one item to the order.', 'error');
      return;
    }
    try {
      const order = placeOrder({
        customerName: custName.trim() || 'Walk-in Customer',
        customerId: customerId || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        type: orderType,
        tableNo: orderType === 'dine-in' && tableNo.trim() ? tableNo.trim() : undefined,
        items: cart.map((l) => ({
          menuItemId: l.menuItemId,
          qty: l.qty,
          instructions: l.instructions.trim() || undefined,
        })),
        discount: disc,
        paymentMethod: payMethod,
        amountPaid: paid,
      });
      setPlaced(order);
      setShowBill(true);
      notify(`Order ${order.id} placed`, 'success');
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Could not place order.', 'error');
    }
  };

  return (
    <div>
      <PageHeader title="POS / New Order" subtitle="Tap items to add them to the bill" />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* ------------------------------ menu ------------------------------ */}
        <div className="lg:col-span-2">
          <div className="card mb-4 flex flex-col gap-3 p-4 md:flex-row md:items-center">
            <div className="flex flex-wrap gap-1.5">
              {['All', ...MENU_CATEGORIES].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    category === c
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="md:ml-auto md:w-64">
              <SearchBar value={query} onChange={setQuery} placeholder="Search items…" />
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="card"><EmptyState icon={ShoppingCart} title="No items found" message="Try a different search or category." /></div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {visible.map((m) => (
                <FoodTile key={m.id} item={m} onAdd={() => addToCart(m.id)} />
              ))}
            </div>
          )}
        </div>

        {/* ------------------------------ cart ------------------------------ */}
        <div className="card h-fit p-4 lg:sticky lg:top-20">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900">Current Order</h3>
            {itemCount > 0 && <Badge tone="orange">{itemCount} items</Badge>}
          </div>

          {/* Customer */}
          <div className="mb-4 rounded-xl bg-stone-50 p-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone-500">Customer</p>
            <div className="grid gap-2">
              <select className="input" value={customerId} onChange={(e) => pickCustomer(e.target.value)}>
                <option value="">New / walk-in customer</option>
                {data.customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input className="input" value={custName} onChange={(e) => setCustName(e.target.value)} placeholder="Customer name" />
                <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
              </div>
              <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address (delivery)" />
              <div className="grid grid-cols-2 gap-2">
                <select className="input" value={orderType} onChange={(e) => setOrderType(e.target.value as OrderType)}>
                  {(Object.keys(ORDER_TYPE_LABELS) as OrderType[]).map((t) => (
                    <option key={t} value={t}>{ORDER_TYPE_LABELS[t]}</option>
                  ))}
                </select>
                {orderType === 'dine-in' && (
                  <input className="input" value={tableNo} onChange={(e) => setTableNo(e.target.value)} placeholder="Table no." />
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          {cart.length === 0 ? (
            <EmptyState icon={ShoppingCart} title="Cart is empty" message="Tap a food item to start the order." />
          ) : (
            <div className="mb-4 flex max-h-72 flex-col gap-2 overflow-y-auto">
              {cart.map((l) => {
                const m = menuById.get(l.menuItemId);
                if (!m) return null;
                return (
                  <div key={l.menuItemId} className="rounded-xl border border-stone-200 p-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-stone-800">{m.name}</p>
                        <p className="text-xs text-stone-500">{formatPKR(m.price, sym)} each</p>
                      </div>
                      <button className="icon-btn" onClick={() => removeLine(l.menuItemId)} aria-label="Remove">
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button className="icon-btn" onClick={() => changeQty(l.menuItemId, -1)} aria-label="Decrease">
                          <Minus size={14} />
                        </button>
                        <span className="w-7 text-center text-sm font-bold">{l.qty}</span>
                        <button className="icon-btn" onClick={() => changeQty(l.menuItemId, 1)} aria-label="Increase">
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-sm font-extrabold text-stone-900">{formatPKR(m.price * l.qty, sym)}</p>
                    </div>
                    <input
                      className="input mt-2 text-xs"
                      value={l.instructions}
                      onChange={(e) => setInstructions(l.menuItemId, e.target.value)}
                      placeholder="Special instructions (optional)"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Discount */}
          <Field label="Discount (Rs flat)">
            <input
              className="input"
              type="number"
              min={0}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              placeholder="0"
            />
          </Field>

          {/* Payment method */}
          <p className="label mt-3">Payment Method</p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((pm) => (
              <button
                key={pm}
                onClick={() => setPayMethod(pm)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  payMethod === pm ? 'bg-orange-600 text-white shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {PAYMENT_METHOD_LABELS[pm]}
              </button>
            ))}
          </div>

          <Field label="Amount Paid (Rs)">
            <input
              className="input"
              type="number"
              min={0}
              value={amountPaid}
              onChange={(e) => setAmountPaid(Number(e.target.value))}
              placeholder="0"
            />
          </Field>

          {/* Totals */}
          <div className="mt-4 space-y-1.5 rounded-xl bg-stone-50 p-3 text-sm">
            <div className="flex justify-between text-stone-600"><span>Subtotal</span><span>{formatPKR(subtotal, sym)}</span></div>
            <div className="flex justify-between text-stone-600"><span>Discount</span><span>− {formatPKR(disc, sym)}</span></div>
            <div className="flex justify-between text-stone-600"><span>Tax ({taxPct}%)</span><span>{formatPKR(tax, sym)}</span></div>
            <div className="flex justify-between text-stone-600"><span>Service ({svcPct}%)</span><span>{formatPKR(service, sym)}</span></div>
            <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-extrabold text-stone-900">
              <span>Grand Total</span><span>{formatPKR(total, sym)}</span>
            </div>
            <div className="flex justify-between text-green-700"><span>Change</span><span>{formatPKR(change, sym)}</span></div>
            {balance > 0 && (
              <div className="flex justify-between text-red-600"><span>Balance due</span><span>{formatPKR(balance, sym)}</span></div>
            )}
          </div>

          <button className="btn-primary mt-4 w-full text-base" style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }} onClick={submit} disabled={cart.length === 0}>
            <ReceiptText size={18} /> Place Order &amp; Generate Bill
          </button>
        </div>
      </div>

      {/* Bill modal */}
      <Modal
        open={showBill && placed !== null}
        onClose={() => setShowBill(false)}
        title={placed ? `Bill — ${placed.id}` : 'Bill'}
        size="lg"
        footer={
          placed ? (
            <>
              <button className="btn-secondary" onClick={() => printHtml(`Invoice ${placed.id}`, buildInvoiceHtml(placed, data.settings))}>
                <Printer size={15} /> Print Bill
              </button>
              <button className="btn-secondary" onClick={() => downloadInvoicePdf(placed, data.settings)}>
                <Download size={15} /> Download PDF
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  resetAll();
                  setPlaced(null);
                  setShowBill(false);
                  notify('Ready for the next order.', 'info');
                }}
              >
                New Order
              </button>
            </>
          ) : undefined
        }
      >
        {placed && <InvoiceView order={placed} settings={data.settings} />}
      </Modal>
    </div>
  );
}
