import test from "node:test";
import assert from "node:assert/strict";
import { courtState, demoRemaining, matches, makeComments, teams, WINDOW } from "../src/data.js";
test("demo courts stay available while fixed closed samples stay closed", () => {
  for (const match of matches.filter(m => m.state === "finished")) {
    assert.equal(courtState(match, Date.now() + 100 * WINDOW), match.demoStatus);
  }
  assert.equal(courtState({ state: "live" }), "live");
  assert.equal(courtState({ state: "scheduled" }), "scheduled");
});
test("demo countdown starts fresh for a new visit and loops at its boundary", () => {
  assert.equal(demoRemaining(1000, 1000), WINDOW);
  assert.equal(demoRemaining(1000, 4000), WINDOW - 3000);
  assert.equal(demoRemaining(4000, 4000), WINDOW);
  assert.equal(demoRemaining(1000, 1000 + WINDOW), WINDOW);
  assert.equal(demoRemaining(1000, 1000 + WINDOW + 3000), WINDOW - 3000);
});
test("non-demo fixtures retain a real 12-hour expiry", () => {
  const match = { state: "finished", endedAt: 1000 };
  assert.equal(courtState(match, 1000 + WINDOW - 1), "open");
  assert.equal(courtState(match, 1000 + WINDOW), "closed");
});
test("each league has usable examples with valid teams and separate discussions", () => {
  for (const league of ["欧冠", "英超", "西甲", "德甲", "意甲", "法甲"]) {
    assert.ok(matches.some(m => m.league === league && courtState(m) === "open"));
    assert.ok(matches.some(m => m.league === league && ["scheduled", "live"].includes(m.state)));
  }
  const ids = new Set();
  for (const match of matches) {
    assert.ok(teams[match.home] && teams[match.away]);
    for (const comment of makeComments(match)) { assert.ok(!ids.has(comment.id)); ids.add(comment.id); }
  }
});
