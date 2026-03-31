# EVRM-031 — AI QA Loop: n8n Implementation Steps

**Workflow:** `3.1 EverMagic Scenario Expansion`
**Status:** In progress

---

## Checklist

- [ ] **Step 1** — Move "Fetch Expansion Prompt" inside the loop
  - Disconnect it from its current position (after Envs)
  - Reconnect: Fetch Order Payload → Fetch Expansion Prompt
  - Update URL to:
    `=https://raw.githubusercontent.com/TarasGolub/evermagic/{{ $('Envs').first().json.env.is_live ? 'main' : 'develop' }}/prompts/{{ JSON.parse($('Fetch Order Payload').first().json.payload_json).theme.toLowerCase() }}/expansion.md`

- [ ] **Step 1b** — Add "Fetch QA Prompt" HTTP node (also inside the loop)
  - Connect: Fetch Order Payload → Fetch QA Prompt (parallel to Fetch Expansion Prompt)
  - Method: GET
  - URL: `=https://raw.githubusercontent.com/TarasGolub/evermagic/{{ $('Envs').first().json.env.is_live ? 'main' : 'develop' }}/prompts/shared/expansion_qa.md`
  - Response Format: Text

- [ ] **Step 2** — Break wire: Call OpenAI GPT-4o → Parse Expansion Response

- [ ] **Step 3** — Add "Build QA Prompt" Code node
  - Connect: Call OpenAI GPT-4o → Build QA Prompt
  - Paste: `utils/n8n-build-qa-prompt.js`

- [ ] **Step 4** — Add "QA Check" HTTP Request node
  - Connect: Build QA Prompt → QA Check
  - Method: POST
  - URL: `https://api.openai.com/v1/chat/completions`
  - Auth: Header Auth → `Authorization: Bearer <OpenAI key>`
  - Specify Body: JSON
  - JSON Body: `={{ $json.request_body }}`

- [ ] **Step 5** — Add "Parse QA Response" Code node
  - Connect: QA Check → Parse QA Response
  - Paste: `utils/n8n-parse-qa-response.js`

- [ ] **Step 6** — Add IF node
  - Connect: Parse QA Response → IF
  - Condition: `{{ $json.retry_required }}` — Boolean — is true

- [ ] **Step 7** — TRUE branch (retry path)
  - Add "Build Retry Prompt" Code node → paste `utils/n8n-build-retry-prompt.js`
  - Add "Retry GPT-4o" OpenAI node → same config as "Call OpenAI GPT-4o"
  - Connect: Retry GPT-4o → Parse Expansion Response (existing node)

- [ ] **Step 8** — FALSE branch (accept path)
  - Add "Accept Story" Code node → paste `utils/n8n-accept-story.js`
  - Connect: Accept Story → Save Expanded Content

- [ ] **Step 9** — Reconnect save nodes
  - Parse Expansion Response → Save Expanded Content (keep existing wire)
  - Accept Story → Save Expanded Content (add second input wire)

- [ ] **Step 10** — Update "Save Expanded Content" Supabase node
  - Add field: `qa_score` = `{{ $json.qa_score }}`

- [ ] **Step 11** — Run in Supabase SQL Editor
  ```sql
  ALTER TABLE scripts ADD COLUMN IF NOT EXISTS qa_score INT;
  ```

---

## Files created (already on feature/EVRM-031)

| File | Purpose |
|---|---|
| `prompts/space_hero/expansion_qa.md` | QA evaluator prompt |
| `utils/n8n-build-qa-prompt.js` | Builds QA OpenAI call + heuristic pre-check |
| `utils/n8n-parse-qa-response.js` | Parses QA response, sets retry_required |
| `utils/n8n-build-retry-prompt.js` | Builds retry call with QA feedback injected |
| `utils/n8n-accept-story.js` | FALSE path — passes accepted story to save |
| `utils/n8n-parse-expansion-response.js` | Updated — passes qa_score through |
| `database/scenario_expansion.sql` | Updated — adds qa_score column |
