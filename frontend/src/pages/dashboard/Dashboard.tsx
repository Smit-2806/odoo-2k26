import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProcurementStore } from '../../store/procurementStore';
import {
  FileSignature, CheckSquare, ShoppingBag, Plus,
  Users, Receipt, AlertTriangle, ArrowRight, TrendingUp,
  TrendingDown, Activity
} from 'lucide-react';

const spendData = [
  { month: 'Jan', spend: 320000 },
  { month: 'Feb', spend: 450000 },
  { month: 'Mar', spend: 290000 },
  { month: 'Apr', spend: 510000 },
  { month: 'May', spend: 1240000 },
  { month: 'Jun', spend: 600000 },
];

const DashboardSpendChart: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxSpend = 1300000;

  const width = 600;
  const height = 200;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 15;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const xStep = chartWidth / (spendData.length - 1);

  const spendTicks = [0, 300000, 600000, 900000, 1200000];

  const points = spendData.map((d, i) => {
    const x = paddingLeft + i * xStep;
    const y = height - paddingBottom - (d.spend / maxSpend) * chartHeight;
    return { x, y };
  });

  const areaPath = [
    `M ${points[0].x} ${height - paddingBottom}`,
    ...points.map(p => `L ${p.x} ${p.y}`),
    `L ${points[points.length - 1].x} ${height - paddingBottom}`,
    'Z'
  ].join(' ');

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none overflow-visible">
        <defs>
          <linearGradient id="dashboardSpendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#a855f7" stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {spendTicks.map((tick) => {
          const y = height - paddingBottom - (tick / maxSpend) * chartHeight;
          return (
            <g key={tick} className="opacity-45">
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#1e293b"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 10}
                y={y + 3}
                fill="#64748b"
                fontSize={10}
                textAnchor="end"
                className="font-sans font-medium"
              >
                {tick === 0 ? '₹0' : `₹${(tick / 100000).toFixed(0)}L`}
              </text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {spendData.map((d, i) => {
          const x = paddingLeft + i * xStep;
          return (
            <text
              key={d.month}
              x={x}
              y={height - 8}
              fill="#64748b"
              fontSize={10}
              textAnchor="middle"
              className="font-sans font-semibold"
            >
              {d.month}
            </text>
          );
        })}

        {/* Filled Area */}
        <path d={areaPath} fill="url(#dashboardSpendGrad)" className="pointer-events-none" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#a855f7" strokeWidth={2.5} className="pointer-events-none" />

        {/* Dots */}
        {points.map((p, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <g key={`dashboard-spend-dot-${i}`}>
              {/* Invisible interactive zone for hovering */}
              <rect
                x={p.x - xStep / 2}
                y={paddingTop}
                width={xStep}
                height={chartHeight + 10}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 5 : 3.5}
                fill="#a855f7"
                stroke="#0f172a"
                strokeWidth={1.5}
                className="transition-all duration-200 pointer-events-none"
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip Overlay */}
      {hoveredIdx !== null && (
        <div
          className="absolute z-10 bg-slate-950/95 border border-slate-800 rounded-xl px-3 py-2 shadow-2xl pointer-events-none animate-fade-in text-left text-xs"
          style={{
            left: `${(paddingLeft + hoveredIdx * xStep) * (100 / width)}%`,
            top: '0px',
            transform: 'translateX(-50%)',
          }}
        >
          <p className="font-bold text-slate-400 mb-0.5">{spendData[hoveredIdx].month}</p>
          <p className="font-bold text-purple-400">
            ₹{(spendData[hoveredIdx].spend / 100000).toFixed(2)}L
          </p>
        </div>
      )}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, purchaseOrders, rfqs, invoices, vendors } = useProcurementStore();

  const activeRfqsCount = rfqs.filter(r => r.status === 'PUBLISHED').length;
  const pendingApprovalsCount = purchaseOrders.filter(po => po.status === 'SENT').length;
  const posThisMonth = purchaseOrders.length;
  const overdueInvoicesCount = invoices.filter(i => i.status === 'SUBMITTED').length;
  const activeVendors = vendors.filter(v => v.status === 'APPROVED').length;

  const kpiCards = [
    {
      label: "Active RFQ's",
      value: activeRfqsCount,
      icon: <FileSignature className="h-5 w-5" />,
      color: 'purple',
      bg: 'bg-purple-500/10',
      iconColor: 'text-purple-400',
      border: 'border-purple-500/20',
      trend: '+2 this week',
      up: true,
      path: '/dashboard/rfqs',
    },
    {
      label: 'Pending Approvals',
      value: pendingApprovalsCount,
      icon: <CheckSquare className="h-5 w-5" />,
      color: 'amber',
      bg: 'bg-amber-500/10',
      iconColor: 'text-amber-400',
      border: 'border-amber-500/20',
      trend: 'Needs action',
      up: false,
      path: '/dashboard/approvals',
    },
    {
      label: "PO's This Month",
      value: posThisMonth,
      icon: <ShoppingBag className="h-5 w-5" />,
      color: 'blue',
      bg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
      border: 'border-blue-500/20',
      trend: '+1 today',
      up: true,
      path: '/dashboard/purchase-orders',
    },
    {
      label: 'Overdue Invoices',
      value: overdueInvoicesCount,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'rose',
      bg: 'bg-rose-500/10',
      iconColor: 'text-rose-400',
      border: 'border-rose-500/20',
      trend: 'Needs clearance',
      up: false,
      path: '/dashboard/invoices',
    },
  ];

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      ACCEPTED: 'badge badge-approved',
      SENT: 'badge badge-pending',
      COMPLETED: 'badge badge-paid',
      DRAFT: 'badge badge-draft',
      CANCELLED: 'badge badge-rejected',
    };
    return map[status] || 'badge badge-draft';
  };

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ─── Welcome Banner ───────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-slate-900/80 p-6">
        {/* Ambient glow */}
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Platform Active</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Welcome back, {currentUser?.name?.split(' ')[0] || 'Procurement Officer'} 👋
            </h1>
            <p className="text-sm text-slate-400">
              Today's Overview — {activeVendors} active vendors · {activeRfqsCount} open RFQs · {posThisMonth} POs this month
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => navigate('/dashboard/vendors')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700/60 bg-slate-900/60 hover:bg-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white transition-all"
            >
              <Users className="h-3.5 w-3.5 text-purple-400" />
              Add Vendor
            </button>
            <button
              onClick={() => navigate('/dashboard/invoices')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700/60 bg-slate-900/60 hover:bg-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white transition-all"
            >
              <Receipt className="h-3.5 w-3.5 text-blue-400" />
              View Invoices
            </button>
            <button
              onClick={() => navigate('/dashboard/rfqs')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-xs font-bold text-white shadow-lg shadow-purple-600/20 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              + New RFQ
            </button>
          </div>
        </div>
      </div>

      {/* ─── KPI Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <button
            key={card.label}
            onClick={() => navigate(card.path)}
            className={`animate-fade-in-up stagger-${i + 1} group text-left p-5 rounded-2xl border bg-slate-900/40 hover:bg-slate-900/70 transition-all duration-200 hover:shadow-lg ${card.border}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <span className={card.iconColor}>{card.icon}</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-700 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">{card.label}</p>
              <p className="text-3xl font-black text-white tabular-nums">{card.value}</p>
              <div className="flex items-center gap-1 mt-1.5">
                {card.up
                  ? <TrendingUp className="h-3 w-3 text-emerald-400" />
                  : <TrendingDown className="h-3 w-3 text-amber-400" />
                }
                <span className={`text-[10px] font-semibold ${card.up ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {card.trend}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* ─── Chart + Table Grid ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Spending Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Spending Trends</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Last 6 months · procurement spend</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <Activity className="h-3 w-3" />
              Live
            </div>
          </div>
          <div className="w-full">
            <DashboardSpendChart />
          </div>
        </div>

        {/* Recent Purchase Orders */}
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Recent Orders</h2>
            <button
              onClick={() => navigate('/dashboard/purchase-orders')}
              className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2">
            {purchaseOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No purchase orders yet</p>
              </div>
            ) : (
              purchaseOrders.slice(-5).reverse().map((po) => {
                const invoice = invoices.find(i => i.purchaseOrderId === po.id);
                return (
                  <div
                    key={po.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-900/60 hover:border-slate-800 transition-all cursor-pointer"
                    onClick={() => navigate('/dashboard/purchase-orders')}
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-200">{po.poNumber}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[100px]">{po.vendorName}</p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="text-xs font-bold text-slate-200">
                        ₹{po.totalAmount.toLocaleString('en-IN')}
                      </p>
                      <span className={getStatusBadge(invoice?.status || po.status)}>
                        {invoice?.status || po.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ─── Bottom Stats Row ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Active Vendors</p>
            <p className="text-2xl font-black text-emerald-400">{activeVendors}</p>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
            <FileSignature className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Total RFQs</p>
            <p className="text-2xl font-black text-blue-400">{rfqs.length}</p>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Total Invoices</p>
            <p className="text-2xl font-black text-purple-400">{invoices.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
