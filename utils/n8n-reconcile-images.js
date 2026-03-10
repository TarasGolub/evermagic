// n8n Code node — "Reconcile Images"
// ─────────────────────────────────────────────────────────────
// Compares newly built prompts against existing DB images.
//
// Logic per image_type:
//   completed → SKIP (already done, don't regenerate)
//   pending   → REUSE (use existing DB row, proceed to generation)
//   failed    → OVERWRITE (reset status, proceed to generation)
//   missing   → NEW (needs insert into DB, then generation)
//
// Inputs:
//   $('Build Prompts')        — all prompt items for this order
//   $('Fetch Existing Images') — existing images rows from DB
//
// Output: only items that need generation, with db_action flag
// ─────────────────────────────────────────────────────────────

const prompts = $('Build Prompts').all();
const existingRows = $('Fetch Existing Images').all();

// Index existing images by image_type
const existingByType = {};
for (const row of existingRows) {
    existingByType[row.json.image_type] = row.json;
}

const results = [];
const stats = { skipped: 0, reused: 0, overwrite: 0, new_items: 0 };

for (const prompt of prompts) {
    const imageType = prompt.json.image_type;
    const existing = existingByType[imageType];

    if (existing) {
        if (existing.status === 'completed') {
            // ✅ Already done — skip entirely
            stats.skipped++;
            continue;
        }

        if (existing.status === 'pending') {
            // ⏳ Already in DB with prompt — just needs generation
            stats.reused++;
            results.push({
                json: {
                    ...existing,               // use DB row data (has id, prompt, etc.)
                    db_action: 'none',          // no DB write needed before generation
                },
            });
            continue;
        }

        if (existing.status === 'failed') {
            // ❌ Failed — reset and retry
            stats.overwrite++;
            results.push({
                json: {
                    ...existing,               // use DB row (keep same id)
                    prompt: prompt.json.prompt, // refresh prompt from builder
                    status: 'pending',
                    error_message: null,
                    db_action: 'update',        // update existing row (reset status)
                },
            });
            continue;
        }
    }

    // 🆕 No DB row exists — new image
    stats.new_items++;
    results.push({
        json: {
            ...prompt.json,
            db_action: 'insert',              // needs insert into images table
        },
    });
}

console.log(
    `Reconciled: ${stats.skipped} skipped, ${stats.reused} reused, ` +
    `${stats.overwrite} overwrite, ${stats.new_items} new → ${results.length} to generate`
);

return results;
