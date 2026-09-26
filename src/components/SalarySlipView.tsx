/** On-screen salary slip preview (used in the Payroll page modal). */
import type { Employee, PayrollRecord, Settings } from '../types';
import { formatPKR, monthLabel } from '../utils/format';

export function SalarySlipView({ rec, emp, settings }: { rec: PayrollRecord; emp: Employee; settings: Settings }) {
  const sym = settings.currencySymbol;
  const Line = ({ label, value, bold }: { label: string; value: number; bold?: boolean }) => (
    <div className={`flex justify-between border-b border-stone-100 px-4 py-2.5 text-sm ${bold ? 'font-bold' : ''}`}>
      <span className={bold ? '' : 'text-stone-500'}>{label}</span>
      <span>{formatPKR(value, sym)}</span>
    </div>
  );
  return (
    <div className="mx-auto max-w-lg overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      <div className="border-b-4 border-double border-stone-300 px-6 py-5 text-center">
        <h2 className="text-lg font-extrabold text-stone-900">{settings.restaurantName}</h2>
        <p className="text-xs text-stone-500">{settings.address} · {settings.phone}</p>
        <p className="mt-2 text-sm font-bold tracking-widest text-stone-700">SALARY SLIP — {monthLabel(rec.month).toUpperCase()}</p>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 px-6 py-4 text-xs">
        <p><span className="font-semibold">Employee:</span> {emp.name}</p>
        <p><span className="font-semibold">Employee ID:</span> {emp.id}</p>
        <p><span className="font-semibold">Position:</span> {emp.position}</p>
        <p><span className="font-semibold">Department:</span> {emp.department}</p>
        <p><span className="font-semibold">Status:</span> <span className={rec.status === 'paid' ? 'font-bold text-green-600' : 'font-bold text-amber-600'}>{rec.status.toUpperCase()}</span></p>
        <p><span className="font-semibold">Payment Date:</span> {rec.paidDate ?? '—'}</p>
      </div>
      <div className="px-6 pb-2">
        <p className="bg-stone-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-stone-600">Earnings</p>
        <Line label="Basic Salary" value={rec.basic} />
        <Line label="Allowances" value={rec.allowances} />
        <Line label="Overtime" value={rec.overtime} />
        <Line label="Bonus" value={rec.bonus} />
        <p className="bg-stone-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-stone-600">Deductions</p>
        <Line label="Advance" value={rec.advance} />
        <Line label="Other Deductions" value={rec.deductions} />
        <div className="flex items-center justify-between rounded-b-lg bg-orange-50 px-4 py-3">
          <span className="text-sm font-extrabold text-stone-900">NET SALARY</span>
          <span className="text-xl font-extrabold text-orange-700">{formatPKR(rec.net, sym)}</span>
        </div>
      </div>
      <div className="flex justify-between px-10 pb-8 pt-8 text-xs text-stone-500">
        <div className="w-40 border-t border-stone-400 pt-1 text-center">Employee Signature</div>
        <div className="w-40 border-t border-stone-400 pt-1 text-center">Authorized Signature</div>
      </div>
    </div>
  );
}
