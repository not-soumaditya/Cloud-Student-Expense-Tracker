-- =============================================
-- Assignment 3: Users table for Authentication & RBAC
-- Run this in the Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    name        VARCHAR(100) NOT NULL,
    role        VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'supervisor', 'admin')),
    mfa_secret  VARCHAR(255),
    mfa_enabled BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
