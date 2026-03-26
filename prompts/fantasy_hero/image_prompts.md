# EverMagic — Image Prompt Templates
# Version: 1.0.0
# Theme: Fantasy Hero Quest
# Model: gpt-image-1
#
# These templates are used by n8n-build-image-prompts.js

## Style Prefix (every image)

```
3D CGI animated character, Pixar-style render, enchanted fantasy setting, warm magical lighting, soft subsurface scattering, cinematic depth of field
```

## Character Description Template

```
A {age}-year-old {gender} with {hair_color} hair and {skin_tone} skin, {signature_look}
```

## Cover Prompt

```
{style_prefix}. {character}. Standing in a heroic pose with one arm raised, looking forward with a bright confident smile. Beside them: a small dog-sized dragon with {companion_appearance}. Background: enchanted kingdom with glowing castle spires, twilight sky filled with floating lanterns and magical stars. Dramatic rim light from behind, warm key light on face. Centered composition, low angle to make character look heroic. Movie poster framing.
```

## Scene Prompt Template

```
{style_prefix}. {character}. {visual_description}. Character must be wearing {signature_look}. {lighting}. {camera}, cinematic depth of field.
```

### Scene Lighting & Camera Map

| Scene | Lighting | Camera |
|-------|----------|--------|
| 1 — The Call | Warm bedroom glow with mysterious blue-green magical shimmer from artifact | Close-up, warm-cool contrast |
| 2 — The Journey | Dappled golden-green enchanted forest light, soft magic sparkle | Wide establishing shot, deep bokeh |
| 3 — The Challenge | Cool-toned cave or ruin, single warm hero spotlight | Medium tracking shot, slight tension |
| 4 — The Triumph | Epic golden burst, warm amber and gold | Epic wide panoramic, low angle |
| 5 — The Return | Soft warm evening bedroom, single bright star through window | Intimate close-up |

## Coloring Page Prompt

```
Children's coloring page for a young child to color inside the lines. Pure black outlines on solid white background only. Absolutely no color, no shading, no cross-hatching, no gradients, no fills of any kind — only crisp, clean, simple outlines. A {age}-year-old {gender} in a heroic pose with one arm outstretched, wearing {signature_look}. The entire character must fit completely inside the frame — fully visible from head to toe, generous white space margin on all sides, never cropped or cut off at any edge. Minimal fantasy background as simple outlines only: one small castle tower, a few stars, one small friendly dragon. Thick bold lines easy for a child to color with crayons. Printable coloring book page.
```
