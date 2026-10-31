# EverMagic — Roadmap

EverMagic is an AI content production engine for personalized children's storybooks. Phases 1–3 are complete and live. This roadmap covers what's next.

---

## ✅ Done

- **Phase 1** — Intake, AI script generation, admin review loop, script versioning
- **Phase 2** — AI image generation (12 images/order), Supabase Storage upload
- **Phase 3** — Scenario expansion (GPT-4o + QA loop), PDF assembly (storybook + coloring book + certificate), delivery email
- **Etsy channel** — Shop open, 5 theme listings, Etsy→pipeline intake automation built
- **UAT** — Round 1 complete with real users; feedback collected

---

## 🔜 Phase 4 — Landing Page + Direct Checkout

**Goal:** Own the customer relationship directly instead of relying on Etsy.

- [ ] Landing page (product explainer, sample output, pricing)
- [ ] Stripe checkout integration
- [ ] Stripe webhook → generate intake token → send pre-filled form link to buyer
- [ ] Remove manual Etsy step from the purchase flow

---

## 📋 Phase 5 — Video Extension

**Goal:** Add a narrated animated video as an upgrade tier on top of the existing PDF bundle — not a replacement.

The PDF storybook remains the core product. Video is an additional deliverable for customers who want the full cinematic experience.

- [ ] ElevenLabs API integration — voice narration per scene (5 clips)
- [ ] Video assembly — scene images + voice + transitions + background music (Remotion or Creatomate, TBD)
- [ ] MP4 export + Supabase Storage upload
- [ ] Extended delivery email — video download added alongside PDFs
- [ ] New package tier: PDF Bundle (existing) vs PDF + Video Bundle (premium)
- [ ] State machine extension: `approved` → `audio_generating` → `audio_generated` → `video_assembling` → `video_rendered` → `delivered`

---

## 📋 Phase 6 — Print-on-Demand Physical Book

**Goal:** Sell EverMagic as a real printed book delivered to the customer's door.

- [ ] Claid API integration — upscale generated images from ~120 DPI to 300 DPI for print
- [ ] PDF template refactor — resize from 7×7" to 8.5×8.5" with 0.125" bleeds (Gelato spec)
- [ ] Gelato API workflow — after `pdf_generated` → POST print-ready PDF → store Gelato order ID → notify customer with tracking
- [ ] Sample copy ordered and reviewed before listing
- [ ] Etsy "Printed Storybook" listing at $35–45 CAD

---

## 📋 Phase 7 — Scale & Quality

- [ ] Multi-language support (Ukrainian)
- [ ] Quality monitoring dashboard (QA scores already collected per order)
- [ ] Additional story themes
- [ ] Batch processing for bulk orders
- [ ] Customer review integration
- [ ] Amazon KDP listing (after Gelato pipeline is mature)
