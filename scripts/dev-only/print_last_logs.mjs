import fs from 'fs';
import path from 'path';

const logPath = 'C:\\Users\\a_ven\\.gemini\\antigravity\\brain\\123c0926-f879-4cb4-911d-11ff61655c91\\.system_generated\\logs\\transcript.jsonl';

if (!fs.existsSync(logPath)) {
  console.error('Log file does not exist at:', logPath);
  process.exit(1);
}

const fileContent = fs.readFileSync(logPath, 'utf-8');
const lines = fileContent.split('\n').filter(l => l.trim() !== '');

console.log(`Total lines: ${lines.length}`);

// Print the last 15 lines of the transcript
const lastLines = lines.slice(-15);
lastLines.forEach((line, idx) => {
  try {
    const obj = JSON.parse(line);
    console.log(`\n--- STEP ${lines.length - 15 + idx} (Type: ${obj.type}, Source: ${obj.source}) ---`);
    console.log(obj.content ? obj.content.substring(0, 1000) : '[No Content]');
    if (obj.tool_calls) {
      console.log(`Tool Calls:`, JSON.stringify(obj.tool_calls, null, 2));
    }
  } catch (err) {
    console.log(`\n--- STEP ${lines.length - 15 + idx} (Error parsing JSON) ---`);
    console.log(line.substring(0, 500));
  }
});
