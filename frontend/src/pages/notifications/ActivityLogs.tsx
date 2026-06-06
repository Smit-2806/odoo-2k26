import React, { useState } from 'react';
import { useProcurementStore } from '../../store/procurementStore';
import type { AuditLog } from '../../store/procurementStore';
import {
  ShieldAlert, CheckCircle, FileText, UserPlus, Info,
  Activity, Clock, Lock
} from 'lucide-react';

export const ActivityLogs: React.FC = () => {
  const { auditLogs } = useProcurementStore();
  const [filter, setFilter] = useState<'ALL' | 'APPROVAL' | 'RFQ' | 'INVOICE' | 'VENDOR' | 'SYSTEM'>('ALL');

  const filteredLogs = [...auditLogs]
    .reverse()
    .filter(log => filter === 'ALL' || log.category === filter);

  const getCategoryIcon = (category: AuditLog['category']) => {
    switch (category) {
      case 'APPROVAL': return <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />;
      case 'RFQ':      return <FileText className="h-3.5 w-3.5 text-blue-400" />;
      case 'VENDOR':   return <UserPlus className="h-3.5 w-3.5 text-purple-400" />;
      case 'INVOICE':  return <FileText className="h-3.5 w-3.5 text-amber-400" />;
      case 'SYSTEM':   return <Activity className="h-3.5 w-3.5 text-slate-400" />;
      default:         return <Info className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  const getCategoryColor = (category: AuditLog['category']) => {
    switch (category) {
      case 'APPROVAL': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'RFQ':      return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'VENDOR':   return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'INVOICE':  return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'SYSTEM':   return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
      default:         return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const tabs = [
    { value: 'ALL',      label: 'All',       count: auditLogs.length },
    { value: 'RFQ',      label: 'RFQ',       count: auditLogs.filter(l => l.category === 'RFQ').length },
    { value: 'APPROVAL', label: 'Approvals', count: auditLogs.filter(l => l.category === 'APPROVAL').length },
    { value: 'INVOICE',  label: 'Invoices',  count: auditLogs.filter(l => l.category === 'INVOICE').length },
    { value: 'VENDOR',   label: 'Vendors',   count: auditLogs.filter(l => l.category === 'VENDOR').length },
  ] as const;

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ─── Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Activity & Logs</h1>
          <p className="text-sm text-slate-400 mt-0.5">Procurement audit trail — immutable event records</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-bold">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          <span>Write-once · No edits or deletions allowed</span>
        </div>
      </div>

      {/* ─── Stats Row ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: auditLogs.length, cls: 'text-white' },
          { label: 'Approvals', value: auditLogs.filter(l => l.category === 'APPROVAL').length, cls: 'text-emerald-400' },
          { label: 'RFQ Events', value: auditLogs.filter(l => l.category === 'RFQ').length, cls: 'text-blue-400' },
          { label: 'Vendor Events', value: auditLogs.filter(l => l.category === 'VENDOR').length, cls: 'text-purple-400' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-black mt-1 ${cls}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ─── Tabs ─────────────────────────────────────────── */}
      <div className="flex items-center gap-0 border-b border-slate-800/60">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as typeof filter)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              filter === tab.value
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
              filter === tab.value ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ─── Timeline ─────────────────────────────────────── */}
      <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-6">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-8 w-8 text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No logs found in this category</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-800 ml-5 pl-8 space-y-7 py-1">
            {filteredLogs.map((log, i) => (
              <div key={log.id} className={`relative animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}>
                {/* Timeline dot */}
                <div className="absolute -left-[43px] top-0.5 h-7 w-7 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center">
                  {getCategoryIcon(log.category)}
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-200 leading-snug max-w-2xl">
                      {log.message}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono shrink-0">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(log.timestamp)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[10px] text-slate-500">
                      By: <span className="text-slate-300 font-bold">{log.user}</span>
                    </span>
                    <span className="h-1 w-1 bg-slate-700 rounded-full" />
                    <span className={`badge border ${getCategoryColor(log.category)}`}>
                      {log.category}
                    </span>
                    <span className="flex items-center gap-0.5 text-[9px] text-slate-600 font-mono">
                      <ShieldAlert className="h-2.5 w-2.5" /> immutable
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Compliance Notice ────────────────────────────── */}
      <div className="flex items-start gap-3 p-4 bg-slate-900/40 border border-slate-800/40 rounded-xl">
        <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-amber-400">Audit Compliance Notice</p>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            All audit log entries are write-once by design. No edit or delete operations are permitted on log records as per CLAUDE.md compliance requirements. These entries form the immutable procurement audit trail.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
