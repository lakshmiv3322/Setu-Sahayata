/*
# Add admin flags, life_events, and scheme_deadlines table

## Purpose
1. Adds `is_admin` boolean flag and `life_events` array to `profiles`.
2. Creates `scheme_deadlines` table for time-sensitive scheme alerts.
3. Grants RLS SELECT policies for admins to view aggregate applications and profiles.
*/

-- EXTEND PROFILES TABLE
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS life_events text[] DEFAULT '{}'::text[];

-- SCHEME DEADLINES TABLE
CREATE TABLE IF NOT EXISTS scheme_deadlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id text NOT NULL,
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

-- ADMIN RLS POLICIES FOR AGGREGATE DASHBOARD
-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant admin select access to all profiles and applications for aggregate telemetry
DROP POLICY IF EXISTS "admin_select_all_profiles" ON profiles;
CREATE POLICY "admin_select_all_profiles" ON profiles
  FOR SELECT TO authenticated USING (is_admin_user());

DROP POLICY IF EXISTS "admin_select_all_applications" ON applications;
CREATE POLICY "admin_select_all_applications" ON applications
  FOR SELECT TO authenticated USING (is_admin_user());
