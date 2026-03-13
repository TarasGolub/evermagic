# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EverMagic is an **AI-powered automated content production engine** that creates personalized cinematic storybooks for children. It is a **no-code/low-code pipeline** — there is no traditional backend server, no npm build, no test runner. The "code" in this repo consists of JavaScript functions that are manually copied into n8n workflow code nodes, plus documentation, prompts, and database schemas.

## Repository Structure

- `n8n_backup/` — Exported n8n workflow JSONs (source of truth for workflow logic)
- `utils/` — JavaScript utility functions pasted into n8n Code nodes
- `prompts/space_hero/` — GPT system prompts and theme configs for the SPACE_HERO theme
- `database/` — SQL schema files for Supabase tables
- `emails/` — HTML email templates
- `temp_data/` — Sample payloads and test data for manual testing
- `project_data/` — Project planning docs, form structure, phase plans

## Architecture

### Pipeline Overview

```
Tally Form (customer fills)
    ↓ webhook
n8n Cloud (4 workflows)
    ↓
Supabase (PostgreSQL + Storage)
    ↓
Customer Email (confirmation + deliverables)
```

### 4 n8n Workflows

1. **EverMagic v1.0.1** — Intake + Script Generation: receives Tally webhook, parses form, saves order to Supabase, fetches prompt from GitHub, calls GPT-4o to generate 5-scene story script, emails admin + customer
2. **EverMagic Review** — Admin review UI: admin clicks link in email to see order/script details
3. **EverMagic Review Submit** — Processes admin actions: Approve / Retry (re-generate) / Edit (save changes)
4. **EverMagic Image Generation** — Fetches approved script, builds 12 image prompts, calls OpenAI image API (gpt-image-1), uploads to Supabase Storage

### Canonical Order JSON

All workflows pass a single canonical order object parsed by `utils/n8n-tally-parser.js`. Key structure:

```json
{
  "order_id": "EM-YYYYMMDD-XXXX",
  "package": "BASIC|FULL|PARTY",
  "language": "EN|UA",
  "theme": "SPACE_HERO",
  "child": { "name": "...", "age": 7, "gender": "...", "hobby": "...", ... },
  "delivery": { "email": "..." },
  "photos": [{ "url": "...", "type": "photo_main|photo_extra" }]
}
```

### Order State Machine

`created` → `validated` → `script_generated` → `script_review` ↔ (retry loops) → `approved` → `images_generating` → `images_generated`

### Database (Supabase)

| Table | Purpose |
|-------|---------|
| `orders` | One row per order, tracks status |
| `order_payloads` | Raw Tally webhook payload (JSONB) |
| `scripts` | Versioned scripts; old versions marked `superseded` |
| `images` | One row per image (12 per order), tracks generation status |
| `envs` | Key/value config: `mode` (test/live), `script_approval_required` |

### Configuration

Runtime config is read from the Supabase `envs` table (not environment variables or `.env` files). n8n credentials (API keys for OpenAI, Supabase, SMTP) live in n8n Cloud's credential store.

## Working with This Codebase

### Making Changes to Utility Functions

1. Edit the file in `utils/`
2. Manually paste the updated function into the corresponding n8n Code node
3. Export the updated workflow JSON from n8n and save to `n8n_backup/`

### Testing

Use sample payloads in `temp_data/` for manual testing. `utils/fill-form.js` is a browser script to auto-fill the Tally form for end-to-end testing.

### Prompts

System prompts live in `prompts/space_hero/system.md` and are fetched by n8n from GitHub raw URLs at runtime (not embedded in workflows). Image prompt guidelines are in `prompts/space_hero/image_prompts.md`.

### Adding a New Theme

Add a new entry to the `THEMES` object in `utils/n8n-build-image-prompts.js`. When the theme count grows large, migrate to Supabase or GitHub storage.

### Webhooks

Secured via Header Auth (`X-EverMagic-Token`). The admin review workflow uses separate webhook URLs for Approve/Retry/Edit actions.

## Key Design Principles

- **Idempotency:** Image generation reconciles against DB state before calling the API — safe to re-run
- **Script versioning:** Every edit/retry increments `version`; full audit trail maintained
- **14-second delays** between OpenAI image API calls to respect rate limits
- **Double-approval guard** prevents reprocessing an already-approved script
- Raw Tally payloads stored in `order_payloads` for debugging

## Documentation

- `README.md` — High-level overview and current status
- `DOCUMENTATION.md` — Full technical reference (workflows, schema, state machine, cost structure)
- `project_data/Context.MD` — Project vision, roadmap, and phase planning
