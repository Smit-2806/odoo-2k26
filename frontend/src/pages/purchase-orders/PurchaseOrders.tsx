import React, { useState } from 'react';
import { useProcurementStore } from '../../store/procurementStore';
import {
  Mail, Download, Printer, CheckCircle, CreditCard,
  ShieldCheck, ChevronRight, ShoppingBag
} from 'lucide-react';

export const PurchaseOrders: React.FC = () => {
  const { purchaseOrders, invoices, quotations, markInvoicePaid, emailInvoice, downloadInvoicePdf } = useProcurementStore();
  const [selectedPoId, setSelectedPoId] = useState<string | null>(null);

  const handleMarkPaid = (invId: string) => {
    markInvoicePaid(invId);
  };

  const handleEmailInvoice = async (invId: string) => {
    if (!invId) return;
    await emailInvoice(invId);
    alert('Invoice successfully emailed to supplier.');
  };

  const handleDownloadPdf = async (invId: string, invNum: string) => {
    if (!invId) return;
    await downloadInvoicePdf(invId, invNum);
  };

  const activePO = selectedPoId
    ? purchaseOrders.find(p => p.id === selectedPoId)
    : purchaseOrders[purchaseOrders.length - 1] || purchaseOrders[0];

  const activeInvoice = activePO
    ? invoices.find(i => i.purchaseOrderId === activePO.id)
    : null;

  const quotation = activePO
    ? quotations.find(q => q.id === activePO.quotationId)
    : null;

  const subtotal = quotation?.subtotal || activeInvoice?.subtotal || (activePO ? activePO.totalAmount / 1.18 : 0);
  const gstAmount = quotation?.gstAmount || activeInvoice?.tax || (activePO ? activePO.totalAmount - subtotal : 0);
  const grandTotal = activePO?.totalAmount || 0;
  const items = quotation?.items || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Purchase Orders & Invoices</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Review auto-generated purchase orders and process vendor payments
          </p>
        </div>
        {activePO && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEmailInvoice(activeInvoice?.id || '')}
              disabled={!activeInvoice}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all disabled:opacity-50"
            >
              <Mail className="h-3.5 w-3.5 text-purple-400" /> {activeInvoice?.emailStatus === 'SENT' ? 'Email Sent' : 'Email'}
            </button>
            <button
              onClick={() => handleDownloadPdf(activeInvoice?.id || '', activeInvoice?.invoiceNumber || '')}
              disabled={!activeInvoice}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5 text-blue-400" /> Download PDF
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all no-print"
            >
              <Printer className="h-3.5 w-3.5 text-slate-400" /> Print
            </button>
          </div>
        )}
      </div>

      {purchaseOrders.length === 0 ? (
        <div className="p-12 bg-slate-900/20 border border-slate-800 text-center rounded-2xl">
          <ShoppingBag className="h-10 w-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-semibold">No purchase orders generated yet</p>
          <p className="text-xs text-slate-600 mt-1">Complete an approval workflow to auto-generate a PO</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* PO Selector List */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider px-1">
              Purchase Orders ({purchaseOrders.length})
            </p>
            {purchaseOrders.map((po) => {
              const inv = invoices.find(i => i.purchaseOrderId === po.id);
              const isSelected = activePO?.id === po.id;
              return (
                <button
                  key={po.id}
                  onClick={() => setSelectedPoId(po.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-purple-600/10 border-purple-500/30'
                      : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-bold text-slate-200 font-mono">{po.poNumber}</p>
                    <ChevronRight className={`h-3.5 w-3.5 transition-all ${isSelected ? 'text-purple-400 rotate-90' : 'text-slate-600'}`} />
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{po.vendorName}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-bold text-slate-300">
                      ₹{po.totalAmount.toLocaleString('en-IN')}
                    </span>
                    <span className={`badge ${
                      inv?.status === 'PAID'      ? 'badge-paid' :
                      inv?.status === 'SUBMITTED' ? 'badge-pending' :
                      inv?.status === 'GENERATED' ? 'badge-pending' :
                      'badge-draft'
                    }`}>
                      {inv?.status || po.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* PO Detail + Invoice */}
          {activePO && (
            <div className="lg:col-span-2 space-y-4 print-card">

              {/* Invoice Document */}
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-7 space-y-7">

                {/* Document Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-800 pb-6">
                  <div>
                    <span className="text-[10px] font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Purchase Order
                    </span>
                    <h2 className="text-2xl font-black text-white mt-2 font-mono">{activePO.poNumber}</h2>
                    <p className="text-xs text-slate-500 mt-1">Auto-generated after L2 approval</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Payment Status</p>
                    <span className={`inline-flex mt-1.5 items-center gap-1 badge text-xs px-3 py-1.5 ${
                      activeInvoice?.status === 'PAID'
                        ? 'badge bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                        : 'badge bg-amber-500/20 border border-amber-500/30 text-amber-400 animate-pulse'
                    }`}>
                      {activeInvoice?.status === 'PAID' ? (
                        <><ShieldCheck className="h-3.5 w-3.5" /> Paid & Cleared</>
                      ) : (
                        <>⏳ Pending Payment</>
                      )}
                    </span>
                  </div>
                </div>

                {/* Bill To / Vendor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs leading-relaxed">
                  <div className="p-4 bg-slate-950/50 border border-slate-800/40 rounded-xl space-y-1.5">
                    <p className="font-black text-slate-500 uppercase tracking-wider text-[10px] mb-2">Bill To:</p>
                    <p className="font-bold text-slate-200">VendorBridge Procurement Corp</p>
                    <p className="text-slate-400">123 Corporate Way, Suite 500</p>
                    <p className="text-slate-500 font-mono text-[10px] pt-1">GSTIN: 25383438AFB</p>
                  </div>
                  <div className="p-4 bg-slate-950/50 border border-slate-800/40 rounded-xl space-y-1.5">
                    <p className="font-black text-slate-500 uppercase tracking-wider text-[10px] mb-2">Vendor:</p>
                    <p className="font-bold text-slate-200">{activePO.vendorName}</p>
                    <p className="text-slate-400">456, Industrial Estate, Surat</p>
                    <p className="text-slate-500 font-mono text-[10px] pt-1">GSTIN: 343434DB4523</p>
                  </div>
                </div>

                {/* PO Meta */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  {[
                    { label: 'PO Number',    value: activePO.poNumber },
                    { label: 'PO Date',      value: new Date(activePO.createdAt).toLocaleDateString() },
                    { label: 'Invoice Date', value: activeInvoice ? new Date(activeInvoice.invoiceDate).toLocaleDateString() : 'N/A' },
                    { label: 'Due Date',     value: activeInvoice ? new Date(activeInvoice.dueDate).toLocaleDateString() : 'N/A' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-slate-500">{label}</p>
                      <p className="font-bold text-slate-300 mt-0.5 font-mono text-xs">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Line Items Table */}
                <div className="border border-slate-800/60 rounded-xl overflow-hidden">
                  <table className="vb-table w-full">
                    <thead>
                      <tr className="bg-slate-950/40 text-left text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-800">
                        <th className="p-3">Item</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right pr-4">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {items.length > 0 ? (
                        items.map((item) => (
                          <tr key={item.id}>
                            <td className="p-3 font-semibold text-slate-200">{item.name || 'Item'}</td>
                            <td className="p-3 text-center">
                              {item.unitPrice ? Math.round(item.totalPrice / item.unitPrice) : 0}
                            </td>
                            <td className="p-3 text-right font-mono">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                            <td className="p-3 text-right pr-4 font-semibold text-slate-200 font-mono">
                              ₹{item.totalPrice.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="p-3 font-semibold text-slate-200">Standard Procurement Package</td>
                          <td className="p-3 text-center">1</td>
                          <td className="p-3 text-right font-mono">₹{Number(subtotal.toFixed(2)).toLocaleString('en-IN')}</td>
                          <td className="p-3 text-right pr-4 font-semibold text-slate-200 font-mono">
                            ₹{Number(subtotal.toFixed(2)).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex flex-col items-end gap-2 text-xs">
                  {[
                    { label: 'Subtotal',    value: `₹${Number(subtotal.toFixed(2)).toLocaleString('en-IN')}`, cls: 'text-slate-400' },
                    { label: 'GST (18%)',   value: `₹${Number(gstAmount.toFixed(2)).toLocaleString('en-IN')}`,   cls: 'text-slate-400' },
                  ].map(({ label, value, cls }) => (
                    <div key={label} className="flex justify-between w-60">
                      <span className={cls}>{label}</span>
                      <span className="font-mono font-semibold text-slate-300">{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between w-60 border-t border-slate-800 pt-2.5 text-sm font-black">
                    <span className="text-slate-200">Grand Total</span>
                    <span className="font-mono text-purple-400">₹{Number(grandTotal.toFixed(2)).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Payment Release Card */}
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-4 no-print">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-purple-400" />
                  Payment Release
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  As Finance Manager, you are authorized to release payment for invoices that have passed three-way matching (PO ↔ Delivery ↔ Invoice) validation.
                </p>

                {activeInvoice?.status !== 'PAID' ? (
                  <button
                    onClick={() => handleMarkPaid(activeInvoice!.id)}
                    className="vb-btn w-full py-3 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark Invoice as Paid
                  </button>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-semibold">
                    <ShieldCheck className="h-5 w-5 shrink-0" />
                    Invoice cleared — Funds released successfully
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
