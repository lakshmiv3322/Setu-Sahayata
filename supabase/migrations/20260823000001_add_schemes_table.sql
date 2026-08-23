/*
# Add schemes table

## Purpose
Stores scheme data in the DB so eligibility rules can eventually be managed
without a code deployment. For Phase 1 the app still seeds from mock-data.ts,
but this table is the foundation for Phase 4's auto-ingestion pipeline.

## Security
- RLS enabled. Any authenticated user can SELECT (scheme data is public).
- Only service_role can INSERT/UPDATE/DELETE (no citizen-facing write path).
- No personal data is stored in this table.
*/

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
  -- Eligibility rules stored as JSONB array of CriterionCheck objects.
  -- Schema mirrors lib/scheme-eligibility.ts:CriterionCheck.
  eligibility_rules jsonb NOT NULL DEFAULT '[]',
  active        boolean     DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read scheme data
DROP POLICY IF EXISTS "read_schemes" ON schemes;
CREATE POLICY "read_schemes" ON schemes
  FOR SELECT TO authenticated USING (true);

-- No citizen-facing write — only service_role (used by admin/ingestion)
-- INSERT/UPDATE/DELETE are blocked for the anon and authenticated roles by default
-- when no policy exists for those operations.

CREATE INDEX IF NOT EXISTS idx_schemes_category ON schemes(category);
CREATE INDEX IF NOT EXISTS idx_schemes_active ON schemes(active);
