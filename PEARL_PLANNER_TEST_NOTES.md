# Pearl Planner and Omni Flash Live Test Notes

**Date:** August 14, 2026

## Initial Production Verification

The cache-busted `3.5.0` homepage loaded with the intended Pearl white-and-gold visual family: warm off-white page background, light ivory cards, antique-gold headings and actions, and dark espresso content text. The homepage is visibly distinct from the previous obsidian/emerald release while retaining the Hulukipedia hierarchy.

The shared provider selector opens successfully and shows **Google Omni Flash** alongside the existing direct providers. The menu also displays the extended capability key, including the new `🎬 video / media preview` marker.

## Remaining Checks

1. Select Omni Flash in the Ask the Archive console and validate the deployed Worker route.
2. Open a dossier and verify Visual Scene Studio presents a count/angle/outfit plan before it can generate a set.
3. Confirm output plan state and live generation once a complete selected plan is submitted.

## Omni Flash Verification

The production Worker accepted a same-origin `/api/ai` request with provider `omni`, model `gemini-omni-flash-preview`, and returned `HULUKIPEDIA OMNI ONLINE` with HTTP 200. The live provider menu visibly includes Google Omni Flash, its preview model, and the new `🎬` capability legend entry.

During browser verification, the provider menus behave as independent overlays; selecting the global Omni provider while the Ask the Archive menu was open left both menus visible. This does not affect the provider route, but a fresh page navigation will be used before testing the Visual Scene Studio to avoid overlay state contaminating the UI check.

## Fresh Deployment Check

After the final selector-close patch, a cache-busted Pearl homepage loaded cleanly with the warm white-and-gold treatment. A fresh Lara Croft Raven search was started to validate the deliberate Visual Set Planner after the deployment.

The fresh Raven query produced the expected Lara Croft disambiguation options in the new Pearl palette. The next browser step will select the canonical fictional protagonist and inspect the planner UI.

## Explicit Planning Gate

The live Visual Scene Studio shows every available shot with its actual angle/position direction, the planned-count buttons, an outfit system, and a textual output preview. After deselecting the third default frame, the planner changed from `3 / 3 planned` to `2 / 3 planned`, and its action changed to `Finish 3-frame plan to generate`. This confirms that the system no longer silently generates a recipe-defined batch before the user decides its coverage.

The planned set was deliberately completed with Full-Length Hero, Three-Quarter Detail, and Walking Arrival—not the original seated third frame. The preview updated to list those exact three shots. Switching the Visual Scene Studio alone to Pollinations retained the selected coverage and clearly replaced the model dropdown with a source explanation, confirming the batch source is independent of the portrait’s Nano Banana configuration.

## Planned Set Generation

The complete plan was launched with Pollinations. The gallery created exactly three cards with the selected-frame labels and source provenance: Full-Length Hero, Three-Quarter Detail, and Walking Arrival. Each card completed as an independent image and preserved the planned shot direction for future frame-level re-rolls. This completes the production validation that the new workflow only generates the number, positions, and source the user has explicitly selected.
