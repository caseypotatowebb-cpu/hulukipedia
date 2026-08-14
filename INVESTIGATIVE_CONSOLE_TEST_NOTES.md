# Investigative Console 3.4.0 — Live Verification

**Date:** August 14, 2026
**Production URL:** https://hulukipedia.teamtomorrowlabs.workers.dev

## Deployment

The deployed Worker health endpoint returned `version: "3.4.0"` after propagation. The live frontend served the expected `ASK THE ARCHIVE`, `claude-opus-4-6`, and `After Dark Editorial` markers from the newly published JavaScript asset.

## Browser workflow checks

| Workflow | Result |
|---|---|
| Home-page Investigative Console | Visible beneath the standard dossier intake, with a separate provider/model selector and a `Web-grounded` toggle. |
| Perplexity evidence path | A web-grounded question about Lara Croft returned an investigative note and a rendered list of returned URLs. Provenance showed `Perplexity Sonar · Sonar — factual default · web-grounded`. |
| Claude Opus 4.6 selector | Opened the Investigative Console selector; `Claude Opus 4.6 — flagship` appeared under Anthropic, alongside the allowed 4.5 models only. |
| Claude Opus 4.6 response | With web grounding off, a direct creative-analysis question completed. The result panel identified `Claude (Anthropic) · Claude Opus 4.6 — flagship` and delivered the requested two-paragraph explanation. |
| Shared creative gates | Source audit confirms no `ravenOnly` properties or `Raven only` labels remain in the role-play/visual recipe definition or mode filtering. `After Hours` and `After Dark Editorial` are shared controls. |

## Model findings carried forward

Claude Opus 4.6 is live and verified. Gemini 2.5 Pro is still returned by the account catalog, but both stable and v1beta direct generation routes returned a Google 404 stating it is no longer available to new users; it was not added as a dead selector route. Gemini 3.1 Pro remains the production Gemini Pro choice.

## Virtual Try-On

Google's `virtual-try-on-001` is a viable future Wardrobe/Try-On extension for the Visual Scene Studio, not an immediately configured capability. It requires a Google Cloud project with billing, Agent Platform API access, OAuth/service-account authentication, a supported region, and a Cloud Storage output path. See `INVESTIGATIVE_CONSOLE_PROVIDER_AUDIT.md` for the sourced implementation requirements.
