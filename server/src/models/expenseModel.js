const pool = require('../config/db');

const ExpenseModel = {
  async getAll(filters = {}) {
    let query = `
      SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.id
    `;
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (filters.category_id) {
      conditions.push(`e.category_id = $${paramIndex++}`);
      values.push(filters.category_id);
    }
    if (filters.from) {
      conditions.push(`e.date >= $${paramIndex++}`);
      values.push(filters.from);
    }
    if (filters.to) {
      conditions.push(`e.date <= $${paramIndex++}`);
      values.push(filters.to);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY e.date DESC, e.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(
      `SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color
       FROM expenses e
       LEFT JOIN categories c ON e.category_id = c.id
       WHERE e.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async create({ amount, description, category_id, date, payment_method }) {
    const result = await pool.query(
      `INSERT INTO expenses (amount, description, category_id, date, payment_method)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [amount, description, category_id, date, payment_method || 'Cash']
    );
    return result.rows[0];
  },

  async update(id, { amount, description, category_id, date, payment_method }) {
    const result = await pool.query(
      `UPDATE expenses
       SET amount = $1, description = $2, category_id = $3, date = $4, payment_method = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [amount, description, category_id, date, payment_method, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  async getSummary() {
    const categorySummary = await pool.query(`
      SELECT c.name, c.icon, c.color, COALESCE(SUM(e.amount), 0)::float as total,
             COUNT(e.id)::int as count
      FROM categories c
      LEFT JOIN expenses e ON c.id = e.category_id
      GROUP BY c.id, c.name, c.icon, c.color
      ORDER BY total DESC
    `);

    const monthlySummary = await pool.query(`
      SELECT TO_CHAR(date, 'YYYY-MM') as month, SUM(amount)::float as total,
             COUNT(*)::int as count
      FROM expenses
      GROUP BY TO_CHAR(date, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `);

    const totalResult = await pool.query(
      'SELECT COALESCE(SUM(amount), 0)::float as total, COUNT(*)::int as count FROM expenses'
    );

    return {
      byCategory: categorySummary.rows,
      byMonth: monthlySummary.rows,
      overall: totalResult.rows[0]
    };
  },

  async getPaymentMethodBreakdown() {
    const result = await pool.query(`
      SELECT payment_method as method,
             COALESCE(SUM(amount), 0)::float as total,
             COUNT(*)::int as count
      FROM expenses
      GROUP BY payment_method
      ORDER BY total DESC
    `);
    return result.rows;
  },

  async getDayOfWeekBreakdown() {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const result = await pool.query(`
      SELECT EXTRACT(DOW FROM date)::int as day_num,
             COALESCE(SUM(amount), 0)::float as total,
             COUNT(*)::int as count
      FROM expenses
      GROUP BY EXTRACT(DOW FROM date)
      ORDER BY day_num
    `);
    return result.rows.map(row => ({
      day: dayNames[row.day_num],
      day_num: row.day_num,
      total: row.total,
      count: row.count
    }));
  },

  async getBudgetCheck(categoryId, month) {
    // Get category budget
    const budgetResult = await pool.query(
      `SELECT b.budget_limit, c.name as category_name
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.category_id = $1 AND b.month = $2`,
      [categoryId, month]
    );

    // Get spent so far for this category in this month
    const spentResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0)::float as spent
       FROM expenses
       WHERE category_id = $1 AND TO_CHAR(date, 'YYYY-MM') = $2`,
      [categoryId, month]
    );

    // Get overall monthly budget
    const overallBudgetResult = await pool.query(
      'SELECT amount FROM monthly_budgets WHERE month = $1',
      [month]
    );

    // Get total spent this month (all categories)
    const totalSpentResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0)::float as total_spent
       FROM expenses WHERE TO_CHAR(date, 'YYYY-MM') = $1`,
      [month]
    );

    const categoryBudget = budgetResult.rows[0] || null;
    const categorySpent = spentResult.rows[0].spent;
    const overallBudget = overallBudgetResult.rows[0] || null;
    const totalSpent = totalSpentResult.rows[0].total_spent;

    return {
      category: {
        budget_limit: categoryBudget ? Number(categoryBudget.budget_limit) : null,
        category_name: categoryBudget?.category_name || null,
        spent: categorySpent,
      },
      overall: {
        budget_limit: overallBudget ? Number(overallBudget.amount) : null,
        total_spent: totalSpent,
      }
    };
  }
};

module.exports = ExpenseModel;
