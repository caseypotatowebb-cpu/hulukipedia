# Hulukipedia Provider and Model Audit — 2026-08-13

This working note records external provider findings for the current Hulukipedia model refresh. It is not a final team handoff.

## Current Code Issues Identified

The application currently exposes retired Anthropic Claude Sonnet 4 and Opus 4 snapshots, Gemini 2.0 Flash (already shut down), and an older OpenAI model list. The direct xAI list is current through Grok 4.3 but misses newer Grok 4.5 and Grok 4.6. The direct Venice text catalog was queried live and confirms substantially newer models than the static curated list.

The lower-page `ProviderSelector` always expands downward using an absolute dropdown, which can make its model choices inaccessible near the bottom of a long dossier. The Role-Play selector is the clearest affected instance.

## Official Provider Findings

| Provider | Current / Supported Recommendations | Immediate Hulukipedia Action |
|---|---|---|
| Anthropic | Current active options include `claude-sonnet-5`, `claude-opus-5`, `claude-sonnet-4-6`, `claude-opus-4-8`, `claude-sonnet-4-5-20250929`, and `claude-haiku-4-5-20251001`. | Remove retired `claude-sonnet-4-20250514` and `claude-opus-4-20250514`; use Sonnet 5 or Sonnet 4.6 as the general default. |
| Google Gemini | Stable current Gemini API text models include `gemini-3.7-flash`, `gemini-3.6-flash`, `gemini-3.5-flash`, `gemini-3.5-flash-lite`, and `gemini-3.1-flash-lite`. Gemini 2.5 Flash and 2.5 Pro remain available. Gemini 2.0 Flash was shut down June 1, 2026. | Remove Gemini 2.0 Flash. Add current 3.x text choices. Retain 2.5 Flash/Pro as clearly labeled legacy/stable choices, not defaults. |
| xAI | Direct xAI docs identify `grok-4.6` as the flagship for broad use. `grok-4.3` remains active with a 1M context window and configurable reasoning. xAI release notes confirm Grok 4.5 and Grok 4.6. | Keep Grok 4.3 as the accuracy/creative physical-description default requested by the user. Add Grok 4.5 and 4.6 as tested-choice entries after key validation. |
| OpenAI | Official model catalog now recommends `gpt-5.6-sol`, `gpt-5.6-terra`, and `gpt-5.6-luna`. Older GPT-5 and o3 snapshots have announced retirement dates; `o1`, `o3-mini`, and `o4-mini` are older families scheduled to shut down October 23, 2026. | Replace the stale default list with the GPT-5.6 family while retaining GPT-4o only as a labeled legacy compatibility option until validated. |
| Mistral (new direct provider candidate) | Official docs list Mistral Medium 3.5, Mistral Small 4, Mistral Large 3, and the Ministral 3 models. Chat endpoint is OpenAI-like: `POST https://api.mistral.ai/v1/chat/completions`, Bearer API key, `model`, `messages`, and `max_tokens`. | Strong first new direct provider. Requires a `MISTRAL_API_KEY` Worker secret. Prefer `mistral-medium-latest` and `mistral-small-latest` aliases unless the account’s `/v1/models` response recommends pinned IDs. |

## Live Venice Catalog Highlights

A live request to `https://api.venice.ai/api/v1/models?type=text` succeeded on August 13, 2026. The catalog includes current models and capability metadata. Relevant available choices include:

- `gemini-3-6-flash` and `gemini-3-5-flash-lite`
- `zai-org-glm-5-2`, `zai-org-glm-5-1`, `zai-org-glm-5`, and GLM 5 Turbo / V Turbo
- `olafangensan-glm-4.7-flash-heretic`
- `venice-uncensored-role-play` and `venice-uncensored-1-2`
- `qwen-3-8-max`, `qwen-3-7-plus`, `qwen-3-6-plus`, `qwen3-6-35b-a3b`
- `gemma-4-uncensored`
- `grok-4-3` and `grok-4-5`

The live catalog also supplies model capability flags including search, reasoning, vision, function calling, and privacy metadata. The UI should remain curated rather than dumping every model, but its listed IDs should be drawn from the live catalog.

## Sources

1. [Anthropic Models Overview](https://platform.claude.com/docs/en/about-claude/models/overview)
2. [Anthropic Model Deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations)
3. [Gemini API Models](https://ai.google.dev/gemini-api/docs/models)
4. [Gemini API Release Notes](https://ai.google.dev/gemini-api/docs/changelog)
5. [xAI Models](https://docs.x.ai/developers/models)
6. [xAI Grok 4.3](https://docs.x.ai/developers/models/grok-4.3)
7. [xAI Release Notes](https://docs.x.ai/developers/release-notes)
8. [OpenAI Model Catalog](https://developers.openai.com/api/docs/models)
9. [OpenAI Deprecations](https://developers.openai.com/api/docs/deprecations)
10. [Mistral Models Overview](https://docs.mistral.ai/models/overview)
11. [Mistral Chat API](https://docs.mistral.ai/api/endpoint/chat)
12. [Venice Models API](https://api.venice.ai/api/v1/models?type=text) — live authenticated query on 2026-08-13.

## Design Constraints for Implementation

The requested physical-description default should use direct xAI Grok 4.3 (not the Venice proxy equivalent) for factual/body-detail and creative language. Additional physical-description tone controls should be framed as presentation style, never as an excuse to overwrite research-grounded traits.

Role-play and Visual Scene Studio should gain categories that describe narrative context, interaction, social arrangement, physical activity, wardrobe/setting, and framing. The scene generator must continue to produce one independent image per card, never a combined triptych/contact sheet.

For real subjects, descriptions and non-explicit editorial lifestyle scenes can be research-grounded. The app should not create sexually explicit or nude imagery of identifiable real people; adult creative categories should be available for clearly fictional/adult subjects or original characters and clearly marked as such.

## Next Decision

Build the self-contained refresh first: remove dead model choices, update active direct providers, fix dropdown direction/scroll behavior, make Grok 4.3 the relevant content default, and add the new role-play / visual-scene category controls. Do not wire Mistral until a valid Mistral key is supplied and its live account model list is checked.
