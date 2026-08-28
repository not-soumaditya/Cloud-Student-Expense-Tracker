const pool = require('../config/db');

const BudgetModel = {
  async getAll(month) {
    let query = `
      SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color,
             COALESCE(
               (SELECT SUM(e.amount) FROM expenses e
                WHERE e.category_id = b.category_id
                AND TO_CHAR(e.date, 'YYYY-MM') = b.month), 0
             )::float as spent
      FROM budgets b
      LEFT JOIN categories c ON b.category_id = c.id
    `;
    const values = [];
    if (month) {
      query += ' WHERE b.month = $1';
      values.push(month);
    }
    query += ' ORDER BY c.name';
    const result = await pool.query(query, values);
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(
      `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color,
              COALESCE(
                (SELECT SUM(e.amount) FROM expenses e
                 WHERE e.category_id = b.category_id
                 AND TO_CHAR(e.date, 'YYYY-MM') = b.month), 0
              )::float as spent
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async create({ category_id, budget_limit, month }) {
    const result = await pool.query(
      `INSERT INTO budgets (category_id, budget_limit, month)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [category_id, budget_limit, month]
    );
    return result.rows[0];
  },

  async update(id, { category_id, budget_limit, month }) {
    const result = await pool.query(
      `UPDATE budgets SET category_id = $1, budget_limit = $2, month = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [category_id, budget_limit, month, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query('DELETE FROM budgets WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = BudgetModel;
