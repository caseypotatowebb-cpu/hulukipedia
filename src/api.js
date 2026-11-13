// Browser calls into the Worker proxy. Keys stay on the Worker.

function apiBase() {
  return window.location.origin;
}

export async function checkedFetch(url, init) {
  const res = await fetch(url, { credentials: "same-origin", ...init });
  if (res.status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("hulukipedia:access-required"));
  }
  return res;
}

async function readError(res) {
  const err = await res.json().catch(() => ({ error: res.statusText }));
  return err.error || `HTTP ${res.status}`;
}

export async function getAuthStatus() {
  const res = await checkedFetch(`${apiBase()}/api/auth`);
  if (!res.ok) return { configured: false, granted: true };
  return res.json();
}

export async function login(password) {
  const res = await checkedFetch(`${apiBase()}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Incorrect password");
  return data;
}

export async function logout() {
  await checkedFetch(`${apiBase()}/api/logout`, { method: "POST" });
}

export async function callAI(systemPrompt, userPrompt, provider = "perplexity", model = null, maxTokens = 2000) {
  try {
    const res = await checkedFetch(`${apiBase()}/api/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt, userPrompt, maxTokens, useSearch: false, provider, model }),
    });
    if (!res.ok) {
      throw new Error(await readError(res));
    }
    const data = await res.json();
    return data.text || "";
  } catch (e) {
    throw new Error(`AI generation failed: ${e.message}`);
  }
}

// includeCitations is only for the Investigative Console. Other callers still receive a string.
export async function callAIWithSearch(systemPrompt, userPrompt, provider = "venice", model = null, includeCitations = false) {
  try {
    const res = await checkedFetch(`${apiBase()}/api/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt, userPrompt, maxTokens: 2000, useSearch: true, provider, model }),
    });
    if (!res.ok) {
      throw new Error(await readError(res));
    }
    const data = await res.json();
    if (includeCitations) return { text: data.text || "", citations: data.citations || [] };
    return data.text || "";
  } catch (e) {
    throw new Error(`Search-enhanced generation failed: ${e.message}`);
  }
}

export async function callDeepSearch(query, systemPrompt = null, model = null) {
  try {
    const payload = { query, systemPrompt };
    if (model) payload.model = model;
    const res = await checkedFetch(`${apiBase()}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(await readError(res));
    }
    const data = await res.json();
    return { text: data.text || "", citations: data.citations || [] };
  } catch (e) {
    throw new Error(`Deep search failed: ${e.message}`);
  }
}

const SEARCH_CAPABLE = ["anthropic", "venice", "xai"];

// Investigative Console routing. Dossier deep search does not use this.
export async function investigate({ question, systemPrompt, userPrompt, web, provider, model }) {
  if (web && provider === "perplexity") {
    const result = await callDeepSearch(question, systemPrompt, model);
    return { text: result.text, citations: result.citations || [], provider, model, web: true };
  }

  if (web && SEARCH_CAPABLE.includes(provider)) {
    const result = await callAIWithSearch(systemPrompt, userPrompt, provider, model, true);
    return { text: result.text, citations: result.citations || [], provider, model, web: true };
  }

  const text = await callAI(systemPrompt, userPrompt, provider, model, 2500);
  return { text, citations: [], provider, model, web: false };
}
