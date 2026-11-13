import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import worker from "../worker/index.js";

const jsx = readFileSync(new URL("../src/Hulukipedia.jsx", import.meta.url), "utf8");

describe("model lists", () => {
  async function providers() {
    const res = await worker.fetch(new Request("https://hulukipedia.test/api/providers"), {});
    const body = await res.json();
    return Object.fromEntries(body.providers.map((p) => [p.id, p.models]));
  }
  test("Grok 4.20 is offered both directly (xAI) and via Venice", async () => {
    const p = await providers();
    assert.ok(p.xai.includes("grok-4.20-0309-reasoning"));
    assert.ok(p.venice.includes("grok-4-20"));
    assert.ok(p.venice.includes("grok-4-20-multi-agent"));
    assert.match(jsx, /id: "grok-4-20", name: "Grok 4\.20 \(via Venice\)/);
  });
  test("Kimi K2.5 (Venice + OpenRouter) and Kimi K2 (OpenRouter) are offered", async () => {
    const p = await providers();
    assert.ok(p.venice.includes("kimi-k2-5"));
    assert.ok(p.openrouter.includes("moonshotai/kimi-k2.5"));
    assert.ok(p.openrouter.includes("moonshotai/kimi-k2"));
  });
  test("ids missing from the provider model lists are hidden, not offered", async () => {
    const p = await providers();
    assert.ok(!p.xai.includes("grok-4.6") && !p.xai.includes("grok-4.5"));
    assert.ok(!p.venice.includes("mistral-small-2603"));
    assert.ok(p.mistral.includes("mistral-small-2603"), "Mistral direct keeps Mistral Small 4");
    assert.match(jsx, /\/\/ \{ id: "grok-4\.6", name: "Grok 4\.6" \}/);
  });
});
