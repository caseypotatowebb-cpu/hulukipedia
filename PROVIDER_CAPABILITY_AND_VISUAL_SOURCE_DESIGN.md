# Hulukipedia — Provider Capability and Visual Source Refresh

**Date:** August 13, 2026  
**Scope:** Corrected Claude policy, account-verified Mistral Studio provider, live Venice updates, clear capability markers, and an independent Visual Scene Studio generator picker.

## Binding Model Policy

The Claude policy was clarified by the user after the 3.2.0 release: **Claude 4.5 and earlier are permitted; Claude 4.8 and every later Claude model are excluded.** The previous 3.2.0 implementation inverted that rule and must be corrected. The direct Anthropic account confirmed availability of `claude-sonnet-4-5-20250929`, `claude-opus-4-5-20251101`, and `claude-haiku-4-5-20251001`.

The Gemini account confirmed `gemini-3.1-pro-preview` is live and usable. It must return alongside current 3.5–3.7 choices. The user’s existing rule remains: GPT models after GPT 5.1 are excluded. The direct OpenAI account currently provides GPT-4o only, so no other direct OpenAI models are exposed.

The requested “Grok 4.2” refers to xAI’s exposed `grok-4.20-0309-*` family. The non-reasoning route remains the default for Physical Description, Strategic Analysis, and Role-Play. The reasoning variant is visibly available for deliberate analysis, and the multi-agent variant remains visibly available for model experimentation.

## Curated Mistral Studio Provider

Mistral Studio’s account-specific `/v1/models` catalog and direct smoke tests confirmed three Hulukipedia-ready text routes:

| Model ID | UI label | Verified capabilities | Product role |
|---|---|---|---|
| `mistral-medium-2604` | Mistral Medium 3.5 | Chat, reasoning, vision, tools | High-quality general writing and analysis |
| `mistral-small-2603` | Mistral Small 4 | Chat, reasoning, vision, tools | Fast, capable all-rounder |
| `mistral-large-2512` | Mistral Large 3 | Chat, vision, tools | Large generalist and long-form option |

Mistral uses `POST https://api.mistral.ai/v1/chat/completions` with Bearer authentication and standard chat messages. The Worker integrates it as a direct text provider using a `MISTRAL_API_KEY` secret. The secret is never shipped to the browser.

## Capability Badge Legend

Badges are appended directly to labels across provider menus, so a selection is legible without opening a separate model reference sheet.

| Marker | Meaning | When applied |
|---|---|---|
| `🧠` | Reasoning-capable | Provider catalog explicitly advertises reasoning or the model is a dedicated reasoning route. |
| `🔥` | Explicitly uncensored / open-ended creative model | The provider catalog identifies it as uncensored or intentionally role-play/open-ended. |
| `👁` | Vision-capable | The live provider catalog lists image/vision input support. |
| `⚡` | Faster / lower-latency option | The model is selected as an intentionally efficient member of its family. |

The app does not use badges to claim that a given screen currently sends images or activates every provider tool. They describe the model capability, not an unimplemented feature.

## Live Venice Curation

The live Venice text catalog confirms that **Aion 3.0** and **Aion 3.0 Mini** replace Aion 2.0. Both are reasoning-capable multi-model storytelling systems with web search support; the full model is appropriate for richer scene generation and the Mini for quicker experimentation. Kimi K2.6 is also current and is suitable as a long-context, agentic alternative. The Aion 2.0 entry is removed.

## Visual Scene Studio Generator Control

The existing studio incorrectly inherits the Portrait panel source (`imageSource`) and selected portrait image model. The update introduces independent state:

- `visualImageSource` defaults to `venice`.
- `visualImageModel` defaults to `nano-banana-pro`.
- The studio offers a source toggle for **Venice AI** or **Pollinations**.
- When Venice is selected, it exposes the complete existing Venice image-model selector for batch frames.
- When Pollinations is selected, it displays an honest note that Pollinations derives each frame from the scene-specific prompt and does not accept a Venice model choice.
- Each generated/re-rolled visual card preserves its selected source and model in its immutable generation contract.

This keeps the clean Nano Banana portrait default intact while allowing a deliberately different generator for an entire visual lookbook.

## Release Tests

Before deployment, test all restored and new direct provider paths with small deterministic prompts: Claude Sonnet 4.5, Gemini 3.1 Pro, Mistral Medium 3.5, Mistral Small 4, Mistral Large 3, Grok 4.20 reasoning, and Aion 3.0. In the browser, generate one three-frame set using a non-default Venice model, then re-roll one card and confirm its saved model persists. Finally, use Pollinations for a three-frame set to confirm the independent source switch does not change the Portrait panel setting.


## Verification Sources

The Mistral account results were validated against the account-specific `GET https://api.mistral.ai/v1/models` response and direct `POST https://api.mistral.ai/v1/chat/completions` smoke calls. Official references: [Mistral Models Overview](https://docs.mistral.ai/models/overview), [Mistral Chat Endpoint](https://docs.mistral.ai/api/endpoint/chat), and [Mistral Models Endpoint](https://docs.mistral.ai/api/endpoint/models).

The direct Anthropic account model list confirmed Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`) and the account returned a successful test completion. The direct Gemini account `GET https://generativelanguage.googleapis.com/v1beta/models` response included `gemini-3.1-pro-preview`, and a direct OpenAI-compatible endpoint test returned a successful completion. The authenticated Venice `GET https://api.venice.ai/api/v1/models?type=text` response confirmed Aion 3.0 and Aion 3.0 Mini, their reasoning and web-search flags, plus current labels for Kimi K2.6 and the curated Venice set. The authenticated OpenRouter catalog confirmed `anthropic/claude-sonnet-4.5`, `anthropic/claude-opus-4.5`, and `anthropic/claude-haiku-4.5` routes.
