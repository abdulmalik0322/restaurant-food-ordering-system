/** Settings page: restaurant profile + billing/operations defaults used
 *  automatically on invoices, salary slips and reports; plus a danger zone. */
import { useEffect, useState } from 'react';
import { AlertTriangle, Building2, Info, Receipt, Save } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { Field, PageHeader } from '../components/ui';
import type { Settings } from '../types';

export default function SettingsPage() {
  const { data, saveSettings, resetDemo, confirm, navigate } = useStore();
  const [form, setForm] = useState<Settings | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) setForm({ ...data.settings });
  }, [data]);

  if (!data || !form) return null;

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const save = () => {
    const errs: Record<string, string> = {};
    if (!form.restaurantName.trim()) errs.restaurantName = 'Restaurant name is required';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    if (!form.currency.trim()) errs.currency = 'Currency is required';
    if (!form.currencySymbol.trim()) errs.currencySymbol = 'Currency symbol is required';
    if (!Number.isFinite(form.taxPercent) || form.taxPercent < 0 || form.taxPercent > 100)
      errs.taxPercent = 'Must be between 0 and 100';
    if (!Number.isFinite(form.serviceChargePercent) || form.serviceChargePercent < 0 || form.serviceChargePercent > 100)
      errs.serviceChargePercent = 'Must be between 0 and 100';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    saveSettings({ ...form, restaurantName: form.restaurantName.trim(), address: form.address.trim(), phone: form.phone.trim() });
  };

  const askReset = () => {
    confirm({
      title: 'Reset Demo Data?',
      message: 'This will erase all changes and restore the original demo dataset.',
      danger: true,
      confirmText: 'Reset',
      onConfirm: () => { resetDemo(); },
    });
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Configure your restaurant profile and billing defaults."
        actions={(
          <button className="btn-primary btn-sm" onClick={save}>
            <Save size={16} /> Save Settings
          </button>
        )}
      />

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-stone-800">
            <Building2 size={18} className="text-orange-600" /> Restaurant Profile
          </h3>
          <div className="flex flex-col gap-4">
            <Field label="Restaurant Name *" error={errors.restaurantName}>
              <input className="input" value={form.restaurantName} onChange={(e) => set('restaurantName', e.target.value)} />
            </Field>
            <Field label="Address *" error={errors.address}>
              <input className="input" value={form.address} onChange={(e) => set('address', e.target.value)} />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Phone *" error={errors.phone}>
                <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              </Field>
              <Field label="Email">
                <input type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="info@example.com" />
              </Field>
              <Field label="Opening Time">
                <input type="time" className="input" value={form.openingTime} onChange={(e) => set('openingTime', e.target.value)} />
              </Field>
              <Field label="Closing Time">
                <input type="time" className="input" value={form.closingTime} onChange={(e) => set('closingTime', e.target.value)} />
              </Field>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-stone-800">
            <Receipt size={18} className="text-orange-600" /> Billing &amp; Operations
          </h3>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Currency *" error={errors.currency}>
                <input className="input" value={form.currency} onChange={(e) => set('currency', e.target.value)} placeholder="PKR" />
              </Field>
              <Field label="Currency Symbol *" error={errors.currencySymbol}>
                <input className="input" value={form.currencySymbol} onChange={(e) => set('currencySymbol', e.target.value)} placeholder="Rs" />
              </Field>
              <Field label="Tax % *" error={errors.taxPercent}>
                <input
                  type="number" min={0} max={100} className="input"
                  value={form.taxPercent}
                  onChange={(e) => set('taxPercent', Number(e.target.value))}
                />
              </Field>
              <Field label="Service Charge % *" error={errors.serviceChargePercent}>
                <input
                  type="number" min={0} max={100} className="input"
                  value={form.serviceChargePercent}
                  onChange={(e) => set('serviceChargePercent', Number(e.target.value))}
                />
              </Field>
            </div>
            <Field label="Invoice Footer">
              <textarea
                className="input" rows={3} value={form.invoiceFooter}
                onChange={(e) => set('invoiceFooter', e.target.value)}
                placeholder="Thank you for visiting!"
              />
            </Field>
            <p className="text-xs text-stone-400">
              Tax and service charge are applied automatically to every new POS order.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Info size={18} className="mt-0.5 shrink-0 text-blue-600" />
          <div className="text-sm text-blue-900">
            <p className="font-bold">How these settings are used</p>
            <p className="mt-1">
              The restaurant name, address, phone, email, currency, tax %, service charge % and invoice footer
              are picked up automatically on every invoice, salary slip and report — change them here once and
              every new document reflects it. To change a <em>menu item's price</em>, go to the Menu section
              and use Edit on that item; prices are stored per item so they can be updated any time.
            </p>
            <button className="btn-secondary btn-sm mt-2" onClick={() => navigate('menu')}>
              Go to Menu
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-red-200 bg-red-50/50 p-5">
        <h3 className="mb-1 flex items-center gap-2 font-bold text-red-700">
          <AlertTriangle size={18} /> Danger Zone
        </h3>
        <p className="mb-3 text-sm text-stone-500">
          Restore the original demo dataset. All orders, customers, employees, expenses and settings changes you made will be lost.
        </p>
        <button className="btn-danger btn-sm" onClick={askReset}>
          Reset Demo Data
        </button>
      </div>
    </div>
  );
}
