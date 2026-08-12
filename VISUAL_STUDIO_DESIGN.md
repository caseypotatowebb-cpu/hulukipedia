# Hulukipedia Visual Scene Studio — Implementation Design

## Purpose

Turn the existing one-click Portrait panel into a small creative director’s console. The existing portrait workflow remains intact and keeps the restored, deliberately simple Nano Banana prompt. The new workflow adds an independent **three-image visual set** built from a shared identity anchor and distinct camera/scenario directions.

The product goal is not a contact sheet. Each result is a standalone image in a gallery so the user can inspect it, enlarge it, and use it independently.

## Control Model

| Control | Design decision |
|---|---|
| Image model | Keep a grouped, current Venice model selector. Present a concise description beneath it, based on the live catalog audit. |
| Source | Preserve Venice AI and Pollinations paths. Venice is the intended full-quality path; Pollinations remains available for quick experimentation. |
| Prompt grounding | Preserve the existing Web Search prompt-grounding toggle. It remains off by default. |
| Scene recipe | Offer visually legible, curated presets: Editorial Lookbook, Character Turnaround, Motion & Presence, Candid Day Out, Cinematic Evening, and Signature World. |
| Scene brief | One optional freeform field for wardrobe, environment, mood, or story context. This is deliberately broad rather than a pile of narrow knobs. |
| Batch size | Offer three or five standalone images. Three is the default. |
| Gallery | Render progress/error/result cards as each image arrives. First successful image continues to populate the legacy main portrait display. |

## Prompt Architecture

1. **Identity anchor:** Invoke the unchanged image prompt generator. It creates the concise base description that worked well with Nano Banana Pro.
2. **Scene extension:** Append only three structured pieces: recipe atmosphere, shot-specific pose/framing, and the optional user scene brief. This keeps the original prompt from being buried under contradictory prompt engineering.
3. **Shared identity:** All outputs in a visual set inherit the same identity anchor. The shot directions change composition and action, not the base subject description.

## Recipes

| Recipe | Visual purpose | Example shots |
|---|---|---|
| Editorial Lookbook | Polished visual-marketing portrait set. | Full length, three-quarter, seated/cropped editorial. |
| Character Turnaround | Clear visual understanding across angles. | Front-facing full length, profile/three-quarter, rear three-quarter. |
| Motion & Presence | Natural movement and body language. | Approaching camera, in-motion side frame, over-the-shoulder pause. |
| Candid Day Out | Warm documentary realism. | Walking arrival, candid interaction, resting moment. |
| Cinematic Evening | Mood and environmental storytelling. | Establishing frame, mid-scene portrait, dramatic close/medium frame. |
| Signature World | Character-specific worldbuilding. | Location arrival, action/interaction, iconic closing image. |

## Worker Sizing Strategy

The image proxy will use the current live Venice catalog’s actual capability families. It will send `resolution` only to tiered models, `aspect_ratio` only to aspect-controlled models, and pixel dimensions to legacy/pixel-controlled models. This removes the current broad “treat most models as resolution-tiered” fallback and supports the newly released models without invalid sizing fields.
