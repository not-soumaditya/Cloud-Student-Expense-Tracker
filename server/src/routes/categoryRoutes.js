const express = require('express');
const router = express.Router();
const CategoryModel = require('../models/categoryModel');

// GET /api/categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await CategoryModel.getAll();
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// GET /api/categories/:id
router.get('/:id', async (req, res, next) => {
  try {
    const category = await CategoryModel.getById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    next(err);
  }
});

// POST /api/categories
router.post('/', async (req, res, next) => {
  try {
    const { name, icon, color } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });
    const category = await CategoryModel.create({ name, icon, color });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
});

// PUT /api/categories/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, icon, color } = req.body;
    const category = await CategoryModel.update(req.params.id, { name, icon, color });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const category = await CategoryModel.delete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted successfully', category });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
