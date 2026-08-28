const pool = require('../config/db');

const CategoryModel = {
  async getAll() {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0];
  },

  async create({ name, icon, color }) {
    const result = await pool.query(
      'INSERT INTO categories (name, icon, color) VALUES ($1, $2, $3) RETURNING *',
      [name, icon || '📁', color || '#6B7280']
    );
    return result.rows[0];
  },

  async update(id, { name, icon, color }) {
    const result = await pool.query(
      'UPDATE categories SET name = $1, icon = $2, color = $3 WHERE id = $4 RETURNING *',
      [name, icon, color, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = CategoryModel;
