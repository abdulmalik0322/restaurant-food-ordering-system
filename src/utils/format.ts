/** Small formatting helpers used across the app. */

export function formatPKR(n: number, symbol = 'Rs'): string {
  const v = Number.isFinite(n) ? n : 0;
  return `${symbol} ${Math.round(v).toLocaleString('en-PK')}`;
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return (
    d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ', ' +
    d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true })
  );
}

export function formatTime(hhmm: string | undefined): string {
  if (!hhmm) return '—';
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0);
  return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** Current date-time as a *local* ISO string (no timezone shift), e.g. for order timestamps. */
export function nowLocalISO(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${toISODate(d)}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function monthLabel(yyyyMm: string): string {
  const [y, m] = yyyyMm.split('-').map(Number);
  return new Date(y, (m || 1) - 1, 1).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' });
}

export function titleCase(s: string): string {
  return s
    .split(/[-_\s]+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/** Clamp a value into [min, max]. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
