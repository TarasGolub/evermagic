// n8n Code node — "Build Error Handler"
// ─────────────────────────────────────────────────────────────
// Placed in "0. EverMagic Error Notifier", AFTER:
//   - 'Extract Context'               (reads error trigger + execution log)
//   - 'Fetch Order'                   (Supabase — orders table)
//   - 'Fetch Error Email Template'    (HTTP GET — customer-error-retry.html)
//   - 'Fetch Manual Review Email Template' (HTTP GET — customer-error-manual-review.html)
//   - 'Get AI Recommendation'         (OpenAI chat completions)
//   - 'Envs'                          (Supabase envs)
// ─────────────────────────────────────────────────────────────

const ctx      = $('Extract Context').first().json;
const env      = $('Envs').first().json.env;
const orderRow = $('Fetch Order').first().json;

const orderId          = ctx.order_id;
const errorStage       = ctx.error_stage;
const errorMessage     = ctx.error_message;
const errorDescription = ctx.error_description || errorMessage;
const requestPrompt    = ctx.request_prompt;
const customerEmail    = orderRow.email      || '';
const childName        = orderRow.child_name || 'your child';

const retryCount = orderRow.retry_count ?? 0;
const isRetry    = orderRow.is_retry    ?? false;

// Allow ONE retry: only on original (non-retry) orders with no prior retry issued
const canRetry = !isRetry && retryCount === 0;

// ── AI recommendation ─────────────────────────────────────────
let aiRecommendation = null;
try {
    const aiResponse = $('Get AI Recommendation').first().json;
    aiRecommendation = aiResponse.choices?.[0]?.message?.content?.trim() || null;
} catch (_) {}

// ── Retry token + URL ─────────────────────────────────────────
function generateToken() {
    return 'EVRM-' + Array.from({ length: 8 }, () =>
        Math.floor(Math.random() * 16).toString(16).toUpperCase()
    ).join('');
}
const newToken  = canRetry ? generateToken() : null;
const tallyBase = env.tally_form_url || '';
const retryUrl  = canRetry && tallyBase ? `${tallyBase}?token=${newToken}` : null;

// ── Stage label ───────────────────────────────────────────────
const stageLabels = {
    script_generation:  'writing your story outline',
    image_generation:   'generating the illustrations',
    scenario_expansion: 'writing the full story',
    pdf_assembly:       'assembling the book',
};
const errorStageLabel = stageLabels[errorStage] || 'creating your book';

// ── Retry section HTML (injected into retry template only) ────
const contactNote = `<p style="margin:16px 0 0; font-size:13px; line-height:1.6; color:#b0b0cc !important;">If the issue repeats after resubmitting, just reply to this email — we'll take it from there.</p>`;

const retrySection = `<tr><td style="padding:0 40px 28px; background-color:#16213e !important;"><p style="margin:0 0 20px; font-size:16px; line-height:1.6; color:#e8e8f5 !important;"><strong style="color:#ffffff !important;">Good news — you can try again.</strong> We've prepared a fresh personalisation link just for you. Once you've checked the tips above, click below to resubmit:</p><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:8px; background-color:#7c3aed !important;"><a href="${retryUrl}" style="display:inline-block; padding:14px 32px; font-size:15px; font-weight:700; color:#ffffff !important; text-decoration:none;">Try Again &rarr;</a></td></tr></table><p style="margin:16px 0 0; font-size:13px; color:#8b8ba3 !important;">This link is single-use and valid for your resubmission only.</p>${contactNote}</td></tr>`;

// ── AI recommendation section HTML ────────────────────────────
let aiRecommendationSection = '';
if (aiRecommendation) {
    const bulletHtml = aiRecommendation
        .split('\n')
        .filter(line => line.trim())
        .map(line => `<p style="margin:6px 0; font-size:14px; line-height:1.5; color:#e8e8f5 !important;">${line.trim()}</p>`)
        .join('');

    aiRecommendationSection = `
          <tr>
            <td style="padding:0 40px 28px; background-color:#16213e !important;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d2218 !important; border-radius:12px; border:1px solid #1a4a2e;">
                <tr>
                  <td style="padding:20px 24px;">
                    <div style="font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1.2px; color:#4ade80 !important; margin-bottom:12px;">🤖 AI Assistant Tip</div>
                    <p style="margin:0 0 12px; font-size:14px; line-height:1.5; color:#e8e8f5 !important;">Based on the error details, our AI helper suggests paying attention to:</p>
                    ${bulletHtml}
                    <p style="margin:14px 0 0; font-size:12px; color:#6b8c7a !important; font-style:italic;">This is an AI-generated suggestion and may not perfectly apply to your specific case.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

// ── Pick template + populate ──────────────────────────────────
const emailTpl = canRetry
    ? $('Fetch Error Email Template').first().json.data
    : $('Fetch Manual Review Email Template').first().json.data;

const branch  = env.is_live ? 'main' : 'develop';
const logoUrl = `https://raw.githubusercontent.com/TarasGolub/evermagic/${branch}/templates/icons/logo_email.png`;

function injectVars(html, vars) {
    let result = html;
    for (const [key, value] of Object.entries(vars)) {
        const regex = new RegExp(`\\{\\{${key.replace(/\./g, '\\.')}\\}\\}`, 'g');
        result = result.replace(regex, value ?? '');
    }
    return result;
}

const templateVars = {
    logo_url:                  logoUrl,
    child_name:                childName,
    error_stage_label:         errorStageLabel,
    order_id:                  orderId,
    ai_recommendation_section: aiRecommendationSection,
};
// retry_section only exists in the retry template
if (canRetry) {
    templateVars.retry_section = retrySection;
}

const customerEmailHtml = injectVars(emailTpl, templateVars);

const customerEmailSubject = canRetry
    ? `Action needed — resubmit ${childName}'s story details`
    : `Update on ${childName}'s EverMagic order`;

// ── Admin email ───────────────────────────────────────────────
const newOrderStatus = canRetry ? 'error_retrying' : 'error_admin_review';

const promptSnippet = requestPrompt
    ? `<p><strong>Prompt sent:</strong> <em>${requestPrompt.substring(0, 300)}${requestPrompt.length > 300 ? '…' : ''}</em></p>`
    : '';

const aiAdminBlock = aiRecommendation
    ? `<p><strong>AI recommendation:</strong><br>${aiRecommendation.replace(/\n/g, '<br>')}</p>`
    : '';

const adminEmailHtml = `<div style="font-family:monospace; padding:20px;">
  <h2>${canRetry ? '🔁' : '🚨'} Workflow Error — ${ctx.workflow_name}</h2>
  <p><strong>Order:</strong> ${orderId}</p>
  <p><strong>Child:</strong> ${childName}</p>
  <p><strong>Customer:</strong> ${customerEmail}</p>
  <p><strong>Stage:</strong> ${errorStage}</p>
  <p><strong>Last node:</strong> ${ctx.last_node}</p>
  <p><strong>New status:</strong> ${newOrderStatus}</p>
  <p><strong>Retry issued:</strong> ${canRetry ? `Yes — token: ${newToken}` : 'No'}</p>
  <hr>
  <p><strong>Error message:</strong> ${errorMessage}</p>
  <p><strong>Error description:</strong> ${errorDescription}</p>
  ${promptSnippet}
  ${aiAdminBlock}
  <hr>
  <p><a href="${ctx.execution_url}">View execution in n8n →</a></p>
</div>`;

const adminEmailSubject = canRetry
    ? `🔁 Retry issued — ${orderId} — ${childName}`
    : `🚨 Manual review — ${orderId} — ${childName}`;

// ── Return ────────────────────────────────────────────────────
return [{
    json: {
        can_retry:              canRetry,
        new_token:              newToken,
        new_order_status:       newOrderStatus,
        customer_email:         customerEmail,
        customer_email_html:    customerEmailHtml,
        customer_email_subject: customerEmailSubject,
        admin_email_html:       adminEmailHtml,
        admin_email_subject:    adminEmailSubject,
        order_id:               orderId,
        error_stage:            errorStage,
        error_message:          errorMessage,
        retry_count:            retryCount,
    },
}];
