import { useState, useEffect, useCallback } from 'react';
import { HiXMark, HiTag, HiCalendar, HiCreditCard, HiChatBubbleBottomCenterText, HiCurrencyRupee, HiExclamationTriangle, HiExclamationCircle } from 'react-icons/hi2';
import API from '../api/axios';
import toast from 'react-hot-toast';

function ExpenseForm({ expense, onClose, onSaved }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    amount: '',
    description: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'UPI',
  });
  const [loading, setLoading] = useState(false);
  const [budgetWarning, setBudgetWarning] = useState({ category: null, overall: null });
  const [showFutureConfirm, setShowFutureConfirm] = useState(false);

  useEffect(() => {
    API.get('/categories').then(res => setCategories(res.data)).catch(() => {});
    if (expense) {
      setForm({
        amount: expense.amount,
        description: expense.description || '',
        category_id: expense.category_id || '',
        date: expense.date ? expense.date.split('T')[0] : '',
        payment_method: expense.payment_method || 'UPI',
      });
    }
  }, [expense]);

  // Budget check — runs when category, amount, or date changes
  const checkBudget = useCallback(async () => {
    if (!form.category_id || !form.amount || !form.date) {
      setBudgetWarning({ category: null, overall: null });
      return;
    }

    const month = form.date.slice(0, 7);
    try {
      const res = await API.get('/expenses/stats/budget-check', {
        params: { category_id: form.category_id, month }
      });
      const { category, overall } = res.data;
      const newAmount = parseFloat(form.amount) || 0;

      let catWarning = null;
      if (category.budget_limit !== null) {
        const projectedSpent = category.spent + newAmount;
        if (projectedSpent > category.budget_limit) {
          const overBy = projectedSpent - category.budget_limit;
          catWarning = `This will put you ₹${overBy.toLocaleString('en-IN')} over your ${category.category_name} budget (₹${category.spent.toLocaleString('en-IN')} + ₹${newAmount.toLocaleString('en-IN')} / ₹${category.budget_limit.toLocaleString('en-IN')})`;
        }
      }

      let overallWarning = null;
      if (overall.budget_limit !== null) {
        const projectedTotal = overall.total_spent + newAmount;
        if (projectedTotal > overall.budget_limit) {
          const overBy = projectedTotal - overall.budget_limit;
          overallWarning = `This will exceed your monthly budget by ₹${overBy.toLocaleString('en-IN')} (₹${overall.total_spent.toLocaleString('en-IN')} + ₹${newAmount.toLocaleString('en-IN')} / ₹${overall.budget_limit.toLocaleString('en-IN')})`;
        }
      }

      setBudgetWarning({ category: catWarning, overall: overallWarning });
    } catch {
      // Silently fail — budget check is informational
    }
  }, [form.category_id, form.amount, form.date]);

  useEffect(() => {
    const timer = setTimeout(checkBudget, 400); // debounce 400ms
    return () => clearTimeout(timer);
  }, [checkBudget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.date) {
      toast.error('Amount and date are required');
      return;
    }

    // Future date check
    const today = new Date().toISOString().split('T')[0];
    if (form.date > today && !showFutureConfirm) {
      setShowFutureConfirm(true);
      return;
    }

    setShowFutureConfirm(false);
    setLoading(true);
    try {
      if (expense) {
        await API.put(`/expenses/${expense.id}`, form);
        toast.success('Expense updated!');
      } else {
        await API.post('/expenses', form);
        toast.success('Expense added!');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all duration-200";

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-950/40 w-full max-w-md border border-slate-100 dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {expense ? 'Edit Expense' : 'Add Expense'}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {expense ? 'Update transaction details' : 'Log a new expense entry'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Future Date Confirmation Dialog */}
        {showFutureConfirm && (
          <div className="mx-6 mt-4 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <HiExclamationCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Future Date Detected</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  The date you selected ({new Date(form.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}) is in the future. Are you sure?
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setShowFutureConfirm(false)}
                    className="px-3 py-1.5 text-xs font-semibold border border-amber-300 dark:border-amber-700 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                  >
                    Yes, Save Anyway
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Budget Warnings */}
        {(budgetWarning.category || budgetWarning.overall) && (
          <div className="mx-6 mt-4 space-y-2">
            {budgetWarning.category && (
              <div className="flex items-start gap-2.5 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl animate-in fade-in duration-200">
                <HiExclamationTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-rose-700 dark:text-rose-300 font-medium leading-relaxed">
                  {budgetWarning.category}
                </p>
              </div>
            )}
            {budgetWarning.overall && (
              <div className="flex items-start gap-2.5 p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl animate-in fade-in duration-200">
                <HiExclamationTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-orange-700 dark:text-orange-300 font-medium leading-relaxed">
                  {budgetWarning.overall}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              <HiCurrencyRupee className="w-4 h-4 text-violet-500" /> Amount (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className={inputClass}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              <HiChatBubbleBottomCenterText className="w-4 h-4 text-indigo-500" /> Description
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
              placeholder="e.g., Campus lunch, textbook, uber"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              <HiTag className="w-4 h-4 text-purple-500" /> Category
            </label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className={inputClass}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                <HiCalendar className="w-4 h-4 text-blue-500" /> Date *
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => {
                  setForm({ ...form, date: e.target.value });
                  setShowFutureConfirm(false);
                }}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                <HiCreditCard className="w-4 h-4 text-teal-500" /> Payment
              </label>
              <select
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                className={inputClass}
              >
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-200 disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? 'Saving...' : expense ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExpenseForm;
