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
    stylePrefix: '3D CGI animated character, oversized expressive cartoon head with large round eyes, smooth rounded features, cinematic lighting, warm rim light',
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
      output_format: 'jpeg',
      input_fidelity: 'low',
      number_of_images: 1,
      output_compression: 80,
    },
  },
  FANTASY_HERO: {
    stylePrefix: '3D CGI animated character, Pixar-style render, enchanted fantasy setting, warm magical lighting, soft subsurface scattering',
    coverBackground: 'Enchanted kingdom with glowing castle spires, twilight sky with floating lanterns and magical stars',
    coverPose: 'Standing in a heroic pose with one arm raised, dragon companion beside them',
    sceneStyle: {
      1: { lighting: 'Warm bedroom glow with mysterious blue-green magical shimmer emanating from a glowing artifact', camera: 'Close-up on child\'s face and magical artifact, warm-cool contrast' },
      2: { lighting: 'Lush enchanted forest with dappled golden-green light, soft magic sparkle particles in the air', camera: 'Wide establishing shot — scale of kingdom revealed, deep background bokeh' },
      3: { lighting: 'Dramatic cool-toned cave or ruined castle, single warm hero spotlight on the child', camera: 'Medium tracking shot with tension in the framing, slight dutch angle' },
      4: { lighting: 'Epic golden burst — warm amber and gold flooding the scene, dragon silhouette overhead', camera: 'Epic wide panoramic, low angle, sky visible above' },
      5: { lighting: 'Soft warm evening bedroom light, a single bright star visible through the window', camera: 'Intimate close-up on child\'s face, gentle smile' },
    },
    coloring: {
      backgroundElements: 'enchanted trees, a castle tower, stars, a small friendly dragon, magical floating lanterns',
      pose: 'heroic stance with one arm outstretched toward the sky',
    },
    model: { name: 'openai/gpt-image-1.5', quality: 'medium', coloringQuality: 'low', background: 'auto', moderation: 'auto', aspect_ratio: '1:1', output_format: 'jpeg', input_fidelity: 'low', number_of_images: 1, output_compression: 80 },
  },

  ENCHANTED_PRINCESS: {
    stylePrefix: '3D CGI animated character, Pixar-style render, soft pastel fantasy world, warm sparkle and magical light, soft subsurface scattering',
    coverBackground: 'Enchanted meadow with a rainbow arch overhead, glowing flower fields, and a fairy castle glowing in the distance',
    coverPose: 'Standing gracefully with one hand resting on the unicorn companion\'s mane, looking forward with confidence',
    sceneStyle: {
      1: { lighting: 'Warm golden bedroom glow with soft magical shimmer and sparkle particles around a glowing object', camera: 'Close-up on child and glowing magical item, warm bokeh background' },
      2: { lighting: 'Soft pastel rainbow sky — pinks, lavenders, and aqua tones, gentle magical light', camera: 'Wide shot — kingdom scale revealed, rainbow arch dominant in background' },
      3: { lighting: 'Muted, slightly desaturated pastels — colors drained from the world, cooler and dimmer than other scenes', camera: 'Medium shot, sky visibly dimmer, slight melancholy framing' },
      4: { lighting: 'Vibrant burst of pastels and rainbow light — most colorful and luminous scene in the story', camera: 'Epic wide panoramic, rainbow restored overhead, celebrating creatures visible' },
      5: { lighting: 'Soft lavender evening bedroom light, a rainbow shimmer or single star outside the window', camera: 'Intimate close-up on child\'s face, warm and peaceful expression' },
    },
    coloring: {
      backgroundElements: 'unicorn, rainbow arch, castle towers, flowers, stars, butterfly',
      pose: 'graceful pose with arms open wide, looking up joyfully',
    },
    model: { name: 'openai/gpt-image-1.5', quality: 'medium', coloringQuality: 'low', background: 'auto', moderation: 'auto', aspect_ratio: '1:1', output_format: 'jpeg', input_fidelity: 'low', number_of_images: 1, output_compression: 80 },
  },

  ANIMAL_GUARDIAN: {
    stylePrefix: '3D CGI animated character, Pixar-style render, magical nature setting, warm natural light, lush greens and soft gold, soft subsurface scattering',
    coverBackground: 'Magical forest clearing with glowing plants, soft golden light filtering through ancient trees, small magical creatures visible',
    coverPose: 'Kneeling gently with cupped hands, glowing animal companion resting in their hands',
    sceneStyle: {
      1: { lighting: 'Soft warm dawn light — amber and sage greens, natural real-world setting with a single faint magical glow', camera: 'Medium wide shot, child\'s home or garden framing, sense of the ordinary world' },
      2: { lighting: 'Rich lush emerald forest, dappled golden magical light, deep rich shadows, magic sparkle in the air', camera: 'Wide establishing shot — forest scale and beauty, sense of wonder' },
      3: { lighting: 'Cool blue-green tones, slight desaturation — nature in imbalance, quieter and stiller than other scenes', camera: 'Closer tracking shot, tension in the stillness of the forest' },
      4: { lighting: 'Warm golden burst — animals emerging, forest glowing restored, bright and joyful natural light', camera: 'Wide panoramic, celebration scene with magical animals visible' },
      5: { lighting: 'Soft warm evening home light, a faint magical shimmer near the window or in a flower pot', camera: 'Intimate close-up, child holding a small glowing gift from the companion' },
    },
    coloring: {
      backgroundElements: 'forest trees, flowers, butterflies, a winding path, small woodland animals, a glowing plant',
      pose: 'kneeling gently with arms open, welcoming expression',
    },
    model: { name: 'openai/gpt-image-1.5', quality: 'medium', coloringQuality: 'low', background: 'auto', moderation: 'auto', aspect_ratio: '1:1', output_format: 'jpeg', input_fidelity: 'low', number_of_images: 1, output_compression: 80 },
  },

  HOME_HELPER: {
    stylePrefix: '3D CGI animated character, Pixar-style render, cozy warm home interior, soft amber light, intimate scale, soft subsurface scattering',
    coverBackground: 'Cozy warm home interior — kitchen, living room or garden — with tiny glowing lights visible in the baseboards and flower pots, hinting at a tiny hidden world',
    coverPose: 'Kneeling down with cupped hands held out, a tiny glowing sprite visible in their palms',
    sceneStyle: {
      1: { lighting: 'Warm amber home interior — natural everyday lighting, a single tiny shimmer or pinprick of light visible near the baseboards or flower pot', camera: 'Wide-medium home shot showing child doing chores, ordinary and cozy' },
      2: { lighting: 'Same home setting revealed — warm amber with a soft green magical glow, tiny lights twinkling in the walls', camera: 'Low angle (child\'s eye-level or lower) to emphasise tiny village scale, create sense of wonder' },
      3: { lighting: 'Slightly dimmer, cooler warm tones — the cozy magic slightly reduced, quiet sense of urgency', camera: 'Close-up medium shot, intimate tension, child focused on the problem' },
      4: { lighting: 'Warm golden glow restored — sparkles, tiny lights, amber and soft gold fill the scene', camera: 'Low angle wide — tiny celebration fully visible, child towering warmly above the tiny world' },
      5: { lighting: 'Softest, warmest evening light — home at its most cozy and golden, a faint shimmer at the edge of frame', camera: 'Intimate close-up on child\'s face, content and knowing smile' },
    },
    coloring: {
      backgroundElements: 'cozy home interior, flower pots with flowers, a bookshelf, tiny doors in the baseboard, stars, small glowing lights',
      pose: 'child holding out cupped hands gently, looking down with wonder',
    },
    model: { name: 'openai/gpt-image-1.5', quality: 'medium', coloringQuality: 'low', background: 'auto', moderation: 'auto', aspect_ratio: '1:1', output_format: 'jpeg', input_fidelity: 'low', number_of_images: 1, output_compression: 80 },
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

    // Scene coloring page
    // - No face photos: switches API to /images/generations, giving model freedom for clean line art
    // - No scene.visual_description: avoids color words and camera angles that cause cropping
    // - quality: medium — 'low' produces sketchy pencil-like results
    const coloringGenParams = { ...genParams, quality: 'medium', face_photos: [] };
    results.push({
      ...shared,
      image_type: `coloring_${num}`,
      scene_title: `Coloring: ${scene.scene_title}`,
      generation_params: coloringGenParams,
      prompt: `Children's printable coloring book page. Pure black outlines on pure white background only. No color, no grey, no shading, no gradients, no fills whatsoever — only crisp black lines on white. A ${age}-year-old ${genderWord} in a fun adventure pose related to "${scene.scene_title}". Full body from head to toe fully visible inside the frame — top of head with hat visible, feet and shoes visible at bottom, generous white margin on all four sides, never cropped or cut off at any edge. Bold thick uniform black outlines, published coloring book quality — not sketchy, not pencil-like, not shaded. Simple background elements as clean outlines only: ${theme.coloring.backgroundElements}. Easy for a child to color with crayons.`,
    });
  }

  // Generic coloring page
  // - No face photos: switches API to /images/generations for clean line art
  // - quality: medium — 'low' produces sketchy pencil-like results
  results.push({
    ...shared,
    image_type: 'coloring',
    scene_title: 'Coloring Page',
    generation_params: { ...genParams, quality: 'medium', face_photos: [] },
    prompt: `Children's printable coloring book page. Pure black outlines on pure white background only. No color, no grey, no shading, no gradients, no fills whatsoever — only crisp black lines on white. A ${age}-year-old ${genderWord} in ${theme.coloring.pose}. Full body from head to toe fully visible inside the frame — top of head fully visible, feet and shoes fully visible at bottom, generous white margin on all four sides, never cropped or cut off at any edge. Bold thick uniform black outlines, published coloring book quality — not sketchy, not pencil-like, not shaded. Simple background elements as clean outlines only: ${theme.coloring.backgroundElements}. Easy for a child to color with crayons.`,
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
