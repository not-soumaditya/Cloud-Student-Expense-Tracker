import { useState, useEffect } from 'react';
import { 
  HiPlus, 
  HiTrash, 
  HiExclamationTriangle,
  HiCreditCard,
  HiCalendar,
  HiCheckCircle,
  HiTag
} from 'react-icons/hi2';
import API from '../api/axios';
import toast from 'react-hot-toast';

function BudgetPage() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [form, setForm] = useState({ category_id: '', budget_limit: '', month: '' });

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  const loadData = async () => {
    try {
      const [budgetRes, catRes] = await Promise.all([
        API.get('/budgets', { params: { month: currentMonth } }),
        API.get('/categories'),
      ]);
      setBudgets(budgetRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to load budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/budgets', { ...form, month: currentMonth });
      toast.success('Budget set successfully!');
      setShowForm(false);
      setForm({ category_id: '', budget_limit: '', month: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to set budget');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget target?')) return;
    try {
      await API.delete(`/budgets/${id}`);
      toast.success('Budget deleted');
      loadData();
    } catch (err) {
      toast.error('Failed to delete budget');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-200 border-t-violet-600"></div>
      </div>
    );
  }

  const usedCategoryIds = budgets.map(b => b.category_id);
  const availableCategories = categories.filter(c => !usedCategoryIds.includes(c.id));

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 outline-none transition-all duration-200";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Budget Limits
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Set and monitor category-wise spending thresholds
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-sm">
            <HiCalendar className="w-4 h-4 text-violet-500" />
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="bg-transparent text-sm text-slate-700 dark:text-slate-200 outline-none font-medium"
            />
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/25 text-xs sm:text-sm font-semibold transition-all duration-200"
          >
            <HiPlus className="w-4 h-4" /> Set Budget
          </button>
        </div>
      </div>

      {/* Add Budget Form */}
      {showForm && (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm animate-in fade-in duration-200">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Set Category Target</h2>
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                Category *
              </label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className={inputClass}
                required
              >
                <option value="">Select category</option>
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                Budget Limit (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                value={form.budget_limit}
                onChange={(e) => setForm({ ...form, budget_limit: e.target.value })}
                className={inputClass}
                placeholder="5000"
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md shadow-violet-500/20 transition-all duration-200 font-semibold text-sm"
            >
              Save Target
            </button>
          </form>
        </div>
      )}

      {/* Budget Cards */}
      {budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {budgets.map((budget) => {
            const percentage = budget.budget_limit > 0
              ? Math.min((budget.spent / budget.budget_limit) * 100, 100)
              : 0;
            const isOver = budget.spent > budget.budget_limit;
            const isWarning = !isOver && percentage > 80;

            let barGradient = 'from-emerald-500 to-teal-500';
            let ringColor = 'border-slate-100 dark:border-slate-800/80';
            if (isOver) {
              barGradient = 'from-rose-500 to-red-600';
              ringColor = 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10';
            } else if (isWarning) {
              barGradient = 'from-amber-400 to-amber-500';
            }

            return (
              <div
                key={budget.id}
                className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all duration-200 ${ringColor}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: budget.category_color || '#7c3aed' }}
                    >
                      <HiTag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {budget.category_name}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Monthly target
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOver && (
                      <span className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-100 dark:bg-rose-950/60 px-2.5 py-1 rounded-full">
                        <HiExclamationTriangle className="w-3.5 h-3.5" /> Over Budget
                      </span>
                    )}
                    {isWarning && (
                      <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 rounded-full">
                        80%+ Used
                      </span>
                    )}
                    {!isOver && !isWarning && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                        <HiCheckCircle className="w-3.5 h-3.5" /> On Track
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete Budget"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mb-3 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full bg-gradient-to-r ${barGradient} transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Stats */}
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-semibold ${isOver ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    ₹{budget.spent.toLocaleString('en-IN')} spent
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 font-medium">
                    Limit: ₹{Number(budget.budget_limit).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className={`text-[11px] mt-1.5 ${isOver ? 'text-rose-500 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                  {isOver
                    ? `₹${(budget.spent - Number(budget.budget_limit)).toLocaleString('en-IN')} exceeded`
                    : `₹${(Number(budget.budget_limit) - budget.spent).toLocaleString('en-IN')} remaining`
                  }
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-800 p-16 text-center shadow-sm">
          <HiCreditCard className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400 dark:text-slate-500 mb-3 font-medium text-sm">No monthly budgets configured for this month.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-violet-600 dark:text-violet-400 hover:underline text-xs font-semibold"
          >
            + Set your first budget limit
          </button>
        </div>
      )}
    </div>
  );
}

export default BudgetPage;
