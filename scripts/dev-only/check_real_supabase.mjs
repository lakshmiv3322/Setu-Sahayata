import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env manually
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value.trim();
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Using Supabase URL:', SUPABASE_URL);
console.log('Using Supabase Anon Key:', SUPABASE_ANON_KEY ? 'EXISTS (length ' + SUPABASE_ANON_KEY.length + ')' : 'MISSING');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log('\n--- Checking Tables ---');
  for (const table of ['profiles', 'applications', 'documents', 'audit_logs', 'schemes', 'scheme_deadlines', 'appeal_rate_limits']) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`Table '${table}': error: ${error.message}`);
    } else {
      console.log(`Table '${table}': exists, count = ${count}`);
    }
  }

  console.log('\n--- Checking Schemes count ---');
  const { data: schemes, error: sErr } = await supabase.from('schemes').select('id, name');
  if (sErr) {
    console.error('Error fetching schemes:', sErr);
  } else {
    console.log(`Total schemes in DB: ${schemes.length}`);
    schemes.forEach((s, idx) => {
      console.log(`  ${idx + 1}. [${s.id}] ${s.name}`);
    });
  }
}

run();
