// n8n Code node — "Build Delivery"
// Placed AFTER the PDFShift loop (all 3 PDFs assembled and stored in Supabase)
//
// Inputs expected (from prior nodes):
//   - 'Fetch Order Payload'  → order JSON
//   - 'Fetch Script'         → script row (for story title)
//   - 'Fetch PDFs'           → rows from pdfs table (or pass pdf URLs directly)
//   - 'Fetch Delivery Email Template' → raw HTML string (from GitHub fetch)
//   - 'Envs'                 → env config
//
// Outputs (one item):
//   {
//     order_id, child_name, child_email,
//     customer_email_html,  ← send to customer
//     customer_email_subject,
//     admin_email_html,     ← send to admin
//     admin_email_subject,
//   }

// ─────────────────────────────────────────────────────────────
// 1. Gather inputs
// ─────────────────────────────────────────────────────────────

const order = JSON.parse($('Fetch Order Payload').first().json.payload_json);
const child = order.child;

const scriptRow = $('Fetch Script').first().json;
const scriptContent = typeof scriptRow.content === 'string'
    ? JSON.parse(scriptRow.content)
    : scriptRow.content;

const env = $('Envs').first().json.env;

// Supabase public storage base URL — store this in envs table as 'supabase_storage_url'
// e.g. https://YOURPROJECT.supabase.co/storage/v1/object/public
const storageBase = env.supabase_storage_url || '';
const bucket = env.storage_bucket || 'downloads';

// PDF public URLs — constructed from known storage paths
const pdfBase = `${storageBase}/${bucket}/pdfs/${order.order_id}`;
const storybookUrl    = `${pdfBase}/storybook.pdf`;
const coloringBookUrl = `${pdfBase}/coloring_book.pdf`;
const certificateUrl  = `${pdfBase}/certificate.pdf`;

// Story title
const storyTitle = scriptContent.title || `${child.name}'s Space Adventure`;

// Thank-you message shown on page and in email
const thankYouMessage = `Your story is here — all three files are ready to save and treasure. `
    + `We hope ${child.name} loves every moment of the adventure! 🚀`;

// ─────────────────────────────────────────────────────────────
// 2. Populate templates
// ─────────────────────────────────────────────────────────────

const emailVars = {
    'child_name':          child.name,
    'story_title':         storyTitle,
    'thank_you_message':   thankYouMessage,
    'storybook_url':       storybookUrl,
    'coloring_book_url':   coloringBookUrl,
    'certificate_url':     certificateUrl,
};

function injectVars(html, vars) {
    let result = html;
    for (const [key, value] of Object.entries(vars)) {
        const regex = new RegExp(`\\{\\{${key.replace(/\./g, '\\.')}\\}\\}`, 'g');
        result = result.replace(regex, value);
    }
    return result;
}

const emailTemplate     = $('Fetch Delivery Email Template').first().json.data;
const customerEmailHtml = injectVars(emailTemplate, emailVars);

// ─────────────────────────────────────────────────────────────
// 3. Admin notification (plain HTML — no separate template needed)
// ─────────────────────────────────────────────────────────────

const adminEmailHtml = `
<div style="font-family:monospace; padding:20px;">
  <h2>✅ Order Delivered — ${order.order_id}</h2>
  <p><strong>Child:</strong> ${child.name}, age ${child.age}</p>
  <p><strong>Story:</strong> ${storyTitle}</p>
  <p><strong>Customer email:</strong> ${order.delivery.email}</p>
  <hr>
  <p>PDFs:<br>
    📖 <a href="${storybookUrl}">Storybook</a><br>
    🎨 <a href="${coloringBookUrl}">Coloring Book</a><br>
    🏅 <a href="${certificateUrl}">Certificate</a>
  </p>
</div>
`.trim();

// ─────────────────────────────────────────────────────────────
// 4. Return
// ─────────────────────────────────────────────────────────────

return [{
    json: {
        order_id:               order.order_id,
        child_name:             child.name,
        child_email:            order.delivery.email,

        customer_email_html:    customerEmailHtml,
        customer_email_subject: `✨ ${child.name}'s magic is ready — download your files!`,

        admin_email_html:       adminEmailHtml,
        admin_email_subject:    `✅ Delivered — ${order.order_id} — ${child.name}`,
    }
}];
