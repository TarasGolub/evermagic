#!/usr/bin/env node
// Quick coloring page prompt test — calls OpenAI directly, saves result to /tmp/
// Usage: OPENAI_API_KEY=sk-... node scripts/test-coloring-prompt.mjs
//
// Generates ONE coloring page using the updated prompt and saves the JPEG to /tmp/coloring_test.jpg
// Tweak PROMPT below to iterate quickly without running the full n8n pipeline.

import fs from 'fs';
import https from 'https';

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('❌  Set OPENAI_API_KEY env var first');
  process.exit(1);
}

// ── Prompt to test — mirrors the new n8n-build-image-prompts.js logic ──
const age = 7;
const genderWord = 'girl';
const backgroundElements = 'enchanted trees, a castle tower, stars, a small friendly dragon, magical floating lanterns';
const pose = 'standing with arms slightly raised in a cheerful pose';

const PROMPT = `Children's printable coloring book page. Wide shot — entire character fully inside frame, nothing cut off. Pure black outlines on pure white background only. No color, no grey, no shading, no gradients, no fills whatsoever — only crisp black lines on white. A ${age}-year-old ${genderWord} ${pose}. Both feet flat on the ground, fully visible at the bottom — feet and shoes never cropped. Head fully visible at top with white space above. Entire silhouette visible. Character occupies about 55% of image height, centered, with extra white margins on all sides. No cropping at any edge. Bold thick uniform black outlines, published coloring book quality — not sketchy, not pencil-like, not shaded. Simple background elements as clean outlines only: ${backgroundElements}. Easy for a child to color with crayons.`;

console.log('🎨 Prompt:\n', PROMPT);
console.log('\n⏳ Calling OpenAI /images/generations ...');

const body = JSON.stringify({
  model: 'gpt-image-1',
  prompt: PROMPT,
  size: '1024x1024',
  quality: 'medium',
  output_format: 'jpeg',
  n: 1,
});

const options = {
  hostname: 'api.openai.com',
  path: '/v1/images/generations',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    if (json.error) {
      console.error('❌ API error:', json.error);
      process.exit(1);
    }
    const b64 = json.data[0].b64_json;
    const outPath = '/tmp/coloring_test.jpg';
    fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
    console.log(`✅ Saved to ${outPath}`);
    console.log('   Open with: open /tmp/coloring_test.jpg');
  });
});

req.on('error', e => { console.error('❌ Request failed:', e); process.exit(1); });
req.write(body);
req.end();
