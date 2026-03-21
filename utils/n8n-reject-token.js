// ─────────────────────────────────────────────────────────────
// EverMagic — n8n Code Node: "Reject Token"
// Step 3.5 — Intake Token System
//
// Placement: FALSE branch of "If Token Valid" IF node
//            Connect output to a "Respond to Webhook" node
//
// Purpose: Builds a reject payload for the Respond to Webhook node.
//
// After this node, add a "Respond to Webhook" node:
//   Respond With: JSON
//   Response Code: 400
//   Response Body: {{ $json.errorBody }}
// ─────────────────────────────────────────────────────────────

const parsed      = $('Parse Token').first().json;
const rejectReason = parsed.rejectReason
                  || $('Validate Token').first().json.rejectReason
                  || 'invalid_token';

const messages = {
  missing_token: 'This form requires a valid access token. Please use the link you received in your order email.',
  not_found:     'This access token is not recognised. Please check your order email and use the link provided.',
  already_used:  'This access link has already been used. Each link can only be used once. Please contact support if you need help.',
};

const message = messages[rejectReason] || 'This access link is not valid. Please contact support.';

return [{
  json: {
    errorBody: JSON.stringify({
      error:   rejectReason,
      message: message,
    })
  }
}];
