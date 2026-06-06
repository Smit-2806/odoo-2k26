import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useProcurementStore } from '../store/procurementStore';
import type { Role } from '../store/procurementStore';
import {
  LayoutDashboard, Users, FileSignature, Layers,
  CheckSquare, ShoppingBag, Receipt, BarChart3,
  Activity, LogOut, User as UserIcon, ChevronRight,
  Bell, Settings
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { currentUser, login, logout, initData } = useProcurementStore();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (currentUser) {
      initData();
    }
  }, [currentUser, initData]);

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
      roles: ['ADMIN', 'PROCUREMENT', 'FINANCE', 'VENDOR'],
      exact: true,
    },
    {
      name: 'Vendors',
      path: '/dashboard/vendors',
      icon: <Users className="h-4 w-4" />,
      roles: ['ADMIN', 'PROCUREMENT'],
      exact: false,
    },
    {
      name: "RFQ's",
      path: '/dashboard/rfqs',
      icon: <FileSignature className="h-4 w-4" />,
      roles: ['ADMIN', 'PROCUREMENT'],
      exact: false,
    },
    {
      name: 'Quotations',
      path: '/dashboard/quotations',
      icon: <Layers className="h-4 w-4" />,
      roles: ['ADMIN', 'VENDOR', 'PROCUREMENT'],
      exact: false,
    },
    {
      name: 'Approvals',
      path: '/dashboard/approvals',
      icon: <CheckSquare className="h-4 w-4" />,
      roles: ['ADMIN', 'PROCUREMENT', 'FINANCE'],
      exact: false,
    },
    {
      name: 'Purchase Orders',
      path: '/dashboard/purchase-orders',
      icon: <ShoppingBag className="h-4 w-4" />,
      roles: ['ADMIN', 'PROCUREMENT', 'FINANCE', 'VENDOR'],
      exact: false,
    },
    {
      name: 'Invoices',
      path: '/dashboard/invoices',
      icon: <Receipt className="h-4 w-4" />,
      roles: ['ADMIN', 'FINANCE', 'VENDOR'],
      exact: false,
    },
    {
      name: 'Reports',
      path: '/dashboard/reports',
      icon: <BarChart3 className="h-4 w-4" />,
      roles: ['ADMIN', 'PROCUREMENT', 'FINANCE'],
      exact: false,
    },
    {
      name: 'Activity',
      path: '/dashboard/activity',
      icon: <Activity className="h-4 w-4" />,
      roles: ['ADMIN', 'PROCUREMENT', 'FINANCE'],
      exact: false,
    },
  ];

  const handleRoleChange = (role: Role) => {
    let email = '';
    switch (role) {
      case 'PROCUREMENT':
        email = 'officer@vendorbridge.com';
        break;
      case 'FINANCE':
        email = 'finance@vendorbridge.com';
        break;
      case 'ADMIN':
        email = 'admin@vendorbridge.com';
        break;
      case 'VENDOR':
        email = 'vendor@infra-supplies.com';
        break;
      default:
        email = '';
    }
    if (email) {
      login(email, role);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'PROCUREMENT': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'FINANCE': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'VENDOR': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const isActive = (item: { path: string; exact: boolean }) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
  };

  const filteredNavItems = navItems.filter(
    (item) => !currentUser || item.roles.includes(currentUser.role)
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans">

      {/* ─── Top Header ───────────────────────────────────────── */}
      <header className="border-b border-slate-900/80 bg-[#020617]/90 backdrop-blur-md sticky top-0 z-50 h-16 flex items-center justify-between px-6 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/VendorBridgeLogo.png"
            alt="VendorBridge Logo"
            className="h-9 w-auto max-w-[150px] object-contain cursor-pointer hover:opacity-95 transition-all"
            onClick={() => navigate('/dashboard')}
          />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              VendorBridge
            </span>
            <span className="text-[9px] text-slate-500 font-medium tracking-widest uppercase">
              ERP Platform
            </span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Role Switcher */}
          <div className="flex items-center gap-2 border border-slate-800 bg-slate-900/60 px-3 py-1.5 rounded-lg">
            <span className="text-[10px] text-slate-500 font-semibold">Role:</span>
            <select
              value={currentUser?.role || ''}
              onChange={(e) => handleRoleChange(e.target.value as Role)}
              disabled={currentUser?.role === 'PROCUREMENT'}
              className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="PROCUREMENT" className="bg-slate-950 text-slate-100">Procurement Officer</option>
              <option value="FINANCE" className="bg-slate-950 text-slate-100">Finance Manager</option>
              <option value="VENDOR" className="bg-slate-950 text-slate-100">Vendor / Supplier</option>
              <option value="ADMIN" className="bg-slate-950 text-slate-100">Administrator</option>
            </select>
          </div>

          {/* Notification Bell */}
          <button className="relative p-2 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-purple-500 rounded-full" />
          </button>

          {/* User Info */}
          {currentUser ? (
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-200 leading-none">{currentUser.name}</p>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border mt-1 inline-block ${getRoleColor(currentUser.role)}`}>
                  {currentUser.role}
                </span>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-600/30 to-blue-500/30 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <UserIcon className="h-4 w-4" />
              </div>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="p-2 rounded-lg border border-slate-800 hover:bg-red-500/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/auth/login')}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-sm font-semibold text-white shadow-lg transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* ─── Main Body ────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-60 border-r border-slate-900/60 bg-[#020617]/60 flex flex-col justify-between shrink-0 py-4">
          <nav className="px-3 space-y-0.5">
            <p className="text-[9px] font-black text-slate-600 tracking-widest uppercase px-3 mb-3">
              Navigation
            </p>
            {filteredNavItems.map((item) => {
              const active = isActive(item);
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                    active
                      ? 'bg-purple-600/10 text-purple-300 border border-purple-500/20 shadow-sm shadow-purple-500/10'
                      : 'text-slate-500 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={`transition-colors ${active ? 'text-purple-400' : 'text-slate-600 group-hover:text-slate-400'}`}>
                      {item.icon}
                    </span>
                    {item.name}
                  </span>
                  {active && <ChevronRight className="h-3 w-3 text-purple-400 shrink-0" />}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="px-3 space-y-2">
            <div className="border-t border-slate-900 pt-3">
              <button
                onClick={() => navigate('/dashboard/activity')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-slate-900/40 transition-all text-xs font-medium"
              >
                <Settings className="h-3.5 w-3.5" />
                Settings & Logs
              </button>
              <p className="text-[9px] text-slate-700 text-center mt-2">© 2026 VendorBridge Inc.</p>
            </div>
          </div>
        </aside>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#020617]">
          <div className="p-8 max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
