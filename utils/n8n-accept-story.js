// n8n Code node — "Accept Story"
// ─────────────────────────────────────────────────────────────
// Placed in "3.1 EverMagic Scenario Expansion" on the QA PASS path:
//   IF retry_required = FALSE → this node
// Reads:
//   - 'Parse QA Response' (raw_story, score, order_id, script_version)
// Returns the same shape as 'Parse Expansion Response' so both
// branches can feed identical Save + Update Status nodes.
// ─────────────────────────────────────────────────────────────

const qaResult = $('Parse QA Response').first().json;

const expanded = JSON.parse(qaResult.raw_story);

if (!expanded.scenes || expanded.scenes.length !== 5) {
    throw new Error(`Expected 5 scenes, got ${expanded.scenes?.length ?? 0}`);
}

return [{
    json: {
        order_id:         qaResult.order_id,
        script_version:   qaResult.script_version,
        expanded_content: expanded,
        qa_score:         qaResult.score,
        qa_score_retry:   null,   // no retry was needed
    },
}];
