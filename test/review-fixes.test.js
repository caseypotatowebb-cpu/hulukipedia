import assert from "node:assert/strict";
import { afterEach, before, describe, test } from "node:test";
import worker from "../worker/index.js";
import { callAIWithSearch, callDeepSearch, investigate } from "../src/api.js";

const originalFetch = globalThis.fetch;

before(() => {
  globalThis.window = { location: { origin: "https://hulukipedia.test" } };
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function captureFetch(handler) {
  const seen = [];
  globalThis.fetch = async (url, init) => {
    const entry = {
      url: String(url),
      body: init?.body ? JSON.parse(init.body) : null,
    };
    seen.push(entry);
    return handler(entry);
  };
  return seen;
}

describe("investigative client", { concurrency: false }, () => {
  test("deep search sends the chosen model only when one is provided", async () => {
    const seen = captureFetch(() => jsonResponse({ text: "dossier", citations: ["https://example.com/d"] }));
    await callDeepSearch("who is this", "Be thorough");
    assert.equal(seen[0].url, "https://hulukipedia.test/api/search");
    assert.equal(Object.hasOwn(seen[0].body, "model"), false);

    await callDeepSearch("who is this", "Be thorough", "sonar");
    assert.equal(seen[1].body.model, "sonar");
    assert.equal(seen[1].body.query, "who is this");
  });

  test("search citations stay on the console path and other callers still get text", async () => {
    captureFetch(() => jsonResponse({
      text: "grounded note",
      citations: ["https://example.com/source"],
    }));

    const plain = await callAIWithSearch("system", "user", "venice", "zai-org-glm-5-2");
    assert.equal(plain, "grounded note");

    const withCitations = await callAIWithSearch("system", "user", "xai", "grok-4.3", true);
    assert.deepEqual(withCitations, {
      text: "grounded note",
      citations: ["https://example.com/source"],
    });
  });

  test("console perplexity search uses investigatorModel instead of the worker default", async () => {
    const seen = captureFetch(() => jsonResponse({ text: "found", citations: ["https://example.com/p"] }));
    const result = await investigate({
      question: "Where was the interview?",
      systemPrompt: "Answer briefly",
      userPrompt: "Investigative question:\nWhere was the interview?",
      web: true,
      provider: "perplexity",
      model: "sonar",
    });

    assert.equal(seen[0].url, "https://hulukipedia.test/api/search");
    assert.equal(seen[0].body.model, "sonar");
    assert.equal(seen[0].body.query, "Where was the interview?");
    assert.deepEqual(result, {
      text: "found",
      citations: ["https://example.com/p"],
      provider: "perplexity",
      model: "sonar",
      web: true,
    });
  });

  test("console venice and xai search keep returned citations", async () => {
    const seen = captureFetch(() => jsonResponse({
      text: "from the web",
      citations: [{ url: "https://example.com/x", title: "Clip" }],
    }));

    const venice = await investigate({
      question: "q",
      systemPrompt: "s",
      userPrompt: "Investigative question:\nq",
      web: true,
      provider: "venice",
      model: "zai-org-glm-5-2",
    });
    assert.equal(seen[0].body.useSearch, true);
    assert.equal(seen[0].body.model, "zai-org-glm-5-2");
    assert.equal(seen[0].body.provider, "venice");
    assert.deepEqual(venice.citations, [{ url: "https://example.com/x", title: "Clip" }]);
    assert.equal(venice.web, true);

    const xai = await investigate({
      question: "q",
      systemPrompt: "s",
      userPrompt: "Investigative question:\nq",
      web: true,
      provider: "xai",
      model: "grok-4.3",
    });
    assert.equal(seen[1].body.provider, "xai");
    assert.equal(seen[1].body.model, "grok-4.3");
    assert.equal(xai.citations.length, 1);
  });

  test("console perplexity with web off stays on the plain AI route", async () => {
    const seen = captureFetch(() => jsonResponse({ text: "offline", citations: ["https://example.com/nope"] }));
    const result = await investigate({
      question: "q",
      systemPrompt: "s",
      userPrompt: "Investigative question:\nq",
      web: false,
      provider: "perplexity",
      model: "sonar-reasoning-pro",
    });
    assert.equal(seen[0].url, "https://hulukipedia.test/api/ai");
    assert.equal(seen[0].body.useSearch, false);
    assert.equal(seen[0].body.model, "sonar-reasoning-pro");
    assert.equal(seen[0].body.maxTokens, 2500);
    assert.deepEqual(result.citations, []);
    assert.equal(result.web, false);
    assert.equal(result.text, "offline");
  });

  test("console without a search-capable web route still returns no citations", async () => {
    const seen = captureFetch(() => jsonResponse({ text: "analysis", citations: ["https://example.com/ignored"] }));
    const result = await investigate({
      question: "q",
      systemPrompt: "s",
      userPrompt: "Investigative question:\nq",
      web: true,
      provider: "openai",
      model: "gpt-4o",
    });
    assert.equal(seen[0].url, "https://hulukipedia.test/api/ai");
    assert.equal(seen[0].body.useSearch, false);
    assert.equal(seen[0].body.maxTokens, 2500);
    assert.deepEqual(result.citations, []);
    assert.equal(result.text, "analysis");
    assert.equal(result.web, false);
  });
});

function workerRequest(pathname, body, { origin = "https://hulukipedia.test", token } = {}) {
  const headers = { "Content-Type": "application/json", Origin: origin };
  if (token) headers["x-app-token"] = token;
  return new Request(`https://hulukipedia.test${pathname}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("worker upstream errors", { concurrency: false }, () => {
  const cases = [
    {
      name: "venice text",
      path: "/api/ai",
      body: { systemPrompt: "s", userPrompt: "u", provider: "venice" },
      env: { VENICE_API_KEY: "test-venice-key" },
      upstream: "https://api.venice.ai/api/v1/chat/completions",
    },
    {
      name: "venice image",
      path: "/api/image",
      body: { prompt: "a portrait" },
      env: { VENICE_API_KEY: "test-venice-key" },
      upstream: "https://api.venice.ai/api/v1/image/generate",
    },
    {
      name: "venice vision",
      path: "/api/scene-check",
      body: { image: "data:image/png;base64,aaaa", contract: { cast: "two people" } },
      env: { VENICE_API_KEY: "test-venice-key" },
      upstream: "https://api.venice.ai/api/v1/chat/completions",
    },
    {
      name: "venice search",
      path: "/api/search",
      body: { query: "background", provider: "venice" },
      env: { VENICE_API_KEY: "test-venice-key" },
      upstream: "https://api.venice.ai/api/v1/chat/completions",
    },
  ];

  for (const item of cases) {
    test(`${item.name} stringifies an object error and maps 401/403 to 502`, async () => {
      const status = item.name.endsWith("image") || item.name.endsWith("search") ? 403 : 401;
      const seen = captureFetch((entry) => {
        assert.equal(entry.url, item.upstream);
        return jsonResponse({ error: { code: "bad_server_key", detail: { reason: "rejected" } } }, status);
      });

      const res = await worker.fetch(workerRequest(item.path, item.body), item.env);
      assert.equal(seen.length, 1);
      assert.equal(res.status, 502);
      const payload = await res.json();
      assert.equal(typeof payload.error, "string");
      assert.equal(payload.error.includes("[object Object]"), false);
      assert.match(payload.error, /bad_server_key/);
      assert.equal(payload.error.includes("test-venice-key"), false);
    });
  }

  test("a non-auth upstream status is preserved and a string error stays a string", async () => {
    captureFetch(() => jsonResponse({ error: "rate limited" }, 429));
    const res = await worker.fetch(
      workerRequest("/api/ai", { systemPrompt: "s", userPrompt: "u", provider: "venice" }),
      { VENICE_API_KEY: "test-venice-key" },
    );
    assert.equal(res.status, 429);
    const payload = await res.json();
    assert.equal(payload.error, "rate limited");
  });

  test("an object error message is stringified when it is the selected field", async () => {
    captureFetch(() => jsonResponse({ error: { message: { code: "nested" } } }, 500));
    const res = await worker.fetch(
      workerRequest("/api/ai", { systemPrompt: "s", userPrompt: "u", provider: "venice" }),
      { VENICE_API_KEY: "test-venice-key" },
    );
    assert.equal(res.status, 500);
    const payload = await res.json();
    assert.equal(payload.error, "{\"code\":\"nested\"}");
  });

  test("search proxy forwards the requested model and still defaults to sonar-pro", async () => {
    const seen = captureFetch(() => jsonResponse({
      choices: [{ message: { content: "answer" } }],
      citations: ["https://example.com/c"],
    }));

    const chosen = await worker.fetch(
      workerRequest("/api/search", { query: "q", systemPrompt: "s", model: "sonar" }),
      { PERPLEXITY_API_KEY: "test-perplexity-key" },
    );
    assert.equal(seen[0].url, "https://api.perplexity.ai/chat/completions");
    assert.equal(seen[0].body.model, "sonar");
    assert.equal(chosen.status, 200);
    assert.equal((await chosen.json()).model, "sonar");

    await worker.fetch(
      workerRequest("/api/search", { query: "q", systemPrompt: "s" }),
      { PERPLEXITY_API_KEY: "test-perplexity-key" },
    );
    assert.equal(seen[1].body.model, "sonar-pro");
  });

  test("the app token gate still returns 401 and is not remapped to 502", async () => {
    let called = false;
    globalThis.fetch = async () => {
      called = true;
      return jsonResponse({ ok: true });
    };
    const res = await worker.fetch(
      workerRequest("/api/ai", { systemPrompt: "s", userPrompt: "u" }, { origin: "https://someone-else.test" }),
      { APP_TOKEN: "test-app-token", VENICE_API_KEY: "test-venice-key" },
    );
    assert.equal(called, false);
    assert.equal(res.status, 401);
    const payload = await res.json();
    assert.equal(payload.error, "Access required.");
  });
});
