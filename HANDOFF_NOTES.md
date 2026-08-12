# Hulukipedia — Team Handoff and Deployment Notes

**Maintained by:** Team Tomorrow Labs  
**Latest deployed source:** [`ef15b01`](https://github.com/caseypotatowebb-cpu/hulukipedia/commit/ef15b01) — August 12, 2026  
**Live application:** <https://hulukipedia.teamtomorrowlabs.workers.dev>

---

## Current Product State

Hulukipedia is a React/Vite dossier generator served through a Cloudflare Worker. The frontend is a static asset bundle and the Worker is the secure proxy for text generation, research, web search, and image generation. Provider credentials are stored as Cloudflare Worker secrets rather than in the browser bundle.

The current production state includes Perplexity Sonar as the initial research default, multi-provider section overrides, RAG-first physical-description and communication-profile flows, a role-play panel, portrait lightbox, Venice image-model selection, and the image-prompt web-search toggle. Nano Banana Pro remains the default portrait model, with the deliberately simple prompt format restored for both modes.

| Area | Current behavior |
|---|---|
| Initial fact-finding | Perplexity Sonar is the default provider and confirmed live. |
| Real-subject portrait prompt | Photorealistic professional portrait photography. |
| Fictional-character portrait prompt | Photorealistic cinematic, live-action-adaptation framing. |
| Image grounding | Portrait-panel **Web Search ON/OFF** toggle; defaults to OFF. |
| Image sources | Venice AI primary; Pollinations fallback. |
| External image links | Raven exposes Rule34; Starling exposes CelebJihad; both are visually labeled NSFW. |
| Role-play | Session-only character conversation with its own provider/model controls. |

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
| 4 | **Multi-pose portrait batches** | Produce portrait, full-body, candid, action, and signature-scene images from curated prompt variants. |
| 5 | **Operation-to-role-play bridge** | Allow a generated fictional encounter to seed the role-play opening message and preserve its scenario context. |

## Persistent Cloud Computer

Pearl Perch is primarily hosting the separate AI Studio project. It is not necessary for routine Hulukipedia work because Cloudflare hosts the application and the project deploys cleanly from a normal sandbox. Only one Manus thread can actively bridge to Pearl Perch at a time, so coordinate before using it. For Hulukipedia, GitHub plus the Cloudflare Worker remain the durable home base.

---

## Final Pre-Handoff Checklist

Before handing Hulukipedia to another teammate, confirm all of the following.

| Check | Expected state |
|---|---|
| `git status` | Clean working tree after push. |
| `git log -1` | `ef15b01` or a later documented commit. |
| Live health endpoint | `https://hulukipedia.teamtomorrowlabs.workers.dev/api/health` returns HTTP 200. |
| Live frontend asset | Contains the phrase `Do not give real-world approach instructions` after this feature release. |
| Raven UI | Shows **Fictional Operation Parameters** in Addendums only. |
| Starling UI | Keeps its existing Historical Timeline and Public Persona Analysis behavior. |
| Deployment strategy | `deploy.py`, not Wrangler OAuth, unless the team deliberately changes the authentication setup. |

Hulukipedia is now in a stable, documented state with the new fictional operation controls deployed and the source pushed to `main`.
