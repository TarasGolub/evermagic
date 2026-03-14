# EverMagic PDF Assembly — n8n Workflow Blueprint

**Workflow name:** EverMagic PDF Assembly
**Trigger:** Webhook POST `/orders/pdf/generate`
**Triggered by:** Scenario Expansion workflow (last node)
**Status transition:** `scenario_expanded` → `pdf_generating` → `pdf_generated`

---

## Pre-flight Checklist

- [ ] Sign up at pdfshift.io — free tier: 50 conversions/month, paid from $9/mo
- [ ] Run `database/pdfs_table.sql` in Supabase SQL Editor
- [ ] Add `pdfshift_api_key` to Supabase `envs` table
- [ ] Add `qr_code_url` to Supabase `envs` table (can be empty string for now)
- [ ] Add PDF templates to GitHub repo at `templates/pdf/` (already done)
- [ ] Replace hardcoded sample data in templates with `{{variable}}` tokens (see Template Variables below)
- [ ] Create `pdfs` bucket in Supabase Storage (set to public)
- [ ] Add webhook trigger URL to Scenario Expansion workflow's final HTTP Request node

---

## Node Chain (25 nodes)

```
Webhook
  → Load Envs
  → Envs
  → Fetch Order Payload
  → Fetch Script
  → Fetch Images
  → Validate Status (check order is scenario_expanded)
  → Update Order Status: pdf_generating
  → Fetch Storybook Template   ─┐
  → Fetch Coloring Book Template ├─ (3 parallel HTTP GET from GitHub)
  → Fetch Certificate Template  ─┘
  → Build PDF HTML              (outputs 3 items — one per PDF type)
  → Loop Over Items (batch 1)
      → Call PDFShift API
      → If Success:
          → Upload PDF to Supabase Storage
          → Save PDF Record (upsert into pdfs table)
      → If Failed:
          → Save PDF Error (update pdfs table)
  → Update Order Status: pdf_generated
  → Respond 200 OK
```

---

## Node Configurations

### 1. Webhook
- Type: `n8n-nodes-base.webhook`
- Method: `POST`
- Path: `orders/pdf/generate`
- Auth: Header Auth (`X-EverMagic-Token`)
- Response mode: `When last node finishes`

---

### 2. Load Envs
- Type: `n8n-nodes-base.supabase`
- Operation: `getAll`
- Table: `envs`

---

### 3. Envs
- Type: `n8n-nodes-base.code`
- Paste the same Envs parsing code used in all other workflows.
- Ensure `env.pdfshift_api_key` and `env.qr_code_url` are accessible.

---

### 4. Fetch Order Payload
- Type: `n8n-nodes-base.supabase`
- Operation: `get`
- Table: `order_payloads`
- Match on: `order_id` = `{{ $json.body.order_id }}`

---

### 5. Fetch Script
- Type: `n8n-nodes-base.supabase`
- Operation: `getAll`
- Table: `scripts`
- Filter: `order_id` = `{{ $json.order_id }}` AND `status` = `approved`

---

### 6. Fetch Images
- Type: `n8n-nodes-base.supabase`
- Operation: `getAll`
- Table: `images`
- Filter: `order_id` = `{{ $json.order_id }}` AND `status` = `completed`

---

### 7. Validate Status
- Type: `n8n-nodes-base.code`

```js
const order_id = $('Fetch Order Payload').first().json.order_id;
// Add Supabase order status check here if needed, or trust the webhook caller
return [{ json: { order_id } }];
```

---

### 8. Update Order Status: pdf_generating
- Type: `n8n-nodes-base.supabase`
- Operation: `update`
- Table: `orders`
- Update field: `status` = `pdf_generating`
- Match on: `order_id` = `{{ $json.order_id }}`

---

### 9–11. Fetch Templates (run in parallel — 3 separate HTTP Request nodes)

| Node Name | GitHub Raw URL |
|---|---|
| Fetch Storybook Template | `https://raw.githubusercontent.com/TarasGolub/evermagic/main/templates/pdf/storybook.html` |
| Fetch Coloring Book Template | `https://raw.githubusercontent.com/TarasGolub/evermagic/main/templates/pdf/coloring-book.html` |
| Fetch Certificate Template | `https://raw.githubusercontent.com/TarasGolub/evermagic/main/templates/pdf/certificate.html` |

- Method: `GET`
- Response format: `Text`

> Note: All three template fetches can run in parallel before the Build PDF HTML node.

---

### 12. Build PDF HTML
- Type: `n8n-nodes-base.code`
- Paste: `utils/n8n-build-pdf-html.js`
- Outputs **3 items** (one per PDF type): storybook, coloring_book, certificate

**Node name references inside the code (must match exactly):**
- `$('Fetch Order Payload')`
- `$('Fetch Script')`
- `$('Fetch Images')`
- `$('Envs')`
- `$('Fetch Storybook Template')`
- `$('Fetch Coloring Book Template')`
- `$('Fetch Certificate Template')`

---

### 13. Loop Over Items
- Type: `n8n-nodes-base.splitInBatches`
- Batch size: `1`

---

### 14. Call PDFShift API
- Type: `n8n-nodes-base.httpRequest`
- Method: `POST`
- URL: `https://api.pdfshift.io/v3/convert/pdf`
- Auth: **Basic Auth**
  - Username: `api`
  - Password: `{{ $('Envs').first().json.env.pdfshift_api_key }}`
- Body (JSON):

```json
{
  "source": "{{ $json.html }}",
  "landscape": "{{ $json.pdfshift_options.landscape }}",
  "format": "{{ $json.pdfshift_options.format }}"
}
```

For storybook (custom 7×7 size), use `width` + `height` instead of `format`:
```json
{
  "source": "{{ $json.html }}",
  "width": "7in",
  "height": "7in"
}
```

> Tip: Use an IF node before the PDFShift call to branch between `format`-based and `width/height`-based calls, switching on `$json.pdf_type === 'storybook'`.

- Response format: `File` (binary PDF)

---

### 15. Upload PDF to Supabase Storage
- Type: `n8n-nodes-base.httpRequest`
- Method: `POST`
- URL: `https://{YOUR_PROJECT}.supabase.co/storage/v1/object/pdfs/{{ $json.file_path }}`
- Headers:
  - `Authorization`: `Bearer {{ $('Envs').first().json.env.supabase_service_key }}`
  - `Content-Type`: `application/pdf`
- Body: Binary data from PDFShift response

---

### 16. Save PDF Record
- Type: `n8n-nodes-base.supabase`
- Operation: `upsert`
- Table: `pdfs`
- Fields:
  - `order_id`: `{{ $json.order_id }}`
  - `pdf_type`: `{{ $json.pdf_type }}`
  - `file_path`: `{{ $json.file_path }}`
  - `file_url`: `https://{YOUR_PROJECT}.supabase.co/storage/v1/object/public/pdfs/{{ $json.file_path }}`
  - `status`: `completed`

---

### 17. Update Order Status: pdf_generated
- Type: `n8n-nodes-base.supabase`
- Operation: `update`
- Table: `orders`
- Update field: `status` = `pdf_generated`
- Match on: `order_id` = `{{ $json.order_id }}`

> Only runs after all 3 loop iterations complete.

---

## Triggering This Workflow from Scenario Expansion

Add a final node to the Scenario Expansion workflow:

```
HTTP Request
  Method: POST
  URL: https://evermagic.app.n8n.cloud/webhook/orders/pdf/generate
  Header: X-EverMagic-Token: {token}
  Body: { "order_id": "{{ $json.order_id }}" }
```

---

## PDFShift Setup

1. Sign up at **pdfshift.io**
2. Copy API key from dashboard
3. In Supabase SQL editor:
   ```sql
   INSERT INTO envs (key, value) VALUES ('pdfshift_api_key', 'your_key_here');
   ```
4. Free tier: **50 conversions/month** (≈16 orders/month at 3 PDFs/order)
5. Paid: from $9/mo for 250 conversions (~83 orders/month)

---

## Template Variables Reference

Before wiring templates to n8n, replace all hardcoded sample content with these tokens:

| Token | Source |
|---|---|
| `{{child.name}}` | `order.child.name` |
| `{{child.age}}` | `order.child.age` |
| `{{child.hero_trait}}` | `order.child.hero_trait` |
| `{{child.hobby}}` | `order.child.hobby` |
| `{{story.title}}` | `script.content.title` |
| `{{story.tagline}}` | `script.content.tagline` |
| `{{closing_message}}` | `script.content.closing_message` |
| `{{cover.image_url}}` | `images['cover'].file_url` |
| `{{scene_1.title}}` — `{{scene_5.title}}` | `script.content.scenes[n].scene_title` |
| `{{scene_1.narration}}` — `{{scene_5.narration}}` | `expanded_content.scenes[n].expanded_narrative` (falls back to narration) |
| `{{scene_1.image_url}}` — `{{scene_5.image_url}}` | `images['scene_n'].file_url` |
| `{{coloring.image_url}}` | `images['coloring'].file_url` |
| `{{coloring_1.image_url}}` — `{{coloring_5.image_url}}` | `images['coloring_n'].file_url` |
| `{{cert.hero_trait_title}}` | `hero_trait` capitalised |
| `{{cert.citation}}` | Auto-generated from hobby + hero_trait |
| `{{cert.date}}` | Date of PDF generation |
| `{{qr_code_url}}` | `env.qr_code_url` (empty until landing ready) |

---

## Adding a New PDF Type Later

1. Add the new HTML template to `templates/pdf/`
2. Add a new entry to the `PDF_TYPES` array in `n8n-build-pdf-html.js`
3. Add a "Fetch [New] Template" HTTP Request node in n8n pointing to the new GitHub URL
4. The loop handles it automatically — no other changes needed

---

## Known Considerations

- PDFShift requires externally accessible URLs for images — Supabase Storage public URLs work fine
- `file://` paths in the prototype templates **must** be replaced with Supabase URLs before production
- Google Fonts load via CDN — PDFShift (Chromium-based) fetches them at render time; requires internet access
- Free tier (50/mo) is enough for manual validation. Upgrade before Etsy launch.
