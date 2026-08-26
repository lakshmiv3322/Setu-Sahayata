-- =============================================================================
-- SETU SAHAYATA — UNIFIED DATABASE MIGRATION SCRIPT (WITH FOREIGN KEYS)
-- Target Project: https://pvwrwjggazjaktzzqipc.supabase.co
-- SQL Editor URL: https://supabase.com/dashboard/project/pvwrwjggazjaktzzqipc/sql/new
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. SCHEMES TABLE (PRIMARY TABLE FOR SCHEMES — CREATED FIRST FOR FK REF)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schemes (
  id            text        PRIMARY KEY,
  name          text        NOT NULL,
  name_hindi    text        NOT NULL,
  ministry      text,
  ministry_hindi text,
  benefit       text,
  benefit_hindi text,
  benefit_amount text,
  time_to_apply  text,
  time_to_apply_hindi text,
  description   text,
  description_hindi text,
  category      text,
  icon          text,
  eligibility_tags text[]  DEFAULT '{}',
  eligibility_rules jsonb NOT NULL DEFAULT '[]',
  active        boolean     DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_schemes_category ON schemes(category);
CREATE INDEX IF NOT EXISTS idx_schemes_active ON schemes(active);

-- -----------------------------------------------------------------------------
-- 2. PROFILES TABLE & BASE SECURITY
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  age integer,
  gender text,
  state text,
  city text,
  occupation text,
  income integer,
  category text,
  family_size integer,
  has_aadhaar boolean DEFAULT false,
  has_ration_card boolean DEFAULT false,
  has_udyam boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3. DOCUMENTS TABLE & SECURITY
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  doc_type text NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_documents" ON documents;
CREATE POLICY "select_own_documents" ON documents FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_documents" ON documents;
CREATE POLICY "insert_own_documents" ON documents FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_documents" ON documents;
CREATE POLICY "update_own_documents" ON documents FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_documents" ON documents;
CREATE POLICY "delete_own_documents" ON documents FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4. APPLICATIONS TABLE & SECURITY (WITH FK TO SCHEMES)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  scheme_id text NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  scheme_name text NOT NULL,
  application_id text NOT NULL,
  status text NOT NULL DEFAULT 'Prepared',
  benefit_amount text,
  submitted_at timestamptz DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_applications" ON applications;
CREATE POLICY "select_own_applications" ON applications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_applications" ON applications;
CREATE POLICY "insert_own_applications" ON applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_applications" ON applications;
CREATE POLICY "update_own_applications" ON applications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_applications" ON applications;
CREATE POLICY "delete_own_applications" ON applications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- INDEXES FOR CORE TABLES
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);

-- -----------------------------------------------------------------------------
-- 5. AUDIT LOGS & PROFILE EXTENSION COLUMNS
-- -----------------------------------------------------------------------------
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

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_aadhaar_verified boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_income_verified boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_given boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_timestamp timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_details jsonb DEFAULT '{}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS life_events text[] DEFAULT '{}'::text[];

-- -----------------------------------------------------------------------------
-- 6. SCHEME DEADLINES TABLE (WITH FK TO SCHEMES)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scheme_deadlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id text NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  title text NOT NULL,
  title_hindi text NOT NULL,
  deadline_date date NOT NULL,
  description text,
  description_hindi text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scheme_deadlines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_scheme_deadlines" ON scheme_deadlines;
CREATE POLICY "read_scheme_deadlines" ON scheme_deadlines
  FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_scheme_deadlines_date ON scheme_deadlines(deadline_date);

-- -----------------------------------------------------------------------------
-- 7. ADMIN FUNCTIONS & HARDENED RLS POLICIES (PINNED SEARCH_PATH)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP POLICY IF EXISTS "admin_select_all_profiles" ON profiles;
CREATE POLICY "admin_select_all_profiles" ON profiles
  FOR SELECT TO authenticated USING (is_admin_user());

DROP POLICY IF EXISTS "admin_select_all_applications" ON applications;
CREATE POLICY "admin_select_all_applications" ON applications
  FOR SELECT TO authenticated USING (is_admin_user());

-- SCHEMES RLS POLICIES
DROP POLICY IF EXISTS "read_schemes" ON schemes;
CREATE POLICY "read_schemes" ON schemes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_insert_schemes" ON schemes;
CREATE POLICY "admin_insert_schemes" ON schemes
  FOR INSERT TO authenticated
  WITH CHECK (is_admin_user());

DROP POLICY IF EXISTS "admin_update_schemes" ON schemes;
CREATE POLICY "admin_update_schemes" ON schemes
  FOR UPDATE TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

DROP POLICY IF EXISTS "admin_delete_schemes" ON schemes;
CREATE POLICY "admin_delete_schemes" ON schemes
  FOR DELETE TO authenticated
  USING (is_admin_user());

-- -----------------------------------------------------------------------------
-- 8. APPEAL RATE LIMITS TABLE & SECURITY (WITH FK TO SCHEMES)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appeal_rate_limits (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheme_id    text        NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  requested_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE appeal_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own appeal rate limits" ON appeal_rate_limits;
CREATE POLICY "Users can insert own appeal rate limits" ON appeal_rate_limits
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own appeal rate limits" ON appeal_rate_limits;
CREATE POLICY "Users can view own appeal rate limits" ON appeal_rate_limits
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_appeal_rate_limits_user_scheme ON appeal_rate_limits(user_id, scheme_id, requested_at);
