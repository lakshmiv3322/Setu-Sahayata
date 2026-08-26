import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pvwrwjggazjaktzzqipc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GET_nUJFMaETzYhSaOWTfQ_aupp0BPK';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const existingEmail = 'citizen.test.1787666490443@gmail.com';
const existingPassword = 'Pass_1787666490443!';

async function runFullPipelineTest() {
  console.log('===========================================================');
  console.log('1. TEST: Unauthenticated POST /api/admin/ingest-schemes');
  console.log('===========================================================');
  try {
    const unauthRes = await fetch('http://localhost:3000/api/admin/ingest-schemes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    console.log(`Status Code: ${unauthRes.status} ${unauthRes.statusText}`);
    const unauthData = await unauthRes.json();
    console.log('Response Body:', JSON.stringify(unauthData));
  } catch (err) {
    console.error('Error hitting unauthenticated endpoint:', err.message);
  }

  console.log('\n===========================================================');
  console.log('2. TEST: Authenticating Existing User & Creating Profile');
  console.log('===========================================================');
  
  let token = '';
  let user = null;

  const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
    email: existingEmail,
    password: existingPassword,
  });

  if (signInErr) {
    console.log('Sign in with existing credentials returned:', signInErr.message);
    console.log('Creating user with signUp...');
    const ts = Date.now();
    const newEmail = `user.test.${ts}@gmail.com`;
    const newPass = `Pass_${ts}!`;
    const { data: sData, error: sErr } = await supabase.auth.signUp({
      email: newEmail,
      password: newPass,
      options: { data: { full_name: 'Test Citizen User' } }
    });
    if (sErr) {
      console.error('SignUp error:', sErr);
      return;
    }
    user = sData.user;
    token = sData.session?.access_token || '';
  } else {
    user = signInData.user;
    token = signInData.session.access_token;
    console.log('Authenticated successfully as:', user.email);
  }

  console.log('User ID:', user.id);
  console.log('Token present:', !!token);

  // Ensure profile exists for user with is_admin = false
  const { data: existingProf } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
  if (!existingProf) {
    console.log('Creating profile for user (is_admin = false)...');
    await supabase.from('profiles').insert({
      user_id: user.id,
      name: 'Test Citizen User',
      age: 28,
      gender: 'Female',
      state: 'Uttar Pradesh',
      city: 'Lucknow',
      occupation: 'Street Vendor',
      income: 180000,
      category: 'OBC',
      family_size: 4,
      has_aadhaar: true,
      has_ration_card: true,
      has_udyam: true,
      is_admin: false,
    });
  } else {
    console.log('Existing Profile loaded (is_admin):', existingProf.is_admin);
    // Reset to false for testing non-admin check
    await supabase.from('profiles').update({ is_admin: false }).eq('user_id', user.id);
  }

  console.log('\n===========================================================');
  console.log('3. TEST: Non-Admin POST /api/admin/ingest-schemes (Expect 403)');
  console.log('===========================================================');
  try {
    const nonAdminRes = await fetch('http://localhost:3000/api/admin/ingest-schemes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log(`Status Code: ${nonAdminRes.status} ${nonAdminRes.statusText}`);
    const nonAdminData = await nonAdminRes.json();
    console.log('Response Body:', JSON.stringify(nonAdminData));
  } catch (err) {
    console.error('Error hitting non-admin endpoint:', err.message);
  }

  console.log('\n===========================================================');
  console.log('4. UPGRADE PROFILE: Setting is_admin = true in database');
  console.log('===========================================================');
  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ is_admin: true })
    .eq('user_id', user.id);

  if (updateErr) {
    console.error('Failed to elevate profile:', updateErr);
  } else {
    console.log('Profile successfully updated: is_admin = true');
  }

  console.log('\n===========================================================');
  console.log('5. TEST: Authenticated Admin POST /api/admin/ingest-schemes (Expect 200)');
  console.log('===========================================================');
  try {
    const adminRes = await fetch('http://localhost:3000/api/admin/ingest-schemes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log(`Status Code: ${adminRes.status} ${adminRes.statusText}`);
    const adminData = await adminRes.json();
    console.log('Response Body:', JSON.stringify(adminData));
  } catch (err) {
    console.error('Error hitting admin endpoint:', err.message);
  }

  console.log('\n===========================================================');
  console.log('6. VERIFICATION: SELECT count(*) FROM schemes in Supabase');
  console.log('===========================================================');
  const { data: schemes, error: schemesErr } = await supabase.from('schemes').select('id, name, eligibility_rules');
  if (schemesErr) {
    console.error('Error querying schemes table:', schemesErr);
  } else {
    console.log(`SELECT count(*) FROM schemes result: ${schemes.length}`);
    console.log('Sample ingested scheme records in database:');
    schemes.slice(0, 5).forEach((s, idx) => {
      console.log(`  ${idx + 1}. [${s.id}] ${s.name} | eligibility_rules count: ${s.eligibility_rules?.length}`);
    });
  }

  console.log('\n===========================================================');
  console.log('7. TEST: Persistent Rate Limiting on /api/appeal-guidance');
  console.log('===========================================================');
  const appealPayload = {
    schemeId: 'pm-svanidhi',
    schemeName: 'PM SVANidhi',
    failedCriteria: ['Annual income ≤ ₹2,00,000'],
  };

  console.log('Call 1: Triggering /api/appeal-guidance...');
  const call1Res = await fetch('http://localhost:3000/api/appeal-guidance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(appealPayload),
  });
  console.log(`Call 1 Status: ${call1Res.status} ${call1Res.statusText}`);
  const call1Data = await call1Res.json();
  console.log('Call 1 Response keys:', Object.keys(call1Data));

  console.log('\nCall 2: Triggering /api/appeal-guidance again for same user & scheme...');
  const call2Res = await fetch('http://localhost:3000/api/appeal-guidance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(appealPayload),
  });
  console.log(`Call 2 Status (Expecting 429): ${call2Res.status} ${call2Res.statusText}`);
  const call2Data = await call2Res.json();
  console.log('Call 2 Response Body:', JSON.stringify(call2Data));

  console.log('\n===========================================================');
  console.log('8. VERIFICATION: Querying appeal_rate_limits table in Supabase');
  console.log('===========================================================');
  const { data: limits, error: limitErr } = await supabase.from('appeal_rate_limits').select('*');
  if (limitErr) {
    console.error('Error querying appeal_rate_limits:', limitErr);
  } else {
    console.log(`Stored appeal_rate_limits records count: ${limits.length}`);
    console.log('Record details:', limits);
  }
}

runFullPipelineTest();
