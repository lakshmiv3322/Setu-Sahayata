# Dev-Only Scripts

These are **manual development utilities** used during active development and debugging of the Setu Sahayata platform.

> [!WARNING]
> These scripts are **NOT** part of the application, build pipeline, or automated test suite.
> Do not run them in production or against a production Supabase instance with real user data.

## Usage

All scripts are plain Node.js ESM modules (`.mjs`). Run them directly with Node.js from the project root:

```bash
node scripts/dev-only/<script-name>.mjs
```

They read `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `.env` (or your shell environment).

## Scripts

| Script | Purpose |
|--------|---------|
| `check_env.mjs` | Validates that required environment variables are set |
| `check_phase_b_db.mjs` | Phase B database schema validation |
| `check_phase_b_integration.mjs` | Comprehensive integration test harness (pre-Playwright) |
| `check_raw_postgrest.mjs` | Tests direct PostgREST API connectivity |
| `check_raw_postgrest_new.mjs` | Updated PostgREST connectivity test |
| `check_real_supabase.mjs` | Verifies live Supabase connection and basic auth |
| `check_schemes.mjs` | Validates scheme data completeness and integrity |
| `check_tables.mjs` | Confirms all expected DB tables exist |
| `find_credentials.mjs` | Scans source files for accidentally hardcoded credentials |
| `print_last_logs.mjs` | Prints recent entries from the `audit_logs` table |
| `search_logs.mjs` | Searches `audit_logs` by action or user ID |
| `test_admin_ingest_200.mjs` | Verifies the admin scheme ingestion API returns 200 |
| `test_admin_ingest_and_rate_limit.mjs` | Tests ingestion pipeline + appeal rate limiting |
| `test_auth_flow.mjs` | End-to-end auth flow test (signup → login → logout) |
| `test_live_verification.mjs` | Live Aadhaar/document verification test |
| `test_old_supabase.mjs` | Tests the previous (deprecated) Supabase project instance |
| `test_signup.mjs` | Minimal signup smoke test |
| `test_tables_verbose.mjs` | Dumps verbose table structure from PostgREST schema |

## Replacing These with Real Tests

The automated test suite lives in:
- `tests/` — Vitest unit tests (`npm test`)
- `e2e/` — Playwright E2E tests (`npm run test:e2e`)

Prefer those for CI and reproducible testing. These scripts are for quick ad-hoc debugging only.
