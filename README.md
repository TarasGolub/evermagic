# ✨ EverMagic

**AI-powered personalized story experiences for kids.**

EverMagic is an automated content production engine that creates personalized cinematic stories for children — including illustrated storybooks, coloring pages, certificates, and (coming soon) narrated videos.

---

## 🚀 Current Status

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1** | Order intake + AI script generation + admin review | ✅ Complete |
| **Phase 2** | AI image generation (12 images/order) + Supabase Storage | ✅ Complete |
| **Phase 3** | PDF storybook engine (Etsy product) | 🔄 Next |
| Phase 4 | Video bundle (voice + video rendering) | 📋 Planned |
| Phase 5 | Stripe integration & storefront | 📋 Planned |
| Phase 6 | Scale (multi-theme, multi-language, monitoring) | 📋 Planned |

---

## 🏗 How It Works

```
Parent fills Tally form → n8n webhook processes order → AI generates story script
    → Admin reviews/approves → AI generates 12 images with child's face
    → [Phase 3] PDF storybook assembled → Delivered to parent by email
```

### Pipeline at a Glance

| Step | Tool | What Happens |
|------|------|-------------|
| **Intake** | Tally → n8n Webhook | Parse form, validate, save to Supabase |
| **Script** | OpenAI GPT | Generate 5-scene personalized story |
| **Review** | n8n Web UI (via email) | Admin approves, retries with feedback, or edits inline |
| **Images** | OpenAI gpt-image-1 | Generate cover + 5 scenes + 6 coloring pages |
| **Storage** | Supabase | Store images, scripts, order data |
| **Delivery** | SMTP via n8n | Customer confirmation + admin review emails |

---

## ⚙️ Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | Tally (intake form) |
| Orchestration | n8n Cloud |
| Database | Supabase (Postgres) |
| Storage | Supabase Storage |
| AI Script | OpenAI GPT-4o / GPT-5-nano |
| AI Images | OpenAI gpt-image-1 |
| Email | SMTP via n8n |
| Config | Supabase `envs` table |
| Prompts | GitHub (raw fetch) |

---

## 📂 Repository Structure

```
evermagic/
├── project_data/       # Context, form structure, planning docs
├── n8n_backup/         # n8n workflow JSON exports (4 workflows)
├── prompts/            # AI prompt templates (by theme)
├── database/           # SQL schemas
├── emails/             # HTML email templates
├── utils/              # n8n code node scripts (standalone copies)
├── temp_data/          # Sample payloads & test data
├── DOCUMENTATION.md    # Full technical documentation
└── README.md           # This file
```

---

## 📖 Documentation

For detailed technical documentation — including workflow breakdowns, database schema, state machine, AI prompt system, cost analysis, and contributor onboarding — see:

**[📚 DOCUMENTATION.md](./DOCUMENTATION.md)**

---

## 🎯 What's Next (Phase 3)

1. **Scenario expansion** — GPT-4o expands each scene into full child-facing narrative
2. **PDF templates** — HTML/CSS layouts for storybook, coloring book, certificate
3. **PDF assembly** — Content + images → PDFShift API → Supabase Storage
4. **Etsy listing** — First sellable product validation

**Strategy:** Validate manually first → automate after first sale.

---

## 💰 Economics

| Product | Price | Cost/Order | Margin |
|---------|-------|-----------|--------|
| PDF Bundle (Etsy) | $9–15 CAD | ~$0.35 | ~97% |
| Full Bundle (Premium) | $35–49 CAD | ~$1.00 | ~97% |

---

## 🔑 Key Principles

- Deterministic workflows (n8n orchestrates, AI generates)
- Canonical structured JSON throughout pipeline
- Clear state machine with auditable transitions
- Idempotent steps (safe to re-run)
- Validate before automating

---

*Made with ❤️ by EverMagic*
