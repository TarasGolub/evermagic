// n8n Code node — "Build PDF HTML"
// Placed AFTER "Fetch PDF Template" HTTP Request node
// Injects order/script/image data into an HTML template string
// Returns one item per PDF type — feeds into the PDFShift loop

// ─────────────────────────────────────────────────────────────
// 1. Gather inputs
// ─────────────────────────────────────────────────────────────

const order       = JSON.parse($('Fetch Order Payload').first().json.payload_json);
const child       = order.child;

const scriptRow   = $('Fetch Script').first().json;
const scriptContent = typeof scriptRow.content === 'string'
    ? JSON.parse(scriptRow.content)
    : scriptRow.content;

const expandedContent = typeof scriptRow.expanded_content === 'string'
    ? JSON.parse(scriptRow.expanded_content)
    : scriptRow.expanded_content;

// Images: build a map of image_type → file_url
const imageRows = $('Fetch Images').all();
const images = {};
for (const row of imageRows) {
    images[row.json.image_type] = row.json.file_url;
}

const env = $('Envs').first().json.env;
const qrCodeUrl = env.qr_code_url || '';

// ─────────────────────────────────────────────────────────────
// 2. Build variable map
// ─────────────────────────────────────────────────────────────

// Per-scene text: use expanded_content if available, fall back to narration
function sceneText(sceneNumber) {
    if (expandedContent && expandedContent.scenes) {
        const expanded = expandedContent.scenes.find(s => s.scene_number === sceneNumber);
        if (expanded && expanded.expanded_narrative) return expanded.expanded_narrative;
    }
    const scene = scriptContent.scenes.find(s => s.scene_number === sceneNumber);
    return scene ? scene.narration : '';
}

function sceneTitle(sceneNumber) {
    const scene = scriptContent.scenes.find(s => s.scene_number === sceneNumber);
    return scene ? scene.scene_title : '';
}

// Hero trait → capitalised title for certificate
const heroTraitTitle = child.hero_trait
    ? child.hero_trait.charAt(0).toUpperCase() + child.hero_trait.slice(1)
    : 'Courage';

// Certificate citation — hobby-aware
const citation = `In recognition of extraordinary ${child.hero_trait || 'courage'}, curiosity of mind, and strength of heart — `
    + `demonstrated throughout the Space Hero Mission, where ${child.name} used knowledge, `
    + `courage, and the remarkable power of ${child.hobby ? child.hobby.toLowerCase() : 'imagination'} `
    + `to save an entire constellation and bring light back to the universe.`;

const today = new Date();
const awardDate = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const vars = {
    // Story
    'story.title':          scriptContent.title || '',
    'story.tagline':        scriptContent.tagline || '',
    'closing_message':      scriptContent.closing_message || '',
    'parent_message':       order.parent_message || '',

    // Child
    'child.name':           child.name,
    'child.age':            String(child.age),
    'child.hero_trait':     child.hero_trait || '',
    'child.hobby':          child.hobby || '',

    // Order
    'order.order_id':       order.order_id,
    'qr_code_url':          qrCodeUrl,

    // Images — scene images
    'cover.image_url':      images['cover']    || '',
    'scene_1.image_url':    images['scene_1']  || '',
    'scene_2.image_url':    images['scene_2']  || '',
    'scene_3.image_url':    images['scene_3']  || '',
    'scene_4.image_url':    images['scene_4']  || '',
    'scene_5.image_url':    images['scene_5']  || '',

    // Images — coloring pages
    'coloring.image_url':   images['coloring']   || '',
    'coloring_1.image_url': images['coloring_1'] || '',
    'coloring_2.image_url': images['coloring_2'] || '',
    'coloring_3.image_url': images['coloring_3'] || '',
    'coloring_4.image_url': images['coloring_4'] || '',
    'coloring_5.image_url': images['coloring_5'] || '',

    // Scene titles
    'scene_1.title':        sceneTitle(1),
    'scene_2.title':        sceneTitle(2),
    'scene_3.title':        sceneTitle(3),
    'scene_4.title':        sceneTitle(4),
    'scene_5.title':        sceneTitle(5),

    // Scene narration / expanded text
    'scene_1.narration':    sceneText(1),
    'scene_2.narration':    sceneText(2),
    'scene_3.narration':    sceneText(3),
    'scene_4.narration':    sceneText(4),
    'scene_5.narration':    sceneText(5),

    // Certificate
    'cert.hero_trait_title': heroTraitTitle,
    'cert.citation':         citation,
    'cert.date':             awardDate,
};

// ─────────────────────────────────────────────────────────────
// 3. Inject variables into template HTML
// ─────────────────────────────────────────────────────────────

function injectVars(html, variables) {
    let result = html;
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\{\\{${key.replace('.', '\\.')}\\}\\}`, 'g');
        result = result.replace(regex, value);
    }
    return result;
}

// ─────────────────────────────────────────────────────────────
// 4. Build one output item per PDF type
//    Each item feeds into the PDFShift loop
// ─────────────────────────────────────────────────────────────

const PDF_TYPES = [
    {
        type: 'storybook',
        template_node: 'Fetch Storybook Template',
        pdfshift_options: { width: '7in', height: '7in', landscape: false },
    },
    {
        type: 'coloring_book',
        template_node: 'Fetch Coloring Book Template',
        pdfshift_options: { format: 'Letter', landscape: false },
    },
    {
        type: 'certificate',
        template_node: 'Fetch Certificate Template',
        pdfshift_options: { format: 'Letter', landscape: true },
    },
];

const results = [];

for (const pdfType of PDF_TYPES) {
    const rawHtml = $(`${pdfType.template_node}`).first().json.data;
    const populatedHtml = injectVars(rawHtml, vars);

    results.push({
        json: {
            order_id:         order.order_id,
            pdf_type:         pdfType.type,
            html:             populatedHtml,
            pdfshift_options: pdfType.pdfshift_options,
            file_path:        `pdfs/${order.order_id}/${pdfType.type}.pdf`,
        }
    });
}

return results;
