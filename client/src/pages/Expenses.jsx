import { useState, useEffect } from 'react';
import { 
  HiPlus, 
  HiPencil, 
  HiTrash, 
  HiFunnel, 
  HiCalendar, 
  HiTag, 
  HiReceiptPercent,
  HiMagnifyingGlass,
  HiCreditCard
} from 'react-icons/hi2';
import API from '../api/axios';
import ExpenseForm from '../components/ExpenseForm';
import CategoryManager from '../components/CategoryManager';
import toast from 'react-hot-toast';

export default function Expenses() {
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'categories'
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  
  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'week' | 'month' | '30days'

  const computeDateRange = (type) => {
    const today = new Date();
    const end_date = today.toISOString().split('T')[0];
    let start_date = '';

    if (type === 'week') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      start_date = d.toISOString().split('T')[0];
    } else if (type === 'month') {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      start_date = d.toISOString().split('T')[0];
    } else if (type === '30days') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      start_date = d.toISOString().split('T')[0];
    }

    return { start_date, end_date: type === 'all' ? '' : end_date };
  };

  const loadData = async () => {
    try {
      const { start_date, end_date } = computeDateRange(dateFilter);
      const params = {};
      if (filterCategory) params.category_id = filterCategory;
      if (start_date) params.start_date = start_date;
      if (end_date) params.end_date = end_date;

      const [expRes, catRes] = await Promise.all([
        API.get('/expenses', { params }),
        API.get('/categories'),
      ]);
      setExpenses(expRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterCategory, dateFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await API.delete(`/expenses/${id}`);
      toast.success('Expense deleted');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete expense');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleSaved = () => {
    handleFormClose();
    loadData();
  };

  // Client-side search filtering
  const filteredExpenses = expenses.filter(exp => {
    if (!searchQuery) return true;
    const desc = (exp.description || '').toLowerCase();
    const cat = (exp.category_name || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return desc.includes(q) || cat.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Page Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Expenses
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your daily transactions and custom spending categories
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl self-start sm:self-auto border border-slate-200 dark:border-slate-700/60 shadow-inner">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === 'expenses'
                ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <HiReceiptPercent className="w-4 h-4" /> Expenses ({expenses.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === 'categories'
                ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <HiTag className="w-4 h-4" /> Categories ({categories.length})
          </button>
        </div>
      </div>

      {activeTab === 'categories' ? (
        <CategoryManager onCategoriesChanged={loadData} />
      ) : (
        <>
          {/* Action & Filter Controls */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <HiMagnifyingGlass className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search expenses by keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              </div>

              {/* Category Dropdown & Add Button */}
              <div className="flex items-center gap-3">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-violet-500/40 outline-none"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>

                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/25 text-sm font-semibold whitespace-nowrap transition-all duration-200"
                >
                  <HiPlus className="w-4 h-4" /> Add Expense
                </button>
              </div>
            </div>

            {/* Quick Date Range Filters */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 mr-1">
                <HiCalendar className="w-3.5 h-3.5" /> Date:
              </span>
              {[
                { id: 'all', label: 'All Time' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' },
                { id: '30days', label: 'Last 30 Days' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setDateFilter(id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap ${
                    dateFilter === id
                      ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm overflow-hidden transition-colors">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-200 border-t-violet-600"></div>
              </div>
            ) : filteredExpenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Payment</th>
                      <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3.5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((exp, index) => (
                      <tr
                        key={exp.id}
                        className={`border-b border-slate-50 dark:border-slate-800/60 hover:bg-violet-50/40 dark:hover:bg-violet-950/20 transition-colors duration-150 ${
                          index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/40 dark:bg-slate-900/40'
                        }`}
                      >
                        <td className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                          {exp.description || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: (exp.category_color || '#7c3aed') + '15',
                              color: exp.category_color || '#7c3aed',
                            }}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: exp.category_color || '#7c3aed' }}
                            />
                            {exp.category_name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg font-medium text-slate-600 dark:text-slate-300">
                            {exp.payment_method}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white text-right">
                          ₹{Number(exp.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEdit(exp)}
                              className="p-1.5 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <HiPencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(exp.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <HiTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <HiReceiptPercent className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 dark:text-slate-500 mb-3 font-medium text-sm">No expenses found matching the criteria.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="text-violet-600 dark:text-violet-400 hover:underline text-xs font-semibold"
                >
                  + Add new expense
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onClose={handleFormClose}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
