/** Standalone printable HTML builders for invoices and salary slips. */
import type { Employee, Order, PayrollRecord, Settings } from '../types';
import { invoiceNoFor } from '../api/db';
import { esc } from './print';
import { formatDateTime, monthLabel, titleCase } from './format';

const money = (n: number, sym: string) => `${sym} ${Math.round(n).toLocaleString('en-PK')}`;

export function buildInvoiceHtml(order: Order, s: Settings): string {
  const invNo = invoiceNoFor(order.id);
  const rows = order.items
    .map(
      (it, i) => `<tr>
        <td style="padding:5px 4px;border-bottom:1px dashed #ddd;">${i + 1}. ${esc(it.name)}${it.instructions ? `<br><span style="font-size:10px;color:#666;">Note: ${esc(it.instructions)}</span>` : ''}</td>
        <td style="text-align:center;padding:5px 4px;border-bottom:1px dashed #ddd;">${it.qty}</td>
        <td style="text-align:right;padding:5px 4px;border-bottom:1px dashed #ddd;">${money(it.price, s.currencySymbol)}</td>
        <td style="text-align:right;padding:5px 4px;border-bottom:1px dashed #ddd;">${money(it.price * it.qty, s.currencySymbol)}</td>
      </tr>`,
    )
    .join('');

  const totalRow = (label: string, val: string, bold = false) =>
    `<tr><td colspan="3" style="text-align:right;padding:4px;">${label}</td><td style="text-align:right;padding:4px;${bold ? 'font-weight:bold;font-size:15px;' : ''}">${val}</td></tr>`;

  return `
  <div style="max-width:340px;margin:0 auto;padding:10px;font-size:12px;line-height:1.5;">
    <div style="text-align:center;margin-bottom:6px;">
      <div style="font-size:18px;font-weight:bold;">${esc(s.restaurantName)}</div>
      <div style="color:#555;">${esc(s.address)}</div>
      <div style="color:#555;">Phone: ${esc(s.phone)}${s.email ? ' · ' + esc(s.email) : ''}</div>
    </div>
    <div style="border-top:2px dashed #333;margin:8px 0;"></div>
    <div style="text-align:center;font-size:14px;font-weight:bold;letter-spacing:2px;">TAX INVOICE</div>
    <table style="width:100%;margin:6px 0;font-size:12px;">
      <tr><td><b>Invoice No:</b> ${esc(invNo)}</td><td style="text-align:right;"><b>Order:</b> ${esc(order.id)}</td></tr>
      <tr><td colspan="2"><b>Date:</b> ${esc(formatDateTime(order.date))}</td></tr>
      <tr><td><b>Type:</b> ${esc(titleCase(order.type))}${order.tableNo ? ' · ' + esc(order.tableNo) : ''}</td><td style="text-align:right;"><b>Payment:</b> ${esc(titleCase(order.paymentMethod))}</td></tr>
    </table>
    <div style="border-top:2px dashed #333;margin:8px 0;"></div>
    <div style="margin-bottom:4px;"><b>Customer:</b> ${esc(order.customerName)}</div>
    ${order.phone ? `<div>Phone: ${esc(order.phone)}</div>` : ''}
    ${order.address ? `<div>Address: ${esc(order.address)}</div>` : ''}
    <div style="border-top:2px dashed #333;margin:8px 0;"></div>
    <table style="width:100%;border-collapse:collapse;font-size:12px;">
      <thead><tr style="border-bottom:2px solid #333;">
        <th style="text-align:left;padding:4px;">Item</th><th style="padding:4px;">Qty</th>
        <th style="text-align:right;padding:4px;">Price</th><th style="text-align:right;padding:4px;">Total</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot>
        ${totalRow('Subtotal:', money(order.subtotal, s.currencySymbol))}
        ${order.discount > 0 ? totalRow('Discount:', '− ' + money(order.discount, s.currencySymbol)) : ''}
        ${totalRow(`Tax (${s.taxPercent}%):`, money(order.tax, s.currencySymbol))}
        ${totalRow(`Service Charge (${s.serviceChargePercent}%):`, money(order.serviceCharge, s.currencySymbol))}
        ${totalRow('GRAND TOTAL:', money(order.total, s.currencySymbol), true)}
        ${totalRow('Amount Paid:', money(order.amountPaid, s.currencySymbol))}
        ${order.change > 0 ? totalRow('Change Returned:', money(order.change, s.currencySymbol)) : ''}
        ${order.balance > 0 ? totalRow('Balance Due:', money(order.balance, s.currencySymbol)) : ''}
        ${totalRow('Status:', order.status.toUpperCase())}
      </tfoot>
    </table>
    <div style="border-top:2px dashed #333;margin:8px 0;"></div>
    <div style="text-align:center;color:#555;">${esc(s.invoiceFooter)}</div>
    <div style="text-align:center;color:#999;font-size:10px;margin-top:4px;">Timings: ${esc(s.openingTime)} – ${esc(s.closingTime)} · Prices in ${esc(s.currency)}</div>
  </div>`;
}

export function buildSalarySlipHtml(rec: PayrollRecord, emp: Employee, s: Settings): string {
  const row = (label: string, val: number, bold = false) =>
    `<tr><td style="padding:7px 10px;border-bottom:1px solid #eee;">${label}</td>
     <td style="padding:7px 10px;border-bottom:1px solid #eee;text-align:right;${bold ? 'font-weight:bold;' : ''}">${money(val, s.currencySymbol)}</td></tr>`;
  return `
  <div style="max-width:640px;margin:20px auto;padding:24px;border:1px solid #ddd;font-size:13px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
    <div style="text-align:center;border-bottom:3px double #333;padding-bottom:12px;margin-bottom:16px;">
      <div style="font-size:20px;font-weight:bold;">${esc(s.restaurantName)}</div>
      <div style="color:#555;font-size:12px;">${esc(s.address)} · ${esc(s.phone)}</div>
      <div style="font-size:15px;font-weight:bold;margin-top:8px;letter-spacing:1px;">SALARY SLIP — ${esc(monthLabel(rec.month))}</div>
    </div>
    <table style="width:100%;margin-bottom:14px;font-size:13px;">
      <tr><td style="padding:3px 0;"><b>Employee:</b> ${esc(emp.name)}</td><td style="padding:3px 0;"><b>Employee ID:</b> ${esc(emp.id)}</td></tr>
      <tr><td style="padding:3px 0;"><b>Position:</b> ${esc(emp.position)}</td><td style="padding:3px 0;"><b>Department:</b> ${esc(emp.department)}</td></tr>
      <tr><td style="padding:3px 0;"><b>Salary Type:</b> ${esc(titleCase(emp.salaryType))}</td><td style="padding:3px 0;"><b>Payment Date:</b> ${esc(rec.paidDate ?? '—')}</td></tr>
    </table>
    <table style="width:100%;border-collapse:collapse;border:1px solid #ddd;">
      <tr style="background:#f5f5f5;"><th colspan="2" style="text-align:left;padding:8px 10px;">Earnings</th></tr>
      ${row('Basic Salary', rec.basic)}
      ${row('Allowances', rec.allowances)}
      ${row('Overtime', rec.overtime)}
      ${row('Bonus', rec.bonus)}
      <tr style="background:#f5f5f5;"><th colspan="2" style="text-align:left;padding:8px 10px;">Deductions</th></tr>
      ${row('Advance', rec.advance)}
      ${row('Other Deductions', rec.deductions)}
      <tr style="background:#fef3e8;"><td style="padding:10px;font-weight:bold;font-size:14px;">NET SALARY</td>
      <td style="padding:10px;text-align:right;font-weight:bold;font-size:16px;">${money(rec.net, s.currencySymbol)}</td></tr>
    </table>
    <div style="display:flex;justify-content:space-between;margin-top:40px;">
      <div style="text-align:center;width:40%;border-top:1px solid #333;padding-top:6px;">Employee Signature</div>
      <div style="text-align:center;width:40%;border-top:1px solid #333;padding-top:6px;">Authorized Signature</div>
    </div>
    <div style="text-align:center;color:#999;font-size:11px;margin-top:16px;">This is a computer-generated slip.</div>
  </div>`;
}

export function buildReportHtml(title: string, subtitle: string, bodyHtml: string, s: Settings): string {
  return `
  <div style="max-width:760px;margin:20px auto;padding:24px;font-size:13px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
    <div style="text-align:center;border-bottom:3px double #333;padding-bottom:12px;margin-bottom:16px;">
      <div style="font-size:20px;font-weight:bold;">${esc(s.restaurantName)}</div>
      <div style="color:#555;font-size:12px;">${esc(s.address)} · ${esc(s.phone)}</div>
      <div style="font-size:15px;font-weight:bold;margin-top:8px;">${esc(title)}</div>
      <div style="color:#555;font-size:12px;">${esc(subtitle)}</div>
    </div>
    ${bodyHtml}
    <div style="text-align:center;color:#999;font-size:11px;margin-top:20px;">Generated on ${esc(formatDateTime(new Date().toISOString()))}</div>
  </div>`;
}
