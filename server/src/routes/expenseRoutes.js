const express = require('express');
const router = express.Router();
const ExpenseModel = require('../models/expenseModel');

// GET /api/expenses/stats/summary — must be before /:id
router.get('/stats/summary', async (req, res, next) => {
  try {
    const summary = await ExpenseModel.getSummary();
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

// GET /api/expenses
router.get('/', async (req, res, next) => {
  try {
    const filters = {
      category_id: req.query.category_id,
      from: req.query.from,
      to: req.query.to
    };
    const expenses = await ExpenseModel.getAll(filters);
    res.json(expenses);
  } catch (err) {
    next(err);
  }
});

// GET /api/expenses/:id
router.get('/:id', async (req, res, next) => {
  try {
    const expense = await ExpenseModel.getById(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    next(err);
  }
});

// POST /api/expenses
router.post('/', async (req, res, next) => {
  try {
    const { amount, description, category_id, date, payment_method } = req.body;
    if (!amount || !date) {
      return res.status(400).json({ error: 'Amount and date are required' });
    }
    const expense = await ExpenseModel.create({ amount, description, category_id, date, payment_method });
    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
});

// PUT /api/expenses/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { amount, description, category_id, date, payment_method } = req.body;
    const expense = await ExpenseModel.update(req.params.id, { amount, description, category_id, date, payment_method });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const expense = await ExpenseModel.delete(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Expense deleted successfully', expense });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
