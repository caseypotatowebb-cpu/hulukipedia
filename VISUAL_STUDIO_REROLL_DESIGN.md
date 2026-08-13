# Visual Scene Studio v1.1 — Per-Frame Re-Roll Design

## Intent

A scene set should behave like a director’s proof sheet: a user should be able to keep the strong frames and retry the one that missed. Re-running a whole lookbook wastes good work and makes it harder to compare creative choices.

## Stored Frame Contract

Every visual-set card will retain the complete generation contract that created it:

| Stored field | Why it is retained |
|---|---|
| `prompt` | Re-rolls the exact same identity, recipe, pose, and director’s brief without regenerating a new identity anchor. |
| `model` and `source` | A re-roll continues with the model/source selected when the set was made, even if the user changes the global selector later. |
| `aspectRatio`, `width`, `height` | Preserves the intended composition and supports pixel-controlled Venice model paths. |
| `label` and `direction` | Makes the card’s creative purpose visible before and after re-rendering. |
| `rerollCount` | Shows that a card is a new take, rather than creating ambiguity about whether the gallery unexpectedly replaced it. |

## Re-Roll Behavior

The per-card **Re-roll Frame** action only reruns that saved prompt. It retains the current image on screen during rendering, uses a small overlay to show activity, and replaces the image only after a successful response. A failure keeps the prior image, reports an error at card level, and suggests a confirmed model where Venice rejects an entitled-model request.

## Model Availability Feedback

The live compatibility audit showed that an image catalog listing does not guarantee the Team Tomorrow Venice key has access to every advertised model. If Venice responds with a 403, the UI will state that the selected model is not presently enabled for this Venice account and point the user to confirmed choices: Nano Banana Pro, Nano Banana 2, Qwen Image 3, and Qwen Image 3 Pro. This prevents a provider-entitlement response from looking like the user wrote a bad prompt.
