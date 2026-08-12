# Visual Scene Studio — Live Test Notes

**Date:** 2026-08-12

A live Raven dossier for Lara Croft was opened successfully. The Visual Scene Studio rendered the full current grouped image catalog, including Qwen Image 3, the selected-model capability note, six curated scene recipes, three/five output choices, and a director’s brief field.

**End-to-end test:** Qwen Image 3 selected; Editorial Lookbook; three-image set; brief: `sunlit archaeological dig above a sea cliff, practical expedition wardrobe, self-possessed mood, grounded adventure-film realism`.

The gallery immediately created three independently labeled cards. After the first render interval, cards 01 (Full-Length Hero) and 02 (Three-Quarter Detail) had each returned a distinct full-body image, while card 03 was still rendering. The first successful set image was also promoted to the existing Portrait panel as intended.

The test confirms the new current-model selection, scenario prompt assembly, sequential generation flow, independent gallery rendering, and legacy portrait compatibility are all functioning in production. Final completion of card 03 will be checked before handoff.

All three independent Qwen Image 3 cards completed successfully in production. The three cards were rendered as individual images and remained clickable in the gallery, confirming the complete three-image workflow.

The initial Editorial Lookbook outputs remained too similar in posture, even though the cards were distinct. Before final handoff, the recipe was strengthened with explicit non-duplicative pose constraints: standing hero, leaning three-quarter, unmistakably seated editorial, active walking frame, and waist-up character frame. This prompt-only refinement preserves the clean base identity prompt while pushing the scenario set toward genuinely varied coverage.
