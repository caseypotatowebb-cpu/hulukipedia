# Visual Scene Studio v1.1 — Production Verification

**Date:** 2026-08-13

## Per-Frame Re-Roll Test

A live Raven dossier for Lara Croft was opened. The test selected Pollinations as the image source, created a three-frame Editorial Lookbook, and then pressed **Re-roll Frame** on card 01 only.

| Expected behavior | Observed result |
|---|---|
| Three independent cards appear with their saved scene directions. | Confirmed. Full-Length Hero, Three-Quarter Detail, and Seated Editorial each remained separate cards. |
| Re-rolling one card must not regenerate the entire set. | Confirmed. Only card 01 was updated. Cards 02 and 03 remained in place. |
| The rerolled card needs a clear version indicator. | Confirmed. Card 01 displayed **Take 2** after the re-roll. |
| Original per-card direction must remain visible. | Confirmed. The Full-Length Hero direction remained shown beneath the refreshed card. |

## Compatibility Findings

Qwen Image 3 remains a production-confirmed Venice model: it rendered a three-image scene set through Hulukipedia’s 2K tiered route during the prior Visual Scene Studio verification.

Luma Uni-1 and Z-Image Turbo were tested through the live Worker with their respective aspect-ratio and pixel-controlled request shapes. Both were accepted by the Worker and rejected downstream by Venice with `Venice image error: 403`. This indicates the current Team Tomorrow Venice credential lacks entitlement to use those advertised model IDs. The app now converts that provider response into a clear user-facing availability message and suggests confirmed alternatives, rather than implying the user’s prompt failed.
