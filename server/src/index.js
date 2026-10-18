const express = require('express');
const cors = require('cors');
require('dotenv').config();

const expenseRoutes = require('./routes/expenseRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const monthlyBudgetRoutes = require('./routes/monthlyBudgetRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/monthly-budgets', monthlyBudgetRoutes);

// Health check endpoint (includes INSTANCE_ID for load balancer verification)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    instance: process.env.INSTANCE_ID || 'default',
    message: 'Expense Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[${process.env.INSTANCE_ID || 'default'}] Server running on port ${PORT}`);
});
