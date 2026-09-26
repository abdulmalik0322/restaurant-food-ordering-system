/** Attendance page: mark daily attendance for active employees + monthly summary. */
import { useMemo, useState } from 'react';
import { CalendarX, CheckCircle2, Clock, UserCheck, UserX } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import type { AttendanceStatus, Employee } from '../types';
import { DataTable, Field, PageHeader, StatCard } from '../components/ui';
import { formatDate, monthLabel, todayISO } from '../utils/format';

interface SummaryRow {
  emp: Employee;
  present: number;
  late: number;
  leave: number;
  absent: number;
  pct: number;
}

const STATUS_ORDER: AttendanceStatus[] = ['present', 'late', 'leave', 'absent'];

const STATUS_META: Record<AttendanceStatus, { label: string; activeClass: string; idleClass: string }> = {
  present: { label: 'Present', activeClass: 'bg-green-600 text-white border-green-600', idleClass: 'text-green-700 border-green-200 hover:bg-green-50' },
  late: { label: 'Late', activeClass: 'bg-amber-500 text-white border-amber-500', idleClass: 'text-amber-700 border-amber-200 hover:bg-amber-50' },
  leave: { label: 'Leave', activeClass: 'bg-blue-600 text-white border-blue-600', idleClass: 'text-blue-700 border-blue-200 hover:bg-blue-50' },
  absent: { label: 'Absent', activeClass: 'bg-red-600 text-white border-red-600', idleClass: 'text-red-700 border-red-200 hover:bg-red-50' },
};

/** Count Mon–Fri days in a yyyy-mm month. */
function workingDaysInMonth(yyyyMm: string): number {
  const [y, m] = yyyyMm.split('-').map(Number);
  if (!y || !m) return 0;
  const daysInMonth = new Date(y, m, 0).getDate();
  let count = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(y, m - 1, d).getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

export default function AttendancePage() {
  const { data, notify, addRecord, updateRecord } = useStore();
  const [date, setDate] = useState(todayISO());
  const [sumMonth, setSumMonth] = useState(() => todayISO().slice(0, 7));

  const activeEmployees = useMemo<Employee[]>(
    () => (data ? data.employees.filter((e) => e.status === 'active') : []),
    [data],
  );

  const recFor = (employeeId: string) =>
    data?.attendance.find((a) => a.employeeId === employeeId && a.date === date);

  const dayCounts = useMemo(() => {
    const c: Record<AttendanceStatus, number> = { present: 0, late: 0, leave: 0, absent: 0 };
    if (!data) return c;
    data.attendance.filter((a) => a.date === date).forEach((a) => { c[a.status] += 1; });
    return c;
  }, [data, date]);

  const summary = useMemo<SummaryRow[]>(() => {
    if (!data) return [];
    const workingDays = workingDaysInMonth(sumMonth);
    return data.employees
      .filter((e) => e.status === 'active')
      .map((emp) => {
        const recs = data.attendance.filter((a) => a.employeeId === emp.id && a.date.startsWith(sumMonth));
        const count = (s: AttendanceStatus) => recs.filter((r) => r.status === s).length;
        const present = count('present');
        const late = count('late');
        const leave = count('leave');
        const absent = count('absent');
        const pct = workingDays > 0 ? Math.min(100, Math.round(((present + late) / workingDays) * 100)) : 0;
        return { emp, present, late, leave, absent, pct };
      });
  }, [data, sumMonth]);

  if (!data) return null;

  /** Insert or update the attendance row for (employeeId, date). */
  const upsert = (
    employeeId: string,
    patch: { checkIn?: string; checkOut?: string; status?: AttendanceStatus },
    silent = true,
  ) => {
    const existing = data.attendance.find((a) => a.employeeId === employeeId && a.date === date);
    if (existing) {
      updateRecord('attendance', existing.id, patch);
    } else {
      addRecord('attendance', {
        employeeId,
        date,
        checkIn: patch.checkIn ?? '',
        checkOut: patch.checkOut ?? '',
        status: patch.status ?? 'present',
      });
    }
    if (!silent) notify('Attendance saved', 'success');
  };

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Mark daily attendance and review the monthly summary."
        actions={
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Date">
              <input
                type="date"
                className="input w-44"
                value={date}
                max={todayISO()}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            <Field label="Summary Month">
              <input
                type="month"
                className="input w-44"
                value={sumMonth}
                onChange={(e) => setSumMonth(e.target.value)}
              />
            </Field>
          </div>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard icon={UserCheck} label="Present" value={String(dayCounts.present)} tone="green" sub={formatDate(date)} />
        <StatCard icon={Clock} label="Late" value={String(dayCounts.late)} tone="amber" sub={formatDate(date)} />
        <StatCard icon={CalendarX} label="Leave" value={String(dayCounts.leave)} tone="blue" sub={formatDate(date)} />
        <StatCard icon={UserX} label="Absent" value={String(dayCounts.absent)} tone="red" sub={formatDate(date)} />
      </div>

      <div className="card mb-5 p-4">
        <h3 className="mb-3 text-sm font-bold text-stone-800">
          Daily Marking — {formatDate(date)}
          <span className="ml-2 font-medium text-stone-400">({activeEmployees.length} active employees · saves automatically)</span>
        </h3>
        {activeEmployees.length === 0 ? (
          <p className="py-8 text-center text-sm text-stone-400">No active employees to mark.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeEmployees.map((emp) => {
                  const rec = recFor(emp.id);
                  return (
                    <tr key={emp.id}>
                      <td>
                        <p className="font-semibold text-stone-900">{emp.name}</p>
                        <p className="text-xs text-stone-400">{emp.id} · {emp.position}</p>
                      </td>
                      <td>
                        <input
                          type="time"
                          className="input w-32"
                          value={rec?.checkIn ?? ''}
                          onChange={(e) => upsert(emp.id, { checkIn: e.target.value })}
                          aria-label={`Check-in for ${emp.name}`}
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          className="input w-32"
                          value={rec?.checkOut ?? ''}
                          onChange={(e) => upsert(emp.id, { checkOut: e.target.value })}
                          aria-label={`Check-out for ${emp.name}`}
                        />
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1.5">
                          {STATUS_ORDER.map((s) => {
                            const meta = STATUS_META[s];
                            const isActive = rec?.status === s;
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => upsert(emp.id, { status: s }, false)}
                                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${isActive ? meta.activeClass : `bg-white ${meta.idleClass}`}`}
                              >
                                {meta.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card p-4">
        <h3 className="mb-3 text-sm font-bold text-stone-800">
          Monthly Summary — {monthLabel(sumMonth)}
          <span className="ml-2 font-medium text-stone-400">(attendance % = (Present + Late) ÷ working days)</span>
        </h3>
        <DataTable<SummaryRow>
          columns={[
            {
              key: 'emp', label: 'Employee',
              render: (r) => (
                <div>
                  <p className="font-bold text-stone-900">{r.emp.name}</p>
                  <p className="text-xs text-stone-400">{r.emp.id}</p>
                </div>
              ),
            },
            { key: 'present', label: 'Present', render: (r) => <span className="font-semibold text-green-700">{r.present}</span> },
            { key: 'late', label: 'Late', render: (r) => <span className="font-semibold text-amber-700">{r.late}</span> },
            { key: 'leave', label: 'Leave', render: (r) => <span className="font-semibold text-blue-700">{r.leave}</span> },
            { key: 'absent', label: 'Absent', render: (r) => <span className="font-semibold text-red-700">{r.absent}</span> },
            {
              key: 'pct', label: 'Attendance %',
              render: (r) => (
                <div className="flex min-w-36 items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full rounded-full bg-green-500" style={{ width: `${r.pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-stone-700">{r.pct}%</span>
                </div>
              ),
            },
          ]}
          data={summary}
          rowKey={(r) => r.emp.id}
          emptyMessage="No active employees."
        />
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-stone-400">
        <CheckCircle2 size={14} /> Attendance records are stored in your browser and persist across refreshes.
      </p>
    </div>
  );
}
