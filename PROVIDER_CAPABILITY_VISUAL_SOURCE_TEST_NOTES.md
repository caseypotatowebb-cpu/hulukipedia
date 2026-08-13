# Hulukipedia 3.3.0 — Live Verification Notes

**URL:** https://hulukipedia.teamtomorrowlabs.workers.dev  
**Date:** August 13, 2026

## Completed checks

The production home page visibly serves the black-gold-emerald theme. The global provider menu includes the new Mistral Studio provider and opens a scrollable list containing Mistral Medium 3.5, Mistral Small 4, and Mistral Large 3. The menu exposes the capability legend: `🧠` reasoning, `🔥` uncensored/open creative, `👁` vision, `⚡` faster route, and `🔎` live web research.

A Raven Lara Croft dossier was opened after switching the global provider to Mistral Studio. The Visual Scene Studio now visibly contains independent **Image Source** buttons (Venice AI and Pollinations) and an independent **Image Generator** select. Its default remains Nano Banana Pro, while the Portrait panel retains its own image source/model controls. The Role-Play panel visibly lists the corrected Claude Sonnet 4.5 alternate and Mistral Medium 3.5 alternate alongside Grok 4.20 defaults.

## Remaining live checks

Generate a small visual set using a non-default Venice model from the Visual Scene Studio, confirm gallery-card provenance shows the selected model, then switch Visual Scene Studio only to Pollinations and confirm the portrait source is unaffected. Provider endpoint smoke tests have already succeeded for Claude Sonnet 4.5, Gemini 3.1 Pro (with adequate output budget), Mistral Medium 3.5, Venice Aion 3.0, and Grok 4.20 reasoning.

The independent Studio-source test was completed with a three-frame Lara Croft Editorial Lookbook using **Pollinations**, while Portrait remained visibly configured for Venice AI / Nano Banana Pro. All three gallery cards displayed the `POLLINATIONS` provenance label. The corresponding browser-rendered image URLs each returned HTTP 200 when checked separately after rendering.

This confirms that the Visual Scene Studio source is isolated from the Portrait source and that the stored frame provenance is visible to the user.
