// n8n Code node — "Build Emails"
// Place AFTER: "Fetch Confirmation Email Template", "Fetch Admin Email Template", "Parse Script"
// Outputs TWO items: [0] = customer email, [1] = admin email
// Then use a Send Email node for each (or split with IF)

const order = $('Validate and Transform Order').first().json.order;
const script = $('Parse Script').first().json.script;
const scriptVersion = $('Parse Script').first().json.version || 1;

// ─────────────────────────────────────────────────────────────
// Env flags
// ─────────────────────────────────────────────────────────────
const env = $('Envs').first().json.env;
const approvalRequired = env.script_approval_required === true || env.script_approval_required === 'true';
const REVIEW_BASE = `https://evermagic.app.n8n.cloud/webhook${env.is_live ? '' : '-test'}/evermagic/review`;

// ─────────────────────────────────────────────────────────────
// 1. Customer Confirmation Email
// ─────────────────────────────────────────────────────────────

const packageLabels = {
  'BASIC': 'Basic (Storybook + Coloring + Certificate)',
  'FULL': 'Full Bundle (Video + PDF + printable)',
  'PARTY': 'Party Pack',
};

const themeLabels = {
  'SPACE_HERO':          'Space Hero Mission',
  'FANTASY_HERO':        'Fantasy Hero Quest',
  'ENCHANTED_PRINCESS':  'Enchanted Princess Adventure',
  'ANIMAL_GUARDIAN':     'Animal Guardian Hero',
  'HOME_HELPER':         'Home Helper Hero',
};

// Shared assets
const branch  = env.is_live ? 'main' : 'develop';
const logoUrl = `https://raw.githubusercontent.com/TarasGolub/evermagic/${branch}/templates/icons/evrm1.png`;

// Inject variables into the fetched confirmation email template
const confirmationTemplate = $('Fetch Confirmation Email Template').first().json.data;

const customerHtml = confirmationTemplate
  .replace(/\{\{logo_url\}\}/g,    logoUrl)
  .replace(/\{\{child_name\}\}/g,  order.child.name)
  .replace(/\{\{order_id\}\}/g,    order.order_id)
  .replace(/\{\{child_age\}\}/g,   String(order.child.age))
  .replace(/\{\{package\}\}/g,     packageLabels[order.package] || order.package)
  .replace(/\{\{theme\}\}/g,       themeLabels[order.theme] || order.theme);

// ─────────────────────────────────────────────────────────────
// 2. Admin Review Email
// ─────────────────────────────────────────────────────────────

const scenesHtml = script.scenes.map(s => `
  <tr><td style="padding:8px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;margin-bottom:8px;">
      <tr><td style="padding:16px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;font-weight:600;">Scene ${s.scene_number} · ${s.emotion || ''}</div>
        <h3 style="margin:4px 0 8px;font-size:16px;color:#111;">${s.scene_title}</h3>
        <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">${s.narration}</p>
        <div style="font-size:12px;color:#9ca3af;line-height:1.5;border-top:1px solid #e5e7eb;padding-top:8px;">
          <strong style="color:#6b7280;">🎬 Visual:</strong> ${s.visual_description}
        </div>
      </td></tr>
    </table>
  </td></tr>`).join('\n');

// Build dynamic blocks for admin email
const reviewStatusLabel = approvalRequired ? 'Script Ready for Review' : 'Script Auto-Approved';

const reviewBadgeHtml = approvalRequired
  ? `<span style="display:inline-block;padding:6px 14px;background:#fef3c7;color:#92400e;font-size:12px;font-weight:600;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;">Needs Review</span>`
  : `<span style="display:inline-block;padding:6px 14px;background:#d1fae5;color:#065f46;font-size:12px;font-weight:600;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;">Auto-Approved ✅</span>`;

const approveUrl = `${REVIEW_BASE}?order_id=${order.order_id}&version=${scriptVersion}&action=approve`;
const retryUrl   = `${REVIEW_BASE}?order_id=${order.order_id}&version=${scriptVersion}&action=retry`;
const editUrl    = `${REVIEW_BASE}?order_id=${order.order_id}&version=${scriptVersion}&action=edit`;

const actionButtonsHtml = approvalRequired ? `
  <tr><td style="padding:16px 32px 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" width="33%" style="padding:0 4px;">
          <a href="${approveUrl}" style="display:block;padding:14px 8px;background:#16a34a;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:8px;text-align:center;">✅ Approve</a>
        </td>
        <td align="center" width="33%" style="padding:0 4px;">
          <a href="${retryUrl}" style="display:block;padding:14px 8px;background:#f59e0b;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:8px;text-align:center;">🔄 Edit &amp; Retry</a>
        </td>
        <td align="center" width="33%" style="padding:0 4px;">
          <a href="${editUrl}" style="display:block;padding:14px 8px;background:#3b82f6;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:8px;text-align:center;">✏️ Manual Edit</a>
        </td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="padding:12px 32px 28px;border-top:1px solid #eee;">
    <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">Click an action above to approve, retry with AI, or manually edit this script.</p>
  </td></tr>` : `
  <tr><td style="padding:16px 32px 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;">
      <tr><td style="padding:16px;text-align:center;">
        <div style="font-size:28px;margin-bottom:8px;">🤖</div>
        <div style="font-size:14px;font-weight:700;color:#065f46;margin-bottom:4px;">Script was auto-approved</div>
        <div style="font-size:13px;color:#6b7280;">Image generation has already started. No action needed.</div>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:12px 32px 28px;border-top:1px solid #eee;">
    <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">This is an FYI notification. Script approval is currently disabled.</p>
  </td></tr>`;

// Inject variables into the fetched admin email template
const adminTemplate = $('Fetch Admin Email Template').first().json.data;

const adminHtml = adminTemplate
  .replace(/\{\{order_id\}\}/g,             order.order_id)
  .replace(/\{\{customer_email\}\}/g,       order.delivery.email)
  .replace(/\{\{package\}\}/g,              packageLabels[order.package] || order.package)
  .replace(/\{\{child_name\}\}/g,           order.child.name)
  .replace(/\{\{child_age\}\}/g,            String(order.child.age))
  .replace(/\{\{theme\}\}/g,                themeLabels[order.theme] || order.theme)
  .replace(/\{\{language\}\}/g,             order.language)
  .replace(/\{\{story_title\}\}/g,          script.title)
  .replace(/\{\{story_tagline\}\}/g,        script.tagline)
  .replace(/\{\{script_version\}\}/g,       String(scriptVersion))
  .replace(/\{\{review_status_label\}\}/g,  reviewStatusLabel)
  .replace(/\{\{review_badge_html\}\}/g,    reviewBadgeHtml)
  .replace(/\{\{action_buttons_html\}\}/g,  actionButtonsHtml)
  .replace(/\{\{scenes_html\}\}/g,          scenesHtml)
  .replace(/\{\{parent_message\}\}/g,       order.parent_message || 'No message provided.');

// ─────────────────────────────────────────────────────────────
// 3. Output both emails as two items
// ─────────────────────────────────────────────────────────────

return [
  {
    json: {
      email_type: 'customer_confirmation',
      to: order.delivery.email,
      subject: `✨ Your magic is being created, ${order.child.name}!`,
      html: customerHtml,
      order_id: order.order_id
    }
  },
  {
    json: {
      email_type: 'admin_review',
      to: 'taras.evermagic@gmail.com',
      subject: `📋 Script Review — ${order.order_id} — ${order.child.name}`,
      html: adminHtml,
      order_id: order.order_id
    }
  }
];
