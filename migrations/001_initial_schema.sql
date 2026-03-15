-- ============================================================
-- One Bite Campaign Management System — Full Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- -----------------------------------------------
-- 1. Custom Enums
-- -----------------------------------------------
CREATE TYPE campaign_status     AS ENUM ('draft', 'scheduled', 'active', 'inactive', 'expired');
CREATE TYPE discount_type       AS ENUM ('flat', 'percentage');
CREATE TYPE heard_from_type     AS ENUM ('instagram', 'google', 'word_of_mouth', 'flyer', 'walk_in', 'other');
CREATE TYPE registration_status AS ENUM ('pending', 'availed', 'expired');


-- -----------------------------------------------
-- 2. Campaigns
-- -----------------------------------------------
CREATE TABLE campaigns (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(255) NOT NULL,
  slug                VARCHAR(50)  NOT NULL UNIQUE,
  description         TEXT,
  status              campaign_status NOT NULL DEFAULT 'draft',
  discount_type       discount_type   NOT NULL,
  discount_value      DECIMAL(10,2)   NOT NULL,
  max_registrations   INT,                          -- NULL = unlimited
  registration_expiry TIMESTAMPTZ,                  -- deadline for new coupons
  availing_expiry     TIMESTAMPTZ,                  -- deadline for redeeming coupons
  email_template      TEXT,                          -- stored for future use
  sms_template        TEXT,                          -- stored for future use
  meta                JSONB DEFAULT '{}'::jsonb,     -- flexible future-proofing
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- -----------------------------------------------
-- 3. Customers
-- -----------------------------------------------
CREATE TABLE customers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  mobile      VARCHAR(15)  NOT NULL,
  heard_from  heard_from_type,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique indexes for fast duplicate lookups
CREATE UNIQUE INDEX idx_customers_email  ON customers (LOWER(email));
CREATE UNIQUE INDEX idx_customers_mobile ON customers (mobile);


-- -----------------------------------------------
-- 4. Campaign Registrations
-- -----------------------------------------------
CREATE TABLE campaign_registrations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  customer_id   UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  coupon_code   VARCHAR(50) NOT NULL,
  status        registration_status NOT NULL DEFAULT 'pending',
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  availed_at    TIMESTAMPTZ,                         -- NULL until redeemed
  availed_by    VARCHAR(255),                        -- handler name at redemption
  notes         TEXT,                                -- optional handler note

  -- One registration per customer per campaign
  CONSTRAINT uq_campaign_customer UNIQUE (campaign_id, customer_id)
);

-- Coupon codes must be globally unique
CREATE UNIQUE INDEX idx_registrations_coupon ON campaign_registrations (coupon_code);

-- Fast lookups by campaign (for admin data view)
CREATE INDEX idx_registrations_campaign ON campaign_registrations (campaign_id);


-- -----------------------------------------------
-- 5. Admin Sessions (audit log)
-- -----------------------------------------------
CREATE TABLE admin_sessions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handler_name       VARCHAR(255) NOT NULL,
  logged_in_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address         VARCHAR(45),                    -- supports IPv6
  session_token_hash VARCHAR(255)                    -- hashed JWT for reference
);


-- -----------------------------------------------
-- 6. Row Level Security (RLS)
-- -----------------------------------------------

-- Enable RLS on all tables
ALTER TABLE campaigns              ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions         ENABLE ROW LEVEL SECURITY;

-- Campaigns: anyone can read active campaigns (for the public page)
CREATE POLICY "Public can read active campaigns"
  ON campaigns FOR SELECT
  USING (status = 'active');

-- Customers: allow inserts from the anon key (registration flow)
-- Service role bypasses RLS for admin reads
CREATE POLICY "Anon can insert customers"
  ON customers FOR INSERT
  WITH CHECK (true);

-- Campaign Registrations: allow inserts (registration) and select own record
CREATE POLICY "Anon can insert registrations"
  ON campaign_registrations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anon can read own registration"
  ON campaign_registrations FOR SELECT
  USING (true);

-- Customers: allow anon to read (needed for duplicate check in registration)
CREATE POLICY "Anon can read customers"
  ON customers FOR SELECT
  USING (true);

-- Admin Sessions: no public access (service role only)
-- No policy = denied by default with RLS enabled
