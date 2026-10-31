# ✨ EverMagic

**AI-powered personalized story experiences for kids.**

EverMagic is an automated content production engine that creates personalized cinematic stories for children — illustrated storybooks, coloring pages, hero certificates, and (coming soon) narrated videos. A parent fills a short form; the pipeline does the rest and delivers everything by email.

---

## 🚀 Current Status

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1** | Order intake + AI script generation + admin review | ✅ Complete |
| **Phase 2** | AI image generation (12 images/order) + cloud storage | ✅ Complete |
| **Phase 3** | PDF storybook engine — illustrated story, coloring book, certificate | ✅ Complete |
| **Phase 4** | Landing page + direct checkout (Stripe) | 🔜 Next |
| **Phase 5** | Video extension — voice narration + animated video added to PDF bundle | 📋 Planned |
| **Phase 6** | Scale — multi-language, monitoring, print-on-demand (Gelato) | 📋 Planned |

**Live:** Etsy shop open with 5 theme listings. Etsy→pipeline integration built and awaiting Etsy app approval. UAT completed with real users.

---

## 🏗 How It Works

```
Parent fills intake form → n8n webhook processes order → AI generates 5-scene story script
    → Admin reviews/approves → AI generates 12 images
    → Scenario expansion (GPT-4o) → 3 PDFs assembled → Delivered by email
```

### Pipeline at a Glance

| Step | Tool | What Happens |
|------|------|-------------|
| **Intake** | Tally → n8n Webhook | Parse form, validate token, save to Supabase |
| **Script** | OpenAI GPT-4o | Generate 5-scene personalized story |
| **Review** | n8n Web UI (via email) | Admin approves, retries, or edits inline |
| **Images** | OpenAI gpt-image-1 | 1 cover + 5 scene images + 5 coloring pages + 1 generic coloring |
| **Expansion** | OpenAI GPT-4o + QA loop | Each scene expanded into full child-facing narrative |
| **PDF Assembly** | PDFShift API | Storybook PDF + Coloring Book PDF + Certificate PDF |
| **Delivery** | SMTP via n8n | Download links emailed to customer |

---

## ⚙️ Tech Stack

| Layer | Tool |
|-------|------|
| Intake form | Tally |
| Orchestration | n8n Cloud (10 workflows) |
| Database | Supabase (Postgres) |
| Storage | Supabase Storage |
| AI — Script & Expansion | OpenAI GPT-4o |
| AI — Images | OpenAI gpt-image-1 |
| PDF Generation | PDFShift API |
| Email | SMTP via n8n |
| Config | Supabase `envs` table |
| Prompts | GitHub raw (fetched at runtime) |

---

## 📂 Repository Structure

```
evermagic/
├── n8n_backup/         # n8n workflow JSON exports (10 workflows)
├── utils/              # JavaScript functions pasted into n8n Code nodes
├── prompts/            # AI prompt templates (per theme + shared)
│   ├── space_hero/
│   ├── fantasy_hero/
│   ├── enchanted_princess/
│   ├── animal_guardian/
│   ├── home_helper/
│   └── shared/
├── templates/pdf/      # HTML/CSS templates for storybook, coloring book, certificate
├── database/           # SQL schemas for Supabase tables
├── emails/             # HTML email templates
├── project_data/       # Context, roadmap, planning docs
├── temp_data/          # Sample payloads for manual testing
└── scripts/            # Node.js utility scripts (workflow export, prompt testing)
```

---

## 🎭 Story Themes

| Theme | Setting | Companion |
|-------|---------|-----------|
| Space Hero Mission | Space station + alien planet | Robot sidekick |
| Fantasy Hero Quest | Enchanted kingdom | Dragon companion |
| Enchanted Princess Adventure | Rainbow kingdom | Unicorn |
| Animal Guardian Hero | Magical forest | Animal friends |
| Home Helper Hero | Cozy home + tiny village | Household magic |

Each theme has its own system prompt, expansion prompt, image guidelines, visual style, and CSS for the PDF.

---

## 🗃 Database Schema

| Table | Purpose |
|-------|---------|
| `orders` | One row per order, tracks status through state machine |
| `order_payloads` | Raw intake webhook payload (JSONB) for debugging |
| `scripts` | Versioned scripts — draft / approved / superseded + expanded content |
| `images` | 12 images per order with Supabase Storage paths |
| `pdfs` | Generated PDF paths + public URLs |
| `intake_tokens` | Single-use tokens gating form submission |
| `envs` | Runtime config (mode, feature flags) |
| `execution_log` | Workflow audit trail |

---

## ⚙️ Setup

This is a no-code/low-code pipeline — there is no local server to run. The pipeline runs on n8n Cloud. To set up a copy:

1. **n8n Cloud** — import workflow JSONs from `n8n_backup/`; add credentials for OpenAI, Supabase, SMTP, PDFShift
2. **Supabase** — apply SQL schemas from `database/`; seed the `envs` table with `mode=test`, `script_approval_required=true`
3. **Tally** — create an intake form matching the field structure in `project_data/form_structure.json`; point its webhook at the n8n intake workflow
4. **GitHub prompts** — the prompts in `prompts/` are fetched at runtime via raw GitHub URLs; keep the repo public or update the fetch URLs
5. **Test** — use `utils/fill-form.js` (browser script) to auto-fill the Tally form; use `EVRM-DEV` as the dev cheat token

---

## 💰 Economics

| Product | Price | Cost/Order | Margin |
|---------|-------|-----------|--------|
| PDF Bundle | $9–15 CAD | ~$0.35 | ~97% |
| PDF + Video Bundle (Phase 5) | $35–49 CAD | ~$1.00 | ~97% |

---

## 🔑 Key Design Principles

- Deterministic orchestration (n8n), generative content (AI)
- Canonical structured JSON passed through every workflow step
- Clear state machine — every transition is logged
- Idempotent steps — safe to re-run at any stage
- Script versioning — full audit trail on every retry or edit
- Validate before automating

---

## 📖 Full Documentation

See **[DOCUMENTATION.md](./DOCUMENTATION.md)** for workflow breakdowns, database schema, state machine, AI prompt system, and cost analysis.

See **[ROADMAP.md](./ROADMAP.md)** for planned work.

---

*Made with ❤️ by EverMagic*
