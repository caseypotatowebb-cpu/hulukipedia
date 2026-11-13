import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { menuPosition } from "../src/menu-position.js";

const viewport = { width: 1280, height: 800 };
const jsx = readFileSync(new URL("../src/Hulukipedia.jsx", import.meta.url), "utf8");

describe("provider menu position", () => {
  test("opens below the button with fixed coordinates when there is room", () => {
    const pos = menuPosition({ left: 600, top: 200, bottom: 230, width: 120 }, viewport, false);
    assert.equal(pos.top, 234);
    assert.equal(pos.bottom, undefined);
    assert.equal(pos.left, 600);
    assert.ok(pos.minWidth >= 240);
  });

  test("flips upward near the bottom of the screen and for menuDirection=up", () => {
    const low = menuPosition({ left: 100, top: 740, bottom: 770, width: 120 }, viewport, false);
    assert.equal(low.top, undefined);
    assert.equal(low.bottom, viewport.height - 740 + 4);
    const up = menuPosition({ left: 100, top: 500, bottom: 530, width: 120 }, viewport, true);
    assert.equal(up.bottom, viewport.height - 500 + 4);
  });

  test("never runs off the right edge", () => {
    const pos = menuPosition({ left: 1200, top: 100, bottom: 130, width: 80 }, viewport, false);
    assert.ok(pos.left + pos.minWidth <= viewport.width - 8);
  });
});

describe("provider menu behaviour (source checks)", () => {
  const selector = jsx.slice(jsx.indexOf("function ProviderSelector("), jsx.indexOf("// ─── EDITABLE DIV ───"));
  test("switching provider group does not close the menu", () => {
    const groupClick = selector.slice(selector.indexOf("onProviderChange(pid);"), selector.indexOf("<span>{pdef.icon}</span>"));
    assert.ok(!groupClick.includes("setOpen(false)"), "provider-group click must keep the menu open");
  });
  test("menu is portalled to document.body with fixed positioning above the cards", () => {
    assert.match(selector, /createPortal\(menu, document\.body\)/);
    assert.match(selector, /position: "fixed", zIndex: 2000/);
  });
});

