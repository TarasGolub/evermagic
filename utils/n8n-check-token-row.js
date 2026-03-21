// ─────────────────────────────────────────────────────────────
// EverMagic — n8n Code Node: "Validate Token"
// Step 3.5 — Intake Token System
//
// Placement: AFTER Supabase "Fetch Token from DB" node
//
// Input:
//   $input.first().json      = Supabase row from intake_tokens (or empty if not found)
//   $('Parse Token').first() = { token, source, orderNo, skipTokenCheck }
//
// Output (TRUE branch = IF node passes through):
//   { tokenValid: true,  token, source, orderNo }
//
// Output (FALSE branch = reject path):
//   { tokenValid: false, rejectReason: 'already_used' | 'not_found' }
//
// Supabase node setup (before this):
//   Operation: getAll
//   Table: intake_tokens
//   Filter: token eq {{ $('Parse Token').first().json.token }}
//   Limit: 1
// ─────────────────────────────────────────────────────────────

const tokenRow  = $input.first().json;          // Supabase row — may be empty object {}
const parsed    = $('Parse Token').first().json; // { token, source, orderNo }

const rowExists = tokenRow && tokenRow.token;   // real row has a token column
const isUnused  = rowExists && tokenRow.status === 'unused';

if (!rowExists) {
  // Token not found in DB at all
  return [{
    json: {
      tokenValid:   false,
      rejectReason: 'not_found',
      token:        parsed.token,
      source:       parsed.source,
      orderNo:      parsed.orderNo,
    }
  }];
}

if (!isUnused) {
  // Token exists but has already been used
  return [{
    json: {
      tokenValid:   false,
      rejectReason: 'already_used',
      token:        parsed.token,
      source:       parsed.source,
      orderNo:      parsed.orderNo,
    }
  }];
}

// ✅ Token is valid and unused
return [{
  json: {
    tokenValid:   true,
    rejectReason: null,
    token:        tokenRow.token,
    source:       parsed.source,
    orderNo:      parsed.orderNo,
  }
}];
