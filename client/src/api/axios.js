// Static API mock — replaces live axios calls with baked-in data
// All components continue using API.get('/expenses') etc. unchanged
import toast from 'react-hot-toast';
import {
  categories,
  expenses,
  statsSummary,
  byPaymentMethod,
  byDayOfWeek,
  budgets,
  monthlyBudgets,
} from '../data/snapshot';

const DEMO_MSG = '📸 This is a static demo snapshot — data is read-only';

// Simulate async API response shape: { data: ... }
const ok = (data) => Promise.resolve({ data });
const demoReject = () => {
  toast(DEMO_MSG, { icon: 'ℹ️', id: 'demo-toast' });
  return Promise.resolve({ data: {} });
};

// Route matcher for GET requests
const getRoutes = (url, params = {}) => {
  // Categories
  if (url === '/categories') return ok(categories);

  // Expenses
  if (url === '/expenses') {
    let filtered = [...expenses];
    if (params.category_id) filtered = filtered.filter(e => e.category_id === Number(params.category_id));
    if (params.from) filtered = filtered.filter(e => e.date >= params.from);
    if (params.to) filtered = filtered.filter(e => e.date <= params.to);
    return ok(filtered);
  }

  // Single expense
  const expenseMatch = url.match(/^\/expenses\/(\d+)$/);
  if (expenseMatch) {
    const exp = expenses.find(e => e.id === Number(expenseMatch[1]));
    return ok(exp || null);
  }

  // Stats
  if (url === '/expenses/stats/summary') return ok(statsSummary);
  if (url === '/expenses/stats/by-payment-method') return ok(byPaymentMethod);
  if (url === '/expenses/stats/by-day-of-week') return ok(byDayOfWeek);

  // Budget check (for expense form warnings)
  if (url === '/expenses/stats/budget-check') {
    const month = params.month || '';
    const categoryId = Number(params.category_id);
    const catBudget = budgets.find(b => b.category_id === categoryId && b.month === month);
    const catSpent = expenses
      .filter(e => e.category_id === categoryId && e.date.startsWith(month))
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const mb = monthlyBudgets[month];
    return ok({
      category: {
        budget_limit: catBudget ? Number(catBudget.budget_limit) : null,
        category_name: catBudget?.category_name || null,
        spent: catSpent,
      },
      overall: {
        budget_limit: mb?.budget ? Number(mb.budget.amount) : null,
        total_spent: mb?.total_spent || 0,
      }
    });
  }

  // Budgets
  if (url === '/budgets') {
    const month = params.month;
    if (month) return ok(budgets.filter(b => b.month === month));
    return ok(budgets);
  }

  // Monthly budgets
  if (url === '/monthly-budgets') {
    const month = params.month || '2026-09';
    const mb = monthlyBudgets[month] || {
      budget: null, total_spent: 0, transaction_count: 0,
      percentage: 0, is_over: false, remaining: null
    };
    return ok(mb);
  }

  // Health
  if (url === '/health') return ok({ status: 'ok', message: 'Static snapshot mode' });

  console.warn(`[Static API] Unmatched GET: ${url}`);
  return ok(null);
};

// The mock API object — same interface as axios instance
const API = {
  get(url, config = {}) {
    const params = config.params || {};
    return getRoutes(url, params);
  },
  post() { return demoReject(); },
  put() { return demoReject(); },
  delete() { return demoReject(); },
};

export default API;
