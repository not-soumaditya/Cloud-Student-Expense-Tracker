const express = require('express');
const router = express.Router();
const BudgetModel = require('../models/budgetModel');

// GET /api/budgets
router.get('/', async (req, res, next) => {
  try {
    const budgets = await BudgetModel.getAll(req.query.month);
    res.json(budgets);
  } catch (err) {
    next(err);
  }
});

// GET /api/budgets/:id
router.get('/:id', async (req, res, next) => {
  try {
    const budget = await BudgetModel.getById(req.params.id);
    if (!budget) return res.status(404).json({ error: 'Budget not found' });
    res.json(budget);
  } catch (err) {
    next(err);
  }
});

// POST /api/budgets
router.post('/', async (req, res, next) => {
  try {
    const { category_id, budget_limit, month } = req.body;
    if (!category_id || !budget_limit || !month) {
      return res.status(400).json({ error: 'category_id, budget_limit, and month are required' });
    }
    const budget = await BudgetModel.create({ category_id, budget_limit, month });
    res.status(201).json(budget);
  } catch (err) {
    next(err);
  }
});

// PUT /api/budgets/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { category_id, budget_limit, month } = req.body;
    const budget = await BudgetModel.update(req.params.id, { category_id, budget_limit, month });
    if (!budget) return res.status(404).json({ error: 'Budget not found' });
    res.json(budget);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const budget = await BudgetModel.delete(req.params.id);
    if (!budget) return res.status(404).json({ error: 'Budget not found' });
    res.json({ message: 'Budget deleted successfully', budget });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
