// n8n Function node — Tally webhook → EverMagic order order JSON
// Input: items[0].json = n8n Webhook payload (as in your sample)
// Output: items[0].json.order + items[0].json.validation_errors (if any)

const input = $input.first().json;

// ─────────────────────────────────────────────────────────────
// Locate Tally body + fields safely
// ─────────────────────────────────────────────────────────────
const body = input.body || {};
const data = body.data || {};
const fields = Array.isArray(data.fields) ? data.fields : [];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const getField = (label) => fields.find(f => f?.label === label) || null;

// Dropdown / Radio in Tally: value: [optionId], options: [{id,text}]
function getDropdownText(label) {
  const field = getField(label);
  if (!field) return null;

  const selectedId = Array.isArray(field.value) ? field.value[0] : null;
  if (!selectedId) return null;

  const opt = Array.isArray(field.options) ? field.options.find(o => o.id === selectedId) : null;
  return opt?.text ?? null;
}

// Checkbox group (like glasses): Tally sends extra boolean fields with labels "glasses (Yes)" etc.
function getYesNoCheckbox(labelBase) {
  const hit = fields.find(f =>
    typeof f?.label === 'string' &&
    f.label.startsWith(`${labelBase} (`) &&
    f.value === true
  );
  if (!hit) return null;

  const m = hit.label.match(/\((.+)\)$/);
  return (m && m[1]) ? m[1].trim() : true;
}

function getValue(label) {
  const field = getField(label);
  return field ? field.value : null;
}

function asString(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string') return v.trim();
  return String(v).trim();
}

function asInt(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function normalizePackage(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('basic')) return 'BASIC';
  if (t.includes('full')) return 'FULL';
  if (t.includes('party')) return 'PARTY';
  return text ? text.toUpperCase().replace(/\s+/g, '_') : null;
}

function normalizeLanguage(text) {
  const t = (text || '').toUpperCase();
  if (t.includes('(EN') || t.includes('ENGLISH')) return 'EN';
  if (t.includes('(UA') || t.includes('UKRAIN')) return 'UA';
  return 'EN';
}

function normalizeTheme(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('space')) return 'SPACE_HERO';
  return text ? text.toUpperCase().replace(/\s+/g, '_') : 'SPACE_HERO';
}

function normalizeTrait(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('brave')) return 'brave';
  if (t.includes('kind')) return 'kind';
  if (t.includes('smart')) return 'smart';
  if (t.includes('creative')) return 'creative';
  return text ? t : null;
}

function getFiles(label) {
  const v = getValue(label);
  if (!v || !Array.isArray(v)) return [];
  return v
    .map(f => ({
      id: f.id || null,
      name: f.name || null,
      url: f.url || null,
      mime: f.mimeType || null,
      size: f.size || null,
    }))
    .filter(x => x.url);
}

function generateOrderId(prefix = 'EM') {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${y}${m}${d}-${rand}`;
}

// Consent checkbox: your payload includes label "consent ()" with value true
function getConsentAccepted() {
  const direct = fields.find(f =>
    (f?.label === 'consent' && Array.isArray(f.value) && f.value.length > 0)
  );
  if (direct) return true;

  const boolEntry = fields.find(f =>
    typeof f?.label === 'string' &&
    f.label.startsWith('consent') &&
    f.value === true
  );
  return Boolean(boolEntry);
}

// ─────────────────────────────────────────────────────────────
// Extract raw values
// ─────────────────────────────────────────────────────────────

const email = asString(getValue('email'));
const packageText = getDropdownText('package');
const languageText = getDropdownText('language');

const childName = asString(getValue('child_name'));
const age = asInt(getValue('age'));
const genderText = getDropdownText('gender');

const glassesYN = getYesNoCheckbox('glasses'); // returns "Yes" or "No" or null
const glasses = glassesYN ? glassesYN.toLowerCase() === 'yes' : null;

const hairColorText = getDropdownText('hair_color');
const skinToneText = getDropdownText('skin_tone');

const hobby = asString(getValue('hobby'));
const hobbyDetail = asString(getValue('hobby_detail'));
const signatureLook = asString(getValue('signature_look'));
const jerseyNumber = asString(getValue('jersey_number'));
const recentWin = asString(getValue('recent_win'));

const themeText = getDropdownText('theme');
const heroTraitText = getDropdownText('hero_trait');
const parentMessage = asString(getValue('parent_message'));

const photoMain = getFiles('photo_main');
const photoExtra = getFiles('photo_extra');

const consentAccepted = getConsentAccepted();

// ─────────────────────────────────────────────────────────────
// Normalize
// ─────────────────────────────────────────────────────────────

const order = {
  order_id: generateOrderId('EM'),

  package: normalizePackage(packageText),
  language: normalizeLanguage(languageText),
  theme: normalizeTheme(themeText),

  delivery: { email },

  child: {
    name: childName,
    age,
    gender: genderText ? genderText.toLowerCase() : null,
    glasses: glasses === null ? false : glasses,
    hair_color: hairColorText ? hairColorText.toLowerCase() : null,
    skin_tone: skinToneText ? skinToneText.toLowerCase() : null,

    // Extended personalization (you added these fields — keep them in order)
    hobby,
    hobby_detail: hobbyDetail,
    signature_look: signatureLook,
    jersey_number: jerseyNumber,
    recent_win: recentWin,

    hero_trait: normalizeTrait(heroTraitText),
  },

  parent_message: parentMessage,

  photos: [
    ...photoMain.map(f => ({ ...f, type: 'photo_main' })),
    ...photoExtra.map(f => ({ ...f, type: 'photo_extra' })),
  ],

  consent: {
    accepted: consentAccepted,
  },

  meta: {
    // From Tally
    event_id: body.eventId || null,
    event_type: body.eventType || null,
    created_at: body.createdAt || null,

    response_id: data.responseId || null,
    submission_id: data.submissionId || null,
    respondent_id: data.respondentId || null,
    form_id: data.formId || null,
    form_name: data.formName || null,
    form_created_at: data.createdAt || null,

    // From headers (useful for debugging)
    user_agent: input.headers?.['user-agent'] || null,
    ip_country: input.headers?.['cf-ipcountry'] || null,
    cf_ray: input.headers?.['cf-ray'] || null,
    received_at: body.createdAt || new Date().toISOString()
  },
};

// ─────────────────────────────────────────────────────────────
// Validation (fail fast)
// ─────────────────────────────────────────────────────────────
const errors = [];

if (!order.delivery.email) errors.push('Missing email');
if (!order.child.name) errors.push('Missing child_name');
if (order.child.age === null) errors.push('Missing/invalid age');
if (!order.package) errors.push('Missing package');
if (!order.child.hero_trait) errors.push('Missing hero_trait');
if (!order.consent.accepted) errors.push('Consent not accepted');
if (!order.photos.some(p => p.type === 'photo_main')) errors.push('Missing photo_main');

if (errors.length) {
  // attach for inspection and stop the workflow

  return [{
    validationErrors: errors,
    order: order
  }];
  // do not throw yet if you want to handle it with IF node
  // If you prefer hard-stop, replace with:
  // throw new Error(`Validation failed: ${errors.join(', ')}`);
}

// ─────────────────────────────────────────────────────────────
// Output
// ─────────────────────────────────────────────────────────────

return [{
  json: {
    order
  }
}];