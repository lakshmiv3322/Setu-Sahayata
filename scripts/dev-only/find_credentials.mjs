import fs from 'fs';
import path from 'path';

const logPath = 'C:\\Users\\a_ven\\.gemini\\antigravity\\brain\\123c0926-f879-4cb4-911d-11ff61655c91\\.system_generated\\logs\\transcript.jsonl';

if (!fs.existsSync(logPath)) {
  console.error('Log file does not exist');
  process.exit(1);
}

const lines = fs.readFileSync(logPath, 'utf-8').split('\n');
console.log(`Searching ${lines.length} lines for database credentials...`);

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('postgresql:') || line.includes('postgres:') || line.includes('db_password') || line.includes('database_url') || line.includes('service_role') || line.includes('SUPABASE_SERVICE_ROLE_KEY')) {
    console.log(`Line ${i}:`);
    console.log(line.substring(0, 1000));
  }
}
