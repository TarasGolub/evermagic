// n8n Code node — "Parse Expansion Response"
// Placed AFTER the OpenAI node in the Scenario Expansion workflow
// Extracts and validates the expanded scenario JSON from GPT-4o output

const aiOutput = $input.first().json;

// ─────────────────────────────────────────────────────────────
// 1. Extract raw text — handle multiple n8n OpenAI node formats
// ─────────────────────────────────────────────────────────────

let rawText;

if (aiOutput.output?.[0]?.content?.[0]?.text) {
    rawText = aiOutput.output[0].content[0].text;
} else if (aiOutput.message?.content) {
    rawText = aiOutput.message.content;
} else if (aiOutput.text) {
    rawText = aiOutput.text;
} else if (typeof aiOutput === 'string') {
    rawText = aiOutput;
} else {
    throw new Error('Unexpected AI output shape: ' + JSON.stringify(Object.keys(aiOutput)));
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

return [{
    json: {
        order_id: context.order_id,
        script_version: context.script_version,
        expanded_content: expanded
    }
}];
