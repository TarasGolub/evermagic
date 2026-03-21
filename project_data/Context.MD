# 🚀 EVERMAGIC – PROJECT CONTEXT SNAPSHOT

## 1️⃣ Vision

EverMagic is a scalable AI-first digital product.

We create personalized cinematic story experiences for kids:

- 🎬 2–3 minute personalized video
- 📖 Illustrated PDF story
- 🖨 Printable bonus (certificate + coloring page)
- 📩 Delivered by email within 24h

**Long-term goal:**
Build an automated AI content factory capable of scaling to $5k–$20k/month.

**Personal goal:**
Gain real-world experience with:

- AI APIs
- automation pipelines
- structured data
- AI content orchestration
- vibe-coded app building

---

## 🧠 PRODUCT STRATEGY

**Brand:** EverMagic

**Product Messaging:**
- "We're creating your magic."
- "Your magic is on its way."

**Positioning:**
- Not "a children's story".
- Not "a PDF".

It is:
> A personalized digital magic moment created by a parent.

**Category:** Digital gifting experience.

---

## 🎯 MVP SCOPE (PHASE 1)

| Dimension | Value |
|-----------|-------|
| Theme | Space Hero Mission |
| Language | English only (UA option exists in form but not active yet) |
| Packages | Basic · Full Bundle · Party Pack |
| Focus now | Backend automation — not branding |

---

## ⚙️ TECH STACK

| Layer | Tool | Status |
|-------|------|--------|
| Frontend | Tally (form + file upload) | ✅ Active |
| Payments | Stripe (next step integration) | 📋 Planned |
| Backend Automation | n8n Cloud (core orchestration) | ✅ Active |
| Database | Supabase (orders, scripts, images, envs) | ✅ Active |
| Storage | Supabase Storage (images, PDFs) | ✅ Active |
| AI — Script | OpenAI GPT-4o | ✅ Active |
| AI — Images | OpenAI gpt-image-1 / DALL·E | ✅ Active |
| AI — Scenario Expansion | OpenAI GPT-4o | 📋 Phase 3 |
| PDF Generation | PDFShift API | 📋 Phase 3 |
| Audio | ElevenLabs (audiobook exploration) | 📋 Phase 3 |
| Voice | ElevenLabs | 📋 Phase 4 |
| Video rendering | TBD (Remotion / FFmpeg / Creatomate) | 📋 Phase 4 |
| Delivery | Email via n8n | ✅ Active |
| Config / Env Vars | Supabase `envs` table (key/value) | ✅ Active |

---

## 🏗 CURRENT PIPELINE (Phase 1 + 2 — Complete ✅)

```
Tally → n8n Webhook → Parse & Canonicalize → Save to Supabase → Build Prompt → OpenAI → Parse Script → Save Script → Send Emails → Admin Review (Approve / Retry / Edit) → Generate Images → Save Images to Supabase Storage
```

**Webhook secured via:** Header Auth (`X-EverMagic-Token`)

---

## 🔧 ENV VARS SYSTEM

Global configuration is stored in the Supabase `envs` table (key/value rows).
Loaded at the top of each n8n workflow via one Supabase node + one Code node.

| Key | Values | Purpose |
|-----|--------|---------|
| `mode` | `test` / `live` | Controls webhook routing and safety guards |
| `script_approval_required` | `true` / `false` | If false, scripts are auto-approved and images start immediately |

**Usage in n8n:**
```js
const env = $('Envs').first().json.env;
// env.mode, env.script_approval_required
```

---

## 📦 ORDER DATA STRUCTURE

```json
{
  "order_id": "EM-YYYYMMDD-XXXX",
  "package": "FULL",
  "language": "EN",
  "theme": "SPACE_HERO",
  "delivery": { "email": "..." },
  "child": {
    "name": "...", "age": 7, "gender": "...",
    "glasses": false, "hair_color": "...", "skin_tone": "...",
    "hobby": "...", "hobby_detail": "...",
    "signature_look": "...", "jersey_number": "...",
    "recent_win": "...", "hero_trait": "brave"
  },
  "parent_message": "...",
  "photos": ["..."],
  "consent": { "accepted": true },
  "meta": { "..." }
}
```

**Principles:**
- ✅ Only pass canonical order object forward in workflow
- ✅ Store raw Tally payload separately for debugging

---

## 🛒 CHANNEL STRATEGY

| Channel | Product | Price | Status |
|---------|---------|-------|--------|
| **Etsy / Amazon** | PDF bundle (storybook + certificate + coloring) | $9–15 CAD | 📋 Phase 3 |
| **KidsTukan / Direct** | Premium bundle (video + PDF + printable) | $35–49 CAD | 📋 Phase 4 |

Etsy = market validation, reviews, proof. KidsTukan = premium experience.

---

## 🗺 FULL FACTORY ROADMAP

### PHASE 1 — Intake & Script Automation ✅ COMPLETE

**What works:**
1. Tally webhook → parse & canonicalize → save order to Supabase
2. Fetch prompt from GitHub → OpenAI → generate script
3. Save script to `scripts` table (with versioning: draft / approved / superseded)
4. Send customer confirmation email + admin review email
5. Admin review: Approve / Edit & Retry (AI regeneration) / Manual Edit
6. Guard: prevents double-approval of already-approved scripts

**Database tables:** `orders`, `order_payloads`, `scripts`

---

### PHASE 2 — Image Generation ✅ COMPLETE

**What works:**
1. Approved script → trigger image generation workflow
2. Generate images per scene using OpenAI image API (gpt-image-1 / DALL·E)
3. Upload generated images to Supabase Storage
4. Save image paths + metadata to `images` table
5. Update order status: `approved` → `images_generating` → `images_generated`
6. `script_approval_required` env flag: if `false`, images start automatically without admin action
7. Env vars system via Supabase `envs` table (replaces global variables unavailable on basic n8n plan)

**Database tables (added):** `images`, `envs`

---

### PHASE 3 — PDF Storybook Engine (CURRENT 🔄 — Steps 3.1–3.5 ✅, Step 3.4 next)

**Goal:** Generate illustrated PDF storybook as first sellable product for Etsy.

**Deliverables (3 separate PDFs):**
1. **Storybook PDF** — cover + 5 illustrated scenes + detailed narrative
2. **Coloring Book PDF** — black & white line art pages assembled together
3. **Certificate PDF** — personalized printable achievement certificate

**Pipeline steps:**

#### Step 3.1 — Scenario Expansion ✅ Foundation built (EVRM-011/012)
- GPT-4o expansion prompt: `prompts/space_hero/expansion.md`
- n8n Code nodes: `utils/n8n-build-expansion-prompt.js`, `utils/n8n-parse-expansion-response.js`
- n8n workflow exported: `n8n_backup/3.1 EverMagic Scenario Expansion.json`
- DB migration: `database/scenario_expansion.sql` (adds `expanded_content` column to `scripts`)
- Blueprint: `project_data/phase3_expansion_workflow_blueprint.md`
- **Next:** Run end-to-end test, validate output quality

#### Step 3.2 — PDF Layout Design
- Design HTML/CSS templates for:
  - Storybook pages (cover + scene pages)
  - Coloring book pages (B&W image placeholders)
  - Certificate layout
- Validate layouts manually with sample content before automating

#### Step 3.3 — PDF Assembly
- Inject expanded scenario text + generated images into HTML templates
- Convert HTML → PDF using **PDFShift API**
- Store PDFs in Supabase Storage
- Update order status: `images_generated` → `pdf_generating` → `pdf_generated`

#### Step 3.4 — Audiobook Exploration (Research)
- Evaluate feasibility of generating an audiobook from the expanded scenario
- Candidate tool: **ElevenLabs** text-to-speech
- Questions to answer:
  - Quality of narration for children's content?
  - Cost per order?
  - Format: single MP3 or per-scene chapters?
  - Legal/licensing considerations for distribution?
- Decision: include in Phase 3 or defer to Phase 4?

**Tools:**
- **OpenAI GPT-4o** — scenario expansion
- **PDFShift API** — HTML → PDF conversion
- **Supabase Storage** — PDF file storage
- **ElevenLabs** (research) — audiobook

**Status chain:** `images_generated` → `scenario_expanding` → `scenario_expanded` → `pdf_generating` → `pdf_generated` → `pdf_delivered`

**Strategy:** Validate before automating.
1. Write and review one expanded scenario manually
2. Build 1–2 sample PDFs by hand
3. List on Etsy → get first sale
4. Then automate the pipeline

#### Step 3.4 — Delivery Flow 🔄 NEXT

**Decision:** Branded per-order download page hosted in Supabase Storage.

**Flow:**
```
PDFs assembled in Supabase Storage
    ↓
n8n generates branded HTML landing page (personalized with child name + story title)
    ↓
Upload to Supabase Storage: pages/{order_id}/index.html  (public bucket, $0 hosting)
    ↓
Send customer email with one link to that page
    ↓
Send admin notification: order delivered
```

**Landing page contains:** child’s name + story title + 3 download buttons (storybook, coloring book, certificate) + thank-you message + EverMagic branding.

**Out of scope for now:** page expiry (delete manually if needed).

#### Step 3.5 — Intake Token System ✅ BUILT

Prevents duplicate/unauthorized form submissions. Single-use token required for every Tally form submission.

**How it works:**
- Pool of ~100 pre-generated tokens in Supabase `intake_tokens` table (top up manually via SQL seed)
- Cheat token `EVRM-DEV` — unlimited use, for internal testing only (no DB row needed)
- When Etsy order comes in → pick a token → send customer:
  `https://tally.so/r/FORM_ID?source=etsy&orderNo=ORDER_NO&token=TOKEN`
- Tally hidden fields (`token`, `source`, `orderNo`) pre-fill from URL params
- n8n validates token on submission: unused → mark used + process; used/missing/invalid → HTTP 400 reject
- `source` and `order_no` stored on both `intake_tokens` and `orders` tables for channel analytics

**DB:** `intake_tokens` table + `source` / `order_no` columns added to `orders`

**Files:**
- `database/intake_tokens.sql` — table + seed SQL + orders migration
- `utils/n8n-validate-token.js` — "Parse Token" code node
- `utils/n8n-check-token-row.js` — "Validate Token" code node
- `utils/n8n-reject-token.js` — "Reject Token" error builder
- `project_data/step3.5_token_system_blueprint.md` — full n8n build guide

---

### PHASE 4 — Video Bundle (Premium Product)

**Goal:** Add voice narration + video for KidsTukan premium bundle.

**Steps:**
1. ElevenLabs API → generate voice narration (5 scenes)
2. Assemble video: images + voice + transitions + background music
3. Export MP4
4. Combined delivery: video + PDF + printable

**Tools (planned):**
- **ElevenLabs** — voice generation
- **Remotion / FFmpeg / Creatomate** — video assembly (TBD)

**Status chain:** `approved` → `audio_generating` → `video_assembling` → `video_rendered` → `delivered`

---

### PHASE 5 — Stripe Integration & Storefront

- Stripe checkout flow
- Direct orders without manual Etsy process
- Automated payment → pipeline trigger

---

### PHASE 6 — Scale & Optimize

- Additional themes beyond Space Hero
- Multi-language support (Ukrainian)
- Batch processing
- Quality monitoring dashboard
- Customer reviews integration

---

## 🧠 ARCHITECTURE PRINCIPLES

- Deterministic workflows (n8n)
- Canonical structured JSON
- Clear state machine
- Idempotent steps
- Each step saves its output
- Retry-friendly and debuggable
- Validate before automating

---

## 📊 STATE MACHINE

```
Phase 1: created → validated → script_generated → script_review → approved
                                                      ↺ retry

Phase 2: approved → images_generating → images_generated

Phase 3: images_generated → scenario_expanding → scenario_expanded → pdf_generating → pdf_generated → delivered

Phase 4: approved → audio_generating → audio_generated → video_assembling → video_rendered → delivered
```

---

## 💰 COST STRUCTURE (per order)

| Step | Tool | Cost |
|------|------|------|
| Script | OpenAI GPT-4o | ~$0.03 |
| Images (7) | OpenAI image API | ~$0.28 |
| Scenario expansion | OpenAI GPT-4o | ~$0.04 |
| PDF conversion (3 PDFs) | PDFShift | Free (250/mo) |
| Audiobook (TBD) | ElevenLabs | ~$0.10–0.20 |
| Voice (Phase 4) | ElevenLabs | ~$0.15 |
| Video (Phase 4) | TBD | ~$0.00–0.50 |
| **PDF bundle total** | | **~$0.35/order** |
| **Full bundle total** | | **~$1.00/order** |

---

## 🚀 STRATEGIC GOAL

EverMagic is an **AI content production engine.**

| Target | PDF Bundle (Etsy) | Full Bundle (Premium) |
|--------|-------------------|----------------------|
| Price | $9–15 CAD | $35–49 CAD |
| Cost | ~$0.35 | ~$1.00 |
| Margin | ~97% | ~97% |
| Volume | 5/day = 150/mo | 2/day = 60/mo |
| Revenue | **$1,500–2,250/mo** | **$2,100–2,940/mo** |

---

## 📌 WHEN YOU NEED TO RESTORE CONTEXT

> "Continuing EverMagic AI Factory. We are in Phase 3 (PDF Storybook). Here is our architecture summary."

## OPTIMIZATION IDEAS

- Open to new tools if they improve the pipeline
- Open to new ideas for features, optimization, and efficiency
- Always validate before automating