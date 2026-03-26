# EverMagic UAT Plan

**Goal:** Send personalized storybook orders to ~10 friends, collect honest feedback, synthesize with AI before Etsy launch.

---

## Components to Build

### Supabase Tables (create manually)

```sql
-- uat_participants
id          uuid PK default gen_random_uuid()
name        text
email       text
token       text  -- FK → intake_tokens.token
status      text  -- pending / invited / submitted / delivered / feedback_received
invited_at  timestamptz
notes       text  -- personal notes about this person

-- uat_feedback
id                  uuid PK default gen_random_uuid()
order_id            text  -- FK → orders.order_id
email               text
submitted_at        timestamptz default now()
would_buy           text  -- Yes / No / Maybe
price_expectation   text
process_feedback    text  -- ordering, waiting, receiving
result_feedback     text  -- quality of PDFs
open_feedback       text  -- anything else
```

### Tally Feedback Form (create manually)
5 questions:
1. Would you buy this for a friend's kid? (Yes / No / Maybe)
2. What would you pay? (open text)
3. How was the process — ordering, waiting, receiving? (open text)
4. What did you think of the result — the PDFs? (open text)
5. Anything else — broken, missing, loved? (open text)

---

## 4 n8n Workflows

### 1 — UAT Invite *(manual trigger, new workflow)*
```
Manual Trigger
  → Fetch uat_participants (status = pending)
  → Loop: for each friend
      → Assign token from intake_tokens
      → Send invitation email
      → Update uat_participants status = invited
```

### 2 — PDF Assembly *(existing — small addition at the end)*
```
... existing delivery flow ...
  → [NEW] Check if delivery email is in uat_participants
      → if yes: send feedback request email
               update uat_participants status = delivered
```

### 3 — UAT Feedback Receiver *(Tally webhook, new workflow)*
```
Tally feedback form submitted (webhook)
  → Parse feedback fields
  → Save to uat_feedback table
  → Update uat_participants status = feedback_received
  → Send thank-you email
```

### 4 — UAT Synthesis *(manual trigger, new workflow — run once most feedback is in)*
```
Manual Trigger
  → Fetch all uat_feedback rows
  → Build GPT-4o prompt with all responses
  → Ask: summarize themes, flag critical issues, prioritize top 5 improvements
  → Email result to taras.evermagic@gmail.com
```

---

## Invitation Email Tone

Personal, not polished:

> "I've been building something for the past few months. It's an AI system that creates personalized storybooks for kids. It works — but I need real feedback before I put it on Etsy. I picked you because I trust you'll be honest. Here's your personal link. Fill the form, wait ~15 min, check your inbox. Then tell me what you really think."

Key points to include:
- What EverMagic is (2 sentences)
- What's ready now (storybook PDF + coloring book + certificate)
- What's planned (video, more themes)
- The link (Tally form with pre-filled token)
- Feedback is for me only — honesty appreciated, criticism welcome
- Will review all feedback, won't promise to fix everything

---

## Build Order

1. Workflows 1 + 3 (invite + feedback receiver) — self-contained, no production risk
2. Workflow 4 (synthesis) — simple, standalone
3. PDF Assembly addition — touches production code, do last

---

## Decisions Made

- All-at-once invites (not staggered)
- One feedback form with few fields (not two separate forms)
- Automatic feedback trigger after delivery (check UAT participant on pdf_delivered)
- Up to 10 friends
- AI synthesis with prioritized recommendations — manual trigger once most feedback received

---

## Status

- [ ] Create `uat_participants` table in Supabase
- [ ] Create `uat_feedback` table in Supabase
- [ ] Create Tally feedback form
- [ ] Build Workflow 1 — UAT Invite
- [ ] Build Workflow 3 — UAT Feedback Receiver
- [ ] Build Workflow 4 — UAT Synthesis
- [ ] Modify PDF Assembly — add UAT check after delivery
- [ ] Populate `uat_participants` with friends + assign tokens
- [ ] Send invites
