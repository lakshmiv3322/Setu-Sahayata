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

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log('\n--- Checking New Columns and Tables ---');
  
  // Check profiles schema
  const { data: prof, error: pErr } = await supabase.from('profiles').select('family_members').limit(1);
  if (pErr) {
    console.log('Column profiles.family_members: MISSING or error:', pErr.message);
  } else {
    console.log('Column profiles.family_members: EXISTS');
  }

  // Check schemes schema
  const { data: sch, error: sErr } = await supabase.from('schemes').select('source_url, last_verified_at').limit(1);
  if (sErr) {
    console.log('Columns schemes.source_url/last_verified_at: MISSING or error:', sErr.message);
  } else {
    console.log('Columns schemes.source_url/last_verified_at: EXISTS');
  }

  // Check application_outcomes table
  const { data: out, error: oErr } = await supabase.from('application_outcomes').select('*').limit(1);
  if (oErr) {
    console.log('Table application_outcomes: MISSING or error:', oErr.message);
  } else {
    console.log('Table application_outcomes: EXISTS');
  }
}

run();
