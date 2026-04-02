// n8n Code node — "Build PDF HTML"
// Placed AFTER "Fetch PDF Template" HTTP Request node
// Injects order/script/image data into an HTML template string
// Returns one item per PDF type — feeds into the PDFShift loop

// ─────────────────────────────────────────────────────────────
// 1. Gather inputs
// ─────────────────────────────────────────────────────────────

const order = JSON.parse($('Fetch Order Payload').first().json.payload_json);
const child = order.child;

const scriptRow = $('Fetch Script').first().json;
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
const logoPdfUrl = 'https://pdrecmrvivbtutmynrbu.supabase.co/storage/v1/object/public/logo/logo_pdf.png';

// Theme styles — fetched from GitHub by 'Fetch Theme Styles' HTTP Request node
const themeStyles = $('Fetch Theme Styles').first().json.data || '';

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
    'story.title': scriptContent.title || '',
    'story.tagline': scriptContent.tagline || '',
    'closing_message': scriptContent.closing_message || '',
    'parent_message': order.parent_message || '',

    // Child
    'child.name': child.name,
    'child.age': String(child.age),
    'child.hero_trait': child.hero_trait || '',
    'child.hobby': child.hobby || '',

    // Order
    'order.order_id': order.order_id,
    'qr_code_url': qrCodeUrl,
    'logo_pdf_url': logoPdfUrl,
    'theme_styles': themeStyles,

    // Images — scene images
    'cover.image_url': images['cover'] || '',
    'scene_1.image_url': images['scene_1'] || '',
    'scene_2.image_url': images['scene_2'] || '',
    'scene_3.image_url': images['scene_3'] || '',
    'scene_4.image_url': images['scene_4'] || '',
    'scene_5.image_url': images['scene_5'] || '',

    // Images — coloring pages
    'coloring.image_url': images['coloring'] || '',
    'coloring_1.image_url': images['coloring_1'] || '',
    'coloring_2.image_url': images['coloring_2'] || '',
    'coloring_3.image_url': images['coloring_3'] || '',
    'coloring_4.image_url': images['coloring_4'] || '',
    'coloring_5.image_url': images['coloring_5'] || '',

    // Scene titles
    'scene_1.title': sceneTitle(1),
    'scene_2.title': sceneTitle(2),
    'scene_3.title': sceneTitle(3),
    'scene_4.title': sceneTitle(4),
    'scene_5.title': sceneTitle(5),

    // Scene text pages — each scene split across two fixed-height pages
    'scene_1.text_pages': buildTextPages(1),
    'scene_2.text_pages': buildTextPages(2),
    'scene_3.text_pages': buildTextPages(3),
    'scene_4.text_pages': buildTextPages(4),
    'scene_5.text_pages': buildTextPages(5),

    // Certificate
    'cert.hero_trait_title': heroTraitTitle,
    'cert.citation': citation,
    'cert.date': awardDate,
};

// ─────────────────────────────────────────────────────────────
// 3. Build scene text pages — splits narration across two fixed-height pages
//    Paragraphs grouped by word count; pages balanced by word count.
// ─────────────────────────────────────────────────────────────

function buildTextPages(sceneNumber) {
    const title = sceneTitle(sceneNumber);
    const text = sceneText(sceneNumber);
    if (!text) return '';

    // ── Step 1: Protect quoted dialogue from mid-quote splits ──────
    // "Wow! Where did you come from?" must never be split at the !
    const quotes = [];
    const safeText = text.replace(/"[^"]+"/g, (match) => {
        quotes.push(match);
        return `__Q${quotes.length - 1}__`;
    });

    // ── Step 2: Split into sentences ───────────────────────────────
    // Only split at . ! ? when followed by whitespace + capital letter.
    // Mid-quote punctuation is protected by placeholders above.
    const rawSentences = safeText
        .split(/(?<=[.!?])\s+(?=[A-Z])/)
        .map(s => s.trim())
        .filter(Boolean);

    // ── Step 3: Restore quoted dialogue ────────────────────────────
    const sentences = rawSentences.map(s =>
        s.replace(/__Q(\d+)__/g, (_, i) => quotes[parseInt(i)])
    );

    // ── Step 4: Group into paragraphs by word count ────────────────
    // Target ~25 words per paragraph. Short sentences (≤5 words) always
    // attach to the following group rather than stand alone.
    const TARGET_WORDS = 25;
    const SHORT_SENTENCE = 5;

    const paragraphs = [];
    let buf = [];
    let bufWords = 0;

    for (let i = 0; i < sentences.length; i++) {
        const wc = sentences[i].split(/\s+/).filter(Boolean).length;
        buf.push(sentences[i]);
        bufWords += wc;

        const isLast = i === sentences.length - 1;
        const nextIsShort = !isLast &&
            sentences[i + 1].split(/\s+/).filter(Boolean).length <= SHORT_SENTENCE;

        if (bufWords >= TARGET_WORDS && !nextIsShort && !isLast) {
            paragraphs.push('<p>' + buf.join(' ').trim() + '</p>');
            buf = [];
            bufWords = 0;
        }
    }

    // Flush remainder — merge into last paragraph if very short (<8 words)
    if (buf.length > 0) {
        const tail = buf.join(' ').trim();
        if (paragraphs.length > 0 && bufWords < 8) {
            paragraphs[paragraphs.length - 1] =
                paragraphs[paragraphs.length - 1].replace('</p>', ' ' + tail + '</p>');
        } else {
            paragraphs.push('<p>' + tail + '</p>');
        }
    }

    // ── Step 5: Balance pages by word count (not paragraph count) ──
    // Page 1 carries the scene title + gold rule — target slightly less than
    // half (45 %) so both pages fill roughly the same visual space.
    const paraWords = paragraphs.map(p =>
        p.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
    );
    const total  = paraWords.reduce((a, b) => a + b, 0);
    const target = total * 0.45;   // page 1 target (< half to offset title)
    let cumWords = 0;
    let split = 1;
    for (let i = 0; i < paraWords.length - 1; i++) {
        const next = cumWords + paraWords[i];
        // Keep adding paragraphs while getting closer to target
        if (Math.abs(next - target) <= Math.abs(cumWords - target)) {
            cumWords = next;
            split = i + 1;
        } else {
            break;
        }
    }

    const p1Html = paragraphs.slice(0, split).join('\n');
    const p2Html = paragraphs.slice(split).join('\n');

    const page1 =
        '\n  <div class="page fixed-height scene-text-page">'
        + '\n    <div class="page-content">'
        + '\n      <h2 class="scene-title">' + title + '</h2>'
        + '\n      <div class="gold-rule"></div>'
        + '\n      <div class="narration">' + p1Html + '</div>'
        + '\n    </div>'
        + '\n    <div class="page-branding">EverMagic</div>'
        + '\n  </div>';

    if (!p2Html) return page1;

    const page2 =
        '\n  <div class="page fixed-height scene-text-page">'
        + '\n    <div class="page-content">'
        + '\n      <div class="narration">' + p2Html + '</div>'
        + '\n    </div>'
        + '\n    <div class="page-branding">EverMagic</div>'
        + '\n  </div>';

    return page1 + '\n' + page2;
}

// ─────────────────────────────────────────────────────────────
// 5. Inject variables into template HTML
// ─────────────────────────────────────────────────────────────

function injectVars(html, variables) {
    let result = html;
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\{\\{${key.replace(/\./g, '\\.')}\\}\\}`, 'g');
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
        pdfshift_options: { format: '7inx7in' },
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

    const pdfshiftBody = Object.assign({ source: populatedHtml }, pdfType.pdfshift_options);

    results.push({
        json: {
            order_id: order.order_id,
            pdf_type: pdfType.type,
            pdfshift_body: pdfshiftBody,
            file_path: `pdfs/${order.order_id}/${pdfType.type}.pdf`,
        }
    });
}

return results;
