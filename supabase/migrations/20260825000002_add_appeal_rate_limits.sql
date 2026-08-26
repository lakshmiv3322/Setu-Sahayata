/*
# Add appeal_rate_limits table

## Purpose
Provides persistent serverless-safe rate limiting for AI-driven appeal guidance requests (1 request per user per scheme per 24 hours).

## Security
- RLS enabled.
- Users can insert and read only their own rate limit logs.
*/

CREATE TABLE IF NOT EXISTS appeal_rate_limits (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheme_id    text        NOT NULL,
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
