# Venice Image Catalog — Live API Audit

**Source:** `GET https://api.venice.ai/api/v1/models?type=image` queried August 12, 2026 with the Team Tomorrow Venice credential.

The current frontend catalog is mostly correct but missing these live models:

| Model ID | Venice display name | Notable live capability |
|---|---|---|
| `grok-imagine-image-2-0` | Grok Imagine 2.0 | 1K/2K, low or medium quality, several cinematic aspect ratios. |
| `krea-2-turbo` | Krea 2 Turbo | 1K/2K, wide aspect-ratio set. |
| `luma-uni-1` | Luma Uni-1 | Style references, broad portrait/cinematic aspect ratios. |
| `luma-uni-1-max` | Luma Uni-1 Max | Style references; Venice recommendation. |
| `nano-banana-2-lite` | Nano Banana 2 Lite | Fast/lower-cost Nano Banana family option. |
| `seedream-v5-pro` | Seedream V5 Pro | 1K/2K and prompt-optimization thinking. |
| `qwen-image-3` | Qwen Image 3 | 1K/2K and prompt-optimization thinking. |
| `qwen-image-3-pro` | Qwen Image 3 Pro | 1K/2K and prompt-optimization thinking. |

The live API also exposes `bria-bg-remover`, but it is an editing utility rather than a meaningful scene-generation choice and should not appear in the portrait generator dropdown.

Corrections to existing labels: `seedream-v4` now reports itself as **Seedream V4.5**; `wai-Illustrious` reports **Anime (WAI)**; and `grok-imagine-image-quality` reports **Grok Imagine High Quality (SOTA)**.

Nano Banana Pro and Nano Banana 2 expose native Venice web-search support. Hulukipedia’s existing Web Search toggle currently improves the prompt upstream and is intentionally preserved across every model; it is especially valuable for named characters and public subjects. The visible model list should show model-specific model notes without forcing the feature on.

## Smoke Test

A harmless Qwen Image 3 request was tested directly against `POST /api/v1/image/generate` using the app’s planned shape: `aspect_ratio: "3:4"` and `resolution: "2K"`. Venice returned a successful PNG payload (6,609,504-byte JSON response with image data), confirming the new resolution-tier routing for `qwen-image-3`.
