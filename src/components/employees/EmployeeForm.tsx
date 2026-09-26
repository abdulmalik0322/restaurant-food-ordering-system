import React, { useState } from 'react'
import type { Employee, EmployeePosition, SalaryType, EmployeeStatus } from '../../types'

const POSITIONS: EmployeePosition[] = ['Owner', 'Manager', 'HR', 'Accountant', 'Cashier', 'Waiter', 'Chef', 'Kitchen Staff', 'Delivery Rider', 'Cleaner', 'Security Guard', 'Other']
const SALARY_TYPES: SalaryType[] = ['Monthly', 'Daily', 'Weekly']
const STATUSES: EmployeeStatus[] = ['Active', 'On Leave', 'Inactive']

interface Props {
  initial?: Employee
  onSubmit: (data: Omit<Employee, 'id'>) => void
  onCancel: () => void
}

const EmployeeForm: React.FC<Props> = ({ initial, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    fullName: initial?.fullName ?? '',
    fatherName: initial?.fatherName ?? '',
    cnic: initial?.cnic ?? '',
    phone: initial?.phone ?? '',
    address: initial?.address ?? '',
    position: initial?.position ?? 'Waiter' as EmployeePosition,
    department: initial?.department ?? '',
    joiningDate: initial?.joiningDate ?? new Date().toISOString().slice(0, 10),
    salary: initial?.salary?.toString() ?? '',
    salaryType: initial?.salaryType ?? 'Monthly' as SalaryType,
    workingHours: initial?.workingHours ?? '',
    shift: initial?.shift ?? 'Day',
    status: initial?.status ?? 'Active' as EmployeeStatus,
    emergencyContact: initial?.emergencyContact ?? '',
  })
  const [error, setError] = useState('')

  const set = (patch: Partial<typeof form>) => setForm(prev => ({ ...prev, ...patch }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fullName.trim() || !form.phone.trim() || !form.cnic.trim()) {
      return setError('Full name, CNIC and phone number are required.')
    }
    if (!form.salary || Number(form.salary) < 0) return setError('Enter a valid salary amount.')
    setError('')
    onSubmit({ ...form, salary: Number(form.salary) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Full Name</label><input className="input" value={form.fullName} onChange={e => set({ fullName: e.target.value })} /></div>
        <div><label className="label">Father Name</label><input className="input" value={form.fatherName} onChange={e => set({ fatherName: e.target.value })} /></div>
        <div><label className="label">CNIC</label><input className="input" value={form.cnic} onChange={e => set({ cnic: e.target.value })} placeholder="xxxxx-xxxxxxx-x" /></div>
        <div><label className="label">Phone Number</label><input className="input" value={form.phone} onChange={e => set({ phone: e.target.value })} /></div>
      </div>
      <div><label className="label">Address</label><input className="input" value={form.address} onChange={e => set({ address: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Position</label>
          <select className="input" value={form.position} onChange={e => set({ position: e.target.value as EmployeePosition })}>
            {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div><label className="label">Department</label><input className="input" value={form.department} onChange={e => set({ department: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Joining Date</label><input type="date" className="input" value={form.joiningDate} onChange={e => set({ joiningDate: e.target.value })} /></div>
        <div><label className="label">Emergency Contact</label><input className="input" value={form.emergencyContact} onChange={e => set({ emergencyContact: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><label className="label">Salary (PKR)</label><input type="number" className="input" value={form.salary} onChange={e => set({ salary: e.target.value })} /></div>
        <div>
          <label className="label">Salary Type</label>
          <select className="input" value={form.salaryType} onChange={e => set({ salaryType: e.target.value as SalaryType })}>
            {SALARY_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={e => set({ status: e.target.value as EmployeeStatus })}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Working Hours</label><input className="input" value={form.workingHours} onChange={e => set({ workingHours: e.target.value })} placeholder="e.g. 11 AM - 11 PM" /></div>
        <div><label className="label">Shift</label><input className="input" value={form.shift} onChange={e => set({ shift: e.target.value })} placeholder="Day / Evening / Night" /></div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">{initial ? 'Save Changes' : 'Add Employee'}</button>
      </div>
    </form>
  )
}

export default EmployeeForm
