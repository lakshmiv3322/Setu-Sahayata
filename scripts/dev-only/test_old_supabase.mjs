import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pvwrwjggazjaktzzqipc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GET_nUJFMaETzYhSaOWTfQ_aupp0BPK';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
  console.log('Profiles Query Count:', profiles ? profiles.length : null);
  console.log('Profiles Query Error:', pErr);

  const { data: schemes, error: schemesErr } = await supabase.from('schemes').select('*');
  console.log('Schemes Query Count:', schemes ? schemes.length : null);
  console.log('Schemes Query Error:', schemesErr);
}

run();
