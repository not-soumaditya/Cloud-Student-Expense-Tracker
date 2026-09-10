const express = require('express');
const router = express.Router();
const MonthlyBudgetModel = require('../models/monthlyBudgetModel');

// GET /api/monthly-budgets?month=YYYY-MM
router.get('/', async (req, res, next) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const data = await MonthlyBudgetModel.getByMonth(month);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/monthly-budgets
router.post('/', async (req, res, next) => {
  try {
    const { amount, month } = req.body;
    if (!amount || !month) {
      return res.status(400).json({ error: 'amount and month are required' });
    }
    const budget = await MonthlyBudgetModel.upsert({ amount, month });
    res.status(201).json(budget);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/monthly-budgets/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const budget = await MonthlyBudgetModel.delete(req.params.id);
    if (!budget) return res.status(404).json({ error: 'Monthly budget not found' });
    res.json({ message: 'Monthly budget deleted successfully', budget });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
