const expansionPrompt = $('Fetch Expansion Prompt').first().json.data;
const script = $('Fetch Scripts to Expand').item.json;
const order = JSON.parse($('Fetch Order Payload').first().json.payload_json);
const child = order.child;

const scriptContent = typeof script.content === 'string'
    ? JSON.parse(script.content)
    : script.content;

const companion = scriptContent.characters?.[0] || {
    name: 'a friendly companion',
    type: 'other',
    appearance: '',
    personality: '',
    connection_to_child: ''
};

const scenesForPrompt = scriptContent.scenes.map(scene => ({
    scene_number: scene.scene_number,
    scene_title: scene.scene_title,
    narration: scene.narration,
    emotion: scene.emotion
}));

const ageReadAloud = child.age <= 5;

// Age-specific reading level guidance — injected as {{reading_level_guidance}}
// Replaces the generic "grade 2-3" line with concrete vocabulary rules per age tier.
// Gives GPT explicit word-choice constraints so it stops defaulting to literary prose.
function getReadingLevelGuidance(age) {
    if (age <= 7) return (
        `- Age ${age} — Grade 1–2 level: very short sentences (5–10 words each). ` +
        `Only words a child this age already knows. ` +
        `Use: "big", "fast", "glowing", "zoomed", "cracked", "laughed". ` +
        `Avoid: "enormous", "vibrant", "luminous", "cascade", "silhouette", "emerged", "beneath". ` +
        `One idea per sentence. Lots of exclamations and short punchy questions.`
    );
    if (age <= 9) return (
        `- Age ${age} — Grade 3–4 level: short-to-medium sentences (8–15 words). ` +
        `Common adventure vocabulary is fine: "glowing", "mysterious", "ancient", "whooshed", "exploded". ` +
        `Avoid adult/literary words: "luminous", "cascade", "silhouette", "ethereal", "emanating", "resplendent". ` +
        `Mix short punchy sentences at exciting moments with slightly longer ones for descriptions.`
    );
    return (
        `- Age ${age} — Grade 4–5 level: varied sentence length for pacing — short bursts at peaks, longer for atmosphere. ` +
        `Adventure vocabulary OK: "ancient", "discovery", "enormous", "vibrating", "mysterious". ` +
        `Still avoid literary/adult prose: "luminous", "cascade", "ethereal", "emanating", "shimmered" (use "glowed"). ` +
        `Use a one-word sentence or fragment for dramatic effect.`
    );
}

const readingLevelGuidance = getReadingLevelGuidance(child.age);

let systemPrompt = expansionPrompt
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
    .replace('{{reading_level_guidance}}', readingLevelGuidance)
    .replace('{{scenes_json}}', JSON.stringify(scenesForPrompt, null, 2));

const readAloudBlock = /\{\{#if age_read_aloud\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/;
systemPrompt = systemPrompt.replace(readAloudBlock, (_, readAloudContent, independentContent) => {
    return ageReadAloud ? readAloudContent.trim() : independentContent.trim();
});

const userPrompt = `Expand the story for ${child.name}, age ${child.age}. The companion is ${companion.name} (${companion.type}). Use the approved script above as your backbone.`;

return [{
    json: {
        system_prompt: systemPrompt,
        user_prompt: userPrompt,
        order_id: script.order_id,
        script_version: script.version
    }
}];
