# Token Reservation — Implementation Plan

**Status:** Deferred — currently managing token assignment manually.
**Priority:** Implement before scaling beyond ~10 orders/month.

---

## Problem

Token pool has two states: `unused` → `used`.
When assigning a token to an Etsy customer, there is no "claimed" state between selecting the token and the customer submitting the form.
Running the pool query twice in quick succession returns the same token — two customers receive the same link; one gets an error they can't explain.

---

## Solution — add `reserved` status

```
unused  →  reserved  →  used
```

- **`unused`** — in the pool, never assigned
- **`reserved`** — link sent to a customer, waiting for submission
- **`used`** — customer submitted their form

---

## Changes required

### 1. DB migration

```sql
ALTER TABLE public.intake_tokens
  ADD COLUMN IF NOT EXISTS reserved_at TIMESTAMPTZ;

-- status values: unused | reserved | used
```

### 2. Updated pool query (use this when fulfilling an Etsy order)

```sql
UPDATE public.intake_tokens
SET    status        = 'reserved',
       reserved_at   = now(),
       etsy_order_id = '<ETSY_ORDER_ID>'
WHERE  token = (
    SELECT token FROM public.intake_tokens
    WHERE  status = 'unused'
    ORDER  BY created_at
    LIMIT  1
    FOR UPDATE SKIP LOCKED
)
RETURNING token;
```

`FOR UPDATE SKIP LOCKED` ensures two simultaneous queries never grab the same row.

### 3. Update `n8n-validate-token.js`

Change the valid status check from `unused` only to also accept `reserved`:

```js
const isUnused = rowExists && (tokenRow.status === 'unused' || tokenRow.status === 'reserved');
```

A `reserved` token was legitimately issued to that customer — they must be allowed to use it.

---

## Not affected

Retry tokens (issued by the Error Notifier) are generated fresh per order, inserted as `unused`, and sent in the same workflow execution. No manual step → no duplication risk.
