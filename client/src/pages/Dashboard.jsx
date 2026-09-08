import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  HiCurrencyRupee, 
  HiReceiptPercent, 
  HiArrowTrendingUp, 
  HiPlus,
  HiTag,
  HiClock
} from 'react-icons/hi2';
import API from '../api/axios';
import { useTheme } from '../components/ThemeProvider';

const CHART_COLORS = ['#7c3aed', '#2563eb', '#0891b2', '#059669', '#d97706', '#e11d48', '#8b5cf6', '#6366f1'];

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [summaryRes, expensesRes] = await Promise.all([
        API.get('/expenses/stats/summary'),
        API.get('/expenses'),
      ]);
      setSummary(summaryRes.data);
      setRecentExpenses(expensesRes.data.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-200 border-t-violet-600"></div>
      </div>
    );
  }

  const chartData = summary?.byCategory?.filter(c => c.total > 0) || [];
  const thisMonth = summary?.byMonth?.[0];

  const summaryCards = [
    {
      label: 'Total Spending',
      value: `₹${summary?.overall?.total?.toLocaleString('en-IN') || '0'}`,
      icon: HiCurrencyRupee,
      shadow: 'shadow-violet-500/10',
      bg: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400',
    },
    {
      label: 'Total Transactions',
      value: summary?.overall?.count || 0,
      icon: HiReceiptPercent,
      shadow: 'shadow-emerald-500/10',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'This Month',
      value: `₹${thisMonth?.total?.toLocaleString('en-IN') || '0'}`,
      icon: HiArrowTrendingUp,
      shadow: 'shadow-amber-500/10',
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    },
  ];

  const isDark = theme === 'dark';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time financial summary & activity overview
          </p>
        </div>
        <Link
          to="/expenses"
          className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/25 text-xs sm:text-sm font-semibold transition-all duration-200"
        >
          <HiPlus className="w-4 h-4" /> Add Expense
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm hover:shadow-md ${card.shadow} transition-all duration-200 hover:-translate-y-0.5`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 ${card.bg} rounded-xl`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Recent Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Donut Chart */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HiTag className="w-4 h-4 text-violet-500" /> Spending by Category
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Expense distribution</p>
            </div>
          </div>
          {chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={50}
                    strokeWidth={2}
                    stroke={isDark ? '#0f172a' : '#ffffff'}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      borderRadius: '12px',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-slate-400 dark:text-slate-500 text-center py-12 text-sm">No expenses recorded yet.</p>
          )}
        </div>

        {/* Recent Expenses List */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HiClock className="w-4 h-4 text-indigo-500" /> Recent Transactions
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Latest expense activity</p>
            </div>
            <Link to="/expenses" className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline">
              View all →
            </Link>
          </div>
          {recentExpenses.length > 0 ? (
            <div className="space-y-2">
              {recentExpenses.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
                      style={{ backgroundColor: exp.category_color || '#7c3aed' }}
                    >
                      <HiTag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{exp.description || 'No description'}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {exp.category_name || 'Uncategorized'} • {new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    ₹{Number(exp.amount).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 dark:text-slate-500 text-center py-12 text-sm">No expenses recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
