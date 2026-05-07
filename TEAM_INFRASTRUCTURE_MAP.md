# Team Tomorrow: Hulukipedia Infrastructure & Handoff Map

**Author:** Autumn (Pearl Peregrine)  
**Date:** May 6, 2026  
**Audience:** Commander, Wednesday, Tuesday, Summer, Friday, Monday, Spring

This document is the source of truth for how Hulukipedia is currently built, where the pieces live, and exactly how any Team Tomorrow member can access and modify it without stepping on each other's toes.

---

## 1. The Big Picture: Where Everything Lives

Hulukipedia is not a single script on a laptop. It is a modern, decoupled web application.

*   **The Code Repository (GitHub):** `caseypotatowebb-cpu/hulukipedia`
    This is the permanent storage for all the code. If the sandbox resets, the code survives here. Spring manages this.
*   **The Live Hosting (Cloudflare Workers):** `https://hulukipedia.teamtomorrowlabs.workers.dev`
    This is where the app actually runs on the internet. Cloudflare serves the frontend to the user and runs the backend proxy that hides our API keys.
*   **The Working Environment (Manus Sandbox):** `/home/ubuntu/hulukipedia`
    This is the active construction zone. This is where we (the AI agents) edit files, run builds, and push updates to Cloudflare.

---

## 2. The Architecture: Frontend vs. Backend

The app is split into two distinct halves that talk to each other.

### The Frontend (The User Interface)
*   **Core File:** `src/Hulukipedia.jsx`
*   **What it is:** A React application built with Vite and styled with TailwindCSS.
*   **What it does:** It handles all the buttons, dropdowns, layout, and user interactions. When you click "Generate Profile," this file packages up the prompt and sends it to our backend.
*   **Who edits this:** Teammates working on UI, user experience, adding new models to dropdowns, or fixing how markdown text renders on the screen.

### The Backend (The Engine Room)
*   **Core File:** `worker/index.js`
*   **What it is:** A Cloudflare Worker script.
*   **What it does:** It acts as a secure middleman. It receives the prompt from the frontend, grabs the correct API key from its encrypted vault (which the Commander set up), and sends the request to Anthropic, Venice, Perplexity, or OpenRouter. When the AI answers, the backend sends the text back to the frontend.
*   **Who edits this:** Teammates working on API routing, adding new AI providers, changing how we talk to Venice (e.g., enabling web search or image generation), or fixing JSON parsing errors before they reach the frontend.

---

## 3. How to Access and Modify the App (The Workflow)

If you are a Team Tomorrow member dispatched to work on Hulukipedia, follow this exact workflow to ensure you don't break the live app or overwrite someone else's work.

### Step 1: Locate the Working Directory
All active development happens in the Manus sandbox at this path:
`/home/ubuntu/hulukipedia`

*(Note: There is also a folder called `/home/ubuntu/hulukipedia-repo`. That is the Git clone used for syncing with GitHub. Do your actual coding in `/home/ubuntu/hulukipedia`.)*

### Step 2: Make Your Edits
Edit `src/Hulukipedia.jsx` for frontend changes or `worker/index.js` for backend changes.

### Step 3: Build the Frontend (Crucial Step)
If you made *any* changes to the frontend (`src/` folder), you **must** rebuild the static assets before deploying. Cloudflare serves the built files, not the raw React code.
Run this command in the terminal:
`cd /home/ubuntu/hulukipedia && npx vite build`

### Step 4: Deploy to Cloudflare
Once your edits are made (and built, if necessary), push the update to the live internet. The Wrangler CLI is already authenticated in this sandbox.
Run this command in the terminal:
`cd /home/ubuntu/hulukipedia && npx wrangler deploy`

### Step 5: Sync with GitHub
After a successful deployment, the code must be backed up to GitHub so other teammates can see the changes. If Spring is active, ask Spring to handle this. If you are handling it yourself, push the contents of `/home/ubuntu/hulukipedia` to the `caseypotatowebb-cpu/hulukipedia` repository.

---

## 4. Current Known Issues (The To-Do List)

For teammates jumping in, here is what currently needs fixing:

1.  **Markdown Rendering (Frontend):** The generated text currently displays raw markdown syntax (like `**bold**`) instead of formatted text. A markdown-to-HTML renderer (like `react-markdown`) needs to be implemented in `src/Hulukipedia.jsx`.
2.  **Confirmed Intel JSON Parsing (Frontend/Backend):** The AI sometimes returns text that isn't perfectly formatted JSON, causing the Confirmed Intel section to fail to load. The parsing logic needs to be more forgiving, perhaps using regex to extract the JSON block.
3.  **Venice Web Search (Backend):** Venice supports web search during generation, but the backend (`worker/index.js`) isn't currently passing the parameter to enable it when users request it.
4.  **Venice Model Selection (Frontend):** The frontend only offers a few Venice models in the dropdowns. The full catalog needs to be added to the `providers` array in `src/Hulukipedia.jsx`.

---

## 5. A Note on "Persistent Logic"

The Commander noted a concern about "temporary token-focused logic" versus "account-wide persistent logic."

**The reality:** Hulukipedia *is* currently built on account-wide persistent logic.
Because it is deployed to Cloudflare Workers, it runs independently of any single Manus session. The API keys are stored securely in Cloudflare, not in our temporary sandbox memory. The app is live 24/7 at its URL, regardless of whether a Team Tomorrow agent is currently awake.

The only "temporary" part is our working memory in the Manus sandbox. That is why this document exists, and why syncing with GitHub is critical. As long as we follow the workflow above, the app itself is permanent and robust.
