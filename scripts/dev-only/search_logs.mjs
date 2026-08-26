import fs from 'fs';
import path from 'path';

const logPath = 'C:\\Users\\a_ven\\.gemini\\antigravity\\brain\\123c0926-f879-4cb4-911d-11ff61655c91\\.system_generated\\logs\\transcript.jsonl';

if (!fs.existsSync(logPath)) {
  console.error('Log file does not exist at:', logPath);
  process.exit(1);
}

const fileContent = fs.readFileSync(logPath, 'utf-8');
const lines = fileContent.split('\n');

console.log(`Read ${lines.length} lines.`);

// Find any lines containing 'supabase' or 'env' or 'URL'
let found = 0;
for (const line of lines) {
  if (line.toLowerCase().includes('supabase') || line.toLowerCase().includes('env') || line.toLowerCase().includes('url')) {
    found++;
    if (found <= 50) {
      try {
        const obj = JSON.parse(line);
        // Print relevant parts
        console.log(`[Line ${found}] Type: ${obj.type} | Content preview: ${obj.content ? obj.content.substring(0, 100) : ''}`);
        if (obj.tool_calls) {
          console.log(`   Tool Calls:`, JSON.stringify(obj.tool_calls).substring(0, 150));
        }
      } catch {
        console.log(`[Line ${found}] Non-JSON line: ${line.substring(0, 100)}`);
      }
    }
  }
}
console.log(`Total matching lines: ${found}`);
