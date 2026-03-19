-- ============================================================
-- Migration 002: Remove email column from customers table
-- ============================================================

-- Drop the unique index on email
DROP INDEX IF EXISTS idx_customers_email;

-- Drop the email column from the customers table
ALTER TABLE customers DROP COLUMN IF EXISTS email;
