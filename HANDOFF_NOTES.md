# Hulukipedia — Team Handoff and Deployment Notes

**Maintained by:** Team Tomorrow Labs
**Release:** `3.6.0`
**Live application:** <https://hulukipedia.teamtomorrowlabs.workers.dev>
**Deployment health:** `GET /api/health` returns HTTP 200 and `version: "3.6.0"`.

---

## Current Product State

Hulukipedia is a React/Vite dossier and creative research application served from a Cloudflare Worker. The frontend is deployed as static Worker assets; the Worker is the secure proxy for text generation, research, direct questions, image generation, Omni Flash, and generated-frame review. Provider credentials are Cloudflare Worker secrets and do not belong in the browser bundle.

The product is no longer only a character dossier. It has four connected but independent lanes:

| Lane | What it does |
|---|---|
| **Dossier** | Resolves a real or fictional subject, gathers confirmed intelligence, and generates research-led sections with per-section model choices. |
| **Ask the Archive** | Answers direct questions with its own model selector and optional web grounding, without forcing the question into a dossier. |
| **Visual Scene Studio** | Plans deliberately selected images—count, positions, wardrobe, cast, relationship, setting, source, and generator—then creates independent frames. |
| **Scene Lab** | Builds a character-driven observation or encounter through explicit cast, history, wants, voltage, pressure, and outcome fields in either Raven or Starling. |

The current visual identity is **Pearl white, ivory, antique gold, and espresso**, with a light, ceremonial feel instead of the earlier covert black/emerald presentation.

## 3.6.0: Requirement-Locked Scene Engine

### Visual contract

The Visual Scene Studio now treats a named counterpart as a requirement rather than optional prompt atmosphere. Each planned card receives a saved contract containing the subject, counterpart, relationship, voltage, coverage rule, situation/location, wardrobe logic, and exact shot instruction.

| Visual control | Behavior |
|---|---|
| **Planned frame count** | User chooses exactly 1–5 images. Launch stays locked until the selected shot count matches. |
| **Exact positions** | User selects each image’s framing/pose: hero, three-quarter, seated, walking, close frame, or recipe-specific equivalents. |
| **Outfit system** | Signature Continuity, Two-Look Arc, Editorial Variations, or required Custom Wardrobe Brief. |
| **Second adult / counterpart** | Makes the named person a required member of the cast, not background flavor. |
| **Counterpart coverage** | Requires the counterpart in every planned frame or only the opening shared frame. |
| **Relationship and voltage** | Defines the interpersonal dynamic and dramatic temperature applied to every frame. |
| **Situation/location contract** | Carries a specific place, occasion, environmental cue, and relationship circumstance into every prompt. |
| **Source and generator** | Studio independently selects Venice/Pollinations and, for Venice, a specific image generator without changing the Portrait configuration. |
| **Re-roll frame** | Re-generates only the selected frame using its retained contract and take number. |

Each completed visual frame displays its saved cast contract and an honest **Requirements Check** result. The Worker can call Venice vision to review whether a generated image visibly honored its planned cast, setting, relationship, wardrobe, and shot contract. A failure is shown as a review result rather than hidden or automatically called a success.

### Shared Scene Lab

Scene Lab replaced the old Raven-only operation widget. It is available in **both Raven and Starling** as an imaginative, user-directed scene engine. Raven/Starling still helps with subject framing and disambiguation; it does not gate the creative controls.

| Scene Lab field | Narrative role |
|---|---|
| **Scene lens** | Observation, Confrontation, Private Conversation, Chemistry, Deal / Temptation, After Hours, Aftermath, or Custom Scene. |
| **Named adult counterpart** | The required second person in the scene. |
| **Relationship / history** | Colleagues with history, authority friction, old friends, rivals, former partners, unresolved attraction, private arrangement, newly met adults, or custom. |
| **Emotional voltage** | Grounded, simmering, charged, intimate, provocative, volatile, decadent, or custom. |
| **Setting / occasion** | A non-negotiable environmental and situational anchor. |
| **Each person’s want** | Keeps both characters active rather than converting one into scenery. |
| **Pressure point** | The secret, temptation, leverage, danger, or question that prevents the scene from becoming generic. |
| **Desired turn / outcome** | Requires a selected transformation: a confession, refusal, bargain, rupture, relief, or unresolved tension. |
| **Director note** | Extra details about mood, body language, boundaries, wardrobe, social stakes, or desired trouble. |

Both **Scene Observation** and **Encounter Simulation** now default to direct **Grok 4.20 non-reasoning**, not the older Gemini/Venice pairs. A 3.6.0 browser correction normalizes only the known legacy defaults in Imaginative Scene mode and preserves any later deliberate user override.

### Production verification

The failed Rosa Diaz / Terry Jeffords beach-house test was reproduced, repaired, and rerun in a fresh cache-busted browser session.

1. A three-frame visual set with Terry marked as required completed with visible two-person compliance in all frames; frame-level vision review marked every card passed.
2. The same Scene Lab contract was used for a Grok 4.20 narrative: Rosa and Terry, beach house after a difficult shift, ocean light, open doors, wet sand, an unfiled photograph, distinct competing wants, and a required new bargain.
3. The output explicitly opened at the beach house with the stated sensory details and named cast, carried the photograph as pressure, and closed with the requested bargain to carry the case together.

Detailed results are in `SCENE_ENGINE_TEST_NOTES.md`.

---

## Research, Dossier, and Model Behavior

| Area | Current behavior |
|---|---|
| **Initial fact-finding** | Perplexity Sonar is the default research provider. |
| **Physical Description** | Direct xAI Grok 4.20, research-first grounding, with Clinical, Magazine, Bar Talk, Presence, and Locker Room voices. |
| **Communication Profile** | Research-first context and specific-example direction. |
| **Portrait** | Nano Banana Pro is the default image model. Its identity prompt remains intentionally simple; image complexity belongs in scene and shot layers rather than base prompt soup. |
| **Image grounding** | Portrait Web Search is optional and defaults OFF. |
| **External image links** | Raven has Rule34 and Starling has CelebJihad; both are visibly labelled NSFW. |
| **Role-play** | Session-only, in-character chat with a Scenario Deck, Director Note, dedicated model selector, and Grok 4.20 default. |
| **Investigative Console** | Ask the Archive provides direct model-selectable questions, web grounding, Markdown answers, returned sources, Copy, and Clear. |

## Provider and Model Policy

The selector is curated from current account checks rather than treated as a marketing-name dump. Do not casually add model labels without validating the actual configured account and route.

| Provider | Verified practical state | Team policy |
|---|---|---|
| **xAI / Grok** | Grok 4.20 non-reasoning, reasoning, and multi-agent paths are live. | Grok 4.20 is preferred for Physical Description, Strategic Analysis, Role-Play, and Scene Lab. `🧠` marks reasoning variants. |
| **Anthropic** | Claude Opus 4.6, Sonnet 4.5, Opus 4.5, and Haiku 4.5 are live. | Expose the approved 4.6/4.5 family only. Do **not** add Claude 4.8 or later. |
| **Gemini** | Gemini 3.1 Pro and 3.5–3.7 Flash routes are available. Gemini 2.5 Pro remains account-listed but returned Google 404 on stable and beta invocation for this credential. | Do not add Gemini 2.5 Pro until a real production route succeeds. |
| **Google Omni Flash** | `gemini-omni-flash-preview` works through the Worker using `GOOGLE_OMNI_API_KEY`. | Marked `🧠🎬`; use for multimodal/media-aware experiments, not as a substitute for the stable Gemini text lane. |
| **Perplexity** | `sonar`, `sonar-pro`, `sonar-reasoning-pro`, and `sonar-deep-research`. | Keep Sonar as initial research default. Do not use Agent presets that force disallowed GPT 5.4–5.6 routes. |
| **Mistral Studio** | Medium 3.5, Small 4, and Large 3 are direct Worker choices. | First-class provider; do not duplicate it through an unnecessary connector. |
| **Venice** | Curated live catalog includes Aion 3.0, Aion 3.0 Mini, Kimi K2.6, GLM 5.2, and capability-marked models. | `🔥` uncensored/open creative; `👁` vision; `🧠` reasoning; `⚡` speed. Catalog listing and account entitlement are different things. |
| **OpenRouter** | Allowed routes include Claude 4.5, Gemini 3.1 Pro/3.7 Flash, and Grok 4.3/4.6. | No GPT after 5.1; no Claude 4.8-or-later routes. |
| **OpenAI** | GPT-4o is the Team Tomorrow account’s verified direct route. | Do not add unavailable or disallowed GPT models. |

### Worker secret reference

| Provider | Worker secret |
|---|---|
| Venice | `VENICE_API_KEY` |
| Perplexity | `PERPLEXITY_API_KEY` |
| Anthropic | `ANTHROPIC_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |
| Google Gemini | `GEMINI_API_KEY` |
| Google Omni Flash | `GOOGLE_OMNI_API_KEY` |
| xAI / Grok | `XAI_API_KEY` |
| Mistral Studio | `MISTRAL_API_KEY` |
| OpenRouter | `OPENROUTER_API_KEY` |

## Scope Boundary

**Do not build a Team Tomorrow canon/lore bridge into Hulukipedia.** Team Tomorrow is the architect of the product, not part of its in-app identity. Custom MCP connectors can later be evaluated for clearly external, user-approved material, but Team Tomorrow internal planning and lore do not belong in this application.

Google `virtual-try-on-001` remains a credible future wardrobe extension, but requires a billing-enabled Google Cloud project, Agent Platform API, OAuth/service-account authentication, a supported region, and Cloud Storage output. It is not covered by the ordinary Gemini key. See `INVESTIGATIVE_CONSOLE_PROVIDER_AUDIT.md`.

---

## Safe Deployment Workflow

> **Source of truth:** Start from a fresh `git pull` or new clone. Do not treat an older sandbox working directory as authoritative. A prior session almost removed Lightbox and Role-Play features by deploying an outdated local copy.

```bash
# 1. Work from the canonical repository
cd /home/ubuntu
rm -rf hulukipedia-work
gh repo clone caseypotatowebb-cpu/hulukipedia hulukipedia-work
cd hulukipedia-work

# 2. Build source
pnpm install
./node_modules/.bin/vite build

# 3. Sync the deployment directory expected by deploy.py
rm -rf /home/ubuntu/hulukipedia
cp -a /home/ubuntu/hulukipedia-work /home/ubuntu/hulukipedia
cd /home/ubuntu/hulukipedia
./node_modules/.bin/vite build
python3 deploy.py

# 4. Verify, then publish source
curl -s https://hulukipedia.teamtomorrowlabs.workers.dev/api/health
git -C /home/ubuntu/hulukipedia-work add -A
git -C /home/ubuntu/hulukipedia-work commit -m "Describe the change"
git -C /home/ubuntu/hulukipedia-work push origin main
```

### Why not Wrangler?

The sandbox-level Cloudflare credential behaves as a Global API Key using `X-Auth-Email` plus `X-Auth-Key`, while Wrangler expects a Bearer API token and can become trapped in browser OAuth. The checked-in `deploy.py` performs the required Workers-with-Assets sequence directly: manifest, changed-asset upload, then Worker upload with the completion JWT.

The Cloudflare connector is a verified diagnostic fallback. For normal static-asset deployment, retain `deploy.py` until the team deliberately replaces it with a connector-based asset workflow.

## Next Product Moves

| Priority | Candidate extension | Why it follows naturally |
|---|---|---|
| 1 | **Saveable Scene Lab and Visual Set presets** | Preserve strong cast, shot, wardrobe, and relationship configurations. |
| 2 | **Narrative output variants** | Offer user-selected branches such as cooperation, refusal, escalation, reconciliation, or aftermath from one saved contract. |
| 3 | **Scene Lab to Role-Play bridge** | Seed a role-play opening from a completed Scene Lab scene while preserving the same cast, setting, and relationship facts. |
| 4 | **Runtime provider availability labels** | Show “verified with this account” separately from upstream catalog availability. |
| 5 | **Virtual Try-On wardrobe module** | Build only after the required Google Cloud project and authentication prerequisites exist. |

## Final Pre-Handoff Checklist

| Check | Expected state |
|---|---|
| Git state | Clean tree after the final push. |
| Health | Live health returns HTTP 200 with `version: "3.6.0"`. |
| Pearl identity | Homepage and dossiers render white, ivory, antique gold, and espresso. |
| Scene Lab | Appears in both modes; shows shared cast, relationship, voltage, setting, wants, pressure, outcome, and note controls. |
| Scene defaults | Fresh scene-mode dossier visibly defaults both Scene Observation and Encounter Simulation to Grok (xAI) / Grok 4.20. |
| Visual contract | A named counterpart, relationship, coverage rule, setting, and selected shot cards appear in the planned output before generation. |
| Frame review | Generated contracted frames show a Requirements Check result. |
| Planner | Set cannot launch until selected angles equal chosen frame count; batch source/model are independent of Portrait. |
| Deployment | Use `deploy.py`, not Wrangler OAuth, unless the authentication system is deliberately changed. |

Hulukipedia is now in a stable, documented state: current account-verified providers, direct research, a Pearl visual identity, a deliberate Visual Set Planner, requirement-locked shared-cast image scenes, vision review, and a shared Grok 4.20 Scene Lab that produces character-driven output instead of sterile reports.
