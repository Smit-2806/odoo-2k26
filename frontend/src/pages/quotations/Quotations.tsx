import React, { useState } from 'react';
import { useProcurementStore } from '../../store/procurementStore';
import { Send } from 'lucide-react';

export const Quotations: React.FC = () => {
  const { rfqs, submitQuotation, currentUser } = useProcurementStore();
  const [selectedRfqId, setSelectedRfqId] = useState(rfqs[0]?.id || '');
  const [deliveryDays, setDeliveryDays] = useState(10);
  const paymentTerms = '20 days net';
  const [notes, setNotes] = useState('Payment terms: 20 days net...');

  // State to hold the prices for each item
  const [prices, setPrices] = useState<Record<string, number>>({
    'item1': 3500, // Default values matching Excalidraw
    'item2': 8200
  });

  const selectedRfq = rfqs.find(r => r.id === selectedRfqId);

  const handlePriceChange = (itemId: string, val: number) => {
    setPrices({ ...prices, [itemId]: val });
  };

  // Calculations
  const subtotal = selectedRfq?.items.reduce((acc, item) => {
    const price = prices[item.id] || 0;
    return acc + (price * item.quantity);
  }, 0) || 0;

  const gstPercent = 18;
  const gstAmount = Math.round(subtotal * (gstPercent / 100));
  const grandTotal = subtotal + gstAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfq) return;

    submitQuotation({
      rfqId: selectedRfq.id,
      vendorId: 'v1', // Mocking vendor ID
      vendorName: currentUser?.name || 'Infra Supplies Pvt Ltd',
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
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Submit Quotation</h1>
        <p className="text-sm text-slate-400 mt-1">Submit bidding rates, terms, and delivery schedules for active RFQs</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* RFQ Selector */}
        <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-4">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Target RFQ</label>
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
                      <th className="py-3 px-4 w-36 text-right">Unit Price ($)*</th>
                      <th className="py-3 px-4 w-36 text-right">Total ($)</th>
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
                              value={unitPrice}
                              onChange={(e) => handlePriceChange(item.id, Number(e.target.value))}
                              className="bg-slate-950 border border-slate-800 focus:border-purple-500 rounded px-2.5 py-1 text-xs text-right text-white w-28 focus:outline-none"
                            />
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-slate-200">
                            {totalPrice.toLocaleString()}
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
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Delivery (days)</label>
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
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tax / GST %</label>
                  <input
                    type="text"
                    disabled
                    value="18%"
                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-500 rounded-lg px-3 py-2.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Note / Terms</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none h-16 resize-none"
                  placeholder="e.g. Payment terms: 20 days net..."
                />
              </div>

              {/* Financial Totals */}
              <div className="border-t border-slate-900 pt-6 flex flex-col items-end gap-3 text-sm">
                <div className="flex justify-between w-64 text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-300 font-semibold">{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between w-64 text-slate-500">
                  <span>GST (18%)</span>
                  <span className="font-mono text-slate-300 font-semibold">{gstAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between w-64 text-slate-200 border-t border-slate-900 pt-2 text-base font-bold">
                  <span>Grand Total</span>
                  <span className="font-mono text-purple-400">{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Submission Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-slate-800 hover:bg-slate-900 text-xs font-semibold text-slate-400 transition-colors"
              >
                Save Draft
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
    </div>
  );
};
export default Quotations;
