// n8n Code node — "Build AI Prompt"
// ─────────────────────────────────────────────────────────────
// Placed in "0. EverMagic Error Notifier", AFTER:
//   - 'Fetch Error Email Template'
//   - 'Fetch Manual Review Email Template'
// Feeds into: 'Get AI Recommendation' (HTTP POST → OpenAI)
//
// Deliberately does NOT send the internal generation prompt to OpenAI —
// the customer only submitted a photo, name, age, and hobby, so
// recommendations must stay in those terms only.
// ─────────────────────────────────────────────────────────────

const ctx      = $('Extract Context').first().json;
const orderRow = $('Fetch Order').first().json;

const stage       = ctx.error_stage || 'unknown';
const description = ctx.error_description || ctx.error_message || 'Unknown error';
const childAge    = orderRow.child_age  || '';
const childName   = orderRow.child_name || 'the child';

const stageLabels = {
    image_generation:   'generating the illustrations',
    scenario_expansion: 'writing the story',
    pdf_assembly:       'assembling the book',
    script_generation:  'writing the story outline',
};
const stageLabel = stageLabels[stage] || stage;

let userMsg = `An order failed while ${stageLabel} for a ${childAge}-year-old child named ${childName}.\n\n`;
userMsg += `Error details: ${description}\n`;
userMsg += `\nGive 2–3 short bullet points (starting with •) advising the customer what to check or change before resubmitting. The customer only provided their child's photo, name, age, and hobby — do NOT reference any technical generation details. Focus only on: photo quality, photo content, and how they described their child. Be specific and friendly. Do not use the words "moderation", "safety system", or "content policy" — say "our image guidelines" instead if needed. Output ONLY the bullet points — no intro sentence, no closing sentence, no greeting.`;

return [{
    json: {
        request_body: {
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful customer support assistant for EverMagic, an AI-powered personalised storybook service for children. Help customers resolve order issues with practical, friendly advice.',
                },
                {
                    role: 'user',
                    content: userMsg,
                },
            ],
            max_tokens: 250,
            temperature: 0.4,
        },
    },
}];
