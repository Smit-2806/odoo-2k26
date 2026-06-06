import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProcurementStore } from '../../store/procurementStore';
import {
  Check, CheckCircle2, Circle, Award,
  MessageSquare, ArrowRight, AlertCircle
} from 'lucide-react';

export const Approvals: React.FC = () => {
  const navigate = useNavigate();
  const { quotations, approveQuotation } = useProcurementStore();
  const [comments, setComments] = useState('');

  const activeQuotation =
    quotations.find(q => q.status === 'SUBMITTED' || q.status === 'UNDER_REVIEW') ||
    quotations[0];

  const handleAction = (approve: boolean) => {
    if (!activeQuotation) return;
    approveQuotation(
      activeQuotation.id,
      comments || (approve ? 'Approved by L2 Finance Manager' : 'Rejected by L2 Finance Manager'),
      approve
    );
    setComments('');
    if (approve) navigate('/dashboard/purchase-orders');
  };

  const steps = [
    { num: 1, label: 'Submitted',   done: true,  active: false },
    { num: 2, label: 'L1 Review',   done: true,  active: false },
    {
      num: 3, label: 'L2 Approval',
      done: activeQuotation?.status === 'APPROVED',
      active: activeQuotation?.status !== 'APPROVED',
    },
    {
      num: 4, label: 'Generate PO',
      done: activeQuotation?.status === 'APPROVED',
      active: false,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ─── Header ───────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Approval Workflow</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Review quotations, audit approval chains, and authorize purchase order generation
        </p>
      </div>

      {activeQuotation ? (
        <div className="space-y-5">

          {/* ─── Progress Stepper ─────────────────────────── */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-5">
              Approval Chain Progress
            </p>
            <div className="flex items-center max-w-2xl mx-auto relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-800 z-0" />
              <div
                className="absolute top-4 left-0 h-0.5 z-0 bg-gradient-to-r from-purple-500 to-emerald-500 transition-all duration-700"
                style={{ width: activeQuotation.status === 'APPROVED' ? '100%' : '50%' }}
              />
              {steps.map((s) => (
                <div key={s.label} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all shadow-sm ${
                    s.done
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/20'
                      : s.active
                      ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-purple-500/20 shadow-glow-purple'
                      : 'bg-slate-900 border-slate-700 text-slate-600'
                  }`}>
                    {s.done ? <Check className="h-3.5 w-3.5" /> : s.num}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    s.done ? 'text-emerald-400' : s.active ? 'text-purple-400' : 'text-slate-600'
                  }`}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Quotation Context Banner ─────────────────── */}
          <div className="bg-gradient-to-r from-purple-600/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Target Quotation</p>
                <h2 className="text-lg font-bold text-white mt-1">
                  RFQ: Office Furniture Q2 — {activeQuotation.vendorName}
                </h2>
                <p className="text-sm text-purple-400 font-bold mt-1">
                  Grand Total: ₹{Number(activeQuotation.grandTotal).toLocaleString('en-IN')}
                </p>
              </div>
              {activeQuotation.status === 'APPROVED' && (
                <span className="flex items-center gap-1.5 badge badge-approved text-sm px-3 py-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Approved
                </span>
              )}
            </div>
          </div>

          {/* ─── Two column layout ────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Quotation Summary */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
                Quotation Summary
              </h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Vendor', value: activeQuotation.vendorName, cls: 'text-slate-200 font-semibold' },
                  { label: 'Grand Total', value: `₹${Number(activeQuotation.grandTotal).toLocaleString('en-IN')}`, cls: 'text-purple-400 font-bold font-mono' },
                  { label: 'Delivery Schedule', value: `${activeQuotation.deliveryDays} days`, cls: 'text-slate-200' },
                  { label: 'Payment Terms', value: activeQuotation.paymentTerms, cls: 'text-slate-200' },
                  { label: 'Vendor Rating', value: `${activeQuotation.rating || '4.5'}/5`, cls: 'text-amber-400 font-bold' },
                ].map(({ label, value, cls }) => (
                  <div key={label} className="flex justify-between items-center border-b border-slate-900/60 pb-3">
                    <span className="text-slate-500 text-xs">{label}</span>
                    <span className={`text-xs ${cls}`}>{value}</span>
                  </div>
                ))}
              </div>
              {activeQuotation.notes && (
                <div className="bg-slate-950/60 rounded-xl p-3 text-xs text-slate-400 leading-relaxed border border-slate-800/40">
                  <span className="font-bold text-slate-500 block mb-1">Notes:</span>
                  {activeQuotation.notes}
                </div>
              )}
            </div>

            {/* Approval Chain */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
                Approval Chain
              </h3>
              <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">

                {/* L1 */}
                <div className="relative">
                  <div className="absolute -left-[27px] top-0.5 h-6 w-6 rounded-full bg-emerald-600 border-2 border-emerald-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <p className="text-sm font-bold text-slate-200">Rahul Mehta</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Procurement Head · L1 Reviewer</p>
                  <p className="text-[10px] text-emerald-400 font-bold mt-1">✓ Approved on May 20, 10:32 AM</p>
                  <p className="text-[10px] text-slate-500 italic mt-1">
                    "Quotation prices verified. Initiating L2 finance review."
                  </p>
                </div>

                {/* L2 */}
                <div className="relative">
                  <div className={`absolute -left-[27px] top-0.5 h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                    activeQuotation.status === 'APPROVED'
                      ? 'bg-emerald-600 border-emerald-500'
                      : 'bg-purple-600/20 border-purple-500'
                  }`}>
                    {activeQuotation.status === 'APPROVED'
                      ? <Check className="h-3 w-3 text-white" />
                      : <Circle className="h-3 w-3 text-purple-400 animate-pulse" />
                    }
                  </div>
                  <p className="text-sm font-bold text-slate-200">Priya Shah</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Finance Manager · L2 Approver</p>
                  {activeQuotation.status === 'APPROVED' ? (
                    <p className="text-[10px] text-emerald-400 font-bold mt-1">✓ Approved · PO Generated</p>
                  ) : (
                    <p className="text-[10px] text-purple-400 font-bold mt-1">⏳ Awaiting review — Assigned May 21</p>
                  )}
                </div>

                {/* L3 – PO Generation */}
                <div className="relative">
                  <div className={`absolute -left-[27px] top-0.5 h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                    activeQuotation.status === 'APPROVED'
                      ? 'bg-emerald-600 border-emerald-500'
                      : 'bg-slate-900 border-slate-700'
                  }`}>
                    {activeQuotation.status === 'APPROVED'
                      ? <Check className="h-3 w-3 text-white" />
                      : <ArrowRight className="h-3 w-3 text-slate-600" />
                    }
                  </div>
                  <p className={`text-sm font-bold ${activeQuotation.status === 'APPROVED' ? 'text-slate-200' : 'text-slate-600'}`}>
                    PO Generation
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Auto-generated on approval</p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Approval Actions ─────────────────────────── */}
          {activeQuotation.status !== 'APPROVED' && (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-white">
                <MessageSquare className="h-4 w-4 text-purple-400" />
                Approval Remarks
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="vb-input h-24 resize-none text-sm"
                placeholder="Add your comments, conditions, or justification for this decision…"
              />
              <div className="flex items-center gap-1.5 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs text-amber-400/80">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Approving will auto-generate a Purchase Order and Invoice. This action is logged permanently.
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => handleAction(false)}
                  className="px-6 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-sm font-bold text-rose-400 hover:text-rose-300 transition-all"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleAction(true)}
                  className="px-8 py-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
                >
                  <Award className="h-4 w-4" />
                  Approve & Generate PO
                </button>
              </div>
            </div>
          )}

          {activeQuotation.status === 'APPROVED' && (
            <div className="flex items-center justify-between p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                <div>
                  <p className="text-sm font-bold text-emerald-400">Quotation Fully Approved</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">PO and Invoice have been auto-generated</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/dashboard/purchase-orders')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all"
              >
                View PO <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 bg-slate-900/20 border border-slate-800 text-center rounded-2xl">
          <CheckCircle2 className="h-10 w-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-semibold">No pending approvals at this time</p>
          <p className="text-xs text-slate-600 mt-1">All quotations have been processed</p>
        </div>
      )}
    </div>
  );
};

export default Approvals;
