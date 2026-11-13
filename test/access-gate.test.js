import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";
import worker from "../worker/index.js";
import {
  COOKIE_NAME,
  accessIsConfigured,
  createAccessSession,
  isProtectedPost,
  requestIsAuthorized,
  sessionSecretFromAppToken,
  verifyAccessPassword,
  verifyAccessSession,
} from "../worker/access.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function post(pathname, body, { origin = "https://hulukipedia.test", token, cookie } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (origin) headers.Origin = origin;
  if (token) headers["x-app-token"] = token;
  if (cookie) headers.Cookie = cookie;
  return new Request(`https://hulukipedia.test${pathname}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

const paidBody = { systemPrompt: "s", userPrompt: "u", provider: "venice" };
const lockedEnv = { APP_TOKEN: "correct-horse-token", VENICE_API_KEY: "test-venice-key" };
const paidPaths = ["/api/ai", "/api/image", "/api/search", "/api/scene-check"];

describe("access helpers", () => {
  test("APP_TOKEN must be a non-empty string to turn the gate on", () => {
    assert.equal(accessIsConfigured(undefined), false);
    assert.equal(accessIsConfigured(""), false);
    assert.equal(accessIsConfigured("   "), false);
    assert.equal(accessIsConfigured("secret"), true);
    assert.equal(isProtectedPost("POST", "/api/ai"), true);
    assert.equal(isProtectedPost("GET", "/api/ai"), false);
    assert.equal(isProtectedPost("POST", "/api/health"), false);
  });

  test("password checks are exact and reject empty values", async () => {
    assert.equal(await verifyAccessPassword("secret", "secret"), true);
    assert.equal(await verifyAccessPassword("secret", "Secret"), false);
    assert.equal(await verifyAccessPassword("", "secret"), false);
    assert.equal(await verifyAccessPassword("secret", ""), false);
  });

  test("sessions expire and reject a tampered signature", async () => {
    const secret = await sessionSecretFromAppToken("secret");
    const now = 1_700_000_000;
    const token = await createAccessSession(secret, now);
    assert.equal(await verifyAccessSession(token, secret, now + 10), true);
    assert.equal(await verifyAccessSession(token, secret, now + 60 * 60 * 24 * 31), false);
    const parts = token.split(".");
    parts[2] = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    assert.equal(await verifyAccessSession(parts.join("."), secret, now + 10), false);
  });

  test("authorization accepts a matching header or a valid cookie, not same-origin alone", async () => {
    assert.equal(await requestIsAuthorized({ appToken: "" }), true);
    assert.equal(await requestIsAuthorized({
      appToken: "secret",
      appTokenHeader: "secret",
    }), true);
    assert.equal(await requestIsAuthorized({
      appToken: "secret",
      appTokenHeader: "wrong",
    }), false);

    const sessionSecret = await sessionSecretFromAppToken("secret");
    const token = await createAccessSession(sessionSecret);
    assert.equal(await requestIsAuthorized({
      appToken: "secret",
      cookieHeader: `${COOKIE_NAME}=${token}`,
    }), true);
    assert.equal(await requestIsAuthorized({
      appToken: "secret",
      cookieHeader: `${COOKIE_NAME}=nope`,
    }), false);
  });
});

describe("worker access gate", { concurrency: false }, () => {
  test("paid endpoints stay open when APP_TOKEN is unset, even without an Origin", async () => {
    globalThis.fetch = async () => jsonResponse({
      choices: [{ message: { content: "ok" } }],
    });
    const res = await worker.fetch(
      post("/api/ai", paidBody, { origin: undefined }),
      { VENICE_API_KEY: "test-venice-key" },
    );
    assert.equal(res.status, 200);
  });

  for (const path of paidPaths) {
    test(`${path} is refused without a cookie or token, including same-origin`, async () => {
      let called = false;
      globalThis.fetch = async () => {
        called = true;
        return jsonResponse({ ok: true });
      };
      const body = path === "/api/image"
        ? { prompt: "a portrait" }
        : path === "/api/search"
          ? { query: "q" }
          : path === "/api/scene-check"
            ? { image: "data:image/png;base64,aaaa", contract: { cast: "two" } }
            : paidBody;
      const res = await worker.fetch(post(path, body), lockedEnv);
      assert.equal(called, false);
      assert.equal(res.status, 401);
      assert.equal((await res.json()).error, "Access required.");
    });
  }

  test("a matching x-app-token is accepted", async () => {
    globalThis.fetch = async () => jsonResponse({
      choices: [{ message: { content: "ready" } }],
    });
    const res = await worker.fetch(
      post("/api/ai", paidBody, { token: "correct-horse-token" }),
      lockedEnv,
    );
    assert.equal(res.status, 200);
    assert.equal((await res.json()).text, "ready");
  });

  test("a wrong x-app-token is refused", async () => {
    let called = false;
    globalThis.fetch = async () => {
      called = true;
      return jsonResponse({ ok: true });
    };
    const res = await worker.fetch(
      post("/api/ai", paidBody, { token: "wrong" }),
      lockedEnv,
    );
    assert.equal(called, false);
    assert.equal(res.status, 401);
  });

  test("the site, health, and auth endpoints stay reachable without a password", async () => {
    const health = await worker.fetch(new Request("https://hulukipedia.test/api/health"), lockedEnv);
    assert.equal(health.status, 200);
    assert.equal((await health.json()).status, "ok");

    const auth = await worker.fetch(new Request("https://hulukipedia.test/api/auth"), lockedEnv);
    assert.equal(auth.status, 200);
    assert.deepEqual(await auth.json(), { configured: true, granted: false });

    const page = await worker.fetch(new Request("https://hulukipedia.test/"), lockedEnv);
    assert.equal(page.status, 404);
  });

  test("login sets a cookie that unlocks paid endpoints, and logout clears it", async () => {
    const denied = await worker.fetch(
      post("/api/login", { password: "nope" }),
      lockedEnv,
    );
    assert.equal(denied.status, 401);
    assert.equal((await denied.json()).error, "Incorrect password");

    const accepted = await worker.fetch(
      post("/api/login", { password: "correct-horse-token" }),
      lockedEnv,
    );
    assert.equal(accepted.status, 200);
    const setCookie = accepted.headers.get("Set-Cookie");
    assert.match(setCookie, new RegExp(`^${COOKIE_NAME}=`));
    assert.match(setCookie, /HttpOnly/i);
    assert.match(setCookie, /SameSite=Lax/i);
    const cookieValue = setCookie.split(";", 1)[0];

    const status = await worker.fetch(new Request("https://hulukipedia.test/api/auth", {
      headers: { Cookie: cookieValue },
    }), lockedEnv);
    assert.deepEqual(await status.json(), { configured: true, granted: true });

    globalThis.fetch = async () => jsonResponse({
      choices: [{ message: { content: "after-login" } }],
    });
    const paid = await worker.fetch(post("/api/ai", paidBody, { cookie: cookieValue }), lockedEnv);
    assert.equal(paid.status, 200);
    assert.equal((await paid.json()).text, "after-login");

    const locked = await worker.fetch(post("/api/logout", {}), lockedEnv);
    assert.equal(locked.status, 200);
    assert.match(locked.headers.get("Set-Cookie"), /Max-Age=0/);
  });
});
