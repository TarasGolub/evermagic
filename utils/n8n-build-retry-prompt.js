// n8n Code node — "Build Retry Prompt"
// ─────────────────────────────────────────────────────────────
// Placed in "3.1 EverMagic Scenario Expansion", AFTER:
//   - IF node (retry_required = true branch)
// Also reads:
//   - 'Build Expansion Prompt' (original system + user prompts)
//   - 'Parse QA Response'      (score, failed rules, retry instructions)
// Feeds into: 'Retry GPT-4o' (second story generation call)
// ─────────────────────────────────────────────────────────────

const originalContext = $('Build Expansion Prompt').first().json;
const qaResult        = $('Parse QA Response').first().json;

// ── Build failed rules text ────────────────────────────────────
const failedRulesText = (qaResult.failed_rules || [])
    .map(f => `• ${f.rule}: ${f.issue}`)
    .join('\n') || 'See revision instructions below.';

const heuristicText = (qaResult.heuristic_flags || []).length > 0
    ? `\nAuto-detected structural issues:\n${qaResult.heuristic_flags.map(f => `• ${f}`).join('\n')}\n`
    : '';

// ── Append QA feedback block to the original system prompt ────
const feedbackBlock = `

---

## Quality Control Feedback — Revision Required

This story was evaluated and scored ${qaResult.score}/10. Minimum required: 8.
${heuristicText}
Rules that failed:
${failedRulesText}

## Revision Instructions

${qaResult.retry_instructions}

---

Rewrite the ENTIRE story following ALL original rules above PLUS all revision instructions.
Do NOT reuse sentences from the previous attempt — start fresh.
Return the same JSON structure. No markdown fences. No commentary. Only the JSON.`;

return [{
    json: {
        request_body: {
            model: 'gpt-4o',
            messages: [
                {
                    role:    'system',
                    content: originalContext.system_prompt + feedbackBlock,
                },
                {
                    role:    'user',
                    content: originalContext.user_prompt,
                },
            ],
            max_tokens:  4000,
            temperature: 0.75,
        },
        order_id:       qaResult.order_id,
        script_version: qaResult.script_version,
        qa_score:       qaResult.score,
    },
}];
