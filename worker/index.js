/**
 * Hulukipedia — Cloudflare Worker (Multi-Provider)
 * Serves the static frontend and proxies AI API calls.
 * API keys are stored as Worker secrets — never exposed to the browser.
 * 
 * Supported providers:
 *   - anthropic  (Claude — default, reliable text generation)
 *   - venice     (Uncensored text + image generation)
 *   - perplexity (Deep search / RAG with citations)
 *   - openrouter (Model routing — access to 200+ models)
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
          { id: "anthropic", name: "Anthropic Claude", capabilities: ["text"], models: ["claude-sonnet-4-20250514", "claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"] },
          { id: "venice", name: "Venice AI", capabilities: ["text", "image"], models: ["llama-3.3-70b", "deepseek-r1-671b", "qwen-2.5-coder-32b"] },
          { id: "perplexity", name: "Perplexity Sonar", capabilities: ["text", "search"], models: ["sonar-pro", "sonar", "sonar-reasoning-pro", "sonar-reasoning"] },
          { id: "openrouter", name: "OpenRouter", capabilities: ["text"], models: ["anthropic/claude-sonnet-4-20250514", "google/gemini-2.5-flash", "openai/gpt-4o", "meta-llama/llama-3.3-70b-instruct"] },
        ]
      }, 200, url.origin);
    }

    if (url.pathname === "/api/health") {
      return jsonResponse({ status: "ok", timestamp: new Date().toISOString() });
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
      maxTokens = 1000,
      useSearch = false,
      provider = "anthropic",   // default
      model,                     // optional override
    } = body;

    if (!systemPrompt || !userPrompt) {
      return jsonResponse({ error: "Missing systemPrompt or userPrompt" }, 400, origin);
    }

    switch (provider) {
      case "anthropic":
        return await callAnthropic(env, systemPrompt, userPrompt, maxTokens, useSearch, model, origin);
      case "venice":
        return await callVenice(env, systemPrompt, userPrompt, maxTokens, model, origin);
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

  const data = await res.json();
  if (!res.ok) return jsonResponse({ error: data.error?.message || `Anthropic error: ${res.status}` }, res.status, origin);

  const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || "";
  return jsonResponse({ text, provider: "anthropic", model: anthropicBody.model }, 200, origin);
}


// ─── Venice AI (text) ───
async function callVenice(env, systemPrompt, userPrompt, maxTokens, model, origin) {
  const apiKey = env.VENICE_API_KEY;
  if (!apiKey) return jsonResponse({ error: "Venice API key not configured" }, 500, origin);

  const veniceBody = {
    model: model || "llama-3.3-70b",
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
  };

  const res = await fetch("https://api.venice.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(veniceBody),
  });

  const data = await res.json();
  if (!res.ok) return jsonResponse({ error: data.error?.message || data.error || `Venice error: ${res.status}` }, res.status, origin);

  const text = data.choices?.[0]?.message?.content || "";
  return jsonResponse({ text, provider: "venice", model: veniceBody.model }, 200, origin);
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

  const data = await res.json();
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

  const data = await res.json();
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

    const imgBody = {
      model: model || "fluently-xl",
      prompt,
      negative_prompt: negativePrompt || "",
      width: width || 1024,
      height: height || 1024,
      format: "webp",
      safe_mode: false,
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

    const data = await res.json();
    if (!res.ok) return jsonResponse({ error: data.error || `Venice image error: ${res.status}` }, res.status, origin);

    const imageBase64 = data.images?.[0] || "";
    return jsonResponse({ image: imageBase64, provider: "venice", model: imgBody.model }, 200, origin);
  } catch (e) {
    return jsonResponse({ error: `Image proxy error: ${e.message}` }, 500, origin);
  }
}


// ═══════════════════════════════════════════════════════════════
//  DEEP SEARCH PROXY — Perplexity
// ═══════════════════════════════════════════════════════════════

async function handleSearchProxy(request, env, origin) {
  try {
    const body = await request.json();
    const { query, systemPrompt, model } = body;

    if (!query) return jsonResponse({ error: "Missing query" }, 400, origin);

    const apiKey = env.PERPLEXITY_API_KEY;
    if (!apiKey) return jsonResponse({ error: "Perplexity API key not configured" }, 500, origin);

    const searchBody = {
      model: model || "sonar-pro",
      messages: [
        { role: "system", content: systemPrompt || "You are a thorough research assistant. Provide detailed, well-cited answers." },
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

    const data = await res.json();
    if (!res.ok) return jsonResponse({ error: data.error?.message || `Perplexity search error: ${res.status}` }, res.status, origin);

    const text = data.choices?.[0]?.message?.content || "";
    const citations = data.citations || [];
    return jsonResponse({ text, citations, provider: "perplexity", model: searchBody.model }, 200, origin);
  } catch (e) {
    return jsonResponse({ error: `Search proxy error: ${e.message}` }, 500, origin);
  }
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
