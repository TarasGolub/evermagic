// n8n Code node — "Build QA Prompt"
// ─────────────────────────────────────────────────────────────
// Placed in "3.1 EverMagic Scenario Expansion", AFTER:
//   - 'Call OpenAI GPT-4o'      (first story generation)
// Also reads (from earlier in the loop):
//   - 'Build Expansion Prompt'  (original context + prompts)
//   - 'Fetch Order Payload'     (child/companion details)
//   - 'Fetch Scripts to Expand' (current script item)
//   - 'Fetch QA Prompt'         (HTTP GET — expansion_qa.md)
// Feeds into: 'QA Check' (HTTP POST → OpenAI)
// ─────────────────────────────────────────────────────────────

// ── Thresholds (tune here without touching logic) ─────────────
const MIN_SCENE_WORDS    = 120;   // scenes shorter than this are flagged
const MAX_SCENE_WORDS    = 175;   // scenes longer than this are flagged
const MAX_SENTENCE_WORDS = 30;    // sentences over this many words are flagged as dense

// ── Context ───────────────────────────────────────────────────
const context    = $('Build Expansion Prompt').first().json;
const qaTemplate = $('Fetch QA Prompt').first().json.data;  // pure rules, no placeholders

// ── 1. Extract generated story text from OpenAI response ──────
const aiOutput = $input.first().json;
let rawStory;
if (aiOutput.choices?.[0]?.message?.content) {
    rawStory = aiOutput.choices[0].message.content;
} else if (aiOutput.output?.[0]?.content?.[0]?.text) {
    rawStory = aiOutput.output[0].content[0].text;
} else if (aiOutput.message?.content) {
    rawStory = aiOutput.message.content;
} else if (aiOutput.text) {
    rawStory = aiOutput.text;
} else {
    rawStory = JSON.stringify(aiOutput);
}

// ── 2. Hard structural validation ────────────────────────────
// Structural failures are fundamentally different from quality issues.
// If the story JSON is broken, skip real QA and force retry immediately.
let story = null;
let storyValid = false;
let hardFail = false;
let hardFailReason = null;

try {
    story = JSON.parse(rawStory);

    if (!story.scenes || !Array.isArray(story.scenes)) {
        hardFail = true;
        hardFailReason = 'Story output is missing the scenes array entirely.';
    } else if (story.scenes.length !== 5) {
        hardFail = true;
        hardFailReason = `Expected 5 scenes, got ${story.scenes.length}.`;
    } else {
        const missingNarrative = story.scenes.find(s => !s.expanded_narrative);
        if (missingNarrative) {
            hardFail = true;
            hardFailReason = `Scene ${missingNarrative.scene_number} is missing expanded_narrative.`;
        } else {
            storyValid = true;
        }
    }
} catch (_) {
    hardFail = true;
    hardFailReason = 'Story output could not be parsed as JSON. The model may have returned malformed output.';
}

// ── Hard fail shortcut — send dummy request, Parse QA Response will intercept ──
if (hardFail) {
    return [{
        json: {
            request_body: {
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: 'Reply with exactly: {"ok":true}' }],
                max_tokens: 10,
                temperature: 0,
            },
            hard_fail:       true,
            hard_fail_reason: hardFailReason,
            story_valid:     false,
            heuristic_flags: [],
            raw_story:       rawStory,
            order_id:        context.order_id,
            script_version:  context.script_version,
        },
    }];
}

// ── 3. Normalize story JSON for consistent QA input ───────────
const normalizedStory = JSON.stringify(story, null, 2);

// ── 4. Heuristic pre-check ────────────────────────────────────
const heuristicFlags = [];

// Word count helpers
function wordCount(text) {
    return text.split(/\s+/).filter(Boolean).length;
}
function sentenceWordCounts(text) {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0).map(s => wordCount(s));
}

for (const scene of story.scenes) {
    const text  = scene.expanded_narrative;
    const words = wordCount(text);
    const sentWords = sentenceWordCounts(text);
    const denseSentences = sentWords.filter(w => w > MAX_SENTENCE_WORDS).length;

    if (words > MAX_SCENE_WORDS) {
        heuristicFlags.push(`Scene ${scene.scene_number}: too long (${words} words, max ${MAX_SCENE_WORDS})`);
    }
    if (words < MIN_SCENE_WORDS) {
        heuristicFlags.push(`Scene ${scene.scene_number}: too short (${words} words, min ${MIN_SCENE_WORDS})`);
    }
    if (scene.scene_number === 1 && denseSentences > 2) {
        heuristicFlags.push(`Scene 1: ${denseSentences} dense sentences (>${MAX_SENTENCE_WORDS} words each) — possible crowding`);
    }
}

// Child name presence (must appear in at least 3 scenes)
const orderPayload  = JSON.parse($('Fetch Order Payload').first().json.payload_json);
const child         = orderPayload.child;
const scriptRow     = $('Fetch Scripts to Expand').item.json;
const scriptContent = typeof scriptRow.content === 'string'
    ? JSON.parse(scriptRow.content)
    : scriptRow.content;
const companion = scriptContent.characters?.[0] || { name: null };

const childNameLower     = (child.name || '').toLowerCase();
const companionNameLower = (companion.name || '').toLowerCase();

if (childNameLower) {
    const scenesWithChild = story.scenes.filter(s =>
        s.expanded_narrative.toLowerCase().includes(childNameLower)
    ).length;
    if (scenesWithChild < 3) {
        heuristicFlags.push(`Child name "${child.name}" appears in only ${scenesWithChild}/5 scenes`);
    }
}

if (companionNameLower) {
    const scenesWithCompanion = story.scenes.filter(s =>
        s.expanded_narrative.toLowerCase().includes(companionNameLower)
    ).length;
    if (scenesWithCompanion < 3) {
        heuristicFlags.push(`Companion "${companion.name}" appears in only ${scenesWithCompanion}/5 scenes`);
    }
}

// ── 5. Build user message (child context + story) ─────────────
const heuristicBlock = heuristicFlags.length > 0
    ? `\n\nAUTOMATED PRE-CHECK FLAGS (treat as additional evidence when scoring):\n${heuristicFlags.map(f => `• ${f}`).join('\n')}`
    : '';

const userMessage =
`## Story to evaluate

- Child name: ${child.name       || '(not provided)'}
- Child age:  ${child.age        || '(not provided)'}
- Hobby:      ${child.hobby      || '(not provided)'}
- Recent win: ${child.recent_win || '(not provided)'}
- Companion:  ${companion.name   || '(not defined in script)'}

${normalizedStory}${heuristicBlock}

Evaluate the story. Return only the JSON assessment.`;

return [{
    json: {
        request_body: {
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: qaTemplate },
                { role: 'user',   content: userMessage },
            ],
            max_tokens:  600,
            temperature: 0.1,
        },
        hard_fail:       false,
        story_valid:     storyValid,
        raw_story:       rawStory,
        heuristic_flags: heuristicFlags,
        order_id:        context.order_id,
        script_version:  context.script_version,
    },
}];
