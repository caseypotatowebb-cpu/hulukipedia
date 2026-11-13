import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { HEAT_RECIPES, HEAT_CONSTRAINT, HEAT_GROUP_LABEL, isHeatRecipe, starlingHeatNote } from "../src/heat-recipes.js";

const SUPPORTED = ["1:1", "3:4", "2:3", "3:2", "4:5", "16:9", "9:16"];
const ORIGINAL_IDS = ["editorial", "turnaround", "motion", "candid", "cinematic", "signature", "activity", "campaign", "duo", "after-dark"];

test("adds 10-15 heat presets with unique ids and full shot lists", () => {
  assert.ok(HEAT_RECIPES.length >= 10 && HEAT_RECIPES.length <= 15, `got ${HEAT_RECIPES.length}`);
  const ids = HEAT_RECIPES.map(r => r.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ORIGINAL_IDS) assert.ok(!ids.includes(id), `${id} collides with an existing preset`);
  for (const r of HEAT_RECIPES) {
    assert.ok(r.label && r.description && r.artDirection, r.id);
    assert.ok(SUPPORTED.includes(r.aspectRatio), `${r.id} uses unsupported ratio ${r.aspectRatio}`);
    assert.equal(r.shots.length, 5, r.id);
    for (const s of r.shots) assert.ok(s.label && s.direction, r.id);
    assert.equal(r.group, HEAT_GROUP_LABEL);
    assert.ok(isHeatRecipe(r));
  }
});

test("heat presets stay suggestive, not explicit", () => {
  const banned = /\b(nude|naked|nudity|topless|explicit sex|sex act|genital|nipple|porn|undress(ed|ing)?)\b/i;
  for (const r of HEAT_RECIPES) {
    const text = [r.label, r.description, r.artDirection, ...r.shots.flatMap(s => [s.label, s.direction])].join(" ");
    assert.doesNotMatch(text, banned, r.id);
  }
  assert.match(HEAT_CONSTRAINT, /adults/);
  assert.match(HEAT_CONSTRAINT, /no nudity/);
  assert.match(HEAT_CONSTRAINT, /no sex acts/);
});

test("starling frames get the staged-editorial note, raven frames do not", () => {
  assert.match(starlingHeatNote("starling"), /staged editorial/);
  assert.equal(starlingHeatNote("raven"), "");
  assert.ok(isHeatRecipe({ id: "after-dark" }));
  assert.ok(!isHeatRecipe({ id: "editorial" }));
});

test("every original preset is kept and heat presets are wired into the studio", () => {
  const src = readFileSync(new URL("../src/Hulukipedia.jsx", import.meta.url), "utf8");
  for (const id of ORIGINAL_IDS) assert.ok(src.includes(`id: "${id}"`), `missing ${id}`);
  assert.ok(src.includes("...HEAT_RECIPES"));
  assert.ok(src.includes("HEAT_CONSTRAINT + starlingHeatNote"));
  assert.ok(src.includes("<optgroup"));
});
