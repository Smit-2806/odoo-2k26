import React, { useState } from 'react';
import { useProcurementStore } from '../../store/procurementStore';
import type { Vendor } from '../../store/procurementStore';
import {
  Search, Plus, Ban, CheckCircle, Clock, FileWarning,
  Star, X, MapPin, Phone, Hash, Tag, Eye, ShieldCheck,
  ShieldX, Building2
} from 'lucide-react';

// ─── Star Rating ─────────────────────────────────────────────
const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-3 w-3 ${
          star <= Math.round(rating)
            ? 'text-amber-400 fill-amber-400'
            : 'text-slate-700'
        }`}
      />
    ))}
    <span className="text-[10px] text-slate-500 ml-1 font-mono">{rating.toFixed(1)}</span>
  </div>
);

// ─── Vendor Detail Modal ──────────────────────────────────────
const VendorModal: React.FC<{
  vendor: Vendor;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}> = ({ vendor, onClose, onApprove, onReject }) => {
  const statusConfig = {
    APPROVED: { label: 'Approved', cls: 'badge badge-approved' },
    PENDING:  { label: 'Pending Review', cls: 'badge badge-pending' },
    REJECTED: { label: 'Rejected', cls: 'badge badge-rejected' },
    BLOCKED:  { label: 'Blocked', cls: 'badge badge-blocked' },
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl z-10 animate-scale-in overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-purple-600/30 to-blue-500/30 border border-purple-500/20 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{vendor.companyName}</h2>
              <span className={statusConfig[vendor.status].cls}>
                {statusConfig[vendor.status].label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Hash className="h-3 w-3" /> Tax ID / GSTIN
              </p>
              <p className="text-sm font-mono text-slate-200">{vendor.taxId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Tag className="h-3 w-3" /> Category
              </p>
              <p className="text-sm text-slate-200">{vendor.category}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Phone className="h-3 w-3" /> Contact
              </p>
              <p className="text-sm text-slate-200">{vendor.phone}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Vendor Rating
              </p>
              <StarRating rating={vendor.rating} />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Address
            </p>
            <p className="text-sm text-slate-300">{vendor.address}</p>
          </div>

          {vendor.overdueInvoices > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
              <FileWarning className="h-4 w-4 shrink-0" />
              <span>{vendor.overdueInvoices} overdue invoice{vendor.overdueInvoices > 1 ? 's' : ''} — payment clearance required</span>
            </div>
          )}
        </div>

        {/* Modal Footer – Actions for PENDING vendors */}
        {vendor.status === 'PENDING' && (
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={onReject}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-950 hover:bg-red-500/10 hover:border-red-500/30 text-sm font-semibold text-slate-400 hover:text-red-400 transition-all flex items-center justify-center gap-2"
            >
              <ShieldX className="h-4 w-4" /> Reject
            </button>
            <button
              onClick={onApprove}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" /> Verify & Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Vendors Page ────────────────────────────────────────
export const Vendors: React.FC = () => {
  const { vendors, addVendor, verifyVendor } = useProcurementStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'APPROVED' | 'BLOCKED' | 'PENDING'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const [newVendor, setNewVendor] = useState({
    companyName: '',
    taxId: '',
    phone: '',
    address: '',
    category: 'Furniture',
  });

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addVendor({ ...newVendor, status: 'PENDING' });
    setNewVendor({ companyName: '', taxId: '', phone: '', address: '', category: 'Furniture' });
    setShowAddModal(false);
  };

  const filteredVendors = vendors.filter((v) => {
    const q = searchTerm.toLowerCase();
    const match =
      v.companyName.toLowerCase().includes(q) ||
      v.taxId.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q);
    if (activeTab === 'ALL') return match;
    return match && v.status === activeTab;
  });

  const totalCount   = vendors.length;
  const activeCount  = vendors.filter(v => v.status === 'APPROVED').length;
  const blockedCount = vendors.filter(v => v.status === 'BLOCKED').length;
  const pendingCount = vendors.filter(v => v.status === 'PENDING').length;
  const overdueCount = vendors.reduce((acc, v) => acc + v.overdueInvoices, 0);

  const tabs = [
    { key: 'ALL',      label: `All`,     count: totalCount },
    { key: 'APPROVED', label: `Active`,  count: activeCount },
    { key: 'PENDING',  label: `Pending`, count: pendingCount },
    { key: 'BLOCKED',  label: `Blocked`, count: blockedCount },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ─── Page Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Vendors</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage supplier profiles, ratings and compliance</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-xs font-bold text-white shadow-lg shadow-purple-600/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          + Add Vendor
        </button>
      </div>

      {/* ─── Metric Cards ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Vendors', val: totalCount,   icon: <Clock className="h-5 w-5" />,        cls: 'text-slate-400 bg-slate-500/10' },
          { label: 'Active',        val: activeCount,  icon: <CheckCircle className="h-5 w-5" />,  cls: 'text-emerald-400 bg-emerald-500/10' },
          { label: 'Blocked',       val: blockedCount, icon: <Ban className="h-5 w-5" />,          cls: 'text-rose-400 bg-rose-500/10' },
          { label: 'Overdue Inv.', val: overdueCount,  icon: <FileWarning className="h-5 w-5" />, cls: 'text-amber-400 bg-amber-500/10' },
        ].map(({ label, val, icon, cls }) => (
          <div key={label} className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{label}</p>
              <p className={`text-2xl font-black mt-1 ${cls.split(' ')[0]}`}>{val}</p>
            </div>
            <div className={`p-2.5 rounded-xl ${cls}`}>{icon}</div>
          </div>
        ))}
      </div>

      {/* ─── Tabs + Search ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 border-b border-slate-800/60">
          {tabs.map(({ key, label, count }) => (
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
              <span className={`ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full ${
                activeTab === key ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, GST, category…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="vb-input pl-9 text-xs"
          />
        </div>
      </div>

      {/* ─── Vendors Table ───────────────────────────────── */}
      <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="vb-table">
            <thead>
              <tr>
                <th>Vendor Name</th>
                <th>GST / Tax ID</th>
                <th>Category</th>
                <th>Contact</th>
                <th>Rating</th>
                <th className="text-center">Status</th>
                <th className="text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Search className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No matching vendors found</p>
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="group">
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-600/20 to-blue-500/20 border border-purple-500/10 flex items-center justify-center shrink-0">
                          <Building2 className="h-3.5 w-3.5 text-purple-400" />
                        </div>
                        <span className="font-semibold text-slate-200 text-sm">{vendor.companyName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-xs text-slate-400">{vendor.taxId}</span>
                    </td>
                    <td>
                      <span className="text-xs text-slate-400">{vendor.category}</span>
                    </td>
                    <td>
                      <span className="text-xs text-slate-400">{vendor.phone}</span>
                    </td>
                    <td>
                      <StarRating rating={vendor.rating} />
                    </td>
                    <td className="text-center">
                      <span className={`badge ${
                        vendor.status === 'APPROVED' ? 'badge-approved' :
                        vendor.status === 'BLOCKED'  ? 'badge-blocked' :
                        vendor.status === 'REJECTED' ? 'badge-rejected' :
                        'badge-pending'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedVendor(vendor)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
                        >
                          <Eye className="h-3 w-3" /> View
                        </button>
                        {vendor.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => verifyVendor(vendor.id, true)}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600/80 hover:bg-emerald-500 text-white transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => verifyVendor(vendor.id, false)}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-600/80 hover:bg-rose-500 text-white transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── View Modal ──────────────────────────────────── */}
      {selectedVendor && (
        <VendorModal
          vendor={selectedVendor}
          onClose={() => setSelectedVendor(null)}
          onApprove={() => {
            verifyVendor(selectedVendor.id, true);
            setSelectedVendor(null);
          }}
          onReject={() => {
            verifyVendor(selectedVendor.id, false);
            setSelectedVendor(null);
          }}
        />
      )}

      {/* ─── Add Vendor Modal ─────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl z-10 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Add New Vendor</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Company Name *
                </label>
                <input
                  type="text" required
                  value={newVendor.companyName}
                  onChange={(e) => setNewVendor({ ...newVendor, companyName: e.target.value })}
                  className="vb-input text-sm"
                  placeholder="e.g. Acme Supplies Pvt Ltd"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Tax ID / GSTIN *
                </label>
                <input
                  type="text" required
                  value={newVendor.taxId}
                  onChange={(e) => setNewVendor({ ...newVendor, taxId: e.target.value })}
                  className="vb-input text-sm font-mono"
                  placeholder="e.g. 27AABCS1429Bz0"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    value={newVendor.category}
                    onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
                    className="vb-input text-sm"
                  >
                    <option value="Furniture">Furniture</option>
                    <option value="IT">IT Hardware/Software</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Janitorial">Janitorial</option>
                    <option value="Constructions">Constructions</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Contact Phone *
                  </label>
                  <input
                    type="text" required
                    value={newVendor.phone}
                    onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                    className="vb-input text-sm"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Company Address *
                </label>
                <textarea
                  required
                  value={newVendor.address}
                  onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                  className="vb-input text-sm h-20 resize-none"
                  placeholder="Street, City, State"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-slate-400 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-xs font-bold text-white shadow-lg transition-all"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;
