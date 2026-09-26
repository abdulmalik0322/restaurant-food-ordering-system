/** Print helper: renders standalone HTML in a hidden iframe and opens print dialog. */
export function printHtml(title: string, bodyHtml: string): void {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) {
    iframe.remove();
    return;
  }
  doc.open();
  doc.write(`<!doctype html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; }
  @media print { @page { margin: 8mm; } }
</style>
</head><body>${bodyHtml}</body></html>`);
  doc.close();

  const win = iframe.contentWindow;
  if (!win) {
    iframe.remove();
    return;
  }
  win.focus();
  setTimeout(() => {
    win.print();
    setTimeout(() => iframe.remove(), 1200);
  }, 300);
}

/** Escape user text embedded into generated HTML. */
export function esc(s: string | number | undefined | null): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c] as string);
}
