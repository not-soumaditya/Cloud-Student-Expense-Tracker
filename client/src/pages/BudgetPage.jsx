import { useState, useEffect } from 'react';
import { HiPlus, HiTrash, HiExclamationTriangle } from 'react-icons/hi2';
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
      toast.success('Budget set!');
      setShowForm(false);
      setForm({ category_id: '', budget_limit: '', month: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to set budget');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const usedCategoryIds = budgets.map(b => b.category_id);
  const availableCategories = categories.filter(c => !usedCategoryIds.includes(c.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            <HiPlus className="w-4 h-4" /> Set Budget
          </button>
        </div>
      </div>

      {/* Add Budget Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Set New Budget</h2>
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              >
                <option value="">Select category</option>
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Limit (₹)</label>
              <input
                type="number"
                step="0.01"
                value={form.budget_limit}
                onChange={(e) => setForm({ ...form, budget_limit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="5000"
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Save
            </button>
          </form>
        </div>
      )}

      {/* Budget Cards */}
      {budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget) => {
            const percentage = budget.budget_limit > 0
              ? Math.min((budget.spent / budget.budget_limit) * 100, 100)
              : 0;
            const isOver = budget.spent > budget.budget_limit;
            const barColor = isOver ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500';

            return (
              <div key={budget.id} className={`bg-white rounded-xl shadow-sm border p-6 ${isOver ? 'border-red-200 bg-red-50/30' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{budget.category_icon || '📁'}</span>
                    <h3 className="font-semibold text-gray-900">{budget.category_name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOver && (
                      <span className="flex items-center gap-1 text-xs text-red-600 font-medium bg-red-100 px-2 py-1 rounded-full">
                        <HiExclamationTriangle className="w-3 h-3" /> Over Budget!
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">₹{budget.spent.toLocaleString('en-IN')} spent</span>
                  <span className="text-gray-500">of ₹{Number(budget.budget_limit).toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${barColor}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {isOver
                    ? `₹${(budget.spent - Number(budget.budget_limit)).toLocaleString('en-IN')} over budget`
                    : `₹${(Number(budget.budget_limit) - budget.spent).toLocaleString('en-IN')} remaining`
                  }
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <p className="text-gray-400 mb-4">No budgets set for this month.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            + Set your first budget
          </button>
        </div>
      )}
    </div>
  );
}

export default BudgetPage;
