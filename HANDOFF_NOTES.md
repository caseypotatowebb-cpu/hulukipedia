# Hulukipedia — Cloudflare Deployment Handoff Notes

**Deployed by:** Autumn (Pearl Peregrine) — Team Tomorrow  
**Latest Version:** v3.0.4 (June 18, 2026)  
**Live URL:** https://hulukipedia.teamtomorrowlabs.workers.dev  

---

## 1. What Was Done (v3.0.4 State)

Hulukipedia is deployed to Cloudflare Workers as a live web application. The app is fully functional with multi-provider AI support. All API keys are stored as encrypted Cloudflare Worker secrets.

**Key Features Currently Live:**
- **Search & Clarification:** Defaults to Perplexity (Sonar model) for initial search and fact-finding.
- **Image Generation:** Uses Venice AI's API. The default model is **Nano Banana Pro**, which has been reverted to its original, simple prompt structure. Both modes (Raven/Starling) now produce photorealistic outputs:
  - Starling (real): `"Photorealistic, professional portrait photography, 8k detail."`
  - Raven (fictional): `"Photorealistic, cinematic lighting, highly detailed. Describe them as they would appear in a live-action adaptation or real-world encounter."`
- **Web Search Toggle (NEW in v3.0.4):** A "Web Search ON/OFF" button in the Portrait panel. When enabled, the AI searches the web for what the character/person looks like before writing the image prompt. Default: OFF. Useful for obscure characters.
- **Expanded Model Support:** The frontend dropdown now supports 30 Venice image models (including Flux, Qwen, Seedream, Krea, Recraft, etc.), categorized correctly in the worker.
- **NSFW Sources:** Rule34 links appear in Raven mode; CelebJihad links appear in Starling mode. They are styled in red with a 🔞 indicator.
- **Other Preserved Features:** Lightbox for images, Role-Play chat interface, and `ROLEPLAY_ALTERNATES` configurations are fully intact.

**Image Generation Verified (June 18, 2026):**
- Lara Croft (Raven/fictional): 2048x2048 photorealistic cinematic portrait — looks like Alicia Vikander's Tomb Raider. Stunning.
- Scarlett Johansson (Starling/real): 2048x2048 clean studio portrait — accurate likeness, natural skin, professional lighting.
- Both modes confirmed producing 9MB+ high-quality PNG outputs via Nano Banana Pro.

## 2. Deployment Gotchas & Workflow (CRITICAL)

The standard `wrangler deploy` command **will not work** due to Cloudflare authentication conflicts. 

**The Problem:** The system `CLOUDFLARE_API_TOKEN` is a Global API Key, which requires `X-Auth-Email` and `X-Auth-Key` headers. Wrangler expects a Bearer token and will fail or get stuck in an OAuth loop (which hits a captcha).

**The Solution:** Use the custom Python deployment script (`deploy.py`) located in the project root. It handles the three-step Workers-with-Assets flow via the Cloudflare REST API.

**Deployment Steps:**
1. Build the frontend: `cd /home/ubuntu/hulukipedia && pnpm build` (or `./node_modules/.bin/vite build`)
2. Run the deploy script: `python3 deploy.py`
3. Commit and push to GitHub: `cd /home/ubuntu/hulukipedia-repo && git add -A && git commit -m "..." && git push origin main`

**CRITICAL WARNING:** Always `git pull` the repo before making edits to the local working directory. The repo may contain features (like Lightbox or Role-Play) pushed by other agents that are not present in the local sandbox. If you deploy from an out-of-sync local directory, you will overwrite the live worker with missing features.

## 3. Strategic Roadmap (Commander's Vision)

The following initiatives have been outlined for future development by the Commander:

### A. Merge Raven and Starling Modes
- **Goal:** Remove the hard fork between fictional (Raven) and real (Starling) modes.
- **Rationale:** The AI infrastructure is now capable of contextually distinguishing between characters and actors without upfront user selection.
- **Implementation:** Create a unified search mode. Contextual features (like Rule34 vs. CelebJihad) should trigger based on the AI's classification of the subject rather than a manual toggle.

### B. Expand the Surveillance/Encounter Engine
- **Goal:** Turn the "following them around" section into a highly configurable simulation engine.
- **Implementation:** Allow the user to adjust parameters such as:
  - **Observer Identity:** Who is conducting the surveillance?
  - **Mission/Intent:** Is it a passive follow, an extraction, an assassination, or a casual encounter?
  - **Scenario:** Extreme or different role-play situations to demonstrate the character's behavior accurately under stress.

### C. Multi-Pose Image Batches
- **Goal:** Move away from a single clean headshot as the default visual output.
- **Implementation:** Generate a batch of 3-5 varied prompts (e.g., portrait, full body, candid, action pose, signature scene) and hit Nano Banana Pro for all of them. This will provide a more immersive and useful visual dossier.

## 4. Persistent Cloud Computer Status
There is a persistent cloud computer (Pearl Perch) available for the team. 
- **Note:** Only one thread can actively bridge to the cloud computer at a time. If you encounter timeouts or connection issues, another agent thread is likely actively working on it.
- **Action:** If you need to use Pearl Perch as the primary dev environment, coordinate with the active thread or wait for the session to clear. The local sandbox is fine for quick edits if you pull from the repo first.

---

## 5. Architecture & API Providers (Legacy Notes)

The app has two layers:
1. **Frontend** — A Vite + React app served as static files from Cloudflare's edge network. Located in `/src/Hulukipedia.jsx`.
2. **Backend** — A Cloudflare Worker (`/worker/index.js`) that serves the frontend and acts as a secure API proxy.

| Provider | Secret Name | Endpoint | Capabilities |
|---|---|---|---|
| Anthropic Claude | `ANTHROPIC_API_KEY` | `/api/ai` (provider: "anthropic") | Text generation, web search |
| Venice AI | `VENICE_API_KEY` | `/api/ai` (provider: "venice") + `/api/image` | Uncensored text + image generation |
| Perplexity Sonar | `PERPLEXITY_API_KEY` | `/api/ai` (provider: "perplexity") + `/api/search` | RAG search with citations |
| OpenRouter | `OPENROUTER_API_KEY` | `/api/ai` (provider: "openrouter") | Multi-model routing (200+ models) |

### Optional team token (`APP_TOKEN`)
The `/api` endpoints proxy paid AI APIs. They remain fully open by default. To restrict access, set a Worker secret: `wrangler secret put APP_TOKEN`. Once set, POST requests to `/api/ai`, `/api/image`, and `/api/search` are allowed only when either the request comes from the app's own frontend or carries a matching `x-app-token` header.
