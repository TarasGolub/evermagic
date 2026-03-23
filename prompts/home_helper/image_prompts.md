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
Black and white line art coloring page, pure black outlines on white background only, absolutely no color, no shading, no gradients, no fills, pen and ink style. A {age}-year-old {gender} holding out cupped hands gently, looking down with wonder, wearing {signature_look}. A tiny sprite (no larger than the child's thumb) visible in their palms, standing beside a household object for scale. Full body of child visible — never cropped. Character centered with generous white space margin. Simple home background as outlines only: flower pot, bookshelf, tiny doors in baseboard, stars, small glowing lights. Thick clean lines suitable for children to color with crayons. Coloring book page style, printable.
```
