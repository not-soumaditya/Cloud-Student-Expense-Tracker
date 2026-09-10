-- =============================================
-- Monthly Budgets Table (Overall spending limit)
-- Run this in the Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS monthly_budgets (
  id SERIAL PRIMARY KEY,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  month VARCHAR(7) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add index for fast lookups by month
CREATE INDEX IF NOT EXISTS idx_monthly_budgets_month ON monthly_budgets(month);
