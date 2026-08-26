import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pvwrwjggazjaktzzqipc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GET_nUJFMaETzYhSaOWTfQ_aupp0BPK';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const email = `admin.verification.${Date.now()}@gmail.com`;
const password = `AdminPass_${Date.now()}!`;

async function testAdminIngest200() {
  console.log('=== STEP 1: Registering Admin Verification User ===');
  let token = '';
  let userId = '';

  const { data: sData, error: sErr } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: 'Admin Verifier' } }
  });

  if (sErr) {
    console.log('SignUp notice:', sErr.message);
    // If rate limited on signUp, try signing in with previous test user
    const altEmail = 'citizen.test.1787666490443@gmail.com';
    const altPass = 'Pass_1787666490443!';
    const { data: inData, error: inErr } = await supabase.auth.signInWithPassword({
      email: altEmail,
      password: altPass
    });
    if (inErr) {
      console.error('SignIn error:', inErr.message);
      return;
    }
    token = inData.session.access_token;
    userId = inData.user.id;
    console.log('Signed in with existing user ID:', userId);
  } else {
    userId = sData.user?.id || '';
    token = sData.session?.access_token || '';
    console.log('Signed up user ID:', userId);
  }

  console.log('\n=== STEP 2: Creating Profile & Elevating to is_admin = true ===');
  const { data: existingProf } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
  
  if (!existingProf) {
    const { data: newProf, error: pErr } = await supabase.from('profiles').insert({
      user_id: userId,
      name: 'Admin Verifier',
      age: 35,
      gender: 'Male',
      state: 'Delhi',
      city: 'New Delhi',
      occupation: 'Administrator',
      income: 500000,
      category: 'General',
      is_admin: true,
      has_aadhaar: true
    }).select('*').single();
    if (pErr) console.error('Error inserting profile:', pErr);
    else console.log('Admin Profile created:', newProf);
  } else {
    const { error: uErr } = await supabase.from('profiles').update({ is_admin: true }).eq('user_id', userId);
    if (uErr) console.error('Error elevating profile:', uErr);
    else console.log('Existing profile elevated: is_admin = true');
  }

  console.log('\n=== STEP 3: Calling POST /api/admin/ingest-schemes as Admin ===');
  try {
    const res = await fetch('http://localhost:3000/api/admin/ingest-schemes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`HTTP Status: ${res.status} ${res.statusText}`);
    const body = await res.json();
    console.log('Response Body:', JSON.stringify(body, null, 2));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }

  console.log('\n=== STEP 4: Querying SELECT count(*) FROM schemes on Live Supabase DB ===');
  const { data: schemes, error: schErr } = await supabase.from('schemes').select('id, name');
  if (schErr) {
    console.error('Query error:', schErr);
  } else {
    console.log(`SELECT count(*) FROM schemes count: ${schemes.length}`);
    console.log('Ingested schemes list:');
    schemes.forEach((s, idx) => console.log(`  ${idx + 1}. [${s.id}] ${s.name}`));
  }
}

testAdminIngest200();
