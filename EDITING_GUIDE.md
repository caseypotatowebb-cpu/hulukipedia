# Hulukipedia Editing Guide — Team Tomorrow

**Author:** Autumn (Pearl Peregrine)  
**Date:** April 11, 2026  
**Audience:** Monday, Wednesday, Spring, and any Team Tomorrow member dispatched by the Commander.

This document explains the architecture of the Hulukipedia Cloudflare deployment in plain terms and provides a direct map of where to edit the code to expand its capabilities—specifically focusing on unlocking the full potential of Venice AI.

---

## The Architecture (Plain Language)

The app is split into two distinct parts. They talk to each other, but they live in different files.

### 1. The Frontend (What You See)
- **File:** `src/Hulukipedia.jsx`
- **What it does:** This is the user interface. It contains the dark theme, the buttons, the layout, and the dropdown menus. When the Commander clicks "Generate Profile," this file packages up the prompt (e.g., "Write a psychological profile for Tony Stark") and sends it to the backend.
- **Why edit this:** You edit this file when you want to change how the app looks, add new buttons, change the prompts being sent to the AI, or add new models to the dropdown menus.

### 2. The Backend (The Engine Room)
- **File:** `worker/index.js`
- **What it does:** This is a Cloudflare Worker. It acts as a secure middleman. It receives the prompt from the frontend, grabs the correct API key from its encrypted vault (which the Commander set up), and sends the request to Anthropic, Venice, Perplexity, or OpenRouter. When the AI answers, the backend sends the text back to the frontend.
- **Why edit this:** You edit this file when you need to add a completely new API provider, change how the app talks to an existing API (like switching Venice from text to image generation), or fix JSON parsing errors before they reach the frontend.

---

## Where to Edit for Specific Upgrades

The Commander has identified Venice AI as a massive, underutilized asset. It has over 60 models, uncensored text generation, image generation, and web search capabilities. Right now, it's wired in, but it's only being used as a basic text generator when selected from a dropdown. 

Here is exactly where to go to unlock its full potential.

### Upgrade 1: Expanding Venice Model Options
Currently, the frontend only offers a few models in the dropdowns. Venice has over 60.

**Where to go:** `src/Hulukipedia.jsx`
**What to look for:** Search for the `providers` array near the top of the file.
**What to do:** Add the specific Venice model names (e.g., `llama-3.3-70b`, `qwen-2.5-72b`) to the `models` list under the Venice provider object. This will instantly make them selectable in the UI.

### Upgrade 2: Defaulting Specific Sections to Venice
Right now, Claude (Anthropic) is the default for every section. We want to use the best tool for each specific job.

**Where to go:** `src/Hulukipedia.jsx`
**What to look for:** Search for the state initialization `const [sectionProviders, setSectionProviders] = useState({...})`.
**What to do:** Change the default provider for specific sections. For example, set the default for the "Psychological Profile" or "Locker Room Physical Description" to `venice` instead of `anthropic` to leverage its uncensored models.

### Upgrade 3: Fixing the Markdown Rendering
The generated text currently displays raw markdown syntax (like `**bold**`) instead of formatted text.

**Where to go:** `src/Hulukipedia.jsx`
**What to look for:** Search for where the text is rendered on screen, usually inside `<div>` tags rendering `{intel.background}` or similar state variables.
**What to do:** Import a markdown rendering library (like `react-markdown`) and wrap the output text in it. The Commander expects polished, readable text, not raw code.

### Upgrade 4: Fixing the Confirmed Intel JSON Parsing
Sometimes the AI returns text that isn't perfectly formatted JSON, causing the Confirmed Intel section to fail to load.

**Where to go:** `src/Hulukipedia.jsx`
**What to look for:** Search for the `compileIntel` function.
**What to do:** The current `JSON.parse()` is too brittle. Implement a more forgiving parsing logic or a regex extraction step to pull the JSON object out of the surrounding text before parsing it. 

### Upgrade 5: Adding Venice Web Search
Venice supports web search during generation, but the backend isn't currently passing the parameter to enable it.

**Where to go:** `worker/index.js`
**What to look for:** Search for the `if (provider === 'venice')` block inside the main fetch handler.
**What to do:** Modify the payload sent to the Venice API to include the `venice_parameters: { enable_web_search: "on" }` flag when appropriate.

---

## Deployment Instructions

Once edits are made, the app must be rebuilt and pushed to Cloudflare.

1. Open the terminal in the sandbox.
2. Navigate to the project folder: `cd /home/ubuntu/hulukipedia`
3. Build the frontend: `npx vite build`
4. Deploy to Cloudflare: `wrangler deploy`

The live URL is: `https://hulukipedia.teamtomorrowlabs.workers.dev`

*Note: Spring manages the GitHub repository. Ensure all working code is pushed to `caseypotatowebb-cpu/hulukipedia` after a successful deployment.*
