/** Real PDF downloads via jsPDF (invoice + salary slip). */
import { jsPDF } from 'jspdf';
import type { Employee, Order, PayrollRecord, Settings } from '../types';
import { invoiceNoFor } from '../api/db';
import { formatDateTime, monthLabel, titleCase } from './format';

const money = (n: number, sym: string) => `${sym} ${Math.round(n).toLocaleString('en-PK')}`;

function header(doc: jsPDF, s: Settings, title: string) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(s.restaurantName, 105, 18, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(`${s.address} | Phone: ${s.phone}`, 105, 25, { align: 'center' });
  doc.setTextColor(0);
  doc.setDrawColor(0);
  doc.line(14, 30, 196, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(title, 105, 38, { align: 'center' });
  return 44;
}

function kv(doc: jsPDF, label: string, value: string, x: number, y: number) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(label, x, y);
  doc.setFont('helvetica', 'normal');
  doc.text(value, x + doc.getTextWidth(label) + 2, y);
}

export function downloadInvoicePdf(order: Order, s: Settings): void {
  const doc = new jsPDF();
  let y = header(doc, s, 'TAX INVOICE');
  const invNo = invoiceNoFor(order.id);

  kv(doc, 'Invoice No:', invNo, 14, y);
  kv(doc, 'Order ID:', order.id, 110, y);
  y += 6;
  kv(doc, 'Date:', formatDateTime(order.date), 14, y);
  y += 6;
  kv(doc, 'Customer:', order.customerName, 14, y);
  kv(doc, 'Payment:', titleCase(order.paymentMethod), 110, y);
  y += 6;
  kv(doc, 'Type:', `${titleCase(order.type)}${order.tableNo ? ` (${order.tableNo})` : ''}`, 14, y);
  if (order.phone) kv(doc, 'Phone:', order.phone, 110, y);
  y += 10;

  // table header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Item', 14, y);
  doc.text('Qty', 130, y);
  doc.text('Price', 150, y, { align: 'right' });
  doc.text('Total', 196, y, { align: 'right' });
  y += 4;
  doc.line(14, y, 196, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  for (const it of order.items) {
    if (y > 255) { doc.addPage(); y = 20; }
    const name = it.name.length > 52 ? it.name.slice(0, 52) + '…' : it.name;
    doc.text(name, 14, y);
    doc.text(String(it.qty), 130, y);
    doc.text(money(it.price, s.currencySymbol), 150, y, { align: 'right' });
    doc.text(money(it.price * it.qty, s.currencySymbol), 196, y, { align: 'right' });
    y += 6;
  }
  doc.line(14, y - 2, 196, y - 2);
  y += 4;

  const totalRow = (label: string, val: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 12 : 10);
    doc.text(label, 120, y, { align: 'right' });
    doc.text(val, 196, y, { align: 'right' });
    y += bold ? 8 : 6;
  };
  totalRow('Subtotal:', money(order.subtotal, s.currencySymbol));
  if (order.discount > 0) totalRow('Discount:', `- ${money(order.discount, s.currencySymbol)}`);
  totalRow(`Tax (${s.taxPercent}%):`, money(order.tax, s.currencySymbol));
  totalRow(`Service Charge (${s.serviceChargePercent}%):`, money(order.serviceCharge, s.currencySymbol));
  totalRow('GRAND TOTAL:', money(order.total, s.currencySymbol), true);
  totalRow('Amount Paid:', money(order.amountPaid, s.currencySymbol));
  if (order.change > 0) totalRow('Change Returned:', money(order.change, s.currencySymbol));
  if (order.balance > 0) totalRow('Balance Due:', money(order.balance, s.currencySymbol));
  totalRow('Status:', order.status.toUpperCase());

  y += 8;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(s.invoiceFooter, 105, y, { align: 'center' });

  doc.save(`${invNo}.pdf`);
}

export function downloadSalarySlipPdf(rec: PayrollRecord, emp: Employee, s: Settings): void {
  const doc = new jsPDF();
  let y = header(doc, s, `SALARY SLIP — ${monthLabel(rec.month).toUpperCase()}`);

  kv(doc, 'Employee:', emp.name, 14, y);
  kv(doc, 'Employee ID:', emp.id, 110, y);
  y += 6;
  kv(doc, 'Position:', emp.position, 14, y);
  kv(doc, 'Department:', emp.department, 110, y);
  y += 6;
  kv(doc, 'Payment Date:', rec.paidDate ?? '—', 14, y);
  kv(doc, 'Status:', rec.status.toUpperCase(), 110, y);
  y += 10;

  const line = (label: string, val: number, bold = false, highlight = false) => {
    if (highlight) {
      doc.setFillColor(254, 243, 232);
      doc.rect(14, y - 5, 182, 9, 'F');
    }
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 12 : 10);
    doc.text(label, 16, y);
    doc.text(money(val, s.currencySymbol), 194, y, { align: 'right' });
    y += 8;
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Earnings', 14, y);
  y += 7;
  line('Basic Salary', rec.basic);
  line('Allowances', rec.allowances);
  line('Overtime', rec.overtime);
  line('Bonus', rec.bonus);
  y += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Deductions', 14, y);
  y += 7;
  line('Advance', rec.advance);
  line('Other Deductions', rec.deductions);
  y += 2;
  line('NET SALARY', rec.net, true, true);

  y += 24;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.line(20, y, 80, y);
  doc.line(130, y, 190, y);
  doc.text('Employee Signature', 50, y + 6, { align: 'center' });
  doc.text('Authorized Signature', 160, y + 6, { align: 'center' });

  doc.save(`salary-slip-${emp.id}-${rec.month}.pdf`);
}
