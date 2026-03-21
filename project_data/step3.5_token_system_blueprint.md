# Step 3.5 — Intake Token System: n8n Workflow Blueprint

## Workflow: `1. EverMagic v1.0.1` — Changes Required

Add **6 new nodes** between `Receive Order` and `Load Envs`.

---

## New Node Chain

```
Receive Order (existing)
    ↓
[NEW] Parse Token              ← Code node
    ↓
[NEW] If Skip Token Check      ← IF node (cheat token bypass)
    │
    ├── TRUE  ──────────────────────────────────────────────────→ Load Envs (existing, unchanged)
    │
    └── FALSE
            ↓
        [NEW] Fetch Token from DB   ← Supabase: getAll intake_tokens
            ↓
        [NEW] Validate Token        ← Code node
            ↓
        [NEW] If Token Valid        ← IF node
            │
            ├── TRUE  ──────────────────────────────────────────→ Mark Token Used → Load Envs
            │                                                           ↓
            │
            └── FALSE
                    ↓
                [NEW] Reject Token          ← Code node (builds error body)
                    ↓
                [NEW] Respond Token Error   ← Respond to Webhook node
```

---

## Node Configurations

### 1. `Parse Token` — Code node

Paste the full content of `utils/n8n-validate-token.js`.

Position: After `Receive Order`.

---

### 2. `If Skip Token Check` — IF node

| Field | Value |
|-------|-------|
| Condition | `{{ $json.skipTokenCheck }}` equals `true` (boolean) |
| True branch | → `Load Envs` |
| False branch | → `Fetch Token from DB` |

---

### 3. `Fetch Token from DB` — Supabase node

| Field | Value |
|-------|-------|
| Operation | `getAll` |
| Table | `intake_tokens` |
| Filter | `token` **eq** `={{ $('Parse Token').first().json.token }}` |
| Limit | `1` |

---

### 4. `Validate Token` — Code node

Paste the full content of `utils/n8n-check-token-row.js`.

---

### 5. `If Token Valid` — IF node

| Field | Value |
|-------|-------|
| Condition | `{{ $json.tokenValid }}` equals `true` (boolean) |
| True branch | → `Mark Token Used` |
| False branch | → `Reject Token` |

---

### 6. `Mark Token Used` — Supabase node

| Field | Value |
|-------|-------|
| Operation | `update` |
| Table | `intake_tokens` |
| Filter | `token` **eq** `={{ $('Parse Token').first().json.token }}` |

**Fields to set:**

| Field | Value |
|-------|-------|
| `status` | `used` |
| `used_at` | `={{ new Date().toISOString() }}` |
| `source` | `={{ $('Parse Token').first().json.source }}` |
| `etsy_order_id` | `={{ $('Parse Token').first().json.orderNo }}` |

Then connect output → `Load Envs` (existing chain continues normally).

---

### 7. `Reject Token` — Code node

Paste the full content of `utils/n8n-reject-token.js`.

---

### 8. `Respond Token Error` — Respond to Webhook node

| Field | Value |
|-------|-------|
| Respond With | `Text` |
| Response Code | `400` |
| Response Body | `={{ $json.errorBody }}` |
| Content-Type header | `application/json` |

> **Tip:** Add a header `Content-Type: application/json` in the Options section.

---

## Updating `Validate and Transform Order` — Add source + order_no

Inside the existing `Validate and Transform Order` Code node, add these two lines to the `meta` block of the `order` object:

```js
// Add inside the order.meta object:
source:   $('Parse Token').first().json?.source   || null,
order_no: $('Parse Token').first().json?.orderNo  || null,
```

**Example (full meta block after change):**
```js
meta: {
  event_id:      body.eventId || null,
  event_type:    body.eventType || null,
  created_at:    body.createdAt || null,
  response_id:   data.responseId || null,
  submission_id: data.submissionId || null,
  respondent_id: data.respondentId || null,
  form_id:       data.formId || null,
  form_name:     data.formName || null,
  form_created_at: data.createdAt || null,
  user_agent:    input.headers?.['user-agent'] || null,
  ip_country:    input.headers?.['cf-ipcountry'] || null,
  cf_ray:        input.headers?.['cf-ray'] || null,
  received_at:   body.createdAt || new Date().toISOString(),
  // Step 3.5 — intake channel tracking
  source:        $('Parse Token').first().json?.source   || null,
  order_no:      $('Parse Token').first().json?.orderNo  || null,
},
```

---

## Updating `Save Order to Database` — Persist source + order_no

In the existing `Save Order to Database` Supabase node, add two new field mappings:

| fieldId | fieldValue |
|---------|------------|
| `source` | `={{ $json.order.meta.source }}` |
| `order_no` | `={{ $json.order.meta.order_no }}` |

---

## Tally Form Configuration

In the Tally form builder, add **3 hidden fields** (use the "Hidden Fields" block type):

| Field label | Pre-fill from URL param |
|-------------|------------------------|
| `token` | `token` |
| `source` | `source` |
| `orderNo` | `orderNo` |

**Test your Tally form URL:**
```
https://tally.so/r/YOUR_FORM_ID?source=etsy&orderNo=ETSY-123&token=EVRM-XXXXXXXX
```

Open this URL and verify the hidden fields are pre-filled before submitting.

---

## Token URL for Etsy Orders (Workflow Summary)

```sql
-- 1. Pick an unused token from Supabase
SELECT token FROM intake_tokens WHERE status = 'unused' LIMIT 1;

-- 2. Build the link:
-- https://tally.so/r/FORM_ID?source=etsy&orderNo=ETSY_ORDER_ID&token=TOKEN

-- 3. Send it to the customer in a message
```

For internal testing, always use:
```
?source=test&orderNo=TEST-001&token=EVRM-DEV
```
