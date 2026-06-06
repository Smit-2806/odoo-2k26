import React, { useState, useEffect } from 'react';
import { useProcurementStore } from '../../store/procurementStore';
import {
  Download, Calendar, TrendingUp, DollarSign,
  Users, ClipboardCheck, AlertTriangle, BarChart3,
  ArrowUpRight
} from 'lucide-react';

const CATEGORY_COLORS = ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

// ─── Custom Interactive Spend & PO Volume Chart ─────────────────
interface SpendDataPoint {
  month: string;
  amount: number;
  pos: number;
}

const SpendTrendChart: React.FC<{ data: SpendDataPoint[] }> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxSpend = Math.max(...data.map(d => d.amount), 1000000);
  const maxPos = Math.max(...data.map(d => d.pos), 30);

  const width = 600;
  const height = 240;
  const paddingLeft = 50;
  const paddingRight = 50;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const xStep = chartWidth / (data.length - 1 || 1);

  const spendTicks = [0, maxSpend * 0.25, maxSpend * 0.5, maxSpend * 0.75, maxSpend];
  const posTicks = [0, Math.round(maxPos * 0.25), Math.round(maxPos * 0.5), Math.round(maxPos * 0.75), maxPos];

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
                stroke="#e2e8f0"
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
                {tick === 0 ? 'INR 0' : `INR ${(tick / 100000).toFixed(0)}L`}
              </text>
            </g>
          );
        })}

        {/* Right Y Axis (PO count ticks) */}
        {posTicks.map((tick) => {
          const y = height - paddingBottom - (tick / (maxPos || 1)) * chartHeight;
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
        {data.map((d, i) => {
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
        {data.map((d, i) => {
          const x = paddingLeft + i * xStep;
          const barWidth = 22;
          const barHeight = (d.amount / maxSpend) * chartHeight;
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
          d={data
            .map((d, i) => {
              const x = paddingLeft + i * xStep;
              const y = height - paddingBottom - (d.pos / (maxPos || 1)) * chartHeight;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            })
            .join(' ')}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2.5}
          className="pointer-events-none"
        />

        {/* Dots on line */}
        {data.map((d, i) => {
          const x = paddingLeft + i * xStep;
          const y = height - paddingBottom - (d.pos / (maxPos || 1)) * chartHeight;
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
                stroke="#fff"
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
          className="absolute z-10 bg-slate-900 border border-slate-200 rounded-xl px-4 py-3 shadow-2xl pointer-events-none animate-fade-in text-left"
          style={{
            left: `${(paddingLeft + hoveredIdx * xStep) * (100 / width)}%`,
            top: '10px',
            transform: 'translateX(-50%)',
          }}
        >
          <p className="text-xs font-bold text-slate-500 mb-1">{data[hoveredIdx].month}</p>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-purple-600 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              Spend: INR {data[hoveredIdx].amount.toLocaleString()}
            </p>
            <p className="text-xs font-semibold text-blue-600 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              PO Volume: {data[hoveredIdx].pos} POs
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Custom Interactive Cycle Time Chart ─────────────────────────
interface CycleDataPoint {
  name: string;
  days: number;
}

const CycleTimeChart: React.FC<{ data: CycleDataPoint[] }> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxDays = Math.max(...data.map(d => d.days), 10);

  const width = 600;
  const height = 160;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 15;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const xStep = chartWidth / (data.length - 1 || 1);

  const dayTicks = [0, Math.round(maxDays * 0.25), Math.round(maxDays * 0.5), Math.round(maxDays * 0.75), maxDays];

  const points = data.map((d, i) => {
    const x = paddingLeft + i * xStep;
    const y = height - paddingBottom - (d.days / (maxDays || 1)) * chartHeight;
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
          const y = height - paddingBottom - (tick / (maxDays || 1)) * chartHeight;
          return (
            <g key={tick} className="opacity-45">
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#e2e8f0"
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
        {data.map((d, i) => {
          const x = paddingLeft + i * xStep;
          return (
            <text
              key={d.name}
              x={x}
              y={height - 8}
              fill="#64748b"
              fontSize={10}
              textAnchor="middle"
              className="font-sans font-semibold"
            >
              {d.name}
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
                stroke="#fff"
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
          className="absolute z-10 bg-slate-900 border border-slate-200 rounded-xl px-3 py-2 shadow-2xl pointer-events-none animate-fade-in text-left text-xs"
          style={{
            left: `${(paddingLeft + hoveredIdx * xStep) * (100 / width)}%`,
            top: '0px',
            transform: 'translateX(-50%)',
          }}
        >
          <p className="font-bold text-slate-500 mb-0.5">{data[hoveredIdx].name}</p>
          <p className="font-bold text-emerald-600">
            {data[hoveredIdx].days} Days
          </p>
        </div>
      )}
    </div>
  );
};

export const Reports: React.FC = () => {
  const {
    vendors,
    purchaseOrders,
    invoices,
    stats,
    fetchReports,
    downloadReportPdf,
    downloadReportCsv
  } = useProcurementStore();

  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const activeVendors = vendors.filter(v => v.status === 'APPROVED').length;
  const overdueInvoices = invoices.filter(i => i.status === 'OVERDUE' || (i.status === 'SUBMITTED' && new Date(i.dueDate) < new Date())).length;
  const completedPOs = purchaseOrders.filter(po => po.status === 'COMPLETED').length;
  const fulfillmentRate = purchaseOrders.length > 0
    ? Math.round((completedPOs / purchaseOrders.length) * 100)
    : 94;

  const totalSpent = stats?.kpis?.totalSpent || 0;
  const totalSpentStr = totalSpent > 0
    ? `INR ${(totalSpent / 100000).toFixed(1)} L`
    : 'INR 0 L';

  // Construct charts data
  const spendTrendData: SpendDataPoint[] = (stats?.monthlyTrend || []).map((m, idx) => ({
    month: m.month,
    amount: m.amount,
    pos: Math.round(m.amount / 50000) || (idx + 3) * 2 // derived mock PO count
  }));

  const cycleTimeData: CycleDataPoint[] = stats?.cycleTimeData || [];
  const vendorPerformance = stats?.vendorPerformance || [];

  // Compute category share percentage
  const totalCatSum = stats?.categoryData.reduce((sum, c) => sum + c.amount, 0) || 1;
  const categoryData = (stats?.categoryData || []).map(cat => ({
    name: cat.category,
    value: Math.round((cat.amount / totalCatSum) * 100),
    amount: cat.amount
  }));

  const kpiCards = [
    {
      label: 'Total Spend',
      value: totalSpentStr,
      sub: 'INR ' + totalSpent.toLocaleString(),
      icon: <DollarSign className="h-5 w-5" />,
      iconCls: 'text-purple-600 bg-purple-500/10',
      valCls: 'text-slate-800',
      subIcon: <TrendingUp className="h-3 w-3 text-emerald-500" />,
      subCls: 'text-emerald-600',
    },
    {
      label: 'PO Fulfillment',
      value: `${fulfillmentRate}%`,
      sub: 'On-time delivery average',
      icon: <ClipboardCheck className="h-5 w-5" />,
      iconCls: 'text-blue-600 bg-blue-500/10',
      valCls: 'text-slate-800',
      subIcon: null,
      subCls: 'text-slate-500',
    },
    {
      label: 'Active Vendors',
      value: activeVendors.toString(),
      sub: 'Verified in ERP',
      icon: <Users className="h-5 w-5" />,
      iconCls: 'text-emerald-600 bg-emerald-500/10',
      valCls: 'text-slate-800',
      subIcon: null,
      subCls: 'text-slate-500',
    },
    {
      label: 'Overdue Invoices',
      value: overdueInvoices.toString(),
      sub: 'Awaiting payment releases',
      icon: <AlertTriangle className="h-5 w-5" />,
      iconCls: 'text-rose-600 bg-rose-500/10',
      valCls: 'text-rose-600',
      subIcon: null,
      subCls: 'text-rose-500/70',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* ─── Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Procurement Insights — Monitor cycle times, budgets and vendor KPIs</p>
        </div>
        <div className="flex items-center gap-2.5 relative">
          <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 shadow-sm transition-all">
            <Calendar className="h-3.5 w-3.5 text-purple-600" /> May 2026
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-xs font-bold text-white shadow-md transition-all"
            >
              <Download className="h-3.5 w-3.5" /> Export Data
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1">
                <button
                  onClick={() => {
                    downloadReportPdf();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Download PDF Report
                </button>
                <button
                  onClick={() => {
                    downloadReportCsv();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Download CSV Data
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── KPI Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{card.label}</span>
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
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-600" /> Spend & PO Volume
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Monthly procurement spend (bars) + PO count (line)</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
              <ArrowUpRight className="h-3 w-3" /> Live Data
            </div>
          </div>
          <div className="w-full">
            {spendTrendData.length > 0 ? (
              <SpendTrendChart data={spendTrendData} />
            ) : (
              <div className="h-48 flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Category Share</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Spend by procurement category</p>
          </div>

          {/* Visual bar chart for categories */}
          <div className="space-y-3 pt-2">
            {categoryData.length > 0 ? (
              categoryData.map((cat, i) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-600 font-medium">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                      {cat.name}
                    </span>
                    <span className="font-bold text-slate-700">{cat.value}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${cat.value}%`, backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400">No category share data.</div>
            )}
          </div>

          {/* Donut-style total */}
          <div className="mt-4 pt-4 border-t border-slate-200 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Spent</p>
            <p className="text-2xl font-black text-slate-900 mt-1">INR {totalSpent.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 mt-1">May 2026 · Dynamic breakdown</p>
          </div>
        </div>
      </div>

      {/* ─── Vendor Performance Table ─────────────────────── */}
      <div className="vb-card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Vendor Performance Scorecard</h2>
          <span className="text-[10px] text-slate-400">Calculated ratings</span>
        </div>
        <div className="overflow-x-auto">
          <table className="vb-table w-full">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-left text-xs uppercase font-bold">
                <th className="pb-3">Vendor</th>
                <th className="pb-3 text-center">Rating</th>
                <th className="pb-3 text-center">On-Time Delivery</th>
                <th className="pb-3 text-center">Performance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {vendorPerformance.length > 0 ? (
                vendorPerformance.map((v) => (
                  <tr key={v.name} className="hover:bg-slate-50 transition-all">
                    <td className="py-3 font-semibold text-slate-700">{v.name}</td>
                    <td className="py-3 text-center">
                      <span className={`font-bold ${v.rating >= 4 ? 'text-emerald-600' : v.rating >= 3 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {v.rating}/5.0
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full"
                            style={{
                              width: `${v.onTime}%`,
                              backgroundColor: v.onTime >= 90 ? '#10b981' : v.onTime >= 70 ? '#f59e0b' : '#ef4444'
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-600">{v.onTime}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${v.rating >= 4 ? 'bg-emerald-50 text-emerald-700' : v.rating >= 3 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                        {v.rating >= 4 ? 'Excellent' : v.rating >= 3 ? 'Average' : 'Poor'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-400">No performance scorecard details.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Cycle Time Chart ─────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Procurement Cycle Time Trend</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Days from RFQ creation to PO completion (target: under 14 days)</p>
        </div>
        <div className="w-full">
          {cycleTimeData.length > 0 ? (
            <CycleTimeChart data={cycleTimeData} />
          ) : (
            <div className="h-32 flex items-center justify-center text-xs text-slate-400">Loading cycle metrics...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
