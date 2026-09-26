/** Reusable UI primitives: Modal, DataTable, SearchBar, EmptyState, Pagination,
 *  StatCard, Badge, Field, PageHeader, Toasts, ConfirmDialog. */
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Info, Search, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useStore } from '../store/StoreContext';

// ------------------------------------------------------------------ Modal --
export function Modal({
  open, onClose, title, children, footer, size = 'md',
}: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [open, onClose]);

  if (!open) return null;
  const widths = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`animate-zoom-in relative flex max-h-[92vh] w-full ${widths[size]} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h3 className="text-base font-bold text-stone-900">{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-stone-200 bg-stone-50 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

// ----------------------------------------------------------- ConfirmDialog --
export function ConfirmDialog() {
  const { confirmState, closeConfirm } = useStore();
  if (!confirmState?.open) return null;
  const { title, message, confirmText = 'Confirm', danger, onConfirm } = confirmState;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[2px]" onClick={closeConfirm} />
      <div className="animate-zoom-in relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${danger ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
          <AlertCircle size={24} />
        </div>
        <h3 className="mb-1 text-center text-base font-bold text-stone-900">{title}</h3>
        <p className="mb-5 text-center text-sm text-stone-500">{message}</p>
        <div className="flex gap-2">
          <button className="btn-secondary flex-1" onClick={closeConfirm}>Cancel</button>
          <button
            className={danger ? 'btn-danger flex-1' : 'btn-primary flex-1'}
            onClick={() => { closeConfirm(); onConfirm(); }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------- Toasts --
export function Toasts() {
  const { toasts, dismissToast } = useStore();
  const style = {
    success: 'border-green-200 bg-green-50 text-green-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  } as const;
  const Icon = { success: CheckCircle2, error: AlertCircle, info: Info } as const;
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[70] flex w-80 flex-col gap-2">
      {toasts.map((t) => {
        const I = Icon[t.type];
        return (
          <div key={t.id} className={`animate-toast-in pointer-events-auto flex items-start gap-2.5 rounded-xl border px-4 py-3 shadow-lg ${style[t.type]}`}>
            <I size={18} className="mt-0.5 shrink-0" />
            <p className="flex-1 text-sm font-medium">{t.msg}</p>
            <button onClick={() => dismissToast(t.id)} className="opacity-60 hover:opacity-100"><X size={15} /></button>
          </div>
        );
      })}
    </div>
  );
}

// --------------------------------------------------------------- DataTable --
export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns, data, rowKey, actions, emptyMessage = 'No records found.',
}: {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  actions?: (row: T) => ReactNode;
  emptyMessage?: string;
}) {
  if (data.length === 0) {
    return <div className="px-4 py-10 text-center text-sm text-stone-400">{emptyMessage}</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="tbl">
        <thead>
          <tr>
            {columns.map((c) => <th key={c.key} className={c.className}>{c.label}</th>)}
            {actions && <th className="text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((c) => (
                <td key={c.key} className={c.className}>
                  {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '—')}
                </td>
              ))}
              {actions && <td><div className="flex justify-end gap-1">{actions(row)}</div></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --------------------------------------------------------------- SearchBar --
export function SearchBar({ value, onChange, placeholder = 'Search…' }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
      <input
        className="input pl-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">
          <X size={15} />
        </button>
      )}
    </div>
  );
}

// -------------------------------------------------------------- EmptyState --
export function EmptyState({ icon: Icon, title, message, action }: {
  icon: LucideIcon; title: string; message: string; action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
        <Icon size={26} />
      </div>
      <h4 className="mb-1 text-base font-bold text-stone-800">{title}</h4>
      <p className="mb-4 max-w-sm text-sm text-stone-500">{message}</p>
      {action}
    </div>
  );
}

// -------------------------------------------------------------- Pagination --
export function Pagination({ page, pageSize, total, onChange }: {
  page: number; pageSize: number; total: number; onChange: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="flex items-center justify-between border-t border-stone-200 px-4 py-3">
      <p className="text-xs text-stone-500">Showing {from}–{to} of {total}</p>
      <div className="flex items-center gap-1">
        <button className="icon-btn" disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={16} /></button>
        <span className="px-2 text-xs font-semibold text-stone-600">{page} / {pages}</span>
        <button className="icon-btn" disabled={page >= pages} onClick={() => onChange(page + 1)}><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- StatCard --
const TONES: Record<string, string> = {
  orange: 'bg-orange-100 text-orange-600',
  green: 'bg-green-100 text-green-600',
  blue: 'bg-blue-100 text-blue-600',
  red: 'bg-red-100 text-red-600',
  purple: 'bg-purple-100 text-purple-600',
  amber: 'bg-amber-100 text-amber-600',
};

export function StatCard({ icon: Icon, label, value, sub, tone = 'orange', onClick }: {
  icon: LucideIcon; label: string; value: string; sub?: string; tone?: keyof typeof TONES; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`card animate-fade-up flex items-center gap-4 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-stone-500">{label}</p>
        <p className="truncate text-xl font-extrabold text-stone-900">{value}</p>
        {sub && <p className="truncate text-[11px] text-stone-400">{sub}</p>}
      </div>
    </button>
  );
}

// ------------------------------------------------------------------- Badge --
const BADGE_TONES: Record<string, string> = {
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-700',
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  gray: 'bg-stone-200/70 text-stone-600',
  orange: 'bg-orange-100 text-orange-700',
};

export function Badge({ tone = 'gray', children }: { tone?: keyof typeof BADGE_TONES; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${BADGE_TONES[tone]}`}>
      {children}
    </span>
  );
}

// ------------------------------------------------------------------- Field --
export function Field({ label, children, error, className = '' }: {
  label: string; children: ReactNode; error?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// -------------------------------------------------------------- PageHeader --
export function PageHeader({ title, subtitle, actions }: {
  title: string; subtitle?: string; actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
