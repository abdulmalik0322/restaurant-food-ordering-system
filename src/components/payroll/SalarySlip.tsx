import React from 'react'
import type { SalaryRecord, Employee, RestaurantSettings } from '../../types'
import { formatPKR, monthLabel, formatDate } from '../../utils/format'

interface Props {
  record: SalaryRecord
  employee: Employee
  settings: RestaurantSettings
}

const SalarySlip: React.FC<Props> = ({ record, employee, settings }) => (
  <div id="print-area" className="bg-white text-ink-900 max-w-[520px] mx-auto p-6 font-sans text-sm">
    <div className="text-center mb-4">
      <div className="text-3xl mb-1">{settings.logoEmoji}</div>
      <h2 className="font-display text-lg font-bold">{settings.name}</h2>
      <p className="text-xs text-ink-500">{settings.address}</p>
      <p className="font-medium text-ink-700 mt-2 text-sm">Salary Slip — {monthLabel(record.month)}</p>
    </div>
    <div className="border-t border-dashed border-ink-300 my-3" />
    <div className="grid grid-cols-2 gap-y-1 text-xs mb-3">
      <span className="text-ink-500">Employee Name</span><span className="text-right font-medium">{employee.fullName}</span>
      <span className="text-ink-500">Employee ID</span><span className="text-right font-medium">{employee.id}</span>
      <span className="text-ink-500">Position</span><span className="text-right font-medium">{employee.position}</span>
      <span className="text-ink-500">Salary Month</span><span className="text-right font-medium">{monthLabel(record.month)}</span>
    </div>
    <div className="border-t border-dashed border-ink-300 my-3" />
    <div className="space-y-1 text-xs">
      <Row label="Basic Salary" value={formatPKR(record.basicSalary)} />
      <Row label="Allowances" value={formatPKR(record.allowances)} />
      <Row label="Overtime" value={formatPKR(record.overtime)} />
      <Row label="Bonus" value={formatPKR(record.bonus)} />
      <Row label="Advance" value={`- ${formatPKR(record.advance)}`} />
      <Row label="Deductions" value={`- ${formatPKR(record.deductions)}`} />
      <div className="border-t border-ink-300 my-1.5" />
      <Row label="Net Salary" value={formatPKR(record.netSalary)} bold />
      <div className="border-t border-dashed border-ink-300 my-1.5" />
      <Row label="Payment Status" value={record.paymentStatus} />
      <Row label="Payment Date" value={record.paymentDate ? formatDate(record.paymentDate) : 'Pending'} />
    </div>
    <div className="grid grid-cols-2 gap-8 mt-10 text-xs text-center">
      <div><div className="border-t border-ink-400 pt-1">Employee Signature</div></div>
      <div><div className="border-t border-ink-400 pt-1">Authorized Signature</div></div>
    </div>
  </div>
)

const Row: React.FC<{ label: string; value: string; bold?: boolean }> = ({ label, value, bold }) => (
  <div className={`flex justify-between ${bold ? 'text-sm font-bold' : ''}`}>
    <span className={bold ? '' : 'text-ink-500'}>{label}</span>
    <span className={bold ? '' : 'font-medium'}>{value}</span>
  </div>
)

export default SalarySlip
