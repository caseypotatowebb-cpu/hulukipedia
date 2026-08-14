/**
 * Hulukipedia — Cloudflare Worker (Multi-Provider)
 * Serves the static frontend and proxies AI API calls.
 * API keys are stored as Worker secrets — never exposed to the browser.
 *
 * Supported providers:
 *   - venice     (Primary: uncensored text + web search + image generation)
 *   - anthropic  (Claude — reliable structured output)
 *   - perplexity (Deep search / RAG with citations)
 *   - openrouter (Model routing — access to 200+ models)
 *   - openai     (GPT-4o — direct from OpenAI)
 *   - gemini     (Google Gemini 3.x — fast + multimodal)
 *   - xai        (Grok 4.20, Grok 4.3+ — direct character and analysis voices)
 *   - mistral    (Mistral Studio — direct text, reasoning, and vision-capable models)
 *   - omni       (Google Omni Flash Preview — direct multimodal text/video-capable model)
 *
 * Venice integration notes:
 *   - Web search: enabled via venice_parameters.enable_web_search
 *   - Uncensored: include_venice_system_prompt: false removes content guardrails
 *   - Image generation: /api/v1/image/generate with nano-banana-pro default
 *
 * Optional team token (APP_TOKEN):
 *   The /api endpoints proxy paid AI APIs. To restrict access, set a Worker
 *   secret with `wrangler secret put APP_TOKEN`. Once set, POST requests to
 *   /api/ai, /api/image, /api/search are allowed only when the request comes
 *   from the app's own frontend (Origin matches the worker origin) OR carries
 *   a matching `x-app-token` header. Teammates' agents send `x-app-token`.
 *   If APP_TOKEN is unset, the proxy stays fully open (no behavior change).
 *
 * A Team Tomorrow Production 🦅
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const reqOrigin = request.headers.get("Origin");

    // ─── CORS preflight ───
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(reqOrigin) });
    }

    // ─── Optional team token gate for the paid /api POST endpoints ───
    const protectedPost =
      request.method === "POST" &&
      (url.pathname === "/api/ai" || url.pathname === "/api/image" || url.pathname === "/api/search" || url.pathname === "/api/scene-check");
    if (protectedPost && env.APP_TOKEN) {
      const sameOrigin = reqOrigin === url.origin;
      const hasToken = request.headers.get("x-app-token") === env.APP_TOKEN;
      if (!sameOrigin && !hasToken) {
        return jsonResponse({ error: "Missing or invalid x-app-token" }, 401, reqOrigin);
      }
    }

    // ─── API Routes ───
    if (url.pathname === "/api/ai" && request.method === "POST") {
      return handleAIProxy(request, env, reqOrigin);
    }

    if (url.pathname === "/api/image" && request.method === "POST") {
      return handleImageProxy(request, env, reqOrigin);
    }

    if (url.pathname === "/api/search" && request.method === "POST") {
      return handleSearchProxy(request, env, reqOrigin);
    }

    if (url.pathname === "/api/scene-check" && request.method === "POST") {
      return handleSceneCheck(request, env, reqOrigin);
    }

    if (url.pathname === "/api/providers") {
      return jsonResponse({
        providers: [
          {
            id: "venice",
            name: "Venice AI",
            capabilities: ["text", "image", "search"],
            models: [
              "zai-org-glm-5-2", "olafangensan-glm-4.7-flash-heretic",
              "venice-uncensored-role-play", "venice-uncensored-1-2",
              "qwen-3-7-plus", "qwen-3-6-plus", "kimi-k2-6", "grok-4-5", "grok-4-3",
              "gemini-3-6-flash", "mistral-small-2603", "deepseek-v4-pro",
              "openai-gpt-4o-2024-11-20", "aion-labs-aion-3-0", "aion-labs-aion-3-0-mini", "qwen3-vl-235b-a22b",
            ],
          },
          {
            id: "anthropic",
            name: "Anthropic Claude",
            capabilities: ["text"],
            models: ["claude-opus-4-6", "claude-sonnet-4-5-20250929", "claude-opus-4-5-20251101", "claude-haiku-4-5-20251001"],
          },
          {
            id: "perplexity",
            name: "Perplexity Sonar",
            capabilities: ["text", "search"],
            models: ["sonar", "sonar-pro", "sonar-reasoning-pro", "sonar-deep-research"],
          },
          {
            id: "mistral",
            name: "Mistral Studio",
            capabilities: ["text", "reasoning", "vision"],
            models: ["mistral-medium-2604", "mistral-small-2603", "mistral-large-2512"],
          },
          {
            id: "openrouter",
            name: "OpenRouter",
            capabilities: ["text"],
            models: ["anthropic/claude-sonnet-4.5", "anthropic/claude-opus-4.5", "google/gemini-3.1-pro-preview", "google/gemini-3.7-flash", "x-ai/grok-4.6", "x-ai/grok-4.3"],
          },
          {
            id: "openai",
            name: "OpenAI",
            capabilities: ["text"],
            models: ["gpt-4o"],
          },
          {
            id: "gemini",
            name: "Google Gemini",
            capabilities: ["text"],
            models: ["gemini-3.1-pro-preview", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"],
          },
          {
            id: "omni",
            name: "Google Omni Flash",
            capabilities: ["text", "video-preview", "audio-preview"],
            models: ["gemini-omni-flash-preview"],
          },
          {
            id: "xai",
            name: "Grok (xAI)",
            capabilities: ["text", "search"],
            models: ["grok-4.20-0309-non-reasoning", "grok-4.20-0309-reasoning", "grok-4.20-multi-agent-0309", "grok-4.6", "grok-4.5", "grok-4.3"],
          },
        ],
      }, 200, reqOrigin);
    }

    if (url.pathname === "/api/health") {
      return jsonResponse({ status: "ok", timestamp: new Date().toISOString(), version: "3.6.0" }, 200, reqOrigin);
    }

    // ─── Static assets ───
    if (env.ASSETS) {
      try { return await env.ASSETS.fetch(request); } catch (e) { /* fall through */ }
    }

    return new Response("Not Found", { status: 404 });
  },
};


// ═══════════════════════════════════════════════════════════════
//  AI TEXT PROXY — routes to the selected provider
// ═══════════════════════════════════════════════════════════════

async function handleAIProxy(request, env, origin) {
  try {
    const body = await request.json();
    let {
      systemPrompt,
      userPrompt,
      maxTokens = 2000,
      useSearch = false,
      provider = "venice",
      model,
    } = body;

    if (!systemPrompt || !userPrompt) {
      return jsonResponse({ error: "Missing systemPrompt or userPrompt" }, 400, origin);
    }

    maxTokens = Math.min(Math.max(parseInt(maxTokens) || 2000, 1), 8000);

    switch (provider) {
      case "venice":
        return await callVenice(env, systemPrompt, userPrompt, maxTokens, model, useSearch, origin);
      case "anthropic":
        return await callAnthropic(env, systemPrompt, userPrompt, maxTokens, useSearch, model, origin);
      case "perplexity":
        return await callPerplexity(env, systemPrompt, userPrompt, maxTokens, model, origin);
      case "openrouter":
        return await callOpenRouter(env, systemPrompt, userPrompt, maxTokens, model, origin);
      case "openai":
        return await callOpenAI(env, systemPrompt, userPrompt, maxTokens, model, origin);
      case "gemini":
        return await callGemini(env, systemPrompt, userPrompt, maxTokens, model, origin);
      case "omni":
        return await callOmniFlash(env, systemPrompt, userPrompt, model, origin);
      case "xai":
        return await callXAI(env, systemPrompt, userPrompt, maxTokens, model, useSearch, origin);
      case "mistral":
        return await callMistral(env, systemPrompt, userPrompt, maxTokens, model, origin);
      default:
        return jsonResponse({ error: `Unknown provider: ${provider}` }, 400, origin);
    }
  } catch (e) {
    return jsonResponse({ error: `Proxy error: ${e.message}` }, 500, origin);
  }
}


// ─── Venice AI (text + optional web search) ───
async function callVenice(env, systemPrompt, userPrompt, maxTokens, model, useSearch, origin) {
  const apiKey = env.VENICE_API_KEY;
  if (!apiKey) return jsonResponse({ error: "Venice API key not configured" }, 500, origin);

  const selectedModel = model || "openai-gpt-4o-2024-11-20";

  const veniceBody = {
    model: selectedModel,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    venice_parameters: {
      include_venice_system_prompt: false,
      enable_web_search: useSearch ? "on" : "off",
    },
  };

  const res = await fetch("https://api.venice.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(veniceBody),
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    return jsonResponse({ error: `Venice returned non-JSON response (HTTP ${res.status})` }, 502, origin);
  }

  if (!res.ok) {
    const errMsg = data?.error?.message || data?.error || data?.detail || `Venice error: ${res.status}`;
    return jsonResponse({ error: errMsg }, res.status, origin);
  }

  const text = data.choices?.[0]?.message?.content || "";
  const citations = data.citations || data.choices?.[0]?.message?.citations || [];
  return jsonResponse({ text, citations, provider: "venice", model: selectedModel }, 200, origin);
}


// ─── Anthropic Claude ───
async function callAnthropic(env, systemPrompt, userPrompt, maxTokens, useSearch, model, origin) {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) return jsonResponse({ error: "Anthropic API key not configured" }, 500, origin);

  const anthropicBody = {
    model: model || "claude-sonnet-4-5-20250929",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  };

  if (useSearch) {
    anthropicBody.tools = [{ type: "web_search_20250305", name: "web_search" }];
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(anthropicBody),
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    return jsonResponse({ error: `Anthropic returned non-JSON response (HTTP ${res.status})` }, 502, origin);
  }

  if (!res.ok) return jsonResponse({ error: data.error?.message || `Anthropic error: ${res.status}` }, res.status, origin);

  const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || "";
  return jsonResponse({ text, provider: "anthropic", model: anthropicBody.model }, 200, origin);
}


// ─── Perplexity Sonar (text + search/RAG) ───
async function callPerplexity(env, systemPrompt, userPrompt, maxTokens, model, origin) {
  const apiKey = env.PERPLEXITY_API_KEY;
  if (!apiKey) return jsonResponse({ error: "Perplexity API key not configured" }, 500, origin);

  const pplxBody = {
    model: model || "sonar",
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
    return_citations: true,
  };

  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(pplxBody),
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    return jsonResponse({ error: `Perplexity returned non-JSON response (HTTP ${res.status})` }, 502, origin);
  }

  if (!res.ok) return jsonResponse({ error: data.error?.message || `Perplexity error: ${res.status}` }, res.status, origin);

  const text = data.choices?.[0]?.message?.content || "";
  const citations = data.citations || [];
  return jsonResponse({ text, citations, provider: "perplexity", model: pplxBody.model }, 200, origin);
}


// ─── OpenRouter (model routing) ───
async function callOpenRouter(env, systemPrompt, userPrompt, maxTokens, model, origin) {
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) return jsonResponse({ error: "OpenRouter API key not configured" }, 500, origin);

  const orBody = {
    model: model || "anthropic/claude-sonnet-4.5",
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://hulukipedia.teamtomorrowlabs.workers.dev",
      "X-Title": "Hulukipedia",
    },
    body: JSON.stringify(orBody),
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    return jsonResponse({ error: `OpenRouter returned non-JSON response (HTTP ${res.status})` }, 502, origin);
  }

  if (!res.ok) return jsonResponse({ error: data.error?.message || `OpenRouter error: ${res.status}` }, res.status, origin);

  const text = data.choices?.[0]?.message?.content || "";
  return jsonResponse({ text, provider: "openrouter", model: orBody.model }, 200, origin);
}


// ─── Mistral Studio (direct chat, reasoning, and vision-capable text models) ───
async function callMistral(env, systemPrompt, userPrompt, maxTokens, model, origin) {
  const apiKey = env.MISTRAL_API_KEY;
  if (!apiKey) return jsonResponse({ error: "Mistral API key not configured" }, 500, origin);

  const selectedModel = model || "mistral-medium-2604";
  const mistralBody = {
    model: selectedModel,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
  };

  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(mistralBody),
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    return jsonResponse({ error: `Mistral returned non-JSON response (HTTP ${res.status})` }, 502, origin);
  }

  if (!res.ok) {
    const errMsg = data?.message || data?.error?.message || data?.error || `Mistral error: ${res.status}`;
    return jsonResponse({ error: errMsg }, res.status, origin);
  }

  const content = data.choices?.[0]?.message?.content;
  const text = typeof content === "string"
    ? content
    : Array.isArray(content)
      ? content.map(item => item?.text || item?.content || "").join("")
      : "";
  return jsonResponse({ text, provider: "mistral", model: selectedModel }, 200, origin);
}


// ─── OpenAI (account-available GPT-4o) ───
async function callOpenAI(env, systemPrompt, userPrompt, maxTokens, model, origin) {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) return jsonResponse({ error: "OpenAI API key not configured" }, 500, origin);

  const selectedModel = model || "gpt-4o";

  // Reasoning models (o1*, o3*, gpt-5*) require max_completion_tokens and reject
  // a non-default temperature.
  const isReasoning = /^(o\d|gpt-5)/.test(selectedModel);

  const oaiBody = {
    model: selectedModel,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };

  if (isReasoning) {
    oaiBody.max_completion_tokens = maxTokens;
  } else {
    oaiBody.max_tokens = maxTokens;
    oaiBody.temperature = 0.7;
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(oaiBody),
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    return jsonResponse({ error: `OpenAI returned non-JSON response (HTTP ${res.status})` }, 502, origin);
  }

  if (!res.ok) {
    const errMsg = data?.error?.message || `OpenAI error: ${res.status}`;
    return jsonResponse({ error: errMsg }, res.status, origin);
  }

  const text = data.choices?.[0]?.message?.content || "";
  return jsonResponse({ text, provider: "openai", model: selectedModel }, 200, origin);
}


// ─── Google Gemini (OpenAI-compatible endpoint) ───
async function callGemini(env, systemPrompt, userPrompt, maxTokens, model, origin) {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) return jsonResponse({ error: "Gemini API key not configured" }, 500, origin);

  const selectedModel = model || "gemini-3.7-flash";

  // Gemini supports OpenAI-compatible endpoint
  const geminiBody = {
    model: selectedModel,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
  };

  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(geminiBody),
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    return jsonResponse({ error: `Gemini returned non-JSON response (HTTP ${res.status})` }, 502, origin);
  }

  if (!res.ok) {
    const errMsg = data?.error?.message || data?.error?.status || `Gemini error: ${res.status}`;
    return jsonResponse({ error: errMsg }, res.status, origin);
  }

  const text = data.choices?.[0]?.message?.content || "";
  return jsonResponse({ text, provider: "gemini", model: selectedModel }, 200, origin);
}


// ─── Google Omni Flash Preview (Gemini Interactions API) ───
// Omni does not accept system instructions as a distinct field, so the Worker composes
// a single explicit task input. This keeps the familiar Hulukipedia provider contract.
async function callOmniFlash(env, systemPrompt, userPrompt, model, origin) {
  const apiKey = env.GOOGLE_OMNI_API_KEY;
  if (!apiKey) return jsonResponse({ error: "Google Omni Flash API key not configured" }, 500, origin);

  const selectedModel = model || "gemini-omni-flash-preview";
  const omniBody = {
    model: selectedModel,
    input: `${systemPrompt}\n\nUser request:\n${userPrompt}`,
  };

  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(omniBody),
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    return jsonResponse({ error: `Google Omni Flash returned non-JSON response (HTTP ${res.status})` }, 502, origin);
  }

  if (!res.ok) {
    const errMsg = data?.error?.message || data?.error?.status || `Google Omni Flash error: ${res.status}`;
    return jsonResponse({ error: errMsg }, res.status, origin);
  }

  const text = (data.steps || [])
    .filter(step => step?.type === "model_output")
    .flatMap(step => step.content || [])
    .map(part => part?.text || "")
    .filter(Boolean)
    .join("\n");
  return jsonResponse({ text, provider: "omni", model: selectedModel }, 200, origin);
}


// ─── xAI Grok (OpenAI-compatible endpoint) ───
async function callXAI(env, systemPrompt, userPrompt, maxTokens, model, useSearch, origin) {
  const apiKey = env.XAI_API_KEY;
  if (!apiKey) return jsonResponse({ error: "xAI API key not configured" }, 500, origin);

  const selectedModel = model || "grok-4.20-0309-non-reasoning";

  // xAI's built-in web/X search lives on the agentic /v1/responses endpoint,
  // not chat completions. Without search we keep the standard chat call.
  if (useSearch) {
    const responsesBody = {
      model: selectedModel,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [{ type: "web_search" }, { type: "x_search" }],
      max_output_tokens: maxTokens,
    };

    const res = await fetch("https://api.x.ai/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(responsesBody),
    });

    let data;
    try {
      data = await res.json();
    } catch (e) {
      return jsonResponse({ error: `xAI returned non-JSON response (HTTP ${res.status})` }, 502, origin);
    }

    if (!res.ok) {
      const errMsg = data?.error?.message || `xAI/Grok error: ${res.status}`;
      return jsonResponse({ error: errMsg }, res.status, origin);
    }

    let text = "";
    if (typeof data.output_text === "string") {
      text = data.output_text;
    } else if (Array.isArray(data.output)) {
      text = data.output
        .filter(item => item?.type === "message")
        .map(item => (item.content || [])
          .filter(c => c?.type === "output_text")
          .map(c => c.text || "")
          .join(""))
        .join("");
    }
    const citations = data.citations || [];
    return jsonResponse({ text, citations, provider: "xai", model: selectedModel }, 200, origin);
  }

  const xaiBody = {
    model: selectedModel,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
  };

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(xaiBody),
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    return jsonResponse({ error: `xAI returned non-JSON response (HTTP ${res.status})` }, 502, origin);
  }

  if (!res.ok) {
    const errMsg = data?.error?.message || `xAI/Grok error: ${res.status}`;
    return jsonResponse({ error: errMsg }, res.status, origin);
  }

  const text = data.choices?.[0]?.message?.content || "";
  return jsonResponse({ text, provider: "xai", model: selectedModel }, 200, origin);
}


// ═══════════════════════════════════════════════════════════════
//  IMAGE GENERATION PROXY — Venice AI
// ═══════════════════════════════════════════════════════════════

async function handleImageProxy(request, env, origin) {
  try {
    const body = await request.json();
    const { prompt, negativePrompt, model, width, height, style, aspectRatio, resolution } = body;

    if (!prompt) return jsonResponse({ error: "Missing prompt" }, 400, origin);

    const apiKey = env.VENICE_API_KEY;
    if (!apiKey) return jsonResponse({ error: "Venice API key not configured for images" }, 500, origin);

    // Default to nano-banana-pro for photorealistic output
    const selectedModel = model || "nano-banana-pro";

    // Capability families verified against Venice's live /models?type=image catalog (2026-08-12).
    // Tiered models accept both aspect_ratio and explicit 1K/2K/4K resolution.
    const resolutionTierModels = [
      "nano-banana-pro", "nano-banana-2",
      "gpt-image-2",
      "grok-imagine-image", "grok-imagine-image-quality", "grok-imagine-image-2-0",
      "krea-2-turbo",
      "qwen-image-3", "qwen-image-3-pro",
      "seedream-v5-pro",
    ];
    // These models advertise aspect-ratio control without resolution tiers.
    const aspectOnlyModels = [
      "flux-2-pro", "flux-2-max", "gpt-image-1-5",
      "qwen-image", "qwen-image-2", "qwen-image-2-pro",
      "seedream-v4", "seedream-v5-lite",
      "ideogram-v4", "krea-v2-large", "krea-v2-medium",
      "luma-uni-1", "luma-uni-1-max",
      "recraft-v4", "recraft-v4-pro",
      "hunyuan-image-v3", "imagineart-1.5-pro",
      "wan-2-7-text-to-image", "wan-2-7-pro-text-to-image",
      "nano-banana-2-lite",
    ];
    // Legacy/pixel-controlled models expose a width/height divisor rather than ratio presets.
    const pixelModels = [
      "venice-sd35", "lustify-sdxl", "lustify-v7", "lustify-v8",
      "wai-Illustrious", "chroma", "z-image-turbo", "bria-bg-remover",
    ];

    const imgBody = {
      model: selectedModel,
      prompt,
      format: "png",
      safe_mode: false,
      hide_watermark: true,
    };

    // Add negative prompt if provided
    if (negativePrompt) imgBody.negative_prompt = negativePrompt;

    // Set sizing based on model type
    if (resolutionTierModels.includes(selectedModel)) {
      imgBody.aspect_ratio = aspectRatio || "1:1";
      imgBody.resolution = resolution || "2K";
    } else if (aspectOnlyModels.includes(selectedModel)) {
      imgBody.aspect_ratio = aspectRatio || "1:1";
    } else if (pixelModels.includes(selectedModel)) {
      // The frontend supplies dimensions for visual sets; the classic portrait retains 1024 square output.
      imgBody.width = width || 1024;
      imgBody.height = height || 1024;
    } else {
      // Unknown model — try resolution-tier first (most common for newer models)
      imgBody.aspect_ratio = aspectRatio || "1:1";
      imgBody.resolution = resolution || "2K";
    }

    if (style) imgBody.style_preset = style;

    const res = await fetch("https://api.venice.ai/api/v1/image/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(imgBody),
    });

    let data;
    try {
      data = await res.json();
    } catch (e) {
      return jsonResponse({ error: `Venice image returned non-JSON response (HTTP ${res.status})` }, 502, origin);
    }

    if (!res.ok) {
      const errMsg = data?.error?.message || data?.error || data?.detail || `Venice image error: ${res.status}`;
      return jsonResponse({ error: errMsg }, res.status, origin);
    }

    const imageBase64 = data.images?.[0] || "";
    if (!imageBase64) return jsonResponse({ error: "Venice returned no image data" }, 502, origin);

    return jsonResponse({ image: imageBase64, provider: "venice", model: selectedModel }, 200, origin);
  } catch (e) {
    return jsonResponse({ error: `Image proxy error: ${e.message}` }, 500, origin);
  }
}

// ═══════════════════════════════════════════════════════════════
//  SCENE CONTRACT CHECK — Venice Vision
// ═══════════════════════════════════════════════════════════════
// The check does not gate or delete imagery. It gives the user an honest signal
// when a required cast member, location, wardrobe, or interaction was missed.
async function handleSceneCheck(request, env, origin) {
  try {
    const { image, contract } = await request.json();
    if (!image || !contract) return jsonResponse({ error: "Missing image or scene contract" }, 400, origin);
    if (!env.VENICE_API_KEY) return jsonResponse({ error: "Venice API key not configured for scene review" }, 500, origin);

    const contractText = typeof contract === "string" ? contract : JSON.stringify(contract, null, 2);
    const body = {
      model: "qwen3-vl-235b-a22b",
      max_tokens: 600,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: "You are a precise visual scene-contract checker. Assess what is visibly present, not what a prompt intended. Return ONLY valid JSON with status (pass or review), checks (primary_subject_present, counterpart_present, distinct_people, wardrobe_matches, location_matches, interaction_matches), and a concise note. Mark a check false when the image cannot visibly support it. A missing required counterpart is always review.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Check this generated image against the following scene contract:\n${contractText}` },
            { type: "image_url", image_url: { url: image } },
          ],
        },
      ],
      venice_parameters: { include_venice_system_prompt: false },
    };

    const res = await fetch("https://api.venice.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.VENICE_API_KEY}` },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return jsonResponse({ error: data?.error?.message || data?.error || `Venice vision error: ${res.status}` }, res.status, origin);

    const raw = data?.choices?.[0]?.message?.content || "";
    const jsonBlock = raw.match(/\{[\s\S]*\}/)?.[0] || raw;
    let check;
    try { check = JSON.parse(jsonBlock); }
    catch { check = { status: "review", checks: {}, note: raw.slice(0, 320) || "Vision review returned an unreadable response." }; }
    if (check.status !== "pass") check.status = "review";
    return jsonResponse({ check, provider: "venice", model: "qwen3-vl-235b-a22b" }, 200, origin);
  } catch (e) {
    return jsonResponse({ error: `Scene review error: ${e.message}` }, 500, origin);
  }
}


// ═══════════════════════════════════════════════════════════════
//  DEEP SEARCH PROXY — Perplexity (with Venice fallback)
// ═══════════════════════════════════════════════════════════════

async function handleSearchProxy(request, env, origin) {
  try {
    const body = await request.json();
    const { query, systemPrompt, model, provider = "perplexity" } = body;

    if (!query) return jsonResponse({ error: "Missing query" }, 400, origin);

    // Try Perplexity first, fall back to Venice web search if Perplexity key missing
    if (provider === "venice" || !env.PERPLEXITY_API_KEY) {
      return await callVeniceSearch(env, query, systemPrompt, model, origin);
    }

    const apiKey = env.PERPLEXITY_API_KEY;

    const searchBody = {
      model: model || "sonar-pro",
      messages: [
        {
          role: "system",
          content: systemPrompt || "You are a thorough research assistant. Provide detailed, well-cited answers.",
        },
        { role: "user", content: query },
      ],
      temperature: 0.2,
      return_citations: true,
    };

    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(searchBody),
    });

    let data;
    try {
      data = await res.json();
    } catch (e) {
      return jsonResponse({ error: `Perplexity search returned non-JSON response (HTTP ${res.status})` }, 502, origin);
    }

    if (!res.ok) return jsonResponse({ error: data.error?.message || `Perplexity search error: ${res.status}` }, res.status, origin);

    const text = data.choices?.[0]?.message?.content || "";
    const citations = data.citations || [];
    return jsonResponse({ text, citations, provider: "perplexity", model: searchBody.model }, 200, origin);
  } catch (e) {
    return jsonResponse({ error: `Search proxy error: ${e.message}` }, 500, origin);
  }
}


// ─── Venice Web Search (fallback / direct) ───
async function callVeniceSearch(env, query, systemPrompt, model, origin) {
  const apiKey = env.VENICE_API_KEY;
  if (!apiKey) return jsonResponse({ error: "No search API key configured (Venice or Perplexity)" }, 500, origin);

  const veniceBody = {
    model: model || "llama-3.3-70b",
    max_tokens: 2000,
    messages: [
      {
        role: "system",
        content: systemPrompt || "You are a thorough research assistant. Provide detailed, well-cited answers.",
      },
      { role: "user", content: query },
    ],
    temperature: 0.3,
    venice_parameters: {
      include_venice_system_prompt: false,
      enable_web_search: "on",
    },
  };

  const res = await fetch("https://api.venice.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(veniceBody),
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    return jsonResponse({ error: `Venice search returned non-JSON response (HTTP ${res.status})` }, 502, origin);
  }

  if (!res.ok) {
    const errMsg = data?.error?.message || data?.error || `Venice search error: ${res.status}`;
    return jsonResponse({ error: errMsg }, res.status, origin);
  }

  const text = data.choices?.[0]?.message?.content || "";
  const citations = data.citations || data.choices?.[0]?.message?.citations || [];
  return jsonResponse({ text, citations, provider: "venice", model: veniceBody.model }, 200, origin);
}


// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-app-token",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(data, status = 200, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}
