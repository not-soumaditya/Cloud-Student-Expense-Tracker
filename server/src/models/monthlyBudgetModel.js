const pool = require('../config/db');

const MonthlyBudgetModel = {
  async getByMonth(month) {
    const budgetResult = await pool.query(
      'SELECT * FROM monthly_budgets WHERE month = $1',
      [month]
    );

    const spentResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0)::float as total_spent,
              COUNT(*)::int as transaction_count
       FROM expenses
       WHERE TO_CHAR(date, 'YYYY-MM') = $1`,
      [month]
    );

    const budget = budgetResult.rows[0] || null;
    const spent = spentResult.rows[0];

    return {
      budget,
      total_spent: spent.total_spent,
      transaction_count: spent.transaction_count,
      percentage: budget ? Math.min((spent.total_spent / Number(budget.amount)) * 100, 100) : 0,
      is_over: budget ? spent.total_spent > Number(budget.amount) : false,
      remaining: budget ? Number(budget.amount) - spent.total_spent : null,
    };
  },

  async upsert({ amount, month }) {
    const result = await pool.query(
      `INSERT INTO monthly_budgets (amount, month)
       VALUES ($1, $2)
       ON CONFLICT (month)
       DO UPDATE SET amount = $1, updated_at = NOW()
       RETURNING *`,
      [amount, month]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(
      'DELETE FROM monthly_budgets WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
};

module.exports = MonthlyBudgetModel;
