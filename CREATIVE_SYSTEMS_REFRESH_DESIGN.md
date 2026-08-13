# Hulukipedia Creative Systems Refresh — Implementation Design

## Goal

Deliver a focused improvement that makes Hulukipedia feel more alive and current without sacrificing the existing clean, research-aware flows. This release updates stale model entries, makes the lower-page model selector usable, moves body/physical description to direct Grok 4.3, and adds richer creative direction to both Role-Play and Visual Scene Studio.

## 1. Provider and Model Refresh

The app should show curated, actually relevant model choices rather than a giant catalog. Every displayed model must have either been confirmed in the provider’s official catalog or queried from the live Venice model endpoint.

| Provider | Curated Display Set | Default / Primary Use |
|---|---|---|
| Venice | GPT-4o (compatibility), GLM 5.2, GLM 4.7 Flash Heretic, Venice Role Play Uncensored, Venice Uncensored 1.2, Qwen 3.7 Plus, Qwen 3.6 Plus, Grok 4.3, Grok 4.5 | Open creative choices, alternate role-play styles, Venice web-enabled models |
| Anthropic | Claude Sonnet 5, Claude Opus 5, Claude Sonnet 4.6, Claude Sonnet 4.5, Claude Haiku 4.5 | Strong prose and nuanced character voice; no Claude 4 base snapshots |
| Perplexity | Sonar | Initial factual discovery and cited Intel RAG |
| OpenRouter | Current route aliases only, with Claude Sonnet 5 and Mistral Medium 3.5 choices if routes are confirmed | Optional routing rather than canonical provider source |
| OpenAI | GPT-5.6 Terra, GPT-5.6 Sol, GPT-5.6 Luna, GPT-4o (Legacy) | Structured analysis and fallback prose |
| Google Gemini | Gemini 3.7 Flash, Gemini 3.6 Flash, Gemini 3.5 Flash, Gemini 3.5 Flash-Lite, Gemini 2.5 Pro (Legacy), Gemini 2.5 Flash (Legacy) | Fast long-context or broad multimodal drafts; Gemini 2.0 removed |
| xAI / Grok | Grok 4.6, Grok 4.5, Grok 4.3, Grok 4.20 (Legacy creative option) | **Grok 4.3 is primary for Physical Description and Role-Play** |

A direct Mistral provider is intentionally deferred. It is a good next addition but needs a real `MISTRAL_API_KEY` in Worker secrets, followed by a live account `/v1/models` check. Do not fake a provider with an absent key.

## 2. Physical Description: Better Default and Better Writing Contract

Physical Description defaults to direct xAI `grok-4.3`, not Grok 4.20. The writing prompt remains research-first for real subjects, but adds a stronger three-pass composition:

1. **Instant read** — the silhouette, scale, posture, and impression a viewer receives before details.
2. **Specific architecture** — research-grounded proportions, face, hair, distinguishing traits, habitual styling, and movement.
3. **Contextual contrast** — what distinguishes this individual from peers, castmates, archetypes, or their own public image.

A fifth `Presence` style button joins Clinical, Glamorous, Candid, and Locker Room. Presence produces a camera-aware, sensory character portrait that remains fact-bound but reads like a strong profile rather than an inventory.

## 3. Role-Play Scenario Deck

Role-Play gains a clearly visible Scenario Deck before the chat. The user selects a starting frame and may add a private/director note. The selected frame is embedded in the role-play system prompt so the model has an active scene, stakes, and relationship dynamic instead of waiting for the first message to supply all of it.

| Scenario | Purpose |
|---|---|
| Open Room | Existing unframed conversation behavior; stays the default. |
| First Meeting | Mutual curiosity, uncertainty, and first-impression dialogue. |
| After the Fallout | A private conversation after an argument, failure, loss, or public embarrassment. |
| Mission / Problem | Two people need to solve something under time pressure, without tactical instruction. |
| Off-Duty | Small, ordinary moment: coffee, walk, ride home, rehearsal break, kitchen, hotel lobby. |
| Rival Spark | Competitive, teasing, or tense verbal chemistry where neither character becomes generic. |
| Confessional | Quiet admission, hard question, or trust-building conversation. |
| After Hours (Raven only) | Mature, adult fictional-character chemistry and private atmosphere; non-graphic in the base prompt and unavailable for real-person dossiers. |

The current dossier, speech anchors, and the scenario note always outrank genre cliché. The model is asked to start in scene, not to narrate a screenplay.

## 4. Visual Scene Studio: Expanded Recipe Deck

The present recipes remain untouched. Four additions fill the actual gaps exposed by the reference examples: sustained activity, consistent multi-angle coverage, relationship energy, and mature adult fictional mood.

| Recipe | Visual Need It Serves | Shot Language |
|---|---|---|
| Activity Continuity | The same person doing one clear activity across distinct takes. | Arrival, profile in motion, rear three-quarter follow, exertion detail, recovery frame. |
| Campaign / Product Story | A sequence suited to fashion, lifestyle, book cover, or character marketing. | Key art, product interaction, environmental hook, close read, final poster-worthy beat. |
| Duo Chemistry | Two adults sharing a scene, allowing friendship, rivalry, teamwork, or romantic tension. | Introduction, shared action, side-by-side composition, private reaction, final relationship beat. |
| After Dark Editorial (Raven only) | Mature adult fictional style, nightlife, glamour, or private atmosphere without graphic instructions. | Arrival, full-body styling, close tension, reflective pause, closing image. |

Duo Chemistry adds an optional `Co-star / second adult character` field. It defaults to a compatible unnamed adult figure if left blank. The scene prompt explicitly requires a single continuous moment, no duplicate faces, no split images, and clear visual hierarchy.

For actual adult imagery requests involving original or fictional adults, scene direction can be frank about mature wardrobe, flirtation, glamour, and intimate atmosphere. The app must not use a real-person dossier to generate sexually explicit or nude imagery, and the mature Raven-only category carries this constraint in both UI copy and prompt contract.

## 5. Lower-Page Model Selector Fix

`ProviderSelector` receives a `menuDirection` prop with `down` as the default and `up` for controls near the bottom of the page. The Role-Play selector uses `up` so its provider/models list opens above the control bar.

The dropdown receives a viewport-safe maximum height and `overflow-y: auto`; this avoids both off-screen menus and a miles-long list when a provider has many models. The toggle should include `aria-expanded`, and each menu selection closes the menu reliably.

## 6. Verification Plan

The release must pass the production build and then be verified in the live app through:

1. A Raven dossier with Physical Description generated under direct Grok 4.3.
2. A lower-page Role-Play dropdown opening upward and permitting model selection.
3. A Role-Play conversation using a non-default scenario.
4. A multi-image Activity Continuity or Duo Chemistry set with visibly distinct poses.
5. Model entries confirmed to lack known retired items: Claude Sonnet 4 base, Gemini 2.0 Flash, and the prior o1 / o3-mini legacy choices.

## Sources

The model versions and lifecycle decisions are documented in `PROVIDER_AUDIT_2026-08-13.md`.
