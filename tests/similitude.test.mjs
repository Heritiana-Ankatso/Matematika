// Experiment `similitude` (Malagasy T12 C chapter 7): the complex form against a geometric construction (rotation or
// reflection about the centre, then enlargement), distances multiplied by k, areas by k², orientation kept or reversed,
// the fixed point, the lesson's example z′ = 2z̄ + 3i, compositions, the image handle, the chapter link, strings.
import test from "node:test";
import assert from "node:assert/strict";
import * as S from "../dist/js/lab/models/similitude.js";
import E from "../dist/js/lab/experiments/similitude.js";
import { EXPERIMENTS, resolveRef, groupOf } from "../dist/js/lab/registry.js";
import { GUIDES } from "../dist/js/lab/guides.js";
import { makeFormat } from "../dist/js/lab/format.js";
import { readFileSync } from "node:fs";

const near = (a, b, tol = 1e-9, msg = "") => assert.ok(Math.abs(a - b) <= tol, `${msg} ${a} != ${b}`);
// the similitude built from its definition, with real 2 x 2 rotations and reflections (no complex numbers)
const geometric = ({ kind, k, angle, ox, oy }) => (p) => {
  const t = (angle * Math.PI) / 180; let x = p[0] - ox, y = p[1] - oy;
  if (kind === "indirect") { const c = Math.cos(2 * t), s = Math.sin(2 * t); [x, y] = [c * x + s * y, s * x - c * y]; }
  else { const c = Math.cos(t), s = Math.sin(t); [x, y] = [c * x - s * y, s * x + c * y]; }
  return [ox + k * x, oy + k * y];
};
const rnd = (seed) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const states = [];
{ const r = rnd(7); for (let i = 0; i < 300; i++) states.push({ kind: r() < 0.5 ? "direct" : "indirect", k: 0.25 * (1 + Math.floor(r() * 12)), angle: -180 + 15 * Math.floor(r() * 24), ox: -4 + 0.5 * Math.floor(r() * 16), oy: -3 + 0.5 * Math.floor(r() * 12), mx: 1, my: 2, second: "none", hide: 0 }); }

test("z′ = az + b or a z̄ + b equals the geometric construction, multiplies distances by k and areas by k²", () => {
  const r = rnd(11);
  for (const s of states) {
    const f = S.simOf(s), g = geometric(s);
    const pts = Array.from({ length: 4 }, () => [r() * 10 - 5, r() * 8 - 4]);
    for (const p of pts) { const a = S.apply(f, p), b = g(p); near(a[0], b[0], 1e-9); near(a[1], b[1], 1e-9); }
    const [p, q] = pts, d = Math.hypot(p[0] - q[0], p[1] - q[1]), im = [g(p), g(q)];
    near(Math.hypot(im[0][0] - im[1][0], im[0][1] - im[1][1]), s.k * d, 1e-9, "distance");
    near(S.model(s).areaRatio, s.k * s.k, 1e-9, "area");
    assert.equal(S.model(s).sameOrientation, s.kind === "direct");
  }
});

test("the centre is the only fixed point, and the lesson's formulas give it", () => {
  for (const s of states) {
    const f = S.simOf(s), c = S.fixedPoint(f);
    if (s.k === 1 && (s.kind === "indirect" || S.turn(s.angle) === 0)) { assert.equal(c, null); continue; }
    near(c[0], s.ox, 1e-9); near(c[1], s.oy, 1e-9);
    const img = S.apply(f, c); near(img[0], c[0], 1e-9); near(img[1], c[1], 1e-9);
    // another point is never fixed
    const p = [s.ox + 1, s.oy - 0.5], q = S.apply(f, p); assert.ok(Math.hypot(q[0] - p[0], q[1] - p[1]) > 1e-6);
  }
  // the lesson's example: z′ = 2z̄ + 3i, centre i, axis y = 1
  const book = { ...E.state, ...E.missions.find((m) => m.id === "book").set };
  assert.deepEqual(S.simOf(book), { a: [2, 0], b: [0, 3], conj: true });
  assert.deepEqual(S.fixedPoint(S.simOf(book)), [0, 1]);
  for (const x of [-3, 0, 2.5]) { const im = S.apply(S.simOf(book), [x, 1]); near(im[1], 1, 1e-12, "the axis y = 1 is kept"); }
});

test("composition: ratios multiply, angles add, indirect twice is direct", () => {
  for (const s of states.slice(0, 80)) for (const [name, g] of Object.entries(S.SECONDS)) {
    if (!g) continue;
    const f = S.simOf(s), gf = S.compose(g, f);
    for (const p of [[1, 2], [-3, 0.5]]) { const a = S.apply(gf, p), b = S.apply(g, S.apply(f, p)); near(a[0], b[0], 1e-9, name); near(a[1], b[1], 1e-9, name); }
    near(S.ratio(gf), S.ratio(f) * S.ratio(g), 1e-9);
    assert.equal(gf.conj, f.conj !== g.conj);
  }
  const compose = { ...E.state, ...E.missions.find((m) => m.id === "compose").set, angle: -90 }, m = S.model(compose);
  near(m.gf.a[0], 2, 1e-12); near(m.gf.a[1], 0, 1e-12); assert.deepEqual(m.gfCentre, [5, 0]);
});

test("the image handle M′ sets the ratio and the angle, and round-trips on the lattice", () => {
  const c = E.controls.image;
  for (const s of states.slice(0, 120)) {
    const [x, y] = c.at(s), next = { ...s, ...c.drag(s, x, y) };
    const [x2, y2] = c.at(next); near(x2, x, 1e-9); near(y2, y, 1e-9);
    near(next.k, s.k, 1e-9);
  }
  // M on the centre: the image says nothing about the map
  assert.equal(c.drag({ ...E.state, mx: 0, my: 0 }, 2, 2), null);
  // the hidden centre is neither drawn nor dragged
  assert.equal(E.controls.centre.hidden({ hide: 1 }), true);
  assert.equal(E.controls.centre.drag({ ...E.state, hide: 1 }, 1, 1), null);
});

test("registered, guided, linked from the chapter, and written in both languages without dashes", () => {
  assert.ok(EXPERIMENTS.includes(E)); assert.equal(groupOf(E), "transform");
  for (const m of E.missions) assert.equal(resolveRef(`similitude/${m.id}`).mission.id, m.id);
  assert.ok(GUIDES.similitude && GUIDES.similitude.see.length >= 2);
  const manifest = JSON.parse(readFileSync(new URL("../content/data/manifest.json", import.meta.url)));
  const chapter = manifest.catalog.chapters.find((c) => c.id === "t12c-07");
  assert.ok(chapter.labs.some((r) => r.startsWith("similitude")), "the chapter page shows the laboratory");
  for (const lang of ["fr", "en"]) {
    const fmt = makeFormat(lang), ctx = { fmt, lang, unlocked: () => true };
    for (const m of E.missions) {
      const s = { ...E.state, ...m.set };
      for (const v of [s, ...(m.variants || []).map((x) => ({ ...s, ...x.set })), { ...s, second: "refl" }, { ...s, k: 1, kind: "indirect" }]) {
        const text = JSON.stringify([E.views.formula(v, ctx), E.views.readout(v, ctx), E.views.figure.measure(v, ctx), E.views.figure.scene(v, ctx)]);
        assert.ok(!/NaN|undefined|Infinity|[–—]/.test(text), `${m.id} ${lang}: ${text.slice(0, 120)}`);
      }
    }
  }
  const book = { ...E.state, ...E.missions.find((m) => m.id === "book").set };
  assert.equal(E.views.formula(book, { fmt: makeFormat("fr"), lang: "fr" }), "s : z′ = 2z̄ + 3i");
});
