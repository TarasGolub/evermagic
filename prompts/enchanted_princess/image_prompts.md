# EverMagic — Image Prompt Templates
# Version: 1.0.0
# Theme: Enchanted Princess Adventure
# Model: gpt-image-1
#
# These templates are used by n8n-build-image-prompts.js

## Style Prefix (every image)

```
3D CGI animated character, Pixar-style render, soft pastel fantasy world, warm sparkle and magical light, soft subsurface scattering, cinematic depth of field
```

## Character Description Template

```
A {age}-year-old {gender} with {hair_color} hair and {skin_tone} skin, {signature_look}
```

## Cover Prompt

```
{style_prefix}. {character}. Standing gracefully with one hand resting on a pony-sized unicorn's mane, looking forward with a warm confident smile. Unicorn: {companion_appearance}. Background: enchanted meadow with a rainbow arch overhead, glowing flower fields, and a fairy castle glowing in the distance. Soft luminous sparkle lighting, pastel rainbow tones. Centered composition, warm storybook cover framing.
```

## Scene Prompt Template

```
{style_prefix}. {character}. {visual_description}. Character must be wearing {signature_look}. {lighting}. {camera}, cinematic depth of field.
```

### Scene Lighting & Camera Map

| Scene | Lighting | Camera |
|-------|----------|--------|
| 1 — The Sparkle | Warm golden bedroom glow, soft magical shimmer and sparkle particles | Close-up on child and glowing magical item |
| 2 — The Kingdom | Soft pastel rainbow sky — pinks, lavenders, aqua tones, luminous | Wide shot — rainbow arch dominant |
| 3 — The Shadow | Muted, slightly desaturated pastels — colors drained | Medium shot, sky visibly dimmer |
| 4 — The Restoration | Vibrant burst of pastels and rainbow light | Epic wide panoramic, rainbow overhead |
| 5 — The Return | Soft lavender evening, rainbow shimmer outside window | Intimate close-up |

## Coloring Page Prompt

```
Black and white line art coloring page, pure black outlines on white background only, absolutely no color, no shading, no gradients, no fills, pen and ink style. A {age}-year-old {gender} with arms open wide in a joyful graceful pose, wearing {signature_look}. Full body visible from head to toe — never cropped. Character centered with generous white space margin. Simple fantasy background as outlines only: unicorn, rainbow arch, castle towers, flowers, stars, butterfly. Thick clean lines suitable for children to color with crayons. Coloring book page style, printable.
```
