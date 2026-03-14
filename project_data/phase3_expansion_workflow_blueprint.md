# EverMagic Scenario Expansion — n8n Workflow Blueprint

**Workflow name:** EverMagic Scenario Expansion
**Trigger:** Manual
**Status transition:** `images_generated` → `scenario_expanding` → `scenario_expanded`

---

## Node Chain (12 nodes)

```
Manual Trigger
  → Load Envs
  → Envs
  → Fetch Scripts to Expand
  → Loop Over Items
      → Update Status: Expanding
      → Fetch Order Payload
      → Fetch Expansion Prompt
      → Build Expansion Prompt
      → Call OpenAI GPT-4o
      → Parse Expansion Response
      → Save Expanded Content
      → Update Order Status: scenario_expanded
```

---

## Node Configurations

### 1. Manual Trigger
- Type: `n8n-nodes-base.manualTrigger`
- No configuration needed.

---

### 2. Load Envs
- Type: `n8n-nodes-base.supabase`
- Operation: `getAll`
- Table: `envs`

---

### 3. Envs
- Type: `n8n-nodes-base.code`
- Paste the same Envs parsing code used in other workflows.

---

### 4. Fetch Scripts to Expand
- Type: `n8n-nodes-base.supabase`
- Operation: `getAll`
- Table: `scripts`
- Filter: `status` = `approved`
  *(Cross-check order status in code, or add a second filter via SQL if your Supabase node supports it)*

**Alternative — use HTTP Request node with raw SQL:**
```sql
SELECT s.order_id, s.version, s.status, s.content
FROM scripts s
JOIN orders o ON s.order_id = o.order_id
WHERE o.status = 'images_generated'
  AND s.status = 'approved'
  AND s.expanded_content IS NULL
ORDER BY s.order_id;
```

---

### 5. Loop Over Items
- Type: `n8n-nodes-base.splitInBatches`
- Batch size: `1`

---

### 6. Update Status: Expanding
- Type: `n8n-nodes-base.supabase`
- Operation: `update`
- Table: `orders`
- Update field: `status` = `scenario_expanding`
- Match on: `order_id` = `{{ $json.order_id }}`

---

### 7. Fetch Order Payload
- Type: `n8n-nodes-base.supabase`
- Operation: `get`
- Table: `order_payloads`
- Match on: `order_id` = `{{ $json.order_id }}`

---

### 8. Fetch Expansion Prompt
- Type: `n8n-nodes-base.httpRequest`
- Method: `GET`
- URL: `https://raw.githubusercontent.com/TarasGolub/evermagic/main/prompts/space_hero/expansion.md`
- Response format: `Text`

> Note: URL uses `main` branch — same pattern as Fetch Script Prompt in the intake workflow.

---

### 9. Build Expansion Prompt
- Type: `n8n-nodes-base.code`
- Paste: `utils/n8n-build-expansion-prompt.js`

**Node name references inside the code (update if your node names differ):**
- `$('Fetch Approved Script')` → rename to match your "Fetch Scripts to Expand" node name, or update the code
- `$('Fetch Order Payload')` → must match your node name exactly
- `$('Fetch Expansion Prompt')` → must match your node name exactly

---

### 10. Call OpenAI GPT-4o
- Type: `@n8n/n8n-nodes-langchain.openAi`
- Model: `gpt-4o`
- Operation: `message`
- System prompt: `{{ $json.system_prompt }}`
- User prompt: `{{ $json.user_prompt }}`
- Max tokens: `4000`
- Temperature: `0.8`

---

### 11. Parse Expansion Response
- Type: `n8n-nodes-base.code`
- Paste: `utils/n8n-parse-expansion-response.js`

**Node name reference inside the code:**
- `$('Build Expansion Prompt')` → must match your node name exactly

---

### 12. Save Expanded Content
- Type: `n8n-nodes-base.supabase`
- Operation: `update`
- Table: `scripts`
- Update field: `expanded_content` = `{{ JSON.stringify($json.expanded_content) }}`
- Match on: `order_id` = `{{ $json.order_id }}` AND `version` = `{{ $json.script_version }}`

---

### 13. Update Order Status: scenario_expanded
- Type: `n8n-nodes-base.supabase`
- Operation: `update`
- Table: `orders`
- Update field: `status` = `scenario_expanded`
- Match on: `order_id` = `{{ $json.order_id }}`

---

## Pre-flight Checklist

Before running this workflow:

- [ ] Run `database/scenario_expansion.sql` in Supabase SQL editor
- [ ] Confirm at least one order exists with status `images_generated`
- [ ] Confirm the order's script has `characters` array (scripts generated before `system.md` update won't have it — test with a new order)
- [ ] Verify GitHub URL for `expansion.md` is accessible (raw URL, public repo)

---

## Known Gotcha

Scripts generated **before** the `system.md` update (Phase 3) will not have a `characters` array. The `n8n-build-expansion-prompt.js` handles this gracefully — it falls back to an empty companion — but the expansion quality will suffer. For best results, generate a fresh test order after the `system.md` update is live on `main`.
