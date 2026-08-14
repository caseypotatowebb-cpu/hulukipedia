# Pearl Refresh, Visual Set Planner, and Omni Flash Design

**Date:** August 14, 2026

## Pearl White-and-Gold Direction

The redesign will replace the current obsidian/emerald base with a single Pearl Peregrine visual family: warm porcelain (`#FFFDF7`) surfaces, faint champagne (`#FBF3DE`) section paper, dark espresso typography (`#302415`), and antique gold hierarchy (`#B8860B` / `#8A6200`). The result should be bright and ceremonial without becoming a generic beige dashboard. Raven and Starling remain contextual labels, but both use the same pearl-and-gold foundation; their difference comes from restrained highlight tint and copy, not a separate dark/light product identity.

## Visual Set Planner

The Visual Scene Studio will become a deliberate three-step planning surface rather than a recipe that silently chooses frames.

| Step | User decision | Result before generation |
|---|---|---|
| 1. Set scale | Select exactly 1–5 frames. | Planner reports the required number of selected shots. |
| 2. Angles & positions | Choose individual coverage cards: full-length front, three-quarter, seated, profile, rear three-quarter, walking, active gesture, environmental wide, over-the-shoulder, or close character frame. | The planned frame list shows the exact selected angle and order. No image request begins. |
| 3. Wardrobe system | Choose Signature Continuity, Two-Look Arc, Editorial Variations, or Custom Wardrobe Brief. | Each planned frame declares how its outfit will be handled before generation. |

A recipe remains an optional art-direction scaffold, not a hidden batch authority. A user may load a recipe's suggested coverage, modify it, or create a custom set from scratch. The launch control remains disabled until the number of selected angles exactly equals the chosen set size, and its label explicitly names the frame count: for example, `Generate planned 3-frame set`.

## Outfit Logic

| System | Prompt behavior |
|---|---|
| Signature Continuity | One coherent signature look across every frame. |
| Two-Look Arc | The set moves from an opening look to a second look halfway through, with an explicit transition in the plan preview. |
| Editorial Variations | Each shot receives an intentional variation within one clear style family; identity and setting remain consistent. |
| Custom Wardrobe Brief | The user's wardrobe direction is appended to every frame and required before launch. |

## Omni Flash Preview

The provided credential verified the direct Gemini Developer API model ID `gemini-omni-flash-preview` through the Interactions endpoint. The first integration will expose **Google Omni Flash** as a capability-marked provider for text/multimodal investigation, where its tested text-response path is reliable and useful immediately. The Worker will keep its key in `GOOGLE_OMNI_API_KEY` and normalize its Interactions API output to the standard Hulukipedia text response shape.

A separate Animate a Frame / Micro-Scene video UI is intentionally deferred. It needs an explicit source-still chooser, 16:9/9:16 format selection, motion and audio direction, request/poll lifecycle, video preview/download treatment, and a clear preview-stage disclosure. It should be built as a deliberate second visual workflow rather than squeezed into the still-image planner.
