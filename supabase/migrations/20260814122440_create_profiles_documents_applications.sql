/*
# Create profiles, documents, and applications tables

## Purpose
Multi-user data storage for the Setu Sahayata citizen empowerment portal.
Each table is scoped to the authenticated user via `user_id` with RLS.

## 1. New Tables

### profiles
- `id` (uuid, PK, default gen_random_uuid())
- `user_id` (uuid, NOT NULL, DEFAULT auth.uid(), references auth.users ON DELETE CASCADE)
- `name` (text, not null)
- `age` (integer)
- `gender` (text)
- `state` (text)
- `city` (text)
- `occupation` (text)
- `income` (integer)
- `category` (text)
- `family_size` (integer)
- `has_aadhaar` (boolean, default false)
- `has_ration_card` (boolean, default false)
- `has_udyam` (boolean, default false)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### documents
- `id` (uuid, PK, default gen_random_uuid())
- `user_id` (uuid, NOT NULL, DEFAULT auth.uid(), references auth.users ON DELETE CASCADE)
- `filename` (text, not null)
- `doc_type` (text, not null) — e.g. 'Aadhaar', 'Ration Card', 'Udyam'
- `uploaded_at` (timestamptz, default now())

### applications
- `id` (uuid, PK, default gen_random_uuid())
- `user_id` (uuid, NOT NULL, DEFAULT auth.uid(), references auth.users ON DELETE CASCADE)
- `scheme_id` (text, not null)
- `scheme_name` (text, not null)
- `application_id` (text, not null) — human-readable tracking ID
- `status` (text, not null, default 'Submitted')
- `benefit_amount` (text)
- `submitted_at` (timestamptz, default now())

## 2. Security (RLS)
All three tables have RLS enabled with 4 policies each (SELECT, INSERT, UPDATE, DELETE),
scoped TO authenticated with ownership check `auth.uid() = user_id`.
The `DEFAULT auth.uid()` on `user_id` ensures inserts succeed even when the client omits it.

## 3. Indexes
- `idx_profiles_user_id` on profiles(user_id) for fast lookups
- `idx_documents_user_id` on documents(user_id)
- `idx_applications_user_id` on applications(user_id)

## 4. Important Notes
- Email confirmation is OFF — sign-up immediately creates a session.
- `user_id` defaults to `auth.uid()` so frontend inserts don't need to pass it.
- All policies use `auth.uid()` (never `current_user`).
*/

-- PROFILES TABLE
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

-- DOCUMENTS TABLE
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

-- APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  scheme_id text NOT NULL,
  scheme_name text NOT NULL,
  application_id text NOT NULL,
  status text NOT NULL DEFAULT 'Submitted',
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

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
