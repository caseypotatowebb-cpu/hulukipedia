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
 *
 * Venice integration notes:
 *   - Web search: enabled via venice_parameters.enable_web_search
 *   - Uncensored: include_venice_system_prompt: false removes content guardrails
 *   - Image generation: /api/v1/image/generate with venice-sd35 default
 *
 * A Team Tomorrow Production 🦅
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ─── CORS preflight ───
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(url.origin) });
    }

    // ─── API Routes ───
    if (url.pathname === "/api/ai" && request.method === "POST") {
      return handleAIProxy(request, env, url.origin);
    }

    if (url.pathname === "/api/image" && request.method === "POST") {
      return handleImageProxy(request, env, url.origin);
    }

    if (url.pathname === "/api/search" && request.method === "POST") {
      return handleSearchProxy(request, env, url.origin);
    }

    if (url.pathname === "/api/providers") {
      return jsonResponse({
        providers: [
          {
            id: "venice",
            name: "Venice AI",
            capabilities: ["text", "image", "search"],
            models: [
              "venice-uncensored",
              "llama-3.3-70b",
              "llama-3.1-405b",
              "zai-org-glm-5-1",
              "deepseek-r1-671b",
              "kimi-k2-5",
              "qwen3-235b-a22b",
              "qwen3-vl-235b-a22b",
              "llama-3.2-11b-vision",
              "qwen-2.5-coder-32b",
              "deepseek-coder-v2-lite",
              "llama-3.2-3b",
              "qwen-2.5-72b",
              "mistral-31-24b",
            ],
          },
          {
            id: "anthropic",
            name: "Anthropic Claude",
            capabilities: ["text"],
            models: ["claude-sonnet-4-20250514", "claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"],
          },
          {
            id: "perplexity",
            name: "Perplexity Sonar",
            capabilities: ["text", "search"],
            models: ["sonar-pro", "sonar", "sonar-reasoning-pro", "sonar-reasoning"],
          },
          {
            id: "openrouter",
            name: "OpenRouter",
            capabilities: ["text"],
            models: [
              "anthropic/claude-sonnet-4-20250514",
              "google/gemini-2.5-flash",
              "openai/gpt-4o",
              "meta-llama/llama-3.3-70b-instruct",
            ],
          },
        ],
      }, 200, url.origin);
    }

    if (url.pathname === "/api/health") {
      return jsonResponse({ status: "ok", timestamp: new Date().toISOString(), version: "2.0.0" });
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
    const {
      systemPrompt,
      userPrompt,
      maxTokens = 1500,
      useSearch = false,
      provider = "venice",   // Venice is now the primary default
      model,
    } = body;

    if (!systemPrompt || !userPrompt) {
      return jsonResponse({ error: "Missing systemPrompt or userPrompt" }, 400, origin);
    }

    switch (provider) {
      case "venice":
        return await callVenice(env, systemPrompt, userPrompt, maxTokens, model, useSearch, origin);
      case "anthropic":
        return await callAnthropic(env, systemPrompt, userPrompt, maxTokens, useSearch, model, origin);
      case "perplexity":
        return await callPerplexity(env, systemPrompt, userPrompt, maxTokens, model, origin);
      case "openrouter":
        return await callOpenRouter(env, systemPrompt, userPrompt, maxTokens, model, origin);
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

  const selectedModel = model || "venice-uncensored";

  const veniceBody = {
    model: selectedModel,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    // Venice-specific parameters
    venice_parameters: {
      // Disable Venice's default system prompt so our prompts are fully respected
      include_venice_system_prompt: false,
      // Enable web search when requested — Venice's built-in grounded search
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
  // Venice may return citations in web search mode
  const citations = data.citations || data.choices?.[0]?.message?.citations || [];
  return jsonResponse({ text, citations, provider: "venice", model: selectedModel }, 200, origin);
}


// ─── Anthropic Claude ───
async function callAnthropic(env, systemPrompt, userPrompt, maxTokens, useSearch, model, origin) {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) return jsonResponse({ error: "Anthropic API key not configured" }, 500, origin);

  const anthropicBody = {
    model: model || "claude-sonnet-4-20250514",
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
    model: model || "sonar-pro",
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
    model: model || "anthropic/claude-sonnet-4-20250514",
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


// ═══════════════════════════════════════════════════════════════
//  IMAGE GENERATION PROXY — Venice AI
// ═══════════════════════════════════════════════════════════════

async function handleImageProxy(request, env, origin) {
  try {
    const body = await request.json();
    const { prompt, negativePrompt, model, width, height, style } = body;

    if (!prompt) return jsonResponse({ error: "Missing prompt" }, 400, origin);

    const apiKey = env.VENICE_API_KEY;
    if (!apiKey) return jsonResponse({ error: "Venice API key not configured for images" }, 500, origin);

    // Updated default to venice-sd35 (current Venice flagship image model)
    const selectedModel = model || "venice-sd35";

    const imgBody = {
      model: selectedModel,
      prompt,
      negative_prompt: negativePrompt || "blurry, low quality, distorted, deformed",
      width: width || 1024,
      height: height || 1024,
      format: "webp",
      safe_mode: false,
      // Venice image parameters
      hide_watermark: true,
    };

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

    if (!res.ok) return jsonResponse({ error: data.error || data.detail || `Venice image error: ${res.status}` }, res.status, origin);

    const imageBase64 = data.images?.[0] || "";
    if (!imageBase64) return jsonResponse({ error: "Venice returned no image data" }, 502, origin);

    return jsonResponse({ image: imageBase64, provider: "venice", model: selectedModel }, 200, origin);
  } catch (e) {
    return jsonResponse({ error: `Image proxy error: ${e.message}` }, 500, origin);
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
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(data, status = 200, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}
