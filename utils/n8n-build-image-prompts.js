// n8n Code node — "Build Image Prompts"
// Place AFTER the order is approved and script is fetched
// Input: order data + approved script
// Output: array of image generation tasks (7 items: 1 cover + 5 scenes + 1 coloring)

const order = $input.first().json.order || $input.first().json;
const script = $input.first().json.script || $input.first().json.content;
const child = order.child || {};

// Parse script if it's a string
const scriptData = typeof script === 'string' ? JSON.parse(script) : script;
const scenes = scriptData.scenes || [];

// ─────────────────────────────────────────────────────────────
// Character description (reused in every prompt)
// ─────────────────────────────────────────────────────────────

const genderWord = child.gender === 'girl' ? 'girl' : 'boy';
const age = child.age || 7;
const glasses = child.glasses ? ', wearing glasses' : '';

const characterDesc = [
  `A ${age}-year-old ${genderWord}`,
  `with ${child.hair_color || 'brown'} hair`,
  `and ${child.skin_tone || 'light'} skin`,
  glasses,
  child.signature_look ? `, ${child.signature_look}` : '',
].filter(Boolean).join(' ').replace(/ ,/g, ',');

// ─────────────────────────────────────────────────────────────
// Style prefix (consistent across all images)
// ─────────────────────────────────────────────────────────────

const stylePrefix = 'Pixar-style 3D CGI animated character render, Boss Baby proportions with oversized head and large expressive eyes, high-quality cinematic lighting, soft subsurface scattering, shallow depth of field';

// ─────────────────────────────────────────────────────────────
// Scene lighting/camera map
// ─────────────────────────────────────────────────────────────

const sceneStyle = {
  1: { lighting: 'Warm moonlight with cool blue ambient and soft golden accents', camera: 'Wide establishing shot, low angle' },
  2: { lighting: 'Dynamic warm lighting with streak lights and silver reflections', camera: 'Over-shoulder or low heroic angle' },
  3: { lighting: 'Dramatic side lighting with teal and amber tones', camera: 'Medium tracking shot' },
  4: { lighting: 'Radiant burst lighting with gold and cosmic colors', camera: 'Epic wide panoramic angle' },
  5: { lighting: 'Golden hour sunrise with warm gold and soft pink', camera: 'Intimate close-up shot' },
};

// ─────────────────────────────────────────────────────────────
// Build prompts
// ─────────────────────────────────────────────────────────────

const tasks = [];

// Cover image
tasks.push({
  order_id: order.order_id,
  image_type: 'cover',
  prompt: `${stylePrefix}. ${characterDesc}. Standing in a powerful confident hero pose with hands on hips, looking slightly upward with a bright smile. Background: cosmic space setting with vibrant nebula colors, swirling galaxies, and twinkling stars. Dramatic rim light from behind creating a golden halo effect, warm key light on face. Centered composition, slightly low angle to make character look heroic and epic. Movie poster framing.`,
});

// Scene images
for (let i = 0; i < scenes.length; i++) {
  const scene = scenes[i];
  const num = scene.scene_number || (i + 1);
  const style = sceneStyle[num] || sceneStyle[1];

  tasks.push({
    order_id: order.order_id,
    image_type: `scene_${num}`,
    prompt: `${stylePrefix}. ${characterDesc}. ${scene.visual_description}. ${style.lighting}. ${style.camera}, cinematic depth of field.`,
  });
}

// Coloring page
tasks.push({
  order_id: order.order_id,
  image_type: 'coloring',
  prompt: `Clean black line art coloring page for children, white background, no shading, no fills. ${characterDesc} in a confident hero pose. Simple fun space-themed background elements as outlines: stars, planets, a small rocket. Thick clear outlines suitable for children to color in. Simple shapes, no complex textures.`,
});

return tasks.map(t => ({ json: t }));
