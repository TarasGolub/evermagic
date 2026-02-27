// n8n Code node — "Build Prompt"
// Placed AFTER the "Fetch Prompt" HTTP Request node
// Combines the system prompt (from GitHub) with order data (from Transform node)

// ─────────────────────────────────────────────────────────────
// 1. Get system prompt from the HTTP Request node output
// ─────────────────────────────────────────────────────────────

const systemPrompt = $('Fetch Prompt').first().json.data;

// ─────────────────────────────────────────────────────────────
// 2. Get order from the Transform node
// ─────────────────────────────────────────────────────────────

const order = $('Validate and Transform Order').first().json.order;
const child = order.child;

// ─────────────────────────────────────────────────────────────
// 3. Build user prompt from order data
// ─────────────────────────────────────────────────────────────

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
// 4. Output — ready for OpenAI node
// ─────────────────────────────────────────────────────────────

return [{
    json: {
        system_prompt: systemPrompt,
        user_prompt: userPrompt,
        order_id: order.order_id,
        order: order
    }
}];
