// n8n Code node — "Build Token Rejected Email"
// Placement: FALSE branch of "If Token Valid", BEFORE "Respond to Webhook"
// Place AFTER: "Fetch Token Rejected Email Template" HTTP Request node
//
// Add a "Send Email" node after this one:
//   To:      {{ $json.to }}
//   Subject: {{ $json.subject }}
//   HTML:    {{ $json.html }}

const tallyPayload = $('Parse Tally Payload').first().json;

// Extract customer email and token from the raw Tally form data
const customerEmail = tallyPayload.data?.fields?.find(f => f.type === 'EMAIL')?.value || '';
const token         = tallyPayload.data?.fields?.find(f => f.label === 'intake_token')?.value
                   || $('Parse Token').first().json.token
                   || 'N/A';

const env     = $('Envs').first().json.env;
const branch  = env.is_live ? 'main' : 'develop';
const logoUrl = `https://raw.githubusercontent.com/TarasGolub/evermagic/${branch}/templates/icons/logo_email.png`;

const template = $('Fetch Token Rejected Email Template').first().json.data;

const html = template
  .replace(/\{\{logo_url\}\}/g,   logoUrl)
  .replace(/\{\{order_ref\}\}/g,  token);

return [{
  json: {
    to:      customerEmail,
    subject: 'Something went wrong with your EverMagic order',
    html:    html,
  }
}];
