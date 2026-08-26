import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pvwrwjggazjaktzzqipc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GET_nUJFMaETzYhSaOWTfQ_aupp0BPK';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
  console.log('Testing connection to Supabase...');
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('count');
  console.log('profiles query:', { data: profiles, error: pErr });

  const { data: apps, error: aErr } = await supabase.from('applications').select('count');
  console.log('applications query:', { data: apps, error: aErr });

  const { data: docs, error: dErr } = await supabase.from('documents').select('count');
  console.log('documents query:', { data: docs, error: dErr });

  const { data: logs, error: lErr } = await supabase.from('audit_logs').select('count');
  console.log('audit_logs query:', { data: logs, error: lErr });

  const { data: schemes, error: sErr } = await supabase.from('schemes').select('count');
  console.log('schemes query:', { data: schemes, error: sErr });
}

check();
