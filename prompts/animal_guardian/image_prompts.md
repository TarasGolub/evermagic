# EverMagic — Image Prompt Templates
# Version: 1.0.0
# Theme: Animal Guardian Hero
# Model: gpt-image-1
#
# These templates are used by n8n-build-image-prompts.js

## Style Prefix (every image)

```
3D CGI animated character, Pixar-style render, magical nature setting, warm natural light, lush greens and soft gold, soft subsurface scattering, cinematic depth of field
```

## Character Description Template

```
A {age}-year-old {gender} with {hair_color} hair and {skin_tone} skin, {signature_look}
```

## Cover Prompt

```
{style_prefix}. {character}. Kneeling gently in a magical forest clearing with cupped hands held out, a small glowing {companion_type} resting in their hands — {companion_appearance}. Background: magical forest clearing with glowing plants, soft golden light filtering through ancient trees, small magical creatures visible in the background. Warm golden natural light with soft magical glow from companion. Centered composition, intimate and warm framing.
```

## Scene Prompt Template

```
{style_prefix}. {character}. {visual_description}. Character must be wearing {signature_look}. {lighting}. {camera}, cinematic depth of field.
```

### Scene Lighting & Camera Map

| Scene | Lighting | Camera |
|-------|----------|--------|
| 1 — The Discovery | Soft warm dawn light, amber and sage green, single faint magical glow | Medium wide, home or garden setting |
| 2 — The Hidden Realm | Rich lush emerald forest, dappled golden magical light, sparkle in air | Wide establishing shot, forest scale |
| 3 — The Imbalance | Cool blue-green tones, slight desaturation, nature in quiet distress | Closer tracking shot, stillness |
| 4 — The Bloom | Warm golden burst, animals emerging, forest glowing restored | Wide panoramic, celebration |
| 5 — The Gift | Soft warm evening home light, faint magical shimmer near window | Intimate close-up, child holds gift |

## Coloring Page Prompt

```
Black and white line art coloring page, pure black outlines on white background only, absolutely no color, no shading, no gradients, no fills, pen and ink style. A {age}-year-old {gender} kneeling gently with arms open in a welcoming gesture, wearing {signature_look}. Full body visible from head to toe — never cropped. Character centered with generous white space margin. Simple nature background as outlines only: forest trees, flowers, butterflies, a winding path, small woodland animals, a glowing plant. Thick clean lines suitable for children to color with crayons. Coloring book page style, printable.
```
