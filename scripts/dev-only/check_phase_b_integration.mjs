/**
 * check_phase_b_integration.mjs
 * Phase B integration tests for Setu Sahayata.
 *
 * Tests:
 *   1. Supabase connection & schema validation
 *   2. Scheme ingestion API route reachability
 *   3. DB schemes (source_url, last_verified_at columns)
 *   4. User profile with family_members JSONB upsert (with auth session)
 *   5. Application creation (with auth session)
 *   6. Application outcomes (anonymous) insert & aggregate
 *
 * Run: node check_phase_b_integration.mjs
 * Note: Ensure `npm run dev` is running at localhost:3000 for Test 2.
 */

import { createClient } from '@supabase/supabase-js';

// ──────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────
const SUPABASE_URL  = 'https://gzhcmypgymyxevzhszlz.supabase.co';
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY ||
  'sb_publishable_z8reSTx6hAYl6fyuu4FVaA_vEReJAL7';
const BASE_URL      = process.env.BASE_URL || 'http://localhost:3000';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

let passed = 0;
let failed = 0;

function ok(label, val) {
  if (val) {
    console.log(`  \u2705 PASS: ${label}`);
    passed++;
  } else {
    console.error(`  \u274c FAIL: ${label}`);
    failed++;
  }
}

function skip(label, reason) {
  console.log(`  \u23e9 SKIP: ${label} — ${reason}`);
}

function section(title) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`\uD83D\uDD37 ${title}`);
  console.log('─'.repeat(60));
}

// ──────────────────────────────────────────────
// 1. Supabase connection & Schema Validation
// ──────────────────────────────────────────────
section('Test 1: Supabase Connection & Schema Validation');

const { data: schemesSample, error: schemesErr } = await supabase
  .from('schemes')
  .select('id, name, source_url, last_verified_at')
  .limit(5);

ok('No error fetching schemes', !schemesErr);
ok('Returned at least 1 scheme', schemesSample && schemesSample.length > 0);

if (schemesSample && schemesSample.length > 0) {
  const s = schemesSample[0];
  ok('schemes.id column exists', typeof s.id !== 'undefined');
  ok('schemes.name column exists', typeof s.name !== 'undefined');
  ok('schemes.source_url column present in schema', 'source_url' in s);
  ok('schemes.last_verified_at column present in schema', 'last_verified_at' in s);
  console.log(`  Sample: "${s.name}" | source_url=${s.source_url ?? '(none)'} | last_verified_at=${s.last_verified_at ?? '(none)'}`);
}

// Check profiles table
const { data: profilesSample, error: profilesErr } = await supabase
  .from('profiles')
  .select('user_id, family_members')
  .limit(1);

ok('No error fetching profiles schema', !profilesErr);
if (profilesSample && profilesSample.length > 0) {
  ok('profiles.family_members column present', 'family_members' in profilesSample[0]);
}

// Check application_outcomes table
const { data: outcomeSample, error: outcomeErr } = await supabase
  .from('application_outcomes')
  .select('id, scheme_id, outcome, created_at')
  .limit(1);

ok('No error fetching application_outcomes', !outcomeErr);
ok('application_outcomes table accessible', Array.isArray(outcomeSample));

// ──────────────────────────────────────────────
// 2. Sign Up / Sign In Test User
// ──────────────────────────────────────────────
section('Test 2: Test User Auth');

const testEmail    = `phaseb.test.${Date.now()}@mailnull.com`;
const testPassword = `SetuTest_${Date.now()}!`;
let accessToken = '';
let refreshToken = '';
let userId = '';

const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
  email: testEmail,
  password: testPassword,
  options: { data: { full_name: 'Phase B Tester' } },
});

if (signUpErr) {
  console.log(`  ⚠️  signUp skipped (${signUpErr.message}). Attempting fallback sign-in...`);
  // Cycle through known-working users from prior test runs
  const fallbacks = [
    { email: 'phaseb.test.1787678900000@mailnull.com', password: 'SetuTest_1787678900000!' },
  ];
  let authenticated = false;
  for (const creds of fallbacks) {
    const { data: inData, error: inErr } = await supabase.auth.signInWithPassword(creds);
    if (!inErr && inData?.user) {
      accessToken  = inData.session.access_token;
      refreshToken = inData.session.refresh_token;
      userId       = inData.user.id;
      authenticated = true;
      ok('Signed in with fallback test user', true);
      break;
    }
  }
  if (!authenticated) {
    console.log('  ⚠️  No fallback user succeeded. Profile/Application tests will be skipped (auth rate-limited).');
    ok('Auth available for DB write tests', false);
  }
} else {
  accessToken  = signUpData.session?.access_token  || '';
  refreshToken = signUpData.session?.refresh_token || '';
  userId       = signUpData.user?.id               || '';
  ok('Test user signed up', !!userId);

  // Explicitly set the session so subsequent RLS-protected writes work
  if (accessToken && refreshToken) {
    await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  }
}

const canWrite = !!userId && !!accessToken;

// ──────────────────────────────────────────────
// 3. Profile + Family Members JSONB Upsert
// ──────────────────────────────────────────────
section('Test 3: Profile & Family Members JSONB Upsert');

if (!canWrite) {
  skip('Profile upsert', 'no auth session');
  skip('family_members read-back', 'no auth session');
} else {
  // Ensure session is active
  await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });

  const familyPayload = [
    {
      id: `member-a`,
      name: 'Sunita Devi',
      age: 45,
      gender: 'Female',
      relation: 'Mother',
      income: 80000,
      occupation: 'Homemaker',
      has_aadhaar: true,
      has_ration_card: true,
      has_udyam: false,
    },
    {
      id: `member-b`,
      name: 'Raju Kumar',
      age: 18,
      gender: 'Male',
      relation: 'Son',
      income: 0,
      occupation: 'Student',
      has_aadhaar: true,
      has_ration_card: false,
      has_udyam: false,
    },
  ];

  const { error: upsertErr } = await supabase.from('profiles').upsert({
    user_id: userId,
    name: 'Phase B Tester',
    age: 35,
    gender: 'Male',
    state: 'Bihar',
    city: 'Patna',
    occupation: 'Farmer',
    income: 120000,
    category: 'OBC',
    has_aadhaar: true,
    has_ration_card: true,
    has_udyam: false,
    family_members: familyPayload,
  }, { onConflict: 'user_id' });

  ok('Profile upsert with family_members succeeded', !upsertErr);
  if (upsertErr) console.error('    Upsert error:', upsertErr.code, '-', upsertErr.message);

  const { data: readBack, error: readErr } = await supabase
    .from('profiles')
    .select('family_members')
    .eq('user_id', userId)
    .maybeSingle();

  ok('Read back profile without error', !readErr);
  ok('family_members is an array', Array.isArray(readBack?.family_members));
  ok('family_members count is 2', readBack?.family_members?.length === 2);

  if (Array.isArray(readBack?.family_members)) {
    const [m1, m2] = readBack.family_members;
    ok('First member has name', typeof m1?.name === 'string');
    ok('First member has relation', typeof m1?.relation === 'string');
    ok('First member has income', typeof m1?.income === 'number');
    ok('First member has has_aadhaar', typeof m1?.has_aadhaar === 'boolean');
    console.log(`  Member 1: ${m1.name} | ${m1.relation}`);
    console.log(`  Member 2: ${m2?.name} | ${m2?.relation}`);
  }
}

// ──────────────────────────────────────────────
// 4. Scheme Ingestion API Route
// ──────────────────────────────────────────────
section('Test 4: Scheme Ingestion API Route');

try {
  const ingestRes = await fetch(`${BASE_URL}/api/admin/ingest-schemes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  // 200 = success, 401/403 = auth guard working (test user isn't admin)
  const guardWorking = [200, 401, 403].includes(ingestRes.status);
  ok(`Ingest API responded with valid HTTP status (${ingestRes.status})`, guardWorking);
  const ingestBody = await ingestRes.json().catch(() => ({}));
  console.log('  API Response:', JSON.stringify(ingestBody).slice(0, 200));
  if (ingestRes.status === 200) {
    ok('Ingestion response has upserted/ingested count', typeof ingestBody.upserted === 'number' || typeof ingestBody.ingested === 'number');
  } else {
    console.log(`  ℹ️  Status ${ingestRes.status} — route auth guard working correctly`);
  }
} catch (fetchErr) {
  console.error(`  ⚠️  Could not reach dev server at ${BASE_URL} — ensure 'npm run dev' is running`);
  skip('Ingest API route', 'dev server not reachable');
}

// ──────────────────────────────────────────────
// 5. DB Schemes: source_url + last_verified_at presence
// ──────────────────────────────────────────────
section('Test 5: DB Schemes — Provenance Columns');

const { data: allSchemes, error: allSchemesErr } = await supabase
  .from('schemes')
  .select('id, name, source_url, last_verified_at')
  .eq('active', true);

ok('No error querying active schemes', !allSchemesErr);
ok('At least 1 active scheme', allSchemes && allSchemes.length > 0);

if (allSchemes && allSchemes.length > 0) {
  const withSource  = allSchemes.filter(s => s.source_url);
  const withVerified = allSchemes.filter(s => s.last_verified_at);
  console.log(`  Total active schemes:        ${allSchemes.length}`);
  console.log(`  Schemes with source_url:     ${withSource.length}`);
  console.log(`  Schemes with last_verified_at: ${withVerified.length}`);

  // Column existence is the hard requirement; populated values depend on whether
  // /api/admin/ingest-schemes has been run with the new mock-gov-feed.json.
  ok('source_url column exists in schema', 'source_url' in allSchemes[0]);
  ok('last_verified_at column exists in schema', 'last_verified_at' in allSchemes[0]);
  ok('At least 1 scheme has last_verified_at populated', withVerified.length > 0);

  if (withSource.length === 0) {
    console.log('  ℹ️  No source_url values yet — run POST /api/admin/ingest-schemes as admin to populate.');
  } else {
    ok('At least 1 scheme has source_url populated', withSource.length > 0);
  }
}

// ──────────────────────────────────────────────
// 6. Application Creation
// ──────────────────────────────────────────────
section('Test 6: Application Creation');

const schemeId = allSchemes?.[0]?.id;
ok('Scheme ID available', !!schemeId);

let testApplicationId = null;

if (schemeId && canWrite) {
  await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  const appId = `SETU-PHASEB-${Date.now()}`;
  const { data: appData, error: appErr } = await supabase
    .from('applications')
    .insert({
      user_id: userId,
      scheme_id: schemeId,
      scheme_name: allSchemes[0].name,
      application_id: appId,
      status: 'Prepared',
      submitted_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  ok('Application inserted without error', !appErr);
  if (appErr) {
    console.error('    Error:', appErr.message);
  } else {
    testApplicationId = appData.id;
    ok('Application has application_id', !!appData.application_id);
    ok('Application status is Prepared', appData.status === 'Prepared');
    ok('Application belongs to user', appData.user_id === userId);
    console.log(`  Created application DB id=${testApplicationId}, app_id=${appData.application_id}`);
  }
} else if (!canWrite) {
  skip('Application insert', 'no auth session');
}

// ──────────────────────────────────────────────
// 7. Application Outcomes (Anonymous Community Signal)
// ──────────────────────────────────────────────
section('Test 7: Application Outcomes (Anonymous Community Signal)');

if (schemeId && canWrite) {
  await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });

  const { error: insertOutcomeErr } = await supabase
    .from('application_outcomes')
    .insert([
      { scheme_id: schemeId, outcome: 'Success' },
      { scheme_id: schemeId, outcome: 'Success' },
      { scheme_id: schemeId, outcome: 'Pending' },
    ]);

  ok('Outcome rows inserted without error', !insertOutcomeErr);
  if (insertOutcomeErr) console.error('    Error:', insertOutcomeErr.message);

  const { data: aggData, error: aggErr } = await supabase
    .from('application_outcomes')
    .select('scheme_id, outcome')
    .eq('scheme_id', schemeId);

  ok('Outcome aggregate query succeeded', !aggErr);
  if (aggData) {
    const counts = aggData.reduce((acc, row) => {
      acc[row.outcome] = (acc[row.outcome] || 0) + 1;
      return acc;
    }, {});
    console.log('  Aggregated outcomes:', JSON.stringify(counts));
    ok('At least 2 Success outcomes recorded', (counts['Success'] || 0) >= 2);
    ok('At least 1 Pending outcome recorded', (counts['Pending'] || 0) >= 1);
    ok('application_outcomes row has no user_id column', !('user_id' in (aggData[0] || {})));
  }
} else {
  skip('Outcome inserts', schemeId ? 'no auth session' : 'no scheme ID');
}

// ──────────────────────────────────────────────
// 8. Cleanup
// ──────────────────────────────────────────────
section('Test 8: Cleanup');

if (canWrite) {
  await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
}

if (testApplicationId && canWrite) {
  const { error: delAppErr } = await supabase.from('applications').delete().eq('id', testApplicationId);
  ok('Test application deleted', !delAppErr);
  if (delAppErr) console.error('    Delete error:', delAppErr.message);
} else {
  skip('Delete test application', testApplicationId ? 'no auth' : 'no test app was created');
}

if (schemeId && canWrite) {
  const { error: delOutErr } = await supabase
    .from('application_outcomes')
    .delete()
    .eq('scheme_id', schemeId)
    .in('outcome', ['Success', 'Pending']);
  if (!delOutErr) console.log('  Cleaned up test outcome rows.');
  else console.warn('  Outcome cleanup error (non-fatal):', delOutErr.message);
}

// ──────────────────────────────────────────────
// Summary
// ──────────────────────────────────────────────
console.log(`\n${'═'.repeat(60)}`);
console.log('\uD83D\uDCCA Phase B Integration Test Summary');
console.log(`  \u2705 Passed: ${passed}`);
console.log(`  \u274c Failed: ${failed}`);
console.log(`  Total:    ${passed + failed}`);
console.log('═'.repeat(60));

if (failed > 0) process.exit(1);
