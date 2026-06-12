# Hulukipedia — Cloudflare Deployment Handoff Notes

**Deployed by:** Autumn (Pearl Peregrine) — Team Tomorrow  
**Date:** April 11, 2026  
**Live URL:** https://hulukipedia.teamtomorrowlabs.workers.dev  
**Cloudflare Account:** Team Tomorrow Labs  

---

## What Was Done

Hulukipedia has been deployed to Cloudflare Workers as a live web application. The app is fully functional with multi-provider AI support. All API keys are stored as encrypted Cloudflare Worker secrets — they never touch the browser.

## Architecture

The app has two layers:

1. **Frontend** — A Vite + React app (built from the original JSX) served as static files from Cloudflare's edge network. Located in `/src/Hulukipedia.jsx`.

2. **Backend** — A Cloudflare Worker (`/worker/index.js`) that serves the frontend and acts as a secure API proxy. All AI calls go through this proxy so API keys stay hidden.

## API Providers Wired Up

| Provider | Secret Name | Endpoint | Capabilities |
|---|---|---|---|
| Anthropic Claude | `ANTHROPIC_API_KEY` | `/api/ai` (provider: "anthropic") | Text generation, web search |
| Venice AI | `VENICE_API_KEY` | `/api/ai` (provider: "venice") + `/api/image` | Uncensored text + image generation |
| Perplexity Sonar | `PERPLEXITY_API_KEY` | `/api/ai` (provider: "perplexity") + `/api/search` | RAG search with citations |
| OpenRouter | `OPENROUTER_API_KEY` | `/api/ai` (provider: "openrouter") | Multi-model routing (200+ models) |

## For Spring (GitHub)

Push the `/home/ubuntu/hulukipedia` directory to the `caseypotatowebb-cpu/hulukipedia` repo. Key files:

- `worker/index.js` — the Cloudflare Worker backend
- `src/Hulukipedia.jsx` — the main React component
- `wrangler.toml` — Cloudflare deployment config
- `package.json`, `vite.config.js` — build config

To redeploy after changes: `cd hulukipedia && npx vite build && wrangler deploy`

## For Monday (App Logic)

Two known issues from the original Gemini version that carried over:

1. **Confirmed Intel JSON parsing** — The AI sometimes returns slightly malformed JSON for the intel section. The parsing logic in the `compileIntel` function could use a more forgiving parser or a retry mechanism.

2. **Markdown rendering** — Generated text shows raw markdown syntax (`**bold**`, `###` headers) instead of formatted text. A markdown-to-HTML renderer (like `marked` or `react-markdown`) would fix this across all sections.

## For Wednesday (Architecture Review)

The provider selection system works at two levels: a global default provider selector in the header, and per-section override dropdowns. Each section can independently choose its provider and model. The backend routes based on the `provider` field in the request body.

The `/api/providers` endpoint returns the full list of available providers and models, which the frontend uses to populate dropdowns dynamically.

## Deployment Commands

```bash
# Build frontend
cd /home/ubuntu/hulukipedia && npx vite build

# Deploy to Cloudflare
wrangler deploy

# Add/update a secret
echo "your-key-here" | wrangler secret put SECRET_NAME

# Check deployment status
wrangler whoami
```

---

## v3.0.1 — Security & Fixes

Review-driven fixes shipped in v3.0.1:

- **Section provider switcher** — Fixed a state race where picking a new provider for a
  section left it paired with the old provider (broke API routing). Model-only changes now
  preserve the queued provider.
- **CORS** — The worker now echoes the request's `Origin` header (instead of its own origin)
  on every response, so cross-origin browsers and teammates' agents are no longer blocked.
  `x-app-token` is allowed in CORS headers.
- **OpenAI reasoning models** — `o1*`, `o3*`, and `gpt-5*` now use `max_completion_tokens`
  and omit `temperature` (they reject `max_tokens` / non-default temperature).
- **xAI agentic search** — `useSearch` now calls the `/v1/responses` agentic tools endpoint
  with `web_search` + `x_search` tools and parses the Responses-API output shape.
- **maxTokens clamp** — Client-supplied `maxTokens` is clamped to 1–8000.
- **SPA asset binding** — `wrangler.toml` now sets `binding = "ASSETS"` and
  `not_found_handling = "single-page-application"` so client routes resolve.
- **UI hardening** — Copy All guards against intel categories without `entries`; image
  generation failures now surface an error message in the Portrait panel; the Confirmed
  Intel verifier uses the real search mode instead of a hardcoded one.
- **Repo hygiene** — Added `.gitignore`, `dev`/`build`/`deploy` npm scripts, and `wrangler`
  as a devDependency.

### Optional team token (`APP_TOKEN`)

The `/api` endpoints proxy paid AI APIs. They remain fully open by default. To restrict
access, set a Worker secret:

```bash
wrangler secret put APP_TOKEN
```

Once set, POST requests to `/api/ai`, `/api/image`, and `/api/search` are allowed only when
either:

- the request comes from the app's own frontend (its `Origin` matches the worker origin), so
  the deployed UI needs no token, **or**
- the request carries a matching `x-app-token` header — this is how teammates' agents
  authenticate.

Requests failing both checks get `401 { "error": "Missing or invalid x-app-token" }`. If
`APP_TOKEN` is unset, behavior is unchanged (no token required).

Redeploy after changes with `npm run deploy`.
