/** Payroll page: generate monthly payroll, edit components, mark paid/pending,
 *  print/download salary slips. */
import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Check, Clock, Download, Pencil, Printer, Receipt, Trash2, Users, Wallet } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import type { Employee, PayrollRecord } from '../types';
import { Badge, DataTable, Field, Modal, PageHeader, StatCard } from '../components/ui';
import { SalarySlipView } from '../components/SalarySlipView';
import { printHtml } from '../utils/print';
import { buildSalarySlipHtml } from '../utils/documents';
import { downloadSalarySlipPdf } from '../utils/pdf';
import { formatDate, formatPKR, monthLabel, todayISO } from '../utils/format';

interface RowData {
  rec: PayrollRecord;
  emp: Employee | undefined;
}

interface EditVals {
  basic: string;
  allowances: string;
  overtime: string;
  bonus: string;
  advance: string;
  deductions: string;
}

const num = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

export default function PayrollPage() {
  const { data, notify, confirm, updateRecord, deleteRecord, generatePayroll } = useStore();
  const [month, setMonth] = useState(() => todayISO().slice(0, 7));
  const [editRec, setEditRec] = useState<PayrollRecord | null>(null);
  const [editVals, setEditVals] = useState<EditVals>({ basic: '0', allowances: '0', overtime: '0', bonus: '0', advance: '0', deductions: '0' });
  const [slipRec, setSlipRec] = useState<PayrollRecord | null>(null);

  const rows = useMemo<RowData[]>(() => {
    if (!data) return [];
    return data.payroll
      .filter((p) => p.month === month)
      .map((rec) => ({ rec, emp: data.employees.find((e) => e.id === rec.employeeId) }));
  }, [data, month]);

  const stats = useMemo(() => {
    if (!data) return { total: 0, paid: 0, pending: 0, count: 0 };
    const list = data.payroll.filter((p) => p.month === month);
    return {
      total: list.reduce((s, r) => s + r.net, 0),
      paid: list.filter((r) => r.status === 'paid').reduce((s, r) => s + r.net, 0),
      pending: list.filter((r) => r.status === 'pending').reduce((s, r) => s + r.net, 0),
      count: list.length,
    };
  }, [data, month]);

  const slipEmp = useMemo(
    () => (data && slipRec ? data.employees.find((e) => e.id === slipRec.employeeId) : undefined),
    [data, slipRec],
  );

  if (!data) return null;

  const netPreview = (v: EditVals) =>
    num(v.basic) + num(v.allowances) + num(v.overtime) + num(v.bonus) - num(v.advance) - num(v.deductions);

  const handleGenerate = () => {
    const n = generatePayroll(month);
    notify(
      n > 0 ? `${n} payroll record${n > 1 ? 's' : ''} generated for ${monthLabel(month)}` : 'Payroll already exists for this month',
      n > 0 ? 'success' : 'info',
    );
  };

  const editField = (k: keyof EditVals) => (e: ChangeEvent<HTMLInputElement>) =>
    setEditVals((v) => ({ ...v, [k]: e.target.value }));

  const openEdit = (rec: PayrollRecord) => {
    setEditRec(rec);
    setEditVals({
      basic: String(rec.basic), allowances: String(rec.allowances), overtime: String(rec.overtime),
      bonus: String(rec.bonus), advance: String(rec.advance), deductions: String(rec.deductions),
    });
  };

  const saveEdit = () => {
    if (!editRec) return;
    const patch = {
      basic: num(editVals.basic), allowances: num(editVals.allowances), overtime: num(editVals.overtime),
      bonus: num(editVals.bonus), advance: num(editVals.advance), deductions: num(editVals.deductions),
      net: netPreview(editVals),
    };
    updateRecord('payroll', editRec.id, patch);
    notify('Payroll updated', 'success');
    setEditRec(null);
  };

  const markPaid = (rec: PayrollRecord) => {
    updateRecord('payroll', rec.id, { status: 'paid', paidDate: todayISO() });
    notify('Salary marked as paid', 'success');
  };

  const markPending = (rec: PayrollRecord) => {
    updateRecord('payroll', rec.id, { status: 'pending', paidDate: undefined });
    notify('Salary marked as pending', 'info');
  };

  const remove = (rec: PayrollRecord) =>
    confirm({
      title: 'Delete Payroll Record',
      message: `Delete the payroll record for ${monthLabel(rec.month)}? This cannot be undone.`,
      danger: true,
      confirmText: 'Delete',
      onConfirm: () => {
        deleteRecord('payroll', rec.id);
        notify('Payroll record deleted', 'info');
      },
    });

  const handlePrintSlip = () => {
    if (!slipRec || !slipEmp) return;
    printHtml(`Salary Slip — ${slipEmp.name} — ${monthLabel(slipRec.month)}`, buildSalarySlipHtml(slipRec, slipEmp, data.settings));
  };

  const handlePdfSlip = () => {
    if (!slipRec || !slipEmp) return;
    downloadSalarySlipPdf(slipRec, slipEmp, data.settings);
    notify('Salary slip downloaded', 'success');
  };

  const moneyCell = (v: number) => formatPKR(v);

  return (
    <div>
      <PageHeader
        title="Salaries & Payroll"
        subtitle={`Payroll for ${monthLabel(month)} — Net = Basic + Allowances + Overtime + Bonus − Advance − Deductions.`}
        actions={
          <>
            <input
              type="month"
              className="input w-44"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              aria-label="Payroll month"
            />
            <button className="btn-primary" onClick={handleGenerate}>
              <Wallet size={16} /> Generate Payroll
            </button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wallet} label="Total Payroll" value={formatPKR(stats.total)} tone="orange" />
        <StatCard icon={Check} label="Paid" value={formatPKR(stats.paid)} tone="green" />
        <StatCard icon={Clock} label="Pending" value={formatPKR(stats.pending)} tone="amber" />
        <StatCard icon={Users} label="Employees" value={String(stats.count)} tone="blue" />
      </div>

      <div className="card p-4">
        <DataTable<RowData>
          columns={[
            {
              key: 'id', label: 'Employee ID',
              render: ({ emp }) => <span className="text-xs font-semibold text-stone-500">{emp?.id ?? '—'}</span>,
            },
            {
              key: 'name', label: 'Name',
              render: ({ emp }) => <span className="font-bold text-stone-900">{emp?.name ?? '—'}</span>,
            },
            { key: 'position', label: 'Position', render: ({ emp }) => emp?.position ?? '—' },
            { key: 'basic', label: 'Basic', render: ({ rec }) => moneyCell(rec.basic) },
            { key: 'allowances', label: 'Allowances', render: ({ rec }) => moneyCell(rec.allowances) },
            { key: 'overtime', label: 'Overtime', render: ({ rec }) => moneyCell(rec.overtime) },
            { key: 'bonus', label: 'Bonus', render: ({ rec }) => moneyCell(rec.bonus) },
            { key: 'advance', label: 'Advance', render: ({ rec }) => moneyCell(rec.advance) },
            { key: 'deductions', label: 'Deductions', render: ({ rec }) => moneyCell(rec.deductions) },
            {
              key: 'net', label: 'Net Salary',
              render: ({ rec }) => <span className="font-extrabold text-orange-700">{formatPKR(rec.net)}</span>,
            },
            {
              key: 'status', label: 'Payment Status',
              render: ({ rec }) => <Badge tone={rec.status === 'paid' ? 'green' : 'amber'}>{rec.status === 'paid' ? 'Paid' : 'Pending'}</Badge>,
            },
            {
              key: 'paidDate', label: 'Payment Date',
              render: ({ rec }) => <span className="whitespace-nowrap">{rec.paidDate ? formatDate(rec.paidDate) : '—'}</span>,
            },
          ]}
          data={rows}
          rowKey={({ rec }) => rec.id}
          emptyMessage={`No payroll records for ${monthLabel(month)}. Click "Generate Payroll" to create them.`}
          actions={({ rec }) => (
            <>
              <button className="icon-btn" title="Edit components" onClick={() => openEdit(rec)}><Pencil size={16} /></button>
              {rec.status === 'pending' ? (
                <button className="icon-btn hover:!bg-green-50 hover:!text-green-600" title="Mark as paid" onClick={() => markPaid(rec)}><Check size={16} /></button>
              ) : (
                <button className="icon-btn hover:!bg-amber-50 hover:!text-amber-600" title="Mark as pending" onClick={() => markPending(rec)}><Clock size={16} /></button>
              )}
              <button className="icon-btn" title="Salary slip" onClick={() => setSlipRec(rec)}><Receipt size={16} /></button>
              <button className="icon-btn hover:!bg-red-50 hover:!text-red-600" title="Delete" onClick={() => remove(rec)}><Trash2 size={16} /></button>
            </>
          )}
        />
      </div>

      {/* Edit components modal */}
      <Modal
        open={!!editRec}
        onClose={() => setEditRec(null)}
        title="Edit Payroll Components"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setEditRec(null)}>Cancel</button>
            <button className="btn-primary" onClick={saveEdit}>Save Changes</button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Basic Salary">
            <input type="number" min={0} className="input" value={editVals.basic} onChange={editField('basic')} />
          </Field>
          <Field label="Allowances">
            <input type="number" min={0} className="input" value={editVals.allowances} onChange={editField('allowances')} />
          </Field>
          <Field label="Overtime">
            <input type="number" min={0} className="input" value={editVals.overtime} onChange={editField('overtime')} />
          </Field>
          <Field label="Bonus">
            <input type="number" min={0} className="input" value={editVals.bonus} onChange={editField('bonus')} />
          </Field>
          <Field label="Advance">
            <input type="number" min={0} className="input" value={editVals.advance} onChange={editField('advance')} />
          </Field>
          <Field label="Deductions">
            <input type="number" min={0} className="input" value={editVals.deductions} onChange={editField('deductions')} />
          </Field>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-orange-50 px-4 py-3">
          <span className="text-sm font-bold text-stone-800">Net Salary (auto-calculated)</span>
          <span className="text-xl font-extrabold text-orange-700">{formatPKR(netPreview(editVals))}</span>
        </div>
      </Modal>

      {/* Salary slip modal */}
      <Modal
        open={!!slipRec}
        onClose={() => setSlipRec(null)}
        title="Salary Slip"
        size="lg"
        footer={
          slipRec && slipEmp ? (
            <>
              <button className="btn-ghost" onClick={() => setSlipRec(null)}>Close</button>
              <button className="btn-secondary btn-sm" onClick={handlePrintSlip}><Printer size={15} /> Print</button>
              <button className="btn-primary btn-sm" onClick={handlePdfSlip}><Download size={15} /> Download PDF</button>
            </>
          ) : undefined
        }
      >
        {slipRec && slipEmp && (
          <SalarySlipView rec={slipRec} emp={slipEmp} settings={data.settings} />
        )}
        {slipRec && !slipEmp && (
          <p className="py-8 text-center text-sm text-stone-500">Employee record not found for this payroll entry.</p>
        )}
      </Modal>
    </div>
  );
}
