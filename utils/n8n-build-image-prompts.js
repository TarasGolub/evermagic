// n8n Code node — "Parse + Build Prompts" (Theme-Agnostic)
// ─────────────────────────────────────────────────────────────
// Workflow: Manual Trigger → Fetch Approved Scripts → Fetch Order Payload → THIS NODE
//
// Input:  payload rows from "Fetch Order Payload"
// Script: from $('Fetch Approved Scripts') — matched by order_id
//
// Output: 1 item per prompt (flat rows), matching images table schema
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// Theme configs — add new themes here
// When you have 10+ themes, move to Supabase or GitHub fetch
// ─────────────────────────────────────────────────────────────
const THEMES = {
  SPACE_HERO: {
    stylePrefix: '3D animated character, Pixar-style render, cinematic lighting, warm rim light',
    coverBackground: 'Cosmic space background with nebula and stars',
    coverPose: 'Standing in a confident hero pose with hands on hips',
    sceneStyle: {
      1: { lighting: 'Warm moonlight with cool blue ambient and soft golden accents', camera: 'Wide establishing shot, low angle' },
      2: { lighting: 'Dynamic warm lighting with streak lights and silver reflections', camera: 'Over-shoulder or low heroic angle' },
      3: { lighting: 'Dramatic side lighting with teal and amber tones', camera: 'Medium tracking shot' },
      4: { lighting: 'Radiant burst lighting with gold and cosmic colors', camera: 'Epic wide panoramic angle' },
      5: { lighting: 'Golden hour sunrise with warm gold and soft pink', camera: 'Intimate close-up shot' },
    },
    coloring: {
      backgroundElements: 'stars, planets, a small rocket',
      pose: 'a confident hero pose',
    },
    model: {
      name: 'openai/gpt-image-1.5',
      quality: 'medium',
      coloringQuality: 'low',
      background: 'auto',
      moderation: 'auto',
      aspect_ratio: '1:1',
      output_format: 'webp',
      input_fidelity: 'low',
      number_of_images: 1,
      output_compression: 90,
    },
  },
  // ─── Add new themes below ───
  // PRINCESS: { stylePrefix: '...', coverBackground: '...', ... },
  // SPORT_CHAMPION: { ... },
};

// ─────────────────────────────────────────────────────────────
// Process all orders
// ─────────────────────────────────────────────────────────────
const allScripts = $('Fetch Approved Scripts').all();
const allPayloads = $('Fetch Order Payload').all();
const results = [];

for (const payloadItem of allPayloads) {
  const payloadRow = payloadItem.json;

  // --- Parse order from payload_json ---
  let order;
  try {
    let raw = payloadRow.payload_json;
    if (typeof raw === 'string') raw = JSON.parse(raw);
    if (typeof raw === 'string') raw = JSON.parse(raw);
    order = raw;
  } catch (e) {
    throw new Error('Failed to parse payload_json for id=' + payloadRow.id + ': ' + e.message);
  }

  if (!order.child) {
    throw new Error('Order ' + order.order_id + ' has no child field.');
  }

  // --- Load theme config ---
  const themeKey = (order.theme || 'SPACE_HERO').toUpperCase();
  const theme = THEMES[themeKey];
  if (!theme) {
    throw new Error('Unknown theme: ' + themeKey + '. Available: ' + Object.keys(THEMES).join(', '));
  }

  // --- Find matching script ---
  const scriptItem = allScripts.find(s => s.json.order_id === order.order_id);
  if (!scriptItem) {
    throw new Error('No approved script found for ' + order.order_id);
  }

  let scriptData;
  try {
    let content = scriptItem.json.content;
    if (typeof content === 'string') content = JSON.parse(content);
    scriptData = content;
  } catch (e) {
    throw new Error('Failed to parse script for ' + order.order_id + ': ' + e.message);
  }

  if (!scriptData || !scriptData.scenes || scriptData.scenes.length !== 5) {
    throw new Error('Script for ' + order.order_id + ' must have exactly 5 scenes.');
  }

  // ─────────────────────────────────────────────────────────────
  // Build character + outfit descriptions dynamically
  // ─────────────────────────────────────────────────────────────
  const child = order.child;
  const genderWord = child.gender === 'girl' ? 'girl' : 'boy';
  const age = child.age || 7;

  const details = [];
  details.push(`a ${age}-year-old ${genderWord}`);
  if (child.hair_color) details.push(`with ${child.hair_color} hair`);
  if (child.skin_tone) details.push(`and ${child.skin_tone} skin`);
  if (child.glasses) details.push('wearing round glasses');
  const characterDesc = details.join(' ');

  const outfitParts = [];
  if (child.signature_look) outfitParts.push(child.signature_look);
  if (child.jersey_number) outfitParts.push(`with the number ${child.jersey_number} on the sleeve`);
  const outfitDesc = outfitParts.length > 0 ? ', ' + outfitParts.join(', ') : '';

  // Photo URLs for face reference (main + extra if available)
  const photos = order.photos || [];
  const mainPhoto = photos.find(p => p.type === 'photo_main') || photos[0] || null;
  const extraPhoto = photos.find(p => p.type === 'photo_extra') || null;
  const facePhotoUrl = mainPhoto ? mainPhoto.url : null;
  const extraPhotoUrl = extraPhoto ? extraPhoto.url : null;

  // ─────────────────────────────────────────────────────────────
  // Build prompts — flat rows matching images table schema
  // ─────────────────────────────────────────────────────────────

  // Build generation params with face photos included
  const genParams = {
    ...theme.model,
    face_photos: [facePhotoUrl, extraPhotoUrl].filter(Boolean),
  };

  // Shared fields for all prompts in this order
  const shared = {
    order_id: order.order_id,
    theme: themeKey,
    face_photo_url: facePhotoUrl,
    extra_photo_url: extraPhotoUrl,
    generation_params: genParams,
    model: theme.model.name,
    status: 'pending',
  };

  // Cover
  results.push({
    ...shared,
    image_type: 'cover',
    scene_title: scriptData.title,
    prompt: `${theme.stylePrefix}. ${characterDesc}${outfitDesc}. ${theme.coverPose}. ${theme.coverBackground}.`,
  });

  // 5 Scenes + 5 Scene Coloring Pages
  for (const scene of scriptData.scenes) {
    const num = scene.scene_number;
    const style = theme.sceneStyle[num] || theme.sceneStyle[1];

    // Scene image (high quality)
    results.push({
      ...shared,
      image_type: `scene_${num}`,
      scene_title: scene.scene_title,
      prompt: `${theme.stylePrefix}. ${characterDesc}${outfitDesc}. ${scene.visual_description}. ${style.lighting}. ${style.camera}.`,
    });

    // Scene coloring page (low quality to save cost)
    results.push({
      ...shared,
      image_type: `coloring_${num}`,
      scene_title: `Coloring: ${scene.scene_title}`,
      generation_params: { ...genParams, quality: theme.model.coloringQuality || 'low' },
      prompt: `Black and white line art coloring page, pure black outlines on white background only, absolutely no color, no shading, no gradients, no fills, pen and ink style. ${characterDesc}. ${scene.visual_description}. Thick clean lines suitable for children to color with crayons. Coloring book page style, printable.`,
    });
  }

  // Generic coloring page (low quality)
  results.push({
    ...shared,
    image_type: 'coloring',
    scene_title: 'Coloring Page',
    generation_params: { ...genParams, quality: 'low' },
    prompt: `Black and white line art coloring page, pure black outlines on white background only, absolutely no color, no shading, no gradients, no fills, pen and ink style. ${characterDesc} in ${theme.coloring.pose}. Simple background: outline ${theme.coloring.backgroundElements}. Thick clean lines suitable for children to color with crayons. Coloring book page style, printable.`,
  });

  console.log(`✅ ${order.order_id} — ${child.name} — theme:${themeKey} — "${scriptData.title}"`);
}

// ─────────────────────────────────────────────────────────────
// Reconcile with existing images in DB
// ─────────────────────────────────────────────────────────────
// Input: $('Fetch Existing Images') — Supabase GET ALL where order_id = X
// If the node doesn't exist or returns nothing, treat all as new.

let existingByType = {};
try {
  const existingRows = $('Fetch Existing Images').all();
  for (const row of existingRows) {
    existingByType[row.json.image_type] = row.json;
  }
} catch (e) {
  // No "Fetch Existing Images" node — treat all as new
  console.log('No existing images found — all items are new');
}

const finalResults = [];
const stats = { skipped: 0, reused: 0, overwrite: 0, new_items: 0 };

for (const prompt of results) {
  const imageType = prompt.image_type;
  const existing = existingByType[imageType];

  if (existing) {
    if (existing.status === 'completed') {
      // ✅ Already done — skip
      stats.skipped++;
      continue;
    }

    if (existing.status === 'pending') {
      // ⏳ Already in DB — reuse, just proceed to generation
      stats.reused++;
      finalResults.push({
        json: { ...existing, db_action: 'none' },
      });
      continue;
    }

    if (existing.status === 'failed') {
      // ❌ Failed — overwrite with fresh prompt
      stats.overwrite++;
      finalResults.push({
        json: {
          ...existing,
          prompt: prompt.prompt,       // refresh prompt
          status: 'pending',
          error_message: null,
          db_action: 'update',
        },
      });
      continue;
    }
  }

  // 🆕 New — needs insert
  stats.new_items++;
  finalResults.push({
    json: { ...prompt, db_action: 'insert' },
  });
}

console.log(
  `Reconciled: ${stats.skipped} skipped, ${stats.reused} reused, ` +
  `${stats.overwrite} overwrite, ${stats.new_items} new → ${finalResults.length} to generate`
);
console.log(`Total: ${results.length} prompts for ${allPayloads.length} orders`);

return finalResults;
