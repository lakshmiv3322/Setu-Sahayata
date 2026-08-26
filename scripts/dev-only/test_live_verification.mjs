import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pvwrwjggazjaktzzqipc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GET_nUJFMaETzYhSaOWTfQ_aupp0BPK';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const email = `test.citizen.${Date.now()}@gmail.com`;
const password = 'TestPassword123!';
const name = 'Test Citizen User';

async function runVerification() {
  console.log('--- 1. Testing Citizen Sign Up ---');
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } }
  });

  if (signUpErr) {
    console.error('Sign up error:', signUpErr.message);
    return;
  }
  console.log('Signed up user:', signUpData.user?.id, '| Email:', signUpData.user?.email);

  console.log('--- 2. Testing Sign In with Password ---');
  const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInErr) {
    console.log('Sign in response:', signInErr.message);
    if (signInErr.message.includes('Email not confirmed')) {
      console.log('Notice: Email confirmation is ON in Supabase project auth settings.');
    }
  } else {
    console.log('Signed in successfully! Session Token acquired:', !!signInData.session);
  }
}

runVerification();
