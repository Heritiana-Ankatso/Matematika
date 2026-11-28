// The group laboratories (shuffles, polygon, Rubik's cube): the model checked against facts computed independently here
// (brute force on permutations, the dihedral relations, known orders of cube sequences), and every mission's answer.
import test from "node:test";
import assert from "node:assert/strict";
import * as G from "../site/js/lab/models/groups.js";
import { shuffles, polygon, rubik } from "../site/js/lab/experiments/groups.js";
import { resolveRef } from "../site/js/lab/registry.js";

// order by brute force: apply p until the identity comes back
const bruteOrder = (p) => { let q = p.slice(), k = 1; while (!q.every((y, i) => y === i)) { q = q.map((x) => p[x]); k++; } return k; };

test("permutations: order = lcm of cycles, by brute force on every permutation of 6", () => {
  const perms = (a) => (a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((r) => [x, ...r])));
  for (const p of perms([0, 1, 2, 3, 4, 5])) {
    assert.equal(G.order(p), bruteOrder(p));
    assert.ok(G.isIdentity(G.compose(p, G.inverse(p))));
    // sign is multiplicative
    const q = [1, 0, 2, 3, 4, 5];
    assert.equal(G.sign(G.compose(p, q)), -G.sign(p));
  }
  assert.equal(G.cycleText(G.fromCycles("(1 2 3)(4 5)", 5)), "(1 2 3)(4 5)");
});

test("the perfect shuffle of 8 cards is the out-shuffle and has order 3", () => {
  const out = Array.from({ length: 8 }, (_, i) => (i < 4 ? 2 * i : 2 * (i - 4) + 1));
  assert.deepEqual(G.fromCycles("(2 3 5)(4 7 6)", 8), out);
  assert.equal(G.order(out), 3);
});

test("dihedral group: 2n elements, τ r τ = r⁻¹, rotations of order n / gcd", () => {
  for (const n of [3, 4, 5, 6, 8]) {
    const seen = new Set();
    for (let k = 0; k < n; k++) for (let s = 0; s < 2; s++) seen.add(G.dPerm(n, { k, s }).join());
    assert.equal(seen.size, 2 * n);
    const trt = G.dWord(n, "trt");
    assert.deepEqual(trt, { k: n - 1, s: 0 });
    // the product agrees with composing the vertex permutations
    for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) for (const [s1, s2] of [[0, 0], [0, 1], [1, 0], [1, 1]]) {
      const x = { k: a, s: s1 }, y = { k: b, s: s2 };
      assert.deepEqual(G.dPerm(n, G.dMul(n, x, y)), G.compose(G.dPerm(n, x), G.dPerm(n, y)));
    }
  }
  assert.equal(G.dOrder(6, { k: 2, s: 0 }), 3);
});

test("Rubik's cube: known orders and a solved cube after the order", () => {
  const order = (q) => G.sequenceOrder(G.parseMoves(q));
  assert.equal(order("R"), 4);
  assert.equal(order("RU"), 105);
  assert.equal(order("RUR'U'"), 6);
  assert.equal(order("R2U2"), 6);
  assert.equal(order("RUF"), 80);
  for (const q of ["RU", "RUR'U'", "R2U2"]) {
    const moves = G.parseMoves(q), k = order(q);
    assert.ok(G.isSolved(G.applyMoves(G.solvedStickers(), Array(k).fill(moves).flat())));
    assert.ok(!G.isSolved(G.applyMoves(G.solvedStickers(), Array(k - 1).fill(moves).flat())));
  }
  // a move followed by its inverse does nothing; R sends the front right column up
  assert.ok(G.isSolved(G.applyMoves(G.solvedStickers(), G.parseMoves("RUFF'U'R'"))));
  const r = G.applyMove(G.solvedStickers(), "R");
  assert.deepEqual(r.filter((x) => x.n[1] === 1 && x.p[0] === 1).map((x) => x.face), ["F", "F", "F"]);
  assert.equal(G.movedCubies(G.applyMoves(G.solvedStickers(), G.parseMoves("RUR'U'"))), 7);
});

test("missions: answers and goals agree with the model", () => {
  const m = shuffles.missions.find((x) => x.id === "swaps");
  assert.equal(shuffles.model.model({ ...shuffles.state, ...m.set }).swaps, m.answer);
  const perfect = shuffles.missions.find((x) => x.id === "perfect");
  let s = { ...shuffles.state, ...perfect.set };
  for (let i = 0; i < 3; i++) s = { ...s, ...shuffles.controls.apply.act(s, "s") };
  assert.ok(perfect.goal(s, shuffles.model.model(s)));
  const hex = polygon.missions.find((x) => x.id === "hexagon");
  assert.equal(polygon.model.model({ ...polygon.state, ...hex.set }).order, hex.answer);
  const half = rubik.missions.find((x) => x.id === "half");
  assert.equal(rubik.model.model({ ...rubik.state, ...half.set }).order, half.answer);
  let c = { ...rubik.state, ...rubik.missions.find((x) => x.id === "back").set };
  c = { ...c, ...rubik.controls.play.act(c, "all") };
  assert.equal(c.reps, 105);
  assert.ok(rubik.model.model(c).solved);
  for (const e of [shuffles, polygon, rubik]) for (const mi of e.missions) assert.ok(resolveRef(`${e.id}/${mi.id}`));
});
