import { useState, useEffect, useRef } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { HiChartPie, HiChartBar, HiTableCells, HiDocumentArrowDown, HiCreditCard, HiCalendarDays } from 'react-icons/hi2';
import API from '../api/axios';
import { useTheme } from '../components/ThemeProvider';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CHART_COLORS = ['#7c3aed', '#2563eb', '#0891b2', '#059669', '#d97706', '#e11d48', '#8b5cf6', '#6366f1'];
const PAYMENT_COLORS = { UPI: '#7c3aed', Cash: '#059669', Card: '#2563eb', 'Net Banking': '#d97706' };
const DAY_COLORS = ['#e11d48', '#7c3aed', '#2563eb', '#0891b2', '#059669', '#d97706', '#8b5cf6'];

function Reports() {
  const [summary, setSummary] = useState(null);
  const [paymentData, setPaymentData] = useState([]);
  const [dayOfWeekData, setDayOfWeekData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { theme } = useTheme();
  const reportRef = useRef(null);

  useEffect(() => {
    Promise.all([
      API.get('/expenses/stats/summary'),
      API.get('/expenses/stats/by-payment-method'),
      API.get('/expenses/stats/by-day-of-week')
    ])
      .then(([summaryRes, paymentRes, dayOfWeekRes]) => {
        setSummary(summaryRes.data);
        setPaymentData(paymentRes.data);
        setDayOfWeekData(dayOfWeekRes.data);
      })
      .catch(err => console.error('Failed to load report data:', err))
      .finally(() => setLoading(false));
  }, []);

  const exportPDF = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('expense-report.pdf');
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-200 border-t-violet-600"></div>
      </div>
    );
  }

  const categoryData = summary?.byCategory?.filter(c => c.total > 0) || [];
  const monthlyData = (summary?.byMonth || []).slice().reverse();

  const isDark = theme === 'dark';

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderColor: isDark ? '#334155' : '#e2e8f0',
      borderRadius: '12px',
      color: isDark ? '#f8fafc' : '#0f172a',
      fontSize: '12px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            In-depth spending trends and category proportions
          </p>
        </div>
        <button
          onClick={exportPDF}
          disabled={exporting}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <HiDocumentArrowDown className="w-5 h-5" />
          )}
          {exporting ? 'Generating PDF...' : 'Export PDF'}
        </button>
      </div>

      <div ref={reportRef} className="space-y-8 p-1 -m-1">
        {/* Charts Grid 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Pie Chart */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <HiChartPie className="w-4 h-4 text-violet-500" /> Spending by Category
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Proportional expenditure</p>
            {categoryData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={55}
                      strokeWidth={2}
                      stroke={isDark ? '#0f172a' : '#ffffff'}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={index} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                      {...tooltipStyle}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '12px' }}
                      iconType="circle"
                      iconSize={8}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-center py-12 text-sm">No data available</p>
            )}
          </div>

          {/* Monthly Bar Chart */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <HiChartBar className="w-4 h-4 text-indigo-500" /> Monthly Trend
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Historical monthly expenditure</p>
            {monthlyData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                      axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                      axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                      {...tooltipStyle}
                    />
                    <Bar
                      dataKey="total"
                      fill="url(#barGradient)"
                      radius={[6, 6, 0, 0]}
                      name="Total Spent"
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-center py-12 text-sm">No data available</p>
            )}
          </div>
        </div>

        {/* Charts Grid 2 - NEW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Method Pie Chart */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <HiCreditCard className="w-4 h-4 text-emerald-500" /> Payment Method Breakdown
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Expenditure by payment mode</p>
            {paymentData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentData}
                      dataKey="total"
                      nameKey="method"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={55}
                      strokeWidth={2}
                      stroke={isDark ? '#0f172a' : '#ffffff'}
                      label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
                    >
                      {paymentData.map((entry, index) => (
                        <Cell key={index} fill={PAYMENT_COLORS[entry.method] || CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                      {...tooltipStyle}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '12px' }}
                      iconType="circle"
                      iconSize={8}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-center py-12 text-sm">No data available</p>
            )}
          </div>

          {/* Day of Week Bar Chart */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <HiCalendarDays className="w-4 h-4 text-rose-500" /> Day-of-Week Spending
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Average spending by day</p>
            {dayOfWeekData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayOfWeekData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                      axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                      axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                      {...tooltipStyle}
                    />
                    <Bar
                      dataKey="total"
                      radius={[6, 6, 0, 0]}
                      name="Total Spent"
                    >
                      {dayOfWeekData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DAY_COLORS[index % DAY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-center py-12 text-sm">No data available</p>
            )}
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <HiTableCells className="w-4 h-4 text-violet-500" /> Category Breakdown
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Comparative metrics across categories</p>
          {categoryData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transactions</th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Spent</th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData.map((cat, index) => (
                    <tr
                      key={cat.name}
                      className={`border-b border-slate-50 dark:border-slate-800/60 hover:bg-violet-50/30 dark:hover:bg-violet-950/20 transition-colors ${
                        index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/40 dark:bg-slate-900/40'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm">
                        <span className="flex items-center gap-3">
                          <span
                            className="w-3 h-3 rounded-full inline-block ring-2 ring-offset-1 dark:ring-offset-slate-900"
                            style={{
                              backgroundColor: cat.color || CHART_COLORS[index % CHART_COLORS.length],
                            }}
                          />
                          <span className="font-semibold text-slate-900 dark:text-white">{cat.name}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 text-right font-medium">{cat.count}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white text-right">
                        ₹{cat.total.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300">
                          {summary?.overall?.total > 0
                            ? ((cat.total / summary.overall.total) * 100).toFixed(1)
                            : '0'}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-400 dark:text-slate-500 text-center py-8 text-sm">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;
