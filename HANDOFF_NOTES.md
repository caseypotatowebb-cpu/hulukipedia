# Hulukipedia — Team Handoff and Deployment Notes

**Maintained by:** Team Tomorrow Labs  
**Latest deployed source:** [`e4dfb1f`](https://github.com/caseypotatowebb-cpu/hulukipedia/commit/e4dfb1f) — August 13, 2026  
**Live application:** <https://hulukipedia.teamtomorrowlabs.workers.dev>

---

## Current Product State

Hulukipedia is a React/Vite dossier generator served through a Cloudflare Worker. The frontend is a static asset bundle and the Worker is the secure proxy for text generation, research, web search, and image generation. Provider credentials are stored as Cloudflare Worker secrets rather than in the browser bundle.

The current production state includes Perplexity Sonar as the initial research default, multi-provider section overrides, RAG-first physical-description and communication-profile flows, a role-play panel, portrait lightbox, a current Venice image-model catalog, the image-prompt web-search toggle, and the new Visual Scene Studio. Nano Banana Pro remains the default portrait model, with the deliberately simple prompt format restored for both modes.

| Area | Current behavior |
|---|---|
| Initial fact-finding | Perplexity Sonar is the default provider and confirmed live. |
| Real-subject portrait prompt | Photorealistic professional portrait photography. |
| Fictional-character portrait prompt | Photorealistic cinematic, live-action-adaptation framing. |
| Image grounding | Portrait-panel **Web Search ON/OFF** toggle; defaults to OFF. |
| Image sources | Venice AI primary; Pollinations fallback. |
| External image links | Raven exposes Rule34; Starling exposes CelebJihad; both are visually labeled NSFW. |
| Role-play | Session-only character conversation with its own provider/model controls. |
| Visual Scene Studio | Generates three or five standalone scene images with shared identity grounding, varied poses, and a director's brief. |

## New: Visual Scene Studio & Current Venice Catalog

The Portrait panel now contains an audited, grouped catalog of Venice image models. The list was refreshed directly from Venice's live `GET /api/v1/models?type=image` response on August 12, 2026. It adds Grok Imagine 2.0, Krea 2 Turbo, Luma Uni-1 / Max, Nano Banana 2 Lite, Seedream V5 Pro, Qwen Image 3 / Pro, and corrected model labels such as Seedream V4.5 and Anime (WAI). The image Worker now distinguishes resolution-tier, aspect-ratio, and pixel-controlled models rather than applying the same request shape to nearly everything.

**Visual Scene Studio** is the new full-width gallery beneath the dossier’s Portrait/Intel row. It preserves the original single-portrait flow and adds a deliberate multi-image path:

| Control | Behavior |
|---|---|
| **Scene Recipe** | Editorial Lookbook, Character Turnaround, Motion & Presence, Candid Day Out, Cinematic Evening, or Signature World. |
| **Set Size** | Three standalone images or a five-image lookbook. |
| **Director's Brief** | Optional creative direction for setting, wardrobe, mood, visual-marketing intent, or narrative context. |
| **Shared identity anchor** | A single concise identity prompt is prepared once, then applied to all cards while each card receives its own composition/pose direction. |
| **Gallery** | Generates independent images in sequence; each card reports progress, supports error isolation, opens in the lightbox, and the first finished image also populates the legacy Portrait card. |

The studio deliberately asks for **one image per prompt**, never a contact sheet or collage. Editorial Lookbook has explicit pose differentiation: standing hero, leaning three-quarter, unmistakably seated editorial, mid-stride arrival, and waist-up character framing. Other recipes use their own camera and narrative logic.

**Production verification:** A live Lara Croft set used **Qwen Image 3**, Editorial Lookbook, a sea-cliff archaeological brief, and the three-image option. All three cards rendered successfully as independent full-body images. The test identified that the initial editorial pose instructions could be more forceful, so the final deployment strengthened those prompt directions before handoff. See `VISUAL_STUDIO_TEST_NOTES.md`; live catalog notes and the Qwen Image 3 request-shape smoke test are in `research_venice_catalog_2026-08-12.md`.

### Visual Scene Studio v1.1: Per-Frame Re-Roll

Each completed card now retains its exact identity anchor, model/source selection, saved prompt, requested aspect ratio, output dimensions, scene direction, and take number. **Re-roll Frame** only regenerates that one card. It does not re-run the entire set or regenerate the shared identity anchor. The existing image remains visible under a re-render overlay until the new take succeeds; a failed re-roll keeps the earlier good frame intact.

**Live verification:** A Pollinations three-frame Lara Croft set was generated, then only Frame 01 was re-rolled. The card updated to **Take 2** while Frames 02 and 03 stayed untouched. The full result is recorded in `VISUAL_STUDIO_REROLL_TEST_NOTES.md`.

### Venice Availability: Catalog Is Not Entitlement

The model dropdown remains a current upstream Venice catalog, but a listed model may not yet be enabled for the Team Tomorrow Venice credential. Qwen Image 3 is confirmed through the live 2K scene-set flow. Luma Uni-1 (aspect-ratio route) and Z-Image Turbo (pixel route) both passed through the Worker but received Venice HTTP 403 responses, demonstrating a provider entitlement limitation rather than a bad prompt or bad frontend route.

The visual studio now translates this specific error into clear guidance and recommends confirmed choices: **Nano Banana Pro, Nano Banana 2, Qwen Image 3, and Qwen Image 3 Pro**. The detailed results are in `VISUAL_STUDIO_COMPATIBILITY_AUDIT.md`.

## New: Raven Fictional Operation Controls

The first practical step toward the configurable surveillance/encounter vision is now live in **Raven** mode. The Addendums card contains a **Fictional Operation Parameters** panel that affects both the Field Observation Log and Encounter Simulation.

| Control | Purpose | Default |
|---|---|---|
| **Observer / perspective** | Names the person, relationship, or narrative point of view shaping the scene. | `Field Observer` |
| **Narrative assignment** | Sets the dramatic question being tested. Presets: Observe & Document, Protective Detail, Trust & Rapport Assessment, Negotiation / Recruitment, Fictional Rescue / Recovery, Undercover Social Encounter, and Custom Narrative Assignment. | Observe & Document |
| **Story tone** | Selects Grounded Field Notes, Tense Noir, Low-Key / Character Intimate, or High-Stakes Adventure. | Grounded Field Notes |
| **Assignment / scenario context** | Accepts a freeform story setup that is carried into both addendum prompts. | Empty |

The controls are intentionally scoped to fictional, character-centered scenes. They are designed to surface canon-consistent choices, dialogue, emotional pressure, and relationship dynamics—not real-world tracking, coercion, evasion, weapons, or operational tradecraft. Do not remove that boundary when iterating on the feature; it keeps the mechanism focused on the immersive character simulation the product is meant to provide.

### Implementation Map

The feature is frontend-only; no Worker changes were required.

| Location | Responsibility |
|---|---|
| `src/Hulukipedia.jsx` → `OPERATION_MISSIONS`, `OPERATION_TONES` | Preset definitions and labels. |
| `src/Hulukipedia.jsx` → `buildOperationContext()` | Converts the selected controls into context appended to Raven addendum prompts. |
| `src/Hulukipedia.jsx` → `operationConfig` state | Stores observer, mission, tone, and assignment during the dossier session. |
| `src/Hulukipedia.jsx` → `generateSection()` | Adds the context only for Raven `addendum1` and `addendum2`. |
| `src/Hulukipedia.jsx` → Addendums card | Renders the controls only in Raven mode. |

**Live verification:** A Lara Croft test accepted an observer, a Trust & Rapport Assessment mission, and a custom scenario. The generated encounter identified the selected observer and mission in the output, confirming that the controls reach the text-generation path. The first test also exposed an overly tactical legacy prompt; it was immediately replaced with the current character-scene format before the final deployment.

---

## Safe Deployment Workflow

> **Source of truth:** Always start from a fresh `git pull` or fresh clone. Do not treat an older sandbox working directory as authoritative. A prior session almost overwrote Lightbox and Role-Play features by deploying an outdated local copy.

### Recommended workflow

```bash
# 1. Begin from the canonical repository
cd /home/ubuntu
gh repo clone caseypotatowebb-cpu/hulukipedia hulukipedia-work
cd hulukipedia-work

# 2. Install/build
pnpm install
./node_modules/.bin/vite build

# 3. Sync the deployment directory expected by deploy.py
rm -rf /home/ubuntu/hulukipedia
cp -a /home/ubuntu/hulukipedia-work /home/ubuntu/hulukipedia
cd /home/ubuntu/hulukipedia
./node_modules/.bin/vite build
python3 deploy.py

# 4. Commit and publish source after verification
cd /home/ubuntu/hulukipedia-work
git add -A
git commit -m "Describe the change"
git push origin main
```

### Why not `wrangler deploy`?

The sandbox-level `CLOUDFLARE_API_TOKEN` behaves as a Global API Key and uses `X-Auth-Email` plus `X-Auth-Key`, while Wrangler expects a Bearer-style API token and can become trapped in its browser OAuth path. The checked-in `deploy.py` handles the required Workers-with-Assets upload sequence directly: asset manifest, changed-asset upload, then Worker upload with the completion JWT.

## New Cloudflare Connector

The newly added **Cloudflare** connector is enabled and was verified against the Team Tomorrow Labs account (`968f6ba56b79ff3abf8a2cf0aac0aba1`). It can access Cloudflare documentation, search the Cloudflare OpenAPI specification, and execute authenticated Cloudflare API requests. It successfully read the `hulukipedia` Worker, including its deployment modification timestamp.

It also exposes the Worker module-upload endpoint, so it is now a capable fallback for diagnostics and direct Worker API work. For normal Hulukipedia deployments with static assets, prefer the proven `deploy.py` process above until the team deliberately replaces it with a connector-based asset upload implementation.

---

## Provider and Worker Reference

| Provider | Worker secret | Primary use |
|---|---|---|
| Venice AI | `VENICE_API_KEY` | Text models, Nano Banana Pro and other image models, image proxy. |
| Perplexity | `PERPLEXITY_API_KEY` | Initial fact-finding, deep research, and citation-backed search. |
| Anthropic | `ANTHROPIC_API_KEY` | Claude generation and role-play alternatives. |
| OpenAI | `OPENAI_API_KEY` | Direct text generation. |
| Google Gemini | `GEMINI_API_KEY` | Direct text generation and selected addendum default. |
| xAI / Grok | `XAI_API_KEY` | Physical descriptions, strategic analysis, and direct models. |
| OpenRouter | `OPENROUTER_API_KEY` | Additional multi-model routing. |

The Worker health response still labels itself `version: "3.0.1"`; this is a stale cosmetic string in `worker/index.js`, not the live frontend feature state. Do not use that string as a release tracker. Use GitHub commit IDs and the static asset name on the deployed page instead.

## Next Product Moves

The new Raven controls are a good foundation, not the final surveillance/encounter engine. The next developer should choose one coherent extension rather than making a broad rewrite.

| Priority | Candidate extension | Why it follows naturally |
|---|---|---|
| 1 | **Saveable scenario presets** | Lets the team keep and reuse strong observer/mission combinations across dossiers. |
| 2 | **Narrative output variants** | Generate multiple branches of the same scenario, such as cooperation, refusal, escalation, and reconciliation. |
| 3 | **Raven/Starling convergence** | Replace the hard mode split with contextual subject classification while retaining mode-specific presentation where useful. |
| 4 | **Saved lookbooks** | Persist an effective recipe, director’s brief, and selected frames so the team can reopen or share it. Frame-level re-rolls are now complete. |
| 5 | **Operation-to-role-play bridge** | Allow a generated fictional encounter to seed the role-play opening message and preserve its scenario context. |

## Persistent Cloud Computer

Pearl Perch is primarily hosting the separate AI Studio project. It is not necessary for routine Hulukipedia work because Cloudflare hosts the application and the project deploys cleanly from a normal sandbox. Only one Manus thread can actively bridge to Pearl Perch at a time, so coordinate before using it. For Hulukipedia, GitHub plus the Cloudflare Worker remain the durable home base.

---

## Final Pre-Handoff Checklist

Before handing Hulukipedia to another teammate, confirm all of the following.

| Check | Expected state |
|---|---|
| `git status` | Clean working tree after push. |
| `git log -1` | `e4dfb1f` or a later documented commit. |
| Live health endpoint | `https://hulukipedia.teamtomorrowlabs.workers.dev/api/health` returns HTTP 200. |
| Live frontend asset | Contains **Visual Scene Studio**, `unmistakably seated`, and **Re-roll Frame** after this feature release. |
| Raven UI | Shows **Fictional Operation Parameters** in Addendums only, plus the Visual Scene Studio gallery. |
| Starling UI | Keeps its existing Historical Timeline and Public Persona Analysis behavior. |
| Deployment strategy | `deploy.py`, not Wrangler OAuth, unless the team deliberately changes the authentication setup. |

Hulukipedia is now in a stable, documented state with configurable fictional operations, a current Venice image catalog, and a production-tested Visual Scene Studio that supports individual frame re-rolls. Source is pushed to `main`.
