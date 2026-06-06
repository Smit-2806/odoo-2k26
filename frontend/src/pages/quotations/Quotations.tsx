import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProcurementStore } from '../../store/procurementStore';
import { Send, Eye, FileText, CheckCircle2, XCircle, Clock, Plus } from 'lucide-react';

export const Quotations: React.FC = () => {
  const navigate = useNavigate();
  const { 
    rfqs, 
    quotations, 
    currentUser, 
    fetchRfqs, 
    fetchQuotations, 
    submitQuotation 
  } = useProcurementStore();

  const [activeTab, setActiveTab] = useState<'list' | 'new'>('list');
  const [selectedRfqId, setSelectedRfqId] = useState('');
  const [deliveryDays, setDeliveryDays] = useState(10);
  const [notes, setNotes] = useState('Terms: 20 days net, warranty included.');
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchRfqs();
    fetchQuotations();
  }, [fetchRfqs, fetchQuotations]);

  // Set default RFQ selection
  useEffect(() => {
    if (rfqs.length > 0 && !selectedRfqId) {
      setSelectedRfqId(rfqs[0].id);
    }
  }, [rfqs, selectedRfqId]);

  const selectedRfq = rfqs.find(r => r.id === selectedRfqId);

  // Auto-initialize prices when selected RFQ changes
  useEffect(() => {
    if (selectedRfq) {
      const initialPrices: Record<string, number> = {};
      selectedRfq.items.forEach(item => {
        initialPrices[item.id] = 0;
      });
      setPrices(initialPrices);
    }
  }, [selectedRfqId, selectedRfq]);

  const handlePriceChange = (itemId: string, val: number) => {
    setPrices(prev => ({ ...prev, [itemId]: val }));
  };

  // Calculations
  const subtotal = selectedRfq?.items.reduce((acc, item) => {
    const price = prices[item.id] || 0;
    return acc + (price * item.quantity);
  }, 0) || 0;

  const gstPercent = 18;
  const gstAmount = Math.round(subtotal * (gstPercent / 100));
  const grandTotal = subtotal + gstAmount;
  const paymentTerms = '20 days net';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfq) return;

    // Validate prices are inputted
    const priceValues = selectedRfq.items.map(item => prices[item.id] || 0);
    if (priceValues.some(p => p <= 0)) {
      alert('Please fill out positive unit prices for all items.');
      return;
    }

    await submitQuotation({
      rfqId: selectedRfq.id,
      vendorId: 'vendor-id', // Handled by backend user token
      vendorName: currentUser?.name || 'My Vendor Profile',
      items: selectedRfq.items.map(item => ({
        id: 'qi-' + item.id,
        rfqItemId: item.id,
        unitPrice: prices[item.id] || 0,
        totalPrice: (prices[item.id] || 0) * item.quantity
      })),
      deliveryDays,
      paymentTerms,
      rating: 4.5,
      gstPercent,
      subtotal,
      gstAmount,
      grandTotal,
      notes
    });

    alert('Quotation submitted successfully!');
    setActiveTab('list');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'badge badge-approved';
      case 'UNDER_REVIEW': return 'badge badge-pending';
      case 'REJECTED': return 'badge badge-blocked';
      default: return 'badge badge-draft';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />;
      case 'REJECTED': return <XCircle className="h-4.5 w-4.5 text-rose-400" />;
      default: return <Clock className="h-4.5 w-4.5 text-purple-400" />;
    }
  };

  const isVendor = currentUser?.role === 'VENDOR';

  // Render non-vendor list (Procurement/Finance view)
  if (!isVendor) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Quotations / Bids Received</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            View submitted bids from vendors, track review progress, and compare rates
          </p>
        </div>

        <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="vb-table">
              <thead>
                <tr>
                  <th>Vendor Name</th>
                  <th>Target RFQ</th>
                  <th>Delivery Days</th>
                  <th>Payment Terms</th>
                  <th>Grand Total</th>
                  <th className="text-center">Status</th>
                  <th className="text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <FileText className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No quotations received yet</p>
                    </td>
                  </tr>
                ) : (
                  quotations.map((q) => {
                    const matchedRfq = rfqs.find(r => r.id === q.rfqId);
                    return (
                      <tr key={q.id}>
                        <td>
                          <p className="font-semibold text-slate-200 text-sm">{q.vendorName}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Rating: {q.rating || '4.2'}/5</p>
                        </td>
                        <td>
                          <span className="text-xs text-slate-300 font-semibold">{matchedRfq?.title || 'Office Procurement'}</span>
                        </td>
                        <td>
                          <span className="text-xs text-slate-400">{q.deliveryDays} days</span>
                        </td>
                        <td>
                          <span className="text-xs text-slate-400">{q.paymentTerms}</span>
                        </td>
                        <td>
                          <span className="text-xs font-mono font-bold text-slate-200">
                            ₹{Number(q.grandTotal).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={getStatusBadge(q.status)}>{q.status}</span>
                        </td>
                        <td className="text-right pr-6">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => navigate(`/dashboard/quotations/compare/${q.rfqId}`)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
                            >
                              <Eye className="h-3 w-3" /> Compare Bids
                            </button>
                            {(q.status === 'UNDER_REVIEW' || q.status === 'SUBMITTED') && (
                              <button
                                onClick={() => navigate('/dashboard/approvals')}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 transition-all"
                              >
                                View Approvals
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Render Vendor View (List + Submission tabs)
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Vendor Bidding Portal</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Submit pricing quotes for open RFQs and track your bid statuses
          </p>
        </div>
        
        {activeTab === 'list' && (
          <button
            onClick={() => setActiveTab('new')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-xs font-bold text-white shadow-lg transition-all"
          >
            <Plus className="h-4.5 w-4.5" /> Submit New Bid
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'list' 
              ? 'border-purple-500 text-purple-400' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          My Submitted Bids
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'new' 
              ? 'border-purple-500 text-purple-400' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Submit New Bid
        </button>
      </div>

      {activeTab === 'list' ? (
        /* ─── Vendor's Submitted Bids List ──────────────── */
        <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="vb-table">
              <thead>
                <tr>
                  <th>Target RFQ</th>
                  <th>Delivery Leadtime</th>
                  <th>Payment Terms</th>
                  <th>Grand Total</th>
                  <th className="text-center">Status</th>
                  <th className="text-right pr-6">Submitted Date</th>
                </tr>
              </thead>
              <tbody>
                {quotations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <FileText className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">You haven't submitted any bids yet</p>
                    </td>
                  </tr>
                ) : (
                  quotations.map((q) => {
                    const matchedRfq = rfqs.find(r => r.id === q.rfqId);
                    return (
                      <tr key={q.id}>
                        <td>
                          <span className="text-xs text-slate-200 font-semibold">{matchedRfq?.title || 'Office Procurement'}</span>
                        </td>
                        <td>
                          <span className="text-xs text-slate-400">{q.deliveryDays} days</span>
                        </td>
                        <td>
                          <span className="text-xs text-slate-400">{q.paymentTerms}</span>
                        </td>
                        <td>
                          <span className="text-xs font-mono font-bold text-slate-200">
                            ₹{Number(q.grandTotal).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {getStatusIcon(q.status)}
                            <span className={getStatusBadge(q.status)}>{q.status}</span>
                          </div>
                        </td>
                        <td className="text-right pr-6">
                          <span className="text-xs text-slate-500 font-mono">{q.createdAt}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ─── Vendor Bid Submission Form ────────────────── */
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-4">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Select Target RFQ
            </label>
            <select
              value={selectedRfqId}
              onChange={(e) => setSelectedRfqId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
            >
              {rfqs.map(r => (
                <option key={r.id} value={r.id}>{r.title} - Deadline: {r.submissionDeadline}</option>
              ))}
            </select>
          </div>

          {selectedRfq && (
            <>
              {/* RFQ Summary Card */}
              <div className="bg-slate-900/10 border border-slate-900/60 p-6 rounded-2xl space-y-3">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">RFQ Summary</h2>
                <p className="text-xs text-slate-400">
                  {selectedRfq.description}
                </p>
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 pt-1">
                  <span>Category: <strong className="text-slate-300">{selectedRfq.category}</strong></span>
                  <span>Deadline: <strong className="text-slate-300">{selectedRfq.submissionDeadline}</strong></span>
                </div>
              </div>

              {/* Bidding Sheets */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden p-6 space-y-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Your Quotation Sheets</h2>
                
                <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950/20">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 text-[10px] font-bold text-slate-500 uppercase bg-slate-950/40">
                        <th className="py-3 px-4">Item Name</th>
                        <th className="py-3 px-4 w-28 text-center">Quantity</th>
                        <th className="py-3 px-4 w-36 text-right">Unit Price (₹)*</th>
                        <th className="py-3 px-4 w-36 text-right">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRfq.items.map((item) => {
                        const unitPrice = prices[item.id] || 0;
                        const totalPrice = unitPrice * item.quantity;
                        return (
                          <tr key={item.id} className="border-b border-slate-900/50 hover:bg-slate-900/5">
                            <td className="py-3 px-4 font-semibold text-slate-300">
                              {item.name}
                            </td>
                            <td className="py-3 px-4 text-center text-slate-400 font-medium">
                              {item.quantity} {item.uom}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <input
                                type="number"
                                required
                                min={0}
                                value={unitPrice || ''}
                                onChange={(e) => handlePriceChange(item.id, Number(e.target.value))}
                                className="bg-slate-950 border border-slate-800 focus:border-purple-500 rounded px-2.5 py-1 text-xs text-right text-white w-28 focus:outline-none"
                                placeholder="0"
                              />
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-semibold text-slate-200">
                              ₹{totalPrice.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Delivery and Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Delivery Schedule (days from PO)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={deliveryDays}
                      onChange={(e) => setDeliveryDays(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Tax / GST %
                    </label>
                    <input
                      type="text"
                      disabled
                      value="18%"
                      className="w-full bg-slate-950/60 border border-slate-800 text-slate-500 rounded-lg px-3 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Remarks / Conditions
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none h-16 resize-none"
                    placeholder="Describe any warranty, logistics details, etc."
                  />
                </div>

                {/* Financial Totals */}
                <div className="border-t border-slate-900 pt-6 flex flex-col items-end gap-3 text-sm">
                  <div className="flex justify-between w-64 text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-mono text-slate-300 font-semibold">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between w-64 text-slate-500">
                    <span>GST (18%)</span>
                    <span className="font-mono text-slate-300 font-semibold">
                      ₹{gstAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between w-64 text-slate-200 border-t border-slate-900 pt-2 text-base font-bold">
                    <span>Grand Total</span>
                    <span className="font-mono text-purple-400">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submission Actions */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 rounded-lg border border-slate-800 hover:bg-slate-900 text-xs font-semibold text-slate-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-xs font-semibold text-white shadow-lg transition-all flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  Submit Quotation
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
};

export default Quotations;
