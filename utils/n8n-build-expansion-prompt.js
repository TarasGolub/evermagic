// n8n Code node — "Build Expansion Prompt"
// Placed AFTER the "Fetch Expansion Prompt" HTTP Request node
// Combines the expansion prompt template with approved script + order data

// ─────────────────────────────────────────────────────────────
// 1. Get expansion prompt template from GitHub
// ─────────────────────────────────────────────────────────────

const expansionPrompt = $('Fetch Expansion Prompt').first().json.data;

// ─────────────────────────────────────────────────────────────
// 2. Get approved script and order payload
// ─────────────────────────────────────────────────────────────

const script = $('Fetch Approved Script').first().json;
const order = $('Fetch Order Payload').first().json.payload_json;
const child = order.child;

// ─────────────────────────────────────────────────────────────
// 3. Extract companion from script characters array
// ─────────────────────────────────────────────────────────────

const scriptContent = typeof script.content === 'string'
    ? JSON.parse(script.content)
    : script.content;

const companion = scriptContent.characters && scriptContent.characters[0]
    ? scriptContent.characters[0]
    : { name: 'unknown', type: 'unknown', appearance: '', personality: '', connection_to_child: '' };

// ─────────────────────────────────────────────────────────────
// 4. Build scenes JSON string for injection into prompt
// ─────────────────────────────────────────────────────────────

const scenesForPrompt = scriptContent.scenes.map(scene => ({
    scene_number: scene.scene_number,
    scene_title: scene.scene_title,
    narration: scene.narration,
    emotion: scene.emotion
}));

// ─────────────────────────────────────────────────────────────
// 5. Build system prompt — inject all variables into template
// ─────────────────────────────────────────────────────────────

const ageReadAloud = child.age <= 5;

const systemPrompt = expansionPrompt
    .replace('{{child.age}}', child.age)
    .replace('{{child.name}}', child.name)
    .replace('{{child.hero_trait}}', child.hero_trait)
    .replace('{{child.hobby}}', child.hobby)
    .replace('{{child.hobby_detail}}', child.hobby_detail || 'not provided')
    .replace('{{child.signature_look}}', child.signature_look || 'not provided')
    .replace('{{child.recent_win}}', child.recent_win || 'not provided')
    .replace('{{companion.name}}', companion.name)
    .replace('{{companion.type}}', companion.type)
    .replace('{{companion.appearance}}', companion.appearance)
    .replace('{{companion.personality}}', companion.personality)
    .replace('{{companion.connection_to_child}}', companion.connection_to_child)
    .replace('{{scenes_json}}', JSON.stringify(scenesForPrompt, null, 2))
    .replace(
        '{{#if age_read_aloud}}\nThis story will be **read aloud by a parent**',
        ageReadAloud
            ? 'This story will be **read aloud by a parent**'
            : '{{SKIP_READ_ALOUD}}'
    )
    .replace(
        '{{else}}\nThis story will be **read independently by the child**',
        !ageReadAloud
            ? 'This story will be **read independently by the child**'
            : '{{SKIP_INDEPENDENT}}'
    )
    // Clean up conditional block markers
    .replace(/\{\{#if age_read_aloud\}\}/g, '')
    .replace(/\{\{else\}\}/g, '')
    .replace(/\{\{\/if\}\}/g, '')
    .replace(/\{\{SKIP_READ_ALOUD\}\}[\s\S]*?\{\{SKIP_INDEPENDENT\}\}/g, '')
    .replace(/\{\{SKIP_INDEPENDENT\}\}[\s\S]*?(?=\n##|\n$|$)/g, '')
    .replace(/\{\{SKIP_READ_ALOUD\}\}/g, '')
    .replace(/\{\{SKIP_INDEPENDENT\}\}/g, '');

// ─────────────────────────────────────────────────────────────
// 6. Build user prompt
// ─────────────────────────────────────────────────────────────

const userPrompt = `Expand the story for ${child.name}, age ${child.age}. The companion is ${companion.name} (${companion.type}). Use the approved script above as your backbone.`;

// ─────────────────────────────────────────────────────────────
// 7. Output — ready for OpenAI node
// ─────────────────────────────────────────────────────────────

return [{
    json: {
        system_prompt: systemPrompt,
        user_prompt: userPrompt,
        order_id: script.order_id,
        script_version: script.version
    }
}];
