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
| Database | Supabase (orders, scripts, images) | ✅ Active |
| Storage | Supabase Storage (images, PDFs) | 📋 Phase 2 |
| AI — Script | OpenAI GPT-4o | ✅ Active |
| AI — Images | Flux 1.1 Pro via Replicate | 📋 Phase 2 |
| PDF Generation | PDFShift API | 📋 Phase 2 |
| Voice | ElevenLabs | 📋 Phase 3 |
| Video rendering | TBD (Remotion / FFmpeg / Creatomate) | 📋 Phase 3 |
| Delivery | Email via n8n | ✅ Active |

---

## 🏗 CURRENT PIPELINE (Phase 1 — Complete ✅)

```
Tally → n8n Webhook → Parse & Canonicalize → Save to Supabase → Build Prompt → OpenAI → Parse Script → Save Script → Send Emails → Admin Review (Approve / Retry / Edit)
```

**Webhook secured via:** Header Auth (`X-EverMagic-Token`)

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
| **Etsy / Amazon** | PDF bundle (storybook + certificate + coloring) | $9–15 CAD | 📋 Phase 2 |
| **KidsTukan / Direct** | Premium bundle (video + PDF + printable) | $35–49 CAD | 📋 Phase 3 |

Etsy = market validation, reviews, proof. KidsTukan = premium experience.

---

## 🗺 FULL FACTORY ROADMAP

### PHASE 1 — Intake & Script Automation ✅ COMPLETE

**Tag:** `v1.1.0` · **Branch:** `feature/EVRM-003`

**What works:**
1. Tally webhook → parse & canonicalize → save order to Supabase
2. Fetch prompt from GitHub → OpenAI → generate script
3. Save script to `scripts` table (with versioning: draft / approved / superseded)
4. Send customer confirmation email + admin review email
5. Admin review: Approve / Edit & Retry (AI regeneration) / Manual Edit
6. Guard: prevents double-approval of already-approved scripts

**Database tables:** `orders`, `order_payloads`, `scripts`

---

### PHASE 2 — PDF Storybook Engine (CURRENT)

**Goal:** Generate illustrated PDF storybook as first sellable product for Etsy.

**Strategy:** Validate before automating.
1. Test image quality manually (Replicate playground)
2. Build 1–2 sample PDFs by hand
3. List on Etsy → get first sale
4. Then automate the pipeline

**Pipeline (once validated):**
```
Approved Script → Generate Images (Flux/Replicate) → Build HTML → Convert PDF (PDFShift) → Store (Supabase Storage) → Deliver
```

**Deliverables (3 separate PDFs):**
1. **Storybook** — cover + 5 illustrated scenes + parent message
2. **Certificate** — personalized achievement certificate
3. **Coloring page** — black & white line art version of hero

**Tools:**
- **Flux 1.1 Pro** (via Replicate API) — image generation
- **PDFShift** (API) — HTML → PDF conversion
- **Supabase Storage** — file storage
- **Visual style:** Pixar/3D CGI, Boss Baby proportions (big head, big eyes)

**Status:** `approved` → `images_generating` → `images_generated` → `pdf_generating` → `pdf_generated` → `delivered`

**Database tables (new):** `images`

**Key risk:** Character consistency across 5 scenes. Must validate before building pipeline.

---

### PHASE 3 — Video Bundle (Premium Product)

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

### PHASE 4 — Stripe Integration & Storefront

- Stripe checkout flow
- Direct orders without manual Etsy process
- Automated payment → pipeline trigger

---

### PHASE 5 — Scale & Optimize

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

Phase 2: approved → images_generating → images_generated → pdf_generating → pdf_generated → delivered

Phase 3: approved → audio_generating → audio_generated → video_assembling → video_rendered → delivered
```

---

## 💰 COST STRUCTURE (per order)

| Step | Tool | Cost |
|------|------|------|
| Script | OpenAI GPT-4o | ~$0.03 |
| Images (7) | Flux/Replicate | ~$0.21 |
| PDF conversion | PDFShift | Free (250/mo) |
| Voice (Phase 3) | ElevenLabs | ~$0.15 |
| Video (Phase 3) | TBD | ~$0.00–0.50 |
| **PDF bundle total** | | **~$0.25/order** |
| **Full bundle total** | | **~$0.90/order** |

---

## 🚀 STRATEGIC GOAL

EverMagic is an **AI content production engine.**

| Target | PDF Bundle (Etsy) | Full Bundle (Premium) |
|--------|-------------------|----------------------|
| Price | $9–15 CAD | $35–49 CAD |
| Cost | ~$0.25 | ~$0.90 |
| Margin | ~97% | ~97% |
| Volume | 5/day = 150/mo | 2/day = 60/mo |
| Revenue | **$1,500–2,250/mo** | **$2,100–2,940/mo** |

---

## 📌 WHEN YOU NEED TO RESTORE CONTEXT

> "Continuing EverMagic AI Factory. We are in Phase 2 (PDF Storybook). Here is our architecture summary."

## OPTIMIZATION IDEAS

- Open to new tools if they improve the pipeline
- Open to new ideas for features, optimization, and efficiency
- Always validate before automating