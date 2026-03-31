// n8n Code node — "Parse QA Response"
// ─────────────────────────────────────────────────────────────
// Placed in "3.1 EverMagic Scenario Expansion", AFTER:
//   - 'QA Check' (OpenAI GPT-4o-mini evaluation)
// Also reads:
//   - 'Build QA Prompt' (heuristic flags + raw story + context)
// Feeds into: IF node on 'retry_required'
// ─────────────────────────────────────────────────────────────

const qaContext = $('Build QA Prompt').first().json;

// ── Hard structural failure — short-circuit, no QA needed ─────
if (qaContext.hard_fail === true) {
    return [{
        json: {
            retry_required:     true,
            score:              0,
            effective_score:    0,
            failed_rules:       [{ rule: 'Structure', issue: qaContext.hard_fail_reason }],
            passed_rules:       [],
            retry_instructions: `The story output was structurally invalid: ${qaContext.hard_fail_reason} Regenerate the full story following all output format rules exactly — valid JSON, exactly 5 scenes, each with an expanded_narrative field.`,
            heuristic_flags:    qaContext.heuristic_flags,
            raw_story:          qaContext.raw_story || null,
            order_id:           qaContext.order_id,
            script_version:     qaContext.script_version,
        },
    }];
}

const aiOutput  = $input.first().json;

// ── Extract text from OpenAI response ─────────────────────────
let rawText;
if (aiOutput.choices?.[0]?.message?.content) {
    // Standard OpenAI HTTP API response (used by HTTP Request node)
    rawText = aiOutput.choices[0].message.content;
} else if (aiOutput.output?.[0]?.content?.[0]?.text) {
    // LangChain OpenAI node format
    rawText = aiOutput.output[0].content[0].text;
} else if (aiOutput.message?.content) {
    rawText = aiOutput.message.content;
} else if (aiOutput.text) {
    rawText = aiOutput.text;
} else {
    rawText = JSON.stringify(aiOutput);
}

// Strip markdown fences if model wraps output despite instructions
const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i,     '')
    .replace(/```\s*$/,      '')
    .trim();

// ── Parse QA JSON ──────────────────────────────────────────────
let qa;
try {
    qa = JSON.parse(cleaned);
} catch (_) {
    // QA response malformed — pass through without retry to avoid blocking the pipeline
    return [{
        json: {
            retry_required:     false,
            score:              null,
            effective_score:    null,
            failed_rules:       [],
            passed_rules:       [],
            retry_instructions: null,
            qa_parse_error:     true,
            heuristic_flags:    qaContext.heuristic_flags,
            raw_story:          qaContext.raw_story,
            order_id:           qaContext.order_id,
            script_version:     qaContext.script_version,
        },
    }];
}

// ── Effective score: multiple heuristic flags push borderline scores down ──
const heuristicCount = (qaContext.heuristic_flags || []).length;
const effectiveScore = heuristicCount >= 2 ? Math.min(qa.score, 7) : qa.score;
const retryRequired  = qa.retry_required === true || effectiveScore < 8;

return [{
    json: {
        retry_required:     retryRequired,
        score:              qa.score,
        effective_score:    effectiveScore,
        failed_rules:       qa.failed_rules    || [],
        passed_rules:       qa.passed_rules    || [],
        retry_instructions: qa.retry_instructions || null,
        heuristic_flags:    qaContext.heuristic_flags,
        raw_story:          qaContext.raw_story,
        order_id:           qaContext.order_id,
        script_version:     qaContext.script_version,
    },
}];
