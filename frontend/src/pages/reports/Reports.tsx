import React, { useState } from 'react';
import { useProcurementStore } from '../../store/procurementStore';
import {
  Download, Calendar, TrendingUp, DollarSign,
  Users, ClipboardCheck, AlertTriangle, BarChart3,
  ArrowUpRight
} from 'lucide-react';

const spendData = [
  { month: 'Jan', spend: 320000, pos: 8 },
  { month: 'Feb', spend: 450000, pos: 12 },
  { month: 'Mar', spend: 290000, pos: 7 },
  { month: 'Apr', spend: 510000, pos: 15 },
  { month: 'May', spend: 1240000, pos: 28 },
  { month: 'Jun', spend: 600000, pos: 18 },
];

const cycleTimeData = [
  { month: 'Jan', days: 18 },
  { month: 'Feb', days: 16 },
  { month: 'Mar', days: 14 },
  { month: 'Apr', days: 13 },
  { month: 'May', days: 11 },
  { month: 'Jun', days: 12 },
];

const vendorPerformanceData = [
  { name: 'Infra Supplies', rating: 4.5, onTime: 98, invoices: 12 },
  { name: 'Tech Core',      rating: 4.2, onTime: 88, invoices: 8 },
  { name: 'OfficeNeed Co',  rating: 3.8, onTime: 75, invoices: 5 },
  { name: 'FastLog',        rating: 2.5, onTime: 50, invoices: 3 },
];

const categoryData = [
  { name: 'Office Furniture', value: 65 },
  { name: 'IT Hardware',      value: 25 },
  { name: 'Logistics',        value: 10 },
];

const CATEGORY_COLORS = ['#a855f7', '#3b82f6', '#10b981'];

// ─── Custom Interactive Spend & PO Volume Chart ─────────────────
const SpendTrendChart: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxSpend = 1300000;
  const maxPos = 30;

  const width = 600;
  const height = 240;
  const paddingLeft = 50;
  const paddingRight = 50;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const xStep = chartWidth / (spendData.length - 1);

  const spendTicks = [0, 300000, 600000, 900000, 1200000];
  const posTicks = [0, 7, 15, 22, 30];

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none overflow-visible">
        <defs>
          <linearGradient id="spendBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity={0.85} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
          </linearGradient>
          <linearGradient id="hoverBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" stopOpacity={0.95} />
            <stop offset="100%" stopColor="#818cf8" stopOpacity={0.4} />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
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
              {/* Left Y Axis (Spend) */}
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

        {/* Right Y Axis (PO count ticks) */}
        {posTicks.map((tick) => {
          const y = height - paddingBottom - (tick / maxPos) * chartHeight;
          return (
            <text
              key={tick}
              x={width - paddingRight + 10}
              y={y + 3}
              fill="#64748b"
              fontSize={10}
              textAnchor="start"
              className="font-sans font-medium opacity-60"
            >
              {tick}
            </text>
          );
        })}

        {/* X Axis Labels */}
        {spendData.map((d, i) => {
          const x = paddingLeft + i * xStep;
          return (
            <text
              key={d.month}
              x={x}
              y={height - 15}
              fill="#64748b"
              fontSize={10}
              textAnchor="middle"
              className="font-sans font-semibold"
            >
              {d.month}
            </text>
          );
        })}

        {/* Bars for Spend */}
        {spendData.map((d, i) => {
          const x = paddingLeft + i * xStep;
          const barWidth = 22;
          const barHeight = (d.spend / maxSpend) * chartHeight;
          const barX = x - barWidth / 2;
          const barY = height - paddingBottom - barHeight;

          const isHovered = hoveredIdx === i;

          return (
            <rect
              key={d.month}
              x={barX}
              y={barY}
              width={barWidth}
              height={Math.max(barHeight, 2)}
              rx={4}
              fill={isHovered ? 'url(#hoverBarGrad)' : 'url(#spendBarGrad)'}
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          );
        })}

        {/* Line for PO count */}
        <path
          d={spendData
            .map((d, i) => {
              const x = paddingLeft + i * xStep;
              const y = height - paddingBottom - (d.pos / maxPos) * chartHeight;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            })
            .join(' ')}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2.5}
          className="pointer-events-none"
        />

        {/* Dots on line */}
        {spendData.map((d, i) => {
          const x = paddingLeft + i * xStep;
          const y = height - paddingBottom - (d.pos / maxPos) * chartHeight;
          const isHovered = hoveredIdx === i;

          return (
            <g key={`dot-${d.month}`}>
              {/* Invisible interactive zone for hovering */}
              <rect
                x={x - xStep / 2}
                y={paddingTop}
                width={xStep}
                height={chartHeight + 10}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 5 : 3.5}
                fill="#3b82f6"
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
          className="absolute z-10 bg-slate-950/95 border border-slate-800 rounded-xl px-4 py-3 shadow-2xl pointer-events-none animate-fade-in text-left"
          style={{
            left: `${(paddingLeft + hoveredIdx * xStep) * (100 / width)}%`,
            top: '10px',
            transform: 'translateX(-50%)',
          }}
        >
          <p className="text-xs font-bold text-slate-400 mb-1">{spendData[hoveredIdx].month}</p>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              Spend: ₹{(spendData[hoveredIdx].spend / 100000).toFixed(2)}L
            </p>
            <p className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              PO Volume: {spendData[hoveredIdx].pos} POs
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Custom Interactive Cycle Time Chart ─────────────────────────
const CycleTimeChart: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxDays = 20;

  const width = 600;
  const height = 160;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 15;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const xStep = chartWidth / (cycleTimeData.length - 1);

  const dayTicks = [0, 5, 10, 15, 20];

  const points = cycleTimeData.map((d, i) => {
    const x = paddingLeft + i * xStep;
    const y = height - paddingBottom - (d.days / maxDays) * chartHeight;
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
          <linearGradient id="cycleGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {dayTicks.map((tick) => {
          const y = height - paddingBottom - (tick / maxDays) * chartHeight;
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
                {tick}d
              </text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {cycleTimeData.map((d, i) => {
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
        <path d={areaPath} fill="url(#cycleGrad)" className="pointer-events-none" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#10b981" strokeWidth={2.5} className="pointer-events-none" />

        {/* Dots */}
        {points.map((p, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <g key={`cycle-dot-${i}`}>
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
                fill="#10b981"
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
          <p className="font-bold text-slate-400 mb-0.5">{cycleTimeData[hoveredIdx].month}</p>
          <p className="font-bold text-emerald-400">
            {cycleTimeData[hoveredIdx].days} Days
          </p>
        </div>
      )}
    </div>
  );
};

export const Reports: React.FC = () => {
  const { vendors, purchaseOrders, invoices, stats } = useProcurementStore();

  const activeVendors = vendors.filter(v => v.status === 'APPROVED').length;
  const overdueInvoices = invoices.filter(i => i.status === 'SUBMITTED').length;
  const completedPOs = purchaseOrders.filter(po => po.status === 'COMPLETED').length;
  const fulfillmentRate = purchaseOrders.length > 0
    ? Math.round((completedPOs / purchaseOrders.length) * 100)
    : 94;

  const totalSpentStr = stats?.kpis?.totalSpent
    ? `₹${(stats.kpis.totalSpent / 100000).toFixed(1)} L`
    : '12.4 L';

  const kpiCards = [
    {
      label: 'Total Spend',
      value: totalSpentStr,
      sub: '+18% vs last month',
      icon: <DollarSign className="h-5 w-5" />,
      iconCls: 'text-purple-400 bg-purple-500/10',
      valCls: 'text-white',
      subIcon: <TrendingUp className="h-3 w-3 text-emerald-400" />,
      subCls: 'text-emerald-400',
    },
    {
      label: 'PO Fulfillment',
      value: `${fulfillmentRate}%`,
      sub: 'On-time delivery avg',
      icon: <ClipboardCheck className="h-5 w-5" />,
      iconCls: 'text-blue-400 bg-blue-500/10',
      valCls: 'text-white',
      subIcon: null,
      subCls: 'text-slate-400',
    },
    {
      label: 'Active Vendors',
      value: activeVendors.toString(),
      sub: 'Verified in system',
      icon: <Users className="h-5 w-5" />,
      iconCls: 'text-emerald-400 bg-emerald-500/10',
      valCls: 'text-white',
      subIcon: null,
      subCls: 'text-slate-400',
    },
    {
      label: 'Overdue Invoices',
      value: overdueInvoices.toString(),
      sub: 'Awaiting payment',
      icon: <AlertTriangle className="h-5 w-5" />,
      iconCls: 'text-rose-400 bg-rose-500/10',
      valCls: 'text-rose-400',
      subIcon: null,
      subCls: 'text-rose-400/70',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ─── Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-slate-400 mt-0.5">Procurement Insights — Monitor cycle times, budgets and vendor KPIs</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-all">
            <Calendar className="h-3.5 w-3.5 text-purple-400" /> May 2025
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-xs font-bold text-white shadow-lg transition-all">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      {/* ─── KPI Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <div key={card.label} className={`animate-fade-in-up stagger-${i + 1} p-5 bg-slate-900/40 border border-slate-800/60 rounded-2xl space-y-3`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{card.label}</span>
              <div className={`p-2 rounded-xl ${card.iconCls}`}>{card.icon}</div>
            </div>
            <p className={`text-3xl font-black ${card.valCls}`}>{card.value}</p>
            <div className="flex items-center gap-1">
              {card.subIcon}
              <span className={`text-[10px] font-semibold ${card.subCls}`}>{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Main Charts Row ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Spend Trend – Bar + Line */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-400" /> Spend & PO Volume
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Monthly procurement spend (bars) + PO count (line)</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <ArrowUpRight className="h-3 w-3" /> +18% MoM
            </div>
          </div>
          <div className="w-full">
            <SpendTrendChart />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white">Category Share</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Spend by procurement category</p>
          </div>

          {/* Visual bar chart for categories */}
          <div className="space-y-3 pt-2">
            {categoryData.map((cat, i) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-300 font-medium">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[i] }} />
                    {cat.name}
                  </span>
                  <span className="font-bold text-slate-200">{cat.value}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${cat.value}%`, backgroundColor: CATEGORY_COLORS[i] }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Donut-style total */}
          <div className="mt-4 pt-4 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Spend</p>
            <p className="text-2xl font-black text-white mt-1">₹12.4L</p>
            <p className="text-[10px] text-slate-500 mt-1">May 2025 · 3 categories</p>
          </div>
        </div>
      </div>

      {/* ─── Vendor Performance Table ─────────────────────── */}
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Vendor Performance Scorecard</h2>
          <span className="text-[10px] text-slate-500">Last 6 months</span>
        </div>
        <div className="overflow-x-auto">
          <table className="vb-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th className="text-center">Rating</th>
                <th className="text-center">On-Time Delivery</th>
                <th className="text-center">Invoice Count</th>
                <th className="text-center">Performance</th>
              </tr>
            </thead>
            <tbody>
              {vendorPerformanceData.map((v) => (
                <tr key={v.name}>
                  <td className="font-semibold text-slate-200">{v.name}</td>
                  <td className="text-center">
                    <span className={`font-bold text-sm ${v.rating >= 4 ? 'text-emerald-400' : v.rating >= 3 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {v.rating}/5
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${v.onTime}%`,
                            backgroundColor: v.onTime >= 90 ? '#10b981' : v.onTime >= 70 ? '#f59e0b' : '#ef4444'
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-300">{v.onTime}%</span>
                    </div>
                  </td>
                  <td className="text-center text-slate-300 text-sm font-bold">{v.invoices}</td>
                  <td className="text-center">
                    <span className={`badge ${v.rating >= 4 ? 'badge-approved' : v.rating >= 3 ? 'badge-pending' : 'badge-rejected'}`}>
                      {v.rating >= 4 ? 'Excellent' : v.rating >= 3 ? 'Average' : 'Poor'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Cycle Time Chart ─────────────────────────────── */}
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white">Procurement Cycle Time Trend</h2>
          <p className="text-[10px] text-slate-500 mt-0.5">Days from RFQ creation to PO completion (target: under 14 days)</p>
        </div>
        <div className="w-full">
          <CycleTimeChart />
        </div>
      </div>
    </div>
  );
};

export default Reports;
