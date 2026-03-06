// n8n Code node — "Parse + Build Prompts" (Theme-Agnostic)
// ─────────────────────────────────────────────────────────────
// Workflow: Manual Trigger → Fetch Approved Scripts → Fetch Order Payload → THIS NODE
//
// Input:  payload rows from "Fetch Order Payload"
// Script: from $('Fetch Approved Scripts') — matched by order_id
//
// Output: 1 item per order, grouped with all 7 prompts + PuLID params nested inside
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
    pulid: {
      width: 1024, height: 1024,
      id_weight: 1.0, start_step: 1,
      guidance_scale: 3.5, num_steps: 20,
      output_quality: 90,
      negative_prompt: 'bad quality, worst quality, text, signature, watermark, extra limbs, realistic photo, photograph',
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
const allPayloads = $input.all();
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

  // Photo URL for PuLID face reference
  const facePhoto = (order.photos && order.photos.length > 0) ? order.photos[0].url : null;

  // ─────────────────────────────────────────────────────────────
  // Build prompts — theme-driven
  // ─────────────────────────────────────────────────────────────
  const prompts = {};

  // Cover
  prompts.cover = {
    scene_title: scriptData.title,
    prompt: `${theme.stylePrefix}. ${characterDesc}${outfitDesc}. ${theme.coverPose}. ${theme.coverBackground}.`,
  };

  // 5 Scenes
  for (const scene of scriptData.scenes) {
    const num = scene.scene_number;
    const style = theme.sceneStyle[num] || theme.sceneStyle[1];
    prompts[`scene_${num}`] = {
      scene_title: scene.scene_title,
      prompt: `${theme.stylePrefix}. ${characterDesc}${outfitDesc}. ${scene.visual_description}. ${style.lighting}. ${style.camera}.`,
    };
  }

  // Coloring page
  prompts.coloring = {
    scene_title: 'Coloring Page',
    prompt: `Black and white line art coloring page, pure black outlines on white background only, absolutely no color, no shading, no gradients, no fills, pen and ink style. ${characterDesc} in ${theme.coloring.pose}. Simple background: outline ${theme.coloring.backgroundElements}. Thick clean lines suitable for children to color with crayons. Coloring book page style, printable.`,
  };

  results.push({
    order_id: order.order_id,
    child_name: child.name,
    theme: themeKey,
    story_title: scriptData.title,
    face_photo: facePhoto,
    pulid_params: theme.pulid,
    prompts,
  });

  console.log(`✅ ${order.order_id} — ${child.name} — theme:${themeKey} — "${scriptData.title}"`);
}

console.log(`Total: ${results.length} orders, ${results.length * 7} prompts`);

return results.map(r => ({ json: r }));
