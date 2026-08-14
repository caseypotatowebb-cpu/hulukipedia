# Gemini Omni Flash Preview — Integration Audit

**Date:** August 14, 2026

## What Omni Flash Is

Google documents `gemini-omni-flash-preview` on Gemini Enterprise Agent Platform and `gemini-omni-flash` on the Gemini Developer API as a preview multimodal model focused on conversational video generation and editing. It accepts text, images, and video and can return video plus generated sound, including speech, music, and effects. The documentation lists 16:9 and 9:16 output at 720p, up to three ten-second videos per prompt, and global availability. It also supports C2PA content credentials.

## Hulukipedia Fit

Omni Flash is not an image generator or image editor, so it should not replace Nano Banana Pro, Venice image models, or the Visual Scene Studio's still-image workflow. Its future fit is a separate **Animate a Frame** or **Micro-Scene** layer: take a completed Portrait/Visual Scene Studio still, let the user choose a short motion concept and audio direction, then submit an explicit video-generation job. It can add movement, ambient sound, and a cinematic beat without confusing a video request with a still-image request.

## Authentication and Platform Decision

Google's current Developer API documentation lists `gemini-omni-flash` and recommends the Interactions API for current media models. It supports authentication by a Gemini / Google AI Studio API key using the `x-goog-api-key` header. Gemini Enterprise Agent Platform uses a separate Vertex-style configuration with a Google Cloud project, region, and service-account authentication. The newly supplied Google Studio credential will first be tested against the Developer API’s Interactions endpoint. If it works, the Worker can use it as a secured `GOOGLE_OMNI_API_KEY` secret without requiring a separate Cloud project configuration.

## User-Facing Requirements Before Adding Omni Flash

1. Keep Omni Flash out of the normal still-image model picker.
2. Add it later as an explicit optional video workflow, with a user-selected source still, aspect ratio, motion direction, sound direction, and a clear preview of the planned clip.
3. Surface that it is preview-stage, 720p, and limited to ten-second output so expectations are clear.
4. Perform one focused text/short-video capability smoke test before exposing the interface.

## Sources

1. https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/omni-flash-preview
2. https://ai.google.dev/gemini-api/docs/models
3. https://ai.google.dev/gemini-api/docs/api-key
4. https://ai.google.dev/gemini-api/docs/migrate-to-cloud

## Account Validation — August 14, 2026

The newly supplied Google Studio credential is valid for the Gemini Developer API. Its authenticated model list includes `gemini-omni-flash-preview`; the shorter `gemini-omni-flash` alias returns a model-not-found response for this account. A direct `POST https://generativelanguage.googleapis.com/v1beta/interactions` request using `x-goog-api-key` and `gemini-omni-flash-preview` completed successfully with the requested `OMNI FLASH ONLINE` output. The response also reported 94 thought tokens, confirming the preview route is operational rather than merely listed.

**Implementation decision:** use the exact account-verified `gemini-omni-flash-preview` model ID. Store the supplied credential only as a Worker secret named `GOOGLE_OMNI_API_KEY`; never reuse it in client code or commit it to the repository.
