# Hulukipedia Provider Policy Refresh — August 13, 2026

## User-directed model rules

The following are product preferences and must be enforced in the selector and worker metadata.

| Family | Rule | Implementation consequence |
|---|---|---|
| xAI / Grok | Use Grok 4.2 as the preferred default where 4.3 had been used. | Physical Description, Role-Play, and Strategic Analysis default to `grok-4.2` after a live route check. Grok 4.3/4.5/4.6 remain optional alternates only if the user wants them. |
| OpenAI | Do not list any GPT release after GPT 5.1. Earlier GPT models remain permissible. | Keep the already-verified accessible GPT-4o direct choice. Do not add GPT-5.2 through GPT-5.6 routes, including through a proxy. |
| Anthropic | Do not list any Claude variation before Claude 4.8. | Remove Claude 4.6 and retain only current Claude 4.8 / Claude 5 family options verified against the direct API. |
| Perplexity | Keep the current research path, avoiding model chains that violate the GPT rule. | Use the current Sonar API choices; do not adopt Agent API presets because the documented low/medium/high presets currently route to GPT-5.6. |

## Perplexity API findings

Perplexity has moved Sonar Chat Completions toward its Agent API, which now exposes multi-provider models and web-search tools at `POST /v1/agent`. The official current Agent API presets route through GPT-5.4 and GPT-5.6 families, so they are deliberately unsuitable under the user’s GPT cutoff. Perplexity’s current Sonar API catalog still documents these directly relevant research models:

| Curated Hulukipedia choice | Purpose |
|---|---|
| `sonar` | Default lightweight fact-finding and cited research path. |
| `sonar-pro` | Higher-quality sourced research where a richer answer is useful. |
| `sonar-reasoning-pro` | Multi-step question handling with web search. |
| `sonar-deep-research` | Highest-depth research option. |

The direct `GET /v1/models` attempt returned HTTP 401 both unauthenticated and with the sandbox’s generic `PERPLEXITY_API_KEY` environment value. This does not establish a product problem: Hulukipedia keeps its own Cloudflare Worker secret and prior deployed Sonar requests succeeded. Do not reuse the generic sandbox environment value as a Worker secret. Validate the four curated Sonar selections through the live Worker after implementation.

## Supplied-key identification

### Vibe key

The existing task configuration contains a disabled **Vibe Prospecting** built-in connector. Official Vibe Prospecting documentation identifies it as Explorium’s B2B company/contact discovery and enrichment service, not a language or image model service. It can build lead lists, enrich companies and people, and query intent/business data. It is not a meaningful Hulukipedia provider and should not be wired into the dossier app.

### “Studio” key

No current connector config entry identifies a service called Studio. Google AI Studio was investigated as a possible interpretation, but its Gemini keys use the recognizable `AIza…` form, which does not match the supplied key. The service name or dashboard URL is required before making any authenticated request with this credential. Do not guess a provider endpoint from the key string.

## Missing-model-family recommendations

Mistral remains the clearest missing direct model family for Hulukipedia. It would add a separate inference provider with current Mistral Medium 3.5, Small 4, and Large 3 choices. It needs a real `MISTRAL_API_KEY` and a live account-level model audit before integration. A direct Cohere, Moonshot, DeepSeek, Together, Fireworks, Groq, or Cerebras integration would add less immediate diversity because the existing Venice, OpenRouter, and Perplexity routes already cover overlapping model families or routing roles.

## Sources

1. [Perplexity API overview](https://docs.perplexity.ai/docs/getting-started/overview)
2. [Perplexity Agent API quickstart](https://docs.perplexity.ai/docs/agent-api/quickstart)
3. [Perplexity Agent API models](https://docs.perplexity.ai/docs/agent-api/models)
4. [Perplexity API changelog](https://docs.perplexity.ai/docs/resources/changelog)
5. [Vibe Prospecting documentation](https://docs.vibeprospecting.ai/overview)
6. [Anthropic model overview](https://platform.claude.com/docs/en/about-claude/models/overview)
7. [xAI model catalog](https://docs.x.ai/developers/models)
8. [Mistral model overview](https://docs.mistral.ai/models/overview)


## Live xAI clarification

An authenticated xAI `GET https://api.x.ai/v1/models` call on August 13, 2026 returned `grok-4.20-0309-non-reasoning`, `grok-4.20-0309-reasoning`, and `grok-4.20-multi-agent-0309`, along with Grok 4.3, 4.5, and 4.6. It did **not** return a `grok-4.2` identifier. A direct chat-completions smoke test of `grok-4.20-0309-non-reasoning` returned the requested test text successfully. The release therefore treats the user’s “4.2” direction as the current 4.20 family while preserving the exact provider identifier in code and documentation.

The xAI official model documentation was checked at https://docs.x.ai/developers/models and https://docs.x.ai/developers/models/grok-4-20 (both last updated August 12, 2026). It confirms the Grok 4.20 family is in the current model generation, though its short catalog page emphasizes Grok 4.6 as the broad official flagship.


## Live 3.2.0 browser verification

The deployed home screen and canonical Lara Croft Raven dossier were inspected in the browser after the 3.2.0 deployment. The black/obsidian canvas, emerald dossier surfaces, gold hierarchy, and mode buttons render correctly without a layout regression. The live dossier exposes the current Sonar family, 2026 Venice image catalog, current Visual Scene Studio recipe deck, Presence physical-description voice, and Scenario Deck. The lower Role-Play panel reflects the new theme and retains its upward-opening model-selector behavior from 3.1.0. A final browser generation check of the physical-description default remains part of release verification.


The live 3.2.0 Lara Croft dossier loaded and displayed the refreshed app surface correctly. Browser-visible catalog checks confirmed legacy Gemini 2.5 and retired `sonar-reasoning` are absent, while the current Sonar Research options, all current Venice image selections, updated visual recipes, and Scenario Deck are present. The new palette is legible in both the initial page and Raven dossier: emerald identifies Raven/research controls and aged gold identifies primary actions/Starling state.
