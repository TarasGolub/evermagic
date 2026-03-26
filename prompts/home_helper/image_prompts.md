# EverMagic — Image Prompt Templates
# Version: 1.0.0
# Theme: Home Helper Hero
# Model: gpt-image-1
#
# These templates are used by n8n-build-image-prompts.js

## Style Prefix (every image)

```
3D CGI animated character, Pixar-style render, cozy warm home interior, soft amber light, intimate scale, soft subsurface scattering, cinematic depth of field
```

## Character Description Template

```
A {age}-year-old {gender} with {hair_color} hair and {skin_tone} skin, {signature_look}
```

## Cover Prompt

```
{style_prefix}. {character}. Kneeling in a cozy warm home interior, holding out cupped hands with a tiny glowing sprite resting in their palms — {companion_appearance}. Sprite is no larger than the child's thumb. Background: warm kitchen or living room, tiny glowing lights visible in the baseboards and flower pots hinting at the hidden world. Warm amber light with soft sprite glow. The scale contrast between child and sprite is the visual heart of the image. Centered composition, intimate and wondrous framing.
```

## Scene Prompt Template

```
{style_prefix}. {character}. {visual_description}. Character must be wearing {signature_look}. {lighting}. {camera}, cinematic depth of field.
```

### Scene Lighting & Camera Map

| Scene | Lighting | Camera |
|-------|----------|--------|
| 1 — The Shimmer | Warm amber home interior, natural everyday light, single tiny shimmer near baseboards | Medium wide, child doing chores |
| 2 — The Hidden Village | Warm amber + soft green magical glow, tiny lights twinkling in walls | Low angle — tiny village perspective, child towers above |
| 3 — The Crisis | Slightly dimmer, cooler warm tones, cozy magic subtly reduced | Intimate close-up, quiet urgency |
| 4 — The Celebration | Warm golden glow fully restored, sparkles and tiny lights everywhere | Low angle wide, tiny celebration fully visible |
| 5 — The Secret | Softest warmest evening light, faint shimmer at edge of frame | Intimate close-up on child's face |

> **Scale rule (mandatory):** Whenever the sprite appears in a prompt, include a scale reference — a real household object that makes the sprite's tiny size clear (e.g. "sprite sitting on the rim of a flower pot", "sprite standing beside a pencil", "sprite perched on the edge of a spoon").

## Coloring Page Prompt

```
Children's coloring page for a young child to color inside the lines. Pure black outlines on solid white background only. Absolutely no color, no shading, no cross-hatching, no gradients, no fills of any kind — only crisp, clean, simple outlines. A {age}-year-old {gender} holding out cupped hands gently, looking down with wonder, wearing {signature_look}. A tiny sprite visible in their palms. The entire character must fit completely inside the frame — fully visible from head to toe, generous white space margin on all sides, never cropped or cut off at any edge. Minimal home background as simple outlines only: a flower pot, a bookshelf, a small door in the baseboard. Thick bold lines easy for a child to color with crayons. Printable coloring book page.
```
