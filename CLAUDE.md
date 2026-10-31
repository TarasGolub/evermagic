# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EverMagic is an **AI-powered automated content production engine** that creates personalized cinematic storybooks for children. It is a **no-code/low-code pipeline** — there is no traditional backend server, no npm build, no test runner. The "code" in this repo consists of JavaScript functions that are manually copied into n8n workflow code nodes, plus documentation, prompts, and database schemas.

**Current status:** Phases 1–3 complete. Etsy shop open, listings in progress, Etsy→n8n integration built (pending Etsy app approval). Phase 4 (voice + video) is next.

**Strategic context:** `.gemini/rules.md` captures the co-founder mindset for product/strategy decisions in this repo — challenge assumptions, separate facts from risks, optimize for clarity over politeness.

## Repository Structure

- `n8n_backup/` — Exported n8n workflow JSONs (source of truth for workflow logic)
- `utils/` — JavaScript utility functions pasted into n8n Code nodes
- `prompts/<theme>/` — Per-theme GPT system prompts, image prompt guidelines, expansion prompts, CSS styles, and `theme.json` config. Themes: `space_hero`, `fantasy_hero`, `enchanted_princess`, `animal_guardian`, `home_helper`
- `prompts/shared/` — Shared prompts used across themes (e.g. `expansion_qa.md`)
- `database/` — SQL schema files for Supabase tables
- `emails/` — HTML email templates
- `templates/pdf/` — HTML/CSS templates for storybook, coloring book, and certificate PDFs (injected by `n8n-build-pdf-html.js` and sent to PDFShift)
- `scripts/` — Node.js utility scripts (export workflows, test prompts)
- `temp_data/` — Sample payloads and test data for manual testing
- `project_data/` — Project planning docs, form structure, phase plans

## Architecture

### Pipeline Overview

```
Etsy purchase → Etsy Intake workflow → pre-filled Tally link sent to buyer
    ↓ (or direct Tally form)
Tally Form (customer fills)
    ↓ webhook
n8n Cloud (10 workflows)
    ↓
Supabase (PostgreSQL + Storage)
    ↓
Customer Email (confirmation + deliverables)
```

### n8n Workflows

**Core pipeline (numbered by phase):**
1. **EverMagic v1.0.1** — Intake + Script Generation: receives Tally webhook, validates intake token, parses form, saves order to Supabase, fetches prompt from GitHub, calls GPT to generate 5-scene story script, emails admin + customer
2. **EverMagic Review** (1.2) — Admin review UI: admin clicks link in email to see order/script details
3. **EverMagic Review Submit** (1.1) — Processes admin actions: Approve / Retry / Edit
4. **EverMagic Image Generation** (2) — Fetches approved script, builds 12 image prompts, calls OpenAI image API (gpt-image-1), uploads to Supabase Storage
5. **EverMagic Scenario Expansion** (3.1) — GPT-4o expands each scene into full child-facing narrative with dialogue
6. **EverMagic PDF Assembly** (3.2) — Injects expanded content + images into HTML/CSS templates, sends to PDFShift API, stores PDFs, sends delivery email
7. **EverMagic Etsy Intake** (4.1) — Receives Etsy `order.paid` webhook, fetches receipt, generates intake token, sends pre-filled Tally link to buyer

**Support workflows:**
- **EverMagic Error Notifier** (0) — Global error handler notifying admin of workflow failures
- **EverMagic UAT Invite** (99_1) — Sends UAT invitation emails
- **EverMagic UAT Feedback** (99_2) — Collects UAT feedback responses

### Canonical Order JSON

All workflows pass a single canonical order object parsed by `utils/n8n-tally-parser.js`. Key structure:

```json
{
  "order_id": "EM-YYYYMMDD-XXXX",
  "package": "BASIC|FULL|PARTY",
  "language": "EN|UA",
  "theme": "SPACE_HERO",
  "child": { "name": "...", "age": 7, "gender": "...", "hobby": "...", "hero_trait": "...", ... },
  "delivery": { "email": "..." },
  "photos": [{ "url": "...", "type": "photo_main|photo_extra" }]
}
```

### Order State Machine

`created` → `validated` → `script_generated` → `script_review` ↔ (retry loops) → `approved` → `images_generating` → `images_generated` → `scenario_expanding` → `scenario_expanded` → `pdf_generating` → `pdf_generated` → `pdf_delivered`

### Database (Supabase)

| Table | Purpose |
|-------|---------|
| `orders` | One row per order, tracks status |
| `order_payloads` | Raw Tally webhook payload (JSONB) |
| `scripts` | Versioned scripts; old versions marked `superseded`; also stores `expanded_content` |
| `images` | One row per image (12 per order): 1 cover + 5 scenes + 5 coloring pages + 1 generic coloring |
| `pdfs` | Generated PDF file paths and URLs per order |
| `envs` | Key/value config: `mode` (test/live), `script_approval_required`, `qr_code_url` |
| `intake_tokens` | Single-use tokens (`EVRM-XXXXXXXX`) that gate form submission; `EVRM-DEV` is the hardcoded dev cheat token |
| `execution_log` | Workflow execution audit trail |
| `error_handling` | Error records for failed workflow steps |

### Configuration

Runtime config is read from the Supabase `envs` table (not environment variables or `.env` files). n8n credentials (API keys for OpenAI, Supabase, SMTP) live in n8n Cloud's credential store.

## Working with This Codebase

### Making Changes to Utility Functions

1. Edit the file in `utils/`
2. Manually paste the updated function into the corresponding n8n Code node
3. Export the updated workflow JSON from n8n and save to `n8n_backup/`

To export all workflows at once:
```
N8N_BASE_URL=https://yourname.app.n8n.cloud N8N_API_KEY=your_key node scripts/export-n8n-workflows.mjs
```

### Testing

Use sample payloads in `temp_data/` for manual testing. `utils/fill-form.js` is a browser script to auto-fill the Tally form for end-to-end testing. `scripts/test-coloring-prompt.mjs` tests coloring image prompt output.

### Prompts

Each theme has its own folder under `prompts/<theme>/` containing:
- `system.md` — GPT story generation system prompt (fetched from GitHub raw URL at runtime)
- `expansion.md` — Scenario expansion prompt
- `image_prompts.md` — Image generation guidelines
- `style.md` — Visual style description
- `theme_styles.css` — CSS injected into PDF templates
- `theme.json` — Theme metadata

Prompts are fetched by n8n from GitHub raw URLs at runtime — they are not embedded in workflow JSONs.

### Adding a New Theme

1. Add a new entry to the `THEMES` object in `utils/n8n-build-image-prompts.js`
2. Create a new folder under `prompts/<theme_key>/` with all 6 files above
3. Update `normalizeTheme()` in `utils/n8n-tally-parser.js`

When the theme count grows large, migrate theme configs to Supabase or GitHub storage.

### PDF Templates

`templates/pdf/` contains three HTML templates:
- `storybook.html` — Main illustrated story (5 scenes + cover)
- `coloring-book.html` — Coloring pages
- `certificate.html` — Personalized hero certificate

`utils/n8n-build-pdf-html.js` injects order, script, expanded content, and image URLs into these templates, then sends to PDFShift API for rendering.

### Webhooks

Secured via Header Auth (`X-EverMagic-Token`). The admin review workflow uses separate webhook URLs for Approve/Retry/Edit actions.

### Etsy Intake Flow

The Etsy Intake workflow (4.1) maps Etsy listing IDs to themes, generates a fresh `EVRM-XXXXXXXX` intake token per purchase, and sends a pre-filled Tally URL to the buyer (email + theme + package + token pre-filled). This keeps the main intake pipeline unchanged.

## Key Design Principles

- **Idempotency:** Image generation reconciles against DB state before calling the API — safe to re-run
- **Script versioning:** Every edit/retry increments `version`; full audit trail maintained
- **14-second delays** between OpenAI image API calls to respect rate limits
- **Double-approval guard** prevents reprocessing an already-approved script
- **12 images per order:** 1 cover + 5 scene images + 5 scene coloring pages + 1 generic coloring page
- Raw Tally payloads stored in `order_payloads` for debugging

## Documentation

- `README.md` — High-level overview and current status
- `DOCUMENTATION.md` — Full technical reference (workflows, schema, state machine, cost structure)
- `project_data/Context.MD` — Project vision, roadmap, and phase planning
- `project_data/etsy_webhook_intake_plan.md` — Etsy→n8n integration design
