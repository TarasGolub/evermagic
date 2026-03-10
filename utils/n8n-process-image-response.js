// n8n Code node — "Process Response"
// ─────────────────────────────────────────────────────────────
// Parses OpenAI Image API response and converts to n8n binary
// for Supabase Storage upload.
//
// ⚠️  Runs inside a loop (batch size 1) — processes ONE item per iteration.
//     Uses .first() to get the current iteration's metadata.
//
// Input: OpenAI response { data: [{ b64_json: "..." }], usage: {...} }
// Output: JSON metadata + binary image ready for upload
// ─────────────────────────────────────────────────────────────

const apiResponse = $input.first().json;

// Get metadata from the current iteration's Build OpenAI Request item
// .first() in a loop = current iteration, NOT the first item overall
const prevData = $('Loop Over Items').first().json;

// ── Check for API error ──
if (apiResponse.error) {
    return [{
        json: {
            ...prevData,
            success: false,
            error_message: apiResponse.error.message || JSON.stringify(apiResponse.error),
        },
    }];
}

// ── Extract base64 image from response ──
const b64 = apiResponse.data && apiResponse.data[0] && apiResponse.data[0].b64_json;
if (!b64) {
    return [{
        json: {
            ...prevData,
            success: false,
            error_message: 'No image data in OpenAI response',
        },
    }];
}

// ── Build output with binary for Storage upload ──
const buffer = Buffer.from(b64, 'base64');

console.log(`✅ ${prevData.image_type} — ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

return [{
    json: {
        ...prevData,
        success: true,
        image_size: buffer.length,
        usage: apiResponse.usage || null,
    },
    binary: {
        data: await this.helpers.prepareBinaryData(
            buffer,
            `${prevData.image_type || 'image'}.webp`,
            'image/webp'
        ),
    },
}];
