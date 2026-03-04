# EverMagic — Space Hero Mission — Visual Style Guide

## Art Direction

All images must follow a consistent **Pixar-style 3D animated** look:

- **Style:** High-quality 3D CGI render, Pixar/Illumination animation style
- **Character proportions:** Exaggerated — large head (~40% of body height), oversized expressive eyes, small body. Think "Boss Baby" or "Despicable Me" proportions.
- **Facial features:** Big round eyes with light reflections, small nose, expressive eyebrows, soft round cheeks
- **Rendering:** Soft subsurface scattering on skin, smooth plastic-like hair, subtle ambient occlusion
- **Lighting:** Cinematic, warm key light with cool fill. Every scene should feel like a film frame with dramatic but gentle lighting.
- **Color palette:** Rich, saturated colors. Deep space blues (#0a1628, #1a2744), warm golden highlights (#ffd166, #f4a261), vibrant accents per scene emotion.
- **Camera:** Cinematic compositions — rule of thirds, depth of field with soft bokeh backgrounds, low or eye-level angles to make the child feel heroic.
- **Mood:** Every frame should feel like a movie poster — epic but warm, magical but safe.

## Character Consistency Rules

Every image prompt MUST include these character details:
1. Hair color + style (from order)
2. Skin tone (from order)
3. Eye size: "large expressive Pixar-style eyes"
4. Outfit: exact description from `signature_look` field
5. Accessories: glasses if `glasses: true`, jersey number if provided
6. Proportions: "Boss Baby / Pixar style proportions with oversized head and big expressive eyes"

## Scene-Specific Guidelines

| Scene | Lighting | Mood Colors | Camera |
|-------|----------|-------------|--------|
| 1 — The Call | Warm moonlight + cool ambient | Blues, soft gold | Wide establishing shot |
| 2 — The Launch | Dynamic warm + streak lights | Orange, silver | Over-shoulder or low angle |
| 3 — The Challenge | Dramatic side lighting | Teal, amber, tension | Medium tracking shot |
| 4 — The Triumph | Radiant burst lighting | Gold, cosmic colors | Epic wide panoramic |
| 5 — The Return | Golden hour sunrise | Warm gold, soft pink | Intimate close-up |

## Cover Image Guidelines

- Hero character in a **powerful, confident pose** (hands on hips, looking up, or mid-action)
- Background: cosmic/space setting with vibrant nebula colors
- Lighting: dramatic rim light from behind, warm key light on face
- Framing: centered, slightly low angle to make character look heroic
- Must feel like a **movie poster**

## Coloring Page Guidelines

- Same character pose as cover but rendered as **clean black line art**
- White background, no fills or shading
- Thick outlines (suitable for children's coloring)
- Simple, clear shapes — no complex textures
- Fun background elements (stars, planets, rockets) as simple outlines

## Prompt Template

Every Flux prompt should follow this structure:

```
[STYLE PREFIX], [CHARACTER DESCRIPTION], [ACTION/POSE], [ENVIRONMENT], [LIGHTING], [CAMERA/FRAMING]
```

### Style Prefix (use for ALL images):
```
Pixar-style 3D CGI animated character render, Boss Baby proportions with oversized head and large expressive eyes, high-quality cinematic lighting, soft subsurface scattering, shallow depth of field
```

### Example Scene Prompt:
```
Pixar-style 3D CGI animated character render, Boss Baby proportions with oversized head and large expressive eyes. A 7-year-old boy with brown hair, light skin, wearing a red hoodie with a dinosaur patch, blue sneakers, and a backwards cap. He sits on a blanket in a cozy backyard at night, studying a glowing fossil. Soft moonlight with cool blue ambient lighting and warm golden glow from the fossil. Wide establishing shot, low angle, cinematic depth of field with twinkling stars bokeh.
```
