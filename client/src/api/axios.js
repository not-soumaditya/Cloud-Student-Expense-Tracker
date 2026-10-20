import axios from 'axios';
import {
  categories,
  expenses,
  statsSummary,
  byPaymentMethod,
  byDayOfWeek,
  budgets,
  monthlyBudgets,
} from '../data/snapshot';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token from localStorage if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: graceful fallback for GET requests when backend is offline (e.g. standalone Vercel preview)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only intercept network errors for GET queries to keep dashboard & pages alive
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK';
    const isGet = error.config && error.config.method?.toLowerCase() === 'get';

    if (isNetworkError && isGet) {
      const url = error.config.url.replace(/^.*\/api/, '');

      if (url === '/categories' || url.startsWith('/categories')) {
        return Promise.resolve({ data: categories, status: 200, statusText: 'OK', config: error.config, headers: {} });
      }
      if (url === '/expenses/stats/summary') {
        return Promise.resolve({ data: statsSummary, status: 200, statusText: 'OK', config: error.config, headers: {} });
      }
      if (url === '/expenses/stats/by-payment-method') {
        return Promise.resolve({ data: byPaymentMethod, status: 200, statusText: 'OK', config: error.config, headers: {} });
      }
      if (url === '/expenses/stats/by-day-of-week') {
        return Promise.resolve({ data: byDayOfWeek, status: 200, statusText: 'OK', config: error.config, headers: {} });
      }
      if (url === '/expenses' || url.startsWith('/expenses?')) {
        return Promise.resolve({ data: expenses, status: 200, statusText: 'OK', config: error.config, headers: {} });
      }
      if (url === '/budgets' || url.startsWith('/budgets?')) {
        return Promise.resolve({ data: budgets, status: 200, statusText: 'OK', config: error.config, headers: {} });
      }
      if (url === '/monthly-budgets' || url.startsWith('/monthly-budgets?')) {
        const mb = monthlyBudgets['2026-09'];
        return Promise.resolve({ data: mb, status: 200, statusText: 'OK', config: error.config, headers: {} });
      }
      if (url === '/health') {
        return Promise.resolve({ data: { status: 'ok', instance: 'preview' }, status: 200, statusText: 'OK', config: error.config, headers: {} });
      }
    }

    return Promise.reject(error);
  }
);

export default API;
