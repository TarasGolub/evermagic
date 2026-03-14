// Export all n8n workflows to n8n_backup/
// Usage: N8N_BASE_URL=https://yourname.app.n8n.cloud N8N_API_KEY=your_key node scripts/export-n8n-workflows.mjs

import fs from 'fs';
import path from 'path';

const N8N_BASE = (process.env.N8N_BASE_URL || '').replace(/\/$/, '');
const N8N_KEY = process.env.N8N_API_KEY;

if (!N8N_BASE || !N8N_KEY) {
  console.error('Missing required env vars: N8N_BASE_URL and N8N_API_KEY');
  process.exit(1);
}

const res = await fetch(`${N8N_BASE}/api/v1/workflows`, {
  headers: { 'X-N8N-API-KEY': N8N_KEY }
});

if (!res.ok) {
  console.error(`n8n API error: ${res.status} ${res.statusText}`);
  process.exit(1);
}

const { data } = await res.json();
const outDir = path.resolve('n8n_backup');

for (const workflow of data) {
  const filename = path.join(outDir, `${workflow.name}.json`);
  fs.writeFileSync(filename, JSON.stringify(workflow, null, 2));
  console.log(`✅ ${workflow.name}`);
}

console.log(`\nExported ${data.length} workflow(s) to n8n_backup/`);