// n8n Code node — "Build Prompt"
// Place BEFORE the OpenAI node.
// Fetches prompt template from GitHub, injects order data, outputs ready prompts.

const order = $('Validate and Transform Order').first().json.order;

// ─────────────────────────────────────────────────────────────
// 1. Fetch system prompt from GitHub (raw)
// ─────────────────────────────────────────────────────────────

const REPO = 'TarasGolub/evermagic';
const BRANCH = 'main';  // change to your deploy branch

// Map theme → prompt folder
const themeMap = {
    'SPACE_HERO': 'space_hero',
};

const themePath = themeMap[order.theme] || 'space_hero';
const promptUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/prompts/${themePath}/system.md`;

const response = await fetch(promptUrl);
if (!response.ok) {
    throw new Error(`Failed to fetch prompt from GitHub: ${response.status} ${response.statusText}`);
}
const systemPrompt = await response.text();

// ─────────────────────────────────────────────────────────────
// 2. Build user prompt from order data
// ─────────────────────────────────────────────────────────────

const child = order.child;

const userPrompt = `Create a personalized story with these details:

**Child:**
- Name: ${child.name}
- Age: ${child.age}
- Gender: ${child.gender}
- Glasses: ${child.glasses ? 'yes' : 'no'}
- Hair color: ${child.hair_color}
- Skin tone: ${child.skin_tone}

**Personality & Interests:**
- Hobby: ${child.hobby}
- Hobby details: ${child.hobby_detail || 'not provided'}
- Signature look: ${child.signature_look || 'not provided'}
- Jersey / lucky number: ${child.jersey_number || 'not provided'}
- Recent achievement: ${child.recent_win || 'not provided'}

**Story Settings:**
- Theme: ${order.theme}
- Hero trait: ${child.hero_trait}
- Language: ${order.language}

**Parent's message (include in final scene):**
${order.parent_message || 'No message provided.'}`;

// ─────────────────────────────────────────────────────────────
// 3. Output
// ─────────────────────────────────────────────────────────────

return [{
    json: {
        system_prompt: systemPrompt,
        user_prompt: userPrompt,
        order_id: order.order_id,
        order: order
    }
}];
