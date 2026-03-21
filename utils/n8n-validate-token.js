// ─────────────────────────────────────────────────────────────
// EverMagic — n8n Code Node: "Parse Token"
// Step 3.5 — Intake Token System
//
// Placement: FIRST node after "Receive Order" webhook
//
// Purpose:
//   Extracts token / source / orderNo from hidden Tally fields.
//   Handles the cheat token (EVRM-DEV) immediately.
//   Passes a structured object downstream for the IF + Supabase nodes.
//
// Tally form setup required:
//   Add 3 hidden fields to the Tally form:
//     label: "token"   → pre-filled from URL param ?token=
//     label: "source"  → pre-filled from URL param ?source=
//     label: "orderNo" → pre-filled from URL param ?orderNo=
//
// Output object:
//   {
//     token:           string | null,
//     source:          string,         // 'etsy' | 'unknown' | etc.
//     orderNo:         string | null,  // external order reference
//     skipTokenCheck:  boolean,        // true only for EVRM-DEV cheat token
//     rejectReason:    string | null,  // 'missing_token' if no token at all
//   }
// ─────────────────────────────────────────────────────────────

// ─── Config ────────────────────────────────────────────────────
const CHEAT_TOKEN = 'EVRM-DEV';

// ─── Helpers ───────────────────────────────────────────────────
const body   = $('Receive Order').first().json.body || {};
const data   = body.data || {};
const fields = Array.isArray(data.fields) ? data.fields : [];

function getHiddenField(label) {
  const f = fields.find(f => f?.label === label);
  if (!f) return null;
  const v = f.value;
  if (v === null || v === undefined) return null;
  return String(v).trim() || null;
}

// ─── Extract URL-param hidden fields ───────────────────────────
const token   = getHiddenField('token');
const source  = getHiddenField('source')  || 'unknown';
const orderNo = getHiddenField('orderNo') || null;

// ─── Cheat token — bypass DB check entirely ─────────────────────
if (token === CHEAT_TOKEN) {
  return [{
    json: {
      token,
      source,
      orderNo,
      skipTokenCheck: true,
      rejectReason:   null,
    }
  }];
}

// ─── No token at all — reject immediately ───────────────────────
if (!token) {
  return [{
    json: {
      token:          null,
      source,
      orderNo,
      skipTokenCheck: false,
      rejectReason:   'missing_token',
    }
  }];
}

// ─── Valid-looking token — let Supabase + Validate nodes decide ─
return [{
  json: {
    token,
    source,
    orderNo,
    skipTokenCheck: false,
    rejectReason:   null,
  }
}];
