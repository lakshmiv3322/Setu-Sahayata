-- 1. Add family_members JSONB column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS family_members jsonb DEFAULT '[]'::jsonb;

-- 2. Add source_url and last_verified_at columns to schemes
ALTER TABLE public.schemes ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE public.schemes ADD COLUMN IF NOT EXISTS last_verified_at timestamptz DEFAULT now();
