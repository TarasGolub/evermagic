// n8n Code node — "Build Emails"
// Place AFTER "Parse Script" node
// Outputs TWO items: [0] = customer email, [1] = admin email
// Then use a Send Email node for each (or split with IF)

const order = $('Validate and Transform Order').first().json.order;
const script = $('Parse Script').first().json.script;

// ─────────────────────────────────────────────────────────────
// 1. Customer Confirmation Email
// ─────────────────────────────────────────────────────────────

const packageLabels = {
    'BASIC': 'Basic (PDF + printable)',
    'FULL': 'Full Bundle (Video + PDF + printable)',
    'PARTY': 'Party Pack',
};

const themeLabels = {
    'SPACE_HERO': 'Space Hero Mission',
};

const customerHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0f0f1a;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f1a;">
<tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:16px;overflow:hidden;">
  <tr><td align="center" style="padding:40px 40px 20px;">
    <div style="font-size:48px;line-height:1;">✨</div>
    <h1 style="margin:16px 0 0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Your Magic Is Being Created!</h1>
  </td></tr>
  <tr><td style="padding:20px 40px;">
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#c4c4d4;">Hi there! 👋</p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#c4c4d4;">
      We've received your order and our magic machines are already working on
      <strong style="color:#ffffff;">${order.child.name}</strong>'s personalized adventure!
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.06);border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
      <tr><td style="padding:24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#8b8ba3;padding-bottom:12px;">Order Details</td></tr>
          <tr><td>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:14px;color:#8b8ba3;padding:6px 0;">Order No.</td>
                <td align="right" style="font-size:14px;color:#ffffff;font-weight:600;font-family:monospace;padding:6px 0;">${order.order_id}</td>
              </tr>
              <tr>
                <td style="font-size:14px;color:#8b8ba3;padding:6px 0;">Hero</td>
                <td align="right" style="font-size:14px;color:#ffffff;padding:6px 0;">${order.child.name}, age ${order.child.age}</td>
              </tr>
              <tr>
                <td style="font-size:14px;color:#8b8ba3;padding:6px 0;">Package</td>
                <td align="right" style="font-size:14px;color:#ffffff;padding:6px 0;">${packageLabels[order.package] || order.package}</td>
              </tr>
              <tr>
                <td style="font-size:14px;color:#8b8ba3;padding:6px 0;">Theme</td>
                <td align="right" style="font-size:14px;color:#ffffff;padding:6px 0;">${themeLabels[order.theme] || order.theme}</td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
      <tr><td align="center" style="padding:20px;background:rgba(139,92,246,0.1);border-radius:12px;border:1px solid rgba(139,92,246,0.2);">
        <div style="font-size:13px;text-transform:uppercase;letter-spacing:1.5px;color:#a78bfa;margin-bottom:8px;">Estimated Delivery</div>
        <div style="font-size:22px;font-weight:700;color:#ffffff;">⏱ ~15 minutes</div>
        <div style="font-size:13px;color:#8b8ba3;margin-top:4px;">We'll email you when it's ready!</div>
      </td></tr>
    </table>
    <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#8b8ba3;text-align:center;">Sit back and relax — the magic is happening! 🚀</p>
  </td></tr>
  <tr><td align="center" style="padding:24px 40px 32px;border-top:1px solid rgba(255,255,255,0.06);">
    <p style="margin:0;font-size:13px;color:#5a5a7a;">Made with ❤️ by <strong style="color:#8b8ba3;">EverMagic</strong></p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;

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

const adminHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8f9fa;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
  <tr><td style="padding:28px 32px 16px;border-bottom:1px solid #eee;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <span style="font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#6b7280;font-weight:600;">⚡ EverMagic Admin</span>
          <h1 style="margin:8px 0 0;font-size:22px;color:#111;font-weight:700;">Script Ready for Review</h1>
        </td>
        <td align="right" style="vertical-align:top;">
          <span style="display:inline-block;padding:6px 14px;background:#fef3c7;color:#92400e;font-size:12px;font-weight:600;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;">Needs Review</span>
        </td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="padding:24px 32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
      <tr><td style="padding:16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;">
          <tr>
            <td style="color:#6b7280;padding:3px 8px;">Order</td>
            <td style="color:#111;font-weight:600;font-family:monospace;">${order.order_id}</td>
            <td style="color:#6b7280;padding:3px 8px;">Package</td>
            <td style="color:#111;font-weight:600;">${packageLabels[order.package] || order.package}</td>
          </tr>
          <tr>
            <td style="color:#6b7280;padding:3px 8px;">Hero</td>
            <td style="color:#111;font-weight:600;">${order.child.name} (${order.child.age})</td>
            <td style="color:#6b7280;padding:3px 8px;">Theme</td>
            <td style="color:#111;font-weight:600;">${themeLabels[order.theme] || order.theme}</td>
          </tr>
          <tr>
            <td style="color:#6b7280;padding:3px 8px;">Trait</td>
            <td style="color:#111;font-weight:600;">${order.child.hero_trait}</td>
            <td style="color:#6b7280;padding:3px 8px;">Language</td>
            <td style="color:#111;font-weight:600;">${order.language}</td>
          </tr>
        </table>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:8px 32px 16px;">
    <h2 style="margin:0;font-size:20px;color:#111;">📖 ${script.title}</h2>
    <p style="margin:4px 0 0;font-size:14px;color:#6b7280;font-style:italic;">${script.tagline}</p>
  </td></tr>
  ${scenesHtml}
  <tr><td style="padding:8px 32px 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;">
      <tr><td style="padding:16px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#16a34a;font-weight:600;margin-bottom:6px;">💚 Parent's Message</div>
        <div style="font-size:14px;color:#166534;line-height:1.5;">${order.parent_message || 'No message provided.'}</div>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:20px 32px 28px;border-top:1px solid #eee;">
    <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">Reply to this email to request changes or approve the script.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;

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
