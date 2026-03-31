// n8n Code node — "Parse Expansion Response"
// Placed AFTER the OpenAI node in the Scenario Expansion workflow
// Extracts and validates the expanded scenario JSON from GPT-4o output

// ─────────────────────────────────────────────────────────────
// 1. Pick the better story — original vs retry
// ─────────────────────────────────────────────────────────────

const firstScore = $('Parse QA Response').first().json.score  ?? 0;
const retryScore = $('Parse QA Response 2').first().json.score ?? 0;
const useRetry   = retryScore > firstScore;

let rawText;
if (useRetry) {
    // Retry scored higher — use it
    rawText = $('Retry GPT-4o').first().json.choices[0].message.content;
} else {
    // Original was equal or better — use it
    rawText = $('Parse QA Response').first().json.raw_story;
}

// ─────────────────────────────────────────────────────────────
// 2. Parse JSON
// ─────────────────────────────────────────────────────────────

const expanded = JSON.parse(rawText);

// ─────────────────────────────────────────────────────────────
// 3. Validate structure
// ─────────────────────────────────────────────────────────────

if (!expanded.scenes || expanded.scenes.length !== 5) {
    throw new Error(`Expected 5 scenes, got ${expanded.scenes?.length ?? 0}`);
}

for (const scene of expanded.scenes) {
    if (!scene.expanded_narrative) {
        throw new Error(`Scene ${scene.scene_number} is missing expanded_narrative`);
    }
}

// ─────────────────────────────────────────────────────────────
// 4. Pass through with context from Build Expansion Prompt node
// ─────────────────────────────────────────────────────────────

const context = $('Build Expansion Prompt').first().json;

// qa_score = first attempt score (from Build Retry Prompt context)
// qa_score_retry = second attempt score (from Parse QA Response 2, after retry)
let qaScore = null;
let qaScoreRetry = null;
try { qaScore      = $('Build Retry Prompt').first().json.qa_score         ?? null; } catch (_) {}
try { qaScoreRetry = $('Parse QA Response 2').first().json.score           ?? null; } catch (_) {}

return [{
    json: {
        order_id:         context.order_id,
        script_version:   context.script_version,
        expanded_content: expanded,
        qa_score:         qaScore,
        qa_score_retry:   qaScoreRetry,
    }
}];
