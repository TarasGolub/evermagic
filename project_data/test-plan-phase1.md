# 🧪 EverMagic — Phase 1 Test Plan

**Date:** _______________  
**Tester:** _______________  
**Order ID used:** _______________

---

## Scenario 1: Happy Path → Approve

| # | Step | Expected | ✅ Pass | Notes |
|---|------|----------|---------|-------|
| 1.1 | Submit Tally form | n8n webhook fires | ☐ | |
| 1.2 | Check n8n executions | Execution completed successfully | ☐ | |
| 1.3 | **Supabase `orders`** | New row: `status` = `script_review` | ☐ | |
| 1.4 | **Supabase `scripts`** | New row: `version` = 1, `status` = `draft` | ☐ | |
| 1.5 | **Supabase `scripts`** | `title` and `tagline` populated | ☐ | |
| 1.6 | **Supabase `scripts`** | `content` is valid JSON with 5 scenes | ☐ | |
| 1.7 | Check customer email inbox | Confirmation email received | ☐ | |
| 1.8 | Check admin email inbox | Review email with 3 buttons received | ☐ | |
| 1.9 | Review email shows version badge | `v1` visible | ☐ | |
| 1.10 | Click **✅ Approve** in email | Browser shows "Script Approved!" | ☐ | |
| 1.11 | **Supabase `scripts`** | `status` = `approved`, `approved_at` set | ☐ | |
| 1.12 | **Supabase `orders`** | `status` = `approved` | ☐ | |
| 1.13 | Click Approve again (same link) | "Already Approved" page | ☐ | |

---

## Scenario 2: Edit & Retry → Regenerate with AI

> ⚠️ Start fresh or use a new order for this test.

| # | Step | Expected | ✅ Pass | Notes |
|---|------|----------|---------|-------|
| 2.1 | Submit Tally form | Script v1 generated | ☐ | |
| 2.2 | Click **🔄 Edit & Retry** in admin email | Feedback form loads in browser | ☐ | |
| 2.3 | Form shows order ID and version | Correct order ID, `v1` | ☐ | |
| 2.4 | Type feedback, click "Regenerate" | "Regenerating..." confirmation page | ☐ | |
| 2.5 | **Supabase `scripts`** | v1: `status` = `superseded` | ☐ | |
| 2.6 | **Supabase `scripts`** | v2: `status` = `draft`, `feedback` = your text | ☐ | |
| 2.7 | **Supabase `scripts`** | v2: `content` has different story than v1 | ☐ | |
| 2.8 | Check admin email | New review email with `v2` badge | ☐ | |
| 2.9 | New email shows feedback banner | Yellow box with your feedback text | ☐ | |
| 2.10 | Click **✅ Approve** on v2 email | "Script Approved!" page | ☐ | |
| 2.11 | **Supabase `scripts`** | v2: `status` = `approved`, `approved_at` set | ☐ | |
| 2.12 | **Supabase `orders`** | `status` = `approved` | ☐ | |

---

## Scenario 3: Manual Edit → Edit Script Form

> ⚠️ Start fresh or use a new order for this test.

| # | Step | Expected | ✅ Pass | Notes |
|---|------|----------|---------|-------|
| 3.1 | Submit Tally form | Script v1 generated | ☐ | |
| 3.2 | Click **✏️ Manual Edit** in admin email | Edit form loads with formatted fields | ☐ | |
| 3.3 | Form shows **Title** field | Pre-filled with story title | ☐ | |
| 3.4 | Form shows **Tagline** field | Pre-filled | ☐ | |
| 3.5 | Form shows **5 scene cards** | Each with title, narration, visual, emotion | ☐ | |
| 3.6 | Form shows **Closing message** | Pre-filled with parent message | ☐ | |
| 3.7 | Edit narration in Scene 1 | Text is editable | ☐ | |
| 3.8 | Click **✅ Save & Approve** | "Script Saved & Approved!" page | ☐ | |
| 3.9 | **Supabase `scripts`** | v1: `status` = `superseded` | ☐ | |
| 3.10 | **Supabase `scripts`** | v2: `status` = `approved`, `approved_at` set | ☐ | |
| 3.11 | **Supabase `scripts`** v2 content | Your edited narration is saved | ☐ | |
| 3.12 | **Supabase `orders`** | `status` = `approved` | ☐ | |

---

## Scenario 4: Edge Cases

| # | Step | Expected | ✅ Pass | Notes |
|---|------|----------|---------|-------|
| 4.1 | Visit review URL without `order_id` | "Missing order_id" error page | ☐ | |
| 4.2 | Visit review URL with `action=invalid` | "Invalid action" error page | ☐ | |
| 4.3 | Double-click Approve (rapid) | Only one update, no errors | ☐ | |
| 4.4 | Retry → Retry → Approve | v3 approved, v1+v2 superseded | ☐ | |

---

## Supabase Quick-Check Queries

```sql
-- Check order status
SELECT order_id, status FROM orders WHERE order_id = 'YOUR_ORDER_ID';

-- Check all script versions for an order
SELECT id, order_id, version, status, title, feedback,
       created_at, approved_at
FROM scripts
WHERE order_id = 'YOUR_ORDER_ID'
ORDER BY version;

-- Verify approved script content
SELECT version, content
FROM scripts
WHERE order_id = 'YOUR_ORDER_ID' AND status = 'approved';
```

---

**All scenarios passed:** ☐  
**Bugs found:** _______________  
**Notes:** _______________
