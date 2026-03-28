// n8n Code node — "Build OpenAI Request"
// ─────────────────────────────────────────────────────────────
// Builds OpenAI Images API request for each image job.
//
// Routes:
//   Scenes with face photo → POST /v1/images/edits
//   Coloring pages         → POST /v1/images/generations
//
// ⚠️  For /images/edits, face photos must be base64 data URIs.
//     This node CANNOT fetch them (no fetch in n8n Code sandbox).
//     The workflow must fetch photos BEFORE this node runs:
//
//     Fetch Order Payload
//       → Fetch Face Photo (HTTP GET → binary)
//       → Build OpenAI Request (this node — reads $binary)
//       → Call OpenAI Image API
//
// Model: gpt-image-1
// Both endpoints return: { "data": [{ "b64_json": "..." }] }
// HTTP Request node URL: https://api.openai.com/v1{{ $json.api_endpoint }}
// ─────────────────────────────────────────────────────────────

const items = $('Parse + Build Prompts').all();
const inputs = $input.all();
const results = [];

// ── Read face photo binary (fetched by prior "Fetch Face Photo" node) ──
// The workflow should have an HTTP GET node BEFORE this one that fetches
// face_photo_url as binary. The binary is available on the FIRST item
// since all items share the same child's face photo.
//
// In n8n, reference it with: $('Fetch Face Photo').first().binary.data
// If no face photo exists, this will be undefined.

let facePhotoBase64 = null;
let extraPhotoBase64 = null;

try {
    // getBinaryDataBuffer reads actual file content (not filesystem-v2 ref)
    // Item 0 must carry binary from the upstream "Fetch Face Photo" node
    const firstItem = inputs[0];

    if (firstItem.binary && firstItem.binary.data) {
        const buffer = await this.helpers.getBinaryDataBuffer(0, 'data');
        const mime = firstItem.binary.data.mimeType || 'image/jpeg';
        facePhotoBase64 = `data:${mime};base64,${buffer.toString('base64')}`;
    }
    if (firstItem.binary && firstItem.binary.extra) {
        const buffer = await this.helpers.getBinaryDataBuffer(0, 'extra');
        const mime = firstItem.binary.extra.mimeType || 'image/jpeg';
        extraPhotoBase64 = `data:${mime};base64,${buffer.toString('base64')}`;
    }
} catch (e) {
    console.log('No face photo binary found — OK for coloring pages');
}

for (const item of items) {
    const row = item.json;
    const params = row.generation_params || {};
    const isColoring = row.image_type.startsWith('coloring');
    const hasFacePhoto = facePhotoBase64;
    const quality = isColoring
        ? (params.coloringQuality || 'low')
        : (params.quality || 'medium');

    // Common fields
    const baseRequest = {
        model: 'gpt-image-1',
        prompt: row.prompt,
        size: '1024x1024',
        quality: quality,
        output_format: 'jpeg',
    };

    let apiEndpoint;
    let openaiRequest;

    if (hasFacePhoto) {
        // ── /images/edits — base64 face photos ──
        apiEndpoint = '/images/edits';

        const imageObjects = [{ image_url: facePhotoBase64 }];
        if (extraPhotoBase64) {
            imageObjects.push({ image_url: extraPhotoBase64 });
        }

        openaiRequest = {
            ...baseRequest,
            images: imageObjects,
        };
    } else {
        // ── /images/generations — text-only ──
        apiEndpoint = '/images/generations';
        openaiRequest = baseRequest;
    }

    // Storage path: {order_id}/{image_type}.jpeg
    const storagePath = `${row.order_id}/${row.image_type}.jpeg`;

    results.push({
        json: {
            ...row,
            api_endpoint: apiEndpoint,
            openai_request: openaiRequest,
            storage_path: storagePath,
        },
    });
}

console.log(
    `Prepared ${results.length} requests: ` +
    `${results.filter(r => r.json.api_endpoint === '/images/edits').length} edits, ` +
    `${results.filter(r => r.json.api_endpoint === '/images/generations').length} generations`
);
return results;
