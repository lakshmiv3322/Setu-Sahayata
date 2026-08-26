/*
# Admin Scheme Write RLS Policies

## Purpose
Enforces Row Level Security (RLS) on the `schemes` table to ensure that:
1. Public read access (SELECT) is granted to all authenticated and anonymous users.
2. Administrative write access (INSERT, UPDATE, DELETE) is strictly restricted to authenticated users whose profile has `is_admin = true` via the `is_admin_user()` SECURITY DEFINER function.

This database-level RLS policy is the primary security enforcement layer.
*/

ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;

-- Hardened helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 1. Public Read Policy: Allow anyone (authenticated or anon) to read active schemes
DROP POLICY IF EXISTS "read_schemes" ON schemes;
CREATE POLICY "read_schemes" ON schemes
  FOR SELECT USING (true);

-- 2. Admin Write Policies: Allow INSERT, UPDATE, DELETE only for users where is_admin_user() returns true
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
