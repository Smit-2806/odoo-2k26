import React, { useState } from 'react';
import { useProcurementStore } from '../../store/procurementStore';
import type { Invoice } from '../../store/procurementStore';
import {
  Receipt, CheckCircle, Clock, AlertTriangle,
  DollarSign, ShieldCheck, Filter, Download
} from 'lucide-react';

type InvoiceTab = 'ALL' | 'SUBMITTED' | 'APPROVED' | 'PAID' | 'REJECTED';

// ─── Invoice Status Badge ─────────────────────────────────────
const statusConfig: Record<string, { cls: string; label: string }> = {
  SUBMITTED: { cls: 'badge badge-submitted', label: 'Awaiting' },
  APPROVED:  { cls: 'badge badge-approved',  label: 'Approved' },
  PAID:      { cls: 'badge badge-paid',       label: 'Paid' },
  REJECTED:  { cls: 'badge badge-rejected',   label: 'Rejected' },
};

// ─── Invoice Row ──────────────────────────────────────────────
const InvoiceRow: React.FC<{
  invoice: Invoice;
  onMarkPaid: (id: string) => void;
}> = ({ invoice, onMarkPaid }) => {
  const isOverdue =
    invoice.status === 'SUBMITTED' &&
    new Date(invoice.dueDate) < new Date();

  return (
    <tr className="group">
      <td>
        <div>
          <p className="font-semibold text-slate-200 text-sm font-mono">{invoice.invoiceNumber}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">PO: {invoice.purchaseOrderNumber}</p>
        </div>
      </td>
      <td>
        <span className="text-sm text-slate-300 font-medium">{invoice.vendorName}</span>
      </td>
      <td>
        <p className="font-bold text-slate-200 text-sm font-mono">
          ₹{invoice.amount.toLocaleString('en-IN')}
        </p>
      </td>
      <td>
        <p className="text-xs text-slate-400 font-mono">{invoice.invoiceDate}</p>
      </td>
      <td>
        <p className={`text-xs font-mono font-semibold ${isOverdue ? 'text-rose-400' : 'text-slate-400'}`}>
          {invoice.dueDate}
          {isOverdue && <span className="ml-1 text-[9px] text-rose-400">(OVERDUE)</span>}
        </p>
      </td>
      <td className="text-center">
        <span className={statusConfig[invoice.status]?.cls || 'badge badge-draft'}>
          {statusConfig[invoice.status]?.label || invoice.status}
        </span>
      </td>
      <td className="text-right pr-6">
        {invoice.status === 'SUBMITTED' ? (
          <button
            onClick={() => onMarkPaid(invoice.id)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-600/80 hover:bg-emerald-500 text-white transition-all ml-auto"
          >
            <CheckCircle className="h-3 w-3" /> Mark Paid
          </button>
        ) : invoice.status === 'PAID' ? (
          <div className="flex items-center gap-1 justify-end text-emerald-400 text-[10px] font-bold">
            <ShieldCheck className="h-3.5 w-3.5" /> Cleared
          </div>
        ) : (
          <span className="text-[10px] text-slate-600">—</span>
        )}
      </td>
    </tr>
  );
};

// ─── Main Invoices Page ───────────────────────────────────────
export const Invoices: React.FC = () => {
  const { invoices, markInvoicePaid } = useProcurementStore();
  const [activeTab, setActiveTab] = useState<InvoiceTab>('ALL');

  const handleMarkPaid = (id: string) => {
    markInvoicePaid(id);
  };

  const filtered = invoices.filter((inv) => {
    if (activeTab === 'ALL') return true;
    return inv.status === activeTab;
  });

  // Metrics
  const totalAmount   = invoices.reduce((sum, i) => sum + i.amount, 0);
  const paidCount     = invoices.filter(i => i.status === 'PAID').length;
  const pendingCount  = invoices.filter(i => i.status === 'SUBMITTED').length;
  const overdueCount  = invoices.filter(
    i => i.status === 'SUBMITTED' && new Date(i.dueDate) < new Date()
  ).length;

  const tabs: { key: InvoiceTab; label: string }[] = [
    { key: 'ALL',       label: `All (${invoices.length})` },
    { key: 'SUBMITTED', label: `Pending (${pendingCount})` },
    { key: 'APPROVED',  label: `Approved` },
    { key: 'PAID',      label: `Paid (${paidCount})` },
    { key: 'REJECTED',  label: `Rejected` },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ─── Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Invoices</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Track invoice statuses, manage payment releases, and audit payment history
          </p>
        </div>
        <button
          onClick={() => alert('Exporting invoice report as PDF…')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all"
        >
          <Download className="h-3.5 w-3.5 text-purple-400" />
          Export PDF
        </button>
      </div>

      {/* ─── Metric Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Invoice Value',
            value: `₹${(totalAmount / 100000).toFixed(1)}L`,
            icon: <DollarSign className="h-5 w-5" />,
            cls: 'text-purple-400 bg-purple-500/10',
            border: 'border-purple-500/20',
          },
          {
            label: 'Pending Payment',
            value: pendingCount,
            icon: <Clock className="h-5 w-5" />,
            cls: 'text-amber-400 bg-amber-500/10',
            border: 'border-amber-500/20',
          },
          {
            label: 'Paid / Cleared',
            value: paidCount,
            icon: <CheckCircle className="h-5 w-5" />,
            cls: 'text-emerald-400 bg-emerald-500/10',
            border: 'border-emerald-500/20',
          },
          {
            label: 'Overdue',
            value: overdueCount,
            icon: <AlertTriangle className="h-5 w-5" />,
            cls: 'text-rose-400 bg-rose-500/10',
            border: 'border-rose-500/20',
          },
        ].map(({ label, value, icon, cls, border }) => (
          <div
            key={label}
            className={`p-5 bg-slate-900/40 border rounded-2xl flex items-center justify-between ${border}`}
          >
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{label}</p>
              <p className={`text-2xl font-black mt-1.5 ${cls.split(' ')[0]}`}>{value}</p>
            </div>
            <div className={`p-2.5 rounded-xl ${cls}`}>{icon}</div>
          </div>
        ))}
      </div>

      {/* ─── Tab Filters + Filter ────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-0 border-b border-slate-800">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === key
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/50 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors">
          <Filter className="h-3.5 w-3.5" /> Filter
        </button>
      </div>

      {/* ─── Invoices Table ───────────────────────────────── */}
      <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="vb-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Invoice Date</th>
                <th>Due Date</th>
                <th className="text-center">Status</th>
                <th className="text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Receipt className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No invoices found in this category</p>
                  </td>
                </tr>
              ) : (
                filtered.map((invoice) => (
                  <InvoiceRow
                    key={invoice.id}
                    invoice={invoice}
                    onMarkPaid={handleMarkPaid}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {filtered.length > 0 && (
          <div className="border-t border-slate-800/60 px-6 py-3 flex items-center justify-between bg-slate-950/20">
            <p className="text-[10px] text-slate-500">
              Showing {filtered.length} of {invoices.length} invoices
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              Total: ₹{filtered.reduce((s, i) => s + i.amount, 0).toLocaleString('en-IN')}
            </p>
          </div>
        )}
      </div>

      {/* ─── Three-way matching notice ────────────────────── */}
      <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
        <ShieldCheck className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-blue-300">Three-Way Matching Enabled</p>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            All invoices are validated against their linked Purchase Order and delivery confirmation before payment release. Finance Managers can mark invoices as Paid only after L2 approval is complete.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
