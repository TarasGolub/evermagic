# EverMagic — Image Prompt Templates
# Version: 1.0.0
# Theme: Space Hero
# Model: Flux 1.1 Pro (Replicate)
#
# These templates are used by n8n-build-image-prompts.js
# Variables: {character}, {visual_description}, {lighting}, {camera}, {signature_look}

## Style Prefix (every image)

```
Pixar-style 3D CGI animated character render, Boss Baby proportions with oversized head and large expressive eyes, high-quality cinematic lighting, soft subsurface scattering, shallow depth of field
```

## Character Description Template

```
A {age}-year-old {gender} with {hair_color} hair and {skin_tone} skin, {signature_look}
```

## Cover Prompt

```
{style_prefix}. {character}. Standing in a powerful confident hero pose with hands on hips, looking slightly upward with a bright smile. Background: cosmic space setting with vibrant nebula colors, swirling galaxies, and twinkling stars. Dramatic rim light from behind creating a golden halo effect, warm key light on face. Centered composition, slightly low angle to make character look heroic and epic. Movie poster framing.
```

## Scene Prompt Template

```
{style_prefix}. {character}. {visual_description}. Character must be wearing {signature_look}. {lighting}. {camera}, cinematic depth of field.
```

### Scene Lighting & Camera Map

| Scene | Lighting | Camera |
|-------|----------|--------|
| 1 — The Call | Warm moonlight with cool blue ambient and soft golden accents | Wide establishing shot, low angle |
| 2 — The Launch | Dynamic warm lighting with streak lights and silver reflections | Over-shoulder or low heroic angle |
| 3 — The Challenge | Dramatic side lighting with teal and amber tones | Medium tracking shot |
| 4 — The Triumph | Radiant burst lighting with gold and cosmic colors | Epic wide panoramic angle |
| 5 — The Return | Golden hour sunrise with warm gold and soft pink | Intimate close-up shot |

## Coloring Page Prompt

```
Children's coloring page for a young child to color inside the lines. Pure black outlines on solid white background only. Absolutely no color, no shading, no cross-hatching, no gradients, no fills of any kind — only crisp, clean, simple outlines. A {age}-year-old {gender} in a confident hero pose wearing a backwards cap, hoodie, and sneakers. The entire character must fit completely inside the frame — head with hat fully visible at top, feet and shoes fully visible at bottom, generous white space margin on all sides, never cropped or cut off at any edge. Minimal space background as simple outlines only: a few stars, one planet, one small rocket. Thick bold lines easy for a child to color with crayons. Printable coloring book page.
```

---

## Version History

### v1.1.0 (2026-03-14)
- Coloring page: add full-body framing instructions — hat/feet were being cropped
- Image style: removed Pixar/Boss Baby brand references, replaced with descriptive terms
- Removed jersey number from outfit description — text rendering unreliable
- Safety: no adult figures in any visual_description

### v1.0.0 (2026-03-04)
- Initial prompts
- V0 test results: cover + scenes 2-5 look great
- Scene 1 sometimes loses outfit — added `Character must be wearing {signature_look}` reinforcement
- Coloring page came out colored — rewrote prompt to emphasize "no color, no fills, pen and ink"
