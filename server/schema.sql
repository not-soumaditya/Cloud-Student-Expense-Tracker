-- =============================================
-- Student Expense Tracker - Database Schema
-- Run this in the Supabase SQL Editor
-- =============================================

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    icon        VARCHAR(10) DEFAULT '📁',
    color       VARCHAR(7) DEFAULT '#6B7280',
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id              SERIAL PRIMARY KEY,
    amount          DECIMAL(10,2) NOT NULL,
    description     VARCHAR(255),
    category_id     INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    date            DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method  VARCHAR(20) DEFAULT 'Cash',
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id              SERIAL PRIMARY KEY,
    category_id     INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    budget_limit    DECIMAL(10,2) NOT NULL,
    month           VARCHAR(7) NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(category_id, month)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);

-- =============================================
-- Seed Data - Default Categories
-- =============================================
INSERT INTO categories (name, icon, color) VALUES
    ('Food', '🍔', '#FF6384'),
    ('Transport', '🚌', '#36A2EB'),
    ('Books', '📚', '#FFCE56'),
    ('Entertainment', '🎬', '#4BC0C0'),
    ('Shopping', '🛒', '#9966FF'),
    ('Health', '💊', '#FF9F40'),
    ('Rent', '🏠', '#C9CBCF'),
    ('Other', '📦', '#7C8CF8')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- Seed Data - Sample Expenses (for demo)
-- =============================================
INSERT INTO expenses (amount, description, category_id, date, payment_method) VALUES
    (150.00, 'Lunch at campus canteen', 1, CURRENT_DATE, 'UPI'),
    (80.00, 'Bus pass recharge', 2, CURRENT_DATE, 'UPI'),
    (450.00, 'Data Structures textbook', 3, CURRENT_DATE - INTERVAL '1 day', 'Card'),
    (200.00, 'Movie tickets', 4, CURRENT_DATE - INTERVAL '2 days', 'UPI'),
    (350.00, 'Groceries from supermarket', 5, CURRENT_DATE - INTERVAL '3 days', 'Cash'),
    (120.00, 'Dinner at restaurant', 1, CURRENT_DATE - INTERVAL '3 days', 'UPI'),
    (60.00, 'Auto rickshaw', 2, CURRENT_DATE - INTERVAL '4 days', 'Cash'),
    (500.00, 'Monthly gym membership', 6, CURRENT_DATE - INTERVAL '5 days', 'Card'),
    (250.00, 'Notebook and stationery', 3, CURRENT_DATE - INTERVAL '6 days', 'Cash'),
    (180.00, 'Snacks and coffee', 1, CURRENT_DATE - INTERVAL '7 days', 'UPI');

-- Seed Data - Sample Budgets for current month
INSERT INTO budgets (category_id, budget_limit, month) VALUES
    (1, 5000.00, TO_CHAR(CURRENT_DATE, 'YYYY-MM')),
    (2, 2000.00, TO_CHAR(CURRENT_DATE, 'YYYY-MM')),
    (3, 3000.00, TO_CHAR(CURRENT_DATE, 'YYYY-MM')),
    (4, 1500.00, TO_CHAR(CURRENT_DATE, 'YYYY-MM'))
ON CONFLICT (category_id, month) DO NOTHING;
