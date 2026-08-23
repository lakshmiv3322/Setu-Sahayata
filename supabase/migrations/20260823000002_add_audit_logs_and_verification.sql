/*
# Add audit_logs table and profile verification / consent fields

## Purpose
1. Create `audit_logs` table for tracking security and data compliance actions
   (who accessed/changed what, when) scoped to user_id with RLS.
2. Extend `profiles` table to store field verification statuses and explicit consent records.

## 1. New Tables

### audit_logs
- `id` (uuid, PK, default gen_random_uuid())
- `user_id` (uuid, NOT NULL, DEFAULT auth.uid(), references auth.users ON DELETE CASCADE)
- `action` (text, not null) — e.g. 'PROFILE_UPDATED', 'CONSENT_GRANTED', 'DATA_DELETED', 'APPLICATION_SUBMITTED'
- `details` (jsonb, default '{}')
- `created_at` (timestamptz, default now())

## 2. Profile Extensions
- `is_aadhaar_verified` (boolean, default false)
- `is_income_verified` (boolean, default false)
- `consent_given` (boolean, default false)
- `consent_timestamp` (timestamptz)
- `consent_details` (jsonb, default '{}')

## 3. Security (RLS)
- `audit_logs` has RLS enabled with SELECT and INSERT policies scoped to `auth.uid() = user_id`.
*/

-- AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_audit_logs" ON audit_logs;
CREATE POLICY "select_own_audit_logs" ON audit_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_audit_logs" ON audit_logs;
CREATE POLICY "insert_own_audit_logs" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- EXTEND PROFILES TABLE
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_aadhaar_verified boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_income_verified boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_given boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_timestamp timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_details jsonb DEFAULT '{}'::jsonb;
