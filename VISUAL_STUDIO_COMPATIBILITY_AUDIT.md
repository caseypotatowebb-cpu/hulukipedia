# Visual Scene Studio Compatibility Audit

**Date:** 2026-08-13

## Results

| Model family | Model checked | Request path | Result | Interpretation |
|---|---|---|---|---|
| Resolution-tier | Qwen Image 3 | Live Hulukipedia Visual Scene Studio | Success: three independent scene cards rendered. | The 1K/2K resolution + aspect-ratio routing works in production. |
| Aspect-ratio | Luma Uni-1 | Live Hulukipedia `/api/image` proxy with `3:2` aspect ratio | Venice returned HTTP 403. | The Worker correctly accepted and routed the request; the current Team Tomorrow Venice credential does not have generation entitlement for this model. |
| Pixel-controlled | Z-Image Turbo | Live Hulukipedia `/api/image` proxy with `768×512` dimensions | Venice returned HTTP 403. | The Worker correctly accepted and routed the request; the current Team Tomorrow Venice credential does not have generation entitlement for this model. |

## Important Distinction

The model selector reflects IDs surfaced by Venice’s image catalog audit. Venice can advertise a model that a particular API key cannot yet invoke. That is an **account entitlement / provider availability** result, not a frontend or request-shape failure.

The deployment uses an optional `APP_TOKEN` gate. Manual scripted calls need a same-origin `Origin` header or the configured `x-app-token`; the test calls used the same-origin header and passed the Worker gate. The returned `Venice image error: 403` therefore came from Venice after the Worker forwarded the model request.

## Product Follow-up

The UI should preserve the current catalog but describe model availability honestly when Venice denies a specific model. The per-frame re-roll implementation will introduce clear, model-specific error text that tells a user to choose a confirmed model (Nano Banana Pro, Nano Banana 2, Qwen Image 3, or Qwen Image 3 Pro) rather than suggesting their prompt is at fault.
