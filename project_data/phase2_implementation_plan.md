# Phase 2 — PDF Storybook Engine — Implementation Plan

## Overview

Transform an approved AI-generated script into a cinematic illustrated PDF storybook,
ready to sell on Etsy at $9–15 CAD per order.

**Deliverables:** 3 separate PDFs per order:
1. **Storybook** — cover page + 5 illustrated scenes + parent's message
2. **Certificate** — personalized achievement certificate
3. **Coloring page** — black & white line art of the hero character

---

## Validation-First Strategy

> Build by hand once. Sell once. Then automate.

| Step | Goal | Time | Gate |
|------|------|------|------|
| **V0. Generate test images** | Run 5 scene prompts for Charlie order on Replicate playground | 20 min | Does Pixar/Boss Baby style work? Is character consistent? |
| **V1. Evaluate & iterate** | Compare 5 images side by side, refine prompts if needed | 30 min | Character recognizable across all scenes? |
| **V2. Build sample PDF** | Layout images + text in HTML, export to PDF | 2 hrs | Does it look like a product worth $12? |
| **V3. List on Etsy** | Create listing with sample images | 1 hr | Can you get one sale? |
| **V4. Automate** | Build the n8n pipeline | 4–6 hrs | Pipeline produces same quality as manual |

### V0 — Test Prompts (Charlie order)

Go to [replicate.com/black-forest-labs/flux-1.1-pro](https://replicate.com/black-forest-labs/flux-1.1-pro) and paste these one at a time:

**Scene 1:**
```
Pixar-style 3D CGI animated character render, Boss Baby proportions with oversized head and large expressive eyes, high-quality cinematic lighting, soft subsurface scattering, shallow depth of field. A 7-year-old boy with brown hair and light skin, wearing a red hoodie with a dinosaur patch, blue sneakers, and a backwards cap. Wide shot of a cozy backyard at night, soft moonlight and twinkling stars. He sits on a blanket among toy dinosaurs, studying a glowing fossil. Warm moonlight with cool blue ambient and soft golden accents. Wide establishing shot, low angle, cinematic depth of field.
```

**Scene 2:**
```
Pixar-style 3D CGI animated character render, Boss Baby proportions with oversized head and large expressive eyes, high-quality cinematic lighting, soft subsurface scattering, shallow depth of field. A 7-year-old boy with brown hair and light skin, wearing a red hoodie with a dinosaur patch, blue sneakers, and a backwards cap. He straps into the cockpit of a comet-shaped rocket marked with a '7' patch, holding a small T-Rex plush. Dynamic warm lighting with streak lights and silver reflections. Over-shoulder or low heroic angle, cinematic depth of field.
```

**Scene 3:**
```
Pixar-style 3D CGI animated character render, Boss Baby proportions with oversized head and large expressive eyes, high-quality cinematic lighting, soft subsurface scattering, shallow depth of field. A 7-year-old boy with brown hair and light skin, wearing a red hoodie with a dinosaur patch, blue sneakers, and a backwards cap. He carefully steps across luminous bone bridges in a calm asteroid field made of glowing fossil fragments. Dramatic side lighting with teal and amber tones. Medium tracking shot, cinematic depth of field.
```

**Scene 4:**
```
Pixar-style 3D CGI animated character render, Boss Baby proportions with oversized head and large expressive eyes, high-quality cinematic lighting, soft subsurface scattering, shallow depth of field. A 7-year-old boy with brown hair and light skin, wearing a red hoodie with a dinosaur patch, blue sneakers, and a backwards cap. He stands on a comet-ship deck, silhouetted against a glowing T-Rex constellation forming from reassembled fossils. Radiant burst lighting with gold and cosmic colors. Epic wide panoramic angle, cinematic depth of field.
```

**Scene 5:**
```
Pixar-style 3D CGI animated character render, Boss Baby proportions with oversized head and large expressive eyes, high-quality cinematic lighting, soft subsurface scattering, shallow depth of field. A 7-year-old boy with brown hair and light skin, wearing a red hoodie with a dinosaur patch, blue sneakers, and a backwards cap. He steps from the comet-ship into soft golden light at sunrise in a backyard. A small holographic projection hovers nearby. Golden hour sunrise with warm gold and soft pink. Intimate close-up shot, cinematic depth of field.
```

**What to judge:**
- Does the boy look like the same character in all 5?
- Do the Boss Baby proportions work?
- Is the quality high enough for a paid product?
- Save the images — they become your sample PDF content.

**If V0 fails:** Iterate on prompts or switch image tool. No wasted automation work.
**If V2 fails:** Redesign layout. No wasted pipeline work.

---

## Technical Architecture

### Pipeline Flow (post-validation)

```
Cron (5 min) → Fetch approved orders without PDF
    │
    ├── Build Image Prompts (Code node)
    │     → 7 prompts: 1 cover + 5 scenes + 1 coloring
    │
    ├── Generate Images (Loop → Replicate API → Wait → Poll → Download)
    │     → Save each to Supabase Storage
    │     → Insert record in `images` table
    │
    ├── Build HTML (Code node)
    │     → Inject images + script + order data into HTML template
    │
    ├── Convert to PDF (PDFShift API)
    │     → Save PDF to Supabase Storage
    │
    ├── Build Certificate + Coloring (same process)
    │
    ├── Send Delivery Email
    │
    └── Update status → delivered
```

### n8n Workflow: "EverMagic PDF Generator"

| Node | Type | Config |
|------|------|--------|
| Cron Trigger | Schedule | Every 5 minutes |
| Fetch Approved Orders | Supabase | `orders.status = 'approved'` + no PDF yet |
| Fetch Script | Supabase | `scripts.status = 'approved'` for order |
| Build Image Prompts | Code | `n8n-build-image-prompts.js` |
| Loop Images | SplitInBatches | Batch size: 1 |
| Call Replicate | HTTP Request | POST to Replicate API (Flux 1.1 Pro) |
| Wait | Wait | 30 seconds (async image gen) |
| Poll Result | HTTP Request | GET prediction status |
| Download Image | HTTP Request | GET output URL |
| Upload to Storage | Supabase | Upload to `evermagic` bucket |
| Save Image Record | Supabase | INSERT into `images` table |
| Check All Done | IF | All 7 images generated? |
| Build Storybook HTML | Code | `n8n-build-storybook-html.js` |
| Convert to PDF | HTTP Request | POST to PDFShift API |
| Save PDF | Supabase | Upload to storage |
| Build Certificate HTML | Code | Template with child name + achievement |
| Convert Certificate PDF | HTTP Request | PDFShift |
| Build Coloring PDF | HTTP Request | PDFShift (from coloring image) |
| Send Delivery Email | Email | With download links |
| Update Order Status | Supabase | status → `delivered` |

---

## Tool Stack

| Tool | Purpose | Cost | Account Needed |
|------|---------|------|----------------|
| **Flux 1.1 Pro** | Image generation | ~$0.03/image | [replicate.com](https://replicate.com) |
| **PDFShift** | HTML → PDF | Free (250/mo) | [pdfshift.io](https://pdfshift.io) |
| **Supabase Storage** | File storage | Free tier | Already have |

---

## Visual Style

**Art direction:** Pixar-style 3D CGI, Boss Baby proportions

- Oversized head (~40% of body), large expressive eyes
- Cinematic lighting (warm key + cool fill)
- Rich saturated colors
- Shallow depth of field, movie-poster framing

**Style prompt prefix (for every image):**
```
Pixar-style 3D CGI animated character render, Boss Baby proportions with 
oversized head and large expressive eyes, high-quality cinematic lighting, 
soft subsurface scattering, shallow depth of field
```

**Full style guide:** `prompts/space_hero/style.md`

---

## Database Changes

### New table: `images`

```sql
CREATE TABLE images (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id    TEXT NOT NULL,
  image_type  TEXT NOT NULL,      -- cover, scene_1..scene_5, coloring
  prompt      TEXT,
  file_path   TEXT,
  file_url    TEXT,
  model       TEXT DEFAULT 'flux-1.1',
  status      TEXT DEFAULT 'pending',
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

SQL file: `database/images_table.sql`

### New Supabase Storage bucket: `evermagic`

Structure:
```
evermagic/
  images/
    {order_id}/
      cover.png
      scene_1.png ... scene_5.png
      coloring.png
  pdfs/
    {order_id}/
      storybook.pdf
      certificate.pdf
      coloring.pdf
```

---

## Files Created So Far

| File | Purpose | Status |
|------|---------|--------|
| `prompts/space_hero/style.md` | Visual style guide | ✅ Done |
| `database/images_table.sql` | Supabase images table | ✅ Done |
| `utils/n8n-build-image-prompts.js` | Constructs 7 image prompts | ✅ Done |
| `utils/n8n-call-flux.js` | Replicate API handler | ✅ Done |
| `utils/n8n-build-storybook-html.js` | HTML storybook template | 📋 TODO |
| `emails/delivery.html` | Delivery email template | 📋 TODO |

---

## Status Flow

```
approved → images_generating → images_generated → pdf_generating → pdf_generated → delivered
```

---

## Cost Per Order

| Item | Cost |
|------|------|
| Script (OpenAI) | $0.03 |
| Images × 7 (Flux) | $0.21 |
| PDFs × 3 (PDFShift) | Free |
| **Total** | **~$0.25** |

At $12 CAD selling price → **~97% margin**

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Character looks different across scenes | 🔴 High | Test in playground first. Use strong style prefix + consistent character description. Consider Flux reference image feature. |
| PDFShift free tier limit (250/mo) | 🟡 Medium | Enough for early stage. $9/mo for 2500 if needed. |
| Image gen is slow (30s per image) | 🟡 Medium | Run as background job (cron), not real-time. |
| Replicate API downtime | 🟡 Medium | Retry logic in n8n. |
