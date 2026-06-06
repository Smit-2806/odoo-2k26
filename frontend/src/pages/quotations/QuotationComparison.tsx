import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProcurementStore } from '../../store/procurementStore';
import { ArrowLeft, Award, HelpCircle } from 'lucide-react';

export const QuotationComparison: React.FC = () => {
  const { rfqId } = useParams();
  const navigate = useNavigate();
  const { rfqs, approveQuotation } = useProcurementStore();

  const rfq = rfqs.find(r => r.id === rfqId) || rfqs[0];

  const handleSelectVendor = (qId: string, vendorName: string) => {
    // Select vendor -> triggers L1/L2 approval workflow
    approveQuotation(qId, `Automatic approval triggered for lowest bidder: ${vendorName}`, true);
    navigate('/dashboard/approvals');
  };

  // Mocked bids matching Excalidraw Screen 7 specs
  const bids = [
    {
      id: 'q-infra',
      vendorName: 'Infra Supplies (Lowest)',
      grandTotal: 185400,
      gstPercent: 18,
      deliveryDays: 10,
      rating: '4.5/5',
      paymentTerms: '30 days',
      isLowest: true
    },
    {
      id: 'q-tech',
      vendorName: 'TechCore LTD',
      grandTotal: 200010,
      gstPercent: 18,
      deliveryDays: 14,
      rating: '4.2/5',
      paymentTerms: '30 days',
      isLowest: false
    },
    {
      id: 'q-office',
      vendorName: 'Office Need Co.',
      grandTotal: 214800,
      gstPercent: 18,
      deliveryDays: 7,
      rating: '3.8/5',
      paymentTerms: '15 days',
      isLowest: false
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard/rfqs')}
          className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quotation Comparison</h1>
          <p className="text-sm text-slate-400 mt-1">RFQ: {rfq?.title || 'Office Furniture procurement Q2'} - 3 quotations received</p>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4 items-stretch text-sm">
          
          {/* Header Row */}
          <div className="flex items-center font-bold text-xs text-slate-500 uppercase tracking-wider pl-4">
            Criteria
          </div>
          {bids.map((bid) => (
            <div 
              key={bid.id}
              className={`p-4 rounded-xl border flex flex-col justify-between items-center text-center ${
                bid.isLowest 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-slate-950/40 border-slate-900 text-slate-200'
              }`}
            >
              {bid.isLowest && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full mb-2">
                  <Award className="h-3.5 w-3.5" />
                  Lowest Bid
                </span>
              )}
              <span className="font-bold text-sm block">{bid.vendorName}</span>
            </div>
          ))}

          {/* Grand Total Row */}
          <div className="py-4 border-b border-slate-900 font-bold text-slate-400 flex items-center pl-4 bg-slate-950/20 rounded">
            Grand Total ($)
          </div>
          {bids.map((bid) => (
            <div 
              key={bid.id}
              className={`py-4 border-b border-slate-900 font-mono font-bold text-base text-center flex items-center justify-center ${
                bid.isLowest ? 'text-emerald-400 bg-emerald-500/5' : 'text-slate-300'
              }`}
            >
              {bid.grandTotal.toLocaleString()}
            </div>
          ))}

          {/* GST % Row */}
          <div className="py-4 border-b border-slate-900/50 text-slate-400 flex items-center pl-4">
            GST %
          </div>
          {bids.map((bid) => (
            <div key={bid.id} className="py-4 border-b border-slate-900/50 text-center font-semibold text-slate-300 flex items-center justify-center">
              {bid.gstPercent}%
            </div>
          ))}

          {/* Delivery Row */}
          <div className="py-4 border-b border-slate-900/50 text-slate-400 flex items-center pl-4">
            Delivery (days)
          </div>
          {bids.map((bid) => (
            <div 
              key={bid.id} 
              className={`py-4 border-b border-slate-900/50 text-center font-semibold flex items-center justify-center ${
                bid.deliveryDays <= 7 ? 'text-blue-400 font-bold' : 'text-slate-300'
              }`}
            >
              {bid.deliveryDays} days {bid.deliveryDays <= 7 && "(Fastest)"}
            </div>
          ))}

          {/* Rating Row */}
          <div className="py-4 border-b border-slate-900/50 text-slate-400 flex items-center pl-4">
            Vendor Rating
          </div>
          {bids.map((bid) => (
            <div key={bid.id} className="py-4 border-b border-slate-900/50 text-center font-semibold text-slate-300 flex items-center justify-center">
              {bid.rating}
            </div>
          ))}

          {/* Payment Terms Row */}
          <div className="py-4 border-b border-slate-900/50 text-slate-400 flex items-center pl-4">
            Payment Terms
          </div>
          {bids.map((bid) => (
            <div key={bid.id} className="py-4 border-b border-slate-900/50 text-center font-semibold text-slate-300 flex items-center justify-center">
              {bid.paymentTerms}
            </div>
          ))}

          {/* Actions Row */}
          <div className="py-4 text-slate-500 flex items-center pl-4">
            Selection Action
          </div>
          {bids.map((bid) => (
            <div key={bid.id} className="py-4 flex items-center justify-center">
              <button
                onClick={() => handleSelectVendor(bid.id, bid.vendorName)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition-all ${
                  bid.isLowest
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {bid.isLowest ? 'Select & Approve' : 'Select'}
              </button>
            </div>
          ))}

        </div>

        {/* Info Legend */}
        <div className="flex items-start gap-2.5 bg-slate-950/40 border border-slate-900 p-4 rounded-xl text-xs text-slate-400 leading-relaxed">
          <HelpCircle className="h-4.5 w-4.5 text-purple-400 shrink-0 mt-0.5" />
          <p>
            <strong>Note on Procurement Rules:</strong> Green highlights the lowest price quotation. Selecting any vendor's quotation here locks the rates and immediately initiates the multi-level Approval Workflow chain (L1 Review, L2 Approval, PO Generation).
          </p>
        </div>
      </div>
    </div>
  );
};
export default QuotationComparison;
