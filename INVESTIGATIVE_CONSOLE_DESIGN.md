# Hulukipedia Investigative Console and Shared Creative Controls

**Release target:** 3.4.0  
**Date:** August 13, 2026

## Intent

Hulukipedia should remain excellent at making dossiers while also becoming useful when the user simply has a question, a lead, a comparison, or an idea worth running through a particular model. The new **Investigative Console** is a compact home-page lane beside the existing dossier intake—not an ersatz chat app and not a mandatory dossier precursor.

## Investigative Console

| Element | Design |
|---|---|
| **Placement** | Home page, immediately beneath the primary dossier intake, in its own framed panel. |
| **Question** | Freeform question textarea. It can concern a person, a work, a theory, an event, a comparison, or a private creative-research prompt. |
| **Model control** | Dedicated provider/model selector. It defaults to the current global provider/model but keeps its own state, so exploratory questions do not silently change how the next dossier starts. |
| **Research toggle** | `Web-grounded` is on by default for Perplexity and visibly optional for any provider. Perplexity uses the existing `/api/search` path; other providers get direct model analysis unless an app-level research route is later intentionally added. |
| **Output** | Markdown answer panel with source/citation language preserved when returned. It displays provider/model provenance, copy control, clear control, and a simple “use as dossier lead” affordance that moves the question into dossier context without inventing a subject. |
| **Voice** | System prompt: precise, skeptical, useful, and direct. It distinguishes sourced fact from inference, identifies uncertainty, and avoids pretending a general question requires a dossier. |

## Shared Creative Controls

Raven and Starling remain valuable as context signals—fictional versus real—not as a blanket permissions system. The following creative controls will become shared:

| Current Raven gate | New behavior |
|---|---|
| `After Hours` role-play scenario | Available for both modes as **After Hours**. The scenario directs mature, consent-aware fictionalized conversation without reducing the subject to a prop. |
| `After Dark Editorial` visual recipe | Available for both modes as **After Dark Editorial**. It is a mature editorial/nightlife visual category with a Director’s Brief, not an automatic explicit-image switch. |
| Visual recipe filter | No `ravenOnly` filtering. Every visual recipe is visible in either mode. |
| Role-play scenario filter | No `ravenOnly` filtering. Every scenario is visible in either mode. |

Existing context-aware external image links remain separate presentation behavior; this design does not collapse the real/fictional disambiguation function of Raven and Starling.

## Model Policy Corrections

| Provider | Change |
|---|---|
| Anthropic | Add `claude-opus-4-6`; retain 4.5 choices; continue excluding Claude 4.8 and later. |
| Gemini | The account lists `gemini-2.5-pro`, but direct generation returns a documented 404 “no longer available to new users.” Do not place a dead selector item in production. Keep verified Gemini 3.1 Pro. |
| OpenAI | Keep only account-verified GPT-4o until an eligible GPT 5.1-or-earlier route can pass the account test. |
| xAI | Retain Grok 4.20 non-reasoning as default and its reasoning option. |

## Virtual Try-On Assessment

Virtual Try-On is a strong future extension of Visual Scene Studio, but it requires a Google Cloud project, billing, Agent Platform API enablement, OAuth/service-account credentials, supported region, and a GCS output path. It should become a separate Wardrobe/Try-On action once those inputs are provided. It must not be falsely represented as an option covered by the ordinary Gemini API key.

## Acceptance Checks

1. A user can ask a direct question from home without selecting a dossier mode.
2. The question can target a model independent of the dossier default.
3. Perplexity web-grounded output preserves source-aware answer behavior.
4. The result shows the actual provider/model that answered.
5. Opus 4.6 can be selected and successfully responds through the deployed Worker.
6. After Hours and After Dark Editorial are visible for both Raven and Starling.
7. The VTO opportunity is documented but absent from the live UI until required Google Cloud infrastructure is supplied.
