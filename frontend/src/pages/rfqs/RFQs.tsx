import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProcurementStore } from '../../store/procurementStore';
import {
  Plus, Trash, Check, Send, FileSignature,
  Calendar, Tag, AlignLeft, Layers, Users,
  Paperclip, ChevronRight, Eye
} from 'lucide-react';

// ─── Step indicator ───────────────────────────────────────────
const StepIndicator: React.FC<{ steps: string[]; current: number }> = ({ steps, current }) => (
  <div className="flex items-center justify-center gap-0 mb-6">
    {steps.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center gap-1.5">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
              done   ? 'bg-purple-600 border-purple-500 text-white' :
              active ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-glow-purple' :
                       'bg-slate-900 border-slate-700 text-slate-500'
            }`}>
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${
              done || active ? 'text-purple-400' : 'text-slate-600'
            }`}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 w-16 mx-1 mb-4 rounded ${done ? 'bg-purple-500' : 'bg-slate-800'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Main RFQs Page ───────────────────────────────────────────
export const RFQs: React.FC = () => {
  const navigate = useNavigate();
  const { rfqs, vendors, createRfq } = useProcurementStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formStep, setFormStep] = useState(0); // 0=Details, 1=Items, 2=Vendors

  // Form state
  const [title, setTitle] = useState('Office Furniture procurement Q2');
  const [category, setCategory] = useState('Furniture');
  const [deadline, setDeadline] = useState('2026-06-15');
  const [description, setDescription] = useState('Ergonomic chairs and standing desks for 3rd floor expansion.');
  const [lineItems, setLineItems] = useState([
    { id: '1', name: 'Ergonomic chair', quantity: 25, uom: 'NOS' },
    { id: '2', name: 'Standing desks',  quantity: 10, uom: 'NOS' },
  ]);
  const [assignedVendors, setAssignedVendors] = useState<string[]>([]);

  const approvedVendors = vendors.filter(v => v.status === 'APPROVED');

  const handleAddLineItem = () =>
    setLineItems([...lineItems, { id: Date.now().toString(), name: '', quantity: 1, uom: 'NOS' }]);

  const handleRemoveLineItem = (id: string) =>
    setLineItems(lineItems.filter(item => item.id !== id));

  const handleLineItemChange = (id: string, field: 'name' | 'quantity' | 'uom', value: string | number) =>
    setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item));

  const toggleVendor = (vendorId: string) =>
    setAssignedVendors(prev =>
      prev.includes(vendorId) ? prev.filter(id => id !== vendorId) : [...prev, vendorId]
    );

  const handleSubmit = () => {
    if (!title || lineItems.length === 0) return;
    createRfq({
      title, description,
      submissionDeadline: deadline,
      category,
      items: lineItems.map((item, idx) => ({
        id: 'item-' + idx,
        name: item.name,
        quantity: Number(item.quantity),
        uom: item.uom,
      })),
      assignedVendors,
    });
    setTitle(''); setDescription(''); setLineItems([]); setAssignedVendors([]);
    setShowCreateForm(false); setFormStep(0);
  };

  const FORM_STEPS = ['RFQ Details', 'Line Items', 'Assign Vendors'];

  const getStatusBadge = (status: string) => {
    if (status === 'PUBLISHED') return 'badge badge-approved';
    if (status === 'CLOSED')    return 'badge badge-blocked';
    return 'badge badge-draft';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ─── Header ───────────────────────────────────────── */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Requests for Quotations
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Create and manage RFQs, track bids from verified vendors
          </p>
        </div>
        {!showCreateForm && (
          <button
            onClick={() => { setShowCreateForm(true); setFormStep(0); }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-xs font-bold text-white shadow-lg shadow-purple-600/20 transition-all"
          >
            <Plus className="h-4 w-4" /> Create RFQ
          </button>
        )}
      </div>

      {showCreateForm ? (
        /* ─── Multi-step Create Form ──────────────────────── */
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-6 animate-scale-in">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileSignature className="h-4 w-4 text-purple-400" />
              New Request for Quotation
            </h2>
            <button
              onClick={() => { setShowCreateForm(false); setFormStep(0); }}
              className="text-xs text-slate-500 hover:text-slate-300 font-semibold transition-colors"
            >
              ✕ Cancel
            </button>
          </div>

          <StepIndicator steps={FORM_STEPS} current={formStep} />

          {/* Step 0 – RFQ Details */}
          {formStep === 0 && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      <AlignLeft className="h-3 w-3 inline mr-1" />RFQ Title *
                    </label>
                    <input
                      type="text" required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="vb-input text-sm"
                      placeholder="e.g. Office Furniture Procurement Q2"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="vb-input text-sm h-24 resize-none"
                      placeholder="Additional context or terms…"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      <Tag className="h-3 w-3 inline mr-1" />Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="vb-input text-sm"
                    >
                      <option value="Furniture">Furniture</option>
                      <option value="IT">IT Hardware / Software</option>
                      <option value="Office Supplies">Office Supplies</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Janitorial">Janitorial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      <Calendar className="h-3 w-3 inline mr-1" />Submission Deadline *
                    </label>
                    <input
                      type="date" required
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="vb-input text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setFormStep(1)}
                  disabled={!title}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-sm font-bold text-white transition-all"
                >
                  Next: Add Items <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 1 – Line Items */}
          {formStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Layers className="h-3 w-3" />Line Items
              </label>
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="vb-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th className="w-28">Qty</th>
                      <th className="w-28">Unit</th>
                      <th className="w-16 text-right pr-4">Del</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <input
                            type="text" required
                            value={item.name}
                            onChange={(e) => handleLineItemChange(item.id, 'name', e.target.value)}
                            className="w-full bg-transparent border-none focus:outline-none text-sm text-slate-200 placeholder-slate-600"
                            placeholder="e.g. Ergonomic chair"
                          />
                        </td>
                        <td>
                          <input
                            type="number" required min={1}
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(item.id, 'quantity', e.target.value)}
                            className="w-full bg-transparent border-none focus:outline-none text-sm text-slate-200"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.uom}
                            onChange={(e) => handleLineItemChange(item.id, 'uom', e.target.value)}
                            className="w-full bg-transparent border-none focus:outline-none text-sm text-slate-200"
                            placeholder="NOS"
                          />
                        </td>
                        <td className="pr-4 text-right">
                          <button
                            onClick={() => handleRemoveLineItem(item.id)}
                            className="p-1 rounded text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  onClick={handleAddLineItem}
                  className="w-full py-2.5 text-[11px] font-bold text-purple-400 hover:text-purple-300 border-t border-slate-800 hover:bg-purple-500/5 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" /> + Add Line Item
                </button>
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  <Paperclip className="h-3 w-3 inline mr-1" />Attachments
                </label>
                <div className="border-2 border-dashed border-slate-800 hover:border-purple-500/40 rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center gap-2 group">
                  <Paperclip className="h-6 w-6 text-slate-600 group-hover:text-purple-400 transition-colors" />
                  <p className="text-xs font-semibold text-slate-400">Drag & drop files or click to upload</p>
                  <p className="text-[10px] text-slate-600">PDF, Excel, Word (Max 10MB)</p>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setFormStep(0)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setFormStep(2)}
                  disabled={lineItems.length === 0}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-sm font-bold text-white transition-all"
                >
                  Next: Assign Vendors <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2 – Assign Vendors */}
          {formStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Users className="h-3 w-3" />Assign Vendors ({assignedVendors.length} selected)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {approvedVendors.map((vendor) => {
                  const isAssigned = assignedVendors.includes(vendor.id);
                  return (
                    <button
                      key={vendor.id}
                      type="button"
                      onClick={() => toggleVendor(vendor.id)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                        isAssigned
                          ? 'bg-purple-600/10 border-purple-500/30 text-purple-300'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-semibold">{vendor.companyName}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{vendor.category}</p>
                      </div>
                      <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${
                        isAssigned ? 'border-purple-500 bg-purple-600' : 'border-slate-700'
                      }`}>
                        {isAssigned && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
                {approvedVendors.length === 0 && (
                  <p className="text-xs text-slate-500 col-span-2 py-4 text-center">
                    No approved vendors yet. Add and approve vendors first.
                  </p>
                )}
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-800">
                <button
                  onClick={() => setFormStep(1)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  ← Back
                </button>
                <div className="flex gap-2.5">
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-slate-400 transition-all"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-xs font-bold text-white shadow-lg transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Save & Send to Vendors
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ─── RFQs List ───────────────────────────────────── */
        <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="vb-table">
              <thead>
                <tr>
                  <th>RFQ Title</th>
                  <th>Category</th>
                  <th>Deadline</th>
                  <th className="text-center">Vendors</th>
                  <th className="text-center">Status</th>
                  <th className="text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rfqs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <FileSignature className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No RFQs yet. Create your first RFQ above.</p>
                    </td>
                  </tr>
                ) : (
                  rfqs.map((rfq) => (
                    <tr key={rfq.id}>
                      <td>
                        <p className="font-semibold text-slate-200 text-sm">{rfq.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{rfq.items.length} line items</p>
                      </td>
                      <td>
                        <span className="text-xs text-slate-400">{rfq.category}</span>
                      </td>
                      <td>
                        <span className="text-xs text-slate-400 font-mono">{rfq.submissionDeadline}</span>
                      </td>
                      <td className="text-center">
                        <span className="text-xs font-bold text-slate-300">
                          {rfq.assignedVendors.length}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={getStatusBadge(rfq.status)}>{rfq.status}</span>
                      </td>
                      <td className="text-right pr-6">
                        <button
                          onClick={() => navigate(`/dashboard/quotations/compare/${rfq.id}`)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all ml-auto"
                        >
                          <Eye className="h-3 w-3" /> Compare Quotations
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFQs;
