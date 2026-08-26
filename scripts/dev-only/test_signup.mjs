import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gzhcmypgymyxevzhszlz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_z8reSTx6hAYl6fyuu4FVaA_vEReJAL7';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const email = `test.${Date.now()}@gmail.com`;
  const password = 'Password123!';
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  console.log('Signup result:', { data, error });
}

run();
