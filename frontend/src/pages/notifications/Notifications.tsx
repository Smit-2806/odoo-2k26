import React, { useEffect } from 'react';
import { useProcurementStore } from '../../store/procurementStore';
import { Bell, CheckCircle, Info, Calendar, ShieldCheck } from 'lucide-react';

export const Notifications: React.FC = () => {
  const {
    notifications,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead
  } = useProcurementStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadList = notifications.filter(n => !n.read);
  const readList = notifications.filter(n => n.read);

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* ─── Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notifications Center</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time alerts, approvals, and message dispatches</p>
        </div>
        {unreadList.length > 0 && (
          <button
            onClick={() => markAllNotificationsRead()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-xs font-bold text-purple-700 transition-all"
          >
            <CheckCircle className="h-3.5 w-3.5" /> Mark All as Read
          </button>
        )}
      </div>

      {/* ─── Main Content ─────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[400px] space-y-6">
        
        {/* Unread Section */}
        <div className="space-y-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-600 animate-pulse" />
            Unread Alerts ({unreadList.length})
          </h2>
          
          <div className="space-y-2.5">
            {unreadList.length > 0 ? (
              unreadList.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className="p-4 bg-purple-50/50 hover:bg-purple-50 border border-purple-100 rounded-xl flex items-start gap-3.5 transition-all cursor-pointer group"
                >
                  <div className="p-2.5 bg-purple-600 text-white rounded-lg shadow-md shadow-purple-600/10">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-purple-900 transition-colors">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                      <Calendar className="h-3 w-3" />
                      <span>{formatTimestamp(n.createdAt)}</span>
                      <span>·</span>
                      <span className="text-purple-600 font-bold group-hover:underline">Click to mark read</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/40">
                You have no unread notifications.
              </div>
            )}
          </div>
        </div>

        {/* Read/Archive Section */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Earlier / Read Notifications
          </h2>
          
          <div className="space-y-2">
            {readList.length > 0 ? (
              readList.map((n) => (
                <div
                  key={n.id}
                  className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3.5 opacity-70 hover:opacity-100 transition-opacity"
                >
                  <div className="p-2 bg-slate-200 text-slate-500 rounded-lg">
                    <Info className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-medium text-slate-600">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                      <Calendar className="h-2.5 w-2.5" />
                      <span>{formatTimestamp(n.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                No read notifications in archive.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center gap-2.5 p-4 bg-slate-50 border border-slate-100 rounded-xl">
        <ShieldCheck className="h-5 w-5 text-purple-600 shrink-0" />
        <div>
          <p className="text-xs font-bold text-slate-700">Multi-Channel Alerts Active</p>
          <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
            Notifications are generated automatically based on procurement milestones, approvals recommendations, and invoice payment statuses. In-app and simulated email dispatches are enabled.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
