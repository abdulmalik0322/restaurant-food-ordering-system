/** Employees page: list, search/filter, full profile view, add/edit/delete. */
import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Banknote, Clock, Eye, Pencil, Plus, Trash2, UserCheck, Users } from 'lucide-react';
import { EMPLOYEE_POSITIONS } from '../types';
import type { Employee } from '../types';
import { useStore } from '../store/StoreContext';
import { Badge, DataTable, Field, Modal, PageHeader, Pagination, SearchBar, StatCard } from '../components/ui';
import { formatDate, formatPKR, titleCase, todayISO } from '../utils/format';

interface EmployeeFormState {
  name: string;
  fatherName: string;
  cnic: string;
  phone: string;
  address: string;
  position: string;
  department: string;
  joiningDate: string;
  salary: string;
  salaryType: string;
  workingHours: string;
  shift: string;
  status: string;
  emergencyContact: string;
}

const defaultForm = (): EmployeeFormState => ({
  name: '', fatherName: '', cnic: '', phone: '', address: '',
  position: '', department: '', joiningDate: todayISO(), salary: '',
  salaryType: 'monthly', workingHours: '', shift: '', status: 'active', emergencyContact: '',
});

const PAGE_SIZE = 10;

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-stone-50 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">{label}</p>
      <p className="text-sm font-medium text-stone-800">{value || '—'}</p>
    </div>
  );
}

const statusTone = (s: Employee['status']) => (s === 'active' ? 'green' : s === 'on-leave' ? 'amber' : 'gray');

export default function EmployeesPage() {
  const { data, notify, confirm, addRecord, updateRecord, deleteRecord } = useStore();
  const [query, setQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeFormState>(defaultForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [viewing, setViewing] = useState<Employee | null>(null);

  const stats = useMemo(() => {
    if (!data) return { total: 0, active: 0, onLeave: 0, salaryCost: 0 };
    return {
      total: data.employees.length,
      active: data.employees.filter((e) => e.status === 'active').length,
      onLeave: data.employees.filter((e) => e.status === 'on-leave').length,
      salaryCost: data.employees
        .filter((e) => e.status === 'active' && e.salaryType === 'monthly')
        .reduce((s, e) => s + e.salary, 0),
    };
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.employees.filter((e) => {
      if (positionFilter !== 'all' && e.position !== positionFilter) return false;
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      if (!q) return true;
      return (e.name + ' ' + e.phone + ' ' + e.id + ' ' + e.position).toLowerCase().includes(q);
    });
  }, [data, query, positionFilter, statusFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!data) return null;

  const resetPage = () => setPage(1);

  const set = (k: keyof EmployeeFormState) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: '' }));
  };

  const openForm = (emp?: Employee) => {
    setEditing(emp ?? null);
    setForm(emp
      ? {
        name: emp.name, fatherName: emp.fatherName, cnic: emp.cnic, phone: emp.phone,
        address: emp.address, position: emp.position, department: emp.department,
        joiningDate: emp.joiningDate, salary: String(emp.salary), salaryType: emp.salaryType,
        workingHours: emp.workingHours, shift: emp.shift, status: emp.status,
        emergencyContact: emp.emergencyContact,
      }
      : defaultForm());
    setErrors({});
    setFormOpen(true);
  };

  const validate = () => {
    const er: Record<string, string> = {};
    if (!form.name.trim()) er.name = 'Full name is required';
    if (!form.phone.trim()) er.phone = 'Phone is required';
    if (!form.position) er.position = 'Position is required';
    const salary = Number(form.salary);
    if (!form.salary.trim() || !Number.isFinite(salary) || salary <= 0) er.salary = 'Enter a valid salary above 0';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const patch = {
      name: form.name.trim(),
      fatherName: form.fatherName.trim(),
      cnic: form.cnic.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      position: form.position as Employee['position'],
      department: form.department.trim(),
      joiningDate: form.joiningDate,
      salary: Number(form.salary),
      salaryType: form.salaryType as Employee['salaryType'],
      workingHours: form.workingHours.trim(),
      shift: form.shift.trim(),
      status: form.status as Employee['status'],
      emergencyContact: form.emergencyContact.trim(),
    };
    if (editing) {
      updateRecord('employees', editing.id, patch);
      notify('Employee updated', 'success');
    } else {
      addRecord('employees', patch);
      notify('Employee added', 'success');
    }
    setFormOpen(false);
  };

  const remove = (emp: Employee) =>
    confirm({
      title: 'Delete Employee',
      message: `Delete ${emp.name} (${emp.id})? This cannot be undone.`,
      danger: true,
      confirmText: 'Delete',
      onConfirm: () => {
        deleteRecord('employees', emp.id);
        notify('Employee deleted', 'info');
      },
    });

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle="Manage staff records across all positions."
        actions={
          <button className="btn-primary" onClick={() => openForm()}>
            <Plus size={16} /> Add Employee
          </button>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total Employees" value={String(stats.total)} tone="orange" />
        <StatCard icon={UserCheck} label="Active" value={String(stats.active)} tone="green" />
        <StatCard icon={Clock} label="On Leave" value={String(stats.onLeave)} tone="amber" />
        <StatCard icon={Banknote} label="Monthly Salary Cost" value={formatPKR(stats.salaryCost)} tone="blue" />
      </div>

      <div className="card p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <div className="min-w-56 flex-1">
            <SearchBar value={query} onChange={(v) => { setQuery(v); resetPage(); }} placeholder="Search name, phone, ID…" />
          </div>
          <select className="input w-44" value={positionFilter} onChange={(e) => { setPositionFilter(e.target.value); resetPage(); }}>
            <option value="all">All Positions</option>
            {EMPLOYEE_POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="input w-40" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="on-leave">On Leave</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <DataTable<Employee>
          columns={[
            { key: 'id', label: 'Employee ID', render: (e) => <span className="text-xs font-semibold text-stone-500">{e.id}</span> },
            {
              key: 'name', label: 'Name',
              render: (e) => (
                <div>
                  <p className="font-bold text-stone-900">{e.name}</p>
                  {e.fatherName && <p className="text-xs text-stone-400">S/O {e.fatherName}</p>}
                </div>
              ),
            },
            { key: 'position', label: 'Position', render: (e) => <Badge tone="blue">{e.position}</Badge> },
            { key: 'phone', label: 'Phone' },
            { key: 'salary', label: 'Salary', render: (e) => <span className="font-bold">{formatPKR(e.salary)}</span> },
            { key: 'shift', label: 'Shift', render: (e) => e.shift || '—' },
            {
              key: 'status', label: 'Status',
              render: (e) => <Badge tone={statusTone(e.status)}>{titleCase(e.status)}</Badge>,
            },
          ]}
          data={paged}
          rowKey={(e) => e.id}
          actions={(e) => (
            <>
              <button className="icon-btn" title="View profile" onClick={() => setViewing(e)}><Eye size={16} /></button>
              <button className="icon-btn" title="Edit" onClick={() => openForm(e)}><Pencil size={16} /></button>
              <button className="icon-btn hover:!bg-red-50 hover:!text-red-600" title="Delete" onClick={() => remove(e)}><Trash2 size={16} /></button>
            </>
          )}
        />
        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} />
      </div>

      {/* Add / Edit modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit Employee' : 'Add Employee'}
        size="lg"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setFormOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={save}>{editing ? 'Save Changes' : 'Add Employee'}</button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full Name *" error={errors.name}>
            <input className="input" value={form.name} onChange={set('name')} placeholder="e.g. Imran Ahmed" />
          </Field>
          <Field label="Father Name">
            <input className="input" value={form.fatherName} onChange={set('fatherName')} placeholder="e.g. Ahmed Khan" />
          </Field>
          <Field label="CNIC">
            <input className="input" value={form.cnic} onChange={set('cnic')} placeholder="e.g. 14301-1234567-8" />
          </Field>
          <Field label="Phone Number *">
            <input className="input" value={form.phone} onChange={set('phone')} placeholder="e.g. 0333-1234567" />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <input className="input" value={form.address} onChange={set('address')} placeholder="House, street, area" />
          </Field>
          <Field label="Position *" error={errors.position}>
            <select className="input" value={form.position} onChange={set('position')}>
              <option value="">Select position…</option>
              {EMPLOYEE_POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Department">
            <input className="input" value={form.department} onChange={set('department')} placeholder="e.g. Kitchen" />
          </Field>
          <Field label="Joining Date">
            <input type="date" className="input" value={form.joiningDate} onChange={set('joiningDate')} />
          </Field>
          <Field label="Salary (PKR) *" error={errors.salary}>
            <input type="number" min={0} className="input" value={form.salary} onChange={set('salary')} placeholder="e.g. 35000" />
          </Field>
          <Field label="Salary Type">
            <select className="input" value={form.salaryType} onChange={set('salaryType')}>
              <option value="monthly">Monthly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </Field>
          <Field label="Status">
            <select className="input" value={form.status} onChange={set('status')}>
              <option value="active">Active</option>
              <option value="on-leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
          <Field label="Working Hours">
            <input className="input" value={form.workingHours} onChange={set('workingHours')} placeholder="e.g. 9:00 AM – 6:00 PM" />
          </Field>
          <Field label="Shift">
            <input className="input" value={form.shift} onChange={set('shift')} placeholder="e.g. Morning" />
          </Field>
          <Field label="Emergency Contact">
            <input className="input" value={form.emergencyContact} onChange={set('emergencyContact')} placeholder="Name / phone" />
          </Field>
        </div>
      </Modal>

      {/* Profile modal */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Employee Profile" size="lg">
        {viewing && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <InfoRow label="Employee ID" value={viewing.id} />
            <InfoRow label="Full Name" value={viewing.name} />
            <InfoRow label="Father Name" value={viewing.fatherName} />
            <InfoRow label="CNIC" value={viewing.cnic} />
            <InfoRow label="Phone" value={viewing.phone} />
            <InfoRow label="Address" value={viewing.address} />
            <InfoRow label="Position" value={viewing.position} />
            <InfoRow label="Department" value={viewing.department} />
            <InfoRow label="Joining Date" value={formatDate(viewing.joiningDate)} />
            <InfoRow label="Salary" value={formatPKR(viewing.salary)} />
            <InfoRow label="Salary Type" value={titleCase(viewing.salaryType)} />
            <InfoRow label="Working Hours" value={viewing.workingHours} />
            <InfoRow label="Shift" value={viewing.shift} />
            <InfoRow label="Status" value={titleCase(viewing.status)} />
            <InfoRow label="Emergency Contact" value={viewing.emergencyContact} />
          </div>
        )}
      </Modal>
    </div>
  );
}
