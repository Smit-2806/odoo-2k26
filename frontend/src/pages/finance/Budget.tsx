import React, { useState, useEffect } from 'react';
import { useProcurementStore } from '../../store/procurementStore';
import {
  DollarSign, Plus, Layers, Clock, TrendingUp
} from 'lucide-react';

export const Budget: React.FC = () => {
  const {
    budgets,
    expenses,
    fetchBudgets,
    fetchExpenses,
    createBudget,
    createExpense
  } = useProcurementStore();

  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Form states
  const [budgetName, setBudgetName] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  
  const [expenseBudgetId, setExpenseBudgetId] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  useEffect(() => {
    fetchBudgets();
    fetchExpenses();
  }, [fetchBudgets, fetchExpenses]);

  // Calculate metrics
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.used, 0);
  const remainingBudget = totalBudgeted - totalSpent;

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetName || !budgetAmount) return;
    await createBudget(budgetName, parseFloat(budgetAmount));
    setBudgetName('');
    setBudgetAmount('');
    setShowAddBudget(false);
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseBudgetId || !expenseDescription || !expenseAmount) return;
    await createExpense(expenseBudgetId, expenseDescription, parseFloat(expenseAmount));
    setExpenseBudgetId('');
    setExpenseDescription('');
    setExpenseAmount('');
    setShowAddExpense(false);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* ─── Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Finance & Budgets</h1>
          <p className="text-sm text-slate-500 mt-0.5">Control corporate procurement limits and track actual spending</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddBudget(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 shadow-sm transition-all"
          >
            <Plus className="h-3.5 w-3.5" /> New Budget Limit
          </button>
          <button
            onClick={() => {
              if (budgets.length > 0) {
                setExpenseBudgetId(budgets[0].id);
              }
              setShowAddExpense(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-xs font-bold text-white shadow-md transition-all"
          >
            <Plus className="h-3.5 w-3.5" /> Record Expense
          </button>
        </div>
      </div>

      {/* ─── Overview Stats Cards ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Allocated Budget',
            value: `INR ${totalBudgeted.toLocaleString()}`,
            sub: `${budgets.length} active departments`,
            cls: 'text-slate-800',
            bg: 'bg-white',
            border: 'border-slate-200',
            icon: <Layers className="h-5 w-5 text-purple-600" />
          },
          {
            label: 'Actual Spend / Used',
            value: `INR ${totalSpent.toLocaleString()}`,
            sub: `${((totalSpent / (totalBudgeted || 1)) * 100).toFixed(1)}% usage rate`,
            cls: 'text-slate-800',
            bg: 'bg-white',
            border: 'border-slate-200',
            icon: <TrendingUp className="h-5 w-5 text-emerald-600" />
          },
          {
            label: 'Available Funds',
            value: `INR ${remainingBudget.toLocaleString()}`,
            sub: 'Remaining for allocation',
            cls: remainingBudget < 0 ? 'text-rose-600' : 'text-slate-800',
            bg: 'bg-white',
            border: 'border-slate-200',
            icon: <DollarSign className="h-5 w-5 text-blue-600" />
          }
        ].map((card, i) => (
          <div key={i} className={`p-5 rounded-2xl border ${card.border} ${card.bg} shadow-sm flex items-center justify-between`}>
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{card.label}</span>
              <p className={`text-2xl font-black ${card.cls}`}>{card.value}</p>
              <p className="text-xs text-slate-500">{card.sub}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">{card.icon}</div>
          </div>
        ))}
      </div>

      {/* ─── Main Grid Layout (Budgets & Expenses) ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Budgets List (2/3 width) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-purple-600" /> Budget Allocations
          </h2>
          
          <div className="overflow-x-auto">
            <table className="vb-table w-full">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-left text-xs uppercase font-bold">
                  <th className="pb-3">Budget Department / Title</th>
                  <th className="pb-3 text-right">Allocated Limit</th>
                  <th className="pb-3 text-right">Spent / Used</th>
                  <th className="pb-3 text-right">Available</th>
                  <th className="pb-3 pl-4">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {budgets.length > 0 ? (
                  budgets.map((b) => {
                    const avail = b.amount - b.used;
                    const percent = Math.min(Math.round((b.used / b.amount) * 100), 100);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50 transition-all">
                        <td className="py-3 font-semibold text-slate-700">{b.name}</td>
                        <td className="py-3 text-right font-bold">INR {b.amount.toLocaleString()}</td>
                        <td className="py-3 text-right text-slate-600">INR {b.used.toLocaleString()}</td>
                        <td className={`py-3 text-right font-bold ${avail < 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                          INR {avail.toLocaleString()}
                        </td>
                        <td className="py-3 pl-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${percent}%`,
                                  backgroundColor: percent >= 90 ? '#ef4444' : percent >= 75 ? '#f59e0b' : '#10b981'
                                }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-500">{percent}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400">No active budgets allocated.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Feed (1/3 width) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" /> Recent Spend Log
          </h2>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {expenses.length > 0 ? (
              expenses.map((e) => (
                <div key={e.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-700">{e.description}</p>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                        {e.budget?.name || 'Department'}
                      </span>
                      <span>·</span>
                      <span>{new Date(e.incurredAt || e.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-950">INR {e.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">No recorded expenses yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Modals ────────────────────────────────────────── */}
      {showAddBudget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Create Budget Limit</h3>
              <button onClick={() => setShowAddBudget(false)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
            </div>
            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Department / Budget Name</label>
                <input
                  type="text"
                  placeholder="e.g. IT Equipment, Office Furniture 2026"
                  value={budgetName}
                  onChange={(e) => setBudgetName(e.target.value)}
                  className="vb-input w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Limit Amount (INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 500000"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="vb-input w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBudget(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-md"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddExpense && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Record Expense</h3>
              <button onClick={() => setShowAddExpense(false)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
            </div>
            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Select Budget Category</label>
                <select
                  value={expenseBudgetId}
                  onChange={(e) => setExpenseBudgetId(e.target.value)}
                  className="vb-input w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                  required
                >
                  {budgets.map(b => (
                    <option key={b.id} value={b.id}>{b.name} (Limit: INR {b.amount.toLocaleString()})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Purchased 5 office chairs"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="vb-input w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Expense Amount (INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 25000"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="vb-input w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-md"
                >
                  Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;
