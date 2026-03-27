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

## 🎯 CURRENT SCOPE (v1.5.0)

| Dimension | Value |
|-----------|-------|
| Themes | Space Hero · Fantasy Hero · Enchanted Princess · Animal Guardian · Home Helper |
| Language | English only (Ukrainian planned) |
| Packages | Basic · Full Bundle · Party Pack |
| Status | Phases 1–3 complete — UAT invites sent to first group of friends — next: Etsy launch preparation |

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
| AI — Scenario Expansion | OpenAI GPT-4o | ✅ Active |
| PDF Generation | PDFShift API | ✅ Active |
| Audio | ElevenLabs (audiobook exploration) | 📋 Phase 4 |
| Voice | ElevenLabs | 📋 Phase 4 |
| Video rendering | TBD (Remotion / FFmpeg / Creatomate) | 📋 Phase 4 |
| Delivery | Email via n8n | ✅ Active |
| Config / Env Vars | Supabase `envs` table (key/value) | ✅ Active |

---

## 🏗 CURRENT PIPELINE (Phases 1–3 Complete ✅)

```
Tally → n8n Webhook → Parse & Canonicalize → Save to Supabase → Build Prompt → OpenAI → Parse Script → Save Script → Send Emails → Admin Review (Approve / Retry / Edit) → Generate Images → Scenario Expansion → PDF Assembly → Delivery Email
```

**Webhook secured via:** Header Auth (`X-EverMagic-Token`)

### n8n Workflows

| # | Name | Purpose |
|---|------|---------|
| 0 | EverMagic Error Notifier | Global error handler — admin email on any workflow failure |
| 1 | EverMagic v1.0.1 | Intake + Script Generation: Tally webhook → parse → save → GPT script → emails |
| 1.1 | EverMagic Review Submit | Processes admin actions: Approve / Retry / Edit |
| 1.2 | EverMagic Review | Admin review UI served as webhook HTML page |
| 2 | EverMagic Image Generation | Builds 12 image prompts, calls gpt-image-1, uploads to Supabase Storage |
| 3.1 | EverMagic Scenario Expansion | GPT-4o expands each scene into full child-facing narrative |
| 3.2 | EverMagic PDF Assembly | Injects content + images → PDFShift → delivery email; detects UAT orders → sends feedback request |
| 99_1 | EverMagic UAT Invite | Fetches ready participants → sends personalised invite email with unique token |
| 99_2 | EverMagic UAT Feedback | Serves feedback form (GET) + handles submission (POST) → saves to DB → AI synthesis → admin email |

---

## 🔧 ENV VARS SYSTEM

Global configuration is stored in the Supabase `envs` table (key/value rows).
Loaded at the top of each n8n workflow via one Supabase node + one Code node.

| Key | Values | Purpose |
|-----|--------|---------|
| `mode` | `test` / `live` | Controls webhook routing and safety guards |
| `script_approval_required` | `true` / `false` | If false, scripts are auto-approved and images start immediately |
| `qr_code_url` | URL string | QR code image URL (currently hidden in templates — placeholder ready) |
| `logo_pdf_url` | URL string | EverMagic logo image URL for PDF templates (hosted on Supabase Storage) |

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
| **Etsy / Amazon** | PDF bundle (storybook + certificate + coloring) | $9–15 CAD | 🔜 Next — preparing listing |
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

### PHASE 3 — PDF Storybook Engine ✅ COMPLETE (Steps 3.1–3.8 done)

**Goal:** Generate illustrated PDF storybook as first sellable product for Etsy.

**Deliverables (3 separate PDFs):**
1. **Storybook PDF** — cover + 5 illustrated scenes + detailed narrative
2. **Coloring Book PDF** — black & white line art pages assembled together
3. **Certificate PDF** — personalized printable achievement certificate

**Pipeline steps:**

#### Step 3.1 — Scenario Expansion ✅ COMPLETE
- GPT-4o expansion prompt: `prompts/space_hero/expansion.md`
- n8n Code nodes: `utils/n8n-build-expansion-prompt.js`, `utils/n8n-parse-expansion-response.js`
- n8n workflow exported: `n8n_backup/3.1 EverMagic Scenario Expansion.json`
- DB migration: `database/scenario_expansion.sql` (adds `expanded_content` column to `scripts`)

#### Step 3.2 — PDF Layout Design ✅ COMPLETE
- HTML/CSS templates for storybook pages, coloring book pages, and certificate

#### Step 3.3 — PDF Assembly ✅ COMPLETE
- Expanded scenario text + generated images injected into HTML templates
- HTML → PDF via **PDFShift API**
- PDFs stored in Supabase Storage

#### Step 3.4 — Delivery Flow ✅ COMPLETE
- Direct download links embedded in delivery email (Supabase Storage plain-text limitation)
- Status chain: `images_generated` → `scenario_expanding` → `scenario_expanded` → `pdf_generating` → `pdf_generated` → `pdf_delivered`

#### Step 3.5 — Intake Token System ✅ COMPLETE
- Single-use tokens prevent duplicate/unauthorized form submissions
- Pool of ~100 tokens in Supabase `intake_tokens` table
- Cheat token `EVRM-DEV` for internal testing (unlimited, no DB row)
- URL format: `tally.so/r/FORM_ID?source=etsy&orderNo=ORDER_NO&token=TOKEN`
- n8n validates on webhook receipt; invalid/used → HTTP 400 reject

#### Step 3.6 — New Story Themes ✅ COMPLETE (v1.4.0)
- Added 4 new themes alongside Space Hero Mission:
  - **Fantasy Hero Quest** — enchanted kingdom, dragon companion, magic forest
  - **Enchanted Princess Adventure** — rainbow kingdom, unicorn companion, sparkle world
  - **Animal Guardian Hero** — magical forest, animal rescue, kindness-driven story
  - **Home Helper Hero** — cozy home, tiny magical village, everyday helpfulness
- Each theme: `system.md`, `expansion.md`, `style.md`, `image_prompts.md`, `theme.json`
- `n8n-tally-parser.js` `normalizeTheme()` updated for all 5 themes
- `THEMES` object in Image Generation + `themeLabels` in email workflows updated

#### Step 3.7 — Per-Theme PDF Styling ✅ COMPLETE (v1.4.1)
- `templates/pdf/storybook.html` refactored to use CSS variables (`--bg`, `--accent`, `--text-narration`, etc.)
- Space Hero defaults baked into base template (backward compatible)
- `{{theme_styles}}` injection slot at end of `<style>` block
- `prompts/{theme}/theme_styles.css` created for all 5 themes — each overrides CSS variables + `.scene-text-page` background pattern
- `Build PDF HTML` n8n code node updated with `THEME_STYLES` object (same pattern as `THEMES` in Image Gen)

#### Step 3.8 — Live Mode Testing ✅ COMPLETE
- All 3 PDFs (storybook, coloring book, certificate) verified in live mode
- Email delivery confirmed end-to-end
- Gmail dark mode fix applied to all customer-facing emails
- `logo_pdf_url` and `qr_code_url` added to `envs` table pattern (logo served from Supabase Storage)
- Build Delivery Code node: "Run Once for All Items" required to avoid 60s timeout (3 PDF items × execution)

---

### UAT ROUND — Friend Feedback Loop 🔄 IN PROGRESS

**Goal:** Validate product quality and UX with ~10 trusted friends before Etsy launch.

**What's built:**
- `99_1 EverMagic UAT Invite` — sends personalised invite email with unique token per friend
- `99_2 EverMagic UAT Feedback` — serves feedback form, handles submission, stores responses, runs GPT-4o synthesis, emails admin running summary after each submission
- `3.2 EverMagic PDF Assembly` extended: detects `source=UAT` → sends feedback request email 10 min after delivery

**DB tables added:** `uat_participants`, `uat_feedback`; UAT tokens seeded in `intake_tokens` with `source='UAT'`

**Current status:** First group of invites sent. Awaiting responses.

**Next after UAT:** Address feedback → Etsy listing.

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

- ~~Additional themes beyond Space Hero~~ ✅ Done in v1.4.0 (4 new themes)
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

> "Continuing EverMagic AI Factory. Phases 1–3 complete and tested in live mode. UAT round in progress — first group of friends invited, feedback being collected. 5 themes active (Space Hero, Fantasy Hero, Enchanted Princess, Animal Guardian, Home Helper). Next step: address UAT feedback → Etsy launch preparation."

## OPTIMIZATION IDEAS

- Open to new tools if they improve the pipeline
- Open to new ideas for features, optimization, and efficiency
- Always validate before automating