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

## ⚙️ TECH STACK (CURRENT, Open to add more effective tools if beneficial)

| Layer | Tool |
|-------|------|
| Frontend | Tally (form + file upload) |
| Payments | Stripe (next step integration) |
| Backend Automation | n8n Cloud (core orchestration) |
| Database | Supabase |
| AI | OpenAI (script generation) |
| Voice | ElevenLabs (next phase) |
| Image generation | (later phase) |
| Video rendering | (later phase) |
| Delivery | Email via n8n |

---

## 🏗 CURRENT PIPELINE (WORKING, open to extend with other tools if beneficial)

```
Tally → n8n Webhook → Function (parse & canonicalize) → Supabase (next) → OpenAI (next)
```

**Webhook secured via:**
- Header Auth
- `X-EverMagic-Token`

---

## 📦 ORDER DATA STRUCTURE

We built a clean order object:

```json
{
  "order_id": "EM-YYYYMMDD-XXXX",
  "package": "FULL",
  "language": "EN",
  "theme": "SPACE_HERO",
  "delivery": { "email": "..." },
  "child": {
    "name": "...",
    "age": 7,
    "gender": "...",
    "glasses": false,
    "hair_color": "...",
    "skin_tone": "...",
    "hobby": "...",
    "hobby_detail": "...",
    "signature_look": "...",
    "jersey_number": "...",
    "recent_win": "...",
    "hero_trait": "brave"
  },
  "parent_message": "...",
  "photos": ["..."],
  "consent": { "accepted": true },
  "meta": { "..." }
}
```

**We decided:**
- ✅ Only pass order object forward in workflow
- ✅ Store raw payload in Supabase separately for debugging

---

## 🗺 FULL FACTORY ROADMAP

### PHASE 1 — Intake & Script Automation 

**Goal:** Fully automated script generation pipeline.

**Steps:**
1. Webhook secured
2. Parse & canonicalize
3. Insert into Supabase `orders`
4. Insert raw into `order_payloads`
5. Fetch prompt from GitHub, build grounded prompt
6. Call OpenAI → generate script
7. Save script into `assets` (with versioning)
8. Update order status → `script_generated`
9. Send customer confirmation email
10. Send admin review email (with Approve / Retry / Edit buttons)
11. Admin review loop:
    - **Approve** → status → `approved` (Phase 1 done, Phase 2 cron picks up)
    - **Edit & Retry** → re-run AI with admin feedback → new version → new review email
    - **Manual Edit** → admin edits script via form → save → status → `approved`

> Once this works: You have your first real AI automation pipeline with human-in-the-loop quality control.

---

### PHASE 2 — Voice Automation

- ElevenLabs API call
- Save mp3 to storage
- Insert asset record
- Update status → `audio_generated`

---

### PHASE 3 — Image Generation

- Character generation based on canonical
- 3–5 scene images
- Store to R2/S3
- Insert asset records

---

### PHASE 4 — Video Assembly

**Option A:** FFmpeg pipeline
**Option B:** Remotion-based coded video rendering

**Process:**
1. Combine scenes
2. Add voice
3. Add music
4. Export mp4
5. Upload to storage
6. Insert asset
7. Update status → `video_rendered`

---

### PHASE 5 — PDF Generation

1. HTML template
2. Inject canonical data
3. Generate PDF
4. Store
5. Insert asset

---

### PHASE 6 — Delivery Automation

When all required assets exist:
1. Generate email with links
2. Send final delivery email
3. Update status → `delivered`

---

## 🧠 ARCHITECTURE PRINCIPLES

- Deterministic workflows (n8n)
- Canonical structured JSON
- Clear state machine
- Idempotent steps
- Each step saves its output
- Retry-friendly
- Debuggable

---

## 📊 STATE MACHINE (PLANNED)

```
created → validated → script_generated → script_review → approved → audio_generated → images_generated → video_rendered → pdf_generated → delivered
                                              ↺ retry                                                                                     ↘ needs_review
                                                                                                                                           ↘ failed
```

> Phase 2 cron job picks up all orders with status `approved` and begins audio generation.

---

## 🚀 STRATEGIC GOAL

EverMagic is not a project.

It is:
> An AI content production engine.

**If fully automated:**
- 5 orders per day = 150/month
- At $49 = **$7,350/month**
- With near-zero marginal cost.

---

## 📌 WHEN YOU NEED TO RESTORE CONTEXT

Paste this into new chat:

> "Continuing EverMagic AI Factory. We are in Phase X. Here is our architecture summary."

## OPTIMIZATION IDEAS

- feel free to suggest improvements to the architecture or implementation
- we are open to new tools and techniques if they can improve the pipeline
- we are open to new ideas for features and functionality
- we are open to new ideas for optimization and improvement