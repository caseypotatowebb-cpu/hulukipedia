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
