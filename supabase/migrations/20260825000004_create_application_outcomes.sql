-- 1. Create application_outcomes table for Verified Community Signals
CREATE TABLE IF NOT EXISTS public.application_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id text NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
  outcome text NOT NULL CHECK (outcome IN ('Success', 'Rejected', 'Pending')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for outcomes
ALTER TABLE public.application_outcomes ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read to aggregate outcomes
CREATE POLICY "Allow anonymous read" ON public.application_outcomes
  FOR SELECT USING (true);

-- Allow authenticated insert to register outcomes
CREATE POLICY "Allow auth insert" ON public.application_outcomes
  FOR INSERT TO authenticated WITH CHECK (true);
